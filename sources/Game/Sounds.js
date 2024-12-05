import { Howl, Howler } from 'howler'
import { Game } from './Game.js'
import { remap, remapClamp } from './utilities/maths.js'

export class Sounds
{
    constructor()
    {
        this.game = new Game()

        this.setMusic()
        this.setFragments()
        this.setMuteToggle()

        this.game.time.events.on('tick', () =>
        {
            this.update()
        }, 12)
    }

    start()
    {
        this.music.play()
        this.fragments.ambiance.play()
    }

    setMusic()
    {
        this.music = new Howl({
            src: ['sounds/Mystical.mp3'],
            pool: 1,
            autoplay: false,
            loop: true,
            volume: 0.25
        })
    }

    setFragments()
    {
        this.fragments = {}
        this.fragments.ding = new Howl({
            src: ['sounds/Bell-with-a-Boom_TTX022103.mp3'],
            pool: 1,
            autoplay: false,
            loop: false,
            volume: 0.5
        })
        this.fragments.swoosh = new Howl({
            src: ['sounds/Magic Game Pack a Punch 3.mp3'],
            pool: 1,
            autoplay: false,
            loop: false,
            volume: 1
        })
        this.fragments.ambiance = new Howl({
            src: ['sounds/Mountain Audio - Small Chimes - Loop.mp3'],
            pool: 1,
            autoplay: false,
            loop: true,
            volume: 0.25
        })

        this.fragments.catch = () =>
        {
            this.fragments.ding.play()
            setTimeout(() =>
            {
                this.fragments.swoosh.play()
            }, 1350)
        }
    }

    setMuteToggle()
    {
        this.muteToggle = {}
        this.muteToggle.buttonElement = this.game.domElement.querySelector('.mute-toggle')

        this.muteToggle.active = true

        this.muteToggle.toggle = () =>
        {
            if(this.muteToggle.active)
                this.muteToggle.deactivate()
            else
                this.muteToggle.activate()
        }

        this.muteToggle.activate = () =>
        {
            if(this.muteToggle.active)
                return
            
            Howler.mute(false)
            this.muteToggle.active = true
            this.muteToggle.buttonElement.classList.add('is-active')
            localStorage.setItem('soundToggle', '1')
        }

        this.muteToggle.deactivate = () =>
        {
            if(!this.muteToggle.active)
                return
            
            Howler.mute(true)
            this.muteToggle.active = false
            this.muteToggle.buttonElement.classList.remove('is-active')
            localStorage.setItem('soundToggle', '0')
        }

        const soundToggleLocal = localStorage.getItem('soundToggle')
        if(soundToggleLocal !== null && soundToggleLocal === '0')
            this.muteToggle.deactivate()

        this.muteToggle.buttonElement.addEventListener('click', this.muteToggle.toggle)
    }

    update()
    {
        // Fragments
        const closestFragment = this.game.blackFriday.fragments.closest
        let volume = 0

        if(closestFragment)
            volume = remapClamp(closestFragment.distance, 2, 50, 0.25, 0)

        this.fragments.ambiance.volume(volume)
    }
}
