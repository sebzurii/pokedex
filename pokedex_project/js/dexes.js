// Every Pokedex in one list. To add a dex, add an entry here (and a theme in css/themes/ if it needs its own look).
// Settings: start/end = simple range, pokedex = list from PokeAPI, ids = hand-picked, forms = filter by name,
// missing = species in no regional dex. theme = look to use, group = region heading, smooth = no pixel scaling.

// prettier-ignore
const DEXES = {
  kanto: {
    label: "Red / Blue / Yellow", group: "Kanto",
    start: 1, end: 151,
    spriteGen: "generation-i", spriteVersion: "red-blue",
    textVersions: ["red", "blue", "yellow"],
    example: "e.g. bulbasaur",
    shinyGen: "generation-ii", shinyVersion: "crystal",
  },

  johto: {
    label: "Gold / Silver / Crystal", group: "Johto",
    start: 152, end: 251,
    spriteGen: "generation-ii", spriteVersion: "crystal",
    textVersions: ["crystal", "gold", "silver"],
    example: "e.g. chikorita",
    shinyGen: "generation-ii", shinyVersion: "crystal",
  },

  hoenn: {
    label: "Ruby / Sapphire / Emerald", group: "Hoenn",
    pokedex: "hoenn",
    spriteGen: "generation-iii", spriteVersion: "emerald",
    shinyGen: "generation-iii", shinyVersion: "emerald",
    textVersions: ["emerald", "ruby", "sapphire"],
    example: "e.g. treecko"
  },

  sinnoh: {
    label: "Diamond / Pearl / Platinum", group: "Sinnoh",
    pokedex: "extended-sinnoh",
    spriteGen: "generation-iv", spriteVersion: "platinum",
    shinyGen: "generation-iv", shinyVersion: "platinum",
    textVersions: ["platinum", "diamond", "pearl"],
    example: "e.g. turtwig"
  },

  unovaBW: {
    label: "Black / White", group: "Unova", theme: "unova",
    pokedex: "original-unova",
    spriteGen: "generation-v", spriteVersion: "black-white",
    textVersions: ["black", "white"],
    example: "e.g. snivy"
  },

  unovaB2W2: {
    label: "Black 2 / White 2", group: "Unova", theme: "unova",
    pokedex: "updated-unova",
    spriteGen: "generation-v", spriteVersion: "black-white",
    textVersions: ["black-2", "white-2"],
    example: "e.g. snivy"
  },

  kalosCentral: {
    label: "Kalos Central", group: "Kalos", theme: "kalos",
    pokedex: "kalos-central",
    spriteGen: "generation-vi", spriteVersion: "x-y", smooth: true, modern: true,
    textVersions: ["x", "y"],
    example: "e.g. chespin"
  },

  kalosCoastal: {
    label: "Kalos Coastal", group: "Kalos", theme: "kalos",
    pokedex: "kalos-coastal",
    spriteGen: "generation-vi", spriteVersion: "x-y", smooth: true, modern: true,
    textVersions: ["x", "y"],
    example: "e.g. skiddo"
  },

  kalosMountain: {
    label: "Kalos Mountain", group: "Kalos", theme: "kalos",
    pokedex: "kalos-mountain",
    spriteGen: "generation-vi", spriteVersion: "x-y", smooth: true, modern: true,
    textVersions: ["x", "y"],
    example: "e.g. gible"
  },

  alola: {
    label: "Ultra Sun / Ultra Moon", group: "Alola", theme: "alola",
    pokedex: "updated-alola",
    spriteGen: "generation-vii", spriteVersion: "ultra-sun-ultra-moon", smooth: true, modern: true,
    textVersions: ["ultra-sun", "ultra-moon"],
    example: "e.g. rowlet"
  },

  galar: {
    label: "Sword / Shield", group: "Galar", theme: "galar",
    pokedex: "galar",
    spriteSource: "home", smooth: true, modern: true,
    textVersions: ["sword", "shield"],
    example: "e.g. grookey"
  },

  isleOfArmor: {
    label: "Isle of Armor", group: "Galar", theme: "galar",
    pokedex: "isle-of-armor",
    spriteSource: "home", smooth: true, modern: true,
    textVersions: ["sword", "shield"],
    example: "e.g. kubfu"
  },

  crownTundra: {
    label: "Crown Tundra", group: "Galar", theme: "galar",
    pokedex: "crown-tundra",
    spriteSource: "home", smooth: true, modern: true,
    textVersions: ["sword", "shield"],
    example: "e.g. regieleki"
  },

  paldea: {
    label: "Scarlet / Violet", group: "Paldea", theme: "paldea",
    pokedex: "paldea",
    spriteSource: "home", smooth: true, modern: true,
    textVersions: ["scarlet", "violet"],
    example: "e.g. sprigatito"
  },

  kitakami: {
    label: "Kitakami", group: "Paldea", theme: "paldea",
    pokedex: "kitakami",
    spriteSource: "home", smooth: true, modern: true,
    textVersions: ["scarlet", "violet"],
    example: "e.g. dipplin"
  },

  blueberry: {
    label: "Blueberry", group: "Paldea", theme: "paldea",
    pokedex: "blueberry",
    spriteSource: "home", smooth: true, modern: true,
    textVersions: ["scarlet", "violet"],
    example: "e.g. ogerpon"
  },

  megas: {
    label: "Mega Evolutions & Primals", group: "Other", theme: "other",
    forms: ["-mega", "-primal"],
    spriteGen: "generation-vi", spriteVersion: "x-y", homeFallback: true, smooth: true, modern: true,
    textVersions: ["x", "y", "omega-ruby", "alpha-sapphire"],
    example: "e.g. charizard"
  },

  alolanForms: {
    label: "Alolan Forms", group: "Other", theme: "other",
    forms: ["-alola"], exclude: ["-totem", "-cap"],
    spriteGen: "generation-vii", spriteVersion: "ultra-sun-ultra-moon", homeFallback: true, smooth: true, modern: true,
    textVersions: ["ultra-sun", "ultra-moon"],
    example: "e.g. vulpix"
  },

  galarianForms: {
    label: "Galarian Forms", group: "Other", theme: "other",
    forms: ["-galar"],
    spriteSource: "home", smooth: true, modern: true,
    textVersions: ["sword", "shield"],
    example: "e.g. meowth"
  },

  hisuianForms: {
    label: "Hisuian Forms", group: "Other", theme: "other",
    forms: ["-hisui"],
    spriteSource: "home", smooth: true, modern: true,
    textVersions: ["legends-arceus"],
    example: "e.g. growlithe"
  },

  paldeanForms: {
    label: "Paldean Forms", group: "Other", theme: "other",
    forms: ["-paldea"],
    spriteSource: "home", smooth: true, modern: true,
    textVersions: ["scarlet", "violet"],
    example: "e.g. tauros"
  },

  gigantamax: {
    label: "Gigantamax & Eternamax", group: "Other", theme: "other",
    forms: ["-gmax", "-eternamax"],
    spriteSource: "home", smooth: true, modern: true,
    textVersions: ["sword", "shield"],
    example: "e.g. charizard"
  },

  specialForms: {
    label: "Legendary & Special Forms", group: "Other", theme: "other",
    forms: ["deoxys-", "rotom-", "giratina-", "shaymin-", "kyurem-", "hoopa-", "necrozma-",
      "calyrex-", "zacian-", "zamazenta-", "urshifu-", "ogerpon-", "terapagos-",
      "tornadus-", "thundurus-", "landorus-", "enamorus-", "keldeo-", "meloetta-"],
    spriteSource: "home", smooth: true, modern: true,
    textVersions: [],
    example: "e.g. rotom"
  },

  other: {
    label: "Event & Special Pokémon", group: "Other", theme: "other",
    ids: [385, 386, 489, 490, 491, 492, 493, 647, 648, 649],
    spriteFallback: true, smooth: true, modern: true,
    textVersions: [],
    example: "e.g. darkrai"
  },

  notInAnyDex: {
    label: "Not in any regional Pokédex", group: "Other", theme: "other",
    missing: true,
    spriteFallback: true, smooth: true, modern: true,
    textVersions: [],
    example: "e.g. meltan"
  },

  national: {
    label: "Gotta Catch 'Em All!", group: "National", theme: "national",
    pokedex: "national",
    spriteSource: "home", smooth: true, modern: true,
    textVersions: [],
    example: "e.g. pikachu"
  }
};
