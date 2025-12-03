import * as THREE from 'three/webgpu'
import { Game } from '../Game.js'
import { attribute, cameraNormalMatrix, color, cross, dot, float, Fn, hash, If, materialNormal, min, mix, modelNormalMatrix, modelViewMatrix, normalWorld, PI, PI2, positionGeometry, positionLocal, positionWorld, rotateUV, step, texture, time, uniform, uv, uvec4, varying, vec2, vec3, vec4, viewportSize } from 'three/tsl'
import { clamp, remapClamp } from '../utilities/maths.js'
import { MeshDefaultMaterial } from '../Materials/MeshDefaultMaterial.js'

export class Snow
{
    constructor()
    {
        this.game = Game.getInstance()

        this.achievementAchieved = this.game.achievements.groups.get('weatherSnow')?.items[0].achieved
        this.size = this.game.view.optimalArea.radius * 2
        this.halfSize = this.size * 0.5
        this.subdivisions = 256
        // this.size = 10
        // this.subdivisions = 3
        
        this.subdivisionSize = this.size / this.subdivisions

        // Debug
        if(this.game.debug.active)
        {
            this.debugPanel = this.game.debug.panel.addFolder({
                title: '⛇ Snow',
                expanded: false,
            })
        }
        
        this.setNodes()
        this.setSnowElevation()
        this.setGeometry()
        this.setMaterial()
        this.setMesh()

        this.game.ticker.events.on('tick', () =>
        {
            this.update()
        }, 10)
    }

    setNodes()
    {
        this.roundedPosition = uniform(vec2(0))
        this.tracksDelta = uniform(vec2(0))
        this.elevation = uniform(-1)
        this.noiseMultiplier = uniform(1)
        this.noise1Frequency = uniform(0.1)
        this.noise2Frequency = uniform(0.07)
        this.waterDropEdgeLow = uniform(0.185)
        this.waterDropEdgeHigh = uniform(0.235)
        this.waterDropAmplitude = uniform(1)

        // Base elevation
        const rainRatio = remapClamp(this.game.weather.rain.value, 0.05, 0.3, 0, 1) * remapClamp(this.game.weather.temperature.value, 0, -5, 0, 1)
        const meltRatio = remapClamp(this.game.weather.temperature.value, 0, 10, 0, -1)

        this.elevation.value = remapClamp(rainRatio + meltRatio, -1, 1, -1, 0.5)
        
        this.elevationNode = Fn(([position]) =>
        {
            const elevation = this.elevation.toVar()

            // Terrain
            // const terrainUv = this.game.terrain.worldPositionToUvNode(position.xy)
            const terrainData = this.game.terrain.terrainNode(position.xy)

            // Noise
            const noiseUv1 = position.mul(this.noise1Frequency).xy
            const noise1 = texture(this.game.noises.perlin, noiseUv1).r

            const noiseUv2 = position.mul(this.noise2Frequency).xy
            const noise2 = texture(this.game.noises.perlin, noiseUv2).r

            elevation.addAssign(noise1.mul(noise2).smoothstep(0, 1).mul(this.noiseMultiplier))

            // Wheel tracks
            const groundDataColor = texture(
                this.game.tracks.renderTarget.texture,
                position.xy.sub(- this.game.tracks.halfSize).sub(this.roundedPosition).add(this.tracksDelta).div(this.game.tracks.size)
            )

            const wheelsTracksHeight = groundDataColor.r.oneMinus()
            const chassisTracksHeight = groundDataColor.g.oneMinus().remapClamp(0.5, 1, 0.25, 1)
            const tracksHeight = min(wheelsTracksHeight, chassisTracksHeight)
            elevation.mulAssign(tracksHeight)

            // Water elevation
            elevation.addAssign(terrainData.b.remap(0, 1, 0, -2))

            return elevation
        })

        this.elevationBinding = this.game.debug.addManualBinding(
            this.debugPanel,
            this.elevation,
            'value',
            { label: 'elevation', min: -1, max: 1, step: 0.001 },
            () =>
            {
                const elevationStrength = this.game.weather.snow.value * Math.max(this.game.dayCycles.progressDelta, 0) * 10

                let newElevation = this.elevation.value + elevationStrength
                newElevation = clamp(newElevation, -1, 0.5)
                
                return newElevation
            }
        )
    }

