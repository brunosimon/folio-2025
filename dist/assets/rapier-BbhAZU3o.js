import { B as Ut, __tla as __tla_0 } from "./index-D4lfjijP.js";
let Et, At, jt, xe, Lr, Hr, je, Ur, dt, ue, P, Zr, bt, Le, xt, Ie, He, Vr, Or, Kr, Ah, st, Rr, Fr, jr, Wr, ce, ke, O, Pr, vr, Dr, _e, X, D, Xr, et, oe, Q, kr, Nr, qr, he, Jr, ht, ut, ze, Ir, zr, ne, we, Br, Ih, Dt, pt, gt, Ar, Tr, se, U, Sr, B, Cr, S, Ne, It, Ae, De, Fe, yr, ae, Ee, de, M, ot, at, F, pe, Er, Mr, xr, Yr, Gr, Me, le, Pe, Re, Ce, fr, w, Te, Lt, Fh, Eh, jh;
let __tla = Promise.all([
  (() => {
    try {
      return __tla_0;
    } catch {
    }
  })()
]).then(async () => {
  const $r = "" + new URL("rapier_wasm3d_bg-0Vyjx73g.wasm", import.meta.url).href, Qr = async (s = {}, t) => {
    let e;
    if (t.startsWith("data:")) {
      const r = t.replace(/^data:.*?base64,/, "");
      let a;
      if (typeof Ut == "function" && typeof Ut.from == "function") a = Ut.from(r, "base64");
      else if (typeof atob == "function") {
        const o = atob(r);
        a = new Uint8Array(o.length);
        for (let _ = 0; _ < o.length; _++) a[_] = o.charCodeAt(_);
      } else throw new Error("Cannot decode base64-encoded data URL");
      e = await WebAssembly.instantiate(a, s);
    } else {
      const r = await fetch(t), a = r.headers.get("Content-Type") || "";
      if ("instantiateStreaming" in WebAssembly && a.startsWith("application/wasm")) e = await WebAssembly.instantiateStreaming(r, s);
      else {
        const o = await r.arrayBuffer();
        e = await WebAssembly.instantiate(o, s);
      }
    }
    return e.instance.exports;
  };
  let i;
  function ti(s) {
    i = s;
  }
  const R = new Array(128).fill(void 0);
  R.push(void 0, null, true, false);
  function C(s) {
    return R[s];
  }
  let ct = R.length;
  function T(s) {
    ct === R.length && R.push(R.length + 1);
    const t = ct;
    return ct = R[t], R[t] = s, t;
  }
  function ge(s, t) {
    try {
      return s.apply(this, t);
    } catch (e) {
      i.__wbindgen_export_0(T(e));
    }
  }
  function f(s) {
    return s == null;
  }
  let nt = null;
  function z() {
    return (nt === null || nt.buffer.detached === true || nt.buffer.detached === void 0 && nt.buffer !== i.memory.buffer) && (nt = new DataView(i.memory.buffer)), nt;
  }
  function ei(s) {
    s < 132 || (R[s] = ct, ct = s);
  }
  function lt(s) {
    const t = C(s);
    return ei(s), t;
  }
  const ri = typeof TextDecoder > "u" ? (0, module.require)("util").TextDecoder : TextDecoder;
  let hr = new ri("utf-8", {
    ignoreBOM: true,
    fatal: true
  });
  hr.decode();
  let ft = null;
  function ii() {
    return (ft === null || ft.byteLength === 0) && (ft = new Uint8Array(i.memory.buffer)), ft;
  }
  function pr(s, t) {
    return s = s >>> 0, hr.decode(ii().subarray(s, s + t));
  }
  function ni() {
    let s, t;
    try {
      const a = i.__wbindgen_add_to_stack_pointer(-16);
      i.version(a);
      var e = z().getInt32(a + 0, true), r = z().getInt32(a + 4, true);
      return s = e, t = r, pr(e, r);
    } finally {
      i.__wbindgen_add_to_stack_pointer(16), i.__wbindgen_export_1(s, t, 1);
    }
  }
  function ai(s) {
    i.reserve_memory(s);
  }
  function c(s, t) {
    if (!(s instanceof t)) throw new Error(`expected instance of ${t.name}`);
  }
  let x = 128;
  function A(s) {
    if (x == 1) throw new Error("out of js stack");
    return R[--x] = s, x;
  }
  let yt = null;
  function si() {
    return (yt === null || yt.byteLength === 0) && (yt = new Int32Array(i.memory.buffer)), yt;
  }
  function oi(s, t) {
    return s = s >>> 0, si().subarray(s / 4, s / 4 + t);
  }
  let St = null;
  function ur() {
    return (St === null || St.byteLength === 0) && (St = new Float32Array(i.memory.buffer)), St;
  }
  function We(s, t) {
    return s = s >>> 0, ur().subarray(s / 4, s / 4 + t);
  }
  let vt = null;
  function gr() {
    return (vt === null || vt.byteLength === 0) && (vt = new Uint32Array(i.memory.buffer)), vt;
  }
  function _i(s, t) {
    return s = s >>> 0, gr().subarray(s / 4, s / 4 + t);
  }
  let N = 0;
  function _t(s, t) {
    const e = t(s.length * 4, 4) >>> 0;
    return gr().set(s, e / 4), N = s.length, e;
  }
  function Z(s, t) {
    const e = t(s.length * 4, 4) >>> 0;
    return ur().set(s, e / 4), N = s.length, e;
  }
  const Pt = Object.freeze({
    LinX: 0,
    0: "LinX",
    LinY: 1,
    1: "LinY",
    LinZ: 2,
    2: "LinZ",
    AngX: 3,
    3: "AngX",
    AngY: 4,
    4: "AngY",
    AngZ: 5,
    5: "AngZ"
  }), V = Object.freeze({
    Revolute: 0,
    0: "Revolute",
    Fixed: 1,
    1: "Fixed",
    Prismatic: 2,
    2: "Prismatic",
    Rope: 3,
    3: "Rope",
    Spring: 4,
    4: "Spring",
    Spherical: 5,
    5: "Spherical",
    Generic: 6,
    6: "Generic"
  }), k = Object.freeze({
    Ball: 0,
    0: "Ball",
    Cuboid: 1,
    1: "Cuboid",
    Capsule: 2,
    2: "Capsule",
    Segment: 3,
    3: "Segment",
    Polyline: 4,
    4: "Polyline",
    Triangle: 5,
    5: "Triangle",
    TriMesh: 6,
    6: "TriMesh",
    HeightField: 7,
    7: "HeightField",
    Compound: 8,
    8: "Compound",
    ConvexPolyhedron: 9,
    9: "ConvexPolyhedron",
    Cylinder: 10,
    10: "Cylinder",
    Cone: 11,
    11: "Cone",
    RoundCuboid: 12,
    12: "RoundCuboid",
    RoundTriangle: 13,
    13: "RoundTriangle",
    RoundCylinder: 14,
    14: "RoundCylinder",
    RoundCone: 15,
    15: "RoundCone",
    RoundConvexPolyhedron: 16,
    16: "RoundConvexPolyhedron",
    HalfSpace: 17,
    17: "HalfSpace",
    Voxels: 18,
    18: "Voxels"
  }), Xt = typeof FinalizationRegistry > "u" ? {
    register: () => {
    },
    unregister: () => {
    }
  } : new FinalizationRegistry((s) => i.__wbg_rawbroadphase_free(s >>> 0, 1));
  class rt {
    static __wrap(t) {
      t = t >>> 0;
      const e = Object.create(rt.prototype);
      return e.__wbg_ptr = t, Xt.register(e, e.__wbg_ptr, e), e;
    }
    __destroy_into_raw() {
      const t = this.__wbg_ptr;
      return this.__wbg_ptr = 0, Xt.unregister(this), t;
    }
    free() {
      const t = this.__destroy_into_raw();
      i.__wbg_rawbroadphase_free(t, 0);
    }
    constructor() {
      const t = i.rawbroadphase_new();
      return this.__wbg_ptr = t >>> 0, Xt.register(this, this.__wbg_ptr, this), this;
    }
  }
  const qe = typeof FinalizationRegistry > "u" ? {
    register: () => {
    },
    unregister: () => {
    }
  } : new FinalizationRegistry((s) => i.__wbg_rawccdsolver_free(s >>> 0, 1));
  class ie {
    __destroy_into_raw() {
      const t = this.__wbg_ptr;
      return this.__wbg_ptr = 0, qe.unregister(this), t;
    }
    free() {
      const t = this.__destroy_into_raw();
      i.__wbg_rawccdsolver_free(t, 0);
    }
    constructor() {
      const t = i.rawccdsolver_new();
      return this.__wbg_ptr = t >>> 0, qe.register(this, this.__wbg_ptr, this), this;
    }
  }
  const Be = typeof FinalizationRegistry > "u" ? {
    register: () => {
    },
    unregister: () => {
    }
  } : new FinalizationRegistry((s) => i.__wbg_rawcharactercollision_free(s >>> 0, 1));
  class br {
    __destroy_into_raw() {
      const t = this.__wbg_ptr;
      return this.__wbg_ptr = 0, Be.unregister(this), t;
    }
    free() {
      const t = this.__destroy_into_raw();
      i.__wbg_rawcharactercollision_free(t, 0);
    }
    constructor() {
      const t = i.rawcharactercollision_new();
      return this.__wbg_ptr = t >>> 0, Be.register(this, this.__wbg_ptr, this), this;
    }
    handle() {
      return i.rawcharactercollision_handle(this.__wbg_ptr);
    }
    translationDeltaApplied() {
      const t = i.rawcharactercollision_translationDeltaApplied(this.__wbg_ptr);
      return l.__wrap(t);
    }
    translationDeltaRemaining() {
      const t = i.rawcharactercollision_translationDeltaRemaining(this.__wbg_ptr);
      return l.__wrap(t);
    }
    toi() {
      return i.rawcharactercollision_toi(this.__wbg_ptr);
    }
    worldWitness1() {
      const t = i.rawcharactercollision_worldWitness1(this.__wbg_ptr);
      return l.__wrap(t);
    }
    worldWitness2() {
      const t = i.rawcharactercollision_worldWitness2(this.__wbg_ptr);
      return l.__wrap(t);
    }
    worldNormal1() {
      const t = i.rawcharactercollision_worldNormal1(this.__wbg_ptr);
      return l.__wrap(t);
    }
    worldNormal2() {
      const t = i.rawcharactercollision_worldNormal2(this.__wbg_ptr);
      return l.__wrap(t);
    }
  }
  const Jt = typeof FinalizationRegistry > "u" ? {
    register: () => {
    },
    unregister: () => {
    }
  } : new FinalizationRegistry((s) => i.__wbg_rawcolliderset_free(s >>> 0, 1));
  class E {
    static __wrap(t) {
      t = t >>> 0;
      const e = Object.create(E.prototype);
      return e.__wbg_ptr = t, Jt.register(e, e.__wbg_ptr, e), e;
    }
    __destroy_into_raw() {
      const t = this.__wbg_ptr;
      return this.__wbg_ptr = 0, Jt.unregister(this), t;
    }
    free() {
      const t = this.__destroy_into_raw();
      i.__wbg_rawcolliderset_free(t, 0);
    }
    coTranslation(t) {
      const e = i.rawcolliderset_coTranslation(this.__wbg_ptr, t);
      return l.__wrap(e);
    }
    coRotation(t) {
      const e = i.rawcolliderset_coRotation(this.__wbg_ptr, t);
      return v.__wrap(e);
    }
    coSetTranslation(t, e, r, a) {
      i.rawcolliderset_coSetTranslation(this.__wbg_ptr, t, e, r, a);
    }
    coSetTranslationWrtParent(t, e, r, a) {
      i.rawcolliderset_coSetTranslationWrtParent(this.__wbg_ptr, t, e, r, a);
    }
    coSetRotation(t, e, r, a, o) {
      i.rawcolliderset_coSetRotation(this.__wbg_ptr, t, e, r, a, o);
    }
    coSetRotationWrtParent(t, e, r, a, o) {
      i.rawcolliderset_coSetRotationWrtParent(this.__wbg_ptr, t, e, r, a, o);
    }
    coIsSensor(t) {
      return i.rawcolliderset_coIsSensor(this.__wbg_ptr, t) !== 0;
    }
    coShapeType(t) {
      return i.rawcolliderset_coShapeType(this.__wbg_ptr, t);
    }
    coHalfspaceNormal(t) {
      const e = i.rawcolliderset_coHalfspaceNormal(this.__wbg_ptr, t);
      return e === 0 ? void 0 : l.__wrap(e);
    }
    coHalfExtents(t) {
      const e = i.rawcolliderset_coHalfExtents(this.__wbg_ptr, t);
      return e === 0 ? void 0 : l.__wrap(e);
    }
    coSetHalfExtents(t, e) {
      c(e, l), i.rawcolliderset_coSetHalfExtents(this.__wbg_ptr, t, e.__wbg_ptr);
    }
    coRadius(t) {
      const e = i.rawcolliderset_coRadius(this.__wbg_ptr, t);
      return e === 4294967297 ? void 0 : e;
    }
    coSetRadius(t, e) {
      i.rawcolliderset_coSetRadius(this.__wbg_ptr, t, e);
    }
    coHalfHeight(t) {
      const e = i.rawcolliderset_coHalfHeight(this.__wbg_ptr, t);
      return e === 4294967297 ? void 0 : e;
    }
    coSetHalfHeight(t, e) {
      i.rawcolliderset_coSetHalfHeight(this.__wbg_ptr, t, e);
    }
    coRoundRadius(t) {
      const e = i.rawcolliderset_coRoundRadius(this.__wbg_ptr, t);
      return e === 4294967297 ? void 0 : e;
    }
    coSetRoundRadius(t, e) {
      i.rawcolliderset_coSetRoundRadius(this.__wbg_ptr, t, e);
    }
    coVoxelData(t) {
      try {
        const a = i.__wbindgen_add_to_stack_pointer(-16);
        i.rawcolliderset_coVoxelData(a, this.__wbg_ptr, t);
        var e = z().getInt32(a + 0, true), r = z().getInt32(a + 4, true);
        let o;
        return e !== 0 && (o = oi(e, r).slice(), i.__wbindgen_export_1(e, r * 4, 4)), o;
      } finally {
        i.__wbindgen_add_to_stack_pointer(16);
      }
    }
    coVoxelSize(t) {
      const e = i.rawcolliderset_coVoxelSize(this.__wbg_ptr, t);
      return e === 0 ? void 0 : l.__wrap(e);
    }
    coSetVoxel(t, e, r, a, o) {
      i.rawcolliderset_coSetVoxel(this.__wbg_ptr, t, e, r, a, o);
    }
    coPropagateVoxelChange(t, e, r, a, o, _, d, h) {
      i.rawcolliderset_coPropagateVoxelChange(this.__wbg_ptr, t, e, r, a, o, _, d, h);
    }
    coCombineVoxelStates(t, e, r, a, o) {
      i.rawcolliderset_coCombineVoxelStates(this.__wbg_ptr, t, e, r, a, o);
    }
    coVertices(t) {
      try {
        const a = i.__wbindgen_add_to_stack_pointer(-16);
        i.rawcolliderset_coVertices(a, this.__wbg_ptr, t);
        var e = z().getInt32(a + 0, true), r = z().getInt32(a + 4, true);
        let o;
        return e !== 0 && (o = We(e, r).slice(), i.__wbindgen_export_1(e, r * 4, 4)), o;
      } finally {
        i.__wbindgen_add_to_stack_pointer(16);
      }
    }
    coIndices(t) {
      try {
        const a = i.__wbindgen_add_to_stack_pointer(-16);
        i.rawcolliderset_coIndices(a, this.__wbg_ptr, t);
        var e = z().getInt32(a + 0, true), r = z().getInt32(a + 4, true);
        let o;
        return e !== 0 && (o = _i(e, r).slice(), i.__wbindgen_export_1(e, r * 4, 4)), o;
      } finally {
        i.__wbindgen_add_to_stack_pointer(16);
      }
    }
    coTriMeshFlags(t) {
      const e = i.rawcolliderset_coTriMeshFlags(this.__wbg_ptr, t);
      return e === 4294967297 ? void 0 : e;
    }
    coHeightFieldFlags(t) {
      const e = i.rawcolliderset_coHeightFieldFlags(this.__wbg_ptr, t);
      return e === 4294967297 ? void 0 : e;
    }
    coHeightfieldHeights(t) {
      try {
        const a = i.__wbindgen_add_to_stack_pointer(-16);
        i.rawcolliderset_coHeightfieldHeights(a, this.__wbg_ptr, t);
        var e = z().getInt32(a + 0, true), r = z().getInt32(a + 4, true);
        let o;
        return e !== 0 && (o = We(e, r).slice(), i.__wbindgen_export_1(e, r * 4, 4)), o;
      } finally {
        i.__wbindgen_add_to_stack_pointer(16);
      }
    }
    coHeightfieldScale(t) {
      const e = i.rawcolliderset_coHeightfieldScale(this.__wbg_ptr, t);
      return e === 0 ? void 0 : l.__wrap(e);
    }
    coHeightfieldNRows(t) {
      const e = i.rawcolliderset_coHeightfieldNRows(this.__wbg_ptr, t);
      return e === 4294967297 ? void 0 : e;
    }
    coHeightfieldNCols(t) {
      const e = i.rawcolliderset_coHeightfieldNCols(this.__wbg_ptr, t);
      return e === 4294967297 ? void 0 : e;
    }
    coParent(t) {
      try {
        const a = i.__wbindgen_add_to_stack_pointer(-16);
        i.rawcolliderset_coParent(a, this.__wbg_ptr, t);
        var e = z().getInt32(a + 0, true), r = z().getFloat64(a + 8, true);
        return e === 0 ? void 0 : r;
      } finally {
        i.__wbindgen_add_to_stack_pointer(16);
      }
    }
    coSetEnabled(t, e) {
      i.rawcolliderset_coSetEnabled(this.__wbg_ptr, t, e);
    }
    coIsEnabled(t) {
      return i.rawcolliderset_coIsEnabled(this.__wbg_ptr, t) !== 0;
    }
    coSetContactSkin(t, e) {
      i.rawcolliderset_coSetContactSkin(this.__wbg_ptr, t, e);
    }
    coContactSkin(t) {
      return i.rawcolliderset_coContactSkin(this.__wbg_ptr, t);
    }
    coFriction(t) {
      return i.rawcolliderset_coFriction(this.__wbg_ptr, t);
    }
    coRestitution(t) {
      return i.rawcolliderset_coRestitution(this.__wbg_ptr, t);
    }
    coDensity(t) {
      return i.rawcolliderset_coDensity(this.__wbg_ptr, t);
    }
    coMass(t) {
      return i.rawcolliderset_coMass(this.__wbg_ptr, t);
    }
    coVolume(t) {
      return i.rawcolliderset_coVolume(this.__wbg_ptr, t);
    }
    coCollisionGroups(t) {
      return i.rawcolliderset_coCollisionGroups(this.__wbg_ptr, t) >>> 0;
    }
    coSolverGroups(t) {
      return i.rawcolliderset_coSolverGroups(this.__wbg_ptr, t) >>> 0;
    }
    coActiveHooks(t) {
      return i.rawcolliderset_coActiveHooks(this.__wbg_ptr, t) >>> 0;
    }
    coActiveCollisionTypes(t) {
      return i.rawcolliderset_coActiveCollisionTypes(this.__wbg_ptr, t);
    }
    coActiveEvents(t) {
      return i.rawcolliderset_coActiveEvents(this.__wbg_ptr, t) >>> 0;
    }
    coContactForceEventThreshold(t) {
      return i.rawcolliderset_coContactForceEventThreshold(this.__wbg_ptr, t);
    }
    coContainsPoint(t, e) {
      return c(e, l), i.rawcolliderset_coContainsPoint(this.__wbg_ptr, t, e.__wbg_ptr) !== 0;
    }
    coCastShape(t, e, r, a, o, _, d, h, p) {
      c(e, l), c(r, m), c(a, l), c(o, v), c(_, l);
      const u = i.rawcolliderset_coCastShape(this.__wbg_ptr, t, e.__wbg_ptr, r.__wbg_ptr, a.__wbg_ptr, o.__wbg_ptr, _.__wbg_ptr, d, h, p);
      return u === 0 ? void 0 : kt.__wrap(u);
    }
    coCastCollider(t, e, r, a, o, _, d) {
      c(e, l), c(a, l);
      const h = i.rawcolliderset_coCastCollider(this.__wbg_ptr, t, e.__wbg_ptr, r, a.__wbg_ptr, o, _, d);
      return h === 0 ? void 0 : Ft.__wrap(h);
    }
    coIntersectsShape(t, e, r, a) {
      return c(e, m), c(r, l), c(a, v), i.rawcolliderset_coIntersectsShape(this.__wbg_ptr, t, e.__wbg_ptr, r.__wbg_ptr, a.__wbg_ptr) !== 0;
    }
    coContactShape(t, e, r, a, o) {
      c(e, m), c(r, l), c(a, v);
      const _ = i.rawcolliderset_coContactShape(this.__wbg_ptr, t, e.__wbg_ptr, r.__wbg_ptr, a.__wbg_ptr, o);
      return _ === 0 ? void 0 : wt.__wrap(_);
    }
    coContactCollider(t, e, r) {
      const a = i.rawcolliderset_coContactCollider(this.__wbg_ptr, t, e, r);
      return a === 0 ? void 0 : wt.__wrap(a);
    }
    coProjectPoint(t, e, r) {
      c(e, l);
      const a = i.rawcolliderset_coProjectPoint(this.__wbg_ptr, t, e.__wbg_ptr, r);
      return zt.__wrap(a);
    }
    coIntersectsRay(t, e, r, a) {
      return c(e, l), c(r, l), i.rawcolliderset_coIntersectsRay(this.__wbg_ptr, t, e.__wbg_ptr, r.__wbg_ptr, a) !== 0;
    }
    coCastRay(t, e, r, a, o) {
      return c(e, l), c(r, l), i.rawcolliderset_coCastRay(this.__wbg_ptr, t, e.__wbg_ptr, r.__wbg_ptr, a, o);
    }
    coCastRayAndGetNormal(t, e, r, a, o) {
      c(e, l), c(r, l);
      const _ = i.rawcolliderset_coCastRayAndGetNormal(this.__wbg_ptr, t, e.__wbg_ptr, r.__wbg_ptr, a, o);
      return _ === 0 ? void 0 : Mt.__wrap(_);
    }
    coSetSensor(t, e) {
      i.rawcolliderset_coSetSensor(this.__wbg_ptr, t, e);
    }
    coSetRestitution(t, e) {
      i.rawcolliderset_coSetRestitution(this.__wbg_ptr, t, e);
    }
    coSetFriction(t, e) {
      i.rawcolliderset_coSetFriction(this.__wbg_ptr, t, e);
    }
    coFrictionCombineRule(t) {
      return i.rawcolliderset_coFrictionCombineRule(this.__wbg_ptr, t) >>> 0;
    }
    coSetFrictionCombineRule(t, e) {
      i.rawcolliderset_coSetFrictionCombineRule(this.__wbg_ptr, t, e);
    }
    coRestitutionCombineRule(t) {
      return i.rawcolliderset_coRestitutionCombineRule(this.__wbg_ptr, t) >>> 0;
    }
    coSetRestitutionCombineRule(t, e) {
      i.rawcolliderset_coSetRestitutionCombineRule(this.__wbg_ptr, t, e);
    }
    coSetCollisionGroups(t, e) {
      i.rawcolliderset_coSetCollisionGroups(this.__wbg_ptr, t, e);
    }
    coSetSolverGroups(t, e) {
      i.rawcolliderset_coSetSolverGroups(this.__wbg_ptr, t, e);
    }
    coSetActiveHooks(t, e) {
      i.rawcolliderset_coSetActiveHooks(this.__wbg_ptr, t, e);
    }
    coSetActiveEvents(t, e) {
      i.rawcolliderset_coSetActiveEvents(this.__wbg_ptr, t, e);
    }
    coSetActiveCollisionTypes(t, e) {
      i.rawcolliderset_coSetActiveCollisionTypes(this.__wbg_ptr, t, e);
    }
    coSetShape(t, e) {
      c(e, m), i.rawcolliderset_coSetShape(this.__wbg_ptr, t, e.__wbg_ptr);
    }
    coSetContactForceEventThreshold(t, e) {
      i.rawcolliderset_coSetContactForceEventThreshold(this.__wbg_ptr, t, e);
    }
    coSetDensity(t, e) {
      i.rawcolliderset_coSetDensity(this.__wbg_ptr, t, e);
    }
    coSetMass(t, e) {
      i.rawcolliderset_coSetMass(this.__wbg_ptr, t, e);
    }
    coSetMassProperties(t, e, r, a, o) {
      c(r, l), c(a, l), c(o, v), i.rawcolliderset_coSetMassProperties(this.__wbg_ptr, t, e, r.__wbg_ptr, a.__wbg_ptr, o.__wbg_ptr);
    }
    constructor() {
      const t = i.rawcolliderset_new();
      return this.__wbg_ptr = t >>> 0, Jt.register(this, this.__wbg_ptr, this), this;
    }
    len() {
      return i.rawcolliderset_len(this.__wbg_ptr) >>> 0;
    }
    contains(t) {
      return i.rawcolliderset_contains(this.__wbg_ptr, t) !== 0;
    }
    createCollider(t, e, r, a, o, _, d, h, p, u, g, b, y, I, L, G, W, q, tt, Nt, Gt, Wt, qt, Bt, mt) {
      try {
        const Ot = i.__wbindgen_add_to_stack_pointer(-16);
        c(e, m), c(r, l), c(a, v), c(d, l), c(h, l), c(p, v), c(mt, j), i.rawcolliderset_createCollider(Ot, this.__wbg_ptr, t, e.__wbg_ptr, r.__wbg_ptr, a.__wbg_ptr, o, _, d.__wbg_ptr, h.__wbg_ptr, p.__wbg_ptr, u, g, b, y, I, L, G, W, q, tt, Nt, Gt, Wt, qt, Bt, mt.__wbg_ptr);
        var Vt = z().getInt32(Ot + 0, true), Ge = z().getFloat64(Ot + 8, true);
        return Vt === 0 ? void 0 : Ge;
      } finally {
        i.__wbindgen_add_to_stack_pointer(16);
      }
    }
    remove(t, e, r, a) {
      c(e, K), c(r, j), i.rawcolliderset_remove(this.__wbg_ptr, t, e.__wbg_ptr, r.__wbg_ptr, a);
    }
    isHandleValid(t) {
      return i.rawcolliderset_contains(this.__wbg_ptr, t) !== 0;
    }
    forEachColliderHandle(t) {
      try {
        i.rawcolliderset_forEachColliderHandle(this.__wbg_ptr, A(t));
      } finally {
        R[x++] = void 0;
      }
    }
  }
  const Ve = typeof FinalizationRegistry > "u" ? {
    register: () => {
    },
    unregister: () => {
    }
  } : new FinalizationRegistry((s) => i.__wbg_rawcollidershapecasthit_free(s >>> 0, 1));
  class Ft {
    static __wrap(t) {
      t = t >>> 0;
      const e = Object.create(Ft.prototype);
      return e.__wbg_ptr = t, Ve.register(e, e.__wbg_ptr, e), e;
    }
    __destroy_into_raw() {
      const t = this.__wbg_ptr;
      return this.__wbg_ptr = 0, Ve.unregister(this), t;
    }
    free() {
      const t = this.__destroy_into_raw();
      i.__wbg_rawcollidershapecasthit_free(t, 0);
    }
    colliderHandle() {
      return i.rawcharactercollision_handle(this.__wbg_ptr);
    }
    time_of_impact() {
      return i.rawcollidershapecasthit_time_of_impact(this.__wbg_ptr);
    }
    witness1() {
      const t = i.rawcollidershapecasthit_witness1(this.__wbg_ptr);
      return l.__wrap(t);
    }
    witness2() {
      const t = i.rawcollidershapecasthit_witness2(this.__wbg_ptr);
      return l.__wrap(t);
    }
    normal1() {
      const t = i.rawcharactercollision_translationDeltaApplied(this.__wbg_ptr);
      return l.__wrap(t);
    }
    normal2() {
      const t = i.rawcharactercollision_translationDeltaRemaining(this.__wbg_ptr);
      return l.__wrap(t);
    }
  }
  const Oe = typeof FinalizationRegistry > "u" ? {
    register: () => {
    },
    unregister: () => {
    }
  } : new FinalizationRegistry((s) => i.__wbg_rawcontactforceevent_free(s >>> 0, 1));
  class be {
    static __wrap(t) {
      t = t >>> 0;
      const e = Object.create(be.prototype);
      return e.__wbg_ptr = t, Oe.register(e, e.__wbg_ptr, e), e;
    }
    __destroy_into_raw() {
      const t = this.__wbg_ptr;
      return this.__wbg_ptr = 0, Oe.unregister(this), t;
    }
    free() {
      const t = this.__destroy_into_raw();
      i.__wbg_rawcontactforceevent_free(t, 0);
    }
    collider1() {
      return i.rawcharactercollision_handle(this.__wbg_ptr);
    }
    collider2() {
      return i.rawcontactforceevent_collider2(this.__wbg_ptr);
    }
    total_force() {
      const t = i.rawcontactforceevent_total_force(this.__wbg_ptr);
      return l.__wrap(t);
    }
    total_force_magnitude() {
      return i.rawcontactforceevent_total_force_magnitude(this.__wbg_ptr);
    }
    max_force_direction() {
      const t = i.rawcontactforceevent_max_force_direction(this.__wbg_ptr);
      return l.__wrap(t);
    }
    max_force_magnitude() {
      return i.rawcontactforceevent_max_force_magnitude(this.__wbg_ptr);
    }
  }
  const Ue = typeof FinalizationRegistry > "u" ? {
    register: () => {
    },
    unregister: () => {
    }
  } : new FinalizationRegistry((s) => i.__wbg_rawcontactmanifold_free(s >>> 0, 1));
  class me {
    static __wrap(t) {
      t = t >>> 0;
      const e = Object.create(me.prototype);
      return e.__wbg_ptr = t, Ue.register(e, e.__wbg_ptr, e), e;
    }
    __destroy_into_raw() {
      const t = this.__wbg_ptr;
      return this.__wbg_ptr = 0, Ue.unregister(this), t;
    }
    free() {
      const t = this.__destroy_into_raw();
      i.__wbg_rawcontactmanifold_free(t, 0);
    }
    normal() {
      const t = i.rawcontactmanifold_normal(this.__wbg_ptr);
      return l.__wrap(t);
    }
    local_n1() {
      const t = i.rawcontactmanifold_local_n1(this.__wbg_ptr);
      return l.__wrap(t);
    }
    local_n2() {
      const t = i.rawcontactmanifold_local_n2(this.__wbg_ptr);
      return l.__wrap(t);
    }
    subshape1() {
      return i.rawcontactmanifold_subshape1(this.__wbg_ptr) >>> 0;
    }
    subshape2() {
      return i.rawcontactmanifold_subshape2(this.__wbg_ptr) >>> 0;
    }
    num_contacts() {
      return i.rawcontactmanifold_num_contacts(this.__wbg_ptr) >>> 0;
    }
    contact_local_p1(t) {
      const e = i.rawcontactmanifold_contact_local_p1(this.__wbg_ptr, t);
      return e === 0 ? void 0 : l.__wrap(e);
    }
    contact_local_p2(t) {
      const e = i.rawcontactmanifold_contact_local_p2(this.__wbg_ptr, t);
      return e === 0 ? void 0 : l.__wrap(e);
    }
    contact_dist(t) {
      return i.rawcontactmanifold_contact_dist(this.__wbg_ptr, t);
    }
    contact_fid1(t) {
      return i.rawcontactmanifold_contact_fid1(this.__wbg_ptr, t) >>> 0;
    }
    contact_fid2(t) {
      return i.rawcontactmanifold_contact_fid2(this.__wbg_ptr, t) >>> 0;
    }
    contact_impulse(t) {
      return i.rawcontactmanifold_contact_impulse(this.__wbg_ptr, t);
    }
    contact_tangent_impulse_x(t) {
      return i.rawcontactmanifold_contact_tangent_impulse_x(this.__wbg_ptr, t);
    }
    contact_tangent_impulse_y(t) {
      return i.rawcontactmanifold_contact_tangent_impulse_y(this.__wbg_ptr, t);
    }
    num_solver_contacts() {
      return i.rawcontactmanifold_num_solver_contacts(this.__wbg_ptr) >>> 0;
    }
    solver_contact_point(t) {
      const e = i.rawcontactmanifold_solver_contact_point(this.__wbg_ptr, t);
      return e === 0 ? void 0 : l.__wrap(e);
    }
    solver_contact_dist(t) {
      return i.rawcontactmanifold_solver_contact_dist(this.__wbg_ptr, t);
    }
    solver_contact_friction(t) {
      return i.rawcontactmanifold_solver_contact_friction(this.__wbg_ptr, t);
    }
    solver_contact_restitution(t) {
      return i.rawcontactmanifold_solver_contact_restitution(this.__wbg_ptr, t);
    }
    solver_contact_tangent_velocity(t) {
      const e = i.rawcontactmanifold_solver_contact_tangent_velocity(this.__wbg_ptr, t);
      return l.__wrap(e);
    }
  }
  const Xe = typeof FinalizationRegistry > "u" ? {
    register: () => {
    },
    unregister: () => {
    }
  } : new FinalizationRegistry((s) => i.__wbg_rawcontactpair_free(s >>> 0, 1));
  class fe {
    static __wrap(t) {
      t = t >>> 0;
      const e = Object.create(fe.prototype);
      return e.__wbg_ptr = t, Xe.register(e, e.__wbg_ptr, e), e;
    }
    __destroy_into_raw() {
      const t = this.__wbg_ptr;
      return this.__wbg_ptr = 0, Xe.unregister(this), t;
    }
    free() {
      const t = this.__destroy_into_raw();
      i.__wbg_rawcontactpair_free(t, 0);
    }
    collider1() {
      return i.rawcontactpair_collider1(this.__wbg_ptr);
    }
    collider2() {
      return i.rawcontactpair_collider2(this.__wbg_ptr);
    }
    numContactManifolds() {
      return i.rawcontactpair_numContactManifolds(this.__wbg_ptr) >>> 0;
    }
    contactManifold(t) {
      const e = i.rawcontactpair_contactManifold(this.__wbg_ptr, t);
      return e === 0 ? void 0 : me.__wrap(e);
    }
  }
  const Je = typeof FinalizationRegistry > "u" ? {
    register: () => {
    },
    unregister: () => {
    }
  } : new FinalizationRegistry((s) => i.__wbg_rawdebugrenderpipeline_free(s >>> 0, 1));
  class ci {
    __destroy_into_raw() {
      const t = this.__wbg_ptr;
      return this.__wbg_ptr = 0, Je.unregister(this), t;
    }
    free() {
      const t = this.__destroy_into_raw();
      i.__wbg_rawdebugrenderpipeline_free(t, 0);
    }
    constructor() {
      const t = i.rawdebugrenderpipeline_new();
      return this.__wbg_ptr = t >>> 0, Je.register(this, this.__wbg_ptr, this), this;
    }
    vertices() {
      const t = i.rawdebugrenderpipeline_vertices(this.__wbg_ptr);
      return lt(t);
    }
    colors() {
      const t = i.rawdebugrenderpipeline_colors(this.__wbg_ptr);
      return lt(t);
    }
    render(t, e, r, a, o, _, d) {
      try {
        c(t, j), c(e, E), c(r, J), c(a, Y), c(o, $), i.rawdebugrenderpipeline_render(this.__wbg_ptr, t.__wbg_ptr, e.__wbg_ptr, r.__wbg_ptr, a.__wbg_ptr, o.__wbg_ptr, _, A(d));
      } finally {
        R[x++] = void 0;
      }
    }
  }
  const Ke = typeof FinalizationRegistry > "u" ? {
    register: () => {
    },
    unregister: () => {
    }
  } : new FinalizationRegistry((s) => i.__wbg_rawdeserializedworld_free(s >>> 0, 1));
  class ye {
    static __wrap(t) {
      t = t >>> 0;
      const e = Object.create(ye.prototype);
      return e.__wbg_ptr = t, Ke.register(e, e.__wbg_ptr, e), e;
    }
    __destroy_into_raw() {
      const t = this.__wbg_ptr;
      return this.__wbg_ptr = 0, Ke.unregister(this), t;
    }
    free() {
      const t = this.__destroy_into_raw();
      i.__wbg_rawdeserializedworld_free(t, 0);
    }
    takeGravity() {
      const t = i.rawdeserializedworld_takeGravity(this.__wbg_ptr);
      return t === 0 ? void 0 : l.__wrap(t);
    }
    takeIntegrationParameters() {
      const t = i.rawdeserializedworld_takeIntegrationParameters(this.__wbg_ptr);
      return t === 0 ? void 0 : it.__wrap(t);
    }
    takeIslandManager() {
      const t = i.rawdeserializedworld_takeIslandManager(this.__wbg_ptr);
      return t === 0 ? void 0 : K.__wrap(t);
    }
    takeBroadPhase() {
      const t = i.rawdeserializedworld_takeBroadPhase(this.__wbg_ptr);
      return t === 0 ? void 0 : rt.__wrap(t);
    }
    takeNarrowPhase() {
      const t = i.rawdeserializedworld_takeNarrowPhase(this.__wbg_ptr);
      return t === 0 ? void 0 : $.__wrap(t);
    }
    takeBodies() {
      const t = i.rawdeserializedworld_takeBodies(this.__wbg_ptr);
      return t === 0 ? void 0 : j.__wrap(t);
    }
    takeColliders() {
      const t = i.rawdeserializedworld_takeColliders(this.__wbg_ptr);
      return t === 0 ? void 0 : E.__wrap(t);
    }
    takeImpulseJoints() {
      const t = i.rawdeserializedworld_takeImpulseJoints(this.__wbg_ptr);
      return t === 0 ? void 0 : J.__wrap(t);
    }
    takeMultibodyJoints() {
      const t = i.rawdeserializedworld_takeMultibodyJoints(this.__wbg_ptr);
      return t === 0 ? void 0 : Y.__wrap(t);
    }
  }
  const Ye = typeof FinalizationRegistry > "u" ? {
    register: () => {
    },
    unregister: () => {
    }
  } : new FinalizationRegistry((s) => i.__wbg_rawdynamicraycastvehiclecontroller_free(s >>> 0, 1));
  class li {
    __destroy_into_raw() {
      const t = this.__wbg_ptr;
      return this.__wbg_ptr = 0, Ye.unregister(this), t;
    }
    free() {
      const t = this.__destroy_into_raw();
      i.__wbg_rawdynamicraycastvehiclecontroller_free(t, 0);
    }
    constructor(t) {
      const e = i.rawdynamicraycastvehiclecontroller_new(t);
      return this.__wbg_ptr = e >>> 0, Ye.register(this, this.__wbg_ptr, this), this;
    }
    current_vehicle_speed() {
      return i.rawdynamicraycastvehiclecontroller_current_vehicle_speed(this.__wbg_ptr);
    }
    chassis() {
      return i.rawdynamicraycastvehiclecontroller_chassis(this.__wbg_ptr);
    }
    index_up_axis() {
      return i.rawdynamicraycastvehiclecontroller_index_up_axis(this.__wbg_ptr) >>> 0;
    }
    set_index_up_axis(t) {
      i.rawdynamicraycastvehiclecontroller_set_index_up_axis(this.__wbg_ptr, t);
    }
    index_forward_axis() {
      return i.rawdynamicraycastvehiclecontroller_index_forward_axis(this.__wbg_ptr) >>> 0;
    }
    set_index_forward_axis(t) {
      i.rawdynamicraycastvehiclecontroller_set_index_forward_axis(this.__wbg_ptr, t);
    }
    add_wheel(t, e, r, a, o) {
      c(t, l), c(e, l), c(r, l), i.rawdynamicraycastvehiclecontroller_add_wheel(this.__wbg_ptr, t.__wbg_ptr, e.__wbg_ptr, r.__wbg_ptr, a, o);
    }
    num_wheels() {
      return i.rawdynamicraycastvehiclecontroller_num_wheels(this.__wbg_ptr) >>> 0;
    }
    update_vehicle(t, e, r, a, o, _, d) {
      try {
        c(e, j), c(r, E), c(a, Se), i.rawdynamicraycastvehiclecontroller_update_vehicle(this.__wbg_ptr, t, e.__wbg_ptr, r.__wbg_ptr, a.__wbg_ptr, o, f(_) ? 4294967297 : _ >>> 0, A(d));
      } finally {
        R[x++] = void 0;
      }
    }
    wheel_chassis_connection_point_cs(t) {
      const e = i.rawdynamicraycastvehiclecontroller_wheel_chassis_connection_point_cs(this.__wbg_ptr, t);
      return e === 0 ? void 0 : l.__wrap(e);
    }
    set_wheel_chassis_connection_point_cs(t, e) {
      c(e, l), i.rawdynamicraycastvehiclecontroller_set_wheel_chassis_connection_point_cs(this.__wbg_ptr, t, e.__wbg_ptr);
    }
    wheel_suspension_rest_length(t) {
      const e = i.rawdynamicraycastvehiclecontroller_wheel_suspension_rest_length(this.__wbg_ptr, t);
      return e === 4294967297 ? void 0 : e;
    }
    set_wheel_suspension_rest_length(t, e) {
      i.rawdynamicraycastvehiclecontroller_set_wheel_suspension_rest_length(this.__wbg_ptr, t, e);
    }
    wheel_max_suspension_travel(t) {
      const e = i.rawdynamicraycastvehiclecontroller_wheel_max_suspension_travel(this.__wbg_ptr, t);
      return e === 4294967297 ? void 0 : e;
    }
    set_wheel_max_suspension_travel(t, e) {
      i.rawdynamicraycastvehiclecontroller_set_wheel_max_suspension_travel(this.__wbg_ptr, t, e);
    }
    wheel_radius(t) {
      const e = i.rawdynamicraycastvehiclecontroller_wheel_radius(this.__wbg_ptr, t);
      return e === 4294967297 ? void 0 : e;
    }
    set_wheel_radius(t, e) {
      i.rawdynamicraycastvehiclecontroller_set_wheel_radius(this.__wbg_ptr, t, e);
    }
    wheel_suspension_stiffness(t) {
      const e = i.rawdynamicraycastvehiclecontroller_wheel_suspension_stiffness(this.__wbg_ptr, t);
      return e === 4294967297 ? void 0 : e;
    }
    set_wheel_suspension_stiffness(t, e) {
      i.rawdynamicraycastvehiclecontroller_set_wheel_suspension_stiffness(this.__wbg_ptr, t, e);
    }
    wheel_suspension_compression(t) {
      const e = i.rawdynamicraycastvehiclecontroller_wheel_suspension_compression(this.__wbg_ptr, t);
      return e === 4294967297 ? void 0 : e;
    }
    set_wheel_suspension_compression(t, e) {
      i.rawdynamicraycastvehiclecontroller_set_wheel_suspension_compression(this.__wbg_ptr, t, e);
    }
    wheel_suspension_relaxation(t) {
      const e = i.rawdynamicraycastvehiclecontroller_wheel_suspension_relaxation(this.__wbg_ptr, t);
      return e === 4294967297 ? void 0 : e;
    }
    set_wheel_suspension_relaxation(t, e) {
      i.rawdynamicraycastvehiclecontroller_set_wheel_suspension_relaxation(this.__wbg_ptr, t, e);
    }
    wheel_max_suspension_force(t) {
      const e = i.rawdynamicraycastvehiclecontroller_wheel_max_suspension_force(this.__wbg_ptr, t);
      return e === 4294967297 ? void 0 : e;
    }
    set_wheel_max_suspension_force(t, e) {
      i.rawdynamicraycastvehiclecontroller_set_wheel_max_suspension_force(this.__wbg_ptr, t, e);
    }
    wheel_brake(t) {
      const e = i.rawdynamicraycastvehiclecontroller_wheel_brake(this.__wbg_ptr, t);
      return e === 4294967297 ? void 0 : e;
    }
    set_wheel_brake(t, e) {
      i.rawdynamicraycastvehiclecontroller_set_wheel_brake(this.__wbg_ptr, t, e);
    }
    wheel_steering(t) {
      const e = i.rawdynamicraycastvehiclecontroller_wheel_steering(this.__wbg_ptr, t);
      return e === 4294967297 ? void 0 : e;
    }
    set_wheel_steering(t, e) {
      i.rawdynamicraycastvehiclecontroller_set_wheel_steering(this.__wbg_ptr, t, e);
    }
    wheel_engine_force(t) {
      const e = i.rawdynamicraycastvehiclecontroller_wheel_engine_force(this.__wbg_ptr, t);
      return e === 4294967297 ? void 0 : e;
    }
    set_wheel_engine_force(t, e) {
      i.rawdynamicraycastvehiclecontroller_set_wheel_engine_force(this.__wbg_ptr, t, e);
    }
    wheel_direction_cs(t) {
      const e = i.rawdynamicraycastvehiclecontroller_wheel_direction_cs(this.__wbg_ptr, t);
      return e === 0 ? void 0 : l.__wrap(e);
    }
    set_wheel_direction_cs(t, e) {
      c(e, l), i.rawdynamicraycastvehiclecontroller_set_wheel_direction_cs(this.__wbg_ptr, t, e.__wbg_ptr);
    }
    wheel_axle_cs(t) {
      const e = i.rawdynamicraycastvehiclecontroller_wheel_axle_cs(this.__wbg_ptr, t);
      return e === 0 ? void 0 : l.__wrap(e);
    }
    set_wheel_axle_cs(t, e) {
      c(e, l), i.rawdynamicraycastvehiclecontroller_set_wheel_axle_cs(this.__wbg_ptr, t, e.__wbg_ptr);
    }
    wheel_friction_slip(t) {
      const e = i.rawdynamicraycastvehiclecontroller_wheel_friction_slip(this.__wbg_ptr, t);
      return e === 4294967297 ? void 0 : e;
    }
    set_wheel_friction_slip(t, e) {
      i.rawdynamicraycastvehiclecontroller_set_wheel_friction_slip(this.__wbg_ptr, t, e);
    }
    wheel_side_friction_stiffness(t) {
      const e = i.rawdynamicraycastvehiclecontroller_wheel_side_friction_stiffness(this.__wbg_ptr, t);
      return e === 4294967297 ? void 0 : e;
    }
    set_wheel_side_friction_stiffness(t, e) {
      i.rawdynamicraycastvehiclecontroller_set_wheel_side_friction_stiffness(this.__wbg_ptr, t, e);
    }
    wheel_rotation(t) {
      const e = i.rawdynamicraycastvehiclecontroller_wheel_rotation(this.__wbg_ptr, t);
      return e === 4294967297 ? void 0 : e;
    }
    wheel_forward_impulse(t) {
      const e = i.rawdynamicraycastvehiclecontroller_wheel_forward_impulse(this.__wbg_ptr, t);
      return e === 4294967297 ? void 0 : e;
    }
    wheel_side_impulse(t) {
      const e = i.rawdynamicraycastvehiclecontroller_wheel_side_impulse(this.__wbg_ptr, t);
      return e === 4294967297 ? void 0 : e;
    }
    wheel_suspension_force(t) {
      const e = i.rawdynamicraycastvehiclecontroller_wheel_suspension_force(this.__wbg_ptr, t);
      return e === 4294967297 ? void 0 : e;
    }
    wheel_contact_normal_ws(t) {
      const e = i.rawdynamicraycastvehiclecontroller_wheel_contact_normal_ws(this.__wbg_ptr, t);
      return e === 0 ? void 0 : l.__wrap(e);
    }
    wheel_contact_point_ws(t) {
      const e = i.rawdynamicraycastvehiclecontroller_wheel_contact_point_ws(this.__wbg_ptr, t);
      return e === 0 ? void 0 : l.__wrap(e);
    }
    wheel_suspension_length(t) {
      const e = i.rawdynamicraycastvehiclecontroller_wheel_suspension_length(this.__wbg_ptr, t);
      return e === 4294967297 ? void 0 : e;
    }
    wheel_hard_point_ws(t) {
      const e = i.rawdynamicraycastvehiclecontroller_wheel_hard_point_ws(this.__wbg_ptr, t);
      return e === 0 ? void 0 : l.__wrap(e);
    }
    wheel_is_in_contact(t) {
      return i.rawdynamicraycastvehiclecontroller_wheel_is_in_contact(this.__wbg_ptr, t) !== 0;
    }
    wheel_ground_object(t) {
      try {
        const a = i.__wbindgen_add_to_stack_pointer(-16);
        i.rawdynamicraycastvehiclecontroller_wheel_ground_object(a, this.__wbg_ptr, t);
        var e = z().getInt32(a + 0, true), r = z().getFloat64(a + 8, true);
        return e === 0 ? void 0 : r;
      } finally {
        i.__wbindgen_add_to_stack_pointer(16);
      }
    }
  }
  const Ze = typeof FinalizationRegistry > "u" ? {
    register: () => {
    },
    unregister: () => {
    }
  } : new FinalizationRegistry((s) => i.__wbg_raweventqueue_free(s >>> 0, 1));
  class mr {
    __destroy_into_raw() {
      const t = this.__wbg_ptr;
      return this.__wbg_ptr = 0, Ze.unregister(this), t;
    }
    free() {
      const t = this.__destroy_into_raw();
      i.__wbg_raweventqueue_free(t, 0);
    }
    constructor(t) {
      const e = i.raweventqueue_new(t);
      return this.__wbg_ptr = e >>> 0, Ze.register(this, this.__wbg_ptr, this), this;
    }
    drainCollisionEvents(t) {
      try {
        i.raweventqueue_drainCollisionEvents(this.__wbg_ptr, A(t));
      } finally {
        R[x++] = void 0;
      }
    }
    drainContactForceEvents(t) {
      try {
        i.raweventqueue_drainContactForceEvents(this.__wbg_ptr, A(t));
      } finally {
        R[x++] = void 0;
      }
    }
    clear() {
      i.raweventqueue_clear(this.__wbg_ptr);
    }
  }
  const $e = typeof FinalizationRegistry > "u" ? {
    register: () => {
    },
    unregister: () => {
    }
  } : new FinalizationRegistry((s) => i.__wbg_rawgenericjoint_free(s >>> 0, 1));
  class H {
    static __wrap(t) {
      t = t >>> 0;
      const e = Object.create(H.prototype);
      return e.__wbg_ptr = t, $e.register(e, e.__wbg_ptr, e), e;
    }
    __destroy_into_raw() {
      const t = this.__wbg_ptr;
      return this.__wbg_ptr = 0, $e.unregister(this), t;
    }
    free() {
      const t = this.__destroy_into_raw();
      i.__wbg_rawgenericjoint_free(t, 0);
    }
    static generic(t, e, r, a) {
      c(t, l), c(e, l), c(r, l);
      const o = i.rawgenericjoint_generic(t.__wbg_ptr, e.__wbg_ptr, r.__wbg_ptr, a);
      return o === 0 ? void 0 : H.__wrap(o);
    }
    static spring(t, e, r, a, o) {
      c(a, l), c(o, l);
      const _ = i.rawgenericjoint_spring(t, e, r, a.__wbg_ptr, o.__wbg_ptr);
      return H.__wrap(_);
    }
    static rope(t, e, r) {
      c(e, l), c(r, l);
      const a = i.rawgenericjoint_rope(t, e.__wbg_ptr, r.__wbg_ptr);
      return H.__wrap(a);
    }
    static spherical(t, e) {
      c(t, l), c(e, l);
      const r = i.rawgenericjoint_spherical(t.__wbg_ptr, e.__wbg_ptr);
      return H.__wrap(r);
    }
    static prismatic(t, e, r, a, o, _) {
      c(t, l), c(e, l), c(r, l);
      const d = i.rawgenericjoint_prismatic(t.__wbg_ptr, e.__wbg_ptr, r.__wbg_ptr, a, o, _);
      return d === 0 ? void 0 : H.__wrap(d);
    }
    static fixed(t, e, r, a) {
      c(t, l), c(e, v), c(r, l), c(a, v);
      const o = i.rawgenericjoint_fixed(t.__wbg_ptr, e.__wbg_ptr, r.__wbg_ptr, a.__wbg_ptr);
      return H.__wrap(o);
    }
    static revolute(t, e, r) {
      c(t, l), c(e, l), c(r, l);
      const a = i.rawgenericjoint_revolute(t.__wbg_ptr, e.__wbg_ptr, r.__wbg_ptr);
      return a === 0 ? void 0 : H.__wrap(a);
    }
  }
  const Kt = typeof FinalizationRegistry > "u" ? {
    register: () => {
    },
    unregister: () => {
    }
  } : new FinalizationRegistry((s) => i.__wbg_rawimpulsejointset_free(s >>> 0, 1));
  class J {
    static __wrap(t) {
      t = t >>> 0;
      const e = Object.create(J.prototype);
      return e.__wbg_ptr = t, Kt.register(e, e.__wbg_ptr, e), e;
    }
    __destroy_into_raw() {
      const t = this.__wbg_ptr;
      return this.__wbg_ptr = 0, Kt.unregister(this), t;
    }
    free() {
      const t = this.__destroy_into_raw();
      i.__wbg_rawimpulsejointset_free(t, 0);
    }
    jointType(t) {
      return i.rawimpulsejointset_jointType(this.__wbg_ptr, t);
    }
    jointBodyHandle1(t) {
      return i.rawimpulsejointset_jointBodyHandle1(this.__wbg_ptr, t);
    }
    jointBodyHandle2(t) {
      return i.rawimpulsejointset_jointBodyHandle2(this.__wbg_ptr, t);
    }
    jointFrameX1(t) {
      const e = i.rawimpulsejointset_jointFrameX1(this.__wbg_ptr, t);
      return v.__wrap(e);
    }
    jointFrameX2(t) {
      const e = i.rawimpulsejointset_jointFrameX2(this.__wbg_ptr, t);
      return v.__wrap(e);
    }
    jointAnchor1(t) {
      const e = i.rawimpulsejointset_jointAnchor1(this.__wbg_ptr, t);
      return l.__wrap(e);
    }
    jointAnchor2(t) {
      const e = i.rawimpulsejointset_jointAnchor2(this.__wbg_ptr, t);
      return l.__wrap(e);
    }
    jointSetAnchor1(t, e) {
      c(e, l), i.rawimpulsejointset_jointSetAnchor1(this.__wbg_ptr, t, e.__wbg_ptr);
    }
    jointSetAnchor2(t, e) {
      c(e, l), i.rawimpulsejointset_jointSetAnchor2(this.__wbg_ptr, t, e.__wbg_ptr);
    }
    jointContactsEnabled(t) {
      return i.rawimpulsejointset_jointContactsEnabled(this.__wbg_ptr, t) !== 0;
    }
    jointSetContactsEnabled(t, e) {
      i.rawimpulsejointset_jointSetContactsEnabled(this.__wbg_ptr, t, e);
    }
    jointLimitsEnabled(t, e) {
      return i.rawimpulsejointset_jointLimitsEnabled(this.__wbg_ptr, t, e) !== 0;
    }
    jointLimitsMin(t, e) {
      return i.rawimpulsejointset_jointLimitsMin(this.__wbg_ptr, t, e);
    }
    jointLimitsMax(t, e) {
      return i.rawimpulsejointset_jointLimitsMax(this.__wbg_ptr, t, e);
    }
    jointSetLimits(t, e, r, a) {
      i.rawimpulsejointset_jointSetLimits(this.__wbg_ptr, t, e, r, a);
    }
    jointConfigureMotorModel(t, e, r) {
      i.rawimpulsejointset_jointConfigureMotorModel(this.__wbg_ptr, t, e, r);
    }
    jointConfigureMotorVelocity(t, e, r, a) {
      i.rawimpulsejointset_jointConfigureMotorVelocity(this.__wbg_ptr, t, e, r, a);
    }
    jointConfigureMotorPosition(t, e, r, a, o) {
      i.rawimpulsejointset_jointConfigureMotorPosition(this.__wbg_ptr, t, e, r, a, o);
    }
    jointConfigureMotor(t, e, r, a, o, _) {
      i.rawimpulsejointset_jointConfigureMotor(this.__wbg_ptr, t, e, r, a, o, _);
    }
    constructor() {
      const t = i.rawimpulsejointset_new();
      return this.__wbg_ptr = t >>> 0, Kt.register(this, this.__wbg_ptr, this), this;
    }
    createJoint(t, e, r, a) {
      return c(t, H), i.rawimpulsejointset_createJoint(this.__wbg_ptr, t.__wbg_ptr, e, r, a);
    }
    remove(t, e) {
      i.rawimpulsejointset_remove(this.__wbg_ptr, t, e);
    }
    len() {
      return i.rawimpulsejointset_len(this.__wbg_ptr) >>> 0;
    }
    contains(t) {
      return i.rawimpulsejointset_contains(this.__wbg_ptr, t) !== 0;
    }
    forEachJointHandle(t) {
      try {
        i.rawimpulsejointset_forEachJointHandle(this.__wbg_ptr, A(t));
      } finally {
        R[x++] = void 0;
      }
    }
    forEachJointAttachedToRigidBody(t, e) {
      try {
        i.rawimpulsejointset_forEachJointAttachedToRigidBody(this.__wbg_ptr, t, A(e));
      } finally {
        R[x++] = void 0;
      }
    }
  }
  const Yt = typeof FinalizationRegistry > "u" ? {
    register: () => {
    },
    unregister: () => {
    }
  } : new FinalizationRegistry((s) => i.__wbg_rawintegrationparameters_free(s >>> 0, 1));
  class it {
    static __wrap(t) {
      t = t >>> 0;
      const e = Object.create(it.prototype);
      return e.__wbg_ptr = t, Yt.register(e, e.__wbg_ptr, e), e;
    }
    __destroy_into_raw() {
      const t = this.__wbg_ptr;
      return this.__wbg_ptr = 0, Yt.unregister(this), t;
    }
    free() {
      const t = this.__destroy_into_raw();
      i.__wbg_rawintegrationparameters_free(t, 0);
    }
    constructor() {
      const t = i.rawintegrationparameters_new();
      return this.__wbg_ptr = t >>> 0, Yt.register(this, this.__wbg_ptr, this), this;
    }
    get dt() {
      return i.rawintegrationparameters_dt(this.__wbg_ptr);
    }
    get contact_erp() {
      return i.rawintegrationparameters_contact_erp(this.__wbg_ptr);
    }
    get normalizedAllowedLinearError() {
      return i.rawdynamicraycastvehiclecontroller_current_vehicle_speed(this.__wbg_ptr);
    }
    get normalizedPredictionDistance() {
      return i.rawcontactforceevent_max_force_magnitude(this.__wbg_ptr);
    }
    get numSolverIterations() {
      return i.rawintegrationparameters_numSolverIterations(this.__wbg_ptr) >>> 0;
    }
    get numAdditionalFrictionIterations() {
      return i.rawdynamicraycastvehiclecontroller_index_up_axis(this.__wbg_ptr) >>> 0;
    }
    get numInternalPgsIterations() {
      return i.rawdynamicraycastvehiclecontroller_index_forward_axis(this.__wbg_ptr) >>> 0;
    }
    get minIslandSize() {
      return i.rawintegrationparameters_minIslandSize(this.__wbg_ptr) >>> 0;
    }
    get maxCcdSubsteps() {
      return i.rawintegrationparameters_maxCcdSubsteps(this.__wbg_ptr) >>> 0;
    }
    get lengthUnit() {
      return i.rawintegrationparameters_lengthUnit(this.__wbg_ptr);
    }
    set dt(t) {
      i.rawintegrationparameters_set_dt(this.__wbg_ptr, t);
    }
    set contact_natural_frequency(t) {
      i.rawintegrationparameters_set_contact_natural_frequency(this.__wbg_ptr, t);
    }
    set normalizedAllowedLinearError(t) {
      i.rawintegrationparameters_set_normalizedAllowedLinearError(this.__wbg_ptr, t);
    }
    set normalizedPredictionDistance(t) {
      i.rawintegrationparameters_set_normalizedPredictionDistance(this.__wbg_ptr, t);
    }
    set numSolverIterations(t) {
      i.rawintegrationparameters_set_numSolverIterations(this.__wbg_ptr, t);
    }
    set numAdditionalFrictionIterations(t) {
      i.rawdynamicraycastvehiclecontroller_set_index_up_axis(this.__wbg_ptr, t);
    }
    set numInternalPgsIterations(t) {
      i.rawdynamicraycastvehiclecontroller_set_index_forward_axis(this.__wbg_ptr, t);
    }
    set minIslandSize(t) {
      i.rawintegrationparameters_set_minIslandSize(this.__wbg_ptr, t);
    }
    set maxCcdSubsteps(t) {
      i.rawintegrationparameters_set_maxCcdSubsteps(this.__wbg_ptr, t);
    }
    set lengthUnit(t) {
      i.rawintegrationparameters_set_lengthUnit(this.__wbg_ptr, t);
    }
    switchToStandardPgsSolver() {
      i.rawintegrationparameters_switchToStandardPgsSolver(this.__wbg_ptr);
    }
    switchToSmallStepsPgsSolver() {
      i.rawintegrationparameters_switchToSmallStepsPgsSolver(this.__wbg_ptr);
    }
    switchToSmallStepsPgsSolverWithoutWarmstart() {
      i.rawintegrationparameters_switchToSmallStepsPgsSolverWithoutWarmstart(this.__wbg_ptr);
    }
  }
  const Zt = typeof FinalizationRegistry > "u" ? {
    register: () => {
    },
    unregister: () => {
    }
  } : new FinalizationRegistry((s) => i.__wbg_rawislandmanager_free(s >>> 0, 1));
  class K {
    static __wrap(t) {
      t = t >>> 0;
      const e = Object.create(K.prototype);
      return e.__wbg_ptr = t, Zt.register(e, e.__wbg_ptr, e), e;
    }
    __destroy_into_raw() {
      const t = this.__wbg_ptr;
      return this.__wbg_ptr = 0, Zt.unregister(this), t;
    }
    free() {
      const t = this.__destroy_into_raw();
      i.__wbg_rawislandmanager_free(t, 0);
    }
    constructor() {
      const t = i.rawislandmanager_new();
      return this.__wbg_ptr = t >>> 0, Zt.register(this, this.__wbg_ptr, this), this;
    }
    forEachActiveRigidBodyHandle(t) {
      try {
        i.rawislandmanager_forEachActiveRigidBodyHandle(this.__wbg_ptr, A(t));
      } finally {
        R[x++] = void 0;
      }
    }
  }
  const Qe = typeof FinalizationRegistry > "u" ? {
    register: () => {
    },
    unregister: () => {
    }
  } : new FinalizationRegistry((s) => i.__wbg_rawkinematiccharactercontroller_free(s >>> 0, 1));
  class wi {
    __destroy_into_raw() {
      const t = this.__wbg_ptr;
      return this.__wbg_ptr = 0, Qe.unregister(this), t;
    }
    free() {
      const t = this.__destroy_into_raw();
      i.__wbg_rawkinematiccharactercontroller_free(t, 0);
    }
    constructor(t) {
      const e = i.rawkinematiccharactercontroller_new(t);
      return this.__wbg_ptr = e >>> 0, Qe.register(this, this.__wbg_ptr, this), this;
    }
    up() {
      const t = i.rawcharactercollision_translationDeltaApplied(this.__wbg_ptr);
      return l.__wrap(t);
    }
    setUp(t) {
      c(t, l), i.rawkinematiccharactercontroller_setUp(this.__wbg_ptr, t.__wbg_ptr);
    }
    normalNudgeFactor() {
      return i.rawkinematiccharactercontroller_normalNudgeFactor(this.__wbg_ptr);
    }
    setNormalNudgeFactor(t) {
      i.rawkinematiccharactercontroller_setNormalNudgeFactor(this.__wbg_ptr, t);
    }
    offset() {
      return i.rawintegrationparameters_dt(this.__wbg_ptr);
    }
    setOffset(t) {
      i.rawkinematiccharactercontroller_setOffset(this.__wbg_ptr, t);
    }
    slideEnabled() {
      return i.rawkinematiccharactercontroller_slideEnabled(this.__wbg_ptr) !== 0;
    }
    setSlideEnabled(t) {
      i.rawkinematiccharactercontroller_setSlideEnabled(this.__wbg_ptr, t);
    }
    autostepMaxHeight() {
      const t = i.rawkinematiccharactercontroller_autostepMaxHeight(this.__wbg_ptr);
      return t === 4294967297 ? void 0 : t;
    }
    autostepMinWidth() {
      const t = i.rawkinematiccharactercontroller_autostepMinWidth(this.__wbg_ptr);
      return t === 4294967297 ? void 0 : t;
    }
    autostepIncludesDynamicBodies() {
      const t = i.rawkinematiccharactercontroller_autostepIncludesDynamicBodies(this.__wbg_ptr);
      return t === 16777215 ? void 0 : t !== 0;
    }
    autostepEnabled() {
      return i.rawkinematiccharactercontroller_autostepEnabled(this.__wbg_ptr) !== 0;
    }
    enableAutostep(t, e, r) {
      i.rawkinematiccharactercontroller_enableAutostep(this.__wbg_ptr, t, e, r);
    }
    disableAutostep() {
      i.rawkinematiccharactercontroller_disableAutostep(this.__wbg_ptr);
    }
    maxSlopeClimbAngle() {
      return i.rawkinematiccharactercontroller_maxSlopeClimbAngle(this.__wbg_ptr);
    }
    setMaxSlopeClimbAngle(t) {
      i.rawkinematiccharactercontroller_setMaxSlopeClimbAngle(this.__wbg_ptr, t);
    }
    minSlopeSlideAngle() {
      return i.rawkinematiccharactercontroller_minSlopeSlideAngle(this.__wbg_ptr);
    }
    setMinSlopeSlideAngle(t) {
      i.rawkinematiccharactercontroller_setMinSlopeSlideAngle(this.__wbg_ptr, t);
    }
    snapToGroundDistance() {
      const t = i.rawkinematiccharactercontroller_snapToGroundDistance(this.__wbg_ptr);
      return t === 4294967297 ? void 0 : t;
    }
    enableSnapToGround(t) {
      i.rawkinematiccharactercontroller_enableSnapToGround(this.__wbg_ptr, t);
    }
    disableSnapToGround() {
      i.rawkinematiccharactercontroller_disableSnapToGround(this.__wbg_ptr);
    }
    snapToGroundEnabled() {
      return i.rawkinematiccharactercontroller_snapToGroundEnabled(this.__wbg_ptr) !== 0;
    }
    computeColliderMovement(t, e, r, a, o, _, d, h, p, u, g) {
      try {
        c(e, j), c(r, E), c(a, Se), c(_, l), i.rawkinematiccharactercontroller_computeColliderMovement(this.__wbg_ptr, t, e.__wbg_ptr, r.__wbg_ptr, a.__wbg_ptr, o, _.__wbg_ptr, d, f(h) ? 4294967297 : Math.fround(h), p, f(u) ? 4294967297 : u >>> 0, A(g));
      } finally {
        R[x++] = void 0;
      }
    }
    computedMovement() {
      const t = i.rawkinematiccharactercontroller_computedMovement(this.__wbg_ptr);
      return l.__wrap(t);
    }
    computedGrounded() {
      return i.rawkinematiccharactercontroller_computedGrounded(this.__wbg_ptr) !== 0;
    }
    numComputedCollisions() {
      return i.rawkinematiccharactercontroller_numComputedCollisions(this.__wbg_ptr) >>> 0;
    }
    computedCollision(t, e) {
      return c(e, br), i.rawkinematiccharactercontroller_computedCollision(this.__wbg_ptr, t, e.__wbg_ptr) !== 0;
    }
  }
  const $t = typeof FinalizationRegistry > "u" ? {
    register: () => {
    },
    unregister: () => {
    }
  } : new FinalizationRegistry((s) => i.__wbg_rawmultibodyjointset_free(s >>> 0, 1));
  class Y {
    static __wrap(t) {
      t = t >>> 0;
      const e = Object.create(Y.prototype);
      return e.__wbg_ptr = t, $t.register(e, e.__wbg_ptr, e), e;
    }
    __destroy_into_raw() {
      const t = this.__wbg_ptr;
      return this.__wbg_ptr = 0, $t.unregister(this), t;
    }
    free() {
      const t = this.__destroy_into_raw();
      i.__wbg_rawmultibodyjointset_free(t, 0);
    }
    jointType(t) {
      return i.rawmultibodyjointset_jointType(this.__wbg_ptr, t);
    }
    jointFrameX1(t) {
      const e = i.rawmultibodyjointset_jointFrameX1(this.__wbg_ptr, t);
      return v.__wrap(e);
    }
    jointFrameX2(t) {
      const e = i.rawmultibodyjointset_jointFrameX2(this.__wbg_ptr, t);
      return v.__wrap(e);
    }
    jointAnchor1(t) {
      const e = i.rawmultibodyjointset_jointAnchor1(this.__wbg_ptr, t);
      return l.__wrap(e);
    }
    jointAnchor2(t) {
      const e = i.rawmultibodyjointset_jointAnchor2(this.__wbg_ptr, t);
      return l.__wrap(e);
    }
    jointContactsEnabled(t) {
      return i.rawmultibodyjointset_jointContactsEnabled(this.__wbg_ptr, t) !== 0;
    }
    jointSetContactsEnabled(t, e) {
      i.rawmultibodyjointset_jointSetContactsEnabled(this.__wbg_ptr, t, e);
    }
    jointLimitsEnabled(t, e) {
      return i.rawmultibodyjointset_jointLimitsEnabled(this.__wbg_ptr, t, e) !== 0;
    }
    jointLimitsMin(t, e) {
      return i.rawmultibodyjointset_jointLimitsMin(this.__wbg_ptr, t, e);
    }
    jointLimitsMax(t, e) {
      return i.rawmultibodyjointset_jointLimitsMax(this.__wbg_ptr, t, e);
    }
    constructor() {
      const t = i.rawmultibodyjointset_new();
      return this.__wbg_ptr = t >>> 0, $t.register(this, this.__wbg_ptr, this), this;
    }
    createJoint(t, e, r, a) {
      return c(t, H), i.rawmultibodyjointset_createJoint(this.__wbg_ptr, t.__wbg_ptr, e, r, a);
    }
    remove(t, e) {
      i.rawmultibodyjointset_remove(this.__wbg_ptr, t, e);
    }
    contains(t) {
      return i.rawmultibodyjointset_contains(this.__wbg_ptr, t) !== 0;
    }
    forEachJointHandle(t) {
      try {
        i.rawmultibodyjointset_forEachJointHandle(this.__wbg_ptr, A(t));
      } finally {
        R[x++] = void 0;
      }
    }
    forEachJointAttachedToRigidBody(t, e) {
      try {
        i.rawmultibodyjointset_forEachJointAttachedToRigidBody(this.__wbg_ptr, t, A(e));
      } finally {
        R[x++] = void 0;
      }
    }
  }
  const Qt = typeof FinalizationRegistry > "u" ? {
    register: () => {
    },
    unregister: () => {
    }
  } : new FinalizationRegistry((s) => i.__wbg_rawnarrowphase_free(s >>> 0, 1));
  class $ {
    static __wrap(t) {
      t = t >>> 0;
      const e = Object.create($.prototype);
      return e.__wbg_ptr = t, Qt.register(e, e.__wbg_ptr, e), e;
    }
    __destroy_into_raw() {
      const t = this.__wbg_ptr;
      return this.__wbg_ptr = 0, Qt.unregister(this), t;
    }
    free() {
      const t = this.__destroy_into_raw();
      i.__wbg_rawnarrowphase_free(t, 0);
    }
    constructor() {
      const t = i.rawnarrowphase_new();
      return this.__wbg_ptr = t >>> 0, Qt.register(this, this.__wbg_ptr, this), this;
    }
    contact_pairs_with(t, e) {
      i.rawnarrowphase_contact_pairs_with(this.__wbg_ptr, t, T(e));
    }
    contact_pair(t, e) {
      const r = i.rawnarrowphase_contact_pair(this.__wbg_ptr, t, e);
      return r === 0 ? void 0 : fe.__wrap(r);
    }
    intersection_pairs_with(t, e) {
      i.rawnarrowphase_intersection_pairs_with(this.__wbg_ptr, t, T(e));
    }
    intersection_pair(t, e) {
      return i.rawnarrowphase_intersection_pair(this.__wbg_ptr, t, e) !== 0;
    }
  }
  const tr = typeof FinalizationRegistry > "u" ? {
    register: () => {
    },
    unregister: () => {
    }
  } : new FinalizationRegistry((s) => i.__wbg_rawphysicspipeline_free(s >>> 0, 1));
  class di {
    __destroy_into_raw() {
      const t = this.__wbg_ptr;
      return this.__wbg_ptr = 0, tr.unregister(this), t;
    }
    free() {
      const t = this.__destroy_into_raw();
      i.__wbg_rawphysicspipeline_free(t, 0);
    }
    constructor() {
      const t = i.rawphysicspipeline_new();
      return this.__wbg_ptr = t >>> 0, tr.register(this, this.__wbg_ptr, this), this;
    }
    step(t, e, r, a, o, _, d, h, p, u) {
      c(t, l), c(e, it), c(r, K), c(a, rt), c(o, $), c(_, j), c(d, E), c(h, J), c(p, Y), c(u, ie), i.rawphysicspipeline_step(this.__wbg_ptr, t.__wbg_ptr, e.__wbg_ptr, r.__wbg_ptr, a.__wbg_ptr, o.__wbg_ptr, _.__wbg_ptr, d.__wbg_ptr, h.__wbg_ptr, p.__wbg_ptr, u.__wbg_ptr);
    }
    stepWithEvents(t, e, r, a, o, _, d, h, p, u, g, b, y, I) {
      c(t, l), c(e, it), c(r, K), c(a, rt), c(o, $), c(_, j), c(d, E), c(h, J), c(p, Y), c(u, ie), c(g, mr), i.rawphysicspipeline_stepWithEvents(this.__wbg_ptr, t.__wbg_ptr, e.__wbg_ptr, r.__wbg_ptr, a.__wbg_ptr, o.__wbg_ptr, _.__wbg_ptr, d.__wbg_ptr, h.__wbg_ptr, p.__wbg_ptr, u.__wbg_ptr, g.__wbg_ptr, T(b), T(y), T(I));
    }
  }
  const er = typeof FinalizationRegistry > "u" ? {
    register: () => {
    },
    unregister: () => {
    }
  } : new FinalizationRegistry((s) => i.__wbg_rawpidcontroller_free(s >>> 0, 1));
  class hi {
    __destroy_into_raw() {
      const t = this.__wbg_ptr;
      return this.__wbg_ptr = 0, er.unregister(this), t;
    }
    free() {
      const t = this.__destroy_into_raw();
      i.__wbg_rawpidcontroller_free(t, 0);
    }
    constructor(t, e, r, a) {
      const o = i.rawpidcontroller_new(t, e, r, a);
      return this.__wbg_ptr = o >>> 0, er.register(this, this.__wbg_ptr, this), this;
    }
    set_kp(t, e) {
      i.rawpidcontroller_set_kp(this.__wbg_ptr, t, e);
    }
    set_ki(t, e) {
      i.rawpidcontroller_set_ki(this.__wbg_ptr, t, e);
    }
    set_kd(t, e) {
      i.rawpidcontroller_set_kd(this.__wbg_ptr, t, e);
    }
    set_axes_mask(t) {
      i.rawpidcontroller_set_axes_mask(this.__wbg_ptr, t);
    }
    reset_integrals() {
      i.rawpidcontroller_reset_integrals(this.__wbg_ptr);
    }
    apply_linear_correction(t, e, r, a, o) {
      c(e, j), c(a, l), c(o, l), i.rawpidcontroller_apply_linear_correction(this.__wbg_ptr, t, e.__wbg_ptr, r, a.__wbg_ptr, o.__wbg_ptr);
    }
    apply_angular_correction(t, e, r, a, o) {
      c(e, j), c(a, v), c(o, l), i.rawpidcontroller_apply_angular_correction(this.__wbg_ptr, t, e.__wbg_ptr, r, a.__wbg_ptr, o.__wbg_ptr);
    }
    linear_correction(t, e, r, a, o) {
      c(e, j), c(a, l), c(o, l);
      const _ = i.rawpidcontroller_linear_correction(this.__wbg_ptr, t, e.__wbg_ptr, r, a.__wbg_ptr, o.__wbg_ptr);
      return l.__wrap(_);
    }
    angular_correction(t, e, r, a, o) {
      c(e, j), c(a, v), c(o, l);
      const _ = i.rawpidcontroller_angular_correction(this.__wbg_ptr, t, e.__wbg_ptr, r, a.__wbg_ptr, o.__wbg_ptr);
      return l.__wrap(_);
    }
  }
  const rr = typeof FinalizationRegistry > "u" ? {
    register: () => {
    },
    unregister: () => {
    }
  } : new FinalizationRegistry((s) => i.__wbg_rawpointcolliderprojection_free(s >>> 0, 1));
  class Rt {
    static __wrap(t) {
      t = t >>> 0;
      const e = Object.create(Rt.prototype);
      return e.__wbg_ptr = t, rr.register(e, e.__wbg_ptr, e), e;
    }
    __destroy_into_raw() {
      const t = this.__wbg_ptr;
      return this.__wbg_ptr = 0, rr.unregister(this), t;
    }
    free() {
      const t = this.__destroy_into_raw();
      i.__wbg_rawpointcolliderprojection_free(t, 0);
    }
    colliderHandle() {
      return i.rawpointcolliderprojection_colliderHandle(this.__wbg_ptr);
    }
    point() {
      const t = i.rawpointcolliderprojection_point(this.__wbg_ptr);
      return l.__wrap(t);
    }
    isInside() {
      return i.rawpointcolliderprojection_isInside(this.__wbg_ptr) !== 0;
    }
    featureType() {
      return i.rawpointcolliderprojection_featureType(this.__wbg_ptr);
    }
    featureId() {
      const t = i.rawpointcolliderprojection_featureId(this.__wbg_ptr);
      return t === 4294967297 ? void 0 : t;
    }
  }
  const ir = typeof FinalizationRegistry > "u" ? {
    register: () => {
    },
    unregister: () => {
    }
  } : new FinalizationRegistry((s) => i.__wbg_rawpointprojection_free(s >>> 0, 1));
  class zt {
    static __wrap(t) {
      t = t >>> 0;
      const e = Object.create(zt.prototype);
      return e.__wbg_ptr = t, ir.register(e, e.__wbg_ptr, e), e;
    }
    __destroy_into_raw() {
      const t = this.__wbg_ptr;
      return this.__wbg_ptr = 0, ir.unregister(this), t;
    }
    free() {
      const t = this.__destroy_into_raw();
      i.__wbg_rawpointprojection_free(t, 0);
    }
    point() {
      const t = i.rawpointprojection_point(this.__wbg_ptr);
      return l.__wrap(t);
    }
    isInside() {
      return i.rawpointprojection_isInside(this.__wbg_ptr) !== 0;
    }
  }
  const nr = typeof FinalizationRegistry > "u" ? {
    register: () => {
    },
    unregister: () => {
    }
  } : new FinalizationRegistry((s) => i.__wbg_rawquerypipeline_free(s >>> 0, 1));
  class Se {
    __destroy_into_raw() {
      const t = this.__wbg_ptr;
      return this.__wbg_ptr = 0, nr.unregister(this), t;
    }
    free() {
      const t = this.__destroy_into_raw();
      i.__wbg_rawquerypipeline_free(t, 0);
    }
    constructor() {
      const t = i.rawquerypipeline_new();
      return this.__wbg_ptr = t >>> 0, nr.register(this, this.__wbg_ptr, this), this;
    }
    update(t) {
      c(t, E), i.rawquerypipeline_update(this.__wbg_ptr, t.__wbg_ptr);
    }
    castRay(t, e, r, a, o, _, d, h, p, u, g) {
      try {
        c(t, j), c(e, E), c(r, l), c(a, l);
        const b = i.rawquerypipeline_castRay(this.__wbg_ptr, t.__wbg_ptr, e.__wbg_ptr, r.__wbg_ptr, a.__wbg_ptr, o, _, d, f(h) ? 4294967297 : h >>> 0, !f(p), f(p) ? 0 : p, !f(u), f(u) ? 0 : u, A(g));
        return b === 0 ? void 0 : ve.__wrap(b);
      } finally {
        R[x++] = void 0;
      }
    }
    castRayAndGetNormal(t, e, r, a, o, _, d, h, p, u, g) {
      try {
        c(t, j), c(e, E), c(r, l), c(a, l);
        const b = i.rawquerypipeline_castRayAndGetNormal(this.__wbg_ptr, t.__wbg_ptr, e.__wbg_ptr, r.__wbg_ptr, a.__wbg_ptr, o, _, d, f(h) ? 4294967297 : h >>> 0, !f(p), f(p) ? 0 : p, !f(u), f(u) ? 0 : u, A(g));
        return b === 0 ? void 0 : Tt.__wrap(b);
      } finally {
        R[x++] = void 0;
      }
    }
    intersectionsWithRay(t, e, r, a, o, _, d, h, p, u, g, b) {
      try {
        c(t, j), c(e, E), c(r, l), c(a, l), i.rawquerypipeline_intersectionsWithRay(this.__wbg_ptr, t.__wbg_ptr, e.__wbg_ptr, r.__wbg_ptr, a.__wbg_ptr, o, _, A(d), h, f(p) ? 4294967297 : p >>> 0, !f(u), f(u) ? 0 : u, !f(g), f(g) ? 0 : g, A(b));
      } finally {
        R[x++] = void 0, R[x++] = void 0;
      }
    }
    intersectionWithShape(t, e, r, a, o, _, d, h, p, u) {
      try {
        const y = i.__wbindgen_add_to_stack_pointer(-16);
        c(t, j), c(e, E), c(r, l), c(a, v), c(o, m), i.rawquerypipeline_intersectionWithShape(y, this.__wbg_ptr, t.__wbg_ptr, e.__wbg_ptr, r.__wbg_ptr, a.__wbg_ptr, o.__wbg_ptr, _, f(d) ? 4294967297 : d >>> 0, !f(h), f(h) ? 0 : h, !f(p), f(p) ? 0 : p, A(u));
        var g = z().getInt32(y + 0, true), b = z().getFloat64(y + 8, true);
        return g === 0 ? void 0 : b;
      } finally {
        i.__wbindgen_add_to_stack_pointer(16), R[x++] = void 0;
      }
    }
    projectPoint(t, e, r, a, o, _, d, h, p) {
      try {
        c(t, j), c(e, E), c(r, l);
        const u = i.rawquerypipeline_projectPoint(this.__wbg_ptr, t.__wbg_ptr, e.__wbg_ptr, r.__wbg_ptr, a, o, f(_) ? 4294967297 : _ >>> 0, !f(d), f(d) ? 0 : d, !f(h), f(h) ? 0 : h, A(p));
        return u === 0 ? void 0 : Rt.__wrap(u);
      } finally {
        R[x++] = void 0;
      }
    }
    projectPointAndGetFeature(t, e, r, a, o, _, d, h) {
      try {
        c(t, j), c(e, E), c(r, l);
        const p = i.rawquerypipeline_projectPointAndGetFeature(this.__wbg_ptr, t.__wbg_ptr, e.__wbg_ptr, r.__wbg_ptr, a, f(o) ? 4294967297 : o >>> 0, !f(_), f(_) ? 0 : _, !f(d), f(d) ? 0 : d, A(h));
        return p === 0 ? void 0 : Rt.__wrap(p);
      } finally {
        R[x++] = void 0;
      }
    }
    intersectionsWithPoint(t, e, r, a, o, _, d, h, p) {
      try {
        c(t, j), c(e, E), c(r, l), i.rawquerypipeline_intersectionsWithPoint(this.__wbg_ptr, t.__wbg_ptr, e.__wbg_ptr, r.__wbg_ptr, A(a), o, f(_) ? 4294967297 : _ >>> 0, !f(d), f(d) ? 0 : d, !f(h), f(h) ? 0 : h, A(p));
      } finally {
        R[x++] = void 0, R[x++] = void 0;
      }
    }
    castShape(t, e, r, a, o, _, d, h, p, u, g, b, y, I) {
      try {
        c(t, j), c(e, E), c(r, l), c(a, v), c(o, l), c(_, m);
        const L = i.rawquerypipeline_castShape(this.__wbg_ptr, t.__wbg_ptr, e.__wbg_ptr, r.__wbg_ptr, a.__wbg_ptr, o.__wbg_ptr, _.__wbg_ptr, d, h, p, u, f(g) ? 4294967297 : g >>> 0, !f(b), f(b) ? 0 : b, !f(y), f(y) ? 0 : y, A(I));
        return L === 0 ? void 0 : Ft.__wrap(L);
      } finally {
        R[x++] = void 0;
      }
    }
    intersectionsWithShape(t, e, r, a, o, _, d, h, p, u, g) {
      try {
        c(t, j), c(e, E), c(r, l), c(a, v), c(o, m), i.rawquerypipeline_intersectionsWithShape(this.__wbg_ptr, t.__wbg_ptr, e.__wbg_ptr, r.__wbg_ptr, a.__wbg_ptr, o.__wbg_ptr, A(_), d, f(h) ? 4294967297 : h >>> 0, !f(p), f(p) ? 0 : p, !f(u), f(u) ? 0 : u, A(g));
      } finally {
        R[x++] = void 0, R[x++] = void 0;
      }
    }
    collidersWithAabbIntersectingAabb(t, e, r) {
      try {
        c(t, l), c(e, l), i.rawquerypipeline_collidersWithAabbIntersectingAabb(this.__wbg_ptr, t.__wbg_ptr, e.__wbg_ptr, A(r));
      } finally {
        R[x++] = void 0;
      }
    }
  }
  const ar = typeof FinalizationRegistry > "u" ? {
    register: () => {
    },
    unregister: () => {
    }
  } : new FinalizationRegistry((s) => i.__wbg_rawraycolliderhit_free(s >>> 0, 1));
  class ve {
    static __wrap(t) {
      t = t >>> 0;
      const e = Object.create(ve.prototype);
      return e.__wbg_ptr = t, ar.register(e, e.__wbg_ptr, e), e;
    }
    __destroy_into_raw() {
      const t = this.__wbg_ptr;
      return this.__wbg_ptr = 0, ar.unregister(this), t;
    }
    free() {
      const t = this.__destroy_into_raw();
      i.__wbg_rawraycolliderhit_free(t, 0);
    }
    colliderHandle() {
      return i.rawcharactercollision_handle(this.__wbg_ptr);
    }
    timeOfImpact() {
      return i.rawcollidershapecasthit_time_of_impact(this.__wbg_ptr);
    }
  }
  const sr = typeof FinalizationRegistry > "u" ? {
    register: () => {
    },
    unregister: () => {
    }
  } : new FinalizationRegistry((s) => i.__wbg_rawraycolliderintersection_free(s >>> 0, 1));
  class Tt {
    static __wrap(t) {
      t = t >>> 0;
      const e = Object.create(Tt.prototype);
      return e.__wbg_ptr = t, sr.register(e, e.__wbg_ptr, e), e;
    }
    __destroy_into_raw() {
      const t = this.__wbg_ptr;
      return this.__wbg_ptr = 0, sr.unregister(this), t;
    }
    free() {
      const t = this.__destroy_into_raw();
      i.__wbg_rawraycolliderintersection_free(t, 0);
    }
    colliderHandle() {
      return i.rawpointcolliderprojection_colliderHandle(this.__wbg_ptr);
    }
    normal() {
      const t = i.rawcollidershapecasthit_witness1(this.__wbg_ptr);
      return l.__wrap(t);
    }
    time_of_impact() {
      return i.rawcollidershapecasthit_time_of_impact(this.__wbg_ptr);
    }
    featureType() {
      return i.rawpointcolliderprojection_featureType(this.__wbg_ptr);
    }
    featureId() {
      const t = i.rawpointcolliderprojection_featureId(this.__wbg_ptr);
      return t === 4294967297 ? void 0 : t;
    }
  }
  const or = typeof FinalizationRegistry > "u" ? {
    register: () => {
    },
    unregister: () => {
    }
  } : new FinalizationRegistry((s) => i.__wbg_rawrayintersection_free(s >>> 0, 1));
  class Mt {
    static __wrap(t) {
      t = t >>> 0;
      const e = Object.create(Mt.prototype);
      return e.__wbg_ptr = t, or.register(e, e.__wbg_ptr, e), e;
    }
    __destroy_into_raw() {
      const t = this.__wbg_ptr;
      return this.__wbg_ptr = 0, or.unregister(this), t;
    }
    free() {
      const t = this.__destroy_into_raw();
      i.__wbg_rawrayintersection_free(t, 0);
    }
    normal() {
      const t = i.rawcollidershapecasthit_witness1(this.__wbg_ptr);
      return l.__wrap(t);
    }
    time_of_impact() {
      return i.rawcollidershapecasthit_time_of_impact(this.__wbg_ptr);
    }
    featureType() {
      return i.rawpointcolliderprojection_featureType(this.__wbg_ptr);
    }
    featureId() {
      const t = i.rawpointcolliderprojection_featureId(this.__wbg_ptr);
      return t === 4294967297 ? void 0 : t;
    }
  }
  const te = typeof FinalizationRegistry > "u" ? {
    register: () => {
    },
    unregister: () => {
    }
  } : new FinalizationRegistry((s) => i.__wbg_rawrigidbodyset_free(s >>> 0, 1));
  class j {
    static __wrap(t) {
      t = t >>> 0;
      const e = Object.create(j.prototype);
      return e.__wbg_ptr = t, te.register(e, e.__wbg_ptr, e), e;
    }
    __destroy_into_raw() {
      const t = this.__wbg_ptr;
      return this.__wbg_ptr = 0, te.unregister(this), t;
    }
    free() {
      const t = this.__destroy_into_raw();
      i.__wbg_rawrigidbodyset_free(t, 0);
    }
    rbTranslation(t) {
      const e = i.rawrigidbodyset_rbTranslation(this.__wbg_ptr, t);
      return l.__wrap(e);
    }
    rbRotation(t) {
      const e = i.rawrigidbodyset_rbRotation(this.__wbg_ptr, t);
      return v.__wrap(e);
    }
    rbSleep(t) {
      i.rawrigidbodyset_rbSleep(this.__wbg_ptr, t);
    }
    rbIsSleeping(t) {
      return i.rawrigidbodyset_rbIsSleeping(this.__wbg_ptr, t) !== 0;
    }
    rbIsMoving(t) {
      return i.rawrigidbodyset_rbIsMoving(this.__wbg_ptr, t) !== 0;
    }
    rbNextTranslation(t) {
      const e = i.rawrigidbodyset_rbNextTranslation(this.__wbg_ptr, t);
      return l.__wrap(e);
    }
    rbNextRotation(t) {
      const e = i.rawrigidbodyset_rbNextRotation(this.__wbg_ptr, t);
      return v.__wrap(e);
    }
    rbSetTranslation(t, e, r, a, o) {
      i.rawrigidbodyset_rbSetTranslation(this.__wbg_ptr, t, e, r, a, o);
    }
    rbSetRotation(t, e, r, a, o, _) {
      i.rawrigidbodyset_rbSetRotation(this.__wbg_ptr, t, e, r, a, o, _);
    }
    rbSetLinvel(t, e, r) {
      c(e, l), i.rawrigidbodyset_rbSetLinvel(this.__wbg_ptr, t, e.__wbg_ptr, r);
    }
    rbSetAngvel(t, e, r) {
      c(e, l), i.rawrigidbodyset_rbSetAngvel(this.__wbg_ptr, t, e.__wbg_ptr, r);
    }
    rbSetNextKinematicTranslation(t, e, r, a) {
      i.rawrigidbodyset_rbSetNextKinematicTranslation(this.__wbg_ptr, t, e, r, a);
    }
    rbSetNextKinematicRotation(t, e, r, a, o) {
      i.rawrigidbodyset_rbSetNextKinematicRotation(this.__wbg_ptr, t, e, r, a, o);
    }
    rbRecomputeMassPropertiesFromColliders(t, e) {
      c(e, E), i.rawrigidbodyset_rbRecomputeMassPropertiesFromColliders(this.__wbg_ptr, t, e.__wbg_ptr);
    }
    rbSetAdditionalMass(t, e, r) {
      i.rawrigidbodyset_rbSetAdditionalMass(this.__wbg_ptr, t, e, r);
    }
    rbSetAdditionalMassProperties(t, e, r, a, o, _) {
      c(r, l), c(a, l), c(o, v), i.rawrigidbodyset_rbSetAdditionalMassProperties(this.__wbg_ptr, t, e, r.__wbg_ptr, a.__wbg_ptr, o.__wbg_ptr, _);
    }
    rbLinvel(t) {
      const e = i.rawrigidbodyset_rbLinvel(this.__wbg_ptr, t);
      return l.__wrap(e);
    }
    rbAngvel(t) {
      const e = i.rawrigidbodyset_rbAngvel(this.__wbg_ptr, t);
      return l.__wrap(e);
    }
    rbVelocityAtPoint(t, e) {
      c(e, l);
      const r = i.rawrigidbodyset_rbVelocityAtPoint(this.__wbg_ptr, t, e.__wbg_ptr);
      return l.__wrap(r);
    }
    rbLockTranslations(t, e, r) {
      i.rawrigidbodyset_rbLockTranslations(this.__wbg_ptr, t, e, r);
    }
    rbSetEnabledTranslations(t, e, r, a, o) {
      i.rawrigidbodyset_rbSetEnabledTranslations(this.__wbg_ptr, t, e, r, a, o);
    }
    rbLockRotations(t, e, r) {
      i.rawrigidbodyset_rbLockRotations(this.__wbg_ptr, t, e, r);
    }
    rbSetEnabledRotations(t, e, r, a, o) {
      i.rawrigidbodyset_rbSetEnabledRotations(this.__wbg_ptr, t, e, r, a, o);
    }
    rbDominanceGroup(t) {
      return i.rawrigidbodyset_rbDominanceGroup(this.__wbg_ptr, t);
    }
    rbSetDominanceGroup(t, e) {
      i.rawrigidbodyset_rbSetDominanceGroup(this.__wbg_ptr, t, e);
    }
    rbEnableCcd(t, e) {
      i.rawrigidbodyset_rbEnableCcd(this.__wbg_ptr, t, e);
    }
    rbSetSoftCcdPrediction(t, e) {
      i.rawrigidbodyset_rbSetSoftCcdPrediction(this.__wbg_ptr, t, e);
    }
    rbMass(t) {
      return i.rawrigidbodyset_rbMass(this.__wbg_ptr, t);
    }
    rbInvMass(t) {
      return i.rawrigidbodyset_rbInvMass(this.__wbg_ptr, t);
    }
    rbEffectiveInvMass(t) {
      const e = i.rawrigidbodyset_rbEffectiveInvMass(this.__wbg_ptr, t);
      return l.__wrap(e);
    }
    rbLocalCom(t) {
      const e = i.rawrigidbodyset_rbLocalCom(this.__wbg_ptr, t);
      return l.__wrap(e);
    }
    rbWorldCom(t) {
      const e = i.rawrigidbodyset_rbWorldCom(this.__wbg_ptr, t);
      return l.__wrap(e);
    }
    rbInvPrincipalInertiaSqrt(t) {
      const e = i.rawrigidbodyset_rbInvPrincipalInertiaSqrt(this.__wbg_ptr, t);
      return l.__wrap(e);
    }
    rbPrincipalInertiaLocalFrame(t) {
      const e = i.rawrigidbodyset_rbPrincipalInertiaLocalFrame(this.__wbg_ptr, t);
      return v.__wrap(e);
    }
    rbPrincipalInertia(t) {
      const e = i.rawrigidbodyset_rbPrincipalInertia(this.__wbg_ptr, t);
      return l.__wrap(e);
    }
    rbEffectiveWorldInvInertiaSqrt(t) {
      const e = i.rawrigidbodyset_rbEffectiveWorldInvInertiaSqrt(this.__wbg_ptr, t);
      return Ct.__wrap(e);
    }
    rbEffectiveAngularInertia(t) {
      const e = i.rawrigidbodyset_rbEffectiveAngularInertia(this.__wbg_ptr, t);
      return Ct.__wrap(e);
    }
    rbWakeUp(t) {
      i.rawrigidbodyset_rbWakeUp(this.__wbg_ptr, t);
    }
    rbIsCcdEnabled(t) {
      return i.rawrigidbodyset_rbIsCcdEnabled(this.__wbg_ptr, t) !== 0;
    }
    rbSoftCcdPrediction(t) {
      return i.rawrigidbodyset_rbSoftCcdPrediction(this.__wbg_ptr, t);
    }
    rbNumColliders(t) {
      return i.rawrigidbodyset_rbNumColliders(this.__wbg_ptr, t) >>> 0;
    }
    rbCollider(t, e) {
      return i.rawrigidbodyset_rbCollider(this.__wbg_ptr, t, e);
    }
    rbBodyType(t) {
      return i.rawrigidbodyset_rbBodyType(this.__wbg_ptr, t);
    }
    rbSetBodyType(t, e, r) {
      i.rawrigidbodyset_rbSetBodyType(this.__wbg_ptr, t, e, r);
    }
    rbIsFixed(t) {
      return i.rawrigidbodyset_rbIsFixed(this.__wbg_ptr, t) !== 0;
    }
    rbIsKinematic(t) {
      return i.rawrigidbodyset_rbIsKinematic(this.__wbg_ptr, t) !== 0;
    }
    rbIsDynamic(t) {
      return i.rawrigidbodyset_rbIsDynamic(this.__wbg_ptr, t) !== 0;
    }
    rbLinearDamping(t) {
      return i.rawrigidbodyset_rbLinearDamping(this.__wbg_ptr, t);
    }
    rbAngularDamping(t) {
      return i.rawrigidbodyset_rbAngularDamping(this.__wbg_ptr, t);
    }
    rbSetLinearDamping(t, e) {
      i.rawrigidbodyset_rbSetLinearDamping(this.__wbg_ptr, t, e);
    }
    rbSetAngularDamping(t, e) {
      i.rawrigidbodyset_rbSetAngularDamping(this.__wbg_ptr, t, e);
    }
    rbSetEnabled(t, e) {
      i.rawrigidbodyset_rbSetEnabled(this.__wbg_ptr, t, e);
    }
    rbIsEnabled(t) {
      return i.rawrigidbodyset_rbIsEnabled(this.__wbg_ptr, t) !== 0;
    }
    rbGravityScale(t) {
      return i.rawrigidbodyset_rbGravityScale(this.__wbg_ptr, t);
    }
    rbSetGravityScale(t, e, r) {
      i.rawrigidbodyset_rbSetGravityScale(this.__wbg_ptr, t, e, r);
    }
    rbResetForces(t, e) {
      i.rawrigidbodyset_rbResetForces(this.__wbg_ptr, t, e);
    }
    rbResetTorques(t, e) {
      i.rawrigidbodyset_rbResetTorques(this.__wbg_ptr, t, e);
    }
    rbAddForce(t, e, r) {
      c(e, l), i.rawrigidbodyset_rbAddForce(this.__wbg_ptr, t, e.__wbg_ptr, r);
    }
    rbApplyImpulse(t, e, r) {
      c(e, l), i.rawrigidbodyset_rbApplyImpulse(this.__wbg_ptr, t, e.__wbg_ptr, r);
    }
    rbAddTorque(t, e, r) {
      c(e, l), i.rawrigidbodyset_rbAddTorque(this.__wbg_ptr, t, e.__wbg_ptr, r);
    }
    rbApplyTorqueImpulse(t, e, r) {
      c(e, l), i.rawrigidbodyset_rbApplyTorqueImpulse(this.__wbg_ptr, t, e.__wbg_ptr, r);
    }
    rbAddForceAtPoint(t, e, r, a) {
      c(e, l), c(r, l), i.rawrigidbodyset_rbAddForceAtPoint(this.__wbg_ptr, t, e.__wbg_ptr, r.__wbg_ptr, a);
    }
    rbApplyImpulseAtPoint(t, e, r, a) {
      c(e, l), c(r, l), i.rawrigidbodyset_rbApplyImpulseAtPoint(this.__wbg_ptr, t, e.__wbg_ptr, r.__wbg_ptr, a);
    }
    rbAdditionalSolverIterations(t) {
      return i.rawrigidbodyset_rbAdditionalSolverIterations(this.__wbg_ptr, t) >>> 0;
    }
    rbSetAdditionalSolverIterations(t, e) {
      i.rawrigidbodyset_rbSetAdditionalSolverIterations(this.__wbg_ptr, t, e);
    }
    rbUserData(t) {
      return i.rawrigidbodyset_rbUserData(this.__wbg_ptr, t) >>> 0;
    }
    rbSetUserData(t, e) {
      i.rawrigidbodyset_rbSetUserData(this.__wbg_ptr, t, e);
    }
    rbUserForce(t) {
      const e = i.rawrigidbodyset_rbUserForce(this.__wbg_ptr, t);
      return l.__wrap(e);
    }
    rbUserTorque(t) {
      const e = i.rawrigidbodyset_rbUserTorque(this.__wbg_ptr, t);
      return l.__wrap(e);
    }
    constructor() {
      const t = i.rawrigidbodyset_new();
      return this.__wbg_ptr = t >>> 0, te.register(this, this.__wbg_ptr, this), this;
    }
    createRigidBody(t, e, r, a, o, _, d, h, p, u, g, b, y, I, L, G, W, q, tt, Nt, Gt, Wt, qt, Bt, mt, Vt) {
      return c(e, l), c(r, v), c(d, l), c(h, l), c(p, l), c(u, l), c(g, v), i.rawrigidbodyset_createRigidBody(this.__wbg_ptr, t, e.__wbg_ptr, r.__wbg_ptr, a, o, _, d.__wbg_ptr, h.__wbg_ptr, p.__wbg_ptr, u.__wbg_ptr, g.__wbg_ptr, b, y, I, L, G, W, q, tt, Nt, Gt, Wt, qt, Bt, mt, Vt);
    }
    remove(t, e, r, a, o) {
      c(e, K), c(r, E), c(a, J), c(o, Y), i.rawrigidbodyset_remove(this.__wbg_ptr, t, e.__wbg_ptr, r.__wbg_ptr, a.__wbg_ptr, o.__wbg_ptr);
    }
    len() {
      return i.rawcolliderset_len(this.__wbg_ptr) >>> 0;
    }
    contains(t) {
      return i.rawrigidbodyset_contains(this.__wbg_ptr, t) !== 0;
    }
    forEachRigidBodyHandle(t) {
      try {
        i.rawrigidbodyset_forEachRigidBodyHandle(this.__wbg_ptr, A(t));
      } finally {
        R[x++] = void 0;
      }
    }
    propagateModifiedBodyPositionsToColliders(t) {
      c(t, E), i.rawrigidbodyset_propagateModifiedBodyPositionsToColliders(this.__wbg_ptr, t.__wbg_ptr);
    }
  }
  const ee = typeof FinalizationRegistry > "u" ? {
    register: () => {
    },
    unregister: () => {
    }
  } : new FinalizationRegistry((s) => i.__wbg_rawrotation_free(s >>> 0, 1));
  class v {
    static __wrap(t) {
      t = t >>> 0;
      const e = Object.create(v.prototype);
      return e.__wbg_ptr = t, ee.register(e, e.__wbg_ptr, e), e;
    }
    __destroy_into_raw() {
      const t = this.__wbg_ptr;
      return this.__wbg_ptr = 0, ee.unregister(this), t;
    }
    free() {
      const t = this.__destroy_into_raw();
      i.__wbg_rawrotation_free(t, 0);
    }
    constructor(t, e, r, a) {
      const o = i.rawrotation_new(t, e, r, a);
      return this.__wbg_ptr = o >>> 0, ee.register(this, this.__wbg_ptr, this), this;
    }
    static identity() {
      const t = i.rawrotation_identity();
      return v.__wrap(t);
    }
    get x() {
      return i.rawrotation_x(this.__wbg_ptr);
    }
    get y() {
      return i.rawintegrationparameters_dt(this.__wbg_ptr);
    }
    get z() {
      return i.rawcollidershapecasthit_time_of_impact(this.__wbg_ptr);
    }
    get w() {
      return i.rawrotation_w(this.__wbg_ptr);
    }
  }
  const _r = typeof FinalizationRegistry > "u" ? {
    register: () => {
    },
    unregister: () => {
    }
  } : new FinalizationRegistry((s) => i.__wbg_rawsdpmatrix3_free(s >>> 0, 1));
  class Ct {
    static __wrap(t) {
      t = t >>> 0;
      const e = Object.create(Ct.prototype);
      return e.__wbg_ptr = t, _r.register(e, e.__wbg_ptr, e), e;
    }
    __destroy_into_raw() {
      const t = this.__wbg_ptr;
      return this.__wbg_ptr = 0, _r.unregister(this), t;
    }
    free() {
      const t = this.__destroy_into_raw();
      i.__wbg_rawsdpmatrix3_free(t, 0);
    }
    elements() {
      const t = i.rawsdpmatrix3_elements(this.__wbg_ptr);
      return lt(t);
    }
  }
  const cr = typeof FinalizationRegistry > "u" ? {
    register: () => {
    },
    unregister: () => {
    }
  } : new FinalizationRegistry((s) => i.__wbg_rawserializationpipeline_free(s >>> 0, 1));
  class pi {
    __destroy_into_raw() {
      const t = this.__wbg_ptr;
      return this.__wbg_ptr = 0, cr.unregister(this), t;
    }
    free() {
      const t = this.__destroy_into_raw();
      i.__wbg_rawserializationpipeline_free(t, 0);
    }
    constructor() {
      const t = i.rawserializationpipeline_new();
      return this.__wbg_ptr = t >>> 0, cr.register(this, this.__wbg_ptr, this), this;
    }
    serializeAll(t, e, r, a, o, _, d, h, p) {
      c(t, l), c(e, it), c(r, K), c(a, rt), c(o, $), c(_, j), c(d, E), c(h, J), c(p, Y);
      const u = i.rawserializationpipeline_serializeAll(this.__wbg_ptr, t.__wbg_ptr, e.__wbg_ptr, r.__wbg_ptr, a.__wbg_ptr, o.__wbg_ptr, _.__wbg_ptr, d.__wbg_ptr, h.__wbg_ptr, p.__wbg_ptr);
      return lt(u);
    }
    deserializeAll(t) {
      const e = i.rawserializationpipeline_deserializeAll(this.__wbg_ptr, T(t));
      return e === 0 ? void 0 : ye.__wrap(e);
    }
  }
  const lr = typeof FinalizationRegistry > "u" ? {
    register: () => {
    },
    unregister: () => {
    }
  } : new FinalizationRegistry((s) => i.__wbg_rawshape_free(s >>> 0, 1));
  class m {
    static __wrap(t) {
      t = t >>> 0;
      const e = Object.create(m.prototype);
      return e.__wbg_ptr = t, lr.register(e, e.__wbg_ptr, e), e;
    }
    __destroy_into_raw() {
      const t = this.__wbg_ptr;
      return this.__wbg_ptr = 0, lr.unregister(this), t;
    }
    free() {
      const t = this.__destroy_into_raw();
      i.__wbg_rawshape_free(t, 0);
    }
    static cuboid(t, e, r) {
      const a = i.rawshape_cuboid(t, e, r);
      return m.__wrap(a);
    }
    static roundCuboid(t, e, r, a) {
      const o = i.rawshape_roundCuboid(t, e, r, a);
      return m.__wrap(o);
    }
    static ball(t) {
      const e = i.rawshape_ball(t);
      return m.__wrap(e);
    }
    static halfspace(t) {
      c(t, l);
      const e = i.rawshape_halfspace(t.__wbg_ptr);
      return m.__wrap(e);
    }
    static capsule(t, e) {
      const r = i.rawshape_capsule(t, e);
      return m.__wrap(r);
    }
    static cylinder(t, e) {
      const r = i.rawshape_cylinder(t, e);
      return m.__wrap(r);
    }
    static roundCylinder(t, e, r) {
      const a = i.rawshape_roundCylinder(t, e, r);
      return m.__wrap(a);
    }
    static cone(t, e) {
      const r = i.rawshape_cone(t, e);
      return m.__wrap(r);
    }
    static roundCone(t, e, r) {
      const a = i.rawshape_roundCone(t, e, r);
      return m.__wrap(a);
    }
    static voxels(t, e) {
      c(t, l);
      const r = _t(e, i.__wbindgen_export_2), a = N, o = i.rawshape_voxels(t.__wbg_ptr, r, a);
      return m.__wrap(o);
    }
    static voxelsFromPoints(t, e) {
      c(t, l);
      const r = Z(e, i.__wbindgen_export_2), a = N, o = i.rawshape_voxelsFromPoints(t.__wbg_ptr, r, a);
      return m.__wrap(o);
    }
    static polyline(t, e) {
      const r = Z(t, i.__wbindgen_export_2), a = N, o = _t(e, i.__wbindgen_export_2), _ = N, d = i.rawshape_polyline(r, a, o, _);
      return m.__wrap(d);
    }
    static trimesh(t, e, r) {
      const a = Z(t, i.__wbindgen_export_2), o = N, _ = _t(e, i.__wbindgen_export_2), d = N, h = i.rawshape_trimesh(a, o, _, d, r);
      return h === 0 ? void 0 : m.__wrap(h);
    }
    static heightfield(t, e, r, a, o) {
      const _ = Z(r, i.__wbindgen_export_2), d = N;
      c(a, l);
      const h = i.rawshape_heightfield(t, e, _, d, a.__wbg_ptr, o);
      return m.__wrap(h);
    }
    static segment(t, e) {
      c(t, l), c(e, l);
      const r = i.rawshape_segment(t.__wbg_ptr, e.__wbg_ptr);
      return m.__wrap(r);
    }
    static triangle(t, e, r) {
      c(t, l), c(e, l), c(r, l);
      const a = i.rawshape_triangle(t.__wbg_ptr, e.__wbg_ptr, r.__wbg_ptr);
      return m.__wrap(a);
    }
    static roundTriangle(t, e, r, a) {
      c(t, l), c(e, l), c(r, l);
      const o = i.rawshape_roundTriangle(t.__wbg_ptr, e.__wbg_ptr, r.__wbg_ptr, a);
      return m.__wrap(o);
    }
    static convexHull(t) {
      const e = Z(t, i.__wbindgen_export_2), r = N, a = i.rawshape_convexHull(e, r);
      return a === 0 ? void 0 : m.__wrap(a);
    }
    static roundConvexHull(t, e) {
      const r = Z(t, i.__wbindgen_export_2), a = N, o = i.rawshape_roundConvexHull(r, a, e);
      return o === 0 ? void 0 : m.__wrap(o);
    }
    static convexMesh(t, e) {
      const r = Z(t, i.__wbindgen_export_2), a = N, o = _t(e, i.__wbindgen_export_2), _ = N, d = i.rawshape_convexMesh(r, a, o, _);
      return d === 0 ? void 0 : m.__wrap(d);
    }
    static roundConvexMesh(t, e, r) {
      const a = Z(t, i.__wbindgen_export_2), o = N, _ = _t(e, i.__wbindgen_export_2), d = N, h = i.rawshape_roundConvexMesh(a, o, _, d, r);
      return h === 0 ? void 0 : m.__wrap(h);
    }
    castShape(t, e, r, a, o, _, d, h, p, u) {
      c(t, l), c(e, v), c(r, l), c(a, m), c(o, l), c(_, v), c(d, l);
      const g = i.rawshape_castShape(this.__wbg_ptr, t.__wbg_ptr, e.__wbg_ptr, r.__wbg_ptr, a.__wbg_ptr, o.__wbg_ptr, _.__wbg_ptr, d.__wbg_ptr, h, p, u);
      return g === 0 ? void 0 : kt.__wrap(g);
    }
    intersectsShape(t, e, r, a, o) {
      return c(t, l), c(e, v), c(r, m), c(a, l), c(o, v), i.rawshape_intersectsShape(this.__wbg_ptr, t.__wbg_ptr, e.__wbg_ptr, r.__wbg_ptr, a.__wbg_ptr, o.__wbg_ptr) !== 0;
    }
    contactShape(t, e, r, a, o, _) {
      c(t, l), c(e, v), c(r, m), c(a, l), c(o, v);
      const d = i.rawshape_contactShape(this.__wbg_ptr, t.__wbg_ptr, e.__wbg_ptr, r.__wbg_ptr, a.__wbg_ptr, o.__wbg_ptr, _);
      return d === 0 ? void 0 : wt.__wrap(d);
    }
    containsPoint(t, e, r) {
      return c(t, l), c(e, v), c(r, l), i.rawshape_containsPoint(this.__wbg_ptr, t.__wbg_ptr, e.__wbg_ptr, r.__wbg_ptr) !== 0;
    }
    projectPoint(t, e, r, a) {
      c(t, l), c(e, v), c(r, l);
      const o = i.rawshape_projectPoint(this.__wbg_ptr, t.__wbg_ptr, e.__wbg_ptr, r.__wbg_ptr, a);
      return zt.__wrap(o);
    }
    intersectsRay(t, e, r, a, o) {
      return c(t, l), c(e, v), c(r, l), c(a, l), i.rawshape_intersectsRay(this.__wbg_ptr, t.__wbg_ptr, e.__wbg_ptr, r.__wbg_ptr, a.__wbg_ptr, o) !== 0;
    }
    castRay(t, e, r, a, o, _) {
      return c(t, l), c(e, v), c(r, l), c(a, l), i.rawshape_castRay(this.__wbg_ptr, t.__wbg_ptr, e.__wbg_ptr, r.__wbg_ptr, a.__wbg_ptr, o, _);
    }
    castRayAndGetNormal(t, e, r, a, o, _) {
      c(t, l), c(e, v), c(r, l), c(a, l);
      const d = i.rawshape_castRayAndGetNormal(this.__wbg_ptr, t.__wbg_ptr, e.__wbg_ptr, r.__wbg_ptr, a.__wbg_ptr, o, _);
      return d === 0 ? void 0 : Mt.__wrap(d);
    }
  }
  const wr = typeof FinalizationRegistry > "u" ? {
    register: () => {
    },
    unregister: () => {
    }
  } : new FinalizationRegistry((s) => i.__wbg_rawshapecasthit_free(s >>> 0, 1));
  class kt {
    static __wrap(t) {
      t = t >>> 0;
      const e = Object.create(kt.prototype);
      return e.__wbg_ptr = t, wr.register(e, e.__wbg_ptr, e), e;
    }
    __destroy_into_raw() {
      const t = this.__wbg_ptr;
      return this.__wbg_ptr = 0, wr.unregister(this), t;
    }
    free() {
      const t = this.__destroy_into_raw();
      i.__wbg_rawshapecasthit_free(t, 0);
    }
    time_of_impact() {
      return i.rawrotation_x(this.__wbg_ptr);
    }
    witness1() {
      const t = i.rawshapecasthit_witness1(this.__wbg_ptr);
      return l.__wrap(t);
    }
    witness2() {
      const t = i.rawcontactforceevent_total_force(this.__wbg_ptr);
      return l.__wrap(t);
    }
    normal1() {
      const t = i.rawshapecasthit_normal1(this.__wbg_ptr);
      return l.__wrap(t);
    }
    normal2() {
      const t = i.rawshapecasthit_normal2(this.__wbg_ptr);
      return l.__wrap(t);
    }
  }
  const dr = typeof FinalizationRegistry > "u" ? {
    register: () => {
    },
    unregister: () => {
    }
  } : new FinalizationRegistry((s) => i.__wbg_rawshapecontact_free(s >>> 0, 1));
  class wt {
    static __wrap(t) {
      t = t >>> 0;
      const e = Object.create(wt.prototype);
      return e.__wbg_ptr = t, dr.register(e, e.__wbg_ptr, e), e;
    }
    __destroy_into_raw() {
      const t = this.__wbg_ptr;
      return this.__wbg_ptr = 0, dr.unregister(this), t;
    }
    free() {
      const t = this.__destroy_into_raw();
      i.__wbg_rawshapecontact_free(t, 0);
    }
    distance() {
      return i.rawkinematiccharactercontroller_maxSlopeClimbAngle(this.__wbg_ptr);
    }
    point1() {
      const t = i.rawpointprojection_point(this.__wbg_ptr);
      return l.__wrap(t);
    }
    point2() {
      const t = i.rawcollidershapecasthit_witness1(this.__wbg_ptr);
      return l.__wrap(t);
    }
    normal1() {
      const t = i.rawcollidershapecasthit_witness2(this.__wbg_ptr);
      return l.__wrap(t);
    }
    normal2() {
      const t = i.rawcharactercollision_translationDeltaApplied(this.__wbg_ptr);
      return l.__wrap(t);
    }
  }
  const re = typeof FinalizationRegistry > "u" ? {
    register: () => {
    },
    unregister: () => {
    }
  } : new FinalizationRegistry((s) => i.__wbg_rawvector_free(s >>> 0, 1));
  class l {
    static __wrap(t) {
      t = t >>> 0;
      const e = Object.create(l.prototype);
      return e.__wbg_ptr = t, re.register(e, e.__wbg_ptr, e), e;
    }
    __destroy_into_raw() {
      const t = this.__wbg_ptr;
      return this.__wbg_ptr = 0, re.unregister(this), t;
    }
    free() {
      const t = this.__destroy_into_raw();
      i.__wbg_rawvector_free(t, 0);
    }
    static zero() {
      const t = i.rawvector_zero();
      return l.__wrap(t);
    }
    constructor(t, e, r) {
      const a = i.rawvector_new(t, e, r);
      return this.__wbg_ptr = a >>> 0, re.register(this, this.__wbg_ptr, this), this;
    }
    get x() {
      return i.rawrotation_x(this.__wbg_ptr);
    }
    set x(t) {
      i.rawvector_set_x(this.__wbg_ptr, t);
    }
    get y() {
      return i.rawintegrationparameters_dt(this.__wbg_ptr);
    }
    set y(t) {
      i.rawintegrationparameters_set_dt(this.__wbg_ptr, t);
    }
    get z() {
      return i.rawcollidershapecasthit_time_of_impact(this.__wbg_ptr);
    }
    set z(t) {
      i.rawvector_set_z(this.__wbg_ptr, t);
    }
    xyz() {
      const t = i.rawvector_xyz(this.__wbg_ptr);
      return l.__wrap(t);
    }
    yxz() {
      const t = i.rawvector_yxz(this.__wbg_ptr);
      return l.__wrap(t);
    }
    zxy() {
      const t = i.rawvector_zxy(this.__wbg_ptr);
      return l.__wrap(t);
    }
    xzy() {
      const t = i.rawvector_xzy(this.__wbg_ptr);
      return l.__wrap(t);
    }
    yzx() {
      const t = i.rawvector_yzx(this.__wbg_ptr);
      return l.__wrap(t);
    }
    zyx() {
      const t = i.rawvector_zyx(this.__wbg_ptr);
      return l.__wrap(t);
    }
  }
  function ui(s, t, e, r) {
    const a = C(s).bind(C(t), C(e), C(r));
    return T(a);
  }
  function gi(s) {
    const t = C(s).buffer;
    return T(t);
  }
  function bi() {
    return ge(function(s, t, e) {
      const r = C(s).call(C(t), C(e));
      return T(r);
    }, arguments);
  }
  function mi() {
    return ge(function(s, t, e, r) {
      const a = C(s).call(C(t), C(e), C(r));
      return T(a);
    }, arguments);
  }
  function fi() {
    return ge(function(s, t, e, r, a) {
      const o = C(s).call(C(t), C(e), C(r), C(a));
      return T(o);
    }, arguments);
  }
  function yi(s) {
    return C(s).length;
  }
  function Si(s) {
    return C(s).length;
  }
  function vi(s) {
    const t = new Uint8Array(C(s));
    return T(t);
  }
  function Ri(s, t, e) {
    const r = new Uint8Array(C(s), t >>> 0, e >>> 0);
    return T(r);
  }
  function Ci(s, t, e) {
    const r = new Float32Array(C(s), t >>> 0, e >>> 0);
    return T(r);
  }
  function xi(s) {
    const t = new Float32Array(s >>> 0);
    return T(t);
  }
  function Ii(s) {
    const t = be.__wrap(s);
    return T(t);
  }
  function Ai(s) {
    const t = Tt.__wrap(s);
    return T(t);
  }
  function ji(s, t, e) {
    C(s).set(C(t), e >>> 0);
  }
  function Ei(s, t, e) {
    C(s).set(C(t), e >>> 0);
  }
  function Pi(s) {
    const t = C(s);
    return typeof t == "boolean" ? t ? 1 : 0 : 2;
  }
  function Fi(s) {
    return typeof C(s) == "function";
  }
  function zi() {
    const s = i.memory;
    return T(s);
  }
  function Ti(s, t) {
    const e = C(t), r = typeof e == "number" ? e : void 0;
    z().setFloat64(s + 8, f(r) ? 0 : r, true), z().setInt32(s + 0, !f(r), true);
  }
  function Mi(s) {
    return T(s);
  }
  function ki(s) {
    lt(s);
  }
  function Hi(s, t) {
    throw new Error(pr(s, t));
  }
  URL = globalThis.URL;
  const n = await Qr({
    "./rapier_wasm3d_bg.js": {
      __wbindgen_number_new: Mi,
      __wbindgen_boolean_get: Pi,
      __wbindgen_object_drop_ref: ki,
      __wbindgen_number_get: Ti,
      __wbindgen_is_function: Fi,
      __wbg_rawraycolliderintersection_new: Ai,
      __wbg_rawcontactforceevent_new: Ii,
      __wbg_call_7cccdd69e0791ae2: bi,
      __wbg_call_833bed5770ea2041: mi,
      __wbg_call_b8adc8b1d0a0d8eb: fi,
      __wbg_bind_c8359b1cba058168: ui,
      __wbg_buffer_609cc3eee51ed158: gi,
      __wbg_newwithbyteoffsetandlength_d97e637ebe145a9a: Ri,
      __wbg_new_a12002a7f91c75be: vi,
      __wbg_set_65595bdd868b3009: Ei,
      __wbg_length_a446193dc22c12f8: Si,
      __wbg_newwithbyteoffsetandlength_e6b7e69acd4c7354: Ci,
      __wbg_set_10bad9bee0e9c58b: ji,
      __wbg_length_3b4f022188ae8db6: yi,
      __wbg_newwithlength_5a5efe313cfd59f1: xi,
      __wbindgen_throw: Hi,
      __wbindgen_memory: zi
    }
  }, $r), Di = n.memory, Li = n.version, Ni = n.__wbg_rawkinematiccharactercontroller_free, Gi = n.rawkinematiccharactercontroller_new, Wi = n.rawkinematiccharactercontroller_setUp, qi = n.rawkinematiccharactercontroller_normalNudgeFactor, Bi = n.rawkinematiccharactercontroller_setNormalNudgeFactor, Vi = n.rawkinematiccharactercontroller_setOffset, Oi = n.rawkinematiccharactercontroller_slideEnabled, Ui = n.rawkinematiccharactercontroller_setSlideEnabled, Xi = n.rawkinematiccharactercontroller_autostepMaxHeight, Ji = n.rawkinematiccharactercontroller_autostepMinWidth, Ki = n.rawkinematiccharactercontroller_autostepIncludesDynamicBodies, Yi = n.rawkinematiccharactercontroller_autostepEnabled, Zi = n.rawkinematiccharactercontroller_enableAutostep, $i = n.rawkinematiccharactercontroller_disableAutostep, Qi = n.rawkinematiccharactercontroller_maxSlopeClimbAngle, tn = n.rawkinematiccharactercontroller_setMaxSlopeClimbAngle, en = n.rawkinematiccharactercontroller_minSlopeSlideAngle, rn = n.rawkinematiccharactercontroller_setMinSlopeSlideAngle, nn = n.rawkinematiccharactercontroller_snapToGroundDistance, an = n.rawkinematiccharactercontroller_enableSnapToGround, sn = n.rawkinematiccharactercontroller_disableSnapToGround, on = n.rawkinematiccharactercontroller_snapToGroundEnabled, _n = n.rawkinematiccharactercontroller_computeColliderMovement, cn = n.rawkinematiccharactercontroller_computedMovement, ln = n.rawkinematiccharactercontroller_computedGrounded, wn = n.rawkinematiccharactercontroller_numComputedCollisions, dn = n.rawkinematiccharactercontroller_computedCollision, hn = n.__wbg_rawcharactercollision_free, pn = n.rawcharactercollision_new, un = n.rawcharactercollision_handle, gn = n.rawcharactercollision_translationDeltaApplied, bn = n.rawcharactercollision_translationDeltaRemaining, mn = n.rawcharactercollision_toi, fn = n.rawcharactercollision_worldWitness1, yn = n.rawcharactercollision_worldWitness2, Sn = n.rawcharactercollision_worldNormal1, vn = n.rawcharactercollision_worldNormal2, Rn = n.__wbg_rawpidcontroller_free, Cn = n.rawpidcontroller_new, xn = n.rawpidcontroller_set_kp, In = n.rawpidcontroller_set_ki, An = n.rawpidcontroller_set_kd, jn = n.rawpidcontroller_set_axes_mask, En = n.rawpidcontroller_reset_integrals, Pn = n.rawpidcontroller_apply_linear_correction, Fn = n.rawpidcontroller_apply_angular_correction, zn = n.rawpidcontroller_linear_correction, Tn = n.rawpidcontroller_angular_correction, Mn = n.__wbg_rawdynamicraycastvehiclecontroller_free, kn = n.rawdynamicraycastvehiclecontroller_new, Hn = n.rawdynamicraycastvehiclecontroller_current_vehicle_speed, Dn = n.rawdynamicraycastvehiclecontroller_chassis, Ln = n.rawdynamicraycastvehiclecontroller_index_up_axis, Nn = n.rawdynamicraycastvehiclecontroller_set_index_up_axis, Gn = n.rawdynamicraycastvehiclecontroller_index_forward_axis, Wn = n.rawdynamicraycastvehiclecontroller_set_index_forward_axis, qn = n.rawdynamicraycastvehiclecontroller_add_wheel, Bn = n.rawdynamicraycastvehiclecontroller_num_wheels, Vn = n.rawdynamicraycastvehiclecontroller_update_vehicle, On = n.rawdynamicraycastvehiclecontroller_wheel_chassis_connection_point_cs, Un = n.rawdynamicraycastvehiclecontroller_set_wheel_chassis_connection_point_cs, Xn = n.rawdynamicraycastvehiclecontroller_wheel_suspension_rest_length, Jn = n.rawdynamicraycastvehiclecontroller_set_wheel_suspension_rest_length, Kn = n.rawdynamicraycastvehiclecontroller_wheel_max_suspension_travel, Yn = n.rawdynamicraycastvehiclecontroller_set_wheel_max_suspension_travel, Zn = n.rawdynamicraycastvehiclecontroller_wheel_radius, $n = n.rawdynamicraycastvehiclecontroller_set_wheel_radius, Qn = n.rawdynamicraycastvehiclecontroller_wheel_suspension_stiffness, ta = n.rawdynamicraycastvehiclecontroller_set_wheel_suspension_stiffness, ea = n.rawdynamicraycastvehiclecontroller_wheel_suspension_compression, ra = n.rawdynamicraycastvehiclecontroller_set_wheel_suspension_compression, ia = n.rawdynamicraycastvehiclecontroller_wheel_suspension_relaxation, na = n.rawdynamicraycastvehiclecontroller_set_wheel_suspension_relaxation, aa = n.rawdynamicraycastvehiclecontroller_wheel_max_suspension_force, sa = n.rawdynamicraycastvehiclecontroller_set_wheel_max_suspension_force, oa = n.rawdynamicraycastvehiclecontroller_wheel_brake, _a = n.rawdynamicraycastvehiclecontroller_set_wheel_brake, ca = n.rawdynamicraycastvehiclecontroller_wheel_steering, la = n.rawdynamicraycastvehiclecontroller_set_wheel_steering, wa = n.rawdynamicraycastvehiclecontroller_wheel_engine_force, da = n.rawdynamicraycastvehiclecontroller_set_wheel_engine_force, ha = n.rawdynamicraycastvehiclecontroller_wheel_direction_cs, pa = n.rawdynamicraycastvehiclecontroller_set_wheel_direction_cs, ua = n.rawdynamicraycastvehiclecontroller_wheel_axle_cs, ga = n.rawdynamicraycastvehiclecontroller_set_wheel_axle_cs, ba = n.rawdynamicraycastvehiclecontroller_wheel_friction_slip, ma = n.rawdynamicraycastvehiclecontroller_set_wheel_friction_slip, fa = n.rawdynamicraycastvehiclecontroller_wheel_side_friction_stiffness, ya = n.rawdynamicraycastvehiclecontroller_set_wheel_side_friction_stiffness, Sa = n.rawdynamicraycastvehiclecontroller_wheel_rotation, va = n.rawdynamicraycastvehiclecontroller_wheel_forward_impulse, Ra = n.rawdynamicraycastvehiclecontroller_wheel_side_impulse, Ca = n.rawdynamicraycastvehiclecontroller_wheel_suspension_force, xa = n.rawdynamicraycastvehiclecontroller_wheel_contact_normal_ws, Ia = n.rawdynamicraycastvehiclecontroller_wheel_contact_point_ws, Aa = n.rawdynamicraycastvehiclecontroller_wheel_suspension_length, ja = n.rawdynamicraycastvehiclecontroller_wheel_hard_point_ws, Ea = n.rawdynamicraycastvehiclecontroller_wheel_is_in_contact, Pa = n.rawdynamicraycastvehiclecontroller_wheel_ground_object, Fa = n.__wbg_rawccdsolver_free, za = n.rawccdsolver_new, Ta = n.rawimpulsejointset_jointType, Ma = n.rawimpulsejointset_jointBodyHandle1, ka = n.rawimpulsejointset_jointBodyHandle2, Ha = n.rawimpulsejointset_jointFrameX1, Da = n.rawimpulsejointset_jointFrameX2, La = n.rawimpulsejointset_jointAnchor1, Na = n.rawimpulsejointset_jointAnchor2, Ga = n.rawimpulsejointset_jointSetAnchor1, Wa = n.rawimpulsejointset_jointSetAnchor2, qa = n.rawimpulsejointset_jointContactsEnabled, Ba = n.rawimpulsejointset_jointSetContactsEnabled, Va = n.rawimpulsejointset_jointLimitsEnabled, Oa = n.rawimpulsejointset_jointLimitsMin, Ua = n.rawimpulsejointset_jointLimitsMax, Xa = n.rawimpulsejointset_jointSetLimits, Ja = n.rawimpulsejointset_jointConfigureMotorModel, Ka = n.rawimpulsejointset_jointConfigureMotorVelocity, Ya = n.rawimpulsejointset_jointConfigureMotorPosition, Za = n.rawimpulsejointset_jointConfigureMotor, $a = n.__wbg_rawimpulsejointset_free, Qa = n.rawimpulsejointset_new, ts = n.rawimpulsejointset_createJoint, es = n.rawimpulsejointset_remove, rs = n.rawimpulsejointset_len, is = n.rawimpulsejointset_contains, ns = n.rawimpulsejointset_forEachJointHandle, as = n.rawimpulsejointset_forEachJointAttachedToRigidBody, ss = n.__wbg_rawintegrationparameters_free, os = n.rawintegrationparameters_new, _s = n.rawintegrationparameters_dt, cs = n.rawintegrationparameters_contact_erp, ls = n.rawintegrationparameters_numSolverIterations, ws = n.rawintegrationparameters_minIslandSize, ds = n.rawintegrationparameters_maxCcdSubsteps, hs = n.rawintegrationparameters_lengthUnit, ps = n.rawintegrationparameters_set_dt, us = n.rawintegrationparameters_set_contact_natural_frequency, gs = n.rawintegrationparameters_set_normalizedAllowedLinearError, bs = n.rawintegrationparameters_set_normalizedPredictionDistance, ms = n.rawintegrationparameters_set_numSolverIterations, fs = n.rawintegrationparameters_set_minIslandSize, ys = n.rawintegrationparameters_set_maxCcdSubsteps, Ss = n.rawintegrationparameters_set_lengthUnit, vs = n.rawintegrationparameters_switchToStandardPgsSolver, Rs = n.rawintegrationparameters_switchToSmallStepsPgsSolver, Cs = n.rawintegrationparameters_switchToSmallStepsPgsSolverWithoutWarmstart, xs = n.__wbg_rawislandmanager_free, Is = n.rawislandmanager_new, As = n.rawislandmanager_forEachActiveRigidBodyHandle, js = n.__wbg_rawgenericjoint_free, Es = n.rawgenericjoint_generic, Ps = n.rawgenericjoint_spring, Fs = n.rawgenericjoint_rope, zs = n.rawgenericjoint_spherical, Ts = n.rawgenericjoint_prismatic, Ms = n.rawgenericjoint_fixed, ks = n.rawgenericjoint_revolute, Hs = n.rawmultibodyjointset_jointType, Ds = n.rawmultibodyjointset_jointFrameX1, Ls = n.rawmultibodyjointset_jointFrameX2, Ns = n.rawmultibodyjointset_jointAnchor1, Gs = n.rawmultibodyjointset_jointAnchor2, Ws = n.rawmultibodyjointset_jointContactsEnabled, qs = n.rawmultibodyjointset_jointSetContactsEnabled, Bs = n.rawmultibodyjointset_jointLimitsEnabled, Vs = n.rawmultibodyjointset_jointLimitsMin, Os = n.rawmultibodyjointset_jointLimitsMax, Us = n.__wbg_rawmultibodyjointset_free, Xs = n.rawmultibodyjointset_new, Js = n.rawmultibodyjointset_createJoint, Ks = n.rawmultibodyjointset_remove, Ys = n.rawmultibodyjointset_contains, Zs = n.rawmultibodyjointset_forEachJointHandle, $s = n.rawmultibodyjointset_forEachJointAttachedToRigidBody, Qs = n.rawrigidbodyset_rbTranslation, to = n.rawrigidbodyset_rbRotation, eo = n.rawrigidbodyset_rbSleep, ro = n.rawrigidbodyset_rbIsSleeping, io = n.rawrigidbodyset_rbIsMoving, no = n.rawrigidbodyset_rbNextTranslation, ao = n.rawrigidbodyset_rbNextRotation, so = n.rawrigidbodyset_rbSetTranslation, oo = n.rawrigidbodyset_rbSetRotation, _o = n.rawrigidbodyset_rbSetLinvel, co = n.rawrigidbodyset_rbSetAngvel, lo = n.rawrigidbodyset_rbSetNextKinematicTranslation, wo = n.rawrigidbodyset_rbSetNextKinematicRotation, ho = n.rawrigidbodyset_rbRecomputeMassPropertiesFromColliders, po = n.rawrigidbodyset_rbSetAdditionalMass, uo = n.rawrigidbodyset_rbSetAdditionalMassProperties, go = n.rawrigidbodyset_rbLinvel, bo = n.rawrigidbodyset_rbAngvel, mo = n.rawrigidbodyset_rbVelocityAtPoint, fo = n.rawrigidbodyset_rbLockTranslations, yo = n.rawrigidbodyset_rbSetEnabledTranslations, So = n.rawrigidbodyset_rbLockRotations, vo = n.rawrigidbodyset_rbSetEnabledRotations, Ro = n.rawrigidbodyset_rbDominanceGroup, Co = n.rawrigidbodyset_rbSetDominanceGroup, xo = n.rawrigidbodyset_rbEnableCcd, Io = n.rawrigidbodyset_rbSetSoftCcdPrediction, Ao = n.rawrigidbodyset_rbMass, jo = n.rawrigidbodyset_rbInvMass, Eo = n.rawrigidbodyset_rbEffectiveInvMass, Po = n.rawrigidbodyset_rbLocalCom, Fo = n.rawrigidbodyset_rbWorldCom, zo = n.rawrigidbodyset_rbInvPrincipalInertiaSqrt, To = n.rawrigidbodyset_rbPrincipalInertiaLocalFrame, Mo = n.rawrigidbodyset_rbPrincipalInertia, ko = n.rawrigidbodyset_rbEffectiveWorldInvInertiaSqrt, Ho = n.rawrigidbodyset_rbEffectiveAngularInertia, Do = n.rawrigidbodyset_rbWakeUp, Lo = n.rawrigidbodyset_rbIsCcdEnabled, No = n.rawrigidbodyset_rbSoftCcdPrediction, Go = n.rawrigidbodyset_rbNumColliders, Wo = n.rawrigidbodyset_rbCollider, qo = n.rawrigidbodyset_rbBodyType, Bo = n.rawrigidbodyset_rbSetBodyType, Vo = n.rawrigidbodyset_rbIsFixed, Oo = n.rawrigidbodyset_rbIsKinematic, Uo = n.rawrigidbodyset_rbIsDynamic, Xo = n.rawrigidbodyset_rbLinearDamping, Jo = n.rawrigidbodyset_rbAngularDamping, Ko = n.rawrigidbodyset_rbSetLinearDamping, Yo = n.rawrigidbodyset_rbSetAngularDamping, Zo = n.rawrigidbodyset_rbSetEnabled, $o = n.rawrigidbodyset_rbIsEnabled, Qo = n.rawrigidbodyset_rbGravityScale, t_ = n.rawrigidbodyset_rbSetGravityScale, e_ = n.rawrigidbodyset_rbResetForces, r_ = n.rawrigidbodyset_rbResetTorques, i_ = n.rawrigidbodyset_rbAddForce, n_ = n.rawrigidbodyset_rbApplyImpulse, a_ = n.rawrigidbodyset_rbAddTorque, s_ = n.rawrigidbodyset_rbApplyTorqueImpulse, o_ = n.rawrigidbodyset_rbAddForceAtPoint, __ = n.rawrigidbodyset_rbApplyImpulseAtPoint, c_ = n.rawrigidbodyset_rbAdditionalSolverIterations, l_ = n.rawrigidbodyset_rbSetAdditionalSolverIterations, w_ = n.rawrigidbodyset_rbUserData, d_ = n.rawrigidbodyset_rbSetUserData, h_ = n.rawrigidbodyset_rbUserForce, p_ = n.rawrigidbodyset_rbUserTorque, u_ = n.__wbg_rawrigidbodyset_free, g_ = n.rawrigidbodyset_new, b_ = n.rawrigidbodyset_createRigidBody, m_ = n.rawrigidbodyset_remove, f_ = n.rawrigidbodyset_contains, y_ = n.rawrigidbodyset_forEachRigidBodyHandle, S_ = n.rawrigidbodyset_propagateModifiedBodyPositionsToColliders, v_ = n.__wbg_rawbroadphase_free, R_ = n.rawbroadphase_new, C_ = n.rawcolliderset_coTranslation, x_ = n.rawcolliderset_coRotation, I_ = n.rawcolliderset_coSetTranslation, A_ = n.rawcolliderset_coSetTranslationWrtParent, j_ = n.rawcolliderset_coSetRotation, E_ = n.rawcolliderset_coSetRotationWrtParent, P_ = n.rawcolliderset_coIsSensor, F_ = n.rawcolliderset_coShapeType, z_ = n.rawcolliderset_coHalfspaceNormal, T_ = n.rawcolliderset_coHalfExtents, M_ = n.rawcolliderset_coSetHalfExtents, k_ = n.rawcolliderset_coRadius, H_ = n.rawcolliderset_coSetRadius, D_ = n.rawcolliderset_coHalfHeight, L_ = n.rawcolliderset_coSetHalfHeight, N_ = n.rawcolliderset_coRoundRadius, G_ = n.rawcolliderset_coSetRoundRadius, W_ = n.rawcolliderset_coVoxelData, q_ = n.rawcolliderset_coVoxelSize, B_ = n.rawcolliderset_coSetVoxel, V_ = n.rawcolliderset_coPropagateVoxelChange, O_ = n.rawcolliderset_coCombineVoxelStates, U_ = n.rawcolliderset_coVertices, X_ = n.rawcolliderset_coIndices, J_ = n.rawcolliderset_coTriMeshFlags, K_ = n.rawcolliderset_coHeightFieldFlags, Y_ = n.rawcolliderset_coHeightfieldHeights, Z_ = n.rawcolliderset_coHeightfieldScale, $_ = n.rawcolliderset_coHeightfieldNRows, Q_ = n.rawcolliderset_coHeightfieldNCols, tc = n.rawcolliderset_coParent, ec = n.rawcolliderset_coSetEnabled, rc = n.rawcolliderset_coIsEnabled, ic = n.rawcolliderset_coSetContactSkin, nc = n.rawcolliderset_coContactSkin, ac = n.rawcolliderset_coFriction, sc = n.rawcolliderset_coRestitution, oc = n.rawcolliderset_coDensity, _c = n.rawcolliderset_coMass, cc = n.rawcolliderset_coVolume, lc = n.rawcolliderset_coCollisionGroups, wc = n.rawcolliderset_coSolverGroups, dc = n.rawcolliderset_coActiveHooks, hc = n.rawcolliderset_coActiveCollisionTypes, pc = n.rawcolliderset_coActiveEvents, uc = n.rawcolliderset_coContactForceEventThreshold, gc = n.rawcolliderset_coContainsPoint, bc = n.rawcolliderset_coCastShape, mc = n.rawcolliderset_coCastCollider, fc = n.rawcolliderset_coIntersectsShape, yc = n.rawcolliderset_coContactShape, Sc = n.rawcolliderset_coContactCollider, vc = n.rawcolliderset_coProjectPoint, Rc = n.rawcolliderset_coIntersectsRay, Cc = n.rawcolliderset_coCastRay, xc = n.rawcolliderset_coCastRayAndGetNormal, Ic = n.rawcolliderset_coSetSensor, Ac = n.rawcolliderset_coSetRestitution, jc = n.rawcolliderset_coSetFriction, Ec = n.rawcolliderset_coFrictionCombineRule, Pc = n.rawcolliderset_coSetFrictionCombineRule, Fc = n.rawcolliderset_coRestitutionCombineRule, zc = n.rawcolliderset_coSetRestitutionCombineRule, Tc = n.rawcolliderset_coSetCollisionGroups, Mc = n.rawcolliderset_coSetSolverGroups, kc = n.rawcolliderset_coSetActiveHooks, Hc = n.rawcolliderset_coSetActiveEvents, Dc = n.rawcolliderset_coSetActiveCollisionTypes, Lc = n.rawcolliderset_coSetShape, Nc = n.rawcolliderset_coSetContactForceEventThreshold, Gc = n.rawcolliderset_coSetDensity, Wc = n.rawcolliderset_coSetMass, qc = n.rawcolliderset_coSetMassProperties, Bc = n.__wbg_rawcolliderset_free, Vc = n.rawcolliderset_new, Oc = n.rawcolliderset_len, Uc = n.rawcolliderset_contains, Xc = n.rawcolliderset_createCollider, Jc = n.rawcolliderset_remove, Kc = n.rawcolliderset_forEachColliderHandle, Yc = n.__wbg_rawshapecontact_free, Zc = n.__wbg_rawnarrowphase_free, $c = n.rawnarrowphase_new, Qc = n.rawnarrowphase_contact_pairs_with, tl = n.rawnarrowphase_contact_pair, el = n.rawnarrowphase_intersection_pairs_with, rl = n.rawnarrowphase_intersection_pair, il = n.__wbg_rawcontactmanifold_free, nl = n.rawcontactpair_collider1, al = n.rawcontactpair_collider2, sl = n.rawcontactpair_numContactManifolds, ol = n.rawcontactpair_contactManifold, _l = n.rawcontactmanifold_normal, cl = n.rawcontactmanifold_local_n1, ll = n.rawcontactmanifold_local_n2, wl = n.rawcontactmanifold_subshape1, dl = n.rawcontactmanifold_subshape2, hl = n.rawcontactmanifold_num_contacts, pl = n.rawcontactmanifold_contact_local_p1, ul = n.rawcontactmanifold_contact_local_p2, gl = n.rawcontactmanifold_contact_dist, bl = n.rawcontactmanifold_contact_fid1, ml = n.rawcontactmanifold_contact_fid2, fl = n.rawcontactmanifold_contact_impulse, yl = n.rawcontactmanifold_contact_tangent_impulse_x, Sl = n.rawcontactmanifold_contact_tangent_impulse_y, vl = n.rawcontactmanifold_num_solver_contacts, Rl = n.rawcontactmanifold_solver_contact_point, Cl = n.rawcontactmanifold_solver_contact_dist, xl = n.rawcontactmanifold_solver_contact_friction, Il = n.rawcontactmanifold_solver_contact_restitution, Al = n.rawcontactmanifold_solver_contact_tangent_velocity, jl = n.__wbg_rawpointprojection_free, El = n.rawpointprojection_point, Pl = n.rawpointprojection_isInside, Fl = n.__wbg_rawpointcolliderprojection_free, zl = n.rawpointcolliderprojection_colliderHandle, Tl = n.rawpointcolliderprojection_point, Ml = n.rawpointcolliderprojection_isInside, kl = n.rawpointcolliderprojection_featureType, Hl = n.rawpointcolliderprojection_featureId, Dl = n.__wbg_rawrayintersection_free, Ll = n.__wbg_rawraycolliderhit_free, Nl = n.__wbg_rawshape_free, Gl = n.rawshape_cuboid, Wl = n.rawshape_roundCuboid, ql = n.rawshape_ball, Bl = n.rawshape_halfspace, Vl = n.rawshape_capsule, Ol = n.rawshape_cylinder, Ul = n.rawshape_roundCylinder, Xl = n.rawshape_cone, Jl = n.rawshape_roundCone, Kl = n.rawshape_voxels, Yl = n.rawshape_voxelsFromPoints, Zl = n.rawshape_polyline, $l = n.rawshape_trimesh, Ql = n.rawshape_heightfield, tw = n.rawshape_segment, ew = n.rawshape_triangle, rw = n.rawshape_roundTriangle, iw = n.rawshape_convexHull, nw = n.rawshape_roundConvexHull, aw = n.rawshape_convexMesh, sw = n.rawshape_roundConvexMesh, ow = n.rawshape_castShape, _w = n.rawshape_intersectsShape, cw = n.rawshape_contactShape, lw = n.rawshape_containsPoint, ww = n.rawshape_projectPoint, dw = n.rawshape_intersectsRay, hw = n.rawshape_castRay, pw = n.rawshape_castRayAndGetNormal, uw = n.__wbg_rawshapecasthit_free, gw = n.rawshapecasthit_witness1, bw = n.rawshapecasthit_normal1, mw = n.rawshapecasthit_normal2, fw = n.__wbg_rawcollidershapecasthit_free, yw = n.rawcollidershapecasthit_time_of_impact, Sw = n.rawcollidershapecasthit_witness1, vw = n.rawcollidershapecasthit_witness2, Rw = n.rawrotation_new, Cw = n.rawrotation_identity, xw = n.rawrotation_x, Iw = n.rawrotation_w, Aw = n.rawvector_zero, jw = n.rawvector_new, Ew = n.rawvector_set_x, Pw = n.rawvector_set_z, Fw = n.rawvector_xyz, zw = n.rawvector_yxz, Tw = n.rawvector_zxy, Mw = n.rawvector_xzy, kw = n.rawvector_yzx, Hw = n.rawvector_zyx, Dw = n.rawsdpmatrix3_elements, Lw = n.__wbg_rawdebugrenderpipeline_free, Nw = n.rawdebugrenderpipeline_new, Gw = n.rawdebugrenderpipeline_vertices, Ww = n.rawdebugrenderpipeline_colors, qw = n.rawdebugrenderpipeline_render, Bw = n.__wbg_raweventqueue_free, Vw = n.__wbg_rawcontactforceevent_free, Ow = n.rawcontactforceevent_collider2, Uw = n.rawcontactforceevent_total_force, Xw = n.rawcontactforceevent_total_force_magnitude, Jw = n.rawcontactforceevent_max_force_direction, Kw = n.rawcontactforceevent_max_force_magnitude, Yw = n.raweventqueue_new, Zw = n.raweventqueue_drainCollisionEvents, $w = n.raweventqueue_drainContactForceEvents, Qw = n.raweventqueue_clear, td = n.__wbg_rawphysicspipeline_free, ed = n.rawphysicspipeline_new, rd = n.rawphysicspipeline_step, id = n.rawphysicspipeline_stepWithEvents, nd = n.rawquerypipeline_new, ad = n.rawquerypipeline_update, sd = n.rawquerypipeline_castRay, od = n.rawquerypipeline_castRayAndGetNormal, _d = n.rawquerypipeline_intersectionsWithRay, cd = n.rawquerypipeline_intersectionWithShape, ld = n.rawquerypipeline_projectPoint, wd = n.rawquerypipeline_projectPointAndGetFeature, dd = n.rawquerypipeline_intersectionsWithPoint, hd = n.rawquerypipeline_castShape, pd = n.rawquerypipeline_intersectionsWithShape, ud = n.rawquerypipeline_collidersWithAabbIntersectingAabb, gd = n.__wbg_rawdeserializedworld_free, bd = n.rawdeserializedworld_takeGravity, md = n.rawdeserializedworld_takeIntegrationParameters, fd = n.rawdeserializedworld_takeIslandManager, yd = n.rawdeserializedworld_takeBroadPhase, Sd = n.rawdeserializedworld_takeNarrowPhase, vd = n.rawdeserializedworld_takeBodies, Rd = n.rawdeserializedworld_takeColliders, Cd = n.rawdeserializedworld_takeImpulseJoints, xd = n.rawdeserializedworld_takeMultibodyJoints, Id = n.__wbg_rawserializationpipeline_free, Ad = n.rawserializationpipeline_new, jd = n.rawserializationpipeline_serializeAll, Ed = n.rawserializationpipeline_deserializeAll, Pd = n.rawcolliderset_isHandleValid, Fd = n.rawkinematiccharactercontroller_offset, zd = n.rawintegrationparameters_normalizedAllowedLinearError, Td = n.rawintegrationparameters_numAdditionalFrictionIterations, Md = n.rawintegrationparameters_numInternalPgsIterations, kd = n.rawrigidbodyset_len, Hd = n.rawshapecontact_distance, Dd = n.rawrayintersection_featureType, Ld = n.rawraycolliderintersection_colliderHandle, Nd = n.rawrayintersection_time_of_impact, Gd = n.rawraycolliderintersection_featureType, Wd = n.rawraycolliderhit_colliderHandle, qd = n.rawraycolliderintersection_time_of_impact, Bd = n.rawcollidershapecasthit_colliderHandle, Vd = n.rawraycolliderhit_timeOfImpact, Od = n.rawshapecasthit_time_of_impact, Ud = n.rawrotation_y, Xd = n.rawrotation_z, Jd = n.rawvector_x, Kd = n.rawvector_y, Yd = n.rawvector_z, Zd = n.rawcontactforceevent_collider1, $d = n.rawintegrationparameters_normalizedPredictionDistance, Qd = n.reserve_memory, th = n.__wbg_rawquerypipeline_free, eh = n.rawrayintersection_featureId, rh = n.rawraycolliderintersection_featureId, ih = n.rawkinematiccharactercontroller_up, nh = n.rawshapecontact_normal2, ah = n.rawshapecontact_point1, sh = n.rawshapecontact_point2, oh = n.rawrayintersection_normal, _h = n.rawraycolliderintersection_normal, ch = n.rawshapecontact_normal1, lh = n.rawcollidershapecasthit_normal1, wh = n.rawcollidershapecasthit_normal2, dh = n.rawshapecasthit_witness2, hh = n.rawintegrationparameters_set_numAdditionalFrictionIterations, ph = n.rawintegrationparameters_set_numInternalPgsIterations, uh = n.rawvector_set_y, gh = n.__wbg_rawraycolliderintersection_free, bh = n.__wbg_rawcontactpair_free, mh = n.__wbg_rawsdpmatrix3_free, fh = n.__wbg_rawvector_free, yh = n.__wbg_rawrotation_free, Sh = n.__wbindgen_export_0, vh = n.__wbindgen_add_to_stack_pointer, Rh = n.__wbindgen_export_1, Ch = n.__wbindgen_export_2, xh = Object.freeze(Object.defineProperty({
    __proto__: null,
    __wbg_rawbroadphase_free: v_,
    __wbg_rawccdsolver_free: Fa,
    __wbg_rawcharactercollision_free: hn,
    __wbg_rawcolliderset_free: Bc,
    __wbg_rawcollidershapecasthit_free: fw,
    __wbg_rawcontactforceevent_free: Vw,
    __wbg_rawcontactmanifold_free: il,
    __wbg_rawcontactpair_free: bh,
    __wbg_rawdebugrenderpipeline_free: Lw,
    __wbg_rawdeserializedworld_free: gd,
    __wbg_rawdynamicraycastvehiclecontroller_free: Mn,
    __wbg_raweventqueue_free: Bw,
    __wbg_rawgenericjoint_free: js,
    __wbg_rawimpulsejointset_free: $a,
    __wbg_rawintegrationparameters_free: ss,
    __wbg_rawislandmanager_free: xs,
    __wbg_rawkinematiccharactercontroller_free: Ni,
    __wbg_rawmultibodyjointset_free: Us,
    __wbg_rawnarrowphase_free: Zc,
    __wbg_rawphysicspipeline_free: td,
    __wbg_rawpidcontroller_free: Rn,
    __wbg_rawpointcolliderprojection_free: Fl,
    __wbg_rawpointprojection_free: jl,
    __wbg_rawquerypipeline_free: th,
    __wbg_rawraycolliderhit_free: Ll,
    __wbg_rawraycolliderintersection_free: gh,
    __wbg_rawrayintersection_free: Dl,
    __wbg_rawrigidbodyset_free: u_,
    __wbg_rawrotation_free: yh,
    __wbg_rawsdpmatrix3_free: mh,
    __wbg_rawserializationpipeline_free: Id,
    __wbg_rawshape_free: Nl,
    __wbg_rawshapecasthit_free: uw,
    __wbg_rawshapecontact_free: Yc,
    __wbg_rawvector_free: fh,
    __wbindgen_add_to_stack_pointer: vh,
    __wbindgen_export_0: Sh,
    __wbindgen_export_1: Rh,
    __wbindgen_export_2: Ch,
    memory: Di,
    rawbroadphase_new: R_,
    rawccdsolver_new: za,
    rawcharactercollision_handle: un,
    rawcharactercollision_new: pn,
    rawcharactercollision_toi: mn,
    rawcharactercollision_translationDeltaApplied: gn,
    rawcharactercollision_translationDeltaRemaining: bn,
    rawcharactercollision_worldNormal1: Sn,
    rawcharactercollision_worldNormal2: vn,
    rawcharactercollision_worldWitness1: fn,
    rawcharactercollision_worldWitness2: yn,
    rawcolliderset_coActiveCollisionTypes: hc,
    rawcolliderset_coActiveEvents: pc,
    rawcolliderset_coActiveHooks: dc,
    rawcolliderset_coCastCollider: mc,
    rawcolliderset_coCastRay: Cc,
    rawcolliderset_coCastRayAndGetNormal: xc,
    rawcolliderset_coCastShape: bc,
    rawcolliderset_coCollisionGroups: lc,
    rawcolliderset_coCombineVoxelStates: O_,
    rawcolliderset_coContactCollider: Sc,
    rawcolliderset_coContactForceEventThreshold: uc,
    rawcolliderset_coContactShape: yc,
    rawcolliderset_coContactSkin: nc,
    rawcolliderset_coContainsPoint: gc,
    rawcolliderset_coDensity: oc,
    rawcolliderset_coFriction: ac,
    rawcolliderset_coFrictionCombineRule: Ec,
    rawcolliderset_coHalfExtents: T_,
    rawcolliderset_coHalfHeight: D_,
    rawcolliderset_coHalfspaceNormal: z_,
    rawcolliderset_coHeightFieldFlags: K_,
    rawcolliderset_coHeightfieldHeights: Y_,
    rawcolliderset_coHeightfieldNCols: Q_,
    rawcolliderset_coHeightfieldNRows: $_,
    rawcolliderset_coHeightfieldScale: Z_,
    rawcolliderset_coIndices: X_,
    rawcolliderset_coIntersectsRay: Rc,
    rawcolliderset_coIntersectsShape: fc,
    rawcolliderset_coIsEnabled: rc,
    rawcolliderset_coIsSensor: P_,
    rawcolliderset_coMass: _c,
    rawcolliderset_coParent: tc,
    rawcolliderset_coProjectPoint: vc,
    rawcolliderset_coPropagateVoxelChange: V_,
    rawcolliderset_coRadius: k_,
    rawcolliderset_coRestitution: sc,
    rawcolliderset_coRestitutionCombineRule: Fc,
    rawcolliderset_coRotation: x_,
    rawcolliderset_coRoundRadius: N_,
    rawcolliderset_coSetActiveCollisionTypes: Dc,
    rawcolliderset_coSetActiveEvents: Hc,
    rawcolliderset_coSetActiveHooks: kc,
    rawcolliderset_coSetCollisionGroups: Tc,
    rawcolliderset_coSetContactForceEventThreshold: Nc,
    rawcolliderset_coSetContactSkin: ic,
    rawcolliderset_coSetDensity: Gc,
    rawcolliderset_coSetEnabled: ec,
    rawcolliderset_coSetFriction: jc,
    rawcolliderset_coSetFrictionCombineRule: Pc,
    rawcolliderset_coSetHalfExtents: M_,
    rawcolliderset_coSetHalfHeight: L_,
    rawcolliderset_coSetMass: Wc,
    rawcolliderset_coSetMassProperties: qc,
    rawcolliderset_coSetRadius: H_,
    rawcolliderset_coSetRestitution: Ac,
    rawcolliderset_coSetRestitutionCombineRule: zc,
    rawcolliderset_coSetRotation: j_,
    rawcolliderset_coSetRotationWrtParent: E_,
    rawcolliderset_coSetRoundRadius: G_,
    rawcolliderset_coSetSensor: Ic,
    rawcolliderset_coSetShape: Lc,
    rawcolliderset_coSetSolverGroups: Mc,
    rawcolliderset_coSetTranslation: I_,
    rawcolliderset_coSetTranslationWrtParent: A_,
    rawcolliderset_coSetVoxel: B_,
    rawcolliderset_coShapeType: F_,
    rawcolliderset_coSolverGroups: wc,
    rawcolliderset_coTranslation: C_,
    rawcolliderset_coTriMeshFlags: J_,
    rawcolliderset_coVertices: U_,
    rawcolliderset_coVolume: cc,
    rawcolliderset_coVoxelData: W_,
    rawcolliderset_coVoxelSize: q_,
    rawcolliderset_contains: Uc,
    rawcolliderset_createCollider: Xc,
    rawcolliderset_forEachColliderHandle: Kc,
    rawcolliderset_isHandleValid: Pd,
    rawcolliderset_len: Oc,
    rawcolliderset_new: Vc,
    rawcolliderset_remove: Jc,
    rawcollidershapecasthit_colliderHandle: Bd,
    rawcollidershapecasthit_normal1: lh,
    rawcollidershapecasthit_normal2: wh,
    rawcollidershapecasthit_time_of_impact: yw,
    rawcollidershapecasthit_witness1: Sw,
    rawcollidershapecasthit_witness2: vw,
    rawcontactforceevent_collider1: Zd,
    rawcontactforceevent_collider2: Ow,
    rawcontactforceevent_max_force_direction: Jw,
    rawcontactforceevent_max_force_magnitude: Kw,
    rawcontactforceevent_total_force: Uw,
    rawcontactforceevent_total_force_magnitude: Xw,
    rawcontactmanifold_contact_dist: gl,
    rawcontactmanifold_contact_fid1: bl,
    rawcontactmanifold_contact_fid2: ml,
    rawcontactmanifold_contact_impulse: fl,
    rawcontactmanifold_contact_local_p1: pl,
    rawcontactmanifold_contact_local_p2: ul,
    rawcontactmanifold_contact_tangent_impulse_x: yl,
    rawcontactmanifold_contact_tangent_impulse_y: Sl,
    rawcontactmanifold_local_n1: cl,
    rawcontactmanifold_local_n2: ll,
    rawcontactmanifold_normal: _l,
    rawcontactmanifold_num_contacts: hl,
    rawcontactmanifold_num_solver_contacts: vl,
    rawcontactmanifold_solver_contact_dist: Cl,
    rawcontactmanifold_solver_contact_friction: xl,
    rawcontactmanifold_solver_contact_point: Rl,
    rawcontactmanifold_solver_contact_restitution: Il,
    rawcontactmanifold_solver_contact_tangent_velocity: Al,
    rawcontactmanifold_subshape1: wl,
    rawcontactmanifold_subshape2: dl,
    rawcontactpair_collider1: nl,
    rawcontactpair_collider2: al,
    rawcontactpair_contactManifold: ol,
    rawcontactpair_numContactManifolds: sl,
    rawdebugrenderpipeline_colors: Ww,
    rawdebugrenderpipeline_new: Nw,
    rawdebugrenderpipeline_render: qw,
    rawdebugrenderpipeline_vertices: Gw,
    rawdeserializedworld_takeBodies: vd,
    rawdeserializedworld_takeBroadPhase: yd,
    rawdeserializedworld_takeColliders: Rd,
    rawdeserializedworld_takeGravity: bd,
    rawdeserializedworld_takeImpulseJoints: Cd,
    rawdeserializedworld_takeIntegrationParameters: md,
    rawdeserializedworld_takeIslandManager: fd,
    rawdeserializedworld_takeMultibodyJoints: xd,
    rawdeserializedworld_takeNarrowPhase: Sd,
    rawdynamicraycastvehiclecontroller_add_wheel: qn,
    rawdynamicraycastvehiclecontroller_chassis: Dn,
    rawdynamicraycastvehiclecontroller_current_vehicle_speed: Hn,
    rawdynamicraycastvehiclecontroller_index_forward_axis: Gn,
    rawdynamicraycastvehiclecontroller_index_up_axis: Ln,
    rawdynamicraycastvehiclecontroller_new: kn,
    rawdynamicraycastvehiclecontroller_num_wheels: Bn,
    rawdynamicraycastvehiclecontroller_set_index_forward_axis: Wn,
    rawdynamicraycastvehiclecontroller_set_index_up_axis: Nn,
    rawdynamicraycastvehiclecontroller_set_wheel_axle_cs: ga,
    rawdynamicraycastvehiclecontroller_set_wheel_brake: _a,
    rawdynamicraycastvehiclecontroller_set_wheel_chassis_connection_point_cs: Un,
    rawdynamicraycastvehiclecontroller_set_wheel_direction_cs: pa,
    rawdynamicraycastvehiclecontroller_set_wheel_engine_force: da,
    rawdynamicraycastvehiclecontroller_set_wheel_friction_slip: ma,
    rawdynamicraycastvehiclecontroller_set_wheel_max_suspension_force: sa,
    rawdynamicraycastvehiclecontroller_set_wheel_max_suspension_travel: Yn,
    rawdynamicraycastvehiclecontroller_set_wheel_radius: $n,
    rawdynamicraycastvehiclecontroller_set_wheel_side_friction_stiffness: ya,
    rawdynamicraycastvehiclecontroller_set_wheel_steering: la,
    rawdynamicraycastvehiclecontroller_set_wheel_suspension_compression: ra,
    rawdynamicraycastvehiclecontroller_set_wheel_suspension_relaxation: na,
    rawdynamicraycastvehiclecontroller_set_wheel_suspension_rest_length: Jn,
    rawdynamicraycastvehiclecontroller_set_wheel_suspension_stiffness: ta,
    rawdynamicraycastvehiclecontroller_update_vehicle: Vn,
    rawdynamicraycastvehiclecontroller_wheel_axle_cs: ua,
    rawdynamicraycastvehiclecontroller_wheel_brake: oa,
    rawdynamicraycastvehiclecontroller_wheel_chassis_connection_point_cs: On,
    rawdynamicraycastvehiclecontroller_wheel_contact_normal_ws: xa,
    rawdynamicraycastvehiclecontroller_wheel_contact_point_ws: Ia,
    rawdynamicraycastvehiclecontroller_wheel_direction_cs: ha,
    rawdynamicraycastvehiclecontroller_wheel_engine_force: wa,
    rawdynamicraycastvehiclecontroller_wheel_forward_impulse: va,
    rawdynamicraycastvehiclecontroller_wheel_friction_slip: ba,
    rawdynamicraycastvehiclecontroller_wheel_ground_object: Pa,
    rawdynamicraycastvehiclecontroller_wheel_hard_point_ws: ja,
    rawdynamicraycastvehiclecontroller_wheel_is_in_contact: Ea,
    rawdynamicraycastvehiclecontroller_wheel_max_suspension_force: aa,
    rawdynamicraycastvehiclecontroller_wheel_max_suspension_travel: Kn,
    rawdynamicraycastvehiclecontroller_wheel_radius: Zn,
    rawdynamicraycastvehiclecontroller_wheel_rotation: Sa,
    rawdynamicraycastvehiclecontroller_wheel_side_friction_stiffness: fa,
    rawdynamicraycastvehiclecontroller_wheel_side_impulse: Ra,
    rawdynamicraycastvehiclecontroller_wheel_steering: ca,
    rawdynamicraycastvehiclecontroller_wheel_suspension_compression: ea,
    rawdynamicraycastvehiclecontroller_wheel_suspension_force: Ca,
    rawdynamicraycastvehiclecontroller_wheel_suspension_length: Aa,
    rawdynamicraycastvehiclecontroller_wheel_suspension_relaxation: ia,
    rawdynamicraycastvehiclecontroller_wheel_suspension_rest_length: Xn,
    rawdynamicraycastvehiclecontroller_wheel_suspension_stiffness: Qn,
    raweventqueue_clear: Qw,
    raweventqueue_drainCollisionEvents: Zw,
    raweventqueue_drainContactForceEvents: $w,
    raweventqueue_new: Yw,
    rawgenericjoint_fixed: Ms,
    rawgenericjoint_generic: Es,
    rawgenericjoint_prismatic: Ts,
    rawgenericjoint_revolute: ks,
    rawgenericjoint_rope: Fs,
    rawgenericjoint_spherical: zs,
    rawgenericjoint_spring: Ps,
    rawimpulsejointset_contains: is,
    rawimpulsejointset_createJoint: ts,
    rawimpulsejointset_forEachJointAttachedToRigidBody: as,
    rawimpulsejointset_forEachJointHandle: ns,
    rawimpulsejointset_jointAnchor1: La,
    rawimpulsejointset_jointAnchor2: Na,
    rawimpulsejointset_jointBodyHandle1: Ma,
    rawimpulsejointset_jointBodyHandle2: ka,
    rawimpulsejointset_jointConfigureMotor: Za,
    rawimpulsejointset_jointConfigureMotorModel: Ja,
    rawimpulsejointset_jointConfigureMotorPosition: Ya,
    rawimpulsejointset_jointConfigureMotorVelocity: Ka,
    rawimpulsejointset_jointContactsEnabled: qa,
    rawimpulsejointset_jointFrameX1: Ha,
    rawimpulsejointset_jointFrameX2: Da,
    rawimpulsejointset_jointLimitsEnabled: Va,
    rawimpulsejointset_jointLimitsMax: Ua,
    rawimpulsejointset_jointLimitsMin: Oa,
    rawimpulsejointset_jointSetAnchor1: Ga,
    rawimpulsejointset_jointSetAnchor2: Wa,
    rawimpulsejointset_jointSetContactsEnabled: Ba,
    rawimpulsejointset_jointSetLimits: Xa,
    rawimpulsejointset_jointType: Ta,
    rawimpulsejointset_len: rs,
    rawimpulsejointset_new: Qa,
    rawimpulsejointset_remove: es,
    rawintegrationparameters_contact_erp: cs,
    rawintegrationparameters_dt: _s,
    rawintegrationparameters_lengthUnit: hs,
    rawintegrationparameters_maxCcdSubsteps: ds,
    rawintegrationparameters_minIslandSize: ws,
    rawintegrationparameters_new: os,
    rawintegrationparameters_normalizedAllowedLinearError: zd,
    rawintegrationparameters_normalizedPredictionDistance: $d,
    rawintegrationparameters_numAdditionalFrictionIterations: Td,
    rawintegrationparameters_numInternalPgsIterations: Md,
    rawintegrationparameters_numSolverIterations: ls,
    rawintegrationparameters_set_contact_natural_frequency: us,
    rawintegrationparameters_set_dt: ps,
    rawintegrationparameters_set_lengthUnit: Ss,
    rawintegrationparameters_set_maxCcdSubsteps: ys,
    rawintegrationparameters_set_minIslandSize: fs,
    rawintegrationparameters_set_normalizedAllowedLinearError: gs,
    rawintegrationparameters_set_normalizedPredictionDistance: bs,
    rawintegrationparameters_set_numAdditionalFrictionIterations: hh,
    rawintegrationparameters_set_numInternalPgsIterations: ph,
    rawintegrationparameters_set_numSolverIterations: ms,
    rawintegrationparameters_switchToSmallStepsPgsSolver: Rs,
    rawintegrationparameters_switchToSmallStepsPgsSolverWithoutWarmstart: Cs,
    rawintegrationparameters_switchToStandardPgsSolver: vs,
    rawislandmanager_forEachActiveRigidBodyHandle: As,
    rawislandmanager_new: Is,
    rawkinematiccharactercontroller_autostepEnabled: Yi,
    rawkinematiccharactercontroller_autostepIncludesDynamicBodies: Ki,
    rawkinematiccharactercontroller_autostepMaxHeight: Xi,
    rawkinematiccharactercontroller_autostepMinWidth: Ji,
    rawkinematiccharactercontroller_computeColliderMovement: _n,
    rawkinematiccharactercontroller_computedCollision: dn,
    rawkinematiccharactercontroller_computedGrounded: ln,
    rawkinematiccharactercontroller_computedMovement: cn,
    rawkinematiccharactercontroller_disableAutostep: $i,
    rawkinematiccharactercontroller_disableSnapToGround: sn,
    rawkinematiccharactercontroller_enableAutostep: Zi,
    rawkinematiccharactercontroller_enableSnapToGround: an,
    rawkinematiccharactercontroller_maxSlopeClimbAngle: Qi,
    rawkinematiccharactercontroller_minSlopeSlideAngle: en,
    rawkinematiccharactercontroller_new: Gi,
    rawkinematiccharactercontroller_normalNudgeFactor: qi,
    rawkinematiccharactercontroller_numComputedCollisions: wn,
    rawkinematiccharactercontroller_offset: Fd,
    rawkinematiccharactercontroller_setMaxSlopeClimbAngle: tn,
    rawkinematiccharactercontroller_setMinSlopeSlideAngle: rn,
    rawkinematiccharactercontroller_setNormalNudgeFactor: Bi,
    rawkinematiccharactercontroller_setOffset: Vi,
    rawkinematiccharactercontroller_setSlideEnabled: Ui,
    rawkinematiccharactercontroller_setUp: Wi,
    rawkinematiccharactercontroller_slideEnabled: Oi,
    rawkinematiccharactercontroller_snapToGroundDistance: nn,
    rawkinematiccharactercontroller_snapToGroundEnabled: on,
    rawkinematiccharactercontroller_up: ih,
    rawmultibodyjointset_contains: Ys,
    rawmultibodyjointset_createJoint: Js,
    rawmultibodyjointset_forEachJointAttachedToRigidBody: $s,
    rawmultibodyjointset_forEachJointHandle: Zs,
    rawmultibodyjointset_jointAnchor1: Ns,
    rawmultibodyjointset_jointAnchor2: Gs,
    rawmultibodyjointset_jointContactsEnabled: Ws,
    rawmultibodyjointset_jointFrameX1: Ds,
    rawmultibodyjointset_jointFrameX2: Ls,
    rawmultibodyjointset_jointLimitsEnabled: Bs,
    rawmultibodyjointset_jointLimitsMax: Os,
    rawmultibodyjointset_jointLimitsMin: Vs,
    rawmultibodyjointset_jointSetContactsEnabled: qs,
    rawmultibodyjointset_jointType: Hs,
    rawmultibodyjointset_new: Xs,
    rawmultibodyjointset_remove: Ks,
    rawnarrowphase_contact_pair: tl,
    rawnarrowphase_contact_pairs_with: Qc,
    rawnarrowphase_intersection_pair: rl,
    rawnarrowphase_intersection_pairs_with: el,
    rawnarrowphase_new: $c,
    rawphysicspipeline_new: ed,
    rawphysicspipeline_step: rd,
    rawphysicspipeline_stepWithEvents: id,
    rawpidcontroller_angular_correction: Tn,
    rawpidcontroller_apply_angular_correction: Fn,
    rawpidcontroller_apply_linear_correction: Pn,
    rawpidcontroller_linear_correction: zn,
    rawpidcontroller_new: Cn,
    rawpidcontroller_reset_integrals: En,
    rawpidcontroller_set_axes_mask: jn,
    rawpidcontroller_set_kd: An,
    rawpidcontroller_set_ki: In,
    rawpidcontroller_set_kp: xn,
    rawpointcolliderprojection_colliderHandle: zl,
    rawpointcolliderprojection_featureId: Hl,
    rawpointcolliderprojection_featureType: kl,
    rawpointcolliderprojection_isInside: Ml,
    rawpointcolliderprojection_point: Tl,
    rawpointprojection_isInside: Pl,
    rawpointprojection_point: El,
    rawquerypipeline_castRay: sd,
    rawquerypipeline_castRayAndGetNormal: od,
    rawquerypipeline_castShape: hd,
    rawquerypipeline_collidersWithAabbIntersectingAabb: ud,
    rawquerypipeline_intersectionWithShape: cd,
    rawquerypipeline_intersectionsWithPoint: dd,
    rawquerypipeline_intersectionsWithRay: _d,
    rawquerypipeline_intersectionsWithShape: pd,
    rawquerypipeline_new: nd,
    rawquerypipeline_projectPoint: ld,
    rawquerypipeline_projectPointAndGetFeature: wd,
    rawquerypipeline_update: ad,
    rawraycolliderhit_colliderHandle: Wd,
    rawraycolliderhit_timeOfImpact: Vd,
    rawraycolliderintersection_colliderHandle: Ld,
    rawraycolliderintersection_featureId: rh,
    rawraycolliderintersection_featureType: Gd,
    rawraycolliderintersection_normal: _h,
    rawraycolliderintersection_time_of_impact: qd,
    rawrayintersection_featureId: eh,
    rawrayintersection_featureType: Dd,
    rawrayintersection_normal: oh,
    rawrayintersection_time_of_impact: Nd,
    rawrigidbodyset_contains: f_,
    rawrigidbodyset_createRigidBody: b_,
    rawrigidbodyset_forEachRigidBodyHandle: y_,
    rawrigidbodyset_len: kd,
    rawrigidbodyset_new: g_,
    rawrigidbodyset_propagateModifiedBodyPositionsToColliders: S_,
    rawrigidbodyset_rbAddForce: i_,
    rawrigidbodyset_rbAddForceAtPoint: o_,
    rawrigidbodyset_rbAddTorque: a_,
    rawrigidbodyset_rbAdditionalSolverIterations: c_,
    rawrigidbodyset_rbAngularDamping: Jo,
    rawrigidbodyset_rbAngvel: bo,
    rawrigidbodyset_rbApplyImpulse: n_,
    rawrigidbodyset_rbApplyImpulseAtPoint: __,
    rawrigidbodyset_rbApplyTorqueImpulse: s_,
    rawrigidbodyset_rbBodyType: qo,
    rawrigidbodyset_rbCollider: Wo,
    rawrigidbodyset_rbDominanceGroup: Ro,
    rawrigidbodyset_rbEffectiveAngularInertia: Ho,
    rawrigidbodyset_rbEffectiveInvMass: Eo,
    rawrigidbodyset_rbEffectiveWorldInvInertiaSqrt: ko,
    rawrigidbodyset_rbEnableCcd: xo,
    rawrigidbodyset_rbGravityScale: Qo,
    rawrigidbodyset_rbInvMass: jo,
    rawrigidbodyset_rbInvPrincipalInertiaSqrt: zo,
    rawrigidbodyset_rbIsCcdEnabled: Lo,
    rawrigidbodyset_rbIsDynamic: Uo,
    rawrigidbodyset_rbIsEnabled: $o,
    rawrigidbodyset_rbIsFixed: Vo,
    rawrigidbodyset_rbIsKinematic: Oo,
    rawrigidbodyset_rbIsMoving: io,
    rawrigidbodyset_rbIsSleeping: ro,
    rawrigidbodyset_rbLinearDamping: Xo,
    rawrigidbodyset_rbLinvel: go,
    rawrigidbodyset_rbLocalCom: Po,
    rawrigidbodyset_rbLockRotations: So,
    rawrigidbodyset_rbLockTranslations: fo,
    rawrigidbodyset_rbMass: Ao,
    rawrigidbodyset_rbNextRotation: ao,
    rawrigidbodyset_rbNextTranslation: no,
    rawrigidbodyset_rbNumColliders: Go,
    rawrigidbodyset_rbPrincipalInertia: Mo,
    rawrigidbodyset_rbPrincipalInertiaLocalFrame: To,
    rawrigidbodyset_rbRecomputeMassPropertiesFromColliders: ho,
    rawrigidbodyset_rbResetForces: e_,
    rawrigidbodyset_rbResetTorques: r_,
    rawrigidbodyset_rbRotation: to,
    rawrigidbodyset_rbSetAdditionalMass: po,
    rawrigidbodyset_rbSetAdditionalMassProperties: uo,
    rawrigidbodyset_rbSetAdditionalSolverIterations: l_,
    rawrigidbodyset_rbSetAngularDamping: Yo,
    rawrigidbodyset_rbSetAngvel: co,
    rawrigidbodyset_rbSetBodyType: Bo,
    rawrigidbodyset_rbSetDominanceGroup: Co,
    rawrigidbodyset_rbSetEnabled: Zo,
    rawrigidbodyset_rbSetEnabledRotations: vo,
    rawrigidbodyset_rbSetEnabledTranslations: yo,
    rawrigidbodyset_rbSetGravityScale: t_,
    rawrigidbodyset_rbSetLinearDamping: Ko,
    rawrigidbodyset_rbSetLinvel: _o,
    rawrigidbodyset_rbSetNextKinematicRotation: wo,
    rawrigidbodyset_rbSetNextKinematicTranslation: lo,
    rawrigidbodyset_rbSetRotation: oo,
    rawrigidbodyset_rbSetSoftCcdPrediction: Io,
    rawrigidbodyset_rbSetTranslation: so,
    rawrigidbodyset_rbSetUserData: d_,
    rawrigidbodyset_rbSleep: eo,
    rawrigidbodyset_rbSoftCcdPrediction: No,
    rawrigidbodyset_rbTranslation: Qs,
    rawrigidbodyset_rbUserData: w_,
    rawrigidbodyset_rbUserForce: h_,
    rawrigidbodyset_rbUserTorque: p_,
    rawrigidbodyset_rbVelocityAtPoint: mo,
    rawrigidbodyset_rbWakeUp: Do,
    rawrigidbodyset_rbWorldCom: Fo,
    rawrigidbodyset_remove: m_,
    rawrotation_identity: Cw,
    rawrotation_new: Rw,
    rawrotation_w: Iw,
    rawrotation_x: xw,
    rawrotation_y: Ud,
    rawrotation_z: Xd,
    rawsdpmatrix3_elements: Dw,
    rawserializationpipeline_deserializeAll: Ed,
    rawserializationpipeline_new: Ad,
    rawserializationpipeline_serializeAll: jd,
    rawshape_ball: ql,
    rawshape_capsule: Vl,
    rawshape_castRay: hw,
    rawshape_castRayAndGetNormal: pw,
    rawshape_castShape: ow,
    rawshape_cone: Xl,
    rawshape_contactShape: cw,
    rawshape_containsPoint: lw,
    rawshape_convexHull: iw,
    rawshape_convexMesh: aw,
    rawshape_cuboid: Gl,
    rawshape_cylinder: Ol,
    rawshape_halfspace: Bl,
    rawshape_heightfield: Ql,
    rawshape_intersectsRay: dw,
    rawshape_intersectsShape: _w,
    rawshape_polyline: Zl,
    rawshape_projectPoint: ww,
    rawshape_roundCone: Jl,
    rawshape_roundConvexHull: nw,
    rawshape_roundConvexMesh: sw,
    rawshape_roundCuboid: Wl,
    rawshape_roundCylinder: Ul,
    rawshape_roundTriangle: rw,
    rawshape_segment: tw,
    rawshape_triangle: ew,
    rawshape_trimesh: $l,
    rawshape_voxels: Kl,
    rawshape_voxelsFromPoints: Yl,
    rawshapecasthit_normal1: bw,
    rawshapecasthit_normal2: mw,
    rawshapecasthit_time_of_impact: Od,
    rawshapecasthit_witness1: gw,
    rawshapecasthit_witness2: dh,
    rawshapecontact_distance: Hd,
    rawshapecontact_normal1: ch,
    rawshapecontact_normal2: nh,
    rawshapecontact_point1: ah,
    rawshapecontact_point2: sh,
    rawvector_new: jw,
    rawvector_set_x: Ew,
    rawvector_set_y: uh,
    rawvector_set_z: Pw,
    rawvector_x: Jd,
    rawvector_xyz: Fw,
    rawvector_xzy: Mw,
    rawvector_y: Kd,
    rawvector_yxz: zw,
    rawvector_yzx: kw,
    rawvector_z: Yd,
    rawvector_zero: Aw,
    rawvector_zxy: Tw,
    rawvector_zyx: Hw,
    reserve_memory: Qd,
    version: Li
  }, Symbol.toStringTag, {
    value: "Module"
  }));
  ti(xh);
  fr = class {
    constructor(t, e, r) {
      this.x = t, this.y = e, this.z = r;
    }
  };
  w = class {
    static new(t, e, r) {
      return new fr(t, e, r);
    }
    static intoRaw(t) {
      return new l(t.x, t.y, t.z);
    }
    static zeros() {
      return w.new(0, 0, 0);
    }
    static fromRaw(t) {
      if (!t) return null;
      let e = w.new(t.x, t.y, t.z);
      return t.free(), e;
    }
    static copy(t, e) {
      t.x = e.x, t.y = e.y, t.z = e.z;
    }
  };
  ne = class {
    constructor(t, e, r, a) {
      this.x = t, this.y = e, this.z = r, this.w = a;
    }
  };
  S = class {
    static identity() {
      return new ne(0, 0, 0, 1);
    }
    static fromRaw(t) {
      if (!t) return null;
      let e = new ne(t.x, t.y, t.z, t.w);
      return t.free(), e;
    }
    static intoRaw(t) {
      return new v(t.x, t.y, t.z, t.w);
    }
    static copy(t, e) {
      t.x = e.x, t.y = e.y, t.z = e.z, t.w = e.w;
    }
  };
  yr = class {
    get m11() {
      return this.elements[0];
    }
    get m12() {
      return this.elements[1];
    }
    get m21() {
      return this.m12;
    }
    get m13() {
      return this.elements[2];
    }
    get m31() {
      return this.m13;
    }
    get m22() {
      return this.elements[3];
    }
    get m23() {
      return this.elements[4];
    }
    get m32() {
      return this.m23;
    }
    get m33() {
      return this.elements[5];
    }
    constructor(t) {
      this.elements = t;
    }
  };
  ae = class {
    static fromRaw(t) {
      const e = new yr(t.elements());
      return t.free(), e;
    }
  };
  (function(s) {
    s[s.Dynamic = 0] = "Dynamic", s[s.Fixed = 1] = "Fixed", s[s.KinematicPositionBased = 2] = "KinematicPositionBased", s[s.KinematicVelocityBased = 3] = "KinematicVelocityBased";
  })(B || (B = {}));
  se = class {
    constructor(t, e, r) {
      this.rawSet = t, this.colliderSet = e, this.handle = r;
    }
    finalizeDeserialization(t) {
      this.colliderSet = t;
    }
    isValid() {
      return this.rawSet.contains(this.handle);
    }
    lockTranslations(t, e) {
      return this.rawSet.rbLockTranslations(this.handle, t, e);
    }
    lockRotations(t, e) {
      return this.rawSet.rbLockRotations(this.handle, t, e);
    }
    setEnabledTranslations(t, e, r, a) {
      return this.rawSet.rbSetEnabledTranslations(this.handle, t, e, r, a);
    }
    restrictTranslations(t, e, r, a) {
      this.setEnabledTranslations(t, e, r, a);
    }
    setEnabledRotations(t, e, r, a) {
      return this.rawSet.rbSetEnabledRotations(this.handle, t, e, r, a);
    }
    restrictRotations(t, e, r, a) {
      this.setEnabledRotations(t, e, r, a);
    }
    dominanceGroup() {
      return this.rawSet.rbDominanceGroup(this.handle);
    }
    setDominanceGroup(t) {
      this.rawSet.rbSetDominanceGroup(this.handle, t);
    }
    additionalSolverIterations() {
      return this.rawSet.rbAdditionalSolverIterations(this.handle);
    }
    setAdditionalSolverIterations(t) {
      this.rawSet.rbSetAdditionalSolverIterations(this.handle, t);
    }
    enableCcd(t) {
      this.rawSet.rbEnableCcd(this.handle, t);
    }
    setSoftCcdPrediction(t) {
      this.rawSet.rbSetSoftCcdPrediction(this.handle, t);
    }
    softCcdPrediction() {
      return this.rawSet.rbSoftCcdPrediction(this.handle);
    }
    translation() {
      let t = this.rawSet.rbTranslation(this.handle);
      return w.fromRaw(t);
    }
    rotation() {
      let t = this.rawSet.rbRotation(this.handle);
      return S.fromRaw(t);
    }
    nextTranslation() {
      let t = this.rawSet.rbNextTranslation(this.handle);
      return w.fromRaw(t);
    }
    nextRotation() {
      let t = this.rawSet.rbNextRotation(this.handle);
      return S.fromRaw(t);
    }
    setTranslation(t, e) {
      this.rawSet.rbSetTranslation(this.handle, t.x, t.y, t.z, e);
    }
    setLinvel(t, e) {
      let r = w.intoRaw(t);
      this.rawSet.rbSetLinvel(this.handle, r, e), r.free();
    }
    gravityScale() {
      return this.rawSet.rbGravityScale(this.handle);
    }
    setGravityScale(t, e) {
      this.rawSet.rbSetGravityScale(this.handle, t, e);
    }
    setRotation(t, e) {
      this.rawSet.rbSetRotation(this.handle, t.x, t.y, t.z, t.w, e);
    }
    setAngvel(t, e) {
      let r = w.intoRaw(t);
      this.rawSet.rbSetAngvel(this.handle, r, e), r.free();
    }
    setNextKinematicTranslation(t) {
      this.rawSet.rbSetNextKinematicTranslation(this.handle, t.x, t.y, t.z);
    }
    setNextKinematicRotation(t) {
      this.rawSet.rbSetNextKinematicRotation(this.handle, t.x, t.y, t.z, t.w);
    }
    linvel() {
      return w.fromRaw(this.rawSet.rbLinvel(this.handle));
    }
    velocityAtPoint(t) {
      const e = w.intoRaw(t);
      let r = w.fromRaw(this.rawSet.rbVelocityAtPoint(this.handle, e));
      return e.free(), r;
    }
    angvel() {
      return w.fromRaw(this.rawSet.rbAngvel(this.handle));
    }
    mass() {
      return this.rawSet.rbMass(this.handle);
    }
    effectiveInvMass() {
      return w.fromRaw(this.rawSet.rbEffectiveInvMass(this.handle));
    }
    invMass() {
      return this.rawSet.rbInvMass(this.handle);
    }
    localCom() {
      return w.fromRaw(this.rawSet.rbLocalCom(this.handle));
    }
    worldCom() {
      return w.fromRaw(this.rawSet.rbWorldCom(this.handle));
    }
    invPrincipalInertiaSqrt() {
      return w.fromRaw(this.rawSet.rbInvPrincipalInertiaSqrt(this.handle));
    }
    principalInertia() {
      return w.fromRaw(this.rawSet.rbPrincipalInertia(this.handle));
    }
    principalInertiaLocalFrame() {
      return S.fromRaw(this.rawSet.rbPrincipalInertiaLocalFrame(this.handle));
    }
    effectiveWorldInvInertiaSqrt() {
      return ae.fromRaw(this.rawSet.rbEffectiveWorldInvInertiaSqrt(this.handle));
    }
    effectiveAngularInertia() {
      return ae.fromRaw(this.rawSet.rbEffectiveAngularInertia(this.handle));
    }
    sleep() {
      this.rawSet.rbSleep(this.handle);
    }
    wakeUp() {
      this.rawSet.rbWakeUp(this.handle);
    }
    isCcdEnabled() {
      return this.rawSet.rbIsCcdEnabled(this.handle);
    }
    numColliders() {
      return this.rawSet.rbNumColliders(this.handle);
    }
    collider(t) {
      return this.colliderSet.get(this.rawSet.rbCollider(this.handle, t));
    }
    setEnabled(t) {
      this.rawSet.rbSetEnabled(this.handle, t);
    }
    isEnabled() {
      return this.rawSet.rbIsEnabled(this.handle);
    }
    bodyType() {
      return this.rawSet.rbBodyType(this.handle);
    }
    setBodyType(t, e) {
      return this.rawSet.rbSetBodyType(this.handle, t, e);
    }
    isSleeping() {
      return this.rawSet.rbIsSleeping(this.handle);
    }
    isMoving() {
      return this.rawSet.rbIsMoving(this.handle);
    }
    isFixed() {
      return this.rawSet.rbIsFixed(this.handle);
    }
    isKinematic() {
      return this.rawSet.rbIsKinematic(this.handle);
    }
    isDynamic() {
      return this.rawSet.rbIsDynamic(this.handle);
    }
    linearDamping() {
      return this.rawSet.rbLinearDamping(this.handle);
    }
    angularDamping() {
      return this.rawSet.rbAngularDamping(this.handle);
    }
    setLinearDamping(t) {
      this.rawSet.rbSetLinearDamping(this.handle, t);
    }
    recomputeMassPropertiesFromColliders() {
      this.rawSet.rbRecomputeMassPropertiesFromColliders(this.handle, this.colliderSet.raw);
    }
    setAdditionalMass(t, e) {
      this.rawSet.rbSetAdditionalMass(this.handle, t, e);
    }
    setAdditionalMassProperties(t, e, r, a, o) {
      let _ = w.intoRaw(e), d = w.intoRaw(r), h = S.intoRaw(a);
      this.rawSet.rbSetAdditionalMassProperties(this.handle, t, _, d, h, o), _.free(), d.free(), h.free();
    }
    setAngularDamping(t) {
      this.rawSet.rbSetAngularDamping(this.handle, t);
    }
    resetForces(t) {
      this.rawSet.rbResetForces(this.handle, t);
    }
    resetTorques(t) {
      this.rawSet.rbResetTorques(this.handle, t);
    }
    addForce(t, e) {
      const r = w.intoRaw(t);
      this.rawSet.rbAddForce(this.handle, r, e), r.free();
    }
    applyImpulse(t, e) {
      const r = w.intoRaw(t);
      this.rawSet.rbApplyImpulse(this.handle, r, e), r.free();
    }
    addTorque(t, e) {
      const r = w.intoRaw(t);
      this.rawSet.rbAddTorque(this.handle, r, e), r.free();
    }
    applyTorqueImpulse(t, e) {
      const r = w.intoRaw(t);
      this.rawSet.rbApplyTorqueImpulse(this.handle, r, e), r.free();
    }
    addForceAtPoint(t, e, r) {
      const a = w.intoRaw(t), o = w.intoRaw(e);
      this.rawSet.rbAddForceAtPoint(this.handle, a, o, r), a.free(), o.free();
    }
    applyImpulseAtPoint(t, e, r) {
      const a = w.intoRaw(t), o = w.intoRaw(e);
      this.rawSet.rbApplyImpulseAtPoint(this.handle, a, o, r), a.free(), o.free();
    }
    userForce() {
      return w.fromRaw(this.rawSet.rbUserForce(this.handle));
    }
    userTorque() {
      return w.fromRaw(this.rawSet.rbUserTorque(this.handle));
    }
  };
  U = class {
    constructor(t) {
      this.enabled = true, this.status = t, this.translation = w.zeros(), this.rotation = S.identity(), this.gravityScale = 1, this.linvel = w.zeros(), this.mass = 0, this.massOnly = false, this.centerOfMass = w.zeros(), this.translationsEnabledX = true, this.translationsEnabledY = true, this.angvel = w.zeros(), this.principalAngularInertia = w.zeros(), this.angularInertiaLocalFrame = S.identity(), this.translationsEnabledZ = true, this.rotationsEnabledX = true, this.rotationsEnabledY = true, this.rotationsEnabledZ = true, this.linearDamping = 0, this.angularDamping = 0, this.canSleep = true, this.sleeping = false, this.ccdEnabled = false, this.softCcdPrediction = 0, this.dominanceGroup = 0, this.additionalSolverIterations = 0;
    }
    static dynamic() {
      return new U(B.Dynamic);
    }
    static kinematicPositionBased() {
      return new U(B.KinematicPositionBased);
    }
    static kinematicVelocityBased() {
      return new U(B.KinematicVelocityBased);
    }
    static fixed() {
      return new U(B.Fixed);
    }
    static newDynamic() {
      return new U(B.Dynamic);
    }
    static newKinematicPositionBased() {
      return new U(B.KinematicPositionBased);
    }
    static newKinematicVelocityBased() {
      return new U(B.KinematicVelocityBased);
    }
    static newStatic() {
      return new U(B.Fixed);
    }
    setDominanceGroup(t) {
      return this.dominanceGroup = t, this;
    }
    setAdditionalSolverIterations(t) {
      return this.additionalSolverIterations = t, this;
    }
    setEnabled(t) {
      return this.enabled = t, this;
    }
    setTranslation(t, e, r) {
      if (typeof t != "number" || typeof e != "number" || typeof r != "number") throw TypeError("The translation components must be numbers.");
      return this.translation = {
        x: t,
        y: e,
        z: r
      }, this;
    }
    setRotation(t) {
      return S.copy(this.rotation, t), this;
    }
    setGravityScale(t) {
      return this.gravityScale = t, this;
    }
    setAdditionalMass(t) {
      return this.mass = t, this.massOnly = true, this;
    }
    setLinvel(t, e, r) {
      if (typeof t != "number" || typeof e != "number" || typeof r != "number") throw TypeError("The linvel components must be numbers.");
      return this.linvel = {
        x: t,
        y: e,
        z: r
      }, this;
    }
    setAngvel(t) {
      return w.copy(this.angvel, t), this;
    }
    setAdditionalMassProperties(t, e, r, a) {
      return this.mass = t, w.copy(this.centerOfMass, e), w.copy(this.principalAngularInertia, r), S.copy(this.angularInertiaLocalFrame, a), this.massOnly = false, this;
    }
    enabledTranslations(t, e, r) {
      return this.translationsEnabledX = t, this.translationsEnabledY = e, this.translationsEnabledZ = r, this;
    }
    restrictTranslations(t, e, r) {
      return this.enabledTranslations(t, e, r);
    }
    lockTranslations() {
      return this.enabledTranslations(false, false, false);
    }
    enabledRotations(t, e, r) {
      return this.rotationsEnabledX = t, this.rotationsEnabledY = e, this.rotationsEnabledZ = r, this;
    }
    restrictRotations(t, e, r) {
      return this.enabledRotations(t, e, r);
    }
    lockRotations() {
      return this.restrictRotations(false, false, false);
    }
    setLinearDamping(t) {
      return this.linearDamping = t, this;
    }
    setAngularDamping(t) {
      return this.angularDamping = t, this;
    }
    setCanSleep(t) {
      return this.canSleep = t, this;
    }
    setSleeping(t) {
      return this.sleeping = t, this;
    }
    setCcdEnabled(t) {
      return this.ccdEnabled = t, this;
    }
    setSoftCcdPrediction(t) {
      return this.softCcdPrediction = t, this;
    }
    setUserData(t) {
      return this.userData = t, this;
    }
  };
  class Ht {
    constructor() {
      this.fconv = new Float64Array(1), this.uconv = new Uint32Array(this.fconv.buffer), this.data = new Array(), this.size = 0;
    }
    set(t, e) {
      let r = this.index(t);
      for (; this.data.length <= r; ) this.data.push(null);
      this.data[r] == null && (this.size += 1), this.data[r] = e;
    }
    len() {
      return this.size;
    }
    delete(t) {
      let e = this.index(t);
      e < this.data.length && (this.data[e] != null && (this.size -= 1), this.data[e] = null);
    }
    clear() {
      this.data = new Array();
    }
    get(t) {
      let e = this.index(t);
      return e < this.data.length ? this.data[e] : null;
    }
    forEach(t) {
      for (const e of this.data) e != null && t(e);
    }
    getAll() {
      return this.data.filter((t) => t != null);
    }
    index(t) {
      return this.fconv[0] = t, this.uconv[0];
    }
  }
  Sr = class {
    free() {
      this.raw && this.raw.free(), this.raw = void 0, this.map && this.map.clear(), this.map = void 0;
    }
    constructor(t) {
      this.raw = t || new j(), this.map = new Ht(), t && t.forEachRigidBodyHandle((e) => {
        this.map.set(e, new se(t, null, e));
      });
    }
    finalizeDeserialization(t) {
      this.map.forEach((e) => e.finalizeDeserialization(t));
    }
    createRigidBody(t, e) {
      let r = w.intoRaw(e.translation), a = S.intoRaw(e.rotation), o = w.intoRaw(e.linvel), _ = w.intoRaw(e.centerOfMass), d = w.intoRaw(e.angvel), h = w.intoRaw(e.principalAngularInertia), p = S.intoRaw(e.angularInertiaLocalFrame), u = this.raw.createRigidBody(e.enabled, r, a, e.gravityScale, e.mass, e.massOnly, _, o, d, h, p, e.translationsEnabledX, e.translationsEnabledY, e.translationsEnabledZ, e.rotationsEnabledX, e.rotationsEnabledY, e.rotationsEnabledZ, e.linearDamping, e.angularDamping, e.status, e.canSleep, e.sleeping, e.softCcdPrediction, e.ccdEnabled, e.dominanceGroup, e.additionalSolverIterations);
      r.free(), a.free(), o.free(), _.free(), d.free(), h.free(), p.free();
      const g = new se(this.raw, t, u);
      return g.userData = e.userData, this.map.set(u, g), g;
    }
    remove(t, e, r, a, o) {
      for (let _ = 0; _ < this.raw.rbNumColliders(t); _ += 1) r.unmap(this.raw.rbCollider(t, _));
      a.forEachJointHandleAttachedToRigidBody(t, (_) => a.unmap(_)), o.forEachJointHandleAttachedToRigidBody(t, (_) => o.unmap(_)), this.raw.remove(t, e.raw, r.raw, a.raw, o.raw), this.map.delete(t);
    }
    len() {
      return this.map.len();
    }
    contains(t) {
      return this.get(t) != null;
    }
    get(t) {
      return this.map.get(t);
    }
    forEach(t) {
      this.map.forEach(t);
    }
    forEachActiveRigidBody(t, e) {
      t.forEachActiveRigidBodyHandle((r) => {
        e(this.get(r));
      });
    }
    getAll() {
      return this.map.getAll();
    }
  };
  vr = class {
    constructor(t) {
      this.raw = t || new it();
    }
    free() {
      this.raw && this.raw.free(), this.raw = void 0;
    }
    get dt() {
      return this.raw.dt;
    }
    get contact_erp() {
      return this.raw.contact_erp;
    }
    get lengthUnit() {
      return this.raw.lengthUnit;
    }
    get normalizedAllowedLinearError() {
      return this.raw.normalizedAllowedLinearError;
    }
    get normalizedPredictionDistance() {
      return this.raw.normalizedPredictionDistance;
    }
    get numSolverIterations() {
      return this.raw.numSolverIterations;
    }
    get numAdditionalFrictionIterations() {
      return this.raw.numAdditionalFrictionIterations;
    }
    get numInternalPgsIterations() {
      return this.raw.numInternalPgsIterations;
    }
    get minIslandSize() {
      return this.raw.minIslandSize;
    }
    get maxCcdSubsteps() {
      return this.raw.maxCcdSubsteps;
    }
    set dt(t) {
      this.raw.dt = t;
    }
    set contact_natural_frequency(t) {
      this.raw.contact_natural_frequency = t;
    }
    set lengthUnit(t) {
      this.raw.lengthUnit = t;
    }
    set normalizedAllowedLinearError(t) {
      this.raw.normalizedAllowedLinearError = t;
    }
    set normalizedPredictionDistance(t) {
      this.raw.normalizedPredictionDistance = t;
    }
    set numSolverIterations(t) {
      this.raw.numSolverIterations = t;
    }
    set numAdditionalFrictionIterations(t) {
      this.raw.numAdditionalFrictionIterations = t;
    }
    set numInternalPgsIterations(t) {
      this.raw.numInternalPgsIterations = t;
    }
    set minIslandSize(t) {
      this.raw.minIslandSize = t;
    }
    set maxCcdSubsteps(t) {
      this.raw.maxCcdSubsteps = t;
    }
    switchToStandardPgsSolver() {
      this.raw.switchToStandardPgsSolver();
    }
    switchToSmallStepsPgsSolver() {
      this.raw.switchToSmallStepsPgsSolver();
    }
    switchToSmallStepsPgsSolverWithoutWarmstart() {
      this.raw.switchToSmallStepsPgsSolverWithoutWarmstart();
    }
  };
  (function(s) {
    s[s.Revolute = 0] = "Revolute", s[s.Fixed = 1] = "Fixed", s[s.Prismatic = 2] = "Prismatic", s[s.Rope = 3] = "Rope", s[s.Spring = 4] = "Spring", s[s.Spherical = 5] = "Spherical", s[s.Generic = 6] = "Generic";
  })(D || (D = {}));
  (function(s) {
    s[s.AccelerationBased = 0] = "AccelerationBased", s[s.ForceBased = 1] = "ForceBased";
  })(oe || (oe = {}));
  (function(s) {
    s[s.LinX = 1] = "LinX", s[s.LinY = 2] = "LinY", s[s.LinZ = 4] = "LinZ", s[s.AngX = 8] = "AngX", s[s.AngY = 16] = "AngY", s[s.AngZ = 32] = "AngZ";
  })(_e || (_e = {}));
  O = class {
    constructor(t, e, r) {
      this.rawSet = t, this.bodySet = e, this.handle = r;
    }
    static newTyped(t, e, r) {
      switch (t.jointType(r)) {
        case V.Revolute:
          return new Ar(t, e, r);
        case V.Prismatic:
          return new Ir(t, e, r);
        case V.Fixed:
          return new Rr(t, e, r);
        case V.Spring:
          return new xr(t, e, r);
        case V.Rope:
          return new Cr(t, e, r);
        case V.Spherical:
          return new Er(t, e, r);
        case V.Generic:
          return new jr(t, e, r);
        default:
          return new O(t, e, r);
      }
    }
    finalizeDeserialization(t) {
      this.bodySet = t;
    }
    isValid() {
      return this.rawSet.contains(this.handle);
    }
    body1() {
      return this.bodySet.get(this.rawSet.jointBodyHandle1(this.handle));
    }
    body2() {
      return this.bodySet.get(this.rawSet.jointBodyHandle2(this.handle));
    }
    type() {
      return this.rawSet.jointType(this.handle);
    }
    frameX1() {
      return S.fromRaw(this.rawSet.jointFrameX1(this.handle));
    }
    frameX2() {
      return S.fromRaw(this.rawSet.jointFrameX2(this.handle));
    }
    anchor1() {
      return w.fromRaw(this.rawSet.jointAnchor1(this.handle));
    }
    anchor2() {
      return w.fromRaw(this.rawSet.jointAnchor2(this.handle));
    }
    setAnchor1(t) {
      const e = w.intoRaw(t);
      this.rawSet.jointSetAnchor1(this.handle, e), e.free();
    }
    setAnchor2(t) {
      const e = w.intoRaw(t);
      this.rawSet.jointSetAnchor2(this.handle, e), e.free();
    }
    setContactsEnabled(t) {
      this.rawSet.jointSetContactsEnabled(this.handle, t);
    }
    contactsEnabled() {
      return this.rawSet.jointContactsEnabled(this.handle);
    }
  };
  Re = class extends O {
    limitsEnabled() {
      return this.rawSet.jointLimitsEnabled(this.handle, this.rawAxis());
    }
    limitsMin() {
      return this.rawSet.jointLimitsMin(this.handle, this.rawAxis());
    }
    limitsMax() {
      return this.rawSet.jointLimitsMax(this.handle, this.rawAxis());
    }
    setLimits(t, e) {
      this.rawSet.jointSetLimits(this.handle, this.rawAxis(), t, e);
    }
    configureMotorModel(t) {
      this.rawSet.jointConfigureMotorModel(this.handle, this.rawAxis(), t);
    }
    configureMotorVelocity(t, e) {
      this.rawSet.jointConfigureMotorVelocity(this.handle, this.rawAxis(), t, e);
    }
    configureMotorPosition(t, e, r) {
      this.rawSet.jointConfigureMotorPosition(this.handle, this.rawAxis(), t, e, r);
    }
    configureMotor(t, e, r, a) {
      this.rawSet.jointConfigureMotor(this.handle, this.rawAxis(), t, e, r, a);
    }
  };
  Rr = class extends O {
  };
  Cr = class extends O {
  };
  xr = class extends O {
  };
  Ir = class extends Re {
    rawAxis() {
      return Pt.LinX;
    }
  };
  Ar = class extends Re {
    rawAxis() {
      return Pt.AngX;
    }
  };
  jr = class extends O {
  };
  Er = class extends O {
  };
  X = class {
    constructor() {
    }
    static fixed(t, e, r, a) {
      let o = new X();
      return o.anchor1 = t, o.anchor2 = r, o.frame1 = e, o.frame2 = a, o.jointType = D.Fixed, o;
    }
    static spring(t, e, r, a, o) {
      let _ = new X();
      return _.anchor1 = a, _.anchor2 = o, _.length = t, _.stiffness = e, _.damping = r, _.jointType = D.Spring, _;
    }
    static rope(t, e, r) {
      let a = new X();
      return a.anchor1 = e, a.anchor2 = r, a.length = t, a.jointType = D.Rope, a;
    }
    static generic(t, e, r, a) {
      let o = new X();
      return o.anchor1 = t, o.anchor2 = e, o.axis = r, o.axesMask = a, o.jointType = D.Generic, o;
    }
    static spherical(t, e) {
      let r = new X();
      return r.anchor1 = t, r.anchor2 = e, r.jointType = D.Spherical, r;
    }
    static prismatic(t, e, r) {
      let a = new X();
      return a.anchor1 = t, a.anchor2 = e, a.axis = r, a.jointType = D.Prismatic, a;
    }
    static revolute(t, e, r) {
      let a = new X();
      return a.anchor1 = t, a.anchor2 = e, a.axis = r, a.jointType = D.Revolute, a;
    }
    intoRaw() {
      let t = w.intoRaw(this.anchor1), e = w.intoRaw(this.anchor2), r, a, o = false, _ = 0, d = 0;
      switch (this.jointType) {
        case D.Fixed:
          let h = S.intoRaw(this.frame1), p = S.intoRaw(this.frame2);
          a = H.fixed(t, h, e, p), h.free(), p.free();
          break;
        case D.Spring:
          a = H.spring(this.length, this.stiffness, this.damping, t, e);
          break;
        case D.Rope:
          a = H.rope(this.length, t, e);
          break;
        case D.Prismatic:
          r = w.intoRaw(this.axis), this.limitsEnabled && (o = true, _ = this.limits[0], d = this.limits[1]), a = H.prismatic(t, e, r, o, _, d), r.free();
          break;
        case D.Generic:
          r = w.intoRaw(this.axis);
          let u = this.axesMask;
          a = H.generic(t, e, r, u);
          break;
        case D.Spherical:
          a = H.spherical(t, e);
          break;
        case D.Revolute:
          r = w.intoRaw(this.axis), a = H.revolute(t, e, r), r.free();
          break;
      }
      return t.free(), e.free(), a;
    }
  };
  Pr = class {
    free() {
      this.raw && this.raw.free(), this.raw = void 0, this.map && this.map.clear(), this.map = void 0;
    }
    constructor(t) {
      this.raw = t || new J(), this.map = new Ht(), t && t.forEachJointHandle((e) => {
        this.map.set(e, O.newTyped(t, null, e));
      });
    }
    finalizeDeserialization(t) {
      this.map.forEach((e) => e.finalizeDeserialization(t));
    }
    createJoint(t, e, r, a, o) {
      const _ = e.intoRaw(), d = this.raw.createJoint(_, r, a, o);
      _.free();
      let h = O.newTyped(this.raw, t, d);
      return this.map.set(d, h), h;
    }
    remove(t, e) {
      this.raw.remove(t, e), this.unmap(t);
    }
    forEachJointHandleAttachedToRigidBody(t, e) {
      this.raw.forEachJointAttachedToRigidBody(t, e);
    }
    unmap(t) {
      this.map.delete(t);
    }
    len() {
      return this.map.len();
    }
    contains(t) {
      return this.get(t) != null;
    }
    get(t) {
      return this.map.get(t);
    }
    forEach(t) {
      this.map.forEach(t);
    }
    getAll() {
      return this.map.getAll();
    }
  };
  Q = class {
    constructor(t, e) {
      this.rawSet = t, this.handle = e;
    }
    static newTyped(t, e) {
      switch (t.jointType(e)) {
        case V.Revolute:
          return new Tr(t, e);
        case V.Prismatic:
          return new zr(t, e);
        case V.Fixed:
          return new Fr(t, e);
        case V.Spherical:
          return new Mr(t, e);
        default:
          return new Q(t, e);
      }
    }
    isValid() {
      return this.rawSet.contains(this.handle);
    }
    setContactsEnabled(t) {
      this.rawSet.jointSetContactsEnabled(this.handle, t);
    }
    contactsEnabled() {
      return this.rawSet.jointContactsEnabled(this.handle);
    }
  };
  Ce = class extends Q {
  };
  Fr = class extends Q {
  };
  zr = class extends Ce {
    rawAxis() {
      return Pt.LinX;
    }
  };
  Tr = class extends Ce {
    rawAxis() {
      return Pt.AngX;
    }
  };
  Mr = class extends Q {
  };
  kr = class {
    free() {
      this.raw && this.raw.free(), this.raw = void 0, this.map && this.map.clear(), this.map = void 0;
    }
    constructor(t) {
      this.raw = t || new Y(), this.map = new Ht(), t && t.forEachJointHandle((e) => {
        this.map.set(e, Q.newTyped(this.raw, e));
      });
    }
    createJoint(t, e, r, a) {
      const o = t.intoRaw(), _ = this.raw.createJoint(o, e, r, a);
      o.free();
      let d = Q.newTyped(this.raw, _);
      return this.map.set(_, d), d;
    }
    remove(t, e) {
      this.raw.remove(t, e), this.map.delete(t);
    }
    unmap(t) {
      this.map.delete(t);
    }
    len() {
      return this.map.len();
    }
    contains(t) {
      return this.get(t) != null;
    }
    get(t) {
      return this.map.get(t);
    }
    forEach(t) {
      this.map.forEach(t);
    }
    forEachJointHandleAttachedToRigidBody(t, e) {
      this.raw.forEachJointAttachedToRigidBody(t, e);
    }
    getAll() {
      return this.map.getAll();
    }
  };
  (function(s) {
    s[s.Average = 0] = "Average", s[s.Min = 1] = "Min", s[s.Multiply = 2] = "Multiply", s[s.Max = 3] = "Max";
  })(dt || (dt = {}));
  Hr = class {
    free() {
      this.raw && this.raw.free(), this.raw = void 0;
    }
    constructor(t) {
      this.raw = t || new ie();
    }
  };
  Dr = class {
    free() {
      this.raw && this.raw.free(), this.raw = void 0;
    }
    constructor(t) {
      this.raw = t || new K();
    }
    forEachActiveRigidBodyHandle(t) {
      this.raw.forEachActiveRigidBodyHandle(t);
    }
  };
  Lr = class {
    free() {
      this.raw && this.raw.free(), this.raw = void 0;
    }
    constructor(t) {
      this.raw = t || new rt();
    }
  };
  Nr = class {
    free() {
      this.raw && this.raw.free(), this.raw = void 0;
    }
    constructor(t) {
      this.raw = t || new $(), this.tempManifold = new Gr(null);
    }
    contactPairsWith(t, e) {
      this.raw.contact_pairs_with(t, e);
    }
    intersectionPairsWith(t, e) {
      this.raw.intersection_pairs_with(t, e);
    }
    contactPair(t, e, r) {
      const a = this.raw.contact_pair(t, e);
      if (a) {
        const o = a.collider1() != t;
        let _;
        for (_ = 0; _ < a.numContactManifolds(); ++_) this.tempManifold.raw = a.contactManifold(_), this.tempManifold.raw && r(this.tempManifold, o), this.tempManifold.free();
        a.free();
      }
    }
    intersectionPair(t, e) {
      return this.raw.intersection_pair(t, e);
    }
  };
  Gr = class {
    free() {
      this.raw && this.raw.free(), this.raw = void 0;
    }
    constructor(t) {
      this.raw = t;
    }
    normal() {
      return w.fromRaw(this.raw.normal());
    }
    localNormal1() {
      return w.fromRaw(this.raw.local_n1());
    }
    localNormal2() {
      return w.fromRaw(this.raw.local_n2());
    }
    subshape1() {
      return this.raw.subshape1();
    }
    subshape2() {
      return this.raw.subshape2();
    }
    numContacts() {
      return this.raw.num_contacts();
    }
    localContactPoint1(t) {
      return w.fromRaw(this.raw.contact_local_p1(t));
    }
    localContactPoint2(t) {
      return w.fromRaw(this.raw.contact_local_p2(t));
    }
    contactDist(t) {
      return this.raw.contact_dist(t);
    }
    contactFid1(t) {
      return this.raw.contact_fid1(t);
    }
    contactFid2(t) {
      return this.raw.contact_fid2(t);
    }
    contactImpulse(t) {
      return this.raw.contact_impulse(t);
    }
    contactTangentImpulseX(t) {
      return this.raw.contact_tangent_impulse_x(t);
    }
    contactTangentImpulseY(t) {
      return this.raw.contact_tangent_impulse_y(t);
    }
    numSolverContacts() {
      return this.raw.num_solver_contacts();
    }
    solverContactPoint(t) {
      return w.fromRaw(this.raw.solver_contact_point(t));
    }
    solverContactDist(t) {
      return this.raw.solver_contact_dist(t);
    }
    solverContactFriction(t) {
      return this.raw.solver_contact_friction(t);
    }
    solverContactRestitution(t) {
      return this.raw.solver_contact_restitution(t);
    }
    solverContactTangentVelocity(t) {
      return w.fromRaw(this.raw.solver_contact_tangent_velocity(t));
    }
  };
  at = class {
    constructor(t, e, r, a, o) {
      this.distance = t, this.point1 = e, this.point2 = r, this.normal1 = a, this.normal2 = o;
    }
    static fromRaw(t) {
      if (!t) return null;
      const e = new at(t.distance(), w.fromRaw(t.point1()), w.fromRaw(t.point2()), w.fromRaw(t.normal1()), w.fromRaw(t.normal2()));
      return t.free(), e;
    }
  };
  (function(s) {
    s[s.Vertex = 0] = "Vertex", s[s.Edge = 1] = "Edge", s[s.Face = 2] = "Face", s[s.Unknown = 3] = "Unknown";
  })(st || (st = {}));
  ut = class {
    constructor(t, e) {
      this.point = t, this.isInside = e;
    }
    static fromRaw(t) {
      if (!t) return null;
      const e = new ut(w.fromRaw(t.point()), t.isInside());
      return t.free(), e;
    }
  };
  ht = class {
    constructor(t, e, r, a, o) {
      this.featureType = st.Unknown, this.featureId = void 0, this.collider = t, this.point = e, this.isInside = r, o !== void 0 && (this.featureId = o), a !== void 0 && (this.featureType = a);
    }
    static fromRaw(t, e) {
      if (!e) return null;
      const r = new ht(t.get(e.colliderHandle()), w.fromRaw(e.point()), e.isInside(), e.featureType(), e.featureId());
      return e.free(), r;
    }
  };
  Ih = class {
    constructor(t, e) {
      this.origin = t, this.dir = e;
    }
    pointAt(t) {
      return {
        x: this.origin.x + this.dir.x * t,
        y: this.origin.y + this.dir.y * t,
        z: this.origin.z + this.dir.z * t
      };
    }
  };
  gt = class {
    constructor(t, e, r, a) {
      this.featureType = st.Unknown, this.featureId = void 0, this.timeOfImpact = t, this.normal = e, a !== void 0 && (this.featureId = a), r !== void 0 && (this.featureType = r);
    }
    static fromRaw(t) {
      if (!t) return null;
      const e = new gt(t.time_of_impact(), w.fromRaw(t.normal()), t.featureType(), t.featureId());
      return t.free(), e;
    }
  };
  pt = class {
    constructor(t, e, r, a, o) {
      this.featureType = st.Unknown, this.featureId = void 0, this.collider = t, this.timeOfImpact = e, this.normal = r, o !== void 0 && (this.featureId = o), a !== void 0 && (this.featureType = a);
    }
    static fromRaw(t, e) {
      if (!e) return null;
      const r = new pt(t.get(e.colliderHandle()), e.time_of_impact(), w.fromRaw(e.normal()), e.featureType(), e.featureId());
      return e.free(), r;
    }
  };
  Dt = class {
    constructor(t, e) {
      this.collider = t, this.timeOfImpact = e;
    }
    static fromRaw(t, e) {
      if (!e) return null;
      const r = new Dt(t.get(e.colliderHandle()), e.timeOfImpact());
      return e.free(), r;
    }
  };
  ot = class {
    constructor(t, e, r, a, o) {
      this.time_of_impact = t, this.witness1 = e, this.witness2 = r, this.normal1 = a, this.normal2 = o;
    }
    static fromRaw(t, e) {
      if (!e) return null;
      const r = new ot(e.time_of_impact(), w.fromRaw(e.witness1()), w.fromRaw(e.witness2()), w.fromRaw(e.normal1()), w.fromRaw(e.normal2()));
      return e.free(), r;
    }
  };
  bt = class extends ot {
    constructor(t, e, r, a, o, _) {
      super(e, r, a, o, _), this.collider = t;
    }
    static fromRaw(t, e) {
      if (!e) return null;
      const r = new bt(t.get(e.colliderHandle()), e.time_of_impact(), w.fromRaw(e.witness1()), w.fromRaw(e.witness2()), w.fromRaw(e.normal1()), w.fromRaw(e.normal2()));
      return e.free(), r;
    }
  };
  M = class {
    static fromRaw(t, e) {
      const r = t.coShapeType(e);
      let a, o, _, d, h, p, u;
      switch (r) {
        case k.Ball:
          return new xe(t.coRadius(e));
        case k.Cuboid:
          return a = t.coHalfExtents(e), new Ie(a.x, a.y, a.z);
        case k.RoundCuboid:
          return a = t.coHalfExtents(e), o = t.coRoundRadius(e), new Ae(a.x, a.y, a.z, o);
        case k.Capsule:
          return h = t.coHalfHeight(e), p = t.coRadius(e), new je(h, p);
        case k.Segment:
          return _ = t.coVertices(e), new Ee(w.new(_[0], _[1], _[2]), w.new(_[3], _[4], _[5]));
        case k.Polyline:
          return _ = t.coVertices(e), d = t.coIndices(e), new ze(_, d);
        case k.Triangle:
          return _ = t.coVertices(e), new Pe(w.new(_[0], _[1], _[2]), w.new(_[3], _[4], _[5]), w.new(_[6], _[7], _[8]));
        case k.RoundTriangle:
          return _ = t.coVertices(e), o = t.coRoundRadius(e), new Fe(w.new(_[0], _[1], _[2]), w.new(_[3], _[4], _[5]), w.new(_[6], _[7], _[8]), o);
        case k.HalfSpace:
          return u = w.fromRaw(t.coHalfspaceNormal(e)), new Wr(u);
        case k.Voxels:
          const g = t.coVoxelData(e), b = t.coVoxelSize(e);
          return new Te(g, b);
        case k.TriMesh:
          _ = t.coVertices(e), d = t.coIndices(e);
          const y = t.coTriMeshFlags(e);
          return new Me(_, d, y);
        case k.HeightField:
          const I = t.coHeightfieldScale(e), L = t.coHeightfieldHeights(e), G = t.coHeightfieldNRows(e), W = t.coHeightfieldNCols(e), q = t.coHeightFieldFlags(e);
          return new ke(G, W, L, I, q);
        case k.ConvexPolyhedron:
          return _ = t.coVertices(e), d = t.coIndices(e), new xt(_, d);
        case k.RoundConvexPolyhedron:
          return _ = t.coVertices(e), d = t.coIndices(e), o = t.coRoundRadius(e), new It(_, d, o);
        case k.Cylinder:
          return h = t.coHalfHeight(e), p = t.coRadius(e), new He(h, p);
        case k.RoundCylinder:
          return h = t.coHalfHeight(e), p = t.coRadius(e), o = t.coRoundRadius(e), new De(h, p, o);
        case k.Cone:
          return h = t.coHalfHeight(e), p = t.coRadius(e), new Le(h, p);
        case k.RoundCone:
          return h = t.coHalfHeight(e), p = t.coRadius(e), o = t.coRoundRadius(e), new Ne(h, p, o);
        default:
          throw new Error("unknown shape type: " + r);
      }
    }
    castShape(t, e, r, a, o, _, d, h, p, u) {
      let g = w.intoRaw(t), b = S.intoRaw(e), y = w.intoRaw(r), I = w.intoRaw(o), L = S.intoRaw(_), G = w.intoRaw(d), W = this.intoRaw(), q = a.intoRaw(), tt = ot.fromRaw(null, W.castShape(g, b, y, q, I, L, G, h, p, u));
      return g.free(), b.free(), y.free(), I.free(), L.free(), G.free(), W.free(), q.free(), tt;
    }
    intersectsShape(t, e, r, a, o) {
      let _ = w.intoRaw(t), d = S.intoRaw(e), h = w.intoRaw(a), p = S.intoRaw(o), u = this.intoRaw(), g = r.intoRaw(), b = u.intersectsShape(_, d, g, h, p);
      return _.free(), d.free(), h.free(), p.free(), u.free(), g.free(), b;
    }
    contactShape(t, e, r, a, o, _) {
      let d = w.intoRaw(t), h = S.intoRaw(e), p = w.intoRaw(a), u = S.intoRaw(o), g = this.intoRaw(), b = r.intoRaw(), y = at.fromRaw(g.contactShape(d, h, b, p, u, _));
      return d.free(), h.free(), p.free(), u.free(), g.free(), b.free(), y;
    }
    containsPoint(t, e, r) {
      let a = w.intoRaw(t), o = S.intoRaw(e), _ = w.intoRaw(r), d = this.intoRaw(), h = d.containsPoint(a, o, _);
      return a.free(), o.free(), _.free(), d.free(), h;
    }
    projectPoint(t, e, r, a) {
      let o = w.intoRaw(t), _ = S.intoRaw(e), d = w.intoRaw(r), h = this.intoRaw(), p = ut.fromRaw(h.projectPoint(o, _, d, a));
      return o.free(), _.free(), d.free(), h.free(), p;
    }
    intersectsRay(t, e, r, a) {
      let o = w.intoRaw(e), _ = S.intoRaw(r), d = w.intoRaw(t.origin), h = w.intoRaw(t.dir), p = this.intoRaw(), u = p.intersectsRay(o, _, d, h, a);
      return o.free(), _.free(), d.free(), h.free(), p.free(), u;
    }
    castRay(t, e, r, a, o) {
      let _ = w.intoRaw(e), d = S.intoRaw(r), h = w.intoRaw(t.origin), p = w.intoRaw(t.dir), u = this.intoRaw(), g = u.castRay(_, d, h, p, a, o);
      return _.free(), d.free(), h.free(), p.free(), u.free(), g;
    }
    castRayAndGetNormal(t, e, r, a, o) {
      let _ = w.intoRaw(e), d = S.intoRaw(r), h = w.intoRaw(t.origin), p = w.intoRaw(t.dir), u = this.intoRaw(), g = gt.fromRaw(u.castRayAndGetNormal(_, d, h, p, a, o));
      return _.free(), d.free(), h.free(), p.free(), u.free(), g;
    }
  };
  (function(s) {
    s[s.Ball = 0] = "Ball", s[s.Cuboid = 1] = "Cuboid", s[s.Capsule = 2] = "Capsule", s[s.Segment = 3] = "Segment", s[s.Polyline = 4] = "Polyline", s[s.Triangle = 5] = "Triangle", s[s.TriMesh = 6] = "TriMesh", s[s.HeightField = 7] = "HeightField", s[s.ConvexPolyhedron = 9] = "ConvexPolyhedron", s[s.Cylinder = 10] = "Cylinder", s[s.Cone = 11] = "Cone", s[s.RoundCuboid = 12] = "RoundCuboid", s[s.RoundTriangle = 13] = "RoundTriangle", s[s.RoundCylinder = 14] = "RoundCylinder", s[s.RoundCone = 15] = "RoundCone", s[s.RoundConvexPolyhedron = 16] = "RoundConvexPolyhedron", s[s.HalfSpace = 17] = "HalfSpace", s[s.Voxels = 18] = "Voxels";
  })(F || (F = {}));
  (function(s) {
    s[s.FIX_INTERNAL_EDGES = 1] = "FIX_INTERNAL_EDGES";
  })(ce || (ce = {}));
  (function(s) {
    s[s.DELETE_BAD_TOPOLOGY_TRIANGLES = 4] = "DELETE_BAD_TOPOLOGY_TRIANGLES", s[s.ORIENTED = 8] = "ORIENTED", s[s.MERGE_DUPLICATE_VERTICES = 16] = "MERGE_DUPLICATE_VERTICES", s[s.DELETE_DEGENERATE_TRIANGLES = 32] = "DELETE_DEGENERATE_TRIANGLES", s[s.DELETE_DUPLICATE_TRIANGLES = 64] = "DELETE_DUPLICATE_TRIANGLES", s[s.FIX_INTERNAL_EDGES = 144] = "FIX_INTERNAL_EDGES";
  })(le || (le = {}));
  xe = class extends M {
    constructor(t) {
      super(), this.type = F.Ball, this.radius = t;
    }
    intoRaw() {
      return m.ball(this.radius);
    }
  };
  Wr = class extends M {
    constructor(t) {
      super(), this.type = F.HalfSpace, this.normal = t;
    }
    intoRaw() {
      let t = w.intoRaw(this.normal), e = m.halfspace(t);
      return t.free(), e;
    }
  };
  Ie = class extends M {
    constructor(t, e, r) {
      super(), this.type = F.Cuboid, this.halfExtents = w.new(t, e, r);
    }
    intoRaw() {
      return m.cuboid(this.halfExtents.x, this.halfExtents.y, this.halfExtents.z);
    }
  };
  Ae = class extends M {
    constructor(t, e, r, a) {
      super(), this.type = F.RoundCuboid, this.halfExtents = w.new(t, e, r), this.borderRadius = a;
    }
    intoRaw() {
      return m.roundCuboid(this.halfExtents.x, this.halfExtents.y, this.halfExtents.z, this.borderRadius);
    }
  };
  je = class extends M {
    constructor(t, e) {
      super(), this.type = F.Capsule, this.halfHeight = t, this.radius = e;
    }
    intoRaw() {
      return m.capsule(this.halfHeight, this.radius);
    }
  };
  Ee = class extends M {
    constructor(t, e) {
      super(), this.type = F.Segment, this.a = t, this.b = e;
    }
    intoRaw() {
      let t = w.intoRaw(this.a), e = w.intoRaw(this.b), r = m.segment(t, e);
      return t.free(), e.free(), r;
    }
  };
  Pe = class extends M {
    constructor(t, e, r) {
      super(), this.type = F.Triangle, this.a = t, this.b = e, this.c = r;
    }
    intoRaw() {
      let t = w.intoRaw(this.a), e = w.intoRaw(this.b), r = w.intoRaw(this.c), a = m.triangle(t, e, r);
      return t.free(), e.free(), r.free(), a;
    }
  };
  Fe = class extends M {
    constructor(t, e, r, a) {
      super(), this.type = F.RoundTriangle, this.a = t, this.b = e, this.c = r, this.borderRadius = a;
    }
    intoRaw() {
      let t = w.intoRaw(this.a), e = w.intoRaw(this.b), r = w.intoRaw(this.c), a = m.roundTriangle(t, e, r, this.borderRadius);
      return t.free(), e.free(), r.free(), a;
    }
  };
  ze = class extends M {
    constructor(t, e) {
      super(), this.type = F.Polyline, this.vertices = t, this.indices = e ?? new Uint32Array(0);
    }
    intoRaw() {
      return m.polyline(this.vertices, this.indices);
    }
  };
  Te = class extends M {
    constructor(t, e) {
      super(), this.type = F.Voxels, this.data = t, this.voxelSize = e;
    }
    intoRaw() {
      let t = w.intoRaw(this.voxelSize), e;
      return this.data instanceof Int32Array ? e = m.voxels(t, this.data) : e = m.voxelsFromPoints(t, this.data), t.free(), e;
    }
  };
  Me = class extends M {
    constructor(t, e, r) {
      super(), this.type = F.TriMesh, this.vertices = t, this.indices = e, this.flags = r;
    }
    intoRaw() {
      return m.trimesh(this.vertices, this.indices, this.flags);
    }
  };
  xt = class extends M {
    constructor(t, e) {
      super(), this.type = F.ConvexPolyhedron, this.vertices = t, this.indices = e;
    }
    intoRaw() {
      return this.indices ? m.convexMesh(this.vertices, this.indices) : m.convexHull(this.vertices);
    }
  };
  It = class extends M {
    constructor(t, e, r) {
      super(), this.type = F.RoundConvexPolyhedron, this.vertices = t, this.indices = e, this.borderRadius = r;
    }
    intoRaw() {
      return this.indices ? m.roundConvexMesh(this.vertices, this.indices, this.borderRadius) : m.roundConvexHull(this.vertices, this.borderRadius);
    }
  };
  ke = class extends M {
    constructor(t, e, r, a, o) {
      super(), this.type = F.HeightField, this.nrows = t, this.ncols = e, this.heights = r, this.scale = a, this.flags = o;
    }
    intoRaw() {
      let t = w.intoRaw(this.scale), e = m.heightfield(this.nrows, this.ncols, this.heights, t, this.flags);
      return t.free(), e;
    }
  };
  He = class extends M {
    constructor(t, e) {
      super(), this.type = F.Cylinder, this.halfHeight = t, this.radius = e;
    }
    intoRaw() {
      return m.cylinder(this.halfHeight, this.radius);
    }
  };
  De = class extends M {
    constructor(t, e, r) {
      super(), this.type = F.RoundCylinder, this.borderRadius = r, this.halfHeight = t, this.radius = e;
    }
    intoRaw() {
      return m.roundCylinder(this.halfHeight, this.radius, this.borderRadius);
    }
  };
  Le = class extends M {
    constructor(t, e) {
      super(), this.type = F.Cone, this.halfHeight = t, this.radius = e;
    }
    intoRaw() {
      return m.cone(this.halfHeight, this.radius);
    }
  };
  Ne = class extends M {
    constructor(t, e, r) {
      super(), this.type = F.RoundCone, this.halfHeight = t, this.radius = e, this.borderRadius = r;
    }
    intoRaw() {
      return m.roundCone(this.halfHeight, this.radius, this.borderRadius);
    }
  };
  qr = class {
    free() {
      this.raw && this.raw.free(), this.raw = void 0;
    }
    constructor(t) {
      this.raw = t || new di();
    }
    step(t, e, r, a, o, _, d, h, p, u, g, b) {
      let y = w.intoRaw(t);
      g ? this.raw.stepWithEvents(y, e.raw, r.raw, a.raw, o.raw, _.raw, d.raw, h.raw, p.raw, u.raw, g.raw, b, b ? b.filterContactPair : null, b ? b.filterIntersectionPair : null) : this.raw.step(y, e.raw, r.raw, a.raw, o.raw, _.raw, d.raw, h.raw, p.raw, u.raw), y.free();
    }
  };
  (function(s) {
    s[s.EXCLUDE_FIXED = 1] = "EXCLUDE_FIXED", s[s.EXCLUDE_KINEMATIC = 2] = "EXCLUDE_KINEMATIC", s[s.EXCLUDE_DYNAMIC = 4] = "EXCLUDE_DYNAMIC", s[s.EXCLUDE_SENSORS = 8] = "EXCLUDE_SENSORS", s[s.EXCLUDE_SOLIDS = 16] = "EXCLUDE_SOLIDS", s[s.ONLY_DYNAMIC = 3] = "ONLY_DYNAMIC", s[s.ONLY_KINEMATIC = 5] = "ONLY_KINEMATIC", s[s.ONLY_FIXED = 6] = "ONLY_FIXED";
  })(we || (we = {}));
  Br = class {
    free() {
      this.raw && this.raw.free(), this.raw = void 0;
    }
    constructor(t) {
      this.raw = t || new Se();
    }
    update(t) {
      this.raw.update(t.raw);
    }
    castRay(t, e, r, a, o, _, d, h, p, u) {
      let g = w.intoRaw(r.origin), b = w.intoRaw(r.dir), y = Dt.fromRaw(e, this.raw.castRay(t.raw, e.raw, g, b, a, o, _, d, h, p, u));
      return g.free(), b.free(), y;
    }
    castRayAndGetNormal(t, e, r, a, o, _, d, h, p, u) {
      let g = w.intoRaw(r.origin), b = w.intoRaw(r.dir), y = pt.fromRaw(e, this.raw.castRayAndGetNormal(t.raw, e.raw, g, b, a, o, _, d, h, p, u));
      return g.free(), b.free(), y;
    }
    intersectionsWithRay(t, e, r, a, o, _, d, h, p, u, g) {
      let b = w.intoRaw(r.origin), y = w.intoRaw(r.dir), I = (L) => _(pt.fromRaw(e, L));
      this.raw.intersectionsWithRay(t.raw, e.raw, b, y, a, o, I, d, h, p, u, g), b.free(), y.free();
    }
    intersectionWithShape(t, e, r, a, o, _, d, h, p, u) {
      let g = w.intoRaw(r), b = S.intoRaw(a), y = o.intoRaw(), I = this.raw.intersectionWithShape(t.raw, e.raw, g, b, y, _, d, h, p, u);
      return g.free(), b.free(), y.free(), I;
    }
    projectPoint(t, e, r, a, o, _, d, h, p) {
      let u = w.intoRaw(r), g = ht.fromRaw(e, this.raw.projectPoint(t.raw, e.raw, u, a, o, _, d, h, p));
      return u.free(), g;
    }
    projectPointAndGetFeature(t, e, r, a, o, _, d, h) {
      let p = w.intoRaw(r), u = ht.fromRaw(e, this.raw.projectPointAndGetFeature(t.raw, e.raw, p, a, o, _, d, h));
      return p.free(), u;
    }
    intersectionsWithPoint(t, e, r, a, o, _, d, h, p) {
      let u = w.intoRaw(r);
      this.raw.intersectionsWithPoint(t.raw, e.raw, u, a, o, _, d, h, p), u.free();
    }
    castShape(t, e, r, a, o, _, d, h, p, u, g, b, y, I) {
      let L = w.intoRaw(r), G = S.intoRaw(a), W = w.intoRaw(o), q = _.intoRaw(), tt = bt.fromRaw(e, this.raw.castShape(t.raw, e.raw, L, G, W, q, d, h, p, u, g, b, y, I));
      return L.free(), G.free(), W.free(), q.free(), tt;
    }
    intersectionsWithShape(t, e, r, a, o, _, d, h, p, u, g) {
      let b = w.intoRaw(r), y = S.intoRaw(a), I = o.intoRaw();
      this.raw.intersectionsWithShape(t.raw, e.raw, b, y, I, _, d, h, p, u, g), b.free(), y.free(), I.free();
    }
    collidersWithAabbIntersectingAabb(t, e, r) {
      let a = w.intoRaw(t), o = w.intoRaw(e);
      this.raw.collidersWithAabbIntersectingAabb(a, o, r), a.free(), o.free();
    }
  };
  de = class {
    free() {
      this.raw && this.raw.free(), this.raw = void 0;
    }
    constructor(t) {
      this.raw = t || new pi();
    }
    serializeAll(t, e, r, a, o, _, d, h, p) {
      let u = w.intoRaw(t);
      const g = this.raw.serializeAll(u, e.raw, r.raw, a.raw, o.raw, _.raw, d.raw, h.raw, p.raw);
      return u.free(), g;
    }
    deserializeAll(t) {
      return Lt.fromRaw(this.raw.deserializeAll(t));
    }
  };
  Vr = class {
    constructor(t, e) {
      this.vertices = t, this.colors = e;
    }
  };
  Or = class {
    free() {
      this.raw && this.raw.free(), this.raw = void 0, this.vertices = void 0, this.colors = void 0;
    }
    constructor(t) {
      this.raw = t || new ci();
    }
    render(t, e, r, a, o, _, d) {
      this.raw.render(t.raw, e.raw, r.raw, a.raw, o.raw, _, e.castClosure(d)), this.vertices = this.raw.vertices(), this.colors = this.raw.colors();
    }
  };
  Ur = class {
  };
  Xr = class {
    constructor(t, e, r, a, o) {
      this.params = e, this.bodies = r, this.colliders = a, this.queries = o, this.raw = new wi(t), this.rawCharacterCollision = new br(), this._applyImpulsesToDynamicBodies = false, this._characterMass = null;
    }
    free() {
      this.raw && (this.raw.free(), this.rawCharacterCollision.free()), this.raw = void 0, this.rawCharacterCollision = void 0;
    }
    up() {
      return this.raw.up();
    }
    setUp(t) {
      let e = w.intoRaw(t);
      return this.raw.setUp(e);
    }
    applyImpulsesToDynamicBodies() {
      return this._applyImpulsesToDynamicBodies;
    }
    setApplyImpulsesToDynamicBodies(t) {
      this._applyImpulsesToDynamicBodies = t;
    }
    characterMass() {
      return this._characterMass;
    }
    setCharacterMass(t) {
      this._characterMass = t;
    }
    offset() {
      return this.raw.offset();
    }
    setOffset(t) {
      this.raw.setOffset(t);
    }
    normalNudgeFactor() {
      return this.raw.normalNudgeFactor();
    }
    setNormalNudgeFactor(t) {
      this.raw.setNormalNudgeFactor(t);
    }
    slideEnabled() {
      return this.raw.slideEnabled();
    }
    setSlideEnabled(t) {
      this.raw.setSlideEnabled(t);
    }
    autostepMaxHeight() {
      return this.raw.autostepMaxHeight();
    }
    autostepMinWidth() {
      return this.raw.autostepMinWidth();
    }
    autostepIncludesDynamicBodies() {
      return this.raw.autostepIncludesDynamicBodies();
    }
    autostepEnabled() {
      return this.raw.autostepEnabled();
    }
    enableAutostep(t, e, r) {
      this.raw.enableAutostep(t, e, r);
    }
    disableAutostep() {
      return this.raw.disableAutostep();
    }
    maxSlopeClimbAngle() {
      return this.raw.maxSlopeClimbAngle();
    }
    setMaxSlopeClimbAngle(t) {
      this.raw.setMaxSlopeClimbAngle(t);
    }
    minSlopeSlideAngle() {
      return this.raw.minSlopeSlideAngle();
    }
    setMinSlopeSlideAngle(t) {
      this.raw.setMinSlopeSlideAngle(t);
    }
    snapToGroundDistance() {
      return this.raw.snapToGroundDistance();
    }
    enableSnapToGround(t) {
      this.raw.enableSnapToGround(t);
    }
    disableSnapToGround() {
      this.raw.disableSnapToGround();
    }
    snapToGroundEnabled() {
      return this.raw.snapToGroundEnabled();
    }
    computeColliderMovement(t, e, r, a, o) {
      let _ = w.intoRaw(e);
      this.raw.computeColliderMovement(this.params.dt, this.bodies.raw, this.colliders.raw, this.queries.raw, t.handle, _, this._applyImpulsesToDynamicBodies, this._characterMass, r, a, this.colliders.castClosure(o)), _.free();
    }
    computedMovement() {
      return w.fromRaw(this.raw.computedMovement());
    }
    computedGrounded() {
      return this.raw.computedGrounded();
    }
    numComputedCollisions() {
      return this.raw.numComputedCollisions();
    }
    computedCollision(t, e) {
      if (this.raw.computedCollision(t, this.rawCharacterCollision)) {
        let r = this.rawCharacterCollision;
        return e = e ?? new Ur(), e.translationDeltaApplied = w.fromRaw(r.translationDeltaApplied()), e.translationDeltaRemaining = w.fromRaw(r.translationDeltaRemaining()), e.toi = r.toi(), e.witness1 = w.fromRaw(r.worldWitness1()), e.witness2 = w.fromRaw(r.worldWitness2()), e.normal1 = w.fromRaw(r.worldNormal1()), e.normal2 = w.fromRaw(r.worldNormal2()), e.collider = this.colliders.get(r.handle()), e;
      } else return null;
    }
  };
  (function(s) {
    s[s.None = 0] = "None", s[s.LinX = 1] = "LinX", s[s.LinY = 2] = "LinY", s[s.LinZ = 4] = "LinZ", s[s.AngX = 8] = "AngX", s[s.AngY = 16] = "AngY", s[s.AngZ = 32] = "AngZ", s[s.AllLin = 7] = "AllLin", s[s.AllAng = 56] = "AllAng", s[s.All = 63] = "All";
  })(he || (he = {}));
  Jr = class {
    constructor(t, e, r, a, o, _) {
      this.params = t, this.bodies = e, this.raw = new hi(r, a, o, _);
    }
    free() {
      this.raw && this.raw.free(), this.raw = void 0;
    }
    setKp(t, e) {
      this.raw.set_kp(t, e);
    }
    setKi(t, e) {
      this.raw.set_kp(t, e);
    }
    setKd(t, e) {
      this.raw.set_kp(t, e);
    }
    setAxes(t) {
      this.raw.set_axes_mask(t);
    }
    resetIntegrals() {
      this.raw.reset_integrals();
    }
    applyLinearCorrection(t, e, r) {
      let a = w.intoRaw(e), o = w.intoRaw(r);
      this.raw.apply_linear_correction(this.params.dt, this.bodies.raw, t.handle, a, o), a.free(), o.free();
    }
    applyAngularCorrection(t, e, r) {
      let a = S.intoRaw(e), o = w.intoRaw(r);
      this.raw.apply_angular_correction(this.params.dt, this.bodies.raw, t.handle, a, o), a.free(), o.free();
    }
    linearCorrection(t, e, r) {
      let a = w.intoRaw(e), o = w.intoRaw(r), _ = this.raw.linear_correction(this.params.dt, this.bodies.raw, t.handle, a, o);
      return a.free(), o.free(), w.fromRaw(_);
    }
    angularCorrection(t, e, r) {
      let a = S.intoRaw(e), o = w.intoRaw(r), _ = this.raw.angular_correction(this.params.dt, this.bodies.raw, t.handle, a, o);
      return a.free(), o.free(), w.fromRaw(_);
    }
  };
  Kr = class {
    constructor(t, e, r, a) {
      this.raw = new li(t.handle), this.bodies = e, this.colliders = r, this.queries = a, this._chassis = t;
    }
    free() {
      this.raw && this.raw.free(), this.raw = void 0;
    }
    updateVehicle(t, e, r, a) {
      this.raw.update_vehicle(t, this.bodies.raw, this.colliders.raw, this.queries.raw, e, r, this.colliders.castClosure(a));
    }
    currentVehicleSpeed() {
      return this.raw.current_vehicle_speed();
    }
    chassis() {
      return this._chassis;
    }
    get indexUpAxis() {
      return this.raw.index_up_axis();
    }
    set indexUpAxis(t) {
      this.raw.set_index_up_axis(t);
    }
    get indexForwardAxis() {
      return this.raw.index_forward_axis();
    }
    set setIndexForwardAxis(t) {
      this.raw.set_index_forward_axis(t);
    }
    addWheel(t, e, r, a, o) {
      let _ = w.intoRaw(t), d = w.intoRaw(e), h = w.intoRaw(r);
      this.raw.add_wheel(_, d, h, a, o), _.free(), d.free(), h.free();
    }
    numWheels() {
      return this.raw.num_wheels();
    }
    wheelChassisConnectionPointCs(t) {
      return w.fromRaw(this.raw.wheel_chassis_connection_point_cs(t));
    }
    setWheelChassisConnectionPointCs(t, e) {
      let r = w.intoRaw(e);
      this.raw.set_wheel_chassis_connection_point_cs(t, r), r.free();
    }
    wheelSuspensionRestLength(t) {
      return this.raw.wheel_suspension_rest_length(t);
    }
    setWheelSuspensionRestLength(t, e) {
      this.raw.set_wheel_suspension_rest_length(t, e);
    }
    wheelMaxSuspensionTravel(t) {
      return this.raw.wheel_max_suspension_travel(t);
    }
    setWheelMaxSuspensionTravel(t, e) {
      this.raw.set_wheel_max_suspension_travel(t, e);
    }
    wheelRadius(t) {
      return this.raw.wheel_radius(t);
    }
    setWheelRadius(t, e) {
      this.raw.set_wheel_radius(t, e);
    }
    wheelSuspensionStiffness(t) {
      return this.raw.wheel_suspension_stiffness(t);
    }
    setWheelSuspensionStiffness(t, e) {
      this.raw.set_wheel_suspension_stiffness(t, e);
    }
    wheelSuspensionCompression(t) {
      return this.raw.wheel_suspension_compression(t);
    }
    setWheelSuspensionCompression(t, e) {
      this.raw.set_wheel_suspension_compression(t, e);
    }
    wheelSuspensionRelaxation(t) {
      return this.raw.wheel_suspension_relaxation(t);
    }
    setWheelSuspensionRelaxation(t, e) {
      this.raw.set_wheel_suspension_relaxation(t, e);
    }
    wheelMaxSuspensionForce(t) {
      return this.raw.wheel_max_suspension_force(t);
    }
    setWheelMaxSuspensionForce(t, e) {
      this.raw.set_wheel_max_suspension_force(t, e);
    }
    wheelBrake(t) {
      return this.raw.wheel_brake(t);
    }
    setWheelBrake(t, e) {
      this.raw.set_wheel_brake(t, e);
    }
    wheelSteering(t) {
      return this.raw.wheel_steering(t);
    }
    setWheelSteering(t, e) {
      this.raw.set_wheel_steering(t, e);
    }
    wheelEngineForce(t) {
      return this.raw.wheel_engine_force(t);
    }
    setWheelEngineForce(t, e) {
      this.raw.set_wheel_engine_force(t, e);
    }
    wheelDirectionCs(t) {
      return w.fromRaw(this.raw.wheel_direction_cs(t));
    }
    setWheelDirectionCs(t, e) {
      let r = w.intoRaw(e);
      this.raw.set_wheel_direction_cs(t, r), r.free();
    }
    wheelAxleCs(t) {
      return w.fromRaw(this.raw.wheel_axle_cs(t));
    }
    setWheelAxleCs(t, e) {
      let r = w.intoRaw(e);
      this.raw.set_wheel_axle_cs(t, r), r.free();
    }
    wheelFrictionSlip(t) {
      return this.raw.wheel_friction_slip(t);
    }
    setWheelFrictionSlip(t, e) {
      this.raw.set_wheel_friction_slip(t, e);
    }
    wheelSideFrictionStiffness(t) {
      return this.raw.wheel_side_friction_stiffness(t);
    }
    setWheelSideFrictionStiffness(t, e) {
      this.raw.set_wheel_side_friction_stiffness(t, e);
    }
    wheelRotation(t) {
      return this.raw.wheel_rotation(t);
    }
    wheelForwardImpulse(t) {
      return this.raw.wheel_forward_impulse(t);
    }
    wheelSideImpulse(t) {
      return this.raw.wheel_side_impulse(t);
    }
    wheelSuspensionForce(t) {
      return this.raw.wheel_suspension_force(t);
    }
    wheelContactNormal(t) {
      return w.fromRaw(this.raw.wheel_contact_normal_ws(t));
    }
    wheelContactPoint(t) {
      return w.fromRaw(this.raw.wheel_contact_point_ws(t));
    }
    wheelSuspensionLength(t) {
      return this.raw.wheel_suspension_length(t);
    }
    wheelHardPoint(t) {
      return w.fromRaw(this.raw.wheel_hard_point_ws(t));
    }
    wheelIsInContact(t) {
      return this.raw.wheel_is_in_contact(t);
    }
    wheelGroundObject(t) {
      return this.colliders.get(this.raw.wheel_ground_object(t));
    }
  };
  Lt = class {
    free() {
      this.integrationParameters.free(), this.islands.free(), this.broadPhase.free(), this.narrowPhase.free(), this.bodies.free(), this.colliders.free(), this.impulseJoints.free(), this.multibodyJoints.free(), this.ccdSolver.free(), this.queryPipeline.free(), this.physicsPipeline.free(), this.serializationPipeline.free(), this.debugRenderPipeline.free(), this.characterControllers.forEach((t) => t.free()), this.pidControllers.forEach((t) => t.free()), this.vehicleControllers.forEach((t) => t.free()), this.integrationParameters = void 0, this.islands = void 0, this.broadPhase = void 0, this.narrowPhase = void 0, this.bodies = void 0, this.colliders = void 0, this.ccdSolver = void 0, this.impulseJoints = void 0, this.multibodyJoints = void 0, this.queryPipeline = void 0, this.physicsPipeline = void 0, this.serializationPipeline = void 0, this.debugRenderPipeline = void 0, this.characterControllers = void 0, this.pidControllers = void 0, this.vehicleControllers = void 0;
    }
    constructor(t, e, r, a, o, _, d, h, p, u, g, b, y, I) {
      this.gravity = t, this.integrationParameters = new vr(e), this.islands = new Dr(r), this.broadPhase = new Lr(a), this.narrowPhase = new Nr(o), this.bodies = new Sr(_), this.colliders = new Zr(d), this.impulseJoints = new Pr(h), this.multibodyJoints = new kr(p), this.ccdSolver = new Hr(u), this.queryPipeline = new Br(g), this.physicsPipeline = new qr(b), this.serializationPipeline = new de(y), this.debugRenderPipeline = new Or(I), this.characterControllers = /* @__PURE__ */ new Set(), this.pidControllers = /* @__PURE__ */ new Set(), this.vehicleControllers = /* @__PURE__ */ new Set(), this.impulseJoints.finalizeDeserialization(this.bodies), this.bodies.finalizeDeserialization(this.colliders), this.colliders.finalizeDeserialization(this.bodies);
    }
    static fromRaw(t) {
      return t ? new Lt(w.fromRaw(t.takeGravity()), t.takeIntegrationParameters(), t.takeIslandManager(), t.takeBroadPhase(), t.takeNarrowPhase(), t.takeBodies(), t.takeColliders(), t.takeImpulseJoints(), t.takeMultibodyJoints()) : null;
    }
    takeSnapshot() {
      return this.serializationPipeline.serializeAll(this.gravity, this.integrationParameters, this.islands, this.broadPhase, this.narrowPhase, this.bodies, this.colliders, this.impulseJoints, this.multibodyJoints);
    }
    static restoreSnapshot(t) {
      return new de().deserializeAll(t);
    }
    debugRender(t, e) {
      return this.debugRenderPipeline.render(this.bodies, this.colliders, this.impulseJoints, this.multibodyJoints, this.narrowPhase, t, e), new Vr(this.debugRenderPipeline.vertices, this.debugRenderPipeline.colors);
    }
    step(t, e) {
      this.physicsPipeline.step(this.gravity, this.integrationParameters, this.islands, this.broadPhase, this.narrowPhase, this.bodies, this.colliders, this.impulseJoints, this.multibodyJoints, this.ccdSolver, t, e), this.queryPipeline.update(this.colliders);
    }
    propagateModifiedBodyPositionsToColliders() {
      this.bodies.raw.propagateModifiedBodyPositionsToColliders(this.colliders.raw);
    }
    updateSceneQueries() {
      this.propagateModifiedBodyPositionsToColliders(), this.queryPipeline.update(this.colliders);
    }
    get timestep() {
      return this.integrationParameters.dt;
    }
    set timestep(t) {
      this.integrationParameters.dt = t;
    }
    get lengthUnit() {
      return this.integrationParameters.lengthUnit;
    }
    set lengthUnit(t) {
      this.integrationParameters.lengthUnit = t;
    }
    get numSolverIterations() {
      return this.integrationParameters.numSolverIterations;
    }
    set numSolverIterations(t) {
      this.integrationParameters.numSolverIterations = t;
    }
    get numAdditionalFrictionIterations() {
      return this.integrationParameters.numAdditionalFrictionIterations;
    }
    set numAdditionalFrictionIterations(t) {
      this.integrationParameters.numAdditionalFrictionIterations = t;
    }
    get numInternalPgsIterations() {
      return this.integrationParameters.numInternalPgsIterations;
    }
    set numInternalPgsIterations(t) {
      this.integrationParameters.numInternalPgsIterations = t;
    }
    switchToStandardPgsSolver() {
      this.integrationParameters.switchToStandardPgsSolver();
    }
    switchToSmallStepsPgsSolver() {
      this.integrationParameters.switchToSmallStepsPgsSolver();
    }
    switchToSmallStepsPgsSolverWithoutWarmstart() {
      this.integrationParameters.switchToSmallStepsPgsSolverWithoutWarmstart();
    }
    createRigidBody(t) {
      return this.bodies.createRigidBody(this.colliders, t);
    }
    createCharacterController(t) {
      let e = new Xr(t, this.integrationParameters, this.bodies, this.colliders, this.queryPipeline);
      return this.characterControllers.add(e), e;
    }
    removeCharacterController(t) {
      this.characterControllers.delete(t), t.free();
    }
    createPidController(t, e, r, a) {
      let o = new Jr(this.integrationParameters, this.bodies, t, e, r, a);
      return this.pidControllers.add(o), o;
    }
    removePidController(t) {
      this.pidControllers.delete(t), t.free();
    }
    createVehicleController(t) {
      let e = new Kr(t, this.bodies, this.colliders, this.queryPipeline);
      return this.vehicleControllers.add(e), e;
    }
    removeVehicleController(t) {
      this.vehicleControllers.delete(t), t.free();
    }
    createCollider(t, e) {
      let r = e ? e.handle : void 0;
      return this.colliders.createCollider(this.bodies, t, r);
    }
    createImpulseJoint(t, e, r, a) {
      return this.impulseJoints.createJoint(this.bodies, t, e.handle, r.handle, a);
    }
    createMultibodyJoint(t, e, r, a) {
      return this.multibodyJoints.createJoint(t, e.handle, r.handle, a);
    }
    getRigidBody(t) {
      return this.bodies.get(t);
    }
    getCollider(t) {
      return this.colliders.get(t);
    }
    getImpulseJoint(t) {
      return this.impulseJoints.get(t);
    }
    getMultibodyJoint(t) {
      return this.multibodyJoints.get(t);
    }
    removeRigidBody(t) {
      this.bodies && this.bodies.remove(t.handle, this.islands, this.colliders, this.impulseJoints, this.multibodyJoints);
    }
    removeCollider(t, e) {
      this.colliders && this.colliders.remove(t.handle, this.islands, this.bodies, e);
    }
    removeImpulseJoint(t, e) {
      this.impulseJoints && this.impulseJoints.remove(t.handle, e);
    }
    removeMultibodyJoint(t, e) {
      this.impulseJoints && this.multibodyJoints.remove(t.handle, e);
    }
    forEachCollider(t) {
      this.colliders.forEach(t);
    }
    forEachRigidBody(t) {
      this.bodies.forEach(t);
    }
    forEachActiveRigidBody(t) {
      this.bodies.forEachActiveRigidBody(this.islands, t);
    }
    castRay(t, e, r, a, o, _, d, h) {
      return this.queryPipeline.castRay(this.bodies, this.colliders, t, e, r, a, o, _ ? _.handle : null, d ? d.handle : null, this.colliders.castClosure(h));
    }
    castRayAndGetNormal(t, e, r, a, o, _, d, h) {
      return this.queryPipeline.castRayAndGetNormal(this.bodies, this.colliders, t, e, r, a, o, _ ? _.handle : null, d ? d.handle : null, this.colliders.castClosure(h));
    }
    intersectionsWithRay(t, e, r, a, o, _, d, h, p) {
      this.queryPipeline.intersectionsWithRay(this.bodies, this.colliders, t, e, r, a, o, _, d ? d.handle : null, h ? h.handle : null, this.colliders.castClosure(p));
    }
    intersectionWithShape(t, e, r, a, o, _, d, h) {
      let p = this.queryPipeline.intersectionWithShape(this.bodies, this.colliders, t, e, r, a, o, _ ? _.handle : null, d ? d.handle : null, this.colliders.castClosure(h));
      return p != null ? this.colliders.get(p) : null;
    }
    projectPoint(t, e, r, a, o, _, d) {
      return this.queryPipeline.projectPoint(this.bodies, this.colliders, t, e, r, a, o ? o.handle : null, _ ? _.handle : null, this.colliders.castClosure(d));
    }
    projectPointAndGetFeature(t, e, r, a, o, _) {
      return this.queryPipeline.projectPointAndGetFeature(this.bodies, this.colliders, t, e, r, a ? a.handle : null, o ? o.handle : null, this.colliders.castClosure(_));
    }
    intersectionsWithPoint(t, e, r, a, o, _, d) {
      this.queryPipeline.intersectionsWithPoint(this.bodies, this.colliders, t, this.colliders.castClosure(e), r, a, o ? o.handle : null, _ ? _.handle : null, this.colliders.castClosure(d));
    }
    castShape(t, e, r, a, o, _, d, h, p, u, g, b) {
      return this.queryPipeline.castShape(this.bodies, this.colliders, t, e, r, a, o, _, d, h, p, u ? u.handle : null, g ? g.handle : null, this.colliders.castClosure(b));
    }
    intersectionsWithShape(t, e, r, a, o, _, d, h, p) {
      this.queryPipeline.intersectionsWithShape(this.bodies, this.colliders, t, e, r, this.colliders.castClosure(a), o, _, d ? d.handle : null, h ? h.handle : null, this.colliders.castClosure(p));
    }
    collidersWithAabbIntersectingAabb(t, e, r) {
      this.queryPipeline.collidersWithAabbIntersectingAabb(t, e, this.colliders.castClosure(r));
    }
    contactPairsWith(t, e) {
      this.narrowPhase.contactPairsWith(t.handle, this.colliders.castClosure(e));
    }
    intersectionPairsWith(t, e) {
      this.narrowPhase.intersectionPairsWith(t.handle, this.colliders.castClosure(e));
    }
    contactPair(t, e, r) {
      this.narrowPhase.contactPair(t.handle, e.handle, r);
    }
    intersectionPair(t, e) {
      return this.narrowPhase.intersectionPair(t.handle, e.handle);
    }
  };
  (function(s) {
    s[s.NONE = 0] = "NONE", s[s.COLLISION_EVENTS = 1] = "COLLISION_EVENTS", s[s.CONTACT_FORCE_EVENTS = 2] = "CONTACT_FORCE_EVENTS";
  })(At || (At = {}));
  Yr = class {
    free() {
      this.raw && this.raw.free(), this.raw = void 0;
    }
    collider1() {
      return this.raw.collider1();
    }
    collider2() {
      return this.raw.collider2();
    }
    totalForce() {
      return w.fromRaw(this.raw.total_force());
    }
    totalForceMagnitude() {
      return this.raw.total_force_magnitude();
    }
    maxForceDirection() {
      return w.fromRaw(this.raw.max_force_direction());
    }
    maxForceMagnitude() {
      return this.raw.max_force_magnitude();
    }
  };
  Ah = class {
    constructor(t, e) {
      this.raw = e || new mr(t);
    }
    free() {
      this.raw && this.raw.free(), this.raw = void 0;
    }
    drainCollisionEvents(t) {
      this.raw.drainCollisionEvents(t);
    }
    drainContactForceEvents(t) {
      let e = new Yr();
      this.raw.drainContactForceEvents((r) => {
        e.raw = r, t(e), e.free();
      });
    }
    clear() {
      this.raw.clear();
    }
  };
  (function(s) {
    s[s.NONE = 0] = "NONE", s[s.FILTER_CONTACT_PAIRS = 1] = "FILTER_CONTACT_PAIRS", s[s.FILTER_INTERSECTION_PAIRS = 2] = "FILTER_INTERSECTION_PAIRS";
  })(jt || (jt = {}));
  (function(s) {
    s[s.EMPTY = 0] = "EMPTY", s[s.COMPUTE_IMPULSE = 1] = "COMPUTE_IMPULSE";
  })(pe || (pe = {}));
  (function(s) {
    s[s.DYNAMIC_DYNAMIC = 1] = "DYNAMIC_DYNAMIC", s[s.DYNAMIC_KINEMATIC = 12] = "DYNAMIC_KINEMATIC", s[s.DYNAMIC_FIXED = 2] = "DYNAMIC_FIXED", s[s.KINEMATIC_KINEMATIC = 52224] = "KINEMATIC_KINEMATIC", s[s.KINEMATIC_FIXED = 8704] = "KINEMATIC_FIXED", s[s.FIXED_FIXED = 32] = "FIXED_FIXED", s[s.DEFAULT = 15] = "DEFAULT", s[s.ALL = 60943] = "ALL";
  })(Et || (Et = {}));
  ue = class {
    constructor(t, e, r, a) {
      this.colliderSet = t, this.handle = e, this._parent = r, this._shape = a;
    }
    finalizeDeserialization(t) {
      this.handle != null && (this._parent = t.get(this.colliderSet.raw.coParent(this.handle)));
    }
    ensureShapeIsCached() {
      this._shape || (this._shape = M.fromRaw(this.colliderSet.raw, this.handle));
    }
    get shape() {
      return this.ensureShapeIsCached(), this._shape;
    }
    clearShapeCache() {
      this._shape = null;
    }
    isValid() {
      return this.colliderSet.raw.contains(this.handle);
    }
    translation() {
      return w.fromRaw(this.colliderSet.raw.coTranslation(this.handle));
    }
    rotation() {
      return S.fromRaw(this.colliderSet.raw.coRotation(this.handle));
    }
    isSensor() {
      return this.colliderSet.raw.coIsSensor(this.handle);
    }
    setSensor(t) {
      this.colliderSet.raw.coSetSensor(this.handle, t);
    }
    setShape(t) {
      let e = t.intoRaw();
      this.colliderSet.raw.coSetShape(this.handle, e), e.free(), this._shape = t;
    }
    setEnabled(t) {
      this.colliderSet.raw.coSetEnabled(this.handle, t);
    }
    isEnabled() {
      return this.colliderSet.raw.coIsEnabled(this.handle);
    }
    setRestitution(t) {
      this.colliderSet.raw.coSetRestitution(this.handle, t);
    }
    setFriction(t) {
      this.colliderSet.raw.coSetFriction(this.handle, t);
    }
    frictionCombineRule() {
      return this.colliderSet.raw.coFrictionCombineRule(this.handle);
    }
    setFrictionCombineRule(t) {
      this.colliderSet.raw.coSetFrictionCombineRule(this.handle, t);
    }
    restitutionCombineRule() {
      return this.colliderSet.raw.coRestitutionCombineRule(this.handle);
    }
    setRestitutionCombineRule(t) {
      this.colliderSet.raw.coSetRestitutionCombineRule(this.handle, t);
    }
    setCollisionGroups(t) {
      this.colliderSet.raw.coSetCollisionGroups(this.handle, t);
    }
    setSolverGroups(t) {
      this.colliderSet.raw.coSetSolverGroups(this.handle, t);
    }
    contactSkin() {
      return this.colliderSet.raw.coContactSkin(this.handle);
    }
    setContactSkin(t) {
      return this.colliderSet.raw.coSetContactSkin(this.handle, t);
    }
    activeHooks() {
      return this.colliderSet.raw.coActiveHooks(this.handle);
    }
    setActiveHooks(t) {
      this.colliderSet.raw.coSetActiveHooks(this.handle, t);
    }
    activeEvents() {
      return this.colliderSet.raw.coActiveEvents(this.handle);
    }
    setActiveEvents(t) {
      this.colliderSet.raw.coSetActiveEvents(this.handle, t);
    }
    activeCollisionTypes() {
      return this.colliderSet.raw.coActiveCollisionTypes(this.handle);
    }
    setContactForceEventThreshold(t) {
      return this.colliderSet.raw.coSetContactForceEventThreshold(this.handle, t);
    }
    contactForceEventThreshold() {
      return this.colliderSet.raw.coContactForceEventThreshold(this.handle);
    }
    setActiveCollisionTypes(t) {
      this.colliderSet.raw.coSetActiveCollisionTypes(this.handle, t);
    }
    setDensity(t) {
      this.colliderSet.raw.coSetDensity(this.handle, t);
    }
    setMass(t) {
      this.colliderSet.raw.coSetMass(this.handle, t);
    }
    setMassProperties(t, e, r, a) {
      let o = w.intoRaw(e), _ = w.intoRaw(r), d = S.intoRaw(a);
      this.colliderSet.raw.coSetMassProperties(this.handle, t, o, _, d), o.free(), _.free(), d.free();
    }
    setTranslation(t) {
      this.colliderSet.raw.coSetTranslation(this.handle, t.x, t.y, t.z);
    }
    setTranslationWrtParent(t) {
      this.colliderSet.raw.coSetTranslationWrtParent(this.handle, t.x, t.y, t.z);
    }
    setRotation(t) {
      this.colliderSet.raw.coSetRotation(this.handle, t.x, t.y, t.z, t.w);
    }
    setRotationWrtParent(t) {
      this.colliderSet.raw.coSetRotationWrtParent(this.handle, t.x, t.y, t.z, t.w);
    }
    shapeType() {
      return this.colliderSet.raw.coShapeType(this.handle);
    }
    halfExtents() {
      return w.fromRaw(this.colliderSet.raw.coHalfExtents(this.handle));
    }
    setHalfExtents(t) {
      const e = w.intoRaw(t);
      this.colliderSet.raw.coSetHalfExtents(this.handle, e);
    }
    radius() {
      return this.colliderSet.raw.coRadius(this.handle);
    }
    setRadius(t) {
      this.colliderSet.raw.coSetRadius(this.handle, t);
    }
    roundRadius() {
      return this.colliderSet.raw.coRoundRadius(this.handle);
    }
    setRoundRadius(t) {
      this.colliderSet.raw.coSetRoundRadius(this.handle, t);
    }
    halfHeight() {
      return this.colliderSet.raw.coHalfHeight(this.handle);
    }
    setHalfHeight(t) {
      this.colliderSet.raw.coSetHalfHeight(this.handle, t);
    }
    setVoxel(t, e, r, a) {
      this.colliderSet.raw.coSetVoxel(this.handle, t, e, r, a), this._shape = null;
    }
    propagateVoxelChange(t, e, r, a, o, _, d) {
      this.colliderSet.raw.coPropagateVoxelChange(this.handle, t.handle, e, r, a, o, _, d), this._shape = null;
    }
    combineVoxelStates(t, e, r, a) {
      this.colliderSet.raw.coCombineVoxelStates(this.handle, t.handle, e, r, a), this._shape = null;
    }
    vertices() {
      return this.colliderSet.raw.coVertices(this.handle);
    }
    indices() {
      return this.colliderSet.raw.coIndices(this.handle);
    }
    heightfieldHeights() {
      return this.colliderSet.raw.coHeightfieldHeights(this.handle);
    }
    heightfieldScale() {
      let t = this.colliderSet.raw.coHeightfieldScale(this.handle);
      return w.fromRaw(t);
    }
    heightfieldNRows() {
      return this.colliderSet.raw.coHeightfieldNRows(this.handle);
    }
    heightfieldNCols() {
      return this.colliderSet.raw.coHeightfieldNCols(this.handle);
    }
    parent() {
      return this._parent;
    }
    friction() {
      return this.colliderSet.raw.coFriction(this.handle);
    }
    restitution() {
      return this.colliderSet.raw.coRestitution(this.handle);
    }
    density() {
      return this.colliderSet.raw.coDensity(this.handle);
    }
    mass() {
      return this.colliderSet.raw.coMass(this.handle);
    }
    volume() {
      return this.colliderSet.raw.coVolume(this.handle);
    }
    collisionGroups() {
      return this.colliderSet.raw.coCollisionGroups(this.handle);
    }
    solverGroups() {
      return this.colliderSet.raw.coSolverGroups(this.handle);
    }
    containsPoint(t) {
      let e = w.intoRaw(t), r = this.colliderSet.raw.coContainsPoint(this.handle, e);
      return e.free(), r;
    }
    projectPoint(t, e) {
      let r = w.intoRaw(t), a = ut.fromRaw(this.colliderSet.raw.coProjectPoint(this.handle, r, e));
      return r.free(), a;
    }
    intersectsRay(t, e) {
      let r = w.intoRaw(t.origin), a = w.intoRaw(t.dir), o = this.colliderSet.raw.coIntersectsRay(this.handle, r, a, e);
      return r.free(), a.free(), o;
    }
    castShape(t, e, r, a, o, _, d, h) {
      let p = w.intoRaw(t), u = w.intoRaw(r), g = S.intoRaw(a), b = w.intoRaw(o), y = e.intoRaw(), I = ot.fromRaw(this.colliderSet, this.colliderSet.raw.coCastShape(this.handle, p, y, u, g, b, _, d, h));
      return p.free(), u.free(), g.free(), b.free(), y.free(), I;
    }
    castCollider(t, e, r, a, o, _) {
      let d = w.intoRaw(t), h = w.intoRaw(r), p = bt.fromRaw(this.colliderSet, this.colliderSet.raw.coCastCollider(this.handle, d, e.handle, h, a, o, _));
      return d.free(), h.free(), p;
    }
    intersectsShape(t, e, r) {
      let a = w.intoRaw(e), o = S.intoRaw(r), _ = t.intoRaw(), d = this.colliderSet.raw.coIntersectsShape(this.handle, _, a, o);
      return a.free(), o.free(), _.free(), d;
    }
    contactShape(t, e, r, a) {
      let o = w.intoRaw(e), _ = S.intoRaw(r), d = t.intoRaw(), h = at.fromRaw(this.colliderSet.raw.coContactShape(this.handle, d, o, _, a));
      return o.free(), _.free(), d.free(), h;
    }
    contactCollider(t, e) {
      return at.fromRaw(this.colliderSet.raw.coContactCollider(this.handle, t.handle, e));
    }
    castRay(t, e, r) {
      let a = w.intoRaw(t.origin), o = w.intoRaw(t.dir), _ = this.colliderSet.raw.coCastRay(this.handle, a, o, e, r);
      return a.free(), o.free(), _;
    }
    castRayAndGetNormal(t, e, r) {
      let a = w.intoRaw(t.origin), o = w.intoRaw(t.dir), _ = gt.fromRaw(this.colliderSet.raw.coCastRayAndGetNormal(this.handle, a, o, e, r));
      return a.free(), o.free(), _;
    }
  };
  (function(s) {
    s[s.Density = 0] = "Density", s[s.Mass = 1] = "Mass", s[s.MassProps = 2] = "MassProps";
  })(et || (et = {}));
  P = class {
    constructor(t) {
      this.enabled = true, this.shape = t, this.massPropsMode = et.Density, this.density = 1, this.friction = 0.5, this.restitution = 0, this.rotation = S.identity(), this.translation = w.zeros(), this.isSensor = false, this.collisionGroups = 4294967295, this.solverGroups = 4294967295, this.frictionCombineRule = dt.Average, this.restitutionCombineRule = dt.Average, this.activeCollisionTypes = Et.DEFAULT, this.activeEvents = At.NONE, this.activeHooks = jt.NONE, this.mass = 0, this.centerOfMass = w.zeros(), this.contactForceEventThreshold = 0, this.contactSkin = 0, this.principalAngularInertia = w.zeros(), this.angularInertiaLocalFrame = S.identity();
    }
    static ball(t) {
      const e = new xe(t);
      return new P(e);
    }
    static capsule(t, e) {
      const r = new je(t, e);
      return new P(r);
    }
    static segment(t, e) {
      const r = new Ee(t, e);
      return new P(r);
    }
    static triangle(t, e, r) {
      const a = new Pe(t, e, r);
      return new P(a);
    }
    static roundTriangle(t, e, r, a) {
      const o = new Fe(t, e, r, a);
      return new P(o);
    }
    static polyline(t, e) {
      const r = new ze(t, e);
      return new P(r);
    }
    static voxels(t, e) {
      const r = new Te(t, e);
      return new P(r);
    }
    static trimesh(t, e, r) {
      const a = new Me(t, e, r);
      return new P(a);
    }
    static cuboid(t, e, r) {
      const a = new Ie(t, e, r);
      return new P(a);
    }
    static roundCuboid(t, e, r, a) {
      const o = new Ae(t, e, r, a);
      return new P(o);
    }
    static heightfield(t, e, r, a, o) {
      const _ = new ke(t, e, r, a, o);
      return new P(_);
    }
    static cylinder(t, e) {
      const r = new He(t, e);
      return new P(r);
    }
    static roundCylinder(t, e, r) {
      const a = new De(t, e, r);
      return new P(a);
    }
    static cone(t, e) {
      const r = new Le(t, e);
      return new P(r);
    }
    static roundCone(t, e, r) {
      const a = new Ne(t, e, r);
      return new P(a);
    }
    static convexHull(t) {
      const e = new xt(t, null);
      return new P(e);
    }
    static convexMesh(t, e) {
      const r = new xt(t, e);
      return new P(r);
    }
    static roundConvexHull(t, e) {
      const r = new It(t, null, e);
      return new P(r);
    }
    static roundConvexMesh(t, e, r) {
      const a = new It(t, e, r);
      return new P(a);
    }
    setTranslation(t, e, r) {
      if (typeof t != "number" || typeof e != "number" || typeof r != "number") throw TypeError("The translation components must be numbers.");
      return this.translation = {
        x: t,
        y: e,
        z: r
      }, this;
    }
    setRotation(t) {
      return S.copy(this.rotation, t), this;
    }
    setSensor(t) {
      return this.isSensor = t, this;
    }
    setEnabled(t) {
      return this.enabled = t, this;
    }
    setContactSkin(t) {
      return this.contactSkin = t, this;
    }
    setDensity(t) {
      return this.massPropsMode = et.Density, this.density = t, this;
    }
    setMass(t) {
      return this.massPropsMode = et.Mass, this.mass = t, this;
    }
    setMassProperties(t, e, r, a) {
      return this.massPropsMode = et.MassProps, this.mass = t, w.copy(this.centerOfMass, e), w.copy(this.principalAngularInertia, r), S.copy(this.angularInertiaLocalFrame, a), this;
    }
    setRestitution(t) {
      return this.restitution = t, this;
    }
    setFriction(t) {
      return this.friction = t, this;
    }
    setFrictionCombineRule(t) {
      return this.frictionCombineRule = t, this;
    }
    setRestitutionCombineRule(t) {
      return this.restitutionCombineRule = t, this;
    }
    setCollisionGroups(t) {
      return this.collisionGroups = t, this;
    }
    setSolverGroups(t) {
      return this.solverGroups = t, this;
    }
    setActiveHooks(t) {
      return this.activeHooks = t, this;
    }
    setActiveEvents(t) {
      return this.activeEvents = t, this;
    }
    setActiveCollisionTypes(t) {
      return this.activeCollisionTypes = t, this;
    }
    setContactForceEventThreshold(t) {
      return this.contactForceEventThreshold = t, this;
    }
  };
  Zr = class {
    free() {
      this.raw && this.raw.free(), this.raw = void 0, this.map && this.map.clear(), this.map = void 0;
    }
    constructor(t) {
      this.raw = t || new E(), this.map = new Ht(), t && t.forEachColliderHandle((e) => {
        this.map.set(e, new ue(this, e, null));
      });
    }
    castClosure(t) {
      return (e) => {
        if (t) return t(this.get(e));
      };
    }
    finalizeDeserialization(t) {
      this.map.forEach((e) => e.finalizeDeserialization(t));
    }
    createCollider(t, e, r) {
      let a = r != null && r != null;
      if (a && isNaN(r)) throw Error("Cannot create a collider with a parent rigid-body handle that is not a number.");
      let o = e.shape.intoRaw(), _ = w.intoRaw(e.translation), d = S.intoRaw(e.rotation), h = w.intoRaw(e.centerOfMass), p = w.intoRaw(e.principalAngularInertia), u = S.intoRaw(e.angularInertiaLocalFrame), g = this.raw.createCollider(e.enabled, o, _, d, e.massPropsMode, e.mass, h, p, u, e.density, e.friction, e.restitution, e.frictionCombineRule, e.restitutionCombineRule, e.isSensor, e.collisionGroups, e.solverGroups, e.activeCollisionTypes, e.activeHooks, e.activeEvents, e.contactForceEventThreshold, e.contactSkin, a, a ? r : 0, t.raw);
      o.free(), _.free(), d.free(), h.free(), p.free(), u.free();
      let b = a ? t.get(r) : null, y = new ue(this, g, b, e.shape);
      return this.map.set(g, y), y;
    }
    remove(t, e, r, a) {
      this.raw.remove(t, e.raw, r.raw, a), this.unmap(t);
    }
    unmap(t) {
      this.map.delete(t);
    }
    get(t) {
      return this.map.get(t);
    }
    len() {
      return this.map.len();
    }
    contains(t) {
      return this.get(t) != null;
    }
    forEach(t) {
      this.map.forEach(t);
    }
    getAll() {
      return this.map.getAll();
    }
  };
  jh = function() {
    return ni();
  };
  Eh = function(s) {
    ai(s);
  };
  Fh = Object.freeze(Object.defineProperty({
    __proto__: null,
    get ActiveCollisionTypes() {
      return Et;
    },
    get ActiveEvents() {
      return At;
    },
    get ActiveHooks() {
      return jt;
    },
    Ball: xe,
    BroadPhase: Lr,
    CCDSolver: Hr,
    Capsule: je,
    CharacterCollision: Ur,
    get CoefficientCombineRule() {
      return dt;
    },
    Collider: ue,
    ColliderDesc: P,
    ColliderSet: Zr,
    ColliderShapeCastHit: bt,
    Cone: Le,
    ConvexPolyhedron: xt,
    Cuboid: Ie,
    Cylinder: He,
    DebugRenderBuffers: Vr,
    DebugRenderPipeline: Or,
    DynamicRayCastVehicleController: Kr,
    EventQueue: Ah,
    get FeatureType() {
      return st;
    },
    FixedImpulseJoint: Rr,
    FixedMultibodyJoint: Fr,
    GenericImpulseJoint: jr,
    HalfSpace: Wr,
    get HeightFieldFlags() {
      return ce;
    },
    Heightfield: ke,
    ImpulseJoint: O,
    ImpulseJointSet: Pr,
    IntegrationParameters: vr,
    IslandManager: Dr,
    get JointAxesMask() {
      return _e;
    },
    JointData: X,
    get JointType() {
      return D;
    },
    KinematicCharacterController: Xr,
    get MassPropsMode() {
      return et;
    },
    get MotorModel() {
      return oe;
    },
    MultibodyJoint: Q,
    MultibodyJointSet: kr,
    NarrowPhase: Nr,
    PhysicsPipeline: qr,
    get PidAxesMask() {
      return he;
    },
    PidController: Jr,
    PointColliderProjection: ht,
    PointProjection: ut,
    Polyline: ze,
    PrismaticImpulseJoint: Ir,
    PrismaticMultibodyJoint: zr,
    Quaternion: ne,
    get QueryFilterFlags() {
      return we;
    },
    QueryPipeline: Br,
    Ray: Ih,
    RayColliderHit: Dt,
    RayColliderIntersection: pt,
    RayIntersection: gt,
    RevoluteImpulseJoint: Ar,
    RevoluteMultibodyJoint: Tr,
    RigidBody: se,
    RigidBodyDesc: U,
    RigidBodySet: Sr,
    get RigidBodyType() {
      return B;
    },
    RopeImpulseJoint: Cr,
    RotationOps: S,
    RoundCone: Ne,
    RoundConvexPolyhedron: It,
    RoundCuboid: Ae,
    RoundCylinder: De,
    RoundTriangle: Fe,
    SdpMatrix3: yr,
    SdpMatrix3Ops: ae,
    Segment: Ee,
    SerializationPipeline: de,
    Shape: M,
    ShapeCastHit: ot,
    ShapeContact: at,
    get ShapeType() {
      return F;
    },
    get SolverFlags() {
      return pe;
    },
    SphericalImpulseJoint: Er,
    SphericalMultibodyJoint: Mr,
    SpringImpulseJoint: xr,
    TempContactForceEvent: Yr,
    TempContactManifold: Gr,
    TriMesh: Me,
    get TriMeshFlags() {
      return le;
    },
    Triangle: Pe,
    UnitImpulseJoint: Re,
    UnitMultibodyJoint: Ce,
    Vector3: fr,
    VectorOps: w,
    Voxels: Te,
    World: Lt,
    reserveMemory: Eh,
    version: jh
  }, Symbol.toStringTag, {
    value: "Module"
  }));
});
export {
  Et as ActiveCollisionTypes,
  At as ActiveEvents,
  jt as ActiveHooks,
  xe as Ball,
  Lr as BroadPhase,
  Hr as CCDSolver,
  je as Capsule,
  Ur as CharacterCollision,
  dt as CoefficientCombineRule,
  ue as Collider,
  P as ColliderDesc,
  Zr as ColliderSet,
  bt as ColliderShapeCastHit,
  Le as Cone,
  xt as ConvexPolyhedron,
  Ie as Cuboid,
  He as Cylinder,
  Vr as DebugRenderBuffers,
  Or as DebugRenderPipeline,
  Kr as DynamicRayCastVehicleController,
  Ah as EventQueue,
  st as FeatureType,
  Rr as FixedImpulseJoint,
  Fr as FixedMultibodyJoint,
  jr as GenericImpulseJoint,
  Wr as HalfSpace,
  ce as HeightFieldFlags,
  ke as Heightfield,
  O as ImpulseJoint,
  Pr as ImpulseJointSet,
  vr as IntegrationParameters,
  Dr as IslandManager,
  _e as JointAxesMask,
  X as JointData,
  D as JointType,
  Xr as KinematicCharacterController,
  et as MassPropsMode,
  oe as MotorModel,
  Q as MultibodyJoint,
  kr as MultibodyJointSet,
  Nr as NarrowPhase,
  qr as PhysicsPipeline,
  he as PidAxesMask,
  Jr as PidController,
  ht as PointColliderProjection,
  ut as PointProjection,
  ze as Polyline,
  Ir as PrismaticImpulseJoint,
  zr as PrismaticMultibodyJoint,
  ne as Quaternion,
  we as QueryFilterFlags,
  Br as QueryPipeline,
  Ih as Ray,
  Dt as RayColliderHit,
  pt as RayColliderIntersection,
  gt as RayIntersection,
  Ar as RevoluteImpulseJoint,
  Tr as RevoluteMultibodyJoint,
  se as RigidBody,
  U as RigidBodyDesc,
  Sr as RigidBodySet,
  B as RigidBodyType,
  Cr as RopeImpulseJoint,
  S as RotationOps,
  Ne as RoundCone,
  It as RoundConvexPolyhedron,
  Ae as RoundCuboid,
  De as RoundCylinder,
  Fe as RoundTriangle,
  yr as SdpMatrix3,
  ae as SdpMatrix3Ops,
  Ee as Segment,
  de as SerializationPipeline,
  M as Shape,
  ot as ShapeCastHit,
  at as ShapeContact,
  F as ShapeType,
  pe as SolverFlags,
  Er as SphericalImpulseJoint,
  Mr as SphericalMultibodyJoint,
  xr as SpringImpulseJoint,
  Yr as TempContactForceEvent,
  Gr as TempContactManifold,
  Me as TriMesh,
  le as TriMeshFlags,
  Pe as Triangle,
  Re as UnitImpulseJoint,
  Ce as UnitMultibodyJoint,
  fr as Vector3,
  w as VectorOps,
  Te as Voxels,
  Lt as World,
  __tla,
  Fh as default,
  Eh as reserveMemory,
  jh as version
};
