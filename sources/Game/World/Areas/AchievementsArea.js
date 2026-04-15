import * as THREE from 'three/webgpu'
import { add, color, cos, float, Fn, instancedArray, instancedBufferAttribute, instanceIndex, max, min, mix, PI2, positionGeometry, positionWorld, sin, texture, uniform, uv, varying, vec2, vec3, vec4 } from 'three/tsl'
import { InteractivePoints } from '../../InteractivePoints.js'
import { MeshDefaultMaterial } from '../../Materials/MeshDefaultMaterial.js'
import { Area } from './Area.js'
import { alea } from 'seedrandom'

const rng = new alea('achievements')

export class AchievementsArea extends Area
{
    constructor(model)
    {
        super(model)

        this.setSounds()
        this.setWaterfall()
        this.setPillar()
        this.setInteractivePoint()
        this.setAchievement()
    }

    setSounds()
    {
        this.sounds = {}

        this.sounds.chimers = this.game.audio.register({
            path: 'sounds/magic/Mountain Audio - Small Chimes - Loop.mp3',
            autoplay: true,
            loop: true,
            volume: 0.15,
            positions: this.references.items.get('pillar')[0].position,
            distanceFade: 20
        })
    }

    setWaterfall()
    {
        const waterColorA = uniform(color(this.game.terrain.colors[1].value))
        const waterColorB = uniform(color(this.game.terrain.colors[2].value))

        // Still color and foam
        {
            const colorNode = Fn(() =>
            {
                const baseUv = uv().toVar()
                const baseColor = color()

                // Water color
                {
                    const xMix = baseUv.x.sub(0.5).mul(2).abs().pow3().max(0)
                    
                    const waterColor = mix(waterColorB, waterColorA, xMix)
                    baseColor.assign(waterColor)
                }

                // Foam
                {
                    const newUv = baseUv.toVar()
                    newUv.x.assign(newUv.x.sub(0.5).abs().mul(2))
                    const uv3 = newUv.sub(vec2(this.game.ticker.elapsedScaledUniform.mul(0.05), 0)).mul(vec2(0.35, 0.96))
                    const noise3 = texture(this.game.noises.voronoi, uv3).r

                    const uv4 = newUv.sub(vec2(this.game.ticker.elapsedScaledUniform.mul(0.041), 0)).mul(vec2(0.75, 1.28))
                    const noise4 = texture(this.game.noises.voronoi, uv4).r

                    const noiseFinal = min(noise3, noise4)
                    const stepTreshold = baseUv.x.sub(0.5).abs().mul(2).add(0.5).mul(0.5).oneMinus()
                    const foamMix = noiseFinal.step(stepTreshold)

                    baseColor.assign(mix(baseColor, color('#ffffff'), foamMix))
                }

                return vec3(baseColor)
            })()
            const material = new MeshDefaultMaterial({
                colorNode: colorNode,
                hasLightBounce: false,
                hasWater: false,
                hasReveal: false
            })
            const mesh = this.references.items.get('waterfallStill')[0]
            // mesh.visible = false
            mesh.material = material
        }

        // Drop foam
        {
            const colorNode = Fn(() =>
            {
                const baseUv = uv().toVar()

                // Foam
                {
                    const uv3 = baseUv.sub(vec2(0, this.game.ticker.elapsedScaledUniform.mul(0.11))).mul(vec2(0.7, 0.6))
                    const noise3 = texture(this.game.noises.voronoi, uv3).r

                    const uv4 = baseUv.sub(vec2(0, this.game.ticker.elapsedScaledUniform.mul(0.085))).mul(vec2(1.5, 0.8))
                    const noise4 = texture(this.game.noises.voronoi, uv4).r

                    const noiseFinal = min(noise3, noise4)
                    const stepTreshold = baseUv.y.sub(0.5).abs().mul(2).add(0.5).mul(0.5)
                    noiseFinal.lessThan(stepTreshold).discard()
                }


                return vec3(1)
            })()
            const material = new MeshDefaultMaterial({
                colorNode: colorNode,
                hasLightBounce: false,
                hasWater: false,
                hasReveal: false
            })
            const mesh = this.references.items.get('waterfallDrop')[0]
            // mesh.visible = false
            mesh.material = material
        }

        // Particles
        {
            const reference = this.references.items.get('waterfallParticles')[0]
            reference.removeFromParent()
            
            const origin = new THREE.Vector3(
                reference.geometry.attributes.position.array[0],
                reference.geometry.attributes.position.array[1],
                reference.geometry.attributes.position.array[2]
            )
            const destination = new THREE.Vector3(
                reference.geometry.attributes.position.array[3],
                reference.geometry.attributes.position.array[4],
                reference.geometry.attributes.position.array[5]
            )
            origin.applyMatrix4(reference.matrixWorld)
            destination.applyMatrix4(reference.matrixWorld)

            const length = origin.distanceTo(destination)
            const delta = destination.clone().sub(origin)

            const count = 100
            const positions = new Float32Array(count * 3)
            const angles = new Float32Array(count)

            for(let i = 0; i < count; i++)
            {
                positions[i * 3 + 0] = 0
                positions[i * 3 + 1] = 0
                positions[i * 3 + 2] = length * Math.random()

                angles[i] = Math.PI - Math.PI * 0.5 * Math.random()
            }

            const positionAttribute = instancedArray(positions, 'vec3').toAttribute()
            const angleAttribute = instancedArray(angles, 'float').toAttribute()
            
            const material = new MeshDefaultMaterial({
                hasLightBounce: false,
                hasWater: false,
                hasReveal: false,
                alphaTest: 0.1,
            
            })

            material.positionNode = Fn(() =>
            {
                const progress = this.game.ticker.elapsedScaledUniform.mul(0.2).add(float(instanceIndex).div(count)).fract()
                
                const scale = progress.oneMinus().mul(0.4)
                const newPositionGeometry = positionGeometry.toVar().mul(scale)

                const finalPosition = newPositionGeometry.add(positionAttribute).toVar()

                const distance = progress.oneMinus().pow2().oneMinus()
                finalPosition.y.addAssign(sin(angleAttribute).mul(distance).mul(2))
                finalPosition.x.addAssign(cos(angleAttribute).mul(distance).mul(1.5))
                return finalPosition
            })()

            material._alphaNode = Fn(() =>
            {
                const distanceToCenter = uv().sub(0.5).length().oneMinus().sub(0.5)
                return distanceToCenter
            })()

            const geometry = new THREE.PlaneGeometry(1, 1)
            geometry.rotateY(-Math.PI * 0.5)
            geometry.rotateZ(-Math.PI * 0.25)

            const mesh = new THREE.InstancedMesh(
                geometry,
                material,
                count
            )
            mesh.receiveShadow = true
            mesh.castShadow = true
            mesh.lookAt(delta.multiplyScalar(-1))
            mesh.position.copy(destination)
            mesh.count = count
            this.game.worldContainer.add(mesh)
            this.objects.hideable.push(mesh)
        }
    }

