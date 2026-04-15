import * as THREE from 'three/webgpu'
import { Game } from '../../Game.js'
import { attribute, clamp, color, float, Fn, instancedArray, instanceIndex, luminance, max, min, mix, smoothstep, step, texture, uniform, uv, varying, vec2, vec3, vec4 } from 'three/tsl'
import gsap from 'gsap'
import { alea } from 'seedrandom'
import { Area } from './Area.js'

export class AltarArea extends Area
{
    constructor(model)
    {
        super(model)

        if(this.game.debug.active)
        {
            this.debugPanel = this.game.debug.panel.addFolder({
                title: '💀 Altar',
                expanded: false,
            })
        }

        this.value = 0
        this.position = this.references.items.get('altar')[0].position.clone()

        this.color = uniform(color('#ff544d'))
        this.emissive = uniform(8)
        this.progressUniform = uniform(0)

        this.setSounds()
        this.setBeam()
        this.setBeamParticles()
        this.setGlyphs()
        this.setCounter()
        this.setDeathZone()
        this.setData()
        this.setAchievement()

        // Offline counter
        if(!this.game.server.connected)
            this.updateText('...')
            
        this.game.server.events.on('disconnected', () =>
        {
            this.updateText('...')
        })

        // Debug
        if(this.game.debug.active)
        {
            this.game.debug.addThreeColorBinding(this.debugPanel, this.color.value, 'color')
            this.debugPanel.addBinding(this.emissive, 'value', { label: 'emissive', min: 0, max: 10, step: 0.1 })
        }
    }

    setSounds()
    {
        this.sounds = {}

        this.sounds.chimers = this.game.audio.register({
            path: 'sounds/magic/Ghostly Whisper Background Loop 9.mp3',
            autoplay: true,
            loop: true,
            volume: 0.15,
            positions: this.references.items.get('altar')[0].position,
            distanceFade: 20
        })

        this.sounds.deathBell1 = this.game.audio.register({
            path: 'sounds/bell/Death Hit.mp3',
            autoplay: false,
            loop: false,
            volume: 0.4
        })
        this.sounds.deathBell2 = this.game.audio.register({
            path: 'sounds/bell/Epic Bell Impact Hit.mp3',
            autoplay: false,
            loop: false,
            volume: 0.4
        })
    }

    setBeam()
    {
        const radius = 2.5
        this.height = 6
        this.beamAttenuation = uniform(2)

        // Cylinder
        const cylinderGeometry = new THREE.CylinderGeometry(radius, radius, this.height, 32, 1, true)
        cylinderGeometry.translate(0, this.height * 0.5, 0)
        
        const cylinderMaterial = new THREE.MeshBasicNodeMaterial({ side: THREE.DoubleSide })

        cylinderMaterial.outputNode = Fn(() =>
        {
            const baseUv = uv()

            // Noise
            const noiseUv = vec2(baseUv.x.mul(6).add(baseUv.y.mul(-2)), baseUv.y.mul(1).sub(this.game.ticker.elapsedScaledUniform.mul(0.2)))
            const noise = texture(this.game.noises.perlin, noiseUv).r
            noise.addAssign(baseUv.y.mul(this.beamAttenuation.add(1)))

            // Emissive
            const emissiveColor = this.color.mul(this.emissive)

            // Goo
            const gooColor = this.game.fog.strength.mix(vec3(0), this.game.fog.color) // Fog

            // Mix
            // const gooMask = step(noise, 0.95)
            const gooMask = step(0.65, noise)
            const finalColor = mix(emissiveColor, gooColor, gooMask)

            // Discard
            noise.greaterThan(1).discard()
            
            return vec4(finalColor, 1)
        })()

        const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial)
        cylinder.position.copy(this.position)
        this.game.worldContainer.add(cylinder)
        this.objects.hideable.push(cylinder)

        // Bottom
        const bottomGeometry = new THREE.PlaneGeometry(radius * 2, radius * 2, 1, 1)

        const satanStarTexture = this.game.resources.satanStarTexture
        satanStarTexture.minFilter = THREE.NearestFilter
        satanStarTexture.magFilter = THREE.NearestFilter
        satanStarTexture.generateMipmaps = false
        
        const bottomMaterial = new THREE.MeshBasicNodeMaterial({ transparent: true })
        bottomMaterial.outputNode = Fn(() =>
        {
            const newUv = uv().sub(0.5).mul(1.7).add(0.5)
            newUv.y.assign(newUv.y.oneMinus())
            const satanStar = texture(satanStarTexture, newUv).r

            const gooColor = this.game.fog.strength.mix(vec3(0), this.game.fog.color) // Fog

            const emissiveColor = this.color.mul(this.emissive)
            
            const finalColor = mix(gooColor, emissiveColor, satanStar)

            return vec4(finalColor, 1)
        })()

        const bottom = new THREE.Mesh(bottomGeometry, bottomMaterial)
        bottom.position.copy(this.position)
        bottom.rotation.x = - Math.PI * 0.5
        this.game.worldContainer.add(bottom)
        this.objects.hideable.push(bottom)

