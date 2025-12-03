import * as THREE from 'three/webgpu'
import { Game } from '../Game.js'
import { billboarding, cameraPosition, color, Fn, instanceIndex, log, min, mix, modelViewMatrix, mul, normalWorld, positionGeometry, positionViewDirection, positionWorld, smoothstep, storage, texture, time, uv, vec2, vec3, vec4 } from 'three/tsl'
import { hash } from 'three/tsl'
import gsap from 'gsap'
import { Bubble } from './Bubble.js'
import emojiRegex from 'emoji-regex'
import { InputFlag } from '../InputFlag.js'

export class Whispers
{
    constructor()
    {
        this.game = Game.getInstance()

        this.count = parseInt(import.meta.env.VITE_WHISPERS_COUNT)

        this.setSounds()
        this.setFlames()
        this.setData()
        this.setBubble()
        this.setMenu()
        this.setInputs()

        this.game.ticker.events.on('tick', () =>
        {
            this.update()
        }, 10)
    }

    setSounds()
    {
        this.sounds = {}
        
        this.sounds.ignite = this.game.audio.register({
            path: 'sounds/fire/ignite-1.mp3',
            autoplay: false,
            loop: false,
            volume: 0.4,
            antiSpam: 0.1
        })
        
        this.sounds.flicker = this.game.audio.register({
            path: 'sounds/fire/Cloth_Movement_Hung_Clothes_Blowing_in_Wind_ODY-1520-031.mp3',
            autoplay: true,
            loop: true,
            volume: 0.5,
            positions: new THREE.Vector3(),
            distanceFade: 10
        })
    }

    setFlames()
    {
        // Reveal buffer
        this.revealArray = new Float32Array(this.count)
        this.revealBuffer = new THREE.StorageInstancedBufferAttribute(this.revealArray, 1)
        this.revealBufferNeedsUpdate = true
        
        const revealAttribute = storage(this.revealBuffer, 'float', this.count).toAttribute()

        // Geometry
        const beamGeometry = new THREE.PlaneGeometry(1.5, 1.5 * 2, 1, 16)
        beamGeometry.rotateY(Math.PI * 0.25)
        
        // Material
        const beamMaterial = new THREE.MeshBasicNodeMaterial({ transparent: true, wireframe: false, depthWrite: false })
        beamMaterial.positionNode = Fn(() =>
        {
            const newPosition = positionGeometry.toVar()

            const random = hash(instanceIndex)
            const noiseStrength = uv().y.remapClamp(0.25, 1, 0, 1).mul(0.6)
            const noiseUv = vec2(random, uv().y.mul(0.5).sub(this.game.ticker.elapsedScaledUniform.mul(0.1)))
            const noise = texture(this.game.noises.perlin, noiseUv).r.sub(0.5).mul(noiseStrength)
            newPosition.x.addAssign(noise)

            return newPosition
        })()

        beamMaterial.outputNode = Fn(() =>
        {
            const baseUv = vec2(uv().x, uv().y.oneMinus())
            const mask = texture(this.game.resources.whisperFlameTexture,baseUv).r.sub(revealAttribute.oneMinus())
            const color = texture(this.game.materials.gradientTexture, vec2(0, mask))
            const alpha = smoothstep(0.05, 0.3, mask)

            return vec4(vec3(color.mul(2)), alpha.mul(revealAttribute))
        })()

        // Instanced mesh
        this.flames = new THREE.InstancedMesh(beamGeometry, beamMaterial, this.count)
        this.flames.renderOrder = 3
        this.flames.frustumCulled = false
        this.flames.visible = true
        this.flames.position.y = 0.25
        this.game.scene.add(this.flames)
    }

