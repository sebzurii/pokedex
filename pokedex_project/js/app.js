// The Pokedex itself: showing entries, searching, switching dexes, buttons, keyboard and startup. Loaded last.

// ---------- Page elements used in several places ----------
const search = document.getElementById("search");
const dexEl = document.querySelector(".dex");

// ---------- Blank screen ----------
function showPrompt(message) {
  document.querySelector(".screen").classList.add("blank");
  document.getElementById("sprite").style.visibility = "hidden";
  document.getElementById("dexno").textContent = "";
  document.getElementById("name").textContent = "";
  document.getElementById("species").textContent = "";
  document.getElementById("ht").textContent = "";
  document.getElementById("wt").textContent = "";
  document.getElementById("desc").textContent = message || "";
  document.getElementById("status").textContent = "POKeDEX";
  document.getElementById("types").innerHTML = "";
  currentSprites = null;
  showShiny = false;
  currentCry = null;
  document.getElementById("shiny").classList.remove("active");
}

// ---------- Look up a Pokemon ----------
// Show the entry at a position in the current dex list
async function openIndex(index) {
  const dex = DEXES[currentDex];
  const entry = currentList[index];
  if (!entry) return;
  const myRequest = ++requestCounter;

  try {
    const { data, species } = await fetchEntryData(entry);
    if (myRequest !== requestCounter) return;

    currentIndex = index;
    saveState();

    const genus = species.genera.find((g) => g.language.name === "en").genus;
    const category = genus.replace(" Pokémon", "").toUpperCase();

    const entries = species.flavor_text_entries.filter((e) => e.language.name === "en");
    let flavor;
    for (const v of dex.textVersions) {
      flavor = entries.find((e) => e.version.name === v);
      if (flavor) break;
    }
    flavor = flavor || (dex.modern ? entries[entries.length - 1] : entries[0]);
    const text = flavor.flavor_text.replace(/[\n\f]/g, " ");

    const totalInches = Math.round((data.height / 10) * 39.3701);
    const feet = Math.floor(totalInches / 12);
    const inches = String(totalInches % 12).padStart(2, "0");
    const pounds = ((data.weight / 10) * 2.20462).toFixed(1);

    currentSprites = getSprites(data, dex);
    currentCry = (data.cries && (data.cries.legacy || data.cries.latest)) || null;

    const number = String(entry.num).padStart(3, "0");
    document.querySelector(".screen").classList.remove("blank");
    updateSprite();
    document.getElementById("dexno").textContent = "No." + number;
    const label = (entry.pokemon ? entry.pokemon.replace(/-/g, " ") : species.name).toUpperCase();
    const nameEl = document.getElementById("name");
    nameEl.textContent = label;
    nameEl.style.fontSize = label.length > 16 ? "7px" : "";
    document.getElementById("species").textContent = category;
    document.getElementById("ht").textContent = feet + "'" + inches + '"';
    document.getElementById("wt").textContent = pounds + "lb";

    const typesBox = document.getElementById("types");
    typesBox.innerHTML = "";
    getTypes(data).forEach((t) => {
      const chip = document.createElement("span");
      chip.textContent = t.toUpperCase();
      chip.style.background = TYPE_COLORS[t];
      typesBox.appendChild(chip);
    });

    document.getElementById("desc").textContent = text;
    document.getElementById("status").textContent = "No." + number;

    prefetch(index + 1);
    prefetch(index - 1);
  } catch (err) {
    if (myRequest === requestCounter) showPrompt("Connection error. Check your internet.");
  }
}

// Search by dex number or by name
async function findPokemon(query) {
  const q = String(query).trim().toLowerCase();
  if (!q || !currentList.length) return;

  // A number means a number in THIS dex (Hoenn No.001 = Treecko)
  if (/^\d+$/.test(q)) {
    const index = currentList.findIndex((e) => e.num === Number(q));
    if (index === -1) {
      showPrompt("Not in this POKeDEX.");
      return;
    }
    openIndex(index);
    return;
  }

  // Forms dex: match form names, so "charizard" finds charizard-mega-x
  if (currentList[0] && currentList[0].pokemon) {
    const fq = q.replace(/\s+/g, "-");
    let index = currentList.findIndex((e) => e.pokemon === fq);
    if (index === -1) index = currentList.findIndex((e) => e.pokemon.includes(fq));
    if (index === -1) {
      showPrompt("Not in this POKeDEX.");
      return;
    }
    openIndex(index);
    return;
  }

  // A name: look up the species, then check it belongs to this dex
  const myRequest = ++requestCounter;
  try {
    const species = await getJSON(API + "pokemon-species/" + q);
    if (myRequest !== requestCounter) return;
    const index = currentList.findIndex((e) => e.id === species.id);
    if (index === -1) {
      showPrompt("Not in this POKeDEX.");
      return;
    }
    openIndex(index);
  } catch (err) {
    if (myRequest === requestCounter) showPrompt("No data found. Check the name or number.");
  }
}

// ---------- D-pad: stays inside the current dex ----------
function step(n) {
  if (!currentList.length) return;
  let next;
  if (currentIndex < 0) {
    next = 0; // blank screen: go to the first entry
  } else {
    next = Math.min(currentList.length - 1, Math.max(0, currentIndex + n));
  }
  openIndex(next);
}

// Row of buttons for regions that have more than one dex
function buildTabs(key) {
  const box = document.getElementById("dexTabs");
  box.innerHTML = "";
  const group = DEXES[key].group;
  const keys = Object.keys(DEXES).filter((k) => DEXES[k].group === group);
  if (!group || keys.length < 2) return; // single-dex regions show nothing

  keys.forEach((k) => {
    const b = document.createElement("button");
    b.textContent = DEXES[k].label;
    if (k === key) b.classList.add("active");
    b.addEventListener("click", () => setDex(k));
    box.appendChild(b);
  });
}

