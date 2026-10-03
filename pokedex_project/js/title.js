// Title page: region cards, cycling icons, and moving between the title page and a Pokedex.

// ---------- Title page ----------
const REGIONS = [
  { key: "kanto", name: "Kanto", games: "Red, Blue, Yellow", icon: 133, color: "#f4b8bb", pokemon: "Eevee" },
  {
    key: "johto",
    name: "Johto",
    games: "Gold, Silver, Crystal",
    icon: 208,
    color: "#f0e0a0",
    pokemon: "Steelix",
  },
  {
    key: "hoenn",
    name: "Hoenn",
    games: "Ruby, Sapphire, Emerald",
    icon: 344,
    color: "#a8dcc0",
    pokemon: "Claydol",
  },
  {
    key: "sinnoh",
    name: "Sinnoh",
    games: "Diamond, Pearl, Platinum",
    icon: 411,
    color: "#b8cdf0",
    pokemon: "Bastiodon",
  },
  {
    key: "unovaBW",
    name: "Unova",
    games: "Black/Black2, White/White2",
    icon: 635,
    color: "#cfd2d8",
    pokemon: "Hydreigon",
  },
  { key: "kalosCentral", name: "Kalos", games: "X, Y", icon: 658, color: "#b5e0f0", pokemon: "Greninja" },
  {
    key: "alola",
    name: "Alola",
    games: "Ultra Sun, Ultra Moon",
    icon: 778,
    color: "#f8d0a0",
    pokemon: "Mimikyu",
  },
  {
    key: "galar",
    name: "Galar",
    games: "Sword, Shield",
    icon: 823,
    color: "#c4d8f4",
    pokemon: "Corviknight",
  },
  {
    key: "paldea",
    name: "Paldea",
    games: "Scarlet, Violet",
    icon: 959,
    color: "#d4c0f0",
    pokemon: "Tinkaton",
  },
];

const SPR = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/";

// Which Pokémon each card can show (the generation that introduced them)
const RANGE = {
  kanto: [1, 151],
  johto: [152, 251],
  hoenn: [252, 386],
  sinnoh: [387, 493],
  unovaBW: [494, 649],
  kalosCentral: [650, 721],
  alola: [722, 807],
  galar: [810, 898],
  paldea: [906, 1025],
};

// Build the nine cards
REGIONS.forEach((r) => {
  const card = document.createElement("button");
  card.className = "region";
  card.innerHTML = `
    <div class="icon" style="background:${r.color}"><img src="${SPR}${r.icon}.png" alt="${r.pokemon}"></div>
    <div class="name">${r.name.toUpperCase()}</div>
    <div class="games">${r.games}</div>`;
  card.addEventListener("click", () => openRegion(r.key));
  document.getElementById("regions").appendChild(card);
  r.img = card.querySelector("img");
  r.current = r.icon;
});

// National and Other buttons
document.querySelectorAll(".title-links button").forEach((b) => {
  b.addEventListener("click", () => openRegion(b.dataset.dex));
});

document.getElementById("back").addEventListener("click", showTitle);

// ---------- Cycling icons ----------
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let iconTimer = null;

function cycleIcon(r) {
  const [lo, hi] = RANGE[r.key];
  let id;
  do {
    id = lo + Math.floor(Math.random() * (hi - lo + 1));
  } while (id === r.current);

  // Load the next sprite first so the card never flashes empty
  const loader = new Image();
  loader.onload = () => {
    r.current = id;
    r.img.src = loader.src;
    r.img.alt = "A Pokémon from " + r.name;
  };
  loader.src = SPR + id + ".png";
}

function startIcons() {
  stopIcons();
  if (reduceMotion) return; // respect "reduce motion" settings
  iconTimer = setInterval(() => {
    const order = REGIONS.slice(); // copy, so the card list itself stays put
    for (let i = order.length - 1; i > 0; i--) {
      // Fisher-Yates shuffle
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    order.forEach((r, i) => setTimeout(() => cycleIcon(r), i * 150));
  }, 1500);
}

function stopIcons() {
  clearInterval(iconTimer);
  iconTimer = null;
}

// Pause while the tab is hidden
document.addEventListener("visibilitychange", () => {
  if (document.hidden) stopIcons();
  else if (!document.getElementById("title").hidden) startIcons();
});

function showTitle() {
  document.getElementById("app").hidden = true;
  document.getElementById("title").hidden = false;
  startIcons();
  try {
    localStorage.setItem("pokedexView", "title");
  } catch (err) {}
  window.scrollTo(0, 0);
}

async function openRegion(key, id) {
  if (!DEXES[key]) return;
  document.getElementById("title").hidden = true;
  stopIcons();
  document.getElementById("app").hidden = false;
  try {
    localStorage.setItem("pokedexView", "app");
  } catch (err) {}
  await setDex(key);
  if (id) {
    const index = currentList.findIndex((e) => (e.pokemon || e.id) === id);
    if (index !== -1) openIndex(index);
  }
}
