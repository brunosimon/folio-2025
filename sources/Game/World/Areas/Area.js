import * as THREE from 'three/webgpu'
import { Events } from '../../Events.js'
import { Game } from '../../Game.js'
import { References } from '../../References.js'
import { circleIntersectsPolygon } from '../../utilities/maths.js'

export class Area
{
    constructor(model)
    {
        this.game = Game.getInstance()

        this.model = model
        this.isIn = false
        this.events = new Events()
        this.references = new References()

        this.setObjects()
        this.setBounding()
        this.setFrustum()

        this.game.ticker.events.on('tick', () =>
        {
            if(this.frustum)
                this.frustum.test()
                
            if(typeof this.update === 'function' && (!this.frustum || this.frustum.isIn))
                this.update()
        }, 10)
    }

    setObjects()
    {
        this.objects = {}
        this.objects.items = []
        this.objects.hideable = []
        const children = [...this.model.children]
        for(const child of children)
        {
            if(typeof child.userData.preventAutoAdd === 'undefined' || child.userData.preventAutoAdd === false)
            {
                const object = this.game.objects.addFromModel(
                    child,
                    {

                    },
                    {
                        position: child.position.add(this.model.position),
                        rotation: child.quaternion,
                        sleeping: true,
                        mass: child.userData.mass,
                    }
                )

                this.objects.items.push(object)

                if(
                    object.visual && // Has visual
                    (!object.physical || object.physical?.type === 'fixed') && // Doesn't have physical or is fixed
                    typeof child.userData.preventFrustum === 'undefined' || child.userData.preventFrustum === false
                )
                {
                    this.objects.hideable.push(object.visual.object3D)
                }

            }

            this.references.parse(child)
        }
    }

    setBounding()
    {
        let zoneReference = this.references.items.get('zoneBounding')

        if(!zoneReference)
            return

        zoneReference = zoneReference[0]
        
        const position = zoneReference.position.clone()
        const radius = zoneReference.scale.x
        const zone = this.game.zones.create('cylinder', position, radius)

        zone.events.on(
            'enter',
            () =>
            {
                this.isIn = true
                this.events.trigger('boundingIn')
            }
        )

        zone.events.on(
            'leave',
            () =>
            {
                this.isIn = false
                this.events.trigger('boundingOut')
            }
        )
    }

    setFrustum()
    {
        let zoneReference = this.references.items.get('zoneFrustum')

        if(!zoneReference)
            return

        this.frustum = {}
        this.frustum.position = new THREE.Vector2(
            zoneReference[0].position.x,
            zoneReference[0].position.z
        )
        this.frustum.radius = zoneReference[0].scale.x
        this.frustum.isIn = null
        this.frustum.alwaysVisible = false
        
        this.frustum.test = () =>
        {
            const isIn = circleIntersectsPolygon(
                this.frustum.position,
                this.frustum.radius,
                [
                    this.game.view.optimalArea.quad2[0].offseted,
                    this.game.view.optimalArea.quad2[1].offseted,
                    this.game.view.optimalArea.quad2[2].offseted,
                    this.game.view.optimalArea.quad2[3].offseted,
                ]
            )

            if(
                this.frustum.alwaysVisible ||
                isIn
            )
            {
                if(this.frustum.isIn === false || this.frustum.isIn === null)
                {
                    for(const object3D of this.objects.hideable)
                    {
                        object3D.visible = true
                    }

                    this.frustum.isIn = true
                    this.events.trigger('frustumIn')
                }
            }
            else
            {
                if(this.frustum.isIn === true || this.frustum.isIn === null)
                {
                    for(const object3D of this.objects.hideable)
                    {
                        object3D.visible = false
                    }

                    this.frustum.isIn = false
                    this.events.trigger('frustumOut')
                }
            }
        }
    }
}