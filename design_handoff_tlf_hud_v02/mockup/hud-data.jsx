/* global window */
// =========================================================================
// Last Onion Knight — data layer
// FFXIV jobs, Onion Knight-specific custom job, abilities, party, chat
// =========================================================================

const JOBS = [
  // ── Tanks ──────────────────────────────────────────────
  { id: 'gla', role: 'tank',   name: 'Gladiator',     icon: 'sword',         level: 30,  unlocked: true  },
  { id: 'pld', role: 'tank',   name: 'Paladin',       icon: 'shield-plus',   level: 80,  unlocked: true  },
  { id: 'mrd', role: 'tank',   name: 'Marauder',      icon: 'axe',           level: 30,  unlocked: true  },
  { id: 'war', role: 'tank',   name: 'Warrior',       icon: 'flame',         level: 72,  unlocked: true  },
  { id: 'drk', role: 'tank',   name: 'Dark Knight',   icon: 'moon',          level: 56,  unlocked: true  },
  { id: 'gnb', role: 'tank',   name: 'Gunbreaker',    icon: 'crosshair',     level: 90,  unlocked: true  },

  // ── Healers ────────────────────────────────────────────
  { id: 'cnj', role: 'healer', name: 'Conjurer',      icon: 'leaf',          level: 30,  unlocked: true  },
  { id: 'whm', role: 'healer', name: 'White Mage',    icon: 'sun',           level: 60,  unlocked: true  },
  { id: 'sch', role: 'healer', name: 'Scholar',       icon: 'book-open',     level: 42,  unlocked: true  },
  { id: 'ast', role: 'healer', name: 'Astrologian',   icon: 'star',          level: 50,  unlocked: true  },
  { id: 'sge', role: 'healer', name: 'Sage',          icon: 'sparkles',      level: 70,  unlocked: true  },

  // ── Melee DPS ──────────────────────────────────────────
  { id: 'pug', role: 'dps',    name: 'Pugilist',      icon: 'hand',          level: 32,  unlocked: true  },
  { id: 'mnk', role: 'dps',    name: 'Monk',          icon: 'zap',           level: 50,  unlocked: true  },
  { id: 'lnc', role: 'dps',    name: 'Lancer',        icon: 'arrow-up-right',level: 30,  unlocked: true  },
  { id: 'drg', role: 'dps',    name: 'Dragoon',       icon: 'wind',          level: 60,  unlocked: true  },
  { id: 'rog', role: 'dps',    name: 'Rogue',         icon: 'venetian-mask', level: 30,  unlocked: true  },
  { id: 'nin', role: 'dps',    name: 'Ninja',         icon: 'eye-off',       level: 70,  unlocked: true  },
  { id: 'sam', role: 'dps',    name: 'Samurai',       icon: 'scissors',      level: 80,  unlocked: true  },
  { id: 'rpr', role: 'dps',    name: 'Reaper',        icon: 'ghost',         level: 90,  unlocked: true  },
  { id: 'vpr', role: 'dps',    name: 'Viper',         icon: 'curly-braces',  level: 100, unlocked: true  },

  // ── Phys Ranged DPS ────────────────────────────────────
  { id: 'arc', role: 'dps',    name: 'Archer',        icon: 'bow-arrow',     level: 30,  unlocked: true  },
  { id: 'brd', role: 'dps',    name: 'Bard',          icon: 'music',         level: 60,  unlocked: true  },
  { id: 'mch', role: 'dps',    name: 'Machinist',     icon: 'cog',           level: 70,  unlocked: true  },
  { id: 'dnc', role: 'dps',    name: 'Dancer',        icon: 'flower',        level: 80,  unlocked: true  },

  // ── Magic Ranged DPS ───────────────────────────────────
  { id: 'thm', role: 'dps',    name: 'Thaumaturge',   icon: 'flame-kindling',level: 32,  unlocked: true  },
  { id: 'blm', role: 'dps',    name: 'Black Mage',    icon: 'tornado',       level: 70,  unlocked: true  },
  { id: 'acn', role: 'dps',    name: 'Arcanist',      icon: 'book',          level: 30,  unlocked: true  },
  { id: 'smn', role: 'dps',    name: 'Summoner',      icon: 'cloud-lightning',level: 60, unlocked: true  },
  { id: 'rdm', role: 'dps',    name: 'Red Mage',      icon: 'wand',          level: 90,  unlocked: true  },
  { id: 'pct', role: 'dps',    name: 'Pictomancer',   icon: 'palette',       level: 100, unlocked: true  },
  { id: 'blu', role: 'dps',    name: 'Blue Mage',     icon: 'droplet',       level: 80,  unlocked: true  },

  // ── The custom one ─────────────────────────────────────
  { id: 'onk', role: 'tank',   name: 'Onion Knight',  icon: 'crown',         level: 99,  unlocked: true, custom: true },
];

