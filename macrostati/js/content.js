(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.MACRO_CONTENUTI = api;
})(typeof self !== 'undefined' ? self : globalThis, function () {
  'use strict';

  const MISURE = [
    {
      id: 'riforma_fiscale', nome: 'Riforma fiscale', icona: '\u{1F4CA}',
      desc: 'Semplifica il fisco e combatte l\u2019evasione: meno aliquote, pi\u00F9 gettito.',
      effects: { taxDelta: -2, compliance: 0.03, growth: 0.3, consensus: 1 }
    },
    {
      id: 'investimenti_pubblici', nome: 'Grande piano di investimenti', icona: '\u{1F3D7}\uFE0F',
      desc: 'Cantieri, porti, digitale: la spesa pubblica today, crescita domani.',
      effects: { spendDelta: 0.8, infra: 4, growth: 0.5, consensus: 2 }
    },
    {
      id: 'sostegno_famiglie', nome: 'Sostegno alle famiglie', icona: '\u{1F46A}\u200D\u{1F46B}\u200D\u{1F46A}',
      desc: 'Bonus, detrazioni e aiuti ai redditi: consenso e consumi su.',
      effects: { spendDelta: 0.5, growth: 0.2, inflation: 0.2, consensus: 6 }
    },
    {
      id: 'riforma_welfare', nome: 'Riforma del welfare', icona: '\u2696\uFE0F',
      desc: 'Razionalizza la spesa sociale per far quadrare i conti.',
      effects: { spendDelta: -0.8, growth: 0.1, consensus: -5 }
    },
    {
      id: 'patto_innovazione', nome: 'Patto per l\u2019innovazione', icona: '\u{1F4A1}',
      desc: 'Ricerca, universit\u00E0, startup: aumenta il capitale umano e l\u2019innovazione.',
      effects: { spendDelta: 0.4, innovation: 8, human: 3, growth: 0.5, consensus: 2 }
    },
    {
      id: 'energia_verde', nome: 'Transizione verde', icona: '\u{1F331}',
      desc: 'Rinnovabili e efficientamento: meno inflazione da energia, pi\u00F9 resilienza.',
      effects: { spendDelta: 0.4, green: 8, growth: -0.1, inflation: -0.2, consensus: 2 }
    },
    {
      id: 'fdi', nome: 'Attrai investimenti esteri', icona: '\u{1F30D}',
      desc: 'Zone a fiscalit\u00E0 agevolata e burocrazia zero per le multinazionali.',
      effects: { taxDelta: -1, fdi: 10, growth: 0.6, consensus: -2 }
    },
    {
      id: 'turismo', nome: 'Turismo sostenibile', icona: '\u{1F3D6}\uFE0F',
      desc: 'Valorizza il turismo con regole chiare e qualit\u00E0.',
      effects: { tourism: 2, growth: 0.3, green: 2, consensus: 2 }
    },
    {
      id: 'debito', nome: 'Rinegozia il debito', icona: '\u{1F4C9}',
      desc: 'Trattativa con i creditori: taglio del tasso e riduzione dello stock. Usabile ogni 8 trimestri.',
      effects: { interestDelta: -0.8, debtPctDelta: -4, consensus: -3, cooldown: 8 }
    },
    {
      id: 'riforma_pa', nome: 'Riforma della PA', icona: '\u{1F3DB}\uFE0F',
      desc: 'Digitalizza la macchina pubblica: meno spesa, pi\u00F9 efficienza.',
      effects: { spendDelta: -0.5, compliance: 0.02, growth: 0.2, consensus: 1 }
    },
    {
      id: 'diritti', nome: 'Diritti e salario minimo', icona: '\u270A',
      desc: 'Pi\u00F9 equit\u00E0 per i lavoratori: consenso alto, costi lievemente maggiori.',
      effects: { growth: -0.1, inflation: 0.3, unemployment: -0.2, consensus: 4 }
    },
    {
      id: 'zes', nome: 'Zone economiche speciali', icona: '\u{1F3ED}',
      desc: 'Aree portuali a dazi zero per rilanciare l\u2019export.',
      effects: { taxDelta: -1, export: 3, growth: 0.4, consensus: -2 }
    }
  ];

  const PRIORITA = [
    { id: 'sanita', nome: 'Sanit\u00E0', icona: '\u{1F3E5}', effects: { consensus: 2, human: 1, growth: -0.05, spendDelta: 0.2 } },
    { id: 'pensioni', nome: 'Pensioni', icona: '\u{1F474}', effects: { consensus: 3, spendDelta: 0.3, growth: -0.05 } },
    { id: 'istruzione', nome: 'Scuola e universit\u00E0', icona: '\u{1F393}', effects: { human: 3, growth: 0.3, consensus: 1 } },
    { id: 'infrastrutture', nome: 'Infrastrutture', icona: '\u{1F6E3}\uFE0F', effects: { infra: 4, growth: 0.3, spendDelta: 0.25 } },
    { id: 'imprese', nome: 'Imprese e lavoro', icona: '\u{1F3ED}', effects: { innovation: 2, growth: 0.4, unemployment: -0.2, consensus: -1 } }
  ];

  const EVENTI = [
    {
      id: 'shock_petrolifero', titolo: 'Crisi petrolifera', applies: 'all',
      testo: 'Il prezzo del greggio vola del 40%: energia e trasporti costano il doppio.',
      choices: [
        { label: 'Sussidi all\u2019energia', effects: { spendDelta: 1.5, inflation: -0.6, consensus: 3 }, msg: 'Le bollette restano basse, ma la spesa cresce.' },
        { label: 'Tassa sui super-profitti energetici', effects: { taxDelta: 1, inflation: -0.4, consensus: -3, growth: -0.2 }, msg: 'Il fisco incassa, ma le imprese protestano.' },
        { label: 'Spingi sulla transizione verde', effects: { green: 6, inflation: 0.4, growth: -0.2, consensus: 2 }, msg: 'Meno dipendenza dal petrolio nel medio periodo.' }
      ]
    },
    {
      id: 'boom_turistico', titolo: 'Boom turistico', applies: ['sardegna', 'catalogna', 'corsica'],
      testo: 'Arrivano turisti da tutto il mondo: gli alberghi sono pieni, i prezzi salgono.',
      choices: [
        { label: 'Investi in infrastrutture', effects: { infra: 5, growth: 0.5, debtPctDelta: 2, consensus: 1 }, msg: 'Aeroporti e strade reggono l\u2019urto.' },
        { label: 'Limita gli accessi (numero chiuso)', effects: { tourism: -2, growth: -0.3, inflation: -0.3, consensus: -2 }, msg: 'Meno turisti, pi\u00F9 qualit\u00E0. I residenti ringraziano.' }
      ]
    },
    {
      id: 'crisi_bancaria', titolo: 'Crisi bancaria', applies: 'all',
      testo: 'Una grande banca nazionale \u00E8 a un passo dal collasso. I correntisti sono nel panico.',
      choices: [
        { label: 'Bail-out con soldi pubblici', effects: { debtPctDelta: 6, growth: -1.0, consensus: -4 }, msg: 'Lo Stato salva la banca. I conti pubblici peggiorano.' },
        { label: 'Nazionalizzazione parziale', effects: { debtPctDelta: 4, democracy: -5, consensus: 3, growth: -0.5 }, msg: 'La banca diventa pubblica: pi\u00F9 controllo, meno libert\u00E0 economica.' },
        { label: 'Lascia fallire la banca', effects: { growth: -2.0, unemployment: 2.0, consensus: -8 }, msg: 'Duro ma salutare sul lungo periodo. La piazza insorge.' }
      ]
    },
    {
      id: 'pandemia', titolo: 'Nuova pandemia', applies: 'all',
      testo: 'Un nuovo virus si diffonde: ospedali sotto pressione e economy in ginocchio.',
      choices: [
        { label: 'Lockdown totale', effects: { growth: -3.0, spendDelta: 3, consensus: -5, human: -2 }, msg: 'Si ferma tutto per frenare il contagio.' },
        { label: 'Convivenza e vaccini', effects: { growth: -1.2, human: -5, spendDelta: 1, consensus: 2 }, msg: 'Si impara a convivere, ma il sistema sanitario soffre.' }
      ]
    },
    {
      id: 'fuga_cervelli', titolo: 'Fuga dei cervelli', applies: 'all',
      testo: 'I giovani laureati emigrano verso metropoli pi\u00F9 ricche.',
      choices: [
        { label: 'Borse di studio e laboratories', effects: { spendDelta: 1, human: 6, growth: -0.2, consensus: 1 }, msg: 'Investi sui giovani per convincerli a restare.' },
        { label: 'Accetta il turnover', effects: { human: -7, growth: -0.5, unemployment: -0.3 }, msg: 'Posti liberi per chi resta, ma il capitale umano cala.' }
      ]
    },
    {
      id: 'giacimento', titolo: 'Scoperta di un giacimento', applies: ['sardegna', 'scozia'],
      testo: 'Sotto il tuo territorio c\u2019\u00E8 una ricchezza enorme (gas o minerali rari).',
      choices: [
        { label: 'Sfrutta subito', effects: { growth: 1.2, debtPctDelta: -4, green: -6, consensus: 2 }, msg: 'Entrate immediate, ma l\u2019ambiente paga il conto.' },
        { label: 'Tutela ambientale rigida', effects: { green: 6, growth: -0.3, consensus: 3 }, msg: 'Sfruttamento misurato: pi\u00F9 lento, pi\u00F9 sostenibile.' }
      ]
    },
    {
      id: 'crisi_debito_mercati', titolo: 'Crisi di fiducia dei mercati', applies: 'all',
      testo: 'Gli investitori vendono i tuoi titoli: lo spread vola e finanziarsi costa caro.',
      choices: [
        { label: 'Austerit\u00E0 immediata', effects: { spendDelta: -3, growth: -1.2, consensus: -8, interestDelta: -0.6 }, msg: 'Tagli draconiani: i conti tornano in ordine, la rabbia no.' },
        { label: 'Spendi per rilanciare', effects: { spendDelta: 2, growth: 0.6, interestDelta: 0.8, consensus: 2 }, msg: 'Sfidano i mercati con la crescita. Rischioso.' }
      ]
    },
    {
      id: 'boom_ia', titolo: 'Rivoluzione dell\u2019IA', applies: 'all',
      testo: 'L\u2019intelligenza artificiale automatizza interi settori: opportunit\u00E0 e disruption.',
      choices: [
        { label: 'Investi nell\u2019IA', effects: { innovation: 10, growth: 1.0, unemployment: 1.5 }, msg: 'Produttivit\u00E0 alle stelle, ma molti posti di lavoro spariscono.' },
        { label: 'Regola e forma i lavoratori', effects: { human: 5, democracy: 3, innovation: 3, growth: 0.2, unemployment: -0.5 }, msg: 'Transizione governata: pi\u00F9 lenta, pi\u00F9 giusta.' }
      ]
    },
    {
      id: 'crisi_migratoria', titolo: 'Crisi migratoria', applies: 'all',
      testo: 'Migliaia di persone arrivano alle tue frontiere in cerca di lavoro e sicurezza.',
      choices: [
        { label: 'Accoglienza organizzata', effects: { population: 0.02, human: 2, growth: 0.3, spendDelta: 1, consensus: -4 }, msg: 'Nuovi cittadini e lavoratori, ma tensioni sociali.' },
        { label: 'Frontiere chiuse', effects: { consensus: 4, democracy: -6, growth: -0.2 }, msg: 'Sovranismo: consenso interno, libert\u00E0 in calo.' }
      ]
    },
    {
      id: 'sciopero', titolo: 'Sciopero generale', applies: 'all',
      testo: 'I sindacati proclamano lo sciopero generale contro le tue politiche economiche.',
      choices: [
        { label: 'Cedi alle richieste', effects: { spendDelta: 1.5, inflation: 0.4, consensus: 6 }, msg: 'Aumenti e pi\u00F9 tutele: la pace sociale costa.' },
        { label: 'Linea dura', effects: { consensus: -10, democracy: -8, growth: -0.6 }, msg: 'Repressione: l\u2019ordine regna, la libert\u00E0 no.' }
      ]
    },
    {
      id: 'accordo_ue', titolo: 'Il futuro con l\u2019Unione Europea', applies: ['sardegna', 'catalogna', 'corsica'],
      testo: 'Bruxelles ti offre un tavolo: mercato unico in cambio di regole, oppure dazi reciproci.',
      choices: [
        { label: 'Aderisci al mercato unico', effects: { export: 5, growth: 0.5, taxDelta: 0, consensus: -2 }, msg: 'Export pi\u00F9 liberi, ma pi\u00F9 vincoli europei.' },
        { label: 'Dazi reciproci', effects: { consensus: 3, growth: -0.4, inflation: 0.6, export: -2 }, msg: 'Autonomia commerciale, ma i prezzi salgono.' }
      ]
    },
    {
      id: 'tensioni_vecchio_stato', titolo: 'Tensioni con il vecchio Stato', applies: 'all',
      testo: 'Il governo da cui ti sei separato impone ritorsioni commerciali e ti isola diplomaticamente.',
      choices: [
        { label: 'Mediazione diplomatica', effects: { export: -2, consensus: 3, democracy: 2, growth: -0.2 }, msg: 'Riapri il dialogo: i confini commerciali si allentano.' },
        { label: 'Contro-sanzioni', effects: { export: -3, inflation: 0.5, consensus: 5, growth: -0.4 }, msg: 'Guerra commerciale: il patriottismo sale, l\u2019economia soffre.' }
      ]
    },
    {
      id: 'siccita', titolo: 'Emergenza idrica', applies: ['sardegna', 'catalogna', 'corsica'],
      testo: 'La siccit\u00E0 colpisce: raccolti a rischio, invasi in secca, turismo in affanno.',
      choices: [
        { label: 'Razionamento e campagne di risparmio', effects: { growth: -0.8, tourism: -2, consensus: -3 }, msg: 'Si tira la cinghia, ma senza investimenti strutturali.' },
        { label: 'Dissalatori e nuove infrastrutture', effects: { spendDelta: 1.5, infra: 4, green: 2, growth: -0.2 }, msg: 'Acqua garantita: costa caro ma risolve il problema.' }
      ]
    },
    {
      id: 'bolla_immobiliare', titolo: 'Bolla immobiliare', applies: 'all',
      testo: 'I prezzi delle case esplodono: giovani e famiglie non ce la fanno pi\u00F9 ad affittare.',
      choices: [
        { label: 'Tassa sulle seconde case', effects: { taxDelta: 1, consensus: 5, growth: -0.3, inflation: -0.2 }, msg: 'Colpisci la speculazione: pi\u00F9 case per i residenti.' },
        { label: 'Edilizia pubblica massiccia', effects: { spendDelta: 2, infra: 3, growth: 0.4, consensus: 4 }, msg: 'Costruisci case popolari: consensus su, deficit su.' }
      ]
    },
    {
      id: 'cyberattacco', titolo: 'Cyberattacco alle infrastrutture', applies: 'all',
      testo: 'Hacker (forse di uno Stato estero) bloccano rete elettrica e sistemi bancari per ore.',
      choices: [
        { label: 'Potenzi la cyber-difesa', effects: { spendDelta: 1, infra: 2, growth: -0.4, consensus: 2 }, msg: 'Sicurezza nazionale: costosa ma necessaria.' },
        { label: 'Cedi al ricatto', effects: { debtPctDelta: 3, democracy: -3, consensus: -6, growth: -0.6 }, msg: 'Paghi per sbloccare tutto: umiliante e pericoloso.' }
      ]
    },
    {
      id: 'evasione', titolo: 'Scandalo evasione fiscale', applies: 'all',
      testo: 'Un\u2019inchiesta rivela che i grandi patrimoni nascondono fortune all\u2019estero.',
      choices: [
        { label: 'Guardia di finanza potenziata', effects: { compliance: 0.05, taxDelta: 1, consensus: -2 }, msg: 'Pi\u00F9 controlli: pi\u00F9 gettito, ma i ricchi protestano.' },
        { label: 'Condono fiscale', effects: { compliance: 0.02, debtPctDelta: -2, consensus: 2 }, msg: 'Rientrano i capitali: una tantum per le casse dello Stato.' }
      ]
    },
    {
      id: 'recessione_globale', titolo: 'Recessione globale', applies: 'all',
      testo: 'Le grandi economie del mondo entrano in recessione: la domanda estera crolla.',
      choices: [
        { label: 'Contro-ciclo Keynesiano', effects: { spendDelta: 2.5, growth: 0.8, debtPctDelta: 3, consensus: 2 }, msg: 'Lo Stato spende per compensare il crollo delle esportazioni.' },
        { label: 'Taglia la spesa e aspetta', effects: { spendDelta: -2, growth: -1.0, consensus: -6, unemployment: 1.0 }, msg: 'Debito sotto controllo, ma la crisi morde.' }
      ]
    },
    {
      id: 'inflazione_importata', titolo: 'Inflazione importata', applies: 'all',
      testo: 'Le materie prime e i beni importati costano sempre di pi\u00F9: i prezzi interni seguono.',
      choices: [
        { label: 'Sussidi ai prezzi calmierati', effects: { spendDelta: 1.2, inflation: -0.8, consensus: 4, debtPctDelta: 1 }, msg: 'I cittadini non sentono il colpo, lo Stato s\u00EC.' },
        { label: 'Alza i tassi', effects: { interestDelta: 1.0, inflation: -0.7, growth: -0.5 }, msg: 'La banca centrale difende la moneta: recessione in cambio di stabilit\u00E0.' }
      ]
    }
  ];

  return { MISURE, PRIORITA, EVENTI };
});
