/**
 * Partikel 3D: bunga jepun berjatuhan (InstancedMesh, 1 draw call) + debu emas (Points).
 * Seluruh gerak dihitung di vertex shader → CPU hampir nol.
 * Interaksi: menghindari jari/kursor, miring mengikuti gyroscope, ledakan (burst), hujan bunga.
 * Kualitas adaptif: FPS dipantau; jika turun, DPR & jumlah partikel diturunkan,
 * dan jika tetap berat → `onFallback()` dipanggil (beralih ke versi CSS).
 */
import {
  AdditiveBlending,
  BufferGeometry,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  InstancedBufferAttribute,
  InstancedMesh,
  Matrix4,
  OrthographicCamera,
  Points,
  Scene,
  Shape,
  ShapeGeometry,
  ShaderMaterial,
  Vector2,
  WebGLRenderer,
} from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

export interface ParticlesOptions {
  quality: 'low' | 'mid' | 'high'
  onFallback?: () => void
}

export interface ParticlesHandle {
  burst: (x?: number, y?: number) => void
  rain: (seconds?: number) => void
  setTilt: (x: number, y: number) => void
  setPaused: (p: boolean) => void
  dispose: () => void
}

const COUNTS = { low: 9, mid: 13, high: 18 }
const DUST = { low: 60, mid: 110, high: 180 }
const RAIN_EXTRA = 5 // pengali saat hujan bunga

function flowerGeometry(): BufferGeometry {
  const petals: BufferGeometry[] = []
  for (let i = 0; i < 5; i++) {
    const s = new Shape()
    const l = 1
    const w = 0.5
    s.moveTo(0, 0)
    s.bezierCurveTo(-w * 0.55, l * 0.25, -w * 0.95, l * 0.72, -w * 0.35, l * 0.98)
    s.bezierCurveTo(w * 0.2, l * 1.12, w * 0.95, l * 0.9, w * 0.62, l * 0.5)
    s.bezierCurveTo(w * 0.4, l * 0.22, w * 0.12, l * 0.06, 0, 0)
    const g = new ShapeGeometry(s, 6)
    g.rotateZ((i / 5) * Math.PI * 2)
    // sedikit cekung agar terlihat 3D saat berputar
    const pos = g.attributes.position!
    for (let v = 0; v < pos.count; v++) {
      const x = pos.getX(v)
      const y = pos.getY(v)
      pos.setZ(v, (x * x + y * y) * 0.18)
    }
    petals.push(g)
  }
  const merged = mergeGeometries(petals)!
  merged.scale(0.5, 0.5, 0.5)
  return merged
}

const petalVert = /* glsl */ `
  attribute vec4 aSeed;   // x,y: posisi awal (0..1), z: kecepatan, w: urutan (untuk densitas)
  attribute vec3 aSpin;   // sumbu putar
  uniform float uTime;
  uniform float uDensity; // 0..1 berapa banyak instance yang tampil
  uniform vec2 uView;     // ukuran dunia (w,h)
  uniform vec2 uPointer;  // posisi jari di dunia
  uniform float uPointerOn;
  uniform vec2 uTilt;     // gyroscope / kursor
  uniform float uBurstT;  // waktu sejak burst
  uniform vec2 uBurstO;   // asal burst
  uniform float uScale;
  varying float vShade;
  varying vec2 vUv;

  mat3 rotAxis(vec3 a, float ang){
    a = normalize(a); float s = sin(ang); float c = cos(ang); float oc = 1.0 - c;
    return mat3(oc*a.x*a.x + c, oc*a.x*a.y - a.z*s, oc*a.z*a.x + a.y*s,
                oc*a.x*a.y + a.z*s, oc*a.y*a.y + c, oc*a.y*a.z - a.x*s,
                oc*a.z*a.x - a.y*s, oc*a.y*a.z + a.x*s, oc*a.z*a.z + c);
  }

  void main(){
    vUv = position.xy;
    float visible = step(aSeed.w, uDensity);
    float speed = mix(0.035, 0.085, aSeed.z);
    float H = uView.y * 1.3;
    float t = uTime * speed * uView.y;
    // jatuh & berulang
    float y = uView.y * 0.65 - mod(aSeed.y * H + t, H);
    float sway = sin(uTime * (0.4 + aSeed.z * 0.5) + aSeed.x * 12.0) * uView.x * 0.06;
    float x = (aSeed.x - 0.5) * uView.x * 1.1 + sway + uTilt.x * uView.x * 0.12 * (0.5 + aSeed.z);
    y += uTilt.y * uView.y * 0.04;
    vec2 p = vec2(x, y);

    // menghindari jari/kursor
    vec2 d = p - uPointer;
    float dist = length(d);
    float r = uView.x * 0.22;
    float push = uPointerOn * smoothstep(r, 0.0, dist);
    p += normalize(d + 0.0001) * push * r * 0.6;

    // burst dari asal → menyatu ke aliran jatuh
    float bt = uBurstT;
    if (bt >= 0.0 && bt < 3.2) {
      float ang = aSeed.x * 6.2831 + aSeed.y * 3.0;
      float spd = mix(0.35, 1.0, aSeed.z);
      float e = 1.0 - pow(1.0 - clamp(bt / 1.6, 0.0, 1.0), 3.0);
      vec2 bp = uBurstO + vec2(cos(ang), sin(ang) * 0.8 + 0.25) * uView.x * 0.75 * spd * e;
      bp.y -= bt * bt * uView.y * 0.04;
      p = mix(bp, p, smoothstep(1.2, 3.2, bt));
      visible = max(visible, 1.0 - smoothstep(2.4, 3.2, bt));
    }

    float ang = uTime * (0.6 + aSeed.z) + aSeed.y * 10.0;
    mat3 R = rotAxis(aSpin, ang);
    vec3 local = R * position;
    vShade = 0.55 + 0.45 * abs((R * vec3(0.0, 0.0, 1.0)).z);
    float size = uScale * mix(0.7, 1.25, fract(aSeed.x * 7.13)) * visible;
    vec3 world = vec3(p, 0.0) + local * size;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(world, 1.0);
  }
`

