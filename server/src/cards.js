import { items as newItems, runes as newRunes } from './cards-items-runes.js';

export const cards = [
  // Monster Cards - LoL Champions
  // ============================================
  // DEMACIA - Justice & Light (14 Champions)
  // ============================================
  {
    id: 'demacia_001',
    name: 'Garen',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'DEMACIA',
    level: 6,
    attack: 2500,
    defense: 2200,
    rarity: 'EPIC',
    effect: 'Once per turn: You can gain 500 Life Points.',
    description: 'The Might of Demacia. A stalwart defender of his homeland.',
    image: 'champions/garen.jpg'
  },
  {
    id: 'demacia_002',
    name: 'Lux',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'DEMACIA',
    level: 5,
    attack: 2000,
    defense: 1800,
    rarity: 'RARE',
    effect: 'When this card attacks: Destroy 1 Spell/Trap card your opponent controls.',
    description: 'The Lady of Luminosity, master of light magic.',
    image: 'champions/lux.jpg'
  },
  {
    id: 'demacia_003',
    name: 'Fiora',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'DEMACIA',
    level: 5,
    attack: 2200,
    defense: 1400,
    rarity: 'EPIC',
    effect: 'When this card destroys a monster by battle: Draw 1 card.',
    description: 'The Grand Duelist. Unmatched in single combat.',
    image: 'champions/fiora.jpg'
  },
  {
    id: 'demacia_004',
    name: 'Galio',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'DEMACIA',
    level: 7,
    attack: 2400,
    defense: 2800,
    rarity: 'EPIC',
    effect: 'When this card is summoned: Negate the effects of all Spell cards on the field.',
    description: 'The Colossus. A petricite sentinel who protects Demacia.',
    image: 'champions/galio.jpg'
  },
  {
    id: 'demacia_005',
    name: 'Jarvan IV',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'DEMACIA',
    level: 7,
    attack: 2600,
    defense: 2000,
    rarity: 'LEGENDARY',
    effect: 'When this card is summoned: All DEMACIA monsters you control gain 300 ATK.',
    description: 'The Exemplar of Demacia. Crown Prince and future king.',
    image: 'champions/jarvan.jpg'
  },
  {
    id: 'demacia_006',
    name: 'Kayle',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'DEMACIA',
    level: 8,
    attack: 2800,
    defense: 2000,
    rarity: 'LEGENDARY',
    effect: 'This card cannot be destroyed by card effects. Once per turn: Inflict 400 damage to your opponent.',
    description: 'The Righteous. An immortal ascended being of justice.',
    image: 'champions/kayle.jpg'
  },
  {
    id: 'demacia_007',
    name: 'Lucian',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'DEMACIA',
    level: 5,
    attack: 2100,
    defense: 1500,
    rarity: 'RARE',
    effect: 'This card can attack twice during each Battle Phase.',
    description: 'The Purifier. A Sentinel hunting the undead.',
    image: 'champions/lucian.jpg'
  },
  {
    id: 'demacia_008',
    name: 'Morgana',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'DEMACIA',
    level: 6,
    attack: 2200,
    defense: 2100,
    rarity: 'EPIC',
    effect: 'Once per turn: Target 1 monster; it cannot attack this turn.',
    description: 'The Fallen. Sister to Kayle, embracing the darkness.',
    image: 'champions/morgana.jpg'
  },
  {
    id: 'demacia_009',
    name: 'Quinn',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'DEMACIA',
    level: 4,
    attack: 1800,
    defense: 1400,
    rarity: 'RARE',
    effect: 'When this card is summoned: Look at the top 3 cards of your deck.',
    description: 'Demacia\'s Wings. Elite ranger with her eagle Valor.',
    image: 'champions/quinn.jpg'
  },
  {
    id: 'demacia_010',
    name: 'Shyvana',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'DEMACIA',
    level: 6,
    attack: 2300,
    defense: 1900,
    rarity: 'EPIC',
    effect: 'Once per turn: This card gains 500 ATK until end of turn.',
    description: 'The Half-Dragon. Born of magic and dragonfire.',
    image: 'champions/shyvana.jpg'
  },
  {
    id: 'demacia_011',
    name: 'Sona',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'DEMACIA',
    level: 4,
    attack: 1200,
    defense: 1800,
    rarity: 'RARE',
    effect: 'Once per turn: Gain 300 Life Points for each monster you control.',
    description: 'Maven of the Strings. Her music speaks what words cannot.',
    image: 'champions/sona.jpg'
  },
  {
    id: 'demacia_012',
    name: 'Sylas',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'DEMACIA',
    level: 6,
    attack: 2400,
    defense: 1600,
    rarity: 'EPIC',
    effect: 'When this card battles: Copy the effect of the opposing monster until end of turn.',
    description: 'The Unshackled. A mage who steals magic from others.',
    image: 'champions/sylas.jpg'
  },
  {
    id: 'demacia_013',
    name: 'Vayne',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'DEMACIA',
    level: 5,
    attack: 2000,
    defense: 1300,
    rarity: 'RARE',
    effect: 'This card inflicts piercing battle damage.',
    description: 'The Night Hunter. Stalking evil in the shadows.',
    image: 'champions/vayne.jpg'
  },
  {
    id: 'demacia_014',
    name: 'Xin Zhao',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'DEMACIA',
    level: 5,
    attack: 2100,
    defense: 1700,
    rarity: 'RARE',
    effect: 'When this card attacks: The attacked monster loses 300 DEF.',
    description: 'The Seneschal of Demacia. Royal guardian and warrior.',
    image: 'champions/xinzhao.jpg'
  },
  // ============================================
  // NOXUS - Strength & Conquest (16 Champions)
  // ============================================
  {
    id: 'noxus_001',
    name: 'Darius',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'NOXUS',
    level: 7,
    attack: 2800,
    defense: 2000,
    rarity: 'LEGENDARY',
    effect: 'If this card destroys a monster in battle: Inflict 500 damage to your opponent.',
    description: 'The Hand of Noxus, a brutal executioner.',
    image: 'champions/darius.jpg'
  },
  {
    id: 'noxus_002',
    name: 'Draven',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'NOXUS',
    level: 5,
    attack: 2300,
    defense: 1200,
    rarity: 'EPIC',
    effect: 'When this card destroys a monster: Gain 500 Life Points.',
    description: 'The Glorious Executioner. Brother of Darius, craving fame.',
    image: 'champions/draven.jpg'
  },
  {
    id: 'noxus_003',
    name: 'Katarina',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'NOXUS',
    level: 6,
    attack: 2400,
    defense: 1400,
    rarity: 'EPIC',
    effect: 'If this card destroys a monster: It can attack once more this turn.',
    description: 'The Sinister Blade. Deadly assassin of House Du Couteau.',
    image: 'champions/katarina.jpg'
  },
  {
    id: 'noxus_004',
    name: 'Swain',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'NOXUS',
    level: 7,
    attack: 2500,
    defense: 2300,
    rarity: 'LEGENDARY',
    effect: 'Once per turn: Inflict 200 damage for each card in your opponent\'s hand.',
    description: 'The Noxian Grand General. Master tactician and demon host.',
    image: 'champions/swain.jpg'
  },
  {
    id: 'noxus_005',
    name: 'LeBlanc',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'NOXUS',
    level: 6,
    attack: 2200,
    defense: 1600,
    rarity: 'EPIC',
    effect: 'Once per turn: Return this card to your hand to negate an attack.',
    description: 'The Deceiver. Leader of the Black Rose cabal.',
    image: 'champions/leblanc.jpg'
  },
  {
    id: 'noxus_006',
    name: 'Vladimir',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'NOXUS',
    level: 6,
    attack: 2100,
    defense: 2100,
    rarity: 'EPIC',
    effect: 'When this card inflicts battle damage: Gain LP equal to half the damage.',
    description: 'The Crimson Reaper. Ancient hemomancer of noble blood.',
    image: 'champions/vladimir.jpg'
  },
  {
    id: 'noxus_007',
    name: 'Talon',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'NOXUS',
    level: 5,
    attack: 2200,
    defense: 1300,
    rarity: 'RARE',
    effect: 'This card can attack directly if your opponent controls no Spell/Trap cards.',
    description: 'The Blade\'s Shadow. Lethal assassin seeking his master.',
    image: 'champions/talon.jpg'
  },
  {
    id: 'noxus_008',
    name: 'Cassiopeia',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'NOXUS',
    level: 6,
    attack: 2300,
    defense: 1700,
    rarity: 'EPIC',
    effect: 'Monsters that battle this card cannot change their battle position.',
    description: 'The Serpent\'s Embrace. Cursed noblewoman turned serpent.',
    image: 'champions/cassiopeia.jpg'
  },
  {
    id: 'noxus_009',
    name: 'Sion',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'NOXUS',
    level: 8,
    attack: 3000,
    defense: 2500,
    rarity: 'LEGENDARY',
    effect: 'If this card is destroyed: Special Summon it during the End Phase with 1500 ATK.',
    description: 'The Undead Juggernaut. A war hero reborn through dark magic.',
    image: 'champions/sion.jpg'
  },
  {
    id: 'noxus_010',
    name: 'Mordekaiser',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'NOXUS',
    level: 8,
    attack: 2900,
    defense: 2400,
    rarity: 'LEGENDARY',
    effect: 'Once per turn: Banish 1 monster from either Graveyard; gain ATK equal to half its ATK.',
    description: 'The Iron Revenant. Ancient warlord who conquered death itself.',
    image: 'champions/mordekaiser.jpg'
  },
  {
    id: 'noxus_011',
    name: 'Riven',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'NOXUS',
    level: 5,
    attack: 2100,
    defense: 1600,
    rarity: 'RARE',
    effect: 'Once per turn: This card gains 400 ATK until end of turn.',
    description: 'The Exile. A broken sword, a broken past.',
    image: 'champions/riven.jpg'
  },
  {
    id: 'noxus_012',
    name: 'Samira',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'NOXUS',
    level: 5,
    attack: 2200,
    defense: 1400,
    rarity: 'RARE',
    effect: 'For each monster this card destroys this turn, it gains 200 ATK.',
    description: 'The Desert Rose. Thrill-seeking mercenary.',
    image: 'champions/samira.jpg'
  },
  {
    id: 'noxus_013',
    name: 'Rell',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'NOXUS',
    level: 5,
    attack: 1800,
    defense: 2200,
    rarity: 'RARE',
    effect: 'When this card is summoned: Change all opponent\'s monsters to Defense Position.',
    description: 'The Iron Maiden. Ferromancer forged through cruelty.',
    image: 'champions/rell.jpg'
  },
  {
    id: 'noxus_014',
    name: 'Alistar',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'NOXUS',
    level: 6,
    attack: 2000,
    defense: 2600,
    rarity: 'RARE',
    effect: 'This card cannot be destroyed by battle once per turn.',
    description: 'The Minotaur. Former gladiator seeking vengeance.',
    image: 'champions/alistar.jpg'
  },
  {
    id: 'noxus_015',
    name: 'Ambessa',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'NOXUS',
    level: 7,
    attack: 2700,
    defense: 1900,
    rarity: 'EPIC',
    effect: 'When this card attacks: Your opponent cannot activate Trap cards.',
    description: 'The Matriarch. Warlord mother of Samira.',
    image: 'champions/ambessa.jpg'
  },
  {
    id: 'noxus_016',
    name: 'Briar',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'NOXUS',
    level: 5,
    attack: 2400,
    defense: 1000,
    rarity: 'RARE',
    effect: 'This card must attack if able. When it destroys a monster: Gain 400 LP.',
    description: 'The Restrained Hunger. A vampire unleashed.',
    image: 'champions/briar.jpg'
  },
  // ============================================
  // IONIA - Spirit & Balance (18 Champions)
  // ============================================
  {
    id: 'ionia_001',
    name: 'Yasuo',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'IONIA',
    level: 6,
    attack: 2400,
    defense: 1600,
    rarity: 'EPIC',
    effect: 'When your opponent activates a Spell Card: You can negate that activation.',
    description: 'The Unforgiven, wandering swordsman.',
    image: 'champions/yasuo.jpg'
  },
  {
    id: 'ionia_002',
    name: 'Ahri',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'IONIA',
    level: 5,
    attack: 1900,
    defense: 1500,
    rarity: 'EPIC',
    effect: 'Once per turn: You can target 1 monster your opponent controls; take control of it until the End Phase.',
    description: 'The Nine-Tailed Fox, a charming enchantress.',
    image: 'champions/ahri.jpg'
  },
  {
    id: 'ionia_003',
    name: 'Zed',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'IONIA',
    level: 6,
    attack: 2300,
    defense: 1700,
    rarity: 'LEGENDARY',
    effect: 'This card can attack twice during each Battle Phase.',
    description: 'The Master of Shadows.',
    image: 'champions/zed.jpg'
  },
  {
    id: 'ionia_004',
    name: 'Yone',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'IONIA',
    level: 6,
    attack: 2500,
    defense: 1800,
    rarity: 'LEGENDARY',
    effect: 'When this card is destroyed: Special Summon it during the next Standby Phase.',
    description: 'The Unforgotten. Yasuo\'s brother, returned from death.',
    image: 'champions/yone.jpg'
  },
  {
    id: 'ionia_005',
    name: 'Akali',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'IONIA',
    level: 5,
    attack: 2200,
    defense: 1400,
    rarity: 'EPIC',
    effect: 'This card cannot be targeted by your opponent\'s card effects once per turn.',
    description: 'The Rogue Assassin. Former Kinkou, now walking her own path.',
    image: 'champions/akali.jpg'
  },
  {
    id: 'ionia_006',
    name: 'Shen',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'IONIA',
    level: 6,
    attack: 2100,
    defense: 2400,
    rarity: 'EPIC',
    effect: 'Once per turn: Target 1 monster you control; it cannot be destroyed this turn.',
    description: 'The Eye of Twilight. Leader of the Kinkou Order.',
    image: 'champions/shen.jpg'
  },
  {
    id: 'ionia_007',
    name: 'Lee Sin',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'IONIA',
    level: 6,
    attack: 2300,
    defense: 1900,
    rarity: 'EPIC',
    effect: 'When this card attacks: You can return 1 monster to its owner\'s hand.',
    description: 'The Blind Monk. Master of the dragon spirit.',
    image: 'champions/leesin.jpg'
  },
  {
    id: 'ionia_008',
    name: 'Irelia',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'IONIA',
    level: 6,
    attack: 2400,
    defense: 1700,
    rarity: 'EPIC',
    effect: 'Gains 200 ATK for each other IONIA monster you control.',
    description: 'The Blade Dancer. Ionia\'s resistance leader.',
    image: 'champions/irelia.jpg'
  },
  {
    id: 'ionia_009',
    name: 'Karma',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'IONIA',
    level: 5,
    attack: 1800,
    defense: 2000,
    rarity: 'RARE',
    effect: 'When a Spell card is activated: Gain 400 Life Points.',
    description: 'The Enlightened One. Reincarnated spirit leader.',
    image: 'champions/karma.jpg'
  },
  {
    id: 'ionia_010',
    name: 'Master Yi',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'IONIA',
    level: 5,
    attack: 2200,
    defense: 1300,
    rarity: 'RARE',
    effect: 'If this card destroys a monster by battle: It can attack again.',
    description: 'The Wuju Bladesman. Last practitioner of Wuju.',
    image: 'champions/masteryi.jpg'
  },
  {
    id: 'ionia_011',
    name: 'Syndra',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'IONIA',
    level: 7,
    attack: 2600,
    defense: 1800,
    rarity: 'LEGENDARY',
    effect: 'Once per turn: Destroy 1 Spell/Trap card on the field.',
    description: 'The Dark Sovereign. Unleashed power without restraint.',
    image: 'champions/syndra.jpg'
  },
  {
    id: 'ionia_012',
    name: 'Jhin',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'IONIA',
    level: 6,
    attack: 2400,
    defense: 1400,
    rarity: 'EPIC',
    effect: 'This card\'s fourth attack each duel inflicts double damage.',
    description: 'The Virtuoso. Artist of death and destruction.',
    image: 'champions/jhin.jpg'
  },
  {
    id: 'ionia_013',
    name: 'Sett',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'IONIA',
    level: 6,
    attack: 2500,
    defense: 2000,
    rarity: 'EPIC',
    effect: 'When this card takes battle damage: Inflict the same damage to your opponent.',
    description: 'The Boss. Half-Vastayan pit fighter.',
    image: 'champions/sett.jpg'
  },
  {
    id: 'ionia_014',
    name: 'Wukong',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'IONIA',
    level: 5,
    attack: 2100,
    defense: 1600,
    rarity: 'RARE',
    effect: 'Once per turn: Negate the next attack targeting this card.',
    description: 'The Monkey King. Vastayan trickster seeking purpose.',
    image: 'champions/wukong.jpg'
  },
  {
    id: 'ionia_015',
    name: 'Xayah',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'IONIA',
    level: 5,
    attack: 2000,
    defense: 1500,
    rarity: 'RARE',
    effect: 'If "Rakan" is on the field: This card gains 500 ATK.',
    description: 'The Rebel. Vastayan revolutionary fighting for her kind.',
    image: 'champions/xayah.jpg'
  },
  {
    id: 'ionia_016',
    name: 'Rakan',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'IONIA',
    level: 5,
    attack: 1700,
    defense: 2000,
    rarity: 'RARE',
    effect: 'If "Xayah" is on the field: All your monsters gain 300 ATK.',
    description: 'The Charmer. Vastayan performer and Xayah\'s partner.',
    image: 'champions/rakan.jpg'
  },
  {
    id: 'ionia_017',
    name: 'Lillia',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'IONIA',
    level: 4,
    attack: 1600,
    defense: 1800,
    rarity: 'RARE',
    effect: 'When this card is summoned: Your opponent\'s monsters lose 200 ATK.',
    description: 'The Bashful Bloom. Fae fawn of the garden.',
    image: 'champions/lillia.jpg'
  },
  {
    id: 'ionia_018',
    name: 'Ivern',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'IONIA',
    level: 5,
    attack: 1500,
    defense: 2200,
    rarity: 'RARE',
    effect: 'Once per turn: Special Summon 1 "Daisy" token (ATK 1000/DEF 1000).',
    description: 'The Green Father. Friend of the forest.',
    image: 'champions/ivern.jpg'
  },
  // ============================================
  // PILTOVER / ZAUN - Technology (20 Champions)
  // ============================================
  {
    id: 'piltover_001',
    name: 'Jinx',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'PILTOVER',
    level: 5,
    attack: 2100,
    defense: 1200,
    rarity: 'EPIC',
    effect: 'When this card is summoned: Inflict 300 damage to your opponent.',
    description: 'The Loose Cannon of Zaun.',
    image: 'champions/jinx.jpg'
  },
  {
    id: 'piltover_002',
    name: 'Ezreal',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'PILTOVER',
    level: 4,
    attack: 1700,
    defense: 1400,
    rarity: 'RARE',
    effect: 'Each time you activate a Spell Card: Inflict 200 damage to your opponent.',
    description: 'The Prodigal Explorer.',
    image: 'champions/ezreal.jpg'
  },
  {
    id: 'piltover_003',
    name: 'Vi',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'PILTOVER',
    level: 6,
    attack: 2500,
    defense: 1800,
    rarity: 'EPIC',
    effect: 'This card inflicts piercing battle damage.',
    description: 'The Piltover Enforcer. Fists first, questions later.',
    image: 'champions/vi.jpg'
  },
  {
    id: 'piltover_004',
    name: 'Caitlyn',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'PILTOVER',
    level: 5,
    attack: 2200,
    defense: 1500,
    rarity: 'EPIC',
    effect: 'Once per turn: Look at your opponent\'s Set cards.',
    description: 'The Sheriff of Piltover. Finest shot in the city.',
    image: 'champions/caitlyn.jpg'
  },
  {
    id: 'piltover_005',
    name: 'Jayce',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'PILTOVER',
    level: 6,
    attack: 2400,
    defense: 2000,
    rarity: 'EPIC',
    effect: 'Once per turn: Choose ATK mode (2600/1800) or DEF mode (2200/2400).',
    description: 'The Defender of Tomorrow. Hextech pioneer.',
    image: 'champions/jayce.jpg'
  },
  {
    id: 'piltover_006',
    name: 'Viktor',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'PILTOVER',
    level: 7,
    attack: 2600,
    defense: 2200,
    rarity: 'LEGENDARY',
    effect: 'Once per turn: Add 1 Spell card from your deck to your hand.',
    description: 'The Machine Herald. Glorious evolution awaits.',
    image: 'champions/viktor.jpg'
  },
  {
    id: 'piltover_007',
    name: 'Ekko',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'PILTOVER',
    level: 5,
    attack: 2000,
    defense: 1600,
    rarity: 'EPIC',
    effect: 'Once per duel: Return the game state to how it was at the start of this turn.',
    description: 'The Boy Who Shattered Time. Zaun\'s prodigy.',
    image: 'champions/ekko.jpg'
  },
  {
    id: 'piltover_008',
    name: 'Camille',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'PILTOVER',
    level: 6,
    attack: 2300,
    defense: 1900,
    rarity: 'EPIC',
    effect: 'When this card attacks: The target cannot be affected by other card effects.',
    description: 'The Steel Shadow. Principal intelligencer of Clan Ferros.',
    image: 'champions/camille.jpg'
  },
  {
    id: 'piltover_009',
    name: 'Orianna',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'PILTOVER',
    level: 5,
    attack: 2000,
    defense: 2000,
    rarity: 'RARE',
    effect: 'Once per turn: Move 1 monster to an adjacent zone.',
    description: 'The Lady of Clockwork. A girl remade in metal.',
    image: 'champions/orianna.jpg'
  },
  {
    id: 'piltover_010',
    name: 'Blitzcrank',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'PILTOVER',
    level: 5,
    attack: 1800,
    defense: 2400,
    rarity: 'RARE',
    effect: 'Once per turn: Change 1 opponent\'s monster to Attack Position.',
    description: 'The Great Steam Golem. Zaun\'s helpful automaton.',
    image: 'champions/blitzcrank.jpg'
  },
  {
    id: 'piltover_011',
    name: 'Warwick',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'PILTOVER',
    level: 6,
    attack: 2400,
    defense: 1700,
    rarity: 'EPIC',
    effect: 'Gains 300 ATK when attacking a monster with less than half its original ATK.',
    description: 'The Uncaged Wrath of Zaun. Hunter of criminals.',
    image: 'champions/warwick.jpg'
  },
  {
    id: 'piltover_012',
    name: 'Dr. Mundo',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'PILTOVER',
    level: 6,
    attack: 2200,
    defense: 2500,
    rarity: 'RARE',
    effect: 'Once per turn: Gain 500 Life Points.',
    description: 'The Madman of Zaun. Goes where he pleases.',
    image: 'champions/drmundo.jpg'
  },
  {
    id: 'piltover_013',
    name: 'Singed',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'PILTOVER',
    level: 5,
    attack: 1700,
    defense: 2100,
    rarity: 'RARE',
    effect: 'At the end of each Battle Phase: Inflict 300 damage to your opponent.',
    description: 'The Mad Chemist. Creator of many horrors.',
    image: 'champions/singed.jpg'
  },
  {
    id: 'piltover_014',
    name: 'Twitch',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'PILTOVER',
    level: 4,
    attack: 1900,
    defense: 1100,
    rarity: 'RARE',
    effect: 'This card can attack directly. If it does, halve the battle damage.',
    description: 'The Plague Rat. Sneaky, smelly, and deadly.',
    image: 'champions/twitch.jpg'
  },
  {
    id: 'piltover_015',
    name: 'Urgot',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'PILTOVER',
    level: 7,
    attack: 2700,
    defense: 2300,
    rarity: 'EPIC',
    effect: 'If this card battles a monster with less ATK: Destroy it without damage calculation.',
    description: 'The Dreadnought. Noxian turned Zaun\'s executioner.',
    image: 'champions/urgot.jpg'
  },
  {
    id: 'piltover_016',
    name: 'Zac',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'PILTOVER',
    level: 6,
    attack: 2100,
    defense: 2300,
    rarity: 'RARE',
    effect: 'If destroyed: Special Summon 4 "Bloblet" tokens (ATK 0/DEF 0).',
    description: 'The Secret Weapon. A heroic blob from Zaun.',
    image: 'champions/zac.jpg'
  },
  {
    id: 'piltover_017',
    name: 'Zeri',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'PILTOVER',
    level: 5,
    attack: 2100,
    defense: 1400,
    rarity: 'RARE',
    effect: 'Gains 100 ATK each time it declares an attack (max 500).',
    description: 'The Spark of Zaun. Electric revolutionary.',
    image: 'champions/zeri.jpg'
  },
  {
    id: 'piltover_018',
    name: 'Seraphine',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'PILTOVER',
    level: 4,
    attack: 1500,
    defense: 1700,
    rarity: 'RARE',
    effect: 'Once per turn: All your monsters gain 200 ATK until end of turn.',
    description: 'The Starry-Eyed Songstress. Voice of unity.',
    image: 'champions/seraphine.jpg'
  },
  {
    id: 'piltover_019',
    name: 'Renata Glasc',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'PILTOVER',
    level: 6,
    attack: 2200,
    defense: 2000,
    rarity: 'EPIC',
    effect: 'Once per turn: Take control of 1 opponent\'s monster until End Phase. It is destroyed at End Phase.',
    description: 'The Chem-Baroness. Zaun\'s ruthless businesswoman.',
    image: 'champions/renataglasc.jpg'
  },
  {
    id: 'piltover_020',
    name: 'Janna',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'PILTOVER',
    level: 5,
    attack: 1600,
    defense: 2200,
    rarity: 'RARE',
    effect: 'Once per turn: Negate 1 attack.',
    description: 'The Storm\'s Fury. Wind spirit of Zaun.',
    image: 'champions/janna.jpg'
  },
  // ============================================
  // SHADOW ISLES - Undead & Death (12 Champions)
  // ============================================
  {
    id: 'shadow_001',
    name: 'Thresh',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'SHADOW_ISLES',
    level: 6,
    attack: 2200,
    defense: 2400,
    rarity: 'EPIC',
    effect: 'When a monster is sent to your opponent\'s Graveyard: You can Special Summon it to your field.',
    description: 'The Chain Warden. Collector of souls.',
    image: 'champions/thresh.jpg'
  },
  {
    id: 'shadow_002',
    name: 'Viego',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'SHADOW_ISLES',
    level: 8,
    attack: 2900,
    defense: 2100,
    rarity: 'LEGENDARY',
    effect: 'When this card destroys a monster: Take control of that monster\'s position.',
    description: 'The Ruined King. His love destroyed the Blessed Isles.',
    image: 'champions/viego.jpg'
  },
  {
    id: 'shadow_003',
    name: 'Hecarim',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'SHADOW_ISLES',
    level: 7,
    attack: 2700,
    defense: 1900,
    rarity: 'EPIC',
    effect: 'When this card attacks: All your SHADOW_ISLES monsters can attack directly this turn.',
    description: 'The Shadow of War. Spectral centaur commander.',
    image: 'champions/hecarim.jpg'
  },
  {
    id: 'shadow_004',
    name: 'Kalista',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'SHADOW_ISLES',
    level: 6,
    attack: 2300,
    defense: 1500,
    rarity: 'EPIC',
    effect: 'When summoned: Banish 1 monster from your Graveyard; gain ATK equal to half its ATK.',
    description: 'The Spear of Vengeance. Spirit of retribution.',
    image: 'champions/kalista.jpg'
  },
  {
    id: 'shadow_005',
    name: 'Karthus',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'SHADOW_ISLES',
    level: 7,
    attack: 2500,
    defense: 2000,
    rarity: 'LEGENDARY',
    effect: 'If this card is destroyed: Inflict 300 damage for each monster on the field.',
    description: 'The Deathsinger. His requiem brings oblivion.',
    image: 'champions/karthus.jpg'
  },
  {
    id: 'shadow_006',
    name: 'Yorick',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'SHADOW_ISLES',
    level: 6,
    attack: 2200,
    defense: 2300,
    rarity: 'RARE',
    effect: 'Once per turn: Special Summon 1 "Mist Walker" token (ATK 500/DEF 500).',
    description: 'Shepherd of Souls. Guiding the dead to rest.',
    image: 'champions/yorick.jpg'
  },
  {
    id: 'shadow_007',
    name: 'Maokai',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'SHADOW_ISLES',
    level: 6,
    attack: 2000,
    defense: 2600,
    rarity: 'RARE',
    effect: 'Once per turn: Gain 400 Life Points.',
    description: 'The Twisted Treant. Nature spirit corrupted by the Ruination.',
    image: 'champions/maokai.jpg'
  },
  {
    id: 'shadow_008',
    name: 'Elise',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'SHADOW_ISLES',
    level: 5,
    attack: 2100,
    defense: 1700,
    rarity: 'EPIC',
    effect: 'Once per turn: Special Summon 1 "Spiderling" token (ATK 400/DEF 400).',
    description: 'The Spider Queen. Immortal through sacrifice.',
    image: 'champions/elise.jpg'
  },
  {
    id: 'shadow_009',
    name: 'Evelynn',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'SHADOW_ISLES',
    level: 6,
    attack: 2400,
    defense: 1300,
    rarity: 'EPIC',
    effect: 'This card cannot be targeted by card effects while in Attack Position.',
    description: 'Agony\'s Embrace. Demon of pain and pleasure.',
    image: 'champions/evelynn.jpg'
  },
  {
    id: 'shadow_010',
    name: 'Fiddlesticks',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'SHADOW_ISLES',
    level: 7,
    attack: 2600,
    defense: 2000,
    rarity: 'LEGENDARY',
    effect: 'When this card is summoned: Your opponent discards 1 random card.',
    description: 'The Ancient Fear. Primordial demon of terror.',
    image: 'champions/fiddlesticks.jpg'
  },
  {
    id: 'shadow_011',
    name: 'Gwen',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'SHADOW_ISLES',
    level: 5,
    attack: 2100,
    defense: 1600,
    rarity: 'RARE',
    effect: 'Once per turn: This card is unaffected by your opponent\'s card effects until end of turn.',
    description: 'The Hallowed Seamstress. A doll brought to life by love.',
    image: 'champions/gwen.jpg'
  },
  {
    id: 'shadow_012',
    name: 'Senna',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'SHADOW_ISLES',
    level: 6,
    attack: 2200,
    defense: 1900,
    rarity: 'EPIC',
    effect: 'If "Lucian" is on the field: Both gain 400 ATK.',
    description: 'The Redeemer. Sentinel who escaped the lantern.',
    image: 'champions/senna.jpg'
  },
  // ============================================
  // FRELJORD - Ice & Survival (14 Champions)
  // ============================================
  {
    id: 'freljord_001',
    name: 'Ashe',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'FRELJORD',
    level: 5,
    attack: 1900,
    defense: 1600,
    rarity: 'EPIC',
    effect: 'When this card attacks: Your opponent cannot activate Trap Cards until the end of the Damage Step.',
    description: 'The Frost Archer. Warmother of the Avarosan.',
    image: 'champions/ashe.jpg'
  },
  {
    id: 'freljord_002',
    name: 'Tryndamere',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'FRELJORD',
    level: 7,
    attack: 2800,
    defense: 1500,
    rarity: 'LEGENDARY',
    effect: 'Once per duel: This card cannot be destroyed by battle this turn.',
    description: 'The Barbarian King. Ashe\'s husband, consumed by rage.',
    image: 'champions/tryndamere.jpg'
  },
  {
    id: 'freljord_003',
    name: 'Braum',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'FRELJORD',
    level: 5,
    attack: 1600,
    defense: 2800,
    rarity: 'EPIC',
    effect: 'Your other monsters cannot be targeted for attacks.',
    description: 'The Heart of the Freljord. Protector of the innocent.',
    image: 'champions/braum.jpg'
  },
  {
    id: 'freljord_004',
    name: 'Sejuani',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'FRELJORD',
    level: 6,
    attack: 2300,
    defense: 2100,
    rarity: 'EPIC',
    effect: 'When this card attacks: The target loses 500 ATK until end of turn.',
    description: 'Fury of the North. Warmother of the Winter\'s Claw.',
    image: 'champions/sejuani.jpg'
  },
  {
    id: 'freljord_005',
    name: 'Lissandra',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'FRELJORD',
    level: 7,
    attack: 2400,
    defense: 2200,
    rarity: 'LEGENDARY',
    effect: 'Once per turn: Change 1 monster to Defense Position; it cannot change positions.',
    description: 'The Ice Witch. Ancient schemer of the Frostguard.',
    image: 'champions/lissandra.jpg'
  },
  {
    id: 'freljord_006',
    name: 'Volibear',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'FRELJORD',
    level: 8,
    attack: 2900,
    defense: 2400,
    rarity: 'LEGENDARY',
    effect: 'When this card attacks: Inflict 400 damage to your opponent.',
    description: 'The Relentless Storm. Demigod of storms and war.',
    image: 'champions/volibear.jpg'
  },
  {
    id: 'freljord_007',
    name: 'Ornn',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'FRELJORD',
    level: 8,
    attack: 2600,
    defense: 2800,
    rarity: 'LEGENDARY',
    effect: 'Once per turn: Add 1 Spell card from your Graveyard to your hand.',
    description: 'The Fire Below the Mountain. Demigod of the forge.',
    image: 'champions/ornn.jpg'
  },
  {
    id: 'freljord_008',
    name: 'Anivia',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'FRELJORD',
    level: 7,
    attack: 2500,
    defense: 2300,
    rarity: 'EPIC',
    effect: 'If this card is destroyed: Special Summon it in Defense Position during your next Standby Phase.',
    description: 'The Cryophoenix. Immortal demigod of ice.',
    image: 'champions/anivia.jpg'
  },
  {
    id: 'freljord_009',
    name: 'Olaf',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'FRELJORD',
    level: 6,
    attack: 2500,
    defense: 1400,
    rarity: 'EPIC',
    effect: 'This card is unaffected by Trap effects.',
    description: 'The Berserker. Seeking a glorious death.',
    image: 'champions/olaf.jpg'
  },
  {
    id: 'freljord_010',
    name: 'Trundle',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'FRELJORD',
    level: 6,
    attack: 2400,
    defense: 2000,
    rarity: 'RARE',
    effect: 'When this card battles: Steal 300 ATK from the opposing monster.',
    description: 'The Troll King. Cunning ruler of his tribe.',
    image: 'champions/trundle.jpg'
  },
  {
    id: 'freljord_011',
    name: 'Gragas',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'FRELJORD',
    level: 5,
    attack: 2100,
    defense: 2100,
    rarity: 'RARE',
    effect: 'Once per turn: Return 1 monster on the field to its owner\'s hand.',
    description: 'The Rabble Rouser. Master brewer seeking ingredients.',
    image: 'champions/gragas.jpg'
  },
  {
    id: 'freljord_012',
    name: 'Nunu & Willump',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'FRELJORD',
    level: 5,
    attack: 2000,
    defense: 2200,
    rarity: 'RARE',
    effect: 'Cannot be Normal Summoned. Special Summon by tributing 1 FRELJORD monster.',
    description: 'The Boy and His Yeti. Best friends on an adventure.',
    image: 'champions/nunu.jpg'
  },
  {
    id: 'freljord_013',
    name: 'Udyr',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'FRELJORD',
    level: 6,
    attack: 2300,
    defense: 2000,
    rarity: 'EPIC',
    effect: 'Once per turn: Choose an effect - Gain 500 ATK, gain 500 DEF, or inflict 300 damage.',
    description: 'The Spirit Walker. Vessel of the Freljordian spirits.',
    image: 'champions/udyr.jpg'
  },
  {
    id: 'freljord_014',
    name: 'Aurora',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'FRELJORD',
    level: 5,
    attack: 1900,
    defense: 1800,
    rarity: 'RARE',
    effect: 'Once per turn: This card can move to an adjacent Monster Zone.',
    description: 'The Witch Between Worlds. Vastayan spirit walker.',
    image: 'champions/aurora.jpg'
  },

  // ============================================
  // BILGEWATER - Pirates & Sea (11 Champions)
  // ============================================
  {
    id: 'bilgewater_001',
    name: 'Gangplank',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'BILGEWATER',
    level: 7,
    attack: 2700,
    defense: 1900,
    rarity: 'LEGENDARY',
    effect: 'Once per turn: Destroy 1 card on the field.',
    description: 'The Saltwater Scourge. Reaver King of Bilgewater.',
    image: 'champions/gangplank.jpg'
  },
  {
    id: 'bilgewater_002',
    name: 'Miss Fortune',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'BILGEWATER',
    level: 6,
    attack: 2400,
    defense: 1600,
    rarity: 'EPIC',
    effect: 'When this card attacks: Inflict 200 damage for each other BILGEWATER monster you control.',
    description: 'The Bounty Hunter. Captain seeking revenge.',
    image: 'champions/missfortune.jpg'
  },
  {
    id: 'bilgewater_003',
    name: 'Twisted Fate',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'BILGEWATER',
    level: 5,
    attack: 2000,
    defense: 1700,
    rarity: 'EPIC',
    effect: 'Once per turn: Draw 1 card, then discard 1 card.',
    description: 'The Card Master. Gambler with magical cards.',
    image: 'champions/twistedfate.jpg'
  },
  {
    id: 'bilgewater_004',
    name: 'Graves',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'BILGEWATER',
    level: 5,
    attack: 2200,
    defense: 1500,
    rarity: 'RARE',
    effect: 'This card can attack all monsters your opponent controls once each.',
    description: 'The Outlaw. Notorious mercenary and Twisted Fate\'s partner.',
    image: 'champions/graves.jpg'
  },
  {
    id: 'bilgewater_005',
    name: 'Pyke',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'BILGEWATER',
    level: 6,
    attack: 2300,
    defense: 1400,
    rarity: 'EPIC',
    effect: 'If this card destroys a monster: Inflict damage equal to that monster\'s original ATK.',
    description: 'The Bloodharbor Ripper. Undead assassin of betrayers.',
    image: 'champions/pyke.jpg'
  },
  {
    id: 'bilgewater_006',
    name: 'Nautilus',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'BILGEWATER',
    level: 7,
    attack: 2200,
    defense: 2800,
    rarity: 'EPIC',
    effect: 'When this card is summoned: Change all opponent\'s monsters to Defense Position.',
    description: 'The Titan of the Depths. Armored spirit of vengeance.',
    image: 'champions/nautilus.jpg'
  },
  {
    id: 'bilgewater_007',
    name: 'Fizz',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'BILGEWATER',
    level: 4,
    attack: 1800,
    defense: 1200,
    rarity: 'RARE',
    effect: 'Once per turn: This card is unaffected by Spell/Trap effects until end of turn.',
    description: 'The Tidal Trickster. Yordle of the seas.',
    image: 'champions/fizz.jpg'
  },
  {
    id: 'bilgewater_008',
    name: 'Nami',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'BILGEWATER',
    level: 5,
    attack: 1600,
    defense: 2000,
    rarity: 'RARE',
    effect: 'When a Spell card is activated: One monster you control gains 300 ATK.',
    description: 'The Tidecaller. Marai seeking the Moonstone.',
    image: 'champions/nami.jpg'
  },
  {
    id: 'bilgewater_009',
    name: 'Illaoi',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'BILGEWATER',
    level: 6,
    attack: 2500,
    defense: 2100,
    rarity: 'EPIC',
    effect: 'When this card destroys a monster: Gain Life Points equal to half the destroyed monster\'s ATK.',
    description: 'The Kraken Priestess. Prophet of Nagakabouros.',
    image: 'champions/illaoi.jpg'
  },
  {
    id: 'bilgewater_010',
    name: 'Tahm Kench',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'BILGEWATER',
    level: 6,
    attack: 2100,
    defense: 2500,
    rarity: 'EPIC',
    effect: 'Once per turn: Remove 1 monster from play until your next Standby Phase.',
    description: 'The River King. Demon of deals and desires.',
    image: 'champions/tahmkench.jpg'
  },
  {
    id: 'bilgewater_011',
    name: 'Nilah',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'BILGEWATER',
    level: 5,
    attack: 2100,
    defense: 1500,
    rarity: 'RARE',
    effect: 'When this card destroys a monster by battle: You and your opponent each gain 500 LP.',
    description: 'The Joy Unbound. Warrior hosting a demon of joy.',
    image: 'champions/nilah.jpg'
  },

  // ============================================
  // SHURIMA / TARGON - Ancient & Celestial (20 Champions)
  // ============================================
  {
    id: 'shurima_001',
    name: 'Azir',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'SHURIMA',
    level: 8,
    attack: 2700,
    defense: 2400,
    rarity: 'LEGENDARY',
    effect: 'Once per turn: Special Summon 1 "Sand Soldier" token (ATK 1000/DEF 500).',
    description: 'The Emperor of the Sands. Risen to reclaim Shurima.',
    image: 'champions/azir.jpg'
  },
  {
    id: 'shurima_002',
    name: 'Nasus',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'SHURIMA',
    level: 7,
    attack: 2400,
    defense: 2200,
    rarity: 'EPIC',
    effect: 'Each time a monster is destroyed: This card gains 100 ATK permanently.',
    description: 'The Curator of the Sands. Ascended guardian of knowledge.',
    image: 'champions/nasus.jpg'
  },
  {
    id: 'shurima_003',
    name: 'Renekton',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'SHURIMA',
    level: 7,
    attack: 2800,
    defense: 1800,
    rarity: 'EPIC',
    effect: 'This card gains 500 ATK when attacking.',
    description: 'The Butcher of the Sands. Ascended driven mad.',
    image: 'champions/renekton.jpg'
  },
  {
    id: 'shurima_004',
    name: 'Xerath',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'SHURIMA',
    level: 8,
    attack: 2900,
    defense: 2000,
    rarity: 'LEGENDARY',
    effect: 'Once per turn: Inflict 500 damage to your opponent.',
    description: 'The Magus Ascendant. Pure arcane energy unbound.',
    image: 'champions/xerath.jpg'
  },
  {
    id: 'shurima_005',
    name: 'Sivir',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'SHURIMA',
    level: 5,
    attack: 2100,
    defense: 1500,
    rarity: 'RARE',
    effect: 'Once per turn: Negate 1 Spell card that targets this card.',
    description: 'The Battle Mistress. Mercenary heir to Shurima.',
    image: 'champions/sivir.jpg'
  },
  {
    id: 'shurima_006',
    name: 'Taliyah',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'SHURIMA',
    level: 5,
    attack: 2000,
    defense: 1800,
    rarity: 'RARE',
    effect: 'When this card attacks: Your opponent cannot activate effects in the same column.',
    description: 'The Stoneweaver. Wandering mage of the desert.',
    image: 'champions/taliyah.jpg'
  },
  {
    id: 'shurima_007',
    name: 'Rammus',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'SHURIMA',
    level: 5,
    attack: 1500,
    defense: 2800,
    rarity: 'RARE',
    effect: 'When this card is attacked: Inflict damage to your opponent equal to half this card\'s DEF.',
    description: 'The Armordillo. Ok.',
    image: 'champions/rammus.jpg'
  },
  {
    id: 'shurima_008',
    name: 'Skarner',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'SHURIMA',
    level: 6,
    attack: 2300,
    defense: 2200,
    rarity: 'RARE',
    effect: 'When this card attacks: The target cannot activate effects until end of turn.',
    description: 'The Primordial Sovereign. Ancient brackern awakened.',
    image: 'champions/skarner.jpg'
  },
  {
    id: 'shurima_009',
    name: 'Amumu',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'SHURIMA',
    level: 4,
    attack: 1400,
    defense: 1800,
    rarity: 'RARE',
    effect: 'When this card is destroyed: All monsters on the field lose 500 ATK.',
    description: 'The Sad Mummy. Cursed child seeking friendship.',
    image: 'champions/amumu.jpg'
  },
  {
    id: 'shurima_010',
    name: 'Akshan',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'SHURIMA',
    level: 5,
    attack: 2100,
    defense: 1400,
    rarity: 'EPIC',
    effect: 'If this card destroys a monster: Special Summon 1 monster from your Graveyard.',
    description: 'The Rogue Sentinel. Wielder of the Absolver.',
    image: 'champions/akshan.jpg'
  },
  {
    id: 'shurima_011',
    name: "K'Sante",
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'SHURIMA',
    level: 6,
    attack: 2200,
    defense: 2400,
    rarity: 'EPIC',
    effect: 'Once per turn: Switch this card\'s ATK and DEF until end of turn.',
    description: 'The Pride of Nazumah. Monster hunter of the desert.',
    image: 'champions/ksante.jpg'
  },
  {
    id: 'shurima_012',
    name: 'Aurelion Sol',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'SHURIMA',
    level: 10,
    attack: 3500,
    defense: 3000,
    rarity: 'LEGENDARY',
    effect: 'Requires 2 tributes. Once per turn: Destroy all other monsters on the field.',
    description: 'The Star Forger. Celestial dragon who creates stars.',
    image: 'champions/aurelionsol.jpg'
  },
  {
    id: 'shurima_013',
    name: 'Leona',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'SHURIMA',
    level: 6,
    attack: 2100,
    defense: 2500,
    rarity: 'EPIC',
    effect: 'Once per turn: Target 1 monster; it cannot attack this turn.',
    description: 'The Radiant Dawn. Aspect of the Sun.',
    image: 'champions/leona.jpg'
  },
  {
    id: 'shurima_014',
    name: 'Diana',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'SHURIMA',
    level: 6,
    attack: 2400,
    defense: 1800,
    rarity: 'EPIC',
    effect: 'Gains 400 ATK during your opponent\'s turn.',
    description: 'Scorn of the Moon. Aspect of the Moon.',
    image: 'champions/diana.jpg'
  },
  {
    id: 'shurima_015',
    name: 'Pantheon',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'SHURIMA',
    level: 7,
    attack: 2600,
    defense: 2000,
    rarity: 'LEGENDARY',
    effect: 'This card cannot be destroyed by card effects.',
    description: 'The Unbreakable Spear. A mortal who defied the gods.',
    image: 'champions/pantheon.jpg'
  },
  {
    id: 'shurima_016',
    name: 'Taric',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'SHURIMA',
    level: 5,
    attack: 1700,
    defense: 2300,
    rarity: 'RARE',
    effect: 'Once per turn: Target 1 monster; it cannot be destroyed this turn.',
    description: 'The Shield of Valoran. Aspect of the Protector.',
    image: 'champions/taric.jpg'
  },
  {
    id: 'shurima_017',
    name: 'Soraka',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'SHURIMA',
    level: 5,
    attack: 1400,
    defense: 2200,
    rarity: 'RARE',
    effect: 'Once per turn: Gain 800 Life Points.',
    description: 'The Starchild. Celestial healer descended to Runeterra.',
    image: 'champions/soraka.jpg'
  },
  {
    id: 'shurima_018',
    name: 'Zoe',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'SHURIMA',
    level: 5,
    attack: 1900,
    defense: 1600,
    rarity: 'EPIC',
    effect: 'When this card is summoned: Add 1 random Spell from your deck to your hand.',
    description: 'The Aspect of Twilight. Cosmic trickster messenger.',
    image: 'champions/zoe.jpg'
  },
  {
    id: 'shurima_019',
    name: 'Aphelios',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'SHURIMA',
    level: 6,
    attack: 2300,
    defense: 1700,
    rarity: 'EPIC',
    effect: 'This card has a different effect based on the turn number (cycles every 5 turns).',
    description: 'The Weapon of the Faithful. Lunari assassin.',
    image: 'champions/aphelios.jpg'
  },
  {
    id: 'shurima_020',
    name: 'Zilean',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'SHURIMA',
    level: 6,
    attack: 2000,
    defense: 2100,
    rarity: 'EPIC',
    effect: 'If a monster you control would be destroyed: Return it to the field at end of turn instead.',
    description: 'The Chronokeeper. Time mage trapped in a loop.',
    image: 'champions/zilean.jpg'
  },

  // ============================================
  // THE VOID - Otherworldly (9 Champions)
  // ============================================
  {
    id: 'void_001',
    name: "Cho'Gath",
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'THE_VOID',
    level: 8,
    attack: 2800,
    defense: 2600,
    rarity: 'LEGENDARY',
    effect: 'Each time this card destroys a monster: Gain 200 ATK and 200 DEF permanently.',
    description: 'The Terror of the Void. Endless hunger incarnate.',
    image: 'champions/chogath.jpg'
  },
  {
    id: 'void_002',
    name: "Kha'Zix",
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'THE_VOID',
    level: 6,
    attack: 2400,
    defense: 1600,
    rarity: 'EPIC',
    effect: 'When this card destroys a monster: Choose to gain 300 ATK, piercing, or double attack.',
    description: 'The Voidreaver. Evolving predator from the Void.',
    image: 'champions/khazix.jpg'
  },
  {
    id: 'void_003',
    name: "Vel'Koz",
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'THE_VOID',
    level: 7,
    attack: 2500,
    defense: 2100,
    rarity: 'EPIC',
    effect: 'Once per turn: Look at your opponent\'s hand.',
    description: 'The Eye of the Void. Seeker of knowledge through destruction.',
    image: 'champions/velkoz.jpg'
  },
  {
    id: 'void_004',
    name: "Rek'Sai",
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'THE_VOID',
    level: 6,
    attack: 2500,
    defense: 2000,
    rarity: 'EPIC',
    effect: 'Once per turn: This card can attack a monster in Defense Position.',
    description: 'The Void Burrower. Queen of the Xer\'Sai.',
    image: 'champions/reksai.jpg'
  },
  {
    id: 'void_005',
    name: "Kog'Maw",
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'THE_VOID',
    level: 5,
    attack: 2000,
    defense: 1400,
    rarity: 'RARE',
    effect: 'This card inflicts piercing damage. If destroyed: Inflict 500 damage to your opponent.',
    description: 'The Mouth of the Abyss. Curious devourer from the Void.',
    image: 'champions/kogmaw.jpg'
  },
  {
    id: 'void_006',
    name: 'Kassadin',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'THE_VOID',
    level: 7,
    attack: 2600,
    defense: 2000,
    rarity: 'LEGENDARY',
    effect: 'Once per turn: Banish 1 card on the field until your next Standby Phase.',
    description: 'The Void Walker. Father hunting the Void to save his daughter.',
    image: 'champions/kassadin.jpg'
  },
  {
    id: 'void_007',
    name: "Kai'Sa",
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'THE_VOID',
    level: 6,
    attack: 2300,
    defense: 1800,
    rarity: 'EPIC',
    effect: 'Gains 100 ATK for each Spell card in your Graveyard.',
    description: 'Daughter of the Void. Kassadin\'s daughter, Void-touched.',
    image: 'champions/kaisa.jpg'
  },
  {
    id: 'void_008',
    name: 'Malzahar',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'THE_VOID',
    level: 6,
    attack: 2200,
    defense: 1900,
    rarity: 'EPIC',
    effect: 'Once per turn: Target 1 monster; it cannot attack or use effects until your next turn.',
    description: 'The Prophet of the Void. Seer spreading Void\'s message.',
    image: 'champions/malzahar.jpg'
  },
  {
    id: 'void_009',
    name: "Bel'Veth",
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'THE_VOID',
    level: 9,
    attack: 3200,
    defense: 2400,
    rarity: 'LEGENDARY',
    effect: 'When this card destroys a monster: Special Summon it as a Void creature under your control.',
    description: 'The Empress of the Void. New Void god consuming all.',
    image: 'champions/belveth.jpg'
  },

  // ============================================
  // IXTAL - Elemental Jungle (7 Champions)
  // ============================================
  {
    id: 'ixtal_001',
    name: 'Qiyana',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'IXTAL',
    level: 6,
    attack: 2400,
    defense: 1600,
    rarity: 'LEGENDARY',
    effect: 'Once per turn: Choose an element - Fire (inflict 400 damage), Water (gain 400 LP), or Earth (gain 400 DEF).',
    description: 'Empress of the Elements. Ixtali princess seeking power.',
    image: 'champions/qiyana.jpg'
  },
  {
    id: 'ixtal_002',
    name: 'Nidalee',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'IXTAL',
    level: 5,
    attack: 2100,
    defense: 1700,
    rarity: 'RARE',
    effect: 'Once per turn: Change this card\'s stats to 2400 ATK/1400 DEF or 1800 ATK/2000 DEF.',
    description: 'The Bestial Huntress. Shapeshifter raised by cougars.',
    image: 'champions/nidalee.jpg'
  },
  {
    id: 'ixtal_003',
    name: 'Rengar',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'IXTAL',
    level: 6,
    attack: 2500,
    defense: 1500,
    rarity: 'EPIC',
    effect: 'When this card attacks a monster with lower ATK: Destroy it without damage calculation.',
    description: 'The Pridestalker. Hunter seeking the ultimate prey.',
    image: 'champions/rengar.jpg'
  },
  {
    id: 'ixtal_004',
    name: 'Neeko',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'IXTAL',
    level: 4,
    attack: 1700,
    defense: 1700,
    rarity: 'RARE',
    effect: 'Once per turn: Copy the name and ATK of another monster you control until end of turn.',
    description: 'The Curious Chameleon. Vastayan shapeshifter.',
    image: 'champions/neeko.jpg'
  },
  {
    id: 'ixtal_005',
    name: 'Zyra',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'IXTAL',
    level: 5,
    attack: 2000,
    defense: 1800,
    rarity: 'RARE',
    effect: 'Once per turn: Special Summon 1 "Thorn Spitter" token (ATK 500/DEF 500).',
    description: 'Rise of the Thorns. Plant creature awakened.',
    image: 'champions/zyra.jpg'
  },
  {
    id: 'ixtal_006',
    name: 'Malphite',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'IXTAL',
    level: 7,
    attack: 2200,
    defense: 3000,
    rarity: 'EPIC',
    effect: 'When this card attacks: Your opponent\'s monsters lose 500 ATK until end of turn.',
    description: 'Shard of the Monolith. Living mountain fragment.',
    image: 'champions/malphite.jpg'
  },
  {
    id: 'ixtal_007',
    name: 'Milio',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'IXTAL',
    level: 4,
    attack: 1400,
    defense: 1900,
    rarity: 'RARE',
    effect: 'Once per turn: Target 1 monster; it gains 500 ATK and cannot be destroyed by effects this turn.',
    description: 'The Gentle Flame. Young fire mage with soothing flames.',
    image: 'champions/milio.jpg'
  },

  // ============================================
  // DARKIN - Corrupted Ascended (5 Champions)
  // ============================================
  {
    id: 'darkin_001',
    name: 'Aatrox',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'DARKIN',
    level: 8,
    attack: 3000,
    defense: 2200,
    rarity: 'LEGENDARY',
    effect: 'When this card inflicts battle damage: Gain LP equal to half the damage. Cannot be destroyed once per turn.',
    description: 'The Darkin Blade. World ender seeking oblivion.',
    image: 'champions/aatrox.jpg'
  },
  {
    id: 'darkin_002',
    name: 'Varus',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'DARKIN',
    level: 6,
    attack: 2400,
    defense: 1700,
    rarity: 'EPIC',
    effect: 'Once per turn: Inflict 300 damage for each monster your opponent controls.',
    description: 'The Arrow of Retribution. Three souls in one body.',
    image: 'champions/varus.jpg'
  },
  {
    id: 'darkin_003',
    name: 'Kayn',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'DARKIN',
    level: 6,
    attack: 2300,
    defense: 1800,
    rarity: 'EPIC',
    effect: 'Once per duel: Transform into "Shadow Assassin" (2600 ATK) or "Rhaast" (2200 ATK/2600 DEF, lifesteal).',
    description: 'The Shadow Reaper. Wielder of Rhaast, the Darkin scythe.',
    image: 'champions/kayn.jpg'
  },
  {
    id: 'darkin_004',
    name: 'Naafiri',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'DARKIN',
    level: 5,
    attack: 2200,
    defense: 1500,
    rarity: 'RARE',
    effect: 'When this card attacks: Special Summon 1 "Packmate" token (ATK 400/DEF 400).',
    description: 'The Hound of a Hundred Bites. Darkin of the dune hounds.',
    image: 'champions/naafiri.jpg'
  },

  // ============================================
  // YORDLE - Bandle City (14 Champions)
  // ============================================
  {
    id: 'yordle_001',
    name: 'Teemo',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'YORDLE',
    level: 3,
    attack: 1200,
    defense: 1000,
    rarity: 'EPIC',
    effect: 'When this card inflicts battle damage: Place 1 "Poison" counter on your opponent (300 damage per counter during Standby).',
    description: 'The Swift Scout. Cute but deadly yordle.',
    image: 'champions/teemo.jpg'
  },
  {
    id: 'yordle_002',
    name: 'Veigar',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'YORDLE',
    level: 6,
    attack: 2200,
    defense: 1800,
    rarity: 'LEGENDARY',
    effect: 'Gains 100 ATK each time any Spell card is activated.',
    description: 'The Tiny Master of Evil. Yordle mage obsessed with power.',
    image: 'champions/veigar.jpg'
  },
  {
    id: 'yordle_003',
    name: 'Lulu',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'YORDLE',
    level: 4,
    attack: 1400,
    defense: 1600,
    rarity: 'RARE',
    effect: 'Once per turn: Target 1 monster; it gains 800 ATK or is changed to a 1/1 creature until end of turn.',
    description: 'The Fae Sorceress. Whimsical yordle with Pix.',
    image: 'champions/lulu.jpg'
  },
  {
    id: 'yordle_004',
    name: 'Tristana',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'YORDLE',
    level: 5,
    attack: 2100,
    defense: 1400,
    rarity: 'RARE',
    effect: 'Gains 200 ATK for each YORDLE monster you control.',
    description: 'The Yordle Gunner. Cannon-wielding commando.',
    image: 'champions/tristana.jpg'
  },
  {
    id: 'yordle_005',
    name: 'Poppy',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'YORDLE',
    level: 5,
    attack: 1800,
    defense: 2300,
    rarity: 'RARE',
    effect: 'Your opponent cannot Special Summon monsters while this card is on the field.',
    description: 'Keeper of the Hammer. Seeking a legendary hero.',
    image: 'champions/poppy.jpg'
  },
  {
    id: 'yordle_006',
    name: 'Heimerdinger',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'YORDLE',
    level: 5,
    attack: 1600,
    defense: 2000,
    rarity: 'EPIC',
    effect: 'Once per turn: Special Summon 1 "H-28G Turret" token (ATK 800/DEF 800).',
    description: 'The Revered Inventor. Brilliant yordle scientist.',
    image: 'champions/heimerdinger.jpg'
  },
  {
    id: 'yordle_007',
    name: 'Ziggs',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'YORDLE',
    level: 5,
    attack: 2000,
    defense: 1500,
    rarity: 'RARE',
    effect: 'Once per turn: Destroy 1 Spell/Trap card.',
    description: 'The Hexplosives Expert. Explosive yordle inventor.',
    image: 'champions/ziggs.jpg'
  },
  {
    id: 'yordle_008',
    name: 'Rumble',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'YORDLE',
    level: 5,
    attack: 2200,
    defense: 1700,
    rarity: 'RARE',
    effect: 'Once per turn: Inflict 400 damage to your opponent.',
    description: 'The Mechanized Menace. Yordle in a mech suit.',
    image: 'champions/rumble.jpg'
  },
  {
    id: 'yordle_009',
    name: 'Kennen',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'YORDLE',
    level: 4,
    attack: 1700,
    defense: 1400,
    rarity: 'RARE',
    effect: 'When this card attacks directly: Inflict 300 additional damage.',
    description: 'The Heart of the Tempest. Lightning ninja yordle.',
    image: 'champions/kennen.jpg'
  },
  {
    id: 'yordle_010',
    name: 'Gnar',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'YORDLE',
    level: 5,
    attack: 1800,
    defense: 1600,
    rarity: 'EPIC',
    effect: 'After 3 turns: Transform into "Mega Gnar" (2800 ATK/2400 DEF) for 2 turns.',
    description: 'The Missing Link. Prehistoric yordle unfrozen.',
    image: 'champions/gnar.jpg'
  },
  {
    id: 'yordle_011',
    name: 'Kled',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'YORDLE',
    level: 6,
    attack: 2400,
    defense: 1800,
    rarity: 'EPIC',
    effect: 'If this card would be destroyed: Instead, reduce ATK to 1600 and remain on field (once per duel).',
    description: 'The Cantankerous Cavalier. Noxian yordle and Skaarl.',
    image: 'champions/kled.jpg'
  },
  {
    id: 'yordle_012',
    name: 'Corki',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'YORDLE',
    level: 5,
    attack: 2000,
    defense: 1600,
    rarity: 'RARE',
    effect: 'Half of all battle damage this card inflicts is also inflicted as effect damage.',
    description: 'The Daring Bombardier. Yordle flying ace.',
    image: 'champions/corki.jpg'
  },
  {
    id: 'yordle_013',
    name: 'Vex',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'YORDLE',
    level: 5,
    attack: 2100,
    defense: 1700,
    rarity: 'EPIC',
    effect: 'When an opponent\'s monster is Special Summoned: Inflict 400 damage to your opponent.',
    description: 'The Gloomist. Depressed yordle with a living shadow.',
    image: 'champions/vex.jpg'
  },
  {
    id: 'yordle_014',
    name: 'Yuumi',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'YORDLE',
    level: 3,
    attack: 800,
    defense: 1200,
    rarity: 'RARE',
    effect: 'Attach to another monster you control; it gains 600 ATK. If it would be destroyed, destroy this card instead.',
    description: 'The Magical Cat. Book-riding cat seeking her master.',
    image: 'champions/yuumi.jpg'
  },

  // ============================================
  // RUNETERRA - Unaffiliated Wanderers (11 Champions)
  // ============================================
  {
    id: 'runeterra_001',
    name: 'Ryze',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'RUNETERRA',
    level: 7,
    attack: 2500,
    defense: 2200,
    rarity: 'LEGENDARY',
    effect: 'Once per turn: Add 1 Spell card from your Graveyard to your hand.',
    description: 'The Rune Mage. Collector and protector of World Runes.',
    image: 'champions/ryze.jpg'
  },
  {
    id: 'runeterra_002',
    name: 'Jax',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'RUNETERRA',
    level: 6,
    attack: 2400,
    defense: 2000,
    rarity: 'EPIC',
    effect: 'This card gains 200 ATK after each battle it survives.',
    description: 'Grandmaster at Arms. Last of Icathia, wielding a lamppost.',
    image: 'champions/jax.jpg'
  },
  {
    id: 'runeterra_003',
    name: 'Bard',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'RUNETERRA',
    level: 7,
    attack: 2200,
    defense: 2500,
    rarity: 'LEGENDARY',
    effect: 'Once per turn: Place 1 "Chime" counter on a card in your deck (when drawn, gain 300 LP).',
    description: 'The Wandering Caretaker. Cosmic spirit protecting existence.',
    image: 'champions/bard.jpg'
  },
  {
    id: 'runeterra_004',
    name: 'Kindred',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'RUNETERRA',
    level: 6,
    attack: 2300,
    defense: 1900,
    rarity: 'EPIC',
    effect: 'Once per turn: Mark 1 monster. If it is destroyed this turn, draw 1 card.',
    description: 'The Eternal Hunters. Lamb and Wolf, spirits of death.',
    image: 'champions/kindred.jpg'
  },
  {
    id: 'runeterra_005',
    name: 'Annie',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'RUNETERRA',
    level: 4,
    attack: 1600,
    defense: 1400,
    rarity: 'RARE',
    effect: 'After this card attacks 4 times: Special Summon "Tibbers" (ATK 2500/DEF 2000).',
    description: 'The Dark Child. Little girl with a fiery temper and teddy bear.',
    image: 'champions/annie.jpg'
  },
  {
    id: 'runeterra_006',
    name: 'Brand',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'RUNETERRA',
    level: 6,
    attack: 2400,
    defense: 1600,
    rarity: 'EPIC',
    effect: 'When this card attacks: Inflict 200 damage to all your opponent\'s monsters.',
    description: 'The Burning Vengeance. Man possessed by a World Rune.',
    image: 'champions/brand.jpg'
  },
  {
    id: 'runeterra_007',
    name: 'Nocturne',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'RUNETERRA',
    level: 6,
    attack: 2500,
    defense: 1700,
    rarity: 'EPIC',
    effect: 'Your opponent cannot see this card\'s ATK/DEF until it battles.',
    description: 'The Eternal Nightmare. Living nightmare from the spirit realm.',
    image: 'champions/nocturne.jpg'
  },
  {
    id: 'runeterra_008',
    name: 'Shaco',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'RUNETERRA',
    level: 5,
    attack: 2100,
    defense: 1400,
    rarity: 'RARE',
    effect: 'Once per turn: Special Summon 1 "Clone" token with the same stats. Destroy it at End Phase.',
    description: 'The Demon Jester. Malicious demon puppet.',
    image: 'champions/shaco.jpg'
  },
  {
    id: 'runeterra_009',
    name: 'Hwei',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'RUNETERRA',
    level: 5,
    attack: 1900,
    defense: 1800,
    rarity: 'EPIC',
    effect: 'Once per turn: Choose - inflict 400 damage, gain 400 LP, or draw 1 card.',
    description: 'The Visionary. Artist who paints emotions into reality.',
    image: 'champions/hwei.jpg'
  },
  {
    id: 'runeterra_010',
    name: 'Smolder',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'RUNETERRA',
    level: 4,
    attack: 1500,
    defense: 1300,
    rarity: 'RARE',
    effect: 'Each time you activate a Spell: This card gains 100 ATK permanently.',
    description: 'The Fiery Fledgling. Baby dragon learning to fly.',
    image: 'champions/smolder.jpg'
  },
  {
    id: 'runeterra_011',
    name: 'Mel',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    region: 'RUNETERRA',
    level: 5,
    attack: 1800,
    defense: 2100,
    rarity: 'RARE',
    effect: 'Once per turn: Look at the top 3 cards of your deck. Add 1 to your hand, shuffle the rest.',
    description: 'The Radiant Guardian. Noxian councilor of Piltover.',
    image: 'champions/mel.jpg'
  },

  // ============================================
  // SUMMONER SPELLS
  // ============================================
  { id: 'spell_001', name: 'Flash', type: 'SUMMONER_SPELL', rarity: 'COMMON', summonerEffect: 'Change the battle position of 1 monster you control.', description: 'Instantly reposition on the battlefield.', image: 'spells/flash.jpg' },
  { id: 'spell_002', name: 'Ignite', type: 'SUMMONER_SPELL', rarity: 'COMMON', summonerEffect: 'Inflict 800 damage to your opponent.', description: 'Set your enemies ablaze.', image: 'spells/ignite.jpg' },
  { id: 'spell_003', name: 'Teleport', type: 'SUMMONER_SPELL', rarity: 'RARE', summonerEffect: 'Special Summon 1 monster from your hand.', description: 'Instantly join the battle from anywhere.', image: 'spells/teleport.jpg' },
  { id: 'spell_004', name: 'Heal', type: 'SUMMONER_SPELL', rarity: 'COMMON', summonerEffect: 'Gain 1000 Life Points.', description: 'Restore your strength.', image: 'spells/heal.jpg' },
  { id: 'spell_005', name: 'Ghost', type: 'SUMMONER_SPELL', rarity: 'RARE', summonerEffect: 'All your monsters can attack directly this turn.', description: 'Phase through enemy defenses.', image: 'spells/ghost.jpg' },
  { id: 'spell_006', name: 'Barrier', type: 'SUMMONER_SPELL', rarity: 'COMMON', summonerEffect: 'Target monster cannot be destroyed by battle this turn.', description: 'A protective shield absorbs the blow.', image: 'spells/barrier.jpg' },
  { id: 'spell_007', name: 'Cleanse', type: 'SUMMONER_SPELL', rarity: 'RARE', summonerEffect: 'Negate all effects targeting your monsters.', description: 'Remove all hindrances.', image: 'spells/cleanse.jpg' },
  { id: 'spell_008', name: 'Smite', type: 'SUMMONER_SPELL', rarity: 'COMMON', summonerEffect: 'Destroy 1 monster with 1500 or less ATK.', description: 'Strike down the weak.', image: 'spells/smite.jpg' },
  { id: 'spell_009', name: 'Snowball', type: 'SUMMONER_SPELL', rarity: 'COMMON', summonerEffect: 'Target 1 opponent\'s monster; during your next turn, you can attack it directly.', description: 'Mark your target for elimination.', image: 'spells/snowball.jpg' },
  { id: 'spell_010', name: 'Clarity', type: 'SUMMONER_SPELL', rarity: 'RARE', summonerEffect: 'Draw 2 cards.', description: 'Clear your mind and see the path forward.', image: 'spells/clarity.jpg' },
  { id: 'spell_011', name: 'Exhaust', type: 'SUMMONER_SPELL', rarity: 'COMMON', summonerEffect: 'Target monster loses half its ATK until end of turn.', description: 'Exhaust your enemy\'s strength.', image: 'spells/exhaust.jpg' },

  // ============================================
  // ITEMS & RUNES (imported from cards-items-runes.js)
  // ============================================
  ...newItems,
  ...newRunes,
];
// Pack Types
export const packs = [
  {
    id: 'starter_pack',
    name: 'Starter Pack',
    description: 'A basic pack for beginners. Contains 5 cards with guaranteed common cards.',
    price: 100,
    cardCount: 5,
    image: 'starter_pack.jpg',
    rarityOdds: {
      COMMON: 0.70,    // 70% chance
      RARE: 0.25,      // 25% chance
      EPIC: 0.05,      // 5% chance
      LEGENDARY: 0.00  // 0% chance
    }
  },
  {
    id: 'champion_pack',
    name: 'Champion Pack',
    description: 'A powerful pack featuring champion cards. Contains 5 cards with better odds.',
    price: 250,
    cardCount: 5,
    image: 'champion_pack.jpg',
    rarityOdds: {
      COMMON: 0.40,    // 40% chance
      RARE: 0.35,      // 35% chance
      EPIC: 0.20,      // 20% chance
      LEGENDARY: 0.05  // 5% chance
    }
  },
  {
    id: 'legendary_pack',
    name: 'Legendary Pack',
    description: 'The ultimate pack! Contains 7 cards with guaranteed Epic or Legendary card.',
    price: 500,
    cardCount: 7,
    image: 'legendary_pack.jpg',
    rarityOdds: {
      COMMON: 0.20,    // 20% chance
      RARE: 0.30,      // 30% chance
      EPIC: 0.35,      // 35% chance
      LEGENDARY: 0.15  // 15% chance
    },
    guaranteedRarity: 'EPIC' // At least one Epic or better
  }
];

