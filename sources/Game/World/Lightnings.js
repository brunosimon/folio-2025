import * as THREE from 'three/webgpu'
import { Game } from '../Game.js'
import { attribute, cameraPosition, cameraProjectionMatrix, cameraViewMatrix, color, cross, float, floor, Fn, instancedArray, min, modelWorldMatrix, mul, positionGeometry, remapClamp, step, uniform, varying, vec3, vec4, vertexIndex } from 'three/tsl'
import { LineGeometry } from '../Geometries/LineGeometry.js'
import gsap from 'gsap'
import { alea } from 'seedrandom'
import { remapClamp as mathRemapClamp } from '../utilities/maths.js'

const rng = alea('lightning')

export class Lightnings
{
    constructor()
    {
        this.game = Game.getInstance()

        // Debug
        if(this.game.debug.active)
        {
            this.debugPanel = this.game.debug.panel.addFolder({
                title: '⚡️ Lightnings',
                expanded: false,
            })
        }

        this.frequency = 2
        this.hitChances = 0
        this.currentSecond = Math.floor(Date.now() / 1000)

        // Debug
        this.hitChancesBinding = this.game.debug.addManualBinding(
            this.debugPanel,
            this,
            'hitChances',
            { label: 'hitChances', min: 0, max: 1, step: 0.001 },
            () =>
            {
                // return 1
                return Math.max(0, this.game.weather.clouds.value) * Math.max(0, this.game.weather.electricField.value) * this.game.weather.humidity.value
            }
        )

        if(this.game.debug.active)
        {
            this.debugPanel.addBinding(this, 'frequency', { min: 0.1, max: 10, step: 0.1 })
        }

        this.materialReference = this.game.materials.createEmissive('lightnings', '#4c8bff', 4, this.debugPanel)

        this.setSounds()
        this.setAnticipationParticles()
        this.setArc()
        this.setExplosionParticles()

        this.game.ticker.events.on('tick', () =>
        {
            this.update()
        }, 10)
    }

    setSounds()
    {
        this.sounds = {}

        // Near
        {
            const paths = [
                'sounds/thunder/near/THUNDER_GEN-HDF-23300.mp3',
                'sounds/thunder/near/Lightning-Streak-with-Thunder-Crash_TTX028903.mp3',
                'sounds/thunder/near/ThunderSharpStrikingRumblingCrackling_JMDKp_04.mp3'
            ]

            this.sounds.near = []

            for(const path of paths)
            {
                this.sounds.near.push(
                    this.game.audio.register({
                        path: path,
                        autoplay: false,
                        loop: false,
                        volume: 1,
                        antiSpam: 0.2,
                        positions: new THREE.Vector3(),
                        onPlay: (item, coordinates) =>
                        {
                            const distance = Math.hypot(coordinates.x - this.game.player.position2.x, coordinates.z - this.game.player.position2.y)
                            item.positions[0].copy(coordinates)
        
                            // const distanceVolumeEffect = Math.pow(mathRemapClamp(distance, 0, 20, 1, 0), 2)
                            // item.volume = 0.1 + Math.random() * 0.1 + distanceVolumeEffect * 0.6

                            const distanceRateEffect = mathRemapClamp(distance, 0, 20, 0, - 0.3)
                            item.rate = 1.3 + Math.random() * 0.1 + distanceRateEffect
                        }
                    })
                )
            }
        }

        // Distant
        {
            const paths = [
                'sounds/thunder/distant/Thunder32GentleCr SIG014001.mp3',
                'sounds/thunder/distant/Thunder44LowRippl SIG015201.mp3',
            ]

            this.sounds.distant = []

            for(const path of paths)
            {
                this.sounds.distant.push(
                    this.game.audio.register({
                        path: path,
                        autoplay: false,
                        loop: false,
                        volume: 0.4,
                        antiSpam: 7,
                        onPlay: (item) =>
                        {
                            item.volume = 1 + Math.random() * 0.3
                            item.rate = 1 + Math.random() * 0.3
                        }
                    })
                )
            }
        }
    }

