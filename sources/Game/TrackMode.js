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
        this.events.trigger('change', [ this.enabled ])
        this.events.trigger('enable', [])
    }

    disable()
    {
        if(!this.enabled)
            return

        this.enabled = false
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
}
