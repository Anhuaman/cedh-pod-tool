document.getElementById('randomizeBtn').addEventListener('click', () => {
  const input = document.getElementById('input').value.trim();
  if (!input) return;

  const lines = input.split('\n').filter(Boolean);
  const shuffled = lines.sort(() => 0.5 - Math.random());

  const seatOrder = ['first', 'second', 'third', 'last'];
  const seatTips = [
    'apply pressure and tempo',
    'balance between speed and interaction',
    'observe, then respond',
    'prioritize strong interaction and card advantage'
  ];

  const results = document.getElementById('results');
  results.innerHTML = '';

  shuffled.forEach((line, i) => {
    const match = line.match(/^(.+?)\s+—\s+(.+?)\s+—\s+(Turbo|Midrange|Stax)/i);
    if (!match) return;

    const [_, name, commanderRaw, archetype] = match;
    const seatNum = i + 1;
    const seat = seatOrder[i] || 'later';
    const tip = seatTips[i] || 'be flexible';

    const commanderNames = commanderRaw.split(/,\s*/);
    const imgQuery = commanderNames.length > 1
      ? commanderNames.map(c => `[[${c}]]`).join(' ') // Partner handling
      : commanderRaw;

    const cardImageURL = `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(commanderRaw)}`;

    fetch(cardImageURL)
      .then(res => res.json())
      .then(data => {
        const img = document.createElement('img');
        img.src = data.image_uris?.normal || '';

        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
          ${img.outerHTML}
          <h2>Seat ${seatNum}: ${name}</h2>
          <p><strong>Commander:</strong> ${commanderRaw}</p>
          <p><strong>Archetype:</strong> ${archetype}</p>
          <p><em>You’re going ${seat} – ${tip}.<br />
          General advice: Keep a hand that does something by turn 2.</em></p>
        `;
        results.appendChild(card);
      })
      .catch(() => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
          <h2>Seat ${seatNum}: ${name}</h2>
          <p><strong>Commander:</strong> ${commanderRaw}</p>
          <p><strong>Archetype:</strong> ${archetype}</p>
          <p><em>You’re going ${seat} – ${tip}.<br />
          General advice: Keep a hand that does something by turn 2.</em></p>
        `;
        results.appendChild(card);
      });
  });
});
