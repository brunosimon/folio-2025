import * as THREE from 'three/webgpu'
import { Howl, Howler } from 'howler'
import { Game } from './Game.js'
import { remap, remapClamp, clamp } from './utilities/maths.js'
import gsap from 'gsap'

export class Audio
{
    constructor()
    {
        this.game = Game.getInstance()

        this.initiated = false
        this.groups = new Map()

        this.setMuteToggle()

        this.game.ticker.events.on('tick', () =>
        {
            this.update()
        }, 12)
    }

    init()
    {
        this.initiated = true

        this.setPlaylist()
        this.setAmbiants()
        this.setOneOffs()

        // Play all autoplays that didn't start because not initated
        this.groups.forEach((group, name) =>
        {
            for(const item of group.items)
            {
                if(item.autoplay && !item.playing)
                    item.play()
            }
        })
    }

    register(options = {})
    {
        // Group
        const groupName = options.group ?? 'all'
        let group = this.groups.get(groupName)

        if(!group)
        {
            group = {}
            group.items = []
            group.lastPlayedId = -1
            group.playRandomNext = (...parameters) =>
            {
                const delta = 1 + Math.floor(Math.random() * (group.items.length - 2))
                const id = (group.lastPlayedId + delta) % group.items.length

                const item = group.items[id]
                item.play(...parameters)
            }
            group.play = (...parameters) =>
            {
                const id = (group.lastPlayedId + 1) % group.items.length

                const item = group.items[id]
                item.play(...parameters)
            }
            this.groups.set(groupName, group)
        }

        const item = {}
        item.howl = new Howl({
            src: [ options.path ],
            pool: 2,
            autoplay: (this.initiated && options.autoplay) ?? false,
            loop: options.loop ?? false,
            volume: options.volume ?? 0.5,
            preload: options.preload ?? true,
            onloaderror: () =>
            {
                console.error(`Audio > Load error > ${options.path}`, options)
            },
            onend: () =>
            {
                item.playing = false
            }
        })
        item.positions = options.positions ?? null
        if(item.positions !== null && !(item.positions instanceof Array))
            item.positions = [ item.positions ]
        item.distanceFade = options.distanceFade ?? null
        item.rate = options.rate ?? 1
        item.volume = options.volume ?? 0.5
        item.antiSpam = options.antiSpam ?? 0.1
        item.lastPlay = -Infinity
        item.onPlaying = options.onPlaying ?? null
        item.onPlay = options.onPlay ?? null
        item.loaded = options.preload ?? true
        item.autoplay = options.autoplay ?? false
        item.playing = (this.initiated && options.autoplay) ?? false
        item.id = group.items.length

        item.play = (...parameters) =>
        {
            if(!this.initiated)
            {
                return
            }

            // Load
            if(!item.loaded)
            {
                item.loaded = true
                item.howl.load()
            }

            // Anti spam
            if(item.antiSpam)
            {
                if(this.game.ticker.elapsed - item.lastPlay < item.antiSpam)
                    return
            }

            // Play binding
            if(typeof item.onPlay === 'function')
                item.onPlay(item, ...parameters)
                
            // Play
            item.howl.play()

            // Save last play for anti spam
            item.lastPlay = this.game.ticker.elapsed
            item.playing = true

            // Save for group
            group.lastPlayedId = item.id
        }

        group.items.push(item)

        return item
    }

