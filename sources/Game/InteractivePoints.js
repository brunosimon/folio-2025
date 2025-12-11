import * as THREE from 'three/webgpu'
import { Game } from './Game.js'
import { color, distance, float, Fn, max, min, mix, mul, normalWorld, positionWorld, step, texture, uniform, uv, vec2, vec3, vec4 } from 'three/tsl'
import gsap from 'gsap'
import { Inputs } from './Inputs/Inputs.js'

export class InteractivePoints
{
    static ALIGN_LEFT = 1
    static ALIGN_RIGHT = 2

    static STATE_HIDDEN = 3
    static STATE_OPEN = 4
    static STATE_CONCEALED = 5

    constructor()
    {
        this.game = Game.getInstance()

        if(this.game.debug.active)
        {
            this.debugPanel = this.game.debug.panel.addFolder({
                title: '🔹 Interactive Areas',
                expanded: false,
            })
        }

        this.items = []
        this.activeItem = null
        this.revealed = false
        this.temporaryHidden = true
        this.needsTest = false

        this.setSounds()
        this.setGeometries()
        this.setMaterials()
        this.setKeyIcon()
        this.setInputs()

        this.game.ticker.events.on('tick', () =>
        {
            this.update()
        }, 9)
    }

    setSounds()
    {
        this.sounds = {}

        this.sounds.reveal = this.game.audio.register({
            group: 'reveal',
            path: 'sounds/paper/PaperMovement_fNAyV_01-3.mp3',
            autoplay: false,
            volume: 0.25
        })

        this.sounds.conceal = this.game.audio.register({
            group: 'reveal',
            path: 'sounds/paper/PaperMovement_fNAyV_01-2.mp3',
            autoplay: false,
            volume: 0.25
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

    setKeyIcon()
    {
        // Material
        const material = new THREE.MeshLambertNodeMaterial({ transparent: true, depthTest: false })

        const iconOutput = Fn(([iconAlpha]) =>
        {
            // Discard
            iconAlpha.lessThan(0.5).discard()

            return vec4(vec3(this.frontColor), 1)
        })

        material.outputNode = iconOutput(texture(this.game.resources.interactivePointsKeyIconEnterTexture, vec2(uv().x, uv().y.oneMinus())).r)

        // Mesh
        const mesh = new THREE.Mesh(
            this.geometries.plane,
            material
        )
        mesh.renderOrder = 8
        mesh.scale.setScalar(0)
        mesh.position.z = 0.01
        mesh.visible = false

        this.game.inputs.gamepad.events.on('typeChange', () =>
        {
            if(this.game.inputs.mode === Inputs.MODE_GAMEPAD)
            {
                let iconTexture = this.game.resources.interactivePointsKeyIconCrossTexture
                
                if(this.game.inputs.gamepad.type === 'xbox')
                     iconTexture = this.game.resources.interactivePointsKeyIconATexture

                material.outputNode = iconOutput(texture(iconTexture, vec2(uv().x, uv().y.oneMinus())).r)
                material.needsUpdate = true
            }
        })

        this.game.inputs.events.on('modeChange', () =>
        {
            if(this.game.inputs.mode === Inputs.MODE_GAMEPAD)
            {
                let iconTexture = this.game.resources.interactivePointsKeyIconCrossTexture
                
                if(this.game.inputs.gamepad.type === 'xbox')
                     iconTexture = this.game.resources.interactivePointsKeyIconATexture

                material.outputNode = iconOutput(texture(iconTexture, vec2(uv().x, uv().y.oneMinus())).r)
                material.needsUpdate = true
            }
            else if(this.game.inputs.mode === Inputs.MODE_MOUSEKEYBOARD)
            {
                material.outputNode = iconOutput(texture(this.game.resources.interactivePointsKeyIconEnterTexture, vec2(uv().x, uv().y.oneMinus())).r)
                material.needsUpdate = true
            }
            else if(this.game.inputs.mode === Inputs.MODE_TOUCH)
            {
                mesh.visible = false
            }
        })

        // Save
        this.keyIcon = mesh
    }

    setInputs()
    {
        this.game.inputs.events.on('interact', (action) =>
        {
            if(action.active && this.activeItem && this.activeItem.state === InteractivePoints.STATE_OPEN)
            {
                this.activeItem.interact()
            }
        })

        this.game.inputs.interactiveButtons.events.on('interact', () =>
        {
            if(this.activeItem && this.activeItem.state === InteractivePoints.STATE_OPEN)
            {
                this.activeItem.interact()
            }
        })
    }

    create(
        position,
        text = '',
        align = InteractivePoints.ALIGN_LEFT,
        state = InteractivePoints.STATE_CONCEALED,
        interactCallback = null,
        revealCallback = null,
        concealCallback = null,
        hideCallback = null
    )
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

        // Materials
        const materials = []

        /**
         * Diamond
         */
        // Material
        const diamondMaterial = new THREE.MeshLambertNodeMaterial({ transparent: true, depthTest: true })
        materials.push(diamondMaterial)

        const threshold = uniform(0)
        const lineThickness = uniform(0.150)
        const lineOffset = uniform(0.175)

        diamondMaterial.outputNode = Fn(() =>
        {
            const _uv = uv()
            const distance = max(_uv.x.sub(0.5).abs(), _uv.y.sub(0.5).abs()).mul(2)

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
        diamond.renderOrder = 7
        diamond.rotation.z = Math.PI * 0.25
        diamond.visible = false
        group.add(diamond)

        /**
         * Label
         */
        // Canvas
        const height = 64
        const textPaddingLeft = align === InteractivePoints.ALIGN_LEFT ? 60 : 12
        const textPaddingRight = align === InteractivePoints.ALIGN_LEFT ? 12 : 60
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
        const labelMaterial = new THREE.MeshLambertNodeMaterial({ transparent: true, depthTest: true })
        materials.push(labelMaterial)

        const labelOffset = uniform(1)
        labelMaterial.outputNode = Fn(() =>
        {
            // const _uv = uv().add(vec2(labelOffset, 0))
            const _uv = vec2(
                uv().x.sub(labelOffset),
                uv().y
            )

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
        label.renderOrder = 6
        label.scale.x = 0.75 * width / height
        label.scale.y = 0.75
        label.position.z = -0.01

        label.position.x = align === InteractivePoints.ALIGN_LEFT ? 0 : - label.scale.x
        label.visible = false
        group.add(label)

        /**
         * Item
         */
        const item = {}
        item.position = new THREE.Vector2(position.x, position.z)
        item.interactCallback = interactCallback
        item.revealCallback = revealCallback
        item.concealCallback = concealCallback
        item.hideCallback = hideCallback
        item.isIn = false
        item.state = this.temporaryHidden ? InteractivePoints.STATE_HIDDEN : state
        item.recoveryState = state
        item.materials = materials
        this.items.push(item)

        /**
         * Cursor
         */
        item.intersect = this.game.rayCursor.addIntersect({
            active: false,
            shape: new THREE.Sphere(newPosition, 0.75),
            onClick: () =>
            {
                if(item.state !== InteractivePoints.STATE_HIDDEN)
                {
                    item.interact()
                }
            },
            onEnter: () =>
            {
                if(item.state !== InteractivePoints.STATE_HIDDEN)
                {
                    if(item !== this.activeItem && this.activeItem !== null)
                    {
                        this.activeItem.conceal()
                    }

                    this.activeItem = item
                    item.reveal()
                }

            },
            onLeave: () =>
            {
                if(
                    this.activeItem === item &&
                    item.state !== InteractivePoints.STATE_HIDDEN
                )
                {
                    item.conceal()
                    this.activeItem = null
                }
            }
        })

        /**
         * Methods
         */
        // Hide
        item.hide = () =>
        {
            if(item.state === InteractivePoints.STATE_HIDDEN)
                return

            item.state = InteractivePoints.STATE_HIDDEN

            item.intersect.active = false

            gsap.to(threshold, { value: 0, ease: 'back.in(4.5)', duration: 0.6, overwrite: true })
            gsap.to(lineThickness, { value: 0.150, ease: 'back.in(4.5)', duration: 0.6, overwrite: true })
            gsap.to(lineOffset, { value: 0.175, ease: 'back.in(4.5)', duration: 0.6, overwrite: true, onComplete: () =>
            {
                diamond.visible = false
                // key.visible = false
                label.visible = false
            } })

            gsap.to(this.keyIcon.scale, { x: 0, y: 0, z: 0, ease: 'power2.in', duration: 0.6, overwrite: true, onComplete: () =>
            {
                this.keyIcon.visible = false
            } })

            gsap.to(labelOffset, { value: 1, ease: 'power2.in', duration: 0.6, overwrite: true })

            // Active item
            if(this.activeItem && this.activeItem === item)
                this.activeItem = null

            // Callback
            if(typeof item.hideCallback === 'function')
                item.hideCallback()
        }

        // Open
        item.reveal = () =>
        {
            if(item.state === InteractivePoints.STATE_OPEN)
                return
                
            item.state = InteractivePoints.STATE_OPEN

            item.intersect.active = true

            diamond.visible = true
            label.visible = true

            group.add(this.keyIcon)

            gsap.to(threshold, { value: 0.5, ease: 'elastic.out(1.3,0.4)', duration: 1.5, overwrite: true })
            gsap.to(lineThickness, { value: 0.075, ease: 'elastic.out(1.3,0.4)', duration: 1.5, overwrite: true })
            gsap.to(lineOffset, { value: 0.150, ease: 'elastic.out(1.3,0.4)', duration: 1.5, overwrite: true })
            
            if(this.game.inputs.mode !== Inputs.MODE_TOUCH)
            {
                this.keyIcon.visible = true
                this.keyIcon.scale.setScalar(0)
                gsap.to(this.keyIcon.scale, { x: 0.25, y: 0.25, z: 0.25, ease: 'elastic.out(1.3,0.8)', duration: 1.5, delay: 0.6, overwrite: true })
            }
            
            gsap.to(labelOffset, { value: 0, ease: 'power2.out', duration: 0.6, delay: 0.2, overwrite: true })

            // Materials
            for(const material of item.materials)
            {
                material.depthTest = false
                material.needsUpdate = true
            }

            // Reveal
            this.sounds.reveal.play()

            // Callback
            if(typeof item.revealCallback === 'function')
                item.revealCallback()
        }

        // Close
        item.conceal = () =>
        {
            if(item.state === InteractivePoints.STATE_CONCEALED)
                return
                
            const previousState = item.state
            item.state = InteractivePoints.STATE_CONCEALED

            item.intersect.active = true
            
            diamond.visible = true

            const ease = previousState === InteractivePoints.STATE_HIDDEN ? 'power2.out' : 'back.in(4.5)'

            gsap.to(threshold, { value: 0.250, ease: ease, duration: 0.6, delay: 0.2, overwrite: true })
            gsap.to(lineThickness, { value: 0.150, ease: ease, duration: 0.6, delay: 0.2, overwrite: true })
            gsap.to(lineOffset, { value: 0.175, ease: ease, duration: 0.6, delay: 0.2, overwrite: true, onComplete: () =>
            {
                label.visible = false

                // Materials
                for(const material of item.materials)
                {
                    material.depthTest = true
                    material.needsUpdate = true
                }
            } })

            if(this.activeItem === item)
            {
                gsap.to(this.keyIcon.scale, { x: 0, y: 0, z: 0, ease: 'power2.in', duration: 0.6, overwrite: true, onComplete: () =>
                {
                    this.keyIcon.visible = false
                } })
            }

            gsap.to(labelOffset, { value: align === InteractivePoints.ALIGN_LEFT ? - 1 : 1, ease: 'power2.in', duration: 0.6, overwrite: true })
            
            // Reveal
            this.sounds.conceal.play()

            // Callback
            if(typeof item.concealCallback === 'function')
                item.concealCallback()
        }

        // Interact
        item.interact = () =>
        {
            gsap.to(threshold, { value: 0.6, ease: 'power2.out', duration: 0.1, overwrite: true, onComplete: () =>
            {
                gsap.to(threshold, { value: 0.5, ease: 'elastic.out(1.3,0.6)', duration: 1.5, overwrite: true })
            } })

            // Callback
            if(typeof item.interactCallback === 'function')
                item.interactCallback()
        }

        // Show
        item.show = () =>
        {
            if(item.isIn)
                item.reveal()
            else
                item.conceal()

            this.needsTest = true
        }

        /**
         * Default state
         */
        if(state === InteractivePoints.STATE_CONCEALED)
        {
            // Points not revealed yet => Force hidden and wait
            if(!this.revealed)
            {
                item.state = InteractivePoints.STATE_HIDDEN
                item.showAfterReveal = true
            }

            // Points already revealed => Activate
            else
            {
                item.state = state
                item.intersect.active = false
                diamond.visible = true
                // key.visible = true
                threshold.value = 0.25
            }
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
        // Player testing (not cursor intersect)
        const distanceTraveled = Math.hypot(
            this.playerPosition.value.x - this.game.player.position2.x,
            this.playerPosition.value.y - this.game.player.position2.y
        )

        // Only update is moved enough
        if(distanceTraveled > 0.2 || this.needsTest)
        {
            this.needsTest = false
            this.playerPosition.value.copy(this.game.player.position2)

            let distance = Infinity
            let activeItem = null
            for(const item of this.items)
            {
                const itemDistance = Math.hypot(item.position.x - this.game.player.position2.x, item.position.y - this.game.player.position2.y)
                const isIn = itemDistance < 2.5
                
                if(isIn)
                {
                    if(itemDistance < distance && item.state !== InteractivePoints.STATE_HIDDEN)
                    {
                        activeItem = item
                    }
                }
                else
                {
                    if(item.isIn)
                    {
                        item.isIn = false

                        if(item.state !== InteractivePoints.STATE_HIDDEN)
                        {
                            item.conceal()
                        }
                    }
                }
            }

            if(activeItem)
            {
                // Activate item change => Deactivate old
                if(activeItem !== this.activeItem && this.activeItem !== null)
                {
                    this.activeItem.isIn = false
                    this.activeItem.conceal()
                }

                // Activate new active item
                if(!activeItem.isIn || this.activeItem === null)
                {
                    this.activeItem = activeItem

                    activeItem.isIn = true
                    activeItem.reveal()
                }
            }
            else
            {
                this.activeItem = null
            }
        }
    }

    temporaryHide()
    {
        this.temporaryHidden = true
        
        for(const item of this.items)
        {
            item.recoveryState = item.state
            item.hide()
        }
    }

    recover()
    {
        this.temporaryHidden = false

        for(const item of this.items)
        {
            if(item.recoveryState !== InteractivePoints.STATE_HIDDEN)
                item.show()
        }
    }
}