    setData()
    {
        this.data = {}
        this.data.needsUpdate = false
        this.data.items = []

        for(let i = 0; i < this.count; i++)
        {
            this.data.items.push({
                index: i,
                matrix: new THREE.Matrix4(),
                available: true,
                needsUpdate: false
            })
        }

        this.data.findById = (id) =>
        {
            return this.data.items.find(_item => _item.id === id)
        }

        this.data.findAvailable = () =>
        {
            const item = this.data.items.find(_item => _item.available)

            if(item)
            {
                item.available = false
                return item
            }
            else
            {
                console.warn('can\'t find available item')
            }
        }

        this.data.upsert = (input) =>
        {
            let item = this.data.findById(input.id)

            // Update
            if(item)
            {
                const dummy = { value: 1 }
                gsap.to(
                    dummy,
                    {
                        value: 0,
                        onUpdate: () =>
                        {
                            this.revealArray[item.index] = dummy.value
                            this.revealBufferNeedsUpdate = true
                        },
                        onComplete: () =>
                        {
                            item.message = input.message
                            item.countryCode = input.countrycode
                            item.position.set(input.x, input.y, input.z)
                            item.matrix.setPosition(item.position)
                            item.needsUpdate = true

                            // If is closest => Reset closest (to have it update naturally)
                            if(item === this.bubble.closest)
                                this.bubble.closest = null

                            gsap.to(
                                dummy,
                                {
                                    value: 1,
                                    onUpdate: () =>
                                    {
                                        this.revealArray[item.index] = dummy.value
                                        this.revealBufferNeedsUpdate = true
                                    }
                                }
                            )
                        }
                    }
                )
            }

            // Insert
            else
            {
                item = this.data.findAvailable()

                const dummy = { value: 0 }
                gsap.to(
                    dummy,
                    {
                        value: 1,
                        onUpdate: () =>
                        {
                            this.revealArray[item.index] = dummy.value
                            this.revealBufferNeedsUpdate = true
                        }
                    }
                )

                if(item)
                {
                    item.id = input.id
                    item.available = false
                    item.message = input.message,
                    item.countryCode = input.countrycode,
                    item.position = new THREE.Vector3(input.x, input.y, input.z)
                    item.matrix.setPosition(item.position)
                    item.needsUpdate = true
                }
            }
        }

        this.data.delete = (input) =>
        {
            let item = this.data.findById(input.id)

            if(item)
            {
                item.available = true
            }
        }

        // Server message event
        this.game.server.events.on('message', (data) =>
        {
            // Init and insert
            if(data.type === 'init' || data.type === 'whispersUpsert')
            {
                for(const whisper of data.whispers)
                    this.data.upsert(whisper)
            }

            // Delete
            else if(data.type === 'whispersDelete')
            {
                for(const whisper of data.whispers)
                {
                    this.data.delete(whisper)
                }
            }
        })

        // Message already received
        if(this.game.server.initData)
        {
            for(const whisper of this.game.server.initData.whispers)
                this.data.upsert(whisper)
        }
    }

    setBubble()
    {
        this.bubble = {}
        this.bubble.instance = new Bubble()
        this.bubble.closest = null
        this.bubble.minDistance = 3
    }

