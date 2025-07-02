import { Game } from './Game.js'
import gsap from 'gsap'

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

        const respawn = this.game.respawns.getByName('career')

        this.position = respawn.position.clone()
        
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
        this.game.inputs.addMap([
            { name: 'forward',               categories: [ 'playing'              ], keys: [ 'ArrowUp', 'KeyW' ] },
            { name: 'right',                 categories: [ 'playing', 'cinematic' ], keys: [ 'ArrowRight', 'KeyD' ] },
            { name: 'backward',              categories: [ 'playing', 'cinematic' ], keys: [ 'ArrowDown', 'KeyS' ] },
            { name: 'left',                  categories: [ 'playing', 'cinematic' ], keys: [ 'ArrowLeft', 'KeyA' ] },
            { name: 'boost',                 categories: [ 'playing'              ], keys: [ 'ShiftLeft', 'ShiftRight' ] },
            { name: 'brake',                 categories: [ 'playing'              ], keys: [ 'KeyB' ] },
            { name: 'respawn',               categories: [ 'playing'              ], keys: [ 'KeyR' ] },
            { name: 'suspensions',           categories: [ 'playing'              ], keys: [ 'Numpad5', 'Space' ] },
            { name: 'suspensionsFront',      categories: [ 'playing'              ], keys: [ 'Numpad8' ] },
            { name: 'suspensionsBack',       categories: [ 'playing'              ], keys: [ 'Numpad2' ] },
            { name: 'suspensionsRight',      categories: [ 'playing'              ], keys: [ 'Numpad6' ] },
            { name: 'suspensionsLeft',       categories: [ 'playing'              ], keys: [ 'Numpad4' ] },
            { name: 'suspensionsFrontLeft',  categories: [ 'playing'              ], keys: [ 'Numpad7' ] },
            { name: 'suspensionsFrontRight', categories: [ 'playing'              ], keys: [ 'Numpad9' ] },
            { name: 'suspensionsBackRight',  categories: [ 'playing'              ], keys: [ 'Numpad3' ] },
            { name: 'suspensionsBackLeft',   categories: [ 'playing'              ], keys: [ 'Numpad1' ] },
            { name: 'interact',              categories: [ 'playing', 'cinematic' ], keys: [ 'Enter' ] },
        ])

        // Reset
        this.game.inputs.events.on('respawn', (_event) =>
        {
            if(this.state !== Player.STATE_DEFAULT)
                return

            if(_event.down)
            {
                this.respawn()
            }
        })

        // Suspensions
        const suspensionsUpdate = (_event) =>
        {
            if(this.state !== Player.STATE_DEFAULT)
                return

            const activeSuspensions = [
                this.game.inputs.keys.suspensions || this.game.inputs.keys.suspensionsFront || this.game.inputs.keys.suspensionsRight || this.game.inputs.keys.suspensionsFrontRight, // front right
                this.game.inputs.keys.suspensions || this.game.inputs.keys.suspensionsFront || this.game.inputs.keys.suspensionsLeft || this.game.inputs.keys.suspensionsFrontLeft, // front left
                this.game.inputs.keys.suspensions || this.game.inputs.keys.suspensionsBack || this.game.inputs.keys.suspensionsRight || this.game.inputs.keys.suspensionsBackRight, // back right
                this.game.inputs.keys.suspensions || this.game.inputs.keys.suspensionsBack || this.game.inputs.keys.suspensionsLeft || this.game.inputs.keys.suspensionsBackLeft, // back left
            ]

            const activeState = this.game.inputs.keys.suspensions ? 'high' : 'mid' // high = jump, mid = lowride

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

        // Accelerating (forward and backward)
        if(this.game.inputs.keys.forward)
            this.accelerating += 1

        if(this.game.inputs.keys.backward)
            this.accelerating -= 1

        // Boosting
        if(this.game.inputs.keys.boost)
            this.boosting = 1

        // Braking
        if(this.game.inputs.keys.brake)
        {
            this.accelerating = 0
            this.braking = 1
        }

        // Steering
        if(this.game.inputs.keys.right)
            this.steering -= 1
        if(this.game.inputs.keys.left)
            this.steering += 1
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
    }
}