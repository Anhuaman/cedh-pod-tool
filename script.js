function generatePod() {
  const input = document.getElementById("playerInput").value.trim().split("\n");
  let players = input.map(line => {
    const parts = line.split(" - ");
    return {
      name: parts[0]?.trim(),
      commander: parts[1]?.trim() || "Unknown",
      archetype: parts[2]?.trim() || "Unknown"
    };
  });

  if (players.length < 4) {
    alert("Enter at least 4 players with name, commander, and archetype.");
    return;
  }

  shuffle(players);

  let output = "";
  players.slice(0, 4).forEach((p, index) => {
    const imgUrl = `https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(p.commander)}&format=image`;
    output += `
      <div class="card">
        <img src="${imgUrl}" alt="${p.commander}" style="width:100%; border-radius: 6px; margin-bottom: 10px;">
        <h3>Seat ${index + 1}: ${p.name}</h3>
        <p><strong>Commander:</strong> ${p.commander}</p>
        <p><strong>Archetype:</strong> ${p.archetype}</p>
        <p>${getSeatAdvice(index + 1, p.archetype)}</p>
      </div>`;
  });

  document.getElementById("output").innerHTML = output;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function getSeatAdvice(seat, archetype) {
  let tips = {
    "Turbo": "Mull aggressively for fast mana and a win-con.",
    "Midrange": "Look for interaction and value engines.",
    "Stax": "Prioritize lock pieces and early plays.",
    "Unknown": "General advice: Keep a hand that does something by turn 2."
  };

  let seatTips = {
    1: "You're going first – apply pressure and tempo.",
    2: "You're going second – balance between speed and interaction.",
    3: "You're going third – observe, then respond.",
    4: "You're going last – prioritize strong interaction and card advantage."
  };

  return `<em>${seatTips[seat]} ${tips[archetype] || tips["Unknown"]}</em>`;
}
