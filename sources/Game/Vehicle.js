import * as THREE from 'three/webgpu'
import { Game } from './Game.js'

export class Vehicle
{
    constructor()
    {
        this.game = new Game()

        const chassisDescription = RAPIER.RigidBodyDesc.dynamic().setTranslation(0.0, 1.0, 0.0).setCanSleep(false)
        this.chassisBody = this.game.physics.world.createRigidBody(chassisDescription)
        this.game.physics.world.createCollider(RAPIER.ColliderDesc.cuboid(1, 0.5, 2), this.chassisBody);

        this.controller = this.game.physics.world.createVehicleController(this.chassisBody)

        const wheelGeneral = {
            directionCs: new THREE.Vector3(0, -1, 0), // Suspension direction
            axleCs: new THREE.Vector3(-1, 0, 0),      // Rotation axis
            frictionSlip: 10.5,          // 10.5
            maxSuspensionForce: 6000,    // 6000
            maxSuspensionTravel: 5,      // 5
            radius: 0.5,                 // No default
            sideFrictionStiffness: 1,    // 1
            suspensionCompression: 0.83, // 0.83
            suspensionRelaxation: 0.88,  // 0.88
            suspensionRestLength: 0.125, // No default
            suspensionStiffness: 24,     // 5.88
            offset: new THREE.Vector3(0.65, -0.2,  0.75), // No default
        }
        const wheelsPositions = [
            new THREE.Vector3(  wheelGeneral.offset.x, wheelGeneral.offset.y,   wheelGeneral.offset.z),
            new THREE.Vector3(  wheelGeneral.offset.x, wheelGeneral.offset.y, - wheelGeneral.offset.z),
            new THREE.Vector3(- wheelGeneral.offset.x, wheelGeneral.offset.y,   wheelGeneral.offset.z),
            new THREE.Vector3(- wheelGeneral.offset.x, wheelGeneral.offset.y, - wheelGeneral.offset.z),
        ]

        for(let i = 0; i < 4; i++)
        {
            this.controller.addWheel(wheelsPositions[i], wheelGeneral.directionCs, wheelGeneral.axleCs, wheelGeneral.suspensionRestLength, wheelGeneral.radius)

            // Don't change
            // this.controller.setWheelAxleCs(i, wheelGeneral.axleCs)
            // this.controller.setWheelDirectionCs(i, wheelGeneral.directionCs)

            // Player controlled
            // this.controller.setWheelBrake(i, )
            // this.controller.setWheelEngineForce(i, )
            // this.controller.setWheelSteering(i, )

            // To tweak
            this.controller.setWheelChassisConnectionPointCs(i, wheelsPositions[i])
            this.controller.setWheelFrictionSlip(i, wheelGeneral.frictionSlip)
            this.controller.setWheelMaxSuspensionForce(i, wheelGeneral.maxSuspensionForce)
            this.controller.setWheelMaxSuspensionTravel(i, wheelGeneral.maxSuspensionTravel)
            this.controller.setWheelRadius(i, wheelGeneral.radius)
            this.controller.setWheelSideFrictionStiffness(i, wheelGeneral.sideFrictionStiffness)
            this.controller.setWheelSuspensionCompression(i, wheelGeneral.suspensionCompression)
            this.controller.setWheelSuspensionRelaxation(i, wheelGeneral.suspensionRelaxation)
            this.controller.setWheelSuspensionRestLength(i, wheelGeneral.suspensionRestLength)
            this.controller.setWheelSuspensionStiffness(i, wheelGeneral.suspensionStiffness)
        }

        this.game.time.events.on('tick', () =>
        {
            this.update()
        })
    }

    update()
    {
        let wheelEngineForce = 0
        if(this.game.controls.keys.up)
            wheelEngineForce = 1
        if(this.game.controls.keys.down)
            wheelEngineForce = -1

        for(let i = 0; i < 4; i++)
        {
            this.controller.setWheelEngineForce(i, wheelEngineForce)
        }
    }
}