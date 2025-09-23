<script>
  // === Konfiguration ===
  const GUESTS_JSON_URL = '/data/guests.json'; // Pfad zur JSON-Datei

  // Cache für Gästedaten, damit nur einmal geladen wird
  let GUESTS = null;

  // --- Hilfsfunktionen ---
  function stripDiacritics(str){
    return str.normalize('NFD').replace(/\p{Diacritic}/gu, '');
  }
  function normalizeName(name){
    if(!name) return '';
    return stripDiacritics(name).trim().toLowerCase().replace(/\s+/g,' ');
  }

  // Extrahiert die Tischnummer/Table aus beliebigen Eintragsformaten
  function extractTable(entry){
    if(!entry) return null;
    if(typeof entry === 'string' || typeof entry === 'number') return String(entry);
    if(typeof entry === 'object'){
      return entry.table ?? entry.tisch ?? entry.Table ?? entry.Tisch ?? null;
    }
    return null;
  }

  // guests.json laden und in Map<normalisierterName, Tisch> überführen
  async function loadGuests(){
    if(GUESTS) return GUESTS;
    const res = await fetch(GUESTS_JSON_URL, {cache:'no-store'});
    if(!res.ok) throw new Error('Gästeliste konnte nicht geladen werden');
    const data = await res.json();

    const map = new Map();

    if(Array.isArray(data)){
      // Erwartet z. B. [{ "name":"Max Mustermann", "table":"3" }, ...]
      for(const item of data){
        const n = normalizeName(item?.name ?? item?.Name ?? item?.guest ?? item?.Gast);
        const t = extractTable(item);
        if(n && t != null) map.set(n, String(t));
      }
    } else if (data && typeof data === 'object'){
      // Entweder {"Max Mustermann":"3", ...} oder {"guests":[...]} / {"Gäste":[...]}
      if(Array.isArray(data.guests) || Array.isArray(data.Gäste)){
        const arr = data.guests ?? data.Gäste;
        for(const item of arr){
          const n = normalizeName(item?.name ?? item?.Name ?? item?.guest ?? item?.Gast);
          const t = extractTable(item);
          if(n && t != null) map.set(n, String(t));
        }
      } else {
        for(const [key, val] of Object.entries(data)){
          const n = normalizeName(key);
          const t = extractTable(val);
          if(n && t != null) map.set(n, String(t));
        }
      }
    }
    GUESTS = map;
    return map;
  }

  function openSeatWindow(table){
    const w = window.open('', 'sitzplatz', 'width=520,height=360,noopener');
    const msg = table ? `Dein Sitzplatz findest du an Tisch ${table}.` : 'Leider wurde kein Sitzplatz gefunden.';

    if(!w){
      // Pop-up blockiert – Fallback
      alert(msg);
      return;
    }

    const html = `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Sitzplatz</title>
<style>
  html,body{height:100%;margin:0}
  body{display:grid;place-items:center;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif}
  .card{max-width: min(90vw, 560px); padding: 2rem; border-radius: 16px; box-shadow: 0 20px 80px rgba(0,0,0,.15);}
  .ok{background:#f5f5f5;color:#111}
  h1{margin:0 0 .75rem 0; font-size: clamp(1.4rem, 4vw, 2rem)}
  p{margin:0; font-size: clamp(1rem, 3vw, 1.2rem)}
  button{margin-top:1rem; padding:.8rem 1.2rem; border-radius:12px; border:0; font-weight:600; cursor:pointer}
</style>
</head>
<body>
  <div class="card ok">
    <h1>Sitzplatz</h1>
    <p>${msg}</p>
    <button onclick="window.close()">Fenster schließen</button>
  </div>
</body>
</html>`;
    w.document.open();
    w.document.write(html);
    w.document.close();
  }

  async function handleSearch(e){
    e.preventDefault();
    const input = document.getElementById('nameInput');
    const raw = input.value;
    const norm = normalizeName(raw);
    if(!norm){
      openSeatWindow(null);
      return;
    }
    try{
      const map = await loadGuests();
      const table = map.get(norm) ?? null;
      openSeatWindow(table);
    }catch(err){
      console.error(err);
      alert('Fehler beim Laden der Gästeliste. Bitte später erneut versuchen.');
    }
  }

  document.getElementById('searchForm').addEventListener('submit', handleSearch);
</script>