    setPlaylist()
    {
        const paths = [
            // 'sounds/musics/scarborough-fair-dance_stem-04.mp3',
            // 'sounds/musics/Moonglow.mp3',
            // 'sounds/musics/Healing Native Flute 01.mp3',
            // 'sounds/musics/omaha_main-full.mp3',
            // 'sounds/musics/Portfolio BS - Track 1.mp3',
            'sounds/musics/Portfolio BS - Track 2.mp3',
            'sounds/musics/Portfolio BS - Track 3.mp3',
            'sounds/musics/Portfolio BS - Track 4.mp3',
            'sounds/musics/Portfolio BS - Track 5 WIP.mp3',
        ]

        this.playlist = {}
        this.playlist.songs = []
        // this.playlist.index = (Math.floor(Date.now() / 1000 / 60 / 3) % paths.length) - 1 // Different music every X minutes
        this.playlist.index = -1 // Different music every X minutes
        this.playlist.current = null

        for(const path of paths)
        {
            const song = {}
            song.loaded = false
            song.sound = new Howl({
                src: [ path ],
                pool: 0,
                autoplay: false,
                loop: false,
                preload: false,
                volume: 0.15,
                onend: () =>
                {
                    this.playlist.next()
                }
            })
            this.playlist.songs.push(song)
        }

        this.playlist.next = () =>
        {
            this.playlist.index++

            if(this.playlist.index >= this.playlist.songs.length)
                this.playlist.index = 0

            console.log('playing', this.playlist.index)

            // Old one
            if(this.playlist.current)
            {
                this.playlist.current.sound.stop()
            }

            // New one
            this.playlist.current = this.playlist.songs[this.playlist.index]

            if(!this.playlist.current.loaded)
            {
                this.playlist.current.sound.load()
            }

            this.playlist.current.sound.play()
        }

        if(import.meta.env.VITE_MUSIC)
        {
            this.playlist.next()
        }
    }

