import * as THREE from 'three/webgpu'
import { Game } from '../Game.js'
import { attribute, color, float, Fn, instance, instancedBufferAttribute, instanceIndex, luminance, mix, normalWorld, positionLocal, texture, uniform, uniformArray, uv, vec3, vec4 } from 'three/tsl'
import { remap, smoothstep } from '../utilities/maths.js'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { MeshDefaultMaterial } from '../Materials/MeshDefaultMaterial.js'
import { alea } from 'seedrandom'

const rng = new alea('flowers')

export class Flowers
{
    constructor()
    {
        this.game = Game.getInstance()

        // Debug
        if(this.game.debug.active)
        {
            this.debugPanel = this.game.debug.panel.addFolder({
                title: '🌸 Flowers',
                expanded: false,
            })
        }

        // this.setOne()
        this.setClusters()
        
        this.setGeometry()
        this.setMaterial()
        this.setInstancedMesh()
    }


    setOne()
    {
        this.transformMatrices = []
        const object = new THREE.Object3D()
        object.position.set(0, 0.4, 4)
        object.scale.set(1, 1, 1)
        
        object.updateMatrix()

        this.transformMatrices.push(object.matrix)
    }

    setClusters()
    {
        this.transformMatrices = []

        let i = 0
        for(const reference of this.game.resources.flowersReferencesModel.scene.children)
        {
            const clusterPosition = reference.position

            const clusterCount = 3 + Math.floor(rng() * 8)
            // const clusterCount = 1
            for(let j = 0; j < clusterCount; j++)
            {
                // Transform matrix
                const object = new THREE.Object3D()
                
                object.rotation.y = Math.PI * 2 * rng()

                object.position.set(
                    clusterPosition.x + (rng() - 0.5) * 3,
                    clusterPosition.y,
                    clusterPosition.z + (rng() - 0.5) * 3
                )

                const scale = 0.6 + rng() * 0.4
                object.scale.setScalar(scale)
                
                object.updateMatrix()

                this.transformMatrices.push(object.matrix)
            }
            i++
        }
    }

    setGeometry()
    {
        const count = 8
        const planes = []

        for(let i = 0; i < count; i++)
        {
            const plane = new THREE.PlaneGeometry(0.08, 0.08)

            // Position
            const spherical = new THREE.Spherical(
                1,
                Math.PI * 0.2 * rng(),
                Math.PI * 2 * rng()
            )
            const direction = new THREE.Vector3().setFromSpherical(spherical)
            const position = direction.clone().setLength(1 + (rng() - 0.5) * 0.5)
            position.y -= 0.75
            
            const matrix = new THREE.Matrix4()
            matrix.lookAt(direction, new THREE.Vector3(), new THREE.Vector3(0, 1, 0))
            matrix.setPosition(position)
            matrix.scale(new THREE.Vector3(1, 1, 1).setScalar(1 + (Math.random() - 0.5)))
            
            plane.applyMatrix4(matrix)

            // Save
            planes.push(plane)
        }

        // Merge all planes
        this.geometry = mergeGeometries(planes)

        // Remove unsused attributes
        this.geometry.deleteAttribute('uv')
    
    }

    setMaterial()
    {
        const baseColor = uniform(color('#ffffff'))

        this.material = new MeshDefaultMaterial({
            side: THREE.DoubleSide,
            colorNode: baseColor,
            hasWater: false
        })
    
        // Received shadow position
        const shadowOffset = uniform(0.25)
        this.material.receivedShadowPositionNode = positionLocal.add(this.game.lighting.directionUniform.mul(shadowOffset))

        // Position
        const wind = this.game.wind.offsetNode(positionLocal.xz)
        const multiplier = positionLocal.y.clamp(0, 1).mul(1)

        this.material.positionNode = Fn( ( { object } ) =>
        {
            instance(object.count, this.instanceMatrix).toStack()

            return positionLocal.add(vec3(wind.x, 0, wind.y).mul(multiplier))
        })()

        // Debug
        if(this.game.debug.active)
        {
            this.game.debug.addThreeColorBinding(this.debugPanel, baseColor.value, 'baseColor')
        }
    }

    setInstancedMesh()
    {
        this.mesh = new THREE.Mesh(this.geometry, this.material)
        // this.mesh.position.y = - 0.5
        this.mesh.castShadow = true
        this.mesh.receiveShadow = true
        this.mesh.count = this.transformMatrices.length
        this.mesh.frustumCulled = false
        this.game.worldContainer.add(this.mesh)

        this.instanceMatrix = new THREE.InstancedBufferAttribute(new Float32Array(this.mesh.count * 16), 16)
        this.instanceMatrix.setUsage(THREE.StaticDrawUsage)

        // this.instanceMatrix = new THREE.InstancedBufferAttribute(new Float32Array(this.mesh.count * 3), 16)
        // this.instanceMatrix.setUsage(THREE.StaticDrawUsage)

        this.instanceColorIndex = new THREE.InstancedBufferAttribute(new Float32Array(this.colorIndices), 1)
        this.instanceColorIndex.setUsage(THREE.StaticDrawUsage)
        
        let i = 0
        for(const _transformMatrix of this.transformMatrices)
        {
            _transformMatrix.toArray(this.instanceMatrix.array, i * 16)
            i++
        }
    }
}