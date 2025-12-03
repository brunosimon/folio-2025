import * as THREE from 'three/webgpu'
import { LineGeometry } from 'three/addons/lines/LineGeometry.js'
import { Line2 } from 'three/addons/lines/webgpu/Line2.js';
import { Game } from './Game.js'
import gsap from 'gsap'
import { remapClamp } from './utilities/maths.js';

export class Tornado
{
    constructor()
    {
        this.game = Game.getInstance()

        this.running = false
        this.strength = 0
        this.resolution = 100
        this.position = new THREE.Vector3()
        this.achievementAchieved = this.game.achievements.groups.get('cataclysm')?.items[0].achieved

        // Debug
        if(this.game.debug.active)
        {
            this.debugPanel = this.game.debug.panel.addFolder({
                title: '🌪️ Tornado',
                expanded: false
            })
        }

        this.setPath()
        // this.setPreviews()
        this.setData()

        // Update
        this.game.ticker.events.on('tick', () =>
        {
            this.update()
        }, 9)

        // Debug
        if(this.game.debug.active)
        {
            this.debugPanel.addButton({ title: 'start' }).on('click', () => { this.start() })
            this.debugPanel.addButton({ title: 'stop' }).on('click', () => { this.stop() })
        }
    }

    setPath()
    {
        const points = []

        const children = [...this.game.resources.tornadoPathReferencesModel.scene.children]
        children.sort((a, b) =>
        {
            if ( a.name < b.name )
                return -1
            
            if ( a.name > b.name )
                return 1
            
            return 0
        })
        
        for(const child of children)
        {
            const point = new THREE.Vector3(
                child.position.x, 
                0, 
                child.position.z
            )

            points.push(point)
        }
        const curve = new THREE.CatmullRomCurve3(points, true)
        this.path = curve.getSpacedPoints(this.resolution)
        // this.path = points
    }

    setPreviews()
    {
        this.previews = {}

        const boxGeometry = new THREE.BoxGeometry(0.1, 1, 0.1)
        this.previews.target = new THREE.Mesh(boxGeometry, new THREE.MeshBasicNodeMaterial({ color: '#00ff00' }))
        this.previews.target.scale.y = 10
        this.game.scene.add(this.previews.target)

        this.previews.eased = new THREE.Mesh(boxGeometry, new THREE.MeshBasicNodeMaterial({ color: '#00ffff' }))
        this.previews.eased.scale.y = 10
        this.game.scene.add(this.previews.eased)

        const positions = []
        for(const point of this.path)
        {
            positions.push(point.x, point.y, point.z)
        }
        const lineGeometry = new LineGeometry()
        lineGeometry.setPositions(positions)
        
        const lineMaterial = new THREE.Line2NodeMaterial({
		    color: '#00ff00',
            linewidth: 5, // in world units with size attenuation, pixels otherwise
            // vertexColors: true,
            dashed: true,
            dashSize: 0.2,
            gapSize: 0.4,
            alphaToCoverage: true,
        })
        
        this.previews.line = new Line2(lineGeometry, lineMaterial)
        this.previews.line.computeLineDistances()
        this.previews.line.scale.set( 1, 1, 1 );
        this.previews.line.position.y += 0.5
        this.game.scene.add(this.previews.line)
    }

    setData()
    {
        this.data = {}
        
        // Server message event
        this.game.server.events.on('message', (data) =>
        {
            // Init and insert
            if(data.type === 'init' || data.type === 'cataclysmUpdate')
            {
                if(data.cataclysmRunning)
                    this.start()
                else
                    this.stop()
            }
        })

        // Init message already received
        if(this.game.server.initData)
        {
            if(this.game.server.initData.cataclysmRunning)
                this.start()
            else
                this.stop()
        }
    }

    start()
    {
        if(this.running)
            return

        // Move to position to prevent easing
        const progress = this.game.dayCycles.absoluteProgress * 2
        this.position.copy(this.getPosition(progress))

        // Strength
        gsap.to(this, { strength: 1, duration: 20, ease: 'linear', overwrite: true })
        
        // Weather
        this.game.weather.override.start(
            {
                humidity: 1,
                electricField: 0.5,
                clouds: 1,
                wind: 1
            },
            20
        )

        // Day cycles
        this.game.dayCycles.override.start(
            {
                lightColor: new THREE.Color('#ff4141'),
                lightIntensity: 1.2,
                shadowColor: new THREE.Color('#4e009c'),
                fogColorA: new THREE.Color('#3e53ff'),
                fogColorB: new THREE.Color('#ff4ce4'),
                fogNearRatio: 0,
                fogFarRatio: 1.25
            },
            20
        )

        // Save
        this.running = true
    }

    stop()
    {
        if(!this.running)
            return

        // Strength
        gsap.to(this, { strength: 0, duration: 20, ease: 'linear', overwrite: true })

        // Weather
        this.game.weather.override.end(20)

        // Day cycles
        this.game.dayCycles.override.end(20)

        // Save
        this.running = false
    }

    getPosition(progress)
    {
        const loopProgress = progress % 1
        const prevIndex = Math.floor(loopProgress * this.resolution)
        const nextIndex = (prevIndex + 1) % this.resolution
        const mix = loopProgress * this.resolution - prevIndex
        const prevPosition = this.path[prevIndex]
        const nextPosition = this.path[nextIndex]
        const position = new THREE.Vector3().lerpVectors(prevPosition, nextPosition, mix)

        return position
    }

    update()
    {
        if(this.strength === 0)
            return

        // Position on path
        const progress = this.game.dayCycles.absoluteProgress * 1
        const newPosition = this.getPosition(progress)
        
        this.position.lerp(newPosition, 0.3 * this.game.ticker.deltaScaled)

        // Previews
        if(this.previews)
        {
            this.previews.target.position.copy(newPosition)
            this.previews.eased.position.copy(this.position)
        }

        // Physics vehicle
        const toTornado = this.position.clone().sub(this.game.physicalVehicle.position)
        const distance = toTornado.length()
        
        const strength = remapClamp(distance, 20, 2, 0, 1)
        if(!this.achievementAchieved && strength > 0.5)
        {
            this.achievementAchieved = true
            this.game.achievements.setProgress('cataclysm', 1)
        }

        const force = toTornado.clone().normalize()

        const sideAngleStrength = remapClamp(distance, 8, 2, 0, Math.PI * 0.25)
        force.applyAxisAngle(new THREE.Vector3(0, 1, 0), -sideAngleStrength)

        const flyForce = remapClamp(distance, 8, 2, 0, 1)
        force.y = flyForce * 2

        force.setLength(strength * this.game.ticker.deltaScaled * this.strength * 30)
        this.game.physicalVehicle.chassis.physical.body.applyImpulse(force)
    }
}
