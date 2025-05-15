import * as THREE from 'three/webgpu'
import { Game } from '../Game.js'
import { InteractiveAreas } from '../InteractiveAreas.js'
import gsap from 'gsap'
import projects from '../../data/projects.js'
import { TextWrapper } from '../TextWrapper.js'
import { color, float, Fn, mix, normalWorld, texture, uniform, vec4 } from 'three/tsl'

export class Projects
{
    static DIRECTION_PREVIOUS = 1
    static DIRECTION_NEXT = 2

    constructor(parameters)
    {
        this.game = Game.getInstance()
        this.parameters = parameters

        this.opened = false
        this.index = 0
        this.imageIndex = 0
        this.currentProject = null
        this.previousProject = null
        this.nextProject = null
        this.density = 200

        // Debug
        if(this.game.debug.active)
        {
            this.debugPanel = this.game.debug.panel.addFolder({
                title: '📚 Projects',
                expanded: true,
            })
        }

        this.setInteractiveArea()
        this.setInputs()
        this.setCinematic()
        this.setMix()
        this.setTexts()
        this.setImages()
        this.setPagination()
        this.setAttributes()
        this.setAdjacents()
        this.setTitle()
        this.setUrl()
        this.setDistinctions()

        this.changeProject(0)

        // Debug
        if(this.game.debug.active)
        {
            this.debugPanel.addButton({ title: 'open', label: 'open' }).on('click', () => { this.open() })
            this.debugPanel.addButton({ title: 'close', label: 'close' }).on('click', () => { this.close() })
        }
    }

    setInteractiveArea()
    {
        this.interactiveArea = this.game.interactiveAreas.create(
            this.parameters.interactiveAreaPosition,
            'Projects',
            InteractiveAreas.ALIGN_RIGHT,
            () =>
            {
                this.open()
            }
        )
    }

    setInputs()
    {
        this.game.inputs.events.on('backward', () =>
        {
            this.close()
        })

        this.game.inputs.events.on('left', (event) =>
        {
            if(event.down)
                this.previous()
        })

        this.game.inputs.events.on('right', (event) =>
        {
            if(event.down)
                this.next()
        })
    }

    setCinematic()
    {
        this.cinematic = {}
        
        this.cinematic.position = new THREE.Vector3()
        this.cinematic.positionOffset = new THREE.Vector3(4.65, 3.35, 4.85)
        
        this.cinematic.target = new THREE.Vector3()
        this.cinematic.targetOffset = new THREE.Vector3(-2.60, 1.60, -4.80)

        const applyPositionAndTarget = () =>
        {
            this.cinematic.position.copy(this.parameters.interactiveAreaPosition).add(this.cinematic.positionOffset)
            this.cinematic.target.copy(this.parameters.interactiveAreaPosition).add(this.cinematic.targetOffset)
        }
        applyPositionAndTarget()

        // Debug
        if(this.game.debug.active)
        {
            const debugPanel = this.debugPanel.addFolder({
                title: 'cinematic',
                expanded: true,
            })
            debugPanel.addBinding(this.cinematic.positionOffset, 'x', { label: 'positionX', min: - 10, max: 10, step: 0.05 }).on('change', applyPositionAndTarget)
            debugPanel.addBinding(this.cinematic.positionOffset, 'y', { label: 'positionY', min: 0, max: 10, step: 0.05 }).on('change', applyPositionAndTarget)
            debugPanel.addBinding(this.cinematic.positionOffset, 'z', { label: 'positionZ', min: - 10, max: 10, step: 0.05 }).on('change', applyPositionAndTarget)
            debugPanel.addBinding(this.cinematic.targetOffset, 'x', { label: 'targetX', min: - 10, max: 10, step: 0.05 }).on('change', applyPositionAndTarget)
            debugPanel.addBinding(this.cinematic.targetOffset, 'y', { label: 'targetY', min: 0, max: 10, step: 0.05 }).on('change', applyPositionAndTarget)
            debugPanel.addBinding(this.cinematic.targetOffset, 'z', { label: 'targetZ', min: - 10, max: 10, step: 0.05 }).on('change', applyPositionAndTarget)
        }
    }

    setMix()
    {
        this.mix = {}
        this.mix.min = 0
        this.mix.max = 0.3
        this.mix.uniform = uniform(this.mix.min)
    }

