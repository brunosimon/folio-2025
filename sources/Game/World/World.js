import * as THREE from 'three/webgpu'
import { Game } from '../Game.js'
import { Foliage } from './Foliage.js'
import { Flowers } from './Flowers.js'
import { Floor } from './Floor.js'
import { Grass } from './Grass.js'
import { Playground } from './Playground.js'
import { Bricks } from './Bricks.js'
import { cameraNormalMatrix, Fn, instance, materialNormal, modelNormalMatrix, normalGeometry, normalLocal, normalView, normalWorld, positionGeometry, positionLocal, transformedNormalWorld, vec3, vec4 } from 'three/tsl'
import { Christmas } from './Christmas.js'
import { InstancedGroup } from '../InstancedGroup.js'
import { Trees } from './Trees.js'
import Bushes from './Bushes.js'
import { WaterSurface } from './WaterSurface.js'
import { Scenery } from './Scenery.js'
import { WindLines } from './WindLines.js'
import { PoleLights } from './PoleLights.js'
import { Leaves } from './Leaves.js'
import { Lightnings } from './Lightnings.js'
import { RainSnow } from './RainSnow.js'

export class World
{
    constructor()
    {
        this.game = Game.getInstance()

        this.floor = new Floor('terrain')
        this.scenery = new Scenery()
        this.waterSurface = new WaterSurface()
        this.grass = new Grass()
        this.bushes = new Bushes()
        this.birchTrees = new Trees('Birch Tree', this.game.resources.birchTreesVisualModel.scene, this.game.resources.birchTreesReferencesModel.scene.children, '#ff782b')
        this.oakTrees = new Trees('Oak Tree', this.game.resources.oakTreesVisualModel.scene, this.game.resources.oakTreesReferencesModel.scene.children, '#c4c557')
        this.cherryTrees = new Trees('Cherry Tree', this.game.resources.cherryTreesVisualModel.scene, this.game.resources.cherryTreesReferencesModel.scene.children, '#ff6da8')
        this.flowers = new Flowers()
        this.bricks = new Bricks()
        this.windLines = new WindLines()
        this.poleLights = new PoleLights()
        // this.leaves = new Leaves()
        this.rainSnow = new RainSnow()
        this.lightnings = new Lightnings()
        // this.playground = new Playground()
        // this.christmas = new Christmas()

        this.setAxesHelper()
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
            alphaMap: this.game.resources.foliateTexture,
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
                alphaMap: this.game.resources.foliateTexture,
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