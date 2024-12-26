import RAPIER from '@dimforge/rapier3d-compat'
import * as THREE from 'three/webgpu'

import { Debug } from './Debug.js'
import { Inputs } from './Inputs.js'
import { Physics } from './Physics/Physics.js'
import { Rendering } from './Rendering.js'
import { ResourcesLoader } from './ResourcesLoader.js'
import { Time } from './Time.js'
import { Vehicle } from './Vehicle.js'
import { View } from './View.js'
import { Viewport } from './Viewport.js'
import { World } from './World/World.js'
import { GroundData } from './GroundData/GroundData.js'
import { Monitoring } from './Monitoring.js'
import { Lighting } from './Ligthing.js'
import { Materials } from './Materials.js'
import { Entities } from './Entities.js'
import { Fog } from './Fog.js'
import { Cycles } from './Cycles.js'

export class Game
{
    static getInstance()
    {
        return Game.instance
    }

    constructor()
    {
        // Singleton
        if(Game.instance)
            return Game.instance

        Game.instance = this

        // Rapier init
        RAPIER.init().then(() =>
        {
            // Load resources
            this.resourcesLoader = new ResourcesLoader()
            this.resourcesLoader.load(
                [
                    { path: 'bushes/bushesLeaves.png', type: 'texture', name: 'bushesLeaves' },
                    { path: 'bushes/bushes.glb', type: 'gltf', name: 'bushes' },
                    { path: 'noises-256x256.png', type: 'texture', name: 'noisesTexture' },
                    { path: 'vehicle/default.glb', type: 'gltf', name: 'vehicle' },
                    { path: 'playground/playgroundVisual.glb', type: 'gltf', name: 'playgroundVisual' },
                    { path: 'playground/playgroundPhysical.glb', type: 'gltf', name: 'playgroundPhysical' },
                    { path: 'floor/keys.png', type: 'texture', name: 'floorKeysTexture' },
                    { path: 'bricks/bricksReferences.glb', type: 'gltf', name: 'bricksReferencesModel' },
                    { path: 'bricks/bricksVisual.glb', type: 'gltf', name: 'bricksVisualModel' },
                    { path: 'terrain/terrain.png', type: 'texture', name: 'terrainTexture' },
                    { path: 'terrain/terrain.glb', type: 'gltf', name: 'terrainModel' },
                    
                    { path: 'christmas/christmasTreeVisual.glb', type: 'gltf', name: 'christmasTreeVisualModel' },
                    { path: 'christmas/christmasTreePhysical.glb', type: 'gltf', name: 'christmasTreePhysicalModel' },
                    { path: 'christmas/christmasGiftVisual.glb', type: 'gltf', name: 'christmasGiftVisualModel' },
                    { path: 'christmas/christmasGiftReferences.glb', type: 'gltf', name: 'christmasGiftReferencesModel' },
                ],
                (resources) =>
                {
                    this.resources = resources

                    this.resources.noisesTexture.wrapS = THREE.RepeatWrapping
                    this.resources.noisesTexture.wrapT = THREE.RepeatWrapping

                    this.resources.terrainTexture.flipY = false

                    // Init
                    this.init()
                }
            )
        })
    }

    init()
    {
        // Setup
        this.domElement = document.querySelector('.game')

        this.scene = new THREE.Scene()

        this.debug = new Debug()
        this.time = new Time()
        this.inputs = new Inputs([
            { name: 'forward', keys: [ 'ArrowUp', 'KeyW' ] },
            { name: 'right', keys: [ 'ArrowRight', 'KeyD' ] },
            { name: 'backward', keys: [ 'ArrowDown', 'KeyS' ] },
            { name: 'left', keys: [ 'ArrowLeft', 'KeyA' ] },
            { name: 'boost', keys: [ 'ShiftLeft', 'ShiftRight' ] },
            { name: 'brake', keys: [ 'KeyB' ] },
            { name: 'reset', keys: [ 'KeyR' ] },
            { name: 'hydraulics', keys: [ 'Numpad5', 'Space' ] },
            { name: 'hydraulicsFront', keys: [ 'Numpad8' ] },
            { name: 'hydraulicsBack', keys: [ 'Numpad2' ] },
            { name: 'hydraulicsRight', keys: [ 'Numpad6' ] },
            { name: 'hydraulicsLeft', keys: [ 'Numpad4' ] },
            { name: 'hydraulicsFrontLeft', keys: [ 'Numpad7' ] },
            { name: 'hydraulicsFrontRight', keys: [ 'Numpad9' ] },
            { name: 'hydraulicsBackRight', keys: [ 'Numpad3' ] },
            { name: 'hydraulicsBackLeft', keys: [ 'Numpad1' ] },
            { name: 'close', keys: [ 'Escape' ] },
        ])
        this.viewport = new Viewport(this.domElement)
        // this.sounds = new Sounds()
        this.cycles = new Cycles()
        this.lighting = new Lighting()
        this.fog = new Fog()
        this.materials = new Materials()
        this.entities = new Entities()
        this.physics = new Physics()
        this.groundData = new GroundData()
        this.view = new View()
        this.vehicle = new Vehicle()
        this.world = new World()
        this.rendering = new Rendering()
        // this.monitoring = new Monitoring()

        this.rendering.renderer.setAnimationLoop((elapsedTime) => { this.time.update(elapsedTime) })
    }
}

