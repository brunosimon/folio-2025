import { Game } from '../Game.js'
import { PhysicsWireframe } from './PhysicsWireframe.js'
import { remapClamp } from '../utilities/maths.js'
import * as THREE from 'three/webgpu'

export class Physics
{
    constructor()
    {
        this.game = Game.getInstance()

        this.world = new this.game.RAPIER.World({ x: 0.0, y: -9.81, z: 0.0 })
        this.eventQueue = new this.game.RAPIER.EventQueue(true)

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
            average: this.game.RAPIER.CoefficientCombineRule.Average,
            min: this.game.RAPIER.CoefficientCombineRule.Min,
            max: this.game.RAPIER.CoefficientCombineRule.Max,
            multiply: this.game.RAPIER.CoefficientCombineRule.Multiply,
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
        }, 3)

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
        physical.linearDamping = typeof _physicalDescription.linearDamping !== 'undefined' ? _physicalDescription.linearDamping : 0.1
        physical.angularDamping = typeof _physicalDescription.angularDamping !== 'undefined' ? _physicalDescription.angularDamping : 0.1

        // Body
        let rigidBodyDesc = this.game.RAPIER.RigidBodyDesc
        
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

        rigidBodyDesc.setLinearDamping(physical.linearDamping)

        rigidBodyDesc.setAngularDamping(physical.angularDamping)

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
            let colliderDescription = this.game.RAPIER.ColliderDesc

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
            if(typeof _physicalDescription.category !== 'undefined')
                category = _physicalDescription.category
            else if(typeof _colliderDescription.category !== 'undefined')
                category = _colliderDescription.category

            colliderDescription = colliderDescription.setCollisionGroups(this.categories[category])
            
            if(typeof _physicalDescription.onCollision === 'function' || typeof _physicalDescription.contactThreshold !== 'undefined')
            {
                colliderDescription = colliderDescription.setActiveEvents(this.game.RAPIER.ActiveEvents.CONTACT_FORCE_EVENTS)
                
                colliderDescription = colliderDescription.setContactForceEventThreshold(typeof _physicalDescription.contactThreshold !== 'undefined' ? _physicalDescription.contactThreshold : 15)

                if(typeof _physicalDescription.onCollision === 'function')
                    physical.onCollision = _physicalDescription.onCollision
            }

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
            const waterDepth = Math.max(- physical.body.translation().y, this.game.water.surfaceElevation)
            // physical.body.setGravityScale(1 + waterDepth * physical.waterGravityMultiplier)

            if(waterDepth > 0)
            {
                physical.body.setLinearDamping(1)
                physical.body.setAngularDamping(1)
            }
            else
            {
                physical.body.setLinearDamping(physical.linearDamping)
                physical.body.setAngularDamping(physical.angularDamping)
            }
        }
        
        // this.world.step()
        this.world.step(this.eventQueue)

        // // Works but not handy
        // this.eventQueue.drainCollisionEvents((handle1, handle2, started) =>
        // {
        //     if(started)
        //     {
        //         const collider1 = this.world.getCollider(handle1)
        //         const collider2 = this.world.getCollider(handle2)

        //         console.log('---')
        //         console.log(handle1)
        //         console.log(handle2)
        //         console.log(collider1)
        //         console.log(collider2)
        //     }
        // })

        // Doesn't work
        this.eventQueue.drainContactForceEvents(event =>
        {
            // Retrieve colliders
            const collider1 = this.world.getCollider(event.collider1())
            const collider2 = this.world.getCollider(event.collider2())

            // Retrieve bodies
            const body1 = collider1.parent()
            const body2 = collider2.parent()

            // Retrieve callbacks
            const callback1 = body1.userData?.object?.physical?.onCollision
            const callback2 = body2.userData?.object?.physical?.onCollision

            // Trigger callbacks with force
            if(typeof callback1 === 'function' || typeof callback2 === 'function')
            {
                const mass1 = body1.mass()
                const mass2 = body2.mass()
                const force = event.maxForceMagnitude() / (mass1 + mass2)
                
                const position1 = body1.translation()
                const position2 = body2.translation()
                
                const bodyPosition = (position1.x === 0 && position1.y === 0 && position1.z === 0) ? position2 : position1

                if(typeof callback1 === 'function')
                    callback1(force, bodyPosition)
                if(typeof callback2 === 'function')
                    callback2(force, bodyPosition)
            }
        })
    }
}