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
  const button = document.getElementById("randomizeButton");
  const input = document.getElementById("playerInput");
  const output = document.getElementById("output");
  const container = document.getElementById("input-container");

  // Move button below input and center it
  const buttonWrapper = document.createElement("div");
  buttonWrapper.style.display = "flex";
  buttonWrapper.style.justifyContent = "center";
  buttonWrapper.style.marginTop = "10px";
  buttonWrapper.appendChild(button);
  container.appendChild(buttonWrapper);

  button.addEventListener("click", async () => {
    const lines = input.value.trim().split("\n").filter(Boolean);
    output.innerHTML = "";

    if (lines.length !== 4) {
      alert("Please enter exactly 4 players.");
      return;
    }

    const shuffled = lines.sort(() => Math.random() - 0.5);

    for (let i = 0; i < 4; i++) {
      const [name, commanderRaw, archetype] = shuffled[i].split(" — ");
      if (!name || !commanderRaw || !archetype) continue;

      const commanders = commanderRaw.split("and").map(c => c.trim());
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

  // Moxfield + Mulligan Section
  const moxfieldSection = document.createElement("div");
  moxfieldSection.innerHTML = `
    <h2>Moxfield Mulligan Tester</h2>
    <input type="text" id="deckUrl" placeholder="Paste Moxfield deck URL here">
    <button id="loadDeck">Load Deck</button>
    <button id="mulligan" disabled>Mulligan</button>
    <div id="hand"></div>
  `;
  document.body.appendChild(moxfieldSection);

  let deck = [];
  let currentHand = [];
  let mulliganCount = 0;

  document.getElementById("loadDeck").addEventListener("click", async () => {
    const url = document.getElementById("deckUrl").value.trim();
    const match = url.match(/moxfield\.com\/decks\/([a-zA-Z0-9]+)/);
    if (!match) {
      alert("Invalid Moxfield URL");
      return;
    }

    const id = match[1];
    const res = await fetch(`https://api2.moxfield.com/v2/decks/${id}`);
    const data = await res.json();
    const cards = data.mainboard;
    deck = [];

    for (const [scryId, info] of Object.entries(cards)) {
      for (let i = 0; i < info.quantity; i++) {
        deck.push(info.card.name);
      }
    }

    mulliganCount = 0;
    document.getElementById("mulligan").disabled = false;
    drawHand();
  });

  function drawHand() {
    const handSize = Math.max(0, 7 - mulliganCount);
    const shuffled = deck.sort(() => Math.random() - 0.5);
    currentHand = shuffled.slice(0, handSize);
    displayHand();
  }

  function displayHand() {
    const handDiv = document.getElementById("hand");
    handDiv.innerHTML = "<h3>Starting hand:</h3>";
    currentHand.forEach(async (cardName) => {
      const imgUrl = await fetchCardImage(cardName);
      const img = document.createElement("img");
      img.src = imgUrl;
      img.alt = cardName;
      img.className = "commander-img";
      handDiv.appendChild(img);
    });
  }

  document.getElementById("mulligan").addEventListener("click", () => {
    mulliganCount++;
    drawHand();
  });
    // Moxfield + Mulligan Section
const mulliganSection = document.createElement("section");
mulliganSection.style.marginTop = "40px";
mulliganSection.innerHTML = `
  <h2 style="text-align:center;">Moxfield Mulligan Tester</h2>
  <div style="display: flex; justify-content: center; margin-bottom: 10px;">
    <input type="text" id="deckUrl" placeholder="Paste Moxfield deck URL here" style="width: 60%; padding: 10px;" />
  </div>
  <div style="display: flex; justify-content: center; gap: 10px; margin-bottom: 20px;">
    <button id="loadDeck" class="btn-blue">Load Deck</button>
    <button id="mulligan" disabled>Mulligan</button>
  </div>
  <div id="hand" style="display:flex; flex-wrap:wrap; justify-content:center;"></div>
`;
document.body.appendChild(mulliganSection);

// Mulligan Logic
let deck = [];
let currentHand = [];
let mulliganCount = 0;

document.getElementById("loadDeck").addEventListener("click", async () => {
  const url = document.getElementById("deckUrl").value.trim();
  const match = url.match(/moxfield\.com\/decks\/([a-zA-Z0-9]+)/);
  if (!match) {
    alert("Invalid Moxfield URL");
    return;
  }

  const id = match[1];
  try {
    const res = await fetch(`https://api2.moxfield.com/v2/decks/${id}`);
    const data = await res.json();
    const cards = data.mainboard;
    deck = [];

    for (const [_, info] of Object.entries(cards)) {
      for (let i = 0; i < info.quantity; i++) {
        deck.push(info.card.name);
      }
    }

    mulliganCount = 0;
    document.getElementById("mulligan").disabled = false;
    drawHand();
  } catch (e) {
    alert("Failed to fetch deck. Please check the URL.");
  }
});

function drawHand() {
  const handSize = Math.max(0, 7 - mulliganCount);
  const shuffled = [...deck].sort(() => Math.random() - 0.5);
  currentHand = shuffled.slice(0, handSize);
  displayHand();
}

function displayHand() {
  const handDiv = document.getElementById("hand");
  handDiv.innerHTML = "<h3 style='width:100%; text-align:center;'>Starting hand:</h3>";
  currentHand.forEach(async (cardName) => {
    const imgUrl = await fetchCardImage(cardName);
    const img = document.createElement("img");
    img.src = imgUrl;
    img.alt = cardName;
    img.className = "commander-img";
    img.style.margin = "5px";
    handDiv.appendChild(img);
  });
}

document.getElementById("mulligan").addEventListener("click", () => {
  mulliganCount++;
  drawHand();
});

});
