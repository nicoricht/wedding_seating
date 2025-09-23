function writeWindow(w, msg) {
  const html = `<!DOCTYPE html>
<html lang="de"><head><meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Sitzplatz</title>
<style>
  html,body{height:100%;margin:0}
  body{display:grid;place-items:center;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif}
  .card{max-width:min(90vw,560px);padding:2rem;border-radius:16px;box-shadow:0 20px 80px rgba(0,0,0,.15)}
  .ok{background:#f5f5f5;color:#111}
  h1{margin:0 0 .75rem;font-size:clamp(1.4rem,4vw,2rem)}
  p{margin:0;font-size:clamp(1rem,3vw,1.2rem)}
  button{margin-top:1rem;padding:.8rem 1.2rem;border-radius:12px;border:0;font-weight:600;cursor:pointer}
</style></head>
<body>
  <div class="card ok">
    <h1>Sitzplatz</h1>
    <p>${msg}</p>
    <button onclick="window.close()">Fenster schließen</button>
  </div>
</body></html>`;
  w.document.open(); w.document.write(html); w.document.close();
}

// Meldung auf Basis der API-Antwort bauen
function seatMessage(data, rawName) {
  if (!data || !data.seat) {
    return 'Leider wurde kein Sitzplatz gefunden.';
  }
  // data.seat kann z. B. eine Tischnummer oder ein Objekt sein
  const table = (typeof data.seat === 'object')
    ? (data.seat.table ?? data.seat.tisch ?? data.seat.Table ?? data.seat.Tisch ?? data.seat)
    : data.seat;

  // Optional: den gematchten Namen zeigen (falls vom Server geliefert)
  const who = data.matchedName ? ` (${data.matchedName})` : '';
  return `Dein Sitzplatz findest du an Tisch ${table}.${who}`;
}

async function querySeat(name) {
  const url = `/api/seat?name=${encodeURIComponent(name)}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('API-Fehler');
  return res.json();
}

function normalizeInput(value) {
  // Trim & mehrere Leerzeichen zu einem
  return value.trim().replace(/\s+/g, ' ');
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('searchForm');
  const input = document.getElementById('nameInput');
  const scanBtn = document.getElementById('scanBtn'); // optional vorhanden

  // Submit-Handler
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Popup SOFORT öffnen (User-Geste), damit kein Popup-Blocker greift
    const popup = window.open('', 'sitzplatz', 'width=520,height=360,noopener');
    if (!popup) {
      alert('Bitte Pop-ups im Browser erlauben.');
      return;
    }
    writeWindow(popup, 'Lade deinen Sitzplatz …');

    const raw = normalizeInput(input.value);
    if (!raw) {
      writeWindow(popup, 'Bitte einen Vor- und Nachnamen eingeben.');
      return;
    }

    try {
      const data = await querySeat(raw);
      writeWindow(popup, seatMessage(data, raw));
    } catch (err) {
      console.error(err);
      writeWindow(popup, 'Fehler beim Abrufen der Daten. Bitte später erneut versuchen.');
    }
  });

  // Enter im Input -> Submit
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      form.requestSubmit();
    }
  });

  // Optionaler Scan-Button (Platzhalter)
  if (scanBtn) {
    scanBtn.addEventListener('click', () => {
      alert('Scan-Funktion (QR/Barcode) ist als Platzhalter vorhanden.');
    });
  }

  // Optional: ?name=Vorname%20Nachname per URL vorbelegen und auto-suchen
  const params = new URLSearchParams(window.location.search);
  const prefill = params.get('name');
  if (prefill) {
    input.value = prefill;
    form.requestSubmit();
  }
});