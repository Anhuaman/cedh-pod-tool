async function fetchCardImage(commanderName) {
  const apiUrl = `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(commanderName)}`;
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error();
    const data = await response.json();
    return data.image_uris?.normal || data.card_faces?.[0]?.image_uris?.normal || '';
  } catch (e) {
    return '';
  }
}

async function randomizePod() {
  const input = document.getElementById('input').value.trim();
  const lines = input.split('\n').filter(Boolean);
  const seats = lines.sort(() => 0.5 - Math.random()).slice(0, 4);

  const seatHtml = await Promise.all(seats.map(async (line, index) => {
    const [player, commanderStr, archetype] = line.split(/\s+—\s+/);
    const commanders = commanderStr.split(',').map(s => s.trim());
    const imageUrls = await Promise.all(commanders.map(fetchCardImage));
    const seatNum = index + 1;

    const advice = [
      "You're going first – apply pressure and tempo.",
      "You're going second – balance between speed and interaction.",
      "You're going third – observe, then respond.",
      "You're going last – prioritize strong interaction and card advantage."
    ][index];

    const archetypeAdvice = {
      Turbo: "Mull aggressively for fast mana and a win-con.",
      Midrange: "Look for interaction and value engines.",
      Stax: "Prioritize lock pieces and early plays."
    };

    return `
      <div class="card">
        ${imageUrls.map(url => `<img src="${url}" alt="${commanderStr}"/>`).join('')}
        <b>Seat ${seatNum}: ${player}</b>
        <b>Commander:</b> ${commanderStr}<br>
        <b>Archetype:</b> ${archetype}<br>
        <em>${advice} ${archetypeAdvice[archetype] || ''}</em>
      </div>
    `;
  }));

  document.getElementById('output').innerHTML = seatHtml.join('');
}