    setPillar()
    {
        this.pillar = this.references.items.get('pillar')[0]

        // Glyphs
        {
            const count = this.game.achievements.globalProgress.totalCount

            const positions = new Float32Array(count * 3)
            const speeds = new Float32Array(count)
            
            for(let i = 0; i < count; i++)
            {
                const angle = Math.PI * rng() - Math.PI * 0.25
                const elevation = rng() * 2
                const radius = 2 + rng() * 0.25
                positions[i * 3 + 0] = Math.sin(angle) * radius
                positions[i * 3 + 1] = elevation
                positions[i * 3 + 2] = Math.cos(angle) * radius
                
                speeds[i] = 0.2 + rng() * 0.8
            }

            const positionAttribute = instancedArray(positions, 'vec3').toAttribute()
            const speedAttribute = instancedArray(speeds, 'float').toAttribute()

            const material = new THREE.SpriteNodeMaterial({})
            
            const progressVarying = varying(float(0))

            material.positionNode = Fn(() =>
            {
                progressVarying.assign(this.game.ticker.elapsedScaledUniform.mul(0.05).add(float(instanceIndex).div(count)).fract())

                const newPosition = positionAttribute.toVar()
                newPosition.y.addAssign(progressVarying.mul(speedAttribute))
                return newPosition
            })()

            material.scaleNode = Fn(() =>
            {
                const scale = min(
                    progressVarying.remapClamp(0, 0.1, 0, 1),
                    progressVarying.remapClamp(0.7, 0.8, 1, 0),
                    1
                )
                return scale.mul(0.2)
            })()


            const emissiveDefaultMaterial = this.game.materials.getFromName('emissiveOrangeRadialGradient')
            const emissiveAchievedMaterial = this.game.materials.getFromName('emissiveBlueRadialGradient')

            material.outputNode = Fn(() =>
            {
                // Glyph
                const glyphUv = uv().toVar()
                glyphUv.x.addAssign(instanceIndex)
                glyphUv.x.divAssign(32)
                const glyph = texture(this.game.resources.achievementsGlyphsTexture, glyphUv).r
                glyph.lessThan(0.5).discard()

                // Emissive
                const emissiveOutput = mix(
                    emissiveAchievedMaterial.outputNode,
                    emissiveDefaultMaterial.outputNode,
                    float(instanceIndex).div(count).step(this.game.achievements.globalProgress.ratioUniform)
                )

                return emissiveOutput
            })()

            const geometry = new THREE.PlaneGeometry(1, 1)

            const mesh = new THREE.Mesh(geometry, material)
            mesh.position.x = this.pillar.position.x
            mesh.position.y = 2
            mesh.position.z = this.pillar.position.z
            mesh.count = count

            this.game.worldContainer.add(mesh)
            this.objects.hideable.push(mesh)
        }
    }

    setInteractivePoint()
    {
        this.interactivePoint = this.game.interactivePoints.create(
            this.references.items.get('interactivePoint')[0].position,
            'Achievements',
            InteractivePoints.ALIGN_RIGHT,
            InteractivePoints.STATE_CONCEALED,
            () =>
            {
                this.game.inputs.interactiveButtons.clearItems()
                this.game.menu.open('achievements')
                this.interactivePoint.hide()
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

        this.game.menu.items.get('achievements').events.on('close', () =>
        {
            this.interactivePoint.show()
        })
    }

    setAchievement()
    {
        this.events.on('boundingIn', () =>
        {
            this.game.achievements.setProgress('areas', 'achievements')
        })

        // Behind waterfall
        const zoneReference = this.references.items.get('waterfallZone')[0]
        const position = zoneReference.position.clone()
        const radius = zoneReference.scale.x
        const zone = this.game.zones.create('cylinder', position, radius)

        zone.events.on(
            'enter',
            () =>
            {
                this.game.achievements.setProgress('waterfall', 1)
            }
        )
    }

    update()
    {
        this.pillar.position.y = Math.sin(this.game.ticker.elapsedScaled * 0.1) * 0.25
    }
}