    setAmbiants()
    {
        const getRandomDirection = (distance = 30) =>
        {
            return new THREE.Vector3(
                this.game.view.focusPoint.position.x + ((Math.random() < 0.5) ? distance : - distance),
                this.game.view.focusPoint.position.y,
                this.game.view.focusPoint.position.z + ((Math.random() < 0.5) ? distance : - distance)
            )
        }
        
        // Birds tweets
        {
            const tweetsPaths = [
                'sounds/birdTweets/24074 small bird tweet calling-full-1.mp3',
                'sounds/birdTweets/24074 small bird tweet calling-full-2.mp3',
                'sounds/birdTweets/20711 finch bird isolated tweet-full.mp3',
                'sounds/birdTweets/30673 Yellowhammer bird tweet 3-full.mp3',
                'sounds/birdTweets/31062 Ortolan bird tweet-full.mp3',
                'sounds/birdTweets/31451 Ortolan bunting bird isolated tweet-full.mp3',
            ]

            const tweets = []
            for(const path of tweetsPaths)
                tweets.push(
                    this.register({
                        group: 'birdTweet',
                        path: path,
                        autoplay: false,
                        loop: false,
                        volume: 0.3,
                        positions: new THREE.Vector3(),
                        onPlay: (item) =>
                        {
                            item.volume = 0.2 + Math.random() * 0.15
                            item.rate = 1 + Math.random() * 0.7
                            item.positions[0].copy(getRandomDirection())
                        }
                    })
                )


            const tryPlay = () =>
            {
                // Chance to trigger
                if(!this.game.dayCycles.intervalEvents.get('night').inInterval && Math.random() < 0.5)
                {
                    const sound = tweets[Math.floor(Math.random() * tweets.length)]
                    sound.play()
                }

                // Wait before trying again
                gsap.delayedCall(0.5 + Math.random() * 5, tryPlay)
            }
            tryPlay()
        }
        
        // Owl
        {
            const sound = this.register({
                group: 'owl',
                path: 'sounds/owl/OwlHootingReverberantSeveral_Rik8a_03.mp3',
                autoplay: false,
                loop: false,
                volume: 0.3,
                positions: new THREE.Vector3(),
                onPlay: (item) =>
                {
                    item.volume = 0.2 + Math.random() * 0.15
                    item.rate = 1 + Math.random() * 0.3
                    item.positions[0].copy(getRandomDirection())
                }
            })

            const tryPlay = () =>
            {
                // Chance to trigger
                if(this.game.dayCycles.intervalEvents.get('night').inInterval && Math.random() < 0.5)
                {
                    sound.play()
                }

                // Wait before trying again
                gsap.delayedCall(30 + Math.random() * 60, tryPlay)
            }
            gsap.delayedCall(30 + Math.random() * 60, tryPlay)
        }

        // Rooster
        {
            const sound = this.register({
                group: 'rooster',
                path: 'sounds/rooster/rooster-crowing.mp3',
                autoplay: false,
                loop: false,
                volume: 0.1,
                positions: new THREE.Vector3(),
                onPlay: (item) =>
                {   
                    item.volume = 0.05 + Math.random() * 0.15
                    item.positions[0].copy(getRandomDirection())
                }
            })

            this.game.dayCycles.events.on('night', (inInterval) =>
            {
                if(!inInterval)
                    sound.play()
            })
        }

        // Wolf
        {
            const sound = this.register({
                group: 'wolf',
                path: 'sounds/wolf/TimberWolvesGroupHowlingSomeWhimpering_S2h0E_04.mp3',
                autoplay: false,
                loop: false,
                volume: 0.1,
                positions: new THREE.Vector3(),
                onPlay: (item) =>
                {   
                    item.volume = 0.05 + Math.random() * 0.15
                    item.positions[0].copy(getRandomDirection())
                }
            })

            this.game.dayCycles.events.on('deepNight', (inInterval) =>
            {
                if(inInterval)
                    sound.play()
            })
        }

        // Crickets
        {

            const sound = this.register({
                group: 'crickets',
                    path: 'sounds/crickets/Crickets.mp3',
                autoplay: true,
                loop: true,
                volume: this.game.dayCycles.intervalEvents.get('night').inInterval ? 0.4 : 0
            })

            this.game.dayCycles.events.on('night', (inInterval) =>
            {
                gsap.to(sound, { volume: inInterval ? 1 : 0, duration: 15, overwrite: true })
            })
        }

        // Jingle bells
        this.register({
            group: 'jingleBells',
            path: 'sounds/jingleBells/Mountain Audio - Christmas Bells.mp3',
            autoplay: true,
            loop: true,
            volume: 0,
            onPlaying: (item) =>
            {
                const sine = Math.sin(this.game.ticker.elapsedScaled * 0.1) * 0.5 + 0.5
                const targetVolume = Math.max(0, this.game.weather.snow.value) * 0.3 * sine

                const easing = targetVolume > item.volume ? 0.005 : 0.05
                item.volume += (targetVolume - item.volume) * this.game.ticker.deltaScaled * easing
            }
        })

        // Rain
        this.register({
            group: 'rain',
            path: 'sounds/rain/soundjay_rain-on-leaves_main-01.mp3',
            autoplay: true,
            loop: true,
            volume: 0,
            onPlaying: (item) =>
            {
                const snowAttenuation = remapClamp(this.game.weather.snow.value, 0, 0.6, 1, 0)
                item.volume = Math.pow(this.game.weather.rain.value * snowAttenuation, 2)
            }
        })

        // Wind
        this.register({
            group: 'wind',
            path: 'sounds/wind/13582-wind-in-forest-loop.mp3',
            autoplay: true,
            loop: true,
            volume: 0,
            onPlaying: (item) =>
            {
                item.volume = Math.pow(remapClamp(this.game.weather.wind.value, 0.3, 1, 0, 1), 3) * 0.7
            }
        })

        // Waves
        this.register({
            group: 'waves',
            path: 'sounds/waves/lake-waves.mp3',
            autoplay: true,
            loop: true,
            volume: 0,
            onPlaying: (item) =>
            {
                const distanceToSide = Math.min(
                    this.game.terrain.size / 2 - Math.abs(this.game.player.position.x),
                    this.game.terrain.size / 2 - Math.abs(this.game.player.position.z)
                )
                item.volume = Math.pow(remapClamp(distanceToSide, 0, 40, 1, 0.1), 2) * 0.5
            }
        })

        // Oven fire (Project Area + Cookie Area)
        {
            const positions = []
            if(this.game.world.areas?.cookieStand)
                positions.push(this.game.world.areas.cookieStand.references.items.get('spawner')[0].position)
            if(this.game.world.areas?.projects)
                positions.push(this.game.world.areas.projects.references.items.get('oven')[0].position)

            if(positions.length)
            {
                this.game.audio.register({
                    group: 'ovenFire',
                    path: 'sounds/fire/Mountain Audio - Fire Burning in a Wood Stove 1.mp3',
                    autoplay: true,
                    loop: true,
                    volume: 0.4,
                    positions: positions,
                    distanceFade: 13,
                })
            }
        }

        // Campfire (Lab Area + Bonfire Area)
        {
            const positions = []
            if(this.game.world.areas?.lab)
                positions.push(this.game.world.areas.lab.references.items.get('fire')[0].position)

            if(positions.length)
            {
                this.game.audio.register({
                    group: 'campfire',
                    path: 'sounds/fire/Fire Burning.mp3',
                    autoplay: true,
                    loop: true,
                    volume: 0.4,
                    positions: positions,
                    distanceFade: 13,
                })
            }
        }
    }

