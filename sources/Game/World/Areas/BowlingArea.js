import * as THREE from 'three/webgpu'
import { Game } from '../../Game.js'
import { InteractivePoints } from '../../InteractivePoints.js'
import { clamp, lerp, remapClamp } from '../../utilities/maths.js'
import gsap from 'gsap'
import { color, float, Fn, instancedBufferAttribute, instanceIndex, max, min, mix, positionGeometry, sin, step, texture, uniform, uv, vec2, vec3, vec4 } from 'three/tsl'
import { InstancedGroup } from '../../InstancedGroup.js'
import { Area } from './Area.js'

export class BowlingArea extends Area
{
    constructor(model)
    {
        super(model)

        this.won = false
        this.wonTime = 0

        // Auto play settings
        this.autoPlay = {
            active: true,
            interval: 5, // seconds between each launch
            lastLaunchTime: 0,
            minPinsToKnock: 1,
            maxPinsToKnock: 10,
            ballSpeed: 8,
            ballVariation: 0.3 // random variation in ball direction
        }

        // Debug
        if(this.game.debug.active)
        {
            this.debugPanel = this.game.debug.panel.addFolder({
                title: '🎳 Bowling',
                expanded: false,
            })

            // Auto play debug panel
            const autoPlayPanel = this.debugPanel.addFolder({
                title: 'Auto Play',
                expanded: true,
            })

            autoPlayPanel.addBinding(this.autoPlay, 'active', { label: 'Active' })
            autoPlayPanel.addBinding(this.autoPlay, 'interval', { label: 'Interval (s)', min: 2, max: 20, step: 0.5 })
            autoPlayPanel.addBinding(this.autoPlay, 'minPinsToKnock', { label: 'Min Pins', min: 1, max: 10, step: 1 })
            autoPlayPanel.addBinding(this.autoPlay, 'maxPinsToKnock', { label: 'Max Pins', min: 1, max: 10, step: 1 })
            autoPlayPanel.addBinding(this.autoPlay, 'ballSpeed', { label: 'Ball Speed', min: 1, max: 20, step: 0.5 })
            autoPlayPanel.addBinding(this.autoPlay, 'ballVariation', { label: 'Variation', min: 0, max: 2, step: 0.1 })
        }

        this.setSounds()
        this.setPins()
        this.setBall()
        this.setRestart()
        this.setScreen()
        this.setBumpers()
        this.setJukebox()
        this.setAchievement()
    }

    setSounds()
    {
        this.sounds = {}

        this.sounds.pin = this.game.audio.register({
            path: 'sounds/hits/pins/ComedyCrash 6115_16_4.mp3',
            autoplay: false,
            volume: 0.5,
            antiSpam: 0.05,
            positions: new THREE.Vector3(),
            distanceFade: 35,
            onPlay: (item, force, position) =>
            {
                item.positions[0].copy(position)
                const forceRemaped = remapClamp(force, 3, 10, 0, 1)
                item.volume = forceRemaped * 0.5
                item.rate = 1.2 - forceRemaped * 0.2
            }
        })

        this.sounds.rolling = this.game.audio.register({
            path: 'sounds/rolling/06290 medium ball rolling lp.mp3',
            autoplay: true,
            loop: true,
            volume: 0.5,
            rate: 0.8,
            positions: new THREE.Vector3(),
            distanceFade: 25,
            onPlaying: (item) =>
            {
                item.positions[0].copy(this.ball.position)
                item.volume = remapClamp(this.ball.speed, 0, 5, 0, 0.6)
            }
        })
    }

