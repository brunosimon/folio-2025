import * as THREE from 'three'
import CameraControls from 'camera-controls'
import { Game } from './Game.js'
import { clamp, lerp, remap, smoothstep } from './utilities/maths.js'
import { atan2, cos, sin, uniform, PI, vec3, time, modelViewMatrix, cameraProjectionMatrix, viewport, vec4, Fn, positionGeometry, positionLocal, attribute } from 'three'

CameraControls.install( { THREE: THREE } )

export class View
{
    constructor()
    {
        this.game = new Game()

        this.mode = 'default'
        this.position = new THREE.Vector3()

        if(this.game.debug.active)
        {
            this.debugPanel = this.game.debug.panel.addFolder({
                title: '📷 View',
                expanded: true,
            })

            this.debugPanel.addBinding(
                this,
                'mode',
                {
                    options:
                    {
                        default: 'default',
                        debugControls: 'debugControls',
                    }
                }
            ).on('change', () => 
            {
                this.focusPoint.smoothedPosition.copy(this.focusPoint.position)

                this.debugControls.enabled = this.mode === 'debugControls'
                this.debugControls.setTarget(this.focusPoint.position.x, this.focusPoint.position.y, this.focusPoint.position.z)
                this.debugControls.setPosition(this.camera.position.x, this.camera.position.y, this.camera.position.z)
            })
        }

        this.setFocusPoint()
        this.setZoom()
        this.setSpherical()
        this.setCamera()
        this.setDebugControls()
        this.setSpeedLines()

        this.game.time.events.on('tick', () =>
        {
            this.update()
        }, 3)

        this.game.viewport.events.on('change', () =>
        {
            this.resize()
        })
    }

    setFocusPoint()
    {
        this.focusPoint = {}
        this.focusPoint.trackedPosition = new THREE.Vector3()
        this.focusPoint.isTracking = true
        this.focusPoint.position = new THREE.Vector3()
        this.focusPoint.smoothedPosition = new THREE.Vector3()

        this.game.inputs.events.on('keyDown', () =>
        {
            this.focusPoint.isTracking = true
        })
    }

    setZoom()
    {
        this.zoom = {}
        this.zoom.baseRatio = 0.25
        this.zoom.ratio = this.zoom.baseRatio
        this.zoom.smoothedRatio = this.zoom.baseRatio
        this.zoom.speedAmplitude = - 0.4
        this.zoom.speedEdgeLow = 5
        this.zoom.speedEdgeHigh = 40
        this.zoom.sensitivity = 0.05

        this.game.inputs.events.on('zoom', (zoomValue) =>
        {
            this.zoom.baseRatio -= zoomValue * this.zoom.sensitivity
            this.zoom.baseRatio = clamp(this.zoom.baseRatio, 0, 1)
        })

        if(this.game.debug.active)
        {
            const zoomDebugPanel = this.debugPanel.addFolder({
                title: 'Zoom',
                expanded: true,
            })
            zoomDebugPanel.addBinding(this.zoom, 'speedAmplitude', { min: 0, max: 1, step: 0.001 })
            zoomDebugPanel.addBinding(this.zoom, 'speedEdgeLow', { min: 0, max: 100, step: 0.001 })
            zoomDebugPanel.addBinding(this.zoom, 'speedEdgeHigh', { min: 0, max: 100, step: 0.001 })
            zoomDebugPanel.addBinding(this.zoom, 'sensitivity', { min: 0, max: 0.5, step: 0.0001 })
        }
    }

