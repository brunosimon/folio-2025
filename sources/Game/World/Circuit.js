import * as THREE from 'three/webgpu'
import { Game } from '../Game.js'
import { lerp, segmentCircleIntersection } from '../utilities/maths.js'
import { InteractivePoints } from '../InteractivePoints.js'
import gsap from 'gsap'
import { Player } from '../Player.js'
import { MeshDefaultMaterial } from '../Materials/MeshDefaultMaterial.js'
import { color, Fn, max, PI, positionWorld, texture, uniform, uv, vec2, vec3, vec4 } from 'three/tsl'
import { alea } from 'seedrandom'

const rng = new alea('circuit')

export default class Circuit
{
    static STATE_PENDING = 1
    static STATE_STARTING = 2
    static STATE_RUNNING = 3
    static STATE_ENDING = 4

    constructor(references)
    {
        this.game = Game.getInstance()

        // Debug
        if(this.game.debug.active)
        {
            this.debugPanel = this.game.debug.panel.addFolder({
                title: '🛞 Circuit',
                expanded: true,
            })
        }

        this.references = references
        this.state = Circuit.STATE_PENDING

        this.setStartPosition()
        this.setRoad()
        this.setStartingLights()
        this.setTimer()
        this.setCheckpoints()
        this.setObjects()
        this.setObstacles()
        this.setRails()
        this.setInteractivePoint()
        this.setStartAnimation()

        this.game.ticker.events.on('tick', () =>
        {
            this.update()
        })
    }

    setStartPosition()
    {
        const baseStart = this.references.get('start')[0]

        this.startPosition = {}
        this.startPosition.position = baseStart.position.clone()
        this.startPosition.rotation = baseStart.rotation.y
    }

    setRoad()
    {
        this.road = {}
        const mesh = this.references.get('road')[0]
        
        this.road.color = uniform(color('#383039'))
        this.road.glitterScarcity = uniform(0.1)
        this.road.glitterLighten = uniform(0.28)
        this.road.middleLighten = uniform(0.1)

        const colorNode = Fn(() =>
        {
            const glitterUv = positionWorld.xz.mul(0.2)
            const glitter = texture(this.game.noises.hash, glitterUv).r
            
            const glitterLighten = glitter.remap(this.road.glitterScarcity.oneMinus(), 1, 0, this.road.glitterLighten)

            // return vec3(glitterLighten)
            
            const middleLighten = uv().y.mul(PI).sin().mul(this.road.middleLighten)

            const baseColor = this.road.color.toVar()
            baseColor.addAssign(max(glitterLighten, middleLighten).mul(0.2))

            return vec3(baseColor)
        })()

        const material = new MeshDefaultMaterial({
            colorNode: colorNode,

            hasLightBounce: false,
            hasWater: false,
        })
        mesh.material = material

        // Debug
        if(this.game.debug.active)
        {
            const debugPanel = this.debugPanel.addFolder({ title: 'road' })
            this.game.debug.addThreeColorBinding(debugPanel, this.road.color.value, 'color')
            debugPanel.addBinding(this.road.glitterScarcity, 'value', { label: 'glitterScarcity', min: 0, max: 1, step: 0.001 })
            debugPanel.addBinding(this.road.glitterLighten, 'value', { label: 'glitterLighten', min: 0, max: 1, step: 0.001 })
            debugPanel.addBinding(this.road.middleLighten, 'value', { label: 'middleLighten', min: 0, max: 0.2, step: 0.001 })
        }
    }

    setStartingLights()
    {
        this.startingLights = {}
        this.startingLights.mesh = this.references.get('startingLights')[0]
        this.startingLights.mesh.visible = false
        this.startingLights.redMaterial = this.game.materials.getFromName('emissiveOrangeRadialGradient')
        this.startingLights.greenMaterial = this.game.materials.getFromName('emissiveGreenRadialGradient')
        this.startingLights.baseZ = this.startingLights.mesh.position.z
        
        this.startingLights.reset = () =>
        {
            this.startingLights.mesh.visible = false
            this.startingLights.mesh.material = this.startingLights.redMaterial
        }
    }

