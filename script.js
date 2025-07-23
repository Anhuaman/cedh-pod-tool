<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>cEDH Pod Randomizer + Mulligan Tips</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <h1>cEDH Pod Randomizer + Mulligan Tips</h1>
  <textarea id="playerInput" rows="6" placeholder="Enter players in format: Name – Commander – Archetype"></textarea>
  <button onclick="generatePod()">Randomize Pod</button>
  <div id="output" class="pod-grid"></div>

  <script>
    async function fetchCardImage(cardName) {
      const response = await fetch(`https://api.scryfall.com/cards/named?exact=${encodeURIComponent(cardName)}`);
      if (!response.ok) return null;
      const data = await response.json();
      return data.image_uris?.normal || data.card_faces?.[0]?.image_uris?.normal || null;
    }

    async function generatePod() {
      const input = document.getElementById("playerInput").value.trim().split("\n");
      let players = input.map(line => {
        const parts = line.split(" - ");
        return {
          name: parts[0]?.trim(),
          commander: parts[1]?.trim() || "Unknown",
          archetype: parts[2]?.trim() || "Unknown"
        };
      });

      if (players.length < 4) {
        alert("Enter at least 4 players.");
        return;
      }

      shuffle(players);

      const seats = [
        "You're going first – apply pressure and tempo.",
        "You're going second – balance between speed and interaction.",
        "You're going third – observe, then respond.",
        "You're going last – prioritize strong interaction and card advantage."
      ];

      const tips = {
        "Turbo": "Mull aggressively for fast mana and a win-con.",
        "Midrange": "Look for interaction and value engines.",
        "Stax": "Prioritize lock pieces and early plays.",
        "Unknown": "General advice: Keep a hand that does something by turn 2."
      };

      let outputHTML = "";

      for (let i = 0; i < 4; i++) {
        const p = players[i];
        const imageUrl = await fetchCardImage(p.commander) || "https://via.placeholder.com/223x310?text=Unknown";
        outputHTML += `
          <div class="card">
            <img src="${imageUrl}" alt="${p.commander}" />
            <h3>Seat ${i + 1}: ${p.name} – ${p.commander}</h3>
            <p><strong>Commander:</strong> ${p.commander}</p>
            <p><strong>Archetype:</strong> ${p.archetype}</p>
            <p><em>${seats[i]} ${tips[p.archetype] || tips.Unknown}</em></p>
          </div>
        `;
      }

      document.getElementById("output").innerHTML = outputHTML;
    }

    function shuffle(arr) {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    }
  </script>
</body>
</html>
