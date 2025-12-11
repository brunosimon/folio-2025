import * as THREE from 'three/webgpu'
import CameraControls from 'camera-controls'
import { Game } from './Game.js'
import { clamp, lerp, remap, smoothstep } from './utilities/maths.js'
import { mix, uniform, vec4, Fn, positionGeometry, attribute } from 'three/tsl'
import gsap from 'gsap'
import { Pointer } from './Inputs/Pointer.js'
import { Inputs } from './Inputs/Inputs.js'
import { alea } from 'seedrandom'

CameraControls.install( { THREE: THREE } )

const rng = new alea('speedLines')

export class View
{
    static MODE_DEFAULT = 1
    static MODE_FREE = 2

    constructor(idealRatio = 1920 / 1080)
    {
        this.game = Game.getInstance()
        
        this.mode = View.MODE_DEFAULT
        this.position = new THREE.Vector3()
        this.delta = new THREE.Vector3()
        this.idealRatio = idealRatio
        this.ratioOverflow = Math.max(1, this.idealRatio / this.game.viewport.ratio) - 1

        if(this.game.debug.active)
        {
            this.debugPanel = this.game.debug.panel.addFolder({
                title: '🎥 View',
                expanded: false,
            })

            this.debugPanel.addBinding(
                this,
                'mode',
                {
                    options:
                    {
                        default: View.MODE_DEFAULT,
                        free: View.MODE_FREE,
                    }
                }
            ).on('change', () => 
            {
                this.setMode(this.mode)
            })
        }

        this.setFocusPoint()
        this.setZoom()
        this.setSpherical()
        this.setRoll()
        this.setCameras()
        this.setOptimalArea()
        this.setFree()
        this.setCinematic()
        this.setSpeedLines()
        this.setMapControls()

        this.game.ticker.events.on('tick', () =>
        {
            this.update()
        }, 7)

        this.update()

        this.game.viewport.events.on('change', () =>
        {
            this.resize()
        })

        this.game.viewport.events.on('throttleChange', () =>
        {
            this.throttleResize()
        }, 1)

        // Toggle
        if(this.game.debug.active)
        {
            this.game.inputs.addActions([
                { name: 'viewToggle', categories: [], keys: [ 'Keyboard.KeyV' ] }
            ])

            this.game.inputs.events.on('viewToggle', (action) =>
            {
                if(action.active)
                {
                    this.toggleMode()
                }
            })
        }
    }

    toggleMode()
    {
        this.setMode(this.mode === View.MODE_FREE ? View.MODE_DEFAULT : View.MODE_FREE)
    }

    setMode(mode)
    {
        this.mode = mode

        this.focusPoint.smoothedPosition.copy(this.focusPoint.position)

        this.freeMode.enabled = this.mode === View.MODE_FREE
        this.freeMode.setTarget(this.focusPoint.position.x, this.focusPoint.position.y, this.focusPoint.position.z)
        this.freeMode.setPosition(this.camera.position.x, this.camera.position.y, this.camera.position.z)
    }

    setFocusPoint()
    {
        const defaultRespawn = this.game.respawns.getDefault()
        
        this.focusPoint = {}
        this.focusPoint.trackedPosition = new THREE.Vector3(defaultRespawn.position.x, 0, defaultRespawn.position.z)
        this.focusPoint.isTracking = true
        this.focusPoint.position = this.focusPoint.trackedPosition.clone()
        this.focusPoint.smoothedPosition = this.focusPoint.trackedPosition.clone()
        this.focusPoint.isEased = true
        this.focusPoint.easing = 1
        this.focusPoint.magnet = {}
        this.focusPoint.magnet.active = true
        this.focusPoint.magnet.multiplier = 0.25

        const focusActionsNames = [
            'forward',
            'right',
            'backward',
            'left',
            'boost',
            'brake',
            'respawn',
            'suspensions',
            'suspensionsFront',
            'suspensionsBack',
            'suspensionsRight',
            'suspensionsLeft',
            'suspensionsFrontLeft',
            'suspensionsFrontRight',
            'suspensionsBackRight',
            'suspensionsBackLeft',
            'interact',
            'whisper'
        ]
        this.game.inputs.events.on('actionStart', (action) =>
        {
            if(focusActionsNames.indexOf(action.name) !== -1)
                this.focusPoint.isTracking = true
        })

        this.focusPoint.helper = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicNodeMaterial({ color: '#ff0000', wireframe: true }))
        this.focusPoint.helper.visible = false
        this.focusPoint.helper.userData.preventPreRender = true
        this.game.scene.add(this.focusPoint.helper)

