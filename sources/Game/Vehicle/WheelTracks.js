import * as THREE from 'three'
import { Game } from '../Game.js'
import { WheelTrack } from './WheelTrack.js'

export class WheelTracks
{
    constructor()
    {
        this.game = new Game()

        this.resolution = 512
        this.size = 30
        this.halfSize = this.size / 2
        this.tracks = []
        
        this.camera = new THREE.OrthographicCamera(- this.halfSize,  this.halfSize,  this.halfSize, - this.halfSize, 0.1, 10)
        this.camera.position.y = 5
        this.camera.rotation.x = - Math.PI * 0.5
        
        this.scene = new THREE.Scene()
        this.scene.add(this.camera)

        this.group = new THREE.Group()
        this.scene.add(this.group)

        this.renderTarget = new THREE.RenderTarget(
            this.resolution,
            this.resolution,
            {
                minFilter: THREE.LinearFilter,
                magFilter: THREE.LinearFilter,
                wrapS: THREE.ClampToEdgeWrapping,
                wrapT: THREE.ClampToEdgeWrapping
            }
        )

        // this.debugPlaneCurrent = new THREE.Mesh(
        //     new THREE.PlaneGeometry(5, 5),
        //     new THREE.MeshBasicMaterial({ map: this.renderTarget.texture, transparent: false })
        // )
        // this.debugPlaneCurrent.position.y = 5
        // this.debugPlaneCurrent.position.x = - 3
        // this.game.scene.add(this.debugPlaneCurrent)
    }

    createTrack()
    {
        const track = new WheelTrack()
        this.tracks.push(track)
        this.group.add(track.trail.mesh)
        return track
    }

    update()
    {
        this.group.position.set(- this.game.vehicle.position.x, 0, - this.game.vehicle.position.z)

        // Render
        const clearAlpha = this.game.rendering.renderer.getClearAlpha()
        
        this.game.rendering.renderer.setClearAlpha(0)
        this.game.rendering.renderer.setRenderTarget(this.renderTarget)

        this.game.rendering.renderer.renderAsync(this.scene, this.camera)

        this.game.rendering.renderer.setRenderTarget(null)
        this.game.rendering.renderer.setClearAlpha(clearAlpha)
    }
}