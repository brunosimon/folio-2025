import { Game } from '../Game.js'
import RAPIER from '@dimforge/rapier3d'
import { PhysicsWireframe } from './PhysicsWireframe.js'
import { remapClamp } from '../utilities/maths.js'
import * as THREE from 'three/webgpu'

export class Physics
{
    constructor()
    {
        this.game = Game.getInstance()

        this.world = new RAPIER.World({ x: 0.0, y: -9.81, z: 0.0 })
        // this.eventQueue = new RAPIER.EventQueue(true)

        this.physicals = []

        this.groups = {
            all: 0b0000000000000001,
            object:  0b0000000000000010,
            bumper:  0b0000000000000100
        }
        this.categories = {
            floor: (this.groups.all) << 16 | (this.groups.all),
            object: (this.groups.all | this.groups.object) << 16 | (this.groups.all | this.groups.bumper),
            bumper: (this.groups.bumper) << 16 | this.groups.object,
        }
        this.frictionRules = {
            average: RAPIER.CoefficientCombineRule.Average,
            min: RAPIER.CoefficientCombineRule.Min,
            max: RAPIER.CoefficientCombineRule.Max,
            multiply: RAPIER.CoefficientCombineRule.Multiply,
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
        
        this.game.ticker.events.on('tick', () =>
        {
            this.update()
        }, 2)

        if(this.game.debug.active)
        {
            this.debugPanel = this.game.debug.panel.addFolder({
                title: '⬇️ Physics',
                expanded: false,
            })
            this.debugPanel.addBinding(this.world.gravity, 'y', { min: - 20, max: 20, step: 0.01 })
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

        // Attributes
        physical.waterGravityMultiplier = typeof _physicalDescription.waterGravityMultiplier !== 'undefined' ? _physicalDescription.waterGravityMultiplier : - 1.5

        // Body
        let rigidBodyDesc = RAPIER.RigidBodyDesc
        
        if(_physicalDescription.type === 'dynamic' || typeof _physicalDescription.type === 'undefined')
        {
            physical.type = 'dynamic'
            rigidBodyDesc = rigidBodyDesc.dynamic()
        }
        else if(_physicalDescription.type === 'fixed')
        {
            physical.type = 'fixed'
            rigidBodyDesc = rigidBodyDesc.fixed()
        }
        else if(_physicalDescription.type === 'kinematicPositionBased')
        {
            physical.type = 'kinematicPositionBased'
            rigidBodyDesc = rigidBodyDesc.kinematicPositionBased()
        }
        else if(_physicalDescription.type === 'kinematicVelocityBased')
        {
            physical.type = 'kinematicVelocityBased'
            rigidBodyDesc = rigidBodyDesc.kinematicVelocityBased()
        }

        if(typeof _physicalDescription.position !== 'undefined')
            rigidBodyDesc.setTranslation(_physicalDescription.position.x, _physicalDescription.position.y, _physicalDescription.position.z)

        if(typeof _physicalDescription.rotation !== 'undefined')
            rigidBodyDesc.setRotation(_physicalDescription.rotation)

        if(typeof _physicalDescription.canSleep !== 'undefined')
            rigidBodyDesc.setCanSleep(_physicalDescription.canSleep)

        if(typeof _physicalDescription.linearDamping !== 'undefined')
            rigidBodyDesc.setLinearDamping(_physicalDescription.linearDamping)
        else
            rigidBodyDesc.setLinearDamping(0.1)

        if(typeof _physicalDescription.angularDamping !== 'undefined')
            rigidBodyDesc.setAngularDamping(_physicalDescription.angularDamping)
        else
            rigidBodyDesc.setAngularDamping(0.1)

        if(typeof _physicalDescription.sleeping !== 'undefined')
            rigidBodyDesc.setSleeping(_physicalDescription.sleeping)

        if(typeof _physicalDescription.enabled !== 'undefined')
            rigidBodyDesc.setEnabled(_physicalDescription.enabled)
        
        physical.body = this.world.createRigidBody(rigidBodyDesc)

        // Colliders
        let collidersOverwrite = {}
        if(typeof _physicalDescription.collidersOverwrite !== 'undefined')
            collidersOverwrite = _physicalDescription.collidersOverwrite

        physical.colliders = []
        for(let _colliderDescription of _physicalDescription.colliders)
        {
            let colliderDescription = RAPIER.ColliderDesc

            _colliderDescription = {
                ..._colliderDescription,
                ...collidersOverwrite
            }

            if(_colliderDescription.shape === 'cuboid')
                colliderDescription = colliderDescription.cuboid(..._colliderDescription.parameters)
            if(_colliderDescription.shape === 'ball')
                colliderDescription = colliderDescription.ball(..._colliderDescription.parameters)
            if(_colliderDescription.shape === 'cylinder')
                colliderDescription = colliderDescription.cylinder(..._colliderDescription.parameters)
            else if(_colliderDescription.shape === 'trimesh')
                colliderDescription = colliderDescription.trimesh(..._colliderDescription.parameters)
            else if(_colliderDescription.shape === 'hull')
                colliderDescription = colliderDescription.convexHull(..._colliderDescription.parameters)
            else if(_colliderDescription.shape === 'heightfield')
                colliderDescription = colliderDescription.heightfield(..._colliderDescription.parameters)

            if(_colliderDescription.position)
                colliderDescription = colliderDescription.setTranslation(_colliderDescription.position.x, _colliderDescription.position.y, _colliderDescription.position.z)

            if(_colliderDescription.quaternion)
                colliderDescription = colliderDescription.setRotation(_colliderDescription.quaternion)
                
            colliderDescription = colliderDescription.setDensity(0.1)
                
            if(typeof _colliderDescription.mass !== 'undefined') // From collider description
            {
                if(typeof _colliderDescription.centerOfMass !== 'undefined')
                    colliderDescription = colliderDescription.setMassProperties(_colliderDescription.mass, _colliderDescription.centerOfMass, { x: 1, y: 1, z: 1 }, new THREE.Quaternion().setFromAxisAngle(new THREE.Euler(0, 1, 0), - Math.PI * 0))
                else
                    colliderDescription = colliderDescription.setMass(_colliderDescription.mass)
            }
                
            if(typeof _physicalDescription.mass !== 'undefined') // From body description
            {
                colliderDescription = colliderDescription.setMass(_physicalDescription.mass / _physicalDescription.colliders.length)
            }

            if(typeof _physicalDescription.friction !== 'undefined')
                colliderDescription = colliderDescription.setFriction(_physicalDescription.friction)
            else if(typeof _colliderDescription.friction !== 'undefined')
                colliderDescription = colliderDescription.setFriction(_colliderDescription.friction)
            else
                colliderDescription = colliderDescription.setFriction(0.2)

            if(typeof _physicalDescription.frictionRule !== 'undefined')
            {
                colliderDescription = colliderDescription.setFrictionCombineRule(this.frictionRules[_physicalDescription.frictionRule])
            }
                
            if(typeof _physicalDescription.restitution !== 'undefined')
                colliderDescription = colliderDescription.setRestitution(_physicalDescription.restitution)
            else if(typeof _colliderDescription.restitution !== 'undefined')
                colliderDescription = colliderDescription.setRestitution(_colliderDescription.restitution)
            else
                colliderDescription = colliderDescription.setRestitution(0.15)
                
            let category = 'object'
            if(typeof _colliderDescription.category !== 'undefined')
                category = _colliderDescription.category

            colliderDescription = colliderDescription.setCollisionGroups(this.categories[category])

            // if(typeof _colliderDescription.hasEvents !== 'undefined' && _colliderDescription.hasEvents === true)
            //     colliderDescription = colliderDescription.setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS)

            const collider = this.world.createCollider(colliderDescription, physical.body)
            physical.colliders.push(collider)
        }

        // Original transform
        physical.initialState = {
            position: { x: physical.body.translation().x, y: physical.body.translation().y, z: physical.body.translation().z },
            rotation: physical.body.rotation(),
            sleeping: physical.body.isSleeping() 
        }

        this.physicals.push(physical)

        return physical
    }

    update()
    {
        this.world.timestep = this.game.ticker.deltaScaled
    
        for(const physical of this.physicals)
        {
            const waterDepth = Math.max(- physical.body.translation().y, this.game.water.elevation)
            physical.body.setGravityScale(1 + waterDepth * physical.waterGravityMultiplier)
        }
        
        this.world.step()
        // this.world.step(this.eventQueue)

        // Works but not handy
        // this.eventQueue.drainCollisionEvents((handle1, handle2, started) =>
        // {
        //     if(started)
        //     {
        //         const collider1 = this.world.getCollider(handle1)
        //         const collider2 = this.world.getCollider(handle2)

        //         console.log('---')
        //         console.log(collider1)
        //         console.log(collider2)
        //     }
        // })

        // Doesn't work
        // this.eventQueue.drainContactForceEvents(event =>
        // {
        //     // let handle1 = event.collider1(); // Handle of the first collider involved in the event.
        //     // let handle2 = event.collider2(); // Handle of the second collider involved in the event.
        //     console.log('b')
        // })
    }
}