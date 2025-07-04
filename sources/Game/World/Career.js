import * as THREE from 'three/webgpu'
import { Game } from '../Game.js'
import { color, float, Fn, luminance, max, mix, positionGeometry, step, texture, uniform, uv, vec4 } from 'three/tsl'
import gsap from 'gsap'
import { clamp } from 'three/src/math/MathUtils.js'

export class Career
{
    constructor(references)
    {
        this.game = Game.getInstance()

        this.references = references

        // Debug
        if(this.game.debug.active)
        {
            this.debugPanel = this.game.debug.panel.addFolder({
                title: '💼 Career',
                expanded: false,
            })
        }

        this.setLines()
        this.updateDigits()

        this.game.ticker.events.on('tick', () =>
        {
            this.update()
        })
    }

    setLines()
    {
        this.lines = {}
        this.lines.items = []
        this.lines.activeElevation = 2.5
        this.lines.padding = 0.25
        
        const lineGroups = this.references.get('line')

        const colors = {
            blue: uniform(color('#5390ff')),
            orange: uniform(color('#ff8039')),
            purple: uniform(color('#b65fff')),
            green: uniform(color('#a2ffab'))
        }

        for(const group of lineGroups)
        {
            const item = {}
            item.group = group
            item.size = parseFloat(item.group.userData.size)
            item.hasEnd = item.group.userData.hasEnd
            item.color = item.group.userData.color
            
            item.stone = item.group.children.find(child => child.name.startsWith('stone'))
            item.stone.position.y = 0
            
            item.origin = new THREE.Vector2(item.group.position.x, item.group.position.z)
            
            item.isIn = false
            item.elevationTarget = 0
            item.offsetTarget = 0
            item.reveal = uniform(0)

            {
                item.textMesh = item.stone.children.find(child => child.name.startsWith('careerText'))

                const material = new THREE.MeshLambertNodeMaterial({ transparent: true })
                
                const baseTexture = item.textMesh.material.map
                baseTexture.colorSpace = THREE.NoColorSpace
                baseTexture.magFilter = THREE.LinearFilter
                baseTexture.minFilter = THREE.LinearFilter
                baseTexture.wrapS = THREE.ClampToEdgeWrapping
                baseTexture.wrapT = THREE.ClampToEdgeWrapping
                baseTexture.generateMipmaps = false

                const baseColor = colors[item.color]

                material.outputNode = Fn(() =>
                {
                    const baseUv = uv().toVar()

                    baseUv.x.step(item.reveal).lessThan(0.5).discard()

                    const textureColor = texture(baseTexture, baseUv)

                    const alpha = step(0.1, max(textureColor.r, textureColor.b))

                    const emissiveColor = baseColor.div(luminance(baseColor)).mul(1.7)

                    const maskColor = color('#251f2b')
                    const finalColor = mix(maskColor, emissiveColor, textureColor.r)
                    
                    return vec4(finalColor, alpha)
                })()

                // Mesh
                item.textMesh.castShadow = false
                item.textMesh.receiveShadow = false
                item.textMesh.material = material
            }

            this.lines.items.push(item)
        }

        // Debug
        if(this.game.debug.active)
        {
            this.game.debug.addThreeColorBinding(this.debugPanel, colors.blue.value, 'blue')
            this.game.debug.addThreeColorBinding(this.debugPanel, colors.orange.value, 'orange')
            this.game.debug.addThreeColorBinding(this.debugPanel, colors.purple.value, 'purple')
            this.game.debug.addThreeColorBinding(this.debugPanel, colors.green.value, 'green')
        }
    }

