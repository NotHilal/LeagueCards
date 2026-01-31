// ============================================
// BALANCED ITEMS & RUNES - FULL REDESIGN
// ============================================
// spellType: NORMAL_SPELL, CONTINUOUS_SPELL, EQUIP_SPELL, NORMAL_TRAP, CONTINUOUS_TRAP, EQUIP_TRAP
// equipTarget: ALLY, ENEMY (for equip cards)
// ============================================

export const items = [
  // ============================================
  // AD ITEMS - EQUIP SPELLS
  // ============================================
  {
    id: 'item_ad_001',
    name: 'Infinity Edge',
    type: 'ITEM',
    spellType: 'EQUIP_SPELL',
    equipTarget: 'ALLY',
    category: 'AD',
    rarity: 'LEGENDARY',
    goldCost: 400,
    itemEffect: 'Once per turn, when equipped Champion destroys a monster: It may attack again, but cannot attack directly this turn.',
    description: '[Magic - Equip] Attach to your Champion. Critical strikes become devastating. When your equipped Champion destroys a monster, it can attack again (but not directly).',
    image: 'items/infinityedge.jpg'
  },
  {
    id: 'item_ad_002',
    name: 'Bloodthirster',
    type: 'ITEM',
    spellType: 'EQUIP_SPELL',
    equipTarget: 'ALLY',
    category: 'AD',
    rarity: 'EPIC',
    goldCost: 350,
    itemEffect: 'When equipped Champion deals battle damage: Gain 200 LP. If it destroys a monster: Draw 1 card.',
    description: '[Magic - Equip] Attach to your Champion. Life steal at its finest. Gain 200 LP on battle damage, draw 1 card when destroying a monster.',
    image: 'items/bloodthirster.jpg'
  },
  {
    id: 'item_ad_003',
    name: 'Blade of the Ruined King',
    type: 'ITEM',
    spellType: 'EQUIP_SPELL',
    equipTarget: 'ALLY',
    category: 'AD',
    rarity: 'EPIC',
    goldCost: 350,
    itemEffect: 'Once per turn: Target 1 monster; it loses 300 ATK until end of turn. Equipped Champion gains that much ATK for that battle only.',
    description: '[Magic - Equip] Attach to your Champion. The fallen king\'s weapon. Steal 300 ATK from an enemy for one battle.',
    image: 'items/botrk.jpg'
  },
  {
    id: 'item_ad_004',
    name: 'Lord Dominik\'s Regards',
    type: 'ITEM',
    spellType: 'EQUIP_SPELL',
    equipTarget: 'ALLY',
    category: 'AD',
    rarity: 'RARE',
    goldCost: 250,
    itemEffect: 'Equipped Champion gains Pierce. If it deals piercing damage: Inflict 100 extra damage.',
    description: '[Magic - Equip] Attach to your Champion. Armor means nothing. Your Champion deals piercing damage with +100 bonus.',
    image: 'items/lorddominiks.jpg'
  },
  {
    id: 'item_ad_005',
    name: 'Guinsoo\'s Rageblade',
    type: 'ITEM',
    spellType: 'EQUIP_SPELL',
    equipTarget: 'ALLY',
    category: 'AD',
    rarity: 'EPIC',
    goldCost: 300,
    itemEffect: 'Each time equipped Champion attacks: Place a Rage counter (max 3). It gains 100 ATK per counter.',
    description: '[Magic - Equip] Attach to your Champion. Rage builds with each strike. Gain 100 ATK per attack (max +300).',
    image: 'items/guinsoos.jpg'
  },
  {
    id: 'item_ad_006',
    name: 'Youmuu\'s Ghostblade',
    type: 'ITEM',
    spellType: 'EQUIP_SPELL',
    equipTarget: 'ALLY',
    category: 'AD',
    rarity: 'EPIC',
    goldCost: 300,
    itemEffect: 'Once per turn: Equipped Champion can attack directly. If it does, it cannot attack next turn.',
    description: '[Magic - Equip] Attach to your Champion. Become one with the shadows. Can attack directly, but skips next attack.',
    image: 'items/youmuus.jpg'
  },
  {
    id: 'item_ad_007',
    name: 'Titanic Hydra',
    type: 'ITEM',
    spellType: 'EQUIP_SPELL',
    equipTarget: 'ALLY',
    category: 'AD',
    rarity: 'EPIC',
    goldCost: 350,
    itemEffect: 'Equipped Champion gains ATK equal to half its DEF. If it destroys a monster: You may change another monster\'s battle position.',
    description: '[Magic - Equip] Attach to your Champion. Size becomes strength. Gain ATK = half DEF, change enemy position on kill.',
    image: 'items/titanichydra.jpg'
  },
  {
    id: 'item_ad_008',
    name: 'Ravenous Hydra',
    type: 'ITEM',
    spellType: 'EQUIP_SPELL',
    equipTarget: 'ALLY',
    category: 'AD',
    rarity: 'EPIC',
    goldCost: 350,
    itemEffect: 'When equipped Champion destroys a monster: You may destroy 1 face-down Spell/Trap.',
    description: '[Magic - Equip] Attach to your Champion. Cleave through all enemies. Destroy a Set card when killing a monster.',
    image: 'items/ravenoushydra.jpg'
  },
  {
    id: 'item_ad_009',
    name: 'Navori Quickblades',
    type: 'ITEM',
    spellType: 'EQUIP_SPELL',
    equipTarget: 'ALLY',
    category: 'AD',
    rarity: 'EPIC',
    goldCost: 300,
    itemEffect: 'Once per turn, after equipped Champion attacks: You may activate 1 additional Equip Spell this turn.',
    description: '[Magic - Equip] Attach to your Champion. Speed is everything. Extra Equip Spell activation after attacking.',
    image: 'items/navori.jpg'
  },

  // ============================================
  // AD ITEMS - EQUIP SPELLS (continued)
  // ============================================
  {
    id: 'item_ad_010',
    name: 'Rapid Firecannon',
    type: 'ITEM',
    spellType: 'EQUIP_SPELL',
    equipTarget: 'ALLY',
    category: 'AD',
    rarity: 'RARE',
    goldCost: 200,
    itemEffect: 'Equipped Champion\'s first attack each turn can be direct. After that, it cannot attack directly this turn.',
    description: '[Magic - Equip] Attach to your Champion. Extended range for the perfect shot. First attack can be direct each turn.',
    image: 'items/rapidfire.jpg'
  },

  // ============================================
  // AD ITEMS - NORMAL SPELLS
  // ============================================
  {
    id: 'item_ad_011',
    name: 'Stormrazor',
    type: 'ITEM',
    spellType: 'NORMAL_SPELL',
    category: 'AD',
    rarity: 'RARE',
    goldCost: 150,
    itemEffect: 'Target 1 monster; it cannot activate effects this turn.',
    description: '[Magic - Normal] Activate and discard. The first strike is the deadliest. Silence a monster this turn.',
    image: 'items/stormrazor.jpg'
  },
  {
    id: 'item_ad_012',
    name: 'Essence Reaver',
    type: 'ITEM',
    spellType: 'NORMAL_SPELL',
    category: 'AD',
    rarity: 'RARE',
    goldCost: 200,
    itemEffect: 'Draw 2 cards, then discard 1 card.',
    description: '[Magic - Normal] Activate and discard. Each strike restores your energy. Draw 2, discard 1.',
    image: 'items/essencereaver.jpg'
  },
  {
    id: 'item_ad_013',
    name: 'Opportunity',
    type: 'ITEM',
    spellType: 'NORMAL_SPELL',
    category: 'AD',
    rarity: 'EPIC',
    goldCost: 300,
    itemEffect: 'Special Summon 1 monster from your Graveyard, but it cannot attack this turn.',
    description: '[Magic - Normal] Activate and discard. Seize the moment. Revive a Champion (cannot attack this turn).',
    image: 'items/opportunity.jpg'
  },
  {
    id: 'item_ad_014',
    name: 'Stridebreaker',
    type: 'ITEM',
    spellType: 'NORMAL_SPELL',
    category: 'AD',
    rarity: 'RARE',
    goldCost: 200,
    itemEffect: 'Change all opponent monsters to Defense Position. They cannot change position next turn.',
    description: '[Magic - Normal] Activate and discard. Break their formation. Force all enemies to Defense.',
    image: 'items/stridebreaker.jpg'
  },
  {
    id: 'item_ad_015',
    name: 'Umbral Glaive',
    type: 'ITEM',
    spellType: 'NORMAL_SPELL',
    category: 'AD',
    rarity: 'EPIC',
    goldCost: 250,
    itemEffect: 'Look at opponent\'s hand; discard 1 Spell/Trap.',
    description: '[Magic - Normal] Activate and discard. See through the darkness. Peek at hand, discard 1 Spell/Trap.',
    image: 'items/umbralglaive.jpg'
  },
  {
    id: 'item_ad_016',
    name: 'Experimental Hexplate',
    type: 'ITEM',
    spellType: 'NORMAL_SPELL',
    category: 'AD',
    rarity: 'LEGENDARY',
    goldCost: 350,
    itemEffect: 'Target Champion gains 400 ATK, but is destroyed at the end of the turn.',
    description: '[Magic - Normal] Activate and discard. Explosive results. +400 ATK this turn, then destroyed.',
    image: 'items/hexplate.jpg'
  },

  // ============================================
  // AD ITEMS - CONTINUOUS SPELLS
  // ============================================
  {
    id: 'item_ad_017',
    name: 'Profane Hydra',
    type: 'ITEM',
    spellType: 'CONTINUOUS_SPELL',
    category: 'AD',
    rarity: 'RARE',
    goldCost: 250,
    itemEffect: 'When your Champion destroys a monster: You may send 1 Equip card on the field to the Graveyard.',
    description: '[Magic - Continuous] Stays on field. Corrupt cleaving power. Destroy an Equip when you kill a monster.',
    image: 'items/profanehydra.jpg'
  },
  {
    id: 'item_ad_018',
    name: 'Kraken Slayer',
    type: 'ITEM',
    spellType: 'CONTINUOUS_SPELL',
    category: 'AD',
    rarity: 'EPIC',
    goldCost: 300,
    itemEffect: 'Every second time your Champion battles in a turn: That battle inflicts Overkill (excess damage is dealt to opponent).',
    description: '[Magic - Continuous] Stays on field. True damage to all. Second battle each turn deals overkill damage to opponent.',
    image: 'items/krakenslayer.jpg'
  },

  // ============================================
  // AD ITEMS - TRAPS
  // ============================================
  {
    id: 'item_ad_019',
    name: 'Collector',
    type: 'ITEM',
    spellType: 'CONTINUOUS_TRAP',
    category: 'AD',
    rarity: 'EPIC',
    goldCost: 250,
    itemEffect: 'When a monster\'s ATK is reduced to 0: Destroy it.',
    description: '[Trap - Continuous] Set, then flip when triggered. Execute the weak. Destroy any monster reduced to 0 ATK.',
    image: 'items/collector.jpg'
  },
  {
    id: 'item_ad_020',
    name: 'Phantom Dancer',
    type: 'ITEM',
    spellType: 'EQUIP_TRAP',
    equipTarget: 'ALLY',
    category: 'AD',
    rarity: 'RARE',
    goldCost: 200,
    itemEffect: 'First time equipped Champion would be destroyed: Negate that destruction and destroy this card.',
    description: '[Trap - Equip] Set, then equip to your Champion. Dance away from death. Negate destruction once.',
    image: 'items/phantomdancer.jpg'
  },
  {
    id: 'item_ad_021',
    name: 'Edge of Night',
    type: 'ITEM',
    spellType: 'EQUIP_TRAP',
    equipTarget: 'ALLY',
    category: 'AD',
    rarity: 'RARE',
    goldCost: 200,
    itemEffect: 'Negate the first effect that targets equipped Champion each turn.',
    description: '[Trap - Equip] Set, then equip to your Champion. Shield of the night. Negate first targeting effect each turn.',
    image: 'items/edgeofnight.jpg'
  },

  // ============================================
  // AP ITEMS - NORMAL SPELLS
  // ============================================
  {
    id: 'item_ap_001',
    name: 'Luden\'s Companion',
    type: 'ITEM',
    spellType: 'NORMAL_SPELL',
    category: 'AP',
    rarity: 'RARE',
    goldCost: 200,
    itemEffect: 'Inflict 300 damage. If a monster is destroyed this turn: Draw 1 card.',
    description: '[Magic - Normal] Activate and discard. Echo damage with each cast. Deal 300 damage, draw 1 if kill.',
    image: 'items/ludens.jpg'
  },
  {
    id: 'item_ap_002',
    name: 'Shadowflame',
    type: 'ITEM',
    spellType: 'NORMAL_SPELL',
    category: 'AP',
    rarity: 'RARE',
    goldCost: 200,
    itemEffect: 'Destroy 1 monster with 1000 ATK or less.',
    description: '[Magic - Normal] Activate and discard. Dark flames exploit weakness. Destroy a monster with 1000 ATK or less.',
    image: 'items/shadowflame.jpg'
  },
  {
    id: 'item_ap_003',
    name: 'Morellonomicon',
    type: 'ITEM',
    spellType: 'NORMAL_SPELL',
    category: 'AP',
    rarity: 'EPIC',
    goldCost: 250,
    itemEffect: 'Inflict 200 damage. Opponent cannot gain LP until end of next turn.',
    description: '[Magic - Normal] Activate and discard. Grievous wounds and dark magic. 200 damage + healing block.',
    image: 'items/morellonomicon.jpg'
  },
  {
    id: 'item_ap_004',
    name: 'Stormsurge',
    type: 'ITEM',
    spellType: 'NORMAL_SPELL',
    category: 'AP',
    rarity: 'RARE',
    goldCost: 200,
    itemEffect: 'If opponent has more LP: Destroy 1 face-up Spell/Trap.',
    description: '[Magic - Normal] Activate and discard. Surge of power when behind. Destroy face-up Spell/Trap if losing.',
    image: 'items/stormsurge.jpg'
  },
  {
    id: 'item_ap_005',
    name: 'Blackfire Torch',
    type: 'ITEM',
    spellType: 'NORMAL_SPELL',
    category: 'AP',
    rarity: 'RARE',
    goldCost: 150,
    itemEffect: 'Inflict 100 damage for each card in opponent\'s hand.',
    description: '[Magic - Normal] Activate and discard. Punish those who hold back. 100 damage per card in opponent\'s hand.',
    image: 'items/blackfiretorch.jpg'
  },
  {
    id: 'item_ap_006',
    name: 'Horizon Focus',
    type: 'ITEM',
    spellType: 'NORMAL_SPELL',
    category: 'AP',
    rarity: 'RARE',
    goldCost: 200,
    itemEffect: 'Reveal all Set cards. You may destroy 1 of them.',
    description: '[Magic - Normal] Activate and discard. See and punish all secrets. Reveal and destroy 1 Set card.',
    image: 'items/horizonfocus.jpg'
  },
  {
    id: 'item_ap_007',
    name: 'Cosmic Drive',
    type: 'ITEM',
    spellType: 'NORMAL_SPELL',
    category: 'AP',
    rarity: 'EPIC',
    goldCost: 250,
    itemEffect: 'Draw 2 cards. You may Set 1 Spell/Trap from your hand.',
    description: '[Magic - Normal] Activate and discard. Accelerate through the cosmos. Draw 2, optionally Set 1.',
    image: 'items/cosmicdrive.jpg'
  },

  // ============================================
  // AP ITEMS - CONTINUOUS SPELLS
  // ============================================
  {
    id: 'item_ap_008',
    name: 'Rabadon\'s Deathcap',
    type: 'ITEM',
    spellType: 'CONTINUOUS_SPELL',
    category: 'AP',
    rarity: 'LEGENDARY',
    goldCost: 400,
    itemEffect: 'Once per turn, when you deal effect damage: Deal an additional 100.',
    description: '[Magic - Continuous] Stays on field. Ultimate magic amplifier. +100 bonus effect damage each time.',
    image: 'items/rabadons.jpg'
  },
  {
    id: 'item_ap_009',
    name: 'Rylai\'s Crystal Scepter',
    type: 'ITEM',
    spellType: 'CONTINUOUS_SPELL',
    category: 'AP',
    rarity: 'RARE',
    goldCost: 250,
    itemEffect: 'Monsters damaged by your effects cannot attack next turn.',
    description: '[Magic - Continuous] Stays on field. Slow your enemies with frost. Damaged monsters cannot attack.',
    image: 'items/rylais.jpg'
  },
  {
    id: 'item_ap_010',
    name: 'Nashor\'s Tooth',
    type: 'ITEM',
    spellType: 'CONTINUOUS_SPELL',
    category: 'AP',
    rarity: 'RARE',
    goldCost: 250,
    itemEffect: 'Once per turn, when your Champion attacks: You may inflict 100 effect damage.',
    description: '[Magic - Continuous] Stays on field. Magic-infused attacks. Deal 100 bonus damage when attacking.',
    image: 'items/nashors.jpg'
  },
  {
    id: 'item_ap_011',
    name: 'Riftmaker',
    type: 'ITEM',
    spellType: 'CONTINUOUS_SPELL',
    category: 'AP',
    rarity: 'RARE',
    goldCost: 250,
    itemEffect: 'When you deal damage: Gain 50 LP.',
    description: '[Magic - Continuous] Stays on field. Omnivamp from the void. Heal 50 LP whenever you deal damage.',
    image: 'items/riftmaker.jpg'
  },
  {
    id: 'item_ap_012',
    name: 'Rod of Ages',
    type: 'ITEM',
    spellType: 'CONTINUOUS_SPELL',
    category: 'AP',
    rarity: 'RARE',
    goldCost: 200,
    itemEffect: 'During each of your Standby Phases: Place 1 Age counter (max 5). Gain 50 LP per counter each Standby Phase.',
    description: '[Magic - Continuous] Stays on field. Power grows with time. Gain more LP each turn (up to 250).',
    image: 'items/rodofages.jpg'
  },
  {
    id: 'item_ap_013',
    name: 'Archangel\'s Staff',
    type: 'ITEM',
    spellType: 'CONTINUOUS_SPELL',
    category: 'AP',
    rarity: 'EPIC',
    goldCost: 300,
    itemEffect: 'Once per turn: Draw 1 card, then discard 1 card. After 3 uses: Gain 500 LP and destroy this card.',
    description: '[Magic - Continuous] Stays on field. Wisdom over time. Cycle cards, gain 500 LP after 3 uses.',
    image: 'items/archangels.jpg'
  },
  {
    id: 'item_ap_014',
    name: 'Malignance',
    type: 'ITEM',
    spellType: 'CONTINUOUS_SPELL',
    category: 'AP',
    rarity: 'RARE',
    goldCost: 250,
    itemEffect: 'When you Summon Level 6+: Destroy 1 face-down card.',
    description: '[Magic - Continuous] Stays on field. Malicious energy. Destroy a Set card when summoning Level 6+.',
    image: 'items/malignance.jpg'
  },
  {
    id: 'item_ap_015',
    name: 'Void Staff',
    type: 'ITEM',
    spellType: 'CONTINUOUS_SPELL',
    category: 'AP',
    rarity: 'EPIC',
    goldCost: 300,
    itemEffect: 'Your effect damage cannot be reduced or negated.',
    description: '[Magic - Continuous] Stays on field. Penetrate all resistance. Your effect damage ignores protection.',
    image: 'items/voidstaff.jpg'
  },
  {
    id: 'item_ap_016',
    name: 'Cryptbloom',
    type: 'ITEM',
    spellType: 'CONTINUOUS_SPELL',
    category: 'AP',
    rarity: 'RARE',
    goldCost: 200,
    itemEffect: 'When any monster is destroyed: Gain 100 LP.',
    description: '[Magic - Continuous] Stays on field. Life from death. Heal 100 LP when any monster dies.',
    image: 'items/cryptbloom.jpg'
  },
  {
    id: 'item_ap_017',
    name: 'Mejai\'s Soulstealer',
    type: 'ITEM',
    spellType: 'CONTINUOUS_SPELL',
    category: 'AP',
    rarity: 'EPIC',
    goldCost: 300,
    itemEffect: 'Each time opponent monster is destroyed: Place a Soul counter. Remove 3 counters to destroy 1 monster.',
    description: '[Magic - Continuous] Stays on field. Souls fuel power. Collect 3 souls, destroy 1 monster.',
    image: 'items/mejais.jpg'
  },

  // ============================================
  // AP ITEMS - TRAPS
  // ============================================
  {
    id: 'item_ap_018',
    name: 'Liandry\'s Torment',
    type: 'ITEM',
    spellType: 'CONTINUOUS_TRAP',
    category: 'AP',
    rarity: 'EPIC',
    goldCost: 250,
    itemEffect: 'At end of each turn: Inflict 100 damage to opponent if they took effect damage that turn.',
    description: '[Trap - Continuous] Set, then flip. Burning agony over time. +100 damage at end of turns with effect damage.',
    image: 'items/liandrys.jpg'
  },
  {
    id: 'item_ap_019',
    name: 'Lich Bane',
    type: 'ITEM',
    spellType: 'EQUIP_SPELL',
    equipTarget: 'ALLY',
    category: 'AP',
    rarity: 'EPIC',
    goldCost: 300,
    itemEffect: 'First time equipped Champion attacks each turn: Its battle damage is doubled for that battle only.',
    description: '[Magic - Equip] Attach to your Champion. Empower your strike. First attack each turn deals double damage.',
    image: 'items/lichbane.jpg'
  },

  // ============================================
  // TANK ITEMS - EQUIP SPELLS
  // ============================================
  {
    id: 'item_tank_001',
    name: 'Dead Man\'s Plate',
    type: 'ITEM',
    spellType: 'EQUIP_SPELL',
    equipTarget: 'ALLY',
    category: 'TANK',
    rarity: 'RARE',
    goldCost: 250,
    itemEffect: 'Equipped Champion cannot be destroyed by battle once per turn.',
    description: '[Magic - Equip] Attach to your Champion. Momentum carries you through. Survive 1 battle per turn.',
    image: 'items/deadmansplate.jpg'
  },
  {
    id: 'item_tank_002',
    name: 'Spirit Visage',
    type: 'ITEM',
    spellType: 'CONTINUOUS_SPELL',
    category: 'TANK',
    rarity: 'RARE',
    goldCost: 250,
    itemEffect: 'When you gain LP: Draw 1 card (once per turn).',
    description: '[Magic - Continuous] Stays on field. Enhanced regeneration. Draw 1 when healing.',
    image: 'items/spiritvisage.jpg'
  },
  {
    id: 'item_tank_003',
    name: 'Abyssal Mask',
    type: 'ITEM',
    spellType: 'EQUIP_SPELL',
    equipTarget: 'ALLY',
    category: 'TANK',
    rarity: 'RARE',
    goldCost: 200,
    itemEffect: 'Monsters that battle equipped Champion lose 200 ATK permanently.',
    description: '[Magic - Equip] Attach to your Champion. Curse of the abyss. Enemies lose 200 ATK after battling.',
    image: 'items/abyssalmask.jpg'
  },
  {
    id: 'item_tank_004',
    name: 'Heartsteel',
    type: 'ITEM',
    spellType: 'EQUIP_SPELL',
    equipTarget: 'ALLY',
    category: 'TANK',
    rarity: 'EPIC',
    goldCost: 300,
    itemEffect: 'At end of turn, if equipped Champion survived battle: Gain 200 LP.',
    description: '[Magic - Equip] Attach to your Champion. Health stacking. Heal 200 LP if Champion survives battle.',
    image: 'items/heartsteel.jpg'
  },

  // ============================================
  // TANK ITEMS - CONTINUOUS TRAPS
  // ============================================
  {
    id: 'item_tank_005',
    name: 'Sunfire Cape',
    type: 'ITEM',
    spellType: 'CONTINUOUS_TRAP',
    category: 'TANK',
    rarity: 'RARE',
    goldCost: 200,
    itemEffect: 'At end of your turn: Inflict 100 damage to opponent.',
    description: '[Trap - Continuous] Set, then flip. Immolate enemies. Deal 100 damage each End Phase.',
    image: 'items/sunfirecape.jpg'
  },
  {
    id: 'item_tank_006',
    name: 'Warmog\'s Armor',
    type: 'ITEM',
    spellType: 'CONTINUOUS_TRAP',
    category: 'TANK',
    rarity: 'RARE',
    goldCost: 200,
    itemEffect: 'During your Standby Phase: Gain 150 LP.',
    description: '[Trap - Continuous] Set, then flip. Massive regeneration. Heal 150 LP each Standby Phase.',
    image: 'items/warmogs.jpg'
  },
  {
    id: 'item_tank_007',
    name: 'Frozen Heart',
    type: 'ITEM',
    spellType: 'CONTINUOUS_TRAP',
    category: 'TANK',
    rarity: 'RARE',
    goldCost: 200,
    itemEffect: 'Opponent monsters cannot gain ATK.',
    description: '[Trap - Continuous] Set, then flip. Chill the assault. Enemies cannot gain ATK.',
    image: 'items/frozenheart.jpg'
  },
  {
    id: 'item_tank_008',
    name: 'Force of Nature',
    type: 'ITEM',
    spellType: 'CONTINUOUS_TRAP',
    category: 'TANK',
    rarity: 'RARE',
    goldCost: 200,
    itemEffect: 'Reduce all effect damage you take by 100.',
    description: '[Trap - Continuous] Set, then flip. Natural resistance. Take 100 less effect damage.',
    image: 'items/forceofnature.jpg'
  },
  {
    id: 'item_tank_009',
    name: 'Unending Despair',
    type: 'ITEM',
    spellType: 'CONTINUOUS_TRAP',
    category: 'TANK',
    rarity: 'EPIC',
    goldCost: 250,
    itemEffect: 'When you take damage: Opponent also takes 50 damage.',
    description: '[Trap - Continuous] Set, then flip. Share the suffering. Opponent takes 50 when you\'re damaged.',
    image: 'items/unendingdespair.jpg'
  },
  {
    id: 'item_tank_010',
    name: 'Thornmail',
    type: 'ITEM',
    spellType: 'EQUIP_TRAP',
    equipTarget: 'ALLY',
    category: 'TANK',
    rarity: 'EPIC',
    goldCost: 250,
    itemEffect: 'When equipped Champion is attacked: Inflict 150 damage to opponent.',
    description: '[Trap - Equip] Set, then equip. Return damage to attackers. 150 damage when attacked.',
    image: 'items/thornmail.jpg'
  },

  // ============================================
  // TANK ITEMS - EQUIP TRAPS
  // ============================================
  {
    id: 'item_tank_011',
    name: 'Iceborn Gauntlet',
    type: 'ITEM',
    spellType: 'EQUIP_TRAP',
    equipTarget: 'ALLY',
    category: 'TANK',
    rarity: 'RARE',
    goldCost: 200,
    itemEffect: 'Monsters that battle equipped Champion cannot attack next turn.',
    description: '[Trap - Equip] Set, then equip. Icy slow field. Enemies cannot attack after battling this Champion.',
    image: 'items/iceborn.jpg'
  },
  {
    id: 'item_tank_012',
    name: 'Gargoyle Stoneplate',
    type: 'ITEM',
    spellType: 'EQUIP_TRAP',
    equipTarget: 'ALLY',
    category: 'TANK',
    rarity: 'EPIC',
    goldCost: 250,
    itemEffect: 'Once per turn: Equipped Champion cannot be destroyed this turn.',
    description: '[Trap - Equip] Set, then equip. Stone form activated. Prevent destruction once per turn.',
    image: 'items/gargoyle.jpg'
  },
  {
    id: 'item_tank_013',
    name: 'Kaenic Rookern',
    type: 'ITEM',
    spellType: 'EQUIP_TRAP',
    equipTarget: 'ALLY',
    category: 'TANK',
    rarity: 'RARE',
    goldCost: 200,
    itemEffect: 'Once per duel: Negate up to 300 damage to equipped Champion.',
    description: '[Trap - Equip] Set, then equip. Magic resistance shield. Block 300 damage once.',
    image: 'items/kaenic.jpg'
  },
  {
    id: 'item_tank_014',
    name: 'Jak\'Sho, The Protean',
    type: 'ITEM',
    spellType: 'EQUIP_TRAP',
    equipTarget: 'ALLY',
    category: 'TANK',
    rarity: 'LEGENDARY',
    goldCost: 350,
    itemEffect: 'Each End Phase: Equipped Champion gains 50 ATK and 50 DEF permanently.',
    description: '[Trap - Equip] Set, then equip. Adapt and overcome. +50 ATK/DEF each turn.',
    image: 'items/jaksho.jpg'
  },

  // ============================================
  // SUPPORT ITEMS - NORMAL SPELLS
  // ============================================
  {
    id: 'item_sup_001',
    name: 'Redemption',
    type: 'ITEM',
    spellType: 'NORMAL_SPELL',
    category: 'SUPPORT',
    rarity: 'RARE',
    goldCost: 200,
    itemEffect: 'Gain 400 LP. Then you may Set 1 Spell/Trap from your Graveyard.',
    description: '[Magic - Normal] Activate and discard. Healing light from above. +400 LP, recover 1 Set card.',
    image: 'items/redemption.jpg'
  },
  {
    id: 'item_sup_002',
    name: 'Staff of Flowing Water',
    type: 'ITEM',
    spellType: 'NORMAL_SPELL',
    category: 'SUPPORT',
    rarity: 'RARE',
    goldCost: 150,
    itemEffect: 'Draw 1 card. If you gained LP this turn, draw 1 more.',
    description: '[Magic - Normal] Activate and discard. Magic flows freely. Draw 1-2 cards.',
    image: 'items/staffofflowingwater.jpg'
  },
  {
    id: 'item_sup_003',
    name: 'Shurelya\'s Battlesong',
    type: 'ITEM',
    spellType: 'NORMAL_SPELL',
    category: 'SUPPORT',
    rarity: 'EPIC',
    goldCost: 250,
    itemEffect: 'All your monsters can attack regardless of position this turn.',
    description: '[Magic - Normal] Activate and discard. Rally forward. All Champions can attack this turn.',
    image: 'items/shurelyas.jpg'
  },

  // ============================================
  // SUPPORT ITEMS - CONTINUOUS SPELLS
  // ============================================
  {
    id: 'item_sup_004',
    name: 'Moonstone Renewer',
    type: 'ITEM',
    spellType: 'CONTINUOUS_SPELL',
    category: 'SUPPORT',
    rarity: 'RARE',
    goldCost: 200,
    itemEffect: 'During End Phase: Gain 100 LP.',
    description: '[Magic - Continuous] Stays on field. Healing builds over time. +100 LP each End Phase.',
    image: 'items/moonstone.jpg'
  },
  {
    id: 'item_sup_005',
    name: 'Ardent Censer',
    type: 'ITEM',
    spellType: 'CONTINUOUS_SPELL',
    category: 'SUPPORT',
    rarity: 'RARE',
    goldCost: 250,
    itemEffect: 'When you gain LP: Target monster gains 100 ATK until end of turn.',
    description: '[Magic - Continuous] Stays on field. Empower allies with healing. +100 ATK when you heal.',
    image: 'items/ardentcenser.jpg'
  },
  {
    id: 'item_sup_006',
    name: 'Imperial Mandate',
    type: 'ITEM',
    spellType: 'CONTINUOUS_SPELL',
    category: 'SUPPORT',
    rarity: 'RARE',
    goldCost: 200,
    itemEffect: 'First time each turn you deal effect damage: Inflict +100.',
    description: '[Magic - Continuous] Stays on field. Mark and execute. First effect damage +100 each turn.',
    image: 'items/imperialmandate.jpg'
  },
  {
    id: 'item_sup_007',
    name: 'Dawncore',
    type: 'ITEM',
    spellType: 'CONTINUOUS_SPELL',
    category: 'SUPPORT',
    rarity: 'RARE',
    goldCost: 200,
    itemEffect: 'Once per turn, if you gained LP: Negate 1 effect that targets your monster.',
    description: '[Magic - Continuous] Stays on field. Amplified restoration. Negate targeting when you heal.',
    image: 'items/dawncore.jpg'
  },
  {
    id: 'item_sup_008',
    name: 'Locket of the Iron Solari',
    type: 'ITEM',
    spellType: 'CONTINUOUS_SPELL',
    category: 'SUPPORT',
    rarity: 'RARE',
    goldCost: 200,
    itemEffect: 'Once per turn: All your monsters gain 100 DEF until end of turn.',
    description: '[Magic - Continuous] Stays on field. Shield your team. +100 DEF to all monsters this turn.',
    image: 'items/locket.jpg'
  },

  // ============================================
  // SUPPORT ITEMS - EQUIP SPELLS
  // ============================================
  {
    id: 'item_sup_009',
    name: 'Zeke\'s Convergence',
    type: 'ITEM',
    spellType: 'EQUIP_SPELL',
    equipTarget: 'ALLY',
    category: 'SUPPORT',
    rarity: 'EPIC',
    goldCost: 300,
    itemEffect: 'When equipped Champion battles: Another Champion you control gains 100 ATK until end of turn.',
    description: '[Magic - Equip] Attach to Champion. Bound allies empower each other. +100 ATK to ally on battle.',
    image: 'items/zekes.jpg'
  },
  {
    id: 'item_sup_010',
    name: 'Knight\'s Vow',
    type: 'ITEM',
    spellType: 'EQUIP_SPELL',
    equipTarget: 'ALLY',
    category: 'SUPPORT',
    rarity: 'EPIC',
    goldCost: 300,
    itemEffect: 'Equipped Champion takes half battle damage. You may have another Champion you control take the other half.',
    description: '[Magic - Equip] Attach to Champion. Sworn protection. Split damage between two Champions.',
    image: 'items/knightsvow.jpg'
  },

  // ============================================
  // SUPPORT ITEMS - TRAPS
  // ============================================
  {
    id: 'item_sup_011',
    name: 'Mikael\'s Blessing',
    type: 'ITEM',
    spellType: 'NORMAL_TRAP',
    category: 'SUPPORT',
    rarity: 'RARE',
    goldCost: 200,
    itemEffect: 'Negate an effect targeting your monster, then gain 200 LP.',
    description: '[Trap - Normal] Set, then flip when triggered. Cleanse and heal. Negate targeting +200 LP.',
    image: 'items/mikaels.jpg'
  },
  {
    id: 'item_sup_012',
    name: 'Echoes of Helia',
    type: 'ITEM',
    spellType: 'CONTINUOUS_TRAP',
    category: 'SUPPORT',
    rarity: 'EPIC',
    goldCost: 250,
    itemEffect: 'Once per turn, when a monster you control is destroyed: Special Summon it in Defense Position.',
    description: '[Trap - Continuous] Set, then flip. Echoes of the fallen. Revive your Champion in DEF (once/turn).',
    image: 'items/echoesofhelia.jpg'
  },
  {
    id: 'item_sup_013',
    name: 'Dream Maker',
    type: 'ITEM',
    spellType: 'EQUIP_TRAP',
    equipTarget: 'ALLY',
    category: 'SUPPORT',
    rarity: 'RARE',
    goldCost: 200,
    itemEffect: 'If equipped Champion would be destroyed: Return it to your hand instead.',
    description: '[Trap - Equip] Set, then equip. Dreams protect reality. Return Champion to hand instead of destruction.',
    image: 'items/dreammaker.jpg'
  },
  {
    id: 'item_sup_014',
    name: 'Celestial Opposition',
    type: 'ITEM',
    spellType: 'NORMAL_TRAP',
    category: 'SUPPORT',
    rarity: 'EPIC',
    goldCost: 250,
    itemEffect: 'Negate opponent\'s next Spell activation this turn.',
    description: '[Trap - Normal] Set, then flip when triggered. Heavenly intervention. Negate next enemy Spell.',
    image: 'items/celestialopposition.jpg'
  },

  // ============================================
  // BOOTS - TEMPO & RULE-BENDING
  // ============================================
  {
    id: 'boots_001',
    name: 'Berserker\'s Greaves',
    type: 'ITEM',
    spellType: 'NORMAL_SPELL',
    category: 'BOOTS',
    rarity: 'COMMON',
    goldCost: 100,
    itemEffect: 'Target Champion can attack twice this turn.',
    description: '[Magic - Normal] Activate and discard. Attack speed for warriors. One Champion attacks twice.',
    image: 'items/berserkers.jpg'
  },
  {
    id: 'boots_002',
    name: 'Sorcerer\'s Shoes',
    type: 'ITEM',
    spellType: 'NORMAL_SPELL',
    category: 'BOOTS',
    rarity: 'COMMON',
    goldCost: 100,
    itemEffect: 'Your next Spell this turn cannot be negated.',
    description: '[Magic - Normal] Activate and discard. Magic penetration. Next Spell is unnegatable.',
    image: 'items/sorcerers.jpg'
  },
  {
    id: 'boots_003',
    name: 'Plated Steelcaps',
    type: 'ITEM',
    spellType: 'NORMAL_SPELL',
    category: 'BOOTS',
    rarity: 'COMMON',
    goldCost: 100,
    itemEffect: 'Target Champion takes no battle damage this turn.',
    description: '[Magic - Normal] Activate and discard. Armor against threats. No battle damage this turn.',
    image: 'items/steelcaps.jpg'
  },
  {
    id: 'boots_004',
    name: 'Boots of Swiftness',
    type: 'ITEM',
    spellType: 'NORMAL_SPELL',
    category: 'BOOTS',
    rarity: 'COMMON',
    goldCost: 100,
    itemEffect: 'Target Champion can attack directly this turn.',
    description: '[Magic - Normal] Activate and discard. Unmatched mobility. One Champion attacks directly.',
    image: 'items/swiftness.jpg'
  },
  {
    id: 'boots_005',
    name: 'Ionian Boots of Lucidity',
    type: 'ITEM',
    spellType: 'CONTINUOUS_SPELL',
    category: 'BOOTS',
    rarity: 'RARE',
    goldCost: 200,
    itemEffect: 'Once per turn: You may activate 1 extra Spell.',
    description: '[Magic - Continuous] Stays on field. Ability haste from Ionia. Extra Spell activation once per turn.',
    image: 'items/ionianboots.jpg'
  },
  {
    id: 'boots_006',
    name: 'Symbiotic Soles',
    type: 'ITEM',
    spellType: 'EQUIP_SPELL',
    equipTarget: 'ALLY',
    category: 'BOOTS',
    rarity: 'RARE',
    goldCost: 200,
    itemEffect: 'Once per turn: Equipped Champion gains ATK equal to your highest ATK Champion for one battle.',
    description: '[Magic - Equip] Attach to Champion. Share power between allies. Copy highest ATK for one battle.',
    image: 'items/symbioticsoles.jpg'
  },

  // ============================================
  // CONSUMABLES - BURST & RESOURCE
  // ============================================
  {
    id: 'potion_001',
    name: 'Health Potion',
    type: 'ITEM',
    spellType: 'NORMAL_SPELL',
    category: 'CONSUMABLE',
    rarity: 'COMMON',
    goldCost: 50,
    itemEffect: 'Gain 300 LP.',
    description: '[Magic - Normal] Activate and discard. A quick health boost. +300 LP.',
    image: 'items/healthpotion.jpg'
  },
  {
    id: 'potion_002',
    name: 'Mana Potion',
    type: 'ITEM',
    spellType: 'NORMAL_SPELL',
    category: 'CONSUMABLE',
    rarity: 'COMMON',
    goldCost: 50,
    itemEffect: 'Draw 2 cards, then discard 1.',
    description: '[Magic - Normal] Activate and discard. Restore your resources. Draw 2, discard 1.',
    image: 'items/manapotion.jpg'
  },
  {
    id: 'potion_003',
    name: 'Corrupting Potion',
    type: 'ITEM',
    spellType: 'NORMAL_SPELL',
    category: 'CONSUMABLE',
    rarity: 'RARE',
    goldCost: 100,
    itemEffect: 'Gain 200 LP and inflict 100 damage.',
    description: '[Magic - Normal] Activate and discard. Sustain with a bite. +200 LP and 100 damage.',
    image: 'items/corruptingpotion.jpg'
  },
  {
    id: 'potion_004',
    name: 'Elixir of Wrath',
    type: 'ITEM',
    spellType: 'NORMAL_SPELL',
    category: 'CONSUMABLE',
    rarity: 'RARE',
    goldCost: 150,
    itemEffect: 'All your monsters gain +200 ATK until end of turn.',
    description: '[Magic - Normal] Activate and discard. Temporary power surge. +200 ATK this turn.',
    image: 'items/elixirofwrath.jpg'
  },
  {
    id: 'potion_005',
    name: 'Elixir of Sorcery',
    type: 'ITEM',
    spellType: 'NORMAL_SPELL',
    category: 'CONSUMABLE',
    rarity: 'RARE',
    goldCost: 150,
    itemEffect: 'Your Spell effects cannot be negated this turn.',
    description: '[Magic - Normal] Activate and discard. Amplified magic. Spells are unnegatable this turn.',
    image: 'items/elixirofsorcery.jpg'
  },
  {
    id: 'potion_006',
    name: 'Refillable Potion',
    type: 'ITEM',
    spellType: 'CONTINUOUS_SPELL',
    category: 'CONSUMABLE',
    rarity: 'COMMON',
    goldCost: 100,
    itemEffect: 'Once per turn: Gain 100 LP.',
    description: '[Magic - Continuous] Stays on field. Reusable sustain. +100 LP each turn.',
    image: 'items/refillable.jpg'
  },
  {
    id: 'potion_007',
    name: 'Guardian Angel',
    type: 'ITEM',
    spellType: 'CONTINUOUS_TRAP',
    category: 'CONSUMABLE',
    rarity: 'EPIC',
    goldCost: 250,
    itemEffect: 'First time a monster you control is destroyed: Special Summon it at End Phase.',
    description: '[Trap - Continuous] Set, then flip. Return from defeat. Revive first destroyed Champion.',
    image: 'items/guardianangel.jpg'
  },

  // ============================================
  // REMOVAL / DISRUPTION CORE
  // ============================================
  {
    id: 'removal_001',
    name: 'Item Breaker',
    type: 'ITEM',
    spellType: 'NORMAL_SPELL',
    category: 'UTILITY',
    rarity: 'COMMON',
    goldCost: 100,
    itemEffect: 'Destroy 1 Equip card.',
    description: '[Magic - Normal] Activate and discard. Shatter their gear. Destroy 1 Equip card.',
    image: 'items/itembreaker.jpg'
  },
  {
    id: 'removal_002',
    name: 'Arcane Dispel',
    type: 'ITEM',
    spellType: 'NORMAL_SPELL',
    category: 'UTILITY',
    rarity: 'COMMON',
    goldCost: 100,
    itemEffect: 'Destroy 1 Continuous card.',
    description: '[Magic - Normal] Activate and discard. Silence the magic. Destroy 1 Continuous card.',
    image: 'items/arcanedispel.jpg'
  },
  {
    id: 'removal_003',
    name: 'Sweeping Cleanse',
    type: 'ITEM',
    spellType: 'NORMAL_SPELL',
    category: 'UTILITY',
    rarity: 'RARE',
    goldCost: 200,
    itemEffect: 'Destroy all Equip cards.',
    description: '[Magic - Normal] Activate and discard. Clear the battlefield. Destroy ALL Equip cards.',
    image: 'items/sweepingcleanse.jpg'
  },
  {
    id: 'removal_004',
    name: 'Null Zone',
    type: 'ITEM',
    spellType: 'NORMAL_TRAP',
    category: 'UTILITY',
    rarity: 'RARE',
    goldCost: 150,
    itemEffect: 'Negate and destroy a Continuous card.',
    description: '[Trap - Normal] Set, then flip when triggered. Void the persistent. Negate + destroy Continuous.',
    image: 'items/nullzone.jpg'
  },
  {
    id: 'removal_005',
    name: 'Shatter Rune',
    type: 'ITEM',
    spellType: 'NORMAL_TRAP',
    category: 'UTILITY',
    rarity: 'RARE',
    goldCost: 150,
    itemEffect: 'Negate and destroy an Equip card.',
    description: '[Trap - Normal] Set, then flip when triggered. Break enchantments. Negate + destroy Equip.',
    image: 'items/shatterrune.jpg'
  },
];