    setTexts()
    {
        // const fontFamily = 'Pally-Medium'
        // const fontWeight = 500
        // const fontSizeMultiplier = 0.7
        this.texts = {}
        this.texts.fontFamily = 'Amatic SC'
        this.texts.fontWeight = 700
        this.texts.fontSizeMultiplier = 1
        this.texts.baseColor = color('#ffffff')
        this.texts.createMaterialOnMesh = (mesh, textTexture) =>
        {
            // Material
            const material = new THREE.MeshLambertNodeMaterial({ transparent: true })

            const alpha = texture(textTexture).r

            const shadedOutput = this.game.lighting.lightOutputNodeBuilder(this.texts.baseColor, float(1), normalWorld, float(1)).rgb
            material.outputNode = vec4(
                mix(
                    shadedOutput,
                    this.texts.baseColor,
                    this.mix.uniform
                ),
            alpha)

            // Mesh
            mesh.castShadow = false
            mesh.receiveShadow = false
            mesh.material = material
        }

        // const settings = [
        //     { name: 'title', mesh: this.parameters.title, fontSize: fontSizeMultiplier * 0.4, width: 4, height: 0.6 },
        //     { name: 'url', mesh: this.parameters.url, fontSize: fontSizeMultiplier * 0.23, width: 4, height: 0.2 },
        //     { name: 'previous', mesh: this.parameters.previous, fontSize: fontSizeMultiplier * 0.3, width: 1.25, height: 0.75 },
        //     { name: 'next', mesh: this.parameters.next, fontSize: fontSizeMultiplier * 0.3, width: 1.25, height: 0.75 },
        //     { name: 'role', mesh: this.parameters.role, fontSize: fontSizeMultiplier * 0.25, width: 1.4, height: 0.45 },
        //     { name: 'at', mesh: this.parameters.at, fontSize: fontSizeMultiplier * 0.25, width: 1.4, height: 0.45 },
        //     { name: 'with', mesh: this.parameters.with, fontSize: fontSizeMultiplier * 0.25, width: 1.4, height: 0.45 },
        // ]

        // this.texts = {}
        // for(const _settings of settings)
        // {
        //     const text = {}
        //     text.textWrapper = new TextWrapper(
        //         ['Chartogne Taillet'],
        //         fontFamily,
        //         fontWeight,
        //         _settings.fontSize,
        //         _settings.width,
        //         _settings.height,
        //         this.density,
        //         'center'
        //     )
        //     text.mesh = _settings.mesh
        //     text.mesh.castShadow = false
        //     text.mesh.receiveShadow = false

        //     const material = new THREE.MeshLambertNodeMaterial({ transparent: true })

        //     const baseColor = color('#ffffff')
        //     const alpha = texture(text.textWrapper.texture).r

        //     const shadedOutput = this.game.lighting.lightOutputNodeBuilder(baseColor, float(1), normalWorld, float(1)).rgb
        //     material.outputNode = vec4(
        //         mix(
        //             shadedOutput,
        //             baseColor,
        //             this.mix.uniform
        //         ),
        //     alpha)
        //     // material.outputNode = vec4(color('#ffffff'), texture(text.textWrapper.texture).r)
        //     text.mesh.material = material

        //     this.texts[_settings.name] = text
        // }
    }

    setImages()
    {
        this.images = {}

        // Mesh
        this.images.mesh = this.parameters.images
        this.images.mesh.receiveShadow = true

        // Texture (based on dummy image first)
        const dummyImage = new Image()
        dummyImage.with = 1920
        dummyImage.height = 1080
        this.images.texture = new THREE.Texture(dummyImage)
        this.images.texture.colorSpace = THREE.SRGBColorSpace
        this.images.texture.flipY = false
        
        // Material
        this.images.material = new THREE.MeshLambertNodeMaterial()

        const totalShadows = this.game.lighting.addTotalShadowToMaterial(this.images.material)

        this.images.material.outputNode = Fn(() =>
        {
            const textureColor = texture(this.images.texture).rgb
            const shadedOutput = this.game.lighting.lightOutputNodeBuilder(textureColor, float(1), normalWorld, totalShadows)
            return vec4(mix(shadedOutput.rgb, textureColor, this.mix.uniform), 1)
        })()

        this.images.mesh.material = this.images.material
    }