// ── The active job's abilities (Onion Knight custom kit) ────────────────
const ONION_KIT = [
  { id: 'a1', glyph: 'A', key: '1', name: 'Vellum Cleave',     cd: 0,  type: 'gcd',     desc: 'A measured arcing slash; the opening flourish of the Onion Chronicle.', rune: 'oxoxe' },
  { id: 'a2', glyph: 'B', key: '2', name: 'Layered Guard',     cd: 0,  type: 'gcd',     desc: 'You set your bracer; each layer turns a wound into a whisper.',         rune: 'gridana' },
  { id: 'a3', glyph: 'C', key: '3', name: "Cook's Mercy",      cd: 6,  type: 'gcd',     desc: 'Restore a portion of the realm\'s vigor; allies near you taste hearth-smoke.', rune: 'aetheryte' },
  { id: 'a4', glyph: 'D', key: '4', name: 'Sprouting Riposte', cd: 0,  type: 'gcd',     desc: 'Counter the next blow with the speed of a green shoot.',               rune: 'lalafel' },
  { id: 'a5', glyph: 'E', key: '5', name: 'Maelstrom Charge',  cd: 12, type: 'cd', proc: true, desc: 'Surge forward bearing the helm of the Maelstrom; the plume singes the air.', rune: 'maelstrom' },
  { id: 'a6', glyph: 'F', key: '6', name: 'Ember Plume',       cd: 28, type: 'cd',     desc: 'Loose the orange plume in a downward sweep — ember dust marks the cut.', rune: 'embera' },
  { id: 'a7', glyph: 'G', key: '7', name: 'Knight\'s Vow',     cd: 0,  type: 'gcd',     desc: 'Bind a chosen ally; you take a portion of every blade aimed their way.', rune: 'vows' },
  { id: 'a8', glyph: 'H', key: '8', name: 'Onion Bulwark',     cd: 60, type: 'cd',     desc: 'Crouch behind layered greaves. Damage dwindles like an onion peeled.',    rune: 'bulwark' },
  { id: 'a9', glyph: 'I', key: '9', name: 'Chronicler\'s Eye', cd: 0,  type: 'gcd',     desc: 'Mark the foe in chronicle script. Your party reads their next move.',   rune: 'eye' },
  { id: 'a10', glyph: 'J', key: '0', name: 'Vellum Banner',     cd: 90, type: 'cd',    desc: 'Plant the vellum banner. Allies within draw upon the warmth of parchment.', rune: 'banner' },
  { id: 'a11', glyph: 'K', key: '-', name: 'Last Stand',        cd: 180, type: 'cd',   desc: 'When you fall to one one-hundredth of your vigor, your blade will not.', rune: 'laststand' },
  { id: 'a12', glyph: 'L', key: '=', name: 'Heralds\' Verse',   cd: 120, type: 'cd',   desc: 'You speak a line of chronicle aloud. The realm pauses to listen.',     rune: 'herald' },
  // row 2 — secondary kit
  { id: 'b1', glyph: 'A',  key: 'Q', name: 'Sprint',             cd: 0,  type: 'gcd', desc: 'Quicken your stride. Wind in your hair, plume in your wake.',          rune: 'sprint' },
  { id: 'b2', glyph: 'B',  key: 'W', name: 'Hearthcall',         cd: 0,  type: 'gcd', desc: 'Return to your last hearth-bound aetheryte.',                          rune: 'hearth' },
  { id: 'b3', glyph: 'C',  key: 'E', name: 'Salute',             cd: 0,  type: 'gcd', desc: 'A small heraldic salute. Reduces nothing. Costs nothing. Matters.',     rune: 'salute' },
  { id: 'b4', glyph: 'D',  key: 'R', name: 'Onion Eat',          cd: 30, type: 'cd', proc: true, desc: 'You produce a raw onion and bite it. Vigor restored; truths revealed.', rune: 'eatonion' },
  { id: 'b5', glyph: 'F',  key: 'T', name: 'Chronicle Note',     cd: 0,  type: 'gcd', desc: 'Pen a line to your linkshell. Their ears are warmer than the night air.', rune: 'note' },
  { id: 'b6', glyph: 'G',  key: 'Y', name: 'Linkpearl',          cd: 0,  type: 'gcd', desc: 'Open a line. The pearl in your ear glows a single moment.',           rune: 'linkpearl' },
  { id: 'b7', glyph: 'H',  key: 'U', name: 'Aether Quaff',       cd: 90, type: 'cd', desc: 'A small mana flask, vellum-stoppered. Replenish your magic well.',        rune: 'aether' },
  { id: 'b8', glyph: 'I',  key: 'I', name: 'Pose',               cd: 0,  type: 'gcd', desc: 'You strike a pose. The plume settles. The chronicle pauses to draw you.', rune: 'pose' },
  { id: 'b9', glyph: 'J',  key: 'O', name: 'Mounts',             cd: 0,  type: 'gcd', desc: 'Summon a chocobo. Yellow feathers, very fast, very loud.',             rune: 'chocobo' },
  { id: 'b10', glyph: 'K', key: 'P', name: 'Minion',             cd: 0,  type: 'gcd', desc: 'Whistle for a Wind-up Tonberry. Tiny knife. Tiny grudge.',              rune: 'tonberry' },
  { id: 'b11', glyph: 'L', key: '[', name: 'Map',                cd: 0,  type: 'gcd', desc: 'Unfurl the realm. You are at the crossing of three roads, as ever.',     rune: 'map' },
  { id: 'b12', glyph: 'M', key: ']', name: 'Logout',             cd: 0,  type: 'gcd', desc: 'Set the chronicle aside. The realm will yet be here at morning bell.',  rune: 'logout' },
  // Row 3 — Ctrl-layer · utility & comms
  { id: 'c1', glyph: 'N', key: '1', name: 'Linkshell 1',  cd: 0,  type: 'gcd', desc: '«Onion of Us» chat channel — opens primary linkshell.', rune: 'ls1' },
  { id: 'c2', glyph: 'O', key: '2', name: 'Linkshell 2',  cd: 0,  type: 'gcd', desc: 'Cross-world friend list link.', rune: 'ls2' },
  { id: 'c3', glyph: 'P', key: '3', name: 'Free Co. Buff',cd: 30, type: 'cd',  desc: 'Pop the FC food/exp buff. Lasts one hour, smells faintly of chronicle ink.', rune: 'fcbuff' },
  { id: 'c4', glyph: 'Q', key: '4', name: 'Duty Finder',  cd: 0,  type: 'gcd', desc: 'Open Duty Finder. The realm has work that wants doing.', rune: 'duty' },
  { id: 'c5', glyph: 'R', key: '5', name: 'Marketboard',  cd: 0,  type: 'gcd', desc: 'Open the market board. Look at glamour prices. Sigh.', rune: 'market' },
  { id: 'c6', glyph: 'S', key: '6', name: 'Inventory',    cd: 0,  type: 'gcd', desc: 'Open inventory. Everything is full again, somehow.', rune: 'inv' },
  { id: 'c7', glyph: 'T', key: '7', name: 'Glamour Plate',cd: 0,  type: 'gcd', desc: 'Cycle glamour plate. Helm always Onion.', rune: 'glam' },
  { id: 'c8', glyph: 'U', key: '8', name: 'Macro · Pull', cd: 0,  type: 'gcd', desc: '/p Engaging in 3 · 2 · 1 — the count is sacred.', rune: 'pull' },
  { id: 'c9', glyph: 'V', key: '9', name: 'Macro · Thanks',cd: 0, type: 'gcd', desc: '/p Bravely fought. Thank you for the run.', rune: 'thx' },
];

