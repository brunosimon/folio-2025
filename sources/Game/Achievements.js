import * as THREE from 'three'
import achievementsData from '../data/achievements.js'
import { Game } from './Game.js'
import { timeToReadableString } from './utilities/time.js'
import { uniform } from 'three/tsl'
import { Events } from './Events.js'

export class Achievements
{
    constructor()
    {
        this.game = Game.getInstance()

        this.events = new Events()

        this.setStorage()
        this.setMenu()
        this.setSounds()
        this.setGroups()
        this.setItems()
        this.setGlobalProgress()
        this.setRewards()
        this.setReset()

        const localAchievements = this.storage.get()

        for(const groupName in localAchievements)
        {
            const group = this.groups.get(groupName)

            if(group)
            {
                const progress = localAchievements[ groupName ]
                group.setProgress(progress, true)
            }
        }

        this.globalProgress.update()
        this.rewards.update()
    }

    setStorage()
    {
        this.storage = {}

        this.storage.save = () =>
        {
            const data = {}
            this.groups.forEach((group, name) =>
            {
                if(group.progress instanceof Set)
                {
                    if(group.progress.size)
                        data[name] = [ ...group.progress ]
                }
                else
                {
                    if(group.progress > 0)
                        data[name] = group.progress
                }
            })

            const encodedData = JSON.stringify(data)
            localStorage.setItem('achievements', encodedData)
        }

        this.storage.get = () =>
        {
            const localAchievements = localStorage.getItem('achievements')

            if(localAchievements)
                return JSON.parse(localAchievements)

            return {}
        }
    }

    setGlobalProgress()
    {
        this.globalProgress = {}
        
        this.globalProgress.element = this.menu.instance.contentElement.querySelector('.js-global-progress')
        this.globalProgress.currentElement = this.globalProgress.element.querySelector('.js-current')
        this.globalProgress.totalElement = this.globalProgress.element.querySelector('.js-total')
        this.globalProgress.timeElement = this.globalProgress.element.querySelector('.js-time')
        
        this.globalProgress.achieved = false
        this.globalProgress.achievedCount = 0
        this.globalProgress.totalCount = 0
        this.globalProgress.ratioUniform = uniform()

        const localTimeStart = localStorage.getItem('achievementsTimeStart')
        const localTimeEnd = localStorage.getItem('achievementsTimeEnd')

        this.globalProgress.timeStart = localTimeStart ? parseFloat(localTimeStart) : 0
        this.globalProgress.timeEnd = localTimeEnd ? parseFloat(localTimeEnd) : 0

        this.globalProgress.update = () =>
        {
            this.globalProgress.achievedCount = 0
            this.globalProgress.totalCount = 0
            this.groups.forEach(_group =>
            {
                for(const achievement of _group.items)
                {
                    this.globalProgress.achievedCount += achievement.achieved ? 1 : 0
                    this.globalProgress.totalCount++
                }
            })

            this.globalProgress.ratioUniform.value = this.globalProgress.achievedCount / this.globalProgress.totalCount
            
            this.globalProgress.totalElement.textContent = this.globalProgress.totalCount
            this.globalProgress.currentElement.textContent = this.globalProgress.achievedCount
            
            if(this.globalProgress.achievedCount === this.globalProgress.totalCount)
            {
                // Achieve
                if(!this.globalProgress.achieved)
                {
                    // Not already ended
                    if(!localStorage.getItem('achievementsTimeEnd'))
                    {
                        this.globalProgress.timeEnd = this.game.player.timePlayed
                        localStorage.setItem('achievementsTimeEnd', this.globalProgress.timeEnd)
                    }

                    this.globalProgress.timeElement.textContent = timeToReadableString(this.globalProgress.timeEnd - this.globalProgress.timeStart)

                    this.globalProgress.achieved = true
                    this.globalProgress.element.classList.add('is-achieved')
                }
            }
        }


        this.globalProgress.reset = () =>
        {
            this.globalProgress.achieved = false

            this.globalProgress.currentElement.textContent = 0

            this.globalProgress.timeStart = this.game.player.timePlayed
            this.globalProgress.timeEnd = 0
            localStorage.setItem('achievementsTimeStart', this.globalProgress.timeStart)
            localStorage.removeItem('achievementsTimeEnd')
            
            this.globalProgress.element.classList.remove('is-achieved')
        }

        this.globalProgress.update()
    }

