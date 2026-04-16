import { Events } from './Events.js'
import { Game } from './Game.js'

export class TrackMode
{
    constructor()
    {
        this.game = Game.getInstance()

        this.events = new Events()

        this.enabled = false

        if(this.game.debug.active)
        {
            const debugPanel = this.game.debug.panel.addFolder({
                title: '🏎️ Track Mode',
                expanded: false,
            })

            this.game.debug.addButtons(
                debugPanel,
                {
                    disable: () =>
                    {
                        this.disable()
                    },
                    enable: () =>
                    {
                        this.enable()
                    },
                },
                'toggle'
            )
        }
    }

    enable()
    {
        if(this.enabled)
            return

        this.enabled = true
        this.hideGlobalObstacles()
        this.events.trigger('change', [ this.enabled ])
        this.events.trigger('enable', [])
    }

    disable()
    {
        if(!this.enabled)
            return

        this.enabled = false
        this.showGlobalObstacles()
        this.events.trigger('change', [ this.enabled ])
        this.events.trigger('disable', [])
    }

    toggle()
    {
        if(this.enabled)
            this.disable()
        else
            this.enable()
    }

    hideGlobalObstacles()
    {
        if(!this.game.world)
            return

        if(this.game.world.fences && this.game.world.fences.instancedGroup)
        {
            for(const object of this.game.world.fences.objects)
            {
                if(object.physical && object.physical.body)
                    object.physical.body.setEnabled(false)
                if(object.visual && object.visual.object3D)
                {
                    object.visual.object3D.position.y += 100
                    object.visual.object3D.needsUpdate = true
                }
            }
            this.game.world.fences.instancedGroup.needsUpdate = true
        }

        if(this.game.world.explosiveCrates && this.game.world.explosiveCrates.instancedGroup)
        {
            for(const crate of this.game.world.explosiveCrates.items)
            {
                if(crate.object && crate.object.physical && crate.object.physical.body)
                    crate.object.physical.body.setEnabled(false)
                if(crate.object && crate.object.visual && crate.object.visual.object3D)
                {
                    crate.object.visual.object3D.position.y += 100
                    crate.object.visual.object3D.needsUpdate = true
                }
            }
            this.game.world.explosiveCrates.instancedGroup.needsUpdate = true
        }

        if(this.game.world.bricks && this.game.world.bricks.instancedGroup)
        {
            for(const object of this.game.world.bricks.objects)
            {
                if(object.physical && object.physical.body)
                    object.physical.body.setEnabled(false)
                if(object.visual && object.visual.object3D)
                {
                    object.visual.object3D.position.y += 100
                    object.visual.object3D.needsUpdate = true
                }
            }
            this.game.world.bricks.instancedGroup.needsUpdate = true
        }
    }

    showGlobalObstacles()
    {
        if(!this.game.world)
            return

        if(this.game.world.fences && this.game.world.fences.instancedGroup)
        {
            for(const object of this.game.world.fences.objects)
            {
                if(object.physical && object.physical.body && object.physical.initialState)
                {
                    object.physical.body.setTranslation(object.physical.initialState.position, false)
                    object.physical.body.setRotation(object.physical.initialState.rotation, false)
                    object.physical.body.setEnabled(true)
                }
                if(object.visual && object.visual.object3D && object.physical && object.physical.initialState)
                {
                    object.visual.object3D.position.copy(object.physical.initialState.position)
                    object.visual.object3D.quaternion.copy(object.physical.initialState.rotation)
                    object.visual.object3D.needsUpdate = true
                }
            }
            this.game.world.fences.instancedGroup.needsUpdate = true
        }

        if(this.game.world.explosiveCrates && this.game.world.explosiveCrates.instancedGroup)
        {
            for(const crate of this.game.world.explosiveCrates.items)
            {
                if(!crate.exploded)
                {
                    if(crate.object && crate.object.physical && crate.object.physical.body && crate.object.physical.initialState)
                    {
                        crate.object.physical.body.setTranslation(crate.object.physical.initialState.position, false)
                        crate.object.physical.body.setRotation(crate.object.physical.initialState.rotation, false)
                        crate.object.physical.body.setEnabled(true)
                    }
                    if(crate.object && crate.object.visual && crate.object.visual.object3D && crate.object.physical && crate.object.physical.initialState)
                    {
                        crate.object.visual.object3D.position.copy(crate.object.physical.initialState.position)
                        crate.object.visual.object3D.quaternion.copy(crate.object.physical.initialState.rotation)
                        crate.object.visual.object3D.needsUpdate = true
                    }
                }
            }
            this.game.world.explosiveCrates.instancedGroup.needsUpdate = true
        }

        if(this.game.world.bricks && this.game.world.bricks.instancedGroup)
        {
            for(const object of this.game.world.bricks.objects)
            {
                if(object.physical && object.physical.body && object.physical.initialState)
                {
                    object.physical.body.setTranslation(object.physical.initialState.position, false)
                    object.physical.body.setRotation(object.physical.initialState.rotation, false)
                    object.physical.body.setEnabled(true)
                }
                if(object.visual && object.visual.object3D && object.physical && object.physical.initialState)
                {
                    object.visual.object3D.position.copy(object.physical.initialState.position)
                    object.visual.object3D.quaternion.copy(object.physical.initialState.rotation)
                    object.visual.object3D.needsUpdate = true
                }
            }
            this.game.world.bricks.instancedGroup.needsUpdate = true
        }
    }
}
