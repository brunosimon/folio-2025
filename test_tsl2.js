import { Texture } from 'three';
import { texture } from 'three/tsl';

const tex = new Texture();
const tex2 = new Texture();
const t1 = texture(tex);
const t2 = texture(tex);

t1.value = tex2;

console.log(t2.value === tex2);
