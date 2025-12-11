import { Game } from './Game.js'

export class Notifications
{
    static STATE_VISIBLE = 1
    static STATE_HIDING = 2
    static STATE_HIDDEN = 3

    constructor()
    {
        this.game = Game.getInstance()

        this.element = this.game.domElement.querySelector('.js-notifications')
        this.items = this.element.querySelector('.js-items')
        this.pendings = []
        this.current = null
        this.timeTotal = 0
        this.timeLeft = 0
        this.timeHold = false
        this.state = Notifications.STATE_HIDDEN

        this.game.ticker.events.on('tick', () =>
        {
            this.update()
        }, 14)

        // // Fake notifications
        // for(let i = 0; i < 10; i++)
        // {
        //     // Notification
        //     const html = /* html */`
        //         <div class="top">
        //             <div class="title">Some title</div>
        //             <div class="progress">
        //                 <div class="check-icon"></div>
        //                 <span class="check"></span>
        //                 <span class="current">1</span> / <span>2</span>
        //             </div>
        //         </div>
        //         <div class="bottom">
        //             <div class="description">Lorem ipsum dolor, sit amet consectetur adi</div>
        //             <div class="open-icon"></div>
        //         </div>
        //     `

        //     this.show(
        //         html,
        //         'test',
        //         4,
        //         () => {
        //             this.game.inputs.interactiveButtons.clearItems()
        //             this.game.menu.open('achievements')
        //         },
        //         'test1'
        //     )
        // }
    }

    show(html = '', type = '', duration = 3, clickCallback = null, id = null)
    {
        // Pending
        if(this.current)
        {
            // Test if last has same ID to avoid spam
            if(id !== null && this.pendings.length)
            {
                const withSameId = this.pendings.find(([a, b, c, d, lastId]) => lastId === id)
                
                if(withSameId || id === this.current.id)
                {
                    return false
                }
            }

            this.pendings.push([ html, type, duration, clickCallback, id ])
            return false
        }

        this.state = Notifications.STATE_VISIBLE

        const item = {}

        item.id = id
        item.element = document.createElement('div')
        item.element.classList.add('notification')

        if(type)
            item.element.classList.add(`is-${type}`)
            
        item.element.innerHTML = html

        item.timeBar = document.createElement('div')
        item.timeBar.classList.add('time-bar')
        item.element.append(item.timeBar)

        item.element.addEventListener('transitionend', (event) =>
        {
            if(event.target === item.element && item.element.classList.contains('is-leaving'))
            {
                this.items.removeChild(item.element)
                this.current = null
                this.state = Notifications.STATE_HIDDEN
                
                if(this.pendings.length)
                {
                    const pending = this.pendings.shift()
                    this.show(...pending)
                }
            }
        })

        requestAnimationFrame(() =>
        {
            requestAnimationFrame(() =>
            {
                item.element.classList.add('is-visible')
            })
        })

        item.element.addEventListener('click', (event) =>
        {
            event.preventDefault()

            if(typeof clickCallback === 'function')
            {
                clickCallback()
            }

            this.hide()
        }, { once: true })

        item.element.addEventListener('pointerenter', (event) =>
        {
            if(event.pointerType !== 'touch')
                this.timeHold = true
        })

        item.element.addEventListener('pointerleave', (event) =>
        {
            this.timeHold = false
        })

        this.timeTotal = duration
        this.timeLeft = duration

        this.items.append(item.element)

        this.current = item
    }

    hide()
    {
        if(this.state === Notifications.STATE_HIDING || this.state === Notifications.STATE_HIDDEN)
            return

        this.state = Notifications.STATE_HIDING

        this.current.element.classList.add('is-leaving')

    }

    update()
    {
        if(this.state === Notifications.STATE_VISIBLE && !this.timeHold)
        {
            this.timeLeft = Math.max(0, this.timeLeft - this.game.ticker.delta)
            const ratio = this.timeLeft / this.timeTotal
            this.current.timeBar.style.transform = `scaleX(${ratio})`

            if(this.timeLeft === 0)
            {
                this.hide()
            }
        }
    }
}