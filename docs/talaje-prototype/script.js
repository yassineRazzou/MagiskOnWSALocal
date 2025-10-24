const suits = [
  { symbol: '♠', color: 'black', name: 'Spades' },
  { symbol: '♥', color: 'red', name: 'Hearts' },
  { symbol: '♦', color: 'red', name: 'Diamonds' },
  { symbol: '♣', color: 'black', name: 'Clubs' }
];

const ranks = [
  { label: 'A', value: 11 },
  { label: '2', value: 2 },
  { label: '3', value: 3 },
  { label: '4', value: 4 },
  { label: '5', value: 5 },
  { label: '6', value: 6 },
  { label: '7', value: 7 },
  { label: '8', value: 8 },
  { label: '9', value: 9 },
  { label: '10', value: 10 },
  { label: 'J', value: 10 },
  { label: 'Q', value: 10 },
  { label: 'K', value: 10 }
];

const seatOrder = ['player', 'opponent-right', 'partner', 'opponent-left'];

const seatLabels = {
  player: 'You',
  partner: 'Samira',
  'opponent-left': 'Youssef',
  'opponent-right': 'Imane'
};

const state = {
  deck: [],
  hands: {
    player: [],
    partner: [],
    'opponent-left': [],
    'opponent-right': []
  },
  discard: [],
  indicator: null,
  jokers: [],
  activeSeat: 'player',
  dealer: 'player'
};

function generateDeck() {
  const deck = [];
  for (let d = 0; d < 2; d += 1) {
    for (const suit of suits) {
      for (const rank of ranks) {
        deck.push({ ...rank, suit: suit.symbol, color: suit.color, suitName: suit.name });
      }
    }
  }
  return deck;
}

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function createCardElement(card, options = {}) {
  const cardEl = document.createElement('div');
  cardEl.className = 'card';
  if (options.faceDown) {
    cardEl.classList.add('face-down');
    return cardEl;
  }

  cardEl.classList.add(card.color);

  if (options.isJoker) {
    cardEl.classList.add('joker');
  }

  const top = document.createElement('div');
  top.className = 'rank';
  top.textContent = card.label;

  const middle = document.createElement('div');
  middle.className = 'suit';
  middle.textContent = card.suit;

  const bottom = document.createElement('div');
  bottom.className = 'rank';
  bottom.textContent = card.label;

  cardEl.append(top, middle, bottom);
  return cardEl;
}

function drawCard(seat, count) {
  const cards = state.deck.splice(0, count);
  state.hands[seat].push(...cards);
}

function dealHands() {
  state.deck = shuffle(generateDeck());
  for (const seat of seatOrder) {
    state.hands[seat] = [];
  }
  state.discard = [];
  state.indicator = null;
  state.jokers = [];

  for (const seat of seatOrder) {
    const count = seat === state.dealer ? 15 : 14;
    drawCard(seat, count);
  }

  state.indicator = state.deck.shift();
  const discardStarter = state.deck.shift();
  state.discard.push(discardStarter);
  state.activeSeat = state.dealer;

  updateJokers();
  renderAll();
  playSound('sfx-deal');
}

function updateJokers() {
  if (!state.indicator) return;
  const indicatorIsRed = ['♥', '♦'].includes(state.indicator.suit);
  const jokerColor = indicatorIsRed ? 'black' : 'red';
  const jokerText = jokerColor === 'black' ? 'Black 2s are Jokers' : 'Red 2s are Jokers';
  document.getElementById('joker-info').textContent = jokerText;
}

function renderAll() {
  renderHands();
  renderPiles();
  renderIndicator();
  updateActiveSeat();
  updateHUD();
}

function renderHands() {
  for (const seat of Object.keys(state.hands)) {
    const container = document.querySelector(`[data-hand="${seat}"]`);
    container.innerHTML = '';
    const isPlayer = seat === 'player';
    const isPartner = seat === 'partner';
    const jokers = getJokerIdentifiers();

    state.hands[seat].forEach((card, index) => {
      const isJoker = jokers.some((j) => j.label === card.label && j.color === card.color);
      const cardEl = createCardElement(card, {
        faceDown: !isPlayer && !isPartner,
        isJoker
      });

      if (!isPlayer && !isPartner) {
        cardEl.style.transform = `translateY(${index * 2}px)`;
      }

      if (isPartner) {
        cardEl.classList.add('face-down');
        cardEl.style.opacity = 0.8;
      }

      container.appendChild(cardEl);
    });
  }
}

