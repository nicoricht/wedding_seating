// ---------- script.js ----------

async function querySeat(name) {
  const url = `/api/seat?name=${encodeURIComponent(name)}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('API-Fehler');
  return res.json();
}

function normalizeInput(value) {
  return value.trim().replace(/\s+/g, ' ');
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('searchForm');
  const input = document.getElementById('nameInput');
  const resultDiv = document.getElementById('result');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const raw = normalizeInput(input.value);
    if (!raw) {
      resultDiv.textContent = '❗ Bitte einen Vor- und Nachnamen eingeben.';
      return;
    }

    resultDiv.textContent = '⏳ Suche läuft …';

    try {
      const data = await querySeat(raw);

      if (data && data.seat) {
        const table = (typeof data.seat === 'object')
          ? (data.seat.table ?? data.seat.tisch ?? data.seat)
          : data.seat;

        resultDiv.textContent = `✅ Dein Sitzplatz findest du an Tisch ${table}.`;
      } else {
        resultDiv.textContent = '❌ Leider wurde kein Sitzplatz gefunden.';
      }
    } catch (err) {
      console.error(err);
      resultDiv.textContent = '⚠️ Fehler beim Abrufen der Daten.';
    }
  });
});
