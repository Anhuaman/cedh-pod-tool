const correctionMap = {
  "Thalia, Guardian": "Thalia, Guardian of Thraben",
  "Atraxa": "Atraxa, Praetors' Voice",
  "Kraum": "Kraum, Ludevic's Opus"
};

const fetchCardImage = async (name) => {
  const corrected = correctionMap[name] || name;
  const query = encodeURIComponent(corrected);
  const res = await fetch(`https://api.scryfall.com/cards/named?fuzzy=${query}`);
  const data = await res.json();
  return data.image_uris?.normal || data.card_faces?.[0]?.image_uris?.normal || "";
};

const archetypeTips = {
  Turbo: "Mull aggressively for fast mana and a win-con.",
  Midrange: "Look for interaction and value engines.",
  Stax: "Prioritize lock pieces and early plays.",
  Guardian: "Apply pressure and tempo.",
};

document.getElementById("randomizeButton").addEventListener("click", async () => {
  const input = document.getElementById("playerInput").value.trim();
  const lines = input.split("\n").filter(Boolean);
  const output = document.getElementById("output");
  output.innerHTML = "";

  const shuffled = lines.sort(() => Math.random() - 0.5);

  for (let i = 0; i < shuffled.length; i++) {
    const [name, commanderRaw, archetype] = shuffled[i].split(" — ");
    const commanders = commanderRaw.split(",").map(c => c.trim());
    const images = await Promise.all(commanders.map(fetchCardImage));

    const card = document.createElement("div");
    card.className = "card";

    const commanderList = commanders.join(", ");
    const seatNumber = i + 1;
    const turnOrder = ["first", "second", "third", "last"][i];

    card.innerHTML = `
      ${images.map(img => `<img src="${img}" alt="${commanderList}">`).join("")}
      <h2>Seat ${seatNumber}: ${name}</h2>
      <p><strong>Commander:</strong> ${commanderList}</p>
      <p><strong>Archetype:</strong> ${archetype}</p>
      <p class="tip">You're going ${turnOrder} – ${archetypeTips[archetype] || ""}</p>
    `;

    output.appendChild(card);
  }
});

