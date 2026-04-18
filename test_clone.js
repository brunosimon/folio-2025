import * as THREE from 'three';
const tex = new THREE.CompressedTexture([{data: new Uint8Array(4), width: 2, height: 2}], 2, 2, THREE.RGBAFormat);
const clone = tex.clone();
console.log("tex mipmaps length:", tex.mipmaps.length);
console.log("clone mipmaps length:", clone.mipmaps.length);
console.log("clone needsUpdate:", clone.needsUpdate);
