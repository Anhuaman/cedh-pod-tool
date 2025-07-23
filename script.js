const fetchCardImage = async (name) => {
  try {
    const query = encodeURIComponent(name);
    const response = await fetch(`https://api.scryfall.com/cards/named?fuzzy=${query}`);
    const data = await response.json();
    return data.image_uris?.normal || data.card_faces?.[0]?.image_uris?.normal || "https://via.placeholder.com/150?text=Card+Not+Found";
  } catch (e) {
    console.error(`Failed to fetch image for ${name}:`, e);
    return "https://via.placeholder.com/150?text=Card+Not+Found";
  }
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

  // Center the randomize button
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
      const tip = `<p class="tip">You're going ${["first", "second", "third", "last"][i]} – ${archetypeTips[archetype] || "No specific mulligan tips."}</p>`;
      const imageHTML = images.map(img => `<img src="${img}" alt="commander image" class="commander-img">`).join("");

      card.innerHTML = `${imageHTML}${title}${cmd}${arch}${tip}`;
      output.appendChild(card);
    }
  });

  // Create mulligan section
  const mulliganSection = document.createElement("section");
  mulliganSection.id = "moxfield-section";
  mulliganSection.innerHTML = `
    <h2>Moxfield Mulligan Tester</h2>
    <div style="display: flex; justify-content: center; margin-bottom: 10px;">
      <input type="text" id="deckUrl" placeholder="Paste Moxfield deck URL here" />
    </div>
    <div class="mulligan-controls">
      <button id="loadDeck" class="btn-blue">Load Deck</button>
      <button id="mulligan" class="btn-blue" disabled>Mulligan</button>
    </div>
    <div id="hand"></div>
  `;
  document.body.appendChild(mulliganSection);

  let deck = [];
  let currentHand = [];
  let mulliganCount = 0;

  document.getElementById("loadDeck").addEventListener("click", async () => {
    const url = document.getElementById("deckUrl").value.trim();
    const match = url.match(/moxfield\.com\/decks\/([a-zA-Z0-9_-]+)/);
    if (!match) {
      alert("Invalid Moxfield URL. Please use a valid URL like https://www.moxfield.com/decks/DECK_ID");
      return;
    }

    const id = match[1];
    try {
      // Primary proxy with timeout
      const proxyUrl = "https://crossorigin.me/";
      const targetUrl = `https://api2.moxfield.com/v2/decks/${id}`;
      console.log("Fetching deck from:", `${proxyUrl}${targetUrl}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
      const res = await fetch(`${proxyUrl}${targetUrl}`, {
        signal: controller.signal,
        headers: {
          "Accept": "application/json",
          "User-Agent": "cEDH-Pod-Randomizer/1.0"
        }
      });
      clearTimeout(timeoutId);

      // Check Content-Type to ensure JSON response
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const errorText = await res.text();
        console.error(`Invalid response: Content-Type=${contentType}`, errorText);
        alert(`Invalid response: Expected JSON but received ${contentType || "unknown"}. Details: ${errorText.slice(0, 200)}...`);
        return;
      }

      if (!res.ok) {
        const errorText = await res.text();
        alert(`Failed to fetch deck: ${res.status} ${res.statusText}. Ensure the URL is correct and the deck is public. Details: ${errorText.slice(0, 200)}...`);
        console.error(`Fetch failed: ${res.status} ${res.statusText}`, errorText);
        return;
      }

      const data = await res.json();
      console.log("API response:", data);
      if (!data.mainboard) {
        alert("No mainboard data found. The deck may be empty or inaccessible.");
        console.error("API response missing mainboard:", data);
        return;
      }

      const cards = data.mainboard;
      deck = [];

      for (const [_, info] of Object.entries(cards)) {
        for (let i = 0; i < info.quantity; i++) {
          deck.push(info.card.name);
        }
      }

      mulliganCount = 0; // Reset mulligan count
      document.getElementById("mulligan").disabled = false;
      drawHand();
    } catch (e) {
      alert("Failed to fetch deck. Please check the URL, ensure the deck is public, or try again later. Error: " + e.message);
      console.error("Fetch error:", e.message, e);
    }
  });

  function drawHand() {
    const handSize = Math.max(3, 7 - mulliganCount); // Minimum hand size of 3
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    currentHand = shuffled.slice(0, handSize);
    displayHand();
  }

  async function displayHand() {
    const handDiv = document.getElementById("hand");
    handDiv.innerHTML = "<h3>Starting hand:</h3>";
    const imagePromises = currentHand.map(async (cardName) => {
      const imgUrl = await fetchCardImage(cardName);
      return { imgUrl, cardName };
    });
    const images = await Promise.all(imagePromises);
    images.forEach(({ imgUrl, cardName }) => {
      const img = document.createElement("img");
      img.src = imgUrl;
      img.alt = cardName;
      img.className = "commander-img";
      img.style.height = "250px"; // Match CSS #hand img
      img.style.borderRadius = "8px";
      img.style.boxShadow = "0 0 8px rgba(255,255,255,0.2)";
      img.style.margin = "6px"; // Half of gap for consistent spacing
      handDiv.appendChild(img);
    });
  }

  document.getElementById("mulligan").addEventListener("click", () => {
    mulliganCount++;
    drawHand();
  });
});
