// Alburn, la pagina di alburn.it: L'ELICA VIVA (21 novembre 2026, sera; scelta da Paolo: «Sì, questa»).
// Le parole di Paolo, dopo la prova dei pannelli: «il nuovo DNA non mi piace con tutti quei pannelli di legno, vorrei
// qualcosa di più organico: magari rami, foglie, qualcosa di più organico o fluido».
// L'elica cresce come una pianta. È l'alburno: il legno vivo dove sale la linfa.
// - I DUE FILI sono due rami vivi: non girano precisi come un pezzo tornito, ondeggiano e cambiano spessore. Attorno a
//   ogni ramo salgono due tralci sottili, avvolti.
// - LA LINFA è il filo indaco: una vena che corre lungo il ramo, con la luce che sale a onde lente.
// - Dai rami escono I RAMETTI, piegati verso l'alto, con LE FOGLIE: respirano piano.
// - I PIOLI sono liane fra un ramo e l'altro, con una gemma nel mezzo: undici per giro, come le basi del DNA. Attorno al
//   mobile si ritirano nel ramo e gli fanno posto.
// - LA LUCE filtra a chiazze, come in un bosco, e le chiazze si spostano piano.
// La scala è da film colossal: l'elica è il mondo, e il mobile è piccolo dentro.
// Ogni tipo di pezzo è una forma sola ripetuta (InstancedMesh). Il movimento sta tutto in un numero, il tempo: se non
// cambia, tutto è fermo.
import * as THREE from './three/three.module.js';

const V3 = THREE.Vector3, DUE_PI = Math.PI * 2;
const lim = (x, a, b) => Math.min(b, Math.max(a, x)), tratto = (p, a, b) => lim((p - a) / (b - a), 0, 1), dolce = x => x * x * (3 - 2 * x), misto = (a, b, k) => a + (b - a) * k;
// un'onda liscia e sempre uguale: tre seni con passi diversi (la mano di chi cresce, non quella di chi tornisce)
const onda = (t, s) => Math.sin(t + s) * 0.5 + Math.sin(t * 2.3 + s * 1.7) * 0.3 + Math.sin(t * 4.1 + s * 2.9) * 0.2;

// LE MISURE DEL MONDO: tutto è in millimetri, come il mobile
export const MONDO = {
  R: 4200,     // il raggio dell'elica: il mobile è largo 800
  P: 14000     // un giro ogni quattordici metri: slanciata come il DNA vero (un giro è alto 1,7 volte il diametro)
};

// LE MISURE DELLA PIANTA
export const VIVA = {
  SU: 4.2, GIU: 6.8,        // quanti giri sopra e sotto il mobile
  ramo: 150,                // il raggio del ramo: il mobile è largo 800
  tralci: [54, 32],         // i raggi dei due tralci avvolti al ramo
  linfa: 17,                // il raggio della vena indaco
  RAMETTI: 38,              // i rametti di un ramo in un giro
  rametto: [650, 1700],     // quanto è lungo un rametto
  foglia: [260, 480],       // quanto è lunga una foglia
  cade: 260                 // quanto scende la liana nel mezzo
};

// un mucchio di tubi in una forma sola
const mucchio = () => ({pos: [], nor: [], uv: [], idx: []});
// un tubo lungo i punti «P», con il raggio «raggio(i, angolo)»; «tela» è quanti millimetri fa un giro della tela lungo il
// tubo. In «quadri» escono, punto per punto, le tre direzioni del tubo (lungo, e due di traverso)
function tubo(m, P, raggio, lati, tela, quadri, N0) {
  const n = P.length, T = new V3(), N = new V3(), B = new V3(), base = m.pos.length / 3; let lungo = 0;
  for (let i = 0; i < n; i++) {
    T.subVectors(P[Math.min(n - 1, i + 1)], P[Math.max(0, i - 1)]).normalize();
    if (i === 0) { if (N0) N.copy(N0); else { N.set(0, 0, 1); if (Math.abs(T.z) > 0.9) N.set(1, 0, 0); } }
    N.addScaledVector(T, -N.dot(T)).normalize(); B.crossVectors(T, N);
    if (i) lungo += P[i].distanceTo(P[i - 1]);
    if (quadri) quadri.push({T: T.clone(), N: N.clone(), B: B.clone()});
    for (let k = 0; k <= lati; k++) { const th = k / lati * DUE_PI, c = Math.cos(th), s = Math.sin(th), r = raggio(i, th);
      const nx = N.x * c + B.x * s, ny = N.y * c + B.y * s, nz = N.z * c + B.z * s;
      m.pos.push(P[i].x + nx * r, P[i].y + ny * r, P[i].z + nz * r); m.nor.push(nx, ny, nz); m.uv.push(lungo / tela, k / lati); }
  }
  for (let i = 0; i < n - 1; i++) for (let k = 0; k < lati; k++) { const a = base + i * (lati + 1) + k, b = a + lati + 1; m.idx.push(a, a + 1, b, a + 1, b + 1, b); }
}
function forma(m) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(m.pos), 3)); g.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(m.nor), 3));
  g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(m.uv), 2)); g.setIndex(new THREE.BufferAttribute(new Uint32Array(m.idx), 1));
  return g;
}

