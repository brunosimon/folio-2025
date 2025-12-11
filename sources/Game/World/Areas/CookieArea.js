import * as THREE from 'three/webgpu'
import { Game } from '../../Game.js'
import { color, float, Fn, instancedArray, mix, normalWorld, positionGeometry, step, texture, uniform, uv, vec2, vec3, vec4 } from 'three/tsl'
import { InstancedGroup } from '../../InstancedGroup.js'
import gsap from 'gsap'
import { InteractivePoints } from '../../InteractivePoints.js'
import { MeshDefaultMaterial } from '../../Materials/MeshDefaultMaterial.js'
import { alea } from 'seedrandom'
import { Area } from './Area.js'

export class CookieArea extends Area
{
    constructor(model)
    {
        super(model)

        if(this.game.debug.active)
        {
            this.debugPanel = this.game.debug.panel.addFolder({
                title: '🍪 Cookie Stand',
                expanded: false,
            })
        }

        this.setSound()
        this.setBlower()
        this.setBanner()
        this.setParticles()
        this.setOvenHeat()
        this.setCookies()
        this.setActualCookies()
        this.setInteractivePoint()
        this.setCounter()
        this.setAchievement()
    }

    setSound()
    {
        this.sounds = {}

        this.sounds.ding = this.game.audio.register({
            path: 'sounds/ding/Cash Register 03.mp3',
            autoplay: false,
            loop: false,
            volume: 0.4,
            antiSpam: 0.15,
            onPlay: (item) =>
            {
                item.volume = 0.3 + Math.random() * 0.2
                item.rate = 1 + Math.random() * 0.05
            }
        })
    }

    setBlower()
    {
        this.blower = this.references.items.get('blower')[0]
    }

    setBanner()
    {
        const windStrength = float(0).toVarying()

        const mesh = this.references.items.get('banner')[0]

        // Position
        mesh.material.positionNode = Fn(() =>
        {
            const baseUv = uv()
            const newPosition = positionGeometry.toVar()

            // Wind
            const windUv = baseUv
                .mul(vec2(0.35, 0.175))
                .sub(vec2(0.1, 0.05).mul(this.game.ticker.elapsedScaledUniform))
                
            const noise = texture(this.game.noises.perlin, windUv).r
            windStrength.assign(noise.mul(baseUv.y).mul(this.game.wind.strength))
            const windDirection = vec3(0.5, 0, 1)
            newPosition.addAssign(windDirection.mul(windStrength))

            return newPosition
        })()
    }

    setParticles()
    {
        const emissiveMaterial = this.game.materials.getFromName('emissiveOrangeRadialGradient')

        const count = 30
        const elevation = uniform(3)
        const positions = new Float32Array(count * 3)
        const scales = new Float32Array(count)

        this.localTime = uniform(0)

        for(let i = 0; i < count; i++)
        {
            const i3 = i * 3

            const angle = Math.PI * 2 * Math.random()
            const radius = Math.pow(Math.random(), 1.5) * 0.4
            positions[i3 + 0] = Math.cos(angle) * radius
            positions[i3 + 1] = Math.random()
            positions[i3 + 2] = Math.sin(angle) * radius

            scales[i] = Math.random() * 1 + 0.75
        }
        
        const positionAttribute = instancedArray(positions, 'vec3').toAttribute()
        const scaleAttribute = instancedArray(scales, 'float').toAttribute()

        const material = new THREE.SpriteNodeMaterial()
        material.outputNode = emissiveMaterial.outputNode

        const progress = float(0).toVar()

        material.positionNode = Fn(() =>
        {
            const newPosition = positionAttribute.toVar()
            progress.assign(newPosition.y.add(this.localTime.mul(newPosition.y)).fract())

            newPosition.y.assign(progress.mul(elevation))

            const progressHide = step(0.8, progress).mul(100)
            newPosition.y.addAssign(progressHide)
            
            return newPosition
        })()
        material.scaleNode = Fn(() =>
        {
            const progressScale = progress.remapClamp(0.5, 1, 1, 0)
            return scaleAttribute.mul(progressScale)
        })()

        const geometry = new THREE.CircleGeometry(0.015, 8)

        const mesh = new THREE.Mesh(geometry, material)
        mesh.position.copy(this.references.items.get('chimney')[0].position)
        mesh.count = count

        this.game.scene.add(mesh)

        let frustumNeedsUpdate = true
        this.events.on('frustumIn', () =>
        {
            if(frustumNeedsUpdate)
            {
                this.game.ticker.wait(2, () =>
                {
                    mesh.geometry.boundingSphere.center.y = 1
                    mesh.geometry.boundingSphere.radius = 1
                })
                frustumNeedsUpdate = false
            }
        })

        this.objects.hideable.push(mesh)
    }

