import * as THREE from 'three/webgpu';
import { texture } from 'three/tsl';

const tex = new THREE.Texture();
const node1 = texture(tex);
const node2 = texture(tex);

console.log("node1 === node2:", node1 === node2);

node2.value = new THREE.Texture();
console.log("node1.value === node2.value:", node1.value === node2.value);
console.log("node1.value === tex:", node1.value === tex);
