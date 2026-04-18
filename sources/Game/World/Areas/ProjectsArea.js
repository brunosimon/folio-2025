import * as THREE from 'three/webgpu'
import { Game } from '../../Game.js'
import { InteractivePoints } from '../../InteractivePoints.js'
import gsap from 'gsap'
import projectsData from '../../../data/projects.js'
import { TextCanvas } from '../../TextCanvas.js'
import { add, color, float, Fn, If, luminance, mix, mul, normalWorld, positionGeometry, sin, step, texture, uniform, uv, vec3, vec4 } from 'three/tsl'
import { Inputs } from '../../Inputs/Inputs.js'
import { MeshDefaultMaterial } from '../../Materials/MeshDefaultMaterial.js'
import { Area } from './Area.js'

export class ProjectsArea extends Area
{
    static DIRECTION_PREVIOUS = 1
    static DIRECTION_NEXT = 2
    static STATE_OPEN = 3
    static STATE_OPENING = 4
    static STATE_CLOSED = 5
    static STATE_CLOSING = 6

    constructor(model)
    {
        super(model)

        // Debug
        if(this.game.debug.active)
        {
            this.debugPanel = this.game.debug.panel.addFolder({
                title: '🔨 Projects',
                expanded: false,
            })
        }
        
        this.state = ProjectsArea.STATE_CLOSED

        this.setSounds()
        this.setInteractivePoint()
        this.setInputs()
        this.setCinematic()
        this.setShadeMix()
        this.setTexts()
        this.setHover()
        this.setNavigation()
        this.setImages()
        this.setPagination()
        this.setAttributes()
        this.setAdjacents()
        this.setTitle()
        this.setUrl()
        this.setDistinctions()
        this.setBlackBoard()
        this.setOven()
        this.setGrinder()
        this.setAnvil()
        this.setAchievement()

        this.changeProject(0, ProjectsArea.DIRECTION_NEXT, false, true)

        // Debug
        if(this.game.debug.active)
        {
            this.debugPanel.addButton({ title: 'open', label: 'open' }).on('click', () => { this.open() })
            this.debugPanel.addButton({ title: 'close', label: 'close' }).on('click', () => { this.close() })
        }
    }

    setSounds()
    {
        this.sounds = {}
        this.sounds.anvil = this.game.audio.register({
            path: 'sounds/anvil/METLImpt_Anvil Single Hammer Strike Hammers_GENHD1-01372.mp3',
            autoplay: false,
            loop: false,
            volume: 0.5,
            antiSpam: 0.1,
            positions: this.references.items.get('anvil')[0].position,
            distanceFade: 18,
            onPlay: (item) =>
            {
                item.volume = 0.1 + Math.random() * 0.1
                item.rate = 1 + Math.random() * 0.02
            }
        })
    }

