export const cards = [
  // Monster Cards - LoL Champions
  {
    id: 'card_001',
    name: 'Garen',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    attribute: 'LIGHT',
    level: 6,
    attack: 2500,
    defense: 2200,
    rarity: 'EPIC',
    effect: 'Once per turn: You can gain 500 Life Points.',
    description: 'The Might of Demacia. A stalwart defender of his homeland.',
    image: 'garen.jpg'
  },
  {
    id: 'card_002',
    name: 'Lux',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    attribute: 'LIGHT',
    level: 5,
    attack: 2000,
    defense: 1800,
    rarity: 'RARE',
    effect: 'When this card attacks: Destroy 1 Spell/Trap card your opponent controls.',
    description: 'The Lady of Luminosity, master of light magic.',
    image: 'lux.jpg'
  },
  {
    id: 'card_003',
    name: 'Darius',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    attribute: 'DARK',
    level: 7,
    attack: 2800,
    defense: 2000,
    rarity: 'LEGENDARY',
    effect: 'If this card destroys a monster in battle: Inflict 500 damage to your opponent.',
    description: 'The Hand of Noxus, a brutal executioner.',
    image: 'darius.jpg'
  },
  {
    id: 'card_004',
    name: 'Yasuo',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    attribute: 'WIND',
    level: 6,
    attack: 2400,
    defense: 1600,
    rarity: 'EPIC',
    effect: 'When your opponent activates a Spell Card: You can negate that activation.',
    description: 'The Unforgiven, wandering swordsman.',
    image: 'yasuo.jpg'
  },
  {
    id: 'card_005',
    name: 'Ahri',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    attribute: 'FIRE',
    level: 5,
    attack: 1900,
    defense: 1500,
    rarity: 'EPIC',
    effect: 'Once per turn: You can target 1 monster your opponent controls; take control of it until the End Phase.',
    description: 'The Nine-Tailed Fox, a charming enchantress.',
    image: 'ahri.jpg'
  },
  {
    id: 'card_006',
    name: 'Zed',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    attribute: 'DARK',
    level: 6,
    attack: 2300,
    defense: 1700,
    rarity: 'LEGENDARY',
    effect: 'This card can attack twice during each Battle Phase.',
    description: 'The Master of Shadows.',
    image: 'zed.jpg'
  },
  {
    id: 'card_007',
    name: 'Jinx',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    attribute: 'FIRE',
    level: 5,
    attack: 2100,
    defense: 1200,
    rarity: 'RARE',
    effect: 'When this card is summoned: Inflict 300 damage to your opponent.',
    description: 'The Loose Cannon of Zaun.',
    image: 'jinx.jpg'
  },
  {
    id: 'card_008',
    name: 'Ezreal',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    attribute: 'LIGHT',
    level: 4,
    attack: 1700,
    defense: 1400,
    rarity: 'RARE',
    effect: 'Each time you activate a Spell Card: Inflict 200 damage to your opponent.',
    description: 'The Prodigal Explorer.',
    image: 'ezreal.jpg'
  },
  {
    id: 'card_009',
    name: 'Thresh',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    attribute: 'DARK',
    level: 6,
    attack: 2200,
    defense: 2400,
    rarity: 'EPIC',
    effect: 'When a monster is sent to your opponent\'s Graveyard: You can Special Summon it to your field.',
    description: 'The Chain Warden.',
    image: 'thresh.jpg'
  },
  {
    id: 'card_010',
    name: 'Ashe',
    type: 'MONSTER',
    monsterType: 'EFFECT',
    attribute: 'WATER',
    level: 5,
    attack: 1900,
    defense: 1600,
    rarity: 'RARE',
    effect: 'When this card attacks: Your opponent cannot activate Trap Cards until the end of the Damage Step.',
    description: 'The Frost Archer.',
    image: 'ashe.jpg'
  },

  // Spell Cards
  {
    id: 'card_011',
    name: 'Flash',
    type: 'SPELL',
    rarity: 'COMMON',
    spellEffect: 'Change the battle position of 1 monster you control.',
    description: 'Instantly reposition on the battlefield.',
    image: 'flash.jpg'
  },
  {
    id: 'card_012',
    name: 'Ignite',
    type: 'SPELL',
    rarity: 'COMMON',
    spellEffect: 'Inflict 800 damage to your opponent.',
    description: 'Set your enemies ablaze.',
    image: 'ignite.jpg'
  },
  {
    id: 'card_013',
    name: 'Teleport',
    type: 'SPELL',
    rarity: 'RARE',
    spellEffect: 'Special Summon 1 monster from your hand.',
    description: 'Instantly join the battle from anywhere.',
    image: 'teleport.jpg'
  },
  {
    id: 'card_014',
    name: 'Heal',
    type: 'SPELL',
    rarity: 'COMMON',
    spellEffect: 'Gain 1000 Life Points.',
    description: 'Restore your strength.',
    image: 'heal.jpg'
  },
  {
    id: 'card_015',
    name: 'Baron Buff',
    type: 'SPELL',
    rarity: 'LEGENDARY',
    spellEffect: 'All monsters you control gain 500 ATK until the end of this turn.',
    description: 'The power of Baron Nashor flows through your team.',
    image: 'baron.jpg'
  },

  // Trap Cards
  {
    id: 'card_016',
    name: 'Exhaust',
    type: 'TRAP',
    rarity: 'COMMON',
    trapEffect: 'When an opponent\'s monster declares an attack: Negate that attack, and if you do, halve that monster\'s ATK.',
    description: 'Exhaust your enemy\'s strength.',
    image: 'exhaust.jpg'
  },
  {
    id: 'card_017',
    name: 'Hextech Trap',
    type: 'TRAP',
    rarity: 'RARE',
    trapEffect: 'When your opponent Normal or Special Summons a monster: Return it to their hand.',
    description: 'Advanced Hextech technology.',
    image: 'hextech.jpg'
  },
  {
    id: 'card_018',
    name: 'Stopwatch',
    type: 'TRAP',
    rarity: 'EPIC',
    trapEffect: 'When a monster you control would be destroyed: It is not destroyed.',
    description: 'Freeze time for a crucial moment.',
    image: 'stopwatch.jpg'
  },
  {
    id: 'card_019',
    name: 'Ward Reveal',
    type: 'TRAP',
    rarity: 'COMMON',
    trapEffect: 'Look at all Set cards your opponent controls.',
    description: 'Vision is key to victory.',
    image: 'ward.jpg'
  },
  {
    id: 'card_020',
    name: 'Guardian Angel',
    type: 'TRAP',
    rarity: 'EPIC',
    trapEffect: 'When a monster you control is destroyed: Special Summon it back to the field during the End Phase.',
    description: 'Return from the brink of defeat.',
    image: 'guardian_angel.jpg'
  }
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
  for (let i = 0; i < deckSize; i++) {
    const randomCard = cards[Math.floor(Math.random() * cards.length)];
    deck.push({ ...randomCard });
  }
  return deck;
}

export function getStarterDeck() {
  // A balanced starter deck
  return [
    ...Array(15).fill(null).map(() => ({ ...cards[Math.floor(Math.random() * 10)] })), // Monsters
    ...Array(10).fill(null).map(() => ({ ...cards[10 + Math.floor(Math.random() * 5)] })), // Spells
    ...Array(5).fill(null).map(() => ({ ...cards[15 + Math.floor(Math.random() * 5)] })), // Traps
  ];
}
