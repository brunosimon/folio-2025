import * as THREE from 'three/webgpu'
import { Game } from '../Game.js'
import MeshGridMaterial, { MeshGridMaterialLine } from '../Materials/MeshGridMaterial.js'
import { float, normalWorld, positionWorld, vec3, vec4 } from 'three/tsl'
import { MeshDefaultMaterial } from '../Materials/MeshDefaultMaterial.js'
import { Fn } from 'three/tsl'

export class Grid
{
    constructor()
    {
        this.game = Game.getInstance()

        if(this.game.debug.active)
        {
            this.debugPanel = this.game.debug.panel.addFolder({
                title: '🌐 Grid',
                expanded: false,
            })
        }

        this.setVisual()
    }

    setVisual()
    {
        const lines = [
            // new MeshGridMaterialLine(0x705df2, 1, 0.03, 0.2),
            // new MeshGridMaterialLine(0xffffff, 10, 0.003, 1),
            new MeshGridMaterialLine('#8d55ff', 10, 0.02, 0.2),
            new MeshGridMaterialLine('#675369', 100, 0.002, 1),
        ]

        const uvGridMaterial = new MeshGridMaterial({
            color: 0x1b191f,
            scale: 0.001,
            antialiased: true,
            reference: 'uv', // uv | world
            side: THREE.DoubleSide,
            lines
        })

        const defaultMaterial = new MeshDefaultMaterial({
            colorNode: uvGridMaterial.outputNode.rgb,
            hasWater: false,
            hasReveal: false,
            hasLightBounce: false
        })
        
        uvGridMaterial.outputNode = Fn(() =>
        {
            const distanceToCenter = positionWorld.xz.sub(this.game.reveal.position2Uniform).length()
            distanceToCenter.lessThan(this.game.reveal.distance).discard()

            return defaultMaterial.outputNode
        })()

        this.mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(100, 100),
            uvGridMaterial
        )
        this.mesh.position.y = 0
        this.mesh.rotation.x = - Math.PI * 0.5

        const defaultRespawn = this.game.respawns.getDefault()
        this.mesh.position.x = defaultRespawn.position.x
        this.mesh.position.z = defaultRespawn.position.z
        
        this.game.worldContainer.add(this.mesh)

        // Debug
        if(this.game.debug.active)
        {
            this.debugPanel.addBinding(uvGridMaterial, 'scale', { min: 0, max: 0.002, step: 0.0001 })

            for(const line of lines)
            {
                const lineDebugPanel = this.debugPanel.addFolder({
                    title: 'Line',
                    expanded: false,
                })
                lineDebugPanel.addBinding(line.scale, 'value', { label: 'scale', min: 0, max: 1, step: 0.001 })
                lineDebugPanel.addBinding(line.thickness, 'value', { label: 'thickness', min: 0, max: 1, step: 0.001 })
                lineDebugPanel.addBinding(line.offset, 'value', { label: 'offset', min: 0, max: 1, step: 0.001 })
                lineDebugPanel.addBinding(line.cross, 'value', { label: 'cross', min: 0, max: 1, step: 0.001 })
                lineDebugPanel.addBinding({ color: '#' + line.color.value.getHexString(THREE.SRGBColorSpace) }, 'color').on('change', tweak => line.color.value.set(tweak.value))
            }
        }
    }

    show()
    {
        this.game.worldContainer.add(this.mesh)
    }

    destroy()
    {
        this.mesh.material.dispose()
        this.mesh.geometry.dispose()
        this.mesh.removeFromParent()
    }
}