    setSpherical()
    {
        this.spherical = {}
        this.spherical.phi = Math.PI * 0.35
        this.spherical.theta = Math.PI * 0.25

        this.spherical.offset = new THREE.Vector3()

        this.spherical.radius = {}
        this.spherical.radius.min = 10
        this.spherical.radius.max = 30
        this.spherical.radius.current = lerp(this.spherical.radius.min, this.spherical.radius.max, 1 - this.zoom.smoothedRatio)

        if(this.game.debug.active)
        {
            const sphericalDebugPanel = this.debugPanel.addFolder({
                title: 'Spherical',
                expanded: true,
            })
            sphericalDebugPanel.addBinding(this.spherical, 'phi', { min: 0, max: Math.PI * 0.5, step: 0.001 })
            sphericalDebugPanel.addBinding(this.spherical, 'theta', { min: - Math.PI, max: Math.PI, step: 0.001 })
            sphericalDebugPanel.addBinding(this.spherical.radius, 'min', { label: 'zoomMin', min: 0, max: 100, step: 0.001 })
            sphericalDebugPanel.addBinding(this.spherical.radius, 'max', { label: 'zoomMax', min: 0, max: 100, step: 0.001 })
        }
    }

    setCamera()
    {
        this.camera = new THREE.PerspectiveCamera(25, this.game.viewport.ratio, 0.1, 1000)
        this.camera.position.setFromSphericalCoords(this.spherical.radius.current, this.spherical.phi, this.spherical.theta)
        this.game.scene.add(this.camera)
    }

    setDebugControls()
    {
        this.debugControls = new CameraControls(this.camera, this.game.domElement)
        this.debugControls.enabled = this.mode === 'debugControls'
        this.debugControls.smoothTime = 0.075
        this.debugControls.draggingSmoothTime = 0.075
        this.debugControls.dollySpeed = 0.2
    }

    setSpeedLines()
    {
        this.speedLines = {}
        this.speedLines.smoothedStrength = uniform(0)
        this.speedLines.strength = 0
        this.speedLines.speed = uniform(25)

        const linesCount = 30
        const positionArray = new Float32Array(linesCount * 3 * 3)
        const indexArray = new Float32Array(linesCount * 3)
        const maxDistance = Math.hypot(1, 1)

        for(let i = 0; i < linesCount; i++)
        {
            // Base vertex
            const base = new THREE.Vector2(0, 1)
            const angle = Math.PI * 2 * Math.random()
            base.rotateAround(new THREE.Vector2(), angle)

            // Side vertices 
            const thickness = Math.random() * 0.05 + 0.003
            const sideA = base.clone().rotateAround(new THREE.Vector2(), thickness)
            const sideB = base.clone().rotateAround(new THREE.Vector2(), - thickness)
            
            // Distance to center
            sideA.multiplyScalar(maxDistance)
            sideB.multiplyScalar(maxDistance)
            base.multiplyScalar(maxDistance * Math.random() * 0.5)

            // Save in position array
            const i9 = i * 9

            positionArray[i9 + 0] = sideA.x
            positionArray[i9 + 1] = sideA.y
            positionArray[i9 + 2] = 0
            
            positionArray[i9 + 3] = base.x
            positionArray[i9 + 4] = base.y
            positionArray[i9 + 5] = 0

            positionArray[i9 + 6] = sideB.x
            positionArray[i9 + 7] = sideB.y
            positionArray[i9 + 8] = 0

            // Save index
            const i3 = i * 3
            indexArray[i3 + 0] = i
            indexArray[i3 + 1] = i
            indexArray[i3 + 2] = i
        }

        this.speedLines.geometry = new THREE.BufferGeometry()
        this.speedLines.geometry.setAttribute('position', new THREE.Float32BufferAttribute(positionArray, 3))
        this.speedLines.geometry.setAttribute('index', new THREE.Float32BufferAttribute(indexArray, 1))

        this.speedLines.material = new THREE.MeshBasicNodeMaterial({ wireframe: false, depthWrite: false, depthTest: false })
        this.speedLines.material.vertexNode = Fn(() =>
        {
            const lineIndex = attribute('index')
            const lineRatio = time.mul(this.speedLines.speed).add(lineIndex).sin().div(2).add(0.5)

            const newPosition = positionGeometry.toVar()
            const length = newPosition.xy.length()
            const angle = atan2(newPosition.y, newPosition.x)
            length.addAssign(lineRatio.add(this.speedLines.smoothedStrength.oneMinus().mul(maxDistance)))
            newPosition.x.assign(cos(angle).mul(length))
            newPosition.y.assign(sin(angle).mul(length))
            
            return vec4(newPosition, 1)
        })()
        this.speedLines.material.outputNode = vec4(1)

        this.speedLines.mesh = new THREE.Mesh(this.speedLines.geometry, this.speedLines.material)
        this.speedLines.mesh.frustumCulled = false
        this.speedLines.mesh.renderOrder = 10
        this.game.scene.add(this.speedLines.mesh)

        // Debug
        if(this.game.debug.active)
        {
            const folder = this.debugPanel.addFolder({
                title: 'Speed lines',
                expanded: true,
            })
            folder.addBinding(this.speedLines, 'strength', { label: 'strength', min: 0, max: 1, step: 0.001 })
            folder.addBinding(this.speedLines.speed, 'value', { label: 'speed', min: 0, max: 100, step: 0.001 })
        }
    }

