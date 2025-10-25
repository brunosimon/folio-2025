import * as THREE from 'three/webgpu'

import { Debug } from './Debug.js'
import { Inputs } from './Inputs/Inputs.js'
import { Physics } from './Physics/Physics.js'
import { Rendering } from './Rendering.js'
import { ResourcesLoader } from './ResourcesLoader.js'
import { Ticker } from './Ticker.js'
import { Time } from './Time.js'
import { Player } from './Player.js'
import { View } from './View.js'
import { Viewport } from './Viewport.js'
import { World } from './World/World.js'
import { Tracks } from './Tracks.js'
import { Monitoring } from './Monitoring.js'
import { Lighting } from './Ligthing.js'
import { Materials } from './Materials.js'
import { Objects } from './Objects.js'
import { Fog } from './Fog.js'
import { DayCycles } from './Cycles/DayCycles.js'
import { Weather } from './Weather.js'
import { Noises } from './Noises.js'
import { Wind } from './Wind.js'
import { Terrain } from './Terrain.js'
import { Explosions } from './Explosions.js'
import { YearCycles } from './Cycles/YearCycles.js'
import { Server } from './Server.js'
import { Modals } from './Modals.js'
import { PhysicsVehicle } from './Physics/PhysicsVehicle.js'
import { PhysicsWireframe } from './Physics/PhysicsWireframe.js'
import { Zones } from './Zones.js'
import { Overlay } from './Overlay.js'
import { Tornado } from './Tornado.js'
import { InteractivePoints } from './InteractivePoints.js'
import { Respawns } from './Respawns.js'
import { Audio } from './Audio.js'
import { ClosingManager } from './ClosingManager.js'
import { RayCursor } from './RayCursor.js'
import { Water } from './Water.js'
import { Reveal } from './Reveal.js'
import { KonamiCode } from './KonamiCode.js'
import { Achievements } from './Achievements.js'

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

        this.init()
    }

    async init()
    {
        // Setup
        this.domElement = document.querySelector('.game')
        this.canvasElement = this.domElement.querySelector('.js-canvas')

        // First batch for intro
        this.resourcesLoader = new ResourcesLoader()
        this.resources = await this.resourcesLoader.load([
            [ 'respawnsReferencesModel', 'respawns/respawnsReferences.glb', 'gltf' ],
        ])
        this.scene = new THREE.Scene()
        this.debug = new Debug()
        this.server = new Server()
        this.ticker = new Ticker()
        this.time = new Time()
        this.inputs = new Inputs([], [ 'intro' ])
        this.rayCursor = new RayCursor()
        this.viewport = new Viewport(this.domElement)
        this.modals = new Modals()
        this.respawns = new Respawns(import.meta.env.VITE_PLAYER_SPAWN || 'landing')
        this.view = new View()
        this.reveal = new Reveal()
        this.rendering = new Rendering()
        await this.rendering.init()
        this.noises = new Noises()
        this.dayCycles = new DayCycles()
        this.yearCycles = new YearCycles()
        this.weather = new Weather()
        this.wind = new Wind()
        this.tracks = new Tracks()
        this.lighting = new Lighting()
        this.fog = new Fog()
        this.water = new Water()
        this.materials = new Materials()
        this.objects = new Objects()
        this.explosions = new Explosions()
        this.world = new World()

        // Load and init RAPIER
        const rapierPromise = import('@dimforge/rapier3d')

        // Load rest of resources
        const resourcesPromise = this.resourcesLoader.load(
            [
                [ 'introClickTexture',                     'intro/click.png',                                      'texture' ],
                [ 'foliageTexture',                        'foliage/foliageSDF.png',                               'texture' ],
                [ 'bushesReferences',                      'bushes/bushesReferences.glb',                          'gltf'    ],
                [ 'vehicle',                               'vehicle/default.glb',                                  'gltf'    ],
                [ 'playgroundVisual',                      'playground/playgroundVisual.glb',                      'gltf'    ],
                [ 'playgroundPhysical',                    'playground/playgroundPhysical.glb',                    'gltf'    ],
                [ 'flowersReferencesModel',                'flowers/flowersReferences.glb',                        'gltf'    ],
                [ 'bricksReferencesModel',                 'bricks/bricksReferences.glb',                          'gltf'    ],
                [ 'bricksVisualModel',                     'bricks/bricksVisual.glb',                              'gltf'    ],
                [ 'cratesModel',                           'crates/crates.glb',                                    'gltf'    ],
                [ 'terrainTexture',                        'terrain/terrain.png',                                  'texture', (resource) => { resource.flipY = false; } ],
                [ 'terrainModel',                          'terrain/terrain.glb',                                  'gltf'    ],
                [ 'floorSlabsTexture',                     'floor/slabs.png',                                      'texture', (resource) => { resource.wrapS = THREE.RepeatWrapping; resource.wrapT = THREE.RepeatWrapping; resource.minFilter = THREE.LinearFilter; resource.magFilter = THREE.LinearFilter; resource.generateMipmaps = false } ],
                [ 'birchTreesVisualModel',                 'birchTrees/birchTreesVisual.glb',                      'gltf'    ],
                [ 'birchTreesReferencesModel',             'birchTrees/birchTreesReferences.glb',                  'gltf'    ],
                [ 'oakTreesVisualModel',                   'oakTrees/oakTreesVisual.glb',                          'gltf'    ],
                [ 'oakTreesReferencesModel',               'oakTrees/oakTreesReferences.glb',                      'gltf'    ],
                [ 'cherryTreesVisualModel',                'cherryTrees/cherryTreesVisual.glb',                    'gltf'    ],
                [ 'cherryTreesReferencesModel',            'cherryTrees/cherryTreesReferences.glb',                'gltf'    ],
                [ 'areasModel',                            'areas/areas.glb',                                      'gltf'    ],
                [ 'poleLightsVisualModel',                 'poleLights/poleLightsVisual.glb',                      'gltf'    ],
                [ 'poleLightsPhysicalModel',               'poleLights/poleLightsPhysical.glb',                    'gltf'    ],
                [ 'whisperFlameTexture',                   'whispers/whisperFlame.png',                            'texture' ],
                [ 'satanStarTexture',                      'areas/satanStar.png',                                  'texture' ],
                [ 'tornadoPathModel',                      'tornado/tornadoPath.glb',                              'gltf'    ],
                [ 'overlayPatternTexture',                 'overlay/overlayPattern.png',                           'texture', (resource) => { resource.wrapS = THREE.RepeatWrapping; resource.wrapT = THREE.RepeatWrapping; resource.magFilter = THREE.NearestFilter; resource.minFilter = THREE.NearestFilter } ],
                [ 'interactivePointsKeyIconCrossTexture',  'interactivePoints/interactivePointsKeyIconCross.png',  'texture', (resource) => { resource.flipY = true; resource.minFilter = THREE.NearestFilter; resource.magFilter = THREE.NearestFilter; resource.generateMipmaps = false } ],
                [ 'interactivePointsKeyIconEnterTexture',  'interactivePoints/interactivePointsKeyIconEnter.png',  'texture', (resource) => { resource.flipY = true; resource.minFilter = THREE.NearestFilter; resource.magFilter = THREE.NearestFilter; resource.generateMipmaps = false } ],
                [ 'interactivePointsKeyIconATexture',      'interactivePoints/interactivePointsKeyIconA.png',      'texture', (resource) => { resource.flipY = true; resource.minFilter = THREE.NearestFilter; resource.magFilter = THREE.NearestFilter; resource.generateMipmaps = false } ],
                [ 'jukeboxMusicNotes',                     'jukebox/jukeboxMusicNotes.png',                        'texture', (resource) => {  } ],
                [ 'behindTheSceneStars',                   'behindTheScene/stars.png',                             'texture', (resource) => { resource.colorSpace = THREE.SRGBColorSpace; resource.minFilter = THREE.NearestFilter; resource.magFilter = THREE.NearestFilter; resource.generateMipmaps = false; resource.wrapS = THREE.RepeatWrapping; resource.wrapT = THREE.RepeatWrapping;  } ],
            ],
            (toLoad, total) =>
            {
                this.world.introLoader.updateProgress(1 - toLoad / total)
            }
        )

        const [ newResources, RAPIER ] = await Promise.all([ resourcesPromise, rapierPromise ])
        this.RAPIER = RAPIER
        this.resources = { ...newResources, ...this.resources }

        this.terrain = new Terrain()
        this.physics = new Physics()
        this.wireframe = new PhysicsWireframe()
        this.physicalVehicle = new PhysicsVehicle()
        this.zones = new Zones()
        this.player = new Player()
        this.tornado = new Tornado()
        this.interactivePoints = new InteractivePoints()
        this.overlay = new Overlay()
        this.closingManager = new ClosingManager()
        this.konamiCode = new KonamiCode()
        this.achievements = new Achievements()
        // this.monitoring = new Monitoring()
        this.world.init(1)

        this.ticker.wait(3, () =>
        {
            this.reveal.step(0)
        })
    }
}