    setAnticipationParticles()
    {
        this.anticipationParticles = {}
        this.anticipationParticles.count = 32
        this.anticipationParticles.duration = 5

        // Uniforms
        const durationUniform = uniform(this.anticipationParticles.duration)
        const scaleUniform = uniform(0.07)
        const elevationUniform = uniform(1.5)

        // Buffers
        const positionArray = new Float32Array(this.anticipationParticles.count * 3)
        const scaleArray = new Float32Array(this.anticipationParticles.count)

        for(let i = 0; i < this.anticipationParticles.count; i++)
        {
            const i3 = i * 3
            const angle = Math.PI * 2 * rng()
            const radius = rng() * 3
            positionArray[i3 + 0] = Math.sin(angle) * radius
            positionArray[i3 + 1] = - rng()
            positionArray[i3 + 2] = Math.cos(angle) * radius

            scaleArray[i] = rng() * 0.75 + 0.25
        }

        this.anticipationParticles.positionAttribute = instancedArray(positionArray, 'vec3').toAttribute()
        this.anticipationParticles.scaleAttribute = instancedArray(scaleArray, 'float').toAttribute()

        this.anticipationParticles.geometry = new THREE.PlaneGeometry(1, 1)

        const finalPosition = varying(vec3())

        // Position node
        this.anticipationParticles.positionNode = Fn(([_startTime]) =>
        {
            const localTime = this.game.ticker.elapsedScaledUniform.sub(_startTime)
            finalPosition.assign(this.anticipationParticles.positionAttribute)
            const timeProgress = min(localTime.div(this.anticipationParticles.duration), 1)
            
            finalPosition.y.addAssign(timeProgress.mul(elevationUniform))

            return finalPosition
        })

        // Scale node
        this.anticipationParticles.scaleNode = Fn(([_startTime]) =>
        {
            const localTime = this.game.ticker.elapsedScaledUniform.sub(_startTime)
            const duration = float(this.anticipationParticles.duration)
            const timeScale = localTime.remapClamp(duration.mul(0.5), duration, 1, 0)
            const elevationScale = finalPosition.y.remapClamp(0, 0.2, 0, 1)
            const finalScale = this.anticipationParticles.scaleAttribute.mul(scaleUniform).mul(timeScale).mul(elevationScale)
            return finalScale
        })

        // Create
        this.anticipationParticles.create = (coordinates, rng) =>
        {
            // Uniforms
            const startTime = uniform(this.game.ticker.elapsedScaled)
            
            // Material
            const material = new THREE.SpriteNodeMaterial()
            material.colorNode = this.materialReference.colorNode
            material.positionNode = this.anticipationParticles.positionNode(startTime)
            material.scaleNode = this.anticipationParticles.scaleNode(startTime)
            
            const mesh = new THREE.Mesh(this.anticipationParticles.geometry, material)
            mesh.position.copy(coordinates)
            mesh.rotation.y = rng() * Math.PI * 2
            mesh.count = this.anticipationParticles.count
            this.game.scene.add(mesh)

            return mesh
        }

        if(this.game.debug.active)
        {
            const debugPanel = this.debugPanel.addFolder({ title: 'Anticipation' })
            debugPanel
                .addBinding(this.anticipationParticles, 'duration', { min: 0, max: 10, step: 0.01 })
                .on('change', () => { durationUniform.value = this.anticipationParticles.duration })
            debugPanel.addBinding(scaleUniform, 'value', { label: 'scale', min: 0, max: 1, step: 0.001 })
            debugPanel.addBinding(elevationUniform, 'value', { label: 'elevation', min: 0, max: 5, step: 0.01 })
        }
    }

