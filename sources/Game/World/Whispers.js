import * as THREE from 'three/webgpu'
import { Game } from '../Game.js'
import { billboarding, cameraPosition, color, Fn, instanceIndex, min, mix, modelViewMatrix, mul, normalWorld, positionGeometry, positionViewDirection, positionWorld, smoothstep, texture, time, uv, vec2, vec3, vec4 } from 'three/tsl'
import { hash } from 'three/tsl'
import gsap from 'gsap'
import { Bubble } from './Bubble.js'

export class Whispers
{
    constructor()
    {
        this.game = Game.getInstance()

        this.count = 30

        this.setMesh()
        this.setData()
        this.setInput()
        this.setBubble()
        this.setModal()
        // this.connectServer()
        // this.connectSupabase()

        this.game.ticker.events.on('tick', () =>
        {
            this.update()
        }, 3)

        this.game.inputs.events.on('whisper', (event) =>
        {
            if(event.down)
            {
                this.game.modals.open('whispers')
            }
        })
    }

    setMesh()
    {
        // Geometry
        const beamGeometry = new THREE.PlaneGeometry(1.25, 1.25 * 2, 1, 16)
        beamGeometry.rotateY(Math.PI * 0.25)
        
        // Material
        const beamMaterial = new THREE.MeshBasicNodeMaterial({ transparent: true, wireframe: false, depthWrite: false })
        beamMaterial.positionNode = Fn(() =>
        {
            const newPosition = positionGeometry.toVar()

            const random = hash(instanceIndex)
            const noiseStrength = uv().y.remapClamp(0.25, 1, 0, 1).mul(0.6)
            const noiseUv = vec2(random, uv().y.mul(0.5).sub(this.game.ticker.elapsedScaledUniform.mul(0.1)))
            const noise = texture(this.game.noises.others, noiseUv).r.sub(0.5).mul(noiseStrength)
            newPosition.x.addAssign(noise)

            return newPosition
        })()

        beamMaterial.outputNode = Fn(() =>
        {
            const mask = texture(this.game.resources.whisperBeamTexture, uv()).r
            const color = texture(this.game.materials.gradientTexture, vec2(0, mask))
            const alpha = smoothstep(0.05, 0.3, mask)
            const emissiveMultiplier = smoothstep(0.8, 1, mask).add(1).mul(2)

            return vec4(vec3(color.mul(emissiveMultiplier)), alpha)
        })()

        // // Sphere
        // const sphereGeometry = new THREE.SphereGeometry(0.5, 20, 8)
        
        // const sphereMaterial = new THREE.MeshBasicNodeMaterial()
        // sphereMaterial.outputNode = Fn(() =>
        // {
        //     const viewDirection = positionWorld.sub(cameraPosition).normalize()
                
        //     const fresnel = viewDirection.dot(normalWorld).abs().oneMinus().toVar()
        //     const remapedFresnel = fresnel.oneMinus().pow(2).oneMinus().toVar()
        //     const color = texture(this.game.materials.gradientTexture, vec2(0, remapedFresnel))
        //     // color.mulAssign(2)
        //     return vec4(vec3(color), 1)
        // })()

        // const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
        // sphere.rotation.reorder('YXZ')
        // sphere.rotation.y = Math.PI * 0.25
        // sphere.rotation.x = Math.PI * 0.25
        // group.add(sphere)

        // Instanced mesh
        this.mesh = new THREE.InstancedMesh(beamGeometry, beamMaterial, this.count)
        this.mesh.frustumCulled = false
        this.mesh.visible = false
        this.game.scene.add(this.mesh)
    }

    setData()
    {
        this.data = {}
        this.data.needsUpdate = false
        this.data.items = new Map()

        this.data.upsert = (input) =>
        {
            let item = this.data.items.get(input.id)

            // Update
            if(item)
            {
                item.message = input.message
                item.position.set(input.x, input.y, input.z)
            }

            // Insert
            else
            {
                item = {
                    message: input.message,
                    position: new THREE.Vector3(input.x, input.y, input.z)
                }

                this.data.items.set(input.id, item)
            }

            this.data.needsUpdate = true
        }

        this.data.delete = (input) =>
        {
            this.data.items.delete(input.id)

            this.data.needsUpdate = true
        }

        // Server message event
        this.game.server.events.on('message', (data) =>
        {
            // Init and insert
            if(data.type === 'init' || data.type === 'whispersUpsert')
            {
                for(const whisper of data.whispers)
                    this.data.upsert(whisper)
                    
                this.needsUpdate = true
            }

            // Delete
            else if(data.type === 'whispersDelete')
            {
                for(const whisper of data.whispers)
                {
                    this.data.delete(whisper)
                }
                this.needsUpdate = true
            }
        })

        // Message already received
        if(this.game.server.initData)
        {
            for(const whisper of this.game.server.initData.whispers)
                this.data.upsert(whisper)
                
            this.needsUpdate = true
        }
    }

    setInput()
    {
        // Input
        const input = document.createElement('input')
        input.style.position = 'fixed'
        input.style.bottom = 0
        input.style.left = 0
        input.style.zIndex = 1
        document.body.append(input)

        input.addEventListener('keydown', async (event) =>
        {
            if(event.key === 'Enter' && input.value !== '')
            {
                // Insert
                this.game.server.send({
                    type: 'whispersInsert',
                    message: input.value,
                    x: this.game.vehicle.position.x,
                    y: this.game.vehicle.position.y,
                    z: this.game.vehicle.position.z
                })
                // input.value = ''
            }
        })
    }
    
    setBubble()
    {
        this.bubble = {}
        this.bubble.instance = new Bubble()
        this.bubble.closest = null
        this.bubble.minDistance = 3
    }

    setModal()
    {
        this.modal = {}
    }

    update()
    {
        // Data
        if(this.data.needsUpdate)
        {
            let i = 0
            const matrix = new THREE.Matrix4()
            this.data.items.forEach((item) =>
            {
                matrix.setPosition(item.position)
                this.mesh.setMatrixAt(i, matrix)

                i++
            })

            for(; i < this.count; i++)
            {
                matrix.setPosition(0, -2, 0)
                this.mesh.setMatrixAt(i, matrix)
            }

            this.mesh.instanceMatrix.needsUpdate = true

            this.mesh.visible = true
            this.data.needsUpdate = false
        }

        // Bubble
        let closestWhisper = null
        let closestDistance = Infinity
        this.data.items.forEach(whisper =>
        {
            const distance = this.game.vehicle.position.distanceTo(whisper.position)

            if(distance < closestDistance && distance < this.bubble.minDistance)
            {
                closestDistance = distance
                closestWhisper = whisper
            }
        })

        if(closestWhisper !== this.bubble.closest)
        {
            if(!closestWhisper)
                this.bubble.instance.hide()
            else
            {
                const position = closestWhisper.position.clone()
                position.y += 1.25
                this.bubble.instance.tryShow(closestWhisper.message, position)
            }

            this.bubble.closest = closestWhisper
        }
    }
}