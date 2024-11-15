import * as THREE from 'three'
import { Game } from '../Game.js'
import getWind from '../tsl/getWind.js'
import { smoothstep, vec4, PI, vertexIndex, rotateUV, time, sin, uv, texture, float, Fn, positionLocal, vec3, transformNormalToView, normalWorld, positionWorld, frontFacing, If } from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { remap } from '../utilities/maths.js'

export class Bushes
{
    constructor(_items)
    {
        this.game = new Game()

        this.items = _items

        this.game.resources.load(
            [
                { path: 'bush/bush-leaves.png', type: 'texture', name: 'bushLeaves' },
                { path: 'matcaps/bushOnGreen.png', type: 'texture', name: 'matcapBushOnGreen' },
                { path: 'noises-128x128.png', type: 'texture', name: 'noisesTexture' },
            ],
            (resources) =>
            {
                this.resources = resources
                this.resources.matcapBushOnGreen.colorSpace = THREE.SRGBColorSpace
                this.resources.noisesTexture.wrapS = THREE.RepeatWrapping
                this.resources.noisesTexture.wrapT = THREE.RepeatWrapping
                this.init()
            }
        )
    }

    init()
    {
        this.setGeometry()
        this.setMaterial()
        this.setInstancedMesh()
    }

    setGeometry()
    {
        const count = 100
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
            plane.rotateX(Math.random() * 9999)
            plane.rotateY(Math.random() * 9999)
            plane.rotateZ(Math.random() * 9999)
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

                const mixedNormal = position.lerp(normal, 0.4)
                
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
        // this.material = new THREE.MeshBasicNodeMaterial({ side: THREE.DoubleSide })
        // this.material = new THREE.MeshNormalNodeMaterial({ side: THREE.DoubleSide })
        this.material = new THREE.MeshMatcapNodeMaterial({
            side: THREE.DoubleSide,
            matcap: this.resources.matcapBushOnGreen,
            alphaMap: this.resources.bushLeaves,
            alphaTest: 0.01
        })
    
        this.material.normalNode = Fn(() =>
        {
            const normal = normalWorld.toVar()

            If(frontFacing.not(), () =>
            {
                normal.assign(normal.negate())
            })
            
            return transformNormalToView(normal)
        })()

        const wind = getWind([this.resources.noisesTexture, positionLocal.xz])
        // const multiplier = positionLocal.y.clamp(0, 1).mul(40.5)
        // this.material.positionNode = positionLocal.add(vec3(wind.x, 0, wind.y).mul(multiplier))

        const timeOffset = float(vertexIndex).div(4).floor().div(100)
        const shakeStrength = smoothstep(0.1, 0.2, wind.length()).mul(0.2)
        const shake = sin(time.add(timeOffset).mul(30))
        const shakyUv = rotateUV(uv(), shake.mul(shakeStrength))
        this.material.opacityNode = texture(this.resources.bushLeaves, shakyUv).r

        // this.material.outputNode = vec4(vec3(positionLocal.xz), 1)
    }

    setInstancedMesh()
    {
        this.mesh = new THREE.InstancedMesh(this.geometry, this.material, this.items.length)
        this.mesh.frustumCulled = false
        this.mesh.instanceMatrix.setUsage(THREE.StaticDrawUsage)
        this.game.scene.add(this.mesh)
        
        let i = 0
        for(const _item of this.items)
        {
            this.mesh.setMatrixAt(i, _item)
            i++
        }
        this.mesh.instanceMatrix.needsUpdate = true;

        // this.game.time.events.on('tick', () =>
        // {
        //     this.mesh.rotation.y = this.game.time.elapsed
        // })
    }
}