    setOvenHeat()
    {
        const material = new THREE.MeshBasicNodeMaterial({ side: THREE.DoubleSide, transparent: true, depthTest: true, depthWrite: false })

        material.outputNode = Fn(() =>
        {
            const noiseUv = uv().mul(vec2(2, 0.2))
            noiseUv.y.addAssign(this.game.ticker.elapsedScaledUniform.mul(0.05))
            const noise = texture(this.game.noises.perlin, noiseUv).r

            const strength = noise.mul(uv().y.pow(2))

            const emissiveMix = strength.smoothstep(0, 0.5)
            const emissiveColor = mix(color('#ff3e00'), color('#ff8641'), emissiveMix).mul(strength.add(1).mul(2))

            return vec4(vec3(emissiveColor), strength)
        })()

        this.ovenHeat = this.references.items.get('ovenHeat')[0]
        this.ovenHeat.material = material
        this.ovenHeat.castShadow = false
    }

    setCookies()
    {
        const baseCookie = this.references.items.get('cookie')[0]
        baseCookie.castShadow = true
        baseCookie.receiveShadow = true
        baseCookie.frustumCulled = true
        baseCookie.position.set(0, 0, 0)

        // Update materials 
        this.game.materials.updateObject(baseCookie)

        this.cookies = {}
        this.cookies.spawnerPosition = this.references.items.get('spawner')[0].position
        this.cookies.count = 20
        this.cookies.visibleCount = 0
        this.cookies.realCount = this.cookies.count + 2
        this.cookies.currentIndex = 0
        this.cookies.mass = 0.02
        this.cookies.objects = []

        const references = []

        for(let i = 0; i < this.cookies.realCount; i++)
        {
            const onTable = i >= this.cookies.count

            // Reference
            const reference = new THREE.Object3D()

            if(onTable)
            {
                reference.position.copy(this.references.items.get('table')[0].position)
                reference.position.y += (i - this.cookies.count) * 0.25
            }
            else
            {
                reference.position.copy(this.cookies.spawnerPosition)
                reference.position.y += 99
            }
            reference.needsUpdate = true
            references.push(reference)
            
            // Object
            const object = this.game.objects.add(
                {
                    model: reference,
                    updateMaterials: false,
                    castShadow: false,
                    receiveShadow: false,
                    parent: null,
                },
                {
                    type: 'dynamic',
                    position: reference.position,
                    rotation: reference.quaternion,
                    friction: 0.7,
                    sleeping: true,
                    enabled: onTable,
                    mass: this.cookies.mass,
                    colliders: [ { shape: 'cylinder', parameters: [ 0.55 / 2, 1.25 / 2 ], category: 'object' } ],
                    waterGravityMultiplier: - 1
                },
            )

            this.cookies.objects.push(object)
        }

        this.cookies.instancedGroup = new InstancedGroup(references, baseCookie)
    }

    setActualCookies()
    {
        this.actualCookies = {}
        this.actualCookies.count = 0

        const cookies = document.cookie.split('; ')
        for(const cookie of cookies)
        {
            const match = cookie.match('^acceptedCookies=([0-9]+)')

            if(match)
                this.actualCookies.count = parseInt(match[1])
        }
    }

    setInteractivePoint()
    {
        this.game.interactivePoints.create(
            this.references.items.get('interactivePoint')[0].position,
            'Accept cookie',
            InteractivePoints.ALIGN_RIGHT,
            InteractivePoints.STATE_CONCEALED,
            () =>
            {
                this.accept()
            },
            () =>
            {
                this.game.inputs.interactiveButtons.addItems(['interact'])
            },
            () =>
            {
                this.game.inputs.interactiveButtons.removeItems(['interact'])
            },
            () =>
            {
                this.game.inputs.interactiveButtons.removeItems(['interact'])
            }
        )
    }

