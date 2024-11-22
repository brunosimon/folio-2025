import * as THREE from 'three'
import { Game } from './Game.js'
import { uniform, color } from 'three'

export class Lighting
{
    constructor()
    {
        this.game = new Game()

        this.spherical = new THREE.Spherical(25, 1.44, 1.31)
        this.direction = new THREE.Vector3().setFromSpherical(this.spherical).normalize()
        this.directionUniform = uniform(this.direction)
        this.colorUniform = uniform(color('#ffffff'))
        this.intensityUniform = uniform(1)
        this.count = 1
        this.lights = []
        this.mapSizeMin = 512
        this.shadowAmplitude = 20
        this.near = 1
        this.depth = 100
        this.shadowBias = - 0.01
        this.shadowNormalBias = 0

        for(let i = 0; i < this.count; i++)
        {
            const light = new THREE.DirectionalLight(0xffffff, 5)
            light.position.setFromSpherical(this.spherical)
            light.castShadow = true
            
            this.game.scene.add(light)
            this.game.scene.add(light.target)

            this.lights.push(light)
        }

        this.updateShadow()

        this.game.time.events.on('tick', () =>
        {
            this.update()
        })

        // Debug
        if(this.game.debug.active)
        {
            const debugPanel = this.game.debug.panel.addFolder({
                title: '💡 Lights',
                expanded: true,
            })

            debugPanel.addBinding({ color: this.colorUniform.value.getHex(THREE.SRGBColorSpace) }, 'color', { view: 'color' })
                .on('change', tweak => { this.colorUniform.value.set(tweak.value) })
            debugPanel.addBinding(this.intensityUniform, 'value', { label: 'intensity', min: 0, max: 10 })
            debugPanel.addBlade({ view: 'separator' })
            debugPanel.addBinding(this.spherical, 'phi', { min: 0, max: Math.PI * 0.5 }).on('change', () => this.updateCoordinates())
            debugPanel.addBinding(this.spherical, 'theta', { min: - Math.PI, max: Math.PI }).on('change', () => this.updateCoordinates())
            debugPanel.addBinding(this.spherical, 'radius', { min: 0, max: 100 }).on('change', () => this.updateCoordinates())
            debugPanel.addBlade({ view: 'separator' })
            debugPanel.addBinding(this, 'near', { min: 0.1, max: 50, step: 0.1 }).on('change', () => this.updateShadow())
            debugPanel.addBinding(this, 'depth', { min: 0.1, max: 100, step: 0.1 }).on('change', () => this.updateShadow())
            debugPanel.addBinding(this, 'shadowAmplitude', { min: 1, max: 50 }).on('change', () => this.updateShadow())
            debugPanel.addBinding(this, 'shadowBias', { min: -0.1, max: 0.1 }).on('change', () => this.updateShadow())
            debugPanel.addBinding(this, 'shadowNormalBias', { min: -0.1, max: 0.1 }).on('change', () => this.updateShadow())

            const mapSizes = {}
            for(let i = 0; i < 12; i++)
            {
                const size = Math.pow(2, i + 1)
                mapSizes[size] = size
            }
            debugPanel.addBinding(this, 'mapSizeMin', { options: mapSizes }).on('change', () => this.updateShadow())
        }
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
        for(const light of this.lights)
        {
            light.position.setFromSpherical(this.spherical).add(this.game.view.focusPoint.position)
            light.target.position.copy(this.game.view.focusPoint.position)
        }
    }
}