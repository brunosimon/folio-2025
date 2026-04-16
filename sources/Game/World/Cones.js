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
        const coneOffset = 0.3

        this.references = []

        const count = checkpoints.length

        for(let i = 0; i < count; i++)
        {
            const current = checkpoints[i]
            const next = checkpoints[(i + 1) % count]

            const startLeft = current.a
            const startRight = current.b
            const endLeft = next.a
            const endRight = next.b

            const segmentLength = startLeft.distanceTo(endLeft)
            const segmentsCount = Math.max(1, Math.ceil(segmentLength / coneSpacing))

            for(let j = 0; j <= segmentsCount; j++)
            {
                const t = j / segmentsCount

                const leftPos = new THREE.Vector2(
                    startLeft.x + (endLeft.x - startLeft.x) * t,
                    startLeft.y + (endLeft.y - startLeft.y) * t
                )
                const rightPos = new THREE.Vector2(
                    startRight.x + (endRight.x - startRight.x) * t,
                    startRight.y + (endRight.y - startRight.y) * t
                )

                const nextIdx = (j + 1) % (segmentsCount + 1)
                const nextT = nextIdx / segmentsCount
                const nextLeftPos = new THREE.Vector2(
                    startLeft.x + (endLeft.x - startLeft.x) * nextT,
                    startLeft.y + (endLeft.y - startLeft.y) * nextT
                )

                const direction = new THREE.Vector2(
                    nextLeftPos.x - leftPos.x,
                    nextLeftPos.y - leftPos.y
                ).normalize()

                const leftNormal = new THREE.Vector2(-direction.y, direction.x)
                const rightNormal = new THREE.Vector2(direction.y, -direction.x)

                const finalLeftPos = new THREE.Vector2(
                    leftPos.x + leftNormal.x * coneOffset,
                    leftPos.y + leftNormal.y * coneOffset
                )
                const finalRightPos = new THREE.Vector2(
                    rightPos.x + rightNormal.x * coneOffset,
                    rightPos.y + rightNormal.y * coneOffset
                )

                this.addCone(finalLeftPos, current.rotation)
                this.addCone(finalRightPos, current.rotation)
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
