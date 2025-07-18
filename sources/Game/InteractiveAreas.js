import * as THREE from 'three/webgpu'
import { Game } from './Game.js'
import { color, distance, float, Fn, max, min, mix, mul, normalWorld, positionWorld, step, texture, uniform, uv, vec2, vec3, vec4 } from 'three/tsl'
import gsap from 'gsap'

export class InteractiveAreas
{
    static ALIGN_LEFT = 1
    static ALIGN_RIGHT = 2

    static STATE_HIDDEN = 3
    static STATE_OPEN = 4
    static STATE_CLOSED = 5

    constructor()
    {
        this.game = Game.getInstance()

        if(this.game.debug.active)
        {
            this.debugPanel = this.game.debug.panel.addFolder({
                title: '🔳 Interactive Areas',
                expanded: false,
            })
        }

        this.items = []
        this.activeItem = null

        this.setGeometries()
        this.setMaterials()

        this.game.ticker.events.on('tick', () =>
        {
            this.update()
        })

        this.game.inputs.events.on('interact', (action) =>
        {
            if(action.active && this.activeItem && this.activeItem.state !== InteractiveAreas.STATE_HIDDEN)
            {
                this.activeItem.interact()
                this.activeItem.callback()
            }
        })
    }

    setGeometries()
    {
        // const size = 2.25
        this.geometries = {}

        // Bottom
        this.geometries.plane = new THREE.PlaneGeometry(2, 2)

        // Label
        this.geometries.label = new THREE.PlaneGeometry(1, 1, 1, 1)
        this.geometries.label.translate(0.5, 0, 0)
    }

    setMaterials()
    {
        this.materials = {}

        // Uniforms
        this.playerPosition = uniform(vec2())
        this.backColor = uniform(color('#251f2b'))
        this.frontColor = uniform(color('#ffffff'))

        // Debug
        if(this.game.debug.active)
        {
            this.game.debug.addThreeColorBinding(this.debugPanel, this.backColor.value, 'backColor')
            this.game.debug.addThreeColorBinding(this.debugPanel, this.frontColor.value, 'lineColor')
        }
    }

