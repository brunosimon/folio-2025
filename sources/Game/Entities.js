import { Game } from './Game.js'
import { remapClamp } from './utilities/maths.js'

export class Entities
{
    constructor()
    {
        this.game = Game.getInstance()
        this.list = new Map()
        this.key = 0

        this.game.time.events.on('tick', () =>
        {
            this.update()
        }, 3)
    }

    add(_physicalDescription = null, _visual = null)
    {
        const entity = {
            physical: _physicalDescription ? this.game.physics.getPhysical(_physicalDescription) : null,
            visual: _visual
        }
        this.key++
        this.list.set(this.key, entity)

        if(_visual)
        {
            this.game.scene.add(_visual)

            // If sleeping or fixed apply transform directly
            if(_physicalDescription.sleeping || _physicalDescription.type === 'fixed')
            {
                entity.visual.position.copy(entity.physical.body.translation())
                entity.visual.quaternion.copy(entity.physical.body.rotation())
            }
        }

        return entity
    }

    addFromModels(_physicalModel, _visualModel, _physicalDescription = {})
    {
        const colliders = []

        // Visual
        _visualModel.traverse((_child) =>
        {
            if(_child.isMesh)
            {
                _child.castShadow = true
                _child.receiveShadow = true
            }
        })
        this.game.materials.updateObject(_visualModel)

        // Colliders
        for(const physical of _physicalModel.children)
        {
            let collidersOverload = {}
            if(typeof _physicalDescription.collidersOverload !== 'undefined')
                collidersOverload = _physicalDescription.collidersOverload

            colliders.push({
                shape: 'trimesh',
                parameters: [ physical.geometry.attributes.position.array, physical.geometry.index.array ],
                position: physical.position,
                quaternion: physical.quaternion,
                ...collidersOverload
            })
        }

        // Add
        this.add(
            {
                ..._physicalDescription,
                colliders: colliders
            },
            _visualModel
        )
    }

    update()
    {
        this.list.forEach((_entity) =>
        {
            if(_entity.visual)
            {
                if(!_entity.physical.body.isSleeping())
                {
                    _entity.visual.position.copy(_entity.physical.body.translation())
                    _entity.visual.quaternion.copy(_entity.physical.body.rotation())
                }
            }
        })
    }
}