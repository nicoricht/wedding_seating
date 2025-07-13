const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");

const PORT = process.env.PORT || 3000;

// Gäste-Daten laden
const guestFilePath = path.join(__dirname, "data", "guests.json");
let guestData = {};
if (fs.existsSync(guestFilePath)) {
  guestData = JSON.parse(fs.readFileSync(guestFilePath, "utf-8"));
} else {
  console.error("Gästeliste nicht gefunden.");
}

// Hilfsfunktion: Levenshtein-Distanz berechnen
function levenshteinDistance(a, b) {
  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1).toLowerCase() === a.charAt(j - 1).toLowerCase()) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,    // löschen
          matrix[i][j - 1] + 1,    // einfügen
          matrix[i - 1][j - 1] + 1 // ersetzen
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

// Statische Dateien aus /public bereitstellen
app.use(express.static(path.join(__dirname, "public")));

// Startseite aus /views
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "main_page.html"));
});

// API-Endpunkt mit Fuzzy Matching
app.get("/api/seat", (req, res) => {
  const inputName = req.query.name;

  if (!inputName) {
    return res.json({ seat: null });
  }

  // Fuzzy Suche: Nächsten passenden Namen finden
  let bestMatch = null;
  let bestDistance = Infinity;

  for (const guestName of Object.keys(guestData)) {
    const dist = levenshteinDistance(inputName.trim(), guestName.trim());
    if (dist < bestDistance) {
      bestDistance = dist;
      bestMatch = guestName;
    }
  }

  // Toleranzgrenze für Fehler (z.B. maximal 3 Fehler)
  if (bestDistance <= 3) {
    res.json({ seat: guestData[bestMatch], matchedName: bestMatch, distance: bestDistance });
  } else {
    res.json({ seat: null });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server läuft unter http://localhost:${PORT}`);
});
