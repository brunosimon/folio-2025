import * as THREE from 'three/webgpu';
import { texture, vec4, mix, color, Fn } from 'three/tsl';

const tex = new THREE.Texture();
const node1 = texture(tex);
const node2 = texture(tex);

const renderer = new THREE.WebGPURenderer();
const material = new THREE.MeshBasicNodeMaterial({
    colorNode: mix(node1, node2, 0.5)
});

const mesh = new THREE.Mesh(new THREE.PlaneGeometry(), material);
const scene = new THREE.Scene();
scene.add(mesh);
const camera = new THREE.PerspectiveCamera();

// Compile
renderer.compile(scene, camera).then(() => {
    console.log("Compiled successfully!");
    
    // Now update node2.value
    node2.value = new THREE.Texture();
    
    // Check if they share the same uniform in WebGPU backend
    // It's hard to inspect, but we can check the node1/node2 values
    console.log("node1.value === node2.value:", node1.value === node2.value);
}).catch(console.error);

