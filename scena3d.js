// Alburn, la pagina di alburn.it: il 3D (21 novembre 2026). Una scena fatta apposta per la pagina, con dati d'esempio:
// non è il motore vero di Alburn.
// - la doppia elica, in 3D vero: due fili e i loro pioli, con la profondità e la luce. Avvolge il mobile, gira e scende
//   con lo scorrere, e cinque dei suoi pioli diventano i passaggi (il pezzo, le lavorazioni, la tavola, la distinta,
//   la macchina);
// - il mobile d'esempio come in una foto di prodotto (le prime correzioni di Paolo, 21 novembre sera: più scuro, meno
//   bianco, più fotorealismo): il rovere con le fasce, le fibre, i pori e il loro rilievo, il laccato dei frontali con
//   un riflesso morbido, la ceramica smaltata, l'acciaio satinato; la luce di una stanza (RoomEnvironment), l'ombra
//   morbida, l'occlusione d'ambiente (GTAO) e lo sviluppo ACES, come una pellicola;
// - la tela piccola della scena viva, dove il mobile si allarga con la misura.
// Il modello (i pezzi, i fori) e il copione (quando si apre, quando nascono i fori) sono quelli di scena.js: qui si
// disegna soltanto. three.js sta nella cartella three/, copiato com'è con la sua licenza, e con lui la stanza della luce
// e il passaggio dell'occlusione (three/addons/, dagli esempi di three.js, copiati com'erano): niente si carica da
// altri siti. La venatura e la stanza si disegnano qui, una volta, e la pagina parte con quelle; poi arrivano, dalla
// sua stessa cartella, la foto di uno studio (luce/) e un rovere fotografato (legno/), di Poly Haven, licenza CC0
// (CREDITI.md), e prendono il loro posto (il terzo giro, 21 novembre notte).
// Senza WebGL, o per chi chiede meno movimento, questo file non fa niente: resta il disegno a spigoli di scena.js.
import * as THREE from './three/three.module.js';
import {RoomEnvironment} from './three/addons/environments/RoomEnvironment.js';
import {HDRLoader} from './three/addons/loaders/HDRLoader.js';
import {GTAOPass} from './three/addons/postprocessing/GTAOPass.js';
import {FullScreenQuad} from './three/addons/postprocessing/Pass.js';
import {MONDO, creaElicaViva, creaPolvere, nuovaPosa, mistaPose, metti} from './elica.js';

const A = window.ALBURN, SC = A && A.scena, doc = document, radice = doc.documentElement;
const lim = (x, a, b) => Math.min(b, Math.max(a, x)), tratto = (p, a, b) => lim((p - a) / (b - a), 0, 1), dolce = x => x * x * (3 - 2 * x), misto = (a, b, k) => a + (b - a) * k;
const gradi = g => g * Math.PI / 180;

if (SC && SC.mov()) { try { avvia(); } catch (e) { radice.classList.add('senza-tre'); /* senza WebGL restano il disegno a spigoli e le foto ferme dell'elica */ } }