// ---------- Switching dex ----------
async function setDex(key) {
  const dex = DEXES[key];
  currentDex = key;
  currentIndex = -1;
  currentList = [];
  saveState();
  ++requestCounter;
  document.querySelector(".dex").dataset.theme = dex.theme || key;
  buildTabs(key);
  document.getElementById("sprite").style.imageRendering = dex.smooth ? "auto" : "pixelated";
  search.value = "";
  search.placeholder = dex.example;

  try {
    if (dex.forms) {
      // Alternate forms: filter the full Pokémon list by name
      showPrompt("Loading...");
      const all = await getJSON(API + "pokemon?limit=3000");
      if (currentDex !== key) return;
      currentList = all.results
        .map((p) => p.name)
        .filter((n) => dex.forms.some((f) => n.includes(f)))
        .filter((n) => !(dex.exclude || []).some((x) => n.includes(x)))
        .map((n, i) => ({ num: i + 1, pokemon: n }));
    } else if (dex.missing) {
      // Everything in the National Dex that no regional dex contains
      showPrompt("Working it out...");
      const national = await getDexIds({ pokedex: "national" });
      const lists = await Promise.all(
        Object.values(DEXES)
          .filter((d) => (d.pokedex || d.start) && d.pokedex !== "national")
          .map(getDexIds),
      );
      if (currentDex !== key) return;
      const covered = new Set(lists.flat());
      const ids = national.filter((id) => !covered.has(id)).sort((a, b) => a - b);
      console.log("Not in any regional dex:", JSON.stringify(ids));
      currentList = ids.map((id, i) => ({ num: i + 1, id }));
    } else if (dex.pokedex) {
      // Regional dex from the API
      showPrompt("Loading...");
      const d = await getJSON(API + "pokedex/" + dex.pokedex);
      if (currentDex !== key) return;
      currentList = d.pokemon_entries
        .map((e) => ({ num: e.entry_number, id: speciesIdOf(e.pokemon_species.url) }))
        .sort((a, b) => a.num - b.num);
    } else if (dex.ids) {
      // Hand-picked list
      dex.ids.forEach((id, i) => currentList.push({ num: i + 1, id }));
    } else {
      // Simple range (Kanto, Johto)
      for (let i = dex.start; i <= dex.end; i++) currentList.push({ num: i, id: i });
    }
  } catch (err) {
    showPrompt("Couldn't load this POKeDEX.");
    return;
  }
  showPrompt();
}

// ---------- Buttons ----------
document.getElementById("btn").addEventListener("click", () => findPokemon(search.value));
search.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    findPokemon(search.value);
    search.blur(); // hand the keyboard back to the arrow keys
  }
});

document.querySelectorAll("#keypad button").forEach((b) => {
  b.addEventListener("click", () => {
    search.value += b.textContent;
  });
});

document.getElementById("cry").addEventListener("click", () => {
  if (!currentCry) return; // nothing on screen yet
  const audio = new Audio(currentCry);
  audio.volume = 0.5;
  audio.play();
});

document.getElementById("clear").addEventListener("click", () => {
  search.value = "";
  currentIndex = -1;
  saveState();
  showPrompt();
});

document.getElementById("shiny").addEventListener("click", () => {
  if (!currentSprites) return; // nothing on screen yet
  showShiny = !showShiny;
  document.getElementById("shiny").classList.toggle("active", showShiny);
  updateSprite();
});

document.getElementById("random").addEventListener("click", () => {
  if (!currentList.length) return;
  openIndex(Math.floor(Math.random() * currentList.length));
});

document.getElementById("prev").addEventListener("click", () => step(-1));
document.getElementById("next").addEventListener("click", () => step(1));
document.getElementById("up").addEventListener("click", () => step(10));
document.getElementById("down").addEventListener("click", () => step(-10));

// ---------- Keyboard D-pad ----------
document.addEventListener("keydown", (e) => {
  if (document.getElementById("app").hidden) return; // title page is showing
  // Don't hijack the arrows while typing in the search box or using the dropdown
  const tag = document.activeElement.tagName;
  if (tag === "INPUT" || tag === "SELECT") return;

  switch (e.key) {
    case "ArrowLeft":
      step(-1);
      break;
    case "ArrowRight":
      step(1);
      break;
    case "ArrowUp":
      step(10);
      break;
    case "ArrowDown":
      step(-10);
      break;
    default:
      return; // ignore every other key
  }
  e.preventDefault(); // stop the page from scrolling
});

// ---------- Unova: light / dark screen ----------
document.querySelector(".lights").addEventListener("click", () => {
  if (dexEl.dataset.theme !== "unova") return; // the strip only works on Unova
  dexEl.classList.toggle("light-screen");
  try {
    localStorage.setItem("pokedexLight", dexEl.classList.contains("light-screen") ? "1" : "0");
  } catch (err) {}
});

async function init() {
  try {
    if (localStorage.getItem("pokedexLight") === "1") dexEl.classList.add("light-screen");
  } catch (err) {}

  let saved = {},
    view = "title";
  try {
    saved = JSON.parse(localStorage.getItem("pokedexState")) || {};
    view = localStorage.getItem("pokedexView") || "title";
  } catch (err) {}

  if (view === "app" && DEXES[saved.dex]) {
    await openRegion(saved.dex, saved.id); // refresh: back to the same dex and entry
  } else {
    showTitle(); // first visit, or the user left on the title page
  }
}
init();