        if(this.game.debug.active)
        {
            const zoomDebugPanel = this.debugPanel.addFolder({
                title: 'Magnet',
                expanded: true,
            })
            zoomDebugPanel.addBinding(this.focusPoint.magnet, 'multiplier', { min: 0, max: 1, step: 0.0001 })
        }
    }

    setOptimalArea()
    {
        this.optimalArea = {}
        this.optimalArea.needsUpdate = true
        this.optimalArea.position = new THREE.Vector3()
        this.optimalArea.basePosition = new THREE.Vector3()
        this.optimalArea.nearPosition = new THREE.Vector3()
        this.optimalArea.farPosition = new THREE.Vector3()
        this.optimalArea.nearDistance = null
        this.optimalArea.farDistance = null
        this.optimalArea.radius = 0
        this.optimalArea.raycaster = new THREE.Raycaster()
        this.optimalArea.quad2 = [
            { base: new THREE.Vector2(), offseted: new THREE.Vector2(), helper: null },
            { base: new THREE.Vector2(), offseted: new THREE.Vector2(), helper: null },
            { base: new THREE.Vector2(), offseted: new THREE.Vector2(), helper: null },
            { base: new THREE.Vector2(), offseted: new THREE.Vector2(), helper: null },
        ]

        // for(const point of this.optimalArea.quad2)
        // {
        //     point.helper = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicNodeMaterial({ color: '#ff00ff', wireframe: false }))
        //     point.helper.userData.preventPreRender = true
        //     this.game.scene.add(point.helper)
        // }

        this.optimalArea.floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)

        this.optimalArea.helpers = {}
        this.optimalArea.helpers.center = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicNodeMaterial({ color: '#00ff00', wireframe: false }))
        this.optimalArea.helpers.near = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicNodeMaterial({ color: '#ff0000', wireframe: false }))
        this.optimalArea.helpers.far = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicNodeMaterial({ color: '#0000ff', wireframe: false }))

        this.optimalArea.helpers.center.visible = false
        this.optimalArea.helpers.near.visible = false
        this.optimalArea.helpers.far.visible = false
        
        this.optimalArea.helpers.center.userData.preventPreRender = true
        this.optimalArea.helpers.near.userData.preventPreRender = true
        this.optimalArea.helpers.far.userData.preventPreRender = true

        this.game.scene.add(
            this.optimalArea.helpers.center,
            this.optimalArea.helpers.near,
            this.optimalArea.helpers.far
        )

        this.optimalArea.update = () =>
        {
            // Save state
            const savedPosition = this.defaultCamera.position.clone()
            const savedQuaternion = this.defaultCamera.quaternion.clone()

            // Reset with max radius
            let radiusMax = (this.spherical.radius.edges.max + this.ratioOverflow * this.spherical.radius.nonIdealRatioOffset)

            if(this.game.quality.level === 0)
                radiusMax *= 1 - this.zoom.speedAmplitude
            
            const offset = new THREE.Vector3()
            offset.setFromSphericalCoords(radiusMax, this.spherical.phi, this.spherical.theta)

            this.defaultCamera.position.set(0, 0, 0).add(offset)
            this.defaultCamera.lookAt(new THREE.Vector3())
            this.defaultCamera.updateProjectionMatrix()
            this.defaultCamera.updateWorldMatrix()

            // First near/far diagonal
            this.optimalArea.raycaster.setFromCamera(new THREE.Vector2(1, -1), this.defaultCamera)
            this.optimalArea.raycaster.ray.intersectPlane(this.optimalArea.floorPlane, this.optimalArea.nearPosition)
            this.optimalArea.helpers.near.position.copy(this.optimalArea.nearPosition)
            this.optimalArea.quad2[0].base.x = this.optimalArea.nearPosition.x
            this.optimalArea.quad2[0].base.y = this.optimalArea.nearPosition.z

            this.optimalArea.raycaster.setFromCamera(new THREE.Vector2(-1, 1), this.defaultCamera)
            this.optimalArea.raycaster.ray.intersectPlane(this.optimalArea.floorPlane, this.optimalArea.farPosition)
            this.optimalArea.helpers.far.position.copy(this.optimalArea.farPosition)
            this.optimalArea.quad2[2].base.x = this.optimalArea.farPosition.x
            this.optimalArea.quad2[2].base.y = this.optimalArea.farPosition.z

            const centerA = this.optimalArea.nearPosition.clone().lerp(this.optimalArea.farPosition, 0.5)

            // Second near/far diagonal
            this.optimalArea.raycaster.setFromCamera(new THREE.Vector2(-1, -1), this.defaultCamera)
            this.optimalArea.raycaster.ray.intersectPlane(this.optimalArea.floorPlane, this.optimalArea.nearPosition)
            this.optimalArea.helpers.near.position.copy(this.optimalArea.nearPosition)
            this.optimalArea.quad2[3].base.x = this.optimalArea.nearPosition.x
            this.optimalArea.quad2[3].base.y = this.optimalArea.nearPosition.z

            this.optimalArea.raycaster.setFromCamera(new THREE.Vector2(1, 1), this.defaultCamera)
            this.optimalArea.raycaster.ray.intersectPlane(this.optimalArea.floorPlane, this.optimalArea.farPosition)
            this.optimalArea.helpers.far.position.copy(this.optimalArea.farPosition)
            this.optimalArea.quad2[1].base.x = this.optimalArea.farPosition.x
            this.optimalArea.quad2[1].base.y = this.optimalArea.farPosition.z

            const centerB = this.optimalArea.nearPosition.clone().lerp(this.optimalArea.farPosition, 0.5)

            // Center between the two diagonal centers
            this.optimalArea.basePosition = centerA.clone().lerp(centerB, 0.5)
            this.optimalArea.helpers.center.position.copy(this.optimalArea.basePosition)

            // Radius
            this.optimalArea.radius = this.optimalArea.basePosition.distanceTo(this.optimalArea.farPosition)

            // Distances
            this.optimalArea.raycaster.setFromCamera(new THREE.Vector2(0, -1), this.defaultCamera)
            this.optimalArea.raycaster.ray.intersectPlane(this.optimalArea.floorPlane, this.optimalArea.nearPosition)

            this.optimalArea.raycaster.setFromCamera(new THREE.Vector2(0, 1), this.defaultCamera)
            this.optimalArea.raycaster.ray.intersectPlane(this.optimalArea.floorPlane, this.optimalArea.farPosition)
            
            this.optimalArea.nearDistance = this.defaultCamera.position.distanceTo(this.optimalArea.nearPosition)
            this.optimalArea.farDistance = this.defaultCamera.position.distanceTo(this.optimalArea.farPosition)

            // Put back state
            this.defaultCamera.position.copy(savedPosition)
            this.defaultCamera.quaternion.copy(savedQuaternion)

            // Save
            this.optimalArea.needsUpdate = false
        }
    }

    setZoom()
    {
        this.zoom = {}
        this.zoom.baseRatio = 0.6
        this.zoom.ratio = this.zoom.baseRatio
        this.zoom.smoothedRatio = this.zoom.baseRatio
        this.zoom.speedAmplitude = - 0.4
        this.zoom.speedEdge = { min: 5, max: 40 }
        this.zoom.sensitivity = 0.05
        this.zoom.toggle = 0
        this.zoom.toggleLast = -1

        this.game.inputs.addActions([
            { name: 'zoom',    categories: [ 'wandering', 'racing' ], keys: [ 'Wheel.roll' ] },
            { name: 'zoomToggle',  categories: [ 'wandering', 'racing' ], keys: [ 'Gamepad.r3' ] },
        ])

        this.game.inputs.events.on('zoom', (action) =>
        {
            this.zoom.baseRatio -= action.value * this.zoom.sensitivity
            this.zoom.baseRatio = clamp(this.zoom.baseRatio, 0, 1)
        })

        this.game.inputs.events.on('zoomToggle', (action) =>
        {
            if(action.active)
            {
                this.zoom.toggle -= this.zoom.toggleLast
                this.zoom.toggleLast = this.zoom.toggle
            }
            else
            {
                this.zoom.toggle = 0
            }
        })

        if(this.game.debug.active)
        {
            const zoomDebugPanel = this.debugPanel.addFolder({
                title: 'Zoom',
                expanded: false,
            })
            zoomDebugPanel.addBinding(this.zoom, 'speedAmplitude', { min: 0, max: 1, step: 0.001 })
            zoomDebugPanel.addBinding(this.zoom, 'speedEdge', { min: 0, max: 100, step: 0.001 })
            zoomDebugPanel.addBinding(this.zoom, 'sensitivity', { min: 0, max: 0.5, step: 0.0001 })
        }
    }

    setSpherical()
    {
        this.spherical = {}
        this.spherical.phi = Math.PI * (this.game.quality.level === 0 ? 0.31 : 0.27)
        this.spherical.theta = Math.PI * 0.25

        this.spherical.radius = {}
        this.spherical.radius.edges = { min: 15, max: 30 }
        this.spherical.radius.current = lerp(this.spherical.radius.edges.min, this.spherical.radius.edges.max, 1 - this.zoom.smoothedRatio)
        this.spherical.radius.nonIdealRatioOffset = 9

        this.spherical.offset = new THREE.Vector3()
        this.spherical.offset.setFromSphericalCoords(this.spherical.radius.current, this.spherical.phi, this.spherical.theta)

        if(this.game.debug.active)
        {
            const sphericalDebugPanel = this.debugPanel.addFolder({
                title: 'Spherical',
                expanded: false,
            })
            sphericalDebugPanel.addBinding(this.spherical, 'phi', { min: 0, max: Math.PI * 0.5, step: 0.001 })
            sphericalDebugPanel.addBinding(this.spherical, 'theta', { min: - Math.PI, max: Math.PI, step: 0.001 })
            sphericalDebugPanel.addBinding(this.spherical.radius, 'edges', { min: 0, max: 100, step: 0.001 })
        }
    }

    setRoll()
    {
        this.roll = {}
        this.roll.value = 0
        this.roll.velocity = 0
        this.roll.speed = 0
        this.roll.damping = 4
        this.roll.pullStrength = 100
        this.roll.kickStrength = 1
        
        this.roll.kick = (strength = 1) =>
        {
            this.roll.speed = strength * this.roll.kickStrength * (Math.random() < 0.5 ? - 1 : 1)
        }

        if(this.game.debug.active)
        {
            const rollDebugPanel = this.debugPanel.addFolder({
                title: 'Roll',
                expanded: false,
            })
            rollDebugPanel
                .addButton({ title: 'kick' })
                .on('click', () =>
                {
                    this.roll.kick()
                })

            rollDebugPanel.addBinding(this.roll, 'damping', { min: 0, max: 20, step: 0.1 })
            rollDebugPanel.addBinding(this.roll, 'pullStrength', { min: 0, max: 400, step: 0.1 })
            rollDebugPanel.addBinding(this.roll, 'kickStrength', { min: 0, max: 10, step: 0.1 })
        }
    }

    setCameras()
    {
        this.camera = new THREE.PerspectiveCamera(25, this.game.viewport.ratio, 0.1, 200)
        this.camera.position.setFromSphericalCoords(this.spherical.radius.current, this.spherical.phi, this.spherical.theta)

        this.defaultCamera = this.camera.clone()
        this.freeCamera = this.camera.clone()

        this.game.scene.add(this.camera, this.defaultCamera, this.freeCamera)

        this.cameraHelper = new THREE.CameraHelper(this.defaultCamera)
        this.cameraHelper.visible = false
        this.cameraHelper.userData.preventPreRender = true
        this.game.scene.add(this.cameraHelper)

        if(this.game.debug.active)
        {
            this.debugPanel.addBinding(this.cameraHelper, 'visible', { label: 'cameraHelper' })
        }
    }

    setFree()
    {
        this.freeMode = new CameraControls(this.freeCamera, this.game.domElement)
        this.freeMode.enabled = this.mode === View.MODE_FREE
        this.freeMode.smoothTime = 0.075
        this.freeMode.draggingSmoothTime = 0.075
        this.freeMode.dollySpeed = 0.2
    }

    setCinematic()
    {
        this.cinematic = {}
        this.cinematic.active = false
        this.cinematic.progress = 0
        this.cinematic.position = new THREE.Vector3()
        this.cinematic.target = new THREE.Vector3()
        this.cinematic.dummy = this.camera.clone()
        this.cinematic.nonIdealRatioOffset = 10

        // this.cinematic.targetHelper = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicNodeMaterial({ color: '#ff00ff', wireframe: true }))
        // this.cinematic.targetHelper.userData.preventPreRender = true
        // this.game.scene.add(this.cinematic.targetHelper)

        this.cinematic.start = (position, target) =>
        {
            this.cinematic.active = true
            this.cinematic.position = position.clone()
            this.cinematic.target = target.clone()

            this.cinematic.targetHelper?.position.copy(this.cinematic.target)

            if(this.ratioOverflow > 0)
            {
                const delta = this.cinematic.position.clone().sub(this.cinematic.target).setLength(this.ratioOverflow * this.cinematic.nonIdealRatioOffset)
                this.cinematic.position.add(delta)
            }

            gsap.to(this.cinematic, { progress: 1, duration: 1.5, ease: 'power2.inOut', overwrite: true })
            gsap.to(this.game.rendering.cheapDOFPass.strength, { value: 0, duration: 1.5, ease: 'power2.inOut', overwrite: true })
        }

        this.cinematic.end = () =>
        {
            this.cinematic.active = false
            gsap.to(this.cinematic, { progress: 0, duration: 1, ease: 'power2.inOut', overwrite: true })
            gsap.to(this.game.rendering.cheapDOFPass.strength, { value: 1.5, duration: 1.5, ease: 'power2.inOut', overwrite: true })
        }
    }

    setSpeedLines()
    {
        this.speedLines = {}
        this.speedLines.strength = 0
        this.speedLines.smoothedStrength = uniform(this.speedLines.strength)
        this.speedLines.worldTarget = new THREE.Vector3()
        this.speedLines.clipSpaceTarget = uniform(new THREE.Vector3())
        this.speedLines.speed = uniform(12)

        const linesCount = 30
        const positionArray = new Float32Array(linesCount * 3 * 3)
        const timeRandomnessArray = new Float32Array(linesCount * 3)
        const distanceArray = new Float32Array(linesCount * 3)
        const tipnessArray = new Float32Array(linesCount * 3)
        const maxDistance = Math.hypot(1, 1)

        for(let i = 0; i < linesCount; i++)
        {
            const i9 = i * 9
            const i3 = i * 3

            // Base vertex
            const vertexMiddle = new THREE.Vector2(0, 1)
            const angle = Math.PI * 2 * rng()
            vertexMiddle.rotateAround(new THREE.Vector2(), angle)

            // Side vertices 
            const thickness = rng() * 0.01 + 0.002
            const vertexLeft = vertexMiddle.clone().rotateAround(new THREE.Vector2(), thickness)
            const vertexRight = vertexMiddle.clone().rotateAround(new THREE.Vector2(), - thickness)
            
            // Distance to center
            vertexMiddle.multiplyScalar(maxDistance)
            vertexLeft.multiplyScalar(maxDistance)
            vertexRight.multiplyScalar(maxDistance)

            // Position
            positionArray[i9 + 0] = vertexLeft.x
            positionArray[i9 + 1] = vertexLeft.y
            positionArray[i9 + 2] = 0
            
            positionArray[i9 + 3] = vertexMiddle.x
            positionArray[i9 + 4] = vertexMiddle.y
            positionArray[i9 + 5] = 0

            positionArray[i9 + 6] = vertexRight.x
            positionArray[i9 + 7] = vertexRight.y
            positionArray[i9 + 8] = 0

            // Time randomness
            timeRandomnessArray[i3 + 0] = i
            timeRandomnessArray[i3 + 1] = i
            timeRandomnessArray[i3 + 2] = i

            // Distance
            const distance = rng() * 0.4 + 0.4
            distanceArray[i3 + 0] = distance
            distanceArray[i3 + 1] = distance
            distanceArray[i3 + 2] = distance

            // Tipness
            tipnessArray[i3 + 0] = 0
            tipnessArray[i3 + 1] = 1
            tipnessArray[i3 + 2] = 0
        }

        this.speedLines.geometry = new THREE.BufferGeometry()
        this.speedLines.geometry.setAttribute('position', new THREE.Float32BufferAttribute(positionArray, 3))
        this.speedLines.geometry.setAttribute('timeRandomness', new THREE.Float32BufferAttribute(timeRandomnessArray, 1))
        this.speedLines.geometry.setAttribute('distance', new THREE.Float32BufferAttribute(distanceArray, 1))
        this.speedLines.geometry.setAttribute('tipness', new THREE.Float32BufferAttribute(tipnessArray, 1))

        this.speedLines.material = new THREE.MeshBasicNodeMaterial({ wireframe: false, depthWrite: false, depthTest: false })
        this.speedLines.material.vertexNode = Fn(() =>
        {
            const timeRandomness = attribute('timeRandomness')
            const distance = attribute('distance')
            const tipness = attribute('tipness')
            
            const osciliation = this.game.ticker.elapsedScaledUniform.mul(this.speedLines.speed).add(timeRandomness).sin().div(2).add(0.5)
            const newPosition = mix(positionGeometry.xy, this.speedLines.clipSpaceTarget.xy, tipness.mul(osciliation).mul(distance).mul(this.speedLines.smoothedStrength))
            
            return vec4(newPosition, 0, 1)
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
                expanded: false,
            })
            folder.addBinding(this.speedLines, 'strength', { label: 'strength', min: 0, max: 1, step: 0.001 })
            folder.addBinding(this.speedLines.speed, 'value', { label: 'speed', min: 0, max: 100, step: 0.001 })
        }
    }

    resize()
    {
        this.ratioOverflow = Math.max(1, this.idealRatio / this.game.viewport.ratio) - 1

        this.camera.aspect = this.game.viewport.width / this.game.viewport.height
        this.camera.updateProjectionMatrix()

        this.defaultCamera.aspect = this.game.viewport.width / this.game.viewport.height
        this.defaultCamera.updateProjectionMatrix()

        this.freeCamera.aspect = this.game.viewport.width / this.game.viewport.height
        this.freeCamera.updateProjectionMatrix()
    }

    throttleResize()
    {
        this.optimalArea.update()
    }

    setMapControls()
    {
        this.game.inputs.addActions([
            { name: 'viewMapPointer', categories: [ 'intro', 'wandering' ], keys: [ 'Pointer.any' ] },
        ])

        this.game.inputs.events.on('viewMapPointer', (action) =>
        {
            if(this.mode === View.MODE_DEFAULT)
            {
                // Focus point
                if(action.active)
                {
                    // Map
                    if(this.game.inputs.pointer.mode === Pointer.MODE_MOUSE || this.game.inputs.pointer.touches.length >= 2)
                    {
                        this.focusPoint.isTracking = false
                        
                        const mapMovement = new THREE.Vector2(this.game.inputs.pointer.delta.x, this.game.inputs.pointer.delta.y)                    
                        mapMovement.rotateAround(new THREE.Vector2(), -this.spherical.theta)

                        const smallestSide = Math.min(this.game.viewport.width, this.game.viewport.height)
                        mapMovement.multiplyScalar(10 / smallestSide)
                        
                        this.focusPoint.position.x -= mapMovement.x * 2
                        this.focusPoint.position.z -= mapMovement.y * 2
                    }

                    // Pinch
                    this.zoom.baseRatio += this.game.inputs.pointer.pinch.distanceDelta * 0.005
                    this.zoom.baseRatio = clamp(this.zoom.baseRatio, 0, 1)
                }
            }
        })
    }

    update()
    {
        // Gamepad Joystick map controls
        if(this.mode === View.MODE_DEFAULT && this.game.inputs.gamepad.joysticks.right.active && !this.cinematic.active)
        {
            this.focusPoint.isTracking = false

            const mapMovement = new THREE.Vector2(this.game.inputs.gamepad.joysticks.right.x, this.game.inputs.gamepad.joysticks.right.y)
            mapMovement.rotateAround(new THREE.Vector2(), -this.spherical.theta)
            mapMovement.multiplyScalar(20 * this.game.ticker.delta)

            this.focusPoint.position.x += mapMovement.x
            this.focusPoint.position.z += mapMovement.y
        }
        
        // Focus point
        if(this.focusPoint.isTracking)
        {
            this.focusPoint.position.x = this.focusPoint.trackedPosition.x
            this.focusPoint.position.z = this.focusPoint.trackedPosition.z
        }

        if(this.focusPoint.magnet.active)
        {
            const magnetDelta = { x: this.focusPoint.trackedPosition.x - this.focusPoint.position.x, z: this.focusPoint.trackedPosition.z - this.focusPoint.position.z }
            const distanceToMagnet = Math.hypot(magnetDelta.x, magnetDelta.z)
            const magnetStrength = distanceToMagnet * this.focusPoint.magnet.multiplier
            this.focusPoint.position.x += magnetStrength * magnetDelta.x * this.game.ticker.delta
            this.focusPoint.position.z += magnetStrength * magnetDelta.z * this.game.ticker.delta
            // console.log(magnetStrength)
            

            // console.log('---')
            // console.log(distanceToMagnet)
            // console.log(magnetStrength)

        }

        const easing = remap(this.focusPoint.easing, 0, 1, 1, this.game.ticker.delta * 10)
        
        const newSmoothFocusPoint = this.focusPoint.smoothedPosition.clone().lerp(this.focusPoint.position, easing)

        // if(this.game.inputs.mode === Inputs.MODE_TOUCH && this.focusPoint.isTracking)
        // {
        //     if(this.focusPoint.isEased)
        //     {
        //         this.focusPoint.isEased = false
        //         gsap.to(this.focusPoint, { overwrite: true, easing: 0, duration: 1.5, ease: 'power4.out' })
        //     }
        // }
        // else
        // {
        //     if(!this.focusPoint.isEased)
        //     {
        //         this.focusPoint.isEased = true
        //         gsap.to(this.focusPoint, { overwrite: true, easing: 1, duration: 1.5, ease: 'power4.out' })
        //     }
        // }

        const smoothFocusPointDelta = newSmoothFocusPoint.clone().sub(this.focusPoint.smoothedPosition)
        const focusPointSpeed = Math.hypot(smoothFocusPointDelta.x, smoothFocusPointDelta.z) / this.game.ticker.delta
        this.focusPoint.smoothedPosition.copy(newSmoothFocusPoint)
        
        // Default mode
        if(this.mode === View.MODE_DEFAULT)
        {
            // Zoom
            if(this.zoom.toggle !== 0)
            {
                this.zoom.baseRatio += this.zoom.toggle * 0.01
                this.zoom.baseRatio = clamp(this.zoom.baseRatio, 0, 1)
            }

            const zoomSpeedRatio = smoothstep(focusPointSpeed, this.zoom.speedEdge.min, this.zoom.speedEdge.max)
            this.zoom.ratio = this.zoom.baseRatio

            if(this.focusPoint.isTracking && this.game.quality.level === 0)
                this.zoom.ratio += this.zoom.speedAmplitude * zoomSpeedRatio

            this.zoom.smoothedRatio = lerp(this.zoom.smoothedRatio, this.zoom.ratio, this.game.ticker.delta * 10)
        }

        // Radius
        const radiusMax = this.spherical.radius.edges.max + this.ratioOverflow * this.spherical.radius.nonIdealRatioOffset
        this.spherical.radius.current = lerp(this.spherical.radius.edges.min, radiusMax, 1 - this.zoom.smoothedRatio)
        this.spherical.offset.setFromSphericalCoords(this.spherical.radius.current, this.spherical.phi, this.spherical.theta)

        // Position
        this.position.copy(this.focusPoint.smoothedPosition).add(this.spherical.offset)

        // Default camera position
        this.delta = this.position.clone().sub(this.defaultCamera.position)
        this.defaultCamera.position.copy(this.position)

        // Default camera look at and roll
        this.defaultCamera.rotation.set(0, 0, 0)
        this.defaultCamera.lookAt(this.focusPoint.smoothedPosition)

        this.roll.velocity = - this.roll.value * this.roll.pullStrength * this.game.ticker.deltaScaled
        this.roll.speed += this.roll.velocity
        this.roll.value += this.roll.speed * this.game.ticker.deltaScaled
        this.roll.speed *= 1 - this.roll.damping * this.game.ticker.deltaScaled
        this.defaultCamera.rotation.z += this.roll.value

        // Cinematic
        if(this.cinematic.progress > 0)
        {
            this.cinematic.dummy.position.copy(this.cinematic.position)
            this.cinematic.dummy.lookAt(this.cinematic.target)
            this.defaultCamera.position.lerp(this.cinematic.dummy.position, this.cinematic.progress)
            this.defaultCamera.quaternion.slerp(this.cinematic.dummy.quaternion, this.cinematic.progress)
        }

        // Apply to final camera
        if(this.mode === View.MODE_DEFAULT)
        {
            this.camera.position.copy(this.defaultCamera.position)
            this.camera.quaternion.copy(this.defaultCamera.quaternion)
        }
        else if(this.mode === View.MODE_FREE)
        {
            this.freeMode.update(this.game.ticker.delta)
            this.camera.position.copy(this.freeCamera.position)
            this.camera.quaternion.copy(this.freeCamera.quaternion)
        }

        // Cameras matrices
        this.camera.updateMatrixWorld()
        this.defaultCamera.updateMatrixWorld()
        this.freeCamera.updateMatrixWorld()
        
        // Optimal area
        if(this.optimalArea.needsUpdate)
            this.optimalArea.update()
        
        this.optimalArea.position
            .copy(this.optimalArea.basePosition)
            .add(new THREE.Vector3(this.focusPoint.smoothedPosition.x, 0, this.focusPoint.smoothedPosition.z))

        for(const point of this.optimalArea.quad2)
        {
            point.offseted.x = point.base.x + this.focusPoint.position.x
            point.offseted.y = point.base.y + this.focusPoint.position.z

            if(point.helper)
            {
                point.helper.position.x = point.offseted.x
                point.helper.position.z = point.offseted.y
            }
        }

        // Speed lines
        this.speedLines.clipSpaceTarget.value.copy(this.speedLines.worldTarget)
        this.speedLines.clipSpaceTarget.value.project(this.camera)

        this.speedLines.smoothedStrength.value = lerp(this.speedLines.smoothedStrength.value, this.speedLines.strength, this.game.ticker.delta * 2)
    }
}