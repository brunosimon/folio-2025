import * as THREE from 'three/webgpu'
import { Game } from '../Game.js'
import { InteractiveAreas } from '../InteractiveAreas.js'
import gsap from 'gsap'
import labData from '../../data/lab.js'
import { TextCanvas } from '../TextCanvas.js'
import { add, color, float, Fn, If, luminance, mix, mul, normalWorld, positionGeometry, positionWorld, sin, step, texture, uniform, uv, vec2, vec3, vec4 } from 'three/tsl'
import { remapClamp, safeMod, signedModDelta } from '../utilities/maths.js'

export class Lab
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
                title: '🧪 Lab',
                expanded: false,
            })
        }
        
        this.references = references
        this.state = Lab.STATE_CLOSED

        this.setInteractiveArea()
        this.setInputs()
        this.setCinematic()
        this.setShadeMix()
        this.setTexts()
        this.setHover()
        this.setNavigation()
        this.setImages()
        this.setAdjacents()
        this.setTitle()
        this.setUrl()
        this.setScroller()
        this.setPendulum()
        this.setBlackBoard()
        this.setCandleFlames()
        this.setCauldron()

        this.changeProject(0)
        this.scroller.progress = this.scroller.targetProgress

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
            'Lab',
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

        this.game.inputs.events.on('interact', (action) =>
        {
            if(!action.active && this.state === Lab.STATE_OPEN)
            {
                this.url.open()
            }
        })
    }

    setCinematic()
    {
        this.cinematic = {}
        
        this.cinematic.position = new THREE.Vector3()
        this.cinematic.positionOffset = new THREE.Vector3(4.65, 4.20, 4.85)
        
        this.cinematic.target = new THREE.Vector3()
        this.cinematic.targetOffset = new THREE.Vector3(-2.60, 1.32, -4.80)

        const applyPositionAndTarget = () =>
        {
            const flatPosition = this.references.get('interactiveArea')[0].position.clone()
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
                if(this.state === Lab.STATE_OPEN || this.state === Lab.STATE_OPENING)
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

    setNavigation()
    {
        this.navigation = {}
        this.navigation.index = -1
        this.navigation.current = null
        this.navigation.next = null
        this.navigation.previous = null
        this.navigation.direction = Lab.DIRECTION_NEXT
    }

    setImages()
    {
        this.images = {}
        this.images.width = 1920 * 0.5
        this.images.height = 1080 * 0.5

        // Mesh
        this.images.mesh = this.references.get('images')[0]
        this.images.mesh.receiveShadow = true
        this.images.mesh.castShadow = false

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
            if(this.navigation.current.image === key)
            {
                this.images.textureNew.needsUpdate = true
                gsap.to(this.images.loadProgress, { value: 1, duration: 1, overwrite: true })

                this.images.loadSibling()
            }
        }

        // Load sibling
        this.images.loadSibling = () =>
        {
            let projectIndex = this.navigation.index

            if(this.navigation.direction === Lab.DIRECTION_PREVIOUS)
                projectIndex -= 1
            else
                projectIndex += 1

            if(projectIndex < 0)
                projectIndex = labData.length - 1

            if(projectIndex > labData.length - 1)
                projectIndex = 0

            const key = labData[projectIndex].image
            const resource = this.images.getResourceAndLoad(key)
        }

        // Get resource and load
        this.images.getResourceAndLoad = (key) =>
        {
            const path = `lab/images/${key}`

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
        this.images.update = () =>
        {
            // Get resource
            const key = this.navigation.current.image
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
            this.images.animationDirection.value = this.navigation.direction === Lab.DIRECTION_NEXT ? 1 : -1
        }
    }

    setAdjacents()
    {
        this.adjacents = {}

        /**
         * Previous
         */
        // Arrow
        const arrowPrevious = this.references.get('arrowPrevious')[0]
        arrowPrevious.material = this.hover.inactiveMaterial
        
        // Intersect
        const intersectPrevious = this.references.get('intersectPrevious')[0]
        const intersectPreviousPosition = new THREE.Vector3()
        intersectPrevious.getWorldPosition(intersectPreviousPosition)

        this.adjacents.previousIntersect = this.game.cursor.addIntersects({
            active: false,
            shapes:
            [
                new THREE.Sphere(intersectPreviousPosition, intersectPrevious.scale.x)
            ],
            onClick: () =>
            {
                this.previous(true)
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
        // Arrow
        const arrowNext = this.references.get('arrowNext')[0]
        arrowNext.material = this.hover.inactiveMaterial
        
        // Intersect
        const intersectNext = this.references.get('intersectNext')[0]

        const intersectNextPosition = new THREE.Vector3()
        intersectNext.getWorldPosition(intersectNextPosition)

        this.adjacents.nextIntersect = this.game.cursor.addIntersects({
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

            const rotationDirection = direction === Lab.DIRECTION_NEXT ? - 1 : 1

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

            const rotationDirection = direction === Lab.DIRECTION_NEXT ? - 1 : 1

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

    setScroller()
    {
        this.scroller = {}
        this.scroller.repeatAmplitude = 0.5444
        this.scroller.chainLeft = this.references.get('chainLeft')[0]
        this.scroller.chainRight = this.references.get('chainRight')[0]
        this.scroller.chainPulley = this.references.get('chainPulley')[0]
        this.scroller.gearA = this.references.get('gearA')[0]
        this.scroller.gearB = this.references.get('gearB')[0]
        this.scroller.gearC = this.references.get('gearC')[0]
        this.scroller.progress = 0
        this.scroller.targetProgress = 0
        this.scroller.wheelSensitivity = 0.1
        this.scroller.easing = 3

        // Vertical chain material
        {
            const material = new THREE.MeshLambertNodeMaterial()
            const totalShadows = this.game.lighting.addTotalShadowToMaterial(material)

            material.outputNode = Fn(() =>
            {
                const baseColor = color('#6f6a87')

                positionWorld.toVarying().y.greaterThan(4).discard()
                
                return this.game.lighting.lightOutputNodeBuilder(baseColor, float(1), vec3(0, 1, 0), totalShadows, true, false)
            })()

            material.castShadowNode = Fn(() =>
            {
                positionWorld.toVarying().y.greaterThan(4).discard()
                
                return vec4(0, 0, 0, 1)
            })()

            this.scroller.chainLeft.material = material
            this.scroller.chainRight.material = material
        }
        
        // Pulley chain material
        {
            const material = new THREE.MeshLambertNodeMaterial()
            const totalShadows = this.game.lighting.addTotalShadowToMaterial(material)

            material.outputNode = Fn(() =>
            {
                const baseColor = color('#6f6a87')

                positionWorld.toVarying().y.lessThan(4).discard()
                
                return this.game.lighting.lightOutputNodeBuilder(baseColor, float(1), vec3(0, 1, 0), totalShadows, true, false)
            })()

            material.castShadowNode = Fn(() =>
            {
                positionWorld.toVarying().y.lessThan(4).discard()
                
                return vec4(0, 0, 0, 1)
            })()

            this.scroller.chainPulley.material = material
        }

        // Minis
        {
            const groupTemplate = this.references.get('mini')[0]
            const parent = groupTemplate.parent
            groupTemplate.removeFromParent()
            
            this.scroller.minis = {}
            this.scroller.minis.inter = 0.9
            this.scroller.minis.items = []
            this.scroller.minis.total = labData.length * this.scroller.minis.inter
            this.scroller.minis.current = null
            this.scroller.minis.width = 1920 / 8
            this.scroller.minis.height = 1080 / 8

            let i = 0
            for(const project of labData)
            {
                const mini = {}
                mini.index = i
                mini.y = - i * this.scroller.minis.inter
                this.scroller.minis.items.push(mini)

                // Group
                mini.group = groupTemplate.clone(true)
                mini.group.position.y = mini.y
                mini.group.visible = true
                parent.add(mini.group)

                // Elements
                let imageMesh = null
                let textMesh = null
                let panelMesh = null
                let intersectMesh = null

                for(const child of mini.group.children)
                {
                    if(child.name.startsWith('image'))
                        imageMesh = child
                    if(child.name.startsWith('text'))
                        textMesh = child
                    if(child.name.startsWith('panel'))
                        panelMesh = child
                    if(child.name.startsWith('intersect'))
                        intersectMesh = child
                }

                // Image
                {
                    const material = new THREE.MeshLambertNodeMaterial()

                    const loadProgress = uniform(0)
                    const totalShadows = this.game.lighting.addTotalShadowToMaterial(this.images.material)

                    const imageElement = new Image()
                    imageElement.width = this.scroller.minis.width
                    imageElement.height = this.scroller.minis.height
                    imageElement.onload = () =>
                    {
                        gsap.to(loadProgress, { value: 1, duration: 0.3, overwrite: true })
                        imageTexture.needsUpdate = true
                    }

                    const imageTexture = new THREE.Texture(imageElement)
                    imageTexture.colorSpace = THREE.SRGBColorSpace
                    imageTexture.flipY = false
                    imageTexture.magFilter = THREE.LinearFilter
                    imageTexture.minFilter = THREE.LinearFilter
                    imageTexture.generateMipmaps = false

                    material.outputNode = Fn(() =>
                    {
                        const textureColor = texture(imageTexture).rgb
                        textureColor.assign(mix(color('#333333'), textureColor, loadProgress))
            
                        const shadedOutput = this.game.lighting.lightOutputNodeBuilder(textureColor, float(1), normalWorld, totalShadows)

                        return vec4(mix(shadedOutput.rgb, textureColor, this.shadeMix.images.uniform), 1)
                    })()
                    imageMesh.receiveShadow = true
                    imageMesh.castShadow = false
                    imageMesh.material = material

                    // Load
                    mini.startedLoading = false
                    mini.startLoading = () =>
                    {
                        if(mini.startedLoading)
                            return

                        imageElement.src = `lab/images/${project.imageMini}`

                        mini.startedLoading = true
                    }
                }

                // Text
                {
                    const textCanvas = new TextCanvas(
                        this.texts.fontFamily,
                        this.texts.fontWeight,
                        this.texts.fontSizeMultiplier * 0.18,
                        1.5,
                        0.2,
                        this.texts.density,
                        'center',
                        0.2
                    )
                    textCanvas.updateText(project.title)

                    const ratio = textCanvas.getMeasure().width / this.texts.density
                    panelMesh.scale.x = ratio + 0.2

                    const material = new THREE.MeshLambertNodeMaterial({ transparent: true })

                    const alpha = texture(textCanvas.texture).r
                    mini.textMixStrength = uniform(0)

                    const shadedOutput = this.game.lighting.lightOutputNodeBuilder(this.texts.baseColor, float(1), normalWorld, float(1)).rgb
                    material.outputNode = vec4(
                        mix(
                            mix(
                                shadedOutput,
                                this.texts.baseColor,
                                this.shadeMix.texts.uniform
                            ),
                            this.texts.baseColor.mul(1.5),
                            mini.textMixStrength
                        ),
                        alpha
                    )

                    // Mesh
                    textMesh.castShadow = false
                    textMesh.receiveShadow = false
                    textMesh.material = material
                }

                // Intersect  
                intersectMesh.visible = false      
                mini.intersect = this.game.cursor.addIntersects({
                    active: false,
                    shapes:
                    [
                        intersectMesh
                    ],
                    onClick: () =>
                    {
                        this.changeProject(mini.index)
                    },
                    onEnter: () =>
                    {
                        mini.textMixStrength.value = 1
                    },
                    onLeave: () =>
                    {
                        if(mini.index === this.navigation.index)
                            mini.textMixStrength.value = 1
                        else
                            mini.textMixStrength.value = 0
                    }
                })

                i++
            }
        }

        this.scroller.gearA.rotation.reorder('YXZ')
        this.scroller.gearB.rotation.reorder('YXZ')
        this.scroller.gearC.rotation.reorder('YXZ')

        this.scroller.animate = () =>
        {
            this.scroller.chainLeft.position.y = - this.scroller.repeatAmplitude * 0.5 - this.scroller.offset % this.scroller.repeatAmplitude
            this.scroller.chainRight.position.y = - this.scroller.repeatAmplitude * 0.5 + (this.scroller.offset % this.scroller.repeatAmplitude)
            this.scroller.chainPulley.rotation.z = this.scroller.offset * 1.4

            this.scroller.gearA.rotation.x = - this.scroller.offset * 1.4
            this.scroller.gearB.rotation.x = - this.scroller.gearA.rotation.x * (6 / 12)
            this.scroller.gearC.rotation.x = - this.scroller.gearB.rotation.x * (6 / 12)

            for(const mini of this.scroller.minis.items)
            {
                mini.group.position.y = safeMod(mini.y - this.scroller.offset, this.scroller.minis.total) - 1

                const scale = remapClamp(mini.group.position.y, 3.3, 3.9, 1, 0)
                mini.group.scale.y = scale

                mini.group.visible = scale > 0
                mini.intersect.active = mini.group.visible && (this.state === Lab.STATE_OPEN || this.state === Lab.STATE_OPENING)

                if(mini.group.visible && !mini.startedLoading)
                {
                    mini.startLoading()
                }
            }
        }

        this.scroller.update = () =>
        {
            // Scroll
            const centeringOffset = labData.length - 3.25
            const closestProgress = Math.round((this.scroller.progress + this.navigation.index - centeringOffset) / labData.length) * labData.length - this.navigation.index + centeringOffset
            this.scroller.targetProgress = closestProgress

            // Active text
            if(this.scroller.minis.current)
                this.scroller.minis.current.textMixStrength.value = 0

            const mini = this.scroller.minis.items[this.navigation.index]
            mini.textMixStrength.value = 1
            this.scroller.minis.current = mini
        }

        this.game.ticker.events.on('tick', () =>
        {
            this.scroller.progress += (this.scroller.targetProgress - this.scroller.progress) * this.game.ticker.deltaScaled * this.scroller.easing
            this.scroller.offset = this.scroller.progress * this.scroller.minis.inter

            this.scroller.animate()
        })

        // Inputs
        this.game.inputs.addActions([
            { name: 'scroll', categories: [ 'cinematic' ], keys: [ 'wheel' ] }
        ])

        this.game.inputs.events.on('scroll', (action) =>
        {
            this.scroller.targetProgress -= action.value * this.scroller.wheelSensitivity
        })
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
                if(this.state === Lab.STATE_CLOSED || this.state === Lab.STATE_CLOSING || !this.blackBoard.active)
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

    setCandleFlames()
    {
        const meshes = this.references.get('candleFlame')

        const baseMaterial = this.game.materials.getFromName('emissiveOrangeRadialGradient')
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

        for(const mesh of meshes)
        {
            mesh.scale.setScalar(0)
            mesh.visible = false

            mesh.material = material
        }

        this.game.dayCycles.events.on('lights', (inInverval) =>
        {
            if(inInverval)
            {
                for(const mesh of meshes)
                {
                    mesh.visible = true
                    gsap.to(mesh.scale, { x: 1, y: 1, z: 1, duration: 10, ease: 'power1.out', overwrite: true })
                }
            }
            else
            {
                for(const mesh of meshes)
                {
                    gsap.to(mesh.scale, { x: 0, y: 0, z: 0, duration: 10, ease: 'power1.in', overwrite: true, onComplete: () =>
                    {
                        mesh.visible = false
                    } })
                }
            }
        })
    }

    setCauldron()
    {
        this.cauldron = {}

        // Heat
        {
            const material = new THREE.MeshBasicNodeMaterial({ side: THREE.DoubleSide, transparent: true, depthTest: true, depthWrite: false })

            material.outputNode = Fn(() =>
            {
                const noiseUv = uv().mul(vec2(2, 0.2)).toVar()
                noiseUv.y.addAssign(this.game.ticker.elapsedScaledUniform.mul(0.05))
                const noise = texture(this.game.noises.others, noiseUv).r

                const strength = noise.mul(uv().y.pow(2)).toVar()

                const emissiveMix = strength.smoothstep(0, 1)
                const emissiveColor = mix(color('#ff3e00'), color('#ff8641'), emissiveMix).mul(strength.add(1).mul(2))

                return vec4(vec3(emissiveColor), strength)
            })()

            this.cauldron.heat = this.references.get('heat')[0]
            this.cauldron.heat.material = material
            this.cauldron.heat.castShadow = false
        }

        // Burning wood
        {
            const material = new THREE.MeshLambertNodeMaterial()
            const totalShadows = this.game.lighting.addTotalShadowToMaterial(material)

            const colorA = uniform(color('#ff8641'))
            const colorB = uniform(color('#ff3e00'))
            const intensity = uniform(1.25)

            material.outputNode = Fn(() =>
            {
                const baseUv = uv().toVar()

                const baseColor = color('#f29246')
                const lightOutput = this.game.lighting.lightOutputNodeBuilder(baseColor, float(1), vec3(0, 1, 0), totalShadows, true, false)

                const emissiveColor = mix(colorA, colorB, uv().sub(0.5).length().mul(2)).toVar()
                const emissiveOutput = emissiveColor.div(luminance(emissiveColor)).mul(intensity)

                const mixStrength = baseUv.y.smoothstep(0, 1)
                const output = mix(lightOutput, emissiveOutput, mixStrength)

                return vec4(output.rgb, 1)
            })()

            this.cauldron.wood = this.references.get('wood')[0]
            this.cauldron.wood.material = material
        }

        // Liquid
        {
            this.cauldron.liquid = {}
            
            const colorA = uniform(color('#ff0083'))
            const colorB = uniform(color('#3018eb'))
            const intensity = uniform(1.7)
    
            const material = new THREE.MeshBasicNodeMaterial({ transparent: true })
            const mixedColor = mix(colorA, colorB, uv().sub(0.5).length().mul(2)).toVar()
            material.colorNode = mixedColor.div(luminance(mixedColor)).mul(intensity)
            material.fog = false

            this.cauldron.liquid.surface = this.references.get('liquid')[0]
            this.cauldron.liquid.surface.material = material

            this.cauldron.liquid.update = () =>
            {

            }

            if(this.game.debug.active)
            {
                const debugPanel = this.debugPanel.addFolder({
                    title: 'cauldron',
                    expanded: false,
                })
                this.game.debug.addThreeColorBinding(debugPanel, colorA.value, 'colorA')
                this.game.debug.addThreeColorBinding(debugPanel, colorB.value, 'colorB')
            }
        }

    }

    open()
    {
        if(this.state === Lab.STATE_OPEN || this.state === Lab.STATE_OPENING)
            return

        // State
        this.state = Lab.STATE_OPENING

        if(this.stateTransition)
            this.stateTransition.kill()

        this.stateTransition = gsap.delayedCall(1.5, () =>
        {
            this.state = Lab.STATE_OPEN
            this.stateTransition = null
        })

        // Inputs filters
        this.game.inputs.filters.delete('playing')
        this.game.inputs.filters.add('cinematic')

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
        this.adjacents.nextIntersect.active = true
        this.adjacents.previousIntersect.active = true
        this.url.intersect.active = true

        // Deactivate physical vehicle
        this.game.physicalVehicle.deactivate()
    }

    close()
    {
        if(this.state === Lab.STATE_CLOSED || this.state === Lab.STATE_CLOSING)
            return

        // State
        this.state = Lab.STATE_CLOSING

        if(this.stateTransition)
            this.stateTransition.kill()

        this.stateTransition = gsap.delayedCall(1.5, () =>
        {
            this.state = Lab.STATE_CLOSED
            this.stateTransition = null
        })

        // Input filters
        this.game.inputs.filters.delete('cinematic')
        this.game.inputs.filters.add('playing')

        // View cinematic
        this.game.view.cinematic.end()

        // Shade mix
        gsap.to(this.shadeMix.images.uniform, { value: this.shadeMix.images.min, duration: 1.5, ease: 'power2.inOut', overwrite: true })
        gsap.to(this.shadeMix.texts.uniform, { value: this.shadeMix.texts.min, duration: 1.5, ease: 'power2.inOut', overwrite: true })

        // Interactive area
        gsap.delayedCall(1, () =>
        {
            this.interactiveArea.reveal()
        })

        // // Cursor
        // this.adjacents.next.intersect.active = false
        // this.adjacents.previous.intersect.active = false
        // this.pagination.previousIntersect.active = false
        // this.pagination.nextIntersect.active = false
        // this.url.intersect.active = false

        // Activate physical vehicle
        this.game.physicalVehicle.activate()
    }

    previous()
    {
        if(this.state === Lab.STATE_CLOSED || this.state === Lab.STATE_CLOSING)
            return

        this.changeProject(this.navigation.index - 1, Lab.DIRECTION_PREVIOUS)

        this.blackBoard.active = false
    }

    next()
    {
        if(this.state === Lab.STATE_CLOSED || this.state === Lab.STATE_CLOSING)
            return

        this.changeProject(this.navigation.index + 1, Lab.DIRECTION_NEXT)

        this.blackBoard.active = false
    }

    changeProject(index = 0, direction = null)
    {
        // Loop index
        let loopIndex = index

        if(loopIndex > labData.length - 1)
            loopIndex = 0
        else if(loopIndex < 0)
            loopIndex = labData.length - 1

        // Already active
        if(this.navigation.index === loopIndex)
            return

        // Direction
        if(direction === null)
            direction = signedModDelta(loopIndex, this.navigation.index, labData.length) > 0 ? Lab.DIRECTION_PREVIOUS : Lab.DIRECTION_NEXT

        // Save
        this.navigation.index = loopIndex
        this.navigation.current = labData[this.navigation.index]
        this.navigation.previous = labData[(this.navigation.index - 1) < 0 ? labData.length - 1 : this.navigation.index - 1]
        this.navigation.next = labData[(this.navigation.index + 1) % labData.length]
        this.navigation.direction = direction

        // Update components
        this.title.update(direction)
        this.url.update(direction)
        this.images.update()

        // Scroller
        this.scroller.update(this.navigation.index)
    }

    update()
    {
        this.cauldron.liquid.update()
    }
}