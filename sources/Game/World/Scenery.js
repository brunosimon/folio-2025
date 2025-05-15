import * as THREE from 'three/webgpu'
import { Game } from '../Game.js'
import { Flowers } from './Flowers.js'
import { Bricks } from './Bricks.js'
import { Trees } from './Trees.js'
import { Bushes } from './Bushes.js'
import { PoleLights } from './PoleLights.js'
import { Playground } from './Playground.js'
import { Christmas } from './Christmas.js'
import { Altar } from './Altar.js'
import { CookieStand } from './CookieStand.js'
import { Bonfire } from './Bonfire.js'
import { Intro } from './Intro.js'
import { Controls } from './Controls.js'
import { Projects } from './Projects.js'

export class Scenery
{
    constructor()
    {
        this.game = Game.getInstance()

        if(this.game.debug.active)
        {
            this.debugPanel = this.game.debug.panel.addFolder({
                title: '🛋️ Scenery',
                expanded: false,
            })
        }

        this.setStaticObjects()
        this.setDynamicsObjects()

        this.bushes = new Bushes()
        this.birchTrees = new Trees('Birch Tree', this.game.resources.birchTreesVisualModel.scene, this.game.resources.birchTreesReferencesModel.scene.children, '#ff782b')
        this.oakTrees = new Trees('Oak Tree', this.game.resources.oakTreesVisualModel.scene, this.game.resources.oakTreesReferencesModel.scene.children, '#c4c557')
        this.cherryTrees = new Trees('Cherry Tree', this.game.resources.cherryTreesVisualModel.scene, this.game.resources.cherryTreesReferencesModel.scene.children, '#ff6da8')
        this.flowers = new Flowers()
        this.bricks = new Bricks()

        if(
            this.references.projectsCarpet &&
            this.references.projectsInteractiveArea &&
            this.references.projectsTitle &&
            this.references.projectsUrl &&
            this.references.projectsImages &&
            this.references.projectsPrevious &&
            this.references.projectsNext &&
            this.references.projectsAttributes &&
            this.references.projectsPagination &&
            this.references.projectsDistinctions
        )
            this.projects = new Projects({
                carpet: this.references.projectsCarpet[0],
                interactiveAreaPosition: this.references.projectsInteractiveArea[0].position,
                title: this.references.projectsTitle[0],
                url: this.references.projectsUrl[0],
                images: this.references.projectsImages[0],
                previous: this.references.projectsPrevious[0],
                next: this.references.projectsNext[0],
                attributes: this.references.projectsAttributes[0],
                pagination: this.references.projectsPagination[0],
                distinctions: this.references.projectsDistinctions[0],
            })

        if(this.references.altar && this.references.altarCounter && this.references.altarSkullEyes)
            this.altar = new Altar(
                this.references.altar[0].position,
                this.references.altarCounter[0],
                this.references.altarSkullEyes
            )

        if(this.references.poleLightGlass && this.references.poleLights)
            this.poleLights = new PoleLights(
                this.references.poleLightGlass[0],
                this.references.poleLights
            )
            
        if(this.references.cookie && this.references.cookieBanner && this.references.cookieOvenHeat && this.references.cookieBlower && this.references.cookieChimney && this.references.cookieSpawner && this.references.cookieInteractiveArea && this.references.cookieTable && this.references.cookieCounterPanel && this.references.cookieCounterLabel)
            this.cookieStand = new CookieStand(
                this.references.cookie[0],
                this.references.cookieBanner[0],
                this.references.cookieOvenHeat[0],
                this.references.cookieBlower[0],
                this.references.cookieChimney[0].position,
                this.references.cookieSpawner[0].position,
                this.references.cookieInteractiveArea[0].position,
                this.references.cookieTable[0].position,
                this.references.cookieCounterPanel[0],
                this.references.cookieCounterLabel[0],
            )
            
        if(this.references.bonfire && this.references.bonfireInteractiveArea && this.references.bonfireHashes)
            this.poleLights = new Bonfire(
                this.references.bonfire[0].position,
                this.references.bonfireInteractiveArea[0].position,
                this.references.bonfireHashes[0]
            )
            
        if(this.references.introInteractiveArea)
            this.intro = new Intro(
                this.references.introInteractiveArea[0].position,
            )
            
            
        if(this.references.controlsInteractiveArea)
            this.controls = new Controls(
                this.references.controlsInteractiveArea[0].position,
            )
            
        // this.playground = new Playground()
        // this.christmas = new Christmas()

    }

    setStaticObjects()
    {
        // Models
        const model = this.game.resources.sceneryStaticModel.scene
        
        // Extract references
        this.references = {}

        model.traverse(_child =>
        {
            const name = _child.name

            // Anything starting with "reference"
            const matches = name.match(/^reference([^0-9]+)([0-9]+)?$/)
            if(matches)
            {
                // Extract name without "reference" and without number at the end
                const referenceName = matches[1].charAt(0).toLowerCase() + matches[1].slice(1)
                
                // Create / save in array
                if(typeof this.references[referenceName] === 'undefined')
                    this.references[referenceName] = [_child]
                else
                    this.references[referenceName].push(_child)
            }
        })

        // Entities
        this.game.entities.addFromModel(
            model,
            null,
            {
                type: 'fixed',
                friction: 0,
            }
        )
    }

    setDynamicsObjects()
    {
        const model = [...this.game.resources.sceneryDynamicModel.scene.children]
        for(const child of model)
        {
            // Entities
            this.game.entities.addFromModel(
                child,
                {

                },
                {
                    type: 'dynamic',
                    friction: child.userData.friction ?? 0.5,
                    restitution: child.userData.restitution ?? 0.1,
                    position: child.position,
                    rotation: child.quaternion,
                    sleeping: true,
                    collidersOverwrite:
                    {
                        mass: child.userData.mass ?? 1
                    }
                }
            )
        }
    }
}