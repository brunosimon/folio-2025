import * as THREE from 'three/webgpu'
import { Game } from '../Game.js'
import MeshGridMaterial, { MeshGridMaterialLine } from '../Materials/MeshGridMaterial.js'
import { blendOverlay, color, float, Fn, hash, linearDepth, max, mix, output, positionGeometry, positionLocal, positionWorld, screenUV, select, sin, smoothstep, step, texture, uniform, uv, vec2, vec3, vec4, viewportLinearDepth, viewportSharedTexture } from 'three/tsl'
import { remap, remapClamp } from '../utilities/maths.js'
import { hashBlur } from 'three/examples/jsm/tsl/display/hashBlur.js'

export class WaterSurface
{
    constructor()
    {
        this.game = Game.getInstance()

        this.hasRipples = false
        this.hasIce = false
        this.hasSplashes = false

        // Debug
        if(this.game.debug.active)
        {
            this.debugPanel = this.game.debug.panel.addFolder({
                title: '🌊 Water surface',
                expanded: false,
            })

            this.ripplesDebugPanel = this.debugPanel.addFolder({
                title: 'Ripples',
                expanded: true,
            })

            this.iceDebugPanel = this.debugPanel.addFolder({
                title: 'Ice',
                expanded: true,
            })

            this.splashesDebugPanel = this.debugPanel.addFolder({
                title: 'Splashes',
                expanded: true,
            })

            this.shoreDebugPanel = this.debugPanel.addFolder({
                title: 'shore',
                expanded: true,
            })

            this.blurDebugPanel = this.debugPanel.addFolder({
                title: 'blur',
                expanded: true,
            })
        }

        this.setGeometry()
        this.setNodes()
        this.setMaterial()
        this.setMesh()

        this.game.ticker.events.on('tick', () =>
        {
            this.update()
        }, 9)
    }

    setGeometry()
    {
        const halfExtent = this.game.view.optimalArea.radius
        this.geometry = new THREE.PlaneGeometry(halfExtent * 2, halfExtent * 2, 1, 1)
        this.geometry.rotateX(- Math.PI * 0.5)
    }

