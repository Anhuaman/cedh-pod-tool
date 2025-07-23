// script.js

const fetchCardImageUrl = async (commanderNames) => {
  const query = commanderNames.map(name => `name:"${name}"`).join(" or ");
  const response = await fetch(`https://api.scryfall.com/cards/search?q=${encodeURIComponent(query)}`);
  const data = await response.json();

  if (!data.data || data.data.length === 0) return null;

  // If partners, stitch the first two images side-by-side
  if (commanderNames.length === 2) {
    return commanderNames.map(name => {
      const found = data.data.find(card => card.name === name);
      return found?.image_uris?.normal || null;
    });
  }

  const card = data.data.find(c => c.name === commanderNames[0]);
  return card?.image_uris?.normal || null;
};

const getMulliganTip = (seat, archetype) => {
  const seatAdvice = [
    "You're going first – apply pressure and tempo.",
    "You're going second – balance between speed and interaction.",
    "You're going third – observe, then respond.",
    "You're going last – prioritize strong interaction and card advantage."
  ];

  const tips = {
    Turbo: "Mull aggressively for fast mana and a win-con.",
    Midrange: "Look for interaction and value engines.",
    Stax: "Prioritize lock pieces and early plays."
  };

  return `${seatAdvice[seat]} ${tips[archetype] || ""}`;
};

const parsePlayerData = (input) => {
  return input.trim().split("\n").map((line) => {
    const [name, rest] = line.split(" — ");
    const parts = rest.split(/,\s*(?![^()]*\))/); // Handles commas not inside parentheses
    const last = parts.pop();
    const commander = parts.join(", ").trim();
    const archetype = last.trim();
    return { name: name.trim(), commander, archetype };
  });
};

const renderCard = (player, seatIndex, imageUrls) => {
  const container = document.createElement("div");
  container.className = "player-card";

  const imageContainer = document.createElement("div");
  imageContainer.className = "image-container";

  if (Array.isArray(imageUrls)) {
    imageUrls.forEach(url => {
      const img = document.createElement("img");
      img.src = url || "https://via.placeholder.com/223x310?text=Unknown";
      imageContainer.appendChild(img);
    });
  } else {
    const img = document.createElement("img");
    img.src = imageUrls || "https://via.placeholder.com/223x310?text=Unknown";
    imageContainer.appendChild(img);
  }

  const title = document.createElement("h2");
  title.innerText = `Seat ${seatIndex + 1}: ${player.name}`;

  const commander = document.createElement("p");
  commander.innerHTML = `<strong>Commander:</strong> ${player.commander}`;

  const archetype = document.createElement("p");
  archetype.innerHTML = `<strong>Archetype:</strong> ${player.archetype}`;

  const advice = document.createElement("p");
  advice.className = "tip";
  advice.innerText = getMulliganTip(seatIndex, player.archetype);

  container.appendChild(imageContainer);
  container.appendChild(title);
  container.appendChild(commander);
  container.appendChild(archetype);
  container.appendChild(advice);

  return container;
};

const randomizeSeats = (players) => {
  const shuffled = [...players];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const handleRandomize = async () => {
  const input = document.getElementById("playerInput").value;
  const players = parsePlayerData(input);
  const randomized = randomizeSeats(players);
  const output = document.getElementById("output");
  output.innerHTML = "";

  for (let i = 0; i < randomized.length; i++) {
    const player = randomized[i];
    const commanderNames = player.commander.includes(",")
      ? player.commander.split(",").map(c => c.trim())
      : [player.commander.trim()];

    const imageUrls = await fetchCardImageUrl(commanderNames);
    const card = renderCard(player, i, imageUrls);
    output.appendChild(card);
  }
};

document.getElementById("randomizeButton").addEventListener("click", handleRandomize);
