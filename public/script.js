function findSeat() {
  const name = document.getElementById("nameInput").value;
  fetch(`/api/seat?name=${encodeURIComponent(name)}`)
    .then(res => res.json())
    .then(data => {
      const resultDiv = document.getElementById("result");
      if (data.seat) {
        resultDiv.innerText = `Dein Sitzplatz: ${data.seat}`;
      } else {
        resultDiv.innerText = "Name nicht gefunden. Bitte versuche es erneut.";
      }
    });
}
