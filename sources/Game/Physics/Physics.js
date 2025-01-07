import { Game } from '../Game.js'
import RAPIER from '@dimforge/rapier3d-compat'
import { PhysicsWireframe } from './PhysicsWireframe.js'
import { remapClamp } from '../utilities/maths.js'
import * as THREE from 'three'

export class Physics
{
    constructor()
    {
        this.game = Game.getInstance()

        this.world = new RAPIER.World({ x: 0.0, y: -9.81, z: 0.0 })

        this.water = {}
        this.water.edgeLow = 0
        this.water.edgeHigh = -0.4
        this.water.gravityMultiplier = - 0.75 // - 0.75

        this.groups = {
            all: 0b0000000000000001,
            object:  0b0000000000000010,
            bumper:  0b0000000000000100
        }
        this.categories = {
            floor: (this.groups.all) << 16 |
                     (this.groups.all),
            object: (this.groups.all | this.groups.object) << 16 |
                    (this.groups.all | this.groups.bumper),
            bumper: (this.groups.bumper) << 16 |
                    this.groups.object,
        }

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
            this.debugPanel.addBlade({ view: 'separator' })
            this.debugPanel.addBinding(this.water, 'edgeLow', { label: 'waterEdgeLow', min: -1, max: 0 })
            this.debugPanel.addBinding(this.water, 'edgeHigh', { label: 'waterEdgeHigh', min: -1, max: 0 })
            this.debugPanel.addBinding(this.water, 'gravityMultiplier', { label: 'waterGravityMultiplier', min: -1, max: 1 })
        }
    }

    getBinaryGroups(groupNames)
    {
        let binary = 0b0000000000000000
        
        for(const groupName of groupNames)
            binary |= this.groups[groupName]

        return binary
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
            if(_colliderDescription.shape === 'cylinder')
                colliderDescription = colliderDescription.cylinder(..._colliderDescription.parameters)
            else if(_colliderDescription.shape === 'trimesh')
                colliderDescription = colliderDescription.trimesh(..._colliderDescription.parameters)
            else if(_colliderDescription.shape === 'heightfield')
                colliderDescription = colliderDescription.heightfield(..._colliderDescription.parameters)

            if(_colliderDescription.position)
                colliderDescription = colliderDescription.setTranslation(_colliderDescription.position.x, _colliderDescription.position.y, _colliderDescription.position.z)

            if(_colliderDescription.quaternion)
                colliderDescription = colliderDescription.setRotation(_colliderDescription.quaternion)
                
            if(typeof _colliderDescription.mass !== 'undefined')
            {
                if(typeof _colliderDescription.centerOfMass !== 'undefined')
                    colliderDescription = colliderDescription.setMassProperties(_colliderDescription.mass, _colliderDescription.centerOfMass, { x: 1, y: 1, z: 1 }, new THREE.Quaternion().setFromAxisAngle(new THREE.Euler(0, 1, 0), - Math.PI * 0))
                else
                    colliderDescription = colliderDescription.setMass(_colliderDescription.mass)
            }

            if(typeof _physicalDescription.friction !== 'undefined')
                colliderDescription = colliderDescription.setFriction(_physicalDescription.friction)
                
            if(typeof _physicalDescription.restitution !== 'undefined')
                colliderDescription = colliderDescription.setRestitution(_physicalDescription.restitution)
                
            let category = 'object'
            if(typeof _colliderDescription.category !== 'undefined')
                category = _colliderDescription.category

            colliderDescription = colliderDescription.setCollisionGroups(this.categories[category])
            // colliderDescription = colliderDescription.setCollisionGroups(this.getBinaryGroups(groups))
            // colliderDescription = colliderDescription.setSolverGroups(this.getBinaryGroups(groups))

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
    
        this.world.bodies.forEach((_child) =>
        {
            const position = _child.translation()
            const waterGravity = remapClamp(position.y, this.water.edgeLow, this.water.edgeHigh, 1, this.water.gravityMultiplier)
            _child.setGravityScale(waterGravity)
        })
        
        this.world.step()
    }
}