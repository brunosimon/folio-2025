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
import { Lab } from './Lab.js'

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

        this.setReferences()
        this.setStaticObjects()
        this.setDynamicsObjects()
        // this.setTest()

        this.bushes = new Bushes()
        this.birchTrees = new Trees('Birch Tree', this.game.resources.birchTreesVisualModel.scene, this.game.resources.birchTreesReferencesModel.scene.children, '#ff782b')
        this.oakTrees = new Trees('Oak Tree', this.game.resources.oakTreesVisualModel.scene, this.game.resources.oakTreesReferencesModel.scene.children, '#c4c557')
        this.cherryTrees = new Trees('Cherry Tree', this.game.resources.cherryTreesVisualModel.scene, this.game.resources.cherryTreesReferencesModel.scene.children, '#ff6da8')
        this.flowers = new Flowers()
        this.bricks = new Bricks()

        const labReferences = this.references.getStartingWith('lab')
        if(labReferences.size)
            this.lab = new Lab(labReferences)
        
        const projectsReferences = this.references.getStartingWith('projects')
        if(projectsReferences.size)
            this.projects = new Projects(projectsReferences)
        
        const altarReferences = this.references.getStartingWith('altar')
        if(altarReferences.size)
            this.altar = new Altar(altarReferences)

        const poleLightsReferences = this.references.getStartingWith('poleLights')
        if(poleLightsReferences.size)
            this.poleLights = new PoleLights(poleLightsReferences)
            
        const cookieReferences = this.references.getStartingWith('cookie')
        if(cookieReferences.size)
            this.cookieStand = new CookieStand(cookieReferences)
            
        const bonfireReferences = this.references.getStartingWith('bonfire')
        if(bonfireReferences.size)
            this.poleLights = new Bonfire(bonfireReferences)
            
        const introReferences = this.references.getStartingWith('intro')
        if(introReferences.size)
            this.intro = new Intro(introReferences)

        const controlsReferences = this.references.getStartingWith('controls')
        if(controlsReferences.size)
            this.controls = new Controls(controlsReferences)
    }

    setReferences()
    {
        this.references = {}

        this.references.items = new Map()

        this.references.parse = (object) =>
        {
            object.traverse(_child =>
            {
                const name = _child.name

                // Anything starting with "reference"
                const matches = name.match(/^ref(?:erence)?([^0-9]+)([0-9]+)?$/)
                if(matches)
                {
                    // Extract name without "reference" and without number at the end
                    const referenceName = matches[1].charAt(0).toLowerCase() + matches[1].slice(1)
                    
                    // Create / save in array
                    if(!this.references.items.has(referenceName))
                        this.references.items.set(referenceName, [_child])
                    else
                        this.references.items.get(referenceName).push(_child)
                }
            })
        }

        this.references.getStartingWith = (searched) =>
        {
            const items = new Map()

            this.references.items.forEach((value, name) =>
            {
                if(name.startsWith(searched))
                {
                    // Strip name from searched value
                    let stripName = name.replace(new RegExp(`^${searched}(.+)$`), '$1')
                    stripName = stripName.charAt(0).toLowerCase() + stripName.slice(1)

                    items.set(stripName, value)
                }
            })

            return items
        }
    }

    setStaticObjects()
    {
        // let meshesCount = 0
        // const inspectChildren = (model, indent = '') =>
        // {
        //     let children =[...model.children]

        //     for(const child of children)
        //     {
        //         let material = ''
                
        //         if(child.isMesh)
        //         {
        //             meshesCount++
        //             material = `(${child.material ? child.material.name : 'no material'})`
        //         }
                
        //         let color = '#ffffff'

        //         if(child.isMesh)
        //             color = 'cyan'

        //         console.log(`%c${indent}${child.name} ${material}`, `color: ${color}; font-weight: bold;`)

        //         if(child.name === 'hull012')
        //             console.log(child)

        //         if(child.children?.length)
        //             inspectChildren(child, indent + '    ')
        //     }
        // }

        // Models
        const model = this.game.resources.sceneryStaticModel.scene
        // inspectChildren(model)
        // console.log('Meshes count:', meshesCount)
        
        // References
        this.references.parse(model)

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

    setTest()
    {
        // Models
        const model = this.game.resources.sceneryTestModel.scene
        console.log(model.children)
        
        // References
        this.references.parse(model)

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
}