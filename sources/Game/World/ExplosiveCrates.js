import gsap from 'gsap'
import { Game } from '../Game.js'

export class ExplosiveCrates
{
    constructor()
    {
        this.game = Game.getInstance()

        const meshes = [ ...this.game.resources.cratesModel.scene.children ]
        this.list = []
        
        for(const mesh of meshes)
        {
            const crate = {}
            crate.isSleeping = true
            crate.position = mesh.position.clone()
            crate.object = this.game.objects.add(
                {
                    model: mesh,
                    // updateMaterials: true,
                    // castShadow: false,
                    // receiveShadow: false,
                    // parent: null,
                },
                {
                    type: 'dynamic',
                    position: mesh.position,
                    rotation: mesh.quaternion,
                    friction: 0.7,
                    mass: 0.02,
                    sleeping: true,
                    colliders: [ { shape: 'cuboid', parameters: [ 0.5, 0.5, 0.5 ], category: 'object' } ],
                    waterGravityMultiplier: - 1
                },
            )

            this.list.push(crate)
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
                    })
                }
                crate.isSleeping = isSleeping
            }
        }
    }

    reset()
    {
        for(const crate of this.list)
        {
            this.game.objects.resetObject(crate.object)
        }
    }
}