import * as THREE from 'three/webgpu'
import { Game } from '../Game.js'
import { Bushes } from './Bushes.js'
import { Flowers } from './Flowers.js'
import { Terrain } from './Terrain.js'
import { Grass } from './Grass.js'
import { Playground } from './Playground.js'
import { Bricks } from './Bricks.js'
import { Fn, instance, positionLocal } from 'three/tsl'
import { Christmas } from './Christmas.js'
import { InstancedGroup } from '../InstancedGroup.js'

export class World
{
    constructor()
    {
        this.game = Game.getInstance()

        this.terrain = new Terrain()
        this.grass = new Grass()
        this.bushes = new Bushes()
        this.flowers = new Flowers()
        // this.playground = new Playground()
        this.bricks = new Bricks()
        // this.christmas = new Christmas()
        // this.setTestCube()
        // this.setTestShadow()
        // this.setAxesHelper()
    }

    setTestShadow()
    {
        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(20, 20),
            new THREE.MeshLambertNodeMaterial(),
        )
        floor.receiveShadow = true
        floor.position.set(0, 0.5, 0)
        floor.rotation.x = - Math.PI * 0.5
        this.game.scene.add(floor)

        const material = new THREE.MeshLambertNodeMaterial({
            alphaMap: this.game.resources.bushesLeaves,
            transparent: true
        })
        material.positionNode = Fn( ( { object } ) =>
        {
            instance(object.count, instanceMatrix).append()
            return positionLocal
        })()

        const geometry = new THREE.BoxGeometry(1, 1, 1)

        // const mesh = new THREE.Mesh(geometry, material)
        // mesh.receiveShadow = true
        // mesh.castShadow = true
        // mesh.count = 1
        // this.game.scene.add(mesh)

        // const instanceMatrix = new THREE.InstancedBufferAttribute(new Float32Array(mesh.count * 16), 16)
        // instanceMatrix.setUsage(THREE.DynamicDrawUsage)
        
        // const matrix = new THREE.Matrix4().makeTranslation(new THREE.Vector3(0, 2, 0))
        // matrix.toArray(instanceMatrix.array, 0)

        const dummy = new THREE.Mesh(
            geometry,
            new THREE.MeshLambertNodeMaterial({
                alphaMap: this.game.resources.bushesLeaves,
                transparent: true
            }),
        )
        dummy.receiveShadow = true
        dummy.castShadow = true
        dummy.position.set(0, 2, 3)
        this.game.scene.add(dummy)
    }

    setTestCube()
    {
        const visualCube = new THREE.Mesh(
            new THREE.BoxGeometry(1, 1, 1),
            new THREE.MeshNormalNodeMaterial()
        )

        this.game.entities.add(
            {
                type: 'dynamic',
                position: { x: 0, y: 4, z: 0 },
                colliders: [ { shape: 'cuboid', parameters: [ 0.5, 0.5, 0.5 ] } ]
            },
            visualCube
        )
    }

    setAxesHelper()
    {
        const axesHelper = new THREE.AxesHelper()
        axesHelper.position.y = 0
        this.game.scene.add(axesHelper)
    }
}