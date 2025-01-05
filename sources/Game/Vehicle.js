import * as THREE from 'three/webgpu'
import { Game } from './Game.js'
import { Events } from './Events.js'
import { remapClamp } from './utilities/maths.js'

export class Vehicle
{
    constructor()
    {
        this.game = Game.getInstance()
        
        if(this.game.debug.active)
        {
            this.debugPanel = this.game.debug.panel.addFolder({
                title: '🚗 Vehicle',
                expanded: false,
            })

            this.chassisDebugPanel = this.debugPanel.addFolder({
                title: '🎨 Chassis',
                expanded: false,
            })

            this.headlightsDebugPanel = this.debugPanel.addFolder({
                title: '💡 Headlights',
                expanded: false,
            })
        }

        this.events = new Events()
        this.sideward = new THREE.Vector3(0, 0, 1)
        this.upward = new THREE.Vector3(0, 1, 0)
        this.forward = new THREE.Vector3(1, 0, 0)
        this.position = new THREE.Vector3()
        this.direction = this.forward.clone()
        this.goingForward = false
        this.speed = 0
        this.absoluteSpeed = 0
        this.upsideDownRatio = 0

        this.game.materials.createGradient('carRed', '#ff3a3a', '#721551', this.chassisDebugPanel)
        this.game.materials.createEmissive('emissiveWarnWhite', '#ff8641', 3, this.headlightsDebugPanel)
        this.game.materials.createEmissive('emissiveRed', '#ff3131', 3, this.headlightsDebugPanel)

        this.setParts()
        this.setChassis()
        this.controller = this.game.physics.world.createVehicleController(this.chassis.physical.body)
        this.setWheels()
        this.setStop()
        this.setFlip()
        this.setInWater()
        this.setUnstuck()
        this.setReset()
        this.setHydraulics()
        this.setBlinkers()
        this.setAntenna()

        this.game.time.events.on('tick', () =>
        {
            this.updatePrePhysics()
        }, 1)
        this.game.time.events.on('tick', () =>
        {
            this.updatePostPhysics()
        }, 5)
    }

    setParts()
    {
        this.parts = {}

        // Chassis
        this.parts.chassis = this.game.resources.vehicle.scene.getObjectByName('chassis')
        this.parts.chassis.rotation.reorder('YXZ')
        this.parts.chassis.traverse((child) =>
        {
            if(child.isMesh)
            {
                child.receiveShadow = true
                child.castShadow = true
                child.material.shadowSide = THREE.BackSide
            }
        })
        this.game.materials.updateObject(this.parts.chassis)

        // Blinker left
        this.parts.blinkerLeft = this.parts.chassis.getObjectByName('blinkerLeft')

        // Blinker right
        this.parts.blinkerRight = this.parts.chassis.getObjectByName('blinkerRight')

        // Stop lights
        this.parts.stopLights = this.parts.chassis.getObjectByName('stopLights')
        this.parts.stopLights.visible = false

        // Wheel
        this.parts.wheel = this.game.resources.vehicle.scene.getObjectByName('wheel')
        this.parts.wheel.traverse((child) =>
        {
            if(child.isMesh)
            {
                child.receiveShadow = true
                child.castShadow = true
                child.material.shadowSide = THREE.BackSide
            }
        })
        this.game.materials.updateObject(this.parts.wheel)
    }

    setChassis()
    {
        this.chassis = this.game.entities.add(
            {
                type: 'dynamic',
                position: { x: 0, y: 5, z: 0 },
                friction: 0.4,
                rotation: new THREE.Quaternion().setFromAxisAngle(new THREE.Euler(0, 1, 0), - Math.PI * 0),
                // rotation: new THREE.Quaternion().setFromAxisAngle(new THREE.Euler(0, 0, 1), - Math.PI * 0.5),
                colliders: [
                    { shape: 'cuboid', parameters: [ 1.5, 0.4, 0.85 ], position: { x: 0, y: - 0.125, z: 0 } },
                    { shape: 'cuboid', parameters: [ 0.5, 0.15, 0.65 ], position: { x: 0, y: 0.4, z: 0 } },
                ],
                canSleep: false,
            },
            this.parts.chassis
        )
    }