// Helper function to get cards by rarity
export function getCardsByRarity(rarity) {
  return cards.filter(card => card.rarity === rarity);
}

// Helper function to open a pack
export function openPack(packId) {
  const pack = packs.find(p => p.id === packId);
  if (!pack) return null;

  const pulledCards = [];
  const { cardCount, rarityOdds, guaranteedRarity } = pack;

  // Generate cards based on odds
  for (let i = 0; i < cardCount; i++) {
    const isLastCard = i === cardCount - 1;

    // If this is the last card and we have a guaranteed rarity, ensure we meet it
    if (isLastCard && guaranteedRarity) {
      const hasGuaranteed = pulledCards.some(card =>
        card.rarity === guaranteedRarity || card.rarity === 'LEGENDARY'
      );

      if (!hasGuaranteed) {
        // Force guaranteed rarity
        const guaranteedCards = cards.filter(c =>
          c.rarity === guaranteedRarity || c.rarity === 'LEGENDARY'
        );
        const randomCard = guaranteedCards[Math.floor(Math.random() * guaranteedCards.length)];
        pulledCards.push({ ...randomCard });
        continue;
      }
    }

    // Normal random card based on odds
    const random = Math.random();
    let rarity;
    let cumulative = 0;

    for (const [rarityKey, odds] of Object.entries(rarityOdds)) {
      cumulative += odds;
      if (random <= cumulative) {
        rarity = rarityKey;
        break;
      }
    }

    const availableCards = cards.filter(c => c.rarity === rarity);
    if (availableCards.length > 0) {
      const randomCard = availableCards[Math.floor(Math.random() * availableCards.length)];
      pulledCards.push({ ...randomCard });
    }
  }

  return {
    pack: pack,
    cards: pulledCards
  };
}