    setMenu()
    {
        this.menu = {}

        this.menu.instance = this.game.menu.items.get('whispers')
        this.menu.container = this.menu.instance.contentElement
        this.menu.inputGroup = this.menu.container.querySelector('.js-input-group')
        this.menu.input = this.menu.inputGroup.querySelector('.js-input')
        this.menu.previewMessage = this.menu.instance.previewElement.querySelector('.js-preview-message')
        this.menu.previewMessageText = this.menu.previewMessage.querySelector('.js-text')
        this.menu.previewMessageFlag = this.menu.previewMessage.querySelector('.js-flag')

        const sanatize = (text = '', trim = false, limit = false, stripEmojis = false) =>
        {
            let sanatized = text
            if(trim)
                sanatized = sanatized.trim()

            if(stripEmojis)
                sanatized = sanatized.replace(emojiRegex(), '')
            
            if(limit)
                sanatized = sanatized.substring(0, this.count)

            return sanatized
        }

        const submit = () =>
        {
            const sanatized = sanatize(this.menu.input.value, true, true, true)
            
            if(sanatized.length && this.game.server.connected)
            {
                // Insert
                this.game.server.send({
                    type: 'whispersInsert',
                    message: sanatized,
                    countryCode: this.menu.inputFlag.country ? this.menu.inputFlag.country.code : '',
                    x: this.game.player.position.x,
                    y: this.game.player.position.y,
                    z: this.game.player.position.z
                })

                // Close menu
                this.game.menu.close()

                // Achievement
                this.game.achievements.setProgress('whisper', 1)

                // Sound
                gsap.delayedCall(0.3, () =>
                {
                    this.sounds.ignite.play()
                })
            }
        }

        const updateGroup = () =>
        {
            if(this.menu.input.value.length && this.game.server.connected)
                this.menu.inputGroup.classList.add('is-valide')
            else
                this.menu.inputGroup.classList.remove('is-valide')
        }

        this.menu.input.addEventListener('input', () =>
        {
            const sanatized = sanatize(this.menu.input.value, false, true, true)
            this.menu.previewMessageText.textContent = sanatized.length ? sanatized : 'Your message here'
            this.menu.input.value = sanatized
            updateGroup()
        })

        this.menu.previewMessageText.addEventListener('input', (event) =>
        {
            const sanatized = sanatize(this.menu.previewMessageText.textContent, false, true, true)
            this.menu.previewMessageText.textContent = sanatized
            this.menu.input.value = sanatized
            updateGroup()
        })

        this.menu.previewMessageText.addEventListener('blur', () =>
        {
            const sanatized = sanatize(this.menu.input.value, true, true, true)
            this.menu.previewMessageText.textContent = sanatized !== '' ? sanatized : 'Your message here'
            updateGroup()
        })

        this.menu.previewMessageText.addEventListener('keydown', (event) =>
        {
            if(event.key === 'Enter')
                submit()
        })

        this.menu.inputGroup.addEventListener('submit', (event) =>
        {
            event.preventDefault()

            submit()
        })

        this.menu.instance.events.on('closed', () =>
        {
            this.menu.previewMessageText.textContent = 'Your message here'
            this.menu.input.value = ''
            updateGroup()
            this.menu.inputFlag.close()
        })
            
        this.game.server.events.on('connected', () =>
        {
            updateGroup()
        })

        this.game.server.events.on('disconnected', () =>
        {
            updateGroup()
        })

        /**
         * Flag
         */
        this.menu.inputFlag = new InputFlag(this.menu.inputGroup.querySelector('.js-input-flag'))
        
        this.menu.inputFlag.events.on('change', (country) =>
        {
            if(country)
            {
                this.menu.previewMessageFlag.classList.add('is-visible')
                this.menu.previewMessageFlag.style.backgroundImage = `url(${country.imageUrl})`
            }
            else
            {
                
                this.menu.previewMessageFlag.classList.remove('is-visible')
            }
        })

        if(this.menu.inputFlag.country)
        {
            this.menu.previewMessageFlag.classList.add('is-visible')
            this.menu.previewMessageFlag.style.backgroundImage = `url(${this.menu.inputFlag.country.imageUrl})`
        }
    }

    setInputs()
    {
        this.game.inputs.addActions([
            { name: 'whisper', categories: [ 'wandering' ], keys: [ 'Keyboard.KeyT' ] },
        ])

        this.game.inputs.events.on('whisper', (action) =>
        {
            if(action.active)
                this.game.menu.open('whispers')
        })
    }

    update()
    {
        // Data
        let instanceMatrixNeedsUpdate = false

        for(const item of this.data.items)
        {
            if(item.needsUpdate)
            {
                instanceMatrixNeedsUpdate = true
                this.flames.setMatrixAt(item.index, item.matrix)
                item.needsUpdate = false
            }
        }

        if(instanceMatrixNeedsUpdate)
            this.flames.instanceMatrix.needsUpdate = true

        // Bubble
        let closestWhisper = null
        let closestDistance = Infinity
        for(const item of this.data.items)
        {
            if(!item.available)
            {
                const distance = this.game.player.position.distanceTo(item.position)

                if(distance < closestDistance)
                {
                    closestDistance = distance
                    closestWhisper = item
                }
            }
        }

        if(closestDistance < this.bubble.minDistance)
        {
            if(closestWhisper !== this.bubble.closest)
            {
                const position = closestWhisper.position.clone()
                position.y += 1.25

                let imageUrl = null

                if(closestWhisper.countryCode)
                {
                    const country = this.menu.inputFlag.countries.get(closestWhisper.countryCode)

                    if(country)
                        imageUrl = country.imageUrl
                }

                this.bubble.instance.tryShow(closestWhisper.message, position, imageUrl)
                this.bubble.closest = closestWhisper
            }
        }
        else
        {
            this.bubble.closest = null
            this.bubble.instance.hide()
        }

        if(this.revealBufferNeedsUpdate)
        {
            this.revealBuffer.needsUpdate = true
            this.revealBufferNeedsUpdate = false
        }

        // Sound
        if(closestWhisper)
            this.sounds.flicker.positions[0].copy(closestWhisper.position)
    }
}