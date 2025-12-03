import * as THREE from 'three/webgpu'
import { Game } from '../Game.js'
import { attribute, clamp, color, float, Fn, fract, hash, instancedArray, instanceIndex, max, mod, normalWorld, positionGeometry, rotateUV, sin, smoothstep, step, texture, uniform, vec2, vec3, vec4 } from 'three/tsl'
import { MeshDefaultMaterial } from '../Materials/MeshDefaultMaterial.js'
import { lerp, remap, remapClamp } from '../utilities/maths.js'

export class RainLines
{
    constructor()
    {
        this.game = Game.getInstance()

        this.count = Math.pow(2, 11)
        this.speed = 0.25
        this.achievementAchieved = this.game.achievements.groups.get('weatherRain')?.items[0].achieved

        this.setGeometry()
        this.setMaterial()
        this.setMesh()

        // Tick
        this.game.ticker.events.on('tick', () =>
        {
            this.update()
        }, 10)

        // Resize
        this.game.viewport.events.on('throttleChange', () =>
        {
            this.size.value = this.game.view.optimalArea.radius * 2
        }, 2)

        // Debug
        if(this.game.debug.active)
        {
            this.debugPanel = this.game.debug.panel.addFolder({
                title: '🌧️ Rain',
                expanded: false,
            })
            this.debugPanel.addBinding(this.elevation, 'value', { label: 'elevation', min: 0, max: 50, step: 0.1 })
            this.debugPanel.addBinding(this.thickness, 'value', { label: 'thickness', min: 0, max: 0.1, step: 0.001 })
        }

        // Binding
        this.visibleRatioBinding = this.game.debug.addManualBinding(
            this.debugPanel,
            this.visibleRatio,
            'value',
            { label: 'visibleRatio', min: 0, max: 1, step: 0.001 },
            () =>
            {
                return Math.pow(this.game.weather.rain.value, 2)
            }
        )

        this.lengthRatioBinding = this.game.debug.addManualBinding(
            this.debugPanel,
            this.length,
            'value',
            { label: 'length', min: 0, max: 10, step: 0.001 },
            () =>
            {
                const baseLength = remapClamp(this.game.weather.rain.value, 0, 1, 1, 3)

                const snowRatio = 1 - Math.pow(1 - Math.max(this.game.weather.snow.value, 0), 4)
                const snowLength = 0.03

                return lerp(baseLength, snowLength, snowRatio)
            }
        )

        this.speedRatioBinding = this.game.debug.addManualBinding(
            this.debugPanel,
            this,
            'speed',
            { label: 'speed', min: 0, max: 1, step: 0.001 },
            () =>
            {
                const baseSpeed = remapClamp(this.game.weather.rain.value, 0, 1, 0.2, 0.4)

                const snowRatio = 1 - Math.pow(1 - Math.max(this.game.weather.snow.value, 0), 4)
                const snowSpeed = 0.05

                return lerp(baseSpeed, snowSpeed, snowRatio)
            }
        )

        this.inclineRatioBinding = this.game.debug.addManualBinding(
            this.debugPanel,
            this.incline,
            'value',
            { label: 'incline', min: 0, max: 1, step: 0.001 },
            () =>
            {
                return remapClamp(this.game.weather.wind.value, 0, 1, 0.1, 0.4)
            }
        )
    }

    setGeometry()
    {
        const positionArray = new Float32Array(this.count * 4 * 3)
        const offsetArray = new Float32Array(this.count * 4 * 2)
        const randomArray = new Float32Array(this.count * 4)
        const indexArray = new Uint16Array(this.count * 6)

        for(let lineIndex = 0; lineIndex < this.count; lineIndex++)
        {
            const x = Math.random()
            const y = 0
            const z = Math.random()
            const random = Math.random()

            for(let vertexIndex = 0; vertexIndex < 4; vertexIndex++)
            {
                // Position
                const positionIndex = (lineIndex * 4 + vertexIndex) * 3

                positionArray[positionIndex + 0] = x
                positionArray[positionIndex + 1] = y
                positionArray[positionIndex + 2] = z

                // Offset
                const offsetIndex = (lineIndex * 4 + vertexIndex) * 2
                offsetArray[offsetIndex + 0] = 0
                offsetArray[offsetIndex + 1] = 0

                if(vertexIndex === 0 || vertexIndex === 1)
                    offsetArray[offsetIndex + 0] = 1

                if(vertexIndex === 0 || vertexIndex === 3)
                    offsetArray[offsetIndex + 1] = 1

                // Random
                randomArray[lineIndex * 4 + vertexIndex] = random
            }

            // Index
            indexArray[lineIndex * 6 + 0] = lineIndex * 4 + 0
            indexArray[lineIndex * 6 + 1] = lineIndex * 4 + 3
            indexArray[lineIndex * 6 + 2] = lineIndex * 4 + 2

            indexArray[lineIndex * 6 + 3] = lineIndex * 4 + 2
            indexArray[lineIndex * 6 + 4] = lineIndex * 4 + 1
            indexArray[lineIndex * 6 + 5] = lineIndex * 4 + 0
        }

        this.geometry = new THREE.BufferGeometry()
        this.geometry.setAttribute('position', new THREE.Float32BufferAttribute(positionArray, 3))
        this.geometry.setAttribute('offset', new THREE.Float32BufferAttribute(offsetArray, 2))
        this.geometry.setAttribute('random', new THREE.Float32BufferAttribute(randomArray, 1))
        this.geometry.index = new THREE.Uint16BufferAttribute(indexArray, 1)
        
    }

