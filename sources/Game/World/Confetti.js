import * as THREE from 'three/webgpu'
import { Game } from '../Game.js'
import { MeshDefaultMaterial } from '../Materials/MeshDefaultMaterial.js'
import { add, cameraProjectionMatrix, cameraViewMatrix, color, cos, float, Fn, instance, instancedArray, instanceIndex, modelWorldMatrix, positionGeometry, positionLocal, positionWorld, remapClamp, sin, uniform, uniformArray, vec3, vec4 } from 'three/tsl'
import gsap from 'gsap'

export class Confetti
{
    constructor()
    {
        this.game = Game.getInstance()

        // Debug
        if(this.game.debug.active)
        {
            this.debugPanel = this.game.debug.panel.addFolder({
                title: '🎉 Confetti',
                expanded: false,
            })
        }

        this.pool = []
        this.poolSize = 4
        this.count = 500
        this.geometry = new THREE.PlaneGeometry(0.1, 0.2)

        this.colorsUniform = uniformArray([
            new THREE.Color('#ffbde7'),
            new THREE.Color('#eeff95'),
            new THREE.Color('#84ffb5'),
        ])

        this.createPool()

        // Debug
        if(this.game.debug.active)
        {
            this.game.debug.addThreeColorBinding(this.debugPanel, this.colorsUniform.array[0], 'color0')
            this.game.debug.addThreeColorBinding(this.debugPanel, this.colorsUniform.array[1], 'color1')
            this.game.debug.addThreeColorBinding(this.debugPanel, this.colorsUniform.array[2], 'color2')
            this.debugPanel.addButton({ title: 'pop' }).on('click', () => { this.pop(this.game.player.position) })
        }
    }

    createPool()
    {
        for(let i = 0; i < this.poolSize; i++)
        {
            const confetti = {}
            confetti.available = true

            const randomProgressArray = new Float32Array(this.count)
            const angleArray = new Float32Array(this.count)
            for(let i = 0; i < this.count; i++)
            {
                randomProgressArray[i] = Math.random()
                angleArray[i] = Math.random() * Math.PI * 2
            }
            const randomProgressBuffer = instancedArray(randomProgressArray, 'float').toAttribute()
            const angleBuffer = instancedArray(angleArray, 'float').toAttribute()

            const colorNode = Fn(() =>
            {
                return this.colorsUniform.element(instanceIndex.mod(3))
            })()
            
            const material = new MeshDefaultMaterial({
                colorNode: colorNode,
                hasCoreShadows: true,
                hasDropShadows: false,
                hasLightBounce: false,
                hasFog: true,
                hasWater: false
            })

            confetti.progressUniform = uniform(0)
            confetti.amplitudeUniform = uniform(0.7)
            confetti.radiusUniform = uniform(2)
            confetti.elevationUniform = uniform(6)
            const rest = confetti.amplitudeUniform.oneMinus()

            material.positionNode = Fn(() =>
            {
                // Realize nodes so that the shadow updates too
                instance(this.count, instanceMatrix).toStack()

                const basePosition = positionLocal

                // Progress
                const progressStart = rest.mul(randomProgressBuffer)
                const progressEnd = progressStart.add(confetti.amplitudeUniform)
                const progress = remapClamp(confetti.progressUniform, progressStart, progressEnd, 0, 1).toVar()
                progress.assign(progress.oneMinus().pow(3).oneMinus())

                // Scale
                const scale = progress.sub(0.5).mul(2).abs().oneMinus().mul(20).min(1)
                basePosition.mulAssign(scale)

                // Position
                const baseX = sin(angleBuffer)
                const baseZ = cos(angleBuffer)

                const strength = randomProgressBuffer.mul(99).fract()
                const x = baseX.mul(progress).mul(strength).mul(confetti.radiusUniform)
                const z = baseZ.mul(progress).mul(strength).mul(confetti.radiusUniform)
                const y = progress.mul(2).oneMinus().pow(2).oneMinus().mul(strength).mul(confetti.elevationUniform)

                const finalPosition = vec3(basePosition.x.add(x), basePosition.y.add(y), basePosition.z.add(z))

                // Projection
                return finalPosition
            })()

            confetti.mesh = new THREE.InstancedMesh(this.geometry, material, this.count)
            confetti.mesh.visible = false
            confetti.mesh.castShadow = true

            const instanceMatrix = new THREE.InstancedBufferAttribute(new Float32Array(this.count * 16), 16)
            instanceMatrix.setUsage(THREE.StaticDrawUsage)
    
            for(let i = 0; i < this.count; i++)
            {
                const matrix = new THREE.Matrix4()

                const position = new THREE.Vector3(0, 0, 0)
                const quaternion = new THREE.Quaternion().random()
                const scale = new THREE.Vector3(1, 1, 1)//.setScalar(0.5 + Math.random() * 0.5)

                matrix.compose(position, quaternion, scale)

                matrix.toArray(instanceMatrix.array, i * 16)
            }

            confetti.mesh.position.y = 3

            this.game.worldContainer.add(confetti.mesh)

            if(this.game.debug.active)
            {
                this.debugPanel.addBinding(confetti.progressUniform, 'value', { label: 'confetti.progressUniform', min: 0, max: 1, step: 0.001 })
            }

            confetti.pop = (position, radius, elevation) =>
            {
                confetti.available = false

                confetti.mesh.visible = true
                confetti.mesh.position.copy(position)
                
                confetti.radiusUniform.value = radius
                confetti.elevationUniform.value = elevation

                gsap.fromTo(
                    confetti.progressUniform,
                    {
                        value: 0
                    },
                    {
                        value: 1,
                        duration: 5,
                        onComplete: () =>
                        {
                            confetti.available = true
                            confetti.mesh.visible = false
                        }
                    }
                )
            }

            this.pool.push(confetti)
        }
    }

    pop(position = null, radius = 4, elevation = 6)
    {
        const _position = position ?? new THREE.Vector3(this.game.player.position.x, 0, this.game.player.position.z)
        const availableConfetti = this.pool.find(confetti => confetti.available)

        if(availableConfetti)
            availableConfetti.pop(_position, radius, elevation)

        return availableConfetti
    }
}