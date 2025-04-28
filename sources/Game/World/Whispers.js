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

        this.count = parseInt(import.meta.env.VITE_WHISPERS_COUNT)
        this.countries = new Map()

        this.setFlames()
        this.setData()
        this.setBubble()
        this.setModal()
        this.setInputs()

        this.game.ticker.events.on('tick', () =>
        {
            this.update()
        }, 3)
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

    setModal()
    {
        this.modal = {}

        const modalItem = this.game.modals.items.get('whispers')
        this.modal.container = modalItem.element
        this.modal.inputGroup = this.modal.container.querySelector('.js-input-group')
        this.modal.input = this.modal.inputGroup.querySelector('.js-input')
        this.modal.previewMessage = this.modal.container.querySelector('.js-preview-message')
        this.modal.previewMessageText = this.modal.previewMessage.querySelector('.js-text')
        this.modal.offline = this.modal.container.querySelector('.js-offline')

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
            const sanatized = sanatize(this.modal.input.value, true, true, true)
            
            if(sanatized.length && this.game.server.connected)
            {
                // Insert
                this.game.server.send({
                    type: 'whispersInsert',
                    message: sanatized,
                    countryCode: this.modal.countryCode,
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
            if(this.modal.input.value.length && this.game.server.connected)
                this.modal.inputGroup.classList.add('is-valide')
            else
                this.modal.inputGroup.classList.remove('is-valide')
        }

        this.modal.input.addEventListener('input', () =>
        {
            const sanatized = sanatize(this.modal.input.value, false, true, true)
            this.modal.previewMessageText.textContent = sanatized.length ? sanatized : 'Your message here'
            this.modal.input.value = sanatized
            updateGroup()
        })

        this.modal.previewMessageText.addEventListener('input', (event) =>
        {
            const sanatized = sanatize(this.modal.previewMessageText.textContent, false, true, true)
            this.modal.previewMessageText.textContent = sanatized
            this.modal.input.value = sanatized
            updateGroup()
        })

        this.modal.previewMessageText.addEventListener('blur', () =>
        {
            const sanatized = sanatize(this.modal.input.value, true, true, true)
            this.modal.previewMessageText.textContent = sanatized !== '' ? sanatized : 'Your message here'
            updateGroup()
        })

        this.modal.previewMessageText.addEventListener('keydown', (event) =>
        {
            if(event.key === 'Enter')
                submit()
        })

        this.modal.inputGroup.addEventListener('submit', (event) =>
        {
            event.preventDefault()

            submit()
        })

        modalItem.events.on('closed', () =>
        {
            this.modal.previewMessageText.textContent = 'Your message here'
            this.modal.input.value = ''
            updateGroup()
            closeFlagSelect()
        })

        // Server connect / disconnect
        if(this.game.server.connected)
            this.modal.offline.style.display = 'none'
            
        this.game.server.events.on('connected', () =>
        {
            this.modal.offline.style.display = 'none'
            updateGroup()
        })

        this.game.server.events.on('disconnected', () =>
        {
            this.modal.offline.style.display = 'block'
            updateGroup()
        })

        /**
         * Flag
         */
        // Setup
        this.modal.inputFlag = this.modal.inputGroup.querySelector('.js-input-flag')
        this.modal.flagButton = this.modal.inputFlag.querySelector('.js-flag-button')
        this.modal.flag = this.modal.flagButton.querySelector('.js-flag')
        this.modal.flagSelect = this.modal.inputFlag.querySelector('.js-flag-select')
        this.modal.flagClose = this.modal.inputFlag.querySelector('.js-flag-close')
        this.modal.flagSearch = this.modal.inputFlag.querySelector('.js-flag-search')
        this.modal.flagRemove = this.modal.inputFlag.querySelector('.js-flag-remove')
        this.modal.flagNoResult = this.modal.inputFlag.querySelector('.js-no-result')
        this.modal.previewMessageFlag = this.modal.previewMessage.querySelector('.js-flag')

        this.modal.flagsSelectOpen = false
        this.modal.flagActive = null

        // Select
        const selectFlag = (country = null) =>
        {
            // Selected a flag
            if(country)
            {
                this.modal.flagActive = country
                this.modal.flag.src = country.imageUrl
                this.modal.flagButton.classList.add('has-flag')
                this.modal.previewMessageFlag.classList.add('is-visible')
                this.modal.previewMessageFlag.style.backgroundImage = `url(${country.imageUrl})`
                this.modal.countryCode = country.code
                localStorage.setItem('countryCode', country.code)
            }

            // Selected no flag
            else
            {
                this.modal.flagActive = null
                this.modal.flagButton.classList.remove('has-flag')
                this.modal.previewMessageFlag.classList.remove('is-visible')
                this.modal.countryCode = ''
                localStorage.removeItem('countryCode')
            }

            closeFlagSelect()
        }

        // Remove
        this.modal.flagRemove.addEventListener('click', (event) =>
        {
            event.preventDefault()
            selectFlag(null)
        })

        // Countries
        const choices = this.modal.inputFlag.querySelectorAll('.js-choice')

        for(const _choice of choices)
        {
            const country = {}
            country.element = _choice
            country.terms = country.element.dataset.terms
            country.imageUrl = country.element.querySelector('.js-flag').src
            country.code = country.element.dataset.code

            country.element.addEventListener('click', () =>
            {
                selectFlag(country)
            })

            this.countries.set(country.code, country)
        }

        // Search
        const searchFlag = (value) =>
        {
            const sanatizedValue = value.trim()
            let found = false

            // Empty search => All countries
            if(sanatizedValue === '')
            {
                found = true
                this.countries.forEach((country) =>
                {
                    country.element.style.display = 'block'
                })
            }

            // Non-empty search => Search each terms
            else
            {
                this.countries.forEach((country) =>
                {
                    if(country.terms.match(new RegExp(sanatizedValue)))
                    {
                        found = true
                        country.element.style.display = 'block'
                    }
                    else
                    {
                        country.element.style.display = 'none'
                    }
                })
            }

            // No result
            if(!found)
                this.modal.flagNoResult.classList.add('is-visible')
            else
                this.modal.flagNoResult.classList.remove('is-visible')
        }

        this.modal.flagSearch.addEventListener('input', () =>
        {
            searchFlag(this.modal.flagSearch.value)
        })

        // Open
        const openFlagSelect = () =>
        {
            this.modal.flagsSelectOpen = true
            this.modal.flagSelect.classList.add('is-visible')
            this.modal.flagSearch.focus()
            this.game.modals.preventInputClose = true
        }

        this.modal.flagButton.addEventListener('click', (event) =>
        {
            event.preventDefault()
            openFlagSelect()
        })

        // Close
        const closeFlagSelect = () =>
        {
            this.modal.flagsSelectOpen = false
            this.modal.flagSelect.classList.remove('is-visible')
            this.game.modals.preventInputClose = false
        }

        this.modal.flagClose.addEventListener('click', (event) =>
        {
            event.preventDefault()
            closeFlagSelect()
        })

        this.game.inputs.events.on('close', (event) =>
        {
            if(this.modal.flagsSelectOpen && event.down)
            {
                closeFlagSelect()
            }
        })

        // From localstorage
        this.modal.countryCode = localStorage.getItem('countryCode') ?? ''

        if(this.modal.countryCode)
        {
            const country = this.countries.get(this.modal.countryCode) ?? null

            if(country)
                selectFlag(country)
            else
                this.modal.countryCode = ''
        }
    }

    setInputs()
    {
        this.game.inputs.addMap([
            { name: 'whisper', categories: [ 'playing' ], keys: [ 'KeyT' ] },
        ])

        this.game.inputs.events.on('whisper', (event) =>
        {
            if(event.down)
                this.game.modals.open('whispers')
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
            {
                this.bubble.instance.hide()
            }
            else
            {
                const position = closestWhisper.position.clone()
                position.y += 1.25


                let imageUrl = null

                if(closestWhisper.countryCode)
                {
                    const country = this.countries.get(closestWhisper.countryCode)

                    if(country)
                        imageUrl = country.imageUrl
                }

                this.bubble.instance.tryShow(closestWhisper.message, position, imageUrl)
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