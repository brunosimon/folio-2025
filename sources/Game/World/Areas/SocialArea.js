import * as THREE from 'three/webgpu'
import { Game } from '../../Game.js'
import { InteractivePoints } from '../../InteractivePoints.js'
import socialData from '../../../data/social.js'
import { InstancedGroup } from '../../InstancedGroup.js'
import { Area } from './Area.js'

export class SocialArea extends Area
{
    constructor(references)
    {
        super(references)

        this.center = this.references.get('center')[0].position

        // Debug
        if(this.game.debug.active)
        {
            this.debugPanel = this.game.debug.panel.addFolder({
                title: '👨‍🦲 Bruno',
                expanded: false,
            })
        }

        this.setLinks()
        this.setFans()
        this.setOnlyFans()
        this.setStatue()
        this.setAchievement()

        this.game.ticker.events.on('tick', () =>
        {
            this.update()
        })
    }

    setLinks()
    {
        const radius = 6
        let i = 0

        for(const link of socialData)
        {
            const angle = i * Math.PI / (socialData.length - 1)
            const position = this.center.clone()
            position.x += Math.cos(angle) * radius
            position.y = 1
            position.z -= Math.sin(angle) * radius

            this.interactivePoint = this.game.interactivePoints.create(
                position,
                link.name,
                link.align === 'left' ? InteractivePoints.ALIGN_LEFT : InteractivePoints.ALIGN_RIGHT,
                InteractivePoints.STATE_CONCEALED,
                () =>
                {
                    window.open(link.url, '_blank')
                },
                () =>
                {
                    this.game.inputs.interactiveButtons.addItems(['interact'])
                },
                () =>
                {
                    this.game.inputs.interactiveButtons.removeItems(['interact'])
                },
                () =>
                {
                    this.game.inputs.interactiveButtons.removeItems(['interact'])
                }
            )
            
            i++
        }
    }

    setFans()
    {
        const baseFan = this.references.get('fan')[0]
        for(const child of baseFan.children)
            child.position.sub(baseFan.position)
        baseFan.removeFromParent()

        this.fans = {}
        this.fans.spawnerPosition = this.references.get('onlyFans')[0].position
        this.fans.count = 30
        this.fans.visibleCount = 0
        this.fans.currentIndex = 0
        this.fans.mass = 0.02
        this.fans.objects = []

        const references = []

        for(let i = 0; i < this.fans.count; i++)
        {
            // Reference
            const reference = new THREE.Object3D()

            reference.position.copy(this.fans.spawnerPosition)
            reference.position.y -= 4
            references.push(reference)
            
            // Object
            const object = this.game.objects.add(
                {
                    model: reference,
                    updateMaterials: false,
                    castShadow: false,
                    receiveShadow: false,
                    parent: null,
                },
                {
                    type: 'dynamic',
                    position: reference.position,
                    rotation: reference.quaternion,
                    friction: 0.7,
                    mass: this.fans.mass,
                    sleeping: true,
                    enabled: false,
                    colliders: [ { shape: 'cuboid', parameters: [ 0.45, 0.65, 0.45 ], category: 'object' } ],
                    waterGravityMultiplier: - 1
                },
            )

            this.fans.objects.push(object)
        }

        this.fans.instancedGroup = new InstancedGroup(references, baseFan, true)

        this.fans.pop = () =>
        {
            const object = this.fans.objects[this.fans.currentIndex]

            const spawnPosition = this.fans.spawnerPosition.clone()
            spawnPosition.x += (Math.random() - 0.5) * 4
            spawnPosition.y += 4 * Math.random()
            spawnPosition.z += (Math.random() - 0.5) * 4
            object.physical.body.setTranslation(spawnPosition)
            object.physical.body.setEnabled(true)
            object.physical.body.setLinvel({ x: 0, y: 0, z: 0 })
            object.physical.body.setAngvel({ x: 0, y: 0, z: 0 })
            object.physical.body.wakeUp()
            // this.game.ticker.wait(1, () =>
            // {
            //     object.physical.body.applyImpulse({
            //         x: (Math.random() - 0.5) * this.fans.mass * 2,
            //         y: Math.random() * this.fans.mass * 3,
            //         z: this.fans.mass * 7
            //     }, true)
            //     object.physical.body.applyTorqueImpulse({ x: 0, y: 0, z: 0 }, true)
            // })

            this.fans.currentIndex = (this.fans.currentIndex + 1) % this.fans.count

            this.fans.visibleCount = Math.min(this.fans.visibleCount + 1, this.fans.count)

            // Achievement
            this.game.achievements.setProgress('fan', 1)
        }
    }

    setOnlyFans()
    {
        const interactiveArea = this.game.interactivePoints.create(
            this.references.get('onlyFans')[0].position,
            'OnlyFans',
            InteractivePoints.ALIGN_RIGHT,
            InteractivePoints.STATE_CONCEALED,
            () =>
            {
                this.fans.pop()
            },
            () =>
            {
                this.game.inputs.interactiveButtons.addItems(['interact'])
            },
            () =>
            {
                this.game.inputs.interactiveButtons.removeItems(['interact'])
            },
            () =>
            {
                this.game.inputs.interactiveButtons.removeItems(['interact'])
            }
        )
    }

    setStatue()
    {
        this.statue = {}
        this.statue.body = this.references.get('statue')[0].userData.object.physical.body
        this.statue.isSleeping = true
        this.statue.down = false
    }

    setAchievement()
    {
        this.events.on('enter', () =>
        {
            this.game.achievements.setProgress('areas', 'social')
        })
    }

    update()
    {
        if(this.fans.visibleCount)
        {
            let allFansSleeping = true
            for(const fan of this.fans.objects)
                allFansSleeping = allFansSleeping && fan.physical.body.isSleeping()

            if(!allFansSleeping)
                this.fans.instancedGroup.updateBoundings()
        }
    
        if(!this.statue.down && !this.statue.body.isSleeping())
        {
            const statueUp = new THREE.Vector3(0, 1, 0)
            statueUp.applyQuaternion(this.statue.body.rotation())
            if(statueUp.y < 0.25)
            {
                this.statue.down = true
                this.game.achievements.setProgress('statueDown', 1)
            }
        }
    }
}