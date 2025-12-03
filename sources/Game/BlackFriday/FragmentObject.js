import * as THREE from 'three/webgpu'
import { Game } from '../Game.js'
import gsap from 'gsap'
import { alea } from 'seedrandom'

const rng = new alea('easterFragments')

export class FragmentObject
{
    constructor(_position)
    {
        this.game = Game.getInstance()

        this.caught = false
        
        this.group1 = new THREE.Group()
        this.group1.position.copy(_position)
        this.game.scene.add(this.group1)

        this.group2 = this.game.resources.fragment.scene.clone(true)
        this.group1.add(this.group2)

        this.scale = 1
        this.radiusMultiplier = 1
        this.elapsedTime = 0
        this.timeMultiplier = 1

        this.main = null
        this.fragments = []

        // this.game.materials.createEmissive('emissivePurple', '#9830ff', 3)

        for(const _child of this.group2.children)
        {
            if(_child.name.startsWith('main'))
                this.main = _child
            else
            {
                this.fragments.push(_child)
                _child.position.y = (rng() - 0.5) * 0.5
                _child.userData.timeOffset = rng() * Math.PI
                _child.userData.timeMultiplier = (0.25 + rng() * 0.75) * Math.sign(rng() - 0.5)
                _child.userData.radius = 0.25 + rng() * 0.5
            }
        }

        this.game.materials.updateObject(this.group1)

        this.game.ticker.events.on('tick', () =>
        {
            this.update()
        }, 10)
    }

    catch()
    {
        if(this.caught)
            return

        this.caught = true

        // gsap.to(this.group1.position, { y: '+= 1', duration: 1.5, ease: 'elastic.out(1.5,0.4)' })
        gsap.to(this.main.scale, { x: '1.1', y: '1.1', z: '1.1', duration: 1.2, ease: 'elastic.out(15,0.3)' })

        gsap.to(this, { scale: 0, duration: 0.5, delay: 1.5, ease: 'power4.in', onComplete: () =>
        {
            this.group2.visible = false
        } })

        gsap.to(this, { radiusMultiplier: 3, delay: 0, duration: 1.5, ease: 'power4.inOut', onComplete: () =>
        {
            gsap.to(this, { radiusMultiplier: 0, duration: 0.5, ease: 'power4.in' })
        } })
    }

    update()
    {
        if(this.caught)
            this.timeMultiplier += this.game.ticker.deltaScaled * 8

        this.elapsedTime += this.game.ticker.deltaScaled * this.timeMultiplier
        this.group1.y = Math.sin(this.game.ticker.elapsedScaled * 0.5) * 0.3

        this.group1.scale.setScalar(this.scale)
        
        this.main.rotation.x = Math.sin(this.elapsedTime) * 0.2
        this.main.rotation.z = Math.sin(this.elapsedTime) * 0.2
        
        for(const _fragment of this.fragments)
        {
            _fragment.position.x = Math.sin((this.elapsedTime + _fragment.userData.timeOffset) * _fragment.userData.timeMultiplier) * _fragment.userData.radius * this.radiusMultiplier
            _fragment.position.z = Math.cos((this.elapsedTime + _fragment.userData.timeOffset) * _fragment.userData.timeMultiplier) * _fragment.userData.radius * this.radiusMultiplier
        }
    }
}