function avvia() {
  const {P, H, S} = SC.misure, V3 = THREE.Vector3;
  const telaGrande = doc.getElementById('tre'), telaViva = doc.getElementById('vivo-tre');
  let dove = radice;   // da quale elemento si leggono i colori: la pagina, oppure una sezione della notte
  const stile = () => getComputedStyle(dove), colore = n => new THREE.Color(stile().getPropertyValue(n).trim());

  // ---------------------------------------------------------------------------------------------------------------
  // LA LUCE E I MATERIALI
  // la stanza che si specchia nei materiali e li illumina: la RoomEnvironment di three.js (le pareti, sei lampade
  // larghe), resa una volta in una mappa d'ambiente. Nessun file da scaricare
  // In più, come in uno studio, una lampada larga e bassa davanti a destra: è lei che si specchia, sfumata, nel laccato
  function ambiente(renderer) {
    const stanza = new RoomEnvironment(), pm = new THREE.PMREMGenerator(renderer);
    const bank = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({color: new THREE.Color().setScalar(LUCE.bank)}));
    bank.position.set(3.72, 0.68, 3.35); bank.rotation.y = gradi(48); bank.scale.set(4, 3.15, 0.1); stanza.add(bank);
    const t = pm.fromScene(stanza, 0.04).texture;
    bank.geometry.dispose(); bank.material.dispose(); stanza.dispose(); pm.dispose(); return t;
  }
  // il rovere, disegnato una volta, senza immagini da caricare. Tre tele uguali che si ripetono senza giunta (un metro
  // per lato): il colore (le fasce di crescita, le fibre, i pori), il rilievo (i pori sono solchi) e la ruvidezza
  // (i pori non brillano). La fibra corre in su, e tutte le fibre seguono la stessa onda lenta
  const ROVERE = {fondo: '#8c7355', scuro: '52,38,24', chiaro: '222,196,160'};
  let tele = null;
  function venatura() {
    if (tele) return tele;
    const N = 1024, DUE = Math.PI * 2, nuova = fondo => { const c = doc.createElement('canvas'); c.width = c.height = N; const x = c.getContext('2d'); x.fillStyle = fondo; x.fillRect(0, 0, N, N); x.lineCap = 'round'; return x; };
    const col = nuova(ROVERE.fondo), ril = nuova('#8c8c8c'), ruv = nuova('#989898');
    let seme = 20261121; const caso = () => (seme = seme * 16807 % 2147483647) / 2147483647;
    const f1 = caso() * DUE, f2 = caso() * DUE, f3 = caso() * DUE;
    const onda = (px, y) => (9 * Math.sin(DUE * y / N + f1) + 4 * Math.sin(DUE * 2 * y / N + f2)) * (0.65 + 0.35 * Math.sin(DUE * px / N + f3));
    // una linea lungo la fibra da y0 a y1, ripetuta ai bordi perché la tela non mostri la giunta
    const linea = (x, px, y0, y1, trema, fase) => { for (const d of [-N, 0, N]) { if (px + d < -90 || px + d > N + 90) continue; x.beginPath();
      for (let y = y0; y < y1; y += 16) x.lineTo(px + d + onda(px, y) + trema * Math.sin(DUE * 3 * y / N + fase), y);
      x.lineTo(px + d + onda(px, y1) + trema * Math.sin(DUE * 3 * y1 / N + fase), y1); x.stroke(); } };
    // le fasce di crescita: larghe e sfumate, quelle che si leggono anche da lontano
    for (let i = 0; i < 64; i++) {
      const px = caso() * N, larga = 10 + caso() * caso() * 110, a = 0.02 + caso() * 0.04, scura = caso() > 0.46, fase = caso() * DUE;
      for (let k = 0; k < 4; k++) { col.strokeStyle = `rgba(${scura ? ROVERE.scuro : ROVERE.chiaro},${a})`; col.lineWidth = larga * (1 - k * 0.22); linea(col, px, -16, N + 16, 1.5, fase); }
      ruv.strokeStyle = `rgba(${scura ? '255,255,255' : '0,0,0'},0.05)`; ruv.lineWidth = larga; linea(ruv, px, -16, N + 16, 1.5, fase);
    }
    // le fibre: migliaia di fili sottili, più scuri e più chiari
    for (let i = 0; i < 5200; i++) {
      const px = caso() * N, a = 0.02 + caso() * 0.085, scura = caso() > 0.38, fase = caso() * DUE, sp = 0.5 + caso() * 1.5;
      col.strokeStyle = `rgba(${scura ? ROVERE.scuro : ROVERE.chiaro},${a})`; col.lineWidth = sp; linea(col, px, -16, N + 16, 0.8, fase);
      if (i % 3 === 0) { ril.strokeStyle = `rgba(${scura ? '0,0,0' : '255,255,255'},${a * 1.6})`; ril.lineWidth = sp; linea(ril, px, -16, N + 16, 0.8, fase); }
    }
    // i pori del rovere: trattini scuri lungo la fibra, raccolti in file (il legno di primavera)
    for (let i = 0; i < 150; i++) {
      const fila = caso() * N, stretta = 3 + caso() * 16, quanti = 40 + caso() * 150;
      for (let k = 0; k < quanti; k++) {
        const px = fila + (caso() - 0.5) * stretta * 2, y = caso() * N, lungo = 5 + caso() * caso() * 46, a = 0.1 + caso() * 0.26, sp = 0.6 + caso() * 0.9;
        for (const dy of [-N, 0, N]) { if (y + dy + lungo < -8 || y + dy > N + 8) continue;
          col.strokeStyle = `rgba(${ROVERE.scuro},${a})`; col.lineWidth = sp; linea(col, px, y + dy, y + dy + lungo, 0, 0);
          ril.strokeStyle = `rgba(0,0,0,${Math.min(1, a * 1.9)})`; ril.lineWidth = sp + 0.4; linea(ril, px, y + dy, y + dy + lungo, 0, 0);
          ruv.strokeStyle = `rgba(255,255,255,${a})`; ruv.lineWidth = sp + 0.6; linea(ruv, px, y + dy, y + dy + lungo, 0, 0); }
      }
    }
    return (tele = {col: col.canvas, ril: ril.canvas, ruv: ruv.canvas});
  }
  const trama = (tela, colore) => { const t = new THREE.CanvasTexture(tela); t.wrapS = t.wrapT = THREE.RepeatWrapping; if (colore) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
  // l'ombra morbida sotto il mobile: una macchia sfumata, come in una foto di prodotto
  function macchia() {
    const c = doc.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'), g = x.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, 'rgba(0,0,0,0.62)'); g.addColorStop(0.3, 'rgba(0,0,0,0.38)'); g.addColorStop(0.62, 'rgba(0,0,0,0.12)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, 256, 256);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false})); m.rotation.x = -Math.PI / 2; return m;
  }
  // il foro visto di fronte: il buio in mezzo, e intorno il cuore chiaro del pannello
  let telaCuore = null;
  function cuore() {
    if (!telaCuore) { const c = telaCuore = doc.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, '#120e0a'); g.addColorStop(0.42, '#1c1610'); g.addColorStop(0.56, '#b7a37e'); g.addColorStop(1, '#d2c19c'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); }
    const t = new THREE.CanvasTexture(telaCuore); t.colorSpace = THREE.SRGBColorSpace; return t;
  }
  // i materiali, tutti fisici (PBR): quanto è ruvido, quanto è metallo, che cosa c'è sopra (la vernice, lo smalto)
  function materiali() {
    const v = venatura(), dallaPagina = (m, nome) => { m.userData.tinta = nome; return m; };   // il colore lo dà la pagina, e cambia con il tema
    return {
      // il rovere: opaco, con un filo di vernice che lo fa rispondere alla luce radente
      legno: Object.assign(new THREE.MeshPhysicalMaterial({map: trama(v.col, true), roughnessMap: trama(v.ruv), roughness: 1, bumpMap: trama(v.ril), bumpScale: 1, clearcoat: 0.12, clearcoatRoughness: 0.5}), {userData: {legno: true}}),
      // il laccato dei frontali: scuro e satinato, con un riflesso morbido della stanza
      frontale: dallaPagina(new THREE.MeshPhysicalMaterial({color: tinta.frontale, roughness: 0.4, clearcoat: 0.55, clearcoatRoughness: 0.3}), 'frontale'),
      // il frontale in evidenza nella scena viva: lo stesso laccato, in grigio chiaro (nella scena non c'è più il blu)
      vivo: dallaPagina(new THREE.MeshPhysicalMaterial({color: tinta.evidenza, roughness: 0.4, clearcoat: 0.55, clearcoatRoughness: 0.3}), 'evidenza'),
      // l'interno: le sponde e il fondo dei cassetti, le fasce e le facce della cassa che guardano dentro, nello stesso
      // antracite satinato dei frontali (un filo più opaco: dentro non ci si specchia). Dentro arriva poca luce: una soglia di
      // luce propria (LUCE.dentro) lo tiene leggibile, perché non diventi un buco nero
      interno: dallaPagina(new THREE.MeshPhysicalMaterial({color: tinta.frontale, emissive: tinta.frontale, emissiveIntensity: LUCE.dentro, roughness: 0.46, clearcoat: 0.4, clearcoatRoughness: 0.36}), 'frontale'),
      // la ceramica del lavabo: uno smalto lucido sopra un bianco caldo, non candido
      ceramica: dallaPagina(new THREE.MeshPhysicalMaterial({color: tinta.ceramica, roughness: 0.24, clearcoat: 1, clearcoatRoughness: 0.05, side: THREE.DoubleSide}), 'ceramica'),
      // l'acciaio satinato delle maniglie, e la lamiera verniciata delle guide e delle staffe
      metallo: new THREE.MeshStandardMaterial({color: 0xb4b2ae, metalness: 1, roughness: 0.34}),
      lamiera: new THREE.MeshStandardMaterial({color: 0x74767a, metalness: 0.75, roughness: 0.46}),
      // il foro: sull'antracite si vede il cuore chiaro del pannello, con il buio in mezzo
      foro: new THREE.MeshBasicMaterial({map: cuore(), polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2}),
      buio: new THREE.MeshBasicMaterial({color: 0x080706, transparent: true})
    };
  }

  // ---------------------------------------------------------------------------------------------------------------
  // IL MOBILE: dal modello di scena.js (scatole in millimetri: x la larghezza, y la profondità, z l'altezza) alle forme
  // una scatola con la venatura che corre lungo «vena» ('x', 'y' o 'z' di three), nella misura vera
  function scatola(w, h, d, vena, sfasa, tondo) {
    let g;
    if (tondo) {
      const r = Math.min(tondo, w / 2.5, h / 2.5, d / 2.5), a = w / 2 - r, b = h / 2 - r, sagoma = new THREE.Shape();
      sagoma.moveTo(-a, -h / 2 + r); sagoma.lineTo(a, -h / 2 + r); sagoma.lineTo(a, b); sagoma.lineTo(-a, b); sagoma.closePath();
      g = new THREE.ExtrudeGeometry(sagoma, {depth: d - 2 * r, bevelEnabled: true, bevelThickness: r, bevelSize: r, bevelSegments: 3, curveSegments: 4}); g.translate(0, -r / 2 + r / 2, -(d - 2 * r) / 2);
    } else g = new THREE.BoxGeometry(w, h, d);
    if (!vena) return g;
    const uv = g.attributes.uv, pos = g.attributes.position, nor = g.attributes.normal, K = 1 / 1000;
    for (let i = 0; i < uv.count; i++) {
      const q = {x: pos.getX(i), y: pos.getY(i), z: pos.getZ(i)}, nx = Math.abs(nor.getX(i)), ny = Math.abs(nor.getY(i)), nz = Math.abs(nor.getZ(i));
      const assi = nx > ny && nx > nz ? ['z', 'y'] : ny > nz ? ['x', 'z'] : ['x', 'y'];
      const lungo = assi.includes(vena) ? vena : assi[1], traverso = assi[0] === lungo ? assi[1] : assi[0];
      uv.setXY(i, q[traverso] * K + sfasa, q[lungo] * K + sfasa * 1.7);
    }
    return g;
  }
  // il lavabo: un pezzo solo di ceramica, largo «w», spesso «h», profondo «d». Il piano ha lo spigolo arrotondato; la
  // vasca è un rettangolo stondato dai raggi ampi, che scende dal piano con un raccordo morbido (nessuno spigolo fra
  // piano e vasca), ha le pareti inclinate e il fondo piano: meno scodella, più lavabo (Paolo, 21 novembre sera).
  // Dà la forma e quanto è fonda la vasca
  function lavabo(w, h, d) {
    const a = Math.min(w * 0.36, 300), b = 165, fonda = 96, parete = 0.64, stondo = 3, r = 3.5, pelle = 13;
    // le righe della griglia: fitte sul bordo (lo spigolo arrotondato), larghe dentro
    const righe = (meta, passi) => { const o = [-meta, -meta + 0.5, -meta + 1.4, -meta + r]; for (let i = 1; i < passi; i++) o.push(-meta + r + (2 * meta - 2 * r) * i / passi); o.push(meta - r, meta - 1.4, meta - 0.5, meta); return o; };
    const xs = righe(w / 2, Math.round(w / 9)), zs = righe(d / 2, 56), nx = xs.length, nz = zs.length, molle = k => k * k * k * (k * (k * 6 - 15) + 10);
    // di quanto scende la vasca in un punto: zero fuori, tutta la profondità sul fondo, e una curva a S in mezzo
    const scende = (x, z, larga) => fonda * molle(lim((1 - Math.pow(Math.pow(Math.abs(x) / (a * larga), stondo) + Math.pow(Math.abs(z) / (b * larga), stondo), 1 / stondo)) / parete, 0, 1));
    const spigolo = q => q >= r ? 0 : r - Math.sqrt(r * r - (r - q) * (r - q));
    const pos = [], ind = [], N = nx * nz;
    zs.forEach(z => xs.forEach(x => pos.push(x, h / 2 - Math.max(spigolo(w / 2 - Math.abs(x)), spigolo(d / 2 - Math.abs(z))) - scende(x, z, 1), z)));   // sopra
    zs.forEach(z => xs.forEach(x => pos.push(x, Math.min(-h / 2, h / 2 - pelle - scende(x, z, 1.07)), z)));                                           // sotto: la pancia della vasca
    for (let j = 0; j < nz - 1; j++) for (let i = 0; i < nx - 1; i++) { const p = j * nx + i, q = p + N; ind.push(p, p + nx, p + 1, p + 1, p + nx, p + nx + 1, q, q + 1, q + nx, q + 1, q + nx + 1, q + nx); }
    // la fascia intorno, dal piede dello spigolo arrotondato al sotto
    const su = h / 2 - r, giu = -h / 2, angoli = [[-w / 2, d / 2], [w / 2, d / 2], [w / 2, -d / 2], [-w / 2, -d / 2]];
    angoli.forEach((p, i) => { const q = angoli[(i + 1) % 4], n = pos.length / 3; pos.push(p[0], giu, p[1], q[0], giu, q[1], q[0], su, q[1], p[0], su, p[1]); ind.push(n, n + 1, n + 2, n, n + 2, n + 3); });
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(ind); g.computeVertexNormals();
    return {forma: g, fonda};
  }
  function costruisci(mob, M, opz) {
    const L = mob.L, gruppo = new THREE.Group(), parti = [], segni = [], n = mob.disegnati;
    const v3 = e => new V3(e[0], e[2], -e[1]);
    mob.pezzi.forEach((z, k) => {
      const b = z.b, w = b[3] - b[0], h = b[5] - b[2], d = b[4] - b[1], centro = [(b[0] + b[3]) / 2, (b[1] + b[4]) / 2, (b[2] + b[5]) / 2];
      const base = new V3(centro[0] - L / 2, centro[2] - H / 2, -(centro[1] - P / 2)), ogg = new THREE.Group(), mats = [];
      const mat = m => { const c = opz.propri ? m.clone() : m; mats.push(c); return c; };
      const forma = (g, m, x, y, zz) => { const mesh = new THREE.Mesh(g, mat(m)); mesh.position.set(x || 0, y || 0, zz || 0); mesh.castShadow = mesh.receiveShadow = true; ogg.add(mesh); return mesh; };
      if (z.vasca) {
        // il lavabo che fa da top, in un pezzo solo di ceramica: il piano e la vasca morbida, più lo scarico
        const v = lavabo(w, h, d); forma(v.forma, M.ceramica);
        forma(new THREE.CylinderGeometry(21, 21, 2, 32), M.metallo, 0, h / 2 - v.fonda + 1, 0);
      } else if (z.aperto) {
        // il cassetto: le sponde, il fondo e lo schienale, tutti nell'antracite dell'interno
        const s = 13;
        forma(scatola(s, h, d, null, 0, 1.5), M.interno, -w / 2 + s / 2, 0, 0); forma(scatola(s, h, d, null, 0, 1.5), M.interno, w / 2 - s / 2, 0, 0);
        forma(scatola(w - 2 * s, 14, d), M.interno, 0, -h / 2 + 7, 0); forma(scatola(w - 2 * s, h - 20, 14), M.interno, 0, -4, -d / 2 + 7);
      } else if (z.m === 'legno') {
        // i pannelli: i frontali laccati; le fasce, che stanno dentro, antracite; i fianchi e il fondo di rovere, con
        // la faccia che guarda dentro la cassa rivestita di antracite (una pelle a filo, dentro lo spigolo di rovere)
        const fr = z.id.indexOf('frontale') === 0, tutto = z.dentro === 'tutto', vena = w > h && w > d ? 'x' : h >= d ? 'y' : 'z', r = 2.2;
        forma(scatola(w, h, d, fr || tutto ? null : vena, (k * 0.137) % 1, r), fr ? (opz.evidenzia && z.vivo ? M.vivo : M.frontale) : tutto ? M.interno : M.legno);
        if (z.dentro && !tutto) {
          const sopra = z.dentro === 'z1', verso = z.dentro === 'x1' ? 1 : -1;
          const pelle = sopra ? forma(new THREE.PlaneGeometry(w - 2 * r, d - 2 * r), M.interno, 0, h / 2 + 0.3, 0) : forma(new THREE.PlaneGeometry(d - 2 * r, h - 2 * r), M.interno, verso * (w / 2 + 0.3), 0, 0);
          if (sopra) pelle.rotation.x = -Math.PI / 2; else pelle.rotation.y = verso * Math.PI / 2;
          pelle.castShadow = false; pelle.userData.pelle = true;
        }
      } else forma(scatola(w, h, d, null, 0, 2), z.id.indexOf('maniglia') === 0 ? M.metallo : M.lamiera);
      // i fori: un disco sulla faccia (il cuore chiaro del pannello, con il buio in mezzo), e l'anello che lo fa nascere
      const fori = z.fori.map(f => {
        const disco = new THREE.Mesh(geoDisco, M.foro), anello = new THREE.Mesh(geoAnello, new THREE.MeshBasicMaterial({color: SEGNO_CHIARO, transparent: true, depthWrite: false})), r = f.d / 2 * 1.5;
        const dove = f.f === 'x0' ? new V3(-w / 2 - 0.6, f.b - centro[2], -(f.a - centro[1])) : new V3(f.a - centro[0], f.b - centro[2], d / 2 + 0.6);
        [disco, anello].forEach(m => { m.position.copy(dove); if (f.f === 'x0') m.rotation.y = -Math.PI / 2; m.visible = false; ogg.add(m); segni.push(m); });
        return {disco, anello, r, o: f.o, dove, lato: f.f};
      });
      ogg.position.copy(base); gruppo.add(ogg);
      parti.push({z, ogg, mats, base, e1: v3(z.e1), e2: v3(z.e2), fori});
    });
    // i fili che legano i fori del fianco al componente che li chiede
    const fdx = parti.find(q => q.z.id === 'fianco_dx'), punti = new Float32Array(fdx.fori.length * 6);
    const fili = new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(punti, 3)), new THREE.LineBasicMaterial({color: SEGNO_CHIARO, transparent: true, opacity: 0}));
    fili.visible = false; fdx.ogg.add(fili);
    // il buio dentro il mobile chiuso: dalle fessure fra i frontali non passa la luce della stanza
    const buio = new THREE.Mesh(new THREE.PlaneGeometry(L - 2 * S, H - 4), M.buio); buio.position.set(0, 0, P / 2 - 1.5); gruppo.add(buio); segni.push(buio);
    return {gruppo, parti, fdx, fili, n, segni, buio};
  }
  function butta(c) { c.gruppo.traverse(o => { if (o.geometry && o.geometry !== geoDisco && o.geometry !== geoAnello) o.geometry.dispose(); }); }
  // il mobile al suo posto: aperto di E1 e E2, con lo sguardo sul fianco (fuoco) e i fori che nascono
  function atteggia(c, st) {
    c.parti.forEach(q => {
      q.ogg.position.set(q.base.x + q.e1.x * st.E1 + q.e2.x * st.E2, q.base.y + q.e1.y * st.E1 + q.e2.y * st.E2, q.base.z + q.e1.z * st.E1 + q.e2.z * st.E2);
      const velo = q.z.fuoco ? 1 : misto(1, 0.05, st.fuoco), vela = velo < 0.999; q.velato = velo <= 0.5;
      q.mats.forEach(m => { if (m.transparent !== vela) { m.transparent = vela; m.depthWrite = !vela; m.needsUpdate = true; } m.opacity = velo; });
      q.ogg.traverse(o => { if (o.isMesh && o.geometry !== geoDisco && o.geometry !== geoAnello) o.castShadow = velo > 0.5 && !o.userData.pelle; });
      q.fori.forEach(f => {
        const nato = dolce(tratto(st.fori, f.o / c.n * 0.78, f.o / c.n * 0.78 + 0.22));
        f.nato = nato; f.disco.visible = nato > 0.01 && velo > 0.5; f.disco.scale.setScalar(f.r * Math.max(nato, 0.01));
        f.anello.visible = nato > 0.01 && nato < 0.99 && velo > 0.5; f.anello.scale.setScalar(f.r * (1 + 3.2 * (1 - nato))); f.anello.material.opacity = 1 - nato;
      });
    });
    const chiuso = 1 - tratto(st.E1, 0, 0.06); c.buio.visible = chiuso > 0.01; c.buio.material.opacity = chiuso;
    const p = c.fili.geometry.attributes.position, k = st.fuoco * st.E2;
    c.fili.visible = k > 0.02; c.fili.material.opacity = k * 0.9;
    if (c.fili.visible) { c.fdx.fori.forEach((f, i) => { const lungo = f.nato > 0.01 ? 95 * st.E2 : 0; p.setXYZ(i * 2, f.dove.x, f.dove.y, f.dove.z); p.setXYZ(i * 2 + 1, f.dove.x - lungo, f.dove.y, f.dove.z); }); p.needsUpdate = true; }
  }
  // lo sguardo: guarda «centro» da davanti a sinistra (az) e dall'alto (el), alla distanza che fa stare mezza larghezza
  // «hw» e mezza altezza «hh» in una parte «parte» della tela; «su» abbassa il soggetto, «lato» lo sposta di fianco
  function guarda(cam, centro, hw, hh, az, el, parte, su, lato) {
    const tv = Math.tan(gradi(cam.fov) / 2), d = Math.max(hh / parte / tv, hw / 0.88 / (tv * cam.aspect));
    const cx = centro.x - Math.cos(az) * lato * d * tv * cam.aspect, cy = centro.y + su * 2 * d * tv, cz = centro.z - Math.sin(az) * lato * d * tv * cam.aspect;
    cam.position.set(cx - Math.sin(az) * Math.cos(el) * d, cy + Math.sin(el) * d, cz + Math.cos(az) * Math.cos(el) * d); cam.lookAt(cx, cy, cz);
    return d;
  }
  // la luce che fa le ombre: una sola, calda, da davanti a sinistra e dall'alto, con il bordo dell'ombra sfumato. Il
  // resto della luce viene dalla stanza
  function luci(scena, ampia) {
    const sole = new THREE.DirectionalLight(0xfff1e0, LUCE.sole); sole.position.set(-1500, 2700, 2300); sole.castShadow = true;
    const o = sole.shadow.camera; o.left = -ampia; o.right = ampia; o.top = ampia; o.bottom = -ampia; o.near = 400; o.far = 8000;
    sole.shadow.mapSize.setScalar(innerWidth < 720 ? 1024 : 2048); sole.shadow.bias = -0.0004; sole.shadow.normalBias = 2.5; sole.shadow.radius = LUCE.sfumo;
    scena.add(sole, sole.target);
    scena.environmentIntensity = LUCE.stanza; scena.environmentRotation.y = gradi(LUCE.giro);
    const terra = macchia(); terra.material.opacity = tinta.ombra; scena.add(terra);
    return {sole, terra};
  }
  // quanta luce: il sole, la stanza (e di quanto è girata attorno al mobile), lo sfumo dell'ombra, il pannello di studio, la luce di fondo dell'interno;
  // poi lo studio vero (l'HDRI): quanto illumina, di quanto è girato, il tetto alle sue lampade, il pannello appeso sopra
  const LUCE = {sole: 1.9, stanza: 0.75, giro: 0, sfumo: 3.5, bank: 1.7, dentro: 0.8, studio: 0.9, giroStudio: 235, tetto: 12, cielo: 2.5, mondo: 0.4};
  const numero = (n, senza) => { const v = parseFloat(stile().getPropertyValue(n)); return isFinite(v) ? v : senza; };
  const tinte = () => ({frontale: colore('--tre-frontale'), ceramica: colore('--tre-ceramica'), evidenza: colore('--tre-evidenza'), filoA: colore('--tre-filo-a'), filo: colore('--tre-filo'), piolo: colore('--tre-piolo'), acceso: colore('--tre-acceso'), segno: colore('--tre-segno'),
    ombra: numero('--tre-ombra', 0.3), esposizione: numero('--tre-esposizione', 0.9), polvere: colore('--tre-polvere'), polvereForza: numero('--tre-polvere-forza', 0.5)});
  let tinta = tinte();
  // LA NOTTE: dall'apertura al palco la scena grande ha sempre i colori della notte, per tutti (Paolo, 21 novembre). La
  // scena viva, più sotto, segue il tema del computer
  const quiNotte = doc.getElementById('apri'), tinteNotte = () => { dove = quiNotte; const t = tinte(); dove = radice; return t; };
  let tintaNotte = tinteNotte();
  const geoDisco = new THREE.CircleGeometry(1, 24), geoAnello = new THREE.RingGeometry(1.05, 1.42, 32);
  const SEGNO_CHIARO = 0xf2efe8;   // gli anelli e i fili dei fori stanno sempre sull'antracite: chiari. Nella scena non c'è il blu
  // lo sviluppo, come una pellicola: ACES. Le ombre con il bordo sfumato (PCF)
  const nuovoRenderer = canvas => { const r = new THREE.WebGLRenderer({canvas, antialias: true, alpha: true, powerPreference: 'high-performance'});
    r.setPixelRatio(Math.min(2, devicePixelRatio || 1)); r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = tinta.esposizione; r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFShadowMap; return r; };

  // L'OCCLUSIONE D'AMBIENTE, L'ARIA, LO SFOCATO E LO SVILUPPO. La scena si rende in una tela d'appoggio, con i colori
  // ancora lineari e con la sua profondità; il passaggio GTAO di three.js guarda le forme (senza quello che è
  // trasparente: «nascosti» dà l'elenco) e scurisce gli angoli, le fessure e i punti dove due pezzi si toccano; poi un
  // solo passaggio fa il cinema e sviluppa:
  // - L'ARIA: quello che è lontano si scioglie nella pagina (nella trasparenza, non in un colore: così il fondo è
  //   sempre quello della pagina, nel tema chiaro e nello scuro);
  // - LO SFOCATO: un obiettivo vero ha un piano a fuoco; davanti e dietro i punti diventano dischi. Per ogni punto si
  //   guardano «prese» punti attorno, su una spirale, e si prende quello che il loro disco copre;
  // - LO SVILUPPO (ACES), e un'ombra leggera ai bordi del quadro.
  // Se la scheda grafica non regge, o se i quadri rallentano, si scende di un gradino alla volta: senza occlusione, poi
  // con meno prese, poi senza sfocato. L'aria resta sempre.
  function sviluppo(R, scena, cam, nascosti, cinema) {
    let acceso = false, conAO = true, appoggio, uscita, ao, quadro, quadroSfoca, mezza, fondo = null;
    const U = {tDiffuse: {value: null}, tFondo: {value: null}, uPasso: {value: new THREE.Vector2(1, 1)}, uVicino: {value: 1}, uLontano: {value: 2}, uFuoco: {value: 4000}, uApertura: {value: 0}, uMaxR: {value: 1}, uNitido: {value: 1},
      uNebbia: {value: new THREE.Vector2(1e7, 1e7)}, uPrese: {value: 0}, uVignetta: {value: 0}, uTan: {value: new THREE.Vector2(1, 1)}, uSu: {value: new THREE.Vector4(0, 1, 0, 0)}, uAlto: {value: new THREE.Vector4(1e7, 2e7, -1e7, -2e7)}, tSfocato: {value: null}};
    const ottica = {fuoco: 4000, apertura: 0, nebbia0: 1e7, nebbiaL: 1e7, alto0: 1e7, alto1: 2e7, basso0: -1e7, basso1: -2e7, prese: 56, vignetta: 0.16, massimo: 20};
    try {
      // (le tele d'appoggio hanno i colori a virgola mobile: se la scheda grafica non li sa scrivere, niente occlusione)
      if (!R.capabilities.isWebGL2 || !(R.extensions.has('EXT_color_buffer_half_float') || R.extensions.has('EXT_color_buffer_float'))) throw new Error('niente tele a virgola mobile');
      if (cinema) { fondo = new THREE.DepthTexture(4, 4); fondo.minFilter = fondo.magFilter = THREE.NearestFilter; }
      appoggio = new THREE.WebGLRenderTarget(4, 4, Object.assign({type: THREE.HalfFloatType, samples: 4}, cinema ? {depthTexture: fondo} : {})); uscita = new THREE.WebGLRenderTarget(4, 4, {type: THREE.HalfFloatType, depthBuffer: false});
      if (cinema) [appoggio, uscita].forEach(t => { t.texture.generateMipmaps = true; t.texture.minFilter = THREE.LinearMipmapLinearFilter; });
      ao = new GTAOPass(scena, cam, 4, 4, undefined, {radius: 120, distanceExponent: 1.5, thickness: 120, distanceFallOff: 1, scale: 1.6, samples: 16}, {lumaPhi: 10, depthPhi: 28, normalPhi: 3, radius: 5, rings: 2, samples: 12});
      ao.normalMaterial.side = THREE.DoubleSide;
      const via = ao._overrideVisibility.bind(ao), torna = ao._restoreVisibility.bind(ao); let spenti = [];
      ao._overrideVisibility = () => { via(); nascosti().forEach(o => { if (o.visible) { o.visible = false; spenti.push(o); } }); R.shadowMap.autoUpdate = false; };   // (le ombre sono già fatte)
      ao._restoreVisibility = () => { torna(); spenti.forEach(o => { o.visible = true; }); spenti = []; R.shadowMap.autoUpdate = true; };
      const SEMPLICE = 'uniform sampler2D tDiffuse; varying vec2 vUv;\nvoid main() {\n\tvec4 c = texture2D(tDiffuse, vUv);\n\tgl_FragColor = vec4(c.a > 0.0 ? c.rgb / c.a : vec3(0.0), c.a);\n\t#include <tonemapping_fragment>\n\t#include <colorspace_fragment>\n\tgl_FragColor.rgb *= gl_FragColor.a;\n}';
      // (lo sfocato si calcola a metà misura, in una tela sua, e poi si compone con la foto nitida: costa un quarto, e i
      // bordi sfocati vengono morbidi)
      const COMUNE = `#include <packing>
        uniform sampler2D tDiffuse; uniform sampler2D tFondo; uniform sampler2D tSfocato; uniform vec2 uPasso; uniform vec2 uNebbia; uniform int uPrese;
        uniform float uVicino, uLontano, uFuoco, uApertura, uMaxR, uNitido, uVignetta; uniform vec2 uTan; uniform vec4 uSu; uniform vec4 uAlto; varying vec2 vUv;
        // quanto è lontano un punto; il raggio del suo disco di sfocato (zero attorno al piano a fuoco)
        float lontano(vec2 uv) { return -perspectiveDepthToViewZ(texture2D(tFondo, uv).x, uVicino, uLontano); }
        float disco(float z) { return min(max(abs(uApertura * (1.0 / uFuoco - 1.0 / z)) - uNitido, 0.0), uMaxR); }
        // l'aria: quello che è lontano si scioglie, e anche quello che è molto in alto o molto in basso (la foschia): la
        // quota di un punto si ricava da dove sta nel quadro e da quanto è lontano
        float aria(vec2 uv, float z) { float y = dot(uSu.xyz, vec3((uv * 2.0 - 1.0) * uTan, -1.0) * z) + uSu.w;
          return exp(-pow(max(z - uNebbia.x, 0.0) / uNebbia.y, 1.6)) * (1.0 - smoothstep(uAlto.x, uAlto.y, y)) * (1.0 - smoothstep(uAlto.z, uAlto.w, y)); }
        float rumore(vec2 p) { return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715)))); }
      `;
      const SFOCA = COMUNE + `
        void main() {
          float zc = lontano(vUv), rc = disco(zc);
          vec4 somma = textureLod(tDiffuse, vUv, 1.0) * aria(vUv, zc); float tot = 1.0;
          float giro = 0.0, n = float(uPrese);   // (la spirale delle prese è sempre la stessa: girarla a caso punto per punto dava bordi a puntini)
          for (int i = 0; i < uPrese; i++) {
            float fi = float(i) + 0.5, r = sqrt(fi / n) * uMaxR, a = fi * 2.39996323 + giro;
            vec2 uv = vUv + vec2(cos(a), sin(a)) * r * uPasso;
            float z = lontano(uv), rs = disco(z);
            if (z > zc) rs = min(rs, rc * 2.0);                                  // quello che sta dietro non sbava su quello che è a fuoco davanti
            float m = smoothstep(r - 0.5, r + 0.5, rs);
            vec4 c = textureLod(tDiffuse, uv, clamp(log2(max(r, 1.0)) - 1.6, 1.0, 3.5)) * aria(uv, z);
            somma += mix(somma / tot, c, m); tot += 1.0;
          }
          gl_FragColor = somma / tot;
        }`;
      const CINEMA = COMUNE + `
        void main() {
          float zc = lontano(vUv);
          vec4 c = texture2D(tDiffuse, vUv) * aria(vUv, zc);
          if (uPrese > 0) {
            // quanto è sfocato questo punto: per conto suo, o perché gli passa davanti qualcosa di sfocato
            float k = smoothstep(0.5, 2.2, disco(zc));
            for (int i = 0; i < 16; i++) {
              float r = uMaxR * (i < 8 ? 0.28 : 0.6), a = float(i) * 0.7853982 + (i < 8 ? 0.0 : 0.39);
              float z = lontano(vUv + vec2(cos(a), sin(a)) * r * uPasso);
              if (z < zc) k = max(k, smoothstep(r * 0.75, r * 1.25, disco(z)));
            }
            c = mix(c, texture2D(tSfocato, vUv), k);
          }
          gl_FragColor = vec4(c.a > 0.0 ? c.rgb / c.a : vec3(0.0), c.a);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
          gl_FragColor.rgb *= gl_FragColor.a;
          // l'ombra ai bordi del quadro: scurisce anche la pagina che sta dietro
          vec2 q = (vUv - 0.5) * vec2(1.0, 0.86); float v = uVignetta * smoothstep(0.34, 0.78, length(q));
          gl_FragColor = vec4(gl_FragColor.rgb * (1.0 - v), 1.0 - (1.0 - gl_FragColor.a) * (1.0 - v));
        }`;
      const VERT = 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';
      quadro = new FullScreenQuad(new THREE.ShaderMaterial({uniforms: U, depthTest: false, depthWrite: false, blending: THREE.NoBlending, vertexShader: VERT, fragmentShader: cinema ? CINEMA : SEMPLICE}));
      if (cinema) { mezza = new THREE.WebGLRenderTarget(4, 4, {type: THREE.HalfFloatType, depthBuffer: false});
        quadroSfoca = new FullScreenQuad(new THREE.ShaderMaterial({uniforms: U, depthTest: false, depthWrite: false, blending: THREE.NoBlending, toneMapped: false, vertexShader: VERT, fragmentShader: SFOCA})); }
      acceso = true;
    } catch (e) { acceso = false; }
    return {
      acceso: () => acceso && conAO, cinema: () => acceso && !!cinema, spegni: () => { if (cinema) conAO = false; else acceso = false; }, ottica, fondo: () => fondo,
      misura(larga, alta) { if (!acceso) return; const d = R.getPixelRatio(), w = Math.max(2, Math.round(larga * d)), h = Math.max(2, Math.round(alta * d)), k = w * h > 9e6 ? 0.5 : 1;   // (oltre nove milioni di punti l'occlusione si calcola a metà misura)
        appoggio.setSize(w, h); uscita.setSize(w, h); ao.setSize(Math.round(w * k), Math.round(h * k)); U.uPasso.value.set(1 / w, 1 / h); this.alta = h; if (mezza) mezza.setSize(Math.ceil(w / 2), Math.ceil(h / 2)); },
      rendi() {
        if (acceso) { try {
          R.setRenderTarget(appoggio); R.clear(); R.render(scena, cam);
          let colori = appoggio.texture;
          if (conAO) { ao.render(R, uscita, appoggio); colori = uscita.texture; }
          if (cinema) { const tv = Math.tan(cam.fov * Math.PI / 360), px = this.alta / 900;
            U.tFondo.value = fondo; U.uVicino.value = cam.near; U.uLontano.value = cam.far; U.uFuoco.value = ottica.fuoco; U.uApertura.value = ottica.apertura * this.alta / (4 * tv);
            U.uMaxR.value = ottica.massimo * px; U.uNitido.value = 0.7 * px; U.uNebbia.value.set(ottica.nebbia0, ottica.nebbiaL); U.uPrese.value = ottica.apertura > 0 ? ottica.prese : 0; U.uVignetta.value = ottica.vignetta;
            const e = cam.matrixWorld.elements; U.uTan.value.set(tv * cam.aspect, tv); U.uSu.value.set(e[1], e[5], e[9], e[13]); U.uAlto.value.set(ottica.alto0, ottica.alto1, ottica.basso0, ottica.basso1); }
          U.tDiffuse.value = colori;
          if (cinema && U.uPrese.value > 0) { R.setRenderTarget(mezza); quadroSfoca.render(R); U.tSfocato.value = mezza.texture; }
          R.setRenderTarget(null); quadro.render(R); return;
        } catch (e) { acceso = false; try { ao._restoreVisibility(); } catch (e2) { /* niente da rimettere */ } scena.overrideMaterial = null; } }
        R.setRenderTarget(null); R.render(scena, cam);
      }
    };
  }

  // ---------------------------------------------------------------------------------------------------------------
  // LA SCENA GRANDE: il mobile, piccolo, dentro l'elica che è il mondo (elica.js)
  const R1 = nuovoRenderer(telaGrande), scena = new THREE.Scene(), cam = new THREE.PerspectiveCamera(25, 1, 80, 140000), M1 = materiali();
  scena.environment = ambiente(R1);
  const L1 = luci(scena, 1900);
  const mobile = costruisci(SC.mob800, M1, {propri: true}); scena.add(mobile.gruppo);
  const mondo = creaElicaViva({tinta: tintaNotte, M: M1}), elica = mondo.gruppo; scena.add(elica); scena.add(mondo.bracci);
  // (i pezzi del mobile hanno le loro copie dei materiali: questi sono solo dell'elica. Rispondono meno alla stanza: così il
  // sole fa il chiaro e lo scuro, come all'aperto)
  ['legno', 'frontale', 'ceramica', 'lamiera', 'metallo'].forEach(n => { M1[n].envMapIntensity = LUCE.mondo; });
  const RM = MONDO.R, PM = MONDO.P, DUE_PI = Math.PI * 2;
  // la polvere nella luce: si disegna dopo lo sviluppo, sopra la foto
  const polvere = creaPolvere(260, 7000, 4200), scenaPolvere = new THREE.Scene(); scenaPolvere.add(polvere.punti);
  // i cinque pioli sotto il mobile che diventano i passaggi (il primo sotto il mobile è ritirato: si parte dal secondo)
  const sotto = mondo.pioli.filter(p => p.y < -500).sort((a, b) => b.y - a.y), PASSI = sotto.slice(1, 6).map(p => p.y);
  // nella sezione «Una catena sola» i sei strumenti si attaccano a sei pioli: l'elica li lega
  const PIOLI_NOMI = sotto.slice(1, 7), ATTREZZI = PIOLI_NOMI.map(p => p.y), accesi = [0, 0, 0, 0, 0, 0];
  const apertura = doc.getElementById('apertura'), lega = doc.getElementById('lega'), fondoNotte = doc.getElementById('notte');
  const testoApertura = doc.querySelector('.apertura-testo'), attrezzi = Array.from(doc.querySelectorAll('.attrezzi3d li')), versi = Array.from(doc.querySelectorAll('#lega .verso'));
  const cTmp = new THREE.Color(), pTmp = new V3(), pTmp2 = new V3();
  const etichette = Array.from(doc.querySelectorAll('.passi3d li'));
  let ondaDa = -1e9;
  // Un'etichetta sboccia dalla gemma del suo piolo: prima la pastiglia, piccola e poi piena, e solo dopo la scritta.
  // Così la gemma accesa non si vede mai dentro una parola mezza trasparente (Paolo, via Nihil)
  const sboccia = (e, k, x, y) => {
    if (k < 0.01) { e.style.opacity = '0'; return; }
    e.style.opacity = tratto(k, 0, 0.3).toFixed(2); e.style.setProperty('--scritta', tratto(k, 0.4, 0.9).toFixed(2));
    e.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(-50%,-50%) scale(${misto(0.3, 1, dolce(tratto(k, 0, 0.6))).toFixed(3)})`;
  };
  // quando arrivano i due versi della catena («Da sopra, la richiesta», «Da sotto, l'opportunità»), nello scorrere del quadro fermo
  const VERSI = [0.5, 0.72], misure = {nomi: [], versi: []}; let giroMisure = 0;
  function coloraPioli(st, ora, yGuardato, mezza) {
    mondo.accendi(p => {
      let k = 0; const j = PASSI.indexOf(p.y), ja = ATTREZZI.indexOf(p.y);
      if (j >= 0) k = dolce(tratto(st.catena, 0.1 + j * 0.13, 0.32 + j * 0.13));
      if (ja >= 0) k = Math.max(k, accesi[ja]);
      const dt = (ora - ondaDa) / 1000 - (yGuardato + mezza - p.y) / (2 * mezza) * 0.55;   // l'onda scende lungo l'elica quando una misura cambia
      if (dt > 0 && dt < 0.6) k = Math.max(k, Math.sin(dt / 0.6 * Math.PI));
      return k;
    });
  }

  const palco = doc.getElementById('apri'), contatto = doc.getElementById('contatto');
  let larga = 0, alta = 0;
  // per l'occlusione non contano l'elica, la macchia per terra, i segni dei fori e i pezzi velati
  const S1 = sviluppo(R1, scena, cam, () => [elica, mondo.bracci, L1.terra].concat(mobile.segni, mobile.parti.filter(q => q.velato).map(q => q.ogg)), true);
  function misuraGrande() { larga = innerWidth; alta = innerHeight; R1.setSize(larga, alta, false); S1.misura(larga, alta); cam.aspect = larga / alta; cam.updateProjectionMatrix();
    polvere.u.uSchermo.value.set(larga * R1.getPixelRatio(), alta * R1.getPixelRatio()); polvere.u.uAlta.value = alta * R1.getPixelRatio(); }

  // LE POSE DELLA CAMERA. Una posa è un punto attorno all'asse dell'elica (angolo, raggio, quota) e un punto guardato:
  // fra due pose si va lungo una spirale. Ogni posa porta anche la sua ottica: il piano a fuoco, l'apertura, l'aria
  const OTTICA = ['fuoco', 'ap', 'n0', 'nL', 'alto0', 'alto1', 'basso0', 'basso1', 'fov'];
  const nuova = () => Object.assign(nuovaPosa(0, 1, 0), {fuoco: 4000, ap: 0, n0: 1e6, nL: 1e6, alto0: 9000, alto1: 26000, basso0: -9000, basso1: -30000, fov: 25});
  const pLargo = nuova(), pPalco = nuova(), pVolo = nuova(), pVoloA = nuova(), pVoloB = nuova(), pTmp3 = nuova(), pTmp4 = nuova(), pCatena = nuova(), pGiu = nuova(), pFine = nuova(), pOra = nuova();
  const mista = (A, B, k, esce) => { mistaPose(A, B, k, esce); OTTICA.forEach(n => { esce[n] = misto(A[n], B[n], k); }); return esce; };
  // lo sguardo di prima, scritto come posa: guarda «centro» da davanti a sinistra (az) e dall'alto (el), alla distanza
  // che fa stare mezza larghezza «hw» e mezza altezza «hh» in una parte «parte» della tela (o alla distanza «dFissa»)
  function guardaPosa(esce, centro, hw, hh, az, el, parte, su, lato, dFissa) {
    const tv = Math.tan(gradi(esce.fov) / 2), d = dFissa || Math.max(hh / parte / tv, hw / 0.88 / (tv * cam.aspect));
    const cx = centro.x - Math.cos(az) * lato * d * tv * cam.aspect, cy = centro.y + su * 2 * d * tv, cz = centro.z - Math.sin(az) * lato * d * tv * cam.aspect;
    const x = cx - Math.sin(az) * Math.cos(el) * d, z = cz + Math.cos(az) * Math.cos(el) * d, verso = az + Math.PI / 2;
    let a = Math.atan2(z, x); a += Math.round((verso - a) / DUE_PI) * DUE_PI;
    esce.a = a; esce.r = Math.hypot(x, z); esce.y = cy + Math.sin(el) * d; esce.mira.set(cx, cy, cz); esce.d = d; return d;
  }
  // IL VOLO lungo la spirale, prima del palco. Tre pose: la partenza (sopra il filo indaco, da fuori, guardando lungo il
  // filo che gira attorno al mobile), il passaggio (più vicino, mentre si piega verso il mobile) e l'arrivo, che è lo
  // sguardo del palco. «da» è di quanto si è indietro lungo il giro, «r» il raggio, «sopra» quanto si sta sopra il filo,
  // «avanti» di quanto si guarda avanti lungo il filo, «verso» quanto di quello sguardo va al filo (il resto al mobile)
  const VOLO = {sopra: 5600, sopraLontano: 7300, parte: {filo: 300, r: 9000, sopra: 2200, avanti: gradi(50), verso: 0.06, su: 800, fov: 42, ap: 80},
    passa: {quanto: 0.49, r: 6400, sopra: 2600, avanti: gradi(50), verso: 0.12, su: 300, fov: 34, ap: 60}};
  const quotaFilo = (a, filo, verso) => mondo.quota(a + elica.rotation.y, filo, verso);   // (l'elica è girata attorno all'asse: gli angoli del mondo sono i suoi meno il giro)
  const centro = new V3(), ZERO3 = new V3(); let sopraOra = 5600;
  function quadroGrande(ora) {
    const st = SC.copione(), stretto = larga < 720, E = st.E1, F = st.fuoco, C = dolce(st.catena), tv = Math.tan(gradi(25) / 2);
    atteggia(mobile, st);
    // oltre il palco lo sguardo scende lungo l'elica
    const r = palco.getBoundingClientRect(), oltre = Math.max(0, -(r.bottom - alta)), V = dolce(tratto(oltre, 0, alta * 0.5));
    const rc = contatto.getBoundingClientRect(), fine = dolce(tratto(alta - rc.top, alta * 0.1, alta));

    // attorno al mobile i pioli non ci sono: il mobile sta al loro posto. Tornano, crescendo dai fili, quando lo sguardo
    // si allarga sulla catena
    const w = 1 - dolce(st.volo);
    mondo.ritira(misto(3300, 700, Math.max(C, V, w)));
    // PRIMA DEL PALCO: l'apertura, gli strumenti, la catena. «g» va da 0 (in cima) a 1 (il palco arriva in cima); «kA»,
    // «kL» e «kP» dicono quanto sono davanti l'apertura, il quadro fermo della catena e il palco: lì il 3D è pieno,
    // dietro i testi si fa da parte
    const g = lim(1 - r.top / Math.max(1, palco.offsetTop), 0, 1), rl = lega.getBoundingClientRect();
    const kA = dolce(tratto(scrollY, alta * 0.8, alta * 0.25)), kL = dolce(tratto(rl.top, alta * 0.4, 0)) * dolce(tratto(rl.bottom, alta * 0.55, alta * 0.95)), kP = dolce(tratto(alta - r.top, alta * 0.15, alta * 0.85));
    const pl = tratto(-rl.top, 0, Math.max(1, rl.height - alta));
    if (mondo.tempo) mondo.tempo(window.TEMPO === undefined ? ora / 1000 : window.TEMPO);   // le foglie respirano, la linfa sale, le chiazze di luce si spostano

    // 1. IL PALCO: sul mobile chiuso, poi aperto, poi sul fianco dove nascono i fori (lo sguardo di prima)
    let hw = 800 + 420 * E + 110 * st.E2, hh = 345 + 215 * E + 50 * st.E2, az = gradi(30 + 7 * E), el = gradi(21 + 1 * E), parte = misto(0.36, 0.47, E), su = misto(0.1, 0.13, E);
    centro.set(120 * E, 30 * E, 170 * E);
    const mix = (k, c2, hw2, hh2, az2, el2, parte2, su2) => { centro.lerp(c2, k); hw = misto(hw, hw2, k); hh = misto(hh, hh2, k); az = misto(az, az2, k); el = misto(el, el2, k); parte = misto(parte, parte2, k); su = misto(su, su2, k); };
    mix(F, pTmp.set(SC.mob800.L / 2 + 430 - 70, 0, 0), 330, 320, gradi(58), gradi(8), 0.56, 0.18);
    const d = guardaPosa(pPalco, centro, hw, hh, az, el, parte, su, 0);
    pPalco.fuoco = d; pPalco.ap = misto(30, 20, F); pPalco.n0 = d + 2600; pPalco.nL = 5200; pPalco.alto0 = 1600; pPalco.alto1 = 5000;
    // il filo indaco passa accanto alla camera del palco, sotto e dietro: il mondo si gira perché sia così (il giro si
    // decide sul mobile chiuso, e poi non cambia più)
    if (elica.userData.aspetto !== cam.aspect) { elica.userData.aspetto = cam.aspect;
      const dp = guardaPosa(pVolo, ZERO3, 800, 345, gradi(30), gradi(21), 0.36, 0.1, 0);
      // (su uno schermo stretto la camera del palco sta più lontano: il filo le passa più sotto, perché dietro al mobile non si veda)
      sopraOra = misto(VOLO.sopra, VOLO.sopraLontano, tratto(dp, 4400, 8900));
      elica.rotation.y = -(pVolo.a + DUE_PI * (pVolo.y - sopraOra) / PM); elica.updateMatrixWorld(); mondo.faiBracci(elica.rotation.y); }
    mondo.ritiraBracci(520 * E + 2600 * F, 520 * E);   // i bracci che tengono il mobile gli fanno posto quando si apre; il destro lascia vedere il fianco con i fori

    // 2. L'ELICA INTERA, prima del palco: all'apertura il mobile sta sotto il titolo, piccolo dentro il grande, tenuto dai
    // due bracci; scendendo lo sguardo scende ai sei pioli degli strumenti, e gira piano attorno all'elica
    if (st.volo < 1) {
      // All'apertura il titolo e il sottotitolo restano liberi, in alto: l'elica sta tutta sotto, nello spazio che resta, e
      // sfuma nell'aria prima di arrivare al testo e prima della scritta «Scorrere» (Paolo, via Nihil: niente rami dentro le lettere)
      const q = dolce(tratto(g, 0.1, 0.55)), fT = lim((testoApertura.offsetTop + testoApertura.offsetHeight) / alta, 0.12, 0.42) + 0.04, spazio = 1 - fT;
      // (undici metri di elica: il giro attorno al mobile, con l'incrocio sopra e quello sotto. «yA» è la quota che sta a una frazione dello schermo)
      const hhA = 5500 / spazio, cyA = (2 * (fT + 0.5 * spazio) - 1) * hhA, yA = f => cyA + hhA * (1 - 2 * f);
      const hhL = misto(hhA, stretto ? 5700 : 5300, q), cyL = misto(cyA, -4250, q);
      const dl = guardaPosa(pLargo, pTmp.set(0, cyL, 0), stretto ? 1700 : 5600, hhL, gradi(16 + 34 * g), gradi(4), 1, 0, 0);
      Object.assign(pLargo, {fuoco: dl, ap: 40, n0: dl - 1500, nL: 13000, alto0: misto(yA(fT + 0.07), cyL + hhL * 0.8, q), alto1: misto(yA(fT - 0.02), cyL + hhL * 1.5, q), basso0: misto(yA(0.79), cyL - hhL * 1.15, q), basso1: misto(yA(0.92), cyL - hhL * 2.5, q)});
    }
    // IL VOLO: all'inizio del palco la camera lascia l'elica intera, scende lungo la spirale sopra il ramo e trova il mobile
    if (st.volo < 1) {
      const v = dolce(st.volo), yFiloQui = pPalco.y - sopraOra;   // (il filo indaco, all'angolo della camera del palco)
      // la partenza è dove il filo indaco passa alla quota «filo»: da lì il mobile si vede sopra il filo, più lontano
      const daParte = (VOLO.parte.filo - yFiloQui) * DUE_PI / PM;
      [[VOLO.parte, pVoloA, daParte], [VOLO.passa, pVoloB, daParte * VOLO.passa.quanto]].forEach(([K, p, da]) => {
        p.a = pPalco.a - da; p.r = K.r; const yF = yFiloQui + da * PM / DUE_PI; p.y = yF + K.sopra;
        const aM = p.a + K.avanti; pTmp.set(Math.cos(aM) * RM, yF - K.avanti * PM / DUE_PI + 200, Math.sin(aM) * RM);
        p.mira.set(0, 250 + K.su, 0).lerp(pTmp, K.verso);
        Object.assign(p, {fov: K.fov, ap: K.ap, alto0: 900, alto1: 3100, basso0: pPalco.basso0, basso1: pPalco.basso1});
        p.fuoco = pTmp2.set(Math.cos(p.a) * p.r, p.y, Math.sin(p.a) * p.r).length(); p.n0 = p.fuoco + 1200; p.nL = 3400;
      });
      // (una curva sola fra le tre pose: la seconda la tira a sé, senza fermarcisi)
      mista(mista(pLargo, pVoloB, v, pTmp3), mista(pVoloB, pPalco, v, pTmp4), v, pOra);
    } else mista(pPalco, pPalco, 0, pOra);

    // 3. LA CATENA: la camera esce dal foro e si allontana finché l'elica sta nel quadro, con il mobile piccolo dentro e
    // i cinque passaggi sui pioli sotto di lui
    if (C > 0) {
      const dc = guardaPosa(pCatena, pTmp.set(0, -3450, 0), stretto ? 1500 : 6900, stretto ? 5300 : 5090, gradi(16), gradi(4), 0.8, 0.19, 0);
      Object.assign(pCatena, {fuoco: dc, ap: 40, n0: dc - 1500, nL: 13000, alto0: 700, alto1: 2700, basso0: -9500, basso1: -17000});
      mista(pOra, pCatena, dolce(tratto(st.catena, 0, 0.6)), pOra);   // (la camera arriva prima delle scritte)
    }
    // 4. OLTRE IL PALCO: l'elica si sposta di lato e scende, girando piano, mentre la pagina le scorre sopra; in fondo
    // torna in mezzo
    if (V > 0) {
      const yc = -3450 - oltre * 2.4, giro = gradi(16) + oltre * 0.0004;
      [[pGiu, stretto ? 0 : 1.12, 4], [pFine, 0, 7]].forEach(([p, lato, el]) => { const dg = guardaPosa(p, pTmp.set(0, yc, 0), 0, 0, giro, gradi(el), 1, 0, lato, 21000);
        Object.assign(p, {fuoco: dg, ap: 30, n0: dg - 1500, nL: 13000, alto0: yc + 5200, alto1: yc + 10500, basso0: yc - 5200, basso1: yc - 10500}); });
      mista(pOra, pGiu, V, pOra);
      if (fine > 0) mista(pOra, pFine, fine, pOra);
    }
    if (window.POSA) { const q = window.POSA; pOra.a = gradi(q[0]); pOra.r = q[1]; pOra.y = q[2]; pOra.mira.set(q[3], q[4], q[5]); 
      pOra.fov = q[6] || 25; pOra.fuoco = q[7] || pOra.fuoco; pOra.ap = q[8] === undefined ? pOra.ap : q[8]; pOra.n0 = q[9] || pOra.n0; pOra.nL = q[10] || pOra.nL; if (q[11]) mondo.ritira(q[12]);
      if (q[13] !== undefined) { pOra.alto0 = q[13]; pOra.alto1 = q[14]; pOra.basso0 = q[15]; pOra.basso1 = q[16]; } if (q[17] !== undefined) { elica.rotation.y = gradi(q[17]); } }
    if (Math.abs(cam.fov - pOra.fov) > 0.001) { cam.fov = pOra.fov; cam.updateProjectionMatrix(); }
    metti(cam, pOra);
    const o = S1.ottica; o.fuoco = pOra.fuoco; o.apertura = pOra.ap; o.nebbia0 = pOra.n0; o.nebbiaL = pOra.nL; o.alto0 = pOra.alto0; o.alto1 = pOra.alto1; o.basso0 = pOra.basso0; o.basso1 = pOra.basso1;
    L1.terra.position.set(60 * E, -H / 2 - 210 - 130 * E, 40 + 120 * E); L1.terra.scale.set(1500 + 900 * E, 950 + 700 * E, 1); L1.terra.material.opacity = tintaNotte.ombra * (1 - 0.45 * E) * (1 - 0.6 * F) * (1 - w) * (1 - C);
    coloraPioli(st, ora, pOra.mira.y, 3000);
    telaGrande.style.opacity = misto(misto(stretto ? 0.16 : 0.2, 1, Math.max(kA, kL, kP)), misto(stretto ? 0.14 : 0.42, stretto ? 0.24 : 0.42, fine), V).toFixed(3);
    // la notte finisce dove finisce il palco
    fondoNotte.style.setProperty('--orlo', Math.max(0, r.bottom + 80).toFixed(0) + 'px');
    S1.rendi();
    if (S1.cinema()) { const u = polvere.u; u.tFondo.value = S1.fondo(); u.uVicino.value = cam.near; u.uLontano.value = cam.far; u.uFuoco.value = o.fuoco; u.uApertura.value = o.apertura * u.uAlta.value / (4 * tv); u.uMaxR.value = o.massimo * u.uAlta.value / 900;
      u.uNebbia.value.set(o.nebbia0, o.nebbiaL); u.uTempo.value = ora / 1000; u.uColore.value.copy(tintaNotte.polvere); u.uForza.value = tintaNotte.polvereForza;
      R1.autoClear = false; R1.render(scenaPolvere, cam); R1.autoClear = true; }
    // i sei nomi, ognuno sulla gemma del suo piolo, e i due versi della catena. Un nome che cadrebbe sotto un verso
    // (su uno schermo stretto i versi stanno sopra l'elica) si ritira prima che il verso arrivi: mai un testo sopra un nome
    if (!(giroMisure++ % 20)) { misure.nomi = attrezzi.map(e => [e.offsetWidth, e.offsetHeight]); misure.versi = versi.map(e => [e.offsetLeft, e.offsetTop, e.offsetWidth, e.offsetHeight]); }
    attrezzi.forEach((e, j) => { const acceso = dolce(tratto(pl, 0.04 + j * 0.07, 0.16 + j * 0.07)) * kL; accesi[j] = acceso;
      pTmp.set(0, ATTREZZI[j] - 260, 0).project(cam);
      const x = (pTmp.x + 1) / 2 * larga, y = (1 - pTmp.y) / 2 * alta, [nw, nh] = misure.nomi[j]; let resta = 1;
      misure.versi.forEach(([vl, vt, vw, vh], v) => { if (x + nw / 2 > vl - 12 && x - nw / 2 < vl + vw + 12 && y + nh / 2 > vt - 10 && y - nh / 2 < vt + vh + 10) resta *= 1 - dolce(tratto(pl, VERSI[v] - 0.07, VERSI[v] - 0.01)); });
      mondo.chiudiGemma(PIOLI_NOMI[j], (1 - resta) * kL);   // (e la gemma di quel piolo si chiude: niente punto di luce dentro le parole del verso)
      sboccia(e, acceso * resta, x, y); });
    versi.forEach((e, j) => { const k = dolce(tratto(pl, VERSI[j], VERSI[j] + 0.14)) * kL; e.style.opacity = k.toFixed(2); e.style.transform = `translateY(${((1 - k) * (j ? 18 : -18)).toFixed(1)}px)`; });
    // le etichette dei cinque passaggi, ognuna sul suo piolo
    etichette.forEach((e, j) => { pTmp.set(0, PASSI[j], 0).project(cam);
      sboccia(e, dolce(tratto(st.catena, 0.16 + j * 0.13, 0.36 + j * 0.13)) * (1 - V), (pTmp.x + 1) / 2 * larga, (1 - pTmp.y) / 2 * alta); });
  }

  // ---------------------------------------------------------------------------------------------------------------
  // LA TELA DELLA SCENA VIVA: il mobile che si allarga con la misura, con la sua quota
  const R2 = nuovoRenderer(telaViva), scena2 = new THREE.Scene(), cam2 = new THREE.PerspectiveCamera(24, 1, 60, 30000), M2 = materiali(), quotaN = doc.getElementById('vivo-quota');
  scena2.environment = ambiente(R2);
  const L2 = luci(scena2, 1500);
  const mQuota = new THREE.MeshBasicMaterial({color: tinta.segno}), quota = new THREE.Group(); scena2.add(quota);
  let vivo = null, mobVivo = null, larga2 = 0, alta2 = 0;
  const S2 = sviluppo(R2, scena2, cam2, () => [L2.terra, quota].concat(vivo ? vivo.segni : []), false);
  const FERMO = {E1: 0, E2: 0, fuoco: 0, fori: 0, catena: 0};
  function disegnaViva() {
    if (!mobVivo || !larga2) return;
    if (vivo) { scena2.remove(vivo.gruppo); butta(vivo); }
    vivo = costruisci(mobVivo, M2, {evidenzia: true}); atteggia(vivo, FERMO); scena2.add(vivo.gruppo);
    // la quota: un filo davanti, per terra, con i due capi
    const Lm = mobVivo.L, zq = P / 2 + S + 95, yq = -H / 2 + 2;
    quota.clear(); const barra = new THREE.Mesh(new THREE.BoxGeometry(Lm, 3.5, 3.5), mQuota); barra.position.set(0, yq, zq); quota.add(barra);
    [-1, 1].forEach(s => { const capo = new THREE.Mesh(new THREE.BoxGeometry(3.5, 3.5, 70), mQuota); capo.position.set(s * Lm / 2, yq, zq - 20); quota.add(capo); });
    L2.terra.position.set(0, -H / 2 - 150, 40); L2.terra.scale.set(Lm * 1.75, 900, 1);
    guarda(cam2, pTmp.set(0, -10, 60), 700, 380, gradi(31), gradi(17), 0.9, -0.04, 0);
    S2.rendi();
    pTmp.set(0, yq, zq).project(cam2);
    quotaN.textContent = Lm; quotaN.style.transform = `translate(${((pTmp.x + 1) / 2 * larga2).toFixed(1)}px,${((1 - pTmp.y) / 2 * alta2 + 6).toFixed(1)}px) translate(-50%,0)`;
  }
  function misuraViva() { const r = telaViva.getBoundingClientRect(); if (!r.width || !r.height) return; larga2 = r.width; alta2 = r.height; R2.setSize(larga2, alta2, false); S2.misura(larga2, alta2); cam2.aspect = larga2 / alta2; cam2.updateProjectionMatrix(); disegnaViva(); }

  // ---------------------------------------------------------------------------------------------------------------
  // LA LUCE E IL LEGNO VERI (il terzo giro, 21 novembre notte: Paolo ha detto sì a due file di Poly Haven, licenza CC0;
  // chi li ha fatti è scritto in CREDITI.md). Arrivano dopo: la pagina parte subito con la stanza e il rovere disegnati
  // qui, e quando i file sono arrivati li cambia. Se un file non arriva, o chi guarda ha chiesto di risparmiare dati,
  // resta quello disegnato
  // - la luce: la foto di uno studio vero (un HDRI) al posto della stanza disegnata. La specchiano il laccato e lo smalto
  // - il legno: un'impiallacciatura di rovere fotografata: il colore, il rilievo e la ruvidezza. Il tono resta quello
  //   scelto (ROVERE.fondo): la foto è più chiara e più gialla, e una tinta la porta lì
  const VERI = {luce: 'luce/studio_small_09_1k.hdr', colore: 'legno/oak_veneer_01_diff_1k.jpg', rilievo: 'legno/oak_veneer_01_nor_gl_1k.jpg', ruvido: 'legno/oak_veneer_01_rough_512.jpg'};
  const vero = {luce: false, legno: false};
  function veri() {
    if (navigator.connection && navigator.connection.saveData) return;
    new HDRLoader().load(VERI.luce, hdr => {
      hdr.mapping = THREE.EquirectangularReflectionMapping;
      // le lampade dello studio sono piccole e fortissime (fino a 500 volte il bianco): specchiate danno puntini e
      // seghetti. Si fermano a LUCE.tetto: restano lampade, ma morbide
      const d = hdr.image.data, tetto = THREE.DataUtils.toHalfFloat(LUCE.tetto);
      if (hdr.type === THREE.HalfFloatType) for (let i = 0; i < d.length; i++) { if ((i & 3) !== 3 && THREE.DataUtils.fromHalfFloat(d[i]) > LUCE.tetto) d[i] = tetto; }
      // lo studio della foto ha il soffitto nero: il piano del lavabo, che guarda in su, ci si specchierebbe spento.
      // Come si fa in uno studio, sopra il mobile si appende un pannello largo di luce morbida
      const posa = new THREE.Scene(); posa.background = hdr; posa.backgroundRotation.y = gradi(LUCE.giroStudio);
      const cielo = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({color: new THREE.Color().setScalar(LUCE.cielo)}));
      cielo.position.set(0.4, 4, 0.6); cielo.scale.set(6.5, 0.1, 5); posa.add(cielo);
      [[R1, scena], [R2, scena2]].forEach(([r, s]) => { const pm = new THREE.PMREMGenerator(r), prima = s.environment; s.environment = pm.fromScene(posa, 0, 0.1, 100).texture; pm.dispose(); if (prima) prima.dispose();
        s.environmentIntensity = LUCE.studio; s.environmentRotation.y = 0; });
      cielo.geometry.dispose(); cielo.material.dispose();
      hdr.dispose(); vero.luce = true; disegnaViva();
    }, undefined, () => {});
    const carica = new THREE.TextureLoader(), foto = {}, nomi = ['colore', 'rilievo', 'ruvido'];
    const veste = m => { if (!m || !m.userData || !m.userData.legno) return; m.map = foto.colore; m.normalMap = foto.rilievo; m.normalScale.setScalar(LEGNO.rilievo); m.bumpMap = null; m.roughnessMap = foto.ruvido; m.color.set(LEGNO.tinta); m.needsUpdate = true; };
    nomi.forEach(n => carica.load(VERI[n], t => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; if (n === 'colore') t.colorSpace = THREE.SRGBColorSpace; foto[n] = t;
      if (!nomi.every(k => foto[k])) return;
      [M1, M2].forEach(M => veste(M.legno)); scena.traverse(o => veste(o.material)); vero.legno = true; disegnaViva();
    }, undefined, () => {}));
  }
  // il rovere fotografato: la tinta che lo porta al tono scelto, e quanto si sente il rilievo
  const LEGNO = {tinta: '#bcc9df', rilievo: 0.7};

  // ---------------------------------------------------------------------------------------------------------------
  // L'AVVIO
  function tema() {
    tinta = tinte(); tintaNotte = tinteNotte(); mondo.tema(tintaNotte);
    // i materiali che prendono il colore dalla pagina (il laccato, la ceramica, il frontale in evidenza), anche nelle copie
    const ritinge = (m, t) => { if (m && m.userData && t[m.userData.tinta]) { m.color.copy(t[m.userData.tinta]); if (m.emissiveIntensity && m.emissive.getHex()) m.emissive.copy(m.color); } };
    Object.values(M2).forEach(m => ritinge(m, tinta)); Object.values(M1).forEach(m => ritinge(m, tintaNotte)); scena.traverse(o => ritinge(o.material, tintaNotte));
    R1.toneMappingExposure = tintaNotte.esposizione; R2.toneMappingExposure = tinta.esposizione;
    L2.terra.material.opacity = tinta.ombra; mQuota.color.copy(tinta.segno); disegnaViva();
  }
  tema();                                                // (la scena grande prende subito i colori della notte)
  misuraGrande();
  addEventListener('resize', misuraGrande);
  quadroGrande(performance.now());                       // il primo quadro: se WebGL non regge, si esce qui e resta il disegno
  radice.classList.add('tre');                           // da qui le due tele 3D hanno la loro misura
  // «resa» dice com'è fatta la foto: lo leggono le prove
  SC.accendi({viva: mob => { mobVivo = mob; disegnaViva(); }, onda: () => { ondaDa = performance.now(); }, tema,
    resa: () => ({sviluppo: R1.toneMapping === THREE.ACESFilmicToneMapping ? 'ACES' : 'altro', esposizione: R1.toneMappingExposure, ambiente: vero.luce ? 'studio (HDRI)' : 'RoomEnvironment', rovereVero: vero.legno, ombre: R1.shadowMap.type === THREE.PCFShadowMap ? 'PCF' : 'altro',
      occlusione: S1.acceso(), occlusioneViva: S2.acceso(), frontale: '#' + M1.frontale.color.getHexString(), ceramica: '#' + M1.ceramica.color.getHexString(), rovere: ROVERE.fondo,
      interno: '#' + M1.interno.color.getHexString(), elica: ['#' + tintaNotte.filoA.getHexString(), '#' + tintaNotte.filo.getHexString()], notte: getComputedStyle(fondoNotte).display === 'block', pezzi: mondo.pezzi, cinema: S1.cinema(), evidenza: '#' + M2.vivo.color.getHexString(), vasca: 'morbida'})});
  if (window.ResizeObserver) new ResizeObserver(misuraViva).observe(telaViva); else addEventListener('resize', misuraViva);
  misuraViva();
  veri();
  // se i quadri rallentano (sotto 24 al secondo, per due terzi di 90 quadri di fila), l'occlusione si spegne: il resto resta
  // (con il cinema i gradini sono quattro: senza occlusione, poi metà delle prese dello sfocato, poi senza sfocato, poi
  // con meno punti. L'aria resta sempre)
  let prima = 0, visti = 0, lenti = 0, gradino = 0;
  const scendi = () => { gradino++; if (gradino === 1) S1.spegni(); else if (gradino === 2) S1.ottica.prese = 20; else if (gradino === 3) S1.ottica.prese = 0; else { R1.setPixelRatio(1); misuraGrande(); } };
  const giro = ora => { requestAnimationFrame(giro); if (doc.hidden) { prima = 0; return; }
    if (gradino < 4 && prima && ora - prima < 250) { visti++; if (ora - prima > 42) lenti++; if (visti >= 90) { if (lenti > 60) scendi(); visti = lenti = 0; } }
    prima = ora; quadroGrande(ora); };
  requestAnimationFrame(giro);
}