        this.animateBeam = () =>
        {
            gsap.to(
                this.beamAttenuation,
                { value: 0, ease: 'power2.out', duration: 0.4, onComplete: () =>
                {
                    gsap.to(
                        this.beamAttenuation,
                        { value: 2, ease: 'power2.in', duration: 3 },
                    )
                } },
            )
        }
    }

    setBeamParticles()
    {
        const count = 150

        // Uniforms
        const progress = uniform(0)
        
        // Attributes
        const positionArray = new Float32Array(count * 3)
        const scaleArray = new Float32Array(count)
        const randomArray = new Float32Array(count)
        
        for(let i = 0; i < count; i++)
        {
            const i3 = i * 3

            const spherical = new THREE.Spherical(
                (1 - Math.pow(1 - Math.random(), 2)) * 5,
                Math.random() * Math.PI * 0.4,
                Math.random() * Math.PI * 2
            )
            const position = new THREE.Vector3().setFromSpherical(spherical)
            positionArray[i3 + 0] = position.x
            positionArray[i3 + 1] = position.y
            positionArray[i3 + 2] = position.z

            scaleArray[i] = Math.random()
            randomArray[i] = Math.random()
        }
        const position = instancedArray(positionArray, 'vec3').toAttribute()
        const scale = instancedArray(scaleArray, 'float').toAttribute()
        const random = instancedArray(randomArray, 'float').toAttribute()

        // Material
        const particlesMaterial = new THREE.SpriteNodeMaterial()
        particlesMaterial.outputNode = Fn(() =>
        {
            const distanceToCenter = uv().sub(0.5).length()
            const gooColor = this.game.fog.strength.mix(vec3(0), this.game.fog.color) // Fog
            const emissiveColor = this.color.mul(this.emissive)
            const finalColor = mix(gooColor, emissiveColor, step(distanceToCenter, 0.35))

            // Discard
            distanceToCenter.greaterThan(0.5).discard()

            return vec4(finalColor, 1)
        })()
        particlesMaterial.positionNode = Fn(() =>
        {
            const localProgress = progress.remapClamp(0, 0.5, 1, 0).pow(6).oneMinus()
            
            const finalPosition = position.toVar().mulAssign(localProgress)
            finalPosition.y.addAssign(progress.mul(random))

            return finalPosition
        })()
        particlesMaterial.scaleNode = Fn(() =>
        {
            const finalScale = smoothstep(1, 0.3, progress).mul(scale)
            return finalScale
        })()
        
        // Geometry
        const particlesGeometry = new THREE.PlaneGeometry(0.2, 0.2)

        // Mesh
        const particles = new THREE.Mesh(particlesGeometry, particlesMaterial)
        particles.count = count
        particles.position.copy(this.position)
        particles.position.y -= 0.1
        this.game.worldContainer.add(particles)
        this.objects.hideable.push(particles)

        this.animateBeamParticles = () =>
        {
            gsap.fromTo(
                progress,
                { value: 0 },
                { value: 1, ease: 'linear', duration: 3 },
            )
        }
    }

    setGlyphs()
    {
        const count = 40

        const positions = new Float32Array(count * 3)
        const speeds = new Float32Array(count)
        
        for(let i = 0; i < count; i++)
        {
            const angle = Math.PI * 2 * Math.random()
            const elevation = Math.random() * 5
            const radius = Math.random() * 8
            positions[i * 3 + 0] = Math.sin(angle) * radius
            positions[i * 3 + 1] = elevation
            positions[i * 3 + 2] = Math.cos(angle) * radius
            
            speeds[i] = 0.2 + Math.random() * 0.8
        }

        const positionAttribute = instancedArray(positions, 'vec3').toAttribute()
        const speedAttribute = instancedArray(speeds, 'float').toAttribute()

        const material = new THREE.SpriteNodeMaterial({ transparent: true })
        
        const progressVarying = varying(float(0))

        material.positionNode = Fn(() =>
        {
            progressVarying.assign(this.game.ticker.elapsedScaledUniform.mul(0.05).add(float(instanceIndex).div(count)).fract())

            const newPosition = positionAttribute.toVar()
            newPosition.y.addAssign(progressVarying.mul(speedAttribute))
            return newPosition
        })()

        material.scaleNode = Fn(() =>
        {
            const scale = min(
                progressVarying.remapClamp(0, 0.1, 0, 1),
                progressVarying.remapClamp(0.7, 0.8, 1, 0),
                1
            )
            return scale.mul(0.2)
        })()

        const emissiveAMaterial = this.game.materials.getFromName('emissiveBlueRadialGradient')
        const emissiveBMaterial = this.game.materials.getFromName('emissiveOrangeRadialGradient')

        material.outputNode = Fn(() =>
        {
            // Glyph
            const glyphUv = uv().toVar()
            glyphUv.x.addAssign(instanceIndex)
            glyphUv.x.divAssign(32)
            const glyph = texture(this.game.resources.achievementsGlyphsTexture, glyphUv).r
            glyph.lessThan(0.5).discard()

            // Emissive
            const emissiveOutput = mix(
                emissiveBMaterial.outputNode,
                emissiveAMaterial.outputNode,
                float(instanceIndex).div(count).step(this.progressUniform)
            )

            return emissiveOutput
        })()

        const geometry = new THREE.PlaneGeometry(1, 1)

        const mesh = new THREE.Mesh(geometry, material)
        mesh.renderOrder = 3
        mesh.position.x = this.position.x
        mesh.position.y = 0
        mesh.position.z = this.position.z
        mesh.count = count
        this.game.worldContainer.add(mesh)
        this.objects.hideable.push(mesh)

        let frustumNeedsUpdate = true
        this.events.on('frustumIn', () =>
        {
            if(frustumNeedsUpdate)
            {
                this.game.ticker.wait(2, () =>
                {
                    mesh.geometry.boundingSphere.center.y = 2
                    mesh.geometry.boundingSphere.radius = 5
                })
                frustumNeedsUpdate = false
            }
        })
    }

    setCounter()
    {
        const size = 3

        // Canvas
        const ratio = 1 / 4
        this.width = 256
        this.height = this.width * ratio
        this.font = `700 ${this.height}px "Amatic SC"`
        
        const canvas = document.createElement('canvas')
        canvas.width = this.width
        canvas.height = this.height

        this.textTexture = new THREE.Texture(canvas)
        this.textTexture.colorSpace = THREE.SRGBColorSpace
        this.textTexture.minFilter = THREE.NearestFilter
        this.textTexture.magFilter = THREE.NearestFilter
        this.textTexture.generateMipmaps = false

        this.context = canvas.getContext('2d')
        this.context.font = this.font

        // Geometry
        const geometry = new THREE.PlaneGeometry(size, size * ratio, 1, 1)

        // Material
        const material = new THREE.MeshBasicNodeMaterial({ transparent: true })
        material.outputNode = Fn(() =>
        {
            const textData = texture(this.textTexture, uv())
            const gooColor = this.game.fog.strength.mix(vec3(0), this.game.fog.color) // Fog
            const emissiveColor = this.color.mul(this.emissive)
            const finalColor = mix(gooColor, emissiveColor, textData.g)

            // Discard
            textData.r.add(textData.g).lessThan(0.5).discard()

            return vec4(finalColor, 1)
        })()

        // Mesh
        this.mesh = new THREE.Mesh(geometry, material)
        this.references.items.get('counter')[0].add(this.mesh)
    }

    setDeathZone()
    {
        const position = this.position.clone()
        position.y -= 1.25
        const zone = this.game.zones.create('sphere', position, 2.5)

        zone.events.on(
            'enter',
            () =>
            {
                this.animateBeam()
                this.animateBeamParticles()
                this.data.insert()
                this.updateText(this.value + 1)
                this.game.player.die()
                this.sounds.deathBell2.play()
                gsap.delayedCall(2.2, () =>
                {
                    this.sounds.deathBell1.play()
                })
                this.game.achievements.setProgress('sacrifice', 1)
            }
        )
    }

    setData()
    {
        this.data = {}
        
        this.data.insert = () =>
        {
            this.game.server.send({
                type: 'cataclysmInsert'
            })
        }

        // Server message event
        this.game.server.events.on('message', (data) =>
        {
            // Init and insert
            if(data.type === 'init' || data.type === 'cataclysmUpdate')
            {
                this.updateText(data.cataclysmCount)
                this.progressUniform.value = data.cataclysmProgress
            }
        })

        // Init message already received
        if(this.game.server.initData)
        {
            this.updateText(this.game.server.initData.cataclysmCount)
            this.progressUniform.value = this.game.server.initData.cataclysmProgress
        }
    }

    updateText(value)
    {
        let formatedValue = null

        // Displaying number value
        if(typeof value === 'number')
        {
            // Same value
            if(value === this.value)
                return
                
            this.value = value
            formatedValue = value.toLocaleString('en-US')
        }

        // Displaying text value
        else
        {
            formatedValue = value
        }

        this.context.font = this.font

        this.context.fillStyle = '#000000'
        this.context.fillRect(0, 0, this.width, this.height)

        this.context.font = this.font
        this.context.textAlign = 'center'
        this.context.textBaseline = 'middle'

        this.context.strokeStyle = '#ff0000'
        this.context.lineWidth = this.height * 0.15
        this.context.strokeText(formatedValue, this.width * 0.5, this.height * 0.55)

        this.context.fillStyle = '#00ff00'
        this.context.fillText(formatedValue, this.width * 0.5, this.height * 0.55)

        this.textTexture.needsUpdate = true

        gsap.to(
            this.mesh.scale,
            {
                x: 1.5,
                y: 1.5,
                duration: 0.3,
                overwrite: true,
                onComplete: () =>
                {
                    gsap.to(
                        this.mesh.scale,
                        {
                            x: 1,
                            y: 1,
                            duration: 2,
                            ease: 'elastic.out(1,0.3)',
                            overwrite: true
                        }
                    )
                }
            }
        )
    }

    setAchievement()
    {
        this.events.on('boundingIn', () =>
        {
            this.game.achievements.setProgress('areas', 'altar')
        })
    }
}