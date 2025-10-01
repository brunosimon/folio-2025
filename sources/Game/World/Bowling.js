import * as THREE from 'three/webgpu'
import { Game } from '../Game.js'
import { InteractivePoints } from '../InteractivePoints.js'
import { clamp, lerp } from '../utilities/maths.js'
import gsap from 'gsap'
import { color, float, Fn, max, min, mix, positionGeometry, step, texture, uniform, uv, vec2, vec3, vec4 } from 'three/tsl'
import { InstancedGroup } from '../InstancedGroup.js'

export class Bowling
{
    constructor(references)
    {
        this.game = Game.getInstance()
        
        this.references = references

        // Debug
        if(this.game.debug.active)
        {
            this.debugPanel = this.game.debug.panel.addFolder({
                title: '🎳 Bowling',
                expanded: true,
            })
        }
        this.won = false
        this.wonTime = 0

        this.setPins()
        this.setBall()
        this.setRestart()
        this.setScreen()
        this.setBumpers()
        this.setJukebox()

        this.game.ticker.events.on('tick', () =>
        {
            this.update()
        }, 5)
    }

    setPins()
    {
        this.pins = {}
        this.pins.items = []
        
        // References
        const references = InstancedGroup.getReferencesFromChildren(this.references.get('pinPositions')[0].children)

        // Instances
        const basePin = this.references.get('pin')[0]
        const descriptions = this.game.objects.getFromModel(
            basePin,
            {

            },
            {
                friction: 1,
                restitution: 1,
            }
        )

        let i = 0
        for(const reference of references)
        {
            const pin = {}
            pin.index = i
            pin.isDown = false
            pin.isSleeping = true
            pin.group = reference

            // Object with physics linked to reference
            const object = this.game.objects.add(
                {
                    model: reference,
                    updateMaterials: false,
                    castShadow: false,
                    receiveShadow: false,
                    parent: null,
                },
                {
                    type: 'dynamic',
                    position: reference.position,
                    rotation: reference.quaternion,
                    friction: 0.1,
                    resitution: 0.5,
                    sleeping: true,
                    colliders: descriptions[1].colliders,
                    waterGravityMultiplier: - 1,
                    collidersOverwrite:
                    {
                        mass: 0.05
                    }
                },
            )

            pin.body = object.physical.body
            pin.basePosition = pin.group.position.clone()
            pin.baseRotation = pin.group.quaternion.clone()

            this.pins.items.push(pin)

            i++
        }

        basePin.position.set(0, 0, 0)
        basePin.rotation.set(0, 0, 0)
        basePin.frustumCulled = false

        this.game.objects.add(
            {
                model: basePin,
                parent: null
            },
            null
        )
        basePin.removeFromParent()

        this.testInstancedGroup = new InstancedGroup(references, basePin, true)

        // Reset
        this.pins.reset = () =>
        {
            for(const pin of this.pins.items)
            {
                pin.isDown = false
                
                pin.body.setTranslation(pin.basePosition)
                pin.body.setRotation(pin.baseRotation)
                pin.body.resetForces()
                pin.body.resetTorques()
                pin.body.setLinvel({ x: 0, y: 0, z: 0 })
                pin.body.setAngvel({ x: 0, y: 0, z: 0 })
                pin.body.setEnabled(true)
                pin.body.sleep()
            }
        }
    }

    setBall()
    {
        const baseBall = this.references.get('ball')[0]

        this.ball = {}
        this.ball.isSleeping = true
        this.ball.body = baseBall.userData.object.physical.body
        this.ball.basePosition = baseBall.position.clone()
        // this.ball.basePosition.y += 1

        this.ball.reset = () =>
        {
            this.ball.body.setTranslation(this.ball.basePosition)
            this.ball.body.resetForces()
            this.ball.body.resetTorques()
            this.ball.body.setLinvel({ x: 0, y: 0, z: 0 })
            this.ball.body.setAngvel({ x: 0, y: 0, z: 0 })
            this.ball.body.setEnabled(true)
            this.ball.body.sleep()
        }
    }

    setRestart()
    {
        this.restartInteractivePoint = this.game.interactivePoints.create(
            this.references.get('restartInteractivePoint')[0].position,
            'Restart',
            InteractivePoints.ALIGN_RIGHT,
            () =>
            {
                this.won = false

                this.pins.reset()
                this.ball.reset()
                this.screen.reset()

                requestAnimationFrame(() =>
                {
                    this.restartInteractivePoint.hide()
                })
            },
            () =>
            {
                this.game.inputs.interactiveButtons.addItems(['interact'])
            },
            () =>
            {
                this.game.inputs.interactiveButtons.removeItems(['interact'])
            },
            () =>
            {
                this.game.inputs.interactiveButtons.removeItems(['interact'])
            }
        )
        
        this.restartInteractivePoint.hide()
    }

