function generatePod() {
  const input = document.getElementById("playerInput").value.trim().split("\n");
  let players = input.map(line => {
    const parts = line.split(" – ");
    const name = parts[0]?.trim();
    const archetype = parts[2]?.trim() || "Unknown";
    const commander = parts[1]?.trim();

    return {
      name,
      commander,
      archetype
    };
  });

  if (players.length < 4) {
    alert("Enter at least 4 players.");
    return;
  }

  shuffle(players);

  const output = document.getElementById("output");
  output.innerHTML = "";

  players.slice(0, 4).forEach((p, index) => {
    const cardName = encodeURIComponent(p.commander);
    const imgURL = `https://api.scryfall.com/cards/named?exact=${cardName}`;

    const card = document.createElement("div");
    card.className = "card";

    const img = document.createElement("img");
    img.src = `https://cards.scryfall.io/normal/front/0/0/00000000-0000-0000-0000-000000000000.jpg`; // default placeholder
    img.alt = p.commander;

    // Try to get actual image from Scryfall API
    fetch(imgURL)
      .then(res => res.json())
      .then(data => {
        if (data.image_uris && data.image_uris.normal) {
          img.src = data.image_uris.normal;
        }
      });

    const seat = index + 1;
    const seatAdvice = getSeatAdvice(seat, p.archetype);

    card.innerHTML = `
      <div class="card-img">${img.outerHTML}</div>
      <h3>Seat ${seat}: ${p.name} – ${p.commander}</h3>
      <p><strong>Commander:</strong> ${p.commander || "Unknown"}</p>
      <p><strong>Archetype:</strong> ${p.archetype}</p>
      <p><em>${seatAdvice}</em></p>
    `;

    output.appendChild(card);
  });
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function getSeatAdvice(seat, archetype) {
  const tips = {
    "Turbo": "Mull aggressively for fast mana and a win-con.",
    "Midrange": "Look for interaction and value engines.",
    "Stax": "Prioritize lock pieces and early plays.",
    "Unknown": "General advice: Keep a hand that does something by turn 2."
  };

  const seatTips = {
    1: "You're going first – apply pressure and tempo.",
    2: "You're going second – balance between speed and interaction.",
    3: "You're going third – observe, then respond.",
    4: "You're going last – prioritize strong interaction and card advantage."
  };

  return `${seatTips[seat]} ${tips[archetype] || tips["Unknown"]}`;
}

