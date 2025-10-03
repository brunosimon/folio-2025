import * as THREE from 'three/webgpu'
import { Game } from '../Game.js'
import { PoleLights } from './PoleLights.js'
import { Altar } from './Altar.js'
import { CookieStand } from './CookieStand.js'
import { Bonfire } from './Bonfire.js'
import { Intro } from './Intro.js'
import { Controls } from './Controls.js'
import { Projects } from './Projects.js'
import { Lab } from './Lab.js'
import { Career } from './Career.js'
import { Social } from './Social.js'
import { Toilet } from './Toilet.js'
import { ExplosiveCrates } from './ExplosiveCrates.js'
import { Bowling } from './Bowling.js'

export class Areas
{
    constructor()
    {
        this.game = Game.getInstance()

        if(this.game.debug.active)
        {
            this.debugPanel = this.game.debug.panel.addFolder({
                title: '🛋️ Areas',
                expanded: false,
            })
        }

        this.setReferences()
        this.setObjects()

        const toiletReferences = this.references.getStartingWith('toilet')
        if(toiletReferences.size)
            this.toilet = new Toilet(toiletReferences)

        const careerReferences = this.references.getStartingWith('career')
        if(careerReferences.size)
            this.career = new Career(careerReferences)

        const socialReferences = this.references.getStartingWith('social')
        if(socialReferences.size)
            this.social = new Social(socialReferences)

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

        const bowlingReferences = this.references.getStartingWith('bowling')
        if(bowlingReferences.size)
            this.bowling = new Bowling(bowlingReferences)
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

    setObjects()
    {
        const model = [...this.game.resources.areasModel.scene.children]
        for(const child of model)
        {
            // Add
            if(typeof child.userData.preventAutoAdd === 'undefined' || child.userData.preventAutoAdd === false)
            {
                // Objects
                this.game.objects.addFromModel(
                    child,
                    {

                    },
                    {
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

            // Parse references
            this.references.parse(child)
        }
    }
}