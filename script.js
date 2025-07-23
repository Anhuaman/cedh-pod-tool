// Get references to DOM elements
const input = document.getElementById("playerInput");
const randomizeBtn = document.getElementById("randomizeBtn");
const outputDiv = document.getElementById("output");

// Get Scryfall image URL
function getScryfallImage(commanderName) {
  const encodedName = encodeURIComponent(commanderName);
  return `https://api.scryfall.com/cards/named?exact=${encodedName}`;
}

// Parse one line of input
function parsePlayerLine(line) {
  const parts = line.split("–").map(p => p.trim());
  if (parts.length !== 3) return null;
  const player = parts[0];
  const archetype = parts[2];
  const commanderText = parts[1];
  const commanderNames = commanderText.split(/,\s*/); // support partners
  return {
    player,
    commanders: commanderNames,
    archetype
  };
}

// Tips by seat
function getMulliganTip(seat, archetype) {
  const tips = [
    `You're going first – apply pressure and tempo. ${archetype.includes("Turbo") ? "Mull aggressively for fast mana and a win-con." : "Look for interaction and value engines."}`,
    `You're going second – balance between speed and interaction. ${archetype.includes("Turbo") ? "Mull aggressively for fast mana and a win-con." : "Look for interaction and value engines."}`,
    `You're going third – observe, then respond. ${archetype.includes("Turbo") ? "Mull aggressively for fast mana and a win-con." : "Look for interaction and value engines."}`,
    `You're going last – prioritize strong interaction and card advantage. ${archetype.includes("Turbo") ? "Mull aggressively for fast mana and a win-con." : "Prioritize lock pieces and early plays."}`
  ];
  return tips[seat - 1];
}

// Render a single player
function createCommanderHTML(player, seat) {
  const commanderImages = player.commanders.map(name => {
    return `<img src="https://api.scryfall.com/cards/named?exact=${encodeURIComponent(name)}" alt="${name}" class="commander-image" onerror="this.onerror=null; this.src='https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg'">`;
  }).join('');

  return `
    <div class="card">
      <div class="commander-images">${commanderImages}</div>
      <h3>Seat ${seat}: ${player.player}</h3>
      <p><strong>Commander:</strong> ${player.commanders.join(", ")}</p>
      <p><strong>Archetype:</strong> ${player.archetype}</p>
      <p class="tip"><em>${getMulliganTip(seat, player.archetype)}</em></p>
    </div>
  `;
}

// Main randomize function
function randomizePod() {
  const lines = input.value.trim().split("\n").filter(line => line.trim() !== "");
  const players = lines.map(parsePlayerLine).filter(p => p !== null);
  const shuffled = players.sort(() => Math.random() - 0.5);
  outputDiv.innerHTML = shuffled.map((p, i) => createCommanderHTML(p, i + 1)).join('');
}

// Event listener
randomizeBtn.addEventListener("click", randomizePod);