export function getRandomDeck(deckSize = 40) {
  const deck = [];
  const monsters = cards.filter(c => c.type === 'MONSTER');
  const items = cards.filter(c => c.type === 'ITEM');
  const runes = cards.filter(c => c.type === 'RUNE');
  const summonerSpells = cards.filter(c => c.type === 'SUMMONER_SPELL');

  // Build a balanced deck: 20 monsters, 10 items, 5 runes, 5 summoner spells
  for (let i = 0; i < 20; i++) {
    const randomCard = monsters[Math.floor(Math.random() * monsters.length)];
    deck.push({ ...randomCard });
  }
  for (let i = 0; i < 10; i++) {
    const randomCard = items[Math.floor(Math.random() * items.length)];
    deck.push({ ...randomCard });
  }
  for (let i = 0; i < 5; i++) {
    const randomCard = runes[Math.floor(Math.random() * runes.length)];
    deck.push({ ...randomCard });
  }
  for (let i = 0; i < 5; i++) {
    const randomCard = summonerSpells[Math.floor(Math.random() * summonerSpells.length)];
    deck.push({ ...randomCard });
  }

  // Shuffle the deck
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
}

export function getStarterDeck() {
  // A balanced starter deck with cards from different regions
  const monsters = cards.filter(c => c.type === 'MONSTER');
  const items = cards.filter(c => c.type === 'ITEM');
  const runes = cards.filter(c => c.type === 'RUNE');
  const summonerSpells = cards.filter(c => c.type === 'SUMMONER_SPELL');

  const deck = [
    ...Array(20).fill(null).map(() => ({ ...monsters[Math.floor(Math.random() * monsters.length)] })),
    ...Array(10).fill(null).map(() => ({ ...items[Math.floor(Math.random() * items.length)] })),
    ...Array(5).fill(null).map(() => ({ ...runes[Math.floor(Math.random() * runes.length)] })),
    ...Array(5).fill(null).map(() => ({ ...summonerSpells[Math.floor(Math.random() * summonerSpells.length)] })),
  ];

  // Shuffle the deck
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
}
