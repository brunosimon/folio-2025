import * as THREE from 'three/webgpu'
import { Game } from '../Game.js'
import { InstancedGroup } from '../InstancedGroup.js'
import { MeshDefaultMaterial } from '../Materials/MeshDefaultMaterial.js'
import { color, Fn, mix, positionWorld, uniform, vec3 } from 'three/tsl'

export class Cones
{
    constructor()
    {
        this.game = Game.getInstance()

        this.enabled = false
        this.instancedGroup = null
        this.references = []
    }

    createFromCheckpoints(checkpoints)
    {
        this.clear()

        const coneSpacing = 2.5

        this.references = []

        const count = checkpoints.length

        for(let i = 0; i < count; i++)
        {
            const current = checkpoints[i]
            const next = checkpoints[(i + 1) % count]

            const segmentLength = current.center.distanceTo(next.center)
            const segmentsCount = Math.max(1, Math.ceil(segmentLength / coneSpacing))

            for(let j = 0; j <= segmentsCount; j++)
            {
                const t = j / segmentsCount

                const aPos = new THREE.Vector2(
                    current.a.x + (next.a.x - current.a.x) * t,
                    current.a.y + (next.a.y - current.a.y) * t
                )

                const bPos = new THREE.Vector2(
                    current.b.x + (next.b.x - current.b.x) * t,
                    current.b.y + (next.b.y - current.b.y) * t
                )

                let rotationDiff = next.rotation - current.rotation
                if(rotationDiff > Math.PI)
                    rotationDiff -= 2 * Math.PI
                else if(rotationDiff < -Math.PI)
                    rotationDiff += 2 * Math.PI
                const currentRotation = current.rotation + rotationDiff * t

                this.addCone(aPos, currentRotation)
                this.addCone(bPos, currentRotation)
            }
        }

        if(this.references.length > 0)
        {
            const base = this.createConeBaseMesh()
            this.instancedGroup = new InstancedGroup(this.references, base, false)
            this.instancedGroup.meshes.forEach((mesh) =>
            {
                mesh.instance.visible = false
            })
        }

        if(this.game.trackMode.enabled)
        {
            this.show()
        }
    }

    createConeBaseMesh()
    {
        const group = new THREE.Group()

        const baseHeight = 0.15
        const baseRadius = 0.3
        const baseGeometry = new THREE.CylinderGeometry(baseRadius, baseRadius, baseHeight, 16)
        const baseMaterial = new MeshDefaultMaterial({
            colorNode: color('#1a1a1a'),
            hasLightBounce: false,
            hasWater: false,
        })
        const baseMesh = new THREE.Mesh(baseGeometry, baseMaterial)
        baseMesh.position.y = baseHeight * 0.5
        baseMesh.castShadow = true
        baseMesh.receiveShadow = true
        baseMesh.name = 'coneBase'
        group.add(baseMesh)

        const coneHeight = 0.7
        const coneRadius = 0.2
        const coneGeometry = new THREE.CylinderGeometry(0.02, coneRadius, coneHeight, 16)
        
        const coneColor = uniform(color('#ff6600'))
        const stripeColor = uniform(color('#ffffff'))
        
        const coneMaterial = new MeshDefaultMaterial({
            colorNode: Fn(() =>
            {
                const height = positionWorld.y.sub(baseHeight).div(coneHeight)
                const stripe = height.mul(8).sin().abs().greaterThan(0.7)
                return mix(coneColor, stripeColor, stripe)
            })(),
            hasLightBounce: false,
            hasWater: false,
        })
        const coneMesh = new THREE.Mesh(coneGeometry, coneMaterial)
        coneMesh.position.y = baseHeight + coneHeight * 0.5
        coneMesh.castShadow = true
        coneMesh.receiveShadow = true
        coneMesh.name = 'coneBody'
        group.add(coneMesh)

        return group
    }

    addCone(position, rotation)
    {
        const reference = new THREE.Object3D()
        reference.position.set(position.x, 0, position.y)
        reference.rotation.y = rotation
        reference.scale.setScalar(1)
        reference.needsUpdate = true
        this.references.push(reference)
    }

    show()
    {
        this.enabled = true
        if(this.instancedGroup)
        {
            this.instancedGroup.needsUpdate = true
            this.instancedGroup.meshes.forEach((mesh) =>
            {
                mesh.instance.visible = true
            })
            this.instancedGroup.update()
        }
    }

    hide()
    {
        this.enabled = false
        if(this.instancedGroup)
        {
            this.instancedGroup.meshes.forEach((mesh) =>
            {
                mesh.instance.visible = false
            })
        }
    }

    clear()
    {
        if(this.instancedGroup)
        {
            this.instancedGroup.meshes.forEach((mesh) =>
            {
                this.game.scene.remove(mesh.instance)
            })
            this.instancedGroup = null
        }
        this.references = []
        this.enabled = false
    }
}