    setTimer()
    {
        this.timer = {}

        this.timer.visible = true
        this.timer.startTime = 0
        this.timer.elapsedTime = 0
        this.timer.endTime = 0
        this.timer.running = false
        this.timer.group = this.references.get('timer')[0]
        this.timer.group.rotation.y = Math.PI * 0.1
        this.timer.group.visible = false
        this.timer.defaultPosition = this.references.get('interactivePoint')[0].position.clone()

        // Digits
        {
            this.timer.digits = {}
            this.timer.digits.ratio = 6
            this.timer.digits.height = 32
            this.timer.digits.width = 32 * 6
            
            // Canvas
            const font = `700 ${this.timer.digits.height}px "Nunito"`

            const canvas = document.createElement('canvas')
            canvas.style.position = 'fixed'
            canvas.style.zIndex = 999
            canvas.style.top = 0
            canvas.style.left = 0
            // document.body.append(canvas)

            const context = canvas.getContext('2d')
            context.font = font

            canvas.width = this.timer.digits.height * this.timer.digits.ratio
            canvas.height = this.timer.digits.height

            context.fillStyle = '#000000'
            context.fillRect(0, 0, canvas.width, canvas.height)

            context.font = font
            context.fillStyle = '#ffffff'
            context.textAlign = 'center'
            context.textBaseline = 'middle'
            context.fillText('00:00:000', this.timer.digits.width * 0.5, this.timer.digits.height * 0.5)
            this.timer.digits.context = context

            // Texture
            const texture = new THREE.Texture(canvas)
            texture.minFilter = THREE.NearestFilter
            texture.magFilter = THREE.NearestFilter
            texture.generateMipmaps = false

            this.timer.digits.texture = texture

            // Digits
            const geometry = new THREE.PlaneGeometry(this.timer.digits.ratio, 1)
            const material = new THREE.MeshBasicNodeMaterial({
                alphaMap: this.timer.digits.texture,
                alphaTest: 0.5
            })
            const mesh = new THREE.Mesh(geometry, material)
            mesh.scale.setScalar(0.5)
            this.timer.group.add(mesh)
        }

        // Write
        this.timer.write = (text) =>
        {
            this.timer.digits.context.fillStyle = '#000000'
            this.timer.digits.context.fillRect(0, 0, this.timer.digits.width, this.timer.digits.height)
            
            this.timer.digits.context.fillStyle = '#ffffff'
            this.timer.digits.context.fillText(text, this.timer.digits.width * 0.5, this.timer.digits.height * 0.5)

            this.timer.digits.texture.needsUpdate = true
        }

        // Show
        this.timer.show = () =>
        {
            this.timer.visible = true

            this.timer.write('00:00:000')

            this.timer.group.position.copy(this.game.player.position)
            this.timer.group.position.y = 2.5
            this.timer.group.scale.setScalar(1)

            this.timer.group.visible = true
        }

        // Hide
        this.timer.hide = () =>
        {
            const value = { scale: 1 }

            gsap.to(
                value,
                {
                    scale: 0,
                    duration: 1,
                    ease: 'back.in(2)',
                    onUpdate: () =>
                    {
                        this.timer.group.scale.setScalar(value.scale)
                    },
                    // onComplete: () =>
                    // {
                    //     this.timer.group.visible = false
                    // }
                }
            )
            
            this.timer.visible = false
        }

        // Start
        this.timer.start = () =>
        {
            this.timer.running = true

            this.timer.startTime = this.game.ticker.elapsed
        }

        // End
        this.timer.end = () =>
        {
            this.timer.endTime = this.game.ticker.elapsed

            this.timer.running = false
        }

        this.timer.update = () =>
        {
            // Group > Follow car
            const target = new THREE.Vector3()

            if(this.state === Circuit.STATE_PENDING)
            {
                target.x = this.timer.defaultPosition.x - 2
                target.y = 2.5
                target.z = this.timer.defaultPosition.z + 1
            }
            else
            {
                target.x = this.game.player.position.x - 2
                target.y = 2.5
                target.z = this.game.player.position.z + 1
            }
            
            this.timer.group.position.lerp(target, this.game.ticker.deltaScaled * 5)
            // this.timer.group.position.z = this.game.player.position2.y

            // Digits
            if(this.timer.running)
            {
                const currentTime = this.game.ticker.elapsed
                this.timer.elapsedTime = currentTime - this.timer.startTime

                const minutes = Math.floor(this.timer.elapsedTime / 60)
                const seconds = Math.floor((this.timer.elapsedTime % 60))
                const milliseconds = Math.floor((this.timer.elapsedTime * 1000) % 1000)

                const digitsString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(milliseconds).padStart(3, '0')}`

                this.timer.write(digitsString)
            }
        }
    }

    setCheckpoints()
    {
        this.checkpoints = {}
        this.checkpoints.items = []
        this.checkpoints.count = 0
        this.checkpoints.checkRadius = 2
        this.checkpoints.target = null
        this.checkpoints.reachedCount = 0

        // Create checkpoints
        const baseCheckpoints = this.references.get('checkpoints').sort((a, b) => a.name.localeCompare(b.name))

        let i = 0
        for(const baseCheckpoint of baseCheckpoints)
        {
            const checkpoint = {}

            baseCheckpoint.rotation.reorder('YXZ')
            baseCheckpoint.visible = false

            checkpoint.index = i
            checkpoint.position = baseCheckpoint.position.clone()
            checkpoint.rotation = baseCheckpoint.rotation.y
            checkpoint.scale = baseCheckpoint.scale.x * 0.5


            // Center
            checkpoint.center = new THREE.Vector2(checkpoint.position.x, checkpoint.position.z)

            // Segment
            checkpoint.a = new THREE.Vector2(checkpoint.position.x - checkpoint.scale, checkpoint.position.z)
            checkpoint.b = new THREE.Vector2(checkpoint.position.x + checkpoint.scale, baseCheckpoint.position.z)

            checkpoint.a.rotateAround(checkpoint.center, - checkpoint.rotation)
            checkpoint.b.rotateAround(checkpoint.center, - checkpoint.rotation)

            // // Helpers
            // const helperA = new THREE.Mesh(
            //     new THREE.CylinderGeometry(0.1, 0.1, 2, 8, 1),
            //     new THREE.MeshBasicNodeMaterial({ color: 'yellow', wireframe: true })
            // )
            // helperA.position.x = checkpoint.a.x
            // helperA.position.z = checkpoint.a.y
            // this.game.scene.add(helperA)

            // const helperB = new THREE.Mesh(
            //     new THREE.CylinderGeometry(0.1, 0.1, 2, 8, 1),
            //     new THREE.MeshBasicNodeMaterial({ color: 'yellow', wireframe: true })
            // )
            // helperB.position.x = checkpoint.b.x
            // helperB.position.z = checkpoint.b.y
            // this.game.scene.add(helperB)

            // Set target
            checkpoint.setTarget = () =>
            {
                this.checkpoints.target = checkpoint

                // Mesh
                this.checkpoints.doorTarget.scaleUniform.value = checkpoint.scale
                this.checkpoints.doorTarget.mesh.visible = true
                this.checkpoints.doorTarget.mesh.position.copy(checkpoint.position)
                this.checkpoints.doorTarget.mesh.rotation.y = checkpoint.rotation
                this.checkpoints.doorTarget.mesh.scale.x = checkpoint.scale
            }

            // Reach
            checkpoint.reach = () =>
            {
                // Not target
                if(checkpoint !== this.checkpoints.target)
                    return

                // Confetti
                if(this.game.world.confetti)
                {
                    this.game.world.confetti.pop(new THREE.Vector3(checkpoint.a.x, 0, checkpoint.a.y))
                    this.game.world.confetti.pop(new THREE.Vector3(checkpoint.b.x, 0, checkpoint.b.y))
                }

                // Mesh
                this.checkpoints.doorReached.scaleUniform.value = checkpoint.scale
                this.checkpoints.doorReached.mesh.visible = true
                this.checkpoints.doorReached.mesh.position.copy(checkpoint.position)
                this.checkpoints.doorReached.mesh.rotation.y = checkpoint.rotation
                this.checkpoints.doorReached.mesh.scale.x = checkpoint.scale
                
                // Update reach and targets
                this.checkpoints.reachedCount++

                // Final checkpoint (start line)
                if(this.checkpoints.reachedCount === this.checkpoints.count + 2)
                {
                    this.finish()
                }

                // Next checkpoint
                else
                {
                    const newTarget = this.checkpoints.items[this.checkpoints.reachedCount % (this.checkpoints.count + 1)]
                    newTarget.setTarget()
                }
                
                
                // No more target
                this.checkpoints.target
            }

            this.checkpoints.count = this.checkpoints.items.length

            // Reset
            checkpoint.reset = () =>
            {
                // // Mesh
                // checkpoint.mesh.visible = false
            }

            // Save
            this.checkpoints.items.push(checkpoint)

            i++
        }

        // Checkpoint doors
        const doorIntensity = uniform(2)
        const doorOutputColor = Fn(([doorColor, doorScale]) =>
        {
            const baseUv = uv()

            const squaredUV = baseUv.toVar()
            squaredUV.y.subAssign(this.game.ticker.elapsedScaledUniform.mul(0.2))
            squaredUV.mulAssign(vec2(
                doorScale,
                1
            ).mul(2))

            const stripes = squaredUV.x.add(squaredUV.y).fract().step(0.5)

            const alpha = baseUv.y.oneMinus().mul(stripes)

            return vec4(doorColor.mul(doorIntensity), alpha)
        })

        const doorGeometry = new THREE.PlaneGeometry(2, 2)

        {
            this.checkpoints.doorTarget = {}
            this.checkpoints.doorTarget.scaleUniform = uniform(2)
            this.checkpoints.doorTarget.color = uniform(color('#32ffc1'))

            const material = new THREE.MeshBasicNodeMaterial({ transparent: true, side: THREE.DoubleSide })
            material.outputNode = doorOutputColor(this.checkpoints.doorTarget.color, this.checkpoints.doorTarget.scaleUniform)
            
            const mesh = new THREE.Mesh(doorGeometry, material)
            mesh.scale.x = 1
            mesh.castShadow = false
            mesh.receiveShadow = false
            mesh.material = material
            mesh.visible = false
            this.game.scene.add(mesh)

            this.checkpoints.doorTarget.mesh = mesh
        }

        {
            this.checkpoints.doorReached = {}
            this.checkpoints.doorReached.scaleUniform = uniform(2)
            this.checkpoints.doorReached.color = uniform(color('#cbff62'))
            
            const material = new THREE.MeshBasicNodeMaterial({ transparent: true, side: THREE.DoubleSide })
            material.outputNode = doorOutputColor(this.checkpoints.doorReached.color, this.checkpoints.doorReached.scaleUniform)
            
            const mesh = new THREE.Mesh(doorGeometry, material)
            mesh.scale.x = 1
            mesh.castShadow = false
            mesh.receiveShadow = false
            mesh.material = material
            mesh.visible = false
            this.game.scene.add(mesh)

            this.checkpoints.doorReached.mesh = mesh
        }

        // Debug
        if(this.game.debug.active)
        {
            const debugPanel = this.debugPanel.addFolder({ title: 'checkpoints' })
            this.game.debug.addThreeColorBinding(debugPanel, this.checkpoints.doorTarget.color.value, 'targetColor')
            this.game.debug.addThreeColorBinding(debugPanel, this.checkpoints.doorReached.color.value, 'reachedColor')
            
            debugPanel.addBinding(doorIntensity, 'value', { label: 'intensity', min: 0, max: 5, step: 0.01 })
        }
    }

    setObjects()
    {
        this.objects = {}
        this.objects.items = []

        const baseObjects = this.references.get('objects')

        for(const baseObject of baseObjects)
        {

            this.objects.items.push(baseObject.userData.object)
        }

        this.objects.reset = () =>
        {
            for(const object of this.objects.items)
                this.game.objects.resetObject(object)
        }
    }

    setObstacles()
    {
        this.obstacles = {}
        this.obstacles.items = []
        
        const baseObstacles = this.references.get('obstacles')

        let i = 0
        for(const baseObstacle of baseObstacles)
        {
            const obstacle = {}
            obstacle.object = baseObstacle.userData.object
            obstacle.osciliationOffset = i
            obstacle.basePosition = obstacle.object.visual.object3D.position.clone()

            this.obstacles.items.push(obstacle)

            i++
        }
    }

    setRails()
    {
        this.rails = {}
        
        const railsMesh = this.references.get('rails')[0]
        railsMesh.material = railsMesh.material.clone()
        railsMesh.material.side = THREE.DoubleSide

        this.rails.object = railsMesh.userData.object
        
        this.rails.activate = () =>
        {
            this.game.objects.enable(this.rails.object)
        }
        
        this.rails.deactivate = () =>
        {
            this.game.objects.disable(this.rails.object)
        }

        this.rails.deactivate()
    }

    setInteractivePoint()
    {
        this.interactivePoint = this.game.interactivePoints.create(
            this.references.get('interactivePoint')[0].position,
            'Start race!',
            InteractivePoints.ALIGN_RIGHT,
            () =>
            {
                this.restart()
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

    setStartAnimation()
    {
        this.startAnimation = {}
        this.startAnimation.timeline = gsap.timeline({ paused: true })
        this.startAnimation.interDuration = 0.5
        this.startAnimation.endCallback = null

        this.startAnimation.timeline.add(() =>
        {
            this.startingLights.mesh.visible = true
            this.startingLights.mesh.position.z = this.startingLights.baseZ + 0.01
        })
        this.startAnimation.timeline.add(gsap.delayedCall(this.startAnimation.interDuration, () =>
        {
            this.startingLights.mesh.position.z = this.startingLights.baseZ + 0.02
        }))
        this.startAnimation.timeline.add(gsap.delayedCall(this.startAnimation.interDuration, () =>
        {
            this.startingLights.mesh.position.z = this.startingLights.baseZ + 0.03
        }))
        this.startAnimation.timeline.add(gsap.delayedCall(this.startAnimation.interDuration, () =>
        {
            this.startingLights.mesh.material = this.startingLights.greenMaterial

            if(typeof this.startAnimation.endCallback === 'function')
                this.startAnimation.endCallback()
        }))
        this.startAnimation.timeline.add(gsap.delayedCall(this.startAnimation.interDuration, () =>
        {
        }))

        this.startAnimation.start = (endCallback) =>
        {
            this.startAnimation.endCallback = endCallback
            this.startAnimation.timeline.seek(0)
            this.startAnimation.timeline.play()
        }
    }

    restart()
    {
        if(this.state === Circuit.STATE_STARTING)
            return
            
        // State
        this.state = Circuit.STATE_STARTING

        // Player > Lock
        this.game.player.state = Player.STATE_LOCKED

        // Overlay > Show
        this.game.overlay.show(() =>
        {
            // Update physical vehicle
            this.game.physicalVehicle.moveTo(
                this.startPosition.position,
                this.startPosition.rotation
            )

            // Starting lights
            this.startingLights.reset()

            // Checkpoints
            for(const checkpoint of this.checkpoints.items)
                checkpoint.reset()

            this.checkpoints.items[0].setTarget()

            this.checkpoints.reachedCount = 0

            // Objects
            this.objects.reset()

            // Crates (all crates in the world?)
            this.game.world.explosiveCrates.reset()

            // Weather
            this.game.weather.override.start(
                {
                    humidity: 0,
                    electricField: 0,
                    clouds: 0,
                    wind: 0
                },
                0
            )
    
            // Day cycles
            const dayPresetMix = 0.25
            this.game.dayCycles.override.start(
                {
                    lightColor: this.game.dayCycles.presets.day.lightColor.clone().lerp(this.game.dayCycles.presets.dawn.lightColor, dayPresetMix),
                    lightIntensity: lerp(this.game.dayCycles.presets.day.lightIntensity, this.game.dayCycles.presets.dawn.lightIntensity, dayPresetMix),
                    shadowColor: this.game.dayCycles.presets.day.shadowColor.clone().lerp(this.game.dayCycles.presets.dawn.shadowColor, dayPresetMix),
                    fogColorA: this.game.dayCycles.presets.day.fogColorA.clone().lerp(this.game.dayCycles.presets.dawn.fogColorA, dayPresetMix),
                    fogColorB: this.game.dayCycles.presets.day.fogColorB.clone().lerp(this.game.dayCycles.presets.dawn.fogColorB, dayPresetMix),
                    fogNearRatio: lerp(this.game.dayCycles.presets.day.fogNearRatio, this.game.dayCycles.presets.dawn.fogNearRatio, dayPresetMix),
                    fogFarRatio: lerp(this.game.dayCycles.presets.day.fogFarRatio, this.game.dayCycles.presets.dawn.fogFarRatio, dayPresetMix)
                },
                0
            )

            // Timer
            this.timer.show()

            // Rails
            this.rails.activate()

            // Overlay > Hide
            this.game.overlay.hide(() =>
            {
                // State
                this.state = Circuit.STATE_RUNNING

                // Start animation
                this.startAnimation.start(() =>
                {
                    // Player > Unlock
                    this.game.player.state = Player.STATE_DEFAULT

                    this.timer.start()
                })

            })
        })
    }

    finish()
    {
        // Not running
        if(this.state !== Circuit.STATE_RUNNING)
            return
            
        // State
        this.state = Circuit.STATE_ENDING
        
        // Timer
        this.timer.end()

        // Checkpoints
        this.checkpoints.target = null
        this.checkpoints.doorTarget.mesh.visible = false

        gsap.delayedCall(5, () =>
        {
            // Overlay > Show
            this.game.overlay.show(() =>
            {
                // State
                this.state = Circuit.STATE_PENDING
                
                // Update physical vehicle
                this.game.physicalVehicle.moveTo(
                    this.startPosition.position,
                    this.startPosition.rotation
                )

                // Weather and day cycles
                this.game.weather.override.end(0)
                this.game.dayCycles.override.end(0)

                // Checkpoints
                this.checkpoints.doorReached.mesh.visible = false
                this.checkpoints.doorTarget.mesh.visible = false

                // Starting lights
                this.startingLights.reset()

                // Rails
                this.rails.deactivate()

                // Overlay > Hide
                this.game.overlay.hide(() =>
                {
                    // State
                    this.state = Circuit.STATE_PENDING
                })
            })
        })
    }

    update()
    {
        // Checkpoints
        for(const checkpoint of this.checkpoints.items)
        {
            const intersections = segmentCircleIntersection(
                checkpoint.a.x,
                checkpoint.a.y,
                checkpoint.b.x,
                checkpoint.b.y,
                this.game.player.position2.x,
                this.game.player.position2.y,
                this.checkpoints.checkRadius
            )

            if(intersections.length)
                checkpoint.reach()
        }

        // Obstacles
        for(const obstacle of this.obstacles.items)
        {
            const newPosition = obstacle.basePosition.clone()
            const osciliation = Math.sin(this.timer.elapsedTime * 1.25 + obstacle.osciliationOffset) * 3.5
            newPosition.z += osciliation
            
            obstacle.object.physical.body.setNextKinematicTranslation(newPosition)
            obstacle.object.needsUpdate = true
        }

        // Timer
        this.timer.update()
    }
}