    setPagination()
    {
        this.pagination = {}
        this.pagination.inter = 0.2
        this.pagination.group = this.parameters.pagination.children[0]
        this.pagination.items = []

        let i = 0
        for(const child of this.pagination.group.children)
        {
            const item = {}
            item.mesh = child
            item.mesh.position.x = this.pagination.inter * i    
            item.mesh.visible = false
            item.visible = false
            this.pagination.items.push(item)

            i++
        }

        this.pagination.update = () =>
        {
            let i = 0
            for(const item of this.pagination.items)
            {
                if(i <= this.currentProject.images.length - 1)
                {
                    if(!item.visible)
                    {
                        gsap.to(item.mesh.scale, { x: 1, y: 1, z: 1, duration: 0.5, ease: 'power1.inOut', overwrite: true })
                        item.mesh.visible = true
                        item.visible = true
                    }
                }
                else
                {
                    if(item.visible)
                    {
                        gsap.to(item.mesh.scale, { x: 0.01, y: 0.01, z: 0.01, duration: 0.5, ease: 'power1.inOut', overwrite: true, onComplete: () =>
                        {
                            item.mesh.visible = false
                        } })
                        item.visible = false
                    }
                }

                item.mesh.rotation.z = this.imageIndex === i ? 0 : Math.PI

                i++
            }

            const offset = - (this.currentProject.images.length - 1) * this.pagination.inter / 2
            gsap.to(this.pagination.group.position, { x: offset, duration: 0.5, ease: 'power1.inOut', overwrite: true })
        }
    }

    setAttributes()
    {
        this.attributes = {}
        this.attributes.group = this.parameters.attributes
        this.attributes.inter = 0.75
        this.attributes.names = ['role', 'at', 'with']
        this.attributes.items = {}
        this.attributes.status = 'hidden'
        this.attributes.originalY = this.attributes.group.position.y

        for(const child of this.attributes.group.children)
        {
            const item = {}
            // item.textWrapper = this.texts[child.name]
            item.group = child
            item.visible = false
            item.group.visible = false
            const textMesh = item.group.children.find(_child => _child.name.startsWith('text'))
            item.textWrapper = new TextWrapper(
                this.texts.fontFamily,
                this.texts.fontWeight,
                this.texts.fontSizeMultiplier * 0.25,
                1.4,
                0.45,
                this.density,
                'center'
            )

            this.texts.createMaterialOnMesh(textMesh, item.textWrapper.texture)

            this.attributes.items[child.name] = item
        }

        this.attributes.update = () =>
        {
            if(this.attributes.status === 'hiding')
                return

            this.attributes.status = 'hiding'
            let i = 0
            for(const name of this.attributes.names)
            {
                const item = this.attributes.items[name]

                gsap.to(item.group.scale, { x: 0.01, y: 0.01, z: 0.01, duration: 0.5, delay: 0.1 * i, ease: 'power2.in', overwrite: true })
                i++
            }

            gsap.delayedCall(1, () =>
            {
                this.attributes.status = 'visible'

                let i = 0
                for(const name of this.attributes.names)
                {
                    const item = this.attributes.items[name]
                    const attribute = this.currentProject.attributes[name]

                    if(attribute)
                    {
                        item.group.visible = true
                        gsap.to(item.group.scale, { x: 1, y: 1, z: 1, duration: 1, delay: 0.2 * i, ease: 'back.out(2)', overwrite: true })

                        item.textWrapper.updateText(attribute)

                        item.group.position.y = - i * 0.75
                        
                        i++
                    }
                }

                this.attributes.group.position.y = this.attributes.originalY + (i - 1) * 0.75 / 2
            })
        }
    }

    setAdjacents()
    {
        this.adjacents = {}
        this.adjacents.status = 'hidden'

        this.adjacents.previous = {}
        this.adjacents.previous.group = this.parameters.previous
        this.adjacents.previous.inner = this.adjacents.previous.group.children[0]
        this.adjacents.previous.textMesh = this.adjacents.previous.inner.children.find(_child => _child.name.startsWith('text'))
        this.adjacents.previous.textWrapper = new TextWrapper(
            this.texts.fontFamily,
            this.texts.fontWeight,
            this.texts.fontSizeMultiplier * 0.3,
            1.25,
            0.75,
            this.density,
            'center'
        )
        this.texts.createMaterialOnMesh(this.adjacents.previous.textMesh, this.adjacents.previous.textWrapper.texture)

        this.adjacents.next = {}
        this.adjacents.next.group = this.parameters.next
        this.adjacents.next.inner = this.adjacents.next.group.children[0]
        this.adjacents.next.textMesh = this.adjacents.next.inner.children.find(_child => _child.name.startsWith('text'))
        this.adjacents.next.textWrapper = new TextWrapper(
            this.texts.fontFamily,
            this.texts.fontWeight,
            this.texts.fontSizeMultiplier * 0.3,
            1.25,
            0.75,
            this.density,
            'center'
        )
        this.texts.createMaterialOnMesh(this.adjacents.next.textMesh, this.adjacents.next.textWrapper.texture)

        this.adjacents.update = () =>
        {
            if(this.adjacents.status === 'hiding')
                return

            this.adjacents.status = 'hiding'

            gsap.to(this.adjacents.previous.inner.rotation, { z: Math.PI * 0.5, duration: 0.5, delay: 0, ease: 'power2.in', overwrite: true })
            gsap.to(this.adjacents.next.inner.rotation, { z: - Math.PI * 0.5, duration: 0.5, delay: 0.2, ease: 'power2.in', overwrite: true })

            gsap.delayedCall(1, () =>
            {
                this.adjacents.status = 'visible'

                gsap.to(this.adjacents.previous.inner.rotation, { z: 0, duration: 1, delay: 0, ease: 'back.out(2)', overwrite: true })
                gsap.to(this.adjacents.next.inner.rotation, { z: 0, duration: 1, delay: 0.4, ease: 'back.out(2)', overwrite: true })

                this.adjacents.previous.textWrapper.updateText(this.previousProject.titleSmall)
                this.adjacents.next.textWrapper.updateText(this.nextProject.titleSmall)
            })
        }
    }

