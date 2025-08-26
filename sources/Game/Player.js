import { Game } from './Game.js'
import gsap from 'gsap'
import { smallestAngle } from './utilities/maths.js'
import * as THREE from 'three/webgpu'
import { Inputs } from './Inputs/Inputs.js'

export class Player
{
    static STATE_DEFAULT = 1
    static STATE_DYING = 2

    constructor()
    {
        this.game = Game.getInstance()
        
        this.state = Player.STATE_DEFAULT
        this.accelerating = 0
        this.steering = 0
        this.boosting = 0
        this.braking = 0
        this.suspensions = ['low', 'low', 'low', 'low']

        const respawn = this.game.respawns.getByName('controls')

        this.position = respawn.position.clone()
        this.rotationY = 0
        
        this.setInputs()
        this.setUnstuck()

        this.game.physicalVehicle.moveTo(respawn.position, respawn.rotation)

        this.game.ticker.events.on('tick', () =>
        {
            this.updatePrePhysics()
        }, 0)

        this.game.ticker.events.on('tick', () =>
        {
            this.updatePostPhysics()
        }, 5)
    }

    setInputs()
    {
        this.game.inputs.addActions([
            { name: 'forward',               categories: [ 'playing', 'cinematic' ], keys: [ 'Keyboard.ArrowUp', 'Keyboard.KeyW', 'Gamepad.up', 'Gamepad.r2' ] },
            { name: 'right',                 categories: [ 'playing', 'cinematic' ], keys: [ 'Keyboard.ArrowRight', 'Keyboard.KeyD', 'Gamepad.right' ] },
            { name: 'backward',              categories: [ 'playing', 'cinematic' ], keys: [ 'Keyboard.ArrowDown', 'Keyboard.KeyS', 'Gamepad.down', 'Gamepad.l2' ] },
            { name: 'left',                  categories: [ 'playing', 'cinematic' ], keys: [ 'Keyboard.ArrowLeft', 'Keyboard.KeyA', 'Gamepad.left' ] },
            { name: 'boost',                 categories: [ 'playing'              ], keys: [ 'Keyboard.ShiftLeft', 'Keyboard.ShiftRight', 'Gamepad.circle' ] },
            { name: 'brake',                 categories: [ 'playing'              ], keys: [ 'Keyboard.KeyB', 'Gamepad.square' ] },
            { name: 'respawn',               categories: [ 'playing'              ], keys: [ 'Keyboard.KeyR', 'Gamepad.select' ] },
            { name: 'suspensions',           categories: [ 'playing'              ], keys: [ 'Keyboard.Numpad5', 'Keyboard.Space', 'Gamepad.triangle' ] },
            { name: 'suspensionsFront',      categories: [ 'playing'              ], keys: [ 'Keyboard.Numpad8' ] },
            { name: 'suspensionsBack',       categories: [ 'playing'              ], keys: [ 'Keyboard.Numpad2' ] },
            { name: 'suspensionsRight',      categories: [ 'playing'              ], keys: [ 'Keyboard.Numpad6', 'Gamepad.r1' ] },
            { name: 'suspensionsLeft',       categories: [ 'playing'              ], keys: [ 'Keyboard.Numpad4', 'Gamepad.l1' ] },
            { name: 'suspensionsFrontLeft',  categories: [ 'playing'              ], keys: [ 'Keyboard.Numpad7' ] },
            { name: 'suspensionsFrontRight', categories: [ 'playing'              ], keys: [ 'Keyboard.Numpad9' ] },
            { name: 'suspensionsBackRight',  categories: [ 'playing'              ], keys: [ 'Keyboard.Numpad3' ] },
            { name: 'suspensionsBackLeft',   categories: [ 'playing'              ], keys: [ 'Keyboard.Numpad1' ] },
            { name: 'interact',              categories: [ 'playing', 'cinematic' ], keys: [ 'Keyboard.Enter', 'Gamepad.circle' ] },
        ])

        // Reset
        this.game.inputs.events.on('respawn', (action) =>
        {
            if(this.state !== Player.STATE_DEFAULT)
                return

            if(action.active)
            {
                this.respawn()
            }
        })

        // Suspensions
        const suspensionsUpdate = () =>
        {
            if(this.state !== Player.STATE_DEFAULT)
                return

            const activeSuspensions = [
                this.game.inputs.actions.get('suspensions').active || this.game.inputs.actions.get('suspensionsFront').active || this.game.inputs.actions.get('suspensionsRight').active || this.game.inputs.actions.get('suspensionsFrontRight').active, // front right
                this.game.inputs.actions.get('suspensions').active || this.game.inputs.actions.get('suspensionsFront').active || this.game.inputs.actions.get('suspensionsLeft').active || this.game.inputs.actions.get('suspensionsFrontLeft').active, // front left
                this.game.inputs.actions.get('suspensions').active || this.game.inputs.actions.get('suspensionsBack').active || this.game.inputs.actions.get('suspensionsRight').active || this.game.inputs.actions.get('suspensionsBackRight').active, // back right
                this.game.inputs.actions.get('suspensions').active || this.game.inputs.actions.get('suspensionsBack').active || this.game.inputs.actions.get('suspensionsLeft').active || this.game.inputs.actions.get('suspensionsBackLeft').active, // back left
            ]

            const activeState = this.game.inputs.actions.get('suspensions').active ? 'high' : 'mid' // high = jump, mid = lowride

            for(let i = 0; i < 4; i++)
                this.suspensions[i] = activeSuspensions[i] ? activeState : 'low'
        }

        this.game.inputs.events.on('suspensions', suspensionsUpdate)
        this.game.inputs.events.on('suspensionsFront', suspensionsUpdate)
        this.game.inputs.events.on('suspensionsBack', suspensionsUpdate)
        this.game.inputs.events.on('suspensionsRight', suspensionsUpdate)
        this.game.inputs.events.on('suspensionsLeft', suspensionsUpdate)
        this.game.inputs.events.on('suspensionsFrontLeft', suspensionsUpdate)
        this.game.inputs.events.on('suspensionsFrontRight', suspensionsUpdate)
        this.game.inputs.events.on('suspensionsBackRight', suspensionsUpdate)
        this.game.inputs.events.on('suspensionsBackLeft', suspensionsUpdate)

        this.game.inputs.events.on('suspensions', () =>
        {
            if(this.game.inputs.mode === Inputs.MODE_TOUCH)
                this.game.nipple.jump()
        })

        // Nipple tap jump
        let nippleJumpTimeout = null
        this.game.nipple.events.on('tap', () =>
        {
            this.game.nipple.jump()

            for(let i = 0; i < 4; i++)
                this.suspensions[i] = 'high'

            if(nippleJumpTimeout)
                clearTimeout(nippleJumpTimeout)
            
            nippleJumpTimeout = setTimeout(() =>
            {
                for(let i = 0; i < 4; i++)
                    this.suspensions[i] = 'low'
            }, 200)
        })
    }

