import * as THREE from 'three/webgpu'
import { luminance, cos, float, min, atan, uniform, pass, PI, PI2, color, positionLocal, oneMinus, sin, texture, Fn, uv, vec2, vec3, vec4, mix, step, max, smoothstep, remap, dashSize, gapSize } from 'three/tsl'
import { Game } from '../Game.js'

const skewedUv = Fn(([ uv, skew ]) =>
{
    return vec2(
        uv.x.add(uv.y.mul(skew.x)),
        uv.y.add(uv.x.mul(skew.y))
    )
})

const twistedCylinder = Fn(([ position, parabolStrength, parabolOffset, parabolAmplitude, time ]) =>
{
    const angle = atan(position.z, position.x)
    const elevation = position.y

    // Parabol
    const radius = parabolStrength.mul(position.y.sub(parabolOffset)).pow(2).add(parabolAmplitude)

    // Turbulences
    radius.addAssign(sin(elevation.sub(time).mul(20).add(angle.mul(2))).mul(0.05))

    const twistedPosition = vec3(
        cos(angle).mul(radius),
        elevation,
        sin(angle).mul(radius)
    )

    return twistedPosition
})

export class VisualTornado
{
    constructor()
    {
        this.game = Game.getInstance()

        // Debug
        if(this.game.debug.active)
        {
            this.debugPanel = this.game.tornado.debugPanel
        }

        this.setMesh()

        // Update
        this.game.ticker.events.on('tick', () =>
        {
            this.update()
        }, 10)
    }

    setMesh()
    {
        // Uniforms
        this.visibility = uniform(1)
        const baseColor = uniform(color('#ff544d'))
        const emissive = uniform(8)
        const timeScale = uniform(0.15)
        const parabolStrength = uniform(1.7)
        const parabolOffset = uniform(0.4)
        const parabolAmplitude = uniform(0.27)

        // Geometry
        const geometry = new THREE.CylinderGeometry(1, 1, 1, 32, 16, true)
        geometry.translate(0, 0.5, 0)

        // Material
        const material = new THREE.MeshBasicNodeMaterial({ transparent: true, side: THREE.DoubleSide, wireframe: false, depthWrite: true, depthTest: true })

        material.positionNode = twistedCylinder(positionLocal, parabolStrength, parabolOffset, parabolAmplitude.sub(0.05), this.game.ticker.elapsedScaledUniform.mul(timeScale).mul(2))

        material.outputNode = Fn(() =>
        {
            const scaledTime = this.game.ticker.elapsedScaledUniform.mul(timeScale).negate()

            /**
             * Height modifier
             */
            const y = uv().y.sub(1).pow(2).oneMinus()
            const heightModifier = cos(y.mul(2).add(1).mul(PI))
            heightModifier.assign(remap(heightModifier, -1, 1, -1, 1))

            /**
             * Visibility modifier
             */
            const visibilityModifier = this.visibility.remap(0, 1, -4, 0)

            /**
             * Emissive
             */
            // Noise 1
            const emissiveNoise1Uv = uv().add(vec2(scaledTime.mul(1.1), scaledTime.mul(1.1)))
            emissiveNoise1Uv.assign(skewedUv(emissiveNoise1Uv, vec2(- 1, 0)).mul(vec2(4, 0.5)))
            const emissiveNoise1 = texture(this.game.noises.perlin, emissiveNoise1Uv, 1).r.remap(0.45, 0.7)

            // Noise 2
            const emissiveNoise2Uv = uv().add(vec2(scaledTime.mul(0.7), scaledTime.mul(0.7)))
            emissiveNoise2Uv.assign(skewedUv(emissiveNoise2Uv, vec2(- 1, 0)).mul(vec2(10, 2)))
            const emissiveNoise2 = texture(this.game.noises.perlin, emissiveNoise2Uv, 1).r.remap(0.45, 0.7)

            // Final noise
            const emissiveNoise = emissiveNoise1.mul(emissiveNoise2).add(heightModifier).add(visibilityModifier)
            emissiveNoise.assign(smoothstep(0, 0.4, emissiveNoise))

            // Color
            const emissiveColor = baseColor.mul(emissive)

            /**
             * Goo
             */
            // Noise 1
            const gooNoise1Uv = uv().add(vec2(scaledTime.mul(0.88), scaledTime.mul(0.88))).add(vec2(0.5));
            gooNoise1Uv.assign(skewedUv(gooNoise1Uv, vec2(- 1, 0)).mul(vec2(3, 0.4)));
            const gooNoise1 = texture(this.game.noises.perlin, gooNoise1Uv, 1).r.remap(0.45, 0.7);

            // Noise 2
            const gooNoise2Uv = uv().add(vec2(scaledTime.mul(0.66), scaledTime.mul(0.66))).add(vec2(0.5));
            gooNoise2Uv.assign(skewedUv(gooNoise2Uv,vec2(- 1, 0)).mul(vec2(8, 2)));
            const gooNoise2 = texture(this.game.noises.perlin, gooNoise2Uv, 1).r.remap(0.45, 0.7);

            // Final noise
            const gooNoise = gooNoise1.mul(gooNoise2).add(heightModifier).add(visibilityModifier)
            const gooMix = step(0.2, gooNoise)

            // Color
            const gooColor = this.game.fog.strength.mix(vec3(0), this.game.fog.color) // Fog

            /**
             * Alpha
             */
            const alpha = max(emissiveNoise, gooMix)

            // Discard
            alpha.lessThan(0.001).discard()

            /**
             * Output
             */
            const finalColor = mix(emissiveColor, gooColor, gooMix)
            return vec4(vec3(finalColor), alpha)
        })()

        // Mesh
        this.mesh = new THREE.Mesh(geometry, material)
        this.mesh.position.x = 30
        this.mesh.position.y = 0.5
        this.mesh.position.z = -13
        this.mesh.scale.set(8, 8, 8)
        this.game.scene.add(this.mesh)

        // Debug
        if(this.game.debug.active)
        {
            this.debugPanel.addBinding(this.visibility, 'value', { label: 'visibility', min: 0, max: 1, step: 0.001 })
            this.debugPanel.addBinding(parabolStrength, 'value', { label: 'parabolStrength', min: 0, max: 4, step: 0.001 })
            this.debugPanel.addBinding(parabolOffset, 'value', { label: 'parabolOffset', min: 0, max: 4, step: 0.001 })
            this.debugPanel.addBinding(parabolAmplitude, 'value', { label: 'parabolAmplitude', min: 0, max: 4, step: 0.001 })
        }
    }

    update()
    {
        this.visibility.value = this.game.tornado.strength

        this.mesh.visible = !!this.game.tornado.strength
        this.mesh.position.copy(this.game.tornado.position)
    }
}
