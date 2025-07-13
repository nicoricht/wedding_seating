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

// Statische Dateien aus /public bereitstellen
app.use(express.static(path.join(__dirname, "public")));

// Startseite aus /views
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "main_page.html"));
});

// API-Endpunkt
app.get("/api/seat", (req, res) => {
  const name = req.query.name;
  const seat = guestData[name];
  res.json({ seat: seat || null });
});

// Server starten
app.listen(PORT, () => {
  console.log(`✅ Server läuft unter http://localhost:${PORT}`);
});
