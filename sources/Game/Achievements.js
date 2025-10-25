import * as THREE from 'three'
import achievementsData from '../data/achievements.js'
import { Game } from './Game.js'

export class Achievements
{
    constructor()
    {
        this.game = Game.getInstance()

        this.setStorage()
        this.setModal()
        this.setItems()
        this.setGlobalProgress()
        this.setReset()
    }

    setStorage()
    {
        this.storage = {}

        this.storage.save = () =>
        {
            const data = {}
            this.items.forEach((_achievement, _name) =>
            {
                if(_achievement.progress > 0)
                    data[_name] = _achievement.progress
            })

            const encodedData = JSON.stringify(data)
            localStorage.setItem('achievements', encodedData)
        }

        this.storage.get = () =>
        {
            const localAchievements = localStorage.getItem('achievements')

            if(localAchievements)
            {
                return JSON.parse(localAchievements)
            }

            return {}
        }
    }

    setGlobalProgress()
    {
        this.globalProgress = {}
        this.globalProgress.element = this.modal.instance.element.querySelector('.js-global-progress')
        this.globalProgress.current = this.globalProgress.element.querySelector('.js-current')
        this.globalProgress.total = this.globalProgress.element.querySelector('.js-total')

        this.globalProgress.update = () =>
        {
            let achievedCount = 0
            this.items.forEach(_item => achievedCount += _item.achieved ? 1 : 0)
            
            this.globalProgress.total.textContent = this.items.size
            this.globalProgress.current.textContent = achievedCount
        }

        this.globalProgress.update()
    }

    setItems()
    {
        const localAchievements = this.storage.get()

        this.items = new Map()
        const itemsElement = this.modal.instance.element.querySelector('.js-items')

        for(const [ name, title, description, total ] of achievementsData)
        {
            const achievement = {
                total,
                progress: 0,
                achieved: false
            }

            // HTML
            const html = /* html */`
                <div class="title">${title}</div>
                <div class="description">
                    <div class="text">${description}</div>
                    <div class="progress">
                        <div class="check-icon"></div>
                        <span class="check"></span>
                        <span class="current">${achievement.progress}</span> / <span>${total}</span>
                    </div>
                </div>
                <div class="bar">
                    <div class="fill"></div>
                </div>
            `

            const itemElement = document.createElement('div')
            itemElement.classList.add('achievement')
            itemElement.innerHTML = html

            const progressCurrentElement = itemElement.querySelector('.current')
            const barFillElement = itemElement.querySelector('.bar .fill')
            
            itemsElement.append(itemElement)

            // Set progress method
            achievement.setProgress = (_progress, _fromLocal = false) =>
            {
                const progress = Math.min(_progress, total)

                if(progress !== achievement.progress)
                {
                    // Progress
                    achievement.progress = progress
                    progressCurrentElement.textContent = achievement.progress

                    // Bar
                    barFillElement.style.transform = `scaleX(${achievement.progress / total})`

                    // Achieved
                    if(achievement.progress === achievement.total)
                    {
                        achievement.achieved = true
                        itemElement.classList.add('is-achieved')

                        if(!_fromLocal)
                        {
                            // Confetti
                            if(this.game.world.confetti)
                            {
                                this.game.world.confetti.pop(this.game.player.position.clone())
                                this.game.world.confetti.pop(this.game.player.position.clone().add(new THREE.Vector3(1, -1, 1.5)))
                                this.game.world.confetti.pop(this.game.player.position.clone().add(new THREE.Vector3(1, -1, -1.5)))
                            }
                        }
                    }

                    // Storage
                    if(!_fromLocal)
                    {
                        this.storage.save()
                        this.globalProgress.update()
                    }
                }
            }

            // Add progress method
            achievement.addProgress = () =>
            {
                achievement.setProgress(achievement.progress + 1)
            }

            // Reset
            achievement.reset = () =>
            {
                achievement.progress = 0
                progressCurrentElement.textContent = achievement.progress
                barFillElement.style.transform = 'scaleX(0)'
                achievement.achieved = false
                itemElement.classList.remove('is-achieved')
            }
            
            // Save
            this.items.set(name, achievement)

            // From local
            if(localAchievements[name])
                achievement.setProgress(localAchievements[name], true)
        }
    }

    setModal()
    {
        this.modal = {}
        this.modal.instance = this.game.modals.items.get('achievements')
    }

    setReset()
    {
        const button = this.modal.instance.element.querySelector('.js-button-reset')

        let clickCount = 0

        button.addEventListener('click', (event) =>
        {
            event.preventDefault()
            clickCount++

            if(clickCount === 1)
            {
                button.textContent = 'Are you sure?'
            }

            else if(clickCount === 2)
            {
                button.textContent = 'Definitely?'
            }

            else if(clickCount === 3)
            {
                button.textContent = 'Done!'
                clickCount = 0
                this.reset()
            }
        })

        button.addEventListener('mouseleave', (event) =>
        {
            event.preventDefault()
            clickCount = 0

            button.textContent = 'Reset achievements'
        })
    }

    setProgress(name, progress)
    {
        const achievement = this.items.get(name)

        if(achievement)
            achievement.setProgress(progress)
    }

    addProgress(name)
    {
        const achievement = this.items.get(name)

        if(achievement)
            achievement.addProgress()
    }

    reset()
    {
        this.items.forEach(_achievement =>
        {
            _achievement.reset()
        })

        this.storage.save()
    }
}