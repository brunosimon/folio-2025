import * as THREE from 'three'
import { positionLocal, varying, max, positionWorld, float, Fn, uniform, color, mix, vec3, vec4, normalWorld } from 'three'
import { Game } from './Game.js'
import { blendDarken_2 } from './tsl/blendings.js'

export class Materials
{
    constructor()
    {
        this.game = new Game()
        this.list = new Map()

        if(this.game.debug.active)
        {
            this.debugPanel = this.game.debug.panel.addFolder({
                title: '🎨 Materials',
                expanded: true,
            })
        }

        this.setLuminance()
        this.setTest()
        this.setNodes()
        this.setPremades()
    }

    setLuminance()
    {
        this.luminance = {}
        this.luminance.coefficients = new THREE.Vector3()
        THREE.ColorManagement.getLuminanceCoefficients(this.luminance.coefficients)

        this.luminance.get = (color) =>
        {
            return color.r * this.luminance.coefficients.x + color.g * this.luminance.coefficients.y + color.b * this.luminance.coefficients.z
        }
    }

    setPremades()
    {
        const createEmissiveTweak = (material) =>
        {
            if(!this.game.debug.active)
                return false

            const update = () =>
            {
                material.color.set(dummy.color)
                material.color.multiplyScalar(material.userData.intensity / this.luminance.get(material.color))
            }

            // console.log(material.color.getHex(THREE.SRGBColorSpace))
            const dummy = { color: material.color.getHex(THREE.SRGBColorSpace) }
            this.debugPanel.addBinding(material.userData, 'intensity', { min: 0, max: 300, step: 1 }).on('change', update)
            this.debugPanel.addBinding(dummy, 'color', { view: 'color' }).on('change', update)
        }

        // Pure white
        const pureWhite = new THREE.MeshLambertNodeMaterial()
        pureWhite.shadowSide = THREE.BackSide
        pureWhite.outputNode = this.lightOutputNode(color('#ffffff'), this.getTotalShadow(pureWhite))
        this.save('pureWhite', pureWhite)
    
        // Emissive headlight
        const emissiveWarnWhite = new THREE.MeshBasicNodeMaterial({ color: '#fba866' })
        emissiveWarnWhite.name = 'emissiveWarnWhite'
        emissiveWarnWhite.userData.intensity = 100
        createEmissiveTweak(emissiveWarnWhite)
        emissiveWarnWhite.color.multiplyScalar(emissiveWarnWhite.userData.intensity / this.luminance.get(emissiveWarnWhite.color))
        this.save('emissiveWarnWhite', emissiveWarnWhite)
    
        // Emissive red
        const emissiveRed = new THREE.MeshBasicNodeMaterial({ color: '#ff3131' })
        emissiveRed.name = 'emissiveRed'
        emissiveRed.userData.intensity = 100
        console.log(emissiveRed.color)
        console.log(this.luminance.get(emissiveRed.color))
        createEmissiveTweak(emissiveRed)
        emissiveRed.color.multiplyScalar(emissiveRed.userData.intensity / this.luminance.get(emissiveRed.color))
        this.save('emissiveRed', emissiveRed)
    }

    setNodes()
    {
        this.lightBounceColor = uniform(color('#7d7f19'))
        this.lightBounceEdgeLow = uniform(float(-1))
        this.lightBounceEdgeHigh = uniform(float(1))
        this.lightBounceDistance = uniform(float(1.5))

        this.shadowColor = uniform(color('#0085db'))
        this.coreShadowEdgeLow = uniform(float(-0.25))
        this.coreShadowEdgeHigh = uniform(float(1))

        // Get total shadow
        this.getTotalShadow = (material) =>
        {
            const totalShadows = float(1).toVar()
            material.receivedShadowNode = Fn(([ shadow ]) => 
            {
                totalShadows.mulAssign(shadow)
                return float(1)
            })

            return totalShadows
        }

        // Light output
        this.lightOutputNode = Fn(([colorBase, totalShadows]) =>
        {
            const finalColor = colorBase.toVar()

            // Light
            finalColor.assign(finalColor.mul(this.game.lighting.colorUniform.mul(this.game.lighting.intensityUniform)))

            // Bounce color
            const bounceOrientation = normalWorld.dot(vec3(0, - 1, 0)).smoothstep(this.lightBounceEdgeLow, this.lightBounceEdgeHigh)
            const bounceDistance = this.lightBounceDistance.sub(positionWorld.y).div(this.lightBounceDistance).max(0).pow(2)
            finalColor.assign(mix(finalColor, this.lightBounceColor, bounceOrientation.mul(bounceDistance)))

            // Core shadow
            const coreShadowMix = normalWorld.dot(this.game.lighting.directionUniform).smoothstep(this.coreShadowEdgeHigh, this.coreShadowEdgeLow)
            
            // Cast shadow
            const castShadowMix = totalShadows.oneMinus()

            // Combined shadows
            const combinedShadowMix = max(coreShadowMix, castShadowMix)
            // const combinedShadowMix = coreShadowMix.add(castShadowMix).min(1)
            
            const shadowColor = colorBase.rgb.mul(this.shadowColor).rgb
            finalColor.assign(mix(finalColor, shadowColor, combinedShadowMix))
            
            // finalColor.assign(blendDarken_2(finalColor.rgb, this.shadowColor, combinedShadowMix))
            
            // return vec4(vec3(combinedShadowMix.oneMinus()), 1)
            return vec4(finalColor.rgb, 1)
        })
        
        // Debug
        if(this.game.debug.active)
        {
            this.debugPanel.addBinding({ color: this.lightBounceColor.value.getHex(THREE.SRGBColorSpace) }, 'color', { label: 'lightBounceColor', view: 'color' })
                .on('change', tweak => { this.lightBounceColor.value.set(tweak.value) })
            this.debugPanel.addBinding(this.lightBounceEdgeLow, 'value', { label: 'lightBounceEdgeLow', min: - 1, max: 1, step: 0.01 })
            this.debugPanel.addBinding(this.lightBounceEdgeHigh, 'value', { label: 'lightBounceEdgeHigh', min: - 1, max: 1, step: 0.01 })
            this.debugPanel.addBinding(this.lightBounceDistance, 'value', { label: 'lightBounceDistance', min: 0, max: 5, step: 0.01 })

            this.debugPanel.addBinding({ color: this.shadowColor.value.getHex(THREE.SRGBColorSpace) }, 'color', { label: 'shadowColor', view: 'color' })
                .on('change', tweak => { this.shadowColor.value.set(tweak.value) })

            this.debugPanel.addBinding(this.coreShadowEdgeLow, 'value', { label: 'coreShadowEdgeLow', min: - 1, max: 1, step: 0.01 })
            this.debugPanel.addBinding(this.coreShadowEdgeHigh, 'value', { label: 'coreShadowEdgeHigh', min: - 1, max: 1, step: 0.01 })
        }
    }

