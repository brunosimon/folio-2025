import { time, vec2, Fn, texture } from 'three'

export default Fn(([ noisesTexture, position ]) =>
{
    const direction = vec2(
        -1,
        1
    ).normalize()

    const remapedPosition = position.mul(0.5)

    const noiseUv1 = remapedPosition.xy.mul(0.06).add(direction.mul(time.mul(0.03))).xy
    const noise1 = texture(noisesTexture, noiseUv1).r.sub(0.5).mul(2)

    const noiseUv2 = remapedPosition.xy.mul(0.043).add(direction.mul(time.mul(0.01))).xy
    const noise2 = texture(noisesTexture, noiseUv2).r

    const intensity = noise1.mul(noise2)
    
    return vec2(direction.mul(intensity))
})