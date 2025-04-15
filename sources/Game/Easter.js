import * as THREE from 'three/webgpu'
import { Game } from './Game.js'
import { InstancedGroup } from './InstancedGroup.js'
import { cameraPosition, color, Fn, luminance, mix, normalWorld, positionWorld, uniform, uv, vec3, vec4 } from 'three/tsl'
import gsap from 'gsap'

export class Easter
{
    constructor()
    {
        this.game = Game.getInstance()

        this.code = 'easter2025'
        
        this.setEggVisual()
        this.setEggs()
        this.setModal()

        this.game.ticker.events.on('tick', () =>
        {
            this.update()
        }, 10)
    }

    setEggVisual()
    {
        const colorA = uniform(color('#ff8641'))
        const colorB = uniform(color('#ff3e00'))
        const intensity = uniform(5)

        /**
         * Egg
         */
        // Material
        const eggMaterial = new THREE.MeshBasicNodeMaterial({ transparent: true })

        eggMaterial.outputNode = Fn(() =>
        {
            const viewDirection = positionWorld.sub(cameraPosition).normalize()
                
            const fresnel = viewDirection.dot(normalWorld).abs().oneMinus().toVar()

            const mixedColor = mix(colorB, colorA, fresnel)

            return vec4(vec3(mixedColor.mul(intensity)), 1)
        })()

        // Mesh
        const egg = this.game.resources.easterEggVisualModel.scene.getObjectByName('egg')
        egg.position.set(0, 0, 0)
        egg.frustumCulled = false
        egg.material = eggMaterial
        
        /**
         * Beams
         */
        // Material
        const beamsMaterial = new THREE.MeshBasicNodeMaterial({ transparent: true })

        beamsMaterial.outputNode = Fn(() =>
        {
            const strength = uv().y.add(this.game.ticker.elapsedScaledUniform.mul(0.05)).fract()

            strength.greaterThan(0.2).discard()

            const mixStrength = strength.mul(5).toVar()
            const mixedColor = mix(colorA, colorB, mixStrength)

            return vec4(vec3(mixedColor.mul(intensity)), 1)

            return vec4(vec3(mixedColor.mul(intensity)), 1)
        })()

        // Mesh
        const beams = this.game.resources.easterEggVisualModel.scene.getObjectByName('beams')
        beams.position.set(0, 0, 0)
        beams.frustumCulled = false
        beams.material = beamsMaterial
        
        this.visual = this.game.resources.easterEggVisualModel.scene
    }
    
    setEggs()
    {
        this.eggs = {}
        this.eggs.allCaught = false
        this.eggs.catchDistance = 2
        this.eggs.closest = null

        // References
        const references = InstancedGroup.getReferencesFromChildren(this.game.resources.easterEggReferencesModel.scene.children)
        
        // Items
        this.eggs.items = []
        for(const reference of references)
        {
            const item = {}
            item.reference = reference
            item.distance = Infinity
            item.caught = false
            // item.element = this.eggs.fragmentElements[i]

            item.catch = () =>
            {
                item.caught = true
                gsap.to(
                    item.reference.scale,
                    {
                        x: 0.1,
                        y: 0.1,
                        z: 0.1,
                        duration: 0.6,
                        ease: 'back.in(6)',
                        onComplete: () =>
                        {
                            item.reference.position.y = 99
                        }
                    }
                )
            }

            this.eggs.items.push(item)
        }

        // Instanced group
        this.testInstancedGroup = new InstancedGroup(references, this.visual, true)

        this.eggs.getClosest = () =>
        {
            let closest = null
            let minDistance = Infinity
            for(const egg of this.eggs.items)
            {
                if(!egg.caught)
                {
                    egg.distance = egg.reference.position.distanceTo(this.game.player.position)

                    if(closest === null || egg.distance < minDistance)
                    {
                        closest = egg
                        minDistance = egg.distance
                    }
                }
            }

            return closest
        }

        this.eggs.tryCatch = (egg) =>
        {
            if(egg.distance < this.eggs.catchDistance && !egg.caught)
                this.eggs.catch(egg)
        }

        this.eggs.catch = (egg) =>
        {
            egg.catch()
            this.eggs.updateTitle()
            const isOver = this.eggs.testOver()

            this.game.audio.sounds.ding.volume(isOver ? 0.5 : 0.2)
            this.game.audio.sounds.ding.play()
            this.game.audio.sounds.swoosh.play()
        }

        this.eggs.updateTitle = () =>
        {
            let title = ''
            this.eggs.items.forEach(item =>
            {
                title += item.caught ? '🐣' : '🥚'
            })
            document.title = title
        }

        this.eggs.testOver = () =>
        {
            this.eggs.allCaught = this.eggs.items.reduce((accumulator, fragment) => { return fragment.caught && accumulator }, true)

            if(this.eggs.allCaught)
            {
                this.game.modals.open('easter-end')

                return true
            }
            else
            {
                return false
            }
        }
    }

    setModal()
    {
        this.modal = {}

        const endModal = this.game.modals.items.get('easter-end')
        const introModal = this.game.modals.items.get('intro')
        this.modal.element = endModal.element
        this.modal.time = this.modal.element.querySelector('.js-time')
        this.modal.code = this.modal.element.querySelector('.js-code')
        this.modal.link = this.modal.element.querySelector('.js-link')
        this.modal.firstOpen = true

        let timeStart = null

        introModal.events.on('close', () =>
        {
            timeStart = this.game.ticker.elapsed
        })
        
        endModal.events.on('open', () =>
        {
            if(this.modal.firstOpen)
            {
                // Time
                let elapsed = this.game.ticker.elapsed - timeStart
                const hours = Math.floor(elapsed / 60 / 60)

                elapsed -= hours * 60 * 60
                const minutes = Math.floor(elapsed / 60)

                elapsed -= minutes * 60
                const seconds = Math.floor(elapsed)
                
                const textParts = []

                if(hours)
                    textParts.push(`${hours} hour${hours > 1 ? 's' : ''}`)

                if(hours || minutes)
                    textParts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`)

                if(hours || minutes || seconds)
                    textParts.push(`${seconds} second${seconds > 1 ? 's' : ''}`)

                const text = textParts.join(' ')
                this.modal.time.textContent = text

                // Code
                this.modal.code.textContent = this.code.toUpperCase()

                // Link
                this.modal.link.href = `https://threejs-journey.com/join/${this.code}`

                // Save as already opened
                this.modal.firstOpen = false
            }
        })
    }

    update()
    {
        this.eggs.closest = this.eggs.getClosest()

        if(this.eggs.closest)
        {
            this.game.world.visualVehicle.antenna.target.copy(this.eggs.closest.reference.position)
            this.eggs.tryCatch(this.eggs.closest)
        }
        else
        {
            // const forwardTarget = this.game.vehicle.position.clone().add(this.game.vehicle.forward.clone().multiplyScalar(35))
            // forwardTarget.y += 1
            // this.game.vehicle.antenna.target.copy(forwardTarget)
        }
    }
}