// ── Party (you + 7 alliance) ────────────────────────────────────────────
const PARTY = [
  { id: 'p1', name: 'Vellum Eorzea',    role: 'tank',   job: 'ONK', lvl: 99, hp: 92,  maxhp: 158400, mp: 100, you: true,  target: true },
  { id: 'p2', name: 'Riol Bramblefoot', role: 'tank',   job: 'PLD', lvl: 99, hp: 68,  maxhp: 154200, mp: 100 },
  { id: 'p3', name: 'Anne of Norvrandt',role: 'healer', job: 'WHM', lvl: 99, hp: 78,  maxhp: 102800, mp: 84  },
  { id: 'p4', name: 'Quill Lalafell',   role: 'healer', job: 'SGE', lvl: 99, hp: 100, maxhp: 99800,  mp: 91  },
  { id: 'p5', name: 'Khaira Sun-Tail',  role: 'dps',    job: 'SAM', lvl: 99, hp: 88,  maxhp: 96200,  mp: 100 },
  { id: 'p6', name: 'Petalbrow Tam',    role: 'dps',    job: 'DNC', lvl: 99, hp: 100, maxhp: 89400,  mp: 78  },
  { id: 'p7', name: 'Onyx Garlond',     role: 'dps',    job: 'BLM', lvl: 99, hp: 64,  maxhp: 88800,  mp: 22  },
  { id: 'p8', name: 'Tinker Hyrstmill', role: 'dps',    job: 'RDM', lvl: 99, hp: 100, maxhp: 91200,  mp: 96  },
];

