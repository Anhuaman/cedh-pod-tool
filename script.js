const fetchCardImage = async (name) => {
  const query = encodeURIComponent(name);
  const response = await fetch(`https://api.scryfall.com/cards/named?fuzzy=${query}`);
  const data = await response.json();
  return data.image_uris?.normal || data.card_faces?.[0]?.image_uris?.normal || "";
};

const archetypeTips = {
  Turbo: "Mull aggressively for fast mana and a win-con.",
  Midrange: "Look for interaction and value engines.",
  Stax: "Prioritize lock pieces and early plays."
};

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("randomizeButton").addEventListener("click", async () => {
    const input = document.getElementById("playerInput").value.trim();
    const lines = input.split("\n").filter(Boolean);
    const output = document.getElementById("output");
    output.innerHTML = "";

    if (lines.length !== 4) {
      alert("Please enter exactly 4 players.");
      return;
    }

    const shuffled = lines;
    for (let i = 0; i < 4; i++) {
      const [name, commanderRaw, archetype] = shuffled[i].split(" — ");
      if (!name || !commanderRaw || !archetype) continue;

      // Handles "and" with or without commas and extra spacing
      const commanders = commanderRaw
        .split(/\s+and\s+/i)
        .map(c => c.replace(/^,|,$/g, '').trim())
        .filter(Boolean);

      const images = await Promise.all(commanders.map(fetchCardImage));

      const card = document.createElement("div");
      card.className = `card seat-${i + 1}`;

      const title = `<h2>Seat ${i + 1}: ${name}</h2>`;
      const cmd = `<p><strong>Commander:</strong> ${commanders.join(", ")}</p>`;
      const arch = `<p><strong>Archetype:</strong> ${archetype}</p>`;
      const tip = `<p class="tip">You're going ${["first","second","third","last"][i]} – ${archetypeTips[archetype] || ""}</p>`;
      const imageHTML = images.map(img => `<img src="${img}" alt="commander image" class="commander-img">`).join("");

      card.innerHTML = `${imageHTML}${title}${cmd}${arch}${tip}`;
      output.appendChild(card);
    }
  });
});


