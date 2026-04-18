import { Texture } from 'three';
import { texture } from 'three/tsl';

const tex = new Texture();
const t1 = texture(tex);
const t2 = texture(tex);

console.log(t1.name, t2.name);