    setScreen()
    {
        this.screen = {}
        this.screen.group = this.references.get('screen')[0]
        this.screen.object = this.screen.group.userData.object
        this.screen.x = this.screen.group.position.x
        this.screen.max = this.screen.group.position.x
        this.screen.min = this.screen.max - (28.2 - 3.81)
        this.screen.discsMesh = this.references.get('discs')[0]
        this.screen.crossesMesh = this.references.get('crosses')[0]

        const data = new Uint8Array(10)
        this.dataTexture = new THREE.DataTexture(
            data,
            10,
            1,
            THREE.RedFormat,
            THREE.UnsignedByteType,
            THREE.UVMapping,
            THREE.ClampToEdgeWrapping,
            THREE.ClampToEdgeWrapping,
            THREE.NearestFilter,
            THREE.NearestFilter
        )
        this.dataTexture.needsUpdate = true

        // Offset position according to data texture
        const offsetPosition = Fn(([threshold]) =>
        {
            const active = step(texture(this.dataTexture, uv()).r.sub(threshold).abs(), 0.1)
            
            const newPosition = positionGeometry.toVar()
            newPosition.z.subAssign(active.oneMinus().mul(0.1))
            return newPosition
        })

        // Discs material
        const discsColor = uniform(color('#ffffff'))
        const discsStrength = uniform(2)
        const discsMaterial = new THREE.MeshBasicNodeMaterial()
        discsMaterial.outputNode = vec4(discsColor.mul(discsStrength), 1)
        discsMaterial.positionNode = offsetPosition(float(0))

        // Crosses material
        const crossesColor = uniform(color('#ff2b11')) // #b6ff11
        const crossesStrength = uniform(6)
        const crossesMaterial = new THREE.MeshBasicNodeMaterial()
        crossesMaterial.outputNode = vec4(crossesColor.mul(crossesStrength), 1)
        crossesMaterial.positionNode = offsetPosition(0.5)

        // Update materials
        this.screen.discsMesh.material = discsMaterial
        this.screen.crossesMesh.material = crossesMaterial

        // Strike label
        this.screen.labelStrike = this.references.get('labelStrike')[0]

        {
            const material = new THREE.MeshBasicNodeMaterial()
            const labelTexture = this.screen.labelStrike.material.map
            material.outputNode = Fn(() =>
            {
                texture(labelTexture).r.lessThan(0.5).discard()
                return vec4(vec3(2), 1)
            })()
            this.screen.labelStrike.material = material
            this.screen.labelStrike.visible = false
        }

        // Reset
        this.screen.reset = () =>
        {
            for(const pin of this.pins.items)
            {
                this.dataTexture.source.data.data[pin.index] = 0
                this.dataTexture.needsUpdate = true
            }
        }

        // Debug
        if(this.game.debug.active)
        {
            this.game.debug.addThreeColorBinding(this.debugPanel, discsColor.value, 'discsColor')
            this.debugPanel.addBinding(discsStrength, 'value', { label: 'discsStrength', min: 0, max: 10, step: 0.001 })
            this.game.debug.addThreeColorBinding(this.debugPanel, crossesColor.value, 'crossesColor')
            this.debugPanel.addBinding(crossesStrength, 'value', { label: 'crossesStrength', min: 0, max: 10, step: 0.001 })
        }
    }