    setRewards()
    {
        this.rewards = {}
        this.rewards.elements = this.menu.instance.contentElement.querySelectorAll('.js-reward')
        this.rewards.items = new Map()
        this.rewards.default = null
        this.rewards.count = this.rewards.elements.length

        // Items
        let i = 0
        for(const rewardElement of this.rewards.elements)
        {
            const item = {}
            item.name = rewardElement.dataset.name
            item.element = rewardElement
            item.threshold = Math.round(i / (this.rewards.count - 1) * this.globalProgress.totalCount)
            item.locked = true

            item.element.addEventListener('click', (event) =>
            {
                event.preventDefault()

                const changed = this.rewards.set(item.name)

                if(changed)
                {
                    this.game.menu.close()
                }
            })

            if(typeof rewardElement.dataset.default !== 'undefined')
                this.rewards.default = item

            this.rewards.items.set(item.name, item)

            i++
        }

        // Current
        this.rewards.current = this.rewards.default

        const localRewardName = localStorage.getItem('achievementsReward')
        if(localRewardName)
        {
            const item = this.rewards.items.get(localRewardName)
            if(item)
                this.rewards.current = item
        }
        this.rewards.current.element.classList.add('is-active')

        // Set method
        this.rewards.set = (itemName) =>
        {
            const item = this.rewards.items.get(itemName)

            if(item && !item.locked && item !== this.rewards.current)
            {
                if(this.rewards.current)
                {
                    this.rewards.current.element.classList.remove('is-active')
                }

                this.rewards.current = item
                this.rewards.current.element.classList.add('is-active')

                // Sound
                this.sounds.paint.play()

                // Event
                this.events.trigger('rewardActiveChange', [ this.rewards.current ])

                // Save
                localStorage.setItem('achievementsReward', item.name)

                return true
            }

            return false
        }

        // Update
        this.rewards.update = () =>
        {
            this.rewards.items.forEach(item =>
            {
                // Unlock
                if(this.globalProgress.achievedCount >= item.threshold)
                {
                    if(item.locked)
                    {
                        item.locked = false
                        item.element.classList.remove('is-locked')
                    }
                }
                // Lock
                else
                {
                    if(!item.locked)
                    {
                        item.locked = true
                        item.element.classList.add('is-locked')

                        if(item === this.rewards.current)
                        {
                            this.rewards.set(this.rewards.default.name)
                        }
                    }

                    // Current should be locked (shouldn't happen but you never know)
                    if(item === this.rewards.current)
                    {
                        this.rewards.set(this.rewards.default.name)
                    }
                }
            })
        }
    }

    setGroups()
    {
        this.groups = new Map()
        
        for(const [ name, title, description, total, unique = false ] of achievementsData)
        {
            // Get if exists or create
            const group = this.groups.get(name) ?? this.createGroup(name)

            // One of the achievements is "unique" => Make prorgess as a Set
            if(unique && !(group.progress instanceof Set))
            {
                group.progress = new Set()
            }
        }
    }

    createGroup(name)
    {
        // Create
        const group = {
            progress: 0,
            items: []
        }

        // Set progress method
        group.setProgress = (_progress, _silent = false) =>
        {
            let oldProgress = group.progress instanceof Set ? group.progress.size : group.progress

            if(group.progress instanceof Set)
            {
                const ids = _progress instanceof Array ? _progress : [ _progress ]
                for(const id of ids)
                    group.progress.add(id)
            }
            else
            {
                if(_progress !== group.progress)
                    group.progress = _progress
            }

            const newProgress = group.progress instanceof Set ? group.progress.size : group.progress
            const progressDelta = newProgress - oldProgress
            if(progressDelta)
                group.updateItems(_silent)

            return progressDelta
        }

        // Add progress method
        group.addProgress = (_progress) =>
        {
            return group.setProgress(group.progress + 1)
        }

        // Update items of group
        group.updateItems = (_silent) =>
        {
            const groupProgress = group.progress instanceof Set ? group.progress.size : group.progress

            // if(group.hasUnique)
            // {
            // }

            for(const achievement of group.items)
            {
                const progress = Math.min(groupProgress, achievement.total)

                // Progress
                achievement.progressCurrentElement.textContent = progress

                // Bar
                achievement.barFillElement.style.transform = `scaleX(${progress / achievement.total})`

                // Achieved
                if(!achievement.achieved && progress === achievement.total)
                {
                    achievement.achieve(_silent)
                }
            }
        }

        // Reset
        group.reset = () =>
        {
            if(group.progress instanceof Set)
                group.progress = new Set()
            else
                group.progress = 0

            for(const achievement of group.items)
            {
                achievement.progressCurrentElement.textContent = 0
                achievement.barFillElement.style.transform = 'scaleX(0)'
                achievement.achieved = false
                achievement.itemElement.classList.remove('is-achieved')
            }
        }

        // Save
        this.groups.set(name, group)

        // Return
        return group
    }