    setSnowElevation()
    {
        this.snowElevation = {}

        const material = new THREE.MeshBasicNodeMaterial({ wireframe: false })
        const textureSize = this.subdivisions + 1

        material.outputNode = Fn(() =>
        {
            const position = uv().sub(0.5).mul(this.size + this.subdivisionSize).add(this.roundedPosition)
            const elevation = this.elevationNode(position)

            return vec4(elevation, 0, 0, 1)
        })()

        this.snowElevation.renderTarget = new THREE.RenderTarget(
            textureSize,
            textureSize,
            {
                depthBuffer: false,
                type: THREE.HalfFloatType,
                format: THREE.RedFormat,
                minFilter: THREE.LinearFilter,
                magFilter: THREE.LinearFilter,
                wrapS: THREE.ClampToEdgeWrapping,
                wrapT: THREE.ClampToEdgeWrapping
            }
        )
        this.snowElevation.texture = this.snowElevation.renderTarget.texture

        // Quad mesh
        this.snowElevation.quadMesh = new THREE.QuadMesh(material)
        
        // // Debug
        // const debugMaterial = new THREE.MeshBasicNodeMaterial({ map: this.snowElevation.renderTarget.texture, transparent: true, depthTest: false, depthWrite: false })
        // debugMaterial.vertexNode = Fn(() =>
        // {
        //     const ratio = viewportSize.x.div(viewportSize.y)
        //     const position = attribute('position').mul(vec3(1, ratio, 0)).mul(0.5).sub(vec3(0.75, 0.5, 0))
        //     return vec4(position, 1)
        // })()
     
        // const debugMesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), debugMaterial)
        
        // debugMesh.position.y = 5
        // debugMesh.position.x = - 3
        // debugMesh.frustumCulled = false
        // debugMesh.renderOrder = 1
        // this.game.scene.add(debugMesh)
    }