// ============================================
// RUNES - ENGINE & RULE EFFECTS (ALL CONTINUOUS)
// ============================================
export const runes = [
  // ============================================
  // PRECISION - BATTLE & SCALING
  // ============================================
  {
    id: 'rune_prec_001',
    name: 'Press the Attack',
    type: 'RUNE',
    spellType: 'CONTINUOUS_SPELL',
    runePath: 'PRECISION',
    rarity: 'EPIC',
    runeEffect: 'After a Champion attacks 3 times: Destroy 1 card on the field.',
    description: '[Rune - Continuous] Stays on field. Break through defenses. 3 attacks = destroy any card.',
    image: 'runes/presstheattack.jpg'
  },
  {
    id: 'rune_prec_002',
    name: 'Lethal Tempo',
    type: 'RUNE',
    spellType: 'CONTINUOUS_SPELL',
    runePath: 'PRECISION',
    rarity: 'EPIC',
    runeEffect: 'Once per turn: One Champion can attack twice.',
    description: '[Rune - Continuous] Stays on field. Build attack speed infinitely. One Champion attacks twice per turn.',
    image: 'runes/lethaltempo.jpg'
  },
  {
    id: 'rune_prec_003',
    name: 'Conqueror',
    type: 'RUNE',
    spellType: 'CONTINUOUS_SPELL',
    runePath: 'PRECISION',
    rarity: 'LEGENDARY',
    runeEffect: 'After battle: Gain 50 LP and draw 1 card (once per turn).',
    description: '[Rune - Continuous] Stays on field. Sustained combat mastery. +50 LP and draw 1 after battle.',
    image: 'runes/conqueror.jpg'
  },
  {
    id: 'rune_prec_004',
    name: 'Fleet Footwork',
    type: 'RUNE',
    spellType: 'CONTINUOUS_SPELL',
    runePath: 'PRECISION',
    rarity: 'RARE',
    runeEffect: 'When you deal battle damage: Gain 100 LP.',
    description: '[Rune - Continuous] Stays on field. Energized movement. +100 LP on battle damage.',
    image: 'runes/fleetfootwork.jpg'
  },
  {
    id: 'rune_prec_005',
    name: 'Triumph',
    type: 'RUNE',
    spellType: 'CONTINUOUS_SPELL',
    runePath: 'PRECISION',
    rarity: 'RARE',
    runeEffect: 'When you destroy a monster: Draw 1 card.',
    description: '[Rune - Continuous] Stays on field. Victory heals all wounds. Draw 1 on kill.',
    image: 'runes/triumph.jpg'
  },
  {
    id: 'rune_prec_006',
    name: 'Presence of Mind',
    type: 'RUNE',
    spellType: 'CONTINUOUS_SPELL',
    runePath: 'PRECISION',
    rarity: 'RARE',
    runeEffect: 'Once per turn: If you destroyed a monster, you may activate a Spell from hand as Quick-Play.',
    description: '[Rune - Continuous] Stays on field. Kills restore mana. Quick-Play Spell on kill.',
    image: 'runes/presenceofmind.jpg'
  },
  {
    id: 'rune_prec_007',
    name: 'Coup de Grace',
    type: 'RUNE',
    spellType: 'CONTINUOUS_SPELL',
    runePath: 'PRECISION',
    rarity: 'RARE',
    runeEffect: 'Monsters you battle with 1000 ATK or less cannot activate effects.',
    description: '[Rune - Continuous] Stays on field. Execute the wounded. Silence weak monsters in battle.',
    image: 'runes/coupdegrace.jpg'
  },
  {
    id: 'rune_prec_008',
    name: 'Cut Down',
    type: 'RUNE',
    spellType: 'CONTINUOUS_SPELL',
    runePath: 'PRECISION',
    rarity: 'RARE',
    runeEffect: 'Your monsters inflict piercing damage.',
    description: '[Rune - Continuous] Stays on field. Giant slayer. All your monsters deal piercing damage.',
    image: 'runes/cutdown.jpg'
  },
  {
    id: 'rune_prec_009',
    name: 'Last Stand',
    type: 'RUNE',
    spellType: 'CONTINUOUS_SPELL',
    runePath: 'PRECISION',
    rarity: 'RARE',
    runeEffect: 'While LP <= 2000: Your monsters cannot be destroyed by battle once per turn.',
    description: '[Rune - Continuous] Stays on field. Fight harder when wounded. Battle immunity at low LP.',
    image: 'runes/laststand.jpg'
  },

  // ============================================
  // DOMINATION - BURST & PUNISHMENT
  // ============================================
  {
    id: 'rune_dom_001',
    name: 'Electrocute',
    type: 'RUNE',
    spellType: 'CONTINUOUS_SPELL',
    runePath: 'DOMINATION',
    rarity: 'EPIC',
    runeEffect: 'After 3 effect activations: Destroy 1 card.',
    description: '[Rune - Continuous] Stays on field. Burst damage combo. 3 effects = destroy 1 card.',
    image: 'runes/electrocute.jpg'
  },
  {
    id: 'rune_dom_002',
    name: 'Dark Harvest',
    type: 'RUNE',
    spellType: 'CONTINUOUS_SPELL',
    runePath: 'DOMINATION',
    rarity: 'LEGENDARY',
    runeEffect: 'When opponent monster is destroyed: Inflict 100 damage.',
    description: '[Rune - Continuous] Stays on field. Souls empower you. 100 damage per enemy killed.',
    image: 'runes/darkharvest.jpg'
  },
  {
    id: 'rune_dom_003',
    name: 'Cheap Shot',
    type: 'RUNE',
    spellType: 'CONTINUOUS_SPELL',
    runePath: 'DOMINATION',
    rarity: 'COMMON',
    runeEffect: 'Monsters affected by ATK reduction cannot activate effects.',
    description: '[Rune - Continuous] Stays on field. Exploit weakness. Silence ATK-debuffed monsters.',
    image: 'runes/cheapshot.jpg'
  },
  {
    id: 'rune_dom_004',
    name: 'Taste of Blood',
    type: 'RUNE',
    spellType: 'CONTINUOUS_SPELL',
    runePath: 'DOMINATION',
    rarity: 'COMMON',
    runeEffect: 'Once per turn, when you deal damage: Gain 100 LP.',
    description: '[Rune - Continuous] Stays on field. Heal on hit. +100 LP once per turn when damaging.',
    image: 'runes/tasteofblood.jpg'
  },
  {
    id: 'rune_dom_005',
    name: 'Sudden Impact',
    type: 'RUNE',
    spellType: 'CONTINUOUS_SPELL',
    runePath: 'DOMINATION',
    rarity: 'RARE',
    runeEffect: 'When you Special Summon: Destroy 1 Set card.',
    description: '[Rune - Continuous] Stays on field. Burst in style. Destroy Set card on Special Summon.',
    image: 'runes/suddenimpact.jpg'
  },
  {
    id: 'rune_dom_006',
    name: 'Treasure Hunter',
    type: 'RUNE',
    spellType: 'CONTINUOUS_SPELL',
    runePath: 'DOMINATION',
    rarity: 'RARE',
    runeEffect: 'Once per turn, when you destroy a monster: Draw 1.',
    description: '[Rune - Continuous] Stays on field. Loot from kills. Draw 1 per kill (once/turn).',
    image: 'runes/treasurehunter.jpg'
  },
  {
    id: 'rune_dom_007',
    name: 'Ultimate Hunter',
    type: 'RUNE',
    spellType: 'CONTINUOUS_SPELL',
    runePath: 'DOMINATION',
    rarity: 'EPIC',
    runeEffect: 'Once per duel: Ignore tribute requirements for a Summon.',
    description: '[Rune - Continuous] Stays on field. Reduce ultimate cooldown. Free tribute once per duel.',
    image: 'runes/ultimatehunter.jpg'
  },

  // ============================================
  // SORCERY - SPELL MASTERY
  // ============================================
  {
    id: 'rune_sorc_001',
    name: 'Summon Aery',
    type: 'RUNE',
    spellType: 'CONTINUOUS_SPELL',
    runePath: 'SORCERY',
    rarity: 'RARE',
    runeEffect: 'Once per turn: When you activate a Spell, draw 1 then discard 1.',
    description: '[Rune - Continuous] Stays on field. Helpful spirit companion. Cycle cards on Spell use.',
    image: 'runes/summonaery.jpg'
  },
  {
    id: 'rune_sorc_002',
    name: 'Arcane Comet',
    type: 'RUNE',
    spellType: 'CONTINUOUS_SPELL',
    runePath: 'SORCERY',
    rarity: 'EPIC',
    runeEffect: 'First Spell each turn inflicts +100 damage.',
    description: '[Rune - Continuous] Stays on field. Meteor strikes your target. +100 damage on first Spell.',
    image: 'runes/arcanecomet.jpg'
  },
  {
    id: 'rune_sorc_003',
    name: 'Phase Rush',
    type: 'RUNE',
    spellType: 'CONTINUOUS_SPELL',
    runePath: 'SORCERY',
    rarity: 'EPIC',
    runeEffect: 'After 3 attacks in a turn: Monsters cannot be targeted next turn.',
    description: '[Rune - Continuous] Stays on field. Burst of speed. 3 attacks = untargetable next turn.',
    image: 'runes/phaserush.jpg'
  },
  {
    id: 'rune_sorc_004',
    name: 'Nullifying Orb',
    type: 'RUNE',
    spellType: 'CONTINUOUS_SPELL',
    runePath: 'SORCERY',
    rarity: 'RARE',
    runeEffect: 'Once per turn: Negate effect damage.',
    description: '[Rune - Continuous] Stays on field. Magic damage shield. Block effect damage once per turn.',
    image: 'runes/nullifyingorb.jpg'
  },
  {
    id: 'rune_sorc_005',
    name: 'Transcendence',
    type: 'RUNE',
    spellType: 'CONTINUOUS_SPELL',
    runePath: 'SORCERY',
    rarity: 'RARE',
    runeEffect: 'Once per turn: Activate 1 extra Spell.',
    description: '[Rune - Continuous] Stays on field. Ability haste overflow. +1 Spell activation per turn.',
    image: 'runes/transcendence.jpg'
  },
  {
    id: 'rune_sorc_006',
    name: 'Scorch',
    type: 'RUNE',
    spellType: 'CONTINUOUS_SPELL',
    runePath: 'SORCERY',
    rarity: 'COMMON',
    runeEffect: 'When you deal effect damage: Opponent discards 1 card.',
    description: '[Rune - Continuous] Stays on field. Lingering fire damage. Force discard on effect damage.',
    image: 'runes/scorch.jpg'
  },
  {
    id: 'rune_sorc_007',
    name: 'Absolute Focus',
    type: 'RUNE',
    spellType: 'CONTINUOUS_SPELL',
    runePath: 'SORCERY',
    rarity: 'RARE',
    runeEffect: 'While you have more LP: Spells cannot be negated.',
    description: '[Rune - Continuous] Stays on field. Power when healthy. Spells unnegatable at higher LP.',
    image: 'runes/absolutefocus.jpg'
  },
  {
    id: 'rune_sorc_008',
    name: 'Gathering Storm',
    type: 'RUNE',
    spellType: 'CONTINUOUS_SPELL',
    runePath: 'SORCERY',
    rarity: 'LEGENDARY',
    runeEffect: 'Every 3 turns: Draw 2 cards.',
    description: '[Rune - Continuous] Stays on field. Infinite scaling power. Draw 2 every 3 turns.',
    image: 'runes/gatheringstorm.jpg'
  },

  // ============================================
  // RESOLVE - DEFENSE & SUSTAIN
  // ============================================
  {
    id: 'rune_res_001',
    name: 'Grasp of the Undying',
    type: 'RUNE',
    spellType: 'CONTINUOUS_SPELL',
    runePath: 'RESOLVE',
    rarity: 'EPIC',
    runeEffect: 'When your monster survives battle: Gain 100 LP.',
    description: '[Rune - Continuous] Stays on field. Sustain and scale. +100 LP when surviving battle.',
    image: 'runes/graspoftheundying.jpg'
  },
  {
    id: 'rune_res_002',
    name: 'Aftershock',
    type: 'RUNE',
    spellType: 'CONTINUOUS_SPELL',
    runePath: 'RESOLVE',
    rarity: 'EPIC',
    runeEffect: 'When your monster survives battle: Destroy 1 face-down card.',
    description: '[Rune - Continuous] Stays on field. Counterattack burst. Destroy Set card after surviving.',
    image: 'runes/aftershock.jpg'
  },
  {
    id: 'rune_res_003',
    name: 'Demolish',
    type: 'RUNE',
    spellType: 'CONTINUOUS_SPELL',
    runePath: 'RESOLVE',
    rarity: 'RARE',
    runeEffect: 'When you attack directly: Destroy 1 Spell/Trap.',
    description: '[Rune - Continuous] Stays on field. Tower destruction. Destroy Spell/Trap on direct attack.',
    image: 'runes/demolish.jpg'
  },
  {
    id: 'rune_res_004',
    name: 'Second Wind',
    type: 'RUNE',
    spellType: 'CONTINUOUS_SPELL',
    runePath: 'RESOLVE',
    rarity: 'COMMON',
    runeEffect: 'During Standby Phase: Gain 100 LP.',
    description: '[Rune - Continuous] Stays on field. Regeneration over time. +100 LP each Standby Phase.',
    image: 'runes/secondwind.jpg'
  },
  {
    id: 'rune_res_005',
    name: 'Bone Plating',
    type: 'RUNE',
    spellType: 'CONTINUOUS_SPELL',
    runePath: 'RESOLVE',
    rarity: 'RARE',
    runeEffect: 'Once per turn: Negate the first damage instance.',
    description: '[Rune - Continuous] Stays on field. Block burst damage. Negate first damage per turn.',
    image: 'runes/boneplating.jpg'
  },
  {
    id: 'rune_res_006',
    name: 'Overgrowth',
    type: 'RUNE',
    spellType: 'CONTINUOUS_SPELL',
    runePath: 'RESOLVE',
    rarity: 'COMMON',
    runeEffect: 'When you gain LP: Draw 1 card (once per turn).',
    description: '[Rune - Continuous] Stays on field. Health amplification. Draw 1 when healing.',
    image: 'runes/overgrowth.jpg'
  },
  {
    id: 'rune_res_007',
    name: 'Revitalize',
    type: 'RUNE',
    spellType: 'CONTINUOUS_SPELL',
    runePath: 'RESOLVE',
    rarity: 'RARE',
    runeEffect: 'All LP gain effects +50.',
    description: '[Rune - Continuous] Stays on field. Enhanced healing. +50 to all LP gains.',
    image: 'runes/revitalize.jpg'
  },
  {
    id: 'rune_res_008',
    name: 'Unflinching',
    type: 'RUNE',
    spellType: 'CONTINUOUS_SPELL',
    runePath: 'RESOLVE',
    rarity: 'RARE',
    runeEffect: 'Your monsters cannot have their effects negated in battle.',
    description: '[Rune - Continuous] Stays on field. Tenacity and slow resist. Effects work in battle.',
    image: 'runes/unflinching.jpg'
  },

  // ============================================
  // INSPIRATION - RULE BENDING
  // ============================================
  {
    id: 'rune_insp_001',
    name: 'Glacial Augment',
    type: 'RUNE',
    spellType: 'CONTINUOUS_SPELL',
    runePath: 'INSPIRATION',
    rarity: 'EPIC',
    runeEffect: 'Monsters you battle cannot attack next turn.',
    description: '[Rune - Continuous] Stays on field. Freeze ray slows. Battled monsters skip next attack.',
    image: 'runes/glacialaugment.jpg'
  },
  {
    id: 'rune_insp_002',
    name: 'First Strike',
    type: 'RUNE',
    spellType: 'CONTINUOUS_SPELL',
    runePath: 'INSPIRATION',
    rarity: 'RARE',
    runeEffect: 'Your first attack each turn happens before responses.',
    description: '[Rune - Continuous] Stays on field. Always strike first. First attack cannot be responded to.',
    image: 'runes/firststrike.jpg'
  },
  {
    id: 'rune_insp_003',
    name: 'Hextech Flashtraption',
    type: 'RUNE',
    spellType: 'CONTINUOUS_SPELL',
    runePath: 'INSPIRATION',
    rarity: 'RARE',
    runeEffect: 'Once per duel: Special Summon 1 monster ignoring conditions.',
    description: '[Rune - Continuous] Stays on field. Flash alternative. Free Special Summon once.',
    image: 'runes/hexflash.jpg'
  },
  {
    id: 'rune_insp_004',
    name: 'Magical Footwear',
    type: 'RUNE',
    spellType: 'CONTINUOUS_SPELL',
    runePath: 'INSPIRATION',
    rarity: 'COMMON',
    runeEffect: 'After turn 5: Draw 1 extra card each turn.',
    description: '[Rune - Continuous] Stays on field. Free boots upgrade. +1 draw after turn 5.',
    image: 'runes/magicalfootwear.jpg'
  },
  {
    id: 'rune_insp_005',
    name: 'Biscuit Delivery',
    type: 'RUNE',
    spellType: 'CONTINUOUS_SPELL',
    runePath: 'INSPIRATION',
    rarity: 'COMMON',
    runeEffect: 'Turns 3/6/9: Draw 1 and gain 100 LP.',
    description: '[Rune - Continuous] Stays on field. Sustain delivery. Draw 1 + 100 LP on turns 3/6/9.',
    image: 'runes/biscuit.jpg'
  },
  {
    id: 'rune_insp_006',
    name: 'Cosmic Insight',
    type: 'RUNE',
    spellType: 'CONTINUOUS_SPELL',
    runePath: 'INSPIRATION',
    rarity: 'RARE',
    runeEffect: 'You can activate Set Continuous cards immediately.',
    description: '[Rune - Continuous] Stays on field. Reduced cooldowns. No wait for Continuous cards.',
    image: 'runes/cosmicinsight.jpg'
  },
  {
    id: 'rune_insp_007',
    name: 'Approach Velocity',
    type: 'RUNE',
    spellType: 'CONTINUOUS_SPELL',
    runePath: 'INSPIRATION',
    rarity: 'RARE',
    runeEffect: 'Monsters with reduced ATK can be attacked directly.',
    description: '[Rune - Continuous] Stays on field. Rush impaired enemies. Direct attack debuffed monsters.',
    image: 'runes/approachvelocity.jpg'
  },
  {
    id: 'rune_insp_008',
    name: 'Time Warp Tonic',
    type: 'RUNE',
    spellType: 'CONTINUOUS_SPELL',
    runePath: 'INSPIRATION',
    rarity: 'RARE',
    runeEffect: 'LP gain effects also draw 1 card (once per turn).',
    description: '[Rune - Continuous] Stays on field. Instant potion effect. Draw 1 when healing.',
    image: 'runes/timewarptonic.jpg'
  },
];

// Combined export for easy import
export const allItemsAndRunes = [...items, ...runes];
