import * as THREE from 'three'
import { Game } from '../Game.js'
import { output, color, sin, time, smoothstep, mix, matcapUV, float, mod, texture, transformNormalToView, uniformArray, varying, vertexIndex, rotateUV, cameraPosition, vec4, atan2, vec3, vec2, modelWorldMatrix, Fn, attribute, uniform } from 'three'
import getWind from '../tsl/getWind.js'

export class Grass
{
    constructor()
    {
        this.game = new Game()

        this.subdivisions = 500
        this.size = 80
        this.count = this.subdivisions * this.subdivisions
        this.fragmentSize = this.size / this.subdivisions

        this.setGeometry()
        this.setMaterial()
        this.setMesh()

        this.game.time.events.on('tick', () =>
        {
            this.update()
        }, 6)
    }

    setGeometry()
    {
        const position = new Float32Array(this.count * 3 * 2)
        const heightRandomness = new Float32Array(this.count * 3)

        for(let iX = 0; iX < this.subdivisions; iX++)
        {
            const fragmentX = (iX / this.subdivisions - 0.5) * this.size + this.fragmentSize * 0.5
            
            for(let iZ = 0; iZ < this.subdivisions; iZ++)
            {
                const fragmentZ = (iZ / this.subdivisions - 0.5) * this.size + this.fragmentSize * 0.5

                const i = (iX * this.subdivisions + iZ)
                const i3 = i * 3
                const i6 = i * 6

                // Center of the blade
                const positionX = fragmentX + (Math.random() - 0.5) * this.fragmentSize
                const positionZ = fragmentZ + (Math.random() - 0.5) * this.fragmentSize

                position[i6    ] = positionX
                position[i6 + 1] = positionZ

                position[i6 + 2] = positionX
                position[i6 + 3] = positionZ

                position[i6 + 4] = positionX
                position[i6 + 5] = positionZ

                // Randomness
                heightRandomness[i3    ] = Math.random()
                heightRandomness[i3 + 1] = Math.random()
                heightRandomness[i3 + 2] = Math.random()
            }
        }
        
        this.geometry = new THREE.BufferGeometry()
        this.geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1)
        this.geometry.setAttribute('position', new THREE.Float32BufferAttribute(position, 2))
        this.geometry.setAttribute('heightRandomness', new THREE.Float32BufferAttribute(heightRandomness, 1))
    }

    setMaterial()
    {
        this.material = new THREE.MeshLambertMaterial()
        this.center = uniform(new THREE.Vector2())
        this.groundDataDelta = uniform(new THREE.Vector2())

        const vertexLoopIndex = varying(vertexIndex.toFloat().mod(3))
        const tipness = varying(vertexLoopIndex.step(0.5))
        const wind = varying(vec2())
        const bladePosition = varying(vec2())

        const bladeWidth = uniform(0.1)
        const bladeHeight = uniform(0.6)
        const bladeHeightRandomness = uniform(0.6)
        const bladeShape = uniformArray([

                // Tip
                0,
                1,

                // Left side
                1,
                0,

                // Right side
                - 1,
                0,
        ])

        this.material.positionNode = Fn(() =>
        {
            // Blade position
            const position = attribute('position')

            const loopPosition = position.sub(this.center)
            const halfSize = float(this.size).mul(0.5).toVar()
            loopPosition.x.assign(mod(loopPosition.x.add(halfSize), this.size).sub(halfSize))
            loopPosition.y.assign(mod(loopPosition.y.add(halfSize), this.size).sub(halfSize))

            const position3 = vec3(loopPosition.x, 0, loopPosition.y).add(vec3(this.center.x, 0, this.center.y))
            const worldPosition = modelWorldMatrix.mul(position3).toVar()
            bladePosition.assign(worldPosition.xz)

            // Wheel tracks
            const groundDataColor = texture(
                this.game.groundData.renderTarget.texture,
                worldPosition.xz.sub(- this.game.groundData.halfSize).sub(this.center).add(this.groundDataDelta).div(this.game.groundData.size)
            )
            const wheelsTracksHeight = groundDataColor.a.oneMinus().toVar()

            // Height
            const heightVariation = texture(this.game.resources.noisesTexture, bladePosition.mul(0.0321)).add(0.5)
            const height = bladeHeight
                .mul(bladeHeightRandomness.mul(attribute('heightRandomness')).add(bladeHeightRandomness.oneMinus()))
                .mul(heightVariation.r)
                .mul(wheelsTracksHeight)

            // Shape
            const shape = vec3(
                bladeShape.element(vertexLoopIndex.mod(3).mul(2)).mul(bladeWidth),
                bladeShape.element(vertexLoopIndex.mod(3).mul(2).add(1)).mul(height),
                0
            )

            // Vertex positioning
            const vertexPosition = position3.add(shape)

            // Vertex rotation
            const angleToCamera = atan2(worldPosition.z.sub(cameraPosition.z), worldPosition.x.sub(cameraPosition.x)).add(- Math.PI * 0.5)
            vertexPosition.xz.assign(rotateUV(vertexPosition.xz, angleToCamera, worldPosition.xz))

            // Wind
            wind.assign(getWind([this.game.resources.noisesTexture, worldPosition.xz]).mul(tipness).mul(height).mul(2))
            vertexPosition.addAssign(vec3(wind.x, 0, wind.y))

            return vertexPosition
        })()

        // Normal
        const normal = vec3(wind.y.mul(-10), 1, wind.y.mul(-10)).normalize()
        this.material.normalNode = transformNormalToView(normal)

        // Shadow
        const totalShadows = this.game.materials.getTotalShadow(this.material)

        // Output
        const colorA = uniform(color('#72a51e'))
        const colorB = uniform(color('#e0e239'))
        const colorVariation = varying(texture(this.game.resources.noisesTexture, bladePosition.mul(0.02)).smoothstep(0.2, 0.8))

        const colorBase = colorVariation.mix(colorA, colorB).rgb
            .mul(this.game.lighting.colorUniform.mul(this.game.lighting.intensityUniform))
            .mul(tipness)
            .varying()
        
        const colorShadow = colorBase.mul(this.game.materials.shadowColor).rgb.varying()
        const shadowMix = totalShadows.oneMinus()

        this.material.outputNode = vec4(mix(colorBase, colorShadow, shadowMix), 1)

        // Debug
        if(this.game.debug.active)
        {
            const debugPanel = this.game.debug.panel.addFolder({
                title: '🌱 Grass',
                expanded: true,
            })

            debugPanel.addBinding({ color: colorA.value.getHex(THREE.SRGBColorSpace) }, 'color', { label: 'colorA', view: 'color' })
                .on('change', tweak => { colorA.value.set(tweak.value) })
            debugPanel.addBinding({ color: colorB.value.getHex(THREE.SRGBColorSpace) }, 'color', { label: 'colorB', view: 'color' })
                .on('change', tweak => { colorB.value.set(tweak.value) })
            debugPanel.addBinding(bladeWidth, 'value', { label: 'bladeWidth', min: 0, max: 1, step: 0.001 })
            debugPanel.addBinding(bladeHeight, 'value', { label: 'bladeHeight', min: 0, max: 2, step: 0.001 })
            debugPanel.addBinding(bladeHeightRandomness, 'value', { label: 'bladeHeightRandomness', min: 0, max: 1, step: 0.001 })
        }
    }

    setMesh()
    {
        this.mesh = new THREE.Mesh(this.geometry, this.material)
        this.mesh.frustumCulled = false
        this.mesh.receiveShadow = true
        this.game.scene.add(this.mesh)
    }

    update()
    {
        // Move grass slightly forward
        const offset = new THREE.Vector2(this.game.view.spherical.offset.x, this.game.view.spherical.offset.z).setLength(this.size / 2).negate()
        this.center.value.set(
            this.game.view.position.x,
            this.game.view.position.z
        ).add(offset)

        // Ground data delta
        this.groundDataDelta.value.set(
            this.center.value.x - this.game.groundData.focusPoint.x,
            this.center.value.y - this.game.groundData.focusPoint.y
        )
    }
}