    setGeometry()
    {
        const positionArray = new Float32Array(this.subdivisions * this.subdivisions * 3 * 3 * 2)
        const pivotArray = new Float32Array(this.subdivisions * this.subdivisions * 2 * 3 * 2)

        const halfSubdivisionSize = this.subdivisionSize * 0.5
        const quad = [
            // Triangle 1
            halfSubdivisionSize,
            - halfSubdivisionSize,

            - halfSubdivisionSize,
            - halfSubdivisionSize,

            - halfSubdivisionSize,
            halfSubdivisionSize,

            // Triangle 2
            - halfSubdivisionSize,
            halfSubdivisionSize,

            halfSubdivisionSize,
            halfSubdivisionSize,

            halfSubdivisionSize,
            - halfSubdivisionSize,
        ]

        let i = 0
        for(let xIndex = 0; xIndex < this.subdivisions; xIndex++)
        {
            for(let zIndex = 0; zIndex < this.subdivisions; zIndex++)
            {
                const iPosition = i * 3 * 3 * 2
                const iPivot = i * 2 * 3 * 2

                const pivotX = (xIndex / (this.subdivisions - 1) - 0.5) * (this.size - this.subdivisionSize)
                const pivotZ = (zIndex / (this.subdivisions - 1) - 0.5) * (this.size - this.subdivisionSize)

                positionArray[iPosition + 0] = pivotX + quad[0]
                positionArray[iPosition + 1] = 0
                positionArray[iPosition + 2] = pivotZ + quad[1]
                positionArray[iPosition + 3] = pivotX + quad[2]
                positionArray[iPosition + 4] = 0
                positionArray[iPosition + 5] = pivotZ + quad[3]
                positionArray[iPosition + 6] = pivotX + quad[4]
                positionArray[iPosition + 7] = 0
                positionArray[iPosition + 8] = pivotZ + quad[5]

                positionArray[iPosition + 9 ] = pivotX + quad[6]
                positionArray[iPosition + 10] = 0
                positionArray[iPosition + 11] = pivotZ + quad[7]
                positionArray[iPosition + 12] = pivotX + quad[8]
                positionArray[iPosition + 13] = 0
                positionArray[iPosition + 14] = pivotZ + quad[9]
                positionArray[iPosition + 15] = pivotX + quad[10]
                positionArray[iPosition + 16] = 0
                positionArray[iPosition + 17] = pivotZ + quad[11]

                // pivotArray
                pivotArray[iPivot + 0] = pivotX
                pivotArray[iPivot + 1] = pivotZ
                pivotArray[iPivot + 2] = pivotX
                pivotArray[iPivot + 3] = pivotZ
                pivotArray[iPivot + 4] = pivotX
                pivotArray[iPivot + 5] = pivotZ

                pivotArray[iPivot + 6] = pivotX
                pivotArray[iPivot + 7] = pivotZ
                pivotArray[iPivot + 8] = pivotX
                pivotArray[iPivot + 9] = pivotZ
                pivotArray[iPivot + 10] = pivotX
                pivotArray[iPivot + 11] = pivotZ
                
                i++
            }
        }

        this.geometry = new THREE.BufferGeometry()
        this.geometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3))
        this.geometry.setAttribute('pivot', new THREE.BufferAttribute(pivotArray, 2))
    }

    setMaterial()
    {
        this.color = uniform(color('#ffffff'))
        this.fadeEdgeHigh = uniform(0.5)
        this.fadeEdgeLow = uniform(0.022)
        this.normalNeighbourShift = uniform(0.2)
        

        const deltaY = varying(float())
        const worldUv = varying(vec2())
        const computeNormal = varying(vec3())

        const pivot = attribute('pivot')
        // const debugColor = varying(color('red'))

        const flipRotation = Math.PI * 0.5

        const elevationFromTexture = Fn(([position]) =>
        {
            const newUv = position.sub(this.roundedPosition).div(this.size).add(0.5)
            const snowTextureElevation = texture(this.snowElevation.texture, newUv).r

            const furnitureTexture = this.game.terrain.terrainNode(position).r

            return snowTextureElevation.sub(furnitureTexture.mul(2))
        })

        this.material = new MeshDefaultMaterial({
            normalNode: computeNormal,
            alphaNode: deltaY.smoothstep(this.fadeEdgeLow, this.fadeEdgeHigh),
            transparent: true,
            alphaTest: 0.1
        })

        this.material.positionNode = Fn(() =>
        {
            // Offset position
            const newPosition = positionGeometry.toVar()
            newPosition.x.addAssign(this.roundedPosition.x)
            newPosition.z.addAssign(this.roundedPosition.y)

            // Rotate quad
            const pivotCenter = vec3(pivot.x, 0, pivot.y)
            pivotCenter.x.addAssign(this.roundedPosition.x)
            pivotCenter.z.addAssign(this.roundedPosition.y)

            const cornerA = pivotCenter.add(vec3(- this.subdivisionSize, 0, - this.subdivisionSize))
            const cornerB = pivotCenter.add(vec3(  this.subdivisionSize, 0, - this.subdivisionSize))
            const cornerC = pivotCenter.add(vec3(  this.subdivisionSize, 0,   this.subdivisionSize))
            const cornerD = pivotCenter.add(vec3(- this.subdivisionSize, 0,   this.subdivisionSize))

            pivotCenter.y.assign(elevationFromTexture(pivotCenter.xz))
            cornerA.y.assign(elevationFromTexture(cornerA.xz).sub(pivotCenter.y))
            cornerB.y.assign(elevationFromTexture(cornerB.xz).sub(pivotCenter.y))
            cornerC.y.assign(elevationFromTexture(cornerC.xz).sub(pivotCenter.y))
            cornerD.y.assign(elevationFromTexture(cornerD.xz).sub(pivotCenter.y))

            const acDelta = cornerA.y.sub(cornerC.y).abs()
            const bdDelta = cornerB.y.sub(cornerD.y).abs()

            const rotation = float(0)
            If(acDelta.lessThan(bdDelta), () =>
            {
                // debugColor.assign(color('cyan'))
                rotation.assign(flipRotation)
            })

            newPosition.xz.assign(rotateUV(newPosition.xz, rotation, pivotCenter.xz))

            // Position / Normal
            const positionA = newPosition
            const positionB = positionA.add(vec3(this.normalNeighbourShift, 0, 0))
            const positionC = positionA.add(vec3(0, 0, this.normalNeighbourShift.negate()))

            positionA.y.assign(elevationFromTexture(positionA.xz))
            positionB.y.assign(elevationFromTexture(positionB.xz))
            positionC.y.assign(elevationFromTexture(positionC.xz))

            // Terrain data
            // const terrainUv = this.game.terrain.worldPositionToUvNode(positionA.xz)
            const terrainData = this.game.terrain.terrainNode(positionA.xz)
            const terrainColor = this.game.terrain.colorNode(terrainData)

            // Normal
            const newNormal = cross(positionA.sub(positionB), positionA.sub(positionC)).normalize()
            computeNormal.assign(modelViewMatrix.mul(vec4(newNormal, 0)))

            // Push down further more in water (after calculating normal)
            const waterDrop = terrainData.b.remapClamp(this.waterDropEdgeLow, this.waterDropEdgeHigh, 0, this.waterDropAmplitude.negate())
            positionA.y.addAssign(waterDrop)

            // Delta to floor
            deltaY.assign(positionA.y.sub(terrainData.b.mul(-2)))

            // World UV
            worldUv.assign(positionA.xz)
            
            return positionA
        })()

        const baseOutput = this.material.outputNode
        
        this.glitterViewMultiplier = 0.0004
        this.glitterTimeMultiplier = 0.0004
        this.glitterVariation = uniform(0)
        this.glitterScarcity = uniform(1000)
        this.glitterIntensity = uniform(2)
        this.glitterPerlinFrequency = uniform(0.05)
        this.glitterHashFrequency = uniform(0.2)

        this.material.outputNode = Fn(() =>
        {
            const glitter = float(0)

            // Hash
            const hashUv = positionWorld.xz.mul(this.glitterHashFrequency)
            const hash = texture(this.game.noises.hash, hashUv).r.mul(2).add(this.glitterVariation).mod(2).sub(1).abs()
            glitter.addAssign(hash)

            // Perlin
            const perlinUv = positionWorld.xz.mul(this.glitterPerlinFrequency)
            const perlin = texture(this.game.noises.perlin, perlinUv).r
            const glitterPerlin = perlin.remapClamp(0, 0.5, 0, 1)
            glitter.mulAssign(glitterPerlin)
            
            // Scarcity
            glitter.assign(glitter.pow(this.glitterScarcity))

            // Intensity
            glitter.mulAssign(this.glitterIntensity)

            // Output
            return vec4(baseOutput.rgb.add(glitter), baseOutput.a)
        })()

        // Debug
        if(this.game.debug.active)
        {
            this.debugPanel.addBinding(this.material, 'wireframe')
            this.game.debug.addThreeColorBinding(this.debugPanel, this.color.value, 'color')
            this.debugPanel.addBlade({ view: 'separator' })
            this.debugPanel.addBinding(this.fadeEdgeHigh, 'value', { label: 'fadeEdgeHigh', min: - 2, max: 2, step: 0.001 })
            this.debugPanel.addBinding(this.fadeEdgeLow, 'value', { label: 'fadeEdgeLow', min: - 2, max: 2, step: 0.001 })
            this.debugPanel.addBlade({ view: 'separator' })
            this.debugPanel.addBinding(this.normalNeighbourShift, 'value', { label: 'normalNeighbourShift', min: 0, max: 2, step: 0.001 })
            this.debugPanel.addBlade({ view: 'separator' })
            this.debugPanel.addBinding(this.noiseMultiplier, 'value', { label: 'noiseMultiplier', min: 0, max: 2, step: 0.001 })
            this.debugPanel.addBinding(this.noise1Frequency, 'value', { label: 'noise1Frequency', min: 0, max: 0.4, step: 0.001 })
            this.debugPanel.addBinding(this.noise2Frequency, 'value', { label: 'noise2Frequency', min: 0, max: 0.4, step: 0.001 })
            this.debugPanel.addBinding(this.waterDropEdgeLow, 'value', { label: 'waterDropEdgeLow', min: 0, max: 1, step: 0.001 })
            this.debugPanel.addBinding(this.waterDropEdgeHigh, 'value', { label: 'waterDropEdgeHigh', min: 0, max: 1, step: 0.001 })
            this.debugPanel.addBinding(this.waterDropAmplitude, 'value', { label: 'waterDropAmplitude', min: 0, max: 5, step: 0.001 })
            this.debugPanel.addBlade({ view: 'separator' })
            // this.debugPanel.addBinding(this.glittersPositionFrequency, 'value', { label: 'glittersPositionFrequency', min: 1, max: 100, step: 1 })
            // this.debugPanel.addBinding(this.glittersVariationFrequency, 'value', { label: 'glittersVariationFrequency', min: 0, max: 0.001, step: 0.000001 })
            // this.debugPanel.addBinding(this.glittersScarcity, 'value', { label: 'glittersScarcity', min: 0, max: 0.01, step: 0.000001 })
            // this.debugPanel.addBinding(this.glittersStrength, 'value', { label: 'glittersStrength', min: 0, max: 10, step: 0.001 })

            this.debugPanel.addBinding(this, 'glitterViewMultiplier', { min: 0, max: 0.001, step: 0.000001 })
            this.debugPanel.addBinding(this, 'glitterTimeMultiplier', { min: 0, max: 0.001, step: 0.000001 })
            this.debugPanel.addBinding(this.glitterScarcity, 'value', { label: 'glitterScarcity', min: 100, max: 10000, step: 1 })
            this.debugPanel.addBinding(this.glitterIntensity, 'value', { label: 'glitterIntensity', min: 0, max: 10, step: 0.01 })
            this.debugPanel.addBinding(this.glitterPerlinFrequency, 'value', { label: 'glitterPerlinFrequency', min: 0, max: 0.1, step: 0.0001 })
            this.debugPanel.addBinding(this.glitterHashFrequency, 'value', { label: 'glitterHashFrequency', min: 0, max: 1, step: 0.0001 })
        }
    }

    setMesh()
    {
        this.mesh = new THREE.Mesh(this.geometry, this.material)
        this.mesh.castShadow = false
        this.mesh.receiveShadow = true
        this.mesh.visible = false
        this.mesh.frustumCulled = false
        this.game.scene.add(this.mesh)
    }

    update()
    {
        this.elevationBinding.update()

        if(this.elevation.value > -0.9)
        {
            // Apply weather
            this.mesh.visible = true

            // Achievement
            if(!this.achievementAchieved && this.game.reveal.step === 2 && this.elevation.value > 0)
            {
                this.achievementAchieved = true
                this.game.achievements.setProgress('weatherSnow', 1)
            }

            // Glitter
            // this.glitterPositionDelta.value = 1 + (this.game.view.camera.position.x + this.game.view.camera.position.z) * this.glitterViewMultiplier + this.game.ticker.elapsedScaled * 0.4
            // this.glitterPositionDelta.value = 123.456 + (this.game.view.camera.position.x + this.game.view.camera.position.z) * this.glitterViewMultiplier
            
            // this.glitterViewMultiplier = 0.001
            // this.glitterTimeMultiplier = 0.001
            this.glitterVariation.value += this.game.ticker.deltaScaled * this.glitterTimeMultiplier + this.game.view.delta.length() * this.glitterViewMultiplier

            // Rounded position
            this.roundedPosition.value.x = Math.round(this.game.view.optimalArea.position.x / this.subdivisionSize) * this.subdivisionSize
            this.roundedPosition.value.y = Math.round(this.game.view.optimalArea.position.z / this.subdivisionSize) * this.subdivisionSize

            // Tracks delta
            this.tracksDelta.value.set(
                this.roundedPosition.value.x - this.game.tracks.focusPoint.x,
                this.roundedPosition.value.y - this.game.tracks.focusPoint.y
            )

            // this.game.rendering.renderer.setRenderTarget(this.snowElevation.renderTarget)
            // this.snowElevation.quadMesh.render(this.game.rendering.renderer)
            // this.game.rendering.renderer.setRenderTarget(null)
            
            // Render
            const rendererState = THREE.RendererUtils.resetRendererState(this.game.rendering.renderer)

            this.game.rendering.renderer.setPixelRatio(1)
            this.game.rendering.renderer.setRenderTarget(this.snowElevation.renderTarget)
            this.snowElevation.quadMesh.render(this.game.rendering.renderer)
            this.game.rendering.renderer.setRenderTarget(null)

            THREE.RendererUtils.restoreRendererState(this.game.rendering.renderer, rendererState)
        }
        else
        {
            this.mesh.visible = false
        }
    }
}