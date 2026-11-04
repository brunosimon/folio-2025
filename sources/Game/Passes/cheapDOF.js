import { hashBlur } from 'three/examples/jsm/tsl/display/hashBlur.js'
import { convertToTexture, Fn, mix, nodeObject, uniform, uv } from 'three/tsl'
import { Node } from 'three/webgpu'

class CheapDOFNode extends Node
{
	static get type()
	{
		return 'CheapDOFNode'
	}

	constructor(textureNode)
	{
		super('vec4')

		this.textureNode = textureNode
		this.size = uniform(2)
		this.separation = uniform(1.25)
		this.start = uniform(0.2)
		this.end = uniform(0.5)

		this.repeats = uniform(25)
		this.amount = uniform(0.003)
	}

	setup()
	{
		const outputNode = Fn( () =>
		{
			// Strength
			const strength = uv().y.sub(0.5).abs().smoothstep(this.start, this.end)
			// return vec4(vec3(strength), 1)

			// Hash blur
			const blurOutput = hashBlur(this.textureNode, strength.mul(this.amount), {
				repeats: this.repeats,
				premultipliedAlpha: true
			})

			// // Box blur
			// const blurOutput = boxBlur(this.textureNode, {
			// 	size: this.size,
			// 	separation: this.separation
			// })

			// return blurOutput

			return mix(this.textureNode, blurOutput, strength)
		} )()

		return outputNode
	}
}

export default CheapDOFNode

export const cheapDOF = (node) => nodeObject(new CheapDOFNode(convertToTexture(node)))