import * as THREE from 'three'
import { Game } from '../Game.js'

import { Terrain } from './Terrain.js'
import { Bushes } from './Bushes.js'
import { Floor } from './Floor.js'
import { Grass } from './Grass.js'
import { remap } from '../utilities/maths.js'

export class World
{
    constructor()
    {
        this.game = new Game()

        this.floor = new Floor()
        this.grass = new Grass()
        // this.setTestCube()
        this.setAxesHelper()
        this.setBushes()
    }

    setAxesHelper()
    {
        const axesHelper = new THREE.AxesHelper()
        axesHelper.position.y = 2
        this.game.scene.add(axesHelper)
    }

    setBushes()
    {
        // Clusters
        const items = []
        for(let i = 0; i < 80; i++)
        {
            const clusterPosition = new THREE.Vector2(
                (Math.random() - 0.5) * 50,
                (Math.random() - 0.5) * 50
            )

            const clusterCount = 3 + Math.floor(Math.random() * 5)
            for(let j = 3; j < clusterCount; j++)
            {
                const size = remap(Math.random(), 0, 1, 0.5, 1)
                const position = new THREE.Vector3(
                    clusterPosition.x + (Math.random() - 0.5) * 3,
                    size * 0.5,
                    clusterPosition.y + (Math.random() - 0.5) * 3
                )
                const quaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.random() * 999, Math.random() * 999, Math.random() * 999))
                const scale = new THREE.Vector3().setScalar(size)

                const matrix = new THREE.Matrix4()
                matrix.compose(position, quaternion, scale)

                items.push(matrix)
            }
        }

        // // One
        // const items = []
        // const position = new THREE.Vector3(0, 0.5, 2)
        // const quaternion = new THREE.Quaternion()
        // const scale = new THREE.Vector3(1, 1, 1)

        // const matrix = new THREE.Matrix4()
        // matrix.compose(position, quaternion, scale)
        // items.push(matrix)

        // // Grid
        // const items = []
        // const subdivisions = 100
        // for(let i = 0; i < subdivisions; i++)
        // {
        //     for(let j = 0; j < subdivisions; j++)
        //     {
        //         const x = ((i / subdivisions) - 0.5) * subdivisions * 3
        //         const z = ((j / subdivisions) - 0.5) * subdivisions * 3

        //         const position = new THREE.Vector3(x, 0, z)
        //         const quaternion = new THREE.Quaternion()
        //         const scale = new THREE.Vector3(1, 1, 1)

        //         const matrix = new THREE.Matrix4()
        //         matrix.compose(position, quaternion, scale)
        //         items.push(matrix)
        //     }
        // }

        this.bushes = new Bushes(items)
    }

    setTestCube()
    {
        const visualCube = new THREE.Mesh(
            new THREE.BoxGeometry(1, 1, 1),
            new THREE.MeshNormalNodeMaterial()
        )
        this.game.scene.add(visualCube)

        this.game.physics.addEntity(
            {
                type: 'dynamic',
                position: { x: 0, y: 4, z: 0 },
                colliders: [ { shape: 'cuboid', parameters: [ 0.5, 0.5, 0.5 ] } ]
            },
            visualCube
        )
    }
}