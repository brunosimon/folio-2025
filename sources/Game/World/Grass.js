import * as THREE from 'three/webgpu'
import { Game } from '../Game.js'
import { mul, max, step, output, color, sin, smoothstep, mix, matcapUV, float, mod, texture, transformNormalToView, uniformArray, varying, vertexIndex, rotateUV, cameraPosition, vec4, atan, vec3, vec2, modelWorldMatrix, Fn, attribute, uniform, normalWorld } from 'three/tsl'

export class Grass
{
    constructor()
    {
        this.game = Game.getInstance()

        this.subdivisions = 280
        const halfExtent = this.game.view.optimalArea.radius
        this.size = halfExtent * 2
        this.count = this.subdivisions * this.subdivisions
        this.fragmentSize = this.size / this.subdivisions

        this.surface = this.size * this.size
        this.surfaceIdeal = 2000
        this.surfaceOverflow = Math.max(0, this.surface - this.surfaceIdeal) / this.surfaceIdeal

        this.setGeometry()
        this.setMaterial()
        this.setMesh()

        this.game.ticker.events.on('tick', () =>
        {
            this.update()
        }, 9)

        // Resize
        this.game.viewport.events.on('throttleChange', () =>
        {
            const halfExtent = this.game.view.optimalArea.radius
            this.size = halfExtent * 2
            this.surface = this.size * this.size
            this.surfaceOverflow = Math.max(0, this.surface - this.surfaceIdeal) / this.surfaceIdeal
            
            this.sizeUniform.value = this.size
            this.bladeWidth.value = 0.1 * (1 + this.surfaceOverflow * 0.4)
            this.bladeHeight.value = 0.6 * (1 + this.surfaceOverflow * 0.4)

            this.geometry.dispose()
            this.setGeometry()
            this.mesh.geometry = this.geometry
        }, 2)
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
        // this.groundDataDelta = uniform(new THREE.Vector2())

        const vertexLoopIndex = varying(vertexIndex.toFloat().mod(3))
        const tipness = varying(vertexLoopIndex.step(0.5))
        const wind = varying(vec2())
        const bladePosition = varying(vec2())

        this.bladeWidth = uniform(0.1 * (1 + this.surfaceOverflow * 0.5))
        this.bladeHeight = uniform(0.6 * (1 + this.surfaceOverflow * 0.5))
        this.bladeHeightRandomness = uniform(0.6)
        this.sizeUniform = uniform(this.size)

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

        const hiddenThreshold = 0.1
        // const terrainUv = this.game.terrainData.worldPositionToUvNode(bladePosition)
        const terrainData = this.game.terrainData.terrainDataNode(bladePosition)
        const terrainDataGrass = terrainData.g.smoothstep(0.4, 0.6)
        const hidden = step(terrainData.g.sub(0.4), hiddenThreshold)

        this.material.positionNode = Fn(() =>
        {
            // Blade position
            const position = attribute('position')

            const loopPosition = position.sub(this.center)
            const halfSize = this.sizeUniform.mul(0.5).toVar()
            loopPosition.x.assign(mod(loopPosition.x.add(halfSize), this.sizeUniform).sub(halfSize))
            loopPosition.y.assign(mod(loopPosition.y.add(halfSize), this.sizeUniform).sub(halfSize))

            const position3 = vec3(loopPosition.x, 0, loopPosition.y).add(vec3(this.center.x, 0, this.center.y))
            const worldPosition = modelWorldMatrix.mul(position3).toVar()
            bladePosition.assign(worldPosition.xz)

            // Height
            const heightVariation = texture(this.game.noises.others, bladePosition.mul(0.0321)).r.add(0.5)
            const height = this.bladeHeight
                .mul(this.bladeHeightRandomness.mul(attribute('heightRandomness')).add(this.bladeHeightRandomness.oneMinus()))
                .mul(heightVariation)
                .mul(terrainDataGrass)
                .toVar()

            // Shape
            const shape = vec3(
                bladeShape.element(vertexLoopIndex.mod(3).mul(2)).mul(this.bladeWidth).mul(terrainDataGrass),
                bladeShape.element(vertexLoopIndex.mod(3).mul(2).add(1)).mul(height),
                0
            )

            // Vertex positioning
            const vertexPosition = position3.add(shape)

            // Vertex rotation
            const angleToCamera = atan(worldPosition.z.sub(cameraPosition.z), worldPosition.x.sub(cameraPosition.x)).add(- Math.PI * 0.5)
            vertexPosition.xz.assign(rotateUV(vertexPosition.xz, angleToCamera, worldPosition.xz))

            // Wind
            wind.assign(this.game.wind.offsetNode([worldPosition.xz]).mul(tipness).mul(height).mul(2))
            vertexPosition.addAssign(vec3(wind.x, 0, wind.y))

            // Hide (far above)
            vertexPosition.y.addAssign(hidden.mul(100))

            return vertexPosition
        })()

        // Shadow
        const totalShadows = this.game.lighting.addTotalShadowToMaterial(this.material)

        let baseColor = this.game.terrainData.colorNode(terrainData)
        // let baseColor = vec3(0.8)

        this.material.normalNode = vec3(0, 1, 0)
        
        const lightenColor = baseColor.mul(this.game.lighting.colorUniform.mul(this.game.lighting.intensityUniform))

        const coreShadowMix = this.material.normalNode.dot(this.game.lighting.directionUniform).smoothstep(this.game.lighting.coreShadowEdgeHigh, this.game.lighting.coreShadowEdgeLow)
        const castShadowMix = totalShadows.oneMinus()
        const tipnessShadowMix = tipness.oneMinus().mul(terrainDataGrass)
        const combinedShadowMix = max(max(coreShadowMix, castShadowMix), tipnessShadowMix).clamp(0, 1)
        
        const shadowColor = baseColor.rgb.mul(this.game.lighting.shadowColor).rgb
        const shadedColor = mix(lightenColor, shadowColor, combinedShadowMix)

        const foggedColor = this.game.fog.strength.mix(shadedColor, this.game.fog.color)

        this.material.outputNode = vec4(foggedColor, 1)
        // this.material.outputNode = vec4(this.game.lighting.lightOutputNodeBuilder(baseColor, normalWorld), this.game.lighting.addTotalShadowToMaterial(this.material))
        
        // Debug
        if(this.game.debug.active)
        {
            const debugPanel = this.game.debug.panel.addFolder({
                title: '🌱 Grass',
                expanded: false,
            })

            debugPanel.addBinding(this.bladeWidth, 'value', { label: 'this.bladeWidth', min: 0, max: 1, step: 0.001 })
            debugPanel.addBinding(this.bladeHeight, 'value', { label: 'this.bladeHeight', min: 0, max: 2, step: 0.001 })
            debugPanel.addBinding(this.bladeHeightRandomness, 'value', { label: 'this.bladeHeightRandomness', min: 0, max: 1, step: 0.001 })
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
        this.center.value.set(this.game.view.optimalArea.position.x, this.game.view.optimalArea.position.z)

        // // Ground data delta
        // this.groundDataDelta.value.set(
        //     this.center.value.x - this.game.groundData.focusPoint.x,
        //     this.center.value.y - this.game.groundData.focusPoint.y
        // )
    }
}