// LA CORTECCIA: fibre lunghe, chiare e scure, lungo il ramo. Due tele: il colore e il rilievo
function teleCorteccia() {
  const W = 1024, H = 512, fai = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };
  const c = fai(), r = fai(), x = c.getContext('2d'), y = r.getContext('2d');
  x.fillStyle = '#84735f'; x.fillRect(0, 0, W, H); y.fillStyle = '#808080'; y.fillRect(0, 0, W, H);
  let s = 9; const caso = () => (s = s * 16807 % 2147483647) / 2147483647;
  // prima le macchie larghe e morbide (il ramo non è tutto di un colore), poi le fibre
  for (let n = 0; n < 70; n++) { const px = caso() * W, py = caso() * H, rx = 40 + caso() * 150, ry = 14 + caso() * 46, scura = caso() < 0.55;
    for (const ox of [0, -W, W]) for (const oy of [0, -H, H]) { const g = x.createRadialGradient(0, 0, 0, 0, 0, 1); g.addColorStop(0, scura ? 'rgba(52,42,34,0.3)' : 'rgba(176,170,148,0.3)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      x.save(); x.translate(px + ox, py + oy); x.scale(rx, ry); x.fillStyle = g; x.beginPath(); x.arc(0, 0, 1, 0, DUE_PI); x.fill(); x.restore(); } }
  for (let n = 0; n < 1300; n++) {
    const px = caso() * W, py = caso() * H, l = 30 + caso() * caso() * 330, sp = 0.6 + caso() * 3.4, chiaro = caso() < 0.36, a = 0.1 + caso() * 0.24, dy = (caso() - 0.5) * 14;
    for (const ox of [0, -W]) [x, y].forEach((g, quale) => {
      g.strokeStyle = quale ? (chiaro ? `rgba(255,255,255,${a})` : `rgba(0,0,0,${a * 1.3})`) : (chiaro ? `rgba(190,172,146,${a})` : `rgba(46,36,28,${a})`);
      g.lineWidth = sp; g.beginPath(); g.moveTo(px + ox, py); g.bezierCurveTo(px + ox + l / 3, py + dy, px + ox + l * 2 / 3, py - dy, px + ox + l, py); g.stroke(); });
  }
  return [c, r].map((t, i) => { const tx = new THREE.CanvasTexture(t); tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.anisotropy = 8; if (!i) tx.colorSpace = THREE.SRGBColorSpace; return tx; });
}
// LA FOGLIA: la costa nel mezzo e le nervature, chiare; il verde lo dà ogni foglia
function telaFoglia() {
  const W = 128, H = 256, c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
  x.fillStyle = '#dcdcdc'; x.fillRect(0, 0, W, H);
  x.strokeStyle = 'rgba(255,255,255,0.75)'; x.lineWidth = 1.4;
  for (let v = 14; v < H; v += 20) for (const s of [-1, 1]) { x.beginPath(); x.moveTo(W / 2, v + 12); x.quadraticCurveTo(W / 2 + s * W * 0.25, v + 4, W / 2 + s * W * 0.5, v - 16); x.stroke(); }
  x.strokeStyle = '#ffffff'; x.lineWidth = 4; x.beginPath(); x.moveTo(W / 2, 0); x.lineTo(W / 2, H); x.stroke();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
// la forma di una foglia: lunga 1 lungo y, la faccia verso z; piegata a V lungo la costa, con la punta che scende
function formaFoglia() {
  const SEG = 9, pos = [], uv = [], idx = [];
  for (let i = 0; i <= SEG; i++) { const t = i / SEG, w = 0.21 * Math.pow(Math.sin(Math.PI * Math.pow(t, 0.72)), 0.8) + 0.004, z = -0.17 * t * t, piega = 0.34 * w;
    pos.push(-w, t, z + piega, 0, t, z, w, t, z + piega); uv.push(0, t, 0.5, t, 1, t); }
  for (let i = 0; i < SEG; i++) { const a = i * 3; idx.push(a, a + 1, a + 4, a, a + 4, a + 3, a + 1, a + 2, a + 5, a + 1, a + 5, a + 4); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pos), 3)); g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uv), 2)); g.setIndex(idx); g.computeVertexNormals();
  return g;
}

// LA LUCE DEL BOSCO: chiazze di sole e d'ombra, viste dal sole, che si spostano piano
const CHIAZZE = `
  float caso2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float rumore2(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(caso2(i), caso2(i + vec2(1.0, 0.0)), f.x), mix(caso2(i + vec2(0.0, 1.0)), caso2(i + vec2(1.0, 1.0)), f.x), f.y); }
  float chiazze(vec3 p, float t) {
    vec2 q = vec2(dot(p, vec3(-0.838, 0.0, -0.546)), dot(p, vec3(-0.383, -0.713, 0.587))) / 1500.0;
    float n = rumore2(q + vec2(t * 0.03, 0.0)) * 0.62 + rumore2(q * 2.7 - vec2(0.0, t * 0.045)) * 0.38;
    return smoothstep(0.36, 0.64, n);
  }`;