    setArc()
    {
        this.arc = {}
        this.arc.duration = 3

        // Geometry
        const points = []
        const pointsCount = 15
        const height = 15
        const interY = height / (pointsCount - 1)

        for(let i = 0; i < pointsCount; i++)
        {
            const point = new THREE.Vector3(
                (rng() - 0.5) * 1,
                i * interY,
                (rng() - 0.5) * 1
            )
            points.push(point)
        }

        this.arc.geometry = new LineGeometry(points)

        // Uniforms
        const thicknessUniform = uniform(0.1)
        const easeOutUniform = uniform(5)
        const driftAmplitudeUniform = uniform(1)

        // Vertex Node
        this.arc.vertexNode = Fn(([_startTime]) =>
        {
            const ratio = attribute('ratio')
            const tipness = step(ratio, 0.01)
            const localTime = this.game.ticker.elapsedScaledUniform.sub(_startTime)
            const timeProgress = min(localTime.div(this.arc.duration), 1)
            
            const newPosition = positionGeometry.toVar()
            newPosition.xz.mulAssign(timeProgress.oneMinus().pow(easeOutUniform).oneMinus().mul(tipness.oneMinus()).mul(driftAmplitudeUniform).add(1))

            const worldPosition = modelWorldMatrix.mul(vec4(newPosition, 1))
            const toCamera = worldPosition.xyz.sub(cameraPosition).normalize()

            const nextPosition = positionGeometry.add(attribute('direction'))
            const nextWorldPosition = modelWorldMatrix.mul(vec4(nextPosition, 1))
            const nextDelta = nextWorldPosition.xyz.sub(worldPosition.xyz).normalize()
            const tangent = cross(nextDelta, toCamera).normalize()
            
            const ratioThickness = ratio.mul(10).min(1)
            const timeThickness = timeProgress.oneMinus()
            const finalThickness = mul(thicknessUniform, ratioThickness, timeThickness)

            const sideStep = floor(vertexIndex.toFloat().mul(3).sub(2).div(3).mod(2)).sub(0.5)
            const sideOffset = tangent.mul(sideStep.mul(finalThickness))
            
            worldPosition.addAssign(vec4(sideOffset, 0))

            const viewPosition = cameraViewMatrix.mul(worldPosition)
            return cameraProjectionMatrix.mul(viewPosition)
        })

        // Create
        this.arc.create = (coordinates, rng) =>
        {
            // Uniforms
            const startTime = uniform(this.game.ticker.elapsedScaled)

            // Material
            const material = new THREE.MeshBasicNodeMaterial({ wireframe: false })
            material.colorNode = this.materialReference.colorNode
            material.vertexNode = this.arc.vertexNode(startTime)

            const mesh = new THREE.Mesh(this.arc.geometry, material)
            mesh.position.copy(coordinates)
            mesh.rotation.y = rng() * Math.PI * 2
            this.game.scene.add(mesh)
            
            return mesh
        }

        if(this.game.debug.active)
        {
            const debugPanel = this.debugPanel.addFolder({ title: 'Arc' })
            debugPanel.addBinding(this.arc, 'duration', { min: 0, max: 10, step: 0.01 })
            debugPanel.addBinding(easeOutUniform, 'value', { label: 'easeOut', min: 1, max: 10, step: 1 })
            debugPanel.addBinding(driftAmplitudeUniform, 'value', { label: 'driftAmplitude', min: 0, max: 3, step: 0.001 })
            debugPanel.addBinding(thicknessUniform, 'value', { label: 'thickness', min: 0, max: 1, step: 0.001 })
        }
    }