    setTest()
    {
        this.tests = {}
        this.tests.list = new Map()
        this.tests.sphereGeometry = new THREE.IcosahedronGeometry(1, 3)
        this.tests.boxGeometry = new THREE.BoxGeometry(1.5, 1.5, 1.5)
        this.tests.group = new THREE.Group()
        this.tests.group.visible = true
        this.game.scene.add(this.tests.group)
        
        this.tests.update = () =>
        {
            this.list.forEach((material, name) =>
            {
                if(!this.tests.list.has(name))
                {
                    const test = {}

                    // Pure
                    const pureColor = material.color.clone()
                    const maxLength = Math.max(pureColor.r, Math.max(pureColor.g, pureColor.b))
                    if(maxLength > 1)
                        pureColor.set(pureColor.r / maxLength, pureColor.g / maxLength, pureColor.b / maxLength)
                    
                    const boxPure = new THREE.Mesh(this.tests.boxGeometry, new THREE.MeshBasicMaterial({ color: pureColor }))
                    boxPure.position.y = 0.75
                    boxPure.position.x = this.list.size * 3
                    boxPure.position.z = 0
                    boxPure.castShadow = true
                    boxPure.receiveShadow = true
                    this.tests.group.add(boxPure)
                
                    // Box
                    const box = new THREE.Mesh(this.tests.boxGeometry, material)
                    box.position.y = 0.75
                    box.position.x = this.list.size * 3
                    box.position.z = 3
                    box.castShadow = true
                    box.receiveShadow = true
                    this.tests.group.add(box)

                    // Sphere
                    const sphere = new THREE.Mesh(this.tests.sphereGeometry, material)
                    sphere.position.z = 6
                    sphere.position.y = 0.75
                    sphere.position.x = this.list.size * 3
                    sphere.castShadow = true
                    sphere.receiveShadow = true
                    this.tests.group.add(sphere)

                    this.tests.list.set(name, test)
                }
            })
        }
        
        // Debug
        if(this.game.debug.active)
        {
            this.debugPanel.addBinding(this.tests.group, 'visible', { label: 'testsVisibile' })
        }
    }

    save(name, material)
    {
        this.list.set(name, material)
        this.tests.update()
    }

    getFromName(name, baseMaterial)
    {
        // Return existing material
        if(this.list.has(name))
            return this.list.get(name)

        // Create new
        const material = this.createFromMaterial(baseMaterial)

        // Save
        this.save(name, material)
        return material
    }

    createFromMaterial(baseMaterial)
    {
        let material = baseMaterial

        if(baseMaterial.isMeshStandardMaterial)
        {
            material = new THREE.MeshLambertNodeMaterial()
            this.copy(baseMaterial, material)
        }
        
        if(material.isMeshLambertNodeMaterial)
        {
            // Shadow
            material.shadowSide = THREE.BackSide
            material.outputNode = this.lightOutputNode(baseMaterial.color, this.getTotalShadow(material))
        }

        material.name = baseMaterial.name

        return material
    }

    copy(baseMaterial, targetMaterial)
    {
        const properties = [ 'color' ]

        for(const property of properties)
        {
            if(typeof baseMaterial[property] !== 'undefined' && typeof targetMaterial[property] !== 'undefined')
                targetMaterial[property] = baseMaterial[property]
        }
    }

    updateObject(mesh)
    {
        mesh.traverse((child) =>
        {
            if(child.isMesh)
            {
                child.material = this.getFromName(child.material.name, child.material)
            }
        })
    }
}