// «tinta» sono i colori che dà la pagina: qui serve l'indaco della linfa. «M» sono i materiali del mobile: il braccio che
// tiene il mobile finisce nel suo stesso rovere
export function creaElicaViva({tinta, M}) {
  const {R, P} = MONDO, {SU, GIU} = VIVA, PER_GIRO = 33, OGNI = 3, PASSO_Y = P / PER_GIRO;
  const gruppo = new THREE.Group();
  const angolo = (y, filo) => -DUE_PI * y / P + (filo ? Math.PI : 0), quotaDi = i => (i + 0.5) * PASSO_Y;
  const iMin = -Math.round(GIU * PER_GIRO), iMax = Math.round(SU * PER_GIRO), yBasso = quotaDi(iMin), yAlto = quotaDi(iMax);
  let seme = 20261121; const caso = () => (seme = seme * 16807 % 2147483647) / 2147483647;
  const uTempo = {value: 0}, uChiazze = {value: new THREE.Vector2(0.42, 1.3)}, uLegno = {value: M.legno.map}, uTintaLegno = {value: new THREE.Color(1, 1, 1)};

  // I MATERIALI. «vivo» aggiunge a un materiale la luce a chiazze e, per le foglie, il respiro
  function vivo(m, foglia, braccio) {
    m.onBeforeCompile = sh => {
      sh.uniforms.uTempo = uTempo; sh.uniforms.uChiazze = uChiazze;
      if (braccio) { sh.uniforms.tLegno = uLegno; sh.uniforms.uTintaLegno = uTintaLegno; sh.uniforms.uFine = braccio.fine; }
      sh.vertexShader = 'uniform float uTempo; varying vec3 vMondo;\n' + (braccio ? 'attribute vec3 stadio; varying vec3 vStadio; varying vec2 vGiro;\n' : '') + sh.vertexShader
        .replace('#include <begin_vertex>', `#include <begin_vertex>
          ${braccio ? 'vStadio = stadio; vGiro = uv;' : ''}
          ${foglia ? `#ifdef USE_INSTANCING
            float fase = instanceMatrix[3].x * 0.0041 + instanceMatrix[3].y * 0.0033 + instanceMatrix[3].z * 0.0052, lungo = uv.y;
            transformed.z += sin(uTempo * 0.9 + fase) * 0.11 * lungo * lungo + sin(uTempo * 2.1 + fase * 1.7) * 0.02 * lungo;
            transformed.x += sin(uTempo * 0.6 + fase * 1.3) * 0.05 * lungo;
          #endif` : ''}`)
        .replace('#include <project_vertex>', `#include <project_vertex>
          vec4 pMondo = vec4(transformed, 1.0);
          #ifdef USE_INSTANCING
            pMondo = instanceMatrix * pMondo;
          #endif
          vMondo = (modelMatrix * pMondo).xyz;`);
      sh.fragmentShader = `uniform float uTempo; uniform vec2 uChiazze; varying vec3 vMondo; ${CHIAZZE}\n` + (braccio ? 'uniform sampler2D tLegno; uniform vec3 uTintaLegno; uniform float uFine; varying vec3 vStadio; varying vec2 vGiro;\n' : '') + sh.fragmentShader
        .replace('#include <map_fragment>', braccio ? `#include <map_fragment>
          // LA METAMORFOSI, lungo il braccio. «vStadio»: i millimetri dalla base, i millimetri di traverso, e da 0 a 1 quanto si è avanti
          float quiFine = uFine - vStadio.x;
          if (quiFine < 0.0) discard;
          // i fori: nascono piccoli, a passo 64, e crescono finché del pannello non resta niente
          float cresce = smoothstep(1750.0, 90.0, quiFine), rForo = 2.5 + 44.0 * cresce * cresce;
          float dForo = length(vec2(mod(vStadio.x, 64.0) - 32.0, mod(vStadio.y + 32.0, 64.0) - 32.0));
          if (cresce > 0.03 && dForo < rForo) discard;
          // la corteccia si pela (con il bordo frastagliato) e sotto c'è la venatura; poi il tondo diventa piano
          float pela = smoothstep(0.17, 0.36, vStadio.z + (rumore2(vec2(vStadio.x / 110.0, vGiro.y * 9.0)) - 0.5) * 0.14), piano = smoothstep(0.42, 0.62, vStadio.z);
          vec3 legno = texture2D(tLegno, vec2(mix(vGiro.y * 1.6, vStadio.y / 620.0 + 0.5, piano), vStadio.x / 1300.0)).rgb * uTintaLegno * 0.7;
          diffuseColor.rgb = mix(diffuseColor.rgb, legno, pela);
          if (cresce > 0.03) diffuseColor.rgb *= mix(1.0, 0.5, smoothstep(rForo + 6.0, rForo + 0.5, dForo));` : '#include <map_fragment>')
        .replace('#include <roughnessmap_fragment>', braccio ? '#include <roughnessmap_fragment>\nroughnessFactor = mix(roughnessFactor, 0.5, pela);' : '#include <roughnessmap_fragment>')
        .replace('#include <normal_fragment_maps>', braccio ? 'vec3 liscia = normal;\n#include <normal_fragment_maps>\nnormal = normalize(mix(normal, liscia, pela));' : '#include <normal_fragment_maps>')
        .replace('#include <opaque_fragment>', 'outgoingLight *= mix(uChiazze.x, uChiazze.y, chiazze(vMondo, uTempo));\n#include <opaque_fragment>');
    };
    m.customProgramCacheKey = () => 'viva' + (foglia ? 'F' : braccio ? 'B' : 'R');
    return m;
  }
  const [tCort, tRil] = teleCorteccia(), tFoglia = telaFoglia();
  const mRamo = vivo(new THREE.MeshStandardMaterial({map: tCort, bumpMap: tRil, bumpScale: 2.4, roughness: 0.84, envMapIntensity: 0.5}));
  const mTralcio = vivo(new THREE.MeshStandardMaterial({map: tCort, bumpMap: tRil, bumpScale: 1.2, color: new THREE.Color('#b9c88e'), roughness: 0.62, envMapIntensity: 0.5}));
  const mFoglia = vivo(new THREE.MeshStandardMaterial({map: tFoglia, emissiveMap: tFoglia, emissive: new THREE.Color('#31450f'), emissiveIntensity: 0.55, side: THREE.DoubleSide, roughness: 0.5, envMapIntensity: 0.55}), true);
  // la linfa: luce propria, a onde che salgono
  const mLinfa = new THREE.ShaderMaterial({uniforms: {uTempo, uColore: {value: new THREE.Color()}},
    vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `uniform float uTempo; uniform vec3 uColore; varying vec2 vUv;
      void main() { float p = fract(vUv.x / 5.0 - uTempo * 0.11), k = smoothstep(0.0, 0.1, p) * smoothstep(0.55, 0.1, p); gl_FragColor = vec4(uColore * (0.8 + 2.2 * k), 1.0); }`});
  const mGemma = new THREE.MeshBasicMaterial({color: 0xffffff});
  const cSpenta = new THREE.Color('#8f9a58'), cAccesa = new THREE.Color();
  const tingi = t => { mLinfa.uniforms.uColore.value.copy(t.filoA).multiplyScalar(1.5); cAccesa.copy(t.filoA).multiplyScalar(2.6); };
  tingi(tinta);

  // I DUE RAMI, dal basso in alto. Ogni ramo ondeggia attorno alla sua elica e cambia spessore
  const PASSO = 70, nP = Math.round((yAlto - yBasso) / PASSO) + 1, rami = [];
  const mRami = mucchio(), mTralci = mucchio(), mVene = mucchio(), rad = new V3();
  for (let filo = 0; filo < 2; filo++) {
    const Pn = [], Y = [], quadri = [];
    for (let i = 0; i < nP; i++) { const y = yBasso + i * PASSO, a = angolo(y, filo), r = R + 170 * onda(y / 2100, 1 + filo * 5);
      Y.push(y); Pn.push(new V3(Math.cos(a) * r, y + 110 * onda(y / 1500, 3 + filo * 2), Math.sin(a) * r)); }
    const grosso = i => VIVA.ramo * (1 + 0.17 * onda(Y[i] / 800, 7 + filo)), raggio = (i, th) => grosso(i) * (1 + 0.05 * Math.sin(3 * th + Y[i] / 600));
    tubo(mRami, Pn, raggio, 14, 1400, quadri, rad.set(Pn[0].x, 0, Pn[0].z).normalize());
    // attorno al ramo: i due tralci, uno di fronte all'altro (una piccola elica doppia attorno a quella grande), e la vena
    const attorno = (giro, fase, quanto) => Pn.map((p, i) => { const f = DUE_PI * Y[i] / giro + fase, q = quadri[i], d = quanto(i, f);
      return new V3(p.x + (q.N.x * Math.cos(f) + q.B.x * Math.sin(f)) * d, p.y + (q.N.y * Math.cos(f) + q.B.y * Math.sin(f)) * d, p.z + (q.N.z * Math.cos(f) + q.B.z * Math.sin(f)) * d); });
    VIVA.tralci.forEach((rt, j) => tubo(mTralci, attorno(2500, j * Math.PI + filo, (i, f) => raggio(i, f) + rt * (0.55 + 0.25 * onda(Y[i] / 500, j * 3))), i => rt * (1 + 0.12 * onda(Y[i] / 400, j + 2)), 7, 700));
    tubo(mVene, attorno(9000, 1.3 + filo * 2.1, (i, f) => raggio(i, f) * 0.98), () => VIVA.linfa, 6, 1000);
    rami.push({Pn, Y, quadri, grosso});
  }
  const metti = (g, m) => { const o = new THREE.Mesh(g, m); o.frustumCulled = false; gruppo.add(o); return o; };
  metti(forma(mRami), mRamo); metti(forma(mTralci), mTralcio); metti(forma(mVene), mLinfa);

  // I RAMETTI E LE FOGLIE. Un rametto è una forma sola, lunga 1: parte dritto e piega verso l'alto
  const curva = (t, o) => o.set(0.22 * t * t, t - 0.08 * t * t, 0), tangente = (t, o) => o.set(0.44 * t, 1 - 0.16 * t, 0);
  const mRam = mucchio(), pr = []; for (let i = 0; i <= 10; i++) pr.push(curva(i / 10, new V3()));
  tubo(mRam, pr, i => misto(0.034, 0.008, i / 10), 6, 0.9);
  const nRametti = Math.round((SU + GIU) * VIVA.RAMETTI) * 2;
  const gregge = (g, m, n) => { const o = new THREE.InstancedMesh(g, m, n); o.frustumCulled = false; o.count = 0; gruppo.add(o); return o; };
  const G = {rametto: gregge(forma(mRam), mTralcio, nRametti), foglia: gregge(formaFoglia(), mFoglia, nRametti * 12)};
  { const X = new V3(), Yv = new V3(), Z = new V3(), su = new V3(0, 1, 0), dir = new V3(), dove = new V3(), m4 = new THREE.Matrix4(), c = new V3(), tg = new V3(), lato = new V3(), Lx = new V3(), Ly = new V3(), Lz = new V3(), col = new THREE.Color();
    const passo = (yAlto - yBasso) / (nRametti / 2);
    rami.forEach((ramo, filo) => { for (let k = 0; k < nRametti / 2; k++) {
      const y = yBasso + (k + caso()) * passo, i = lim(Math.round((y - yBasso) / PASSO), 1, nP - 2), p = ramo.Pn[i];
      if (Math.abs(y) < 2300) continue;   // accanto al mobile il ramo è nudo: niente foglie davanti a chi guarda il palco
      // da che parte esce: in fuori, in su, in dentro, mai dritto in giù
      const f = misto(-0.7, 3.84, caso()); rad.set(p.x, 0, p.z).normalize();
      dir.copy(rad).multiplyScalar(Math.cos(f)).addScaledVector(su, Math.sin(f)).addScaledVector(ramo.quadri[i].T, (caso() - 0.5) * 0.9).normalize();
      Yv.copy(dir).addScaledVector(su, 0.35).normalize(); X.copy(su).addScaledVector(Yv, -su.dot(Yv)); if (X.lengthSq() < 0.01) X.copy(rad); X.normalize(); Z.crossVectors(X, Yv);
      // (verso il mobile i rametti sono più corti: gli lasciano l'aria)
      const lungo = misto(VIVA.rametto[0], VIVA.rametto[1], caso() * caso()) * misto(0.55, 1, dolce(tratto(Math.abs(y), 2300, 4600)));
      dove.copy(p).addScaledVector(dir, ramo.grosso(i) * 0.6);
      m4.makeBasis(X.clone().multiplyScalar(lungo), Yv.clone().multiplyScalar(lungo), Z.clone().multiplyScalar(lungo)).setPosition(dove);
      G.rametto.setMatrixAt(G.rametto.count++, m4);
      const mR = m4.clone(), n = 6 + Math.floor(caso() * 6), f0 = caso() * DUE_PI;
      for (let j = 0; j < n; j++) {
        const ultima = j === n - 1, t = ultima ? 1 : misto(0.2, 0.9, j / (n - 2));
        curva(t, c).applyMatrix4(mR); tangente(t, tg).transformDirection(mR);
        const g = j * 2.39996 + f0;   // l'angolo d'oro: ogni foglia gira un po' rispetto a quella prima, come sui rami veri
        lato.copy(X).multiplyScalar(Math.cos(g)).addScaledVector(Z, Math.sin(g));
        Ly.copy(tg).multiplyScalar(ultima ? 1 : 0.5).addScaledVector(lato, ultima ? 0.12 : 0.85).normalize();
        Lz.copy(su).addScaledVector(lato, (caso() - 0.5) * 0.7).addScaledVector(X, (caso() - 0.5) * 0.5); Lz.addScaledVector(Ly, -Lz.dot(Ly)); if (Lz.lengthSq() < 0.01) Lz.copy(X); Lz.normalize();   // la faccia verso la luce
        Lx.crossVectors(Ly, Lz);
        const lunga = misto(VIVA.foglia[0], VIVA.foglia[1], caso()) * (0.7 + 0.3 * lungo / VIVA.rametto[1]) * (ultima ? 1.08 : 1);
        m4.makeBasis(Lx.multiplyScalar(lunga), Ly.multiplyScalar(lunga), Lz.multiplyScalar(lunga)).setPosition(c);
        const quale = G.foglia.count++; G.foglia.setMatrixAt(quale, m4);
        // i verdi: più chiari e più gialli verso la punta del rametto, dove la foglia è giovane
        G.foglia.setColorAt(quale, col.setHSL(misto(0.225, 0.3, caso()) - t * 0.03, misto(0.3, 0.5, caso()), misto(0.2, 0.33, caso()) + t * 0.08, THREE.SRGBColorSpace));
      }
    } });
  }

  // I PIOLI: liane fra un ramo e l'altro. Mezza liana va dal ramo all'asse, e scende un po' verso il mezzo; le due metà
  // si incontrano in una gemma. Nel suo posto: x lungo il ramo, y in su, z verso fuori
  const FUORI = R - 60, mLia = mucchio(), pl = [];
  for (let i = 0; i <= 16; i++) { const u = i / 16; pl.push(new V3(130 * Math.sin(DUE_PI * u), -VIVA.cade * Math.sin(Math.PI / 2 * u), -u * FUORI)); }
  tubo(mLia, pl, i => misto(52, 24, i / 16), 6, 700);
  const gLiana = forma(mLia); gLiana.scale(1, 1, 1 / FUORI);
  const gGemma = new THREE.SphereGeometry(64, 14, 10); gGemma.scale(1, 1.5, 1);
  const pioli = []; for (let i = iMin; i <= iMax; i++) if (((i % OGNI) + OGNI) % OGNI === 1) pioli.push({i, y: quotaDi(i)});
  G.liana = gregge(gLiana, mTralcio, pioli.length * 2); G.gemma = gregge(gGemma, mGemma, pioli.length);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), su = new V3(0, 1, 0), pos = new V3(), sca = new V3();
  function posa(mesh, n, a, y, lx, ly, lz, sx, sy, sz) {
    const ca = Math.cos(a), sa = Math.sin(a);
    q.setFromAxisAngle(su, Math.PI / 2 - a); pos.set(sa * lx + ca * lz, y + ly, -ca * lx + sa * lz);
    mesh.setMatrixAt(n, m4.compose(pos, q, sca.set(sx, sy, sz)));
  }
  pioli.forEach(p => { p.mezzi = [0, 1].map(filo => ({a: angolo(p.y, filo), n: G.liana.count++})); p.gemma = G.gemma.count++; p.dentro = -1; p.chiusa = 0; G.gemma.setColorAt(p.gemma, cSpenta); });
  // «via» va da 0 a 1: a 1 la liana non c'è più (rientra nel ramo): attorno al mobile i pioli gli lasciano il posto
  function posaPiolo(p, via) {
    if (Math.abs(via - p.dentro) < 0.002) return false;
    p.dentro = via;
    const k = Math.max(0.0005, 1 - via), lunga = FUORI - misto(0, FUORI - 20, via);
    p.mezzi.forEach(mz => posa(G.liana, mz.n, mz.a, p.y, 0, 0, FUORI, k, k, lunga));
    const kg = Math.max(0.0005, k * (1 - p.chiusa)); posa(G.gemma, p.gemma, p.mezzi[0].a, p.y, 0, -VIVA.cade * k, 0, kg, kg, kg);
    return true;
  }
  // una gemma si può chiudere da sola («quanto» da 0 a 1), senza ritirare la liana: quando un testo della pagina le passa sopra
  function chiudiGemma(p, quanto) {
    if (Math.abs(quanto - p.chiusa) < 0.004) return;
    p.chiusa = quanto; const via = p.dentro; p.dentro = -1; posaPiolo(p, via);
    G.liana.instanceMatrix.needsUpdate = true; G.gemma.instanceMatrix.needsUpdate = true;
  }
  pioli.forEach(p => posaPiolo(p, 0));
  const viciniAlMobile = pioli.filter(p => Math.abs(p.y) < 6000);
  function ritira(alto) {
    let mosso = false;
    viciniAlMobile.forEach(p => { if (posaPiolo(p, 1 - dolce(tratto(Math.abs(p.y), alto, alto + 900)))) mosso = true; });
    if (mosso) { G.liana.instanceMatrix.needsUpdate = true; G.gemma.instanceMatrix.needsUpdate = true; }
  }
  // le gemme si accendono d'indaco: «quanto(p, n)» dice da 0 a 1 quanto è accesa la gemma del piolo n
  const cTmp = new THREE.Color();
  function accendi(quanto) {
    pioli.forEach((p, n) => G.gemma.setColorAt(p.gemma, cTmp.copy(cSpenta).lerp(cAccesa, quanto(p, n))));
    G.gemma.instanceColor.needsUpdate = true;
  }
  const quota = (a, filo, verso) => { const y = -(a - (filo ? Math.PI : 0)) * P / DUE_PI; return y + Math.round((verso - y) / P) * P; };

  // I BRACCI E LA METAMORFOSI (Paolo, alla Escher: prima l'organico, poi l'oggetto). Alla quota del mobile da ogni ramo
  // parte un braccio che va verso il mobile e lo tiene: il mobile è un piolo della catena, nato dai rami. Lungo il braccio
  // il ramo diventa venatura (la corteccia si pela e sotto c'è il rovere), poi pannello (il tondo si fa piano), poi foro
  // (i fori nascono piccoli e crescono, finché del pannello non resta niente). Dal tronco al mobile.
  // I bracci stanno nel mondo del mobile, non girano con l'elica: si rifanno quando l'elica cambia giro.
  const bracci = new THREE.Group(), BRACCIO = {lati: 16, passi: 110, grosso: [118, 96], alto: 170, spesso: 13, luce: 70};
  const mBracci = [0, 1].map(() => { const fine = {value: 1e6}, m = vivo(new THREE.MeshStandardMaterial({map: tCort, bumpMap: tRil, bumpScale: 2.4, roughness: 0.84, envMapIntensity: 0.5, side: THREE.DoubleSide}), false, {fine}); m.userData.fine = fine; return m; });
  const lunghi = [0, 0], via = [0, 0];
  function faiBracci(giro) {
    while (bracci.children.length) { const o = bracci.children.pop(); o.geometry.dispose(); }
    // il ramo 0 passa davanti al fianco destro del mobile alla quota y0; il ramo 1 è di fronte, alla stessa quota
    const y0 = quota(giro, 0, 800), c = Math.cos(giro), s = Math.sin(giro), K = BRACCIO.lati, N = BRACCIO.passi;
    [0, 1].forEach(filo => {
      const lato = filo ? -1 : 1, ramo = rami[filo], i = lim(Math.round((y0 - yBasso) / PASSO), 2, nP - 3), p0 = ramo.Pn[i];
      const P0 = new V3(p0.x * c + p0.z * s, p0.y, -p0.x * s + p0.z * c), P3 = new V3(lato * (400 + BRACCIO.luce), 0, 0), L = P0.distanceTo(P3);
      // esce dal ramo di traverso, sale appena, viene un po' avanti, e arriva al fianco in piano
      const punti = new THREE.CubicBezierCurve3(P0, new V3(P0.x - lato * L * 0.3, P0.y + L * 0.05, P0.z + L * 0.07), new V3(P3.x + lato * L * 0.42, 0, 0), P3).getSpacedPoints(N);
      const m = {pos: [], nor: [], uv: [], st: [], idx: []}, T = new V3(), Zf = new V3(), U = new V3(); let lungo = 0;
      punti.forEach((p, j) => {
        const t = j / N; T.subVectors(punti[Math.min(N, j + 1)], punti[Math.max(0, j - 1)]).normalize();
        Zf.set(0, 0, 1).addScaledVector(T, -T.z).normalize(); U.crossVectors(Zf, T);   // «Zf» è lo spessore del pannello (verso chi guarda), «U» la sua altezza
        if (j) lungo += p.distanceTo(punti[j - 1]);
        // alla base si allarga (esce dal ramo); finché è ramo ondeggia; poi il tondo diventa piano
        const r = misto(BRACCIO.grosso[0], BRACCIO.grosso[1], t) * (1 + 0.1 * onda(lungo / 500, 4 + filo) * (1 - dolce(tratto(t, 0.25, 0.5)))) * (1 + 0.4 * (1 - dolce(tratto(t, 0, 0.1))));
        const piano = dolce(tratto(t, 0.42, 0.62)), a = misto(r, BRACCIO.alto, piano), b = misto(r, BRACCIO.spesso, piano);
        for (let k = 0; k <= K; k++) { const th = k / K * DUE_PI, cx = Math.cos(th), cy = Math.sin(th), ax = Math.abs(cx), ay = Math.abs(cy), q = Math.max(ax, ay);
          const x = misto(r * cx, b * cx / q, piano), y = misto(r * cy, a * cy / q, piano);
          const fx = ax > ay + 1e-6 ? Math.sign(cx) : ay > ax + 1e-6 ? 0 : Math.sign(cx) * 0.7071, fy = ay > ax + 1e-6 ? Math.sign(cy) : ax > ay + 1e-6 ? 0 : Math.sign(cy) * 0.7071;
          let nx = misto(cx, fx, piano), ny = misto(cy, fy, piano); const nl = Math.hypot(nx, ny); nx /= nl; ny /= nl;
          m.pos.push(p.x + Zf.x * x + U.x * y, p.y + Zf.y * x + U.y * y, p.z + Zf.z * x + U.z * y); m.nor.push(Zf.x * nx + U.x * ny, Zf.y * nx + U.y * ny, Zf.z * nx + U.z * ny);
          m.uv.push(lungo / 1400, k / K); m.st.push(lungo, y, t); }
      });
      for (let j = 0; j < N; j++) for (let k = 0; k < K; k++) { const a = j * (K + 1) + k, b = a + K + 1; m.idx.push(a, a + 1, b, a + 1, b + 1, b); }
      const g = forma(m); g.setAttribute('stadio', new THREE.BufferAttribute(new Float32Array(m.st), 3));
      const o = new THREE.Mesh(g, mBracci[filo]); o.frustumCulled = false; bracci.add(o);
      lunghi[filo] = lungo; mBracci[filo].userData.fine.value = lungo - via[filo];
    });
  }
  // quando il mobile si apre i bracci si ritirano di qualche millimetro (destra, sinistra): gli fanno posto
  function ritiraBracci(destra, sinistra) { via[0] = destra; via[1] = sinistra; [0, 1].forEach(f => { mBracci[f].userData.fine.value = lunghi[f] - via[f]; }); }

  return {gruppo, bracci, faiBracci, ritiraBracci, pioli, ritira, accendi, chiudiGemma, tema: tingi, angolo, quota,
    tempo: t => { uTempo.value = t; uLegno.value = M.legno.map; uTintaLegno.value.copy(M.legno.color); },
    pezzi: G.rametto.count + G.foglia.count + G.liana.count + G.gemma.count};
}

