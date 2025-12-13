import './threejs-override.js'
import { Game } from './Game/Game.js'
import * as THREE from 'three/webgpu'

console.log(THREE.REVISION)

if(import.meta.env.VITE_GAME_PUBLIC)
    window.game = new Game()
else
    new Game()