    updateDigits()
    {
        this.year = {}
        this.year.group = this.references.get('year')[0]
        this.year.origin = new THREE.Vector2(this.year.group.position.x, this.year.group.position.z)
        this.year.size = 17
        this.year.offsetTarget = 0
        this.year.start = 2008
        this.year.current = this.year.start

        //    Digit indexes
        //
        //      --- 0 ---
        //    |           |
        //    5           1
        //    |           |
        //      --- 6 --- 
        //    |           |
        //    4           2
        //    |           |
        //      --- 3 ---

        const a = 255

        const digitData = new Uint8Array([
            a, a, a, a, a, a, 0, // 0
            0, a, a, 0, 0, 0, 0, // 1
            a, a, 0, a, a, 0, a, // 2
            a, a, a, a, 0, 0, a, // 3
            0, a, a, 0, 0, a, a, // 4
            a, 0, a, a, 0, a, a, // 5
            a, 0, a, a, a, a, a, // 6
            a, a, a, 0, 0, 0, 0, // 7
            a, a, a, a, a, a, a, // 8
            a, a, a, a, 0, a, a, // 9
        ])

        this.year.digitsTexture = new THREE.DataTexture(
            digitData,
            7,
            10,
            THREE.RedFormat,
            THREE.UnsignedByteType,
            THREE.UVMapping,
            THREE.ClampToEdgeWrapping,
            THREE.ClampToEdgeWrapping,
            THREE.NearestFilter,
            THREE.NearestFilter
        )
        this.year.digitsTexture.needsUpdate = true

        this.year.digits = []

        const digitMeshes = this.year.group.children.filter(child => child.name.startsWith('digit'))

        for(const mesh of digitMeshes)
        {
            const digit = {}
            digit.mesh = mesh
            digit.indexUniform = uniform(0)
            
            const material = new THREE.MeshBasicNodeMaterial()
            material.outputNode = vec4(1.7)

            material.positionNode = Fn(() =>
            {
                const barUv = uv(1).toVar()

                const uvY = digit.indexUniform.div(10).add(float(0.5).div(10))
                barUv.y.assign(uvY)

                const barActive = texture(this.year.digitsTexture, barUv).r

                const newPosition = positionGeometry.toVar()
                newPosition.y.subAssign(barActive.oneMinus())

                return newPosition
            })()

            digit.mesh.material = material

            this.year.digits.push(digit)
        }

        this.year.updateDigits = (year = 2025) =>
        {
            const yearString = `${year}`
            let i = 0
            for(const digit of this.year.digits)
            {
                digit.indexUniform.value = parseInt(yearString[i])
                i++
            }
        }

        this.year.updateDigits(this.year.current)

        // // Test mesh
        // const mesh = new THREE.Mesh(
        //     new THREE.PlaneGeometry(2, 2),
        //     new THREE.MeshBasicMaterial({ map: this.year.digitsTexture, side: THREE.DoubleSide })
        // )
        // mesh.position.y = 4
        // mesh.position.z = -30
        // mesh.position.x = -10
        // this.game.scene.add(mesh)
    }

    update()
    {
        const playerPosition = new THREE.Vector2(this.game.player.position.x, this.game.player.position.z)

        // Lines
        for(const item of this.lines.items)
        {
            const delta = item.origin.clone().sub(playerPosition)

            // Is in
            if(delta.y > - this.lines.padding && delta.y < item.size + this.lines.padding * 2)
            {
                if(!item.isIn)
                {
                    item.isIn = true
                    gsap.to(item.reveal, { value: 1, duration: 1, delay: 0.3, overwrite: true, ease: 'power2.inOut' })
                }
            }
            else
            {
                if(item.isIn)
                {
                    item.isIn = false
                    gsap.to(item.reveal, { value: 0, duration: 1, overwrite: true, ease: 'power2.inOut' })
                }
            }

            // Elevation
            if(item.isIn)
            {
                item.elevationTarget = this.lines.activeElevation
            }
            else
            {
                if(delta.y > item.size)
                {
                    if(item.hasEnd)
                        item.elevationTarget = 0
                }
                else
                    item.elevationTarget = 0
            }

            item.stone.position.y += (item.elevationTarget - item.stone.position.y) * this.game.ticker.deltaScaled * 3

            // Offset
            if(item.isIn)
            {
                if(item.stone.position.y > 1)
                    item.offsetTarget = - clamp(delta.y, 0, item.size)
            }
            else
            {
                // End
                if(delta.y > item.size)
                    item.offsetTarget = - item.size
                // Start
                else
                    item.offsetTarget = 0
            }

            item.stone.position.z += (item.offsetTarget - item.stone.position.z) * this.game.ticker.deltaScaled * 10
        }

        // Year
        const delta = this.year.origin.clone().sub(playerPosition)

        if(delta.y > this.year.size)
            this.year.offsetTarget = this.year.size
        else if(delta.y < 0)
            this.year.offsetTarget = 0
        else
            this.year.offsetTarget = delta.y

        const finalPositionZ = this.year.origin.y - this.year.offsetTarget
        this.year.group.position.z += (finalPositionZ - this.year.group.position.z) * this.game.ticker.deltaScaled * 10

        const yearCurrent = this.year.start + Math.floor(this.year.offsetTarget)

        if(yearCurrent !== this.year.current)
        {
            this.year.current = yearCurrent
            this.year.updateDigits(this.year.current)
        }
    }
}