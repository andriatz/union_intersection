/* MacroStati — interfaccia mobile-first. */
(function () {
  'use strict';

  const E = window.MACRO_ENGINE;
  const S = window.MACRO_SCENARI;
  const C = window.MACRO_CONTENUTI;

  let stato = null;
  let misuraSelezionata = null;
  let prioritaSelezionata = null;
  let sceltaEvento = null;

  const $ = sel => document.querySelector(sel);

  function mostra(id) {
    document.querySelectorAll('.schermata').forEach(el => el.classList.remove('attiva'));
    $(id).classList.add('attiva');
    window.scrollTo({ top: 0 });
  }

  const fmt = (v, digits = 1) => (v < 0 ? '\u2212' : '') + Math.abs(v).toFixed(digits);
  const fmtPct = v => (v < 0 ? '\u2212' : '') + Math.abs(v).toFixed(1) + '%';
  const fmtMld = v => v.toFixed(1) + ' mld';

  function classeSemaforo(v, soglie) {
    if (v <= soglie[0]) return 'ok';
    if (v <= soglie[1]) return 'avviso';
    return 'pericolo';
  }

  function renderHome() {
    const lista = $('#lista-scenari');
    lista.innerHTML = '';
    Object.values(S).forEach(sc => {
      const btn = document.createElement('button');
      btn.className = 'card-scenario';
      btn.innerHTML =
        '<div class="riga-top"><span class="vessillo">' + sc.bandera + '</span>' +
        '<div><h3>' + sc.nome + '</h3><div class="sottotitolo">' + sc.sottotitolo + '</div></div></div>' +
        '<div class="mini-dati">' +
        '<span class="chip">PIL <b>' + fmtMld(sc.pil) + '</b></span>' +
        '<span class="chip">Pro capite <b>' + Math.round(sc.pilProCapite).toLocaleString('it-IT') + ' ' + sc.simbolo + '</b></span>' +
        '<span class="chip">Disoccupazione <b>' + sc.disoccupazione + '%</b></span>' +
        '<span class="chip">Crescita <b>+' + sc.crescitaBase + '%</b></span>' +
        '<span class="chip">Pop. <b>' + sc.popolazione.toLocaleString('it-IT', { maximumFractionDigits: 2 }) + ' mln</b></span>' +
        '</div>';
      btn.addEventListener('click', () => apriBriefing(sc.id));
      lista.appendChild(btn);
    });
    mostra('#schermata-home');
  }

  function apriBriefing(id) {
    const sc = S[id];
    $('#briefing').innerHTML =
      '<h2>' + sc.bandera + ' ' + sc.nome + '</h2>' +
      '<p class="sottotitolo">' + sc.sottotitolo + '</p>' +
      '<p class="descrizione">' + sc.descrizione + '</p>' +
      '<div class="consiglio">\u{1F4A1} Consiglio: ' + sc.consigli + '</div>' +
      '<p class="fonti">Fonti: ' + sc.fonti + ' (anno base ' + sc.annoBase + ')</p>';
    $('#btn-inizia').onclick = () => iniziaGioco(id);
    mostra('#schermata-briefing');
  }

  function iniziaGioco(id) {
    stato = E.statoIniziale(id);
    misuraSelezionata = null;
    prioritaSelezionata = null;
    sceltaEvento = null;
    renderGioco();
    mostra('#schermata-gioco');
  }

  function renderGioco() {
    const d = E.descriviStato(stato);
    const sc = S[stato.scenarioId];
    renderBarra(d, sc);
    renderEvento(d);
    renderMisure();
    renderPriorita();
    renderLog(d);
    const btn = $('#btn-turno');
    btn.classList.toggle('disabilitato', !!d.evento);
  }

  function renderBarra(d, sc) {
    const q = d.turno % 4 === 1 ? 4 : (d.turno % 4 === 2 ? 1 : (d.turno % 4 === 3 ? 2 : 3));
    const ind = [
      [fmtMld(d.pilNominale), 'PIL', classeSemaforo(0, [0, 0])],
      [fmtPct(d.inflazione), 'Inflazione', classeSemaforo(d.inflazione, [2, 4])],
      [fmtPct(d.disoccupazione), 'Disoccup.', classeSemaforo(20 - d.disoccupazione, [6, 12])],
      [fmtPct(d.deficitPct), 'Deficit/PIL', classeSemaforo(-d.deficitPct, [3, 6])],
      [fmtPct(d.debitoPct), 'Debito/PIL', classeSemaforo(d.debitoPct, [60, 100])],
      [Math.round(d.consenso) + '%', 'Consenso', classeSemaforo(d.consenso, [40, 65])]
    ];
    $('#barra-stato').innerHTML =
      '<div class="riga-intestazione"><h2>' + sc.bandera + ' ' + d.nome + '</h2>' +
      '<span class="periodo">T' + (d.turno - 1) + ' \u00B7 ' + d.anno + ' Q' + q + ' / 20</span></div>' +
      '<div class="griglia-indicatori">' + ind.map(i =>
        '<div class="ind ' + i[2] + '"><span class="val">' + i[0] + '</span><span class="lbl">' + i[1] + '</span></div>'
      ).join('') + '</div>';
  }

  function renderEvento(d) {
    const p = $('#pannello-evento');
    if (!d.evento) { p.innerHTML = ''; p.style.display = 'none'; return; }
    p.style.display = 'block';
    sceltaEvento = null;
    p.className = 'pannello evento';
    p.innerHTML = '<h3>\u{1F5DE}\uFE0F ' + d.evento.titolo + '</h3>' +
      '<p class="sottotesto">' + d.evento.testo + '</p>' +
      d.evento.choices.map((c, i) =>
        '<button class="opzione" data-i="' + i + '"><span class="nome">' + c.label + '</span></button>'
      ).join('');
    p.querySelectorAll('.opzione').forEach(btn => {
      btn.addEventListener('click', () => {
        sceltaEvento = d.evento.choices[+btn.dataset.i].label;
        p.querySelectorAll('.opzione').forEach(b => b.classList.remove('selezionata'));
        btn.classList.add('selezionata');
        $('#btn-turno').classList.remove('disabilitato');
      });
    });
  }

  function renderMisure() {
    const p = $('#pannello-misure');
    p.className = 'pannello';
    p.innerHTML = '<h3>\u{1F4CB} Misura del trimestre</h3>' +
      '<p class="sottotesto">Scegli UNA misura economica da applicare questo trimestre (puoi cambiarla finché non avanzi).</p>' +
      C.MISURE.map(m => {
        const cd = m.effects.cooldown || 0;
        const usato = stato.measuresUsate[m.id];
        const inCooldown = cd && usato && (stato.turno - usato) < cd;
        return '<button class="opzione' + (inCooldown ? ' disabilitata' : '') + '" data-id="' + m.id + '"' + (inCooldown ? ' disabled' : '') + '>' +
          '<span class="nome">' + m.icona + ' ' + m.nome + (inCooldown ? ' \u{1F512}' : '') + '</span>' +
          '<span class="desc">' + m.desc + '</span></button>';
      }).join('');
    p.querySelectorAll('.opzione').forEach(btn => {
      if (btn.dataset.id === misuraSelezionata) btn.classList.add('selezionata');
      btn.addEventListener('click', () => {
        misuraSelezionata = btn.dataset.id;
        p.querySelectorAll('.opzione').forEach(b => b.classList.remove('selezionata'));
        btn.classList.add('selezionata');
      });
    });
  }

  function renderPriorita() {
    const p = $('#pannello-priorita');
    p.className = 'pannello';
    p.innerHTML = '<h3>\u{1F3AF} Priorità di governo</h3>' +
      '<p class="sottotesto">Dove vanno le risorse? Cambia priorità quando vuoi.</p>' +
      C.PRIORITA.map(pr =>
        '<button class="opzione" data-id="' + pr.id + '"><span class="nome">' + pr.icona + ' ' + pr.nome + '</span></button>'
      ).join('');
    p.querySelectorAll('.opzione').forEach(btn => {
      if (btn.dataset.id === (stato.priorita || prioritaSelezionata)) btn.classList.add('selezionata');
      btn.addEventListener('click', () => {
        prioritaSelezionata = btn.dataset.id;
        p.querySelectorAll('.opzione').forEach(b => b.classList.remove('selezionata'));
        btn.classList.add('selezionata');
      });
    });
  }

  function renderLog(d) {
    $('#log').innerHTML = '<h3>Giornale di governo</h3>' +
      d.log.slice(0, 12).map(v =>
        '<div class="voce-log ' + v.tipo + '"><span class="t">T' + v.turno + '</span>' + v.testo + '</div>'
      ).join('');
  }

  function avanzaTurno() {
    const d = E.descriviStato(stato);
    if (d.evento && !sceltaEvento) return;
    E.simulaTurno(stato, {
      misuraId: misuraSelezionata,
      prioritaId: prioritaSelezionata,
      eventoScelto: sceltaEvento
    });
    misuraSelezionata = null;
    prioritaSelezionata = null;
    sceltaEvento = null;
    const d2 = E.descriviStato(stato);
    if (d2.gameOver) { renderFine(d2); return; }
    renderGioco();
  }

  function renderFine(d) {
    const sc = S[stato.scenarioId];
    const maxCrescita = Math.max(0.5, ...d.history.map(h => Math.abs(h.crescita)));
    $('#fine').innerHTML =
      '<div class="risultato-finale">' +
      '<h2>' + sc.bandera + ' ' + d.nome + ' — fine del mandato</h2>' +
      (d.grado ? '<div class="grado">' + d.grado + '</div>' : '') +
      (d.punteggio != null ? '<div class="punteggio">' + d.punteggio + '<span style="font-size:1.2rem;color:var(--muted)">/100</span></div>' : '') +
      '<p class="messaggio">' + (d.messaggioFinale || '') + '</p>' +
      '<div class="grafico">' + d.history.map(h => {
        const hPx = Math.max(3, Math.abs(h.crescita) / maxCrescita * 84);
        return '<div class="barra' + (h.crescita < 0 ? ' neg' : '') + '" style="height:' + hPx + 'px" title="T' + h.turno + ': ' + fmtPct(h.crescita) + '"></div>';
      }).join('') + '</div>' +
      '<div class="legenda-grafico"><span>T1 (' + d.history[0].crescita.toFixed(1) + '%)</span><span>crescita del PIL reale per trimestre</span><span>T' + d.history.length + '</span></div>' +
      '<div class="mini-dati" style="display:flex;flex-wrap:wrap;gap:6px;margin-top:14px;justify-content:center">' +
      '<span class="chip">Debito finale <b>' + fmtPct(d.debitoPct) + '</b></span>' +
      '<span class="chip">Inflazione <b>' + fmtPct(d.inflazione) + '</b></span>' +
      '<span class="chip">Disoccupazione <b>' + fmtPct(d.disoccupazione) + '</b></span>' +
      '<span class="chip">Democrazia <b>' + Math.round(d.democrazia) + '/100</b></span>' +
      '</div></div>';
    $('#btn-rigioca').onclick = () => iniziaGioco(stato.scenarioId);
    $('#btn-altro-scenario').onclick = renderHome;
    mostra('#schermata-fine');
  }

  $('#btn-torna-home').addEventListener('click', renderHome);
  $('#btn-turno').addEventListener('click', avanzaTurno);

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  renderHome();
})();