    create(position, text = '', align = InteractiveAreas.ALIGN_LEFT, callback)
    {
        const newPosition = position.clone()
        // newPosition.y = 2.25

        /**
         * Group
         */
        const group = new THREE.Group()
        group.rotation.reorder('YXZ')
        group.rotation.x = - Math.PI * 0.15
        group.rotation.y = Math.PI * 0.25
        group.position.copy(newPosition)
        group.scale.setScalar(0.85)
        this.game.scene.add(group)

        /**
         * Diamond
         */
        // Material
        const diamondMaterial = new THREE.MeshLambertNodeMaterial({ transparent: true, depthTest: false })

        const threshold = uniform(0.250)
        const lineThickness = uniform(0.150)
        const lineOffset = uniform(0.175)

        diamondMaterial.outputNode = Fn(() =>
        {
            const _uv = uv().toVar()
            const distance = max(_uv.x.sub(0.5).abs(), _uv.y.sub(0.5).abs()).mul(2).toVar()

            // Line
            const lineDistance = threshold.sub(distance).sub(lineOffset).abs()
            const line = step(lineDistance, lineThickness.mul(0.5))

            // Discard
            distance.greaterThan(threshold).discard()

            // Fogged back color
            const foggedBackColor = this.game.fog.strength.mix(this.backColor, this.game.fog.color)

            // Final color
            const finalColor = mix(foggedBackColor, this.frontColor, line)
            return vec4(vec3(finalColor), 1)
        })()

        // Mesh
        const diamond = new THREE.Mesh(
            this.geometries.plane,
            diamondMaterial
        )
        diamond.renderOrder = 3
        diamond.rotation.z = Math.PI * 0.25
        group.add(diamond)

        /**
         * Key
         */
        // Material
        const keyMaterial = new THREE.MeshLambertNodeMaterial({ transparent: true, depthTest: false })

        keyMaterial.outputNode = Fn(() =>
        {
            const key = texture(this.game.resources.interactiveAreasKeyIconTexture, uv()).r
            
            // Discard
            key.lessThan(0.5).discard()

            return vec4(vec3(this.frontColor), 1)
        })()

        // Mesh
        const key = new THREE.Mesh(
            this.geometries.plane,
            keyMaterial
        )
        key.renderOrder = 3
        key.scale.setScalar(0)
        key.position.z = 0.01
        key.visible = false
        group.add(key)

        /**
         * Label
         */
        // Canvas
        const height = 64
        const textPaddingLeft = align === InteractiveAreas.ALIGN_LEFT ? 60 : 12
        const textPaddingRight = align === InteractiveAreas.ALIGN_LEFT ? 12 : 60
        const textOffsetVertical = 2
        const font = `700 ${height}px "Amatic SC"`

        const canvas = document.createElement('canvas')
        canvas.style.position = 'fixed'
        canvas.style.zIndex = 999
        canvas.style.top = 0
        canvas.style.left = 0
        // document.body.append(canvas)

        const context = canvas.getContext('2d')
        context.font = font

        const textSize = context.measureText(text)
        const width = Math.ceil(textSize.width) + textPaddingLeft + textPaddingRight + 2
        canvas.width = width
        canvas.height = height

        context.fillStyle = '#000000'
        context.fillRect(0, 0, width, height)

        context.font = font
        context.fillStyle = '#ffffff'
        context.textAlign = 'start'
        context.textBaseline = 'middle'
        context.fillText(text, textPaddingLeft + 1, height * 0.5 + textOffsetVertical)

        const labelTexture = new THREE.Texture(canvas)
        labelTexture.minFilter = THREE.NearestFilter
        labelTexture.magFilter = THREE.NearestFilter
        labelTexture.generateMipmaps = false

        labelTexture.needsUpdate = true

        // Material
        const labelMaterial = new THREE.MeshLambertNodeMaterial({ transparent: true, depthTest: false })

        const labelOffset = uniform(align === InteractiveAreas.ALIGN_LEFT ? - 1 : 1)
        labelMaterial.outputNode = Fn(() =>
        {
            // const _uv = uv().add(vec2(labelOffset, 0)).toVar()
            const _uv = vec2(
                uv().x.sub(labelOffset),
                uv().y
            ).toVar()

            const text = texture(labelTexture, _uv).r
            
            // Discard
            _uv.x.greaterThan(1).discard()
            _uv.x.lessThan(0).discard()

            // Fogged back color
            const foggedBackColor = this.game.fog.strength.mix(this.backColor, this.game.fog.color)

            // Final color
            const finalColor = mix(foggedBackColor, this.frontColor, text)
            return vec4(vec3(finalColor), 1)
        })()

        // Mesh
        const label = new THREE.Mesh(
            this.geometries.label,
            labelMaterial
        )
        label.renderOrder = 3
        label.scale.x = 0.75 * width / height
        label.scale.y = 0.75
        label.position.z = -0.01

        label.position.x = align === InteractiveAreas.ALIGN_LEFT ? 0 : - label.scale.x
        label.visible = false
        group.add(label)

        /**
         * Item
         */
        const item = {}
        item.position = new THREE.Vector2(position.x, position.z)
        item.callback = callback
        item.isIn = false
        item.state = InteractiveAreas.STATE_OPEN
        this.items.push(item)

        /**
         * Cursor
         */
        item.intersect = this.game.cursor.addIntersects({
            active: true,
            shapes:
            [
                new THREE.Sphere(newPosition, 1)
            ],
            onClick: () =>
            {
                if(item.state !== InteractiveAreas.STATE_HIDDEN)
                {
                    item.interact()
                    item.callback()
                }
            },
            onEnter: () =>
            {
                if(item.state !== InteractiveAreas.STATE_HIDDEN)
                    item.reveal()
            },
            onLeave: () =>
            {
                if(item.state !== InteractiveAreas.STATE_HIDDEN)
                    item.conceal()
            }
        })

        /**
         * Methods
         */
        // Hide
        item.hide = () =>
        {
            item.state = InteractiveAreas.STATE_HIDDEN

            item.intersect.active = false

            gsap.to(threshold, { value: 0, ease: 'back.in(4.5)', duration: 0.6, overwrite: true })
            gsap.to(lineThickness, { value: 0.150, ease: 'back.in(4.5)', duration: 0.6, overwrite: true })
            gsap.to(lineOffset, { value: 0.175, ease: 'back.in(4.5)', duration: 0.6, overwrite: true, onComplete: () =>
            {
                diamond.visible = false
                key.visible = false
                label.visible = false
            } })

            gsap.to(key.scale, { x: 0, y: 0, z: 0, ease: 'back.in(4.5)', duration: 0.6, overwrite: true })

            gsap.to(labelOffset, { value: 1, ease: 'power2.in', duration: 0.6, overwrite: true })
        }

        // Open
        item.reveal = () =>
        {
            item.state = InteractiveAreas.STATE_OPEN

            item.intersect.active = true

            diamond.visible = true
            key.visible = true
            label.visible = true

            gsap.to(threshold, { value: 0.5, ease: 'elastic.out(1.3,0.4)', duration: 1.5, overwrite: true })
            gsap.to(lineThickness, { value: 0.075, ease: 'elastic.out(1.3,0.4)', duration: 1.5, overwrite: true })
            gsap.to(lineOffset, { value: 0.150, ease: 'elastic.out(1.3,0.4)', duration: 1.5, overwrite: true })
            
            gsap.to(key.scale, { x: 0.25, y: 0.25, z: 0.25, ease: 'elastic.out(1.3,0.8)', duration: 1.5, delay: 0.6, overwrite: true })

            gsap.to(labelOffset, { value: 0, ease: 'power2.out', duration: 0.6, delay: 0.2, overwrite: true })
        }

        // Close
        item.conceal = () =>
        {
            item.state = InteractiveAreas.STATE_CLOSED

            item.intersect.active = true
            
            diamond.visible = true

            gsap.to(threshold, { value: 0.250, ease: 'back.in(4.5)', duration: 0.6, delay: 0.2, overwrite: true })
            gsap.to(lineThickness, { value: 0.150, ease: 'back.in(4.5)', duration: 0.6, delay: 0.2, overwrite: true })
            gsap.to(lineOffset, { value: 0.175, ease: 'back.in(4.5)', duration: 0.6, delay: 0.2, overwrite: true, onComplete: () =>
            {
                key.visible = false
                label.visible = false
            } })

            gsap.to(key.scale, { x: 0, y: 0, z: 0, ease: 'power2.in', duration: 0.6, overwrite: true })

            gsap.to(labelOffset, { value: align === InteractiveAreas.ALIGN_LEFT ? - 1 : 1, ease: 'power2.in', duration: 0.6, overwrite: true })
        }

        // Interact
        item.interact = () =>
        {
            gsap.to(threshold, { value: 0.6, ease: 'power2.out', duration: 0.1, overwrite: true, onComplete: () =>
            {
                gsap.to(threshold, { value: 0.5, ease: 'elastic.out(1.3,0.6)', duration: 1.5, overwrite: true })
            } })
        }


        /**
         * Debug
         */
        if(this.game.debug.active)
        {
            // this.game.debug.addThreeColorBinding(this.debugPanel, this.baseColor.value, 'this.baseColor')
            this.debugPanel.addBinding(threshold, 'value', { label: 'threshold', min: 0, max: 1, step: 0.001 })
            this.debugPanel.addBinding(lineThickness, 'value', { label: 'lineThickness', min: 0, max: 1, step: 0.001 })
            this.debugPanel.addBinding(lineOffset, 'value', { label: 'lineOffset', min: 0, max: 1, step: 0.001 })
            this.debugPanel.addBinding(labelOffset, 'value', { label: 'labelOffset', min: 0, max: 1, step: 0.001 })
        }

        return item
    }

    update()
    {
        const playerPosition2 = new THREE.Vector2(this.game.player.position.x, this.game.player.position.z)
        this.playerPosition.value.copy(playerPosition2)

        let distance = Infinity
        let inItem = null
        for(const item of this.items)
        {
            if(!item.state !== InteractiveAreas.STATE_HIDDEN)
            {
                const itemDistance = Math.hypot(item.position.x - playerPosition2.x, item.position.y - playerPosition2.y)
                const isIn = itemDistance < 2.5
                
                if(isIn)
                {
                    if(itemDistance < distance)
                    {
                        inItem = inItem = item
                    }
                }
                else
                {
                    if(item.isIn)
                    {
                        item.isIn = false
                        item.conceal()
                    }
                }
            }
        }

        if(inItem)
        {
            if(inItem !== this.activeItem && this.activeItem !== null)
            {
                this.activeItem.isIn = false
                this.activeItem.conceal()
            }
            if(!inItem.isIn)
            {
                this.activeItem = inItem

                inItem.isIn = true
                inItem.reveal()
            }
        }
        else
        {
            this.activeItem = null
        }
    }
}