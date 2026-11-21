// Alburn, la pagina di alburn.it: la scena (21 novembre 2026).
// Una scena fatta apposta per la pagina, con dati d'esempio: non è il motore vero di Alburn. Un mobile da bagno
// d'esempio (due fianchi, il fondo, due fasce, due frontali, il lavabo, due cassetti con le guide, le maniglie, le
// staffe a muro) disegnato a spigoli su un canvas 2D, senza WebGL e senza librerie.
// 1. Il modello d'esempio: dalla larghezza nascono i pezzi, i fori, la distinta, il costo, il programma.
// 2. Il disegno: una proiezione parallela, i pezzi come scatole, in ordine dal più lontano al più vicino.
// 3. Il palco: scorrendo, il mobile si apre, si scompone, e sul fianco nascono i fori.
// 4. La scena viva: una misura cambia e tutto segue.
// 5. Quello che entra scorrendo.
// Questo file è il disegno a spigoli: è quello che si vede subito, e quello che resta a chi non ha WebGL o chiede meno
// movimento («riduci movimento»: tutto fermo e completo, e la scena viva risponde lo stesso al tocco). Con WebGL e con il
// movimento, scena3d.js mette al suo posto il 3D vero: il mobile con i materiali e la luce, dentro la doppia elica.
(function () {
  'use strict';
  const A = window.ALBURN, doc = document, radice = doc.documentElement;
  const t = A.t, $ = id => doc.getElementById(id);
  const chiedeFermo = matchMedia('(prefers-reduced-motion: reduce)'), scuro = matchMedia('(prefers-color-scheme: dark)');
  // ?fermo nell'indirizzo mostra la pagina come la vede chi chiede meno movimento (per le prove, e per guardarla)
  const fermoChiesto = () => chiedeFermo.matches || /[?&]fermo\b/.test(location.search);
  let mov = !fermoChiesto();

  const lim = (x, a, b) => Math.min(b, Math.max(a, x));
  const tratto = (p, a, b) => lim((p - a) / (b - a), 0, 1);
  const dolce = x => x * x * (3 - 2 * x);
  const misto = (a, b, k) => a + (b - a) * k;
  const gradi = g => g * Math.PI / 180;

  // ---------------------------------------------------------------------------------------------------------------
  // 1. IL MODELLO D'ESEMPIO. Misure in millimetri: x la larghezza, y la profondità (0 davanti), z l'altezza.
  const P = 460, H = 500, S = 18, AF = 248, SERIE = [600, 800, 900, 1050, 1200], ZERO = [0, 0, 0];
  // la regola d'esempio: fino a 900 una maniglia per frontale, oltre due
  const maniglie = L => { if (L <= 900) return [L / 2]; const c = Math.round(L / 4); return [c, L - c]; };

  // i pezzi come scatole [x0, y0, z0, x1, y1, z1]; e1 è di quanto si sposta quando il mobile si apre, e2 quando la
  // ferramenta si stacca; i fori stanno sulla faccia di sinistra (x0) o su quella davanti (y0) del pezzo
  function mobile(L) {
    const pezzi = [], M = maniglie(L);
    const p = (id, m, b, e1, e2, altro) => { const o = Object.assign({id, m, b, e1: e1 || ZERO, e2: e2 || ZERO, fori: []}, altro); pezzi.push(o); return o; };
    // «dentro» dice quale faccia del pannello guarda l'interno della cassa (x0, x1 o z1; «tutto» per le fasce, che
    // stanno dentro): fuori il rovere, dentro lo stesso antracite satinato dei frontali (Paolo, 21 novembre sera)
    p('fondo', 'legno', [S, 0, 0, L - S, P, S], [0, 0, -130], null, {dentro: 'z1'});
    p('fianco_sx', 'legno', [0, 0, 0, S, P, H], [-170, 0, 0], null, {dentro: 'x1'});
    const fdx = p('fianco_dx', 'legno', [L - S, 0, 0, L, P, H], [430, 0, 0], null, {fuoco: 1, dentro: 'x0'});
    p('fascia_dietro', 'legno', [S, P - S, H - 100, L - S, P, H], [0, 200, 60], null, {dentro: 'tutto'});
    p('fascia_davanti', 'legno', [S, 0, H - 100, L - S, S, H], [0, 0, 100], null, {dentro: 'tutto'});
    [30, 280].forEach((z, i) => {
      p('cassetto_' + i, 'metallo', [S + 13, 2, z, L - S - 13, 430, z + 150], null, [0, i ? -420 : -300, 0], {aperto: 1});
      p('guida_sx_' + i, 'metallo', [S, 20, z + 4, S + 13, 440, z + 34], [-170, 0, 0], [85, 0, 0]);
      p('guida_dx_' + i, 'metallo', [L - S - 13, 20, z + 4, L - S, 440, z + 34], [430, 0, 0], [-95, 0, 0], {fuoco: 1});
      [37, 261, 389].forEach(y => fdx.fori.push({f: 'x0', a: y, b: z + 19, d: 5}));
    });
    p('staffa_sx', 'metallo', [S, P - S - 46, H - 170, S + 40, P - S, H - 108], [-170, 0, 0], [85, 0, 0]);
    p('staffa_dx', 'metallo', [L - S - 40, P - S - 46, H - 170, L - S, P - S, H - 108], [430, 0, 0], [-95, 0, 0], {fuoco: 1});
    [[P - 52, H - 122], [P - 30, H - 122], [P - 52, H - 156], [P - 30, H - 156]].forEach(q => fdx.fori.push({f: 'x0', a: q[0], b: q[1], d: 5}));
    [[0, AF], [H - AF, H]].forEach((z, i) => {
      const fuori = i ? -640 : -470, zm = (z[0] + z[1]) / 2;
      const fr = p('frontale_' + i, 'legno', [0, -S, z[0], L, 0, z[1]], [0, fuori, 0], null, i ? {vivo: 1} : null);
      M.forEach((c, k) => {
        fr.fori.push({f: 'y0', a: c - 80, b: zm, d: 5}, {f: 'y0', a: c + 80, b: zm, d: 5});
        p('maniglia_' + i + '_' + k, 'metallo', [c - 96, -S - 30, zm - 6, c + 96, -S - 18, zm + 6], [0, fuori, 0], [0, -120, 0]);
      });
    });
    p('lavabo', 'ceramica', [0, -S, H, L, P, H + 16], [0, 0, 250], null, {vasca: 1});
    let o = 0; pezzi.forEach(z => z.fori.forEach(f => { f.o = o++; }));
    // i fori che si vedono, più quelli uguali sul fianco sinistro e i quattro agganci dietro a ogni frontale
    const fori = fdx.fori.length * 2 + M.length * 2 * 2 + 4 * 2;
    return {L, pezzi, fori, disegnati: o, pannelli: pezzi.filter(z => z.m === 'legno').length, componenti: pezzi.filter(z => z.m !== 'legno').length};
  }

  // la cifra di controllo dei codici (Damm), e l'impronta (un riassunto corto del DNA: FNV-1a)
  const DAMM = ['0317598642', '7092154863', '4206871359', '1750983426', '6123045978', '3674209581', '5869720134', '8945362017', '9438617205', '2581436790'];
  const cifra = n => { let i = 0; for (const c of String(n)) i = +DAMM[i][+c]; return i; };
  const codice = (lettera, n) => `${lettera}-${n}-${cifra(n)}`;
  const impronta = s => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); } return (h >>> 0).toString(16).padStart(8, '0'); };

  // quello che segue dalla larghezza: il DNA del frontale, le lavorazioni, la distinta, il costo
  function seguito(L) {
    const M = maniglie(L), i = SERIE.indexOf(L), serie = i >= 0;
    const xm = []; M.forEach(c => xm.push(c - 80, c + 80));
    const lav = [
      {tipo: 'FORO_V', che: 'lav.maniglia', d: 5, x: xm, y: [AF / 2], faccia: 'lav.davanti'},
      {tipo: 'FORO_V', che: 'lav.aggancio', d: 10, prof: 12, x: [43, L - 43], y: [62, AF - 62], faccia: 'lav.dietro'}
    ];
    const dna = `frontale|${L}x${AF}x${S}|` + lav.map(l => `${l.tipo}:${l.d}:${l.prof || 'p'}:${l.x.join(',')}:${l.y.join(',')}`).join('|');
    const fatto = n => serie ? codice('P', n + i) : null, comprato = n => serie ? codice('C', n + i) : null;
    const distinta = [
      {cod: fatto(2040), nome: 'bom.frontale', mis: `${L} × ${AF} × ${S}`, q: 2, segue: 1, qui: 1},
      {cod: codice('P', 2010), nome: 'bom.fianco', mis: `${P} × ${H} × ${S}`, q: 2},
      {cod: fatto(2060), nome: 'bom.fondo', mis: `${L - 2 * S} × ${P} × ${S}`, q: 1, segue: 1},
      {cod: fatto(2080), nome: 'bom.fascia', mis: `${L - 2 * S} × 100 × ${S}`, q: 2, segue: 1},
      {cod: comprato(3010), nome: 'bom.lavabo', largo: L, q: 1, segue: 1, compra: 1},
      {cod: comprato(3030), nome: 'bom.cassetto', largo: L - 2 * S - 26, q: 2, segue: 1, compra: 1},
      {cod: codice('C', 3020), nome: 'bom.guide', q: 2},
      {cod: codice('C', 3040), nome: 'bom.maniglia', q: M.length * 2, segueQ: 1},
      {cod: codice('C', 3050), nome: 'bom.staffa', q: 2}
    ];
    const metri2 = (2 * L * AF + 2 * P * H + (L - 2 * S) * P + 2 * (L - 2 * S) * 100) / 1e6, bordo = 2 * 2 * (L + AF) / 1000;
    let costo = metri2 * 18 + bordo * 0.8 + (120 + 0.14 * L) + 2 * (34 + 0.01 * L) + 2 * 19 + M.length * 2 * 6.4 + 2 * 3.8;
    if (!serie) costo *= 1.12;
    return {L, serie, M, xm, lav, nLav: xm.length + 4, impronta: impronta(dna), codice: fatto(2040), distinta, costo};
  }

  // ---------------------------------------------------------------------------------------------------------------
  // 2. IL DISEGNO
  let colori = null;
  function leggiColori() {
    const s = getComputedStyle(radice), c = n => s.getPropertyValue(n).trim();
    colori = {legno: [c('--legno-1'), c('--legno-2'), c('--legno-3')], frontale: [c('--frontale-1'), c('--frontale-2'), c('--frontale-3')], ceramica: [c('--ceramica-1'), c('--ceramica-2'), c('--ceramica-3')],
      metallo: [c('--metallo-1'), c('--metallo-2'), c('--metallo-3')], vivo: [c('--vivo-1'), c('--vivo-2'), c('--vivo-3')],
      spigolo: c('--spigolo'), foro: c('--foro'), foroDentro: c('--foro-dentro'), segno: c('--segno'), ombra: c('--ombra'), carattere: getComputedStyle(doc.body).fontFamily};
  }

  // la tela segue la sua misura sulla pagina, con i punti veri dello schermo (al massimo il doppio)
  function tela(canvas, ridisegna) {
    const ctx = canvas.getContext('2d'), o = {ctx, w: 0, h: 0};
    const misura = () => {
      const r = canvas.getBoundingClientRect(), d = Math.min(2, window.devicePixelRatio || 1);
      if (!r.width || !r.height) return;
      o.w = r.width; o.h = r.height; canvas.width = Math.round(r.width * d); canvas.height = Math.round(r.height * d);
      ctx.setTransform(d, 0, 0, d, 0, 0); ridisegna();
    };
    if (window.ResizeObserver) new ResizeObserver(misura).observe(canvas); else addEventListener('resize', misura);
    misura();
    return o;
  }

  // la vista: da davanti a sinistra, dall'alto. Dà [x sullo schermo, y sullo schermo (in giù), lontananza]
  function vista(theta, phi) {
    const ct = Math.cos(theta), st = Math.sin(theta), cp = Math.cos(phi), sp = Math.sin(phi);
    return (x, y, z) => { const d = x * st + y * ct; return [x * ct - y * st, -(z * cp + d * sp), d * cp - z * sp]; };
  }

  // dal più lontano al più vicino: un pezzo sta dietro a un altro se è tutto più a destra, o più in fondo, o più in basso
  function inOrdine(sc) {
    const n = sc.length, usato = new Array(n).fill(false), fila = [], E = 0.5;
    const dietro = (a, b) => a[0] >= b[3] - E || a[1] >= b[4] - E || a[5] <= b[2] + E;
    for (let k = 0; k < n; k++) {
      let scelto = -1, riserva = -1;
      for (let i = 0; i < n; i++) {
        if (usato[i]) continue;
        if (riserva < 0 || sc[i].lontano > sc[riserva].lontano) riserva = i;
        let libero = true;
        for (let j = 0; j < n && libero; j++) if (j !== i && !usato[j] && dietro(sc[j].b, sc[i].b) && !dietro(sc[i].b, sc[j].b)) libero = false;
        if (libero && (scelto < 0 || sc[i].lontano > sc[scelto].lontano)) scelto = i;
      }
      const i = scelto >= 0 ? scelto : riserva; usato[i] = true; fila.push(sc[i]);
    }
    return fila;
  }

  // le scatole al loro posto (aperte di E1 e E2), con il centro del mobile nell'origine
  function scatole(mob, E1, E2) {
    const cx = mob.L / 2, cy = P / 2, cz = H / 2;
    return mob.pezzi.map(z => {
      const dx = z.e1[0] * E1 + z.e2[0] * E2, dy = z.e1[1] * E1 + z.e2[1] * E2, dz = z.e1[2] * E1 + z.e2[2] * E2;
      return {z, sp: [dx - cx, dy - cy, dz - cz], b: [z.b[0] + dx - cx, z.b[1] + dy - cy, z.b[2] + dz - cz, z.b[3] + dx - cx, z.b[4] + dy - cy, z.b[5] + dz - cz]};
    });
  }
  function riquadroDi(sc, pr, solo) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    sc.forEach(s => { if (solo && !s.z.fuoco) return; const b = s.b;
      for (let i = 0; i < 8; i++) { const q = pr(b[i & 1 ? 3 : 0], b[i & 2 ? 4 : 1], b[i & 4 ? 5 : 2]);
        if (q[0] < x0) x0 = q[0]; if (q[0] > x1) x1 = q[0]; if (q[1] < y0) y0 = q[1]; if (q[1] > y1) y1 = q[1]; } });
    return [x0, y0, x1, y1];
  }
  // come si mette un riquadro del disegno dentro un riquadro della tela: la scala e lo spostamento
  function adatta(r, dove, massima) {
    const k = Math.min(dove.w / (r[2] - r[0]), dove.h / (r[3] - r[1]), massima || 9);
    return {k, ox: dove.x + dove.w / 2 - k * (r[0] + r[2]) / 2, oy: dove.y + dove.h / 2 - k * (r[1] + r[3]) / 2};
  }

  // s: {theta, phi, E1, E2, fuoco, fori, quota, dove, posa (se c'è: la scala fissa), evidenzia}
  function disegna(T, mob, s) {
    const ctx = T.ctx, pr = vista(s.theta, s.phi), sc = scatole(mob, s.E1, s.E2);
    ctx.clearRect(0, 0, T.w, T.h);
    if (!T.w) return;
    let posa = s.posa;
    if (!posa) {
      const tutto = riquadroDi(sc, pr), F = s.fuoco || 0;
      let r = tutto;
      if (F > 0) { const f = riquadroDi(sc, pr, true), m = 60; r = tutto.map((v, i) => misto(v, f[i] + (i < 2 ? -m : m), F)); }
      posa = adatta(r, s.dove, misto(0.72, 1.6, F));
    }
    const k = posa.k, X = q => posa.ox + k * q[0], Y = q => posa.oy + k * q[1];
    const punto = (x, y, z) => { const q = pr(x, y, z); return [X(q), Y(q)]; };
    const faccia = (pp, colore, alfa) => {
      ctx.beginPath(); pp.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.closePath();
      ctx.globalAlpha = alfa; ctx.fillStyle = colore; ctx.fill(); ctx.globalAlpha = alfa * 0.62; ctx.stroke(); ctx.globalAlpha = 1;
    };
    // un cerchio su una faccia: «u» e «v» sono i due versi del piano
    const cerchio = (c, u, v, r, giri) => { const n = giri || 18; ctx.beginPath();
      for (let i = 0; i < n; i++) { const a = i / n * 2 * Math.PI, ca = Math.cos(a) * r, sa = Math.sin(a) * r, q = punto(c[0] + u[0] * ca + v[0] * sa, c[1] + u[1] * ca + v[1] * sa, c[2] + u[2] * ca + v[2] * sa);
        i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); } ctx.closePath(); };

    sc.forEach(o => { const b = o.b, q = pr((b[0] + b[3]) / 2, (b[1] + b[4]) / 2, (b[2] + b[5]) / 2); o.lontano = q[2]; });
    const fila = inOrdine(sc), F = s.fuoco || 0;
    ctx.lineWidth = 1; ctx.lineJoin = 'round'; ctx.strokeStyle = colori.spigolo;

    // l'ombra per terra, finché il mobile è chiuso
    if (s.E1 < 0.6) {
      const c = punto(0, 0, -H / 2), rx = k * (mob.L * 0.62 + 120), ry = rx * 0.2, g = ctx.createRadialGradient(c[0], c[1], 0, c[0], c[1], rx);
      g.addColorStop(0, colori.ombra); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.save(); ctx.globalAlpha = (1 - s.E1 / 0.6) * 0.5; ctx.translate(c[0], c[1]); ctx.scale(1, ry / rx); ctx.translate(-c[0], -c[1]);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(c[0], c[1], rx, 0, 2 * Math.PI); ctx.fill(); ctx.restore();
    }

    fila.forEach(o => {
      const b = o.b, z = o.z, alfa = z.fuoco ? 1 : misto(1, 0.07, F);
      // i frontali sono laccati, più scuri del rovere; e dello stesso antracite sono i cassetti, le fasce e le facce
      // dei pannelli che guardano dentro la cassa
      const scuro = colori.frontale, dn = z.dentro;
      const col = s.evidenzia && z.vivo ? colori.vivo : z.id.indexOf('frontale') === 0 || z.aperto || dn === 'tutto' ? scuro : colori[z.m];
      const [x0, y0, z0, x1, y1, z1] = b;
      faccia([punto(x0, y0, z0), punto(x0, y1, z0), punto(x0, y1, z1), punto(x0, y0, z1)], dn === 'x0' ? scuro[2] : col[2], alfa);
      faccia([punto(x0, y0, z0), punto(x1, y0, z0), punto(x1, y0, z1), punto(x0, y0, z1)], col[1], alfa);
      faccia([punto(x0, y0, z1), punto(x1, y0, z1), punto(x1, y1, z1), punto(x0, y1, z1)], dn === 'z1' ? scuro[0] : col[0], alfa);
      if (z.aperto) faccia([punto(x0 + 12, y0 + 12, z1), punto(x1 - 12, y0 + 12, z1), punto(x1 - 12, y1 - 12, z1), punto(x0 + 12, y1 - 12, z1)], col[2], alfa * 0.8);
      if (z.vasca) {
        // la vasca: morbida, a rettangolo stondato (la stessa sagoma del 3D), con il fondo piano e lo scarico
        const c = [(x0 + x1) / 2, (y0 + y1) / 2, z1], va = Math.min((x1 - x0) * 0.36, 300), vb = 165;
        const stondo = (a, bb) => { ctx.beginPath(); for (let i = 0; i < 48; i++) { const t = i / 48 * 2 * Math.PI, cs = Math.cos(t), sn = Math.sin(t),
          q = punto(c[0] + a * Math.sign(cs) * Math.pow(Math.abs(cs), 2 / 3), c[1] + bb * Math.sign(sn) * Math.pow(Math.abs(sn), 2 / 3), z1); i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); } ctx.closePath(); };
        ctx.globalAlpha = alfa; ctx.fillStyle = col[1]; stondo(va, vb); ctx.fill(); ctx.globalAlpha = alfa * 0.4; ctx.stroke();
        ctx.globalAlpha = alfa; ctx.fillStyle = col[2]; stondo(va * 0.48, vb * 0.48); ctx.fill();
        ctx.fillStyle = colori.metallo[2]; cerchio([c[0], c[1], z1], [1, 0, 0], [0, 1, 0], 21, 14); ctx.fill(); ctx.globalAlpha = 1;
      }
      // i fori: nascono uno dopo l'altro, e un filo li lega al componente che li chiede
      if (z.fori.length && s.fori > 0) {
        const n = mob.disegnati, rmin = misto(1.5, 3.4, F) / k;
        z.fori.forEach(f => {
          const nato = dolce(tratto(s.fori, f.o / n * 0.78, f.o / n * 0.78 + 0.22)); if (nato <= 0) return;
          const r = Math.max(f.d / 2, rmin), c = f.f === 'x0' ? [x0, f.a + o.sp[1], f.b + o.sp[2]] : [f.a + o.sp[0], y0, f.b + o.sp[2]];
          const u = f.f === 'x0' ? [0, 1, 0] : [1, 0, 0], v = [0, 0, 1];
          if (f.f === 'x0' && F > 0.05 && s.E2 > 0) { const a = punto(c[0], c[1], c[2]), e = punto(c[0] - 95 * s.E2, c[1], c[2]);
            ctx.save(); ctx.globalAlpha = F * nato * 0.9; ctx.strokeStyle = f.f === dn ? colori.foroDentro : colori.segno; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(e[0], e[1]); ctx.stroke(); ctx.restore(); }
          // (sull'antracite il foro si vede chiaro: è il cuore del pannello)
          ctx.globalAlpha = alfa; ctx.fillStyle = f.f === dn ? colori.foroDentro : colori.foro; cerchio(c, u, v, r * nato); ctx.fill();
          if (nato < 1) { ctx.save(); ctx.globalAlpha = (1 - nato) * alfa; ctx.strokeStyle = f.f === dn ? colori.foroDentro : colori.segno; ctx.lineWidth = 2; cerchio(c, u, v, r * (1 + 3 * (1 - nato))); ctx.stroke(); ctx.restore(); }
          ctx.globalAlpha = 1;
        });
      }
    });

    // la quota della larghezza, davanti, per terra
    if (s.quota > 0) {
      const y = -P / 2 - S - 90, zt = -H / 2, a = punto(-mob.L / 2, y, zt), e = punto(mob.L / 2, y, zt), a0 = punto(-mob.L / 2, -P / 2 - S - 8, zt), e0 = punto(mob.L / 2, -P / 2 - S - 8, zt);
      const a1 = punto(-mob.L / 2, y - 26, zt), e1 = punto(mob.L / 2, y - 26, zt);
      ctx.save(); ctx.globalAlpha = s.quota; ctx.strokeStyle = colori.segno; ctx.fillStyle = colori.segno; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(a0[0], a0[1]); ctx.lineTo(a1[0], a1[1]); ctx.moveTo(e0[0], e0[1]); ctx.lineTo(e1[0], e1[1]); ctx.moveTo(a[0], a[1]); ctx.lineTo(e[0], e[1]); ctx.stroke();
      [a, e].forEach(q => { ctx.beginPath(); ctx.arc(q[0], q[1], 3, 0, 2 * Math.PI); ctx.fill(); });
      const dim = Math.round(lim(T.w / 36, 13, 19));
      ctx.font = `700 ${dim}px ${colori.carattere}`; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText(String(mob.L), (a[0] + e[0]) / 2, (a[1] + e[1]) / 2 + 7); ctx.restore();
    }
  }

  // ---------------------------------------------------------------------------------------------------------------
  // 3. IL PALCO
  const palco = $('apri'), palcoTela = $('palco-tela'), dide = Array.from(doc.querySelectorAll('.dida')), scorri = doc.querySelector('.scorri');
  const mob800 = mobile(800);
  // quando entra e quando esce ogni didascalia, lungo lo scorrere (da 0 a 1)
  // Davanti a tutto c'è il volo lungo la spirale, dall'elica intera fino al mobile (da 0 a VOLO dello scorrere); il resto
  // del copione viene dopo («dopo» porta i suoi tempi nel tratto che resta). Il titolo non è più qui: sta nell'apertura
  const VOLO = 0.15, dopo = q => VOLO + q * (1 - VOLO);
  const TEMPI = [[dopo(0.05), dopo(0.08), dopo(0.17), dopo(0.2)], [dopo(0.21), dopo(0.24), dopo(0.33), dopo(0.36)], [dopo(0.37), dopo(0.4), dopo(0.5), dopo(0.53)], [dopo(0.55), dopo(0.58), dopo(0.7), dopo(0.73)], [dopo(0.87), dopo(0.91), 2, 3]];
  let pPalco = 0, TP = null, tre = null;
  doc.querySelectorAll('[data-n]').forEach(e => { e.textContent = mob800[e.dataset.n]; });
  // il copione del palco: a che punto dello scorrere il mobile si apre (E1), la ferramenta si stacca (E2), lo sguardo va
  // sul fianco (fuoco), nascono i fori, il mobile si richiude, e lo sguardo si allarga sulla catena. Vale per il 3D e
  // per il disegno
  function copione(pp) {
    const volo = tratto(pp, 0, VOLO), p = (pp - VOLO) / (1 - VOLO);   // «pp» è lo scorrere del palco, «p» quello del copione di prima
    const chiude = dolce(tratto(p, 0.72, 0.82));
    return {p, pp, volo, chiude, E1: dolce(tratto(p, 0.14, 0.32)) * (1 - chiude), E2: dolce(tratto(p, 0.36, 0.5)) * (1 - dolce(tratto(p, 0.71, 0.8))),
      fuoco: dolce(tratto(p, 0.53, 0.6)) * (1 - dolce(tratto(p, 0.69, 0.76))), fori: tratto(p, 0.58, 0.7), catena: tratto(p, 0.8, 0.97)};
  }

  function disegnaPalco() {
    if (tre || !TP || !colori) return;
    if (!mov) return disegna(TP, mob800, {theta: gradi(40), phi: gradi(26), E1: 1, E2: 1, fuoco: 0, fori: 1, quota: 0, dove: {x: TP.w * 0.03, y: TP.h * 0.03, w: TP.w * 0.94, h: TP.h * 0.94}});
    const c = copione(pPalco), stretto = TP.w < 720;
    disegna(TP, mob800, {
      theta: gradi(32 + 8 * dolce(tratto(c.p, 0.1, 0.5)) + 18 * c.fuoco - 8 * c.chiude), phi: gradi(24 + 3 * c.E1 - 6 * c.fuoco),
      E1: c.E1, E2: c.E2, fuoco: c.fuoco, fori: c.fori, quota: dolce(tratto(c.p, 0.86, 0.95)),
      dove: {x: TP.w * (stretto ? 0.07 : 0.1), y: TP.h * 0.4, w: TP.w * (stretto ? 0.88 : 0.8), h: TP.h * 0.5}
    });
  }
  function muoviPalco() {
    // dall'apertura alla fine del palco è notte: finché la barra ci sta sopra, prende i colori della notte
    const r = palco.getBoundingClientRect();
    radice.classList.toggle('su-notte', r.bottom > 28);
    if (!mov) return;
    const corsa = r.height - innerHeight;
    pPalco = corsa > 0 ? lim(-r.top / corsa, 0, 1) : 0;
    dide.forEach((d, i) => { const T = TEMPI[i], entra = T[0] < 0 ? 1 : dolce(tratto(pPalco, T[0], T[1])), esce = dolce(tratto(pPalco, T[2], T[3])), op = Math.min(entra, 1 - esce);
      d.style.opacity = op.toFixed(3); d.style.transform = `translateY(${((1 - entra) * 28 - esce * 28).toFixed(1)}px)`; d.style.pointerEvents = op > 0.5 ? '' : 'none'; });
    if (scorri) scorri.style.opacity = (1 - tratto(scrollY, 0, innerHeight * 0.22)).toFixed(2);
    if (r.bottom > 0 && r.top < innerHeight) disegnaPalco();
  }

  // ---------------------------------------------------------------------------------------------------------------
  // 4. LA SCENA VIVA
  const scena = $('scena'), vivoTela = $('vivo-tela'), cursore = $('larghezza'), numero = $('larghezza-n');
  const tasti = Array.from(doc.querySelectorAll('.serie button'));
  let L = 800, TV = null, posaViva = null, toccata = false, corre = 0, spegni = 0, ondaDa = 0, ultimoDisegno = null;
  const VISTA_VIVA = {theta: gradi(34), phi: gradi(22)};
  const v = x => `<b class="v">${x}</b>`, fmt = n => String(Math.round(n));
  const soldi = n => new Intl.NumberFormat(A.lingua() === 'en' ? 'en-GB' : 'it-IT', {style: 'currency', currency: 'EUR'}).format(n);

  function posaFissa() {   // la scala resta quella del mobile più largo: così il mobile cresce davvero
    if (!TV || !TV.w) return;
    const grande = mobile(1200), pr = vista(VISTA_VIVA.theta, VISTA_VIVA.phi), sc = scatole(grande, 0, 0), r = riquadroDi(sc, pr);
    [-600, 600].forEach(x => { const q = pr(x, -P / 2 - S - 116, -H / 2); r[0] = Math.min(r[0], q[0]); r[2] = Math.max(r[2], q[0]); r[3] = Math.max(r[3], q[1]); });
    posaViva = adatta(r, {x: TV.w * 0.03, y: 6, w: TV.w * 0.94, h: TV.h - 36});
  }
  function disegnaViva() {
    if (tre) return tre.viva(ultimoDisegno && ultimoDisegno.L === L ? ultimoDisegno : (ultimoDisegno = mobile(L)));
    if (!TV || !colori) return;
    if (!posaViva) posaFissa();
    disegna(TV, ultimoDisegno && ultimoDisegno.L === L ? ultimoDisegno : (ultimoDisegno = mobile(L)), Object.assign({E1: 0, E2: 0, fuoco: 0, fori: 0, quota: 1, posa: posaViva, evidenzia: true}, VISTA_VIVA));
  }

  function tavola(g) {
    const el = $('a-tavola'), w = Math.max(260, el.clientWidth || 480), VW = 1200 / (1 - 60 / w), fs = 12.5 * VW / w, mx = (VW - 1200) / 2;
    const su = 2.7 * fs, giu = 2.9 * fs, x0 = (1200 - g.L) / 2, n = x => Math.round(x * 10) / 10;
    let o = `<svg viewBox="${n(-mx)} ${n(-su)} ${n(VW)} ${n(su + AF + giu)}" role="img" aria-label="${t('tav.titolo')} ${g.L} × ${AF} × ${S}">`;
    o += `<rect class="pezzo" x="${n(x0)}" y="0" width="${g.L}" height="${AF}" rx="2"/>`;
    g.lav[1].x.forEach(x => g.lav[1].y.forEach(y => { o += `<circle class="dietro" cx="${n(x0 + x)}" cy="${y}" r="${n(Math.max(5, fs * 0.2))}"/>`; }));
    g.xm.forEach(x => { o += `<circle class="foro" cx="${n(x0 + x)}" cy="${AF / 2}" r="${n(Math.max(2.5, fs * 0.13))}"/>`; });
    // la quota della lunghezza, sopra; quella dell'altezza, a destra; la catena dei fori della maniglia, sotto
    const yq = -0.85 * fs, tk = 0.28 * fs;
    o += `<path class="quota" d="M${n(x0)} ${n(yq)}H${n(x0 + g.L)}M${n(x0)} ${n(yq - tk)}V${n(-0.2 * fs)}M${n(x0 + g.L)} ${n(yq - tk)}V${n(-0.2 * fs)}"/>`;
    o += `<text class="v" x="600" y="${n(yq - 0.4 * fs)}" font-size="${n(fs * 1.15)}" font-weight="700">${g.L}</text>`;
    const xq = x0 + g.L + 0.75 * fs;
    o += `<path class="quota" d="M${n(xq)} 0V${AF}M${n(x0 + g.L + 0.2 * fs)} 0H${n(xq + tk)}M${n(x0 + g.L + 0.2 * fs)} ${AF}H${n(xq + tk)}"/>`;
    o += `<text x="${n(xq + 0.95 * fs)}" y="${AF / 2}" font-size="${n(fs)}" transform="rotate(-90 ${n(xq + 0.95 * fs)} ${AF / 2})" dominant-baseline="middle">${AF}</text>`;
    const yc = AF + 0.75 * fs, tappe = [0].concat(g.xm, [g.L]);
    o += `<path class="quota" d="M${n(x0)} ${n(yc)}H${n(x0 + g.L)}${tappe.map(x => `M${n(x0 + x)} ${n(AF + 0.2 * fs)}V${n(yc + tk)}`).join('')}"/>`;
    for (let i = 1; i < tappe.length; i++) o += `<text class="v" x="${n(x0 + (tappe[i - 1] + tappe[i]) / 2)}" y="${n(yc + 1.3 * fs)}" font-size="${n(fs)}">${fmt(tappe[i] - tappe[i - 1])}</text>`;
    el.innerHTML = o + `</svg><p class="nota sotto">${t('tav.titolo')} ${v(g.L)} × ${AF} × ${S} · ${t('tav.nota')}</p>`;
  }

  function mostra() {
    const g = seguito(L);
    numero.textContent = L; cursore.value = L; cursore.style.setProperty('--pieno', ((L - 600) / 600 * 100).toFixed(1) + '%');
    cursore.setAttribute('aria-valuetext', `${L} mm`);
    tasti.forEach(b => b.classList.toggle('scelta', +b.dataset.l === L));
    $('semaforo').firstElementChild.className = 'pallino ' + (g.serie ? 'verde' : 'giallo');
    $('semaforo-t').textContent = t(g.serie ? 'sem.serie' : 'sem.fuori', {n: L});
    const riga = (nome, valore) => `<dt>${t(nome)}</dt><dd>${valore}</dd>`;
    $('a-dna').innerHTML = `<dt class="t">${t('dna.pezzo')}</dt>` + riga('dna.grezzo', `${v(L)} × ${AF} × ${S}`) + riga('dna.lavorazioni', v(g.nLav)) + riga('dna.impronta', v(g.impronta)) +
      riga('dna.codice', v(g.codice || t('dna.nuovo')));
    $('a-regola').innerHTML = v(t(g.M.length > 1 ? 'regola.due' : 'regola.una'));
    tavola(g);
    $('a-lavorazioni').innerHTML = g.lav.map(l => `<li><span class="cod">${l.tipo}</span><span>${t(l.che)}</span><span class="q">×${v(l.x.length * l.y.length)}</span>` +
      `<span class="dove">X ${v(l.x.join(' · '))} &nbsp; Y ${l.y.join(' · ')} &nbsp; ${t(l.faccia)}</span></li>`).join('');
    $('a-distinta').innerHTML = g.distinta.map(r => {
      const cod = r.cod ? `<span class="cod">${r.segue ? v(r.cod) : r.cod}</span>` : `<span class="cod nuovo">${t(r.compra ? 'bom.chiedere' : 'bom.nuovo')}</span>`;
      const mis = r.mis ? ` <small>${r.segue ? v(r.mis) : r.mis}</small>` : r.largo ? ` <small>${v(t('bom.largo', {n: r.largo}))}</small>` : '';
      return `<li${r.qui ? ' class="qui"' : ''}>${cod}<span>${t(r.nome)}${mis}</span><span class="q">×${r.segueQ ? v(r.q) : r.q}</span></li>`;
    }).join('');
    $('a-costo').textContent = soldi(g.costo);
    const c = (a, b) => `${a.padEnd(6)}${b}\n`, X = x => v(String(x).padEnd(4));
    let prg = `<span class="c">; ${t('tav.titolo')}\n; ${v(L)} × ${AF} × ${S}\n; ${t('dna.impronta')} ${v(g.impronta)}\n; ${t('prg.esempio1')}\n; ${t('prg.esempio2')}</span>\n`;
    prg += c(t('prg.pezzo'), `LX=${v(L)} LY=${AF} LZ=${S}`) + `${t('prg.utensile')} T12 ${t('prg.punta')} Ø5\n`;
    g.xm.forEach(x => { prg += c(t('prg.foro'), `X=${X(x)} Y=${String(AF / 2).padEnd(3)} ${t('prg.passante')}`); });
    prg += t('prg.gira') + '\n' + `${t('prg.utensile')} T07 ${t('prg.punta')} Ø10\n`;
    g.lav[1].x.forEach(x => g.lav[1].y.forEach(y => { prg += c(t('prg.foro'), `X=${X(g.L - x)} Y=${String(y).padEnd(3)} P=12`); }));
    $('a-programma').innerHTML = prg + t('prg.fine');
    disegnaViva();
  }

  // la misura cambia: i numeri si accendono, e un'onda passa da un anello all'altro della catena
  function cambia(nuova) {
    nuova = lim(Math.round(nuova), 600, 1200);
    if (nuova === L) return;
    L = nuova; mostra();
    scena.classList.add('cambia'); clearTimeout(spegni); spegni = setTimeout(() => scena.classList.remove('cambia'), 420);
    const ora = performance.now();
    if (mov && ora - ondaDa > 1100) { ondaDa = ora; scena.classList.remove('onda'); void scena.offsetWidth; scena.classList.add('onda'); if (tre) tre.onda(); }
  }
  // va a una misura con dolcezza (o subito, per chi chiede meno movimento)
  function vai(a, durata, poi) {
    cancelAnimationFrame(corre);
    if (!mov) { cambia(a); if (poi) poi(); return; }
    const da = L, t0 = performance.now();
    const passo = ora => { const k = tratto(ora, t0, t0 + durata); cambia(k < 1 ? Math.round(misto(da, a, dolce(k)) / 2) * 2 : a);
      if (k < 1) corre = requestAnimationFrame(passo); else if (poi) poi(); };
    corre = requestAnimationFrame(passo);
  }
  const fermaGiro = () => { toccata = true; cancelAnimationFrame(corre); };
  cursore.addEventListener('input', () => { fermaGiro(); cambia(+cursore.value); });
  ['pointerdown', 'keydown', 'touchstart'].forEach(e => cursore.addEventListener(e, fermaGiro, {passive: true}));
  tasti.forEach(b => b.addEventListener('click', () => { fermaGiro(); vai(+b.dataset.l, 650); }));
  // la prima volta che la scena si vede, la misura fa un giro da sola: 800, 960, 800. Poi tocca a chi guarda
  if (window.IntersectionObserver) {
    const occhio = new IntersectionObserver(vv => { if (!vv.some(x => x.isIntersecting)) return; occhio.disconnect();
      if (mov && !toccata) setTimeout(() => { if (!toccata) vai(960, 1700, () => setTimeout(() => { if (!toccata) vai(800, 1500); }, 700)); }, 500); }, {threshold: 0.6});
    occhio.observe(vivoTela);
  }

  // ---------------------------------------------------------------------------------------------------------------
  // 5. QUELLO CHE ENTRA SCORRENDO
  if (window.IntersectionObserver) {
    const entra = new IntersectionObserver(vv => vv.forEach(x => { if (x.isIntersecting) { x.target.classList.add('visto'); entra.unobserve(x.target); } }), {threshold: 0.18, rootMargin: '0px 0px -6% 0px'});
    doc.querySelectorAll('.entra').forEach(e => entra.observe(e));
  } else doc.querySelectorAll('.entra').forEach(e => e.classList.add('visto'));

  // ---------------------------------------------------------------------------------------------------------------
  // L'AVVIO
  let inAttesa = false;
  const quadro = () => { inAttesa = false; muoviPalco(); };
  const chiedi = () => { if (!inAttesa) { inAttesa = true; requestAnimationFrame(quadro); } };
  function movimento() {
    mov = !fermoChiesto(); radice.classList.toggle('mov', mov);
    if (!mov && tre) return location.reload();   // il 3D si spegne ricaricando: la pagina ferma usa il disegno
    dide.forEach(d => { d.style.opacity = ''; d.style.transform = ''; d.style.pointerEvents = ''; });
    requestAnimationFrame(() => { muoviPalco(); disegnaPalco(); });
  }
  const ascolta = (mq, f) => mq.addEventListener ? mq.addEventListener('change', f) : mq.addListener(f);
  ascolta(chiedeFermo, movimento);
  ascolta(scuro, () => { leggiColori(); disegnaPalco(); disegnaViva(); if (tre) tre.tema(); });
  addEventListener('scroll', chiedi, {passive: true});
  addEventListener('resize', () => { chiedi(); tavola(seguito(L)); });
  A.suCambio(() => mostra());

  leggiColori();
  radice.classList.toggle('mov', mov);
  TP = tela(palcoTela, () => { muoviPalco(); disegnaPalco(); });
  TV = tela(vivoTela, () => { posaViva = null; disegnaViva(); });
  mostra();
  muoviPalco(); disegnaPalco();
  // per il 3D (scena3d.js), per le prove e per le foto. Il 3D, quando è pronto, si presenta con «accendi»: da lì il
  // palco e la tela della scena viva li disegna lui, con lo stesso modello e lo stesso copione
  window.ALBURN.scena = {larghezza: () => L, cambia, seguito, mobile, palco: () => pPalco, copione: () => copione(pPalco), misure: {P, H, S, AF}, mob800, mov: () => mov,
    accendi: t3 => { tre = t3; radice.classList.add('tre'); disegnaViva(); }, tre: () => !!tre, resa: () => tre && tre.resa ? tre.resa() : null};
})();