    setWheels()
    {
        // Setup
        this.wheels = {}
        this.wheels.items = []
        this.wheels.engineForce = 0
        this.wheels.engineForceMax = 700
        this.wheels.engineBoostMultiplier = 2.5
        this.wheels.steering = 0
        this.wheels.steeringMax = 0.5
        this.wheels.visualSteering = 0
        this.wheels.inContact = 0
        this.wheels.brakeStrength = 42
        this.wheels.idleBrakeStrength = 15
        this.wheels.maxSpeed = 5
        this.wheels.maxSpeedBoost = 12

        // Geometry
        const wheelGeometry = new THREE.CylinderGeometry(1, 1, 0.5, 8)
        wheelGeometry.rotateX(Math.PI * 0.5)

        // Create wheels
        for(let i = 0; i < 4; i++)
        {
            const wheel = {}

            // Default wheel with random parameters
            this.controller.addWheel(new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), 1, 1)

            // Visual
            wheel.visual = new THREE.Group()
            this.chassis.visual.add(wheel.visual)

            const actualWheel = this.parts.wheel.clone(true)
            wheel.visual.add(actualWheel)
            actualWheel.position.set(0, 0, 0)
            
            if(i === 0 || i === 2)
                actualWheel.rotation.y = Math.PI

            // Add track to ground data
            wheel.track = this.game.groundData.createTrack()

            // Base position
            wheel.basePosition = new THREE.Vector3()

            this.wheels.items.push(wheel)
        }

        // Settings
        this.wheels.settings = {
            offset: { x: 0.90, y: - 0.5, z: 0.75 },
            radius: 0.5,
            directionCs: { x: 0, y: -1, z: 0 },
            axleCs: { x: 0, y: 0, z: 1 },
            frictionSlip: 0.9,
            maxSuspensionForce: 100,
            maxSuspensionTravel: 2,
            sideFrictionStiffness: 3,
            suspensionCompression: 10,
            suspensionRelaxation: 1.88,
            suspensionStiffness: 30,
        }

        this.wheels.updateSettings = () =>
        {
            this.wheels.perimeter = this.wheels.settings.radius * Math.PI * 2

            const wheelsPositions = [
                new THREE.Vector3(  this.wheels.settings.offset.x, this.wheels.settings.offset.y,   this.wheels.settings.offset.z),
                new THREE.Vector3(  this.wheels.settings.offset.x, this.wheels.settings.offset.y, - this.wheels.settings.offset.z),
                new THREE.Vector3(- this.wheels.settings.offset.x, this.wheels.settings.offset.y,   this.wheels.settings.offset.z),
                new THREE.Vector3(- this.wheels.settings.offset.x, this.wheels.settings.offset.y, - this.wheels.settings.offset.z),
            ]
            
            let i = 0
            for(const wheel of this.wheels.items)
            {
                wheel.basePosition.copy(wheelsPositions[i])
                
                this.controller.setWheelDirectionCs(i, this.wheels.settings.directionCs)
                this.controller.setWheelAxleCs(i, this.wheels.settings.axleCs)
                this.controller.setWheelRadius(i, this.wheels.settings.radius)
                this.controller.setWheelChassisConnectionPointCs(i, wheel.basePosition)
                this.controller.setWheelFrictionSlip(i, this.wheels.settings.frictionSlip)
                this.controller.setWheelMaxSuspensionForce(i, this.wheels.settings.maxSuspensionForce)
                this.controller.setWheelMaxSuspensionTravel(i, this.wheels.settings.maxSuspensionTravel)
                this.controller.setWheelSideFrictionStiffness(i, this.wheels.settings.sideFrictionStiffness)
                this.controller.setWheelSuspensionCompression(i, this.wheels.settings.suspensionCompression)
                this.controller.setWheelSuspensionRelaxation(i, this.wheels.settings.suspensionRelaxation)
                this.controller.setWheelSuspensionStiffness(i, this.wheels.settings.suspensionStiffness)

                // wheel.visual.scale.set(this.wheels.settings.radius, this.wheels.settings.radius, 1)
                wheel.visual.position.copy(wheel.basePosition)

                i++
            }
        }

