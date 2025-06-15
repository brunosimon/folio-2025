import RAPIER from '@dimforge/rapier3d-simd-compat'
import * as THREE from 'three/webgpu'

import { Debug } from './Debug.js'
import { Inputs } from './Inputs.js'
import { Physics } from './Physics/Physics.js'
import { Rendering } from './Rendering.js'
import { ResourcesLoader } from './ResourcesLoader.js'
import { Ticker } from './Ticker.js'
import { Time } from './Time.js'
import { Player } from './Player.js'
import { View } from './View.js'
import { Viewport } from './Viewport.js'
import { World } from './World/World.js'
import { GroundData } from './GroundData/GroundData.js'
import { Monitoring } from './Monitoring.js'
import { Lighting } from './Ligthing.js'
import { Materials } from './Materials.js'
import { Entities } from './Entities.js'
import { Fog } from './Fog.js'
import { DayCycles } from './Cycles/DayCycles.js'
import { Weather } from './Weather.js'
import { Noises } from './Noises.js'
import { Wind } from './Wind.js'
import { TerrainData } from './TerrainData.js'
import { Explosions } from './Explosions.js'
import { YearCycles } from './Cycles/YearCycles.js'
import { Server } from './Server.js'
import { Modals } from './Modals.js'
import { PhysicsVehicle } from './Physics/PhysicsVehicle.js'
import { PhysicsWireframe } from './Physics/PhysicsWireframe.js'
import { Areas } from './Areas.js'
import { Overlay } from './Overlay.js'
import { Tornado } from './Tornado.js'
import { InteractiveAreas } from './InteractiveAreas.js'
import { Respawns } from './Respawns.js'
import { Audio } from './Audio.js'
import { ClosingManager } from './ClosingManager.js'
import { Cursor } from './Cursor.js'

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
        console.log('init')

        // Rapier init
        RAPIER.init().then(() =>
        {
            console.log('initiated')
            console.log(RAPIER)

            // Load resources
            this.resourcesLoader = new ResourcesLoader()
            this.resourcesLoader.load(
                [
                    [ 'foliateTexture',                 'foliage/foliageSDF.png',                       'texture' ],
                    [ 'bushesReferences',               'bushes/bushesReferences.glb',                  'gltf'    ],
                    [ 'vehicle',                        'vehicle/default.glb',                          'gltf'    ],
                    // [ 'vehicle',                        'vehicle/defaultAntenna.glb',                   'gltf'    ],
                    [ 'playgroundVisual',               'playground/playgroundVisual.glb',              'gltf'    ],
                    [ 'playgroundPhysical',             'playground/playgroundPhysical.glb',            'gltf'    ],
                    [ 'floorKeysTexture',               'floor/keys.png',                               'texture' ],
                    [ 'flowersReferencesModel',         'flowers/flowersReferences.glb',                'gltf'    ],
                    [ 'bricksReferencesModel',          'bricks/bricksReferences.glb',                  'gltf'    ],
                    [ 'bricksVisualModel',              'bricks/bricksVisual.glb',                      'gltf'    ],
                    [ 'terrainTexture',                 'terrain/terrain.png',                          'texture' ],
                    // [ 'terrainTexture',                 'terrain/flatGrass.png',                        'texture' ],
                    [ 'terrainModel',                   'terrain/terrain.glb',                          'gltf'    ],
                    [ 'birchTreesVisualModel',          'birchTrees/birchTreesVisual.glb',              'gltf'    ],
                    [ 'birchTreesReferencesModel',      'birchTrees/birchTreesReferences.glb',          'gltf'    ],
                    [ 'oakTreesVisualModel',            'oakTrees/oakTreesVisual.glb',                  'gltf'    ],
                    [ 'oakTreesReferencesModel',        'oakTrees/oakTreesReferences.glb',              'gltf'    ],
                    [ 'cherryTreesVisualModel',         'cherryTrees/cherryTreesVisual.glb',            'gltf'    ],
                    [ 'cherryTreesReferencesModel',     'cherryTrees/cherryTreesReferences.glb',        'gltf'    ],
                    [ 'sceneryStaticModel',             'scenery/sceneryStatic.glb',                    'gltf'    ],
                    // [ 'sceneryStaticModel',             'scenery/sceneryStaticOptimized.glb',           'gltf'    ],
                    [ 'sceneryDynamicModel',            'scenery/sceneryDynamic.glb',                   'gltf'    ],
                    [ 'poleLightsVisualModel',          'poleLights/poleLightsVisual.glb',              'gltf'    ],
                    [ 'poleLightsPhysicalModel',        'poleLights/poleLightsPhysical.glb',            'gltf'    ],
                    [ 'whisperFlameTexture',            'whispers/whisperFlame.png',                    'texture' ],
                    [ 'satanStarTexture',               'scenery/satanStar.png',                        'texture' ],
                    [ 'tornadoPathModel',               'tornado/tornadoPath.glb',                      'gltf'    ],
                    [ 'overlayPatternTexture',          'overlay/overlayPattern.png',                   'texture', (resource) => { resource.wrapS = THREE.RepeatWrapping; resource.wrapT = THREE.RepeatWrapping } ],
                    [ 'cookieBannerTexture',            'cookieStand/cookieBanner.png',                 'texture', (resource) => { resource.colorSpace = THREE.SRGBColorSpace; resource.flipY = false } ],
                    [ 'interactiveAreasKeyIconTexture', 'interactiveAreas/interactiveAreasKeyIcon.png', 'texture', (resource) => { resource.flipY = true; resource.minFilter = THREE.NearestFilter; resource.magFilter = THREE.NearestFilter; resource.generateMipmaps = false } ],
                    [ 'respawnsModel',                  'respawns/respawns.glb',                        'gltf'    ],

                    // [ 'easterEggVisualModel',           'easter/easterEggVisual.glb',                   'gltf'    ],
                    // [ 'easterEggReferencesModel',       'easter/easterEggReferences.glb',               'gltf'    ],
                    
                    // [ 'christmasTreeVisualModel',     'christmas/christmasTreeVisual.glb',     'gltf' ],
                    // [ 'christmasTreePhysicalModel',   'christmas/christmasTreePhysical.glb',   'gltf' ],
                    // [ 'christmasGiftVisualModel',     'christmas/christmasGiftVisual.glb',     'gltf' ],
                    // [ 'christmasGiftReferencesModel', 'christmas/christmasGiftReferences.glb', 'gltf' ],
                ],
                (resources) =>
                {
                    console.log('loaded')
                    this.resources = resources

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

        this.server = new Server()
        this.ticker = new Ticker()
        this.inputs = new Inputs()
        this.cursor = new Cursor()
        this.debug = new Debug()
        this.time = new Time()
        this.viewport = new Viewport(this.domElement)
        this.modals = new Modals()
        this.view = new View()
        this.rendering = new Rendering(() =>
        {
            this.noises = new Noises()
            this.audio = new Audio()
            this.dayCycles = new DayCycles()
            this.yearCycles = new YearCycles()
            this.weather = new Weather()
            this.wind = new Wind()
            this.groundData = new GroundData()
            this.terrainData = new TerrainData()
            this.lighting = new Lighting()
            this.fog = new Fog()
            this.materials = new Materials()
            this.entities = new Entities()
            this.explosions = new Explosions()
            this.tornado = new Tornado()
            this.physics = new Physics()
            this.wireframe = new PhysicsWireframe()
            this.physicalVehicle = new PhysicsVehicle()
            this.areas = new Areas()
            this.respawns = new Respawns()
            this.player = new Player()
            this.interactiveAreas = new InteractiveAreas()
            this.world = new World()
            this.overlay = new Overlay()
            this.closingManager = new ClosingManager()
            // this.monitoring = new Monitoring()

            this.rendering.renderer.setAnimationLoop((elapsedTime) => { this.ticker.update(elapsedTime) })
        })
    }
}

