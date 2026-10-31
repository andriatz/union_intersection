/* MacroStati — scenari con dati macroeconomici reali (anno base 2024).
 * Importi in miliardi di valuta locale (Scozia in GBP, le altre in EUR).
 * Fonti: ISTAT, Banca d'Italia, Svimez, CREN UniCa (Sardegna); Idescat, INE,
 * Banco de España, CaixaBank Research (Catalogna); gov.scot, ONS, GERS 2024-25,
 * OBR (Scozia); INSEE (Corsica, Francia).
 */
(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.MACRO_SCENARI = api;
})(typeof self !== 'undefined' ? self : globalThis, function () {
  'use strict';

  const SCENARI = {
    sardegna: {
      id: 'sardegna',
      nome: 'Sardegna',
      sottotitolo: 'L\u2019isola diventa Stato indipendente',
      bandiera: '\u{1F3DD}\uFE0F',
      valuta: 'EUR',
      simbolo: '\u20AC',
      annoBase: 2024,
      pil: 43.6,
      pilProCapite: 27731,
      popolazione: 1.574,
      crescitaBase: 1.3,
      inflazioneBase: 1.5,
      disoccupazione: 8.3,
      giov: 30.0,
      taxRate: 44.0,
      spesaPct: 42.7,
      debito: 46.0,
      tassoBase: 3.0,
      exportPct: 14,
      turismoPct: 18,
      consenso: 62,
      democrazia: 92,
      descrizione:
        'PIL 43,6 mld \u20AC (ISTAT 2024, pro capite 27.731 \u20AC), crescita reale +1,3%, ' +
        'disoccupazione 8,3% (Banca d\u2019Italia 2024), inflazione ~1,5%. Debito iniziale 46 mld ' +
        '(~105% del PIL): quota pro capite del debito italiano rinegoziata in sede di indipendenza. ' +
        'Punti di forza: turismo (17 mln di presenze nel 2024). Punto debole: manifattura solo 6,2% del PIL.',
      fonti: 'ISTAT 2024; Banca d\u2019Italia, Economie regionali 2025; Svimez 2025; CREN UniCa, Rapporto 2025',
      consigli: 'Riduci il deficit senza uccidere la crescita: punta su investimenti e turismo, controlla la spesa sanitaria (3,8 mld).'
    },

    catalogna: {
      id: 'catalogna',
      nome: 'Catalogna',
      sottotitolo: 'Barcellona proclama la repubblica',
      bandiera: '\u{1F1EA}\u{1F1F8}',
      valuta: 'EUR',
      simbolo: '\u20AC',
      annoBase: 2024,
      pil: 316.7,
      pilProCapite: 39260,
      popolazione: 8.113,
      crescitaBase: 3.6,
      inflazioneBase: 2.8,
      disoccupazione: 8.9,
      giov: 22.1,
      taxRate: 42.0,
      spesaPct: 42.6,
      debito: 160.0,
      tassoBase: 3.5,
      exportPct: 33,
      turismoPct: 15,
      consenso: 55,
      democrazia: 90,
      descrizione:
        'PIB 316,7 mld \u20AC (Idescat 2024), +3,6% reale, pro capite 39.260 \u20AC. Disoccupazione 8,9% ' +
        '(media 2024), inflazione 2,8% (IPC Spagna 2024). Economia industriale ed esportatrice (33% del PIL), ' +
        'turismo in crescita (+11% 2024). Debito 160 mld (~50% del PIL). Il "deficit fiscale" verso Madrid \u00e8 il nodo politico.',
      fonti: 'Idescat 2024; INE; Banco de España, Informe Anual 2024; CaixaBank Research 2025',
      consigli: 'Hai la crescita ma il deficit parte dal -6%: attrai investimenti esteri e non alzare troppo le tasse sulle imprese.'
    },

    scozia: {
      id: 'scozia',
      nome: 'Scozia',
      sottotitolo: 'Edimburgo dice sì all\u2019indipendenza',
      bandiera: '\u{1F3F4}\u{E0067}\u{E0062}\u{E0073}\u{E0063}\u{E0074}\u{E007F}',
      valuta: 'GBP',
      simbolo: '\u00A3',
      annoBase: 2024,
      pil: 223.4,
      pilProCapite: 40339,
      popolazione: 5.54,
      crescitaBase: 1.2,
      inflazioneBase: 2.5,
      disoccupazione: 4.2,
      giov: 11.5,
      taxRate: 46.5,
      spesaPct: 49.0,
      debito: 200.0,
      tassoBase: 4.5,
      exportPct: 16,
      turismoPct: 3.5,
      consenso: 58,
      democrazia: 94,
      descrizione:
        'GDP 2024: 223,4 mld \u00A3 (gov.scot, incluso petrolio del Mare del Nord), pro capite 40.339 \u00A3, ' +
        'crescita reale +1,2%, inflazione CPI UK 2,5%, disoccupazione 4,2% (ONS 2024). Il GERS 2024-25 stima ' +
        'un deficit netto dell\u201911,6% del PIL e spesa pubblica al 55,4%: le entrate del North Sea calano. ' +
        'Debito 200 mld \u00A3 (~90% del PIL), quota della popolazione sul debito UK.',
      fonti: 'Scottish Government, GDP Quarterly National Accounts 2024 Q4; GERS 2024-25; ONS; OBR EFO',
      consigli: 'Il deficit parte da -11%: o rinegozi le spese (sanità, pensioni) o trovi nuove entrate. Il petrolio del Nord non basta pi\u00F9.'
    },

    corsica: {
      id: 'corsica',
      nome: 'Corsica',
      sottotitolo: 'L\u2019\u00EEle de Beaut\u00E9 si separa dalla Francia',
      bandiera: '\u{1F3F4}\u{E0067}\u{E0062}\u{E0063}\u{E0073}\u{E007F}',
      valuta: 'EUR',
      simbolo: '\u20AC',
      annoBase: 2024,
      pil: 10.8,
      pilProCapite: 30000,
      popolazione: 0.36,
      crescitaBase: 0.9,
      inflazioneBase: 2.1,
      disoccupazione: 6.5,
      giov: 17.5,
      taxRate: 46.0,
      spesaPct: 46.0,
      debito: 10.0,
      tassoBase: 3.0,
      exportPct: 3,
      turismoPct: 39,
      consenso: 60,
      democrazia: 91,
      descrizione:
        'PIB 10,8 mld \u20AC (INSEE 2023: 10,7 mld, +0,9% nel 2024), pro capite ~30.300 \u20AC, il pi\u00F9 basso di Francia. ' +
        'Disoccupazione 6,5% (2024), inflazione 2,1% (IPCA Francia 2024). Il turismo vale il 39% del PIL: ' +
        '6,7% di frequentazione in pi\u00F9 nel 2024. La spesa pubblica pesa per il 50% del PIL: senza i trasferimenti ' +
        'dello Stato il deficit esplode. Debito 10 mld (~93% del PIL).',
      fonti: 'INSEE, Bilan \u00E9conomique 2024 Corse; INSEE L\u2019essentiel sur la Corse; comptes nationaux 2024',
      consigli: 'Dipendi dal turismo e dalla spesa pubblica: diversifica l\u2019economia e attrai nuovi residenti, ma tieni l\u2019inflazione bassa.'
    }
  };

  return SCENARI;
});