    setMaterial()
    {
        this.material = new MeshDefaultMaterial({
            // side: THREE.BackSide,
            normalNode: vec3(0, 1, 0),
            transparent: true,
            wireframe: false,

            hasCoreShadows: true,
            hasDropShadows: false,
            hasLightBounce: false,
            hasFog: false,
            hasWater: false,
        })

        this.thickness = uniform(0.015)
        this.elevation = uniform(20)
        this.incline = uniform(0.2)
        this.size = uniform(this.game.view.optimalArea.radius * 2)
        this.center = uniform(vec2())
        this.length = uniform(2)
        this.localTime = uniform(0)
        this.visibleRatio = uniform(0)

        this.material.positionNode = Fn(() =>
        {
            const newPosition = attribute('position').toVar()
            const offset = attribute('offset')
            const random = attribute('random')
            const tangent = vec2(0.707, -0.707)

            // Loop
            newPosition.xz.mulAssign(this.size)
            newPosition.xz.subAssign(this.center)       
            const halfSize = this.size.mul(0.5)
            newPosition.x.assign(mod(newPosition.x.add(halfSize), this.size).sub(halfSize))
            newPosition.z.assign(mod(newPosition.z.add(halfSize), this.size).sub(halfSize))
            newPosition.xz.addAssign(this.center)

            // Thickness
            newPosition.xz.addAssign(tangent.mul(offset.x.mul(this.thickness)))

            // Elevation
            const progress = this.localTime.add(random).mod(1)
            newPosition.y.assign(this.elevation.add(this.length)) // Move to the top + length
            newPosition.y.subAssign(this.length.mul(offset.y.oneMinus())) // Offset the bottom part
            newPosition.y.subAssign(progress.mul(this.elevation.add(this.length))) // Move down with progress
            newPosition.y.assign(newPosition.y.clamp(0, this.elevation)) // Clamp between top and bottom

            // Visible ratio
            const visible = step(this.visibleRatio, fract(random.mul(99)))
            newPosition.y.addAssign(visible.mul(99))

            // Incline
            newPosition.xz.addAssign(tangent.mul(newPosition.y.mul(this.incline).mul(-1)))

            return newPosition
        })()
    }

    setMesh()
    {
        this.mesh = new THREE.Mesh(this.geometry, this.material)
        this.mesh.position.y = - 0.3
        this.mesh.frustumCulled = false
        this.mesh.renderOrder = 1
        this.game.scene.add(this.mesh)
    }

    update()
    {
        // Apply weather
        this.visibleRatioBinding.update()
        this.lengthRatioBinding.update()
        this.speedRatioBinding.update()
        this.inclineRatioBinding.update()

        this.mesh.visible = this.visibleRatio.value > 0.00001

        if(this.mesh.visible)
        {
            this.center.value.set(this.game.view.optimalArea.position.x, this.game.view.optimalArea.position.z)
            this.localTime.value += this.game.ticker.deltaScaled * this.speed

            // Achievement
            if(!this.achievementAchieved && this.game.reveal.step === 2 && this.visibleRatio.value > 0.04 && this.length.value > 0.2)
            {
                this.achievementAchieved = true
                this.game.achievements.setProgress('weatherRain', 1)
            }
        }
        
        // if(!this.mesh.visible)
        //     return

        // const optimalAreaPosition = this.game.view.optimalArea.position
        // const cameraPosition = this.game.view.defaultCamera.position
        // const focusPoint = optimalAreaPosition.clone().lerp(cameraPosition, 0.5)
        // this.focusPoint.value.set(focusPoint.x, focusPoint.z)

        // this.game.rendering.renderer.computeAsync(this.updateCompute)
    }
}