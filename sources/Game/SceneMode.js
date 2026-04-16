import { Events } from './Events.js'
import { Game } from './Game.js'

export class SceneMode
{
    constructor()
    {
        this.game = Game.getInstance()

        this.events = new Events()

        this.mode = 'normal'

        if(this.game.debug.active)
        {
            const debugPanel = this.game.debug.panel.addFolder({
                title: '🎮 Scene Mode',
                expanded: false,
            })

            this.game.debug.addButtons(
                debugPanel,
                {
                    normal: () =>
                    {
                        this.changeMode('normal')
                    },
                    obstacleFree: () =>
                    {
                        this.changeMode('obstacleFree')
                    },
                },
                'change'
            )
        }
    }

    changeMode(mode = 'normal')
    {
        if(mode === this.mode)
            return
            
        this.mode = mode
        this.events.trigger('change', [ this.mode ])
    }
}
