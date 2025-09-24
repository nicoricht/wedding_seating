// ---------- public/script.js ----------
document.addEventListener("DOMContentLoaded", () => {
  const form  = document.getElementById("searchForm");
  const input = document.getElementById("nameInput");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = input.value.trim();
    if (!name) {
      alert("Bitte Vor- und Nachnamen eingeben.");
      return;
    }

    try {
      // Wenn Frontend und Server auf gleichem Host/Port laufen:
      const res  = await fetch(`/api/seat?name=${encodeURIComponent(name)}`, { cache: "no-store" });
      // Wenn dein HTML auf anderem Port/Host läuft, nutze z. B.:
      // const res = await fetch(`http://localhost:3000/api/seat?name=${encodeURIComponent(name)}`);

      if (!res.ok) throw new Error("API-Fehler");
      const data = await res.json();

      if (data && data.seat) {
        const seatText = (typeof data.seat === "string")
          ? data.seat                    // z. B. "Tischnummer: 2"
          : (data.seat.table ?? data.seat.tisch ?? data.seat);

        alert(`Dein Sitzplatz\n${seatText}`);
      } else {
        alert("Leider wurde kein Sitzplatz gefunden.");
      }
    } catch (err) {
      console.error(err);
      alert("Fehler beim Abrufen. Läuft der Server?");
    }
  });
});
