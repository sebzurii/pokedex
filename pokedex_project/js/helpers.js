// Shared state and helpers: fetching and caching, sprites, types, saving. No page-specific code here.

// ---------- Settings and shared state ----------

const API = "https://pokeapi.co/api/v2/";

let currentDex = "kanto";

let currentIndex = -1; // position in the current dex list (-1 = blank screen)
let currentList = []; // [{ num: dex number, id: national id }, ...]

// ---------- The entry on screen (sprites, shiny, cry) ----------
let showShiny = false;
let currentSprites = null;
let currentCry = null;

function updateSprite() {
  const img = document.getElementById("sprite");
  if (!currentSprites) return;
  const src = (showShiny && currentSprites.shiny) || currentSprites.normal;
  img.src = src || "";
  img.style.visibility = src ? "visible" : "hidden";
}

// ---------- Types ----------
const TYPE_COLORS = {
  normal: "#a8a878",
  fire: "#f08030",
  water: "#6890f0",
  electric: "#d8b010",
  grass: "#78c850",
  ice: "#68c8d0",
  fighting: "#c03028",
  poison: "#a040a0",
  ground: "#b89850",
  flying: "#8870d0",
  psychic: "#f85888",
  bug: "#a8b820",
  rock: "#a89030",
  ghost: "#705898",
  dragon: "#7038f8",
  dark: "#705848",
  steel: "#a0a0b8",
  fairy: "#ee99ac",
};

// Returns the current types
function getTypes(data) {
  return data.types.map((t) => t.type.name);
}

// ---------- Fetching: cache and preload ----------
const cache = {};
let requestCounter = 0;

// Fetch JSON once, then reuse it
function getJSON(url) {
  if (!cache[url]) {
    cache[url] = fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error("bad response");
        return r.json();
      })
      .catch((err) => {
        delete cache[url];
        throw err;
      });
  }
  return cache[url];
}

// Species number from a PokéAPI url
function speciesIdOf(url) {
  return Number(url.split("/").filter(Boolean).pop());
}

// All species numbers in a dex (range or API list)
async function getDexIds(dex) {
  if (dex.pokedex) {
    const d = await getJSON(API + "pokedex/" + dex.pokedex);
    return d.pokemon_entries.map((e) => speciesIdOf(e.pokemon_species.url));
  }
  const ids = [];
  for (let i = dex.start; i <= dex.end; i++) ids.push(i);
  return ids;
}

// Load a list entry: normal entries go via the species, form entries via the Pokémon name
function fetchEntryData(entry) {
  if (entry.pokemon) {
    return getJSON(API + "pokemon/" + entry.pokemon).then((data) =>
      getJSON(data.species.url).then((species) => ({ data, species })),
    );
  }
  return getJSON(API + "pokemon-species/" + entry.id).then((species) =>
    getJSON(species.varieties.find((v) => v.is_default).pokemon.url).then((data) => ({ data, species })),
  );
}

// Quietly load a Pokemon (data, species, sprites) before it's needed
function prefetch(index) {
  if (index < 0 || index >= currentList.length) return;
  const dex = DEXES[currentDex];
  fetchEntryData(currentList[index])
    .then(({ data }) => {
      const s = getSprites(data, dex);
      if (s.normal) new Image().src = s.normal;
      if (s.shiny) new Image().src = s.shiny;
    })
    .catch(() => {});
}

// ---------- Sprites ----------
// Pick still sprites only (never animated)
function getSprites(data, dex) {
  const s = data.sprites;
  const home = (s.other && s.other.home) || {};
  const still = (url, backup) => (url && !url.toLowerCase().endsWith(".gif") ? url : backup);

  if (dex.spriteSource === "home") {
    return { normal: home.front_default, shiny: home.front_shiny };
  }
  if (dex.spriteFallback) {
    return { normal: s.front_default, shiny: s.front_shiny };
  }

  const game = (s.versions[dex.spriteGen] || {})[dex.spriteVersion] || {};
  const gameShiny =
    (s.versions[dex.shinyGen || dex.spriteGen] || {})[dex.shinyVersion || dex.spriteVersion] || {};
  const backup = dex.homeFallback ? home : {};
  return {
    normal: still(game.front_default, backup.front_default),
    shiny: still(gameShiny.front_shiny, backup.front_shiny),
  };
}

// ---------- Remember where the user was ----------
function saveState() {
  try {
    const entry = currentList[currentIndex]; // undefined on a blank screen
    localStorage.setItem(
      "pokedexState",
      JSON.stringify({
        dex: currentDex,
        id: entry ? entry.pokemon || entry.id : null,
      }),
    );
  } catch (err) {} // storage unavailable: just skip
}
