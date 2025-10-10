import * as THREE from 'three/webgpu'
import { Game } from '../Game.js'
import { lerp, segmentCircleIntersection } from '../utilities/maths.js'
import { InteractivePoints } from '../InteractivePoints.js'
import gsap from 'gsap'
import { Player } from '../Player.js'
import { MeshDefaultMaterial } from '../Materials/MeshDefaultMaterial.js'
import { add, color, float, Fn, max, mix, normalGeometry, objectPosition, PI, positionGeometry, positionWorld, rotateUV, sin, texture, uniform, uv, vec2, vec3, vec4 } from 'three/tsl'
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
        this.setRespawn()
        this.setBounds()
        this.setAirDancers()
        this.setBanners()
        this.setLeaderboard()

        this.game.materials.getFromName('circuitBrand').map.minFilter = THREE.LinearFilter
        this.game.materials.getFromName('circuitBrand').map.magFilter = THREE.LinearFilter

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

        // Mesh and material
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

        // Physics
        this.road.body = mesh.userData.object.physical.body
        this.road.body.setEnabled(false)

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
        this.checkpoints.last = null
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
            
            // Respawn position
            checkpoint.respawnPosition = baseCheckpoint.position.clone()
            const direction = new THREE.Vector2(3, 0)
            direction.rotateAround(new THREE.Vector2(), checkpoint.rotation)
            checkpoint.respawnPosition.x += direction.y
            checkpoint.respawnPosition.y = 4
            checkpoint.respawnPosition.z += direction.x

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
                
                // Update reach count and last
                this.checkpoints.last = checkpoint
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
            obstacle.osciliationOffset = - i * 1
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
        this.startAnimation.interDuration = 2
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

    setRespawn()
    {
        this.game.inputs.addActions([
            { name: 'circuitRespawn', categories: [ 'racing' ], keys: [ 'Keyboard.KeyR', 'Gamepad.select' ] },
        ])

        // Reset
        this.game.inputs.events.on('circuitRespawn', (action) =>
        {
            if(action.active)
                this.respawn()
        })
    }

    respawn()
    {
        if(this.state !== Circuit.STATE_RUNNING)
            return

        // Player > Lock
        this.game.player.state = Player.STATE_LOCKED

        // Respawn position and rotation
        const position = new THREE.Vector3()
        let rotation = 0

        if(this.checkpoints.last)
        {
            position.copy(this.checkpoints.last.respawnPosition)
            rotation = this.checkpoints.last.rotation + Math.PI * 0.5
        }
        else
        {
            position.copy(this.startPosition.position)
            rotation = this.startPosition.rotation
        }
    
        this.game.overlay.show(() =>
        {
            // Player > Unlock
            gsap.delayedCall(2, () =>
            {
                this.game.player.state = Player.STATE_DEFAULT
            })

            // Update physical vehicle
            this.game.physicalVehicle.moveTo(
                position,
                rotation
            )
            
            this.game.overlay.hide()
        })
    }

    setBounds()
    {
        this.bounds = {}
        this.bounds.threshold = 0
        this.bounds.isOut = false
    }

    setAirDancers()
    {
        const baseAirDancers = this.references.get('airDancers')
        const height = 5
        const colorNode = uniform(color('#d684ff'))

        const material = baseAirDancers[0].material.clone()

        const rotation = float(0).toVarying()
        const intensity = float(0).toVarying()
        
        material.positionNode = Fn(() =>
        {
            const newPosition = positionGeometry.toVar()

            const localTime = this.game.ticker.elapsedScaledUniform

            intensity.assign(
                localTime
                    .mul(0.34)
                    .sub(positionGeometry.y.div(height * 2))
                    .fract()
                    .sub(0.5)
                    .mul(2)
                    .abs()
            )

            const heightFade = positionGeometry.y.div(height)

            const rotation1 = sin(localTime.mul(0.678)).mul(0.7)
            const rotation2 = sin(localTime.mul(1.4)).mul(0.35)
            const rotation3 = sin(localTime.mul(2.4)).mul(0.2)
            rotation.assign(add(rotation1, rotation2, rotation3).mul(heightFade).mul(intensity).mul(this.game.wind.strength.remap(0, 1, 0.25, 1)))

            const rotationCenter = vec2(0, 0)
            newPosition.xy.assign(rotateUV(newPosition.xy, rotation, rotationCenter))
            
            return newPosition
        })()

        material.normalNode = Fn(() =>
        {
            const newNormalGeometry = normalGeometry.toVar()
            newNormalGeometry.xy.assign(rotateUV(newNormalGeometry.xy, rotation, vec2(0)))
            return newNormalGeometry
        })()

        // material.outputNode = Fn(() =>
        // {
        //     return vec4(vec3(intensity), 1)
        // })()

        for(const baseAirDancer of baseAirDancers)
        {
            baseAirDancer.material = material
        }

        // Debug
        if(this.game.debug.active)
        {
            const debugPanel = this.debugPanel.addFolder({ title: 'airDancers' })
            this.game.debug.addThreeColorBinding(debugPanel, colorNode.value, 'color')
            
            // debugPanel.addBinding(doorIntensity, 'value', { label: 'intensity', min: 0, max: 5, step: 0.01 })
        }
    }

    setBanners()
    {
        this.banners = this.references.get('banners')
    }

    setLeaderboard()
    {
        this.leaderboard = {}
        const resolution = 512

        // Canvas
        const font = `700 ${35}px "Nunito"`

        const canvas = document.createElement('canvas')
        canvas.style.position = 'fixed'
        canvas.style.zIndex = 999
        canvas.style.top = 0
        canvas.style.left = 0
        // document.body.append(canvas)

        const context = canvas.getContext('2d')
        context.font = font

        canvas.width = resolution
        canvas.height = resolution


        // Texture
        const textTexture = new THREE.Texture(canvas)
        textTexture.minFilter = THREE.NearestFilter
        textTexture.magFilter = THREE.NearestFilter
        textTexture.generateMipmaps = false

        // Digits
        // const geometry = new THREE.PlaneGeometry(this.timer.digits.ratio, 1)

        const material = new MeshDefaultMaterial({
            colorNode: color('#463F35'),
            hasWater: false,
        })
        
        const baseOutput = material.outputNode
        
        material.outputNode = Fn(() =>
        {
            const text = texture(textTexture).r
            return vec4(
                mix(
                    baseOutput.rgb,
                    color('#ffffff').mul(1.3),
                    text
                ),
                baseOutput.a
            )
        })()

        const mesh = this.references.get('leaderboard')[0]
        mesh.material = material

        const columsSettings = [
            { align: 'right', x: resolution * 0.125 },
            { align: 'center', x: resolution * 0.375},
            { align: 'left', x: resolution * 0.625 },
        ]
        const interline = resolution / 12
        this.leaderboard.drawScores = (scores = []) =>
        {
            // Clear
            context.fillStyle = '#000000'
            context.fillRect(0, 0, canvas.width, canvas.height)

            context.font = font
            context.fillStyle = '#ffffff'
            context.textBaseline = 'middle'

            let rank = 1
            for(const score of scores)
            {
                context.textAlign = columsSettings[0].align
                context.fillText(rank, columsSettings[0].x, (rank + 1) * interline)

                context.textAlign = columsSettings[1].align
                context.fillText(score[0], columsSettings[1].x, (rank + 1) * interline)

                context.textAlign = columsSettings[2].align
                context.fillText(score[1], columsSettings[2].x, (rank + 1) * interline)

                rank++
            }
            textTexture.needsUpdate = true
        }

        this.leaderboard.drawScores([
            [ 'BRU', '00:25:150' ],
            [ 'TTU', '00:27:153' ],
            [ 'ORS', '00:27:002' ],
            [ 'BAB', '00:29:193' ],
            [ 'YOH', '00:30:159' ],
            [ 'PUH', '00:37:103' ],
            [ 'WWW', '00:40:253' ],
            [ 'PWT', '00:41:315' ],
            [ 'PRT', '00:45:035' ],
            [ 'BOO', '00:49:531' ],
        ])
    }

    restart()
    {
        if(this.state === Circuit.STATE_STARTING)
            return
            
        // State
        this.state = Circuit.STATE_STARTING

        // Player > Lock
        this.game.player.state = Player.STATE_LOCKED

        // Inputs filters
        this.game.inputs.filters.clear()
        this.game.inputs.filters.add('racing')

        // Overlay > Show
        this.game.overlay.show(() =>
        {
            // Update physical vehicle
            this.game.physicalVehicle.moveTo(
                this.startPosition.position,
                this.startPosition.rotation
            )

            // Deactivate terrain physics
            if(this.game.world.floor)
                this.game.world.floor.physical.body.setEnabled(false)
            
            // Activate road physics (better collision)
            this.road.body.setEnabled(true)

            // Starting lights
            this.startingLights.reset()

            // Checkpoints
            for(const checkpoint of this.checkpoints.items)
                checkpoint.reset()

            this.checkpoints.items[0].setTarget()

            this.checkpoints.reachedCount = 0
            this.checkpoints.last = null

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
                    progress: 0.85,
                    fogFarRatio: 2
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

                // Inputs filters
                this.game.inputs.filters.clear()
                this.game.inputs.filters.add('wandering')
                
                // Update physical vehicle
                const respawn = this.game.respawns.getByName('circuit')
                if(respawn)
                    this.game.physicalVehicle.moveTo(respawn.position, respawn.rotation)

                // Activate terrain physics
                if(this.game.world.floor)
                    this.game.world.floor.physical.body.setEnabled(true)
                
                // Deactivate road physics
                this.road.body.setEnabled(false)
        
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
        if(this.state === Circuit.STATE_RUNNING)
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
                const osciliation = Math.sin(this.timer.elapsedTime * 1.25 + obstacle.osciliationOffset) * 5
                newPosition.z += osciliation
                
                obstacle.object.physical.body.setNextKinematicTranslation(newPosition)
                obstacle.object.needsUpdate = true
            }

            // If out of bounds
            if(this.game.player.position.y < this.bounds.threshold)
            {
                if(!this.bounds.isOut)
                {
                    this.bounds.isOut = true
                    this.respawn()
                }
            }
            else
            {
                this.bounds.isOut = false
            }
        }

        // Banners
        let i = 0
        for(const banner of this.banners)
        {
            const time = this.game.wind.localTime.value * 10 + i * 0.5
            const rotation = Math.sin(time) + Math.sin(time * 2.34) * 0.5 + Math.sin(time * 3.45) * 0.25
            banner.rotation.y = 0.5 + rotation * 0.5

            i++
        }

        // Timer
        this.timer.update()
    }
}