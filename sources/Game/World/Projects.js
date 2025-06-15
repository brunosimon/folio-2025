import * as THREE from 'three/webgpu'
import { Game } from '../Game.js'
import { InteractiveAreas } from '../InteractiveAreas.js'
import gsap from 'gsap'
import projects from '../../data/projects.js'
import { TextCanvas } from '../TextCanvas.js'
import { add, color, float, Fn, If, luminance, mix, mul, normalWorld, positionGeometry, sin, step, texture, uniform, uv, vec3, vec4 } from 'three/tsl'

export class Projects
{
    static DIRECTION_PREVIOUS = 1
    static DIRECTION_NEXT = 2
    static STATE_OPEN = 3
    static STATE_OPENING = 4
    static STATE_CLOSED = 5
    static STATE_CLOSING = 6

    constructor(references)
    {
        this.game = Game.getInstance()

        // Debug
        if(this.game.debug.active)
        {
            this.debugPanel = this.game.debug.panel.addFolder({
                title: '📚 Projects',
                expanded: false,
            })
        }
        
        this.references = references
        this.state = Projects.STATE_CLOSED

        this.setInteractiveArea()
        this.setInputs()
        this.setCinematic()
        this.setShadeMix()
        this.setTexts()
        this.setHover()
        this.setProjects()
        this.setImages()
        this.setPagination()
        this.setAttributes()
        this.setAdjacents()
        this.setTitle()
        this.setUrl()
        this.setDistinctions()
        this.setBlackBoard()
        this.setLabels()
        this.setOven()
        this.setGrinder()
        this.setAnvil()

        this.changeProject(0)

        // Debug
        if(this.game.debug.active)
        {
            this.debugPanel.addButton({ title: 'open', label: 'open' }).on('click', () => { this.open() })
            this.debugPanel.addButton({ title: 'close', label: 'close' }).on('click', () => { this.close() })
        }

        this.game.ticker.events.on('tick', () =>
        {
            this.update()
        })
    }