// ── Buffs / debuffs ─────────────────────────────────────────────────────
const BUFFS = [
  { id: 'b1', glyph: 'I',  name: 'Inspiring Plume',   time: '24', desc: 'Damage dealt +8% while the orange feather flutters.',   ember: true },
  { id: 'b2', glyph: 'V',  name: 'Vellum Aegis',      time: '12', desc: 'A doubled-frame ward. Incoming damage reduced 20%.',    ember: false },
  { id: 'b3', glyph: 'W',  name: 'Knight\'s Vow',     time: '38', desc: 'Bound to Anne of Norvrandt. 30% of damage redirected.', ember: false },
  { id: 'b4', glyph: 'C',  name: 'Cook\'s Mercy',     time: '8',  desc: 'Hearth-smoke regen. 1,400 vigor / 3s.',                  ember: true },
  { id: 'b5', glyph: 'M',  name: 'Maelstrom Charge',  time: '4',  desc: 'Sprint speed +60% while the plume burns.',              ember: true },
  { id: 'b6', glyph: 'F',  name: 'Food: Onion Pie',   time: '29:50', desc: 'A hot slice. VIT +118, DH +98, Crit +84 (HQ).',     ember: false },
];

// ── Cast bar source ─────────────────────────────────────────────────────
const TARGET = {
  rank: 'S',
  name: 'Garlean Onion Reaper',
  level: 99,
  hp: 64,
  cast: { name: 'Heedless Mowing', dur: 8.0 },
  affix: 'aetheryte', // rune
};

// ── Chat log ────────────────────────────────────────────────────────────
const CHAT = [
  { t: '[14:01]', who: 'System',         k: 'system', text: 'You have entered the Bastion of the Last Onion.' },
  { t: '[14:01]', who: '[FC] Riol',      k: 'fc',     text: 'Plume up, friend. The chronicle calls.' },
  { t: '[14:02]', who: 'Vellum Eorzea',  k: 'you',    text: 'Pulling on the count of three. Eyes on the Reaper.' },
  { t: '[14:02]', who: 'Anne',           k: 'who',    text: 'Vows on you. Lily set. Go when ready.' },
  { t: '[14:02]', who: 'Khaira',         k: 'who',    text: 'iaijutsu queued. Five gil says I beat Onyx.' },
  { t: '[14:03]', who: 'Onyx',           k: 'who',    text: 'You will not, but I admire the effort.' },
  { t: '[14:03]', who: 'System',         k: 'system', text: 'Maelstrom Charge ready.' },
  { t: '[14:03]', who: 'Vellum Eorzea',  k: 'you',    text: 'Set forth.' },
  { t: '[14:04]', who: '[FC] Petalbrow', k: 'fc',     text: 'Standard step opened — keep within the ribbon.' },
];

// ── Tooltip text for buffs (looked up by id) ────────────────────────────

Object.assign(window, { JOBS, ONION_KIT, PARTY, BUFFS, TARGET, CHAT });