    setNodes()
    {
        /**
         * Ripples
         */
        this.ripplesRatio = uniform(1)
        const ripplesSlopeFrequency = uniform(10)
        const ripplesNoiseFrequency = uniform(0.1)
        const ripplesNoiseOffset = uniform(0.345)

        this.ripplesRatioBinding = this.game.debug.addManualBinding(
            this.ripplesDebugPanel,
            this.ripplesRatio,
            'value',
            { label: 'ripplesRatio', min: 0, max: 1, step: 0.001 },
            () =>
            {
                return remapClamp(this.game.weather.temperature.value, 0, -3, 1, 0)
            }
        )

        const ripplesNode = Fn(([terrainData]) =>
        {           
            const baseRipple = terrainData.b.add(this.game.wind.localTime.mul(0.5)).mul(ripplesSlopeFrequency).toVar()
            const rippleIndex = baseRipple.floor()

            const ripplesNoise = texture(
                this.game.noises.others,
                positionWorld.xz.add(rippleIndex.div(ripplesNoiseOffset)).mul(ripplesNoiseFrequency)
            ).r
            
            const ripples = terrainData.b
                .add(this.game.wind.localTime.mul(0.5))
                .mul(ripplesSlopeFrequency)
                .mod(1)
                .sub(terrainData.b.remap(0, 1, -0.3, 1).oneMinus())
                .add(ripplesNoise)
                .step(this.ripplesRatio.remap(0, 1, -1, -0.4))

            return ripples
        })

        // Debug
        if(this.game.debug.active)
        {
            this.ripplesDebugPanel.addBinding(ripplesSlopeFrequency, 'value', { label: 'ripplesSlopeFrequency', min: 0, max: 50, step: 0.01 })
            this.ripplesDebugPanel.addBinding(ripplesNoiseFrequency, 'value', { label: 'ripplesNoiseFrequency', min: 0, max: 1, step: 0.01 })
            this.ripplesDebugPanel.addBinding(ripplesNoiseOffset, 'value', { label: 'ripplesNoiseOffset', min: 0, max: 1, step: 0.001 })
        }

        /**
         * Ice
         */
        this.iceRatio = uniform(0)
        const iceNoiseFrequency = uniform(0.3)

        this.iceRatioBinding = this.game.debug.addManualBinding(
            this.iceDebugPanel,
            this.iceRatio,
            'value',
            { label: 'iceRatio', min: 0, max: 1, step: 0.001 },
            () =>
            {
                return remapClamp(this.game.weather.temperature.value, 0, -5, 0, 1)
            }
        )

        const iceNode = Fn(([terrainData]) =>
        {
            const iceVoronoi = texture(
                this.game.noises.voronoi,
                positionWorld.xz.mul(iceNoiseFrequency)
            ).g

            const ice = terrainData.b.remapClamp(0, this.iceRatio, 0, 1).step(iceVoronoi)

            return ice
        })

        // Debug
        if(this.game.debug.active)
        {
            this.iceDebugPanel.addBinding(iceNoiseFrequency, 'value', { label: 'iceNoiseFrequency', min: 0, max: 1, step: 0.01 })
        }

        /**
         * Splashes
         */
        this.splashesRatio = uniform(0)
        const splashesNoiseFrequency = uniform(0.33)
        const splashesTimeFrequency = uniform(6)
        const splashesThickness = uniform(0.3)
        const splashesEdgeAttenuationLow = uniform(0.14)
        const splashesEdgeAttenuationHigh = uniform(1)

        this.splashesRatioBinding = this.game.debug.addManualBinding(
            this.splashesDebugPanel,
            this.splashesRatio,
            'value',
            { label: 'splashesRatio', min: 0, max: 1, step: 0.001 },
            () =>
            {
                return this.game.weather.rain.value
            }
        )

        const splashesNode = Fn(() =>
        {
            // Noises
            const splashesVoronoi = texture(
                this.game.noises.voronoi,
                positionWorld.xz.mul(splashesNoiseFrequency)
            )
            const splashPerlin = texture(
                this.game.noises.voronoi,
                positionWorld.xz.mul(splashesNoiseFrequency.mul(0.25))
            ).r

            // Base
            const splash = splashesVoronoi.r

            // Time
            const splashTimeRandom = hash(splashesVoronoi.b.mul(123456)).add(splashPerlin)
            const splashTime = this.game.wind.localTime.mul(splashesTimeFrequency).add(splashTimeRandom)
            splash.assign(splash.sub(splashTime).mod(1))
            
            // Thickness
            const edgeMutliplier = splashesVoronoi.g.remapClamp(splashesEdgeAttenuationLow, splashesEdgeAttenuationHigh, 0, 1)
            const thickness = splashesThickness.mul(edgeMutliplier)
            splash.assign(thickness.step(splash).oneMinus())
            
            // Visibility
            const splashVisibilityRandom = hash(splashesVoronoi.b.mul(654321))
            const visible = splashVisibilityRandom.add(splashPerlin).mod(1).step(this.splashesRatio)
            splash.assign(splash.mul(visible))
            
            return splash
        })

        // Debug
        if(this.game.debug.active)
        {
            this.splashesDebugPanel.addBinding(splashesNoiseFrequency, 'value', { label: 'splashesNoiseFrequency', min: 0, max: 1, step: 0.01 })
            this.splashesDebugPanel.addBinding(splashesTimeFrequency, 'value', { label: 'splashesTimeFrequency', min: 0, max: 100, step: 0.1 })
            this.splashesDebugPanel.addBinding(splashesThickness, 'value', { label: 'splashesThickness', min: 0, max: 1, step: 0.01 })
            this.splashesDebugPanel.addBinding(splashesEdgeAttenuationLow, 'value', { label: 'splashesEdgeAttenuationLow', min: 0, max: 1, step: 0.01 })
            this.splashesDebugPanel.addBinding(splashesEdgeAttenuationHigh, 'value', { label: 'splashesEdgeAttenuationHigh', min: 0, max: 1, step: 0.01 })
        }

        /**
         * Shore
         */
        const shoreEdge = uniform(0.17)
        
        const shoreNode = Fn(([terrainData]) =>
        {
            return terrainData.b.step(shoreEdge)
        })

        // Debug
        if(this.game.debug.active)
        {
            this.shoreDebugPanel.addBinding(shoreEdge, 'value', { label: 'shoreEdge', min: 0, max: 0.3, step: 0.001 })
        }

        /**
         * Details mask
         */
        this.detailsMask = () =>
        {
            return Fn(() =>
            {
                // Terrain data
                // const terrainUv = this.game.terrainData.worldPositionToUvNode(positionWorld.xz)
                const terrainData = this.game.terrainData.terrainDataNode(positionWorld.xz)
                const value = float(0).toVar()

                // Ripples
                if(this.hasRipples)
                    value.assign(max(value, ripplesNode(terrainData)))

                // Ice
                if(this.hasIce)
                    value.assign(max(value, iceNode(terrainData)))
            
                // Splashes
                if(this.hasSplashes)
                    value.assign(max(value, splashesNode()))

                // Shore
                value.assign(max(value, shoreNode(terrainData)))

                return value
            })()
        }

        /**
         * Blur Output
         */
         const blurStrength = uniform(0.01)

         this.blurOutputNode = Fn(() =>
         {
            const blurStrength = viewportLinearDepth.sub(linearDepth()).mul(10)
            // const blurStrength = 0.01
            
            let blurOutput = viewportSharedTexture(screenUV)
            blurOutput = hashBlur(blurOutput, blurStrength).rgb

            return vec3(blurOutput)
         })

        // Debug
        if(this.game.debug.active)
        {
            this.blurDebugPanel.addBinding(blurStrength, 'value', { label: 'blurStrength', min: 0, max: 0.1 })
        }
    }

