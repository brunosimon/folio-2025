import * as THREE from 'three/webgpu'
import { Game } from './Game.js'
import { uniform, color, float, vec2, time, texture, Fn, vec4, positionWorld, normalWorld, vec3, mix, max } from 'three/tsl'

export class Lighting
{
    constructor()
    {
        this.game = Game.getInstance()

        this.useCycles = true
        this.phi = 0.73
        this.theta = 0.72
        this.phiAmplitude = 0.82
        this.thetaAmplitude = 1
        this.spherical = new THREE.Spherical(25, this.phi, this.theta)
        this.direction = new THREE.Vector3().setFromSpherical(this.spherical).normalize()
        this.directionUniform = uniform(this.direction)
        this.colorUniform = uniform(color('#ffffff'))
        this.intensityUniform = uniform(1)
        this.count = 1
        this.lights = []
        this.mapSizeMin = 1024
        this.shadowAmplitude = 20
        this.near = 1
        this.depth = 60
        this.shadowBias = 0
        this.shadowNormalBias = 0

        if(this.game.debug.active)
        {
            this.debugPanel = this.game.debug.panel.addFolder({
                title: '💡 Lighting',
                expanded: false,
            })
        }

        this.setNodes()
        this.setLights()
        this.setHelper()
        this.updateShadow()

        this.game.time.events.on('tick', () =>
        {
            this.update()
        }, 7)

        // Debug
        if(this.game.debug.active)
        {
            this.debugPanel.addBinding(this.helper, 'visible', { label: 'helperVisible' })
            this.debugPanel.addBinding(this, 'useCycles')
            this.debugPanel.addBinding(this, 'phi', { min: 0, max: Math.PI * 0.5 }).on('change', () => this.updateCoordinates())
            this.debugPanel.addBinding(this, 'theta', { min: - Math.PI, max: Math.PI }).on('change', () => this.updateCoordinates())
            this.debugPanel.addBinding(this, 'phiAmplitude', { min: 0, max: Math.PI}).on('change', () => this.updateCoordinates())
            this.debugPanel.addBinding(this, 'thetaAmplitude', { min: - Math.PI, max: Math.PI }).on('change', () => this.updateCoordinates())
            this.debugPanel.addBinding(this.spherical, 'radius', { min: 0, max: 100 }).on('change', () => this.updateCoordinates())
            this.debugPanel.addBlade({ view: 'separator' })
            this.debugPanel.addBinding(this, 'near', { min: 0.1, max: 50, step: 0.1 }).on('change', () => this.updateShadow())
            this.debugPanel.addBinding(this, 'depth', { min: 0.1, max: 100, step: 0.1 }).on('change', () => this.updateShadow())
            this.debugPanel.addBinding(this, 'shadowAmplitude', { min: 1, max: 50 }).on('change', () => this.updateShadow())
            this.debugPanel.addBinding(this, 'shadowBias', { min: -0.1, max: 0.1 }).on('change', () => this.updateShadow())
            this.debugPanel.addBinding(this, 'shadowNormalBias', { min: -0.1, max: 0.1 }).on('change', () => this.updateShadow())

            const mapSizes = {}
            for(let i = 0; i < 12; i++)
            {
                const size = Math.pow(2, i + 1)
                mapSizes[size] = size
            }
            this.debugPanel.addBinding(this, 'mapSizeMin', { options: mapSizes }).on('change', () => this.updateShadow())
        }
    }

