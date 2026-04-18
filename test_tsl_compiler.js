import * as THREE from 'three';
import { texture, uv, Fn } from 'three/tsl';

const tex = new THREE.Texture();
const t1 = texture(tex, uv());
const t2 = texture(tex, uv());

const builder = new THREE.NodeBuilder();
builder.material = new THREE.MeshBasicMaterial();
builder.context = { material: builder.material };

const fn = Fn(() => {
    return t1.rgb.add(t2.rgb);
})();

fn.build(builder);

console.log("Uniforms:", builder.getUniforms('fragment').length);
