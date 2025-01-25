import * as THREE from 'three/webgpu'
import { Game } from '../Game.js'
import { attribute, cameraNormalMatrix, color, cross, dot, float, Fn, If, materialNormal, min, mix, modelNormalMatrix, modelViewMatrix, PI, positionGeometry, positionLocal, positionWorld, rotateUV, texture, time, uniform, uv, varying, vec2, vec3, vec4, viewportSize } from 'three/tsl'

export class Snow
{
    constructor()
    {
        this.game = Game.getInstance()

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
                expanded: true,
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
        }, 9)
    }

    setNodes()
    {
        this.roundedPosition = uniform(vec2(0))
        this.groundDataDelta = uniform(vec2(0))
        this.elevation = uniform(0.5)
        this.noiseMultiplier = uniform(1)
        this.noise1Frequency = uniform(0.1)
        this.noise2Frequency = uniform(0.07)
        this.waterDropEdgeLow = uniform(0.185)
        this.waterDropEdgeHigh = uniform(0.235)
        this.waterDropAmplitude = uniform(1)
        
        this.elevationNode = Fn(([position]) =>
        {
            const elevation = this.elevation.toVar()

            // Terrain
            const terrainUv = this.game.terrainData.worldPositionToUvNode(position.xy)
            const terrainData = this.game.terrainData.terrainDataNode(terrainUv)

            // Noise
            const noiseUv1 = position.mul(this.noise1Frequency).xy
            const noise1 = texture(this.game.noises.texture, noiseUv1).r

            const noiseUv2 = position.mul(this.noise2Frequency).xy
            const noise2 = texture(this.game.noises.texture, noiseUv2).r

            elevation.addAssign(noise1.mul(noise2).smoothstep(0, 1).mul(this.noiseMultiplier))

            // Wheel tracks
            const groundDataColor = texture(
                this.game.groundData.renderTarget.texture,
                position.xy.sub(- this.game.groundData.halfSize).sub(this.roundedPosition).add(this.groundDataDelta).div(this.game.groundData.size)
            )

            const wheelsTracksHeight = groundDataColor.r.oneMinus().toVar()
            const chassisTracksHeight = groundDataColor.g.oneMinus().toVar().remapClamp(0.5, 1, 0.25, 1)
            const tracksHeight = min(wheelsTracksHeight, chassisTracksHeight)
            // elevation.assign(min(elevation, tracksHeight))
            elevation.mulAssign(tracksHeight)

            elevation.addAssign(terrainData.b.remap(0, 1, 0, -2))

            return elevation
        })
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
        this.geometry = new THREE.PlaneGeometry(this.size, this.size, this.subdivisions, this.subdivisions).toNonIndexed()
        this.geometry.rotateX(- Math.PI * 0.5)
        this.geometry.deleteAttribute('normal')
        this.geometry.deleteAttribute('uv')

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
        this.material = new THREE.MeshLambertNodeMaterial({ color: '#ffffff', transparent: true, wireframe: false })

        this.color = uniform(color('#ffffff'))
        this.fadeEdgeHigh = uniform(0.5)
        this.fadeEdgeLow = uniform(0.022)
        this.normalNeighbourShift = uniform(0.2)

        const baseColor = varying(color())
        const deltaY = varying(float())

        const pivot = attribute('pivot')
        const debugColor = varying(color('red'))

        const flipRotation = Math.PI * 0.5

        const elevationFromTexture = Fn(([position]) =>
        {
            const newUv = position.sub(this.roundedPosition).div(this.size).add(0.5)
            return texture(this.snowElevation.texture, newUv)
        })

        this.material.positionNode = Fn(() =>
        {
            const pivotCenter = vec3(pivot.x, 0, pivot.y).toVar()
            pivotCenter.x.addAssign(this.roundedPosition.x)
            pivotCenter.z.addAssign(this.roundedPosition.y)

            const pivotA = pivotCenter.add(vec3(-this.subdivisionSize, 0, -this.subdivisionSize)).toVar()
            const pivotB = pivotCenter.add(vec3(this.subdivisionSize, 0, -this.subdivisionSize)).toVar()
            const pivotC = pivotCenter.add(vec3(this.subdivisionSize, 0, this.subdivisionSize)).toVar()
            const pivotD = pivotCenter.add(vec3(-this.subdivisionSize, 0, this.subdivisionSize)).toVar()

            pivotA.y.assign(elevationFromTexture(pivotA.xz))
            pivotB.y.assign(elevationFromTexture(pivotB.xz))
            pivotC.y.assign(elevationFromTexture(pivotC.xz))
            pivotD.y.assign(elevationFromTexture(pivotD.xz))

            const acDelta = pivotA.y.sub(pivotC.y).abs()
            const bdDelta = pivotB.y.sub(pivotD.y).abs()
            
            const rotation = float(0).toVar()
            If(acDelta.lessThan(bdDelta), () =>
            {
                debugColor.assign(color('cyan'))
                rotation.assign(flipRotation)
            })

            const newPosition = positionGeometry.toVar()
            newPosition.x.addAssign(this.roundedPosition.x)
            newPosition.z.addAssign(this.roundedPosition.y)

            newPosition.xz.assign(rotateUV(newPosition.xz, rotation, pivotCenter.xz))

            // Position / Normal
            const positionA = newPosition.toVar()
            const positionB = positionA.toVar().add(vec3(this.normalNeighbourShift, 0, 0))
            const positionC = positionA.toVar().add(vec3(0, 0, this.normalNeighbourShift.negate()))

            positionA.y.assign(elevationFromTexture(positionA.xz))
            positionB.y.assign(elevationFromTexture(positionB.xz))
            positionC.y.assign(elevationFromTexture(positionC.xz))

            // Terrain data
            const terrainUv = this.game.terrainData.worldPositionToUvNode(positionA.xz)
            const terrainData = this.game.terrainData.terrainDataNode(terrainUv)
            const terrainColor = this.game.terrainData.colorNode(terrainData)

            // Normal
            const newNormal = cross(positionA.sub(positionB), positionA.sub(positionC)).normalize()
            // const normalMixStrength = terrainData.b.remapClamp(0, 0.2, 0, 1)
            // newNormal.assign(mix(newNormal, vec3(0, 1, 0), normalMixStrength))
            materialNormal.assign(modelViewMatrix.mul(vec4(newNormal, 0)))

            // Push down further more in water (after calculating normal)
            const waterDrop = terrainData.b.remapClamp(this.waterDropEdgeLow, this.waterDropEdgeHigh, 0, this.waterDropAmplitude.negate())
            positionA.y.addAssign(waterDrop)

            // Color
            baseColor.assign(terrainColor)

            // Delta to floor
            deltaY.assign(positionA.y.sub(terrainData.b.mul(-2)))
            
            return positionA
            // return rotatedPosition
        })()

        const totalShadow = this.game.lighting.addTotalShadowToMaterial(this.material)

        this.material.outputNode = Fn(() =>
        {
            const lightOutput = this.game.lighting.lightOutputNodeBuilder(this.color, totalShadow, false, false).rgb
            const alpha = deltaY.smoothstep(this.fadeEdgeLow, this.fadeEdgeHigh)

            return vec4(lightOutput, alpha)
        })()

        // this.material.outputNode = vec4(debugColor, 1)

        // this.shadowOffset = uniform(0.1)
        // this.material.shadowPositionNode = positionLocal.add(this.game.lighting.directionUniform.mul(this.shadowOffset))

        // Debug
        if(this.game.debug.active)
        {
            this.debugPanel.addBinding(this.material, 'wireframe')
            this.game.debug.addThreeColorBinding(this.debugPanel, this.color.value, 'color')
            this.debugPanel.addBinding(this.elevation, 'value', { label: 'elevation', min: -1, max: 1, step: 0.001 })
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
        }
    }

    setMesh()
    {
        this.mesh = new THREE.Mesh(this.geometry, this.material)
        // this.mesh.position.y = 0.2
        this.mesh.castShadow = false
        this.mesh.receiveShadow = true
        this.mesh.frustumCulled = false
        this.game.scene.add(this.mesh)
    }

    update()
    {
        // Rounded position
        this.roundedPosition.value.x = Math.round(this.game.view.optimalArea.position.x / this.subdivisionSize) * this.subdivisionSize
        this.roundedPosition.value.y = Math.round(this.game.view.optimalArea.position.z / this.subdivisionSize) * this.subdivisionSize

        // Ground data delta
        this.groundDataDelta.value.set(
            this.roundedPosition.value.x - this.game.groundData.focusPoint.x,
            this.roundedPosition.value.y - this.game.groundData.focusPoint.y
        )

        this.game.rendering.renderer.setRenderTarget(this.snowElevation.renderTarget)
        this.snowElevation.quadMesh.renderAsync(this.game.rendering.renderer)
        this.game.rendering.renderer.setRenderTarget(null)
    }
}