    setNodes()
    {
        this.lightBounceEdgeLow = uniform(float(-1))
        this.lightBounceEdgeHigh = uniform(float(1))
        this.lightBounceDistance = uniform(float(1.5))
        this.lightBounceMultiplier = uniform(float(0.5))

        this.shadowColor = uniform(this.game.cycles.day.values.properties.shadowColor.value)
        this.coreShadowEdgeLow = uniform(float(-0.25))
        this.coreShadowEdgeHigh = uniform(float(1))

        this.cloudsFrequency = uniform(0.02)
        this.cloudsSpeed = uniform(1)
        this.cloudsEdgeLow = uniform(0.2)
        this.cloudsEdgeHigh = uniform(0.5)
        this.cloudsMultiplier = uniform(0.7)

        this.waterThreshold = uniform(-0.3)
        this.waterAmplitude = uniform(0.3)
        this.waterPower = uniform(5)

        // Get total shadow
        this.addTotalShadowToMaterial = (material) =>
        {
            const cloudsUv = positionWorld.xz.add(vec2(time.mul(this.cloudsSpeed.negate()), time.mul(this.cloudsSpeed))).mul(this.cloudsFrequency)
            const clouds = texture(this.game.noises.texture, cloudsUv).r.smoothstep(this.cloudsEdgeLow, this.cloudsEdgeHigh).mul(this.cloudsMultiplier).add(this.cloudsMultiplier.oneMinus())

            const totalShadows = clouds.toVar()

            material.receivedShadowNode = Fn(([ shadow ]) => 
            {
                totalShadows.mulAssign(shadow)
                return float(1)
            })

            return totalShadows
        }

        // Light output
        this.lightOutputNodeBuilder = (inputColor, totalShadows, withBounce = true, withWater = true) =>
        {
            return Fn(([inputColor, totalShadows]) =>
            {
                const baseColor = inputColor.toVar()

                if(withBounce)
                {
                    const terrainUv = this.game.terrainData.worldPositionToUvNode(positionWorld.xz)
                    const terrainData = this.game.terrainData.terrainDataNode(terrainUv)

                    // Bounce color
                    const bounceOrientation = normalWorld.dot(vec3(0, - 1, 0)).smoothstep(this.lightBounceEdgeLow, this.lightBounceEdgeHigh)
                    const bounceDistance = this.lightBounceDistance.sub(positionWorld.y).div(this.lightBounceDistance).max(0).pow(2)
                    // const bounceWater = positionWorld.y.step(-0.3).mul(0.9).add(1)
                    const bounceColor = this.game.terrainData.colorNode(terrainData)
                    baseColor.assign(mix(baseColor, bounceColor, bounceOrientation.mul(bounceDistance).mul(this.lightBounceMultiplier)))
                }

                // Water
                if(withWater)
                {
                    const waterMix = positionWorld.y
                        .remapClamp(this.waterThreshold, this.waterThreshold.sub(this.waterAmplitude), 1, 0)
                        .mul(positionWorld.y.step(this.waterThreshold))
                        .pow(this.waterPower)
                    
                    baseColor.assign(mix(baseColor, color('#ffffff'), waterMix))
                }

                // Light
                const lightenColor = baseColor.mul(this.game.lighting.colorUniform.mul(this.game.lighting.intensityUniform))

                // Core shadow
                const coreShadowMix = normalWorld.dot(this.game.lighting.directionUniform).smoothstep(this.coreShadowEdgeHigh, this.coreShadowEdgeLow)
                
                // Cast shadow
                const castShadowMix = totalShadows.oneMinus()

                // Combined shadows
                const combinedShadowMix = max(coreShadowMix, castShadowMix).clamp(0, 1)
                
                const shadowColor = baseColor.rgb.mul(this.shadowColor).rgb
                const shadedColor = mix(lightenColor, shadowColor, combinedShadowMix)
                
                // Fog
                const foggedColor = this.game.fog.fogStrength.mix(shadedColor, this.game.fog.fogColor)

                return vec4(foggedColor.rgb, 1)
            })([inputColor, totalShadows])
        }

        // Debug
        if(this.game.debug.active)
        {
            this.debugPanel.addBinding(this.lightBounceEdgeLow, 'value', { label: 'lightBounceEdgeLow', min: - 1, max: 1, step: 0.01 })
            this.debugPanel.addBinding(this.lightBounceEdgeHigh, 'value', { label: 'lightBounceEdgeHigh', min: - 1, max: 1, step: 0.01 })
            this.debugPanel.addBinding(this.lightBounceDistance, 'value', { label: 'lightBounceDistance', min: 0, max: 5, step: 0.01 })
            this.debugPanel.addBinding(this.lightBounceMultiplier, 'value', { label: 'lightBounceMultiplier', min: 0, max: 1, step: 0.01 })

            this.debugPanel.addBlade({ view: 'separator' })
            this.debugPanel.addBinding(this.coreShadowEdgeLow, 'value', { label: 'coreShadowEdgeLow', min: - 1, max: 1, step: 0.01 })
            this.debugPanel.addBinding(this.coreShadowEdgeHigh, 'value', { label: 'coreShadowEdgeHigh', min: - 1, max: 1, step: 0.01 })

            this.debugPanel.addBlade({ view: 'separator' })
            this.debugPanel.addBinding(this.cloudsFrequency, 'value', { label: 'cloudsFrequency', min: 0, max: 0.1, step: 0.001 })
            this.debugPanel.addBinding(this.cloudsSpeed, 'value', { label: 'cloudsSpeed', min: 0, max: 10, step: 0.01 })
            this.debugPanel.addBinding(this.cloudsEdgeLow, 'value', { label: 'cloudsEdgeLow', min: 0, max: 1, step: 0.001 })
            this.debugPanel.addBinding(this.cloudsEdgeHigh, 'value', { label: 'cloudsEdgeHigh', min: 0, max: 1, step: 0.001 })
            this.debugPanel.addBinding(this.cloudsMultiplier, 'value', { label: 'cloudsMultiplier', min: 0, max: 1, step: 0.001 })

            this.debugPanel.addBlade({ view: 'separator' })
            this.debugPanel.addBinding(this.waterThreshold, 'value', { label: 'waterThreshold', min: -1, max: 0, step: 0.001 })
            this.debugPanel.addBinding(this.waterAmplitude, 'value', { label: 'waterAmplitude', min: 0, max: 2, step: 0.001 })
            this.debugPanel.addBinding(this.waterPower, 'value', { label: 'waterPower', min: 1, max: 10, step: 1 })
        }
    }