    resize()
    {
        this.camera.aspect = this.game.viewport.width / this.game.viewport.height
        this.camera.updateProjectionMatrix()
    }

    update()
    {
        // Default mode
        if(this.mode === 'default')
        {
            // Focus point
            if(this.game.inputs.pointer.isDown)
            {
                this.focusPoint.isTracking = false
                
                const mapMovement = new THREE.Vector2(this.game.inputs.pointer.delta.x, this.game.inputs.pointer.delta.y)
                mapMovement.rotateAround(new THREE.Vector2(), -this.spherical.theta)
                mapMovement.multiplyScalar(0.01)
                
                this.focusPoint.position.x -= mapMovement.x
                this.focusPoint.position.z -= mapMovement.y
            }
        }

        if(this.focusPoint.isTracking)
            this.focusPoint.position.copy(this.focusPoint.trackedPosition)

        const newSmoothFocusPoint = this.focusPoint.smoothedPosition.clone().lerp(this.focusPoint.position, this.game.time.delta * 10)
        const smoothFocusPointDelta = newSmoothFocusPoint.clone().sub(this.focusPoint.smoothedPosition)
        const focusPointSpeed = Math.hypot(smoothFocusPointDelta.x, smoothFocusPointDelta.z) / this.game.time.delta
        this.focusPoint.smoothedPosition.copy(newSmoothFocusPoint)
        
        // Default mode
        if(this.mode === 'default')
        {
            // Zoom
            const zoomSpeedRatio = smoothstep(focusPointSpeed, this.zoom.speedEdgeLow, this.zoom.speedEdgeHigh)
            this.zoom.ratio = this.zoom.baseRatio

            if(this.focusPoint.isTracking)
                this.zoom.ratio += this.zoom.speedAmplitude * zoomSpeedRatio

            this.zoom.smoothedRatio = lerp(this.zoom.smoothedRatio, this.zoom.ratio, this.game.time.delta * 10)
        }

        // Radius
        this.spherical.radius.current = lerp(this.spherical.radius.min, this.spherical.radius.max, 1 - this.zoom.smoothedRatio)
        this.spherical.offset.setFromSphericalCoords(this.spherical.radius.current, this.spherical.phi, this.spherical.theta)

        // Position
        this.position.copy(this.focusPoint.smoothedPosition).add(this.spherical.offset)

        // Default mode
        if(this.mode === 'default')
        {
            this.camera.position.copy(this.position)

            // Look at
            this.camera.lookAt(this.focusPoint.smoothedPosition)
        }
        
        // Controls mode
        else
        {
            this.debugControls.update(this.game.time.delta)
        }

        // Speed lines
        this.speedLines.smoothedStrength.value = lerp(this.speedLines.smoothedStrength.value, this.speedLines.strength, this.game.time.delta * 2)
    }
}