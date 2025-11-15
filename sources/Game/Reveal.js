import * as THREE from 'three/webgpu'
import { color, uniform, vec2 } from 'three/tsl'
import { Game } from './Game.js'
import gsap from 'gsap'

export class Reveal
{
    constructor()
    {
        this.game = Game.getInstance()
        
        const respawn = this.game.respawns.getDefault()
        this.center = uniform(vec2(respawn.position.x, respawn.position.z))
        this.distance = uniform(0)
        this.thickness = uniform(0.05)
        this.color = uniform(color('#e88eff'))
        this.intensity = uniform(6.5)
        this.sound = this.game.audio.register({
            path: 'sounds/reveal/reveal-1.mp3',
            autoplay: false,
            loop: false,
            volume: 0.5,
            preload: true
        })

        if(this.game.debug.active)
        {
            this.debugPanel = this.game.debug.panel.addFolder({
                title: '📜 Reveal',
                expanded: false,
            })

            this.debugPanel.addBinding(this.distance, 'value', { label: 'distance', min: 0, max: 20, step: 0.01 })
            this.debugPanel.addBinding(this.thickness, 'value', { label: 'thickness', min: 0, max: 1, step: 0.001 })
            // this.game.debug.addThreeColorBinding(this.debugPanel, this.color.value, 'color')
            this.debugPanel.addBinding(this.intensity, 'value', { label: 'intensity', min: 1, max: 20, step: 0.001 })
        }

        this.game.ticker.events.on('tick', () =>
        {
            this.update()
        }, 9)
    }

    step(step)
    {
        const speedMultiplier = this.game.debug.active ? 4 : 1

        // Step 0
        if(step === 0)
        {
            // Intro loader => Hide circle
            this.game.world.intro.circle.hide(() =>
            {
                // Grid
                this.game.world.grid.show()

                // Reveal
                this.distance.value = 0

                gsap.to(
                    this.distance,
                    {
                        value: 3.5,
                        ease: 'back.out(1.7)',
                        duration: 2 / speedMultiplier,
                        overwrite: true,
                    }
                )

                // View
                this.game.view.zoom.smoothedRatio = 0.6
                this.game.view.zoom.baseRatio = 0.6

                gsap.to(
                    this.game.view.zoom,
                    {
                        baseRatio: 0.3,
                        // smoothedRatio: 0.4,
                        ease: 'power1.inOut',
                        duration: 1.25 / speedMultiplier,
                        overwrite: true,
                    }
                )

                // Intro loader => Show label
                this.game.world.intro.setLabel()

                // Cherry trees
                if(this.game.world.cherryTrees)
                    this.game.world.cherryTrees.leaves.seeThroughMultiplier = 0.5

                // Click
                if(this.game.debug.active)
                {
                    this.step(1)
                }
                else
                {
                    this.game.canvasElement.style.cursor = 'pointer'

                    this.game.inputs.addActions([
                        { name: 'introStart', categories: [ 'intro' ], keys: [ 'Pointer.any', 'Gamepad.cross', 'Keyboard.Enter' ] },
                    ])

                    const deltaCursor = { x: 0, y: 0 }

                    const callback = (action) =>
                    {
                        if(typeof action.value === 'object' && typeof action.value.x !== 'undefined')
                        {
                            // End
                            if(action.trigger === 'start')
                            {
                                deltaCursor.x = 0
                                deltaCursor.y = 0
                            }
                            else if(action.trigger === 'change')
                            {
                                if(this.game.inputs.pointer.isDown)
                                {
                                    deltaCursor.x += Math.abs(this.game.inputs.pointer.delta.x)
                                    deltaCursor.y += Math.abs(this.game.inputs.pointer.delta.y)
                                }
                            }
                            if(action.trigger === 'end')
                            {
                                const distance = Math.hypot(deltaCursor.x, deltaCursor.y)
                                
                                if(distance < 25)
                                {
                                    this.step(1)
                                    this.game.inputs.events.off('introStart', callback)
                                }
                            }
                        }
                        else
                        {
                            this.step(1)
                            this.game.inputs.events.off('introStart', callback)
                        }
                    }
                    this.game.inputs.events.on('introStart', callback)
                }
            })
        }
        else if(step = 1)
        {
            this.game.canvasElement.style.cursor = 'default'
                
            // Audio
            this.game.audio.init()
            this.sound.play()

            // Reveal
            gsap.to(
                this.distance,
                {
                    value: 30,
                    ease: 'back.in(1.3)',
                    duration: 2 / speedMultiplier,
                    overwrite: true,
                    onComplete: () =>
                    {
                        this.distance.value = 99999
                    }
                }
            )

            // Intro loader => Hide label
            this.game.world.intro.hideLabel()

            // Inputs
            this.game.inputs.filters.clear()
            this.game.inputs.filters.add('wandering')

            // View
            this.game.view.focusPoint.isTracking = true

            // View
            gsap.to(
                this.game.view.zoom,
                {
                    baseRatio: 0,
                    // smoothedRatio: 0,
                    ease: 'back.in(1.5)',
                    duration: 1.75 / speedMultiplier,
                    overwrite: true,
                    onComplete: () =>
                    {
                        this.game.interactivePoints.reveal()
                        this.game.world.init(2)
                        this.game.world.grid.hide()
                    }
                }
            )

            // Cherry trees
            if(this.game.world.cherryTrees)
            {
                gsap.to(
                    this.game.world.cherryTrees.leaves,
                    {
                        seeThroughMultiplier: 1,
                        ease: 'power1.inOut',
                        duration: 2 / speedMultiplier,
                        overwrite: true
                    }
                )
            }
        }
    }

    update()
    {
        this.color.value.copy(this.game.dayCycles.properties.revealColor.value)
        this.intensity.value = this.game.dayCycles.properties.revealIntensity.value
    }
}