    setCounter()
    {
        this.counter = {}
        this.counter.value = 0
        this.counter.panel = this.references.items.get('counterPanel')[0]
        this.counter.texture = null
        this.counter.initialised = false
        this.counter.maxScale = 0

        /**
         * Canvas
         */
        const height = 64
        const textOffsetVertical = 2
        const font = `700 ${height}px "Amatic SC"`

        const canvas = document.createElement('canvas')
        canvas.style.position = 'fixed'
        canvas.style.zIndex = 999
        canvas.style.top = 0
        canvas.style.left = 0
        // document.body.append(canvas)

        const context = canvas.getContext('2d')
        context.font = font

        /**
         * Functions
         */
        this.counter.init = () =>
        {
            // Already
            if(this.counter.initialised)
                return

            this.counter.initialised = true

            // Texture
            canvas.width = 256
            canvas.height = height

            this.counter.texture = new THREE.Texture(canvas)
            this.counter.texture.minFilter = THREE.NearestFilter
            this.counter.texture.magFilter = THREE.NearestFilter
            this.counter.texture.generateMipmaps = false

            // Geometry
            const geometry = new THREE.PlaneGeometry(1, 1)

            // Material
            const material = new MeshDefaultMaterial({
                alphaNode: texture(this.counter.texture).r,
                hasWater: false,
                hasLightBounce: false
            })

            // Mesh
            const mesh = new THREE.Mesh(geometry, material)
            mesh.position.copy(this.references.items.get('counterLabel')[0].position)
            mesh.quaternion.copy(this.references.items.get('counterLabel')[0].quaternion)
            mesh.receiveShadow = true
            mesh.scale.y = 0.75
            mesh.scale.x = canvas.width / canvas.height * 0.75
            this.game.scene.add(mesh)

            // First update
            this.counter.update()
            this.counter.update()
        }

        this.counter.add = () =>
        {
            this.counter.value++
            // this.counter.value *= 2
            this.throttleAmount++
            this.counter.update()
        }

        this.counter.update = () =>
        {
            if(!this.counter.initialised)
                return

            const formatedValue = this.counter.value.toLocaleString('en-US')
            
            // Canvas
            const textSize = context.measureText(formatedValue)
            const width = Math.ceil(textSize.width) + 30
            const scale = width / 105

            context.fillStyle = '#000000'
            context.fillRect(0, 0, canvas.width, canvas.height)

            context.font = font
            context.fillStyle = '#ffffff'
            context.textAlign = 'center'
            context.textBaseline = 'middle'
            context.fillText(formatedValue, canvas.width / 2, canvas.height * 0.5 + textOffsetVertical)

            if(scale > this.counter.maxScale)
            {
                this.counter.maxScale = scale
                this.counter.panel.scale.x = scale
            }

            this.counter.texture.needsUpdate = true
        }

        /**
         * Server
         */
        this.throttleAmount = 0
        this.counter.throttleUpdate = () =>
        {
            if(this.throttleAmount > 0)
            {
                this.game.server.send({
                    type: 'cookiesInsert',
                    amount: this.throttleAmount
                })
                this.throttleAmount = 0
            }
        }
        
        setInterval(() =>
        {
            this.counter.throttleUpdate()
        }, 1000)

        // Server message event
        this.game.server.events.on('message', (data) =>
        {
            // Init and insert
            if(data.type === 'init' || data.type === 'cookiesUpdate')
            {
                if(data.cookiesCount > this.counter.value)
                {
                    this.counter.value = data.cookiesCount
                    this.counter.update()
                }
            }
        })

        // Message already received
        if(this.game.server.initData)
        {
            this.counter.value = this.game.server.initData.cookiesCount
        }

        // Server connect / disconnect
        if(this.game.server.connected)
            this.counter.init()
            
        this.game.server.events.on('connected', () =>
        {
            this.counter.init()
        })
    }

    setAchievement()
    {
        this.events.on('boundingIn', () =>
        {
            this.game.achievements.setProgress('areas', 'cookie')
        })
    }

    accept()
    {
        // Cookies
        const object = this.cookies.objects[this.cookies.currentIndex]

        const spawnPosition = this.cookies.spawnerPosition.clone()
        spawnPosition.z += Math.random() - 0.5
        object.physical.body.setTranslation(spawnPosition)
        object.physical.body.setEnabled(true)
        this.game.ticker.wait(2, () =>
        {
            const impulse = {
                x: (Math.random() - 0.5) * this.cookies.mass * 2,
                y: Math.random() * this.cookies.mass * 3,
                z: this.cookies.mass * 7
            }
            object.physical.body.applyImpulse(impulse, true)
            object.physical.body.applyTorqueImpulse({ x: 0, y: 0, z: 0 }, true)
        })

        this.cookies.currentIndex = (this.cookies.currentIndex + 1) % this.cookies.count

        this.cookies.visibleCount = Math.min(this.cookies.visibleCount + 1, this.cookies.count)

        // Oven heat
        this.ovenHeat.scale.z = 2
        gsap.to(this.ovenHeat.scale, { z: 1, overwrite: true, duration: 2, delay: 0.2, ease: 'power1.inOut' })

        // Counter
        this.counter.add()

        // Sound
        this.sounds.ding.play()

        // Actual cookie
        document.cookie = `acceptedCookies=${++this.actualCookies.count}`

        // Achievement
        this.game.achievements.addProgress('cookie')
    }

    update()
    {
        // Time
        const timeScale = (Math.sin(this.game.ticker.elapsedScaled) * 0.3 + 0.5) * 0.3
        this.localTime.value += this.game.ticker.deltaScaled * timeScale

        // Blower
        this.blower.scale.y = Math.sin(this.game.ticker.elapsedScaled + Math.PI) * 0.25 + 0.75

        // Cookies
        if(this.cookies.visibleCount)
        {
            let allCookiesSleeping = true
            for(const fan of this.cookies.objects)
                allCookiesSleeping = allCookiesSleeping && fan.physical.body.isSleeping()

            if(!allCookiesSleeping)
                this.cookies.instancedGroup.updateBoundings()
        }

        for(const object of this.cookies.objects)
        {
            if(!object.physical.body.isSleeping() && object.physical.body.isEnabled())
                object.visual.object3D.needsUpdate = true
        }
    }
}