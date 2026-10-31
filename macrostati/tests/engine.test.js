'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const E = require('../js/engine.js');
const SCENARI = require('../js/scenarios.js');
const C = require('../js/content.js');

test('ogni scenario parte con dati coerenti', () => {
  for (const id of Object.keys(SCENARI)) {
    const s = E.statoIniziale(id);
    const sc = SCENARI[id];
    assert.equal(s.turno, 1);
    assert.ok(s.pil > 0, id);
    assert.ok(s.debitoPct > 0 && s.debitoPct < 200, id);
    assert.ok(s.inflazione >= -2 && s.inflazione <= 15, id);
    assert.ok(s.consenso > 0 && s.democrazia > 0, id);
    assert.equal(s.scenarioId, id);
    assert.equal(s.popolazione, sc.popolazione);
  }
});

test('il debito/PIL iniziale è coerente con il debito nominale dello scenario', () => {
  const s = E.statoIniziale('sardegna');
  const sc = SCENARI.sardegna;
  assert.ok(Math.abs(s.debitoPct - sc.debito / sc.pil * 100) < 1e-9);
});

test('20 turni portano sempre a game over', () => {
  let seed = 42;
  const rng = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
  for (const id of Object.keys(SCENARI)) {
    const s = E.statoIniziale(id);
    let guard = 0;
    while (!s.gameOver && guard < 100) {
      E.simulaTurno(s, { misuraId: 'investimenti_pubblici', prioritaId: 'infrastrutture', eventoScelto: s.eventoCorrente ? s.eventoCorrente.choices[0].label : null }, rng);
      guard++;
    }
    assert.ok(s.gameOver, id + ' deve terminare');
    assert.ok(['completato', 'default', 'rivolta', 'dittatura', 'iperinflazione'].includes(s.esito), id);
    assert.ok(s.history.length <= E.TURNI_TOTALI, id);
  }
});

test('il deficit calcolabile rispetta l\u2019identità contabile', () => {
  const s = E.statoIniziale('catalogna');
  const d = E.deficita(s);
  assert.ok(Math.abs(d.deficit - (d.entrate - d.uscite)) < 1e-9);
  assert.ok(Math.abs(d.deficitPct - d.deficit / s.pilNominale * 100) < 1e-9);
});

test('una misura aumenta la spesa come previsto', () => {
  const s = E.statoIniziale('sardegna');
  const prima = s.spesaPct;
  E.simulaTurno(s, { misuraId: 'investimenti_pubblici', eventoScelto: null }, () => 0.5);
  assert.ok(s.spesaPct > prima, 'spesaPct deve salire');
});

test('la scelta di un evento viene applicata e registrata', () => {
  const s = E.statoIniziale('corsica');
  let seed = 7;
  const rng = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
  let tentativi = 0;
  while (!s.eventoCorrente && tentativi < 200 && !s.gameOver) {
    E.simulaTurno(s, { eventoScelto: null }, rng);
    tentativi++;
  }
  assert.ok(s.eventoCorrente, 'prima o poi deve pescare un evento');
  const scelta = s.eventoCorrente.choices[0].label;
  const consensoPrima = s.consenso;
  E.simulaTurno(s, { eventoScelto: scelta }, rng);
  assert.ok(s.log.some(v => v.testo.includes('\u{1F4A1}')), 'la scelta deve essere nel log');
});

test('misure con cooldown non si riapplicano entro il periodo di blocco', () => {
  const s = E.statoIniziale('sardegna');
  E.simulaTurno(s, { misuraId: 'debito', eventoScelto: null }, () => 0.5);
  assert.equal(s.measuresUsate['debito'], 1);
  const tassoPrima = s.tasso;
  E.simulaTurno(s, { misuraId: 'debito', eventoScelto: null }, () => 0.5);
  assert.equal(s.measuresUsate['debito'], 1, 'il cooldown impedisce la riapplicazione');
  assert.ok(s.tasso > tassoPrima - 0.01, 'il tasso non viene tagliato di nuovo');
});

test('default quando il debito supera il 200%', () => {
  const s = E.statoIniziale('sardegna');
  s.debitoPct = 199.5;
  s.spesaPct = 65;
  s.taxRate = 15;
  E.simulaTurno(s, { eventoScelto: null }, () => 0.99);
  if (s.debitoPct >= 200) assert.equal(s.esito, 'default');
  assert.ok(s.gameOver || s.debitoPct < 200);
});

test('descriviStato espone tutti gli indicatori per la UI', () => {
  const s = E.statoIniziale('scozia');
  E.simulaTurno(s, { eventoScelto: null }, () => 0.5);
  const d = E.descriviStato(s);
  for (const k of ['pil', 'inflazione', 'disoccupazione', 'deficitPct', 'debitoPct', 'consenso', 'democrazia', 'history', 'log', 'evento']) {
    assert.ok(k in d, k);
  }
  assert.ok(d.pilProCapite > 1000);
});

test('tutti gli eventi hanno scelte con effetti e apply valido', () => {
  for (const ev of C.EVENTI) {
    assert.ok(ev.choices.length >= 2, ev.id);
    assert.ok(ev.testo && ev.titolo, ev.id);
    for (const c of ev.choices) assert.ok(c.label && c.effects && c.msg, ev.id);
    assert.ok(ev.applies === 'all' || ev.applies.every(a => a in SCENARI), ev.id);
  }
});

test('tutte le misure hanno id univivo e effetti', () => {
  const ids = C.MISURE.map(m => m.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const m of C.MISURE) assert.ok(m.effects && m.nome && m.icona, m.id);
});
