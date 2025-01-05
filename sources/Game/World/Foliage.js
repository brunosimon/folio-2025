import * as THREE from 'three/webgpu'
import { Game } from '../Game.js'
import { color, uniform, normalLocal, mix, output, instance, smoothstep, vec4, PI, vertexIndex, rotateUV, time, sin, uv, texture, float, Fn, positionLocal, vec3, transformNormalToView, normalWorld, positionWorld, frontFacing, If } from 'three/tsl'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { remap } from '../utilities/maths.js'

export class Foliage
{
    constructor(references, color)
    {
        this.game = Game.getInstance()

        this.references = references
        this.color = color

        this.setGeometry()
        this.setMaterial()
        this.setFromReferences()
        this.setInstancedMesh()
    }

    setGeometry()
    {
        const count = 80
        const planes = []

        for(let i = 0; i < count; i++)
        {
            const plane = new THREE.PlaneGeometry(0.8, 0.8)

            // Position
            const spherical = new THREE.Spherical(
                1 - Math.pow(Math.random(), 3),
                Math.PI * 2 * Math.random(),
                Math.PI * Math.random()
            )
            const position = new THREE.Vector3().setFromSpherical(spherical)

            plane.rotateZ(Math.random() * 9999)
            plane.rotateY(0)
            plane.translate(
                position.x,
                position.y,
                position.z
            )

            // Normal
            const normal = position.clone().normalize()
            const normalArray = new Float32Array(12)
            for(let i = 0; i < 4; i++)
            {
                const i3 = i * 3

                const position = new THREE.Vector3(
                    plane.attributes.position.array[i3    ],
                    plane.attributes.position.array[i3 + 1],
                    plane.attributes.position.array[i3 + 2],
                )

                const mixedNormal = position.lerp(normal, 0.75)
                
                normalArray[i3    ] = mixedNormal.x
                normalArray[i3 + 1] = mixedNormal.y
                normalArray[i3 + 2] = mixedNormal.z
            }
            
            plane.setAttribute('normal', new THREE.BufferAttribute(normalArray, 3))

            // Save
            planes.push(plane)
        }

        // Merge all planes
        this.geometry = mergeGeometries(planes)
    }

    setMaterial()
    {
        this.material = new THREE.MeshLambertNodeMaterial({
            alphaMap: this.game.resources.foliateTexture,
            alphaTest: 0.01
        })
    
        // Position
        const wind = this.game.wind.offsetNode([positionLocal.xz])
        const multiplier = positionLocal.y.clamp(0, 1).mul(1)

        this.material.positionNode = Fn( ( { object } ) =>
        {
            instance(object.count, this.instanceMatrix).append()

            return positionLocal.add(vec3(wind.x, 0, wind.y).mul(multiplier))
        })()

        // Received shadow position
        this.shadowOffset = uniform(1)
        this.material.shadowPositionNode = positionLocal.add(this.game.lighting.directionUniform.mul(this.shadowOffset))

        // Shadow receive
        const totalShadows = this.game.materials.getTotalShadow(this.material)

        // Output
        const uniformColor = uniform(this.color)

        this.material.outputNode = this.game.materials.lightOutputNodeBuilder(uniformColor, totalShadows)
    }

    setFromReferences()
    {
        this.transformMatrices = []

        const towardCamera = this.game.view.spherical.offset.clone().normalize()

        for(const _child of this.references)
        {
            const size = _child.scale.x

            const object = new THREE.Object3D()
            
            // Rotate randomly but always facing the camera default angle
            const angle = Math.PI * 2 * Math.random()
            object.up.set(Math.sin(angle), Math.cos(angle), 0)
            object.lookAt(towardCamera)

            object.position.copy(_child.position)
            object.scale.setScalar(size)
            object.updateMatrix()

            this.transformMatrices.push(object.matrix)
        }
    }
    
    setInstancedMesh()
    {
        this.mesh = new THREE.Mesh(this.geometry, this.material)
        this.mesh.receiveShadow = true
        this.mesh.castShadow = true
        this.mesh.count = this.transformMatrices.length
        this.mesh.frustumCulled = false
        this.game.scene.add(this.mesh)

        this.instanceMatrix = new THREE.InstancedBufferAttribute(new Float32Array(this.mesh.count * 16), 16)
        this.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
        
        let i = 0
        for(const _item of this.transformMatrices)
        {
            _item.toArray(this.instanceMatrix.array, i * 16)
            i++
        }
    }
}