const petalFrag = /* glsl */ `
  varying float vShade;
  varying vec2 vUv;
  uniform vec3 uCenter;
  uniform vec3 uEdge;
  void main(){
    float r = length(vUv) / 0.5;
    vec3 col = mix(uCenter, uEdge, smoothstep(0.05, 0.6, r));
    col *= vShade;
    gl_FragColor = vec4(col, 0.95);
  }
`

const dustVert = /* glsl */ `
  attribute vec3 aSeed;
  uniform float uTime;
  uniform vec2 uView;
  uniform vec2 uTilt;
  uniform float uPx;
  varying float vA;
  void main(){
    float H = uView.y * 1.2;
    float y = mod(aSeed.y * H + uTime * uView.y * 0.012 * (0.4 + aSeed.z), H) - H * 0.5;
    float x = (aSeed.x - 0.5) * uView.x + sin(uTime * 0.3 + aSeed.y * 20.0) * uView.x * 0.02 + uTilt.x * uView.x * 0.05;
    vA = 0.35 + 0.65 * (0.5 + 0.5 * sin(uTime * (1.0 + aSeed.z * 2.0) + aSeed.x * 40.0));
    gl_Position = projectionMatrix * modelViewMatrix * vec4(x, y, -1.0, 1.0);
    gl_PointSize = uPx * mix(1.2, 3.4, aSeed.z);
  }
`
const dustFrag = /* glsl */ `
  varying float vA;
  void main(){
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(vec3(1.0, 0.85, 0.5) * a, a * vA * 0.8);
  }
`

