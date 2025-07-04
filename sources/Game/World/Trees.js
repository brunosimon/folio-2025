import * as THREE from 'three/webgpu'
import { Game } from '../Game.js'
import { Foliage } from './Foliage.js'

export class Trees
{
    constructor(name, visual, references, color)
    {
        this.game = Game.getInstance()

        // Debug
        if(this.game.debug.active)
        {
            this.debugPanel = this.game.debug.panel.addFolder({
                title: `🌳 ${name}`,
                expanded: false,
            })
        }

        this.visual = visual
        this.references = references
        this.color = color

        this.setModelParts()
        this.setBodies()
        this.setLeaves()
        this.setPhysical()
    }

    setModelParts()
    {
        this.modelParts = {}
        this.modelParts.leaves = []
        this.modelParts.body = null
        
        this.visual.traverse((_child) =>
        {
            if(_child.isMesh)
            {
                if(_child.name.startsWith('treeLeaves'))
                    this.modelParts.leaves.push(_child)
                else if(_child.name.startsWith('treeBody'))
                    this.modelParts.body = _child
            }
        })
    }

    setBodies()
    {
        this.game.materials.updateObject(this.modelParts.body)
        this.bodies = new THREE.InstancedMesh(this.modelParts.body.geometry, this.modelParts.body.material, this.references.length)
        this.bodies.instanceMatrix.setUsage(THREE.StaticDrawUsage)
        this.bodies.castShadow = true
        this.bodies.receiveShadow = true
        
        let i = 0
        for(const treeReference of this.references)
        {
            this.bodies.setMatrixAt(i, treeReference.matrix)
            i++
        }

        this.game.scene.add(this.bodies)
    }

    setLeaves()
    {
        const references = []
        
        for(const treeReference of this.references)
        {
            for(const leaves of this.modelParts.leaves)
            {
                const finalMatrix = leaves.matrix.clone().premultiply(treeReference.matrixWorld)
                const reference = new THREE.Object3D()
                reference.applyMatrix4(finalMatrix)

                references.push(reference)
            }
        }

        this.leavesColor = new THREE.Color(this.color)
        this.leaves = new Foliage(references, this.leavesColor, true)

        // Debug
        if(this.game.debug.active)
        {
            this.game.debug.addThreeColorBinding(this.debugPanel, this.leavesColor, 'leavesColor')
            this.debugPanel.addBinding(this.leaves.material.shadowOffset, 'value', { label: 'shadowOffset', min: 0, max: 2, step: 0.001 })
            this.debugPanel.addBinding(this.leaves.material.threshold, 'value', { label: 'threshold', min: 0, max: 1, step: 0.001 })
            this.debugPanel.addBinding(this.leaves.material.seeThroughEdgeMin, 'value', { label: 'seeThroughEdgeMin', min: 0, max: 1, step: 0.001 })
            this.debugPanel.addBinding(this.leaves.material.seeThroughEdgeMax, 'value', { label: 'seeThroughEdgeMax', min: 0, max: 1, step: 0.001 })
            this.debugPanel.addBinding(this.leaves.material.seeThroughTresholdAmplitude, 'value', { label: 'seeThroughTresholdAmplitude', min: 0, max: 1, step: 0.001 })
            this.debugPanel.addBinding(this.leaves.material.seeThroughNoiseFrequency, 'value', { label: 'seeThroughNoiseFrequency', min: 0, max: 1, step: 0.001 })
            this.debugPanel.addBinding(this.leaves.material.seeThroughNoiseStrength, 'value', { label: 'seeThroughNoiseStrength', min: 0, max: 1, step: 0.001 })
        }
    }

    setPhysical()
    {
        for(const treeReference of this.references)
        {
            this.game.entities.add(
                null,
                {
                    type: 'fixed',
                    position: treeReference.position.add(new THREE.Vector3(0, 2.5, 0)),
                    rotation: treeReference.quaternion,
                    friction: 0.7,
                    sleeping: true,
                    colliders: [ { shape: 'cylinder', parameters: [ 2.5, 0.15 ], category: 'object' } ]
                }
            )
        }
    }
}