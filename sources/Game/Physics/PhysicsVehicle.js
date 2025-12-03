import * as THREE from 'three/webgpu'
import { Game } from '../Game.js'
import { Events } from '../Events.js'
import { lerp, remap, remapClamp, smallestAngle } from '../utilities/maths.js'

export class PhysicsVehicle
{
    constructor()
    {
        this.game = Game.getInstance()

        this.events = new Events()

        this.steeringAmplitude = 0.5
        this.engineForceAmplitude = 300
        this.boostMultiplier = 2
        this.topSpeed = 5
        this.topSpeedBoost = 40
        this.brakeAmplitude = 35
        this.idleBrake = 0.06
        this.reverseBrake = 0.4
        this.flipForce = 5

        this.sideward = new THREE.Vector3(0, 0, 1)
        this.upward = new THREE.Vector3(0, 1, 0)
        this.forward = new THREE.Vector3(1, 0, 0)
        this.position = new THREE.Vector3(0, 4, 0)
        this.quaternion = new THREE.Quaternion()
        this.velocity = new THREE.Vector3()
        this.direction = this.forward.clone()
        this.speed = 0
        this.suspensionsHeights = {
            low: 0.88,
            mid: 1.23,
            high: 1.63
        }
        this.suspensionsStiffness = {
            low: 20,
            mid: 30,
            high: 40
        }

        // Debug
        if(this.game.debug.active)
        {
            this.debugPanel = this.game.physics.debugPanel.addFolder({
                title: 'Vehicle',
                expanded: true,
            })

            this.debugPanel.addBinding(this, 'steeringAmplitude', { min: 0, max: Math.PI * 0.5, step: 0.01 })
            this.debugPanel.addBinding(this, 'engineForceAmplitude', { min: 1, max: 20, step: 1 })
            this.debugPanel.addBinding(this, 'boostMultiplier', { min: 1, max: 5, step: 0.01 })
            this.debugPanel.addBinding(this, 'topSpeed', { min: 0, max: 20, step: 0.1 })
            this.debugPanel.addBinding(this, 'topSpeedBoost', { min: 0, max: 20, step: 0.1 })
            this.debugPanel.addBinding(this, 'brakeAmplitude', { min: 0, max: 200, step: 0.01 })
            this.debugPanel.addBinding(this, 'idleBrake', { min: 0, max: 1, step: 0.001 })
            this.debugPanel.addBinding(this, 'reverseBrake', { min: 0, max: 1, step: 0.001 })
            this.debugPanel.addBinding(this, 'flipForce', { min: 0, max: 10, step: 0.01 })

            this.debugPanel.addBinding(this.suspensionsHeights, 'low', { min: 0, max: 2, step: 0.01 })
            this.debugPanel.addBinding(this.suspensionsHeights, 'mid', { min: 0, max: 2, step: 0.01 })
            this.debugPanel.addBinding(this.suspensionsHeights, 'high', { min: 0, max: 2, step: 0.01 })

            this.debugPanel.addBinding(this.suspensionsStiffness, 'low', { min: 0, max: 100, step: 0.1 })
            this.debugPanel.addBinding(this.suspensionsStiffness, 'mid', { min: 0, max: 100, step: 0.1 })
            this.debugPanel.addBinding(this.suspensionsStiffness, 'high', { min: 0, max: 100, step: 0.1 })
        }

        this.setChassis()
        this.controller = this.game.physics.world.createVehicleController(this.chassis.physical.body)
        this.setWheels()
        this.setStop()
        this.setUpsideDown()
        this.setStuck()
        // this.setBackWheel()
        this.setFlip()

        this.game.ticker.events.on('tick', () =>
        {
            this.updatePrePhysics()
        }, 2)
        this.game.ticker.events.on('tick', () =>
        {
            this.updatePostPhysics()
        }, 5)
    }

