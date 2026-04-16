import * as THREE from 'three/webgpu'
import { Game } from '../Game.js'
import { InstancedGroup } from '../InstancedGroup.js'
import { hash, instancedArray, instanceIndex, sin, uniform, vec3 } from 'three/tsl'
import gsap from 'gsap'

export class PoleLights
{
    constructor()
    {
        this.game = Game.getInstance()

        this.showing = true

        // Debug
        if(this.game.debug.active)
        {
            this.debugPanel = this.game.debug.panel.addFolder({
                title: '🏮 Pole lights',
                expanded: false,
            })
        }

        // Base and references
        const [ base, references ] = InstancedGroup.getBaseAndReferencesFromInstances(this.game.resources.poleLightsModel.scene.children)
        this.references = references
        
        // Setup base
        for(const child of base.children)
        {
            child.name = child.name.replace(/[0-9]+$/i, '') // Set clear name to retrieve it later as instances
            child.castShadow = true
            child.receiveShadow = true
        }

        // Update materials 
        this.game.materials.updateObject(base)

        // Create instanced group
        this.instancedGroup = new InstancedGroup(this.references, base, false)

        this.glass = this.instancedGroup.meshes.find(mesh => mesh.instance.name === 'glass').instance
        
        this.setPhysics()
        // this.setEmissives()
        this.setFireflies()
        this.setSwitchInterval()
    }

    setPhysics()
    {
        this.physicalObjects = []
        for(const reference of this.references)
        {
            const object = this.game.objects.add(
                null,
                {
                    type: 'fixed',
                    position: reference.position,
                    rotation: reference.quaternion,
                    colliders: [ { shape: 'cuboid', parameters: [ 0.2, 1.7, 0.2 ], category: 'object' } ],
                    onCollision: (force, position) =>
                    {
                        this.game.audio.groups.get('hitDefault').playRandomNext(force, position)
                    }
                },
            )
            this.physicalObjects.push(object)
        }
    }

    // setEmissives()
    // {
    //     this.emissive = {}
    //     this.emissive.offMaterial = this.game.materials.getFromName('palette')
    //     this.emissive.onMaterial = this.game.materials.getFromName('emissiveOrangeRadialGradient')
    // }

    setFireflies()
    {
        this.firefliesScale = uniform(0)

        const countPerLight = 5
        const count = this.references.length * countPerLight
        const positions = new Float32Array(count * 3)

        let i = 0
        for(const reference of this.references)
        {
            for(let j = 0; j < countPerLight; j++)
            {
                const i3 = i * 3

                const angle = Math.random() * Math.PI * 2
                positions[i3 + 0] = reference.position.x + Math.cos(angle)
                positions[i3 + 1] = reference.position.y + 1
                positions[i3 + 2] = reference.position.z + Math.sin(angle)
                i++
            }
        }
        
        const positionAttribute = instancedArray(positions, 'vec3').toAttribute()

        const material = new THREE.SpriteNodeMaterial()
        material.outputNode = this.game.materials.getFromName('emissiveOrangeRadialGradient').outputNode

        const baseTime = this.game.ticker.elapsedScaledUniform.add(hash(instanceIndex).mul(999))
        const flyOffset = vec3(
            sin(baseTime.mul(0.4)).mul(0.5),
            sin(baseTime).mul(0.2),
            sin(baseTime.mul(0.3)).mul(0.5)
        )
        material.positionNode = positionAttribute.add(flyOffset)
        material.scaleNode = this.firefliesScale

        const geometry = new THREE.CircleGeometry(0.015, 8)

        const mesh = new THREE.Mesh(geometry, material)
        mesh.count = count
        mesh.frustumCulled = false
        this.game.scene.add(mesh)

        this.firefliesMesh = mesh
    }

    setSwitchInterval()
    {
        const intervalChange = (inInterval) =>
        {
            if(!this.showing)
                return

            if(inInterval)
            {
                this.glass.visible = true

                gsap.to(this.firefliesScale, { value: 1, duration: 5, overwrite: true })
            }
            else
            {
                this.glass.visible = false

                gsap.to(this.firefliesScale, { value: 0, duration: 5, overwrite: true })
            }
        }

        this.game.dayCycles.events.on('night', intervalChange)
        intervalChange(this.game.dayCycles.intervalEvents.get('night').inInterval)
    }

    setShowing(showing)
    {
        this.showing = showing

        if(!showing)
        {
            if(this.glass)
                this.glass.visible = false
            
            if(this.firefliesScale)
                gsap.to(this.firefliesScale, { value: 0, duration: 1, overwrite: true })
            
            if(this.firefliesMesh)
                this.firefliesMesh.visible = false
        }
        else
        {
            if(this.firefliesMesh)
                this.firefliesMesh.visible = true

            const isNight = this.game.dayCycles.intervalEvents.get('night').inInterval
            if(isNight)
            {
                if(this.glass)
                    this.glass.visible = true
                
                if(this.firefliesScale)
                    gsap.to(this.firefliesScale, { value: 1, duration: 1, overwrite: true })
            }
        }
    }
}