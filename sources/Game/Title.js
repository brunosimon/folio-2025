import { Game } from './Game.js'

export class Title
{
    constructor()
    {
        this.game = Game.getInstance()

        this.interval = 1/60
        this.lastTime = 0
        this.offset = 0
        this.offsetRounded = 0
        this.index = 0
        this.length = 30
        this.carPosition = 10
        this.objectInterval = 18

        this.game.ticker.events.on('tick', () =>
        {
            this.update()
        }, 14)
    }

    update()
    {
        this.offset += this.game.physicalVehicle.forwardSpeed * this.game.ticker.deltaScaled
        const offsetRounded = Math.floor(this.offset)

        const delta = this.game.ticker.elapsed - this.lastTime

        if(delta > this.interval && offsetRounded !== this.offsetRounded)
        {
            this.lastTime = this.game.ticker.elapsed
            this.offsetRounded = offsetRounded
            
            const line = []
            
            // Create base line (with potential overlapping)
            for(let i = 0; i < this.length; i++)
            {
                if(i === this.carPosition)
                {
                    line.push({ character: '🚗', size: 4, position: i })
                }

                if((i - offsetRounded) % this.objectInterval === 0)
                {
                    line.push({ character: '🌳', size: 4, position: i })
                }
            }

            // Move items away from each other
            for(let i = 0; i < line.length - 1; i++)
            {
                const leftItem = line[i]
                const rightItem = line[i+1]

                if(leftItem.position + leftItem.size > rightItem.position)
                {
                    const overlapLength = leftItem.position + leftItem.size - rightItem.position
                    let leftDelta = Math.ceil(overlapLength / 2)

                    if(leftItem.position - leftDelta < 0)
                        leftDelta = 0

                    const rightDelta = overlapLength - leftDelta

                    leftItem.position -= leftDelta
                    rightItem.position += rightDelta
                }
            }

            // Formated final title
            let title = Array(this.length).fill(' ')
            for(let i = 0; i < line.length; i++)
            {
                const item = line[i]
                title.splice(item.position, item.size, item.character)

                for(let j = i + 1; j < line.length; j++)
                {
                    const nextItem = line[j]
                    nextItem.position -= item.size - 1
                }
            }

            
            document.title = 'Bruno' + title.join('')
        }
    }
}

// 🌳 = 11
// . = 40
// ⚬ = ?
// ● = ?
// • = ?
// ˚ = ?
// ◦ = ?
// ° = ?
// ○ = ?
// º = ?
// o = ?
// ∘ = ?
//  ۪ = ?