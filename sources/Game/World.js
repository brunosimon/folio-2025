import * as THREE from 'three/webgpu'
import { uniform, color, rangeFog } from 'three/webgpu'
import { Game } from './Game.js'
import MeshGridMaterial, { MeshGridMaterialLine } from './Materials/MeshGridMaterial.js'

export class World
{
    constructor()
    {
        this.game = new Game()

        this.scene = new THREE.Scene()
        this.scene.fogNode = rangeFog(color(0x1b191f), 20, 100)

        this.setGround()
        // this.setTestCube()

        const axesHelper = new THREE.AxesHelper()
        axesHelper.position.y = 2
        this.scene.add(axesHelper)

        this.game.time.events.on('tick', () =>
        {
            this.update()
        }, 4)

        // this.game.physics.addEntity(
        //     {
        //         type: 'fixed',
        //         colliders: [ { shape: 'cuboid', parameters: [ 1, 1, 1 ] } ]
        //     }
        // )
    }

    setGround()
    {
        const lines = [
            // new MeshGridMaterialLine(0x444444, 0.1, 0.04),
            new MeshGridMaterialLine(0x705df2, 1, 0.03, 0.2),
            new MeshGridMaterialLine(0xffffff, 10, 0.003, 1),
        ]

        const uvGridMaterial = new MeshGridMaterial({
            color: 0x1b191f,
            scale: 0.001,
            antialiased: true,
            reference: 'uv', // uv | world
            side: THREE.DoubleSide,
            lines
        })

        const ground = new THREE.Mesh(
            new THREE.PlaneGeometry(1000, 1000),
            uvGridMaterial
        )
        ground.rotation.x = - Math.PI * 0.5
        this.scene.add(ground)

        // Physical ground
        this.game.physics.addEntity({
            type: 'fixed',
            colliders: [ { shape: 'cuboid', parameters: [ 100, 1, 100 ], position: { x: 0, y: - 1.01, z: 0 } } ]
        })

        // Debug
        if(this.game.debug.active)
        {
            const gridFolder = this.game.debug.panel.addFolder({
                title: '🌐 Grid',
                expanded: true,
            })

            gridFolder.addBinding(uvGridMaterial, 'scale', { min: 0, max: 0.002, step: 0.0001 })

            for(const line of lines)
            {
                const lineFolder = gridFolder.addFolder({
                    title: 'Line',
                    expanded: true,
                })
                lineFolder.addBinding(line.scale, 'value', { label: 'scale', min: 0, max: 1, step: 0.001 })
                lineFolder.addBinding(line.thickness, 'value', { label: 'thickness', min: 0, max: 1, step: 0.001 })
                lineFolder.addBinding(line.offset, 'value', { label: 'offset', min: 0, max: 1, step: 0.001 })
                lineFolder.addBinding(line.cross, 'value', { label: 'cross', min: 0, max: 1, step: 0.001 })
                lineFolder.addBinding({ color: '#' + line.color.value.getHexString(THREE.SRGBColorSpace) }, 'color').on('change', tweak => line.color.value.set(tweak.value))
            }
        }
    }
    
    setTestCube()
    {
        const visualCube = new THREE.Mesh(
            new THREE.BoxGeometry(1, 1, 1),
            new THREE.MeshNormalNodeMaterial()
        )
        this.scene.add(visualCube)

        this.game.physics.addEntity(
            {
                type: 'dynamic',
                position: { x: 0, y: 4, z: 0 },
                colliders: [ { shape: 'cuboid', parameters: [ 0.5, 0.5, 0.5 ] } ]
            },
            visualCube
        )
    }

    update()
    {
    }
}