    setChassis()
    {
        this.chassis = {}
        const object = this.game.objects.add(null, {
            type: 'dynamic',
            position: this.position,
            friction: 0.4,
            rotation: new THREE.Quaternion().setFromAxisAngle(new THREE.Euler(0, 1, 0), Math.PI * 0),
            colliders: [
                { shape: 'cuboid', mass: 2.5, parameters: [ 1.3, 0.4, 0.85 ], position: { x: 0, y: -0.1, z: 0 }, centerOfMass: { x: 0, y: -0.5, z: 0 } }, // Main
                { shape: 'cuboid', mass: 0, parameters: [ 0.5, 0.15, 0.65 ], position: { x: 0, y: 0.4, z: 0 } }, // Top
                { shape: 'cuboid', mass: 0, parameters: [ 1.5, 0.5, 0.9 ], position: { x: 0.1, y: -0.2, z: 0 }, category: 'bumper' }, // Bumper
            ],
            canSleep: false,
            waterGravityMultiplier: 0,
            onCollision: (force, position) =>
            {
                this.game.audio.groups.get('hitDefault').playRandomNext(force, position)
            }
        })
        this.chassis.physical = object.physical
        this.chassis.mass = this.chassis.physical.body.mass()
    }

    setWheels()
    {
        // Setup
        this.wheels = {}
        this.wheels.inContactCount = 0
        this.wheels.justTouchedCount = 0
        this.wheels.items = []

        // Create wheels
        for(let i = 0; i < 4; i++)
        {
            const wheel = {}

            wheel.inContact = false
            wheel.contactPoint = null
            wheel.suspensionLength = null
            wheel.suspensionState = 'low'
            wheel.lastTouchTime = this.game.ticker.elapsed

            // Default wheel with random parameters
            this.controller.addWheel(new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), 1, 1)

            // Base position
            wheel.basePosition = new THREE.Vector3()

            this.wheels.items.push(wheel)
        }

