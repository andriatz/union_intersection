# MacroStati

Gioco di **macroeconomia da celular**: uno Stato nasce, tu sei il governo. Scegli uno scenario — **Sardegna, Catalogna, Scozia o Corsica** — e portalo avanti per **5 anni (20 trimestri)** gestendo PIL, inflazione, debito pubblico, deficit/PIL, disoccupazione, consenso e indice democratico, reagendo a eventi casuali (crisi petrolifera, pandemia, boom turistico, IA, fuga dei cervelli...).

È una **PWA** (Progressive Web App): si apre dal browser del telefono, si può aggiungere alla home e funziona offline. Nessun server, nessun database, zero dipendenze: HTML/CSS/JS vanilla.

## Come si gioca

1. Apri il gioco (su GitHub Pages: `https://<tuo-utente>.github.io/macrostati/`).
2. Scegli uno scenario: ogni carta mostra i dati reali di partenza (PIL, pro capite, disoccupazione, crescita).
3. Ogni trimestre scegli **una misura economica** (riforma fiscale, investimenti, welfare, innovazione, transizione verde, attrazione di IDE, rinegoziazione del debito...) e una **priorità di governo** (sanità, pensioni, scuola, infrastrutture, imprese).
4. Se capita un **evento**, scegli come rispondergli: il pulsante del trimestre resta bloccato finché non decidi.
5. Dopo 20 trimestri (o prima, se vai in default / rivolta / dittatura / iperinflazione) ottieni un **punteggio 0-100** e un grado: *Stato modello*, *Stato solido*, *Stato in equilibrio precario*, *Stato in difficoltà*, *Stato fallito*.

## Come si vince / si perde

- **Vinci** accumulando un buon punteggio: debito/PIL basso, deficit contenuto, inflazione ~2%, bassa disoccupazione, crescita positiva, consenso alto e democrazia intatta.
- **Perdi** se: debito ≥ 200% del PIL (default), consenso ≤ 5% (rivolta), democrazia ≤ 20 (dittatura), inflazione ≥ 15% (iperinflazione).

## Dati reali di partenza (anno base 2024)

| Scenario | PIL | Pro capite | Disoccupazione | Crescita reale | Inflazione | Debito iniziale |
|---|---|---|---|---|---|---|
| Sardegna | 43,6 mld € | 27.731 € | 8,3% | +1,3% | ~1,5% | 46 mld € (~105% PIL) |
| Catalogna | 316,7 mld € | 39.260 € | 8,9% | +3,6% | 2,8% | 160 mld € (~50% PIL) |
| Scozia | 223,4 mld £ | 40.339 £ | 4,2% | +1,2% | 2,5% (CPI UK) | 200 mld £ (~90% PIL) |
| Corsica | 10,8 mld € | ~30.300 € | 6,5% | +0,9% | 2,1% | 10 mld € (~93% PIL) |

### Fonti

- **Sardegna**: ISTAT 2024 (PIL +1,3%, pro capite 27.731 €); Banca d'Italia, *Economie regionali* 2025 (disoccupazione 8,3%, partecipazione 63,1%); Svimez 2025; CREN UniCa, *Economia della Sardegna*, Rapporto 2025 (turismo +10%, spesa sanitaria 3,8 mld, manifattura 6,2% del PIL). Debito: stima di spartizione pro quota del debito italiano.
- **Catalogna**: Idescat 2024 (PIB 316.728 mln €, +3,6%, pro capite 39.260 €); EPA/INE (atur 8,9% medio 2024, juvenil 22,1%); INE (IPC Spagna 2024 +2,8%); Banco de España, Informe Anual 2024; CaixaBank Research (esportazioni 33,1% del PIL).
- **Scozia**: Scottish Government, *GDP Quarterly National Accounts 2024 Q4* (223,4 mld £, pro capite 40.339 £, +1,2% reale); ONS (disoccupazione 4,2% 2024, CPI UK 2,5%); GERS 2024-25 (deficit netto -11,6% del PIL, spesa 55,4%); OBR (debito UK ~93% PIL 2024-25, di cui quota Scozia stimata).
- **Corsica**: INSEE, *Bilan économique 2024 Corse* (PIB 10,7 mld € 2023, +0,9% 2024; pro capite ~30.300 €; chômage 6,5% 2024; turismo 39% del PIL, +6,7% frequentazione 2024); INSEE conti nazionali (Francia: deficit 5,8%, debito 113% PIL, IPCA 2,1%).

Il modello di simulazione è stilizzato (non è un DSGE): la dinamica del PIL reale dipende da domanda, innovazione, capitale umano, infrastrutture, IDE, esportazioni e turismo; l'inflazione segue una curva di Phillips modificata con mean-reversion al 2%; il debito evolve con deficit primario + interessi trimestrali; gli shock sono eventi casuali con scelte del giocatore.

## Struttura del progetto

```
index.html            # PWA mobile-first
css/style.css         # tema scuro responsive
js/scenarios.js       # 4 scenari con dati reali 2024 + fonti
js/content.js         # 12 misure, 5 priorità, 18 eventi con scelte
js/engine.js          # motore di simulazione (testabile in Node)
js/ui.js              # interfaccia
sw.js                 # service worker (offline)
manifest.webmanifest  # installabile su Android/iOS
icons/                # icone PNG 192/512 + maskable
tests/engine.test.js  # test del motore (node --test)
```

## Sviluppo locale

```bash
node --test tests/          # test del motore
python3 -m http.server 8000 # poi apri http://localhost:8000
```

## Deploy su GitHub Pages

Il workflow `.github/workflows/pages.yml` pubblica automaticamente il branch `main` su GitHub Pages a ogni push. Dopo il primo push, abilita *Settings → Pages → Source: GitHub Actions*.

## Nota legale

Gioco di fantasia educativa: gli scenari di indipendenza sono ipotetici e i dati di debito iniziale sono stime da spartizione, non posizioni ufficiali di alcun governo.
