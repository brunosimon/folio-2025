import { max, float, min, Fn, vec3, sub, overloadingFn } from 'three';

export const blendDarken_0 = /*#__PURE__*/ Fn( ( [ base_immutable, blend_immutable ] ) => {

	const blend = float( blend_immutable ).toVar();
	const base = float( base_immutable ).toVar();

	return min( blend, base );

} ).setLayout( {
	name: 'blendDarken_0',
	type: 'float',
	inputs: [
		{ name: 'base', type: 'float' },
		{ name: 'blend', type: 'float' }
	]
} );

export const blendDarken_1 = /*#__PURE__*/ Fn( ( [ base_immutable, blend_immutable ] ) => {

	const blend = vec3( blend_immutable ).toVar();
	const base = vec3( base_immutable ).toVar();

	return vec3( blendDarken_0( base.r, blend.r ), blendDarken_0( base.g, blend.g ), blendDarken_0( base.b, blend.b ) );

} ).setLayout( {
	name: 'blendDarken_1',
	type: 'vec3',
	inputs: [
		{ name: 'base', type: 'vec3' },
		{ name: 'blend', type: 'vec3' }
	]
} );

export const blendDarken_2 = /*#__PURE__*/ Fn( ( [ base_immutable, blend_immutable, opacity_immutable ] ) => {

	const opacity = float( opacity_immutable ).toVar();
	const blend = vec3( blend_immutable ).toVar();
	const base = vec3( base_immutable ).toVar();

	return blendDarken_1( base, blend ).mul( opacity ).add( base.mul( sub( 1.0, opacity ) ) );

} ).setLayout( {
	name: 'blendDarken_2',
	type: 'vec3',
	inputs: [
		{ name: 'base', type: 'vec3' },
		{ name: 'blend', type: 'vec3' },
		{ name: 'opacity', type: 'float' }
	]
} );


export const blendLinearBurn_0 = /*#__PURE__*/ Fn( ( [ base_immutable, blend_immutable ] ) => {

	const blend = float( blend_immutable ).toVar();
	const base = float( base_immutable ).toVar();

	return max( base.add( blend.sub( 1.0 ) ), 0.0 );

} ).setLayout( {
	name: 'blendLinearBurn_0',
	type: 'float',
	inputs: [
		{ name: 'base', type: 'float' },
		{ name: 'blend', type: 'float' }
	]
} );

export const blendLinearBurn_1 = /*#__PURE__*/ Fn( ( [ base_immutable, blend_immutable ] ) => {

	const blend = vec3( blend_immutable ).toVar();
	const base = vec3( base_immutable ).toVar();

	return max( base.add( blend.sub( vec3( 1.0 ) ) ), vec3( 0.0 ) );

} ).setLayout( {
	name: 'blendLinearBurn_1',
	type: 'vec3',
	inputs: [
		{ name: 'base', type: 'vec3' },
		{ name: 'blend', type: 'vec3' }
	]
} );

export const blendLinearBurn_2 = /*#__PURE__*/ Fn( ( [ base_immutable, blend_immutable, opacity_immutable ] ) => {

	const opacity = float( opacity_immutable ).toVar();
	const blend = vec3( blend_immutable ).toVar();
	const base = vec3( base_immutable ).toVar();

	return blendLinearBurn_1( base, blend ).mul( opacity ).add( base.mul( sub( 1.0, opacity ) ) );

} ).setLayout( {
	name: 'blendLinearBurn_2',
	type: 'vec3',
	inputs: [
		{ name: 'base', type: 'vec3' },
		{ name: 'blend', type: 'vec3' },
		{ name: 'opacity', type: 'float' }
	]
} );

// export const blendDarken = /*#__PURE__*/ overloadingFn( [ blendDarken_0, blendDarken_1, blendDarken_2 ] );