    setItems()
    {
        const itemsElement = this.menu.instance.contentElement.querySelector('.js-items')

        for(const [ name, title, description, total ] of achievementsData)
        {
            const achievement = {
                total,
                achieved: false
            }
            const group = this.groups.get(name)
            group.items.push(achievement)

            // HTML
            const html = /* html */`
                <div class="title">${title}</div>
                <div class="description">
                    <div class="text">${description}</div>
                    <div class="progress">
                        <div class="check-icon"></div>
                        <span class="check"></span>
                        <span class="current">${0}</span> / <span>${total}</span>
                    </div>
                </div>
                <div class="bar">
                    <div class="fill"></div>
                </div>
            `

            achievement.itemElement = document.createElement('div')
            achievement.itemElement.classList.add('achievement')
            achievement.itemElement.innerHTML = html

            achievement.progressCurrentElement = achievement.itemElement.querySelector('.current')
            achievement.barFillElement = achievement.itemElement.querySelector('.bar .fill')
            
            itemsElement.append(achievement.itemElement)

            // Achieve
            achievement.achieve = (_silent = true) =>
            {
                achievement.achieved = true
                achievement.itemElement.classList.add('is-achieved')

                if(!_silent)
                {
                    this.globalProgress.update()
                    this.rewards.update()

                    // Confetti
                    if(this.game.world.confetti)
                    {
                        this.game.world.confetti.pop(this.game.player.position.clone())
                        this.game.world.confetti.pop(this.game.player.position.clone().add(new THREE.Vector3(1, -1, 1.5)))
                        this.game.world.confetti.pop(this.game.player.position.clone().add(new THREE.Vector3(1, -1, -1.5)))
                    }

                    // Sound
                    this.sounds.achieve.play()

                    // Notification
                    const html = /* html */`
                        <div class="top">
                            <div class="title">${title}</div>
                            <div class="progress">
                                <div class="check-icon"></div>
                                <span class="check"></span>
                                <span class="current">${total}</span> / <span>${total}</span>
                            </div>
                        </div>
                        <div class="bottom">
                            <div class="description">${description}</div>
                            <div class="open-icon"></div>
                        </div>
                    `

                    this.game.notifications.show(
                        html,
                        4,
                        () => {
                            this.game.inputs.interactiveButtons.clearItems()
                            this.game.menu.open('achievements')
                        }
                    )
                }
            }
        }
    }

    setMenu()
    {
        this.menu = {}
        this.menu.instance = this.game.menu.items.get('achievements')
    }

    setSounds()
    {
        this.sounds = {}
        
        this.sounds.achieve = this.game.audio.register({
            path: 'sounds/achievements/Money Reward 2.mp3',
            autoplay: false,
            loop: false,
            volume: 0.4,
            antiSpam: 0.5
        })

        this.sounds.paint = this.game.audio.register({
            path: 'sounds/vehicle/paint/Spray Paint 14.mp3',
            autoplay: false,
            loop: false,
            volume: 0.4,
            antiSpam: 0.5
        })
    }

    setReset()
    {
        const button = this.menu.instance.contentElement.querySelector('.js-button-reset')

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
        const group = this.groups.get(name)

        if(!group)
            return

        const progressDelta = group.setProgress(progress)

        if(progressDelta)
        {
            this.storage.save()
        }
    }

    addProgress(name)
    {
        const group = this.groups.get(name)

        if(!group)
            return
            
        const progressDelta = group.addProgress()

        if(progressDelta)
        {
            this.storage.save()
        }
    }

    reset()
    {
        this.game.player.distanceDriven.reset()

        this.groups.forEach(group =>
        {
            group.reset()
        })

        // this.globalProgress.reset()
        // this.storage.save()
        // this.globalProgress.update()
        // this.rewards.update()

        // const landingLeaveAchievement = this.groups.get('landingLeave')
        // if(landingLeaveAchievement && this.game.world.areas.landing)
        // {
        //     if(!this.game.world.areas.landing.isIn)
        //         landingLeaveAchievement.setProgress(1)
        // }

        // const debugAchievement = this.groups.get('debug')
        // if(debugAchievement && this.game.debug.active)
        // {
        //     debugAchievement.setProgress(1)
        // }
    }
}