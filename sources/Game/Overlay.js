import * as THREE from 'three/webgpu'
import { Game } from './Game.js'
import { bool, color, float, Fn, If, mix, positionGeometry, texture, uniform, vec2, vec3, vec4, viewportBottomLeft, viewportCoordinate, viewportSize, screenUV, min, max, mul } from 'three/tsl'
import gsap from 'gsap'

export class Overlay
{
    constructor()
    {
        this.game = Game.getInstance()

        // Uniforms
        const colorA = uniform(color('#251f2b'))
        const colorB = uniform(color('#1d1721'))
        this.progress = uniform(1)
        this.patternSize = uniform(200)
        this.strokeSize = uniform(10)
        this.inverted = uniform(0)
        const diagonalAmplitude = 0.5
        const diagonalInvertMultipilier = 1 + diagonalAmplitude * 2

        // Geometry
        const geometry = new THREE.PlaneGeometry(2, 2)

        // Material
        const material = new THREE.MeshBasicNodeMaterial({ transparent: true, depthTest: false, depthWrite: false })
        material.outputNode = Fn(() =>
        {
            // Stroke
            const strokeMask = viewportCoordinate.x.add(viewportCoordinate.y).div(this.strokeSize).mod(1).sub(0.5).mul(2).abs()

            // Pattern
            const patternUv = viewportCoordinate.div(this.patternSize).mod(1)
            const patternMask = texture(this.game.resources.overlayPatternTexture, patternUv).a.remap(0, 0.68, 0, 1).toVar()

            If(this.inverted.greaterThan(0.5), () =>
            {
                patternMask.assign(patternMask.oneMinus())
            })

            // Final
            const mask = patternMask.add(strokeMask.mul(0.2)).mul(1 / (1 + 0.2))

            // Diagonal
            const diagonalRatio = screenUV.length().div(1.414) // Hypot 1, 1
            const diagonalProgress = this.progress.sub(diagonalRatio.mul(diagonalAmplitude)).mul(diagonalInvertMultipilier)

            // Discard
            diagonalProgress.lessThan(mask).discard()

            // Gradient
            const colorMix = screenUV.length()
            const finalColor = mix(colorA, colorB, colorMix)

            return vec4(finalColor, 1)
        })()
        material.vertexNode = vec4(positionGeometry.x, positionGeometry.y, 0, 1)

        // Mesh
        this.mesh = new THREE.Mesh(geometry, material)
        this.mesh.frustumCulled = false
        this.mesh.renderOrder = 1
        this.mesh.visible = true
        this.game.scene.add(this.mesh)

        // Debug
        if(this.game.debug.active)
        {
            const debugPanel = this.game.debug.panel.addFolder({
                title: '⬛️ Overlay',
                expanded: false,
            })
            this.game.debug.addThreeColorBinding(debugPanel, colorA.value, 'colorA')
            this.game.debug.addThreeColorBinding(debugPanel, colorB.value, 'colorB')
            debugPanel.addBinding(this.progress, 'value', { label: 'progress', min: 0, max: 1, step: 0.001 }).on('change', () => { this.mesh.visible = true })
            debugPanel.addBinding(this.patternSize, 'value', { label: 'patternSize', min: 0, max: 500, step: 1 })
            debugPanel.addBinding(this.strokeSize, 'value', { label: 'strokeSize', min: 0, max: 50, step: 1 })
            debugPanel.addBinding(this.inverted, 'value', { label: 'inverted', min: 0, max: 1, step: 1 })
            debugPanel.addButton({ title: 'show' }).on('click', () => { this.show() })
            debugPanel.addButton({ title: 'hide' }).on('click', () => { this.hide() })
        }

        requestAnimationFrame(() =>
        {
            requestAnimationFrame(() =>
            {
                this.hide()
            })
        })
    }

    show(callback)
    {
        this.inverted.value = 0
        this.mesh.visible = true
        gsap.to(this.progress, { value: 1, ease: 'power1.inOut', overwrite: true, duration: 4, onComplete: () =>
        {
            if(typeof callback === 'function')
                callback()
        } })
    }

    hide()
    {
        this.inverted.value = 1
        gsap.to(this.progress, { value: 0, ease: 'power1.inOut', overwrite: true, duration: 4, onComplete: () =>
        {
            this.mesh.visible = false
        } })
    }
}