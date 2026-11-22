// Alburn, la pagina di alburn.it: i testi e l'interruttore IT/EN (21 novembre 2026).
// L'italiano dei testi fermi sta nella pagina (index.html, gli elementi con data-t); qui c'è il loro inglese (EN).
// Un testo può avere <br>, l'a capo forzato dopo il punto: nella pagina è un vero elemento <br>. Negli attributi diventa uno spazio.
// I testi che la scena scrive da sola (DIN) hanno tutte e due le lingue.
// La lingua di partenza: ?lang=it o ?lang=en nell'indirizzo, poi quella scelta l'ultima volta, poi quella del browser.
// La scelta si ricorda solo nel browser di chi guarda (localStorage, una voce): niente cookie, niente va altrove.
(function () {
  'use strict';

  const EN = {
    'meta.titolo': 'Alburn. One system, around the item.',
    'meta.descrizione': 'Alburn is one system for everything that revolves around the item: engineering, production, stock and reordering, purchasing, sales. For furniture makers.',
    'salta': 'Skip to content',
    'marchio.aria': 'Alburn, back to top',
    'nav.aria': 'Page sections',
    'nav.sistema': 'The system',
    'nav.esempio': 'The example',
    'nav.principi': 'The principles',
    'nav.punto': 'The state',
    'nav.contatto': 'Contact',
    'lingue.aria': 'Language',

    'hero.titolo': 'All connected.',
    'hero.sotto': 'One system for everything that revolves around the item, in the furniture industry.<br>From the hole to the factory, one single\u00a0chain.',
    'hero.scorri': 'Scroll',

    'prima.occhiello': 'The starting point',
    'prima.titolo': 'Many systems.<br>Many archives.',
    'prima.cappello': 'A company runs on several systems that pass data to one another.<br>Each keeps its own copy.<br>Between one and the next, the data pass by hand.',
    'prima.1': 'the orders',
    'prima.2': 'the drawings',
    'prima.3': 'the bills of materials',
    'prima.4': 'the programs',
    'prima.5': 'the stock',
    'prima.6': 'the price lists',
    'prima.chiusa': 'The same data is written in many archives.<br>When it changes, it has to be changed everywhere.',
    'prima.tela': 'Six systems, each with its own copy of the data',

    'catena.occhiello': 'The system',
    'catena.titolo': 'One single chain.',
    'catena.cappello': 'Alburn takes the place of separate systems and archives.<br>It governs everything that revolves around the item.<br>Each piece of data is written once, and every area reads it from there.',
    'sopra.titolo': 'From above, the request.',
    'sopra.testo': 'The customer’s request goes down the chain: the cabinet, the parts, the machining, the machine.',
    'sotto.titolo': 'From below, the opportunity.',
    'sotto.testo': 'The warehouse comes up the same chain: what is in stock becomes an opportunity.',
    'aree.titolo': 'Five areas, the same data.',
    'area.1.nome': 'Engineering',
    'area.1.testo': 'The part, the machining, the drawing and the bill of materials come from the same description.',
    'area.2.nome': 'Production',
    'area.2.testo': 'The routing steps and the machine programs follow the part.',
    'area.3.nome': 'Stock and reordering',
    'area.3.testo': 'Stock and reorders are counted on the same items.',
    'area.4.nome': 'Purchasing',
    'area.4.testo': 'Components and outside processing have their suppliers and their costs.',
    'area.5.nome': 'Sales',
    'area.5.testo': 'The price list and the quotation read the cost from the bill of materials.',
    'catena.tela': 'The helix links the systems into one single chain',

    'esempio.occhiello': 'An example',
    'esempio.nota': 'The cabinet is an example of the chain, not the product.',
    'palco.aria': 'The example cabinet opens up',
    'palco.tela': 'A sample piece of furniture drawn as a line model: as the page scrolls it comes apart into panels and hardware, and the holes appear on the side panel',
    'd1.grande': 'One cabinet.',
    'd1.sotto': 'A sample piece of furniture.<br>800 mm wide, 460 mm deep, 500 mm high.',
    'd2.grande': 'panels.',
    'd2.sotto': 'Each panel has its own single description: the blank, the machining, what it is for.<br>It is the DNA of the part.',
    'd3.grande': 'components.',
    'd3.sotto': 'The runners, drawers, handles, brackets and basin each bring their own fixing points.',
    'd4.grande': 'holes.',
    'd4.sotto': 'No hole is drawn by hand.<br>The component asks for it, the panel receives it.',
    'd5.grande': 'Each link holds the next.',
    'd5.sotto': 'The first one changes, and the last one follows.',
    'passo.1': 'the part',
    'passo.2': 'the machining',
    'passo.3': 'the drawing',
    'passo.4': 'the bill of materials',
    'passo.5': 'the machine',
    'vivo.occhiello': 'The proof',
    'vivo.titolo': 'One measure changes.<br>Everything follows.',
    'vivo.cappello': 'Drag the width.<br>The part, the machining, the drawing, the bill of materials, the cost and the program rewrite themselves together.<br>They come from the same description.',
    'vivo.tela': 'The example cabinet, with the upper drawer front highlighted: it gets wider and narrower with the chosen measure',
    'vivo.larghezza': 'Width',
    'vivo.serie': 'standard',
    'vivo.serie.aria': 'The standard widths',
    'vivo.avviso': 'The scene is an example, with example data.',
    'a1.titolo': 'The DNA of the part',
    'a1.nota': 'One description: the blank, the machining, what it is for.',
    'a2.titolo': 'The part and its drawing',
    'a3.titolo': 'The machining',
    'a4.titolo': 'The bill of materials',
    'a4.costo': 'Example cost',
    'a5.titolo': 'The machine',
    'a5.aria': 'The example program for the drilling machine',

    'cose.occhiello': 'Three principles',
    'p1.grande': 'The part is described once.',
    'p1.sotto': 'The model, the drawing, the bill of materials and the program are read from that description.<br>Nothing has to be realigned by hand.',
    'p2.grande': 'A non-standard part gets its cost at once.',
    'p2.sotto': 'For a non-standard part Alburn gives the cost and the possible ways through.<br>The designer chooses.<br>Then the part goes into production like a standard one.',
    'p3.grande': 'As in the small, so in the large.',
    'p3.sotto': 'The same rule holds in the hole and in the factory.<br>The part sits in the cabinet, the cabinet in the range, the range in production.<br>Every level is made like the others.',

    'entra.occhiello': 'Moving to Alburn',
    'entra.titolo': 'One step at a time.',
    'entra.1.grande': 'Alburn reads what is there.',
    'entra.1.sotto': 'It starts from the ERP and the archives the company already has.',
    'entra.2.grande': 'It takes one area at a time.',
    'entra.2.sotto': 'First the item and engineering, then production and the warehouse, then purchasing.',
    'entra.3.grande': 'Accounting and tax stay where they are.',
    'entra.3.sotto': 'They stay with a conventional ERP.',

    'punto.occhiello': 'The state',
    'punto.titolo': 'Where we are.',
    'punto.cappello': 'Alburn is in development.<br>Every function listed under “today” is proven by an automatic test.',
    'oggi.titolo': 'Today',
    'oggi.1': 'The single description of the part, with the check that recognises two identical parts, even under different codes.',
    'oggi.2': 'The company’s rules, written once and always applied.<br>Each rule answers: possible, possible at its cost, impossible.',
    'oggi.3': 'A sample piece of furniture, parametric, with its chart of sizes.<br>The components drill the panels from their fixing points.',
    'oggi.4': 'The example bill of materials, cost and price list, which follow the model.',
    'oggi.5': 'Example programs for the drilling machine, the panel saw and the edgebander, written from the description of the part.<br>They are not yet checked against real programs: they are not for a machine.',
    'oggi.6': 'The item documents, in Italian and English, with a revision that follows the item.',
    'oggi.7': 'A first window for the engineering office, from the size chart to approval.',
    'svil.titolo': 'In development',
    'svil.1': 'The modeller: the area where the engineering office draws the standard parts and their fixing points with the mouse.',
    'svil.2': 'The structure of the cabinet, drawn once: the models come from there.',
    'svil.3': 'The complete interface for the engineering office.',
    'prog.titolo': 'Planned',
    'prog.1': 'The connectors that read a real ERP.',
    'prog.2': 'Cleaning up an existing archive: finding identical parts under different codes.',
    'prog.3': 'Checking the programs against those of real machines, and then production.',
    'prog.4': 'Stock and reordering, and purchasing.',
    'prog.5': 'The sales configurator, today a first trial page, and the customer portal.',
    'prog.6': 'The part that proposes: a model that suggests rules.<br>Decisions and calculations stay with the deterministic part.',
    'prog.7': 'The first work inside a real company, one area at a time.',

    'contatto.titolo': 'Alburn up close.',
    'contatto.testo': 'For furniture makers and hardware suppliers: a demonstration on the example company.',
    'contatto.tasto': 'Request a demonstration',
    'piede.privacy': 'This page collects no data: no cookies, no analytics, nothing loaded from other sites.<br>It only remembers the chosen language, in the reader’s browser.<br>As with any site, the host records the technical data of each visit.',
    'piede.esempio': 'All the data on this page are examples.',
    'piede.chi': 'Alburn is a product by Paolo Moreschi.'
  };

  // i testi che la scena scrive da sola. Fra graffe i valori: {n}
  const DIN = {
    'sem.serie': {it: 'Di serie: tutto approvato.', en: 'Standard: all approved.'},
    'sem.fuori': {it: 'Fuori serie: possibile, con un costo in più.', en: 'Non-standard: possible, at extra cost.'},
    'regola.una': {it: 'Regola d\'esempio: fino a 900 mm, una maniglia per frontale.', en: 'Example rule: up to 900 mm, one handle per drawer front.'},
    'regola.due': {it: 'Regola d\'esempio: oltre 900 mm, due maniglie per frontale.', en: 'Example rule: over 900 mm, two handles per drawer front.'},
    'dna.pezzo': {it: 'frontale alto', en: 'upper drawer front'},
    'dna.grezzo': {it: 'grezzo', en: 'blank'},
    'dna.lavorazioni': {it: 'lavorazioni', en: 'machining'},
    'dna.impronta': {it: 'impronta', en: 'fingerprint'},
    'dna.codice': {it: 'codice', en: 'code'},
    'dna.nuovo': {it: 'nuovo, nasce all’approvazione', en: 'new, created on approval'},
    'lav.maniglia': {it: 'Foro passante Ø5, per la maniglia', en: 'Through hole Ø5, for the handle'},
    'lav.aggancio': {it: 'Foro Ø10 profondo 12, per l\'aggancio al cassetto', en: 'Hole Ø10, 12 deep, for fixing to the drawer'},
    'lav.dietro': {it: 'faccia dietro', en: 'back face'},
    'lav.davanti': {it: 'faccia davanti', en: 'front face'},
    'tav.titolo': {it: 'Frontale alto', en: 'Upper drawer front'},
    'tav.nota': {it: 'tratteggiati: i fori sulla faccia dietro', en: 'dashed: the holes on the back face'},
    'bom.frontale': {it: 'Frontale', en: 'Drawer front'},
    'bom.fianco': {it: 'Fianco', en: 'Side panel'},
    'bom.fondo': {it: 'Fondo', en: 'Bottom panel'},
    'bom.fascia': {it: 'Fascia', en: 'Rail'},
    'bom.lavabo': {it: 'Lavabo che fa da top', en: 'Basin top'},
    'bom.cassetto': {it: 'Cassetto', en: 'Drawer'},
    'bom.guide': {it: 'Guide, la coppia', en: 'Runners, pair'},
    'bom.maniglia': {it: 'Maniglia, interasse 160', en: 'Handle, 160 centres'},
    'bom.staffa': {it: 'Staffa a muro', en: 'Wall bracket'},
    'bom.nuovo': {it: 'nuovo', en: 'new'},
    'bom.chiedere': {it: 'da chiedere', en: 'to request'},
    'bom.largo': {it: 'largo {n}', en: '{n} wide'},
    'prg.pezzo': {it: 'PEZZO', en: 'PART'},
    'prg.utensile': {it: 'UTENSILE', en: 'TOOL'},
    'prg.punta': {it: 'punta', en: 'bit'},
    'prg.foro': {it: 'FORO', en: 'DRILL'},
    'prg.passante': {it: 'passante', en: 'through'},
    'prg.gira': {it: 'GIRA  sulla faccia dietro', en: 'FLIP  to the back face'},
    'prg.fine': {it: 'FINE', en: 'END'},
    'prg.esempio1': {it: 'programma d\'esempio,', en: 'example program,'},
    'prg.esempio2': {it: 'non per una macchina', en: 'not for a machine'}
  };

  const doc = document, radice = doc.documentElement;
  const IT = {}, ascolta = [];
  let lingua = 'it';

  // gli attributi che si traducono: data-t-aria scrive aria-label, data-t-content scrive content, data-t-title scrive title
  const ATTRIBUTI = {tAria: 'aria-label', tContent: 'content', tTitle: 'title', tAlt: 'alt'};
  const ATTR_SEL = Object.keys(ATTRIBUTI).map(k => '[data-' + k.replace(/[A-Z]/g, c => '-' + c.toLowerCase()) + ']');
  const senzaA = s => String(s).replace(/<br\s*\/?>/gi, ' ');

  // un testo con <br> diventa testo e veri elementi <br> (mai innerHTML)
  function scrivi(e, s) {
    e.textContent = '';
    s.split('<br>').forEach((parte, i) => {
      if (i) e.appendChild(doc.createElement('br'));
      if (parte) e.appendChild(doc.createTextNode(parte));
    });
  }
  // il contrario: i nodi dell'elemento tornano una stringa, con <br> al posto degli elementi <br>
  function leggi(e) {
    let s = '';
    e.childNodes.forEach(n => { s += n.nodeName === 'BR' ? '<br>' : n.textContent; });
    return s;
  }

  // l'italiano si legge dalla pagina, una volta
  doc.querySelectorAll('[data-t]').forEach(e => { IT[e.dataset.t] = leggi(e); });
  Object.keys(ATTRIBUTI).forEach((k, i) => {
    doc.querySelectorAll(ATTR_SEL[i]).forEach(e => { IT[e.dataset[k]] = senzaA(e.getAttribute(ATTRIBUTI[k])); });
  });

  function t(chiave, valori) {
    const d = DIN[chiave];
    let s = d ? d[lingua] : lingua === 'en' ? EN[chiave] : IT[chiave];
    if (s == null) s = d ? d.it : IT[chiave] != null ? IT[chiave] : chiave;
    return valori ? s.replace(/\{(\w+)\}/g, (_, n) => valori[n]) : s;
  }

  function metti(nuova, ricorda) {
    lingua = nuova === 'en' ? 'en' : 'it';
    radice.lang = lingua;
    doc.querySelectorAll('[data-t]').forEach(e => { scrivi(e, t(e.dataset.t)); });
    Object.keys(ATTRIBUTI).forEach((k, i) => {
      doc.querySelectorAll(ATTR_SEL[i]).forEach(e => { e.setAttribute(ATTRIBUTI[k], senzaA(t(e.dataset[k]))); });
    });
    doc.querySelectorAll('[data-lingua]').forEach(b => { b.setAttribute('aria-pressed', String(b.dataset.lingua === lingua)); });
    if (ricorda) { try { localStorage.setItem('alburn.lingua', lingua); } catch (e) { /* senza memoria: vale per questa visita */ } }
    ascolta.forEach(f => f(lingua));
  }

  function partenza() {
    const chiesta = new URLSearchParams(location.search).get('lang');
    if (chiesta === 'it' || chiesta === 'en') return chiesta;
    try { const scelta = localStorage.getItem('alburn.lingua'); if (scelta === 'it' || scelta === 'en') return scelta; } catch (e) { /* senza memoria */ }
    const browser = (navigator.languages && navigator.languages[0]) || navigator.language || 'it';
    return /^it\b/i.test(browser) ? 'it' : 'en';
  }

  doc.querySelectorAll('[data-lingua]').forEach(b => b.addEventListener('click', () => metti(b.dataset.lingua, true)));

  window.ALBURN = {t, metti, lingua: () => lingua, suCambio: f => ascolta.push(f), EN, DIN, IT};
  metti(partenza(), false);
})();
