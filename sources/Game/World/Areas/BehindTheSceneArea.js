import * as THREE from 'three/webgpu'
import { Game } from '../../Game.js'
import { PortalSlabsGeometry } from '../../Geometries/PortalSlabsGeometry.js'
import { attribute, color, float, Fn, mix, PI, PI2, positionGeometry, screenCoordinate, sin, texture, uniform, varying, vec2, vec3, vec4, viewportCoordinate } from 'three/tsl'
import { InteractivePoints } from '../../InteractivePoints.js'
import { Area } from './Area.js'

export class BehindTheSceneArea extends Area
{
    constructor(model)
    {
        super(model)

        // Debug
        if(this.game.debug.active)
        {
            this.debugPanel = this.game.debug.panel.addFolder({
                title: '🔳 Behind the scene',
                expanded: false,
            })
        }

        this.center = this.references.items.get('center')[0].position

        this.setSounds()
        this.setSlabs()
        this.setInteractivePoint()
        this.setAchievement()
    }

    setSounds()
    {
        this.sounds = {}

        this.sounds.chimers = this.game.audio.register({
            path: 'sounds/magic/Environmental Loop Scifi Bright Glassy Wandering Tones Layered 02.mp3',
            autoplay: true,
            loop: true,
            volume: 0.15,
            positions: this.references.items.get('interactivePoint')[0].position,
            distanceFade: 20
        })
    }

    setSlabs()
    {
        // Geometry
        const geometry = new PortalSlabsGeometry(1.5, 6)
        
        // Material
        const material = new THREE.MeshBasicMaterial({ wireframe: false })
        const effectVarying = varying(float())
        this.vehicleRelativePosition = uniform(vec2())
        this.bloomColor = uniform(color('#6053ff'))
        this.bloomIntensity = uniform(14)
        this.starsOffset = uniform(vec2(0))

        material.positionNode = Fn(() =>
        {
            const random = attribute('random')
            const edge = attribute('edge')
            const center = attribute('center')
            const distanceToCenter = attribute('distanceToCenter')

            const newPosition = positionGeometry.toVar()

            const osciliation = sin(this.game.ticker.elapsedScaledUniform.mul(0.5).add(random.mul(PI2))).mul(0.5)
            
            const distanceToVehicle = center.sub(this.vehicleRelativePosition).length()

            const effect = distanceToCenter.remap(0, 3.5, 3, 0).toVar()// Slab distance to center
            effect.addAssign(osciliation) // Permanent osciliation
            effect.assign(effect.clamp(0, 1)) // Clamp
            effect.addAssign(distanceToVehicle.remapClamp(2, 4, -1, 0)) // Vehicle distance
            effectVarying.assign(effect) // Assign to varying BEFORE applying edge
            effect.mulAssign(edge) // Only on edges


            const toCenter = newPosition.xz.sub(center)
            toCenter.mulAssign(effect)
            newPosition.xz.subAssign(toCenter)

            // return positionGeometry
            return newPosition
        })()

        material.outputNode = Fn(() =>
        {
            const edge = attribute('edge')
            const edgeOffset = effectVarying.remapClamp(0.1, 1, 0.5, 0)
            const edgeTreshold = edge.remapClamp(0, 1, 0.98, 1)
            const strength = edge.toVar().sub(0.5).abs().mul(2).add(edgeOffset).step(edgeTreshold)
            
            const starsUv = screenCoordinate.div(256).fract().add(this.starsOffset)
            const starsColor = texture(this.game.resources.behindTheSceneStarsTexture, starsUv).rgb.pow(2).mul(5)
            
            const bloomColor = this.bloomColor.mul(this.bloomIntensity)
            const finalColor = mix(starsColor, bloomColor, strength)
            return vec4(finalColor, 1)
        })()

        // Mesh
        this.slabs = new THREE.Mesh(geometry, material)
        this.slabs.position.copy(this.center)
        this.slabs.position.y += 0.01
        this.game.worldContainer.add(this.slabs)
        this.objects.hideable.push(this.slabs)

        // Debug
        if(this.game.debug.active)
        {
            this.game.debug.addThreeColorBinding(this.debugPanel, this.bloomColor.value, 'bloomColor')
            this.debugPanel.addBinding(this.bloomIntensity, 'value', { label: 'bloomIntensity', min: 0, max: 20, step: 0.001 })
        }
    }
    
    setInteractivePoint()
    {
        this.interactivePoint = this.game.interactivePoints.create(
            this.references.items.get('interactivePoint')[0].position,
            'Behind the scene',
            InteractivePoints.ALIGN_RIGHT,
            InteractivePoints.STATE_CONCEALED,
            () =>
            {
                this.game.inputs.interactiveButtons.clearItems()
                this.game.menu.open('behindTheScene')
                this.interactivePoint.hide()
            },
            () =>
            {
                this.game.inputs.interactiveButtons.addItems(['interact'])
            },
            () =>
            {
                this.game.inputs.interactiveButtons.removeItems(['interact'])
            },
            () =>
            {
                this.game.inputs.interactiveButtons.removeItems(['interact'])
            }
        )

        this.game.menu.items.get('behindTheScene').events.on('close', () =>
        {
            this.interactivePoint.show()
        })
    }

    setAchievement()
    {
        this.events.on('boundingIn', () =>
        {
            this.game.achievements.setProgress('areas', 'behindTheScene')
        })
    }

    update()
    {
        this.vehicleRelativePosition.value.x = this.game.physicalVehicle.position.x - this.slabs.position.x
        this.vehicleRelativePosition.value.y = this.game.physicalVehicle.position.z - this.slabs.position.z

        const viewOffset = new THREE.Vector2(this.game.view.focusPoint.smoothedPosition.x, this.game.view.focusPoint.smoothedPosition.z)
        viewOffset.rotateAround(new THREE.Vector2(), Math.PI * 0.25)
        this.starsOffset.value.x = viewOffset.x * 0.1
        this.starsOffset.value.y = viewOffset.y * 0.1
    }
}