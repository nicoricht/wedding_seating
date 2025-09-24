// ---------- script.js ----------

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("searchForm");
  const input = document.getElementById("nameInput");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = input.value.trim();
    if (!name) {
      alert("Bitte einen Vor- und Nachnamen eingeben.");
      return;
    }

    try {
      const res = await fetch(`/api/seat?name=${encodeURIComponent(name)}`, { cache: "no-store" });
      if (!res.ok) throw new Error("API-Fehler");
      const data = await res.json();

      if (data && data.seat) {
        // guests.json liefert z. B. "Tischnummer: 2"
        const seatText = (typeof data.seat === "string")
          ? data.seat
          : (data.seat.table ?? data.seat.tisch ?? data.seat); // Fallback, falls mal ein Objekt kommt
        alert(`Dein Sitzplatz\n${seatText}`);
      } else {
        alert("Leider wurde kein Sitzplatz gefunden.");
      }
    } catch (err) {
      console.error(err);
      alert("Fehler beim Abrufen der Daten. Bitte später erneut versuchen.");
    }
  });
});
