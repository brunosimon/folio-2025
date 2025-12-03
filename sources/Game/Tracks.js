import * as THREE from 'three/webgpu'
import { Game } from './Game.js'
import { screenUV, mul, cos, sin, sign, atan, varying, float, uv, texture, Fn, vec2, vec3, vec4, positionGeometry, viewportSize, attribute } from 'three/tsl'

export class Tracks
{
    constructor()
    {
        this.game = Game.getInstance()

        this.resolution = 512
        this.size = 40
        this.halfSize = this.size / 2
        this.tracks = []

        this.focusPoint = new THREE.Vector2()
        
        this.camera = new THREE.OrthographicCamera(- this.halfSize,  this.halfSize,  this.halfSize, - this.halfSize, 0.1, 10)
        this.camera.position.y = 5
        this.camera.rotation.x = - Math.PI * 0.5
        
        this.scene = new THREE.Scene()
        this.scene.add(this.camera)

        this.renderTarget = new THREE.RenderTarget(
            this.resolution,
            this.resolution,
            {
                minFilter: THREE.LinearFilter,
                magFilter: THREE.LinearFilter,
                wrapS: THREE.ClampToEdgeWrapping,
                wrapT: THREE.ClampToEdgeWrapping
            }
        )

        // this.setDebugPlane()

        this.game.ticker.events.on('tick', () =>
        {
            this.update()
        }, 9)
    }

    setDebugPlane()
    {
        const material = new THREE.MeshBasicNodeMaterial({ map: this.renderTarget.texture, transparent: false, depthTest: false, depthWrite: false })
        material.vertexNode = Fn(() =>
        {
            const ratio = viewportSize.x.div(viewportSize.y)
            const position = attribute('position').mul(vec3(1, ratio, 0)).mul(0.5).sub(vec3(0.75, 0.5, 0))
            return vec4(position, 1)
        })()
     
        const geometry = new THREE.PlaneGeometry(1, 1)   
        const mesh = new THREE.Mesh(geometry, material)
        
        mesh.position.y = 5
        mesh.position.x = - 3
        mesh.frustumCulled = false
        mesh.renderOrder = 1
        this.game.scene.add(mesh)
    }

    add(track)
    {
        this.tracks.push(track)
        this.scene.add(track.trail.mesh)
        return track
    }

    remove(track)
    {
        this.tracks = this.tracks.filter(_track => _track !== track)
    }

    update()
    {
        this.camera.position.x = this.focusPoint.x
        this.camera.position.z = this.focusPoint.y

        // Render
        const rendererState = THREE.RendererUtils.resetRendererState(this.game.rendering.renderer)

        this.game.rendering.renderer.setPixelRatio(1)
        this.game.rendering.renderer.setRenderTarget(this.renderTarget)
        this.game.rendering.renderer.render(this.scene, this.camera)
        this.game.rendering.renderer.setRenderTarget(null)

        THREE.RendererUtils.restoreRendererState(this.game.rendering.renderer, rendererState)
    }
}


export class Track
{
    constructor(thickness = 1, channel = 'r')
    {
        this.game = Game.getInstance()

        this.subdivisions = 128

        this.timeThrottle = 1 / 30
        this.lastTime = 0
        this.thickness = thickness

        const channels = {
            r: vec3(1, 0, 0),
            g: vec3(0, 1, 0),
            b: vec3(0, 0, 1),
        }
        this.channelVec3 = channels[channel]

        this.distanceThrottle = 0.2
        this.lastPosition = new THREE.Vector3(Infinity, Infinity, Infinity)
        
        this.setDataTexture()
        this.setTrail()
        // this.setDebugPlane()
    }

    setDataTexture()
    {
        this.dataTexture = new THREE.DataTexture(
            new Float32Array(this.subdivisions * 4),
            this.subdivisions,
            1,
            THREE.RGBAFormat,
            THREE.FloatType
        )
    }