    setOneOffs()
    {
        this.register({
            group: 'slide',
            path: 'sounds/mecanism/slide.mp3',
            autoplay: false,
            volume: 0.18
        })

        this.register({
            group: 'click',
            path: 'sounds/mecanism/click.mp3',
            autoplay: false,
            volume: 0.25,
            onPlay: (item, isOpen = true) =>
            {
                item.rate = isOpen ? 1 : 0.6
            }
        })

        this.register({
            group: 'assemble',
            path: 'sounds/mecanism/assemble.mp3',
            autoplay: false,
            volume: 0.3
        })

        // Hits default
        {
            const paths = [
                [ 'sounds/hits/defaults/Stone_Hit_Crash_106-2.mp3', 0.35 ],
                [ 'sounds/hits/defaults/Stone_Hit_Crash_071-1.mp3', 0.35 ],
                [ 'sounds/hits/defaults/Stone_Hit_Crash_106-1.mp3', 0.35 ],
                [ 'sounds/hits/defaults/Impact Soft 01.mp3', 0.8 ],
                [ 'sounds/hits/defaults/Impact Soft 02.mp3', 0.8 ],
                [ 'sounds/hits/defaults/Impact Soft 03.mp3', 0.8 ],
                [ 'sounds/hits/defaults/Impact Soft 04.mp3', 0.8 ],
            ]

            for(const [path, baseVolume] of paths)
            {
                this.register({
                    group: 'hitDefault',
                    path: path,
                    autoplay: false,
                    volume: baseVolume,
                    antiSpam: 0.1,
                    positions: new THREE.Vector3(),
                    distanceFade: 20,
                    onPlay: (item, force, position) =>
                    {
                        item.positions[0].copy(position)
                        const forceVolume = remapClamp(force, 0, 200, 0, 1)
                        item.volume = baseVolume * forceVolume
                        item.rate = 0.9 + Math.random() * 0.2
                    }
                })
            }
        }

        // Hits bricks
        {
            const paths = [
                [ 'sounds/hits/bricks/24445 brick light hitting-full-2.mp3', 0.6 ],
                [ 'sounds/hits/bricks/41559 Stone brick fall hit 01-full-1.mp3', 0.6 ],
                [ 'sounds/hits/bricks/41563 Stone brick fall hit 05-full-1.mp3', 0.6 ],
                [ 'sounds/hits/bricks/BrickSetDown_BW.5803-1.mp3', 0.6 ],
            ]

            for(const [path, baseVolume] of paths)
            {
                this.register({
                    group: 'hitBrick',
                    path: path,
                    autoplay: false,
                    volume: baseVolume,
                    antiSpam: 0.1,
                    positions: new THREE.Vector3(),
                    distanceFade: 20,
                    onPlay: (item, force, position) =>
                    {
                        item.positions[0].copy(position)
                        item.volume = baseVolume * Math.pow(remapClamp(force, 5, 20, 0, 1), 2)
                        item.rate = 0.9 + Math.random() * 0.2
                    }
                })
            }
        }

        // Hits metal
        {
            const paths = [
                [ 'sounds/hits/metal/EQUIPTact_Fire Gear_SDFIRE0411.mp3', 0.6 ],
                [ 'sounds/hits/metal/Metal Clip Hit.mp3', 0.6 ],
                [ 'sounds/hits/metal/Metalic 3.mp3', 0.6 ],
            ]

            for(const [path, baseVolume] of paths)
            {
                this.register({
                    group: 'hitMetal',
                    path: path,
                    autoplay: false,
                    volume: baseVolume,
                    antiSpam: 0.1,
                    positions: new THREE.Vector3(),
                    distanceFade: 20,
                    onPlay: (item, force, position) =>
                    {
                        item.positions[0].copy(position)
                        item.volume = baseVolume * Math.pow(remapClamp(force, 5, 20, 0, 1), 2)
                        item.rate = 0.9 + Math.random() * 0.2
                    }
                })
            }
        }
    }

