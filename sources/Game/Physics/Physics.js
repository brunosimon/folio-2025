import { Game } from '../Game.js'
import RAPIER from '@dimforge/rapier3d-compat'
import { PhysicsWireframe } from './PhysicsWireframe.js'

export class Physics
{
    constructor()
    {
        this.game = new Game()

        this.world = new RAPIER.World({ x: 0.0, y: -9.81, z: 0.0 })

        // this.world.integrationParameters.numSolverIterations = 4 // 4
        // this.world.numAdditionalFrictionIterations = 0 // 0
        // this.world.integrationParameters.numAdditionalFrictionIterations = 0 // 0
        // this.world.numInternalPgsIterations = 1 // 1
        // this.world.integrationParameters.numInternalPgsIterations = 1 // 1
        // this.world.integrationParameters.normalizedAllowedLinearError = 0.001 // 0.001
        // this.world.integrationParameters.minIslandSize = 128 // 128
        // this.world.integrationParameters.maxCcdSubsteps = 1 // 1
        // this.world.integrationParameters.normalizedPredictionDistance = 0.002 // 0.002
        // this.world.lengthUnit = 1 // 1
        // this.world.integrationParameters.lengthUnit = 1 // 1
        
        this.game.time.events.on('tick', () =>
        {
            this.update()
        }, 2)

        this.wireframe = new PhysicsWireframe()

        if(this.game.debug.active)
        {
            this.debugPanel = this.game.debug.panel.addFolder({
                title: '⬇️ Physics',
                expanded: false,
            })
            this.debugPanel.addBinding(this.world.gravity, 'y', { min: - 20, max: 20, step: 0.01 })
        }
    }

    getPhysical(_physicalDescription)
    {
        const physical = {}

        // Body
        let rigidBodyDesc = RAPIER.RigidBodyDesc
        
        if(_physicalDescription.type === 'dynamic' || typeof _physicalDescription.type === 'undefined')
            rigidBodyDesc = rigidBodyDesc.dynamic()
        else if(_physicalDescription.type === 'fixed')
            rigidBodyDesc = rigidBodyDesc.fixed()

        if(typeof _physicalDescription.position !== 'undefined')
            rigidBodyDesc.setTranslation(_physicalDescription.position.x, _physicalDescription.position.y, _physicalDescription.position.z)

        if(typeof _physicalDescription.rotation !== 'undefined')
            rigidBodyDesc.setRotation(_physicalDescription.rotation)

        if(typeof _physicalDescription.canSleep !== 'undefined')
            rigidBodyDesc.setCanSleep(_physicalDescription.canSleep)

        if(typeof _physicalDescription.linearDamping !== 'undefined')
            rigidBodyDesc.setLinearDamping(_physicalDescription.linearDamping)

        if(typeof _physicalDescription.sleeping !== 'undefined')
            rigidBodyDesc.setSleeping(_physicalDescription.sleeping)

        physical.body = this.world.createRigidBody(rigidBodyDesc)

        // Colliders
        physical.colliders = []
        for(const _colliderDescription of _physicalDescription.colliders)
        {
            let colliderDescription = RAPIER.ColliderDesc

            if(_colliderDescription.shape === 'cuboid')
                colliderDescription = colliderDescription.cuboid(..._colliderDescription.parameters)
            else if(_colliderDescription.shape === 'trimesh')
                colliderDescription = colliderDescription.trimesh(..._colliderDescription.parameters)

            if(_colliderDescription.position)
                colliderDescription = colliderDescription.setTranslation(_colliderDescription.position.x, _colliderDescription.position.y, _colliderDescription.position.z)

            if(_colliderDescription.quaternion)
                colliderDescription = colliderDescription.setRotation(_colliderDescription.quaternion)
                
            if(typeof _colliderDescription.mass !== 'undefined')
                colliderDescription = colliderDescription.setMass(_colliderDescription.mass)

            if(typeof _physicalDescription.friction !== 'undefined')
                colliderDescription = colliderDescription.setFriction(_physicalDescription.friction)
                
            if(typeof _physicalDescription.restitution !== 'undefined')
                colliderDescription = colliderDescription.setRestitution(_physicalDescription.restitution)

            const collider = this.world.createCollider(colliderDescription, physical.body)
            physical.colliders.push(collider)
        }

        return physical
    }

    update()
    {
        this.world.timestep = this.game.time.deltaScaled
        this.world.vehicleControllers.forEach((_vehicleController) =>
        {
            _vehicleController.updateVehicle(this.game.time.delta)
        })
        
        this.world.step()
    }
}