    setUnstuck()
    {
        this.unstuck = {}
        this.unstuck.duration = 0.5
        this.unstuck.timeout = null

        this.game.physicalVehicle.events.on('upsideDown', () =>
        {
            // Reset timeout
            clearTimeout(this.unstuck.timeout)

            // Wait a moment
            this.unstuck.timeout = setTimeout(() =>
            {
                if(this.state !== Player.STATE_DEFAULT)
                    return

                // Still upside down => Flip back
                if(this.game.physicalVehicle.upsideDown.active)
                    this.game.physicalVehicle.flip()
            }, this.unstuck.duration * 2000)
        })

        this.game.physicalVehicle.events.on('stuck', () =>
        {
            this.game.inputs.touchButtons.addItems(['unstuck'])
        })

        this.game.physicalVehicle.events.on('unstuck', () =>
        {
            this.game.inputs.touchButtons.removeItems(['unstuck'])
        })

        this.game.inputs.touchButtons.events.on('unstuck', () =>
        {
            this.game.inputs.touchButtons.removeItems(['unstuck'])
            this.respawn()
        })
    }

    respawn(respawnName = null, callback = null)
    {
        this.game.overlay.show(() =>
        {
            if(typeof callback === 'function')
                callback()
            
            // Find respawn
            let respawn = respawnName ? this.game.respawns.getByName(respawnName) : this.game.respawns.getClosest(this.position)

            // Update physical vehicle
            this.game.physicalVehicle.moveTo(
                respawn.position,
                respawn.rotation
            )
            
            this.state = Player.STATE_DEFAULT
            this.game.overlay.hide()
        })
    }

    die()
    {
        this.state = Player.STATE_DYING
        
        gsap.delayedCall(2, () =>
        {
            this.respawn(null, () =>
            {
                this.state = Player.STATE_DEFAULT
            })
        })
    }