    setExplosionParticles()
    {
        this.explosionParticles = {}
        this.explosionParticles.count = 128
        this.explosionParticles.duration = 4
        this.explosionParticles.fallAmplitude = 1
        
        // Buffers
        const positionArray = new Float32Array(this.explosionParticles.count * 3)
        const scaleArray = new Float32Array(this.explosionParticles.count)

        for(let i = 0; i < this.explosionParticles.count; i++)
        {
            const i3 = i * 3
            const spherical = new THREE.Spherical(
                rng(),
                rng() * 0.5 * Math.PI,
                rng() * Math.PI * 2
            )
            const position = new THREE.Vector3().setFromSpherical(spherical)
            positionArray[i3 + 0] = position.x
            positionArray[i3 + 1] = position.y
            positionArray[i3 + 2] = position.z

            scaleArray[i] = rng() * 0.75 + 0.25
        }

        this.explosionParticles.positionAttribute = instancedArray(positionArray, 'vec3').toAttribute()
        this.explosionParticles.scaleAttribute = instancedArray(scaleArray, 'float').toAttribute()

        // Geometry
        this.explosionParticles.geometry = new THREE.PlaneGeometry()

        // Uniforms
        const scaleUniform = uniform(0.1)
        const radiusUniform = uniform(3)
        const easeOutUniform = uniform(8)

        // Position node
        this.explosionParticles.positionNode = Fn(([_startTime]) =>
        {
            const localTime = this.game.ticker.elapsedScaledUniform.sub(_startTime)
            const timeProgress = min(localTime.div(float(this.explosionParticles.duration).mul(0.75)), 1)
            
            const newPosition = this.explosionParticles.positionAttribute.toVar()
            newPosition.mulAssign(timeProgress.oneMinus().pow(easeOutUniform).oneMinus().mul(radiusUniform))

            return newPosition
        })

        // Scale node
        this.explosionParticles.scaleNode = Fn(([_startTime]) =>
        {
            const localTime = this.game.ticker.elapsedScaledUniform.sub(_startTime)
            const timeScale = localTime.div(this.explosionParticles.duration).oneMinus().max(0)
            const finalScale = this.explosionParticles.scaleAttribute.mul(scaleUniform).mul(timeScale)
            return finalScale
        })

        // Create
        this.explosionParticles.create = (coordinates, rng) =>
        {
            const startTime = uniform(this.game.ticker.elapsedScaled)
        
            const material = new THREE.SpriteNodeMaterial()
            material.colorNode = this.materialReference.colorNode
            material.positionNode = this.explosionParticles.positionNode(startTime)
            material.scaleNode = this.explosionParticles.scaleNode(startTime)
            
            const mesh = new THREE.Mesh(this.explosionParticles.geometry, material)
            mesh.position.copy(coordinates)
            mesh.count = this.explosionParticles.count
            mesh.rotation.y = rng() * Math.PI * 2
            this.game.scene.add(mesh)

            gsap.to(mesh.position, { y: - this.explosionParticles.fallAmplitude, duration: this.explosionParticles.duration })
            
            return mesh
        }

        if(this.game.debug.active)
        {
            const debugPanel = this.debugPanel.addFolder({ title: 'Explosion' })
            debugPanel.addBinding(this.explosionParticles, 'duration', { min: 0, max: 10, step: 0.01 })
            debugPanel.addBinding(easeOutUniform, 'value', { label: 'easeOut', min: 1, max: 10, step: 1 })
            debugPanel.addBinding(scaleUniform, 'value', { label: 'scale', min: 0, max: 1, step: 0.001 })
            debugPanel.addBinding(radiusUniform, 'value', { label: 'radius', min: 0, max: 10, step: 0.001 })
            debugPanel.addBinding(this.explosionParticles, 'fallAmplitude', { min: 0, max: 2, step: 0.001 })
        }
    }

    createRandom(rng)
    {
        const focusPointPosition = this.game.view.focusPoint.position
        this.create(
            new THREE.Vector3(
                focusPointPosition.x + (rng() - 0.5) * this.game.view.optimalArea.radius * 2,
                0,
                focusPointPosition.z + (rng() - 0.5) * this.game.view.optimalArea.radius * 2
            ),
            rng
        )
    }

    create(coordinates, rng)
    {
        const disposables = []
        
        // Anticipation
        disposables.push(this.anticipationParticles.create(coordinates, rng))

        gsap.delayedCall(this.anticipationParticles.duration, () =>
        {
            // Sound
            this.sounds.near[Math.floor(Math.random() * this.sounds.near.length)].play(coordinates)

            // Game explosion
            const vehicleHit = this.game.explosions.explode(coordinates, 7, 4, true)

            if(this.game.reveal.step === 2 && vehicleHit)
                this.game.achievements.setProgress('lightning', 1)
            
            // Arc
            disposables.push(this.arc.create(coordinates, rng))

            // Explosion particles
            disposables.push(this.explosionParticles.create(coordinates, rng))

            // Wait and destroy
            const duration = Math.max(this.arc.duration, this.explosionParticles.duration)
            gsap.delayedCall(duration, () =>
            {
                for(const disposable of disposables)
                {
                    disposable.removeFromParent()
                    disposable.material.dispose()
                }
            })
        })
    }

    update()
    {
        const currentSecond = Math.floor(Date.now() / 1000)

        if(currentSecond !== this.currentSecond)
        {
            this.currentSecond = currentSecond

            this.hitChancesBinding.update()

            const rng = alea(this.currentSecond)

            // Normal lightning
            if(rng() < this.hitChances)
                this.createRandom(rng)

            // Distant thunder
            else
            {
                const rng = alea(this.currentSecond + 999)
                if(rng() < this.hitChances)
                {
                    this.sounds.distant[Math.floor(Math.random() * this.sounds.distant.length)].play()
                }
            }
        }
    }
}