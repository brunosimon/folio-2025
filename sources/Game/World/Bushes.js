import * as THREE from 'three/webgpu'
import { color } from 'three/tsl'
import { Foliage } from './Foliage.js'
import { Game } from '../Game.js'

export default class Bushes
{
    constructor()
    {
        this.game = Game.getInstance()

        this.color = new THREE.Color('#9eaf33')
        this.foliage = new Foliage(this.game.resources.bushes.scene.children, this.color)

        // Debug
        if(this.game.debug.active)
        {
            const debugPanel = this.game.debug.panel.addFolder({
                title: '🌳 Bushes',
                expanded: false,
            })
            this.game.debug.addThreeColorBinding(debugPanel, this.color, 'color')
            debugPanel.addBinding(this.foliage.shadowOffset, 'value', { label: 'shadowOffset', min: 0, max: 2, step: 0.001 })
        }
    }
}