    setPins()
    {
        this.pins = {}
        this.pins.items = []
        this.pins.allSleeping = true
        this.pins.boundingUpdateTime = 0
        
        // References
        const references = InstancedGroup.getReferencesFromChildren(this.references.items.get('pinPositions')[0].children)

        // Instances
        const basePin = this.references.items.get('pinPhysicalDynamic')[0]
        basePin.castShadow = true
        basePin.receiveShadow = true
        basePin.position.set(0, 0, 0)
        basePin.rotation.set(0, 0, 0)

        // Update materials 
        this.game.materials.updateObject(basePin)
        
        const descriptions = this.game.objects.getFromModel(basePin, {}, {}) // To extract colliders

        let i = 0
        for(const reference of references)
        {
            const pin = {}
            pin.index = i
            pin.isDown = false
            pin.isSleeping = true
            pin.group = reference

            // Object with physics linked to reference
            pin.object = this.game.objects.add(
                {
                    model: reference,
                    updateMaterials: false,
                    parent: null,
                },
                {
                    type: 'dynamic',
                    position: reference.position,
                    rotation: reference.quaternion,
                    friction: 0.5,
                    resitution: 0.5,
                    linearDamping: 0.1,
                    angularDamping: 0.5,
                    sleeping: true,
                    colliders: descriptions[1].colliders,
                    waterGravityMultiplier: - 1,
                    mass: 0.02,
                    contactThreshold: 5,
                    onCollision: (force, position) =>
                    {
                        this.sounds.pin.play(force, position)
                    }
                },
            )

            pin.body = pin.object.physical.body
            pin.basePosition = pin.group.position.clone()
            pin.baseRotation = pin.group.quaternion.clone()

            // pin.body.setLinearDamping(0.2)
            // pin.body.setAngularDamping(0.2)

            this.pins.items.push(pin)

            i++
        }


        // this.game.objects.add(
        //     {
        //         model: basePin,
        //         parent: null
        //     },
        //     null
        // )
        // basePin.removeFromParent()

        this.pins.instancedGroup = new InstancedGroup(references, basePin)

        // Reset
        this.pins.reset = () =>
        {
            for(const pin of this.pins.items)
            {
                pin.isDown = false
                
                pin.body.setTranslation(pin.basePosition)
                pin.body.setRotation(pin.baseRotation)
                pin.body.resetForces()
                pin.body.resetTorques()
                pin.body.setLinvel({ x: 0, y: 0, z: 0 })
                pin.body.setAngvel({ x: 0, y: 0, z: 0 })
                // pin.body.setEnabled(true)
                this.game.ticker.wait(2, () =>
                {
                    pin.body.sleep()
                })
            }
        }
    }

    setBall()
    {
        const baseBall = this.references.items.get('ball')[0]

        this.ball = {}
        this.ball.isSleeping = true
        this.ball.body = baseBall.userData.object.physical.body
        this.ball.basePosition = baseBall.position.clone()
        this.ball.position = new THREE.Vector3().copy(this.ball.body.translation())
        this.ball.speed = 0
        // this.ball.basePosition.y += 1

        this.ball.reset = () =>
        {
            this.ball.body.setTranslation(this.ball.basePosition)
            this.ball.body.resetForces()
            this.ball.body.resetTorques()
            this.ball.body.setLinvel({ x: 0, y: 0, z: 0 })
            this.ball.body.setAngvel({ x: 0, y: 0, z: 0 })
            // this.ball.body.setEnabled(true)
            this.game.ticker.wait(2, () =>
            {
                this.ball.body.sleep()
            })
        }

        // Launch ball from the left with random direction
        this.ball.launch = () =>
        {
            // Wake up the ball
            this.ball.body.wakeUp()

            // Calculate launch direction (from left to right with some variation)
            const directionVariation = (Math.random() - 0.5) * this.autoPlay.ballVariation
            const launchDirection = new THREE.Vector3(1, 0, directionVariation).normalize()

            // Set velocity
            const velocity = launchDirection.multiplyScalar(this.autoPlay.ballSpeed)
            this.ball.body.setLinvel({ x: velocity.x, y: 0, z: velocity.z })

            // Add some spin
            this.ball.body.setAngvel({ x: 0, y: -5, z: directionVariation * 10 })
        }
    }