    setMuteToggle()
    {
        this.muteToggle = {}
        this.muteToggle.buttonElement = this.game.domElement.querySelector('.js-audio-toggle')

        this.muteToggle.active = false

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
            
            Howler.mute(true)
            this.muteToggle.active = true
            this.muteToggle.buttonElement.classList.remove('is-active')
            localStorage.setItem('soundToggle', '1')
        }

        this.muteToggle.deactivate = () =>
        {
            if(!this.muteToggle.active)
                return
            
            Howler.mute(false)
            this.muteToggle.active = false
            this.muteToggle.buttonElement.classList.add('is-active')
            localStorage.setItem('soundToggle', '0')
        }

        const soundToggleLocal = localStorage.getItem('soundToggle')
        if(soundToggleLocal !== null && soundToggleLocal === '1')
            this.muteToggle.activate()

        this.muteToggle.buttonElement.addEventListener('click', this.muteToggle.toggle)

        // Tab focus / blur
        window.addEventListener('blur', () =>
        {
            Howler.mute(true)
        })

        window.addEventListener('focus', () =>
        {
            if(!this.muteToggle.active)
                Howler.mute(false)
        })

    }

    update()
    {
        this.globalRate = this.game.time.scale / this.game.time.defaultScale
        this.groups.forEach((group) =>
        {
            for(const item of group.items)
            {
                // Apply tick binding
                if(typeof item.onPlaying === 'function')
                {
                    item.onPlaying(item)
                }

                // Positional and distance fade
                let distanceFadeMultiplier = 1
                if(item.positions && item.howl.playing())
                {
                    let closestDistance = Infinity
                    let closestPosition = null

                    for(const position of item.positions)
                    {
                        const distance = position.distanceTo(this.game.view.focusPoint.position)

                        if(distance < closestDistance)
                        {
                            closestDistance = distance
                            closestPosition = position
                        }
                    }

                    const cameraRelativePosition = closestPosition.clone()
                    cameraRelativePosition.applyMatrix4(this.game.view.camera.matrixWorldInverse)
                    cameraRelativePosition.normalize()
                    cameraRelativePosition.z *= 0.1

                    if(item.distanceFade)
                    {
                        distanceFadeMultiplier = remapClamp(closestDistance, 0, item.distanceFade, 1, 0)
                    }

                    if(distanceFadeMultiplier > 0)
                        item.howl.pos(cameraRelativePosition.x, cameraRelativePosition.y, cameraRelativePosition.z)
                }

                // Rate (apply global too)
                item.howl.rate(item.rate * this.globalRate)

                // Volume
                const volume = item.volume * distanceFadeMultiplier
                item.howl.volume(item.volume * distanceFadeMultiplier)

                item.howl.mute(volume < 0.01)
            }
        })
    }
}
