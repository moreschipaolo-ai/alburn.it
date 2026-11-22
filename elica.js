// Alburn, la pagina di alburn.it: l'elica a filo (22 novembre 2026).
// Paolo è tornato al filo della prima versione, più leggero e pulito, al posto dell'elica viva con rami e foglie (che
// resta nella storia dell'archivio, fino al commit d88b6c3).
import * as THREE from './three/three.module.js';

const V3 = THREE.Vector3, DUE_PI = Math.PI * 2;
const lim = (x, a, b) => Math.min(b, Math.max(a, x)), tratto = (p, a, b) => lim((p - a) / (b - a), 0, 1), dolce = x => x * x * (3 - 2 * x), misto = (a, b, k) => a + (b - a) * k;

// Due fili sottili,
// uno indaco e uno chiaro, e i pioli fini fra l'uno e l'altro, con un nodo dove toccano il filo. Avvolge il mobile da
// vicino: il mobile è grande, l'elica gli gira attorno. Quello che viene verso chi guarda svanisce, e svanisce anche quello
// che è lontano: si scioglie nella pagina, nella trasparenza (così il fondo è sempre quello della pagina, chiaro o scuro).
export const FILO = {R: 760, P: 1300, PIOLO: 130};
export function creaElicaFilo({tinta, grosso = 7, cima = 3250, fondo = -9000}) {
  const {R, P, PIOLO} = FILO, gruppo = new THREE.Group();
  const vicino = {value: new THREE.Vector2(0, 1)}, lontano = {value: new THREE.Vector2(1000, 9000)};
  const svanisce = m => { m.transparent = true; m.onBeforeCompile = sh => { sh.uniforms.uVicino = vicino; sh.uniforms.uLontano = lontano;
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform vec2 uVicino;\nuniform vec2 uLontano;').replace('#include <dithering_fragment>',
      '#include <dithering_fragment>\n\tgl_FragColor.a *= smoothstep(uVicino.x, uVicino.y, vViewPosition.z) * (1.0 - clamp((vViewPosition.z - uLontano.x) / (uLontano.y - uLontano.x), 0.0, 1.0));'); }; return m; };
  class Curva extends THREE.Curve { constructor(fase) { super(); this.fase = fase; }
    getPoint(t, o = new V3()) { const y = misto(cima, fondo, t), a = y / P * DUE_PI + this.fase; return o.set(Math.cos(a) * R, y, Math.sin(a) * R); } }
  const giri = (cima - fondo) / P;
  const mA = svanisce(new THREE.MeshPhysicalMaterial({color: tinta.filoA, roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.08})), mB = svanisce(new THREE.MeshPhysicalMaterial({color: tinta.filo, roughness: 0.28, clearcoat: 0.7}));
  [[0, mA], [Math.PI, mB]].forEach(([fase, m]) => { const o = new THREE.Mesh(new THREE.TubeGeometry(new Curva(fase), Math.round(giri * 72), grosso, 12), m); o.frustumCulled = false; gruppo.add(o); });
  const pioli = []; for (let y = Math.floor(cima / PIOLO) * PIOLO; y > fondo; y -= PIOLO) pioli.push({y, i: pioli.length});
  const mPiolo = svanisce(new THREE.MeshStandardMaterial({color: 0xffffff, metalness: 0.15, roughness: 0.35}));
  const aste = new THREE.InstancedMesh(new THREE.CylinderGeometry(grosso * 0.4, grosso * 0.4, 1, 10), mPiolo, pioli.length * 2), nodi = new THREE.InstancedMesh(new THREE.SphereGeometry(grosso * 1.7, 14, 10), mPiolo, pioli.length * 2);
  aste.frustumCulled = nodi.frustumCulled = false;
  const m4 = new THREE.Matrix4(), sc = new V3(), uno = new V3(1, 1, 1), q0 = new THREE.Quaternion(), su = new V3(0, 1, 0), pT = new V3(), cT = new THREE.Color();
  // ogni piolo è fatto di due metà, una per filo, che si incontrano sull'asse; «apre» da 0 a 1 le ritira verso i fili
  function posa(p, apre) { const d = p.dir, lungo = Math.max(0.001, R * (1 - apre)), mezzo = R * (1 + apre) / 2, k = apre > 0.985 ? 0.001 : 1;
    aste.setMatrixAt(p.i * 2, m4.compose(pT.set(d.x * mezzo, p.y, d.z * mezzo), p.verso, sc.set(k, lungo, k))); aste.setMatrixAt(p.i * 2 + 1, m4.compose(pT.set(-d.x * mezzo, p.y, -d.z * mezzo), p.verso, sc.set(k, lungo, k))); }
  pioli.forEach(p => { const a = p.y / P * DUE_PI; p.dir = new V3(Math.cos(a), 0, Math.sin(a)); p.verso = new THREE.Quaternion().setFromUnitVectors(su, p.dir);
    nodi.setMatrixAt(p.i * 2, m4.compose(new V3(p.dir.x * R, p.y, p.dir.z * R), q0, uno)); nodi.setMatrixAt(p.i * 2 + 1, m4.compose(new V3(-p.dir.x * R, p.y, -p.dir.z * R), q0, uno)); posa(p, 0); });
  gruppo.add(aste, nodi);
  const vicini = pioli.filter(p => Math.abs(p.y) < 4200);
  let t = tinta;
  return {gruppo, pioli, pezzi: pioli.length * 4 + 2,
    // i pioli che passerebbero dentro il mobile si ritirano: «vuoto» è la mezza altezza che gli si lascia. «corti» da 0 a 1
    // li ritira tutti verso i fili: attorno al mobile restano i due fili e i nodi, senza la ragnatela dei pioli visti dall'alto
    ritira(vuoto, corti = 0) { vicini.forEach(p => posa(p, Math.max(1 - dolce(tratto(Math.abs(p.y), vuoto, vuoto + 330)), corti))); aste.instanceMatrix.needsUpdate = true; },
    // i pioli si accendono d'indaco: «quanto(p, n)» dice da 0 a 1
    accendi(quanto) { pioli.forEach((p, n) => { cT.copy(t.piolo).lerp(t.filoA, quanto(p, n)); aste.setColorAt(p.i * 2, cT); aste.setColorAt(p.i * 2 + 1, cT); nodi.setColorAt(p.i * 2, cT); nodi.setColorAt(p.i * 2 + 1, cT); });
      aste.instanceColor.needsUpdate = true; nodi.instanceColor.needsUpdate = true; },
    // l'aria: da che distanza a che distanza svanisce quello che è vicino, e quello che è lontano
    aria(v0, v1, l0, l1) { vicino.value.set(v0, v1); lontano.value.set(l0, l1); },
    tema(nuova) { t = nuova; mA.color.copy(t.filoA); mB.color.copy(t.filo); }};
}

// LA CAMERA: una posa è un punto attorno all'asse dell'elica (l'angolo «a», il raggio «r», la quota «y») e un punto guardato
export const nuovaPosa = (a, r, y, mira) => ({a, r, y, mira: mira ? mira.clone() : new V3()});
export function metti(cam, p) { cam.position.set(Math.cos(p.a) * p.r, p.y, Math.sin(p.a) * p.r); cam.lookAt(p.mira); }
export {lim, tratto, dolce, misto};
