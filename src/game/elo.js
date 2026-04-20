const STORAGE_KEY = 'krizic_players_v1';
const DEFAULT_RATING = 1200;
const K = 32;

export function loadPlayers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return (parsed && typeof parsed === 'object') ? parsed : {};
  } catch { return {}; }
}

function savePlayers(players) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(players));
}

function key(name) { return name.trim().toLocaleLowerCase('hr'); }

export function ensurePlayer(name) {
  const players = loadPlayers();
  const k = key(name);
  if (!players[k]) {
    players[k] = { id: k, name: name.trim(), rating: DEFAULT_RATING, games: 0, wins: 0, losses: 0, draws: 0, updatedAt: Date.now() };
  } else {
    players[k].name = name.trim();
  }
  savePlayers(players);
  return players[k];
}

export function getPlayerRating(name) { return ensurePlayer(name).rating; }

export function expectedScore(rA, rB) { return 1 / (1 + 10 ** ((rB - rA) / 400)); }

/** scoreP1: 1 = P1 wins, 0 = P2 wins, 0.5 = draw */
export function updateRatings(p1name, p2name, scoreP1) {
  const players = loadPlayers();
  const k1 = key(p1name), k2 = key(p2name);
  ensurePlayer(p1name); ensurePlayer(p2name);
  const reloaded = loadPlayers();
  const a = reloaded[k1], b = reloaded[k2];

  const exp = expectedScore(a.rating, b.rating);
  const d1  = Math.round(K * (scoreP1 - exp));

  a.rating = Math.max(100, a.rating + d1);
  b.rating = Math.max(100, b.rating - d1);
  a.games++; b.games++;

  if      (scoreP1 === 1)   { a.wins++; b.losses++; }
  else if (scoreP1 === 0)   { a.losses++; b.wins++; }
  else                      { a.draws++; b.draws++; }

  a.updatedAt = b.updatedAt = Date.now();
  savePlayers({ ...reloaded, [k1]: a, [k2]: b });
  return { delta1: d1, delta2: -d1, rating1: a.rating, rating2: b.rating };
}

export function fmtDelta(d) { return d >= 0 ? `+${d}` : `${d}`; }
export function getAllPlayers() {
  return Object.values(loadPlayers()).sort((a, b) => b.rating - a.rating || b.wins - a.wins);
}