function renderPiles() {
  const stockStack = document.getElementById('stock-stack');
  const stockCount = document.getElementById('stock-count');
  const discardStack = document.getElementById('discard-stack');
  const discardCount = document.getElementById('discard-count');

  stockStack.innerHTML = '';
  discardStack.innerHTML = '';

  const stockLength = state.deck.length;
  stockCount.textContent = `${stockLength} card${stockLength === 1 ? '' : 's'}`;

  for (let i = 0; i < Math.min(3, stockLength); i += 1) {
    const cardEl = document.createElement('div');
    cardEl.className = 'card face-down';
    cardEl.style.transform = `translate(${i * 2}px, ${-i * 2}px)`;
    stockStack.appendChild(cardEl);
  }

  const topDiscard = state.discard[state.discard.length - 1];
  if (topDiscard) {
    const cardEl = createCardElement(topDiscard, { isJoker: isJokerCard(topDiscard) });
    cardEl.style.transform = 'rotate(-6deg)';
    discardStack.appendChild(cardEl);
  }
  discardCount.textContent = `${state.discard.length} card${state.discard.length === 1 ? '' : 's'}`;
}

function renderIndicator() {
  const indicatorEl = document.getElementById('indicator-card');
  indicatorEl.innerHTML = '';
  if (!state.indicator) {
    indicatorEl.textContent = '--';
    return;
  }
  const cardEl = createCardElement(state.indicator, { isJoker: isJokerCard(state.indicator) });
  indicatorEl.appendChild(cardEl);
}

function updateActiveSeat() {
  document.querySelectorAll('.player-seat').forEach((seat) => {
    seat.classList.remove('active');
  });
  const seatSection = document.querySelector(`.player-seat[data-seat="${state.activeSeat}"]`);
  if (seatSection) {
    seatSection.classList.add('active');
  }
}

function updateHUD() {
  const dealerLabel = document.getElementById('dealer-label');
  const teamLabel = document.getElementById('team-label');
  dealerLabel.textContent = seatLabels[state.dealer];
  const friendlyTeam = `${seatLabels.player} & ${seatLabels.partner}`;
  const rivalTeam = `${seatLabels['opponent-left']} & ${seatLabels['opponent-right']}`;
  const isFriendlyTurn = state.activeSeat === 'player' || state.activeSeat === 'partner';
  teamLabel.textContent = isFriendlyTurn ? friendlyTeam : rivalTeam;
}

function rotateTurn() {
  const currentIndex = seatOrder.indexOf(state.activeSeat);
  const nextIndex = (currentIndex + 1) % seatOrder.length;
  state.activeSeat = seatOrder[nextIndex];
  updateActiveSeat();
  updateHUD();
}

function autoSortPlayerHand() {
  const orderMap = ranks.reduce((acc, rank, index) => {
    acc[rank.label] = index;
    return acc;
  }, {});

  state.hands.player.sort((a, b) => {
    if (a.suit === b.suit) {
      return orderMap[a.label] - orderMap[b.label];
    }
    return a.suit.localeCompare(b.suit);
  });
  renderHands();
  playSound('sfx-flip');
}

function getJokerIdentifiers() {
  if (!state.indicator) return [];
  const indicatorIsRed = ['♥', '♦'].includes(state.indicator.suit);
  const jokerColor = indicatorIsRed ? 'black' : 'red';
  return [{ label: '2', color: jokerColor }];
}

function isJokerCard(card) {
  return getJokerIdentifiers().some(
    (joker) => joker.label === card.label && joker.color === card.color
  );
}

function playSound(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.currentTime = 0;
  el.volume = 0.35;
  el.play().catch(() => {
    /* ignored: autoplay restrictions */
  });
}

function attachControls() {
  document.querySelector('[data-action="deal"]').addEventListener('click', dealHands);
  document.querySelector('[data-action="new"]').addEventListener('click', () => {
    state.activeSeat = 'player';
    const nextDealerIndex = (seatOrder.indexOf(state.dealer) + 1) % seatOrder.length;
    state.dealer = seatOrder[nextDealerIndex];
    state.deck = [];
    for (const seat of seatOrder) {
      state.hands[seat] = [];
    }
    state.discard = [];
    state.indicator = null;
    state.jokers = [];
    renderAll();
  });
  document.querySelector('[data-action="sort"]').addEventListener('click', autoSortPlayerHand);
  document.querySelector('[data-action="end"]').addEventListener('click', rotateTurn);
}

function prepareInitialLayout() {
  renderAll();
}

attachControls();
prepareInitialLayout();
