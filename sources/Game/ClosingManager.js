import { Game } from './Game.js'
import { Lab } from './World/Lab.js'
import { Projects } from './World/Projects.js'

export class ClosingManager
{
    constructor()
    {
        this.game = Game.getInstance()

        this.game.inputs.addMap([
            { name: 'close', categories: [ 'modal', 'cinematic', 'playing' ], keys: [ 'Escape' ] },
        ])
        this.game.inputs.events.on('close', (event) =>
        {
            if(event.down)
            {
                this.close()
            }
        })
    }

    close()
    {
        // Whispers flag select => Close
        if(this.game.world.whispers?.modal.flagsSelectOpen)
            this.game.world.whispers.modal.closeFlagSelect()

        // Projects => Close
        else if(this.game.world.scenery.projects?.state === Projects.STATE_OPEN || this.game.world.scenery.projects?.state === Projects.STATE_OPENING)
            this.game.world.scenery.projects.close()

        // Lab => Close
        else if(this.game.world.scenery.lab?.state === Lab.STATE_OPEN || this.game.world.scenery.lab?.state === Lab.STATE_OPENING)
            this.game.world.scenery.lab.close()

        // Modals => Toggle
        else
            this.game.modals.toggle()
    }
}