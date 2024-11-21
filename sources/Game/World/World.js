import * as THREE from 'three'
import { instance, Fn, vec2, vec3, mat4, attribute, positionLocal } from 'three'
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
        // this.setTest()
    }

    setAxesHelper()
    {
        const axesHelper = new THREE.AxesHelper()
        axesHelper.position.y = 1.5
        this.game.scene.add(axesHelper)
    }

    setBushes()
    {
        const towardCamera = this.game.view.spherical.offset.clone().normalize()

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
                const size = remap(Math.random(), 0, 1, 0.5, 1.25)

                const object = new THREE.Object3D()
                
                const angle = Math.PI * 2 * Math.random()
                object.up.set(Math.sin(angle), Math.cos(angle), 0)
                object.lookAt(towardCamera)

                object.position.set(
                    clusterPosition.x + (Math.random() - 0.5) * 3,
                    size * 0.5,
                    clusterPosition.y + (Math.random() - 0.5) * 3
                )

                object.scale.setScalar(size)
                object.updateMatrix()

                items.push(object.matrix)
            }
        }

        // // One
        // const items = []
        // const object = new THREE.Object3D()
        // object.lookAt(towardCamera)
        // object.position.z = -4
        // object.updateMatrix()

        // items.push(object.matrix)

        // // Grid
        // const items = []
        // const subdivisions = 100
        // for(let i = 0; i < subdivisions; i++)
        // {
        //     for(let j = 0; j < subdivisions; j++)
        //     {
        //         const x = ((i / subdivisions) - 0.5) * subdivisions * 10
        //         const z = ((j / subdivisions) - 0.5) * subdivisions * 10

        //         const object = new THREE.Object3D()
                
        //         const angle = Math.PI * 2 * Math.random()
        //         object.up.set(Math.sin(angle), Math.cos(angle), 0)
        //         object.lookAt(towardCamera)

        //         object.position.set(x, 0.25, z)

        //         object.updateMatrix()

        //         items.push(object.matrix)
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

    setTest()
    {
        const geometry = new THREE.BoxGeometry(1, 1, 1, 10, 10, 10)
        const count = 10

        const material = new THREE.MeshBasicNodeMaterial({ wireframe: true })
        const mesh = new THREE.Mesh(geometry, material)
        mesh.count = count

        const instanceMatrix = new THREE.InstancedBufferAttribute(new Float32Array(count * 16), 16)
        instanceMatrix.setUsage(THREE.DynamicDrawUsage)

        material.positionNode = Fn( ( { object } ) =>
        {
            instance(object.count, instanceMatrix).append()

            const elevation = positionLocal.y.clamp(0, 1)
            const fakeWind = vec2(1, 1)
            return positionLocal.add(vec3(fakeWind.mul(elevation), 0).mul(3))
        })()

        this.game.scene.add(mesh)
        
        for(let i = 0; i < count; i++)
        {
            const x = (Math.random() - 0.5) * 10
            const z = (Math.random() - 0.5) * 10

            const position = new THREE.Vector3(x, 0, z)
            const quaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.random() * 999, 0))
            const scale = new THREE.Vector3(1, 1, 1)

            const matrix = new THREE.Matrix4()
            matrix.compose(position, quaternion, scale)
            matrix.toArray(instanceMatrix.array, i * 16)
        }

        // const geometry = new THREE.BoxGeometry(1, 1, 1, 10, 10, 10)
        // const material = new THREE.MeshBasicNodeMaterial({ wireframe: true })
        // const mesh = new THREE.Mesh(geometry, material)
        // mesh.count = 10

        // const instanceMatrix = new THREE.InstancedBufferAttribute(new Float32Array(mesh.count * 16), 16)
        // instanceMatrix.setUsage(THREE.DynamicDrawUsage)

        // mesh.material.positionNode = Fn( ( { object } ) =>
        // {
        //     instance(object.count, instanceMatrix).append()

        //     return positionLocal
        // } )()

        // this.game.scene.add(mesh)

        // for(let i = 0; i < mesh.count; i++)
        // {
        //     const x = (Math.random() - 0.5) * 10
        //     const z = (Math.random() - 0.5) * 10

        //     const position = new THREE.Vector3(x, 0, z)
        //     const quaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.random() * 999, 0))
        //     const scale = new THREE.Vector3(1, 1, 1)

        //     const matrix = new THREE.Matrix4()
        //     matrix.compose(position, quaternion, scale)
        //     matrix.toArray(instanceMatrix.array, i * 16)
        // }
        // // mesh.instanceMatrix.needsUpdate = true
    }
}