import * as THREE from 'three'
import { Game } from './Game.js'
import { lerp, remap, smoothstep } from './utilities/maths.js'
import { Events } from './Events.js'

export class DayCycles
{
    constructor()
    {
        this.game = Game.getInstance()

        this.interpolateds = []
        this.punctualEvents = []
        this.intervalEvents = []
        this.events = new Events()

        // Debug
        if(this.game.debug.active)
        {
            this.debugPanel = this.game.debug.panel.addFolder({
                title: '♻️ Day Cicles',
                expanded: false,
            })
            this.tweaksToRefresh = []
        }

        this.setDay()

        this.game.ticker.events.on('tick', () =>
        {
            this.update()
        })
    }

    setDay()
    {
        this.progress = 0.5
        this.manualProgress = this.progress
        this.manualProgressChanged = true
        this.speed = 0.005
        this.auto = true

        const presets = {
            day: { lightColor: new THREE.Color('#ffffff'), lightIntensity: 1.2, shadowColor: new THREE.Color('#0085db'), fogColorA: new THREE.Color('#00ffff'), fogColorB: new THREE.Color('#ffdf89'), fogNearRatio: 0.315, fogFarRatio: 1.25 },
            dusk: { lightColor: new THREE.Color('#ff4141'), lightIntensity: 1.2, shadowColor: new THREE.Color('#4e009c'), fogColorA: new THREE.Color('#3e53ff'), fogColorB: new THREE.Color('#ff4ce4'), fogNearRatio: 0, fogFarRatio: 1.25 },
            night: { lightColor: new THREE.Color('#3240ff'), lightIntensity: 3.8, shadowColor: new THREE.Color('#2f00db'), fogColorA: new THREE.Color('#041242'), fogColorB: new THREE.Color('#490a42'), fogNearRatio: -0.225, fogFarRatio: 0.75 },
            dawn: { lightColor: new THREE.Color('#ff9000'), lightIntensity: 1.2, shadowColor: new THREE.Color('#db004f'), fogColorA: new THREE.Color('#f885ff'), fogColorB: new THREE.Color('#ff7d24'), fogNearRatio: 0, fogFarRatio: 1.25 },
        }

        this.values = this.createKeyframes(
            [
                { properties: presets.day, stop: 0.0 }, // day
                { properties: presets.day, stop: 0.15 }, // day
                { properties: presets.dusk, stop: 0.25 }, // Dusk
                { properties: presets.night, stop: 0.35 }, // Night
                { properties: presets.night, stop: 0.6 }, // Night
                { properties: presets.dawn, stop: 0.8 }, // Dawn
                { properties: presets.day, stop: 0.9 }, // day
            ],
            this,
            'smoothstep'
        )

        // Debug
        if(this.game.debug.active)
        {
            const tweak = this.debugPanel
                .addBinding(this, 'manualProgress', { min: 0, max: 1, step: 0.001 })
                .on('change', () => { this.manualProgressChanged = true })
            this.tweaksToRefresh.push(tweak)
            this.debugPanel.addBinding(this, 'speed', { min: 0, max: 1, step: 0.001 })
            this.debugPanel.addBinding(this, 'auto')

            const progresses = {
                day: () => { this.progress = 0 },
                dusk: () => { this.progress = 0.25 },
                night: () => { this.progress = 0.35 },
                dawn: () => { this.progress = 0.8 }
            }

            this.game.debug.addButtons(
                this.debugPanel,
                progresses,
                'setTime'
            )
            
            // const progressesKeys = Object.keys(progresses)

            // this.debugPanel
            //     .addBlade({
            //         view: 'buttongrid',
            //         size: [progressesKeys.length, 1],
            //         cells: (x, y) => ({
            //             title: [
            //                 progressesKeys,
            //             ][y][x],
            //         }),
            //         label: 'jump',
            //     })
            //     .on('click', (event) =>
            //     {
            //         this.progress = progresses[event.cell.title]
            //     })

            for(const presetKey in presets)
            {
                const preset = presets[presetKey]
                const presetsDebugPanel = this.debugPanel.addFolder({
                    title: presetKey,
                    expanded: true,
                })

                this.game.debug.addThreeColorBinding(presetsDebugPanel, preset.lightColor, 'lightColor')
                presetsDebugPanel.addBinding(preset, 'lightIntensity', { min: 0, max: 20 })
                this.game.debug.addThreeColorBinding(presetsDebugPanel, preset.shadowColor, 'shadowColor')
                this.game.debug.addThreeColorBinding(presetsDebugPanel, preset.fogColorA, 'fogColorA')
                this.game.debug.addThreeColorBinding(presetsDebugPanel, preset.fogColorB, 'fogColorB')
                presetsDebugPanel.addBinding(preset, 'fogNearRatio', { label: 'near', min: -2, max: 2, step: 0.001 })
                presetsDebugPanel.addBinding(preset, 'fogFarRatio', { label: 'far', min: -2, max: 2, step: 0.001 })
            }
        }
    }

