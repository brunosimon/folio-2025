import * as THREE from 'three/webgpu'
import { Game } from '../Game.js'
import { Field } from './Field.js'
import { Grid } from './Grid.js'
import { Grass } from './Grass.js'
import { Fn, instance, positionLocal } from 'three/tsl'
import { WaterSurface } from './WaterSurface.js'
import { Scenery } from './Scenery.js'
import { WindLines } from './WindLines.js'
import { Leaves } from './Leaves.js'
import { Lightnings } from './Lightnings.js'
import { Rain } from './Rain.js'
import { Snow } from './Snow.js'
import { Whispers } from './Whispers.js'
import { VisualVehicle } from './VisualVehicle.js'
import { Tornado } from './Tornado.js'
import { Easter } from '../Easter.js'

export class World
{
    constructor()
    {
        this.game = Game.getInstance()

        this.visualVehicle = new VisualVehicle()
        this.field = new Field()
        // this.grid = new Grid()
        this.waterSurface = new WaterSurface()
        this.grass = new Grass()
        this.windLines = new WindLines()
        this.leaves = new Leaves()
        this.rainSnow = new Rain()
        this.lightnings = new Lightnings()
        this.snow = new Snow()
        this.whispers = new Whispers()
        this.tornado = new Tornado()
        this.scenery = new Scenery()

        // this.setAxesHelper()
        // this.setCollisionGroupsTest()
        // this.setNormalTest()
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
            alphaMap: this.game.resources.foliageTexture,
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
                alphaMap: this.game.resources.foliageTexture,
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
            visualCube,
            {
                type: 'dynamic',
                position: { x: 0, y: 4, z: 0 },
                colliders: [ { shape: 'cuboid', parameters: [ 0.5, 0.5, 0.5 ] } ]
            }
        )
    }

    setAxesHelper()
    {
        const axesHelper = new THREE.AxesHelper()
        axesHelper.position.y = 0.1
        this.game.scene.add(axesHelper)
    }

    setCollisionGroupsTest()
    {
        // // Left (object)
        // this.game.entities.add(
        //     {
        //         type: 'dynamic',
        //         position: { x: 4, y: 2, z: 0.1 },
        //         colliders: [ { shape: 'cuboid', parameters: [ 0.5, 0.5, 0.5 ], category: 'object' } ]
        //     }
        // )

        // Right (terrain)
        this.game.entities.add(
            null,
            {
                type: 'dynamic',
                position: { x: 4, y: 2, z: -1.1 },
                colliders: [ { shape: 'cuboid', parameters: [ 0.5, 0.5, 0.5 ], category: 'floor' } ]
            }
        )

        // // Top (bumper)
        // this.game.entities.add(
        //     {
        //         type: 'dynamic',
        //         position: { x: 4, y: 4, z: -0.5 },
        //         colliders: [ { shape: 'cuboid', parameters: [ 0.5, 0.5, 0.5 ], category: 'bumper' } ]
        //     }
        // )
    }

    // setNormalTest()
    // {
    //     const geometry = new THREE.IcosahedronGeometry(1, 2)

    //     const material = new THREE.MeshLambertNodeMaterial()

    //     material.normalNode = normalView
    //     // const newNormal = 
    //     // material.normalNode = vec3(0, 1, 0)

    //     // material.positionNode = Fn(() =>
    //     // {
    //     //     // materialNormal.assign(vec3(0, 1, 0))
    //     //     return positionGeometry
    //     // })()
    //     material.outputNode = vec4(transformedNormalWorld, 1)

    //     const mesh = new THREE.Mesh(geometry, material)
    //     mesh.position.y = 2

    //     this.game.scene.add(mesh)
    // }
}