    setTitle()
    {
        this.url = {}
        this.url.status = 'hidden'
        this.url.group = this.parameters.url
        this.url.inner = this.url.group.children[0]
        this.url.textMesh = this.url.inner.children.find(_child => _child.name.startsWith('text'))
        this.url.panel = this.url.inner.children.find(_child => _child.name.startsWith('panel'))
        this.url.textWrapper = new TextWrapper(
            this.texts.fontFamily,
            this.texts.fontWeight,
            this.texts.fontSizeMultiplier * 0.23,
            4,
            0.2,
            this.density,
            'center'
        )
        this.texts.createMaterialOnMesh(this.url.textMesh, this.url.textWrapper.texture)

        this.url.update = (direction) =>
        {
            if(this.url.status === 'hiding')
                return

            this.url.status = 'hiding'

            const rotationDirection = direction === Projects.DIRECTION_NEXT ? 1 : - 1

            this.url.inner.rotation.x = 0
            gsap.to(this.url.inner.rotation, { x: Math.PI * rotationDirection, duration: 1, delay: 0.3, ease: 'power2.in', overwrite: true, onComplete: () =>
            {
                this.url.status = 'visible'

                gsap.to(this.url.inner.rotation, { x: Math.PI * 2 * rotationDirection, duration: 1, delay: 0, ease: 'back.out(2)', overwrite: true })

                this.url.textWrapper.updateText(this.currentProject.url)

                const ratio = this.url.textWrapper.getMeasure().width / this.density
                this.url.panel.scale.x = ratio + 0.2

            } })
        }
    }

    setUrl()
    {
        this.title = {}
        this.title.status = 'hidden'
        this.title.group = this.parameters.title
        this.title.inner = this.title.group.children[0]
        this.title.textMesh = this.title.inner.children.find(_child => _child.name.startsWith('text'))
        this.title.textWrapper = new TextWrapper(
            this.texts.fontFamily,
            this.texts.fontWeight,
            this.texts.fontSizeMultiplier * 0.4,
            4,
            0.6,
            this.density,
            'center'
        )
        this.texts.createMaterialOnMesh(this.title.textMesh, this.title.textWrapper.texture)

        this.title.update = (direction) =>
        {
            if(this.title.status === 'hiding')
                return

            this.title.status = 'hiding'

            const rotationDirection = direction === Projects.DIRECTION_NEXT ? 1 : - 1

            this.title.inner.rotation.x = 0
            gsap.to(this.title.inner.rotation, { x: Math.PI * rotationDirection, duration: 1, delay: 0, ease: 'power2.in', overwrite: true, onComplete: () =>
            {
                this.title.status = 'visible'

                gsap.to(this.title.inner.rotation, { x: Math.PI * 2 * rotationDirection, duration: 1, delay: 0, ease: 'back.out(2)', overwrite: true })

                this.title.textWrapper.updateText(this.currentProject.title)
            } })
        }
    }