    setBumpers()
    {
        this.bumpers = {}
        this.bumpers.mesh = this.references.get('bumpers')[0]
        this.bumpers.object = this.bumpers.mesh.userData.object
        this.bumpers.progress = 0
        this.bumpers.active = false
        this.bumpers.height = Math.abs(this.bumpers.mesh.position.y)

        // Body
        this.bumpers.object.physical.body.collider(0).setRestitution(1)
        this.bumpers.object.physical.body.collider(0).setFriction(0)
        this.bumpers.object.physical.body.collider(1).setRestitution(1)
        this.bumpers.object.physical.body.collider(1).setFriction(0)

        // Toggle
        this.bumpers.toggle = () =>
        {
            this.bumpers.active = !this.bumpers.active

            const progress = this.bumpers.active ? 1 : 0
            gsap.to(
                this.bumpers,
                {
                    progress: progress,
                    duration: 1,
                    overwrite: true,
                    onUpdate: () =>
                    {
                        this.bumpers.object.physical.body.setNextKinematicTranslation({
                            x: this.bumpers.mesh.position.x,
                            y: - (1 - this.bumpers.progress) * this.bumpers.height,
                            z: this.bumpers.mesh.position.z,
                        })
                        this.bumpers.object.needsUpdate = true
                    },
                }
            )
        }

        // Interactive point
        this.game.interactivePoints.create(
            this.references.get('bumpersInteractivePoint')[0].position,
            'Bumpers',
            InteractivePoints.ALIGN_LEFT,
            () =>
            {
                this.bumpers.toggle()
            },
            () =>
            {
                this.game.inputs.interactiveButtons.addItems(['interact'])
            },
            () =>
            {
                this.game.inputs.interactiveButtons.removeItems(['interact'])
            },
            () =>
            {
                this.game.inputs.interactiveButtons.removeItems(['interact'])
            }
        )
    }

    setJukebox()
    {
        // Interactive point
        this.game.interactivePoints.create(
            this.references.get('jukeboxInteractivePoint')[0].position,
            'Change song',
            InteractivePoints.ALIGN_LEFT,
            () =>
            {
                console.log('change music')
            },
            () =>
            {
                this.game.inputs.interactiveButtons.addItems(['interact'])
            },
            () =>
            {
                this.game.inputs.interactiveButtons.removeItems(['interact'])
            },
            () =>
            {
                this.game.inputs.interactiveButtons.removeItems(['interact'])
            }
        )
    }

    update()
    {
        let showRestartInteractivePoint = false
        
        // Screen position
        const targetX = clamp(this.game.player.position.x, this.screen.min, this.screen.max)
        this.screen.x += (targetX - this.screen.x) * this.game.ticker.deltaScaled * 2

        const floatY = Math.sin(this.game.ticker.elapsedScaled * 0.3) * 0.5
        this.screen.object.physical.body.setNextKinematicTranslation({
            x: this.screen.x,
            y: 0.5 + floatY,
            z: this.screen.group.position.z
        })
        this.screen.object.needsUpdate = true

        // Screen strike label
        if(this.won)
            this.screen.labelStrike.visible = (this.game.ticker.elapsedScaled - this.wonTime) % 3 < 1.5
        else
            this.screen.labelStrike.visible = false

        // Pins
        let pinStateChanged = false
        for(const pin of this.pins.items)
        {
            const pinUp = new THREE.Vector3(0, 1, 0)
            pinUp.applyQuaternion(pin.group.quaternion)
            const isDown = pinUp.y < 0.5

            // Wasn't down but is now down
            if(isDown && pin.isDown === false)
            {
                pin.isDown = isDown

                pinStateChanged = true
                
                this.dataTexture.source.data.data[pin.index] = pin.isDown ? 128 : 0
            }

            const isSleeping = pin.body.isSleeping()
            if(isSleeping !== pin.isSleeping)
            {
                pin.isSleeping = isSleeping

                if(!pin.isSleeping)
                    showRestartInteractivePoint = true
            }
        }

        if(pinStateChanged)
        {
            this.dataTexture.needsUpdate = true

            // Haven't won since reset
            if(!this.won)
            {
                const allDown = this.pins.items.reduce((accumulator, pin) => accumulator && pin.isDown, true)
                if(allDown)
                {
                    this.won = true
                    this.wonTime = this.game.ticker.elapsedScaled

                    if(this.game.world.confetti)
                    {
                        this.game.world.confetti.pop(this.game.player.position.clone())
                        this.game.world.confetti.pop(this.screen.group.position.clone().add(new THREE.Vector3(- 1, - 1, 0)))
                        this.game.world.confetti.pop(this.screen.group.position.clone().add(new THREE.Vector3(- 3.4, - 1, 0)))
                    }
                }
            }
        }

        // Ball
        const ballIsSleeping = this.ball.body.isSleeping()
        if(ballIsSleeping !== this.ball.isSleeping)
        {
            this.ball.isSleeping = ballIsSleeping

            if(!this.ball.isSleeping)
                showRestartInteractivePoint = true
        }

        // Restart interactive point
        if(showRestartInteractivePoint && this.restartInteractivePoint.state === InteractivePoints.STATE_HIDDEN)
            this.restartInteractivePoint.show()
    }
}