    setInteractivePoint()
    {
        this.interactivePoint = this.game.interactivePoints.create(
            this.references.items.get('interactivePoint')[0].position,
            'Projects',
            InteractivePoints.ALIGN_RIGHT,
            InteractivePoints.STATE_CONCEALED,
            () =>
            {
                this.open()
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
    }

    setInputs()
    {
        // this.game.inputs.events.on('backward', () =>
        // {
        //     this.close()
        // })

        this.game.inputs.events.on('left', (action) =>
        {
            if(action.active)
                this.previous()
        })

        this.game.inputs.events.on('right', (action) =>
        {
            if(action.active)
                this.next()
        })

        this.game.inputs.events.on('forward', (action) =>
        {
            if(action.active && !action.activeKeys.has('Gamepad.r2'))
                this.previous()
        })

        this.game.inputs.events.on('backward', (action) =>
        {
            if(action.active && !action.activeKeys.has('Gamepad.l2'))
                this.next()
        })

        this.game.inputs.events.on('interact', (action) =>
        {
            if(!action.active && this.state === ProjectsArea.STATE_OPEN)
            {
                this.url.open()
            }
        })

        this.game.inputs.interactiveButtons.events.on('previous', () =>
        {
            if(this.state === ProjectsArea.STATE_OPEN)
                this.previous()
        })

        this.game.inputs.interactiveButtons.events.on('next', () =>
        {
            if(this.state === ProjectsArea.STATE_OPEN)
                this.next()
        })

        this.game.inputs.interactiveButtons.events.on('open', () =>
        {
            if(this.state === ProjectsArea.STATE_OPEN)
                this.url.open()
        })

        this.game.inputs.interactiveButtons.events.on('close', () =>
        {
            if(this.state === ProjectsArea.STATE_OPEN)
                this.close()
        })
    }

    setCinematic()
    {
        this.cinematic = {}
        
        this.cinematic.position = new THREE.Vector3()
        this.cinematic.positionOffset = new THREE.Vector3(4.65, 4, 4.85)
        
        this.cinematic.target = new THREE.Vector3()
        this.cinematic.targetOffset = new THREE.Vector3(-3.0, 1.60, -4.60)

        const applyPositionAndTarget = () =>
        {
            const flatPosition = this.references.items.get('interactivePoint')[0].position.clone()
            flatPosition.y = 0
            this.cinematic.position.copy(flatPosition).add(this.cinematic.positionOffset)
            this.cinematic.target.copy(flatPosition).add(this.cinematic.targetOffset)
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
        this.shadeMix.images.mixUniform = uniform(this.shadeMix.images.min)

        this.shadeMix.texts = {}
        this.shadeMix.texts.min = 0.1
        this.shadeMix.texts.max = 0.3
        this.shadeMix.texts.mixUniform = uniform(this.shadeMix.texts.min)

        // Debug
        if(this.game.debug.active)
        {
            const debugPanel = this.debugPanel.addFolder({
                title: 'Shader mix',
                expanded: true,
            })

            const debugUpdate = () =>
            {
                if(this.state === ProjectsArea.STATE_OPEN || this.state === ProjectsArea.STATE_OPENING)
                {
                    this.shadeMix.images.mixUniform.value = this.shadeMix.images.max
                    this.shadeMix.texts.mixUniform.value = this.shadeMix.texts.max
                }
                else
                {
                    this.shadeMix.images.mixUniform.value = this.shadeMix.images.min
                    this.shadeMix.texts.mixUniform.value = this.shadeMix.texts.min
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
            const material = new MeshDefaultMaterial({
                hasWater: false,
                alphaNode: texture(textTexture).r,
                transparent: true
            })
            
            const baseOutput = material.outputNode
            
            material.outputNode = Fn(() =>
            {
                return vec4(
                    mix(
                        baseOutput.rgb,
                        this.texts.baseColor,
                        this.shadeMix.texts.mixUniform
                    ),
                    baseOutput.a
                )
            })()

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
        this.hover.inactiveMaterial = new MeshDefaultMaterial({
            colorNode: this.hover.baseColor,
            hasWater: false
        })
        
        const baseOutput = this.hover.inactiveMaterial.outputNode
        
        this.hover.inactiveMaterial.outputNode = Fn(() =>
        {
            return vec4(
                mix(
                    baseOutput.rgb,
                    this.texts.baseColor,
                    this.shadeMix.texts.mixUniform
                ),
                1
            )
        })()

        // Active
        this.hover.activeMaterial = new THREE.MeshBasicNodeMaterial({ transparent: true })
        this.hover.activeMaterial.outputNode = vec4(this.hover.baseColor.mul(1.5), float(1))
    }

    setNavigation()
    {
        this.navigation = {}
        this.navigation.index = 0
        this.navigation.current = null
        this.navigation.next = null
        this.navigation.previous = null
    }

    setImages()
    {
        this.images = {}
        this.images.initiated = false
        this.images.width = 1920 * 0.5
        this.images.height = 1080 * 0.5
        this.images.index = 0
        this.images.direction = ProjectsArea.DIRECTION_NEXT
        this.images.resources = new Map()
        this.images.loadProgress = uniform(0)
        this.images.animationProgress = uniform(0)
        this.images.animationDirection = uniform(0)

        // Mesh
        this.images.mesh = this.references.items.get('images')[0]
        this.images.mesh.receiveShadow = true
        this.images.mesh.castShadow = false
        this.images.mesh.visible = false // Wait for first load to display

        // Finishing initiating and use first image as default resource
        this.images.init = (key) =>
        {
            this.images.initiated = true

            this.images.mesh.visible = true
            const resource = this.images.resources.get(key)

            this.images.textureOld = resource.texture.clone()
            this.images.textureNew = resource.texture.clone()

            // Color node
            const colorNode = Fn(() =>
            {
                const uvOld = uv().toVar()
                const uvNew = uv().toVar()

                // Parallax (add an offset according to progress)
                uvNew.x.addAssign(this.images.animationProgress.oneMinus().mul(-0.25).mul(this.images.animationDirection))
                uvOld.x.addAssign(this.images.animationProgress.mul(0.25).mul(this.images.animationDirection))

                // Textures
                const textureOldColor = texture(this.images.textureOld, uvOld).rgb
                const textureNewColor = texture(this.images.textureNew, uvNew).rgb

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
                return textureColor

            })()
            
            // Material
            this.images.material = new MeshDefaultMaterial({
                colorNode: colorNode,
                hasWater: false
            })

            const baseOutput = this.images.material.outputNode
            
            this.images.material.outputNode = Fn(() =>
            {
                return vec4(
                    mix(
                        baseOutput.rgb,
                        colorNode,
                        this.shadeMix.images.mixUniform
                    ),
                    baseOutput.a
                )
            })()
            
            this.images.mesh.material = this.images.material
        }

        // Load ended
        this.images.loadEnded = (key) =>
        {
            // If first image => init
            if(!this.images.initiated)
                this.images.init(key)

            // Current image => Reveal
            if(this.navigation.current.images[this.images.index] === key)
            {
                const resource = this.images.getResourceAndLoad(key)
                this.images.textureNew.copy(resource.texture)
                this.images.textureNew.needsUpdate = true
                gsap.to(this.images.loadProgress, { value: 1, duration: 1, overwrite: true })

                this.images.loadSibling()
            }
        }

        // Load sibling
        this.images.loadSibling = () =>
        {
            let projectIndex = this.navigation.index
            let imageIndex = this.images.index

            if(this.images.direction === ProjectsArea.DIRECTION_PREVIOUS)
                imageIndex -= 1
            else
                imageIndex += 1

            if(imageIndex < 0)
            {
                projectIndex -= 1

                if(projectIndex < 0)
                    projectIndex = projectsData.length - 1

                imageIndex = projectsData[projectIndex].images.length - 1
            }
            else if(imageIndex > this.navigation.current.images.length - 1)
            {
                projectIndex += 1

                if(projectIndex > projectsData.length - 1)
                    projectIndex = 0

                imageIndex = 0
            }

            const key = projectsData[projectIndex].images[imageIndex]
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

                const loader = this.game.resourcesLoader.getLoader('textureKtx')

                loader.load(
                    path,
                    (loadedTexture) =>
                    {
                        resource.texture = loadedTexture
                        resource.colorSpace = THREE.SRGBColorSpace
                        resource.flipY = false
                        resource.magFilter = THREE.LinearFilter
                        resource.minFilter = THREE.LinearFilter
                        resource.generateMipmaps = false

                        resource.loaded = true
                        
                        this.images.loadEnded(key)
                    }
                )

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
            const key = this.navigation.current.images[this.images.index]
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
            if(this.images.initiated)
            {
                this.images.textureOld.copy(this.images.textureNew)
                this.images.textureOld.needsUpdate = true

                if(resource.loaded)
                {
                    this.images.textureNew.copy(resource.texture)
                    this.images.textureNew.needsUpdate = true
                }
            }

            // Animate right away
            gsap.fromTo(this.images.animationProgress, { value: 0 }, { value: 1, duration: 1, ease: 'power2.inOut', overwrite: true })
            this.images.animationDirection.value = direction === ProjectsArea.DIRECTION_NEXT ? 1 : -1
        }
    }

    setPagination()
    {
        this.pagination = {}
        this.pagination.inter = 0.2
        this.pagination.group = this.references.items.get('pagination')[0].children[0]
        this.pagination.items = []

        // List
        let i = 0
        const intersectPagination = this.references.items.get('intersectPagination')

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

                item.intersect = this.game.rayCursor.addIntersect({
                    active: false,
                    shape: new THREE.Sphere(new THREE.Vector3(), item.intersectReference.scale.x),
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
                item.intersectReference.getWorldPosition(item.intersect.shape.center)

                this.pagination.items.push(item)

                i++
            }
        }


        // Adjacents
        const intersectPrevious = this.references.items.get('intersectPreviousImage')[0]
        const intersectPreviousPosition = new THREE.Vector3()
        intersectPrevious.getWorldPosition(intersectPreviousPosition)
        const arrowPrevious = this.references.items.get('arrowPreviousImage')[0]
        arrowPrevious.material = this.hover.inactiveMaterial
 
        this.pagination.previousIntersect = this.game.rayCursor.addIntersect({
            active: false,
            shape: new THREE.Sphere(intersectPreviousPosition, intersectPrevious.scale.x),
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

        const intersectNext = this.references.items.get('intersectNextImage')[0]
        const intersectNextPosition = new THREE.Vector3()
        intersectNext.getWorldPosition(intersectNextPosition)
        const arrowNext = this.references.items.get('arrowNextImage')[0]
        arrowNext.material = this.hover.inactiveMaterial
        this.pagination.nextIntersect = this.game.rayCursor.addIntersect({
            active: false,
            shape: new THREE.Sphere(intersectNextPosition, intersectNext.scale.x),
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
                if(i <= this.navigation.current.images.length - 1)
                {
                    if(!item.visible)
                    {
                        gsap.to(item.mesh.scale, { x: 1, y: 1, z: 1, duration: 0.5, ease: 'power1.inOut', overwrite: true })
                        item.mesh.visible = true
                        item.visible = true
                        item.intersect.active = this.state === ProjectsArea.STATE_OPENING || this.state === ProjectsArea.STATE_OPEN
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

            const offset = - (this.navigation.current.images.length - 1) * this.pagination.inter / 2
            gsap.to(this.pagination.group.position, { x: offset, duration: 0.5, ease: 'power1.inOut', overwrite: true, onComplete: () =>
            {
                for(const item of this.pagination.items)
                    item.intersectReference.getWorldPosition(item.intersect.shape.center)
            } })
        }
    }

    setAttributes()
    {
        this.attributes = {}
        this.attributes.group = this.references.items.get('attributes')[0]
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
                    const attribute = this.navigation.current.attributes[name]

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
        this.adjacents.previous.group = this.references.items.get('previous')[0]
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
        const arrowPrevious = this.references.items.get('arrowPreviousProject')[0]
        arrowPrevious.material = this.hover.inactiveMaterial
        
        // Intersect
        const intersectPrevious = this.references.items.get('intersectPreviousProject')[0]
        const intersectPreviousPosition = new THREE.Vector3()
        intersectPrevious.getWorldPosition(intersectPreviousPosition)

        this.adjacents.previous.intersect = this.game.rayCursor.addIntersect({
            active: false,
            shape: new THREE.Sphere(intersectPreviousPosition, intersectPrevious.scale.x),
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
        this.adjacents.next.group = this.references.items.get('next')[0]
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
        const arrowNext = this.references.items.get('arrowNextProject')[0]
        arrowNext.material = this.hover.inactiveMaterial
        
        // Intersect
        const intersectNext = this.references.items.get('intersectNextProject')[0]

        const intersectNextPosition = new THREE.Vector3()
        intersectNext.getWorldPosition(intersectNextPosition)

        this.adjacents.next.intersect = this.game.rayCursor.addIntersect({
            active: false,
            shape: new THREE.Sphere(intersectNextPosition, intersectNext.scale.x),
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

                this.adjacents.previous.textCanvas.updateText(this.navigation.previous.titleSmall)
                this.adjacents.next.textCanvas.updateText(this.navigation.next.titleSmall)
            })
        }
    }

    setTitle()
    {
        this.title = {}
        this.title.status = 'hidden'
        this.title.group = this.references.items.get('title')[0]
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

            const rotationDirection = direction === ProjectsArea.DIRECTION_NEXT ? - 1 : 1

            this.title.inner.rotation.x = 0
            gsap.to(this.title.inner.rotation, { x: Math.PI * rotationDirection, duration: 1, delay: 0, ease: 'power2.in', overwrite: true, onComplete: () =>
            {
                this.title.status = 'visible'

                gsap.to(this.title.inner.rotation, { x: Math.PI * 2 * rotationDirection, duration: 1, delay: 0, ease: 'back.out(2)', overwrite: true })

                this.title.textCanvas.updateText(this.navigation.current.title)
            } })
        }
    }

    setUrl()
    {
        this.url = {}
        this.url.status = 'hidden'
        this.url.group = this.references.items.get('url')[0]
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
        const material = new MeshDefaultMaterial({
            colorNode: this.texts.baseColor,
            hasWater: false,
            alphaNode: texture(this.url.textCanvas.texture).r,
            transparent: true
        })
        
        const baseOutput = material.outputNode
        
        material.outputNode = Fn(() =>
        {
            return vec4(
                mix(
                    mix(
                        baseOutput.rgb,
                        this.texts.baseColor,
                        this.shadeMix.texts.mixUniform
                    ),
                    this.texts.baseColor.mul(1.5),
                    this.url.mixStrength
                ),
                baseOutput.a
            )
        })()

        // Mesh
        this.url.textMesh.castShadow = false
        this.url.textMesh.receiveShadow = false
        this.url.textMesh.material = material

        // Intersect
        const intersect = this.references.items.get('intersectUrl')[0]
        intersect.visible = false
 
        this.url.intersect = this.game.rayCursor.addIntersect({
            active: false,
            shape: intersect,
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

            const rotationDirection = direction === ProjectsArea.DIRECTION_NEXT ? - 1 : 1

            this.url.inner.rotation.x = 0
            gsap.to(this.url.inner.rotation, { x: Math.PI * rotationDirection, duration: 1, delay: 0.3, ease: 'power2.in', overwrite: true, onComplete: () =>
            {
                this.url.status = 'visible'

                gsap.to(this.url.inner.rotation, { x: Math.PI * 2 * rotationDirection, duration: 1, delay: 0, ease: 'back.out(2)', overwrite: true })

                this.url.textCanvas.updateText(this.navigation.current.url.replace(/https?:\/\//, ''))

                const ratio = this.url.textCanvas.getMeasure().width / this.texts.density
                this.url.panel.scale.x = ratio + 0.2

            } })
        }

        // Open
        this.url.open = () =>
        {
            if(this.navigation.current.url)
            {
                window.open(this.navigation.current.url, '_blank')
            }
        }
    }

    setDistinctions()
    {
        this.distinctions = {}
        this.distinctions.status = 'hidden'
        this.distinctions.group = this.references.items.get('distinctions')[0]
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
                const positions = this.distinctions.positions[this.navigation.current.distinctions.length - 1]
                for(const name of this.navigation.current.distinctions)
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
        this.references.items.get('balls')[0].rotation.reorder('YXZ')
        const timeline0 = gsap.timeline({ yoyo: true, repeat: -1 })
        timeline0.to(this.references.items.get('balls')[0].rotation, { x: 0.75, ease: 'power2.out', delay: 0.75, duration: 0.75 })
        
        const timeline1 = gsap.timeline({ yoyo: true, repeat: -1, delay: 1.5 })
        timeline1.to(this.references.items.get('balls')[1].rotation, { x: -0.75, ease: 'power2.out', delay: 0.75, duration: 0.75 })
    }

    setBlackBoard()
    {
        this.blackBoard = {}
        this.blackBoard.active = true
        this.blackBoard.group = this.references.items.get('blackBoard')[0]
        this.blackBoard.parent = this.blackBoard.group.parent

        // Jump timeline
        this.blackBoard.timeline = gsap.timeline({
            repeat: -1,
            repeatDelay: 5,
            paused: true,
            onRepeat: () =>
            {
                if(this.state === ProjectsArea.STATE_CLOSED || this.state === ProjectsArea.STATE_CLOSING || !this.blackBoard.active)
                    this.blackBoard.timeline.pause()
            }
        })

        this.blackBoard.timeline.to(this.blackBoard.group.position, { y: 0.25, ease: 'power2.out', duration: 0.7 }, 0 + 2)
        this.blackBoard.timeline.to(this.blackBoard.group.position, { y: 0, ease: 'power2.in', duration: 0.7 }, 0.7 + 2)

        this.blackBoard.timeline.to(this.blackBoard.group.rotation, { x: 0.1, duration: 0.15 }, 0 + 2)
        this.blackBoard.timeline.to(this.blackBoard.group.rotation, { x: -0.1, duration: 0.3 }, 0.15 + 2)
        this.blackBoard.timeline.to(this.blackBoard.group.rotation, { x: 0.1, duration: 0.3 }, 0.45 + 2)
        this.blackBoard.timeline.to(this.blackBoard.group.rotation, { x: -0.1, duration: 0.3 }, 0.75 + 2)
        this.blackBoard.timeline.to(this.blackBoard.group.rotation, { x: 0, duration: 0.3 }, 1.05 + 2)

        // Labels
        this.blackBoard.labelsGamepadPlaystation = this.references.items.get('blackboardLabelsGamepadPlaystation')[0]
        this.blackBoard.labelsGamepadXbox = this.references.items.get('blackboardLabelsGamepadXbox')[0]
        this.blackBoard.labelsMouseKeyboard = this.references.items.get('blackboardLabelsMouseKeyboard')[0]
        this.blackBoard.labelsGamepadPlaystation.castShadow = false
        this.blackBoard.labelsGamepadXbox.castShadow = false
        this.blackBoard.labelsMouseKeyboard.castShadow = false
        this.blackBoard.labelsGamepadPlaystation.visible = false
        this.blackBoard.labelsGamepadXbox.visible = false
        
        this.game.inputs.events.on('modeChange', () =>
        {
            if(this.game.inputs.mode === Inputs.MODE_GAMEPAD)
            {
                if(this.game.inputs.gamepad.type === 'xbox')
                {
                    this.blackBoard.labelsGamepadXbox.visible = true
                    this.blackBoard.labelsGamepadPlaystation.visible = false
                }
                else
                {
                    this.blackBoard.labelsGamepadXbox.visible = false
                    this.blackBoard.labelsGamepadPlaystation.visible = true
                }
                this.blackBoard.labelsMouseKeyboard.visible = false

                this.blackBoard.parent.add(this.blackBoard.group)
            }
            else if(this.game.inputs.mode === Inputs.MODE_MOUSEKEYBOARD)
            {
                this.blackBoard.labelsGamepadXbox.visible = false
                this.blackBoard.labelsGamepadPlaystation.visible = false
                this.blackBoard.labelsMouseKeyboard.visible = true
                this.blackBoard.parent.add(this.blackBoard.group)
            }
            else if(this.game.inputs.mode === Inputs.MODE_TOUCH)
            {
                this.blackBoard.parent.remove(this.blackBoard.group)
            }
        })

        this.game.inputs.gamepad.events.on('typeChange', () =>
        {
            if(this.game.inputs.mode === Inputs.MODE_GAMEPAD)
            {
                if(this.game.inputs.gamepad.type === 'xbox')
                {
                    this.blackBoard.labelsGamepadXbox.visible = true
                    this.blackBoard.labelsGamepadPlaystation.visible = false
                }
                else
                {
                    this.blackBoard.labelsGamepadXbox.visible = false
                    this.blackBoard.labelsGamepadPlaystation.visible = true
                }
            }
        })
    }

    setOven()
    {
        this.oven = {}

        // Blower
        this.oven.blower = this.references.items.get('blower')[0]

        // Charcoal
        this.oven.charcoal = this.references.items.get('charcoal')[0]

        this.oven.threshold = uniform(0.2)

        const alphaNode = Fn(() =>
        {
            const baseUv = uv()

            const voronoi = texture(
                this.game.noises.voronoi,
                baseUv
            ).g

            voronoi.subAssign(this.oven.threshold)

            return voronoi
        })()

        const material = new MeshDefaultMaterial({
            colorNode: color(0x6F6A87),
            alphaNode: alphaNode,
            hasWater: false,
            hasLightBounce: false
        })

        this.oven.charcoal.material = material

        // Debug
        this.oven.thresholdBinding = this.game.debug.addManualBinding(
            this.debugPanel,
            this.oven.threshold,
            'value',
            { label: 'ovenThreshold', min: 0, max: 1, step: 0.001 },
            () => - Math.sin(this.game.ticker.elapsedScaled - 0.5) * 0.1 + 0.25
        )
    }

    setGrinder()
    {
        this.grinder = this.references.items.get('grinder')[0]
    }

    setAnvil()
    {
        this.anvil = {}
        this.anvil.frequency = 1
        this.anvil.loopTime = 0
        
        // Hammer
        this.anvil.hammer = this.references.items.get('hammer')[0]
        this.anvil.hammer.rotation.reorder('ZXY')

        // Blade
        this.anvil.blade = this.references.items.get('blade')[0]

        const material = new MeshDefaultMaterial({
            colorNode: color('#a88c7f')
        })
        
        const colorA = uniform(color('#ff8641'))
        const colorB = uniform(color('#ff3e00'))
        const intensity = uniform(1.7)

        const baseOutput = material.outputNode
        material.outputNode = Fn(() =>
        {
            const baseUv = uv(1).toVar()

            const emissiveColor = mix(colorA, colorB, uv().sub(0.5).length().mul(10))
            const emissiveOutput = emissiveColor.div(luminance(emissiveColor)).mul(intensity)

            const mixStrength = baseUv.y.smoothstep(0.4, 0.9)
            const output = mix(baseOutput.rgb, emissiveOutput, mixStrength)

            return vec4(output.rgb, 1)
        })()

        this.anvil.blade.material = material
    }

    setAchievement()
    {
        this.events.on('boundingIn', () =>
        {
            this.game.achievements.setProgress('areas', 'projects')
        })
    }

    open()
    {
        if(this.state === ProjectsArea.STATE_OPEN || this.state === ProjectsArea.STATE_OPENING)
            return

        // State
        this.state = ProjectsArea.STATE_OPENING

        if(this.stateTransition)
            this.stateTransition.kill()

        this.stateTransition = gsap.delayedCall(1.5, () =>
        {
            this.state = ProjectsArea.STATE_OPEN
            this.stateTransition = null
        })

        // Inputs filters
        this.game.inputs.filters.delete('wandering')
        this.game.inputs.filters.add('cinematic')

        // View cinematic
        this.game.view.cinematic.start(this.cinematic.position, this.cinematic.target)

        // Interactive point
        this.game.interactivePoints.temporaryHide()

        // Shade mix
        gsap.to(this.shadeMix.images.mixUniform, { value: this.shadeMix.images.max, duration: 2, ease: 'power2.inOut', overwrite: true })
        gsap.to(this.shadeMix.texts.mixUniform, { value: this.shadeMix.texts.max, duration: 2, ease: 'power2.inOut', overwrite: true })

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

        // Buttons
        this.game.inputs.interactiveButtons.clearItems()
        this.game.inputs.interactiveButtons.addItems(['previous', 'next', 'open', 'close'])

        // Sound
        const sound = this.game.audio.groups.get('click')
        if(sound)
            sound.play(true)

        // Achievements
        this.game.achievements.setProgress('projects', this.navigation.current.title)
    }

    close()
    {
        if(this.state === ProjectsArea.STATE_CLOSED || this.state === ProjectsArea.STATE_CLOSING)
            return

        // State
        this.state = ProjectsArea.STATE_CLOSING

        if(this.stateTransition)
            this.stateTransition.kill()

        this.stateTransition = gsap.delayedCall(1.5, () =>
        {
            this.state = ProjectsArea.STATE_CLOSED
            this.stateTransition = null
        })

        // Input filters
        this.game.inputs.filters.delete('cinematic')
        this.game.inputs.filters.add('wandering')

        // View cinematic
        this.game.view.cinematic.end()

        // Shade mix
        gsap.to(this.shadeMix.images.mixUniform, { value: this.shadeMix.images.min, duration: 1.5, ease: 'power2.inOut', overwrite: true })
        gsap.to(this.shadeMix.texts.mixUniform, { value: this.shadeMix.texts.min, duration: 1.5, ease: 'power2.inOut', overwrite: true })

        // Interactive point
        gsap.delayedCall(1, () =>
        {
            this.game.interactivePoints.recover()
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
            
        // Buttons
        this.game.inputs.interactiveButtons.clearItems([])

        // Sound
        const sound = this.game.audio.groups.get('click')
        if(sound)
            sound.play(false)
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
        if(this.state === ProjectsArea.STATE_CLOSED || this.state === ProjectsArea.STATE_CLOSING)
            return

        this.changeImage(this.images.index - 1, ProjectsArea.DIRECTION_PREVIOUS)

        this.blackBoard.active = false
    }

    previousProject(firstImage = false)
    {
        if(this.state === ProjectsArea.STATE_CLOSED || this.state === ProjectsArea.STATE_CLOSING)
            return

        this.changeProject(this.navigation.index - 1, ProjectsArea.DIRECTION_PREVIOUS, firstImage)

        this.blackBoard.active = false
    }

    next()
    {
        if(this.images.index < this.navigation.current.images.length - 1)
            this.nextImage()
        else
            this.nextProject()
    }

    nextImage()
    {
        if(this.state === ProjectsArea.STATE_CLOSED || this.state === ProjectsArea.STATE_CLOSING)
            return

        this.changeImage(this.images.index + 1, ProjectsArea.DIRECTION_NEXT)

        this.blackBoard.active = false
    }

    nextProject()
    {
        if(this.state === ProjectsArea.STATE_CLOSED || this.state === ProjectsArea.STATE_CLOSING)
            return

        this.changeProject(this.navigation.index + 1, ProjectsArea.DIRECTION_NEXT)

        this.blackBoard.active = false
    }

    changeProject(index = 0, direction = ProjectsArea.DIRECTION_NEXT, firstImage = false, silent = false)
    {
        // Loop index
        let loopIndex = index

        if(loopIndex > projectsData.length - 1)
            loopIndex = 0
        else if(loopIndex < 0)
            loopIndex = projectsData.length - 1

        // Save
        this.navigation.index = loopIndex
        this.navigation.current = projectsData[this.navigation.index]
        this.navigation.previous = projectsData[(this.navigation.index - 1) < 0 ? projectsData.length - 1 : this.navigation.index - 1]
        this.navigation.next = projectsData[(this.navigation.index + 1) % projectsData.length]

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
            imageIndex = direction === ProjectsArea.DIRECTION_NEXT ? 0 : this.navigation.current.images.length - 1

        // Sound
        if(!silent)
        {
            this.game.audio.groups.get('click').play()
            this.game.audio.groups.get('assemble').play()
        }

        this.changeImage(imageIndex, direction, silent)

        // Achievements
        if(this.state === ProjectsArea.STATE_OPEN)
            this.game.achievements.setProgress('projects', this.navigation.current.title)
    }

    changeImage(imageIndex = 0, direction = null, silent = false)
    {
        if(direction === null)
            direction = imageIndex > this.images.index ? ProjectsArea.DIRECTION_NEXT : ProjectsArea.DIRECTION_PREVIOUS

        this.images.index = imageIndex

        // Update components
        this.images.update(direction)
        this.pagination.update()

        // Sounds
        if(!silent)
        {
            this.game.audio.groups.get('click').play()
            this.game.audio.groups.get('slide').play()
        }
    }

    update()
    {
        // Oven
        this.oven.blower.scale.y = (Math.sin(this.game.ticker.elapsedScaled) * 0.2 + 0.8)
        this.oven.thresholdBinding.update()

        // Grinder
        this.grinder.rotation.z = - this.game.ticker.elapsedScaled * 0.75

        // Anvil
        const time = this.game.ticker.elapsedScaled * this.anvil.frequency + Math.PI * 0.25
        this.anvil.hammer.rotation.x = Math.pow(1 - Math.abs(Math.sin(time)), 5) - 1

        // Anvil sound
        const loopTime = ((time) / Math.PI) % 1
        if(loopTime < this.anvil.loopTime)
            this.sounds.anvil.play()

        this.anvil.loopTime = loopTime
    }
}
