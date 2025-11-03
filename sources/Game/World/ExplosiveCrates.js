import gsap from 'gsap'
import { Game } from '../Game.js'
import { InstancedGroup } from '../InstancedGroup.js'

export class ExplosiveCrates
{
    constructor()
    {
        this.game = Game.getInstance()

        // Base and references
        const [ base, references ] = InstancedGroup.getBaseAndReferencesFromInstances(this.game.resources.explosiveCratesModel.scene.children)
        this.references = references
        
        // Setup base
        for(const child of base.children)
        {
            child.castShadow = true
            child.receiveShadow = true
        }

        // Update materials 
        this.game.materials.updateObject(base)

        // Create instanced group
        this.instancedGroup = new InstancedGroup(this.references, base, true)

        this.list = []
        
        let i = 0
        for(const reference of this.references)
        {
            const crate = {}
            crate.id = i
            crate.isSleeping = true
            crate.position = reference.clone()
            crate.object = this.game.objects.add(
                {
                    model: reference,
                },
                {
                    type: 'dynamic',
                    position: reference.position,
                    rotation: reference.quaternion,
                    friction: 0.7,
                    mass: 0.02,
                    sleeping: true,
                    colliders: [ { shape: 'cuboid', parameters: [ 0.5, 0.5, 0.5 ], category: 'object' } ],
                    waterGravityMultiplier: - 1
                },
            )

            this.list.push(crate)

            i++
        }

        this.game.ticker.events.on('tick', () =>
        {
            this.update()
        }, 3)
    }

    update()
    {
        for(const crate of this.list)
        {
            // Sleeping state changed
            const isSleeping = crate.object.physical.body.isSleeping() || !crate.object.physical.body.isEnabled()
            if(crate.isSleeping !== isSleeping)
            {
                if(!isSleeping)
                {
                    gsap.delayedCall(0.4, () =>
                    {
                        // Explode
                        this.game.world.fireballs.create(crate.object.physical.body.translation())

                        // Disable
                        this.game.objects.disable(crate.object)
                        crate.object.visual.object3D.position.y += 100 // Hide the instance reference

                        // Achievements
                        this.game.achievements.setProgress('explosiveCrates', crate.id)
                    })
                }
                crate.isSleeping = isSleeping
            }
        }
    }

    reset()
    {
        for(const crate of this.list)
            this.game.objects.resetObject(crate.object)
    }
}