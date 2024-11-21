import * as THREE from 'three'
import { pass, mrt, output, emissive } from 'three'
import { bloom } from 'three/addons/tsl/display/BloomNode.js'
import { Game } from './Game.js'

export class Rendering
{
    constructor()
    {
        this.game = new Game()

        if(this.game.debug.active)
        {
            this.debugPanel = this.game.debug.panel.addFolder({
                title: '📸 Rendering',
                expanded: true,
            })
        }

        this.setRenderer()
        this.setPostprocessing()

        this.game.time.events.on('tick', () =>
        {
            this.render()
        }, 7)

        this.game.viewport.events.on('change', () =>
        {
            this.resize()
        })
    }

    setRenderer()
    {
        this.renderer = new THREE.WebGPURenderer({ forceWebGL: false })
        this.renderer.autoReset = false
        this.renderer.setSize(this.game.viewport.width, this.game.viewport.height)
        this.renderer.setPixelRatio(this.game.viewport.pixelRatio)
        this.renderer.setClearColor(0x1b191f)
        this.renderer.domElement.classList.add('experience')
        this.renderer.shadowMap.enabled = true
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
        this.game.domElement.append(this.renderer.domElement)
    }

    setPostprocessing()
    {
        this.postProcessing = new THREE.PostProcessing(this.renderer)

        const scenePass = pass(this.game.scene, this.game.view.camera)
        const scenePassColor = scenePass.getTextureNode('output')

        const bloomPass = bloom(scenePassColor)
        bloomPass.threshold.value = 1

        this.postProcessing.outputNode = scenePassColor.add(bloomPass)

        // Debug
        if(this.game.debug.active)
        {
            const debugPanel = this.debugPanel.addFolder({
                title: 'Postprocessing',
                expanded: true,
            })

            debugPanel.addBinding(bloomPass.threshold, 'value', { label: 'threshold', min: 0, max: 2, step: 0.01 })
            debugPanel.addBinding(bloomPass.strength, 'value', { label: 'strength', min: 0, max: 3, step: 0.01 })
            debugPanel.addBinding(bloomPass.radius, 'value', { label: 'radius', min: 0, max: 1, step: 0.01 })
        }
    }

    resize()
    {
        this.renderer.setSize(this.game.viewport.width, this.game.viewport.height)
        this.renderer.setPixelRatio(this.game.viewport.pixelRatio)
    }

    async render()
    {
        // this.renderer.renderAsync(this.game.scene, this.game.view.camera)
        this.postProcessing.renderAsync()
    }
}