    // Randomly knock down pins
    knockDownRandomPins()
    {
        // Determine how many pins to knock down
        const pinsToKnock = Math.floor(
            Math.random() * (this.autoPlay.maxPinsToKnock - this.autoPlay.minPinsToKnock + 1)
        ) + this.autoPlay.minPinsToKnock

        // Create array of pin indices
        const pinIndices = Array.from({ length: this.pins.items.length }, (_, i) => i)

        // Shuffle and select pins to knock down
        for (let i = pinIndices.length - 1; i > 0; i--)
        {
            const j = Math.floor(Math.random() * (i + 1));
            [pinIndices[i], pinIndices[j]] = [pinIndices[j], pinIndices[i]]
        }

        const selectedPins = pinIndices.slice(0, pinsToKnock)

        // Wake up all pins
        for (const pin of this.pins.items)
        {
            pin.body.wakeUp()
        }

        // Knock down selected pins with force
        for (const pinIndex of selectedPins)
        {
            const pin = this.pins.items[pinIndex]

            // Apply random force to knock down the pin
            const forceDirection = new THREE.Vector3(
                1 + (Math.random() - 0.5) * 0.5,
                (Math.random() - 0.5) * 0.2,
                (Math.random() - 0.5) * 0.5
            ).normalize()

            const forceMagnitude = 5 + Math.random() * 10
            const force = forceDirection.multiplyScalar(forceMagnitude)

            pin.body.applyImpulse(force, { x: 0, y: 0.1, z: 0 })

            // Add angular velocity for more realistic falling
            const angularVelocity = new THREE.Vector3(
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 5,
                (Math.random() - 0.5) * 10
            )
            pin.body.setAngvel(angularVelocity)
        }
    }

    // Auto launch the ball
    autoLaunch()
    {
        if (!this.autoPlay.active)
            return

        const currentTime = this.game.ticker.elapsedScaled

        // Check if it's time to launch
        if (currentTime - this.autoPlay.lastLaunchTime >= this.autoPlay.interval)
        {
            this.autoPlay.lastLaunchTime = currentTime

            // Reset first if needed
            if (!this.pins.allSleeping || !this.ball.isSleeping)
            {
                this.pins.reset()
                this.ball.reset()
                this.screen.reset()
                this.won = false

                // Wait a bit before launching
                this.game.ticker.wait(0.5, () =>
                {
                    this.ball.launch()
                    this.knockDownRandomPins()
                })
            }
            else
            {
                // Launch immediately
                this.ball.launch()
                this.knockDownRandomPins()
            }
        }
    }

    restart()
    {
        this.won = false

        this.pins.reset()
        this.ball.reset()
        this.screen.reset()

        this.pins.instancedGroup.needsUpdate = true

        this.game.ticker.wait(1, () =>
        {
            this.restartInteractivePoint.hide()
        })

        // Sound
        const sound = this.game.audio.groups.get('click')
        if(sound)
            sound.play(true)
    }

