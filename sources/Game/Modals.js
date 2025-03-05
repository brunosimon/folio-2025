import { Game } from './Game.js'

export class Modals
{
    constructor()
    {
        this.game = Game.getInstance()
        this.visible = false
        this.element = document.querySelector('.js-modals')
        this.current = null
        this.pending = null

        this.setClose()
        this.setItems()
        
        this.element.addEventListener('transitionend', () =>
        {
            this.onTransitionEnded()
        })
    }

    onTransitionEnded()
    {
        if(!this.visible)
        {
            this.current.element.classList.remove('is-displayed')
            this.current = null
            
            // Pending => Open pending
            if(this.pending)
            {
                this.open(this.pending)
                this.pending = null
            }

            // No pending => Fully hide
            else
            {
                this.element.classList.remove('is-displayed')
            }
        }
    }

    setItems()
    {
        const elements = this.element.querySelectorAll('.js-modal')
        
        this.items = new Map()
        
        for(const element of elements)
        {
            const name = element.dataset.name
            const item = { element: element, visible: false }
            this.items.set(name, item)
        }
    }

    setClose()
    {
        const closeElements = this.element.querySelectorAll('.js-close')

        for(const element of closeElements)
        {
            element.addEventListener('click', () =>
            {
                this.pending = null
                this.close()
            })
        }

        this.game.inputs.events.on('close', (event) =>
        {
            if(event.down)
            {
                this.pending = null
                this.close()
            }
        })
    }

    open(name)
    {
        const item = this.items.get(name)

        if(!item)
            return

        if(item === this.current)
            return

        // Currently closed => Open immediately
        if(!this.visible)
        {
            this.element.classList.add('is-displayed')
            item.element.classList.add('is-displayed')

            requestAnimationFrame(() =>
            {
                requestAnimationFrame(() =>
                {
                    this.element.classList.add('is-visible')
                })
            })

            this.visible = true
            this.current = item
        }

        // Already visible => Set pending
        else
        {
            this.pending = name
            this.close()
        }
    }

    close()
    {
        if(!this.visible)
            return

        this.element.classList.remove('is-visible')

        this.visible = false
    }
}