const http = require('http');
const { exec } = require('child_process');

const PORT = 3000;

const htmlContent = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BrewStation All-Grain Pro</title>
  <style>
    :root {
      --bg: #f8fafc;
      --card: #ffffff;
      --border: #e2e8f0;
      --border-dark: #94a3b8;
      --cell-yellow: #ffffbe;
      --cell-yellow-border: #eab308;
      --cell-gray: #e2e8f0;
      --orange-header: #f6b26b;
      --peach-header: #fce5cd;
      --green-attenuation: #dcfce7;
      --blue-ferm: #2563eb;
      --bjcp-blue-text: #1d4ed8;
      --primary: #b45309;
    }
    * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; }
    body { background: var(--bg); margin: 0; padding: 18px; color: #0f172a; }
    .container { max-width: 1350px; margin: 0 auto; background: var(--card); border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); overflow: hidden; border: 1px solid var(--border); }

    /* Navigazione */
    nav { display: flex; background: #0f172a; padding: 0 16px; border-bottom: 2px solid #334155; }
    .nav-btn { background: none; border: none; color: #94a3b8; padding: 13px 20px; font-size: 14px; font-weight: 700; cursor: pointer; border-bottom: 3px solid transparent; transition: 0.2s; }
    .nav-btn.active { color: #ffffff; border-bottom-color: #f59e0b; background: rgba(255,255,255,0.05); }
    .nav-btn:hover { color: #f8fafc; }
    .tab-content { display: none; padding: 24px; }
    .tab-content.active { display: block; }

    /* Scheda Configurazione Superiore */
    .config-card { background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 14px 18px; margin-bottom: 22px; box-shadow: 0 2px 6px rgba(0,0,0,0.02); }
    .config-title { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
    .top-toolbar { display: grid; grid-template-columns: 1.3fr 1.3fr 1.3fr; gap: 16px; align-items: flex-end; }
    .tool-block { display: flex; flex-direction: column; gap: 6px; }
    .tool-block label { font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.3px; }
    .tool-inline { display: flex; gap: 8px; align-items: center; }
    .tb-input { width: 100%; padding: 7px 10px; border: 1px solid #94a3b8; border-radius: 6px; font-size: 13px; font-weight: 600; outline: none; background: white; }
    .tb-input:focus { border-color: var(--primary); box-shadow: 0 0 0 2px rgba(180,83,9,0.15); }
    
    .btn { background: var(--primary); color: white; border: none; padding: 7px 12px; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 13px; white-space: nowrap; transition: 0.15s; }
    .btn:hover { opacity: 0.92; }
    .btn-green { background: #15803d; }
    .btn-red { background: #dc2626; }

    /* Tabella Principale */
    .table-container { background: white; border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; margin-bottom: 24px; box-shadow: 0 2px 6px rgba(0,0,0,0.02); }
    .custom-table { width: 100%; border-collapse: collapse; font-size: 14px; }
    .custom-table th, .custom-table td { border-bottom: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; padding: 6px 10px; height: 32px; }
    .custom-table tr:last-child td { border-bottom: none; }
    .custom-table td:last-child, .custom-table th:last-child { border-right: none; }

    .cell-title { font-weight: 500; color: #1e293b; width: 340px; }
    .cell-base { width: 130px; text-align: center; }
    .cell-prev { width: 120px; text-align: center; font-weight: 700; background: #ffffff; color: #0369a1; }
    .cell-real { width: 120px; text-align: center; font-weight: 700; }
    .cell-bjcp { width: 140px; text-align: center; font-weight: 700; color: var(--bjcp-blue-text); background: #ffffff; }

    .bg-yellow { background: var(--cell-yellow) !important; border: 1px solid var(--cell-yellow-border) !important; border-radius: 4px; }
    .bg-gray { background: var(--cell-gray) !important; opacity: 0.6; }
    .header-orange { background: var(--orange-header) !important; color: #000; font-weight: 700; }
    .header-peach { background: var(--peach-header) !important; color: #000; font-weight: 700; }
    .row-highlight { border-top: 2px solid #000 !important; border-bottom: 2px solid #000 !important; }

    .input-cell { width: 100%; height: 100%; border: none; outline: none; background: transparent; text-align: center; font-weight: 700; font-size: 14px; color: inherit; }
    
    .select-pill-blue { background: var(--blue-ferm); color: white; border: none; border-radius: 4px; padding: 4px 8px; font-weight: 700; font-size: 13px; width: 100%; cursor: pointer; outline: none; }
    .select-pill-green { background: var(--green-attenuation); color: #166534; border: 1px solid #86efac; border-radius: 4px; padding: 4px 8px; font-size: 13px; width: 100%; font-weight: 700; outline: none; cursor: pointer; }

    /* Tabelle Secondarie */
    .section-bar { background: #f1f5f9; border-left: 5px solid var(--primary); padding: 8px 14px; font-weight: 700; font-size: 13px; text-transform: uppercase; margin: 22px 0 12px 0; border-radius: 0 6px 6px 0; display: flex; justify-content: space-between; align-items: center; }
    .sub-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 13px; border: 1px solid #cbd5e1; border-radius: 6px; overflow: hidden; }
    .sub-table th { background: #f8fafc; border: 1px solid #cbd5e1; padding: 7px 10px; text-align: left; font-weight: 700; color: #475569; }
    .sub-table td { border: 1px solid #e2e8f0; padding: 5px 8px; }
    
    .note-box { background: #fefce8; border: 1px solid #fef08a; border-radius: 6px; padding: 12px 14px; font-size: 13px; color: #713f12; line-height: 1.45; margin-top: 10px; }
    .two-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

    .process-card { border: 1px solid #cbd5e1; border-left: 5px solid var(--primary); padding: 12px 16px; margin-bottom: 12px; border-radius: 6px; background: white; }
    .process-card h4 { margin: 0 0 6px 0; font-size: 14px; color: #0f172a; }
    .process-card p { margin: 0; font-size: 13px; color: #475569; line-height: 1.4; }
  </style>
</head>
<body>

<div class="container">
  <nav>
    <button class="nav-btn active" onclick="switchTab('tab-ricetta', this)">📋 Ricetta All-Grain</button>
    <button class="nav-btn" onclick="switchTab('tab-efficienza', this)">📈 Efficienza</button>
    <button class="nav-btn" onclick="switchTab('tab-impianto', this)">⚙️ Impianto</button>
    <button class="nav-btn" onclick="switchTab('tab-processo', this)">⏱️ Processo di Produzione</button>
  </nav>

  <!-- ==================== TAB 1: RICETTA ==================== -->
  <div id="tab-ricetta" class="tab-content active">

    <!-- 1. CONFIGURAZIONE RICETTA (SCHEDA UNIFICATA) -->
    <div class="config-card">
      <div class="config-title">1. Configurazione Ricetta</div>
      <div class="top-toolbar">
        <!-- Cerca Stile BJCP -->
        <div class="tool-block">
          <label>🔍 CERCA STILE BJCP:</label>
          <div class="tool-inline">
            <input type="text" id="styleSearch" class="tb-input" list="bjcpList" placeholder="es. Strong Bitter, Saison..." oninput="applicaRicercaStile(this.value)">
            <datalist id="bjcpList"></datalist>
            <button class="btn btn-red" onclick="eliminaStileSelezionato()" title="Pulisce il foglio e svuota tutti i dati">✕ Rimuovi Stile</button>
          </div>
        </div>

        <!-- Nome Ricetta -->
        <div class="tool-block">
          <label>NOME RICETTA:</label>
          <div class="tool-inline">
            <input type="text" id="recipeNameInput" class="tb-input" placeholder="Dai un nome alla ricetta...">
            <button class="btn btn-green" onclick="salvaRicetta()">💾 Salva Ricetta</button>
          </div>
        </div>

        <!-- Ricette Salvate -->
        <div class="tool-block">
          <label>RICETTE SALVATE:</label>
          <div class="tool-inline">
            <select id="savedRecipesSelect" class="tb-input" onchange="caricaRicettaSelezionata()">
              <option value="">-- Seleziona Ricetta --</option>
            </select>
            <button class="btn btn-red" onclick="eliminaRicetta()">🗑️ Elimina</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. TABELLA PRINCIPALE (SENZA NUMERI SEGNAPOSTO INGANNEVOLI) -->
    <div class="table-container">
      <table class="custom-table">
        <tbody>
          <!-- RIGA 3: INTESTAZIONE STILE E CODICE BJCP -->
          <tr>
            <td colspan="2" style="border-right: 1px solid #cbd5e1; background: #f8fafc;"></td>
            <td colspan="2" class="bg-yellow" style="text-align: center; font-size: 15px;">
              <input type="text" id="headStyleName" class="input-cell" placeholder="Seleziona stile..." style="color: var(--bjcp-blue-text);">
            </td>
            <td class="bg-yellow" style="text-align: center; font-size: 15px;">
              <input type="text" id="headStyleCode" class="input-cell" placeholder="Codice" style="color: var(--bjcp-blue-text);">
            </td>
          </tr>

          <!-- RIGA 4: COLONNE PREVISTO / REALE / BJCP -->
          <tr style="background: #f1f5f9; font-weight: bold;">
            <td colspan="2" style="border-right: 1px solid #cbd5e1;"></td>
            <td class="cell-prev">Previsto</td>
            <td class="cell-real">Reale</td>
            <td class="cell-bjcp">BJCP</td>
          </tr>

          <!-- RIGA 5: OG DENSITA INIZIALE SCELTA -->
          <tr class="row-highlight">
            <td colspan="2" class="cell-title header-orange">OG Densita Iniziale scelta</td>
            <td class="cell-prev bg-yellow" style="color: var(--bjcp-blue-text);">
              <input type="number" id="ogPrevisto" class="input-cell" oninput="calcolaTabella()">
            </td>
            <td class="cell-real bg-yellow" style="color: var(--bjcp-blue-text);">
              <input type="number" id="ogReale" class="input-cell" oninput="calcolaTabella()">
            </td>
            <td id="bjcpOG" class="cell-bjcp">-</td>
          </tr>

          <!-- RIGA 6: LITRI FERMENTATORE -->
          <tr>
            <td class="cell-title">Litri Fermentatore</td>
            <td class="cell-base">
              <select id="litriFermSelect" class="select-pill-blue" onchange="calcolaTabella()">
                <option value="75" selected>75 Litri ▼</option>
                <option value="60">60 Litri ▼</option>
                <option value="50">50 Litri ▼</option>
                <option value="100">100 Litri ▼</option>
              </select>
            </td>
            <td class="bg-gray"></td>
            <td class="bg-gray"></td>
            <td class="bg-gray"></td>
          </tr>

          <!-- RIGA 7: TOLLERANZA -->
          <tr>
            <td class="cell-title">Tolleranza</td>
            <td class="cell-base bg-yellow">
              <input type="text" id="tolleranzaInput" class="input-cell" oninput="calcolaTabella()">
            </td>
            <td class="bg-gray"></td>
            <td class="bg-gray"></td>
            <td class="bg-gray"></td>
          </tr>

          <!-- RIGA 8: LITRI POST BOIL IN FERMENTATORE -->
          <tr>
            <td class="cell-title">Litri Post Boil in Fermentatore</td>
            <td class="bg-gray"></td>
            <td id="resPostBoilPrev" class="cell-prev">-</td>
            <td class="cell-real bg-yellow">
              <input type="number" id="postBoilReale" class="input-cell" oninput="calcolaTabella()">
            </td>
            <td class="bg-gray"></td>
          </tr>

          <!-- RIGA 9: PERDITA IN BOLLITURA -->
          <tr>
            <td class="cell-title">Perdita in Bollitura</td>
            <td class="cell-base bg-yellow">
              <input type="number" id="lossBoil" class="input-cell" oninput="calcolaTabella()">
            </td>
            <td class="bg-gray"></td>
            <td class="bg-gray"></td>
            <td class="bg-gray"></td>
          </tr>

          <!-- RIGA 10: PERDITA IN TRAVASO -->
          <tr>
            <td class="cell-title">Perdita in Travaso</td>
            <td class="cell-base bg-yellow">
              <input type="number" id="lossTransfer" class="input-cell" oninput="calcolaTabella()">
            </td>
            <td class="bg-gray"></td>
            <td class="bg-gray"></td>
            <td class="bg-gray"></td>
          </tr>

          <!-- RIGA 11: PERDITA IN FERMENTAZIONE -->
          <tr>
            <td class="cell-title">Perdita in Fermentazioane</td>
            <td class="cell-base bg-yellow">
              <input type="number" id="lossFerm" class="input-cell" oninput="calcolaTabella()">
            </td>
            <td class="bg-gray"></td>
            <td class="bg-gray"></td>
            <td class="bg-gray"></td>
          </tr>

          <!-- RIGA 12: LITRI PRE BOIL (MOSTO IN BOLLITURA) -->
          <tr>
            <td class="cell-title">Litri Pre Boil (mosto in bollitura)</td>
            <td class="bg-gray"></td>
            <td id="resPreBoilPrev" class="cell-prev">-</td>
            <td class="cell-real bg-yellow">
              <input type="number" id="preBoilReale" class="input-cell" oninput="calcolaTabella()">
            </td>
            <td class="bg-gray"></td>
          </tr>

          <!-- RIGA 13: OG PRE BOIL -->
          <tr>
            <td class="cell-title header-peach">OG PRE BOIL</td>
            <td class="bg-gray"></td>
            <td id="resOGPreBoilPrev" class="cell-prev">-</td>
            <td class="cell-real bg-yellow">
              <input type="number" id="ogPreBoilReale" class="input-cell" oninput="calcolaTabella()">
            </td>
            <td class="bg-gray"></td>
          </tr>

          <!-- RIGA 14: MINUTI BOLLITURA MOSTO -->
          <tr>
            <td class="cell-title">Minuti Bollitura Mosto</td>
            <td class="bg-gray"></td>
            <td class="cell-prev bg-yellow">
              <input type="number" id="boilMinPrev" class="input-cell" oninput="calcolaTabella()">
            </td>
            <td class="cell-real bg-yellow">
              <input type="number" id="boilMinReale" class="input-cell" oninput="calcolaTabella()">
            </td>
            <td class="bg-gray"></td>
          </tr>

          <!-- RIGA 15: EFFICIENZA AMMOSTAMENTO -->
          <tr>
            <td class="cell-title">Efficienza Ammostamento</td>
            <td class="bg-gray"></td>
            <td class="cell-prev bg-yellow">
              <input type="text" id="mashEffPrev" class="input-cell" oninput="calcolaTabella()">
            </td>
            <td class="cell-real bg-yellow">
              <input type="text" id="mashEffReale" class="input-cell" oninput="calcolaTabella()">
            </td>
            <td class="bg-gray"></td>
          </tr>

          <!-- RIGA 16: PUNTI TOTALE MALTI -->
          <tr>
            <td class="cell-title">Punti Totale Malti</td>
            <td id="resPuntiTotali" class="cell-base" style="font-weight: 700; background: white;">-</td>
            <td class="bg-gray"></td>
            <td class="bg-gray"></td>
            <td class="bg-gray"></td>
          </tr>

          <!-- RIGA 17: ATTENUAZIONE -->
          <tr>
            <td class="cell-title">
              <select id="selAttenuazionePreset" class="select-pill-green" onchange="aggiornaPresetAttenuazione(this.value)">
                <option value="80%">Media Attenuazione 70 - 75% ▼</option>
                <option value="85%">Alta. Attenuazione 75 - 85% ▼</option>
                <option value="65%">Bassa Attenuazione 60 - 68% ▼</option>
              </select>
            </td>
            <td class="cell-base bg-yellow">
              <input type="text" id="attValInput" class="input-cell" oninput="calcolaTabella()">
            </td>
            <td class="bg-gray"></td>
            <td class="bg-gray"></td>
            <td class="bg-gray"></td>
          </tr>

          <!-- RIGA 18: IBU -->
          <tr>
            <td class="cell-title">IBU</td>
            <td class="bg-gray"></td>
            <td class="cell-prev bg-yellow">
              <input type="number" id="ibuPrev" class="input-cell" oninput="calcolaTabella()">
            </td>
            <td class="cell-real bg-yellow">
              <input type="number" id="ibuReale" class="input-cell" oninput="calcolaTabella()">
            </td>
            <td id="bjcpIBU" class="cell-bjcp bg-yellow">-</td>
          </tr>

          <!-- RIGA 19: KG GRANI TOTALI -->
          <tr>
            <td class="cell-title">KG Grani Totali</td>
            <td class="bg-gray"></td>
            <td id="resKgGraniPrev" class="cell-prev">-</td>
            <td class="cell-real bg-yellow">
              <input type="text" id="kgGraniReale" class="input-cell" oninput="calcolaTabella()">
            </td>
            <td class="bg-gray"></td>
          </tr>

          <!-- RIGA 20: EBC -->
          <tr>
            <td class="cell-title">EBC</td>
            <td class="bg-gray"></td>
            <td id="resEBCPrev" class="cell-prev">-</td>
            <td id="resEBCReale" class="cell-real" style="background: white;">-</td>
            <td class="bg-gray"></td>
          </tr>

          <!-- RIGA 21: SRM -->
          <tr>
            <td class="cell-title">SRM</td>
            <td class="bg-gray"></td>
            <td id="resSRMPrev" class="cell-prev">-</td>
            <td id="resSRMReale" class="cell-real" style="background: white;">-</td>
            <td id="bjcpSRM" class="cell-bjcp">-</td>
          </tr>

          <!-- RIGA 22: GRADO ALCOLICO PREVISTO AVB -->
          <tr>
            <td class="cell-title">Grado Alcolico Previsto AVB</td>
            <td class="bg-gray"></td>
            <td id="resABVPrev" class="cell-prev">-</td>
            <td id="resABVReale" class="cell-real" style="background: white;">-</td>
            <td id="bjcpABV" class="cell-bjcp">-</td>
          </tr>

          <!-- RIGA 23: LITRI DOPO LA FERMENTAZIONE -->
          <tr>
            <td class="cell-title">Litri dopo la Fermentazione</td>
            <td class="bg-gray"></td>
            <td id="resLitriPostFermPrev" class="cell-prev">-</td>
            <td class="cell-real bg-yellow">
              <input type="text" id="litriPostFermReale" class="input-cell" oninput="calcolaTabella()">
            </td>
            <td class="bg-gray"></td>
          </tr>

          <!-- RIGA 24: FG DENSITA FINALE -->
          <tr class="row-highlight">
            <td colspan="2" class="cell-title header-orange">FG Densità Finale</td>
            <td id="resFGPrev" class="cell-prev" style="color: var(--bjcp-blue-text);">-</td>
            <td class="cell-real bg-yellow" style="color: var(--bjcp-blue-text);">
              <input type="number" id="fgReale" class="input-cell" oninput="calcolaTabella()">
            </td>
            <td id="bjcpFG" class="cell-bjcp">-</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 3. SEZIONE LIEVITO & PITCHING RATE -->
    <div class="section-bar">
      <span>2. Lievito & Pitching Rate (Inoculo)</span>
    </div>
    <table class="sub-table">
      <thead>
        <tr>
          <th>Ceppo / Nome Lievito</th>
          <th style="width: 140px; text-align: center;">Previsto (g)</th>
          <th style="width: 120px; text-align: center;">Grammi / Bustina</th>
          <th style="width: 110px; text-align: center;">N° Bustine</th>
          <th style="width: 130px; text-align: center;">Reale (g Totali)</th>
          <th style="width: 140px; text-align: center;">Attenuazione</th>
          <th style="width: 130px; text-align: center;">Temp. Ferm.</th>
          <th style="width: 120px; text-align: center;">Flocculazione</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><input type="text" id="yeastName" class="tb-input bg-yellow" placeholder="es. Lallemand Belle Saison"></td>
          <td id="yeastCalcGrams" style="text-align: center; font-weight: 700; color: #0369a1;">-</td>
          <td class="bg-yellow"><input type="number" id="yeastSachetG" class="input-cell" step="0.5" oninput="calcolaTabella()"></td>
          <td class="bg-yellow"><input type="number" id="yeastSachetN" class="input-cell" oninput="calcolaTabella()"></td>
          <td id="yeastRealGrams" style="text-align: center; font-weight: 700; color: #15803d;">-</td>
          <td><input type="text" id="yeastAttText" class="tb-input"></td>
          <td><input type="text" id="yeastTempText" class="tb-input"></td>
          <td><input type="text" id="yeastFlocText" class="tb-input"></td>
        </tr>
        <tr style="background: #f8fafc;">
          <td colspan="4"><strong>Aroma:</strong> <input type="text" id="yeastAromaText" class="tb-input" style="width: 250px; display: inline-block;"></td>
          <td colspan="4"><strong>Pitching Rate Target:</strong> 50 - 100 g/hL (minimo 2.5 - 5 milioni di cellule/mL)</td>
        </tr>
      </tbody>
    </table>
    <div class="note-box">
      <strong>Nota Tecnica sul Lievito:</strong> Se si utilizza un ceppo molto attenuante (80–85%), è bene evitare di produrre un mosto eccessivamente fermentabile; meglio attestarsi intorno ai 65°C in ammostamento. Al contrario, con un lievito poco attenuante (55–65%) è preferibile non esagerare con i malti speciali né con soste che estraggano troppi zuccheri non fermentabili.
    </div>

    <!-- 4. SEZIONE MALTI BASE (70-100%) -->
    <div class="section-bar">
      <span>3. Malto Base (70 - 100%)</span>
      <button class="btn" onclick="aggiungiMaltoBase()">+ Aggiungi Malto Base</button>
    </div>
    <table class="sub-table" id="maltBaseTable">
      <thead>
        <tr>
          <th>Tipo Malto Base</th>
          <th style="width: 100px;">% Grist</th>
          <th style="width: 100px;">Punti</th>
          <th style="width: 100px;">SG (Resa)</th>
          <th style="width: 120px;">Kg Calcolati</th>
          <th style="width: 100px;">EBC</th>
          <th style="width: 120px;">Dens. Pot. GU</th>
          <th style="width: 40px;"></th>
        </tr>
      </thead>
      <tbody id="maltBaseBody"></tbody>
    </table>

    <!-- 5. SEZIONE MALTI SPECIALI (0-30%) -->
    <div class="section-bar">
      <span>4. Malto Speciale (0 - 30%)</span>
      <button class="btn" onclick="aggiungiMaltoSpeciale()">+ Aggiungi Malto Speciale</button>
    </div>
    <table class="sub-table" id="maltSpecTable">
      <thead>
        <tr>
          <th>Tipo Malto Speciale</th>
          <th style="width: 100px;">% Grist</th>
          <th style="width: 100px;">Punti</th>
          <th style="width: 100px;">SG (Resa)</th>
          <th style="width: 120px;">Kg Calcolati</th>
          <th style="width: 100px;">EBC</th>
          <th style="width: 120px;">Dens. Pot. GU</th>
          <th style="width: 40px;"></th>
        </tr>
      </thead>
      <tbody id="maltSpecBody"></tbody>
    </table>

    <!-- 6. SEZIONE LUPPOLI -->
    <div class="section-bar">
      <span>5. Luppoli (Calcolo Tinseth con IBU Target)</span>
      <button class="btn" onclick="aggiungiLuppolo()">+ Aggiungi Luppolo</button>
    </div>
    <table class="sub-table" id="hopTable">
      <thead>
        <tr>
          <th>Varietà Luppolo</th>
          <th style="width: 110px;">IBU Target</th>
          <th style="width: 110px;">Tempo (Min)</th>
          <th style="width: 110px;">Alfa Acidi (%)</th>
          <th style="width: 110px;">UTIL (%)</th>
          <th style="width: 130px;">Grammi Calcolati</th>
          <th>Fase Bollitura</th>
          <th style="width: 40px;"></th>
        </tr>
      </thead>
      <tbody id="hopBody"></tbody>
    </table>

    <!-- 7. SEZIONE ACQUA & PRIMING -->
    <div class="two-cols">
      <div>
        <div class="section-bar">6. Acqua di Ammostamento e Lavaggio</div>
        <table class="sub-table">
          <tbody>
            <tr>
              <td>Rapporto Acqua/Grani Mash (L/kg)</td>
              <td class="bg-yellow" style="width: 120px;"><input type="number" id="mashRatio" class="input-cell" step="0.1" oninput="calcolaTabella()"></td>
            </tr>
            <tr>
              <td>Acqua di Mash (Kg grani x rapporto)</td>
              <td id="resWaterMash" style="text-align: right; font-weight: bold;">-</td>
            </tr>
            <tr>
              <td>Assorbimento Grani (1 L/kg)</td>
              <td id="resWaterAbs" style="text-align: right; font-weight: bold;">-</td>
            </tr>
            <tr>
              <td>Mosto recuperato dal Mash</td>
              <td id="resWortFromMash" style="text-align: right; font-weight: bold;">-</td>
            </tr>
            <tr>
              <td>Acqua per lo Sparge (PreBoil - Mosto Mash)</td>
              <td id="resWaterSparge" style="text-align: right; font-weight: bold;">-</td>
            </tr>
            <tr style="background: #ecfdf5; font-weight: bold;">
              <td>ACQUA TOTALE DA PREPARARE</td>
              <td id="resWaterTotal" style="text-align: right; color: #065f46;">-</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div>
        <div class="section-bar">7. Calcolo Priming Zucchero</div>
        <table class="sub-table">
          <thead>
            <tr>
              <th>Tipo Zucchero</th>
              <th>Temp. Mosto (°C)</th>
              <th>Volumi CO2</th>
              <th>Grammi Totali</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><input type="text" id="primingSugarType" class="tb-input" style="border: none;"></td>
              <td class="bg-yellow"><input type="number" id="primingTemp" class="input-cell" oninput="calcolaTabella()"></td>
              <td class="bg-yellow"><input type="number" id="primingCO2" class="input-cell" step="0.1" oninput="calcolaTabella()"></td>
              <td id="resPrimingGrams" style="text-align: right; font-weight: bold; color: #b45309; font-size: 15px;">-</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- ==================== TAB 2: EFFICIENZA ==================== -->
  <div id="tab-efficienza" class="tab-content">
    <div class="section-bar">Mash Efficiency (Estrazione) & Brewhouse Efficiency (Impianto)</div>
    <table class="sub-table" id="effTable">
      <thead>
        <tr>
          <th>Data</th>
          <th>Stile</th>
          <th>OG Pre-Boil</th>
          <th>Litri Bollitura</th>
          <th>Dens. Pot. GU</th>
          <th>Mash Efficiency %</th>
          <th>OG Fermentatore</th>
          <th>Litri Fermentatore</th>
          <th>Brewhouse Efficiency %</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>01/10/2025</td>
          <td><strong>TRIPEL</strong></td>
          <td>1063</td>
          <td>85 L</td>
          <td>6720</td>
          <td style="text-align: right; color: #15803d; font-weight: bold;">79.7%</td>
          <td>1080</td>
          <td>58 L</td>
          <td style="text-align: right; color: #b45309; font-weight: bold;">69.0%</td>
        </tr>
        <tr>
          <td>01/03/2026</td>
          <td><strong>Witbier</strong></td>
          <td>1035</td>
          <td>73 L</td>
          <td>3375</td>
          <td style="text-align: right; color: #15803d; font-weight: bold;">75.7%</td>
          <td>1048</td>
          <td>58 L</td>
          <td style="text-align: right; color: #b45309; font-weight: bold;">82.5%</td>
        </tr>
        <tr>
          <td>10/05/2026</td>
          <td><strong>Gose</strong></td>
          <td>1034</td>
          <td>73 L</td>
          <td>3094</td>
          <td style="text-align: right; color: #15803d; font-weight: bold;">80.2%</td>
          <td>1044</td>
          <td>36.5 L</td>
          <td style="text-align: right; color: #b45309; font-weight: bold;">51.9%</td>
        </tr>
        <tr>
          <td>01/10/2026</td>
          <td><strong>Strong Bitter</strong></td>
          <td>1038</td>
          <td>84 L</td>
          <td>4303</td>
          <td style="text-align: right; color: #15803d; font-weight: bold;">74.2%</td>
          <td>1052</td>
          <td>61 L</td>
          <td style="text-align: right; color: #b45309; font-weight: bold;">73.7%</td>
        </tr>
      </tbody>
      <tfoot>
        <tr style="background: #eff6ff; font-weight: bold;">
          <td colspan="5" style="text-align: right;">EFFICIENZA MEDIA STORICA IMPIANTO:</td>
          <td></td>
          <td colspan="2" style="text-align: right;">MEDIA REALE:</td>
          <td style="text-align: right; color: #1d4ed8; font-size: 15px;">71.8%</td>
        </tr>
      </tfoot>
    </table>
  </div>

  <!-- ==================== TAB 3: IMPIANTO ==================== -->
  <div id="tab-impianto" class="tab-content">
    <div class="section-bar">Bilancio Volumi & Perdite Impianto (File Excel)</div>
    <table class="sub-table" style="max-width: 800px;">
      <thead>
        <tr>
          <th>Parametro</th>
          <th style="width: 150px; text-align: center;">Valore Misurato (L)</th>
          <th style="width: 50px; text-align: center;">Op.</th>
          <th>Descrizione</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>ACQUA DI SPARGE</td>
          <td class="bg-yellow"><input type="number" id="impSparge" class="input-cell" value="80" oninput="calcolaImpianto()"></td>
          <td style="text-align: center;">+</td>
          <td>Acqua preparata nella pentola di sparge</td>
        </tr>
        <tr>
          <td>RESIDUO SPARGE</td>
          <td class="bg-yellow"><input type="number" id="impResSparge" class="input-cell" value="20" oninput="calcolaImpianto()"></td>
          <td style="text-align: center;">=</td>
          <td>Acqua rimasta sul fondo della pentola sparge</td>
        </tr>
        <tr style="background: #f8fafc; font-weight: bold;">
          <td>ACQUA DI SPARGE UTILIZZATA</td>
          <td id="resSpargeUsed" style="text-align: right;">60 L</td>
          <td></td>
          <td>Sparge - Residuo</td>
        </tr>
        <tr>
          <td>ACQUA DI MASH</td>
          <td class="bg-yellow"><input type="number" id="impMash" class="input-cell" value="39" oninput="calcolaImpianto()"></td>
          <td style="text-align: center;">+</td>
          <td>Acqua inserita nella pentola mash</td>
        </tr>
        <tr style="background: #f8fafc; font-weight: bold;">
          <td>TOTALE ACQUA NELLA PENTOLA DI MASH</td>
          <td id="resTotMashPot" style="text-align: right;">99 L</td>
          <td></td>
          <td>Sparge utilizzata + Acqua Mash</td>
        </tr>
        <tr>
          <td>VOLUME IN BOLLITURA</td>
          <td class="bg-yellow"><input type="number" id="impBoil" class="input-cell" value="63" oninput="calcolaImpianto()"></td>
          <td style="text-align: center;">-</td>
          <td>Mosto prima della bollitura</td>
        </tr>
        <tr>
          <td>RITENZIONE GRANI (Kg malto x 0.85)</td>
          <td class="bg-yellow"><input type="number" id="impGrainsKg" class="input-cell" value="15" oninput="calcolaImpianto()"> kg</td>
          <td style="text-align: center;">-</td>
          <td>Ritenzione calcolata: <strong id="resGrainRetention">12.75 L</strong></td>
        </tr>
        <tr style="background: #fffbeb; font-weight: bold;">
          <td>SPAZIO MORTO DI MASH</td>
          <td id="resDeadSpace" style="text-align: right; color: #b45309;">23.25 L</td>
          <td></td>
          <td>Totale Acqua - Volume Bollitura - Ritenzione</td>
        </tr>
        <tr>
          <td>VOLUME DOPO BOLLITURA</td>
          <td class="bg-yellow"><input type="number" id="impPostBoil" class="input-cell" value="53" oninput="calcolaImpianto()"></td>
          <td style="text-align: center;">=</td>
          <td>Volume caldo post-ebollizione</td>
        </tr>
        <tr style="background: #f8fafc; font-weight: bold;">
          <td>PERDITA PER EVAPORAZIONE</td>
          <td id="resEvapLoss" style="text-align: right;">10 L</td>
          <td></td>
          <td>Volume in bollitura - Volume dopo bollitura</td>
        </tr>
        <tr>
          <td>VOLUME NEL FERMENTATORE</td>
          <td class="bg-yellow"><input type="number" id="impInFerm" class="input-cell" value="51" oninput="calcolaImpianto()"></td>
          <td style="text-align: center;">=</td>
          <td>Mosto trasferito nel fermentatore</td>
        </tr>
        <tr style="background: #f8fafc; font-weight: bold;">
          <td>PERDITA NEL TUBO / TRUB</td>
          <td id="resPipeLoss" style="text-align: right;">2 L</td>
          <td></td>
          <td>Volume dopo bollitura - Volume nel fermentatore</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- ==================== TAB 4: PROCESSO ==================== -->
  <div id="tab-processo" class="tab-content">
    <div class="section-bar">Diario Operativo di Produzione Passo-Passo</div>

    <div class="process-card">
      <h4>1. Preparazione & Sanificazione Pentole</h4>
      <p>• Lavare le pentole con Neodetersol (conf. viola).<br>
         • Sanificare con detergente peracetico (3 x 1000).<br>
         • Mettere in congelatore 4 bicchieri grandi per raffreddare i campioni di mosto per il controllo di pH e densità.<br>
         • Sanificare lo scambiatore a piastre lasciandolo in ammollo fin dal mattino.<br>
         • Togliere il lievito dal frigorifero la mattina prima di iniziare la cotta per portarlo a temperatura ambiente.</p>
    </div>

    <div class="process-card">
      <h4>2. Sparge: Inserimento Acqua e Controllo pH (Target: 5.2 - 5.6)</h4>
      <p>Acqua di Sparge: <strong id="procSpargeVal">-</strong> | Obiettivo pH: <strong>5.4</strong> (stare sotto 6.0 per non estrarre tannini).<br>
         Aggiunta acido lattico: iniziare con 25 ml per 60 L (rapporto ~0.3 ml/L). Continuare con 5 ml per volta fino al target.</p>
    </div>

    <div class="process-card">
      <h4>3. Macinatura Grani & Inserimento Acqua Mash</h4>
      <p>• Macinatura grossolana (0.5 pollici): la buccia deve rimanere integra in 2-4 parti granulose, mai ridotta in farina.<br>
         • Acqua di Mash: <strong id="procMashVal">-</strong>. Versare lentamente i grani con miscelatore acceso e fornello spento.<br>
         • <strong>Strike Water:</strong> Scaldare l'acqua a <strong>68°C</strong> (2-3°C superiore alla sosta enzimatica) per compensare lo shock termico dei grani.</p>
    </div>

    <div class="process-card">
      <h4>4. Profilo di Ammostamento & Test dello Iodio</h4>
      <p>• <strong>Ferulic Acid Rest:</strong> 42°C per 10 min (per Saison/Weizen).<br>
         • <strong>Proteasi:</strong> 52°C per 20 min.<br>
         • <strong>β-amilasi:</strong> 65°C per 30 min (trasformazione amidi in maltosio, + alcol - corpo).<br>
         • <strong>α-amilasi:</strong> 70°C per 20 min (destrine non fermentabili, + corpo).<br>
         • <strong>Test Iodio a 55 min:</strong> Se il mosto resta bruno la conversione è completa. Se vira al blu/nero attendere 10-15 min.<br>
         • <strong>Mash-Out:</strong> 78°C per 10 min (disattivazione enzimatica irreversibile).</p>
    </div>

    <div class="process-card">
      <h4>5. Sparge, Chiarificazione & Controllo Densità</h4>
      <p>• Fermare le pale 3 min prima per compattare le trebbie. Ricircolare i primi litri fino a mosto limpido.<br>
         • Fly Sparge a <strong>1 Litro al minuto</strong> senza splashare (le trebbie devono restare sempre coperte da 4-5 cm d'acqua).<br>
         • <strong>Soglia di sicurezza:</strong> L'OG in uscita non deve <strong>MAI scendere sotto 1008 - 1012</strong> per non estrarre tannini.</p>
    </div>

    <div class="process-card">
      <h4>6. Bollitura & Luppolature</h4>
      <p>• Litri Pre-Boil: <strong id="procPreBoilVal">-</strong> | OG Pre-Boil: <strong id="procOGPreBoilVal">-</strong>.<br>
         • Bollitura vivace scoperta di <strong>60 minuti</strong>.<br>
         • A fine bollitura: <strong>Whirlpool per 1 minuto</strong> e sosta 15 min con coperchio chiuso.</p>
    </div>

    <div class="process-card">
      <h4>7. Raffreddamento & Inoculo Lievito</h4>
      <p>• Reidratare il lievito secco 30 min prima in 300 ml di acqua a 30-35°C.<br>
         • Raffreddare il mosto con scambiatore sotto i 20°C (mai inoculare sopra i 25°C).<br>
         • Trasferire nel fermentatore sanificato e misurare densità iniziale OG effettiva.</p>
    </div>

    <div class="process-card">
      <h4>8. Imbottigliamento & Sanificazione</h4>
      <p>• Giorno prima: lavaggio bottiglie con Bicarbonato di Sodio in acqua calda (40-50°C, 15-20 min), risciacquo e scolo.<br>
         • Giorno cotta: sanificazione con Metabisolfito di Potassio (15-20 g/L) con avvinatore, scolare 15 min senza risciacquare.<br>
         • Travaso mosto, aggiunta zucchero di priming calcolato e imbottigliamento.</p>
    </div>
  </div>
</div>

<script>
  // ================= DATABASE BJCP 2015 COMPLETO =================
  const BJCP_DB = [
    { id: "1a", cat: "1A", name: "American Light Lager", og: "1028 – 1040", fg: "0998 – 1008", ibu: "8 – 12", srm: "2 – 3", abv: "2.8% – 4.2%" },
    { id: "1b", cat: "1B", name: "American Lager", og: "1040 – 1050", fg: "1004 – 1010", ibu: "8 – 18", srm: "2 – 4", abv: "4.2% – 5.3%" },
    { id: "1c", cat: "1C", name: "Cream Ale", og: "1042 – 1055", fg: "1006 – 1012", ibu: "15 – 20", srm: "2.5 – 5", abv: "4.2% – 5.6%" },
    { id: "1d", cat: "1D", name: "American Wheat Beer", og: "1040 – 1055", fg: "1008 – 1013", ibu: "15 – 30", srm: "3 – 6", abv: "4.0% – 5.5%" },
    { id: "2a", cat: "2A", name: "International Pale Lager", og: "1042 – 1050", fg: "1008 – 1012", ibu: "18 – 25", srm: "2 – 6", abv: "4.6% – 6.0%" },
    { id: "2b", cat: "2B", name: "International Amber Lager", og: "1042 – 1055", fg: "1008 – 1014", ibu: "8 – 25", srm: "7 – 14", abv: "4.6% – 6.0%" },
    { id: "2c", cat: "2C", name: "International Dark Lager", og: "1044 – 1056", fg: "1008 – 1012", ibu: "8 – 20", srm: "14 – 22", abv: "4.2% – 6.0%" },
    { id: "3a", cat: "3A", name: "Czech Pale Lager", og: "1028 – 1044", fg: "1008 – 1014", ibu: "20 – 35", srm: "3 – 6", abv: "3.0% – 4.1%" },
    { id: "3b", cat: "3B", name: "Czech Premium Pale Lager", og: "1044 – 1056", fg: "1013 – 1017", ibu: "30 – 45", srm: "3.5 – 6", abv: "4.2% – 5.8%" },
    { id: "3c", cat: "3C", name: "Czech Amber Lager", og: "1044 – 1060", fg: "1013 – 1017", ibu: "20 – 35", srm: "10 – 16", abv: "4.4% – 5.8%" },
    { id: "3d", cat: "3D", name: "Czech Dark Lager", og: "1044 – 1060", fg: "1013 – 1017", ibu: "18 – 34", srm: "14 – 35", abv: "4.4% – 5.8%" },
    { id: "4a", cat: "4A", name: "Munich Helles", og: "1044 – 1048", fg: "1006 – 1012", ibu: "16 – 22", srm: "3 – 5", abv: "4.7% – 5.4%" },
    { id: "4b", cat: "4B", name: "Festbier", og: "1054 – 1057", fg: "1010 – 1012", ibu: "18 – 25", srm: "4 – 7", abv: "5.8% – 6.3%" },
    { id: "4c", cat: "4C", name: "Helles Bock", og: "1064 – 1072", fg: "1011 – 1018", ibu: "23 – 35", srm: "6 – 11", abv: "6.3% – 7.4%" },
    { id: "5a", cat: "5A", name: "German Leichtbier", og: "1026 – 1034", fg: "1006 – 1010", ibu: "15 – 28", srm: "2 – 5", abv: "2.4% – 3.6%" },
    { id: "5b", cat: "5B", name: "Kölsch", og: "1044 – 1050", fg: "1007 – 1011", ibu: "18 – 30", srm: "3.5 – 5", abv: "4.4% – 5.2%" },
    { id: "5c", cat: "5C", name: "German Helles Exportbier", og: "1048 – 1056", fg: "1010 – 1015", ibu: "20 – 30", srm: "4 – 7", abv: "4.8% – 6.0%" },
    { id: "5d", cat: "5D", name: "German Pils", og: "1044 – 1050", fg: "1008 – 1013", ibu: "22 – 40", srm: "2 – 5", abv: "4.4% – 5.2%" },
    { id: "6a", cat: "6A", name: "Märzen", og: "1054 – 1060", fg: "1010 – 1014", ibu: "18 – 24", srm: "8 – 17", abv: "5.8% – 6.3%" },
    { id: "6b", cat: "6B", name: "Rauchbier", og: "1050 – 1057", fg: "1012 – 1016", ibu: "20 – 30", srm: "12 – 22", abv: "4.8% – 6.0%" },
    { id: "6c", cat: "6C", name: "Dunkles Bock", og: "1064 – 1072", fg: "1013 – 1019", ibu: "20 – 27", srm: "14 – 22", abv: "6.3% – 7.2%" },
    { id: "7a", cat: "7A", name: "Vienna Lager", og: "1048 – 1055", fg: "1010 – 1014", ibu: "18 – 30", srm: "9 – 15", abv: "4.7% – 5.5%" },
    { id: "7b", cat: "7B", name: "Altbier", og: "1044 – 1052", fg: "1008 – 1014", ibu: "25 – 50", srm: "11 – 17", abv: "4.3% – 5.5%" },
    { id: "7c_p", cat: "7C", name: "Kellerbier: Pale Kellerbier", og: "1045 – 1051", fg: "1008 – 1012", ibu: "20 – 35", srm: "3 – 7", abv: "4.7% – 5.4%" },
    { id: "7c_a", cat: "7C", name: "Kellerbier: Amber Kellerbier", og: "1048 – 1054", fg: "1012 – 1016", ibu: "25 – 40", srm: "7 – 17", abv: "4.8% – 5.4%" },
    { id: "8a", cat: "8A", name: "Munich Dunkel", og: "1048 – 1056", fg: "1010 – 1016", ibu: "18 – 28", srm: "14 – 28", abv: "4.5% – 5.6%" },
    { id: "8b", cat: "8B", name: "Schwarzbier", og: "1046 – 1052", fg: "1010 – 1016", ibu: "20 – 30", srm: "17 – 30", abv: "4.4% – 5.4%" },
    { id: "9a", cat: "9A", name: "Doppelbock", og: "1072 – 1112", fg: "1016 – 1024", ibu: "16 – 26", srm: "6 – 25", abv: "7.0% – 10.0%" },
    { id: "9b", cat: "9B", name: "Eisbock", og: "1078 – 1120", fg: "1020 – 1035", ibu: "25 – 35", srm: "18 – 30", abv: "9.0% – 14.0%" },
    { id: "9c", cat: "9C", name: "Baltic Porter", og: "1060 – 1090", fg: "1016 – 1024", ibu: "20 – 40", srm: "17 – 30", abv: "6.5% – 9.5%" },
    { id: "10a", cat: "10A", name: "Weissbier", og: "1044 – 1052", fg: "1010 – 1014", ibu: "8 – 15", srm: "2 – 6", abv: "4.3% – 5.6%" },
    { id: "10b", cat: "10B", name: "Dunkles Weissbier", og: "1044 – 1056", fg: "1010 – 1014", ibu: "10 – 18", srm: "14 – 23", abv: "4.3% – 5.6%" },
    { id: "10c", cat: "10C", name: "Weizenbock", og: "1064 – 1090", fg: "1015 – 1022", ibu: "15 – 30", srm: "6 – 25", abv: "6.5% – 9.0%" },
    { id: "11a", cat: "11A", name: "Ordinary Bitter", og: "1030 – 1039", fg: "1007 – 1011", ibu: "25 – 35", srm: "8 – 14", abv: "3.2% – 3.8%" },
    { id: "11b", cat: "11B", name: "Best Bitter", og: "1040 – 1048", fg: "1008 – 1012", ibu: "25 – 40", srm: "8 – 16", abv: "3.8% – 4.6%" },
    { id: "11c", cat: "11C", name: "Strong Bitter", og: "1048 – 1060", fg: "1010 – 1016", ibu: "30 – 50", srm: "8 – 18", abv: "4.6% – 6.2%" },
    { id: "12a", cat: "12A", name: "English Golden Ale", og: "1038 – 1053", fg: "1006 – 1012", ibu: "20 – 45", srm: "2 – 6", abv: "3.8% – 5.0%" },
    { id: "12b", cat: "12B", name: "Australian Sparkling Ale", og: "1038 – 1050", fg: "1004 – 1006", ibu: "20 – 35", srm: "4 – 7", abv: "4.5% – 6.0%" },
    { id: "12c", cat: "12C", name: "English IPA", og: "1050 – 1075", fg: "1010 – 1018", ibu: "40 – 60", srm: "6 – 14", abv: "5.0% – 7.5%" },
    { id: "13a", cat: "13A", name: "Dark Mild", og: "1030 – 1038", fg: "1008 – 1013", ibu: "10 – 25", srm: "12 – 25", abv: "3.0% – 3.8%" },
    { id: "13b", cat: "13B", name: "British Brown Ale", og: "1040 – 1052", fg: "1008 – 1013", ibu: "20 – 30", srm: "12 – 22", abv: "4.2% – 5.4%" },
    { id: "13c", cat: "13C", name: "English Porter", og: "1040 – 1052", fg: "1008 – 1014", ibu: "18 – 35", srm: "20 – 30", abv: "4.0% – 5.4%" },
    { id: "14a", cat: "14A", name: "Scottish Light", og: "1030 – 1035", fg: "1010 – 1013", ibu: "10 – 20", srm: "17 – 22", abv: "2.5% – 3.2%" },
    { id: "14b", cat: "14B", name: "Scottish Heavy", og: "1035 – 1040", fg: "1010 – 1015", ibu: "10 – 20", srm: "13 – 22", abv: "3.2% – 3.9%" },
    { id: "14c", cat: "14C", name: "Scottish Export", og: "1040 – 1060", fg: "1010 – 1016", ibu: "15 – 30", srm: "13 – 22", abv: "3.9% – 6.0%" },
    { id: "15a", cat: "15A", name: "Irish Red Ale", og: "1036 – 1046", fg: "1010 – 1014", ibu: "18 – 28", srm: "9 – 14", abv: "3.8% – 5.0%" },
    { id: "15b", cat: "15B", name: "Irish Stout", og: "1036 – 1044", fg: "1007 – 1011", ibu: "25 – 45", srm: "25 – 40", abv: "4.0% – 4.5%" },
    { id: "15c", cat: "15C", name: "Irish Extra Stout", og: "1052 – 1062", fg: "1010 – 1014", ibu: "35 – 50", srm: "25 – 40", abv: "5.5% – 6.5%" },
    { id: "16a", cat: "16A", name: "Sweet Stout", og: "1044 – 1060", fg: "1012 – 1024", ibu: "20 – 40", srm: "30 – 40", abv: "4.0% – 6.0%" },
    { id: "16b", cat: "16B", name: "Oatmeal Stout", og: "1045 – 1065", fg: "1010 – 1018", ibu: "25 – 40", srm: "22 – 40", abv: "4.2% – 5.9%" },
    { id: "16c", cat: "16C", name: "Tropical Stout", og: "1056 – 1075", fg: "1010 – 1018", ibu: "30 – 50", srm: "30 – 40", abv: "5.5% – 8.0%" },
    { id: "16d", cat: "16D", name: "Foreign Extra Stout", og: "1056 – 1075", fg: "1010 – 1018", ibu: "50 – 70", srm: "30 – 40", abv: "6.3% – 8.0%" },
    { id: "17a", cat: "17A", name: "British Strong Ale", og: "1055 – 1080", fg: "1015 – 1022", ibu: "30 – 60", srm: "8 – 22", abv: "5.5% – 8.0%" },
    { id: "17b", cat: "17B", name: "Old Ale", og: "1055 – 1088", fg: "1015 – 1022", ibu: "30 – 60", srm: "10 – 22", abv: "5.5% – 9.0%" },
    { id: "17c", cat: "17C", name: "Wee Heavy", og: "1070 – 1130", fg: "1018 – 1040", ibu: "17 – 35", srm: "14 – 25", abv: "6.5% – 10.0%" },
    { id: "17d", cat: "17D", name: "English Barleywine", og: "1080 – 1120", fg: "1018 – 1030", ibu: "35 – 70", srm: "8 – 22", abv: "8.0% – 12.0%" },
    { id: "18a", cat: "18A", name: "Blonde Ale", og: "1038 – 1054", fg: "1008 – 1013", ibu: "15 – 28", srm: "3 – 6", abv: "3.8% – 5.5%" },
    { id: "18b", cat: "18B", name: "American Pale Ale", og: "1045 – 1060", fg: "1010 – 1015", ibu: "30 – 50", srm: "5 – 10", abv: "4.5% – 6.2%" },
    { id: "19a", cat: "19A", name: "American Amber Ale", og: "1045 – 1060", fg: "1010 – 1015", ibu: "25 – 40", srm: "10 – 17", abv: "4.5% – 6.2%" },
    { id: "19b", cat: "19B", name: "California Common", og: "1048 – 1054", fg: "1011 – 1014", ibu: "30 – 45", srm: "10 – 14", abv: "4.5% – 5.5%" },
    { id: "19c", cat: "19C", name: "American Brown Ale", og: "1045 – 1060", fg: "1010 – 1016", ibu: "20 – 30", srm: "18 – 35", abv: "4.3% – 6.2%" },
    { id: "20a", cat: "20A", name: "American Porter", og: "1050 – 1070", fg: "1012 – 1018", ibu: "25 – 50", srm: "22 – 40", abv: "4.8% – 6.5%" },
    { id: "20b", cat: "20B", name: "American Stout", og: "1050 – 1075", fg: "1010 – 1022", ibu: "35 – 75", srm: "30 – 40", abv: "5.0% – 7.0%" },
    { id: "20c", cat: "20C", name: "Russian Imperial Stout", og: "1075 – 1115", fg: "1018 – 1030", ibu: "50 – 90", srm: "30 – 40", abv: "8.0% – 12.0%" },
    { id: "21a", cat: "21A", name: "American IPA", og: "1056 – 1070", fg: "1008 – 1014", ibu: "40 – 70", srm: "6 – 14", abv: "5.5% – 7.5%" },
    { id: "21b_bel", cat: "21B", name: "Specialty IPA: Belgian IPA", og: "1058 – 1080", fg: "1008 – 1016", ibu: "50 – 100", srm: "5 – 15", abv: "6.2% – 9.5%" },
    { id: "21b_bla", cat: "21B", name: "Specialty IPA: Black IPA", og: "1050 – 1085", fg: "1010 – 1018", ibu: "50 – 90", srm: "25 – 40", abv: "5.5% – 9.0%" },
    { id: "21b_bro", cat: "21B", name: "Specialty IPA: Brown IPA", og: "1056 – 1070", fg: "1008 – 1016", ibu: "40 – 70", srm: "11 – 19", abv: "5.5% – 7.5%" },
    { id: "21b_red", cat: "21B", name: "Specialty IPA: Red IPA", og: "1056 – 1070", fg: "1008 – 1016", ibu: "40 – 70", srm: "11 – 19", abv: "5.5% – 7.5%" },
    { id: "21b_rye", cat: "21B", name: "Specialty IPA: Rye IPA", og: "1056 – 1075", fg: "1008 – 1014", ibu: "50 – 75", srm: "6 – 14", abv: "5.5% – 8.0%" },
    { id: "21b_whi", cat: "21B", name: "Specialty IPA: White IPA", og: "1056 – 1065", fg: "1013 – 1016", ibu: "40 – 70", srm: "5 – 8", abv: "5.7% – 7.0%" },
    { id: "22a", cat: "22A", name: "Double IPA", og: "1065 – 1085", fg: "1008 – 1018", ibu: "60 – 120", srm: "6 – 14", abv: "7.5% – 10.0%" },
    { id: "22b", cat: "22B", name: "American Strong Ale", og: "1062 – 1090", fg: "1014 – 1024", ibu: "50 – 100", srm: "7 – 19", abv: "6.3% – 10.0%" },
    { id: "22c", cat: "22C", name: "American Barleywine", og: "1080 – 1120", fg: "1016 – 1030", ibu: "50 – 100", srm: "10 – 19", abv: "8.0% – 12.0%" },
    { id: "22d", cat: "22D", name: "Wheatwine", og: "1080 – 1120", fg: "1016 – 1030", ibu: "30 – 60", srm: "8 – 15", abv: "8.0% – 12.0%" },
    { id: "23a", cat: "23A", name: "Berliner Weisse", og: "1028 – 1032", fg: "1003 – 1006", ibu: "3 – 8", srm: "2 – 3", abv: "2.8% – 3.8%" },
    { id: "23b", cat: "23B", name: "Flanders Red Ale", og: "1048 – 1057", fg: "1002 – 1012", ibu: "10 – 25", srm: "10 – 16", abv: "4.6% – 6.5%" },
    { id: "23c", cat: "23C", name: "Oud Bruin", og: "1040 – 1074", fg: "1008 – 1012", ibu: "20 – 25", srm: "15 – 22", abv: "4.0% – 8.0%" },
    { id: "23d", cat: "23D", name: "Lambic", og: "1040 – 1054", fg: "1001 – 1010", ibu: "0 – 10", srm: "3 – 7", abv: "5.0% – 6.5%" },
    { id: "23e", cat: "23E", name: "Gueuze", og: "1040 – 1060", fg: "1000 – 1006", ibu: "0 – 10", srm: "3 – 7", abv: "5.0% – 8.0%" },
    { id: "23f", cat: "23F", name: "Fruit Lambic", og: "1040 – 1060", fg: "1000 – 1010", ibu: "0 – 10", srm: "3 – 7", abv: "5.0% – 7.0%" },
    { id: "24a", cat: "24A", name: "Witbier", og: "1044 – 1052", fg: "1008 – 1012", ibu: "8 – 20", srm: "2 – 4", abv: "4.5% – 5.5%" },
    { id: "24b", cat: "24B", name: "Belgian Pale Ale", og: "1048 – 1054", fg: "1010 – 1014", ibu: "20 – 30", srm: "8 – 14", abv: "4.8% – 5.5%" },
    { id: "24c", cat: "24C", name: "Bière de Garde", og: "1060 – 1080", fg: "1008 – 1016", ibu: "18 – 28", srm: "6 – 19", abv: "6.0% – 8.5%" },
    { id: "25a", cat: "25A", name: "Belgian Blond Ale", og: "1062 – 1075", fg: "1008 – 1018", ibu: "15 – 30", srm: "4 – 7", abv: "6.0% – 7.5%" },
    { id: "25b", cat: "25B", name: "Saison", og: "1048 – 1065", fg: "1002 – 1008", ibu: "20 – 35", srm: "5 – 14", abv: "5.0% – 7.0%" },
    { id: "25c", cat: "25C", name: "Belgian Golden Strong Ale", og: "1070 – 1095", fg: "1005 – 1016", ibu: "22 – 35", srm: "3 – 6", abv: "7.5% – 10.5%" },
    { id: "26a", cat: "26A", name: "Trappist Single", og: "1044 – 1054", fg: "1004 – 1010", ibu: "25 – 40", srm: "3 – 5", abv: "4.8% – 6.0%" },
    { id: "26b", cat: "26B", name: "Belgian Dubbel", og: "1062 – 1075", fg: "1008 – 1018", ibu: "15 – 25", srm: "10 – 17", abv: "6.0% – 7.6%" },
    { id: "26c", cat: "26C", name: "Belgian Tripel", og: "1075 – 1085", fg: "1008 – 1014", ibu: "20 – 40", srm: "4.5 – 7", abv: "7.5% – 9.5%" },
    { id: "26d", cat: "26D", name: "Belgian Dark Strong Ale", og: "1075 – 1110", fg: "1010 – 1024", ibu: "20 – 35", srm: "12 – 22", abv: "8.0% – 12.0%" },
    { id: "27_gose", cat: "27", name: "Historical Beer: Gose", og: "1036 – 1044", fg: "1006 – 1010", ibu: "5 – 12", srm: "3 – 4", abv: "4.2% – 4.8%" },
    { id: "27_rogg", cat: "27", name: "Historical Beer: Roggenbier", og: "1046 – 1056", fg: "1010 – 1014", ibu: "10 – 20", srm: "14 – 19", abv: "4.5% – 6.0%" },
    { id: "27_sahti", cat: "27", name: "Historical Beer: Sahti", og: "1076 – 1120", fg: "1016 – 1020", ibu: "7 – 15", srm: "4 – 22", abv: "7.0% – 11.0%" },
    { id: "27_kent", cat: "27", name: "Historical Beer: Kentucky Common", og: "1044 – 1055", fg: "1010 – 1014", ibu: "15 – 30", srm: "11 – 20", abv: "4.0% – 5.5%" },
    { id: "27_grod", cat: "27", name: "Historical Beer: Piwo Grodziskie", og: "1028 – 1032", fg: "1006 – 1012", ibu: "20 – 35", srm: "3 – 6", abv: "2.5% – 3.3%" },
    { id: "27_lich", cat: "27", name: "Historical Beer: Lichtenhainer", og: "1032 – 1040", fg: "1004 – 1008", ibu: "5 – 12", srm: "3 – 6", abv: "3.5% – 4.7%" },
    { id: "x3_iga", cat: "X3", name: "Italian Grape Ale (IGA)", og: "1059 – 1075", fg: "1004 – 1014", ibu: "10 – 30", srm: "4 – 15", abv: "5.9% – 8.5%" }
  ];

  let activeBJCP = null;
  let maltiBase = [];
  let maltiSpec = [];
  let luppoli = [];

  function switchTab(id, btn) {
    document.querySelectorAll('.tab-content').forEach(e => e.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(e => e.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    if (btn) btn.classList.add('active');
  }

  function popolaDatalist() {
    const dl = document.getElementById('bjcpList');
    dl.innerHTML = '';
    BJCP_DB.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.cat + ' - ' + s.name;
      dl.appendChild(opt);
    });
  }

  function applicaRicercaStile(val) {
    if (!val) return;
    const q = val.toLowerCase().trim();
    const found = BJCP_DB.find(s => 
      s.name.toLowerCase().includes(q) || 
      s.cat.toLowerCase().includes(q) ||
      (s.cat + ' - ' + s.name).toLowerCase().includes(q)
    );
    if (found) {
      activeBJCP = found;
      document.getElementById('headStyleName').value = found.name;
      document.getElementById('headStyleCode').value = found.cat;
      document.getElementById('bjcpOG').textContent = found.og;
      document.getElementById('bjcpFG').textContent = found.fg;
      document.getElementById('bjcpIBU').textContent = found.ibu;
      document.getElementById('bjcpSRM').textContent = found.srm;
      document.getElementById('bjcpABV').textContent = found.abv;

      // Inizializza i parametri di default
      if (!document.getElementById('ogPrevisto').value) document.getElementById('ogPrevisto').value = 1054;
      if (!document.getElementById('tolleranzaInput').value) document.getElementById('tolleranzaInput').value = '15%';
      if (!document.getElementById('lossBoil').value) document.getElementById('lossBoil').value = 10;
      if (!document.getElementById('lossTransfer').value) document.getElementById('lossTransfer').value = 2;
      if (!document.getElementById('lossFerm').value) document.getElementById('lossFerm').value = 8;
      if (!document.getElementById('boilMinPrev').value) document.getElementById('boilMinPrev').value = 60;
      if (!document.getElementById('mashEffPrev').value) document.getElementById('mashEffPrev').value = '80%';
      if (!document.getElementById('attValInput').value) document.getElementById('attValInput').value = '80%';
      if (!document.getElementById('ibuPrev').value) document.getElementById('ibuPrev').value = 40;
      if (!document.getElementById('mashRatio').value) document.getElementById('mashRatio').value = 3.0;
      if (!document.getElementById('primingSugarType').value) document.getElementById('primingSugarType').value = 'Destrosio';
      if (!document.getElementById('primingTemp').value) document.getElementById('primingTemp').value = 20;
      if (!document.getElementById('primingCO2').value) document.getElementById('primingCO2').value = 2.2;

      if (maltiBase.length === 0) {
        maltiBase = [
          { nome: "Malto Base Principale", pct: 0.80, sg: 30, ebc: 5 }
        ];
      }
      if (maltiSpec.length === 0) {
        maltiSpec = [
          { nome: "Malto Speciale", pct: 0.20, sg: 28, ebc: 60 }
        ];
      }
      if (luppoli.length === 0) {
        luppoli = [
          { nome: "Luppolo da Amaro", ibu: 25, tempo: 60, aa: 6.0, fase: "Inizio (60 min)" },
          { nome: "Luppolo da Aroma", ibu: 15, tempo: 15, aa: 4.5, fase: "Metà (15 min)" }
        ];
      }

      renderMalti();
      renderLuppoli();
      calcolaTabella();
    }
  }

  function eliminaStileSelezionato() {
    activeBJCP = null;
    pulisciFoglio();
  }

  // AZZERA COMPLETAMENTE IL FOGLIO
  function pulisciFoglio() {
    activeBJCP = null;

    // Svuota tutti i campi di testo / numerici in tab-ricetta
    document.querySelectorAll('#tab-ricetta input').forEach(inp => {
      inp.value = '';
    });

    // Reset tendine
    const savedRec = document.getElementById('savedRecipesSelect');
    if (savedRec) savedRec.value = '';
    const litriF = document.getElementById('litriFermSelect');
    if (litriF) litriF.selectedIndex = 0;
    const attPres = document.getElementById('selAttenuazionePreset');
    if (attPres) attPres.selectedIndex = 0;

    // Reset di tutti i valori calcolati e range BJCP
    const resultIds = [
      'bjcpOG', 'bjcpFG', 'bjcpIBU', 'bjcpSRM', 'bjcpABV',
      'resPostBoilPrev', 'resPreBoilPrev', 'resOGPreBoilPrev', 'resPuntiTotali',
      'resKgGraniPrev', 'resEBCPrev', 'resEBCReale', 'resSRMPrev', 'resSRMReale',
      'resABVPrev', 'resABVReale', 'resLitriPostFermPrev', 'resFGPrev',
      'yeastCalcGrams', 'yeastRealGrams',
      'resWaterMash', 'resWaterAbs', 'resWortFromMash', 'resWaterSparge', 'resWaterTotal',
      'resPrimingGrams', 'procSpargeVal', 'procMashVal', 'procPreBoilVal', 'procOGPreBoilVal'
    ];
    resultIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = '-';
    });

    // Svuota le liste malti e luppoli
    maltiBase = [];
    maltiSpec = [];
    luppoli = [];
    renderMalti();
    renderLuppoli();
  }

  function parsePercent(val, def) {
    if (typeof val === 'number') return val;
    if (!val) return def;
    const clean = val.toString().replace('%', '').replace(',', '.').trim();
    const num = parseFloat(clean);
    return isNaN(num) ? def : (num > 1 ? num / 100 : num);
  }

  function calcolaTabella() {
    const ogPrevRaw = document.getElementById('ogPrevisto').value;
    if (!ogPrevRaw) {
      return;
    }

    const ogPrev = parseFloat(ogPrevRaw) || 1054;
    const ogReal = parseFloat(document.getElementById('ogReale').value) || ogPrev;

    const litriFerm = parseFloat(document.getElementById('litriFermSelect').value) || 75;
    const tol = parsePercent(document.getElementById('tolleranzaInput').value, 0.15);

    const postBoilPrev = litriFerm - (litriFerm * tol);
    document.getElementById('resPostBoilPrev').textContent = Math.round(postBoilPrev);
    const postBoilReal = parseFloat(document.getElementById('postBoilReale').value) || postBoilPrev;

    const lossB = parseFloat(document.getElementById('lossBoil').value) || 10;
    const lossT = parseFloat(document.getElementById('lossTransfer').value) || 2;
    const lossF = parseFloat(document.getElementById('lossFerm').value) || 8;

    const preBoilPrev = postBoilPrev + lossB + lossT + lossF;
    document.getElementById('resPreBoilPrev').textContent = Math.round(preBoilPrev);
    const preBoilReal = parseFloat(document.getElementById('preBoilReale').value) || preBoilPrev;

    const ogPreBoilPrev = ((ogPrev - 1000) * postBoilPrev / preBoilPrev) + 1000;
    document.getElementById('resOGPreBoilPrev').textContent = Math.round(ogPreBoilPrev);

    const puntiTotali = postBoilPrev * (ogPrev - 1000);
    document.getElementById('resPuntiTotali').textContent = (puntiTotali / 1000).toFixed(3).replace('.', ',');

    const mEffPrev = parsePercent(document.getElementById('mashEffPrev').value, 0.80);
    const attVal = parsePercent(document.getElementById('attValInput').value, 0.80);

    const fgPrev = (ogPrev - 1000) - ((ogPrev - 1000) * attVal) + 1000;
    document.getElementById('resFGPrev').textContent = Math.round(fgPrev);
    const fgReal = parseFloat(document.getElementById('fgReale').value) || fgPrev;

    const abvPrev = (ogPrev - fgPrev) / 7.5;
    const abvReal = (ogReal - fgReal) / 7.5;
    document.getElementById('resABVPrev').textContent = abvPrev.toFixed(1).replace('.', ',');
    document.getElementById('resABVReale').textContent = abvReal.toFixed(1).replace('.', ',');

    const postFermPrev = postBoilPrev - lossF;
    document.getElementById('resLitriPostFermPrev').textContent = postFermPrev.toFixed(1).replace('.', ',');

    const yeastCalcG = (750000 * ((ogPrev - 1000) / 4) * (postBoilPrev * 1000)) / 15000000000;
    document.getElementById('yeastCalcGrams').textContent = yeastCalcG.toFixed(1) + ' g';
    const sG = parseFloat(document.getElementById('yeastSachetG').value) || 11.5;
    const sN = parseFloat(document.getElementById('yeastSachetN').value) || 3;
    document.getElementById('yeastRealGrams').textContent = (sG * sN).toFixed(1) + ' g';

    let totKgBase = 0, totPtsBase = 0, totGUBase = 0, sumMcu = 0;
    maltiBase.forEach((m, idx) => {
      const pts = puntiTotali * m.pct;
      const kg = (m.sg > 0 && mEffPrev > 0) ? (pts / (m.sg * 10 * mEffPrev)) : 0;
      const gu = (kg * 10) * m.sg;
      totKgBase += kg;
      totPtsBase += pts;
      totGUBase += gu;
      sumMcu += (kg * m.ebc);

      const ptsEl = document.getElementById('ptsBase_' + idx);
      const kgEl = document.getElementById('kgBase_' + idx);
      const guEl = document.getElementById('guBase_' + idx);
      if (ptsEl) ptsEl.textContent = Math.round(pts);
      if (kgEl) kgEl.textContent = kg.toFixed(2) + ' kg';
      if (guEl) guEl.textContent = Math.round(gu) + ' GU';
    });

    let totKgSpec = 0, totPtsSpec = 0, totGUSpec = 0;
    maltiSpec.forEach((m, idx) => {
      const pts = puntiTotali * m.pct;
      const kg = (m.sg > 0 && mEffPrev > 0) ? (pts / (m.sg * 10 * mEffPrev)) : 0;
      const gu = (kg * 10) * m.sg;
      totKgSpec += kg;
      totPtsSpec += pts;
      totGUSpec += gu;
      sumMcu += (kg * m.ebc);

      const ptsEl = document.getElementById('ptsSpec_' + idx);
      const kgEl = document.getElementById('kgSpec_' + idx);
      const guEl = document.getElementById('guSpec_' + idx);
      if (ptsEl) ptsEl.textContent = Math.round(pts);
      if (kgEl) kgEl.textContent = kg.toFixed(2) + ' kg';
      if (guEl) guEl.textContent = Math.round(gu) + ' GU';
    });

    const totKgAll = totKgBase + totKgSpec;
    document.getElementById('resKgGraniPrev').textContent = totKgAll.toFixed(1).replace('.', ',');

    const ebcPrev = postBoilPrev > 0 ? (Math.pow((sumMcu / postBoilPrev), 0.6859) * 1.4922 * 1.97) : 0;
    const srmPrev = ebcPrev * 0.508;
    const ebcReal = postBoilReal > 0 ? (Math.pow((sumMcu / postBoilReal), 0.6859) * 1.4922 * 1.97) : 0;
    const srmReal = ebcReal * 0.508;

    document.getElementById('resEBCPrev').textContent = ebcPrev.toFixed(1).replace('.', ',');
    document.getElementById('resEBCReale').textContent = ebcReal.toFixed(1).replace('.', ',');
    document.getElementById('resSRMPrev').textContent = srmPrev.toFixed(1).replace('.', ',');
    document.getElementById('resSRMReale').textContent = srmReal.toFixed(1).replace('.', ',');

    const bigness = 1.65 * Math.pow(0.000125, (ogPrev / 1000 - 1));
    luppoli.forEach((h, idx) => {
      const timeFactor = (1 - Math.exp(-0.04 * h.tempo)) / 4.15;
      const utilPct = (bigness * timeFactor) * 100;
      const grams = (h.aa > 0 && utilPct > 0) ? ((10 * postBoilPrev * h.ibu) / (h.aa * (utilPct / 100))) / 10 : 0;

      const uEl = document.getElementById('hopUtil_' + idx);
      const gEl = document.getElementById('hopGrams_' + idx);
      if (uEl) uEl.textContent = utilPct.toFixed(1) + '%';
      if (gEl) gEl.textContent = Math.round(grams) + ' g';
    });

    const mR = parseFloat(document.getElementById('mashRatio').value) || 3.0;
    const wMash = totKgAll * mR;
    const wAbs = totKgAll * 1.0;
    const wortFromMash = wMash - wAbs;
    const wSparge = preBoilPrev - wortFromMash;
    const wTot = wMash + wSparge;

    document.getElementById('resWaterMash').textContent = wMash.toFixed(1) + ' L';
    document.getElementById('resWaterAbs').textContent = wAbs.toFixed(1) + ' L';
    document.getElementById('resWortFromMash').textContent = wortFromMash.toFixed(1) + ' L';
    document.getElementById('resWaterSparge').textContent = wSparge.toFixed(1) + ' L';
    document.getElementById('resWaterTotal').textContent = wTot.toFixed(1) + ' L';

    const pTemp = parseFloat(document.getElementById('primingTemp').value) || 20;
    const pCO2 = parseFloat(document.getElementById('primingCO2').value) || 2.2;
    const co2Res = 1.013 * Math.pow(0.975, pTemp);
    const primG = (pCO2 - co2Res) * 4 * postFermPrev;
    document.getElementById('resPrimingGrams').textContent = Math.round(Math.max(0, primG)) + ' g';

    document.getElementById('procSpargeVal').textContent = wSparge.toFixed(1) + ' L';
    document.getElementById('procMashVal').textContent = wMash.toFixed(1) + ' L';
    document.getElementById('procPreBoilVal').textContent = Math.round(preBoilPrev) + ' L';
    document.getElementById('procOGPreBoilVal').textContent = Math.round(ogPreBoilPrev);
  }

  function aggiornaPresetAttenuazione(val) {
    document.getElementById('attValInput').value = val;
    calcolaTabella();
  }

  function renderMalti() {
    const bBody = document.getElementById('maltBaseBody');
    bBody.innerHTML = '';
    maltiBase.forEach((m, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = \`
        <td><input type="text" class="tb-input" value="\${m.nome}" onchange="maltiBase[\${idx}].nome = this.value"></td>
        <td class="bg-yellow"><input type="number" class="input-cell" value="\${m.pct}" step="0.05" oninput="maltiBase[\${idx}].pct = parseFloat(this.value)||0; calcolaTabella();"></td>
        <td id="ptsBase_\${idx}" style="text-align: right; font-weight: bold;">-</td>
        <td class="bg-yellow"><input type="number" class="input-cell" value="\${m.sg}" step="1" oninput="maltiBase[\${idx}].sg = parseFloat(this.value)||0; calcolaTabella();"></td>
        <td id="kgBase_\${idx}" style="text-align: right; font-weight: bold; color: #b45309;">-</td>
        <td class="bg-yellow"><input type="number" class="input-cell" value="\${m.ebc}" step="1" oninput="maltiBase[\${idx}].ebc = parseFloat(this.value)||0; calcolaTabella();"></td>
        <td id="guBase_\${idx}" style="text-align: right; font-weight: bold;">-</td>
        <td style="text-align: center;"><button class="btn btn-red" style="padding: 2px 6px; font-size: 11px;" onclick="rimuoviBase(\${idx})">✕</button></td>
      \`;
      bBody.appendChild(tr);
    });

    const sBody = document.getElementById('maltSpecBody');
    sBody.innerHTML = '';
    maltiSpec.forEach((m, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = \`
        <td><input type="text" class="tb-input" value="\${m.nome}" onchange="maltiSpec[\${idx}].nome = this.value"></td>
        <td class="bg-yellow"><input type="number" class="input-cell" value="\${m.pct}" step="0.05" oninput="maltiSpec[\${idx}].pct = parseFloat(this.value)||0; calcolaTabella();"></td>
        <td id="ptsSpec_\${idx}" style="text-align: right; font-weight: bold;">-</td>
        <td class="bg-yellow"><input type="number" class="input-cell" value="\${m.sg}" step="1" oninput="maltiSpec[\${idx}].sg = parseFloat(this.value)||0; calcolaTabella();"></td>
        <td id="kgSpec_\${idx}" style="text-align: right; font-weight: bold; color: #b45309;">-</td>
        <td class="bg-yellow"><input type="number" class="input-cell" value="\${m.ebc}" step="1" oninput="maltiSpec[\${idx}].ebc = parseFloat(this.value)||0; calcolaTabella();"></td>
        <td id="guSpec_\${idx}" style="text-align: right; font-weight: bold;">-</td>
        <td style="text-align: center;"><button class="btn btn-red" style="padding: 2px 6px; font-size: 11px;" onclick="rimuoviSpeciale(\${idx})">✕</button></td>
      \`;
      sBody.appendChild(tr);
    });
  }

  function aggiungiMaltoBase() {
    maltiBase.push({ nome: "Nuovo Malto Base", pct: 0.10, sg: 30, ebc: 5 });
    renderMalti();
    calcolaTabella();
  }

  function rimuoviBase(idx) {
    maltiBase.splice(idx, 1);
    renderMalti();
    calcolaTabella();
  }

  function aggiungiMaltoSpeciale() {
    maltiSpec.push({ nome: "Nuovo Malto Speciale", pct: 0.05, sg: 28, ebc: 60 });
    renderMalti();
    calcolaTabella();
  }

  function rimuoviSpeciale(idx) {
    maltiSpec.splice(idx, 1);
    renderMalti();
    calcolaTabella();
  }

  function renderLuppoli() {
    const tbody = document.getElementById('hopBody');
    tbody.innerHTML = '';
    luppoli.forEach((h, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = \`
        <td><input type="text" class="tb-input" value="\${h.nome}" onchange="luppoli[\${idx}].nome = this.value"></td>
        <td class="bg-yellow"><input type="number" class="input-cell" value="\${h.ibu}" step="1" oninput="luppoli[\${idx}].ibu = parseFloat(this.value)||0; calcolaTabella();"></td>
        <td class="bg-yellow"><input type="number" class="input-cell" value="\${h.tempo}" step="5" oninput="luppoli[\${idx}].tempo = parseFloat(this.value)||0; calcolaTabella();"></td>
        <td class="bg-yellow"><input type="number" class="input-cell" value="\${h.aa}" step="0.1" oninput="luppoli[\${idx}].aa = parseFloat(this.value)||0; calcolaTabella();"></td>
        <td id="hopUtil_\${idx}" style="text-align: right; font-weight: bold;">-</td>
        <td id="hopGrams_\${idx}" style="text-align: right; font-weight: bold; color: #b45309;">-</td>
        <td class="bg-yellow"><input type="text" class="input-cell" value="\${h.fase}" onchange="luppoli[\${idx}].fase = this.value" style="text-align: left;"></td>
        <td style="text-align: center;"><button class="btn btn-red" style="padding: 2px 6px; font-size: 11px;" onclick="rimuoviLuppolo(\${idx})">✕</button></td>
      \`;
      tbody.appendChild(tr);
    });
  }

  function aggiungiLuppolo() {
    luppoli.push({ nome: "Nuovo Luppolo", ibu: 5, tempo: 10, aa: 5.0, fase: "Fine (10 min)" });
    renderLuppoli();
    calcolaTabella();
  }

  function rimuoviLuppolo(idx) {
    luppoli.splice(idx, 1);
    renderLuppoli();
    calcolaTabella();
  }

  function calcolaImpianto() {
    const sparge = parseFloat(document.getElementById('impSparge').value) || 80;
    const resSparge = parseFloat(document.getElementById('impResSparge').value) || 20;
    const spargeUsed = sparge - resSparge;
    document.getElementById('resSpargeUsed').textContent = spargeUsed.toFixed(1) + ' L';

    const mash = parseFloat(document.getElementById('impMash').value) || 39;
    const totPot = spargeUsed + mash;
    document.getElementById('resTotMashPot').textContent = totPot.toFixed(1) + ' L';

    const boil = parseFloat(document.getElementById('impBoil').value) || 63;
    const gKg = parseFloat(document.getElementById('impGrainsKg').value) || 15;
    const gRetention = gKg * 0.85;
    document.getElementById('resGrainRetention').textContent = gRetention.toFixed(2) + ' L';

    const deadSpace = totPot - boil - gRetention;
    document.getElementById('resDeadSpace').textContent = deadSpace.toFixed(2) + ' L';

    const postBoil = parseFloat(document.getElementById('impPostBoil').value) || 53;
    const evap = boil - postBoil;
    document.getElementById('resEvapLoss').textContent = evap.toFixed(1) + ' L';

    const inFerm = parseFloat(document.getElementById('impInFerm').value) || 51;
    const pipeLoss = postBoil - inFerm;
    document.getElementById('resPipeLoss').textContent = pipeLoss.toFixed(1) + ' L';
  }

  // ================= SALVATAGGIO & CARICAMENTO RICETTE =================
  function getRicetteSalvate() {
    try {
      return JSON.parse(localStorage.getItem('brewstation_recipes')) || {};
    } catch(e) {
      return {};
    }
  }

  function salvaRicetta() {
    const nome = document.getElementById('recipeNameInput').value.trim();
    if (!nome) {
      alert("Inserisci un nome per la ricetta prima di salvare!");
      return;
    }

    const dati = {
      nome: nome,
      stileNome: document.getElementById('headStyleName').value,
      stileCodice: document.getElementById('headStyleCode').value,
      ogPrev: document.getElementById('ogPrevisto').value,
      ogReal: document.getElementById('ogReale').value,
      litriFerm: document.getElementById('litriFermSelect').value,
      tolleranza: document.getElementById('tolleranzaInput').value,
      postBoilReal: document.getElementById('postBoilReale').value,
      lossBoil: document.getElementById('lossBoil').value,
      lossTransfer: document.getElementById('lossTransfer').value,
      lossFerm: document.getElementById('lossFerm').value,
      preBoilReal: document.getElementById('preBoilReale').value,
      ogPreBoilReal: document.getElementById('ogPreBoilReale').value,
      boilMinPrev: document.getElementById('boilMinPrev').value,
      boilMinReal: document.getElementById('boilMinReale').value,
      mashEffPrev: document.getElementById('mashEffPrev').value,
      mashEffReale: document.getElementById('mashEffReale').value,
      attVal: document.getElementById('attValInput').value,
      ibuPrev: document.getElementById('ibuPrev').value,
      ibuReal: document.getElementById('ibuReale').value,
      kgGraniReal: document.getElementById('kgGraniReale').value,
      litriPostFermReal: document.getElementById('litriPostFermReale').value,
      fgReal: document.getElementById('fgReale').value,
      yeastName: document.getElementById('yeastName').value,
      yeastSachetG: document.getElementById('yeastSachetG').value,
      yeastSachetN: document.getElementById('yeastSachetN').value,
      yeastAttText: document.getElementById('yeastAttText').value,
      yeastTempText: document.getElementById('yeastTempText').value,
      yeastFlocText: document.getElementById('yeastFlocText').value,
      yeastAromaText: document.getElementById('yeastAromaText').value,
      mashRatio: document.getElementById('mashRatio').value,
      primingSugarType: document.getElementById('primingSugarType').value,
      primingTemp: document.getElementById('primingTemp').value,
      primingCO2: document.getElementById('primingCO2').value,
      maltiBase: maltiBase,
      maltiSpec: maltiSpec,
      luppoli: luppoli,
      activeBJCP: activeBJCP
    };

    const ricette = getRicetteSalvate();
    ricette[nome] = dati;
    localStorage.setItem('brewstation_recipes', JSON.stringify(ricette));
    aggiornaSelectRicette();
    alert("Ricetta '" + nome + "' salvata con successo!");
  }

  function aggiornaSelectRicette() {
    const sel = document.getElementById('savedRecipesSelect');
    sel.innerHTML = '<option value="">-- Seleziona Ricetta --</option>';
    const ricette = getRicetteSalvate();
    for (const nome in ricette) {
      const opt = document.createElement('option');
      opt.value = nome;
      opt.textContent = nome;
      sel.appendChild(opt);
    }
  }

  function caricaRicettaSelezionata() {
    const nome = document.getElementById('savedRecipesSelect').value;
    if (!nome) return;
    const ricette = getRicetteSalvate();
    const d = ricette[nome];
    if (!d) return;

    document.getElementById('recipeNameInput').value = d.nome;
    document.getElementById('headStyleName').value = d.stileNome || '';
    document.getElementById('headStyleCode').value = d.stileCodice || '';
    document.getElementById('ogPrevisto').value = d.ogPrev || '';
    document.getElementById('ogReale').value = d.ogReal || '';
    document.getElementById('litriFermSelect').value = d.litriFerm || '75';
    document.getElementById('tolleranzaInput').value = d.tolleranza || '15%';
    document.getElementById('postBoilReale').value = d.postBoilReal || '';
    document.getElementById('lossBoil').value = d.lossBoil || '';
    document.getElementById('lossTransfer').value = d.lossTransfer || '';
    document.getElementById('lossFerm').value = d.lossFerm || '';
    document.getElementById('preBoilReale').value = d.preBoilReal || '';
    document.getElementById('ogPreBoilReale').value = d.ogPreBoilReal || '';
    document.getElementById('boilMinPrev').value = d.boilMinPrev || '';
    document.getElementById('boilMinReale').value = d.boilMinReal || '';
    document.getElementById('mashEffPrev').value = d.mashEffPrev || '';
    document.getElementById('mashEffReale').value = d.mashEffReale || '';
    document.getElementById('attValInput').value = d.attVal || '';
    document.getElementById('ibuPrev').value = d.ibuPrev || '';
    document.getElementById('ibuReale').value = d.ibuReal || '';
    document.getElementById('kgGraniReale').value = d.kgGraniReal || '';
    document.getElementById('litriPostFermReale').value = d.litriPostFermReal || '';
    document.getElementById('fgReale').value = d.fgReal || '';

    document.getElementById('yeastName').value = d.yeastName || '';
    document.getElementById('yeastSachetG').value = d.yeastSachetG || '';
    document.getElementById('yeastSachetN').value = d.yeastSachetN || '';
    document.getElementById('yeastAttText').value = d.yeastAttText || '';
    document.getElementById('yeastTempText').value = d.yeastTempText || '';
    document.getElementById('yeastFlocText').value = d.yeastFlocText || '';
    document.getElementById('yeastAromaText').value = d.yeastAromaText || '';

    document.getElementById('mashRatio').value = d.mashRatio || 3.0;
    document.getElementById('primingSugarType').value = d.primingSugarType || 'Destrosio';
    document.getElementById('primingTemp').value = d.primingTemp || 20;
    document.getElementById('primingCO2').value = d.primingCO2 || 2.2;

    maltiBase = d.maltiBase || [];
    maltiSpec = d.maltiSpec || [];
    luppoli = d.luppoli || [];

    if (d.activeBJCP) {
      activeBJCP = d.activeBJCP;
      document.getElementById('bjcpOG').textContent = activeBJCP.og;
      document.getElementById('bjcpFG').textContent = activeBJCP.fg;
      document.getElementById('bjcpIBU').textContent = activeBJCP.ibu;
      document.getElementById('bjcpSRM').textContent = activeBJCP.srm;
      document.getElementById('bjcpABV').textContent = activeBJCP.abv;
    } else {
      eliminaStileSelezionato();
    }

    renderMalti();
    renderLuppoli();
    calcolaTabella();
  }

  function eliminaRicetta() {
    const nome = document.getElementById('savedRecipesSelect').value;
    if (!nome) {
      alert("Seleziona una ricetta dall'elenco da eliminare!");
      return;
    }
    if (confirm("Vuoi davvero eliminare definitivamente la ricetta '" + nome + "'?")) {
      const ricette = getRicetteSalvate();
      delete ricette[nome];
      localStorage.setItem('brewstation_recipes', JSON.stringify(ricette));
      aggiornaSelectRicette();
      pulisciFoglio();
      alert("Ricetta eliminata!");
    }
  }

  // ================= INIZIALIZZAZIONE ALL'AVVIO =================
  popolaDatalist();
  aggiornaSelectRicette();
  pulisciFoglio();
  calcolaImpianto();
</script>
</body>
</html>`;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(htmlContent);
});

server.listen(PORT, () => {
  const url = 'http://localhost:' + PORT;
  console.log('BREWSTATION ATTIVO! In ascolto su: ' + url);
  const cmd = process.platform === 'win32' ? `start ${url}` :
              process.platform === 'darwin' ? `open ${url}` : `xdg-open ${url}`;
  exec(cmd);
});