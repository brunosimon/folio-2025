import { vec2, Fn, texture, uniform } from 'three/tsl'
import { Game } from './Game.js'
import { remapClamp } from './utilities/maths.js'


export class Wind
{
    constructor()
    {
        this.game = Game.getInstance()

        if(this.game.debug.active)
        {
            this.debugPanel = this.game.debug.panel.addFolder({
                title: '💨 Wind',
                expanded: false,
            })
        }

        this.angle = Math.PI * 0.6
        this.direction = uniform(vec2(
            Math.sin(this.angle),
            Math.cos(this.angle),
        ))
        this.positionFrequency = uniform(0.5)
        this.strength = uniform(0.5)
        this.localTime = uniform(0)
        this.timeFrequency = 0.1
        
        this.offsetNode = Fn(([position]) =>
        {
            const remapedPosition = position.mul(this.positionFrequency)

            const noiseUv1 = remapedPosition.xy.mul(0.2).add(this.direction.mul(this.localTime)).xy
            const noise1 = texture(this.game.noises.perlin, noiseUv1).r.sub(0.5)

            const noiseUv2 = remapedPosition.xy.mul(0.1).add(this.direction.mul(this.localTime.mul(0.2))).xy
            const noise2 = texture(this.game.noises.perlin, noiseUv2).r.sub(0.5)

            const intensity = noise2.add(noise1)
            
            return vec2(this.direction.mul(intensity).mul(this.strength))
        })

        this.game.ticker.events.on('tick', () =>
        {
            this.update()
        }, 9)

        // Debug
        this.strengthBinding = this.game.debug.addManualBinding(
            this.debugPanel,
            this.strength,
            'value',
            { label: 'strength', min: 0, max: 1, step: 0.001 },
            () =>
            {
                return remapClamp(this.game.weather.wind.value, 0, 1, 0.1, 1)
            }
        )

        if(this.game.debug.active)
        {
            this.debugPanel.addBinding(this.positionFrequency, 'value', { label: 'positionFrequency', min: 0, max: 1, step: 0.001 })
            this.debugPanel.addBinding(this, 'timeFrequency', { min: 0, max: 1, step: 0.001 })
            this.debugPanel
                .addBinding(this, 'angle', { min: - Math.PI, max: Math.PI, step: 0.001 })
                .on('change', tweak => { this.direction.value.set(Math.sin(tweak.value), Math.cos(tweak.value),) })
        }
    }

    update()
    {
        // Apply weather
        this.strengthBinding.update()
        this.localTime.value += this.game.ticker.deltaScaled * this.timeFrequency * this.strength.value
    }
}