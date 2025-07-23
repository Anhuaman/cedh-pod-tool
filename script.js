async function fetchCardImage(cardName) {
  try {
    const response = await fetch(`https://api.scryfall.com/cards/named?exact=${encodeURIComponent(cardName)}`);
    if (!response.ok) return null;
    const data = await response.json();
    return data.image_uris?.normal || data.card_faces?.[0]?.image_uris?.normal || null;
  } catch (e) {
    return null;
  }
}

async function randomizePod() {
  const input = document.getElementById('playerInput').value.trim();
  const lines = input.split('\n').filter(line => line.trim() !== '');
  if (lines.length < 4) {
    alert("Please enter at least 4 players.");
    return;
  }

  const shuffled = lines.sort(() => 0.5 - Math.random());
  const output = document.getElementById('output');
  output.innerHTML = '';

  const seatAdvice = [
    "You're going first – apply pressure and tempo.",
    "You're going second – balance between speed and interaction.",
    "You're going third – observe, then respond.",
    "You're going last – prioritize strong interaction and card advantage."
  ];

  const archetypeTips = {
    "Turbo": "Mull aggressively for fast mana and a win-con.",
    "Midrange": "Look for interaction and value engines.",
    "Stax": "Prioritize lock pieces and early plays.",
    "Unknown": "Keep a hand that does something by turn 2."
  };

  for (let i = 0; i < 4; i++) {
    const seatNum = i + 1;
    const [name, commanderRaw, archetypeRaw] = shuffled[i].split("–").map(s => s.trim());
    const commander = commanderRaw || "Unknown";
    const archetype = archetypeRaw || "Unknown";

    const imgURL = await fetchCardImage(commander) || "https://via.placeholder.com/223x310?text=Unknown";

    const advice = `${seatAdvice[i]} ${archetypeTips[archetype] || archetypeTips.Unknown}`;

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${imgURL}" alt="${commander}">
      <h3>Seat ${seatNum}: ${name}</h3>
      <p><strong>Commander:</strong> ${commander}</p>
      <p><strong>Archetype:</strong> ${archetype}</p>
      <p><em>${advice}</em></p>
    `;

    output.appendChild(card);
  }
}

