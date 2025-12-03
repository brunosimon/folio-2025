import { Game } from '../Game.js'
import * as THREE from 'three/webgpu'

export class PhysicsWireframe
{
    constructor()
    {
        this.game = Game.getInstance()
        this.active = false

        this.geometry = new THREE.BufferGeometry()
        this.geometry.setAttribute('position', new THREE.Float32BufferAttribute([], 3))
        this.geometry.setAttribute('color', new THREE.Float32BufferAttribute([], 4))

        this.material = new THREE.LineBasicNodeMaterial({ vertexColors: true })

        this.lineSegments = new THREE.LineSegments(this.geometry, this.material)

        if(this.active)
            this.game.scene.add(this.lineSegments)

        this.game.ticker.events.on('tick', () =>
        {
            this.update()
        }, 4)

        if(this.game.debug.active)
        {
            this.debugPanel = this.game.physics.debugPanel.addFolder({
                title: 'Wireframe',
                expanded: true,
            })
            
            this.debugPanel.addBinding(this, 'active', { label: 'debug' }).on('change', () =>
            {
                if(this.active)
                    this.game.scene.add(this.lineSegments)
                else
                    this.game.scene.remove(this.lineSegments)
            })
        }
    }
    
    update()
    {
        if(!this.active)
            return

        const { vertices, colors } = this.game.physics.world.debugRender()

        this.geometry.attributes.position.array = vertices
        this.geometry.attributes.position.count = vertices.length / 3
        this.geometry.attributes.position.needsUpdate = true

        this.geometry.attributes.color.array = colors
        this.geometry.attributes.color.count = colors.length / 4
        this.geometry.attributes.color.needsUpdate = true
    }
}