    setRestart()
    {
        this.restartInteractivePoint = this.game.interactivePoints.create(
            this.references.items.get('restartInteractivePoint')[0].position,
            'Restart',
            InteractivePoints.ALIGN_RIGHT,
            InteractivePoints.STATE_HIDDEN,
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

    setScreen()
    {
        this.screen = {}
        this.screen.group = this.references.items.get('screen')[0]
        this.screen.object = this.screen.group.userData.object
        this.screen.x = this.screen.group.position.x
        this.screen.max = this.screen.group.position.x
        this.screen.min = this.screen.max - (28.2 - 3.81)
        this.screen.discsMesh = this.references.items.get('discs')[0]
        this.screen.crossesMesh = this.references.items.get('crosses')[0]

        const data = new Uint8Array(10)
        this.dataTexture = new THREE.DataTexture(
            data,
            10,
            1,
            THREE.RedFormat,
            THREE.UnsignedByteType,
            THREE.UVMapping,
            THREE.ClampToEdgeWrapping,
            THREE.ClampToEdgeWrapping,
            THREE.NearestFilter,
            THREE.NearestFilter
        )
        this.dataTexture.needsUpdate = true

        // Offset position according to data texture
        const offsetPosition = Fn(([threshold]) =>
        {
            const active = step(texture(this.dataTexture, uv()).r.sub(threshold).abs(), 0.1)
            
            const newPosition = positionGeometry.toVar()
            newPosition.z.subAssign(active.oneMinus().mul(0.1))
            return newPosition
        })

        // Discs material
        const discsColor = uniform(color('#ffffff'))
        const discsStrength = uniform(2)
        const discsMaterial = new THREE.MeshBasicNodeMaterial()
        discsMaterial.outputNode = vec4(discsColor.mul(discsStrength), 1)
        discsMaterial.positionNode = offsetPosition(float(0))

        // Crosses material
        const crossesColor = uniform(color('#ff2b11')) // #b6ff11
        const crossesStrength = uniform(6)
        const crossesMaterial = new THREE.MeshBasicNodeMaterial()
        crossesMaterial.outputNode = vec4(crossesColor.mul(crossesStrength), 1)
        crossesMaterial.positionNode = offsetPosition(0.5)

        // Update materials
        this.screen.discsMesh.material = discsMaterial
        this.screen.crossesMesh.material = crossesMaterial

        // Strike label
        this.screen.labelStrike = this.references.items.get('labelStrike')[0]

        {
            const material = new THREE.MeshBasicNodeMaterial()
            const labelTexture = this.screen.labelStrike.material.map
            material.outputNode = Fn(() =>
            {
                texture(labelTexture).r.lessThan(0.5).discard()
                return vec4(vec3(2), 1)
            })()
            this.screen.labelStrike.material = material
            this.screen.labelStrike.visible = false
        }

        // Reset
        this.screen.reset = () =>
        {
            for(const pin of this.pins.items)
            {
                this.dataTexture.source.data.data[pin.index] = 0
                this.dataTexture.needsUpdate = true
            }
        }

        // Debug
        if(this.game.debug.active)
        {
            const debugPanel = this.debugPanel.addFolder({
                title: 'Screen',
                expanded: false,
            })
            this.game.debug.addThreeColorBinding(debugPanel, discsColor.value, 'discsColor')
            debugPanel.addBinding(discsStrength, 'value', { label: 'discsStrength', min: 0, max: 10, step: 0.001 })
            this.game.debug.addThreeColorBinding(debugPanel, crossesColor.value, 'crossesColor')
            debugPanel.addBinding(crossesStrength, 'value', { label: 'crossesStrength', min: 0, max: 10, step: 0.001 })
        }
    }

    setBumpers()
    {
        this.bumpers = {}
        this.bumpers.mesh = this.references.items.get('bumpers')[0]
        this.bumpers.object = this.bumpers.mesh.userData.object
        this.bumpers.progress = 0
        this.bumpers.active = false
        this.bumpers.height = Math.abs(this.bumpers.mesh.position.y)

        // Body
        this.bumpers.object.physical.body.collider(0).setRestitution(1)
        this.bumpers.object.physical.body.collider(0).setFriction(0)
        this.bumpers.object.physical.body.collider(1).setRestitution(1)
        this.bumpers.object.physical.body.collider(1).setFriction(0)

        // Toggle
        this.bumpers.toggle = () =>
        {
            this.bumpers.active = !this.bumpers.active

            const progress = this.bumpers.active ? 1 : 0
            gsap.to(
                this.bumpers,
                {
                    progress: progress,
                    duration: 1,
                    overwrite: true,
                    onUpdate: () =>
                    {
                        this.bumpers.object.physical.body.setNextKinematicTranslation({
                            x: this.bumpers.mesh.position.x,
                            y: - (1 - this.bumpers.progress) * this.bumpers.height,
                            z: this.bumpers.mesh.position.z,
                        })
                        this.bumpers.object.needsUpdate = true
                    },
                }
            )

            this.game.player.sounds.suspensions.play()
        }

        // Interactive point
        this.game.interactivePoints.create(
            this.references.items.get('bumpersInteractivePoint')[0].position,
            'Bumpers',
            InteractivePoints.ALIGN_LEFT,
            InteractivePoints.STATE_CONCEALED,
            () =>
            {
                this.bumpers.toggle()
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

    setJukebox()
    {
        const count = 8

        // Notes > Base position
        const positionsArray = new Float32Array(count * 3)
        for(let i = 0; i < count; i++)
        {
            const i3 = i * 3
            positionsArray[i3 + 0] = (Math.random() - 0.5) * 1
            positionsArray[i3 + 1] = (Math.random() - 0.5) * 1
            positionsArray[i3 + 2] = (Math.random() - 0.5) * 1
        }

        const positionAttribute = new THREE.InstancedBufferAttribute(positionsArray, 3)

        // Notes > Material
        const progress = this.game.ticker.elapsedScaledUniform.mul(0.2).add(instanceIndex.toFloat().div(count)).fract().toVarying()
        const notesColor = uniform(color('#ff994d'))
        const notesStrength = uniform(3.5)

        const outputNode = Fn(() =>
        {
            const baseUv = vec2(uv().x, uv().y.oneMinus())
            const noteMask = texture(this.game.resources.jukeboxMusicNotes, baseUv).r
            return vec4(notesColor.mul(notesStrength), noteMask)
        })()

        const positionNode = Fn(() =>
        {
            const newPosition = instancedBufferAttribute(positionAttribute).toVar()

            newPosition.z.addAssign(progress.oneMinus().pow(3).oneMinus())
            newPosition.y.addAssign(progress)
            return newPosition
        })()

        const rotationNode = Fn(() =>
        {
            return sin(this.game.ticker.elapsedScaledUniform.mul(4).add(instanceIndex.toFloat())).add(1).mul(0.5).pow(2).oneMinus()
        })()
        
        const scaleNode = Fn(() =>
        {
            return progress.sub(0.5).abs().mul(2).oneMinus().mul(3).min(1)
        })()

        const material = new THREE.PointsNodeMaterial({
            outputNode: outputNode,
            // outputNode: vec4(vec3(2), 1),
            // opacityNode: float(0.2),
            positionNode: positionNode,
            rotationNode: rotationNode,
            scaleNode: scaleNode,
            // sizeNode: float(0.5),
            size: 1.5, // in pixels units
            // vertexColors: true,
            sizeAttenuation: true,
            alphaToCoverage: true,
        })

        // Notes > Mesh
        const points = new THREE.Sprite(material)
        points.count = count
        points.position.y = 1
        points.position.z = 0.5
        this.references.items.get('jukebox')[0].add(points)

        // Interactive point
        this.game.interactivePoints.create(
            this.references.items.get('jukeboxInteractivePoint')[0].position,
            'Change song',
            InteractivePoints.ALIGN_LEFT,
            InteractivePoints.STATE_CONCEALED,
            () =>
            {
                if(this.game.audio.mute.active)
                    this.game.audio.mute.deactivate()

                this.game.audio.playlist.next()
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

        // Debug
        if(this.game.debug.active)
        {
            const debugPanel = this.debugPanel.addFolder({
                title: 'Jukebox',
                expanded: false,
            })
            this.game.debug.addThreeColorBinding(debugPanel, notesColor.value, 'notesColor')
            debugPanel.addBinding(notesStrength, 'value', { label: 'notesStrength', min: 0, max: 10, step: 0.001 })
        }
    }

    setAchievement()
    {
        this.events.on('boundingIn', () =>
        {
            this.game.achievements.setProgress('areas', 'bowling')
        })
    }

    update()
    {
        // Auto launch the ball
        this.autoLaunch()

        let showRestartInteractivePoint = false
        
        // Screen position
        const targetX = clamp(this.game.player.position.x, this.screen.min, this.screen.max)
        this.screen.x += (targetX - this.screen.x) * this.game.ticker.deltaScaled * 2

        const floatY = Math.sin(this.game.ticker.elapsedScaled * 0.3) * 0.5
        this.screen.object.physical.body.setNextKinematicTranslation({
            x: this.screen.x,
            y: 0.5 + floatY,
            z: this.screen.group.position.z
        })
        this.screen.object.needsUpdate = true

        // Screen strike label
        if(this.won)
            this.screen.labelStrike.visible = (this.game.ticker.elapsedScaled - this.wonTime) % 3 < 1.5
        else
            this.screen.labelStrike.visible = false

        // Pins > Update
        this.pins.allSleeping = true
        let pinStateChanged = false
        for(const pin of this.pins.items)
        {
            const pinUp = new THREE.Vector3(0, 1, 0)
            pinUp.applyQuaternion(pin.group.quaternion)
            const isDown = pinUp.y < 0.5

            // Wasn't down but is now down
            if(isDown && pin.isDown === false)
            {
                pin.isDown = isDown

                pinStateChanged = true
                
                this.dataTexture.source.data.data[pin.index] = pin.isDown ? 128 : 0
            }

            const isSleeping = pin.body.isSleeping()
            this.pins.allSleeping = this.pins.allSleeping && isSleeping 
            if(isSleeping !== pin.isSleeping)
            {
                pin.isSleeping = isSleeping

                if(!pin.isSleeping)
                    showRestartInteractivePoint = true
            }

            if(!isSleeping)
                pin.object.visual.object3D.needsUpdate = true
        }

        // Pins > Texture update if needed and won event
        if(pinStateChanged)
        {
            this.dataTexture.needsUpdate = true

            // Haven't won since reset
            if(!this.won)
            {
                const allDown = this.pins.items.reduce((accumulator, pin) => accumulator && pin.isDown, true)
                if(allDown)
                {
                    this.won = true
                    this.wonTime = this.game.ticker.elapsedScaled

                    if(this.game.world.confetti)
                    {
                        this.game.world.confetti.pop(this.game.player.position.clone())
                        this.game.world.confetti.pop(this.screen.group.position.clone().add(new THREE.Vector3(- 1, - 1, 0)))
                        this.game.world.confetti.pop(this.screen.group.position.clone().add(new THREE.Vector3(- 3.4, - 1, 0)))
                    }

                    this.game.achievements.sounds.achieve.play()

                    this.game.achievements.setProgress('strike', 1)
                }
            }
        }

        // Pins > Update bounding at a fixed rate
        if(this.game.ticker.elapsed > this.pins.boundingUpdateTime + 0.2)
        {
            this.pins.boundingUpdateTime = this.game.ticker.elapsed

            if(!this.pins.allSleeping)
                this.pins.instancedGroup.updateBoundings()
        }

        // Ball
        const ballIsSleeping = this.ball.body.isSleeping()
        if(ballIsSleeping !== this.ball.isSleeping)
        {
            this.ball.isSleeping = ballIsSleeping

            if(!this.ball.isSleeping)
                showRestartInteractivePoint = true
        }
        if(!ballIsSleeping)
        {
            const ballPosition = new THREE.Vector3().copy(this.ball.body.translation())
            const delta = ballPosition.clone().sub(this.ball.position)
            
            this.ball.position.copy(ballPosition)
            this.ball.speed = delta.length() / this.game.ticker.delta
        }
        else
        {
            this.ball.speed = 0
        }

        // Restart interactive point
        if(showRestartInteractivePoint && this.restartInteractivePoint.state === InteractivePoints.STATE_HIDDEN)
            this.restartInteractivePoint.show()

    }
}