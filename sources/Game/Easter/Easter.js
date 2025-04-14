import * as THREE from 'three/webgpu'
import { Game } from '../Game.js'
import { InstancedGroup } from '../InstancedGroup.js'
import { cameraPosition, color, Fn, luminance, mix, normalWorld, positionWorld, uniform, uv, vec3, vec4 } from 'three/tsl'

export class Easter
{
    constructor()
    {
        this.game = Game.getInstance()

        this.setVisual()


        // References
        const references = InstancedGroup.getReferencesFromChildren(this.game.resources.easterEggReferencesModel.scene.children)
        console.log(references)
        
        for(const reference of references)
        {
        }

        // this.game.entities.add(
        //     {
        //         model: model,
        //         parent: null
        //     },
        //     null
        // )
        // // model.removeFromParent()

        // Instanced group
        this.testInstancedGroup = new InstancedGroup(references, this.visual, true)
    }

    setVisual()
    {
        const colorA = uniform(color('#ff8641'))
        const colorB = uniform(color('#ff3e00'))
        const intensity = uniform(5)

        /**
         * Egg
         */
        // Material
        const eggMaterial = new THREE.MeshBasicNodeMaterial({ transparent: true })

        eggMaterial.outputNode = Fn(() =>
        {
            const viewDirection = positionWorld.sub(cameraPosition).normalize()
                
            const fresnel = viewDirection.dot(normalWorld).abs().oneMinus().toVar()

            const mixedColor = mix(colorB, colorA, fresnel)

            return vec4(vec3(mixedColor.mul(intensity)), 1)
        })()

        // Mesh
        const egg = this.game.resources.easterEggVisualModel.scene.getObjectByName('egg')
        egg.position.set(0, 0, 0)
        egg.frustumCulled = false
        egg.material = eggMaterial
        
        /**
         * Beams
         */
        // Material
        const beamsMaterial = new THREE.MeshBasicNodeMaterial({ transparent: true })

        beamsMaterial.outputNode = Fn(() =>
        {
            const strength = uv().y.add(this.game.ticker.elapsedScaledUniform.mul(0.05)).fract()

            strength.greaterThan(0.2).discard()

            const mixStrength = strength.mul(5).toVar()
            const mixedColor = mix(colorA, colorB, mixStrength)

            return vec4(vec3(mixedColor.mul(intensity)), 1)

            return vec4(vec3(mixedColor.mul(intensity)), 1)
        })()

        // Mesh
        const beams = this.game.resources.easterEggVisualModel.scene.getObjectByName('beams')
        beams.position.set(0, 0, 0)
        beams.frustumCulled = false
        beams.material = beamsMaterial
        
        this.visual = this.game.resources.easterEggVisualModel.scene
    }
}

