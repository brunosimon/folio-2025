import * as THREE from 'three/webgpu'
import { Game } from '../Game.js'
import { color, uniform, mix, output, instance, smoothstep, min, vec4, PI, vertexIndex, rotateUV, sin, uv, texture, float, Fn, positionLocal, vec3, transformNormalToView, normalWorld, positionWorld, frontFacing, If, screenUV, vec2, viewportResolution, screenSize, instanceIndex, varying, range } from 'three/tsl'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { remap } from '../utilities/maths.js'

export class Foliage
{
    constructor(references, color, seeThrough = false)
    {
        this.game = Game.getInstance()

        this.references = references
        this.color = color
        this.seeThrough = seeThrough

        this.setGeometry()
        this.setMaterial()
        this.setFromReferences()
        this.setInstancedMesh()

        this.game.ticker.events.on('tick', () =>
        {
            this.update()
        }, 7)
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
        this.material.instance = new THREE.MeshLambertNodeMaterial()
    
        // Position
        const wind = this.game.wind.offsetNode([positionLocal.xz])
        const multiplier = positionLocal.y.clamp(0, 1).mul(1)

        this.material.instance.positionNode = Fn( ( { object } ) =>
        {
            // Sending "instanceMatrix" twice because mandatory 3 parameters
            // TODO: Update after Three.js fix
            instance(object.count, this.instanceMatrix, this.instanceMatrix).append()

            return positionLocal.add(vec3(wind.x, 0, wind.y).mul(multiplier))
        })()

        // Received shadow position
        this.material.shadowOffset = uniform(1)
        this.material.instance.shadowPositionNode = positionLocal.add(this.game.lighting.directionUniform.mul(this.material.shadowOffset))

        // Shadow receive
        const totalShadows = this.game.lighting.addTotalShadowToMaterial(this.material.instance)

        // Output
        const uniformColor = uniform(this.color)
        this.material.threshold = uniform(0.3)

        this.material.seeThroughPosition = uniform(vec2())
        this.material.seeThroughEdgeMin = uniform(0.25)
        this.material.seeThroughEdgeMax = uniform(0.5)
        this.material.seeThroughTresholdAmplitude = uniform(0.7)
        this.material.seeThroughNoiseFrequency = uniform(0.335)
        this.material.seeThroughNoiseStrength = uniform(0.5)

        this.material.instance.outputNode = Fn(() =>
        {
            // XRay around the vehicle
            if(this.seeThrough)
            {
                const toVehicle = screenUV.sub(this.material.seeThroughPosition).toVar()
                toVehicle.mulAssign(vec2(screenSize.x.div(screenSize.y), 1))
                const distanceToVehicle = toVehicle.length()

                // Apply noise to add variations
                const noiseUv = screenUV.toVar()
                noiseUv.x.mulAssign(screenSize.x.div(screenSize.y))
                noiseUv.addAssign(vec2(range(0, 100).mul(0.1)))
                const noise = texture(this.game.noises.others, noiseUv.mul(this.material.seeThroughNoiseFrequency)).r

                distanceToVehicle.addAssign(noise.sub(0.5).mul(this.material.seeThroughNoiseStrength))

                // Visibility threshold
                const visibilityThreshold = distanceToVehicle.remapClamp(
                    this.material.seeThroughEdgeMin,
                    this.material.seeThroughEdgeMax,
                    this.material.threshold.add(this.material.seeThroughTresholdAmplitude),
                    this.material.threshold
                ).toVar()

                // Foliage texture
                const visibility = texture(this.game.resources.foliageTexture).r

                // Discard
                visibility.lessThan(visibilityThreshold).discard()
            }
            else
            {
                // Discard
                const visibility = texture(this.game.resources.foliageTexture).r
                visibility.lessThan(this.material.threshold).discard()
            }

            // Lighting
            return this.game.lighting.lightOutputNodeBuilder(uniformColor, float(1), normalWorld, totalShadows)
        })()

        this.material.instance.castShadowNode = Fn(() =>
        {
            const alphaColor = texture(this.game.resources.foliageTexture).r
            alphaColor.lessThan(0.5).discard()
            return vec4(0.0)
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
        this.mesh = new THREE.Mesh(this.geometry, this.material.instance)
        this.mesh.receiveShadow = true
        this.mesh.castShadow = true
        this.mesh.count = this.transformMatrices.length
        this.mesh.frustumCulled = false
        this.game.scene.add(this.mesh)

        this.instanceMatrix = new THREE.InstancedBufferAttribute(new Float32Array(this.mesh.count * 16), 16)
        this.instanceMatrix.setUsage(THREE.StaticDrawUsage)

        let i = 0
        for(const _item of this.transformMatrices)
        {
            _item.toArray(this.instanceMatrix.array, i * 16)
            i++
        }
    }

    update()
    {
        this.material.seeThroughPosition.value.copy(this.game.world.visualVehicle.screenPosition)
    }
}