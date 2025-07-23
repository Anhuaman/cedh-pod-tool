// Fetch commander image from Scryfall API
async function fetchCardImages(commanderText) {
  const names = commanderText.split(',').map(name => name.trim()).filter(Boolean);
  const imageUrls = [];

  for (let name of names) {
    try {
      const response = await fetch(`https://api.scryfall.com/cards/named?exact=${encodeURIComponent(name)}`);
      if (!response.ok) continue;
      const data = await response.json();
      const img = data.image_uris?.normal || data.card_faces?.[0]?.image_uris?.normal;
      if (img) imageUrls.push(img);
    } catch (e) {
      console.error(`Failed to fetch card: ${name}`);
    }
  }

  return imageUrls.length > 0 ? imageUrls : ["https://via.placeholder.com/223x310?text=Not+Found"];
}

// Randomize and display pod
async function randomizePod() {
  const input = document.getElementById('playerInput').value.trim();
  const lines = input.split('\n').filter(line => line.trim() !== '');
  if (lines.length < 4) {
    alert("Please enter at least 4 players in the format: Name – Commander – Archetype");
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
    const images = await fetchCardImages(commander);
    const advice = `${seatAdvice[i]} ${archetypeTips[archetype] || archetypeTips.Unknown}`;

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <div style="display:flex; justify-content:center; gap:6px;">
        ${images.map(url => `<img src="${url}" style="width:110px; border-radius:6px;">`).join('')}
      </div>
      <h3>Seat ${seatNum}: ${name}</h3>
      <p><strong>Commander:</strong> ${commander}</p>
      <p><strong>Archetype:</strong> ${archetype}</p>
      <p><em>${advice}</em></p>
    `;

    output.appendChild(card);
  }
}

