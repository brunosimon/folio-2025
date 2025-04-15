import * as THREE from 'three/webgpu'
import { Game } from '../Game.js'
import { billboarding, cameraPosition, color, Fn, instanceIndex, min, mix, modelViewMatrix, mul, normalWorld, positionGeometry, positionViewDirection, positionWorld, smoothstep, storage, texture, time, uv, vec2, vec3, vec4 } from 'three/tsl'
import { hash } from 'three/tsl'
import gsap from 'gsap'
import { Bubble } from './Bubble.js'
import emojiRegex from 'emoji-regex'

export class Whispers
{
    constructor()
    {
        this.game = Game.getInstance()

        this.count = 30

        this.setFlames()
        this.setData()
        this.setBubble()
        this.setModal()

        this.game.ticker.events.on('tick', () =>
        {
            this.update()
        }, 3)

        this.game.inputs.events.on('whisper', (event) =>
        {
            if(event.down)
                this.game.modals.open('whispers')
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
            const noise = texture(this.game.noises.others, noiseUv).r.sub(0.5).mul(noiseStrength)
            newPosition.x.addAssign(noise)

            return newPosition
        })()

        beamMaterial.outputNode = Fn(() =>
        {
            const mask = texture(this.game.resources.whisperBeamTexture, uv()).r.sub(revealAttribute.oneMinus())
            const color = texture(this.game.materials.gradientTexture, vec2(0, mask))
            const alpha = smoothstep(0.05, 0.3, mask)
            const emissiveMultiplier = smoothstep(0.8, 1, mask).add(1).mul(2)

            return vec4(vec3(color.mul(emissiveMultiplier)), alpha.mul(revealAttribute))
        })()

        // // Sphere
        // const sphereGeometry = new THREE.SphereGeometry(0.5, 20, 8)
        
        // const sphereMaterial = new THREE.MeshBasicNodeMaterial()
        // sphereMaterial.outputNode = Fn(() =>
        // {
        //     const viewDirection = positionWorld.sub(cameraPosition).normalize()
                
        //     const fresnel = viewDirection.dot(normalWorld).abs().oneMinus().toVar()
        //     const remapedFresnel = fresnel.oneMinus().pow(2).oneMinus().toVar()
        //     const color = texture(this.game.materials.gradientTexture, vec2(0, remapedFresnel))
        //     // color.mulAssign(2)
        //     return vec4(vec3(color), 1)
        // })()

        // const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
        // sphere.rotation.reorder('YXZ')
        // sphere.rotation.y = Math.PI * 0.25
        // sphere.rotation.x = Math.PI * 0.25
        // group.add(sphere)

        // Instanced mesh
        this.flames = new THREE.InstancedMesh(beamGeometry, beamMaterial, this.count)
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

    setModal()
    {
        this.modal = {}

        const modalItem = this.game.modals.items.get('whispers')
        this.modal.element = modalItem.element
        this.modal.inputGroupElement = this.modal.element.querySelector('.js-input-group')
        this.modal.inputElement = this.modal.inputGroupElement.querySelector('.js-input')
        this.modal.previewMessageElement = this.modal.element.querySelector('.js-preview-message')
        this.modal.offlineElement = this.modal.element.querySelector('.js-offline')

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
            const sanatized = sanatize(this.modal.inputElement.value, true, true, true)
            
            if(sanatized.length && this.game.server.connected)
            {
                // Insert
                this.game.server.send({
                    type: 'whispersInsert',
                    message: sanatized,
                    x: this.game.player.position.x,
                    y: this.game.player.position.y,
                    z: this.game.player.position.z
                })

                // Close modal
                this.game.modals.close()
            }
        }

        const updateGroup = () =>
        {
            if(this.modal.inputElement.value.length && this.game.server.connected)
                this.modal.inputGroupElement.classList.add('is-valide')
            else
                this.modal.inputGroupElement.classList.remove('is-valide')
        }

        this.modal.inputElement.addEventListener('input', () =>
        {
            const sanatized = sanatize(this.modal.inputElement.value, false, true, true)
            this.modal.previewMessageElement.textContent = sanatized.length ? sanatized : 'Your message here'
            this.modal.inputElement.value = sanatized
            updateGroup()
        })

        this.modal.previewMessageElement.addEventListener('input', (event) =>
        {
            const sanatized = sanatize(this.modal.previewMessageElement.textContent, false, true, true)
            this.modal.previewMessageElement.textContent = sanatized
            this.modal.inputElement.value = sanatized
            updateGroup()
        })

        this.modal.previewMessageElement.addEventListener('blur', () =>
        {
            const sanatized = sanatize(this.modal.inputElement.value, true, true, true)
            this.modal.previewMessageElement.textContent = sanatized !== '' ? sanatized : 'Your message here'
            updateGroup()
        })

        this.modal.previewMessageElement.addEventListener('keydown', (event) =>
        {
            if(event.key === 'Enter')
                submit()
        })

        this.modal.inputGroupElement.addEventListener('submit', (event) =>
        {
            event.preventDefault()

            submit()
        })

        modalItem.events.on('closed', () =>
        {
            this.modal.previewMessageElement.textContent = 'Your message here'
            this.modal.inputElement.value = ''
            updateGroup()
        })

        // Server connect / disconnect
        if(this.game.server.connected)
            this.modal.offlineElement.style.display = 'none'
            
        this.game.server.events.on('connected', () =>
        {
            this.modal.offlineElement.style.display = 'none'
            updateGroup()
        })

        this.game.server.events.on('disconnected', () =>
        {
            this.modal.offlineElement.style.display = 'block'
            updateGroup()
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

                if(distance < closestDistance && distance < this.bubble.minDistance)
                {
                    closestDistance = distance
                    closestWhisper = item
                }
            }
        }

        if(closestWhisper !== this.bubble.closest)
        {
            if(!closestWhisper)
                this.bubble.instance.hide()
            else
            {
                const position = closestWhisper.position.clone()
                position.y += 1.25
                this.bubble.instance.tryShow(closestWhisper.message, position)
            }

            this.bubble.closest = closestWhisper
        }

        if(this.revealBufferNeedsUpdate)
        {
            this.revealBuffer.needsUpdate = true
            this.revealBufferNeedsUpdate = false
        }
    }
}