        // Settings
        this.wheels.settings = {
            offset: { x: 0.90, y: 0, z: 0.75 },
            radius: 0.4,
            directionCs: { x: 0, y: -1, z: 0 },
            axleCs: { x: 0, y: 0, z: 1 },
            frictionSlip: 0.9,
            maxSuspensionForce: 150,
            maxSuspensionTravel: 2,
            sideFrictionStiffness: 3,
            suspensionCompression: 10,
            suspensionRelaxation: 2.7,
            suspensionStiffness: 25,
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

                i++
            }
        }

        this.wheels.updateSettings()

        // Debug
        if(this.game.debug.active)
        {
            this.debugPanel.addBlade({ view: 'separator' })
            this.debugPanel.addBinding(this.wheels.settings, 'offset', { min: -1, max: 2, step: 0.01 }).on('change', this.wheels.updateSettings)
            this.debugPanel.addBinding(this.wheels.settings, 'radius', { min: 0, max: 1, step: 0.01 }).on('change', this.wheels.updateSettings)
            this.debugPanel.addBinding(this.wheels.settings, 'frictionSlip', { min: 0, max: 1, step: 0.01 }).on('change', this.wheels.updateSettings)
            this.debugPanel.addBinding(this.wheels.settings, 'maxSuspensionForce', { min: 0, max: 1000, step: 1 }).on('change', this.wheels.updateSettings)
            this.debugPanel.addBinding(this.wheels.settings, 'maxSuspensionTravel', { min: 0, max: 2, step: 0.01 }).on('change', this.wheels.updateSettings)
            this.debugPanel.addBinding(this.wheels.settings, 'sideFrictionStiffness', { min: 0, max: 10, step: 0.01 }).on('change', this.wheels.updateSettings)
            this.debugPanel.addBinding(this.wheels.settings, 'suspensionCompression', { min: 0, max: 30, step: 0.01 }).on('change', this.wheels.updateSettings)
            this.debugPanel.addBinding(this.wheels.settings, 'suspensionRelaxation', { min: 0, max: 10, step: 0.01 }).on('change', this.wheels.updateSettings)
            this.debugPanel.addBinding(this.wheels.settings, 'suspensionStiffness', { min: 0, max: 100, step: 0.1 }).on('change', this.wheels.updateSettings)
        }
    }

    setStop()
    {
        this.stop = {}
        this.stop.active = true
        this.stop.lowThreshold = 0.04
        this.stop.highThreshold = 0.7

        this.stop.test = () =>
        {

            if(this.speed < this.stop.lowThreshold)
            {
                if(!this.stop.active)
                {
                    this.stop.active = true
                    this.events.trigger('stop')
                }
            }
            else if(this.speed > this.stop.highThreshold)
            {
                if(this.stop.active)
                {
                    this.stop.active = false
                    this.events.trigger('start')
                }
            }
        }
    }

    setUpsideDown()
    {
        this.upsideDown = {}
        this.upsideDown.active = false
        this.upsideDown.ratio = 0
        this.upsideDown.threshold = 0.3

        this.upsideDown.test = () =>
        {
            this.upsideDown.ratio = this.upward.dot(new THREE.Vector3(0, - 1, 0)) * 0.5 + 0.5

            if(this.upsideDown.ratio > this.upsideDown.threshold)
            {
                if(!this.upsideDown.active)
                {
                    this.upsideDown.active = true
                    this.events.trigger('upsideDown', [ this.upsideDown.ratio ])
                }
            }
            else
            {
                if(this.upsideDown.active)
                {
                    this.upsideDown.active = false
                    this.events.trigger('rightSideUp')
                }
            }
        }
    }

    setStuck()
    {
        this.stuck = {}
        this.stuck.durationTest = 3
        this.stuck.durationSaved = 0
        this.stuck.savedItems = []
        this.stuck.distance = 0
        this.stuck.distanceThreshold = 0.5
        this.stuck.active = false

        this.stuck.accumulate = (traveled, time) =>
        {
            this.stuck.savedItems.unshift([traveled, time])
            this.stuck.distance = 0
            this.stuck.durationSaved = 0

            for(let i = 0; i < this.stuck.savedItems.length; i++)
            {
                const item = this.stuck.savedItems[i]

                if(this.stuck.durationSaved >= this.stuck.durationTest)
                {
                    this.stuck.savedItems.splice(i)
                    break
                }
                else
                {
                    this.stuck.distance += item[0]
                    this.stuck.durationSaved += item[1]
                }
            }
        }

        this.stuck.test = () =>
        {
            if(this.stuck.durationSaved >= this.stuck.durationTest && this.stuck.distance < this.stuck.distanceThreshold)
            {
                if(!this.stuck.active)
                {
                    this.stuck.active = true
                    this.events.trigger('stuck')
                }
            }
            else
            {
                if(this.stuck.active)
                {
                    this.stuck.active = false
                    this.events.trigger('unstuck')
                }
            }
        }
    }

    // setBackWheel()
    // {
    //     this.backWheel = {}
    //     this.backWheel.active = false
    //     this.backWheel.test = () =>
    //     {
    //         if(
    //             this.zRotation > 1 && this.zRotation < 1.7 &&
    //             this.wheels.items[2].inContact && this.wheels.items[3].inContact
    //         )
    //         {
    //             if(!this.backWheel.active)
    //             {
    //                 this.backWheel.active = true
    //                 this.events.trigger('backWheel', [ this.backWheel.active ])
    //             }
    //         }
    //         else
    //         {
    //             if(this.backWheel.active)
    //             {
    //                 this.backWheel.active = false
    //                 this.events.trigger('backWheel', [ this.backWheel.active ])
    //             }
    //         }
    //     }
    // }

    setFlip()
    {
        this.flip = {}
        let inAir = false
        
        let previousXAngle = 0
        let accumulatedXAngle = 0

        let previousZAngle = 0
        let accumulatedZAngle = 0

        this.flip.test = () =>
        {
            // Every wheel stop touching
            if(this.wheels.inContactCount === 0)
            {
                // Wasn't in the air => Start
                if(!inAir)
                {
                    inAir = true
                    
                    previousXAngle = this.xRotation
                    accumulatedXAngle = 0
                    
                    previousZAngle = this.zRotation
                    accumulatedZAngle = 0
                }
            }

            // 4 wheels are touching
            if(this.wheels.inContactCount >= 4)
            {
                // Was in the air => stop
                if(inAir)
                {
                    inAir = false

                    if(
                        Math.abs(accumulatedXAngle) < 1 &&
                        Math.abs(accumulatedZAngle) > 5
                    )
                    {
                        this.events.trigger('flip', [ Math.sign(accumulatedZAngle) ])
                    }
                }
            }
            else
            {
                if(inAir)
                {
                    accumulatedXAngle += smallestAngle(previousXAngle, this.xRotation)
                    previousXAngle = this.xRotation

                    accumulatedZAngle += smallestAngle(previousZAngle, this.zRotation)
                    previousZAngle = this.zRotation
                }
            }
        }

        this.flip.jump = () =>
        {
            accumulatedXAngle = 0
            accumulatedZAngle = 0

            const up = new THREE.Vector3(0, 1, 0)
            const sidewardDot = up.dot(this.sideward)
            const forwardDot = up.dot(this.forward)
            const upwarddDot = up.dot(this.upward)
            
            const sidewardAbsolute = Math.abs(sidewardDot)
            const forwardAbsolute = Math.abs(forwardDot)
            const upwarddAbsolute = Math.abs(upwarddDot)

            const impulse = new THREE.Vector3(0, 1, 0).multiplyScalar(this.flipForce * this.chassis.mass)
            this.chassis.physical.body.applyImpulse(impulse)

            // Upside down
            if(upwarddAbsolute > sidewardAbsolute && upwarddAbsolute > forwardAbsolute)
            {
                const torqueX = 0.8 * this.chassis.mass
                const torque = new THREE.Vector3(torqueX, 0, 0)
                torque.applyQuaternion(this.chassis.physical.body.rotation())
                this.chassis.physical.body.applyTorqueImpulse(torque)
            }
            // On the side
            else
            {
                const torqueX = sidewardDot * 0.4 * this.chassis.mass
                const torqueZ = - forwardDot * 0.8 * this.chassis.mass
                const torque = new THREE.Vector3(torqueX, 0, torqueZ)
                torque.applyQuaternion(this.chassis.physical.body.rotation())
                this.chassis.physical.body.applyTorqueImpulse(torque)
            }
        }
    }

    moveTo(position, rotation = 0)
    {
        const quaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), rotation)
        this.chassis.physical.body.setTranslation(position)
        this.chassis.physical.body.setRotation(quaternion)
        this.chassis.physical.body.setLinvel({ x: 0, y: 0, z: 0 })
        this.chassis.physical.body.setAngvel({ x: 0, y: 0, z: 0 })

        this.position.copy(position)
    }

    updatePrePhysics()
    {
        // Engine force
        const topSpeed = lerp(this.topSpeed, this.topSpeedBoost, this.game.player.boosting)
        const overflowSpeed = Math.max(0, this.speed - topSpeed)
        let engineForce = (this.game.player.accelerating * (1 + this.game.player.boosting * this.boostMultiplier)) * this.engineForceAmplitude / (1 + overflowSpeed) * this.game.ticker.deltaScaled

        // Brake
        let brake = this.game.player.braking

        if(!this.game.player.braking && Math.abs(this.game.player.accelerating) < 0.1)
            brake = this.idleBrake
    
        if(
            this.speed > 0.5 &&
            (
                (this.game.player.accelerating > 0 && !this.goingForward) ||
                (this.game.player.accelerating < 0 && this.goingForward)
            )
        )
        {
            brake = this.reverseBrake
            engineForce = 0
        }

        brake *= this.brakeAmplitude * this.game.ticker.deltaScaled

        // Steer
        const steer = this.game.player.steering * this.steeringAmplitude

        // Update wheels
        this.controller.setWheelSteering(0, steer)
        this.controller.setWheelSteering(1, steer)

        for(let i = 0; i < 4; i++)
        {
            this.controller.setWheelBrake(i, brake)
            this.controller.setWheelEngineForce(i, engineForce)
            this.controller.setWheelSuspensionRestLength(i, this.suspensionsHeights[this.game.player.suspensions[i]])
            this.controller.setWheelSuspensionStiffness(i, this.suspensionsStiffness[this.game.player.suspensions[i]])

            // Ice slip
            const groundObject = this.controller.wheelGroundObject(i)

            if(groundObject && this.game.world.waterSurface)
            {
                const onIce = groundObject.parent() === this.game.world.waterSurface.ice.physical.body
                const iceFriction = lerp(this.wheels.settings.frictionSlip, 0.04, this.game.world.waterSurface.iceRatio.value)

                this.controller.setWheelFrictionSlip(i, onIce ? iceFriction : this.wheels.settings.frictionSlip)
            }
        }

        // Update controller
        const delta = this.game.quality.level === 1 ? 1/60 : this.game.ticker.deltaAverage
        this.controller.updateVehicle(delta)
    }

    updatePostPhysics()
    {
        // Various measures
        const newPosition = new THREE.Vector3().copy(this.chassis.physical.body.translation())
        this.velocity = newPosition.clone().sub(this.position)
        this.direction = this.velocity.clone().normalize()
        this.position.copy(newPosition)
        this.quaternion.copy(this.chassis.physical.body.rotation())
        this.sideward.set(0, 0, 1).applyQuaternion(this.quaternion)
        this.upward.set(0, 1, 0).applyQuaternion(this.quaternion)
        this.forward.set(1, 0, 0).applyQuaternion(this.quaternion)
        // this.speed = this.controller.currentVehicleSpeed()
        this.speed = this.velocity.length() / this.game.ticker.deltaScaled
        this.xzSpeed = Math.hypot(this.velocity.x, this.velocity.z) / this.game.ticker.deltaScaled
        this.forwardRatio = this.direction.dot(this.forward)
        this.goingForward = this.forwardRatio > 0.5
        this.forwardSpeed = this.speed * this.forwardRatio

        this.zRotation = new THREE.Euler().setFromQuaternion(this.quaternion, 'ZYX').z
        this.xRotation = new THREE.Euler().setFromQuaternion(this.quaternion, 'XYZ').x

        if(Math.abs(this.game.player.accelerating) > 0.5)
            this.stuck.accumulate(this.velocity.length(), this.game.ticker.deltaScaled)

        let inContactCount = 0
        for(let i = 0; i < 4; i++)
        {
            const wheel = this.wheels.items[i]

            const inContact = this.controller.wheelIsInContact(i)

            if(inContact && !wheel.inContact)
            {
                wheel.lastTouchTime = this.game.ticker.elapsed
            }

            wheel.inContact = inContact
            wheel.contactPoint = this.controller.wheelContactPoint(i)
            wheel.suspensionLength = this.controller.wheelSuspensionLength(i)

            if(wheel.inContact)
                inContactCount++
        }

        let justTouchedCount = 0
        if(inContactCount > this.wheels.inContactCount)
        {
            for(const wheel of this.wheels.items)
            {
                if(wheel.lastTouchTime > this.game.ticker.elapsed - 0.2)
                    justTouchedCount++
            }
        }

        this.wheels.inContactCount = inContactCount
        this.wheels.justTouchedCount = justTouchedCount

        this.stop.test()
        this.upsideDown.test()
        this.stuck.test()
        // this.backWheel.test()
        this.flip.test()
    }

    activate()
    {
        this.chassis.physical.body.setLinvel({ x: 0, y: 0, z: 0 })
        this.chassis.physical.body.setAngvel({ x: 0, y: 0, z: 0 })
        this.chassis.physical.body.setEnabled(true)
    }

    deactivate()
    {
        this.chassis.physical.body.setEnabled(false)
    }
}