    setMaterial()
    {
        const material = new THREE.MeshLambertNodeMaterial({ color: '#ffffff', wireframe: false, depthWrite: false })

        const totalShadow = this.game.lighting.addTotalShadowToMaterial(material)

        material.normalNode = vec3(0, 1, 0)
        material.outputNode = Fn(() =>
        {
            const lightOutput = this.game.lighting.lightOutputNodeBuilder(vec3(1), material.normalNode, totalShadow, false, false).rgb

            const blurOutput = this.blurOutputNode()

            const finalOuput = select(this.detailsMask().lessThan(0.5), blurOutput, lightOutput);

            return vec4(finalOuput, 1)
        })()

        material.castShadowNode = Fn(() =>
        {
            this.detailsMask().lessThan(0.5).discard()

            return float(0)
        })()

        // Already exist
        if(this.material)
        {
            this.material.dispose()
            this.material = material
            this.mesh.material = this.material
        }

        // Don't exist yet
        else
        {
            this.material = material
        }
    }

    setMesh()
    {
        this.mesh = new THREE.Mesh(this.geometry, this.material)
        this.mesh.position.y = - 0.3
        this.mesh.castShadow = true
        this.mesh.receiveShadow = true
        this.game.scene.add(this.mesh)
    }

    update()
    {
        // Apply weather
        this.ripplesRatioBinding.update()
        this.iceRatioBinding.update()
        this.splashesRatioBinding.update()

        this.mesh.position.x = this.game.view.optimalArea.position.x
        this.mesh.position.z = this.game.view.optimalArea.position.z

        const hasRipples = this.ripplesRatio.value > 0.0001
        const hasIce = this.iceRatio.value > 0.0001
        const hasSplashes = this.splashesRatio.value > 0.0001

        if(
            hasRipples !== this.hasRipples ||
            hasIce !== this.hasIce ||
            hasSplashes !== this.hasSplashes
        )
        {
            this.hasRipples = hasRipples
            this.hasIce = hasIce
            this.hasSplashes = hasSplashes
            
            this.setMaterial()
        }
    }
}