    setLights()
    {
        for(let i = 0; i < this.count; i++)
        {
            const light = new THREE.DirectionalLight(0xffffff, 5)
            light.position.setFromSpherical(this.spherical)
            light.castShadow = true
            
            this.game.scene.add(light)
            this.game.scene.add(light.target)

            this.lights.push(light)
        }
    }

    setHelper()
    {
        this.helper = new THREE.Mesh(
            new THREE.IcosahedronGeometry(0.25, 1),
            new THREE.MeshBasicNodeMaterial({ wireframe: true })
        )
        this.helper.visible = false

        const points = [
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, 5),
        ]
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points)
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff })
        const line = new THREE.Line(lineGeometry, lineMaterial)
        this.helper.add(line)

        this.game.scene.add(this.helper)
    }

    updateShadow()
    {
        let i = 0
        for(const light of this.lights)
        {
            light.shadow.camera.top = this.shadowAmplitude
            light.shadow.camera.right = this.shadowAmplitude
            light.shadow.camera.bottom = - this.shadowAmplitude
            light.shadow.camera.left = - this.shadowAmplitude
            light.shadow.camera.near = this.near
            light.shadow.camera.far = this.near + this.depth
            light.shadow.bias = this.shadowBias
            light.shadow.normalBias = this.shadowNormalBias

            light.shadow.camera.updateProjectionMatrix()

            const mapSize = this.mapSizeMin * Math.pow(2, i)
            light.shadow.mapSize.set(mapSize, mapSize)

            i++
        }
    }

    updateCoordinates()
    {
        this.direction.setFromSpherical(this.spherical).normalize()
    }

    update()
    {
        if(this.useCycles)
        {
            this.spherical.theta = this.theta + Math.sin(- (this.game.cycles.day.progress + 9/16) * Math.PI * 2) * this.thetaAmplitude
            this.spherical.phi = this.phi + (Math.cos(- (this.game.cycles.day.progress + 9/16) * Math.PI * 2) * 0.5) * this.phiAmplitude
        }
        else
        {
            this.spherical.theta = this.theta
            this.spherical.phi = this.phi
        }
        this.direction.setFromSpherical(this.spherical).normalize()
        
        // Offset (TODO: optimise)
        const offset = new THREE.Vector3(0, 0, -5)

        for(const light of this.lights)
        {

            light.position.setFromSpherical(this.spherical).add(this.game.view.focusPoint.position).add(offset)
            light.target.position.copy(this.game.view.focusPoint.position).add(offset)
        }

        // Helper
        this.helper.position.copy(this.direction).multiplyScalar(5).add(this.game.view.focusPoint.position)
        this.helper.lookAt(this.game.view.focusPoint.position)

        // Apply day cycles values
        this.colorUniform.value.copy(this.game.cycles.day.values.properties.lightColor.value)
        this.intensityUniform.value = this.game.cycles.day.values.properties.lightIntensity.value
    }
}