    createKeyframes(steps, cycles, interpolation = 'linear')
    {
        const interpolated = {}
        interpolated.steps = steps
        interpolated.properties = {}
        interpolated.cycles = cycles
        interpolated.interpolation = interpolation

        for(const key in steps[0].properties)
        {
            if(key !== 'stop')
            {
                const property = {}
                property.value = steps[0].properties[key]

                if(property.value instanceof THREE.Color)
                {
                    property.type = 'color'
                    property.value = property.value.clone()
                }
                else if(typeof property.value === 'number')
                {
                    property.type = 'number'
                    property.value = property.value
                }

                interpolated.properties[key] = property
            }
        }

        // Add fake steps to fix non 0-1 stops
        const firstStep = steps[0]
        const lastStep = steps[steps.length - 1]

        if(lastStep.stop < 1)
        {
            const newStep = { ...firstStep }
            newStep.stop = 1 + newStep.stop
            steps.push(newStep)
        }

        if(firstStep.stop > 0)
        {
            const newStep = { ...lastStep }
            newStep.stop = - (1 - newStep.stop)
            steps.unshift(newStep)
        }

        this.interpolateds.push(interpolated)

        return interpolated
    }

    update()
    {
        // New progress
        let newProgress = this.progress
        if(this.auto)
            newProgress += this.game.ticker.deltaScaled * this.speed

        if(this.manualProgressChanged)
        {
            this.manualProgressChanged = false
            newProgress = this.manualProgress
        }

        // Test punctual events
        for(const punctualEvent of this.punctualEvents)
        {
            if(newProgress >= punctualEvent.progress && this.progress < punctualEvent.progress)
            {
                this.events.trigger(punctualEvent.name)
            }
        }

        // Test interval events
        for(const intervalEvent of this.intervalEvents)
        {
            const inInterval = newProgress > intervalEvent.startProgress && newProgress < intervalEvent.endProgress

            if(inInterval && !intervalEvent.inInverval)
            {
                intervalEvent.inInverval = true
                this.events.trigger(intervalEvent.name, [ intervalEvent.inInverval ])
            }
            if(!inInterval && intervalEvent.inInverval)
            {
                intervalEvent.inInverval = false
                this.events.trigger(intervalEvent.name, [ intervalEvent.inInverval ])
            }
        }

        // Progress
        this.progress = newProgress % 1

        for(const interpolated of this.interpolateds)
        {
            // Indices
            let indexPrev = -1
            let index = 0

            for(const step of interpolated.steps)
            {
                if(step.stop <= interpolated.cycles.progress)
                    indexPrev = index

                index++
            }

            const indexNext = (indexPrev + 1) % interpolated.steps.length

            // Steps
            const stepPrevious = interpolated.steps[indexPrev]
            const stepNext = interpolated.steps[indexNext]

            // Mix ratio
            let mixRatio = 0
            if(interpolated.interpolation === 'linear')
                mixRatio = remap(interpolated.cycles.progress, stepPrevious.stop, stepNext.stop, 0, 1)
            else if(interpolated.interpolation === 'smoothstep')
                mixRatio = smoothstep(interpolated.cycles.progress, stepPrevious.stop, stepNext.stop)

            // Interpolate properties
            for(const key in interpolated.properties)
            {
                const property = interpolated.properties[key]

                if(property.type === 'color')
                {
                    property.value.lerpColors(stepPrevious.properties[key], stepNext.properties[key], mixRatio)
                }
                else if(property.type === 'number')
                {
                    property.value = lerp(stepPrevious.properties[key], stepNext.properties[key], mixRatio)
                }
            }
        }

        if(this.game.debug.active)
        {
            for(const binding of this.tweaksToRefresh)
            {
                binding.refresh()
            }
        }
    }

    addPunctualEvent(name, progress)
    {
        this.punctualEvents.push({ name, progress })
    }

    addIntervalEvent(name, startProgress, endProgress)
    {
        this.intervalEvents.push({ name, startProgress, endProgress, inInverval: false })
    }
}