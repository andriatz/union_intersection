/* MacroStati — motore di simulazione macroeconomica a turni (1 turno = 1 trimestre).
 * Modello stilizzato ma coerente: PIL reale, inflazione (curva di Phillips + domanda),
 * finanza pubblica (entrate da taxRate + compliance, spesa, interessi sul debito),
 * mercato del lavoro, indici di qualit\u00E0 democratica e consenso, eventi casuali.
 */
(function (root, factory) {
  const deps = (typeof module !== 'undefined' && module.exports)
    ? { SCENARI: require('./scenarios.js'), C: require('./content.js') }
    : { SCENARI: root.MACRO_SCENARI, C: root.MACRO_CONTENUTI };
  const api = factory(deps);
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.MACRO_ENGINE = api;
})(typeof self !== 'undefined' ? self : globalThis, function ({ SCENARI, C }) {
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const TURNI_TOTALI = 20;

  function statoIniziale(scenarioId) {
    const s = SCENARI[scenarioId];
    if (!s) throw new Error('Scenario sconosciuto: ' + scenarioId);
    return {
      scenarioId,
      turno: 1,
      anno: s.annoBase,
      pil: s.pil,
      pilNominale: s.pil,
      inflazione: s.inflazioneBase,
      disoccupazione: s.disoccupazione,
      tasso: s.tassoBase,
      taxRate: s.taxRate,
      spesaPct: s.spesaPct,
      debitoPct: s.debito / s.pil * 100,
      consenso: s.consenso,
      democrazia: s.democrazia,
      popolazione: s.popolazione,
      croissance: s.crescitaBase,
      compliance: 0.78,
      human: 50,
      innovation: 40,
      green: 35,
      infra: 40,
      fdi: 40,
      exportLivello: s.exportPct,
      turismoLivello: s.turismoPct,
      measuresUsate: {},
      priorita: null,
      prioritaAppicata: null,
      eventoCorrente: null,
      log: [],
      history: [],
      gameOver: false,
      esito: null,
      ultimoEventoId: null,
      debitiScaduti: 0
    };
  }

  function registra(stato, testo, tipo = 'info') {
    stato.log.unshift({ turno: stato.turno, testo, tipo });
    if (stato.log.length > 60) stato.log.length = 60;
  }

  function applicaEffetti(stato, effects, mul = 1) {
    if (!effects) return;
    const e = effects;
    if (e.taxDelta) stato.taxRate = clamp(stato.taxRate + e.taxDelta * mul, 15, 60);
    if (e.spendDelta) stato.spesaPct = clamp(stato.spesaPct + e.spendDelta * mul, 20, 65);
    if (e.compliance) stato.compliance = clamp(stato.compliance + e.compliance * mul, 0, 1);
    if (e.inflation) stato.inflazione += e.inflation * mul;
    if (e.unemployment) stato.disoccupazione = clamp(stato.disoccupazione + e.unemployment * mul, 0, 40);
    if (e.interestDelta) stato.tasso = clamp(stato.tasso + e.interestDelta * mul, 0.25, 15);
    if (e.debtPctDelta) stato.debitoPct = clamp(stato.debitoPct + e.debtPctDelta * mul, 0, 400);
    if (e.consensus) stato.consenso = clamp(stato.consenso + e.consensus * mul, 0, 100);
    if (e.democracy) stato.democrazia = clamp(stato.democrazia + e.democracy * mul, 0, 100);
    if (e.human) stato.human = clamp(stato.human + e.human * mul, 0, 100);
    if (e.innovation) stato.innovation = clamp(stato.innovation + e.innovation * mul, 0, 100);
    if (e.green) stato.green = clamp(stato.green + e.green * mul, 0, 100);
    if (e.infra) stato.infra = clamp(stato.infra + e.infra * mul, 0, 100);
    if (e.fdi) stato.fdi = clamp(stato.fdi + e.fdi * mul, 0, 100);
    if (e.export) stato.exportLivello = clamp(stato.exportLivello + e.export * mul, 0, 60);
    if (e.tourism) stato.turismoLivello = clamp(stato.turismoLivello + e.tourism * mul, 0, 60);
    if (e.population) {
      stato.popolazione = Math.max(0.05, stato.popolazione * (1 + e.population));
    }
  }

  function deficita(stato) {
    const entrate = stato.taxRate / 100 * (0.92 + 0.08 * stato.compliance) * stato.pilNominale;
    const interessi = stato.debitoPct / 100 * stato.pilNominale * stato.tasso / 100;
    const uscite = stato.spesaPct / 100 * stato.pilNominale + interessi;
    return { entrate, uscite, interessi, deficit: entrate - uscite, deficitPct: (entrate - uscite) / stato.pilNominale * 100 };
  }

  function pescaEvento(stato, rng) {
    const s = SCENARI[stato.scenarioId];
    const pescabili = C.EVENTI.filter(ev => {
      if (ev.id === stato.ultimoEventoId) return false;
      if (ev.applies === 'all') return true;
      return ev.applies.includes(s.id);
    });
    if (!pescabili.length) return null;
    const idx = Math.floor(rng() * pescabili.length);
    return pescabili[idx];
  }

  function simulaTurno(stato, decisioni, rng = Math.random) {
    if (stato.gameOver) return stato;
    rng = rng || Math.random;
    const s = SCENARI[stato.scenarioId];

    if (decisioni.misuraId) {
      const m = C.MISURE.find(x => x.id === decisioni.misuraId);
      if (m) {
        const cd = m.effects.cooldown || 0;
        const usato = stato.measuresUsate[m.id];
        if (cd && usato && (stato.turno - usato) < cd) {
          registra(stato, '\u{1F4CB} ' + m.nome + ' non disponibile: trattativa già aperta al turno ' + usato + '.', 'allerta');
        } else {
          applicaEffetti(stato, m.effects);
          stato.measuresUsate[m.id] = stato.turno;
          registra(stato, '\u{1F4CB} ' + m.nome + ': ' + m.desc, 'misura');
        }
      }
    }
    if (decisioni.prioritaId && decisioni.prioritaId !== stato.prioritaAppicata) {
      const p = C.PRIORITA.find(x => x.id === decisioni.prioritaId);
      if (p) {
        stato.priorita = p.id;
        stato.prioritaAppicata = p.id;
        applicaEffetti(stato, p.effects);
        registra(stato, '\u{1F3AF} Nuova priorità di governo: ' + p.nome, 'misura');
      }
    }

    if (decisioni.eventoScelto) {
      const ev = stato.eventoCorrente;
      const scelta = ev && ev.choices.find(c => c.label === decisioni.eventoScelto);
      if (scelta) {
        applicaEffetti(stato, scelta.effects);
        registra(stato, '\u{1F4A1} ' + ev.titolo + ' \u2192 ' + scelta.msg, 'evento');
      }
      stato.eventoCorrente = null;
    } else if (stato.eventoCorrente) {
      registra(stato, '\u26A0\uFE0F ' + stato.eventoCorrente.titolo + ' ignorato: le conseguenze llegano.', 'allerta');
      applicaEffetti(stato, { growth: -0.4, consensus: -3 });
      stato.eventoCorrente = null;
    }

    const d = deficita(stato);
    const crescitaPotenziale =
      0.4
      + stato.innovation * 0.006
      + stato.human * 0.004
      + stato.infra * 0.003
      + stato.fdi * 0.002
      + (stato.green > 60 ? 0.3 : 0)
      + (stato.exportLivello > 25 ? 0.4 : 0)
      - stato.disoccupazione * 0.01;

    let domanda = 0;
    domanda += (stato.spesaPct - s.spesaPct) * 0.15;
    domanda += (s.taxRate - stato.taxRate) * 0.12;
    domanda += stato.turismoLivello > 20 ? (stato.turismoLivello - 20) * 0.02 : -0.2;
    domanda += (stato.exportLivello - s.exportPct) * 0.08;

    const shock = (rng() - 0.5) * 0.6;
    let crescitaAnnuale = clamp(crescitaPotenziale + domanda + shock, -8, 10);

    stato.pil = stato.pil * (1 + crescitaAnnuale / 400);

    stato.inflazione = clamp(
      stato.inflazione
        + (2.0 - stato.inflazione) * 0.06
        + (crescitaAnnuale - s.crescitaBase) * 0.09
        + (stato.disoccupazione < 5 ? 0.04 : 0)
        + (stato.spesaPct > 50 ? 0.05 : 0)
        + (rng() - 0.5) * 0.4,
      -1, 15
    );

    stato.disoccupazione = clamp(
      stato.disoccupazione - crescitaAnnuale * 0.35 - (stato.innovation - 40) * 0.01 + (rng() - 0.5) * 0.3,
      2, 40
    );

    stato.pilNominale = stato.pil * (1 + stato.inflazione / 100);

    const d2 = deficita(stato);
    stato.debitoPct = clamp(stato.debitoPct + (-d2.deficitPct) / 4 + (d2.interessi / stato.pilNominale * 100) / 4, 0, 400);

    stato.consenso = clamp(
      stato.consenso
        + (50 - stato.consenso) * 0.03
        + crescitaAnnuale * 0.8
        + (stato.inflazione > 4 ? -3 : stato.inflazione < 2 ? 1 : 0)
        + (stato.disoccupazione > 12 ? -3 : 0)
        + (rng() - 0.5) * 2,
      0, 100
    );
    stato.democrazia = clamp(stato.democrazia + (rng() - 0.5) * 0.5, 0, 100);

    const evento = pescaEvento(stato, rng);
    if (evento && rng() < 0.55) {
      stato.eventoCorrente = evento;
      stato.ultimoEventoId = evento.id;
      registra(stato, '\u{1F5DE}\uFE0F Evento: ' + evento.titolo + ' — ' + evento.testo, 'evento');
    }

    stato.history.push({
      turno: stato.turno,
      pil: +stato.pil.toFixed(2),
      crescita: +crescitaAnnuale.toFixed(2),
      inflazione: +stato.inflazione.toFixed(2),
      disoccupazione: +stato.disoccupazione.toFixed(2),
      deficitPct: +d2.deficitPct.toFixed(2),
      debitoPct: +stato.debitoPct.toFixed(2),
      consenso: Math.round(stato.consenso),
      democrazia: Math.round(stato.democrazia)
    });

    stato.turno += 1;
    if (stato.turno % 4 === 1 && stato.turno > 1) stato.anno += 1;

    verificaFine(stato);
    return stato;
  }

  function verificaFine(stato) {
    if (stato.debitoPct >= 200) return fine(stato, 'default', 'Il debito ha superato il 200% del PIL: default sovrano. I mercati ti hanno chiuso.');
    if (stato.consenso <= 5) return fine(stato, 'rivolta', 'Il consenso \u00E8 crollato: la piazza ti ha cacciato.');
    if (stato.democrazia <= 20) return fine(stato, 'dittatura', 'La democrazia \u00E8 collassata: sei diventato un regime autoritario.');
    if (stato.inflazione >= 15) return fine(stato, 'iperinflazione', 'Iperinflazione: la valuta si \u00E8 azzerata.');
    if (stato.turno > TURNI_TOTALI) {
      const h = stato.history[stato.history.length - 1];
      let punteggio = 0;
      punteggio += clamp(100 - stato.debitoPct, 0, 100) * 0.30;
      punteggio += clamp(h.deficitPct + 3, 0, 6) / 6 * 100 * 0.15;
      punteggio += clamp(10 - stato.inflazione, 0, 8) / 8 * 100 * 0.15;
      punteggio += clamp(20 - stato.disoccupazione, 0, 18) / 18 * 100 * 0.15;
      punteggio += clamp(h.crescita, 0, 5) / 5 * 100 * 0.10;
      punteggio += stato.consenso * 0.10;
      punteggio += stato.democrazia * 0.05;
      const grado =
        punteggio >= 80 ? 'Stato modello \u{1F31F}' :
        punteggio >= 65 ? 'Stato solido \u{1F44D}' :
        punteggio >= 50 ? 'Stato in equilibrio precario \u{1F6A7}' :
        punteggio >= 35 ? 'Stato in difficolt\u00E0 \u{1F4C9}' : 'Stato fallito \u{1F480}';
      return fine(stato, 'completato', '5 anni al potere. Giudizio finale: ' + grado + ' (' + Math.round(punteggio) + '/100).', punteggio, grado);
    }
  }

  function fine(stato, esito, msg, punteggio, grado) {
    stato.gameOver = true;
    stato.esito = esito;
    stato.messaggioFinale = msg;
    stato.punteggio = punteggio != null ? Math.round(punteggio) : null;
    stato.grado = grado || null;
    registra(stato, '\u{1F3C1} ' + msg, 'fine');
  }

  function descriviStato(stato) {
    const s = SCENARI[stato.scenarioId];
    const d = deficita(stato);
    return {
      nome: s.nome, simbolo: s.simbolo, turno: stato.turno, anno: stato.anno,
      pil: stato.pil, pilNominale: stato.pilNominale,
      pilProCapite: stato.pilNominale * 1000 / stato.popolazione,
      inflazione: stato.inflazione, disoccupazione: stato.disoccupazione,
      tasso: stato.tasso, taxRate: stato.taxRate, spesaPct: stato.spesaPct,
      deficitPct: d.deficitPct, interessi: d.interessi, debitoPct: stato.debitoPct,
      consenso: stato.consenso, democrazia: stato.democrazia,
      compliance: stato.compliance, human: stato.human, innovation: stato.innovation,
      green: stato.green, infra: stato.infra, fdi: stato.fdi,
      exportLivello: stato.exportLivello, turismoLivello: stato.turismoLivello,
      evento: stato.eventoCorrente, log: stato.log, history: stato.history,
      gameOver: stato.gameOver, esito: stato.esito, messaggioFinale: stato.messaggioFinale,
      punteggio: stato.punteggio, grado: stato.grado
    };
  }

  return { TURNI_TOTALI, statoIniziale, simulaTurno, descriviStato, deficita, clamp };
});