    setTrail()
    {
        this.trail = {}
        this.trail.geometry = new THREE.PlaneGeometry(1, 1, this.subdivisions, 1)
        this.trail.geometry.translate(0.5, 0, 0)
        
        this.trail.material = new THREE.MeshBasicNodeMaterial({ wireframe: false, depthTest: false, transparent: true, blending: THREE.AdditiveBlending })

        const trackData = varying(vec4())

        this.trail.material.positionNode = Fn(() =>
        {
            const fragmentSize = float(1).div(this.subdivisions)

            const ratio = uv().x.sub(fragmentSize.mul(0.5))

            const trackUV = vec2(
                ratio,
                0.5
            )
            const trackUVPrev = vec2(
                ratio.sub(fragmentSize),
                0.5
            )
            trackData.assign(texture(this.dataTexture, trackUV))
            const trackDataPrev = texture(this.dataTexture, trackUVPrev)

            const angle = atan(
                trackData.z.sub(trackDataPrev.z),
                trackData.x.sub(trackDataPrev.x),
            )

            const sideSign = sign(positionGeometry.y).mul(-1)
            const trailPosition = vec2(
                cos(angle.add(sideSign.mul(Math.PI * 0.5))),
                sin(angle.add(sideSign.mul(Math.PI * 0.5)))
            ).mul(this.thickness)
            
            const newPosition = vec3(
                trackData.x.add(trailPosition.x),
                trackData.y,
                trackData.z.add(trailPosition.y)
            )

            return newPosition
        })()
        
        this.trail.material.outputNode = Fn(() =>
        {
            const endAlpha = uv().x.smoothstep(0.5, 1).oneMinus()
            const startAlpha = uv().x.smoothstep(0, 0.05)
            const contactAlpha = trackData.a
            const renderEdgeAlpha = mul(
                screenUV.x.remapClamp(0, 0.2, 0, 1),
                screenUV.x.remapClamp(0.8, 1, 1, 0),
                screenUV.y.remapClamp(0, 0.2, 0, 1),
                screenUV.y.remapClamp(0.8, 1, 1, 0),
            )

            const trackEdgeAlpha = uv().y.sub(0.5).abs().mul(2).oneMinus()

            const alpha = endAlpha.mul(startAlpha).mul(contactAlpha).mul(trackEdgeAlpha).mul(renderEdgeAlpha)
            return vec4(this.channelVec3, alpha)
        })()
        
        this.trail.mesh = new THREE.Mesh(this.trail.geometry, this.trail.material)
        this.trail.mesh.frustumCulled = false
        this.game.scene.add(this.trail.mesh)
    }

    setDebugPlane()
    {
        this.debugPlane = new THREE.Mesh(
            new THREE.PlaneGeometry(8, 1),
            new THREE.MeshBasicMaterial({ map: this.dataTexture })
        )
        this.debugPlane.position.y = 2
        this.game.scene.add(this.debugPlane)
    }

    update(_position, _touching)
    {
        const data = this.dataTexture.source.data.data

        // Throttle by time
        const lastTimeDelta = this.game.ticker.elapsed - this.lastTime
        if(lastTimeDelta > this.timeThrottle)
        {
            // Throttle by distance
            const positionDelta = this.lastPosition.clone().sub(_position)
            const distance = positionDelta.length()
            
            if(distance > this.distanceThrottle)
            {
                // Move data one "pixel"
                for(let i = this.subdivisions - 1; i >= 0; i--)
                {
                    const i4 = i * 4
                    data[i4    ] = data[i4 - 4]
                    data[i4 + 1] = data[i4 - 3]
                    data[i4 + 2] = data[i4 - 2]
                    data[i4 + 3] = data[i4 - 1]
                }

                // Save time and position
                this.lastTime = this.game.ticker.elapsed
                this.lastPosition.copy(_position)
            }
        }

        // Draw new position
        data[0] = _position.x
        data[1] = _position.y
        data[2] = _position.z
        data[3] = _touching ? 1 : 0

        this.dataTexture.needsUpdate = true
    }
}