        this.wheels.updateSettings()

        // Debug
        if(this.game.debug.active)
        {
            const debugPanel = this.debugPanel.addFolder({
                title: '🛞 Wheels',
                expanded: false,
            })

            debugPanel.addBinding(this.wheels.settings, 'offset', { min: -1, max: 2, step: 0.01 }).on('change', this.wheels.updateSettings)
            debugPanel.addBinding(this.wheels.settings, 'radius', { min: 0, max: 1, step: 0.01 }).on('change', this.wheels.updateSettings)
            debugPanel.addBinding(this.wheels.settings, 'frictionSlip', { min: 0, max: 1, step: 0.01 }).on('change', this.wheels.updateSettings)
            debugPanel.addBinding(this.wheels.settings, 'maxSuspensionForce', { min: 0, max: 1000, step: 1 }).on('change', this.wheels.updateSettings)
            debugPanel.addBinding(this.wheels.settings, 'maxSuspensionTravel', { min: 0, max: 2, step: 0.01 }).on('change', this.wheels.updateSettings)
            debugPanel.addBinding(this.wheels.settings, 'sideFrictionStiffness', { min: 0, max: 10, step: 0.01 }).on('change', this.wheels.updateSettings)
            debugPanel.addBinding(this.wheels.settings, 'suspensionCompression', { min: 0, max: 30, step: 0.01 }).on('change', this.wheels.updateSettings)
            debugPanel.addBinding(this.wheels.settings, 'suspensionRelaxation', { min: 0, max: 10, step: 0.01 }).on('change', this.wheels.updateSettings)
            debugPanel.addBinding(this.wheels.settings, 'suspensionStiffness', { min: 0, max: 100, step: 0.1 }).on('change', this.wheels.updateSettings)
            
            debugPanel.addBinding(this.wheels, 'steeringMax', { min: 0, max: Math.PI * 0.5, step: 0.01 })
            debugPanel.addBinding(this.wheels, 'brakeStrength', { min: 0, max: 1, step: 0.01 })
            debugPanel.addBinding(this.wheels, 'idleBrakeStrength', { min: 0, max: 0.2, step: 0.01 })
            debugPanel.addBinding(this.wheels, 'engineForceMax', { min: 0, max: 2000, step: 0.01 })
            debugPanel.addBinding(this.wheels, 'engineBoostMultiplier', { min: 0, max: 5, step: 0.01 })
            debugPanel.addBinding(this.wheels, 'maxSpeed', { min: 1, max: 40, step: 0.01 })
            debugPanel.addBinding(this.wheels, 'maxSpeedBoost', { min: 1, max: 40, step: 0.01 })
        }
    }

    setStop()
    {
        this.stop = {}
        this.stop.active = true
        this.stop.lowEdge = 0.04
        this.stop.highEdge = 0.7
        
        this.stop.activate = () =>
        {
            if(this.stop.active)
                return

            this.stop.active = true
            this.events.trigger('stop')
        }
        
        this.stop.deactivate = () =>
        {
            if(!this.stop.active)
                return
                
            this.stop.active = false
            this.events.trigger('start')
        }
    }

    setFlip()
    {
        this.flip = {}
        this.flip.active = false
        this.flip.edge = 0.3
        
        this.flip.activate = () =>
        {
            if(this.flip.active)
                return
                
            this.flip.active = true
            this.events.trigger('flip')
        }
        
        this.flip.deactivate = () =>
        {
            if(!this.flip.active)
                return
                
            this.flip.active = false
            this.events.trigger('unflip')
        }
    }

    setInWater()
    {
        this.inWater = {}
        this.inWater.active = false
        this.inWater.threshold = 0
        
        this.inWater.activate = () =>
        {
            if(this.inWater.active)
                return

            this.inWater.active = true
            this.events.trigger('inWater')
        }
        
        this.inWater.deactivate = () =>
        {
            if(!this.inWater.active)
                return
                
            this.inWater.active = false
            this.events.trigger('outWater')
        }
    }

    setUnstuck()
    {
        this.unstuck = {}
        this.unstuck.duration = 0.5
        this.unstuck.timeout = null
        this.unstuck.force = 6

        this.unstuck.test = () =>
        {
            if(this.flip.active && this.stop.active)
            {
                clearTimeout(this.unstuck.timeout)
                this.unstuck.timeout = setTimeout(() =>
                {
                    if(this.flip.active && this.stop.active)
                        this.unstuck.activate()
                }, this.unstuck.duration * 1000)
            }
        }

        this.unstuck.activate = () =>
        {
            const up = new THREE.Vector3(0, 1, 0)
            const sidewardDot = up.dot(this.sideward)
            const forwardDot = up.dot(this.forward)
            const upwarddDot = up.dot(this.upward)
            
            const sidewardAbsolute = Math.abs(sidewardDot)
            const forwardAbsolute = Math.abs(forwardDot)
            const upwarddAbsolute = Math.abs(upwarddDot)

            const impulse = new THREE.Vector3(0, 1, 0).multiplyScalar(this.unstuck.force * this.chassis.physical.body.mass())
            this.chassis.physical.body.applyImpulse(impulse)

            // Upside down
            if(upwarddAbsolute > sidewardAbsolute && upwarddAbsolute > forwardAbsolute)
            {
                const torqueX = 0.8 * this.chassis.physical.body.mass()
                const torque = new THREE.Vector3(torqueX, 0, 0)
                torque.applyQuaternion(this.chassis.physical.body.rotation())
                this.chassis.physical.body.applyTorqueImpulse(torque)
            }
            // On the side
            else
            {
                const torqueX = sidewardDot * 0.4 * this.chassis.physical.body.mass()
                const torqueZ = - forwardDot * 0.8 * this.chassis.physical.body.mass()
                const torque = new THREE.Vector3(torqueX, 0, torqueZ)
                torque.applyQuaternion(this.chassis.physical.body.rotation())
                this.chassis.physical.body.applyTorqueImpulse(torque)
            }
        }

        this.events.on('flip', () =>
        {
            this.unstuck.test()
        })

        this.events.on('stop', () =>
        {
            this.unstuck.test()
        })

        if(this.game.debug.active)
        {
            const debugPanel = this.debugPanel.addFolder({
                title: '🔄 Unstuck',
                expanded: false,
            })

            debugPanel.addBinding(this.unstuck, 'force', { min: 0, max: 20, step: 0.01 })
        }
    }

    setReset()
    {
        this.reset = {}
        this.reset.activate = () =>
        {
            this.chassis.physical.body.setTranslation({ x: 2, y: 4, z: 2 })
            this.chassis.physical.body.setRotation({ w: 1, x: 0, y: 0, z: 0 })
            this.chassis.physical.body.setLinvel({ x: 0, y: 0, z: 0 })
            this.chassis.physical.body.setAngvel({ x: 0, y: 0, z: 0 })
        }

        this.game.inputs.events.on('reset', (_event) =>
        {
            if(_event.down)
                this.reset.activate()
        })
    }

    setHydraulics()
    {
        this.hydraulics = {}
        this.hydraulics.low = 0.125
        this.hydraulics.mid = 0.45
        this.hydraulics.high = 1

        for(let i = 0; i < 4; i++)
            this.controller.setWheelSuspensionRestLength(i, this.hydraulics.low)

        this.hydraulics.update = (_event) =>
        {
            const activeHydraulics = [
                this.game.inputs.keys.hydraulics || this.game.inputs.keys.hydraulicsFront || this.game.inputs.keys.hydraulicsRight || this.game.inputs.keys.hydraulicsFrontRight, // front right
                this.game.inputs.keys.hydraulics || this.game.inputs.keys.hydraulicsFront || this.game.inputs.keys.hydraulicsLeft || this.game.inputs.keys.hydraulicsFrontLeft, // front left
                this.game.inputs.keys.hydraulics || this.game.inputs.keys.hydraulicsBack || this.game.inputs.keys.hydraulicsRight || this.game.inputs.keys.hydraulicsBackRight, // back right
                this.game.inputs.keys.hydraulics || this.game.inputs.keys.hydraulicsBack || this.game.inputs.keys.hydraulicsLeft || this.game.inputs.keys.hydraulicsBackLeft, // back left
            ]

            const restLength = this.game.inputs.keys.hydraulics ? this.hydraulics.high : this.hydraulics.mid
            
            for(let i = 0; i < 4; i++)
                this.controller.setWheelSuspensionRestLength(i, activeHydraulics[i] ? restLength : this.hydraulics.low)

            // Jump
            if(_event.down && _event.name === 'hydraulics' && this.wheels.inContact >= 1 && (this.game.inputs.keys.left || this.game.inputs.keys.right))
            {
                // Torque
                let torqueY = 0
                if(this.game.inputs.keys.left)
                    torqueY = 4 * (this.speed > - 0.1 ? 1 : - 1)
                else if(this.game.inputs.keys.right)
                    torqueY = -4 * (this.speed > - 0.1 ? 1 : - 1)

                const torque = new THREE.Vector3(0, torqueY, 0)
                torque.applyQuaternion(this.chassis.physical.body.rotation())

                this.chassis.physical.body.applyTorqueImpulse(torque)
            }
        }

        this.game.inputs.events.on('hydraulics', this.hydraulics.update)
        this.game.inputs.events.on('hydraulicsFront', this.hydraulics.update)
        this.game.inputs.events.on('hydraulicsBack', this.hydraulics.update)
        this.game.inputs.events.on('hydraulicsRight', this.hydraulics.update)
        this.game.inputs.events.on('hydraulicsLeft', this.hydraulics.update)
        this.game.inputs.events.on('hydraulicsFrontLeft', this.hydraulics.update)
        this.game.inputs.events.on('hydraulicsFrontRight', this.hydraulics.update)
        this.game.inputs.events.on('hydraulicsBackRight', this.hydraulics.update)
        this.game.inputs.events.on('hydraulicsBackLeft', this.hydraulics.update)

        // Debug
        if(this.game.debug.active)
        {
            const debugPanel = this.debugPanel.addFolder({
                title: '⬆️ Hydraulics',
                expanded: false,
            })

            debugPanel.addBinding(this.hydraulics, 'low', { min: 0, max: 2, step: 0.01 }).on('change', this.hydraulics.update)
            debugPanel.addBinding(this.hydraulics, 'mid', { min: 0, max: 2, step: 0.01 }).on('change', this.hydraulics.update)
            debugPanel.addBinding(this.hydraulics, 'high', { min: 0, max: 2, step: 0.01 }).on('change', this.hydraulics.update)
        }
    }

    setBlinkers()
    {
        setInterval(() =>
        {
            if(this.game.inputs.keys.left)
                this.parts.blinkerLeft.visible = !this.parts.blinkerLeft.visible

            if(this.game.inputs.keys.right)
                this.parts.blinkerRight.visible = !this.parts.blinkerRight.visible
        }, 400)

        this.game.inputs.events.on('left', (event) =>
        {
            if(!event.down)
                this.parts.blinkerLeft.visible = true
        })

        this.game.inputs.events.on('right', (event) =>
        {
            if(!event.down)
                this.parts.blinkerRight.visible = true
        })
    }

    setAntenna()
    {
        const object = this.parts.chassis.getObjectByName('antenna')

        if(!object)
            return

        this.antenna = {}
        this.antenna.target = new THREE.Vector3(0, 2, 0)
        this.antenna.target = new THREE.Vector3(0, 2, 0)
        this.antenna.object = object
        this.antenna.head = this.game.resources.vehicle.scene.getObjectByName('antennaHead')
        this.antenna.headAxle = this.antenna.head.children[0]
        this.antenna.headReference = this.antenna.object.getObjectByName('antennaHeadReference')

        this.game.materials.updateObject(this.antenna.head)
        this.game.scene.add(this.antenna.head)
    }

    updatePrePhysics()
    {
        let reverseBrake = false
        this.wheels.engineForce = 0

        // Forward
        if(this.game.inputs.keys.forward)
        {
            if(!this.goingForward && this.absoluteSpeed > 3)
                reverseBrake = true

            this.wheels.engineForce += this.wheels.engineForceMax
        }

        // Backward
        if(this.game.inputs.keys.backward)
        {
            if(this.goingForward && this.absoluteSpeed > 3)
                reverseBrake = true
                
            this.wheels.engineForce -= this.wheels.engineForceMax
        }

        if(this.game.inputs.keys.boost)
            this.wheels.engineForce *= this.wheels.engineBoostMultiplier

        this.wheels.steering = 0
        if(this.game.inputs.keys.right)
            this.wheels.steering -= this.wheels.steeringMax
        if(this.game.inputs.keys.left)
            this.wheels.steering += this.wheels.steeringMax
        this.controller.setWheelSteering(0, this.wheels.steering)
        this.controller.setWheelSteering(1, this.wheels.steering)

        let brake = 0

        if(
            !this.game.inputs.keys.forward &&
            !this.game.inputs.keys.backward
        )
            brake = this.wheels.idleBrakeStrength

        if(this.game.inputs.keys.brake || reverseBrake)
        {
            this.wheels.engineForce = 0
            brake = this.wheels.brakeStrength
            this.parts.stopLights.visible = true
        }
        else
        {
            this.parts.stopLights.visible = false
        }

        const maxSpeed = this.game.inputs.keys.boost ? this.wheels.maxSpeedBoost : this.wheels.maxSpeed
        const overflowSpeed = Math.max(0, this.absoluteSpeed - maxSpeed)
        this.wheels.engineForce /= (1 + overflowSpeed)

        for(let i = 0; i < 4; i++)
        {
            this.controller.setWheelBrake(i, brake * 0.2 * this.game.time.deltaScaled)
            this.controller.setWheelEngineForce(i, this.wheels.engineForce * 0.01)
        }

        // Water controls
        if(this.inWater.active && this.wheels.inContact <= 1)
        {
            // Forward / background impulse
            const waterImpulse = new THREE.Vector3(0, 0, 0)

            if(this.game.inputs.keys.forward)
                waterImpulse.add(this.forward)

            if(this.game.inputs.keys.backward)
                waterImpulse.sub(this.forward)

            waterImpulse.multiplyScalar(this.chassis.physical.body.mass() * 0.02)
            this.chassis.physical.body.applyImpulse(waterImpulse)

            // Left / right torque
            let torqueY = 0
            if(this.game.inputs.keys.left)
                torqueY = 0.02
            else if(this.game.inputs.keys.right)
                torqueY = -0.02

            if(this.upsideDownRatio > 0.5)
                torqueY *= -1

            const torque = new THREE.Vector3(0, torqueY, 0)
            torque.applyQuaternion(this.chassis.physical.body.rotation())

            this.chassis.physical.body.applyTorqueImpulse(torque)
        }
    }

    updatePostPhysics()
    {
        // Various measures
        const newPosition = new THREE.Vector3().copy(this.chassis.physical.body.translation())
        this.direction = newPosition.clone().sub(this.position).normalize()
        this.position.copy(newPosition)
        this.sideward.set(0, 0, 1).applyQuaternion(this.chassis.physical.body.rotation())
        this.upward.set(0, 1, 0).applyQuaternion(this.chassis.physical.body.rotation())
        this.forward.set(1, 0, 0).applyQuaternion(this.chassis.physical.body.rotation())
        this.speed = this.controller.currentVehicleSpeed()
        this.absoluteSpeed = Math.abs(this.speed)
        this.upsideDownRatio = this.upward.dot(new THREE.Vector3(0, - 1, 0)) * 0.5 + 0.5
        this.goingForward = this.direction.dot(this.forward) > 0.5

        // Reset on fall
        if(this.position.y < -10)
            this.reset.activate()

        // Stop
        if(this.absoluteSpeed < this.stop.lowEdge)
            this.stop.activate()
        else if(this.absoluteSpeed > this.stop.highEdge)
            this.stop.deactivate()

        // Flip
        if(this.upsideDownRatio > this.flip.edge)
            this.flip.activate()
        else
            this.flip.deactivate()

        // In water
        if(this.position.y < this.inWater.threshold)
            this.inWater.activate()
        else
            this.inWater.deactivate()
        
        // Wheels
        this.wheels.visualSteering += (this.wheels.steering - this.wheels.visualSteering) * this.game.time.deltaScaled * 16

        this.wheels.inContact = 0

        for(let i = 0; i < 4; i++)
        {
            const wheel = this.wheels.items[i]

            if(!this.game.inputs.keys.brake || this.game.inputs.keys.forward || this.game.inputs.keys.backward)
            {
                if(!this.stop.active)
                    wheel.visual.rotation.z -= (this.speed * this.game.time.deltaScaled) / this.wheels.settings.radius
            }

            if(i === 0 || i === 1)
                wheel.visual.rotation.y = this.wheels.visualSteering

            const suspensionY = wheel.basePosition.y - this.controller.wheelSuspensionLength(i)
            wheel.visual.position.y += (suspensionY - wheel.visual.position.y) * 25 * this.game.time.deltaScaled

            const inContact = this.controller.wheelIsInContact(i)
            if(inContact)
                this.wheels.inContact++

            // Tracks
            wheel.track.update(this.controller.wheelContactPoint(i), inContact)
        }

        // View
        this.game.view.focusPoint.trackedPosition.copy(this.position)

        if(this.game.inputs.keys.boost && (this.game.inputs.keys.forward || this.game.inputs.keys.backward) && this.absoluteSpeed > 5)
            this.game.view.speedLines.strength = 1
        else
            this.game.view.speedLines.strength = 0

        this.game.view.speedLines.worldTarget.copy(this.position)

        // Ground data focus point
        this.game.groundData.focusPoint.set(this.game.vehicle.position.x, this.game.vehicle.position.z)

        // Antenna
        if(this.antenna)
        {
            const angle = Math.atan2(this.antenna.target.x - this.position.x, this.antenna.target.z - this.position.z)
            this.antenna.object.rotation.y = angle - this.parts.chassis.rotation.y
            this.antenna.headReference.getWorldPosition(this.antenna.head.position)
            this.antenna.head.lookAt(this.antenna.target)

            const antennaTargetDistance = this.antenna.target.distanceTo(this.position)
            
            const antennaRotationSpeed = remapClamp(antennaTargetDistance, 50, 5, 1, 10)
            this.antenna.headAxle.rotation.z += this.game.time.deltaScaled * antennaRotationSpeed
        }
    }
}