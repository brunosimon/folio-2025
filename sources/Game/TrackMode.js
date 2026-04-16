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
            for(const mesh of this.game.world.fences.instancedGroup.meshes)
            {
                if(mesh.instance)
                    mesh.instance.visible = false
            }
            for(const object of this.game.world.fences.objects)
            {
                if(object.physical && object.physical.body)
                    object.physical.body.setEnabled(false)
            }
        }

        if(this.game.world.explosiveCrates && this.game.world.explosiveCrates.instancedGroup)
        {
            for(const mesh of this.game.world.explosiveCrates.instancedGroup.meshes)
            {
                if(mesh.instance)
                    mesh.instance.visible = false
            }
            for(const crate of this.game.world.explosiveCrates.items)
            {
                if(crate.object && crate.object.physical && crate.object.physical.body)
                    crate.object.physical.body.setEnabled(false)
            }
        }

        if(this.game.world.bricks && this.game.world.bricks.instancedGroup)
        {
            for(const mesh of this.game.world.bricks.instancedGroup.meshes)
            {
                if(mesh.instance)
                    mesh.instance.visible = false
            }
            for(const object of this.game.world.bricks.objects)
            {
                if(object.physical && object.physical.body)
                    object.physical.body.setEnabled(false)
            }
        }
    }

    showGlobalObstacles()
    {
        if(!this.game.world)
            return

        if(this.game.world.fences && this.game.world.fences.instancedGroup)
        {
            for(const mesh of this.game.world.fences.instancedGroup.meshes)
            {
                if(mesh.instance)
                    mesh.instance.visible = true
            }
            for(const object of this.game.world.fences.objects)
            {
                if(object.physical && object.physical.body)
                    object.physical.body.setEnabled(true)
            }
        }

        if(this.game.world.explosiveCrates && this.game.world.explosiveCrates.instancedGroup)
        {
            for(const mesh of this.game.world.explosiveCrates.instancedGroup.meshes)
            {
                if(mesh.instance)
                    mesh.instance.visible = true
            }
            for(const crate of this.game.world.explosiveCrates.items)
            {
                if(crate.object && crate.object.physical && crate.object.physical.body)
                    crate.object.physical.body.setEnabled(true)
            }
        }

        if(this.game.world.bricks && this.game.world.bricks.instancedGroup)
        {
            for(const mesh of this.game.world.bricks.instancedGroup.meshes)
            {
                if(mesh.instance)
                    mesh.instance.visible = true
            }
            for(const object of this.game.world.bricks.objects)
            {
                if(object.physical && object.physical.body)
                    object.physical.body.setEnabled(true)
            }
        }
    }
}
