import * as THREE from 'three/webgpu'
import { Game } from '../Game.js'
import MeshGridMaterial, { MeshGridMaterialLine } from '../Materials/MeshGridMaterial.js'
import { color, float, Fn, hash, max, mix, output, positionGeometry, positionLocal, positionWorld, sin, smoothstep, step, texture, uniform, uv, vec2, vec3, vec4 } from 'three/tsl'
import { remap, remapClamp } from '../utilities/maths.js'

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

        this.splashesRatio = uniform(0)
        const splashesNoiseFrequency = uniform(0.33)
        const splashesTimeFrequency = uniform(4)
        const splashesThickness = uniform(0.4)
        const splashesEdgeAttenuationLow = uniform(0.74)
        const splashesEdgeAttenuationHigh = uniform(0.76)

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
                .step(this.ripplesRatio.remap(0, 1, -1, -0.2))

            return ripples
        })

        const iceNode = Fn(([terrainData]) =>
        {
            const iceVoronoi = texture(
                this.game.noises.voronoi,
                positionWorld.xz.mul(iceNoiseFrequency)
            ).g

            const ice = terrainData.b.remapClamp(0, this.iceRatio, 0, 1).step(iceVoronoi)

            return ice
        })

        const splashesNode = Fn(() =>
        {
            const splashesVoronoi = texture(
                this.game.noises.voronoi,
                positionWorld.xz.mul(splashesNoiseFrequency)
            )
            const splashPerlin = texture(
                this.game.noises.voronoi,
                positionWorld.xz.mul(splashesNoiseFrequency.mul(0.25))
            ).r

            const splashDeadArea = float(0.15).step(splashesVoronoi.g)
            const splashTimeRandom = hash(splashesVoronoi.b.mul(123456))
            const splashVisibilityRandom = hash(splashesVoronoi.b.mul(654321))
            const visible = splashVisibilityRandom.add(splashPerlin).mod(1).step(this.splashesRatio)
            const splashProgress = splashesVoronoi.r.sub(this.game.wind.localTime.mul(splashesTimeFrequency)).add(splashTimeRandom).add(splashPerlin).mod(1).mul(splashesVoronoi.g.remapClamp(0, 1, splashesEdgeAttenuationLow, splashesEdgeAttenuationHigh))
            const splashes = step(splashesVoronoi.r.remap(0, 1, splashesThickness.oneMinus(), 1), splashProgress).mul(splashDeadArea).mul(visible)

            return splashes
        })

        this.discardNodeBuilder = () =>
        {
            return Fn(() =>
            {
                const terrainUv = this.game.terrainData.worldPositionToUvNode(positionWorld.xz)
                const terrainData = this.game.terrainData.terrainDataNode(terrainUv)
                const value = float(0).toVar()

                if(this.hasRipples)
                    value.assign(max(value, ripplesNode(terrainData)))

                if(this.hasIce)
                    value.assign(max(value, iceNode(terrainData)))
            
                if(this.hasSplashes)
                    value.assign(max(value, splashesNode()))

                return value
            })()
        }

        // Debug
        if(this.game.debug.active)
        {
            this.ripplesDebugPanel.addBinding(ripplesSlopeFrequency, 'value', { label: 'ripplesSlopeFrequency', min: 0, max: 50, step: 0.01 })
            this.ripplesDebugPanel.addBinding(ripplesNoiseFrequency, 'value', { label: 'ripplesNoiseFrequency', min: 0, max: 1, step: 0.01 })
            this.ripplesDebugPanel.addBinding(ripplesNoiseOffset, 'value', { label: 'ripplesNoiseOffset', min: 0, max: 1, step: 0.001 })

            this.iceDebugPanel.addBinding(iceNoiseFrequency, 'value', { label: 'iceNoiseFrequency', min: 0, max: 1, step: 0.01 })

            this.splashesDebugPanel.addBinding(splashesNoiseFrequency, 'value', { label: 'splashesNoiseFrequency', min: 0, max: 1, step: 0.01 })
            this.splashesDebugPanel.addBinding(splashesTimeFrequency, 'value', { label: 'splashesTimeFrequency', min: 0, max: 100, step: 0.1 })
            this.splashesDebugPanel.addBinding(splashesThickness, 'value', { label: 'splashesThickness', min: 0, max: 1, step: 0.01 })
            this.splashesDebugPanel.addBinding(splashesEdgeAttenuationLow, 'value', { label: 'splashesEdgeAttenuationLow', min: 0, max: 1, step: 0.01 })
            this.splashesDebugPanel.addBinding(splashesEdgeAttenuationHigh, 'value', { label: 'splashesEdgeAttenuationHigh', min: 0, max: 1, step: 0.01 })
        }
    }

    setMaterial()
    {
        const material = new THREE.MeshLambertNodeMaterial({ color: '#ffffff', wireframe: false })

        const totalShadow = this.game.lighting.addTotalShadowToMaterial(material)

        material.outputNode = Fn(() =>
        {
            this.discardNodeBuilder().lessThan(0.5).discard()

            return this.game.lighting.lightOutputNodeBuilder(vec3(1), totalShadow, false, false)
        })()

        material.castShadowNode = Fn(() =>
        {
            this.discardNodeBuilder().lessThan(0.5).discard()

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