    setDistinctions()
    {
        this.distinctions = {}
        this.distinctions.status = 'hidden'
        this.distinctions.group = this.parameters.distinctions
        this.distinctions.names = ['awwwards', 'cssda', 'fwa']
        this.distinctions.items = {}
        this.distinctions.items.awwwards = this.distinctions.group.children.find(_child => _child.name.startsWith('awwwards'))
        this.distinctions.items.fwa = this.distinctions.group.children.find(_child => _child.name.startsWith('fwa'))
        this.distinctions.items.cssda = this.distinctions.group.children.find(_child => _child.name.startsWith('cssda'))

        this.distinctions.positions = [
            [
                [0, 0],
            ],
            [
                [-0.4582188129425049, -0.2090435028076172],
                [0.4859628677368164, 0.47049903869628906],
            ],
            [
                [-0.7032163143157959, -0.2090439796447754],
                [0.8216180801391602, -0.16075992584228516],
                [0.1332714557647705, 0.47049903869628906],
            ],
        ]

        this.distinctions.update = () =>
        {
            if(this.distinctions.status === 'hiding')
                return

            this.distinctions.status = 'hiding'
            let i = 0
            for(const name of this.distinctions.names)
            {
                const item = this.distinctions.items[name]

                gsap.to(item.scale, { x: 0.01, y: 0.01, z: 0.01, duration: 0.5, delay: 0.1 * i, ease: 'power2.in', overwrite: true })
                i++
            }

            gsap.delayedCall(1, () =>
            {
                this.distinctions.status = 'visible'

                let i = 0
                const positions = this.distinctions.positions[this.currentProject.distinctions.length - 1]
                console.log(positions)
                for(const name of this.currentProject.distinctions)
                {
                    const item = this.distinctions.items[name]

                    item.visible = true
                    gsap.to(item.scale, { x: 1, y: 1, z: 1, duration: 1, delay: 0.2 * i, ease: 'back.out(2)', overwrite: true })

                    item.position.x = positions[i][0]
                    item.position.z = positions[i][1]

                    i++
                }
            })
        } 
    }

    open()
    {
        if(this.opened)
            return

        this.opened = true

        // Inputs filters
        this.game.inputs.updateFilters(['cinematic'])

        // View cinematic
        this.game.view.cinematic.start(this.cinematic.position, this.cinematic.target)

        // Interactive area
        this.interactiveArea.hide()

        // Images mix
        gsap.to(this.mix.uniform, { value: this.mix.max, duration: 2, ease: 'power2.inOut', overwrite: true })
    }

    close()
    {
        if(!this.opened)
            return
            
        this.opened = false

        // Input filters
        this.game.inputs.updateFilters([])

        // View cinematic
        this.game.view.cinematic.end()

        // Images mix
        gsap.to(this.mix.uniform, { value: this.mix.min, duration: 2, ease: 'power2.inOut', overwrite: true })

        // Interactive area
        gsap.delayedCall(1, () =>
        {
            this.interactiveArea.open()
        })
    }

    previous()
    {
        if(!this.opened)
            return

        if(this.imageIndex > 0)
            this.changeImage(this.imageIndex - 1, Projects.DIRECTION_PREVIOUS)
        else
            this.changeProject(this.index - 1, Projects.DIRECTION_PREVIOUS)
    }

    next()
    {
        if(!this.opened)
            return

        if(this.imageIndex < this.currentProject.images.length - 1)
            this.changeImage(this.imageIndex + 1, Projects.DIRECTION_NEXT)
        else
            this.changeProject(this.index + 1, Projects.DIRECTION_NEXT)
    }

    changeProject(index = 0, direction = Projects.DIRECTION_NEXT)
    {
        // Loop index
        let loopIndex = index

        if(loopIndex > projects.length - 1)
            loopIndex = 0
        else if(loopIndex < 0)
            loopIndex = projects.length - 1

        // Save
        this.index = loopIndex
        this.currentProject = projects[this.index]
        this.previousProject = projects[(this.index - 1) < 0 ? projects.length - 1 : this.index - 1]
        this.nextProject = projects[(this.index + 1) % projects.length]

        // // Title
        // this.texts.title.textWrapper.updateText(this.currentProject.title)

        // // URL
        // this.texts.url.textWrapper.updateText(this.currentProject.url)
        // const ratio = this.texts.url.textWrapper.getMeasure().width / this.density
        // this.parameters.urlPanel.scale.x = ratio + 0.2

        // // Previous
        // this.texts.previous.textWrapper.updateText(this.previousProject.titleSmall)

        // // Next
        // this.texts.next.textWrapper.updateText(this.nextProject.titleSmall)

        // Update components
        this.attributes.update()
        this.adjacents.update()
        this.title.update(direction)
        this.url.update(direction)
        this.distinctions.update()

        // Change image
        this.changeImage(direction === Projects.DIRECTION_NEXT ? 0 : this.currentProject.images.length - 1, direction)
    }

    changeImage(imageIndex = 0, direction = Projects.DIRECTION_NEXT)
    {
        this.imageIndex = imageIndex

        const path = `projects/images/${this.currentProject.images[this.imageIndex]}`
        const image = new Image(1920, 1080)
        image.onload = () =>
        {
            const source = new THREE.Source(image)
            this.images.texture.source = source
            this.images.texture.needsUpdate = true
        }
        image.src = path

        // Pagination
        this.pagination.update()
    }
}