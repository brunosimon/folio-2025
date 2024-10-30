import * as THREE from 'three/webgpu'
import CameraControls from 'camera-controls'
import { Game } from './Game.js'

CameraControls.install( { THREE: THREE } )

export class View
{
    constructor()
    {
        this.game = new Game()

        this.camera = new THREE.PerspectiveCamera(25, this.game.viewport.ratio, 0.1, 1000)
        this.camera.position.set(16, 5, 6)
        this.game.world.scene.add(this.camera)

        this.cameraControls = new CameraControls(this.camera, this.game.domElement)
        this.cameraControls.smoothTime = 0.075
        this.cameraControls.draggingSmoothTime = 0.075
        this.cameraControls.dollySpeed = 0.2

        this.game.time.events.on('tick', () =>
        {
            this.update()
        }, 3)

        this.game.viewport.events.on('change', () =>
        {
            this.resize()
        })
    }

    resize()
    {
        this.camera.aspect = this.game.viewport.width / this.game.viewport.height
        this.camera.updateProjectionMatrix()
    }

    update()
    {
        const vehicle = this.game.vehicle

        if(vehicle)
            this.cameraControls.setTarget(vehicle.position.x, vehicle.position.y, vehicle.position.z)
            
        this.cameraControls.update(this.game.time.delta)
    }
}