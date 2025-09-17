import * as THREE from 'three/webgpu'
import { Game } from '../Game.js'
import { color, float, frontFacing, If, max, mix, normalWorld, positionWorld, vec3, vec4 } from 'three/tsl'
import { Fn } from 'three/src/nodes/TSL.js'

export class MeshDefaultMaterial extends THREE.MeshLambertNodeMaterial
{
    constructor(parameters = {})
    {
        super()

        this.game = Game.getInstance()

        this.depthWrite = parameters.depthWrite ?? true
        this.depthTest = parameters.depthTest ?? true
        this.side = parameters.side ?? THREE.FrontSide
        this.wireframe = parameters.wireframe ?? false
        this.transparent = parameters.transparent ?? false
        this.shadowSide = parameters.shadowSide ?? THREE.FrontSide

        this.hasCoreShadows = parameters.hasCoreShadows ?? true
        this.hasDropShadows = parameters.hasDropShadows ?? true
        this.hasLightBounce = parameters.hasLightBounce ?? true
        this.hasFog = parameters.hasFog ?? true
        this.hasWater = parameters.hasWater ?? true

        this._colorNode = parameters.colorNode ?? color(0xffffff)
        this._normalNode = parameters.normalNode ?? normalWorld
        this._alphaNode = parameters.alphaNode ?? float(1)
        this._shadowNode = parameters.shadowNode ?? float(0)
        this.alphaTest = parameters.alphaTest ?? 0.1

        this.normalNode = this._normalNode // Get rid of warning
        
        /**
         * Shadow catcher
         * Catch shadow as a float and remove it from initial pipeline
         */
        const catchedShadow = float(1).toVar()

        if(this.hasDropShadows)
        {
            this.receivedShadowNode = Fn(([ shadow ]) => 
            {
                catchedShadow.mulAssign(shadow.r)
                return float(1)
            })
        }

        /**
         * Output node
         */
        this.outputNode = Fn(() =>
        {
            const baseColor = this._colorNode.toVar()
            const outputColor = this._colorNode.toVar()
            // outputColor.assign(vec3(0))
            // outputColor.assign(vec3(0.8))

            // Normal orientation
            const reorientedNormal = this._normalNode.toVar()
            // if(this.side === THREE.DoubleSide || this.side === THREE.BackSide)
            // {
            //     If(frontFacing.not(), () => { reorientedNormal.mulAssign(-1) })
            // }

            // Light bounce
            if(this.hasLightBounce)
            {
                const bounceOrientation = reorientedNormal.dot(vec3(0, - 1, 0)).smoothstep(this.game.lighting.lightBounceEdgeLow, this.game.lighting.lightBounceEdgeHigh)
                const bounceDistance = this.game.lighting.lightBounceDistance.sub(max(0, positionWorld.y)).div(this.game.lighting.lightBounceDistance).max(0).pow(2)
                const terrainData = this.game.terrain.terrainNode(positionWorld.xz)
                const bounceColor = this.game.terrain.colorNode(terrainData)
                outputColor.assign(mix(outputColor, bounceColor, bounceOrientation.mul(bounceDistance).mul(this.game.lighting.lightBounceMultiplier)))
            }

            // Water
            if(this.hasWater)
            {
                const nearWaterSurface = positionWorld.y.sub(this.game.water.elevationUniform).abs().greaterThan(this.game.water.amplitudeUniform)
                outputColor.assign(nearWaterSurface.select(outputColor, color('#ffffff')))
                baseColor.assign(nearWaterSurface.select(baseColor, color('#ffffff')))
            }

            // Light
            outputColor.assign(outputColor.mul(this.game.lighting.colorUniform.mul(this.game.lighting.intensityUniform)))

            // Core shadow
            let coreShadowMix = float(0)
            if(this.hasCoreShadows)
                coreShadowMix = reorientedNormal.dot(this.game.lighting.directionUniform).smoothstep(this.game.lighting.coreShadowEdgeHigh, this.game.lighting.coreShadowEdgeLow)
            
            // Cast shadow
            let dropShadowMix = float(0)
            if(this.hasDropShadows)
                dropShadowMix = catchedShadow.oneMinus()

            // Combined shadows
            if(this.hasCoreShadows || this.hasDropShadows)
            {
                const combinedShadowMix = max(coreShadowMix, dropShadowMix, this._shadowNode).clamp(0, 1)
                
                const shadowColor = baseColor.rgb.mul(this.game.lighting.shadowColor).rgb
                outputColor.assign(mix(outputColor, shadowColor, combinedShadowMix))
            }
            
            // Fog
            if(this.hasFog)
                outputColor.assign(this.game.fog.strength.mix(outputColor, this.game.fog.color))

            // Alpha test discard
            this._alphaNode.lessThan(this.alphaTest).discard()

            // Output
            return vec4(outputColor, this._alphaNode)
        })()
    }
}