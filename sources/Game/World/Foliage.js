import * as THREE from 'three/webgpu'
import { Game } from '../Game.js'
import { color, uniform, mix, output, instance, smoothstep, min, vec4, PI, vertexIndex, rotateUV, sin, uv, texture, float, Fn, positionLocal, vec3, transformNormalToView, normalWorld, positionWorld, frontFacing, If, screenUV, vec2, viewportResolution, screenSize, instanceIndex, varying, range } from 'three/tsl'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { remap } from '../utilities/maths.js'
import { MeshDefaultMaterial } from '../Materials/MeshDefaultMaterial.js'
import { alea } from 'seedrandom'

const rng = new alea('foliage')

export class Foliage
{
    constructor(references, colorNode, seeThrough = false)
    {
        this.game = Game.getInstance()

        this.references = references
        this.colorNode = colorNode
        this.seeThrough = seeThrough
        this.seeThroughMultiplier = 1

        this.setGeometry()
        this.setMaterial()
        this.setFromReferences()
        this.setInstancedMesh()

        this.game.ticker.events.on('tick', () =>
        {
            this.update()
        }, 10)
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
                1 - Math.pow(rng(), 3),
                Math.PI * 2 * rng(),
                Math.PI * rng()
            )
            const position = new THREE.Vector3().setFromSpherical(spherical)

            plane.rotateZ(rng() * 9999)
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

                const mixedNormal = position.lerp(normal, 0.85)
                
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
        this.material = {}
        
        // Alpha
        this.material.threshold = uniform(0.3)

        this.material.seeThroughPosition = uniform(vec2())
        this.material.seeThroughEdgeMin = uniform(0.11)
        this.material.seeThroughEdgeMax = uniform(0.57)

        const alphaNode = Fn(() =>
        {
            let alpha = float(1)

            // See through around the vehicle
            if(this.seeThrough)
            {
                // Distance to vehicle fade
                const toVehicle = screenUV.sub(this.material.seeThroughPosition)
                toVehicle.mulAssign(vec2(screenSize.x.div(screenSize.y), 1))
                const distanceToVehicle = toVehicle.length()
                const distanceFade = smoothstep(this.material.seeThroughEdgeMin, this.material.seeThroughEdgeMax, distanceToVehicle)

                // Foliage texture
                const foliageSDF = texture(this.game.resources.foliageTexture).r

                // Alpha
                alpha.assign(foliageSDF.mul(distanceFade.mul(this.material.threshold.oneMinus()).add(this.material.threshold)))
            }
            else
            {
                // Alpha
                alpha.assign(texture(this.game.resources.foliageTexture).r)
            }

            alpha.subAssign(this.material.threshold)
            return alpha
        })()
        
        // Instance
        this.material.instance = new MeshDefaultMaterial({
            // shadowSide: THREE.FrontSide,
            colorNode: this.colorNode,
            alphaNode: alphaNode,
            hasWater: false
        })
    
        // Position
        const wind = this.game.wind.offsetNode(positionLocal.xz)
        const multiplier = positionLocal.y.clamp(0, 1).mul(1)

        this.material.instance.positionNode = Fn( ( { object } ) =>
        {
            instance(object.count, this.instanceMatrix).toStack()

            return positionLocal.add(vec3(wind.x, 0, wind.y).mul(multiplier))
        })()

        // Received shadow position
        this.material.shadowOffset = uniform(1)
        this.material.instance.receivedShadowPositionNode = positionLocal.add(this.game.lighting.directionUniform.mul(this.material.shadowOffset))

        this.material.instance.castShadowNode = Fn(() =>
        {
            const alphaColor = texture(this.game.resources.foliageTexture).r
            alphaColor.lessThan(0.5).discard()
            return vec4(0, 1, 1, 1)
        })()
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
            const angle = Math.PI * 2 * rng()
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
        this.mesh = new THREE.InstancedMesh(this.geometry, this.material.instance, this.transformMatrices.length)
        this.mesh.receiveShadow = true
        this.mesh.castShadow = true
        this.mesh.count = this.transformMatrices.length
        this.mesh.frustumCulled = false
        this.game.scene.add(this.mesh)

        this.instanceMatrix = new THREE.InstancedBufferAttribute(new Float32Array(this.mesh.count * 16), 16)
        this.instanceMatrix.setUsage(THREE.StaticDrawUsage)

        let i = 0
        for(const matrix of this.transformMatrices)
        {
            matrix.toArray(this.instanceMatrix.array, i * 16)
            i++
        }
    }

    update()
    {
        this.material.seeThroughPosition.value.copy(this.game.world.visualVehicle.screenPosition)

        this.material.seeThroughEdgeMin.value = 3 / this.game.view.spherical.radius.current * this.seeThroughMultiplier
        this.material.seeThroughEdgeMax.value = 15 / this.game.view.spherical.radius.current * this.seeThroughMultiplier
    }
}