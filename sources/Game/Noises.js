import * as THREE from 'three/webgpu'
import { Game } from './Game.js'


import { If, vec2, vec3, abs, sqrt, vec4, mod, Fn, dot, sin, fract, length, mul, min, float, uv, floor, ceil, smoothstep, int, mix, Loop } from 'three/tsl';

const hash = /*#__PURE__*/ Fn( ( [ p_immutable ] ) => {

	const p = vec2( p_immutable ).toVar();
	p.assign( vec2( dot( p, vec2( 127.1, 311.7 ) ), dot( p, vec2( 269.5, 183.3 ) ) ) );

	return fract( sin( p ).mul( 43758.5453123 ) );

} ).setLayout( {
	name: 'hash',
	type: 'vec2',
	inputs: [
		{ name: 'p', type: 'vec2' }
	]
} );

const voronoiNode = /*#__PURE__*/ Fn( ( [ uv_immutable, repeat_immutable ] ) => {

	const repeat = float( repeat_immutable ).toVar();
	const uv = vec2( uv_immutable ).toVar();
	const cellId = vec2( 0.0 ).toVar();
	uv.mulAssign( repeat );
	const i = vec2( floor( uv ) ).toVar();
	const f = vec2( fract( uv ) ).toVar();
	const minDist = float( 1.0 ).toVar();
	const minEdge = float( 1.0 ).toVar();
	const bestId = vec2( 0.0 ).toVar();

	Loop( { start: int( - 1 ), end: int( 1 ), name: 'y', condition: '<=' }, ( { y } ) => {

		Loop( { start: int( - 1 ), end: int( 1 ), name: 'x', condition: '<=' }, ( { x } ) => {

			const neighbor = vec2( x, y ).toVar();
			const cell = vec2( mod( i.add( neighbor ), repeat ) ).toVar();
			const point = vec2( hash( cell ) ).toVar();
			const diff = vec2( neighbor.add( point.sub( f ) ) ).toVar();
			const dist = float( length( diff ) ).toVar();

			If( dist.lessThan( minDist ), () => {

				minEdge.assign( minDist );
				minDist.assign( dist );
				bestId.assign( i.add( neighbor ) );

			} ).ElseIf( dist.lessThan( minEdge ), () => {

				minEdge.assign( dist );

			} );

		} );

	} );

	cellId.assign( fract( bestId.div( repeat ) ) );

	return vec3( minDist, minEdge.sub(minDist), hash(cellId).x );

} ).setLayout( {
	name: 'voronoi',
	type: 'vec3',
	inputs: [
		{ name: 'uv', type: 'vec2' },
		{ name: 'repeat', type: 'float' }
	]
} );


export const modulo = /*#__PURE__*/ Fn( ( [ divident_immutable, divisor_immutable ] ) => {

	const divisor = vec2( divisor_immutable ).toVar();
	const divident = vec2( divident_immutable ).toVar();
	const positiveDivident = vec2( mod( divident, divisor ).add( divisor ) ).toVar();

	return mod( positiveDivident, divisor );

} ).setLayout( {
	name: 'modulo',
	type: 'vec2',
	inputs: [
		{ name: 'divident', type: 'vec2' },
		{ name: 'divisor', type: 'vec2' }
	]
} );

export const random = /*#__PURE__*/ Fn( ( [ value_immutable ] ) => {

	const value = vec2( value_immutable ).toVar();
	value.assign( vec2( dot( value, vec2( 127.1, 311.7 ) ), dot( value, vec2( 269.5, 183.3 ) ) ) );

	return float( - 1.0 ).add( mul( 2.0, fract( sin( value ).mul( 43758.5453123 ) ) ) );

} ).setLayout( {
	name: 'random',
	type: 'vec2',
	inputs: [
		{ name: 'value', type: 'vec2' }
	]
} );

export const perlinNode = /*#__PURE__*/ Fn( ( [ uv_immutable, cell_amount_immutable, period_immutable ] ) => {

	const period = vec2( period_immutable ).toVar();
	const cell_amount = float( cell_amount_immutable ).toVar();
	const uv = vec2( uv_immutable ).toVar();
	uv.assign( uv.mul( float( cell_amount ) ) );
	const cellsMinimum = vec2( floor( uv ) ).toVar();
	const cellsMaximum = vec2( ceil( uv ) ).toVar();
	const uv_fract = vec2( fract( uv ) ).toVar();
	cellsMinimum.assign( modulo( cellsMinimum, period ) );
	cellsMaximum.assign( modulo( cellsMaximum, period ) );
	const blur = vec2( smoothstep( 0.0, 1.0, uv_fract ) ).toVar();
	const lowerLeftDirection = vec2( random( vec2( cellsMinimum.x, cellsMinimum.y ) ) ).toVar();
	const lowerRightDirection = vec2( random( vec2( cellsMaximum.x, cellsMinimum.y ) ) ).toVar();
	const upperLeftDirection = vec2( random( vec2( cellsMinimum.x, cellsMaximum.y ) ) ).toVar();
	const upperRightDirection = vec2( random( vec2( cellsMaximum.x, cellsMaximum.y ) ) ).toVar();
	const fraction = vec2( fract( uv ) ).toVar();

	return mix( mix( dot( lowerLeftDirection, fraction.sub( vec2( int( 0 ), int( 0 ) ) ) ), dot( lowerRightDirection, fraction.sub( vec2( int( 1 ), int( 0 ) ) ) ), blur.x ), mix( dot( upperLeftDirection, fraction.sub( vec2( int( 0 ), int( 1 ) ) ) ), dot( upperRightDirection, fraction.sub( vec2( int( 1 ), int( 1 ) ) ) ), blur.x ), blur.y ).mul( 0.8 ).add( 0.5 );

} ).setLayout( {
	name: 'perlinNode',
	type: 'float',
	inputs: [
		{ name: 'uv', type: 'vec2' },
		{ name: 'cell_amount', type: 'float' },
		{ name: 'period', type: 'vec2' }
	]
} );

export class Noises
{
    constructor()
    {
        this.game = Game.getInstance()

        // Render target
        this.resolution = 128
        this.renderTarget = new THREE.RenderTarget(
            this.resolution,
            this.resolution,
            {
                depthBuffer: false,
                type: THREE.HalfFloatType
            }
        )
        this.texture = this.renderTarget.texture
        this.texture.wrapS = THREE.RepeatWrapping
        this.texture.wrapT = THREE.RepeatWrapping

        // Material
        this.material = new THREE.MeshBasicNodeMaterial({ color: 'red', wireframe: false })

		const perlin = perlinNode(uv(), 6.0, 6.0).remap(0.1, 0.9, 0.0, 1.0)
		const voronoi = voronoiNode(uv(), 8)
		
        this.material.outputNode = vec4(
            perlin,
            voronoi.xyz
        )

        // Quad mesh
        const quadMesh = new THREE.QuadMesh(this.material)
        this.game.rendering.renderer.setRenderTarget(this.renderTarget)
        quadMesh.renderAsync(this.game.rendering.renderer)

        // // Tests
        // const testMesh1 = new THREE.Mesh(
        //     new THREE.BoxGeometry(5, 5, 5),
        //     new THREE.MeshBasicMaterial({ map: this.texture })
        // )
        // testMesh1.position.y = 5

        // const testMesh2 = new THREE.Mesh(
        //     new THREE.BoxGeometry(5, 5, 5),
        //     new THREE.MeshBasicMaterial({ map: this.texture })
        // )
        // testMesh2.position.x = 5
        // testMesh2.position.y = 5

        // this.game.scene.add(testMesh1, testMesh2)
    }
}