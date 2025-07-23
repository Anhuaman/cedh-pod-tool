function generatePod() {
  const input = document.getElementById("inputText").value.trim();
  const output = document.getElementById("output");
  output.innerHTML = "";

  const lines = input.split("\n").filter(line => line.includes("—"));

  lines.forEach((line, i) => {
    const parts = line.split("—").map(p => p.trim());
    if (parts.length < 3) return;

    const [name, commanderRaw, archetype] = parts;
    const seat = i + 1;

    const commanders = commanderRaw.split(",").map(c => c.trim());
    const commanderName = commanders.join(", ");

    const cardName = encodeURIComponent(commanderRaw.trim());
    const imageUrl = `https://api.scryfall.com/cards/named?exact=${cardName}`;

    const tip = getAdviceText(seat, archetype.trim());

    const cardDiv = document.createElement("div");
    cardDiv.className = "card";

    const img = document.createElement("img");
    img.alt = commanderName;

    // Load first image from Scryfall
    fetch(`https://api.scryfall.com/cards/named?exact=${encodeURIComponent(commanders[0])}`)
      .then(res => res.json())
      .then(data => {
        if (data.image_uris) {
          img.src = data.image_uris.normal;
        } else if (data.card_faces) {
          img.src = data.card_faces[0].image_uris.normal;
        } else {
          img.src = "";
        }
      }).catch(() => {
        img.src = "";
      });

    cardDiv.appendChild(img);

    cardDiv.innerHTML += `
      <h3>Seat ${seat}: ${name}</h3>
      <p><strong>Commander:</strong> ${commanderName}</p>
      <p><strong>Archetype:</strong> ${archetype}</p>
      <p><em>${tip}</em></p>
    `;

    output.appendChild(cardDiv);
  });
}

function getAdviceText(seat, archetype) {
  const tips = {
    Turbo: [
      "You're going first – apply pressure and tempo. Mull aggressively for fast mana and a win-con.",
      "You're going second – balance between speed and interaction. Mull aggressively for fast mana and a win-con.",
      "You're going third – observe, then respond. Mull aggressively for fast mana and a win-con.",
      "You're going last – prioritize strong interaction. Mull aggressively for fast mana and a win-con."
    ],
    Midrange: [
      "You're going first – apply pressure and tempo. Look for interaction and value engines.",
      "You're going second – balance between speed and interaction. Look for interaction and value engines.",
      "You're going third – observe, then respond. Look for interaction and value engines.",
      "You're going last – prioritize strong interaction and card advantage. Look for interaction and value engines."
    ],
    Stax: [
      "You're going first – prioritize lock pieces and early plays.",
      "You're going second – balance between speed and interaction. Prioritize lock pieces and early plays.",
      "You're going third – observe, then respond. Prioritize lock pieces and early plays.",
      "You're going last – prioritize strong interaction and card advantage. Prioritize lock pieces and early plays."
    ]
  };

  return tips[archetype]?.[seat - 1] || "";
}