export function createParticles(canvas: HTMLCanvasElement, opts: ParticlesOptions): ParticlesHandle | null {
  let renderer: WebGLRenderer
  try {
    renderer = new WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'low-power', premultipliedAlpha: true })
  } catch {
    return null
  }
  let quality = opts.quality
  let dpr = Math.min(window.devicePixelRatio || 1, quality === 'high' ? 1.75 : 1.25)
  renderer.setPixelRatio(dpr)
  renderer.setClearColor(0x000000, 0)

  const scene = new Scene()
  const camera = new OrthographicCamera(-1, 1, 1, -1, -10, 10)
  const view = new Vector2(1, 1)

  // ---- bunga ----
  const max = Math.round(COUNTS.high * RAIN_EXTRA)
  const geo = flowerGeometry()
  const seeds = new Float32Array(max * 4)
  const spins = new Float32Array(max * 3)
  for (let i = 0; i < max; i++) {
    seeds.set([Math.random(), Math.random(), Math.random(), i / max], i * 4)
    spins.set([Math.random() - 0.5, Math.random() - 0.5, 0.6 + Math.random()], i * 3)
  }
  geo.setAttribute('aSeed', new InstancedBufferAttribute(seeds, 4))
  geo.setAttribute('aSpin', new InstancedBufferAttribute(spins, 3))

  const uniforms = {
    uTime: { value: 0 },
    uDensity: { value: 0 },
    uView: { value: view },
    uPointer: { value: new Vector2(9999, 9999) },
    uPointerOn: { value: 0 },
    uTilt: { value: new Vector2() },
    uBurstT: { value: -1 },
    uBurstO: { value: new Vector2() },
    uScale: { value: 1 },
    uCenter: { value: new Color('#f3b73e') },
    uEdge: { value: new Color('#fff7ea') },
  }
  const mat = new ShaderMaterial({ vertexShader: petalVert, fragmentShader: petalFrag, uniforms, transparent: true, side: DoubleSide, depthWrite: false })
  const mesh = new InstancedMesh(geo, mat, max)
  const ident = new Matrix4()
  for (let i = 0; i < max; i++) mesh.setMatrixAt(i, ident)
  mesh.frustumCulled = false
  scene.add(mesh)

  // ---- debu emas ----
  const dustCount = DUST[quality]
  const dGeo = new BufferGeometry()
  const dSeeds = new Float32Array(dustCount * 3)
  for (let i = 0; i < dustCount * 3; i++) dSeeds[i] = Math.random()
  dGeo.setAttribute('position', new Float32BufferAttribute(new Float32Array(dustCount * 3), 3))
  dGeo.setAttribute('aSeed', new Float32BufferAttribute(dSeeds, 3))
  const dUniforms = { uTime: uniforms.uTime, uView: uniforms.uView, uTilt: uniforms.uTilt, uPx: { value: dpr } }
  const dust = new Points(dGeo, new ShaderMaterial({ vertexShader: dustVert, fragmentShader: dustFrag, uniforms: dUniforms, transparent: true, blending: AdditiveBlending, depthWrite: false }))
  dust.frustumCulled = false
  scene.add(dust)

  const baseDensity = () => COUNTS[quality] / max
  let density = baseDensity()
  let rainUntil = 0

  function resize() {
    const w = window.innerWidth
    const h = window.innerHeight
    renderer.setSize(w, h, false)
    const aspect = w / h
    // satuan dunia: tinggi = 10
    view.set(10 * aspect, 10)
    camera.left = -view.x / 2
    camera.right = view.x / 2
    camera.top = view.y / 2
    camera.bottom = -view.y / 2
    camera.updateProjectionMatrix()
    uniforms.uScale.value = Math.min(view.x, view.y) * (w < 700 ? 0.075 : 0.05)
  }
  resize()
  window.addEventListener('resize', resize)

  const toWorld = (cx: number, cy: number) => new Vector2((cx / window.innerWidth - 0.5) * view.x, (0.5 - cy / window.innerHeight) * view.y)

  const onPointer = (e: PointerEvent) => {
    uniforms.uPointer.value.copy(toWorld(e.clientX, e.clientY))
    uniforms.uPointerOn.value = 1
  }
  const onLeave = () => {
    uniforms.uPointerOn.value = 0
  }
  window.addEventListener('pointermove', onPointer, { passive: true })
  window.addEventListener('pointerdown', onPointer, { passive: true })
  window.addEventListener('pointerup', onLeave, { passive: true })
  document.addEventListener('pointerleave', onLeave)

  let raf = 0
  let paused = false
  let last = performance.now()
  let start = last
  let burstAt = -1
  // pemantau FPS
  let acc = 0
  let frames = 0
  let strikes = 0
  const tilt = new Vector2()

  function frame(now: number) {
    raf = requestAnimationFrame(frame)
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now
    const t = (now - start) / 1000
    uniforms.uTime.value = t
    // densitas menuju target (hujan bunga / normal)
    const target = now < rainUntil ? Math.min(1, baseDensity() * RAIN_EXTRA) : baseDensity()
    density += (target - density) * Math.min(1, dt * 1.5)
    uniforms.uDensity.value = density
    uniforms.uBurstT.value = burstAt < 0 ? -1 : t - burstAt
    uniforms.uTilt.value.lerp(tilt, Math.min(1, dt * 3))
    if (uniforms.uPointerOn.value > 0) uniforms.uPointerOn.value = Math.max(0, uniforms.uPointerOn.value - dt * 0.25)
    renderer.render(scene, camera)

    // ---- adaptif ----
    acc += dt
    frames++
    if (acc >= 2) {
      const fps = frames / acc
      acc = 0
      frames = 0
      if (fps < 30) strikes += 2
      else if (fps < 50) strikes += 1
      else strikes = Math.max(0, strikes - 1)
      if (strikes >= 2 && (dpr > 1 || quality !== 'low')) {
        dpr = 1
        renderer.setPixelRatio(1)
        quality = quality === 'high' ? 'mid' : 'low'
        dUniforms.uPx.value = 1
        resize()
        strikes = 0
      } else if (strikes >= 4) {
        opts.onFallback?.()
      }
    }
  }
  raf = requestAnimationFrame(frame)

  const onVis = () => handle.setPaused(document.hidden)
  document.addEventListener('visibilitychange', onVis)

  const handle: ParticlesHandle = {
    burst(x = window.innerWidth / 2, y = window.innerHeight / 2) {
      uniforms.uBurstO.value.copy(toWorld(x, y))
      burstAt = (performance.now() - start) / 1000
    },
    rain(seconds = 6) {
      rainUntil = performance.now() + seconds * 1000
    },
    setTilt(x, y) {
      tilt.set(Math.max(-1, Math.min(1, x)), Math.max(-1, Math.min(1, y)))
    },
    setPaused(p) {
      if (p === paused) return
      paused = p
      if (p) cancelAnimationFrame(raf)
      else {
        last = performance.now()
        raf = requestAnimationFrame(frame)
      }
    },
    dispose() {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('pointerdown', onPointer)
      window.removeEventListener('pointerup', onLeave)
      document.removeEventListener('pointerleave', onLeave)
      document.removeEventListener('visibilitychange', onVis)
      geo.dispose()
      mat.dispose()
      dGeo.dispose()
      renderer.dispose()
    },
  }
  return handle
}