// LA POLVERE NELLA LUCE: qualche centinaio di granelli fermi nell'aria attorno al mobile e lungo il volo. Lontano dal
// fuoco diventano dischi morbidi, come in un obiettivo vero. (Si disegnano da soli, sopra la foto sviluppata.)
export function creaPolvere(quanti, raggio, alto) {
  const pos = new Float32Array(quanti * 3), seme = new Float32Array(quanti);
  let s = 77; const caso = () => (s = s * 16807 % 2147483647) / 2147483647;
  for (let i = 0; i < quanti; i++) { const a = caso() * DUE_PI, r = Math.sqrt(caso()) * raggio; pos[i * 3] = Math.cos(a) * r; pos[i * 3 + 1] = (caso() - 0.5) * 2 * alto; pos[i * 3 + 2] = Math.sin(a) * r; seme[i] = caso(); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('seme', new THREE.BufferAttribute(seme, 1));
  const u = {uFuoco: {value: 4000}, uApertura: {value: 1}, uMaxR: {value: 20}, uAlta: {value: 900}, uTempo: {value: 0}, uColore: {value: new THREE.Color(1, 1, 1)}, uForza: {value: 0.5},
    tFondo: {value: null}, uSchermo: {value: new THREE.Vector2(1, 1)}, uVicino: {value: 60}, uLontano: {value: 100000}, uNebbia: {value: new THREE.Vector2(8000, 9000)}};
  const m = new THREE.ShaderMaterial({uniforms: u, transparent: true, depthTest: false, depthWrite: false, blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor, blendEquation: THREE.AddEquation,
    blendSrcAlpha: THREE.ZeroFactor, blendDstAlpha: THREE.OneFactor, toneMapped: false,
    vertexShader: `attribute float seme; uniform float uFuoco, uApertura, uMaxR, uAlta, uTempo; uniform vec2 uNebbia; varying float vForza; varying float vZ;
      void main() {
        vec3 p = position; p.y += sin(uTempo * (0.05 + seme * 0.07) + seme * 40.0) * 60.0; p.x += cos(uTempo * (0.04 + seme * 0.05) + seme * 17.0) * 45.0;
        vec4 mv = modelViewMatrix * vec4(p, 1.0); float z = max(-mv.z, 1.0); vZ = z;
        float nitido = 1.5 * uAlta / 900.0 * (0.5 + seme);
        float cerchio = min(abs(uApertura * (1.0 / uFuoco - 1.0 / z)), uMaxR * 1.6);
        float lato = nitido + cerchio * 2.0;
        gl_PointSize = lato; gl_Position = projectionMatrix * mv;
        // un granello sfocato è più largo e più tenue: la stessa luce su più punti
        vForza = (nitido * nitido) / (lato * lato) * (0.35 + 0.65 * seme) * exp(-pow(max(z - uNebbia.x, 0.0) / uNebbia.y, 1.6)) * smoothstep(150.0, 700.0, z);
      }`,
    fragmentShader: `#include <packing>
      uniform vec3 uColore; uniform float uForza, uVicino, uLontano; uniform sampler2D tFondo; uniform vec2 uSchermo; varying float vForza; varying float vZ;
      void main() {
        float d = length(gl_PointCoord - 0.5) * 2.0; if (d > 1.0) discard;
        float davanti = -perspectiveDepthToViewZ(texture2D(tFondo, gl_FragCoord.xy / uSchermo).x, uVicino, uLontano);
        if (davanti < vZ) discard;
        float k = smoothstep(1.0, 0.72, d) * vForza * uForza;
        gl_FragColor = vec4(uColore * k, 0.0);
      }`});
  const punti = new THREE.Points(g, m); punti.frustumCulled = false;
  return {punti, u};
}

// LA CAMERA IN GIRO PER IL MONDO: una posa è un punto attorno all'asse (l'angolo «a», il raggio «r», la quota «y») e un
// punto guardato. Fra due pose si va lungo una spirale, non in linea retta
export const nuovaPosa = (a, r, y, mira) => ({a, r, y, mira: mira ? mira.clone() : new V3()});
export function daPunto(p, mira, versoA) {
  let a = Math.atan2(p.z, p.x); if (versoA !== undefined) a += Math.round((versoA - a) / DUE_PI) * DUE_PI;
  return {a, r: Math.hypot(p.x, p.z), y: p.y, mira: mira.clone()};
}
export function mistaPose(A, B, k, esce) {
  esce.a = misto(A.a, B.a, k); esce.r = misto(A.r, B.r, k); esce.y = misto(A.y, B.y, k); esce.mira.lerpVectors(A.mira, B.mira, k); return esce;
}
export function metti(cam, p) { cam.position.set(Math.cos(p.a) * p.r, p.y, Math.sin(p.a) * p.r); cam.lookAt(p.mira); }
export {lim, tratto, dolce, misto};
