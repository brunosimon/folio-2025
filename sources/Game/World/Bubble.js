import * as THREE from 'three/webgpu'
import { color, Fn, mix, texture, uniform, uv, vec2, vec4 } from 'three/tsl'
import gsap from 'gsap'
import { Game } from '../Game.js'

export class Bubble
{
    constructor()
    {
        this.game = Game.getInstance()

        this.visible = false
        this.text = ''
        this.position = new THREE.Vector3()
        this.pending = null

        this.resolution = 64
        this.height = this.resolution
        this.width = this.resolution * 16
        this.textWidth = 0
        this.textPaddingHorizontal = 10
        this.textOffsetVertical = 2
        this.font = `700 ${this.height}px "Amatic SC"`

        this.group = new THREE.Group()
        this.group.rotation.reorder('YXZ')
        this.group.rotation.x = - Math.PI * 0.25
        this.group.rotation.y = Math.PI * 0.25
        this.group.visible = false
        this.game.scene.add(this.group)

        this.setCanvas()
        this.setMessage()
        this.setImage()
    }

    setCanvas()
    {
        this.canvas = {}
        this.canvas.element = document.createElement('canvas')
        this.canvas.element.width = this.width
        this.canvas.element.height = this.height

        this.canvas.texture = new THREE.Texture(this.canvas.element)
        this.canvas.texture.minFilter = THREE.NearestFilter
        this.canvas.texture.magFilter = THREE.NearestFilter
        this.canvas.texture.generateMipmaps = false

        this.context = this.canvas.element.getContext('2d')
        this.context.font = this.font

        // // Canvas debug
        // this.canvas.element.style.position = 'fixed'
        // this.canvas.element.style.zIndex = 999
        // this.canvas.element.style.top = 0
        // this.canvas.element.style.left = 0
        // document.body.append(this.canvas.element)
    }

    setMessage()
    {
        const geometry = new THREE.PlaneGeometry(1, 1)
        const material = new THREE.MeshBasicNodeMaterial({ color: 0x222222, transparent: true, depthWrite: false, depthTest: false })
        this.textRatio = uniform(1)

        material.outputNode = Fn(() =>
        {
            // UV
            // const newUV = uv().sub(0.5).mul(1.2).add(0.5).toVar()
            const newUV = uv().mul(vec2(this.textRatio, 1))

            // Text
            const textMask = texture(this.canvas.texture, newUV).r

            // Base color
            const baseColor = mix(color(0x222222), color(0xffffff), textMask)

            // Fog
            const foggedColor = this.game.fog.strength.mix(baseColor, this.game.fog.color)

            return vec4(foggedColor.rgb, 1)
        })()
        
        this.message = new THREE.Mesh(geometry, material)
        this.message.scale.set(0.01, 0.01, 0.01)
        this.message.renderOrder = 2
        this.group.add(this.message)
    }

    setImage()
    {
        const size = 0.25
        const geometry = new THREE.PlaneGeometry(size * 3 / 2, size)

        const material = new THREE.MeshBasicNodeMaterial({ color: 0xffffff, transparent: true, depthWrite: false, depthTest: false })

        this.image = new THREE.Mesh(geometry, material)
        this.image.scale.set(0.01, 0.01, 0.01)
        this.image.position.y = 0.25
        this.image.position.z = 0.2
        this.image.rotation.z = -0.15
        this.image.renderOrder = 3
        this.group.add(this.image)

        this.textureLoader = new THREE.TextureLoader()
        this.imageTextures = new Map()
    }

    tryShow(text = '', position = null, imageUrl = null)
    {
        // // Same and already visible
        // if(
        //     this.visible &&
        //     text === this.text &&
        //     (position !== null || position.equals(this.position))
        // )
        // {
        //     return
        // }

        // Is hidden => update directly and show
        if(!this.visible)
        {
            this.updateText(text)
            this.updatePosition(position)
            this.updateImage(imageUrl)
            this.show()
        }

        // Is visible => hide first and save as pending
        else
        {
            this.pending = { text, position, imageUrl }
            this.hide()
        }
    }

    hide()
    {
        // Message
        gsap.to(
            this.message.scale,
            {
                overwrite: true,
                duration: 0.3,
                x: 0.01, y: 0.01, z: 0.01,
                onComplete: () =>
                {
                    this.visible = false
                    this.group.visible = false
                    
                    // Has pending => Update and show
                    if(this.pending)
                    {
                        this.updateText(this.pending.text)
                        this.updatePosition(this.pending.position)
                        this.updateImage(this.pending.imageUrl)
                        this.pending = null
                        this.show()
                    }
                }
            }
        )

        // Image
        gsap.to(
            this.image.scale,
            {
                overwrite: true,
                duration: 0.3,
                x: 0.01, y: 0.01, z: 0.01,
            }
        )
    }
    
    show()
    {
        this.visible = true
        this.group.visible = true

        // Message
        gsap.to(
            this.message.scale,
            {
                overwrite: true,
                duration: 0.5,
                ease: 'back.out(3)',
                x: 0.5 * this.textWidth / this.height, y: 0.5 * 1, z: 1
            }
        )

        // Image
        this.image.position.x = 0.5 * 0.5 * this.textWidth / this.height
        gsap.to(
            this.image.scale,
            {
                overwrite: true,
                duration: 0.5,
                delay: 0.3,
                ease: 'back.out(3)',
                x: 1, y: 1, z: 1
            }
        )
    }

    updateText(text = '')
    {
        if(text === this.text)
            return

        const textSize = this.context.measureText(text)
        this.textWidth = Math.min(Math.ceil(textSize.width) + this.textPaddingHorizontal * 2 + 2, this.width)
        this.textRatio.value = this.textWidth / this.width

        this.context.font = this.font

        this.context.fillStyle = '#000000'
        this.context.fillRect(0, 0, this.width, this.height)

        this.context.font = this.font
        this.context.fillStyle = '#ffffff'
        this.context.textAlign = 'start'
        this.context.textBaseline = 'middle'
        this.context.fillText(text, this.textPaddingHorizontal + 1, this.height * 0.5 + this.textOffsetVertical)

        this.canvas.texture.needsUpdate = true

        this.text = text
    }

    updatePosition(position = null)
    {
        if(position === null || position.equals(this.position))
            return

        this.group.position.copy(position)
        this.position.copy(position)
    }

    updateImage(url = null)
    {
        // Has URL => Load, show, save
        if(url)
        {
            let texture = this.imageTextures.get(url)

            if(!texture)
            {
                texture = this.textureLoader.load(url)
                texture.colorSpace = THREE.SRGBColorSpace
                this.imageTextures.set(url, texture)
            }

            this.image.visible = true
            this.image.material.map = texture
        }

        // No URL => Hide
        else
        {
            this.image.visible = false
        }
    }
}