    setInteractiveArea()
    {
        this.interactiveArea = this.game.interactiveAreas.create(
            this.references.get('interactiveArea')[0].position,
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

        this.game.inputs.events.on('interact', (event) =>
        {
            if(!event.down && this.state === Projects.STATE_OPEN)
            {
                this.url.open()
            }
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
            this.cinematic.position.copy(this.references.get('interactiveArea')[0].position).add(this.cinematic.positionOffset)
            this.cinematic.target.copy(this.references.get('interactiveArea')[0].position).add(this.cinematic.targetOffset)
        }
        applyPositionAndTarget()

        // Debug
        if(this.game.debug.active)
        {
            const debugPanel = this.debugPanel.addFolder({
                title: 'cinematic',
                expanded: false,
            })
            debugPanel.addBinding(this.cinematic.positionOffset, 'x', { label: 'positionX', min: - 10, max: 10, step: 0.05 }).on('change', applyPositionAndTarget)
            debugPanel.addBinding(this.cinematic.positionOffset, 'y', { label: 'positionY', min: 0, max: 10, step: 0.05 }).on('change', applyPositionAndTarget)
            debugPanel.addBinding(this.cinematic.positionOffset, 'z', { label: 'positionZ', min: - 10, max: 10, step: 0.05 }).on('change', applyPositionAndTarget)
            debugPanel.addBinding(this.cinematic.targetOffset, 'x', { label: 'targetX', min: - 10, max: 10, step: 0.05 }).on('change', applyPositionAndTarget)
            debugPanel.addBinding(this.cinematic.targetOffset, 'y', { label: 'targetY', min: 0, max: 10, step: 0.05 }).on('change', applyPositionAndTarget)
            debugPanel.addBinding(this.cinematic.targetOffset, 'z', { label: 'targetZ', min: - 10, max: 10, step: 0.05 }).on('change', applyPositionAndTarget)
        }
    }

    setShadeMix()
    {
        this.shadeMix = {}

        this.shadeMix.images = {}
        this.shadeMix.images.min = 0.1
        this.shadeMix.images.max = 0.65
        this.shadeMix.images.uniform = uniform(this.shadeMix.images.min)

        this.shadeMix.texts = {}
        this.shadeMix.texts.min = 0.1
        this.shadeMix.texts.max = 0.3
        this.shadeMix.texts.uniform = uniform(this.shadeMix.texts.min)

        // Debug
        if(this.game.debug.active)
        {
            const debugPanel = this.debugPanel.addFolder({
                title: 'Shader mix',
                expanded: true,
            })

            const debugUpdate = () =>
            {
                if(this.state === Projects.STATE_OPEN || this.state === Projects.STATE_OPENING)
                {
                    this.shadeMix.images.uniform.value = this.shadeMix.images.max
                    this.shadeMix.texts.uniform.value = this.shadeMix.texts.max
                }
                else
                {
                    this.shadeMix.images.uniform.value = this.shadeMix.images.min
                    this.shadeMix.texts.uniform.value = this.shadeMix.texts.min
                }
            }
            
            debugPanel.addBinding(this.shadeMix.images, 'min', { label: 'imagesMin', min: 0, max: 1, step: 0.001 }).on('change', debugUpdate)
            debugPanel.addBinding(this.shadeMix.images, 'max', { label: 'imagesMax', min: 0, max: 1, step: 0.001 }).on('change', debugUpdate)
            debugPanel.addBinding(this.shadeMix.texts, 'min', { label: 'textsMin', min: 0, max: 1, step: 0.001 }).on('change', debugUpdate)
            debugPanel.addBinding(this.shadeMix.texts, 'max', { label: 'textsMax', min: 0, max: 1, step: 0.001 }).on('change', debugUpdate)
        }
    }

    setTexts()
    {
        this.texts = {}
        
        this.texts.density = 200
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
                    this.shadeMix.texts.uniform
                ),
                alpha
            )

            // Mesh
            mesh.castShadow = false
            mesh.receiveShadow = false
            mesh.material = material
        }
    }

    setHover()
    {
        this.hover = {}
        this.hover.baseColor = color('#ffffff')

        // Default
        this.hover.inactiveMaterial = new THREE.MeshLambertNodeMaterial({ transparent: true })
        const shadedOutput = this.game.lighting.lightOutputNodeBuilder(this.hover.baseColor, float(1), normalWorld, float(1)).rgb
        this.hover.inactiveMaterial.outputNode = vec4(
            mix(
                shadedOutput,
                this.hover.baseColor,
                this.shadeMix.texts.uniform
            ),
            float(1)
        )

        // Active
        this.hover.activeMaterial = new THREE.MeshLambertNodeMaterial({ transparent: true })
        this.hover.activeMaterial.outputNode = vec4(this.hover.baseColor.mul(1.5), float(1))
    }

    setProjects()
    {
        this.projects = {}
        this.projects.index = 0
        this.projects.current = null
        this.projects.next = null
        this.projects.previous = null
        this.projects.current = null
        this.projects.items = projects
    }

    setImages()
    {
        this.images = {}
        this.images.width = 1920 * 0.5
        this.images.height = 1080 * 0.5
        this.images.index = 0
        this.images.direction = Projects.DIRECTION_NEXT

        // Mesh
        this.images.mesh = this.references.get('images')[0]
        this.images.mesh.receiveShadow = true

        // Sources
        this.images.resources = new Map()

        // Textures (based on dummy image first)
        const dummyImageOld = new Image()
        dummyImageOld.width = this.images.width
        dummyImageOld.height = this.images.height

        const dummyImageNew = new Image()
        dummyImageNew.width = this.images.width
        dummyImageNew.height = this.images.height

        this.images.textureOld = new THREE.Texture(dummyImageOld)
        this.images.textureOld.colorSpace = THREE.SRGBColorSpace
        this.images.textureOld.flipY = false
        this.images.textureOld.magFilter = THREE.LinearFilter
        this.images.textureOld.minFilter = THREE.LinearFilter
        this.images.textureOld.generateMipmaps = false
        
        this.images.textureNew = new THREE.Texture(dummyImageNew)
        this.images.textureNew.colorSpace = THREE.SRGBColorSpace
        this.images.textureNew.flipY = false
        this.images.textureNew.magFilter = THREE.LinearFilter
        this.images.textureNew.minFilter = THREE.LinearFilter
        this.images.textureNew.generateMipmaps = false

        this.images.oldResource = this.images.textureNew.source
        
        // Material
        this.images.material = new THREE.MeshLambertNodeMaterial()
        this.images.loadProgress = uniform(0)
        this.images.animationProgress = uniform(0)
        this.images.animationDirection = uniform(0)

        const totalShadows = this.game.lighting.addTotalShadowToMaterial(this.images.material)

        this.images.material.outputNode = Fn(() =>
        {
            const uvOld = uv().toVar()
            const uvNew = uv().toVar()

            // Parallax (add an offset according to progress)
            uvNew.x.addAssign(this.images.animationProgress.oneMinus().mul(-0.25).mul(this.images.animationDirection))
            uvOld.x.addAssign(this.images.animationProgress.mul(0.25).mul(this.images.animationDirection))

            // Textures
            const textureOldColor = texture(this.images.textureOld, uvOld).rgb
            const textureNewColor = texture(this.images.textureNew, uvNew).rgb.toVar()

            // Load mix
            textureNewColor.assign(mix(color('#333333'), textureNewColor, this.images.loadProgress))

            // Reveal
            const reveal = uv().x.toVar()
            If(this.images.animationDirection.greaterThan(0), () =>
            {
                reveal.assign(reveal.oneMinus())
            })
            const threshold = step(this.images.animationProgress, reveal)

            const textureColor = mix(textureNewColor, textureOldColor, threshold)

            const shadedOutput = this.game.lighting.lightOutputNodeBuilder(textureColor, float(1), normalWorld, totalShadows)
            return vec4(mix(shadedOutput.rgb, textureColor, this.shadeMix.images.uniform), 1)
        })()

        this.images.mesh.material = this.images.material

        // Load ended
        this.images.loadEnded = (key) =>
        {
            // Current image => Reveal
            if(this.projects.current.images[this.images.index] === key)
            {
                this.images.textureNew.needsUpdate = true
                gsap.to(this.images.loadProgress, { value: 1, duration: 1, overwrite: true })

                this.images.loadSibling()
            }
        }

        // Load sibling
        this.images.loadSibling = () =>
        {
            let projectIndex = this.projects.index
            let imageIndex = this.images.index

            if(this.images.direction === Projects.DIRECTION_PREVIOUS)
                imageIndex -= 1
            else
                imageIndex += 1

            if(imageIndex < 0)
            {
                projectIndex -= 1

                if(projectIndex < 0)
                    projectIndex = this.projects.items.length - 1

                imageIndex = this.projects.items[projectIndex].images.length - 1
            }
            else if(imageIndex > this.projects.current.images.length - 1)
            {
                projectIndex += 1

                if(projectIndex > this.projects.items.length - 1)
                    projectIndex = 0

                imageIndex = 0
            }

            const key = this.projects.items[projectIndex].images[imageIndex]
            const resource = this.images.getResourceAndLoad(key)
        }

        // Get resource and load
        this.images.getResourceAndLoad = (key) =>
        {
            const path = `projects/images/${key}`

            // Try to retrieve resource
            let resource = this.images.resources.get(key)

            // Resource not found => Create
            if(!resource)
            {
                resource = {}
                resource.loaded = false

                // Image
                resource.image = new Image()
                resource.image.width = this.images.width
                resource.image.height = this.images.height

                // Source
                resource.source = new THREE.Source(resource.image)
                
                // Image loaded
                resource.image.onload = () =>
                {
                    resource.loaded = true
                    
                    this.images.loadEnded(key)
                }

                // Start loading
                resource.image.src = path

                // Save
                this.images.resources.set(key, resource)
            }


            return resource
        }

        // Update
        this.images.update = (direction) =>
        {
            this.images.direction = direction

            // Get resource
            const key = this.projects.current.images[this.images.index]
            const resource = this.images.getResourceAndLoad(key)

            if(resource.loaded)
            {
                this.images.loadSibling()
                this.images.loadProgress.value = 1
            }
            else
            {
                this.images.loadProgress.value = 0
            }

            // Update textures
            this.images.textureOld.source = this.images.textureNew.source
            this.images.textureOld.needsUpdate = true

            this.images.textureNew.source = resource.source
            if(resource.loaded)
                this.images.textureNew.needsUpdate = true

            // Animate right away
            gsap.fromTo(this.images.animationProgress, { value: 0 }, { value: 1, duration: 1, ease: 'power2.inOut', overwrite: true })
            this.images.animationDirection.value = direction === Projects.DIRECTION_NEXT ? 1 : -1
        }
    }

    setPagination()
    {
        this.pagination = {}
        this.pagination.inter = 0.2
        this.pagination.group = this.references.get('pagination')[0].children[0]
        this.pagination.items = []

        // List
        let i = 0
        const intersectPagination = this.references.get('intersectPagination')

        for(const child of this.pagination.group.children)
        {
            if(child instanceof THREE.Mesh)
            {
                const item = {}
                
                item.index = i
                item.visible = false
                
                // Mesh
                item.mesh = child
                item.mesh.position.x = this.pagination.inter * i    
                item.mesh.visible = false
                item.mesh.material = this.hover.inactiveMaterial

                // Intersect
                item.intersectReference = intersectPagination[i]

                item.intersect = this.game.cursor.addIntersects({
                    active: false,
                    shapes:
                    [
                        new THREE.Sphere(new THREE.Vector3(), item.intersectReference.scale.x)
                    ],
                    onClick: () =>
                    {
                        this.changeImage(item.index)
                    },
                    onEnter: () =>
                    {
                        item.mesh.material = this.hover.activeMaterial
                    },
                    onLeave: () =>
                    {
                        item.mesh.material = this.hover.inactiveMaterial
                    }
                }),
                item.intersectReference.getWorldPosition(item.intersect.shapes[0].center)

                this.pagination.items.push(item)

                i++
            }
        }


        // Adjacents
        const intersectPrevious = this.references.get('intersectPreviousImage')[0]
        const intersectPreviousPosition = new THREE.Vector3()
        intersectPrevious.getWorldPosition(intersectPreviousPosition)
        const arrowPrevious = this.references.get('arrowPreviousImage')[0]
        arrowPrevious.material = this.hover.inactiveMaterial
 
        this.pagination.previousIntersect = this.game.cursor.addIntersects({
            active: false,
            shapes:
            [
                new THREE.Sphere(intersectPreviousPosition, intersectPrevious.scale.x)
            ],
            onClick: () =>
            {
                this.previous()
            },
            onEnter: () =>
            {
                arrowPrevious.material = this.hover.activeMaterial
            },
            onLeave: () =>
            {
                arrowPrevious.material = this.hover.inactiveMaterial
            }
        })

        const intersectNext = this.references.get('intersectNextImage')[0]
        const intersectNextPosition = new THREE.Vector3()
        intersectNext.getWorldPosition(intersectNextPosition)
        const arrowNext = this.references.get('arrowNextImage')[0]
        arrowNext.material = this.hover.inactiveMaterial
        this.pagination.nextIntersect = this.game.cursor.addIntersects({
            active: false,
            shapes:
            [
                new THREE.Sphere(intersectNextPosition, intersectNext.scale.x)
            ],
            onClick: () =>
            {
                this.next()
            },
            onEnter: () =>
            {
                arrowNext.material = this.hover.activeMaterial
            },
            onLeave: () =>
            {
                arrowNext.material = this.hover.inactiveMaterial
            }
        })

        // Update
        this.pagination.update = () =>
        {
            let i = 0
            for(const item of this.pagination.items)
            {
                if(i <= this.projects.current.images.length - 1)
                {
                    if(!item.visible)
                    {
                        gsap.to(item.mesh.scale, { x: 1, y: 1, z: 1, duration: 0.5, ease: 'power1.inOut', overwrite: true })
                        item.mesh.visible = true
                        item.visible = true
                        item.intersect.active = this.state === Projects.STATE_OPENING || this.state === Projects.STATE_OPEN
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
                        item.intersect.active = false
                    }
                }

                item.mesh.rotation.z = this.images.index === i ? 0 : Math.PI

                i++
            }

            const offset = - (this.projects.current.images.length - 1) * this.pagination.inter / 2
            gsap.to(this.pagination.group.position, { x: offset, duration: 0.5, ease: 'power1.inOut', overwrite: true, onComplete: () =>
            {
                for(const item of this.pagination.items)
                    item.intersectReference.getWorldPosition(item.intersect.shapes[0].center)
            } })
        }
    }

    setAttributes()
    {
        this.attributes = {}
        this.attributes.group = this.references.get('attributes')[0]
        this.attributes.inter = 0.75
        this.attributes.names = ['role', 'at', 'with']
        this.attributes.items = {}
        this.attributes.status = 'hidden'
        this.attributes.originalY = this.attributes.group.position.y

        for(const child of this.attributes.group.children)
        {
            const item = {}
            // item.textCanvas = this.texts[child.name]
            item.group = child
            item.visible = false
            item.group.visible = false
            const textMesh = item.group.children.find(_child => _child.name.startsWith('text'))
            item.textCanvas = new TextCanvas(
                this.texts.fontFamily,
                this.texts.fontWeight,
                this.texts.fontSizeMultiplier * 0.23,
                1.4,
                0.45,
                this.texts.density,
                'center',
                0.2
            )

            this.texts.createMaterialOnMesh(textMesh, item.textCanvas.texture)

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
                    const attribute = this.projects.current.attributes[name]

                    if(attribute)
                    {
                        item.group.visible = true
                        gsap.to(item.group.scale, { x: 1, y: 1, z: 1, duration: 1, delay: 0.2 * i, ease: 'back.out(2)', overwrite: true })

                        item.textCanvas.updateText(attribute)

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

        /**
         * Previous
         */
        this.adjacents.previous = {}
        this.adjacents.previous.group = this.references.get('previous')[0]
        this.adjacents.previous.inner = this.adjacents.previous.group.children[0]

        // Text
        this.adjacents.previous.textMesh = this.adjacents.previous.inner.children.find(_child => _child.name.startsWith('text'))
        this.adjacents.previous.textCanvas = new TextCanvas(
            this.texts.fontFamily,
            this.texts.fontWeight,
            this.texts.fontSizeMultiplier * 0.3,
            1.25,
            0.75,
            this.texts.density,
            'center',
            0.3
        )
        this.texts.createMaterialOnMesh(this.adjacents.previous.textMesh, this.adjacents.previous.textCanvas.texture)

        // Arrow
        const arrowPrevious = this.references.get('arrowPreviousProject')[0]
        arrowPrevious.material = this.hover.inactiveMaterial
        
        // Intersect
        const intersectPrevious = this.references.get('intersectPreviousProject')[0]
        const intersectPreviousPosition = new THREE.Vector3()
        intersectPrevious.getWorldPosition(intersectPreviousPosition)

        this.adjacents.previous.intersect = this.game.cursor.addIntersects({
            active: false,
            shapes:
            [
                new THREE.Sphere(intersectPreviousPosition, intersectPrevious.scale.x)
            ],
            onClick: () =>
            {
                this.previousProject(true)
            },
            onEnter: () =>
            {
                arrowPrevious.material = this.hover.activeMaterial
            },
            onLeave: () =>
            {
                arrowPrevious.material = this.hover.inactiveMaterial
            }
        })

        /**
         * Next
         */
        this.adjacents.next = {}
        this.adjacents.next.group = this.references.get('next')[0]
        this.adjacents.next.inner = this.adjacents.next.group.children[0]

        // Text
        this.adjacents.next.textMesh = this.adjacents.next.inner.children.find(_child => _child.name.startsWith('text'))
        this.adjacents.next.textCanvas = new TextCanvas(
            this.texts.fontFamily,
            this.texts.fontWeight,
            this.texts.fontSizeMultiplier * 0.3,
            1.25,
            0.75,
            this.texts.density,
            'center',
            0.3
        )
        this.texts.createMaterialOnMesh(this.adjacents.next.textMesh, this.adjacents.next.textCanvas.texture)

        // Arrow
        const arrowNext = this.references.get('arrowNextProject')[0]
        arrowNext.material = this.hover.inactiveMaterial
        
        // Intersect
        const intersectNext = this.references.get('intersectNextProject')[0]

        const intersectNextPosition = new THREE.Vector3()
        intersectNext.getWorldPosition(intersectNextPosition)

        this.adjacents.next.intersect = this.game.cursor.addIntersects({
            active: false,
            shapes:
            [
                new THREE.Sphere(intersectNextPosition, intersectNext.scale.x)
            ],
            onClick: () =>
            {
                this.nextProject()
            },
            onEnter: () =>
            {
                arrowNext.material = this.hover.activeMaterial
            },
            onLeave: () =>
            {
                arrowNext.material = this.hover.inactiveMaterial
            }
        })

        /**
         * Update
         */
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

                this.adjacents.previous.textCanvas.updateText(this.projects.previous.titleSmall)
                this.adjacents.next.textCanvas.updateText(this.projects.next.titleSmall)
            })
        }
    }

    setTitle()
    {
        this.title = {}
        this.title.status = 'hidden'
        this.title.group = this.references.get('title')[0]
        this.title.inner = this.title.group.children[0]
        this.title.textMesh = this.title.inner.children.find(_child => _child.name.startsWith('text'))
        this.title.textCanvas = new TextCanvas(
            this.texts.fontFamily,
            this.texts.fontWeight,
            this.texts.fontSizeMultiplier * 0.4,
            4,
            0.6,
            this.texts.density,
            'center'
        )
        this.texts.createMaterialOnMesh(this.title.textMesh, this.title.textCanvas.texture)

        this.title.update = (direction) =>
        {
            if(this.title.status === 'hiding')
                return

            this.title.status = 'hiding'

            const rotationDirection = direction === Projects.DIRECTION_NEXT ? - 1 : 1

            this.title.inner.rotation.x = 0
            gsap.to(this.title.inner.rotation, { x: Math.PI * rotationDirection, duration: 1, delay: 0, ease: 'power2.in', overwrite: true, onComplete: () =>
            {
                this.title.status = 'visible'

                gsap.to(this.title.inner.rotation, { x: Math.PI * 2 * rotationDirection, duration: 1, delay: 0, ease: 'back.out(2)', overwrite: true })

                this.title.textCanvas.updateText(this.projects.current.title)
            } })
        }
    }

    setUrl()
    {
        this.url = {}
        this.url.status = 'hidden'
        this.url.group = this.references.get('url')[0]
        this.url.inner = this.url.group.children[0]

        // Text
        this.url.textMesh = this.url.inner.children.find(_child => _child.name.startsWith('text'))
        this.url.panel = this.url.inner.children.find(_child => _child.name.startsWith('panel'))
        this.url.textCanvas = new TextCanvas(
            this.texts.fontFamily,
            this.texts.fontWeight,
            this.texts.fontSizeMultiplier * 0.23,
            4,
            0.2,
            this.texts.density,
            'center'
        )
        this.url.mixStrength = uniform(0)

        // Material
        const material = new THREE.MeshLambertNodeMaterial({ transparent: true })

        const alpha = texture(this.url.textCanvas.texture).r

        const shadedOutput = this.game.lighting.lightOutputNodeBuilder(this.texts.baseColor, float(1), normalWorld, float(1)).rgb
        material.outputNode = vec4(
            mix(
                mix(
                    shadedOutput,
                    this.texts.baseColor,
                    this.shadeMix.texts.uniform
                ),
                this.texts.baseColor.mul(1.5),
                this.url.mixStrength
            ),
            alpha
        )

        // Mesh
        this.url.textMesh.castShadow = false
        this.url.textMesh.receiveShadow = false
        this.url.textMesh.material = material

        // Intersect
        const intersect = this.references.get('intersectUrl')[0]
        intersect.visible = false
 
        this.url.intersect = this.game.cursor.addIntersects({
            active: false,
            shapes:
            [
                intersect
            ],
            onClick: () =>
            {
                this.url.open()
            },
            onEnter: () =>
            {
                this.url.mixStrength.value = 1
            },
            onLeave: () =>
            {
                this.url.mixStrength.value = 0
            }
        })

        // Update
        this.url.update = (direction) =>
        {
            if(this.url.status === 'hiding')
                return

            this.url.status = 'hiding'

            const rotationDirection = direction === Projects.DIRECTION_NEXT ? - 1 : 1

            this.url.inner.rotation.x = 0
            gsap.to(this.url.inner.rotation, { x: Math.PI * rotationDirection, duration: 1, delay: 0.3, ease: 'power2.in', overwrite: true, onComplete: () =>
            {
                this.url.status = 'visible'

                gsap.to(this.url.inner.rotation, { x: Math.PI * 2 * rotationDirection, duration: 1, delay: 0, ease: 'back.out(2)', overwrite: true })

                this.url.textCanvas.updateText(this.projects.current.url.replace(/https?:\/\//, ''))

                const ratio = this.url.textCanvas.getMeasure().width / this.texts.density
                this.url.panel.scale.x = ratio + 0.2

            } })
        }

        // Open
        this.url.open = () =>
        {
            if(this.projects.current.url)
            {
                window.open(this.projects.current.url, '_blank')
            }
        }
    }

    setDistinctions()
    {
        this.distinctions = {}
        this.distinctions.status = 'hidden'
        this.distinctions.group = this.references.get('distinctions')[0]
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
                const positions = this.distinctions.positions[this.projects.current.distinctions.length - 1]
                for(const name of this.projects.current.distinctions)
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

    setPendulum()
    {
        this.references.get('balls')[0].rotation.reorder('YXZ')
        const timeline0 = gsap.timeline({ yoyo: true, repeat: -1 })
        timeline0.to(this.references.get('balls')[0].rotation, { x: 0.75, ease: 'power2.out', delay: 0.75, duration: 0.75 })
        
        const timeline1 = gsap.timeline({ yoyo: true, repeat: -1, delay: 1.5 })
        timeline1.to(this.references.get('balls')[1].rotation, { x: -0.75, ease: 'power2.out', delay: 0.75, duration: 0.75 })
    }

    setBlackBoard()
    {
        this.blackBoard = {}
        this.blackBoard.active = true
        this.blackBoard.mesh = this.references.get('blackBoard')[0]
        
        this.blackBoard.timeline = gsap.timeline({
            repeat: -1,
            repeatDelay: 5,
            paused: true,
            onRepeat: () =>
            {
                if(this.state === Projects.STATE_CLOSED || this.state === Projects.STATE_CLOSING || !this.blackBoard.active)
                    this.blackBoard.timeline.pause()
            }
        })

        this.blackBoard.timeline.to(this.blackBoard.mesh.position, { y: 0.25, ease: 'power2.out', duration: 0.7 }, 0 + 2)
        this.blackBoard.timeline.to(this.blackBoard.mesh.position, { y: 0, ease: 'power2.in', duration: 0.7 }, 0.7 + 2)

        this.blackBoard.timeline.to(this.blackBoard.mesh.rotation, { x: 0.1, duration: 0.15 }, 0 + 2)
        this.blackBoard.timeline.to(this.blackBoard.mesh.rotation, { x: -0.1, duration: 0.3 }, 0.15 + 2)
        this.blackBoard.timeline.to(this.blackBoard.mesh.rotation, { x: 0.1, duration: 0.3 }, 0.45 + 2)
        this.blackBoard.timeline.to(this.blackBoard.mesh.rotation, { x: -0.1, duration: 0.3 }, 0.75 + 2)
        this.blackBoard.timeline.to(this.blackBoard.mesh.rotation, { x: 0, duration: 0.3 }, 1.05 + 2)
    }

    setFlame()
    {
        const mesh = this.references.get('flame')[0]
        mesh.scale.setScalar(0)
        mesh.visible = false

        const baseMaterial = this.game.materials.getFromName('emissiveGradientWarm')
        const material = new THREE.MeshBasicNodeMaterial({ transparent: true })
        material.colorNode = baseMaterial.colorNode
        material.positionNode = Fn(() =>
        {
            const newPosition = positionGeometry.toVar()

            const wave = sin(this.game.ticker.elapsedScaledUniform.mul(0.3).add(uv().y.mul(3)))
            const strength = uv().y.oneMinus().pow(2).mul(0.06)
            newPosition.x.addAssign(wave.mul(strength))

            return newPosition
        })()
        mesh.material = material

        this.game.dayCycles.events.on('lights', (inInverval) =>
        {
            if(inInverval)
            {
                mesh.visible = true
                gsap.to(mesh.scale, { x: 1, y: 1, z: 1, duration: 10, ease: 'power1.out', overwrite: true })
            }
            else
            {
                gsap.to(mesh.scale, { x: 0, y: 0, z: 0, duration: 10, ease: 'power1.in', overwrite: true, onComplete: () =>
                {
                    mesh.visible = false
                } })
            }
        })
    }

    setLabels()
    {
        for(const mesh of this.references.get('label'))
        {
            mesh.castShadow = false
        }
    }

    setOven()
    {
        this.oven = {}

        // Blower
        this.oven.blower = this.references.get('blower')[0]

        // Charcoal
        this.oven.charcoal = this.references.get('charcoal')[0]

        const material = new THREE.MeshLambertNodeMaterial()
        const totalShadows = this.game.lighting.addTotalShadowToMaterial(material)
        this.oven.threshold = uniform(0.2)

        material.outputNode = Fn(() =>
        {
            const baseUv = uv().toVar()

            const baseColor = color('#6F6A87')
            const lightOutput = this.game.lighting.lightOutputNodeBuilder(baseColor, float(1), vec3(0, 1, 0), totalShadows, true, false)

            const distanceToCenter = baseUv.sub(0.5).length()

            const voronoi = texture(
                this.game.noises.voronoi,
                baseUv
            ).g

            voronoi.lessThan(this.oven.threshold).discard()

            return lightOutput
        })()

        this.oven.charcoal.material = material
    }

    setGrinder()
    {
        this.grinder = this.references.get('grinder')[0]
    }

    setAnvil()
    {
        this.anvil = {}
        
        // Hammer
        this.anvil.hammer = this.references.get('hammer')[0]

        // Blade
        this.anvil.blade = this.references.get('blade')[0]

        const material = new THREE.MeshLambertNodeMaterial()
        const totalShadows = this.game.lighting.addTotalShadowToMaterial(material)

        const colorA = uniform(color('#ff8641'))
        const colorB = uniform(color('#ff3e00'))
        const intensity = uniform(1.7)

        material.outputNode = Fn(() =>
        {
            const baseUv = uv().toVar()

            const baseColor = color('#a88c7f')
            const lightOutput = this.game.lighting.lightOutputNodeBuilder(baseColor, float(1), vec3(0, 1, 0), totalShadows, true, false)

            const emissiveColor = mix(colorA, colorB, uv().sub(0.5).length().mul(2)).toVar()
            const emissiveOutput = emissiveColor.div(luminance(emissiveColor)).mul(intensity)

            const mixStrength = baseUv.y.smoothstep(0.4, 0.9)
            const output = mix(lightOutput, emissiveOutput, mixStrength)

            return vec4(output.rgb, 1)
        })()

        this.anvil.blade.material = material
    }

    open()
    {
        if(this.state === Projects.STATE_OPEN || this.state === Projects.STATE_OPENING)
            return

        // State
        this.state = Projects.STATE_OPENING

        if(this.stateTransition)
            this.stateTransition.kill()

        this.stateTransition = gsap.delayedCall(1.5, () =>
        {
            this.state = Projects.STATE_OPEN
            this.stateTransition = null
        })

        // Inputs filters
        this.game.inputs.updateFilters(['cinematic'])

        // View cinematic
        this.game.view.cinematic.start(this.cinematic.position, this.cinematic.target)

        // Interactive area
        this.interactiveArea.hide()

        // Shade mix
        gsap.to(this.shadeMix.images.uniform, { value: this.shadeMix.images.max, duration: 2, ease: 'power2.inOut', overwrite: true })
        gsap.to(this.shadeMix.texts.uniform, { value: this.shadeMix.texts.max, duration: 2, ease: 'power2.inOut', overwrite: true })

        // Board
        if(this.blackBoard.active)
        {
            this.blackBoard.timeline.repeat(-1)
            this.blackBoard.timeline.resume()
        }

        // Cursor
        for(const item of this.pagination.items)
            item.intersect.active = item.visible
            
        this.adjacents.next.intersect.active = true
        this.adjacents.previous.intersect.active = true
        this.pagination.previousIntersect.active = true
        this.pagination.nextIntersect.active = true
        this.url.intersect.active = true

        // Deactivate physical vehicle
        this.game.physicalVehicle.deactivate()
    }

    close()
    {
        if(this.state === Projects.STATE_CLOSED || this.state === Projects.STATE_CLOSING)
            return

        // State
        this.state = Projects.STATE_CLOSING

        if(this.stateTransition)
            this.stateTransition.kill()

        this.stateTransition = gsap.delayedCall(1.5, () =>
        {
            this.state = Projects.STATE_CLOSED
            this.stateTransition = null
        })

        // Input filters
        this.game.inputs.updateFilters([])

        // View cinematic
        this.game.view.cinematic.end()

        // Shade mix
        gsap.to(this.shadeMix.images.uniform, { value: this.shadeMix.images.min, duration: 1.5, ease: 'power2.inOut', overwrite: true })
        gsap.to(this.shadeMix.texts.uniform, { value: this.shadeMix.texts.min, duration: 1.5, ease: 'power2.inOut', overwrite: true })

        // Interactive area
        gsap.delayedCall(1, () =>
        {
            this.interactiveArea.open()
        })

        // Cursor
        for(const item of this.pagination.items)
            item.intersect.active = false

        this.adjacents.next.intersect.active = false
        this.adjacents.previous.intersect.active = false
        this.pagination.previousIntersect.active = false
        this.pagination.nextIntersect.active = false
        this.url.intersect.active = false

        // Activate physical vehicle
        this.game.physicalVehicle.activate()
    }

    previous()
    {
        if(this.images.index > 0)
            this.previousImage()
        else
            this.previousProject(false)
    }

    previousImage()
    {
        if(this.state === Projects.STATE_CLOSED || this.state === Projects.STATE_CLOSING)
            return

        this.changeImage(this.images.index - 1, Projects.DIRECTION_PREVIOUS)

        this.blackBoard.active = false
    }

    previousProject(firstImage = false)
    {
        if(this.state === Projects.STATE_CLOSED || this.state === Projects.STATE_CLOSING)
            return

        this.changeProject(this.projects.index - 1, Projects.DIRECTION_PREVIOUS, firstImage)

        this.blackBoard.active = false
    }

    next()
    {
        if(this.images.index < this.projects.current.images.length - 1)
            this.nextImage()
        else
            this.nextProject()
    }

    nextImage()
    {
        if(this.state === Projects.STATE_CLOSED || this.state === Projects.STATE_CLOSING)
            return

        this.changeImage(this.images.index + 1, Projects.DIRECTION_NEXT)

        this.blackBoard.active = false
    }

    nextProject()
    {
        if(this.state === Projects.STATE_CLOSED || this.state === Projects.STATE_CLOSING)
            return

        this.changeProject(this.projects.index + 1, Projects.DIRECTION_NEXT)

        this.blackBoard.active = false
    }

    changeProject(index = 0, direction = Projects.DIRECTION_NEXT, firstImage = false)
    {
        // Loop index
        let loopIndex = index

        if(loopIndex > this.projects.items.length - 1)
            loopIndex = 0
        else if(loopIndex < 0)
            loopIndex = this.projects.items.length - 1

        // Save
        this.projects.index = loopIndex
        this.projects.current = this.projects.items[this.projects.index]
        this.projects.previous = this.projects.items[(this.projects.index - 1) < 0 ? this.projects.items.length - 1 : this.projects.index - 1]
        this.projects.next = this.projects.items[(this.projects.index + 1) % this.projects.items.length]

        // Update components
        this.attributes.update()
        this.adjacents.update()
        this.title.update(direction)
        this.url.update(direction)
        this.distinctions.update()

        // Change image
        let imageIndex = null
        if(firstImage)
            imageIndex = 0
        else
            imageIndex = direction === Projects.DIRECTION_NEXT ? 0 : this.projects.current.images.length - 1

        this.changeImage(imageIndex, direction)
    }

    changeImage(imageIndex = 0, direction = null)
    {
        if(direction === null)
            direction = imageIndex > this.images.index ? Projects.DIRECTION_NEXT : Projects.DIRECTION_PREVIOUS

        this.images.index = imageIndex

        // Update components
        this.images.update(direction)
        this.pagination.update()
    }

    update()
    {
        // Oven
        this.oven.blower.scale.y = (Math.sin(this.game.ticker.elapsedScaled) * 0.2 + 0.8)
        this.oven.threshold.value = (- Math.sin(this.game.ticker.elapsedScaled - 0.5) * 0.1 + 0.25)

        // Grinder
        this.grinder.rotation.z = - this.game.ticker.elapsedScaled * 0.75

        // Anvil
        this.anvil.hammer.rotation.reorder('YXZ')
        this.anvil.hammer.rotation.z = Math.pow(1 - Math.abs(Math.sin(this.game.ticker.elapsedScaled * 1)), 5) - 1
    }
}