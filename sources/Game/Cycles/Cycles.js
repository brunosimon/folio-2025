import * as THREE from 'three/webgpu'
import { Game } from '../Game.js'
import { lerp, remap, smoothstep } from '../utilities/maths.js'
import { Events } from '../Events.js'
import gsap from 'gsap'

export class Cycles
{
    constructor(name = 'Cycles', duration = 10, forcedProgress = null, manual = false)
    {
        this.game = Game.getInstance()

        if(this.game.debug.active)
        {
            this.debugPanel = this.game.debug.panel.addFolder({
                title: name,
                expanded: false,
            })
        }

        this.name = name
        this.duration = duration
        this.absoluteProgress = forcedProgress !== null ? forcedProgress : (Date.now() / 1000 / this.duration)
        this.newAbsoluteProgress = this.absoluteProgress
        this.progress = this.absoluteProgress % 1
        this.progressDelta = 1
        this.keyframesList = []
        this.properties = []
        this.punctualEvents = new Map()
        this.intervalEvents = new Map()
        this.events = new Events()

        // Debug
        this.newAbsoluteProgressBinding = this.game.debug.addManualBinding(
            this.debugPanel,
            this,
            'newAbsoluteProgress',
            {
                view: 'cameraring',
                series: 0,
                unit: {
                    pixels: 100,
                    ticks: 4,
                    value: 1,
                    step: 0.001
                },
            },
            () =>
            {
                return forcedProgress !== null ? forcedProgress : ((new Date()).getTime() / 1000 / this.duration)
            },
            manual
        )

        this.setKeyframes()
        this.setOverride()
        this.setIntervals()

        this.game.ticker.events.on('tick', () =>
        {
            this.update()
        }, 8)
        this.update(true)
    }

    getKeyframesDescriptions()
    {
        return [
            [
                { properties: { test: 0 }, stop: 0.0 },
                { properties: { test: 1 }, stop: 0.5 },
                { properties: { test: 0 }, stop: 1 },
            ]
        ]
    }

    getIntervalDescriptions()
    {
        return []
    }

    setKeyframes()
    {
        const keyframesDescriptions = this.getKeyframesDescriptions()

        for(const keyframesDescription of keyframesDescriptions)
        {
            this.values = this.createKeyframes(keyframesDescription)
        }
    }

    createKeyframes(steps)
    {
        const keyframes = {}
        keyframes.steps = steps

        for(const key in steps[0].properties)
        {
            if(key !== 'stop')
            {
                const property = {}
                property.value = steps[0].properties[key]
                property.overrideValue = null

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

                this.properties[key] = property
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

        this.keyframesList.push(keyframes)

        return keyframes
    }

    update(firstFrame = false)
    {
        // New absolute progress
        this.newAbsoluteProgressBinding.update()
        this.progressDelta = this.newAbsoluteProgress - this.absoluteProgress // Delta
        this.absoluteProgress = this.newAbsoluteProgress

        // New progress
        const newProgress = this.absoluteProgress % 1

        // Test punctual events
        this.punctualEvents.forEach((punctualEvent) =>
        {
            if(newProgress >= punctualEvent.progress && this.progress < punctualEvent.progress)
            {
                if(firstFrame)
                    this.game.ticker.wait(1, () =>
                    {
                        this.events.trigger(punctualEvent.name)
                    })
                else
                    this.events.trigger(punctualEvent.name)
            }
        })

        // Test interval events
        this.intervalEvents.forEach((intervalEvent) =>
        {
            const inInterval = newProgress > intervalEvent.startProgress && newProgress < intervalEvent.endProgress

            if(inInterval && !intervalEvent.inInterval)
            {
                intervalEvent.inInterval = true
                if(firstFrame)
                    this.game.ticker.wait(1, () =>
                    {
                        this.events.trigger(intervalEvent.name, [ intervalEvent.inInterval ])
                    })
                else
                    this.events.trigger(intervalEvent.name, [ intervalEvent.inInterval ])
            }
            if(!inInterval && intervalEvent.inInterval)
            {
                intervalEvent.inInterval = false
                if(firstFrame)
                    this.game.ticker.wait(1, () =>
                    {
                        this.events.trigger(intervalEvent.name, [ intervalEvent.inInterval ])
                    })
                else
                    this.events.trigger(intervalEvent.name, [ intervalEvent.inInterval ])
            }
        })

        // Progress
        this.progress = newProgress % 1

        // Progress override
        if(this.override.strength > 0 && this.override.progress !== null)
            this.progress = lerp(this.progress, this.override.progress, this.override.strength)

        // Properties
        for(const keyframe of this.keyframesList)
        {
            // Indices
            let indexPrev = -1
            let index = 0

            for(const step of keyframe.steps)
            {
                if(step.stop <= this.progress)
                    indexPrev = index

                index++
            }

            const indexNext = (indexPrev + 1) % keyframe.steps.length

            // Steps
            const stepPrevious = keyframe.steps[indexPrev]
            const stepNext = keyframe.steps[indexNext]

            // Mix ratio
            let mixRatio = 0
            // if(keyframe.interpolation === 'linear')
            //     mixRatio = remap(this.progress, stepPrevious.stop, stepNext.stop, 0, 1)
            // else if(keyframe.interpolation === 'smoothstep')
                mixRatio = smoothstep(this.progress, stepPrevious.stop, stepNext.stop)

            // Interpolate properties
            for(const key in this.properties)
            {
                const property = this.properties[key]

                if(property.type === 'color')
                    property.value.lerpColors(stepPrevious.properties[key], stepNext.properties[key], mixRatio)
                else if(property.type === 'number')
                    property.value = lerp(stepPrevious.properties[key], stepNext.properties[key], mixRatio)

                if(this.override.strength > 0 && property.overrideValue !== null)
                {
                    if(property.type === 'color')
                        property.value.lerpColors(property.value, property.overrideValue, this.override.strength)
                    else if(property.type === 'number')
                        property.value = lerp(property.value, property.overrideValue, this.override.strength)
                }
            }
        }
    }

    setOverride()
    {
        this.override = {}
        this.override.strength = 0
        this.override.progress = null
        
        this.override.start = (values = {}, duration = 5) =>
        {
            // Properties
            for(const propertyKey in this.properties)
            {
                const property = this.properties[propertyKey]

                if(typeof values[propertyKey] !== 'undefined')
                    property.overrideValue = values[propertyKey]
                else
                    property.overrideValue = null
            }

            // Progress
            if(typeof values.progress !== 'undefined')
                this.override.progress = values.progress

            // Transition
            if(duration === 0)
                this.override.strength = 1
            else
                gsap.to(this.override, { strength: 1, duration, overwrite: true })
        }

        this.override.end = (duration = 5) =>
        {
            // Transition
            if(duration === 0)
                this.override.strength = 0
            else
                gsap.to(this.override, { strength: 0, duration, overwrite: true })
        }
    }

    addPunctualEvent(name, progress)
    {
        this.punctualEvents.set(name, { name, progress })
    }

    setIntervals()
    {
        const descriptions = this.getIntervalDescriptions()

        for(const description of descriptions)
        {
            this.addIntervalEvent(description.name, description.start, description.end)
        }
    }

    addIntervalEvent(name, startProgress, endProgress)
    {
        this.intervalEvents.set(name, { name, startProgress, endProgress, inInterval: false })
    }
}