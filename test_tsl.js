import * as THREE from 'three';
import { texture } from 'three/tsl';

const tex1 = new THREE.Texture();
const tex2 = new THREE.Texture();

const texNode = texture(tex1);
console.log(texNode.value === tex1);
texNode.value = tex2;
console.log(texNode.value === tex2);