    updatePrePhysics()
    {
        this.accelerating = 0
        this.steering = 0
        this.boosting = 0
        this.braking = 0

        if(this.state !== Player.STATE_DEFAULT)
            return

        /**
         * Accelerating
         */
        if(this.game.inputs.actions.get('forward').active)
            this.accelerating += this.game.inputs.actions.get('forward').value

        if(this.game.inputs.actions.get('backward').active)
            this.accelerating -= this.game.inputs.actions.get('backward').value

        /**
         * Boosting
         */
        if(this.game.inputs.actions.get('boost').active)
            this.boosting = 1

        /**
         * Braking
         */
        if(this.game.inputs.actions.get('brake').active)
        {
            this.accelerating = 0
            this.braking = 1
        }

        /**
         * Steering
         */
        // Left / right actions
        if(this.game.inputs.actions.get('right').active)
            this.steering -= 1
        if(this.game.inputs.actions.get('left').active)
            this.steering += 1

        // Gamepad joystick
        if(this.steering === 0 && this.game.inputs.gamepad.joysticks.items.left.active)
            this.steering = - this.game.inputs.gamepad.joysticks.items.left.safeX

        /**
         * Touch Joystick
         */
        if(this.game.nipple.active && this.game.nipple.progress > 0)
        {
            this.game.view.focusPoint.isTracking = true
            this.accelerating = Math.pow(this.game.nipple.progress, 3)
            this.boosting = this.game.nipple.progress > 0.999

            let angleDeltaAbs = Math.abs(this.game.nipple.smallestRotation)
            const angleDeltaSign = Math.sign(this.game.nipple.smallestRotation)
            const steering = - Math.min(angleDeltaAbs, 1) * angleDeltaSign

            this.steering = steering

            if(!this.game.nipple.forward)
            {
                this.accelerating *= -1
                this.steering *= -1
            }
        }

        /**
         * Nipple
         */
        // if(this.game.inputs.nipple.active && this.game.inputs.nipple.strength > 0.2)
        // {
        //     this.game.view.focusPoint.isTracking = true
        //     this.accelerating = Math.pow(this.game.inputs.nipple.strength, 3)
        //     this.boosting = this.game.inputs.nipple.strength > 0.999

        //     let vehicleAngle = Math.atan2(this.game.physicalVehicle.forward.z, this.game.physicalVehicle.forward.x)
        //     const nippleAngle = this.game.inputs.nipple.angle - Math.PI * 0.25
        //     let angleDelta = smallestAngle(vehicleAngle, nippleAngle)
        //     let angleDeltaAbs = Math.abs(angleDelta)

        //     const nippleForwardAmplitude = Math.PI * 1.5
        //     const forward = angleDeltaAbs < nippleForwardAmplitude / 2

        //     this.game.inputs.nipple.forward.setAngle(vehicleAngle + Math.PI * 0.25)
        //     this.game.inputs.nipple.forward.setAmplitude(nippleForwardAmplitude)
        //     this.game.inputs.nipple.setThick(this.boosting)
            
        //     if(forward)
        //     {
        //         const angleDeltaSign = Math.sign(angleDelta)
        //         const steering = - Math.min(angleDeltaAbs, 1) * angleDeltaSign

        //         this.steering = steering
        //     }
        //     else
        //     {
        //         this.accelerating *= -1

        //         vehicleAngle += Math.PI
        //         angleDelta = smallestAngle(vehicleAngle, nippleAngle)
        //         angleDeltaAbs = Math.abs(angleDelta)
        //         const angleDeltaSign = Math.sign(angleDelta)
        //         const steering = - Math.min(angleDeltaAbs, 1) * angleDeltaSign

        //         this.steering = -steering
        //     }
        // }
    }

    updatePostPhysics()
    {
        // Position
        this.position.copy(this.game.physicalVehicle.position)
        
        // Reset on fall
        if(this.position.y < -2)
            this.game.physicalVehicle.moveTo(this.basePosition)

        // View > Focus point
        this.game.view.focusPoint.trackedPosition.copy(this.position)

        // View > Speed lines
        if(this.boosting && this.accelerating && this.game.physicalVehicle.absoluteSpeed > 5)
            this.game.view.speedLines.strength = 1
        else
            this.game.view.speedLines.strength = 0

        this.game.view.speedLines.worldTarget.copy(this.position)

        // Ground data > Focus point
        this.game.groundData.focusPoint.set(this.position.x, this.position.z)

        // Inputs touch joystick
        this.rotationY = Math.atan2(this.game.physicalVehicle.forward.z, this.game.physicalVehicle.forward.x)
        this.game.nipple.setCoordinates(this.position.x, this.position.y, this.position.z, this.rotationY)
    }
}