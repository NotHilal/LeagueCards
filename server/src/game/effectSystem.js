/**
 * Effect System - Implements all card effects
 *
 * Trigger Types:
 * - ON_ATTACK: When a champion attacks
 * - ON_BATTLE_DAMAGE: When dealing battle damage
 * - ON_DESTROY_MONSTER: When destroying an enemy monster
 * - ON_CHAMPION_DESTROYED: When your champion is destroyed
 * - ON_CHAMPION_SURVIVES: When champion survives battle
 * - ON_DIRECT_ATTACK: When attacking directly
 * - ON_EQUIP: When item is equipped
 * - ON_LP_GAIN: When gaining LP
 * - ON_EFFECT_DAMAGE: When dealing effect damage
 * - ON_SUMMON: When normal summoning
 * - ON_SPECIAL_SUMMON: When special summoning
 * - ON_STANDBY_PHASE: During standby phase
 * - ON_END_PHASE: During end phase
 * - ON_TAKE_DAMAGE: When taking any damage
 * - ON_SPELL_ACTIVATE: When activating a spell
 * - PASSIVE: Always active
 * - ACTIVATED: Manually activated (once per turn)
 */

// Track effect state per game
const gameEffectStates = new Map();

/**
 * Initialize effect state for a game
 */
export function initializeEffectState(gameId) {
  gameEffectStates.set(gameId, {
    counters: {}, // Card counters (e.g., Rage counters, Age counters)
    usedThisTurn: {}, // Track once-per-turn effects
    usedThisDuel: {}, // Track once-per-duel effects
    turnCount: 0,
    effectDamageDealtThisTurn: { 0: false, 1: false },
    lpGainedThisTurn: { 0: false, 1: false },
    attacksThisTurn: { 0: 0, 1: 0 },
    spellsActivatedThisTurn: { 0: 0, 1: 0 },
    monstersDestroyedThisTurn: { 0: 0, 1: 0 },
    healingBlocked: { 0: false, 1: false },
    cannotGainAtk: { 0: false, 1: false },
    spellsCannotBeNegated: { 0: false, 1: false },
    effectDamageReduction: { 0: 0, 1: 0 },
    markedForDestruction: [], // Cards to destroy at end of turn
    reviveAtEndPhase: [], // Champions to revive at end phase
  });
  return gameEffectStates.get(gameId);
}

/**
 * Get effect state for a game
 */
export function getEffectState(gameId) {
  if (!gameEffectStates.has(gameId)) {
    return initializeEffectState(gameId);
  }
  return gameEffectStates.get(gameId);
}

/**
 * Reset turn-based effect tracking
 */
export function resetTurnEffects(gameId, playerIndex) {
  const state = getEffectState(gameId);
  state.usedThisTurn = {};
  state.effectDamageDealtThisTurn[playerIndex] = false;
  state.lpGainedThisTurn[playerIndex] = false;
  state.attacksThisTurn[playerIndex] = 0;
  state.spellsActivatedThisTurn[playerIndex] = 0;
  state.monstersDestroyedThisTurn[playerIndex] = 0;
  state.healingBlocked[playerIndex] = false;
  state.spellsCannotBeNegated[playerIndex] = false;
  state.effectDamageReduction[playerIndex] = 0;
  state.turnCount++;
}

/**
 * Get or initialize counter for a card
 */
function getCounter(gameId, cardInstanceId, counterName) {
  const state = getEffectState(gameId);
  const key = `${cardInstanceId}_${counterName}`;
  return state.counters[key] || 0;
}

/**
 * Add to counter for a card
 */
function addCounter(gameId, cardInstanceId, counterName, amount = 1, max = Infinity) {
  const state = getEffectState(gameId);
  const key = `${cardInstanceId}_${counterName}`;
  state.counters[key] = Math.min((state.counters[key] || 0) + amount, max);
  return state.counters[key];
}

/**
 * Check if effect was used this turn
 */
function wasUsedThisTurn(gameId, effectKey) {
  const state = getEffectState(gameId);
  return state.usedThisTurn[effectKey] || false;
}

/**
 * Mark effect as used this turn
 */
function markUsedThisTurn(gameId, effectKey) {
  const state = getEffectState(gameId);
  state.usedThisTurn[effectKey] = true;
}

/**
 * Check if effect was used this duel
 */
function wasUsedThisDuel(gameId, effectKey) {
  const state = getEffectState(gameId);
  return state.usedThisDuel[effectKey] || false;
}

/**
 * Mark effect as used this duel
 */
function markUsedThisDuel(gameId, effectKey) {
  const state = getEffectState(gameId);
  state.usedThisDuel[effectKey] = true;
}

// ============================================
// EFFECT DEFINITIONS BY CARD ID
// ============================================

const EFFECT_HANDLERS = {
  // ============================================
  // AD ITEMS
  // ============================================

  // Infinity Edge - Attack again after destroying (no direct)
  'item_ad_001': {
    trigger: 'ON_DESTROY_MONSTER',
    execute: (ctx) => {
      const key = `${ctx.cardInstanceId}_attack_again`;
      if (!wasUsedThisTurn(ctx.gameId, key)) {
        markUsedThisTurn(ctx.gameId, key);
        ctx.effects.push({
          type: 'ALLOW_ATTACK_AGAIN',
          championIndex: ctx.attackerIndex,
          canDirectAttack: false,
          message: 'Infinity Edge: Champion can attack again!'
        });
      }
      return ctx;
    }
  },

  // Bloodthirster - 200 LP on damage, draw on kill
  'item_ad_002': {
    trigger: 'ON_BATTLE_DAMAGE',
    execute: (ctx) => {
      ctx.effects.push({
        type: 'GAIN_LP',
        playerIndex: ctx.attackerPlayerIndex,
        amount: 200,
        message: 'Bloodthirster: Gained 200 LP!'
      });
      return ctx;
    },
    secondaryTrigger: 'ON_DESTROY_MONSTER',
    secondaryExecute: (ctx) => {
      ctx.effects.push({
        type: 'DRAW_CARDS',
        playerIndex: ctx.attackerPlayerIndex,
        amount: 1,
        message: 'Bloodthirster: Drew 1 card!'
      });
      return ctx;
    }
  },

  // Blade of the Ruined King - Steal 300 ATK (activated)
  'item_ad_003': {
    trigger: 'ACTIVATED',
    requiresTarget: 'ENEMY_MONSTER',
    execute: (ctx) => {
      const key = `${ctx.cardInstanceId}_steal`;
      if (!wasUsedThisTurn(ctx.gameId, key)) {
        markUsedThisTurn(ctx.gameId, key);
        ctx.effects.push({
          type: 'MODIFY_ATK',
          targetPlayerIndex: ctx.targetPlayerIndex,
          targetIndex: ctx.targetIndex,
          amount: -300,
          duration: 'END_OF_TURN',
          message: 'Blade of the Ruined King: Stole 300 ATK!'
        });
        ctx.effects.push({
          type: 'TEMP_ATK_BOOST',
          championIndex: ctx.equippedChampionIndex,
          amount: 300,
          duration: 'ONE_BATTLE',
          message: ''
        });
      }
      return ctx;
    }
  },

  // Lord Dominik's Regards - Pierce + 100 bonus
  'item_ad_004': {
    trigger: 'PASSIVE',
    execute: (ctx) => {
      ctx.effects.push({
        type: 'GRANT_PIERCE',
        championIndex: ctx.equippedChampionIndex,
        bonusDamage: 100,
        message: "Lord Dominik's Regards: Piercing damage!"
      });
      return ctx;
    }
  },

  // Guinsoo's Rageblade - +100 ATK per attack (max 3)
  'item_ad_005': {
    trigger: 'ON_ATTACK',
    execute: (ctx) => {
      const count = addCounter(ctx.gameId, ctx.cardInstanceId, 'rage', 1, 3);
      ctx.effects.push({
        type: 'PERMANENT_ATK_BOOST',
        championIndex: ctx.equippedChampionIndex,
        amount: 100,
        message: `Guinsoo's Rageblade: ${count} stacks (+${count * 100} ATK)`
      });
      return ctx;
    }
  },

  // Youmuu's Ghostblade - Attack directly, skip next attack
  'item_ad_006': {
    trigger: 'ACTIVATED',
    execute: (ctx) => {
      const key = `${ctx.cardInstanceId}_ghostblade`;
      if (!wasUsedThisTurn(ctx.gameId, key)) {
        markUsedThisTurn(ctx.gameId, key);
        ctx.effects.push({
          type: 'ALLOW_DIRECT_ATTACK',
          championIndex: ctx.equippedChampionIndex,
          skipNextAttack: true,
          message: "Youmuu's Ghostblade: Can attack directly!"
        });
      }
      return ctx;
    }
  },

  // Titanic Hydra - ATK = half DEF, change position on kill
  'item_ad_007': {
    trigger: 'PASSIVE',
    execute: (ctx) => {
      const champion = ctx.gameState.players[ctx.playerIndex].field.champions[ctx.equippedChampionIndex];
      if (champion) {
        const bonusATK = Math.floor((champion.currentDefense || champion.card.defense || 0) / 2);
        ctx.effects.push({
          type: 'ATK_FROM_DEF',
          championIndex: ctx.equippedChampionIndex,
          amount: bonusATK,
          message: `Titanic Hydra: +${bonusATK} ATK from DEF`
        });
      }
      return ctx;
    },
    secondaryTrigger: 'ON_DESTROY_MONSTER',
    secondaryExecute: (ctx) => {
      ctx.effects.push({
        type: 'CHANGE_ENEMY_POSITION',
        message: 'Titanic Hydra: You may change a monster\'s position'
      });
      return ctx;
    }
  },

  // Ravenous Hydra - Destroy face-down on kill
  'item_ad_008': {
    trigger: 'ON_DESTROY_MONSTER',
    execute: (ctx) => {
      ctx.effects.push({
        type: 'DESTROY_FACE_DOWN',
        playerIndex: ctx.attackerPlayerIndex,
        message: 'Ravenous Hydra: Destroy a face-down card!'
      });
      return ctx;
    }
  },

  // Navori Quickblades - Extra equip after attack
  'item_ad_009': {
    trigger: 'ON_ATTACK',
    execute: (ctx) => {
      const key = `${ctx.cardInstanceId}_navori`;
      if (!wasUsedThisTurn(ctx.gameId, key)) {
        markUsedThisTurn(ctx.gameId, key);
        ctx.effects.push({
          type: 'ALLOW_EXTRA_EQUIP',
          playerIndex: ctx.attackerPlayerIndex,
          message: 'Navori Quickblades: Extra equip this turn!'
        });
      }
      return ctx;
    }
  },

  // Rapid Firecannon - First attack can be direct
  'item_ad_010': {
    trigger: 'PASSIVE',
    execute: (ctx) => {
      const state = getEffectState(ctx.gameId);
      if (state.attacksThisTurn[ctx.playerIndex] === 0) {
        ctx.effects.push({
          type: 'FIRST_ATTACK_DIRECT',
          championIndex: ctx.equippedChampionIndex,
          message: 'Rapid Firecannon: First attack can be direct!'
        });
      }
      return ctx;
    }
  },

  // Stormrazor - Silence a monster
  'item_ad_011': {
    trigger: 'ON_PLAY',
    requiresTarget: 'ANY_MONSTER',
    execute: (ctx) => {
      ctx.effects.push({
        type: 'SILENCE_MONSTER',
        targetPlayerIndex: ctx.targetPlayerIndex,
        targetIndex: ctx.targetIndex,
        duration: 'END_OF_TURN',
        message: 'Stormrazor: Monster silenced!'
      });
      return ctx;
    }
  },

  // Essence Reaver - Draw 2, discard 1
  'item_ad_012': {
    trigger: 'ON_PLAY',
    execute: (ctx) => {
      ctx.effects.push({
        type: 'DRAW_CARDS',
        playerIndex: ctx.playerIndex,
        amount: 2,
        message: 'Essence Reaver: Drew 2 cards!'
      });
      ctx.effects.push({
        type: 'FORCE_DISCARD',
        playerIndex: ctx.playerIndex,
        amount: 1,
        message: 'Essence Reaver: Discard 1 card'
      });
      return ctx;
    }
  },

  // Opportunity - Revive from graveyard
  'item_ad_013': {
    trigger: 'ON_PLAY',
    requiresTarget: 'OWN_GRAVEYARD_MONSTER',
    execute: (ctx) => {
      ctx.effects.push({
        type: 'SPECIAL_SUMMON_FROM_GRAVEYARD',
        playerIndex: ctx.playerIndex,
        graveyardIndex: ctx.targetIndex,
        canAttack: false,
        message: 'Opportunity: Champion revived!'
      });
      return ctx;
    }
  },

  // Stridebreaker - All enemies to DEF
  'item_ad_014': {
    trigger: 'ON_PLAY',
    execute: (ctx) => {
      ctx.effects.push({
        type: 'CHANGE_ALL_TO_DEFENSE',
        targetPlayerIndex: ctx.opponentIndex,
        lockPosition: true,
        message: 'Stridebreaker: All enemies in Defense!'
      });
      return ctx;
    }
  },

  // Umbral Glaive - Look at hand, discard spell/trap
  'item_ad_015': {
    trigger: 'ON_PLAY',
    execute: (ctx) => {
      ctx.effects.push({
        type: 'REVEAL_HAND',
        targetPlayerIndex: ctx.opponentIndex,
        message: 'Umbral Glaive: Revealed opponent hand!'
      });
      ctx.effects.push({
        type: 'DISCARD_SPELL_FROM_HAND',
        targetPlayerIndex: ctx.opponentIndex,
        message: 'Umbral Glaive: Discard 1 Spell/Trap!'
      });
      return ctx;
    }
  },

  // Experimental Hexplate - +400 ATK, destroy at end
  'item_ad_016': {
    trigger: 'ON_PLAY',
    requiresTarget: 'OWN_MONSTER',
    execute: (ctx) => {
      ctx.effects.push({
        type: 'TEMP_ATK_BOOST',
        targetPlayerIndex: ctx.playerIndex,
        targetIndex: ctx.targetIndex,
        amount: 400,
        destroyAtEnd: true,
        message: 'Experimental Hexplate: +400 ATK!'
      });
      const state = getEffectState(ctx.gameId);
      state.markedForDestruction.push({
        playerIndex: ctx.playerIndex,
        fieldIndex: ctx.targetIndex
      });
      return ctx;
    }
  },

  // Profane Hydra - Destroy equip on kill
  'item_ad_017': {
    trigger: 'ON_DESTROY_MONSTER',
    execute: (ctx) => {
      ctx.effects.push({
        type: 'DESTROY_EQUIP_CARD',
        message: 'Profane Hydra: Destroy an Equip card!'
      });
      return ctx;
    }
  },

  // Kraken Slayer - Second battle deals overkill
  'item_ad_018': {
    trigger: 'PASSIVE',
    execute: (ctx) => {
      const state = getEffectState(ctx.gameId);
      if (state.attacksThisTurn[ctx.playerIndex] % 2 === 1) {
        ctx.effects.push({
          type: 'OVERKILL_DAMAGE',
          message: 'Kraken Slayer: Overkill damage!'
        });
      }
      return ctx;
    }
  },

  // Collector - Destroy 0 ATK monsters
  'item_ad_019': {
    trigger: 'PASSIVE',
    execute: (ctx) => {
      ctx.effects.push({
        type: 'EXECUTE_ZERO_ATK',
        message: 'Collector: Execute triggered!'
      });
      return ctx;
    }
  },

  // Phantom Dancer - Prevent destruction once
  'item_ad_020': {
    trigger: 'ON_CHAMPION_DESTROYED',
    execute: (ctx) => {
      const key = `${ctx.cardInstanceId}_phantom`;
      if (!wasUsedThisTurn(ctx.gameId, key)) {
        markUsedThisTurn(ctx.gameId, key);
        ctx.effects.push({
          type: 'NEGATE_DESTRUCTION',
          championIndex: ctx.destroyedChampionIndex,
          destroyItem: true,
          message: 'Phantom Dancer: Destruction negated!'
        });
      }
      return ctx;
    }
  },

  // Edge of Night - Negate first targeting
  'item_ad_021': {
    trigger: 'ON_TARGETED',
    execute: (ctx) => {
      const key = `${ctx.cardInstanceId}_edge`;
      if (!wasUsedThisTurn(ctx.gameId, key)) {
        markUsedThisTurn(ctx.gameId, key);
        ctx.effects.push({
          type: 'NEGATE_TARGETING',
          message: 'Edge of Night: Targeting negated!'
        });
      }
      return ctx;
    }
  },

  // ============================================
  // AP ITEMS
  // ============================================

  // Luden's Companion - 300 damage, draw on kill
  'item_ap_001': {
    trigger: 'ON_PLAY',
    execute: (ctx) => {
      ctx.effects.push({
        type: 'DEAL_EFFECT_DAMAGE',
        targetPlayerIndex: ctx.opponentIndex,
        amount: 300,
        message: "Luden's Companion: 300 damage!"
      });
      // Draw on kill tracked separately
      return ctx;
    }
  },

  // Shadowflame - Destroy 1000 ATK or less
  'item_ap_002': {
    trigger: 'ON_PLAY',
    requiresTarget: 'WEAK_MONSTER',
    atkThreshold: 1000,
    execute: (ctx) => {
      ctx.effects.push({
        type: 'DESTROY_MONSTER',
        targetPlayerIndex: ctx.targetPlayerIndex,
        targetIndex: ctx.targetIndex,
        message: 'Shadowflame: Monster destroyed!'
      });
      return ctx;
    }
  },

  // Morellonomicon - 200 damage, block healing
  'item_ap_003': {
    trigger: 'ON_PLAY',
    execute: (ctx) => {
      ctx.effects.push({
        type: 'DEAL_EFFECT_DAMAGE',
        targetPlayerIndex: ctx.opponentIndex,
        amount: 200,
        message: 'Morellonomicon: 200 damage!'
      });
      const state = getEffectState(ctx.gameId);
      state.healingBlocked[ctx.opponentIndex] = true;
      ctx.effects.push({
        type: 'BLOCK_HEALING',
        targetPlayerIndex: ctx.opponentIndex,
        duration: 'NEXT_TURN_END',
        message: 'Morellonomicon: Healing blocked!'
      });
      return ctx;
    }
  },

  // Stormsurge - Destroy spell/trap if losing
  'item_ap_004': {
    trigger: 'ON_PLAY',
    execute: (ctx) => {
      const player = ctx.gameState.players[ctx.playerIndex];
      const opponent = ctx.gameState.players[ctx.opponentIndex];
      if (opponent.lifePoints > player.lifePoints) {
        ctx.effects.push({
          type: 'DESTROY_FACE_UP_SPELL_TRAP',
          message: 'Stormsurge: Destroy a Spell/Trap!'
        });
      }
      return ctx;
    }
  },

  // Blackfire Torch - 100 per card in hand
  'item_ap_005': {
    trigger: 'ON_PLAY',
    execute: (ctx) => {
      const opponent = ctx.gameState.players[ctx.opponentIndex];
      const damage = opponent.hand.length * 100;
      ctx.effects.push({
        type: 'DEAL_EFFECT_DAMAGE',
        targetPlayerIndex: ctx.opponentIndex,
        amount: damage,
        message: `Blackfire Torch: ${damage} damage!`
      });
      return ctx;
    }
  },

  // Horizon Focus - Reveal and destroy set
  'item_ap_006': {
    trigger: 'ON_PLAY',
    execute: (ctx) => {
      ctx.effects.push({
        type: 'REVEAL_SET_CARDS',
        message: 'Horizon Focus: Set cards revealed!'
      });
      ctx.effects.push({
        type: 'DESTROY_SET_CARD',
        message: 'Horizon Focus: Destroy 1 Set card!'
      });
      return ctx;
    }
  },

  // Cosmic Drive - Draw 2, set 1
  'item_ap_007': {
    trigger: 'ON_PLAY',
    execute: (ctx) => {
      ctx.effects.push({
        type: 'DRAW_CARDS',
        playerIndex: ctx.playerIndex,
        amount: 2,
        message: 'Cosmic Drive: Drew 2 cards!'
      });
      ctx.effects.push({
        type: 'OPTIONAL_SET',
        playerIndex: ctx.playerIndex,
        message: 'Cosmic Drive: You may Set 1 Spell/Trap'
      });
      return ctx;
    }
  },

  // Rabadon's Deathcap - +100 effect damage
  'item_ap_008': {
    trigger: 'ON_EFFECT_DAMAGE',
    execute: (ctx) => {
      const key = `${ctx.cardInstanceId}_rabadon`;
      if (!wasUsedThisTurn(ctx.gameId, key)) {
        markUsedThisTurn(ctx.gameId, key);
        ctx.effects.push({
          type: 'BONUS_EFFECT_DAMAGE',
          amount: 100,
          message: "Rabadon's Deathcap: +100 damage!"
        });
      }
      return ctx;
    }
  },

  // Rylai's Crystal Scepter - Damaged monsters can't attack
  'item_ap_009': {
    trigger: 'ON_EFFECT_DAMAGE_TO_MONSTER',
    execute: (ctx) => {
      ctx.effects.push({
        type: 'PREVENT_ATTACK_NEXT_TURN',
        targetPlayerIndex: ctx.targetPlayerIndex,
        targetIndex: ctx.targetIndex,
        message: "Rylai's Crystal Scepter: Monster frozen!"
      });
      return ctx;
    }
  },

  // Nashor's Tooth - 100 effect damage on attack
  'item_ap_010': {
    trigger: 'ON_ATTACK',
    execute: (ctx) => {
      const key = `${ctx.cardInstanceId}_nashor`;
      if (!wasUsedThisTurn(ctx.gameId, key)) {
        markUsedThisTurn(ctx.gameId, key);
        ctx.effects.push({
          type: 'DEAL_EFFECT_DAMAGE',
          targetPlayerIndex: ctx.opponentIndex,
          amount: 100,
          message: "Nashor's Tooth: 100 damage!"
        });
      }
      return ctx;
    }
  },

  // Riftmaker - Heal 50 on damage
  'item_ap_011': {
    trigger: 'ON_DEAL_DAMAGE',
    execute: (ctx) => {
      ctx.effects.push({
        type: 'GAIN_LP',
        playerIndex: ctx.playerIndex,
        amount: 50,
        message: 'Riftmaker: +50 LP!'
      });
      return ctx;
    }
  },

  // Rod of Ages - Counters, heal per counter
  'item_ap_012': {
    trigger: 'ON_STANDBY_PHASE',
    execute: (ctx) => {
      const count = addCounter(ctx.gameId, ctx.cardInstanceId, 'age', 1, 5);
      const heal = count * 50;
      ctx.effects.push({
        type: 'GAIN_LP',
        playerIndex: ctx.playerIndex,
        amount: heal,
        message: `Rod of Ages: +${heal} LP (${count} stacks)`
      });
      return ctx;
    }
  },

  // Archangel's Staff - Cycle cards, 500 LP after 3
  'item_ap_013': {
    trigger: 'ACTIVATED',
    execute: (ctx) => {
      const key = `${ctx.cardInstanceId}_archangel`;
      if (!wasUsedThisTurn(ctx.gameId, key)) {
        markUsedThisTurn(ctx.gameId, key);
        ctx.effects.push({
          type: 'DRAW_CARDS',
          playerIndex: ctx.playerIndex,
          amount: 1,
          message: "Archangel's Staff: Draw 1"
        });
        ctx.effects.push({
          type: 'FORCE_DISCARD',
          playerIndex: ctx.playerIndex,
          amount: 1,
          message: "Archangel's Staff: Discard 1"
        });
        const count = addCounter(ctx.gameId, ctx.cardInstanceId, 'use', 1, 3);
        if (count >= 3) {
          ctx.effects.push({
            type: 'GAIN_LP',
            playerIndex: ctx.playerIndex,
            amount: 500,
            message: "Archangel's Staff: +500 LP! Transformed!"
          });
          ctx.effects.push({
            type: 'DESTROY_THIS_CARD',
            message: ''
          });
        }
      }
      return ctx;
    }
  },

  // Malignance - Destroy face-down on Lv6+ summon
  'item_ap_014': {
    trigger: 'ON_SUMMON',
    execute: (ctx) => {
      if (ctx.summonedCard.level >= 6) {
        ctx.effects.push({
          type: 'DESTROY_FACE_DOWN',
          message: 'Malignance: Destroy a face-down card!'
        });
      }
      return ctx;
    }
  },

  // Void Staff - Effect damage cannot be reduced
  'item_ap_015': {
    trigger: 'PASSIVE',
    execute: (ctx) => {
      const state = getEffectState(ctx.gameId);
      state.spellsCannotBeNegated[ctx.playerIndex] = true;
      return ctx;
    }
  },

  // Cryptbloom - Heal 100 when any monster dies
  'item_ap_016': {
    trigger: 'ON_ANY_MONSTER_DESTROYED',
    execute: (ctx) => {
      ctx.effects.push({
        type: 'GAIN_LP',
        playerIndex: ctx.playerIndex,
        amount: 100,
        message: 'Cryptbloom: +100 LP!'
      });
      return ctx;
    }
  },

  // Mejai's Soulstealer - Collect souls, destroy monster
  'item_ap_017': {
    trigger: 'ON_DESTROY_MONSTER',
    execute: (ctx) => {
      const count = addCounter(ctx.gameId, ctx.cardInstanceId, 'soul', 1);
      if (count >= 3) {
        ctx.effects.push({
          type: 'DESTROY_ANY_MONSTER',
          message: "Mejai's Soulstealer: 3 souls - Destroy a monster!"
        });
        // Reset counter
        const state = getEffectState(ctx.gameId);
        state.counters[`${ctx.cardInstanceId}_soul`] = 0;
      }
      return ctx;
    }
  },

  // Liandry's Torment - +100 at end if effect damage
  'item_ap_018': {
    trigger: 'ON_END_PHASE',
    execute: (ctx) => {
      const state = getEffectState(ctx.gameId);
      if (state.effectDamageDealtThisTurn[ctx.playerIndex]) {
        ctx.effects.push({
          type: 'DEAL_EFFECT_DAMAGE',
          targetPlayerIndex: ctx.opponentIndex,
          amount: 100,
          message: "Liandry's Torment: +100 damage!"
        });
      }
      return ctx;
    }
  },

  // Lich Bane - First attack double damage
  'item_ap_019': {
    trigger: 'ON_ATTACK',
    execute: (ctx) => {
      const state = getEffectState(ctx.gameId);
      if (state.attacksThisTurn[ctx.playerIndex] === 0) {
        ctx.effects.push({
          type: 'DOUBLE_BATTLE_DAMAGE',
          message: 'Lich Bane: Double damage!'
        });
      }
      return ctx;
    }
  },

  // ============================================
  // TANK ITEMS
  // ============================================

  // Dead Man's Plate - Survive battle once
  'item_tank_001': {
    trigger: 'ON_CHAMPION_DESTROYED',
    execute: (ctx) => {
      const key = `${ctx.cardInstanceId}_deadman`;
      if (!wasUsedThisTurn(ctx.gameId, key)) {
        markUsedThisTurn(ctx.gameId, key);
        ctx.effects.push({
          type: 'NEGATE_DESTRUCTION',
          message: "Dead Man's Plate: Survived!"
        });
      }
      return ctx;
    }
  },

  // Spirit Visage - Draw on LP gain
  'item_tank_002': {
    trigger: 'ON_LP_GAIN',
    execute: (ctx) => {
      const key = `${ctx.cardInstanceId}_spirit`;
      if (!wasUsedThisTurn(ctx.gameId, key)) {
        markUsedThisTurn(ctx.gameId, key);
        ctx.effects.push({
          type: 'DRAW_CARDS',
          playerIndex: ctx.playerIndex,
          amount: 1,
          message: 'Spirit Visage: Drew 1 card!'
        });
      }
      return ctx;
    }
  },

  // Abyssal Mask - Enemies lose 200 ATK after battle
  'item_tank_003': {
    trigger: 'ON_CHAMPION_SURVIVES',
    execute: (ctx) => {
      if (ctx.attackerPlayerIndex !== ctx.playerIndex) {
        ctx.effects.push({
          type: 'PERMANENT_ATK_REDUCTION',
          targetPlayerIndex: ctx.attackerPlayerIndex,
          targetIndex: ctx.attackerIndex,
          amount: 200,
          message: 'Abyssal Mask: -200 ATK!'
        });
      }
      return ctx;
    }
  },

  // Heartsteel - +200 LP if survived battle
  'item_tank_004': {
    trigger: 'ON_END_PHASE',
    execute: (ctx) => {
      // Check if champion survived battle this turn
      const champion = ctx.gameState.players[ctx.playerIndex].field.champions[ctx.equippedChampionIndex];
      if (champion && champion.survivedBattle) {
        ctx.effects.push({
          type: 'GAIN_LP',
          playerIndex: ctx.playerIndex,
          amount: 200,
          message: 'Heartsteel: +200 LP!'
        });
      }
      return ctx;
    }
  },

  // Sunfire Cape - 100 damage at end
  'item_tank_005': {
    trigger: 'ON_END_PHASE',
    execute: (ctx) => {
      ctx.effects.push({
        type: 'DEAL_EFFECT_DAMAGE',
        targetPlayerIndex: ctx.opponentIndex,
        amount: 100,
        message: 'Sunfire Cape: 100 damage!'
      });
      return ctx;
    }
  },

  // Warmog's Armor - +150 LP at standby
  'item_tank_006': {
    trigger: 'ON_STANDBY_PHASE',
    execute: (ctx) => {
      ctx.effects.push({
        type: 'GAIN_LP',
        playerIndex: ctx.playerIndex,
        amount: 150,
        message: "Warmog's Armor: +150 LP!"
      });
      return ctx;
    }
  },

  // Frozen Heart - Enemies can't gain ATK
  'item_tank_007': {
    trigger: 'PASSIVE',
    execute: (ctx) => {
      const state = getEffectState(ctx.gameId);
      state.cannotGainAtk[ctx.opponentIndex] = true;
      return ctx;
    }
  },

  // Force of Nature - -100 effect damage
  'item_tank_008': {
    trigger: 'PASSIVE',
    execute: (ctx) => {
      const state = getEffectState(ctx.gameId);
      state.effectDamageReduction[ctx.playerIndex] = 100;
      return ctx;
    }
  },

  // Unending Despair - Opponent takes 50 when you're damaged
  'item_tank_009': {
    trigger: 'ON_TAKE_DAMAGE',
    execute: (ctx) => {
      ctx.effects.push({
        type: 'DEAL_EFFECT_DAMAGE',
        targetPlayerIndex: ctx.opponentIndex,
        amount: 50,
        message: 'Unending Despair: 50 reflected!'
      });
      return ctx;
    }
  },

  // Thornmail - 150 damage when attacked
  'item_tank_010': {
    trigger: 'ON_ATTACKED',
    execute: (ctx) => {
      ctx.effects.push({
        type: 'DEAL_EFFECT_DAMAGE',
        targetPlayerIndex: ctx.attackerPlayerIndex,
        amount: 150,
        message: 'Thornmail: 150 reflected!'
      });
      return ctx;
    }
  },

  // Iceborn Gauntlet - Battlers can't attack next turn
  'item_tank_011': {
    trigger: 'ON_CHAMPION_SURVIVES',
    execute: (ctx) => {
      if (ctx.attackerPlayerIndex !== ctx.playerIndex) {
        ctx.effects.push({
          type: 'PREVENT_ATTACK_NEXT_TURN',
          targetPlayerIndex: ctx.attackerPlayerIndex,
          targetIndex: ctx.attackerIndex,
          message: 'Iceborn Gauntlet: Attacker frozen!'
        });
      }
      return ctx;
    }
  },

  // Gargoyle Stoneplate - Can't be destroyed this turn
  'item_tank_012': {
    trigger: 'ACTIVATED',
    execute: (ctx) => {
      const key = `${ctx.cardInstanceId}_gargoyle`;
      if (!wasUsedThisTurn(ctx.gameId, key)) {
        markUsedThisTurn(ctx.gameId, key);
        ctx.effects.push({
          type: 'INVINCIBLE_THIS_TURN',
          championIndex: ctx.equippedChampionIndex,
          message: 'Gargoyle Stoneplate: Invincible!'
        });
      }
      return ctx;
    }
  },

  // Kaenic Rookern - Block 300 damage once
  'item_tank_013': {
    trigger: 'ON_TAKE_DAMAGE',
    execute: (ctx) => {
      const key = `${ctx.cardInstanceId}_kaenic`;
      if (!wasUsedThisDuel(ctx.gameId, key) && ctx.damageAmount <= 300) {
        markUsedThisDuel(ctx.gameId, key);
        ctx.effects.push({
          type: 'NEGATE_DAMAGE',
          amount: Math.min(ctx.damageAmount, 300),
          message: 'Kaenic Rookern: Damage blocked!'
        });
      }
      return ctx;
    }
  },

  // Jak'Sho - +50 ATK/DEF each end phase
  'item_tank_014': {
    trigger: 'ON_END_PHASE',
    execute: (ctx) => {
      ctx.effects.push({
        type: 'PERMANENT_STAT_BOOST',
        championIndex: ctx.equippedChampionIndex,
        atkAmount: 50,
        defAmount: 50,
        message: "Jak'Sho: +50 ATK/DEF!"
      });
      return ctx;
    }
  },

  // ============================================
  // SUPPORT ITEMS
  // ============================================

  // Redemption - +400 LP, Set from grave
  'item_sup_001': {
    trigger: 'ON_PLAY',
    execute: (ctx) => {
      ctx.effects.push({
        type: 'GAIN_LP',
        playerIndex: ctx.playerIndex,
        amount: 400,
        message: 'Redemption: +400 LP!'
      });
      ctx.effects.push({
        type: 'SET_FROM_GRAVEYARD',
        message: 'Redemption: Set a Spell/Trap from Graveyard!'
      });
      return ctx;
    }
  },

  // Staff of Flowing Water - Draw 1-2
  'item_sup_002': {
    trigger: 'ON_PLAY',
    execute: (ctx) => {
      const state = getEffectState(ctx.gameId);
      const drawAmount = state.lpGainedThisTurn[ctx.playerIndex] ? 2 : 1;
      ctx.effects.push({
        type: 'DRAW_CARDS',
        playerIndex: ctx.playerIndex,
        amount: drawAmount,
        message: `Staff of Flowing Water: Drew ${drawAmount} card(s)!`
      });
      return ctx;
    }
  },

  // Shurelya's Battlesong - All can attack
  'item_sup_003': {
    trigger: 'ON_PLAY',
    execute: (ctx) => {
      ctx.effects.push({
        type: 'ALL_CAN_ATTACK',
        playerIndex: ctx.playerIndex,
        message: "Shurelya's Battlesong: All champions ready!"
      });
      return ctx;
    }
  },

  // Moonstone Renewer - +100 LP at end
  'item_sup_004': {
    trigger: 'ON_END_PHASE',
    execute: (ctx) => {
      ctx.effects.push({
        type: 'GAIN_LP',
        playerIndex: ctx.playerIndex,
        amount: 100,
        message: 'Moonstone Renewer: +100 LP!'
      });
      return ctx;
    }
  },

  // Ardent Censer - +100 ATK on heal
  'item_sup_005': {
    trigger: 'ON_LP_GAIN',
    requiresTarget: 'OWN_MONSTER',
    execute: (ctx) => {
      ctx.effects.push({
        type: 'TEMP_ATK_BOOST',
        targetPlayerIndex: ctx.playerIndex,
        targetIndex: ctx.targetIndex,
        amount: 100,
        duration: 'END_OF_TURN',
        message: 'Ardent Censer: +100 ATK!'
      });
      return ctx;
    }
  },

  // Imperial Mandate - +100 first effect damage
  'item_sup_006': {
    trigger: 'ON_EFFECT_DAMAGE',
    execute: (ctx) => {
      const state = getEffectState(ctx.gameId);
      if (!state.effectDamageDealtThisTurn[ctx.playerIndex]) {
        ctx.effects.push({
          type: 'BONUS_EFFECT_DAMAGE',
          amount: 100,
          message: 'Imperial Mandate: +100 damage!'
        });
      }
      return ctx;
    }
  },

  // Dawncore - Negate targeting on heal
  'item_sup_007': {
    trigger: 'ON_LP_GAIN',
    execute: (ctx) => {
      const key = `${ctx.cardInstanceId}_dawncore`;
      if (!wasUsedThisTurn(ctx.gameId, key)) {
        markUsedThisTurn(ctx.gameId, key);
        // Grant protection
        ctx.effects.push({
          type: 'GRANT_TARGET_IMMUNITY',
          playerIndex: ctx.playerIndex,
          duration: 'NEXT_TARGETING',
          message: 'Dawncore: Target immunity ready!'
        });
      }
      return ctx;
    }
  },

  // Locket of the Iron Solari - All +100 DEF
  'item_sup_008': {
    trigger: 'ACTIVATED',
    execute: (ctx) => {
      const key = `${ctx.cardInstanceId}_locket`;
      if (!wasUsedThisTurn(ctx.gameId, key)) {
        markUsedThisTurn(ctx.gameId, key);
        ctx.effects.push({
          type: 'ALL_DEF_BOOST',
          playerIndex: ctx.playerIndex,
          amount: 100,
          duration: 'END_OF_TURN',
          message: 'Locket of the Iron Solari: All +100 DEF!'
        });
      }
      return ctx;
    }
  },

  // Zeke's Convergence - Ally gains 100 ATK on battle
  'item_sup_009': {
    trigger: 'ON_ATTACK',
    execute: (ctx) => {
      ctx.effects.push({
        type: 'ALLY_ATK_BOOST',
        playerIndex: ctx.playerIndex,
        excludeIndex: ctx.equippedChampionIndex,
        amount: 100,
        duration: 'END_OF_TURN',
        message: "Zeke's Convergence: Ally +100 ATK!"
      });
      return ctx;
    }
  },

  // Knight's Vow - Half damage, split
  'item_sup_010': {
    trigger: 'ON_TAKE_BATTLE_DAMAGE',
    execute: (ctx) => {
      ctx.effects.push({
        type: 'HALVE_DAMAGE',
        message: "Knight's Vow: Damage halved!"
      });
      return ctx;
    }
  },

  // Mikael's Blessing - Negate targeting +200 LP
  'item_sup_011': {
    trigger: 'ON_TARGETED',
    execute: (ctx) => {
      ctx.effects.push({
        type: 'NEGATE_TARGETING',
        message: "Mikael's Blessing: Targeting negated!"
      });
      ctx.effects.push({
        type: 'GAIN_LP',
        playerIndex: ctx.playerIndex,
        amount: 200,
        message: "Mikael's Blessing: +200 LP!"
      });
      return ctx;
    }
  },

  // Echoes of Helia - Revive in DEF once per turn
  'item_sup_012': {
    trigger: 'ON_CHAMPION_DESTROYED',
    execute: (ctx) => {
      const key = `${ctx.cardInstanceId}_echoes`;
      if (!wasUsedThisTurn(ctx.gameId, key)) {
        markUsedThisTurn(ctx.gameId, key);
        const state = getEffectState(ctx.gameId);
        state.reviveAtEndPhase.push({
          playerIndex: ctx.playerIndex,
          card: ctx.destroyedCard,
          position: 'DEFENSE'
        });
        ctx.effects.push({
          type: 'QUEUE_REVIVE',
          message: 'Echoes of Helia: Champion will revive at End Phase!'
        });
      }
      return ctx;
    }
  },

  // Dream Maker - Return to hand instead of destroy
  'item_sup_013': {
    trigger: 'ON_CHAMPION_DESTROYED',
    execute: (ctx) => {
      ctx.effects.push({
        type: 'RETURN_TO_HAND',
        card: ctx.destroyedCard,
        message: 'Dream Maker: Returned to hand!'
      });
      return ctx;
    }
  },

  // Celestial Opposition - Negate next spell
  'item_sup_014': {
    trigger: 'ON_SPELL_ACTIVATE',
    execute: (ctx) => {
      if (ctx.activatingPlayerIndex === ctx.opponentIndex) {
        ctx.effects.push({
          type: 'NEGATE_SPELL',
          message: 'Celestial Opposition: Spell negated!'
        });
      }
      return ctx;
    }
  },

  // ============================================
  // BOOTS
  // ============================================

  // Berserker's Greaves - Attack twice
  'boots_001': {
    trigger: 'ON_PLAY',
    requiresTarget: 'OWN_MONSTER',
    execute: (ctx) => {
      ctx.effects.push({
        type: 'ALLOW_DOUBLE_ATTACK',
        targetIndex: ctx.targetIndex,
        message: "Berserker's Greaves: Can attack twice!"
      });
      return ctx;
    }
  },

  // Sorcerer's Shoes - Next spell unnegatable
  'boots_002': {
    trigger: 'ON_PLAY',
    execute: (ctx) => {
      const state = getEffectState(ctx.gameId);
      state.spellsCannotBeNegated[ctx.playerIndex] = true;
      ctx.effects.push({
        type: 'UNNEGATABLE_SPELLS',
        duration: 'NEXT_SPELL',
        message: "Sorcerer's Shoes: Next Spell unnegatable!"
      });
      return ctx;
    }
  },

  // Plated Steelcaps - No battle damage
  'boots_003': {
    trigger: 'ON_PLAY',
    requiresTarget: 'OWN_MONSTER',
    execute: (ctx) => {
      ctx.effects.push({
        type: 'IMMUNE_TO_BATTLE_DAMAGE',
        targetIndex: ctx.targetIndex,
        duration: 'END_OF_TURN',
        message: 'Plated Steelcaps: No battle damage!'
      });
      return ctx;
    }
  },

  // Boots of Swiftness - Direct attack
  'boots_004': {
    trigger: 'ON_PLAY',
    requiresTarget: 'OWN_MONSTER',
    execute: (ctx) => {
      ctx.effects.push({
        type: 'ALLOW_DIRECT_ATTACK',
        targetIndex: ctx.targetIndex,
        message: 'Boots of Swiftness: Can attack directly!'
      });
      return ctx;
    }
  },

  // Ionian Boots - Extra spell
  'boots_005': {
    trigger: 'ACTIVATED',
    execute: (ctx) => {
      const key = `${ctx.cardInstanceId}_ionian`;
      if (!wasUsedThisTurn(ctx.gameId, key)) {
        markUsedThisTurn(ctx.gameId, key);
        ctx.effects.push({
          type: 'ALLOW_EXTRA_SPELL',
          message: 'Ionian Boots: Extra Spell activation!'
        });
      }
      return ctx;
    }
  },

  // Symbiotic Soles - Copy highest ATK
  'boots_006': {
    trigger: 'ACTIVATED',
    execute: (ctx) => {
      const key = `${ctx.cardInstanceId}_symbiotic`;
      if (!wasUsedThisTurn(ctx.gameId, key)) {
        markUsedThisTurn(ctx.gameId, key);
        const player = ctx.gameState.players[ctx.playerIndex];
        let maxATK = 0;
        player.field.champions.forEach(fc => {
          if (fc) {
            const atk = fc.currentAttack || fc.card.attack || 0;
            if (atk > maxATK) maxATK = atk;
          }
        });
        ctx.effects.push({
          type: 'TEMP_ATK_BOOST',
          championIndex: ctx.equippedChampionIndex,
          amount: maxATK,
          duration: 'ONE_BATTLE',
          message: `Symbiotic Soles: +${maxATK} ATK for one battle!`
        });
      }
      return ctx;
    }
  },

  // ============================================
  // CONSUMABLES
  // ============================================

  // Health Potion - +300 LP
  'potion_001': {
    trigger: 'ON_PLAY',
    execute: (ctx) => {
      ctx.effects.push({
        type: 'GAIN_LP',
        playerIndex: ctx.playerIndex,
        amount: 300,
        message: 'Health Potion: +300 LP!'
      });
      return ctx;
    }
  },

  // Mana Potion - Draw 2 discard 1
  'potion_002': {
    trigger: 'ON_PLAY',
    execute: (ctx) => {
      ctx.effects.push({
        type: 'DRAW_CARDS',
        playerIndex: ctx.playerIndex,
        amount: 2,
        message: 'Mana Potion: Drew 2 cards!'
      });
      ctx.effects.push({
        type: 'FORCE_DISCARD',
        playerIndex: ctx.playerIndex,
        amount: 1,
        message: 'Mana Potion: Discard 1'
      });
      return ctx;
    }
  },

  // Corrupting Potion - +200 LP, 100 damage
  'potion_003': {
    trigger: 'ON_PLAY',
    execute: (ctx) => {
      ctx.effects.push({
        type: 'GAIN_LP',
        playerIndex: ctx.playerIndex,
        amount: 200,
        message: 'Corrupting Potion: +200 LP!'
      });
      ctx.effects.push({
        type: 'DEAL_EFFECT_DAMAGE',
        targetPlayerIndex: ctx.opponentIndex,
        amount: 100,
        message: 'Corrupting Potion: 100 damage!'
      });
      return ctx;
    }
  },

  // Elixir of Wrath - All +200 ATK
  'potion_004': {
    trigger: 'ON_PLAY',
    execute: (ctx) => {
      ctx.effects.push({
        type: 'ALL_ATK_BOOST',
        playerIndex: ctx.playerIndex,
        amount: 200,
        duration: 'END_OF_TURN',
        message: 'Elixir of Wrath: All +200 ATK!'
      });
      return ctx;
    }
  },

  // Elixir of Sorcery - Spells unnegatable
  'potion_005': {
    trigger: 'ON_PLAY',
    execute: (ctx) => {
      const state = getEffectState(ctx.gameId);
      state.spellsCannotBeNegated[ctx.playerIndex] = true;
      ctx.effects.push({
        type: 'UNNEGATABLE_SPELLS',
        duration: 'END_OF_TURN',
        message: 'Elixir of Sorcery: Spells unnegatable!'
      });
      return ctx;
    }
  },

  // Refillable Potion - +100 LP per turn
  'potion_006': {
    trigger: 'ACTIVATED',
    execute: (ctx) => {
      const key = `${ctx.cardInstanceId}_refillable`;
      if (!wasUsedThisTurn(ctx.gameId, key)) {
        markUsedThisTurn(ctx.gameId, key);
        ctx.effects.push({
          type: 'GAIN_LP',
          playerIndex: ctx.playerIndex,
          amount: 100,
          message: 'Refillable Potion: +100 LP!'
        });
      }
      return ctx;
    }
  },

  // Guardian Angel - Revive first destroyed
  'potion_007': {
    trigger: 'ON_CHAMPION_DESTROYED',
    execute: (ctx) => {
      const key = `${ctx.cardInstanceId}_ga`;
      if (!wasUsedThisDuel(ctx.gameId, key)) {
        markUsedThisDuel(ctx.gameId, key);
        const state = getEffectState(ctx.gameId);
        state.reviveAtEndPhase.push({
          playerIndex: ctx.playerIndex,
          card: ctx.destroyedCard,
          position: 'ATTACK'
        });
        ctx.effects.push({
          type: 'QUEUE_REVIVE',
          message: 'Guardian Angel: Champion will revive!'
        });
      }
      return ctx;
    }
  },

  // ============================================
  // REMOVAL
  // ============================================

  // Item Breaker
  'removal_001': {
    trigger: 'ON_PLAY',
    requiresTarget: 'EQUIP_CARD',
    execute: (ctx) => {
      ctx.effects.push({
        type: 'DESTROY_EQUIP',
        targetPlayerIndex: ctx.targetPlayerIndex,
        targetIndex: ctx.targetIndex,
        message: 'Item Breaker: Equip destroyed!'
      });
      return ctx;
    }
  },

  // Arcane Dispel
  'removal_002': {
    trigger: 'ON_PLAY',
    requiresTarget: 'CONTINUOUS_CARD',
    execute: (ctx) => {
      ctx.effects.push({
        type: 'DESTROY_CONTINUOUS',
        targetPlayerIndex: ctx.targetPlayerIndex,
        targetIndex: ctx.targetIndex,
        message: 'Arcane Dispel: Continuous card destroyed!'
      });
      return ctx;
    }
  },

  // Sweeping Cleanse
  'removal_003': {
    trigger: 'ON_PLAY',
    execute: (ctx) => {
      ctx.effects.push({
        type: 'DESTROY_ALL_EQUIPS',
        message: 'Sweeping Cleanse: All Equips destroyed!'
      });
      return ctx;
    }
  },

  // Null Zone
  'removal_004': {
    trigger: 'ON_CONTINUOUS_ACTIVATE',
    execute: (ctx) => {
      ctx.effects.push({
        type: 'NEGATE_AND_DESTROY',
        message: 'Null Zone: Negated and destroyed!'
      });
      return ctx;
    }
  },

  // Shatter Rune
  'removal_005': {
    trigger: 'ON_EQUIP_ACTIVATE',
    execute: (ctx) => {
      ctx.effects.push({
        type: 'NEGATE_AND_DESTROY',
        message: 'Shatter Rune: Negated and destroyed!'
      });
      return ctx;
    }
  },
};

// ============================================
// RUNE EFFECT HANDLERS
// ============================================

const RUNE_HANDLERS = {
  // Press the Attack - 3 attacks = destroy
  'rune_prec_001': {
    trigger: 'ON_ATTACK',
    execute: (ctx) => {
      const count = addCounter(ctx.gameId, ctx.cardInstanceId, 'attack', 1);
      if (count >= 3) {
        ctx.effects.push({
          type: 'DESTROY_ANY_CARD',
          message: 'Press the Attack: 3 attacks - Destroy a card!'
        });
        const state = getEffectState(ctx.gameId);
        state.counters[`${ctx.cardInstanceId}_attack`] = 0;
      }
      return ctx;
    }
  },

  // Lethal Tempo - Attack twice
  'rune_prec_002': {
    trigger: 'ACTIVATED',
    execute: (ctx) => {
      const key = `${ctx.cardInstanceId}_lethal`;
      if (!wasUsedThisTurn(ctx.gameId, key)) {
        markUsedThisTurn(ctx.gameId, key);
        ctx.effects.push({
          type: 'ALLOW_DOUBLE_ATTACK',
          message: 'Lethal Tempo: One Champion attacks twice!'
        });
      }
      return ctx;
    }
  },

  // Conqueror - +50 LP and draw after battle
  'rune_prec_003': {
    trigger: 'ON_BATTLE_END',
    execute: (ctx) => {
      const key = `${ctx.cardInstanceId}_conqueror`;
      if (!wasUsedThisTurn(ctx.gameId, key)) {
        markUsedThisTurn(ctx.gameId, key);
        ctx.effects.push({
          type: 'GAIN_LP',
          playerIndex: ctx.playerIndex,
          amount: 50,
          message: 'Conqueror: +50 LP!'
        });
        ctx.effects.push({
          type: 'DRAW_CARDS',
          playerIndex: ctx.playerIndex,
          amount: 1,
          message: 'Conqueror: Drew 1 card!'
        });
      }
      return ctx;
    }
  },

  // Fleet Footwork - +100 LP on battle damage
  'rune_prec_004': {
    trigger: 'ON_BATTLE_DAMAGE',
    execute: (ctx) => {
      ctx.effects.push({
        type: 'GAIN_LP',
        playerIndex: ctx.attackerPlayerIndex,
        amount: 100,
        message: 'Fleet Footwork: +100 LP!'
      });
      return ctx;
    }
  },

  // Triumph - Draw on kill
  'rune_prec_005': {
    trigger: 'ON_DESTROY_MONSTER',
    execute: (ctx) => {
      ctx.effects.push({
        type: 'DRAW_CARDS',
        playerIndex: ctx.attackerPlayerIndex,
        amount: 1,
        message: 'Triumph: Drew 1 card!'
      });
      return ctx;
    }
  },

  // Presence of Mind - Quick-play on kill
  'rune_prec_006': {
    trigger: 'ON_DESTROY_MONSTER',
    execute: (ctx) => {
      const key = `${ctx.cardInstanceId}_presence`;
      if (!wasUsedThisTurn(ctx.gameId, key)) {
        markUsedThisTurn(ctx.gameId, key);
        ctx.effects.push({
          type: 'ALLOW_QUICK_SPELL',
          message: 'Presence of Mind: Quick-Play a Spell!'
        });
      }
      return ctx;
    }
  },

  // Coup de Grace - Silence weak monsters
  'rune_prec_007': {
    trigger: 'PASSIVE',
    execute: (ctx) => {
      ctx.effects.push({
        type: 'SILENCE_WEAK_IN_BATTLE',
        atkThreshold: 1000,
        message: 'Coup de Grace: Weak monster silenced!'
      });
      return ctx;
    }
  },

  // Cut Down - Piercing damage
  'rune_prec_008': {
    trigger: 'PASSIVE',
    execute: (ctx) => {
      ctx.effects.push({
        type: 'GRANT_ALL_PIERCE',
        message: 'Cut Down: Piercing damage!'
      });
      return ctx;
    }
  },

  // Last Stand - Battle immunity at low LP
  'rune_prec_009': {
    trigger: 'ON_CHAMPION_DESTROYED',
    execute: (ctx) => {
      const player = ctx.gameState.players[ctx.playerIndex];
      if (player.lifePoints <= 2000) {
        const key = `${ctx.cardInstanceId}_last`;
        if (!wasUsedThisTurn(ctx.gameId, key)) {
          markUsedThisTurn(ctx.gameId, key);
          ctx.effects.push({
            type: 'NEGATE_DESTRUCTION',
            message: 'Last Stand: Champion survives!'
          });
        }
      }
      return ctx;
    }
  },

  // Electrocute - 3 effects = destroy
  'rune_dom_001': {
    trigger: 'ON_EFFECT_ACTIVATE',
    execute: (ctx) => {
      const count = addCounter(ctx.gameId, ctx.cardInstanceId, 'effect', 1);
      if (count >= 3) {
        ctx.effects.push({
          type: 'DESTROY_ANY_CARD',
          message: 'Electrocute: 3 effects - Destroy a card!'
        });
        const state = getEffectState(ctx.gameId);
        state.counters[`${ctx.cardInstanceId}_effect`] = 0;
      }
      return ctx;
    }
  },

  // Dark Harvest - 100 damage on kill
  'rune_dom_002': {
    trigger: 'ON_DESTROY_MONSTER',
    execute: (ctx) => {
      ctx.effects.push({
        type: 'DEAL_EFFECT_DAMAGE',
        targetPlayerIndex: ctx.opponentIndex,
        amount: 100,
        message: 'Dark Harvest: 100 damage!'
      });
      return ctx;
    }
  },

  // Cheap Shot - Silence ATK-debuffed
  'rune_dom_003': {
    trigger: 'PASSIVE',
    execute: (ctx) => {
      ctx.effects.push({
        type: 'SILENCE_DEBUFFED',
        message: 'Cheap Shot: Debuffed monster silenced!'
      });
      return ctx;
    }
  },

  // Taste of Blood - +100 LP on damage
  'rune_dom_004': {
    trigger: 'ON_DEAL_DAMAGE',
    execute: (ctx) => {
      const key = `${ctx.cardInstanceId}_taste`;
      if (!wasUsedThisTurn(ctx.gameId, key)) {
        markUsedThisTurn(ctx.gameId, key);
        ctx.effects.push({
          type: 'GAIN_LP',
          playerIndex: ctx.playerIndex,
          amount: 100,
          message: 'Taste of Blood: +100 LP!'
        });
      }
      return ctx;
    }
  },

  // Sudden Impact - Destroy set on special summon
  'rune_dom_005': {
    trigger: 'ON_SPECIAL_SUMMON',
    execute: (ctx) => {
      ctx.effects.push({
        type: 'DESTROY_SET_CARD',
        message: 'Sudden Impact: Set card destroyed!'
      });
      return ctx;
    }
  },

  // Treasure Hunter - Draw on kill
  'rune_dom_006': {
    trigger: 'ON_DESTROY_MONSTER',
    execute: (ctx) => {
      const key = `${ctx.cardInstanceId}_treasure`;
      if (!wasUsedThisTurn(ctx.gameId, key)) {
        markUsedThisTurn(ctx.gameId, key);
        ctx.effects.push({
          type: 'DRAW_CARDS',
          playerIndex: ctx.attackerPlayerIndex,
          amount: 1,
          message: 'Treasure Hunter: Drew 1 card!'
        });
      }
      return ctx;
    }
  },

  // Ultimate Hunter - Free tribute
  'rune_dom_007': {
    trigger: 'ON_TRIBUTE_SUMMON',
    execute: (ctx) => {
      const key = `${ctx.cardInstanceId}_ultimate`;
      if (!wasUsedThisDuel(ctx.gameId, key)) {
        markUsedThisDuel(ctx.gameId, key);
        ctx.effects.push({
          type: 'IGNORE_TRIBUTE',
          message: 'Ultimate Hunter: Tribute ignored!'
        });
      }
      return ctx;
    }
  },

  // Summon Aery - Cycle on spell
  'rune_sorc_001': {
    trigger: 'ON_SPELL_ACTIVATE',
    execute: (ctx) => {
      const key = `${ctx.cardInstanceId}_aery`;
      if (!wasUsedThisTurn(ctx.gameId, key)) {
        markUsedThisTurn(ctx.gameId, key);
        ctx.effects.push({
          type: 'DRAW_CARDS',
          playerIndex: ctx.playerIndex,
          amount: 1,
          message: 'Summon Aery: Draw 1'
        });
        ctx.effects.push({
          type: 'FORCE_DISCARD',
          playerIndex: ctx.playerIndex,
          amount: 1,
          message: 'Summon Aery: Discard 1'
        });
      }
      return ctx;
    }
  },

  // Arcane Comet - +100 first spell damage
  'rune_sorc_002': {
    trigger: 'ON_SPELL_DAMAGE',
    execute: (ctx) => {
      const state = getEffectState(ctx.gameId);
      if (state.spellsActivatedThisTurn[ctx.playerIndex] === 1) {
        ctx.effects.push({
          type: 'BONUS_EFFECT_DAMAGE',
          amount: 100,
          message: 'Arcane Comet: +100 damage!'
        });
      }
      return ctx;
    }
  },

  // Phase Rush - 3 attacks = untargetable
  'rune_sorc_003': {
    trigger: 'ON_ATTACK',
    execute: (ctx) => {
      const state = getEffectState(ctx.gameId);
      if (state.attacksThisTurn[ctx.playerIndex] >= 3) {
        ctx.effects.push({
          type: 'GRANT_UNTARGETABLE',
          duration: 'NEXT_TURN',
          message: 'Phase Rush: Monsters untargetable!'
        });
      }
      return ctx;
    }
  },

  // Nullifying Orb - Block effect damage
  'rune_sorc_004': {
    trigger: 'ON_EFFECT_DAMAGE_TAKEN',
    execute: (ctx) => {
      const key = `${ctx.cardInstanceId}_nullorb`;
      if (!wasUsedThisTurn(ctx.gameId, key)) {
        markUsedThisTurn(ctx.gameId, key);
        ctx.effects.push({
          type: 'NEGATE_EFFECT_DAMAGE',
          message: 'Nullifying Orb: Damage negated!'
        });
      }
      return ctx;
    }
  },

  // Transcendence - Extra spell
  'rune_sorc_005': {
    trigger: 'ACTIVATED',
    execute: (ctx) => {
      const key = `${ctx.cardInstanceId}_transcend`;
      if (!wasUsedThisTurn(ctx.gameId, key)) {
        markUsedThisTurn(ctx.gameId, key);
        ctx.effects.push({
          type: 'ALLOW_EXTRA_SPELL',
          message: 'Transcendence: Extra Spell!'
        });
      }
      return ctx;
    }
  },

  // Scorch - Discard on effect damage
  'rune_sorc_006': {
    trigger: 'ON_EFFECT_DAMAGE',
    execute: (ctx) => {
      ctx.effects.push({
        type: 'FORCE_DISCARD',
        playerIndex: ctx.opponentIndex,
        amount: 1,
        message: 'Scorch: Opponent discards 1!'
      });
      return ctx;
    }
  },

  // Absolute Focus - Spells unnegatable if more LP
  'rune_sorc_007': {
    trigger: 'PASSIVE',
    execute: (ctx) => {
      const player = ctx.gameState.players[ctx.playerIndex];
      const opponent = ctx.gameState.players[ctx.opponentIndex];
      if (player.lifePoints > opponent.lifePoints) {
        const state = getEffectState(ctx.gameId);
        state.spellsCannotBeNegated[ctx.playerIndex] = true;
      }
      return ctx;
    }
  },

  // Gathering Storm - Draw 2 every 3 turns
  'rune_sorc_008': {
    trigger: 'ON_STANDBY_PHASE',
    execute: (ctx) => {
      const state = getEffectState(ctx.gameId);
      if (state.turnCount % 3 === 0 && state.turnCount > 0) {
        ctx.effects.push({
          type: 'DRAW_CARDS',
          playerIndex: ctx.playerIndex,
          amount: 2,
          message: 'Gathering Storm: Drew 2 cards!'
        });
      }
      return ctx;
    }
  },

  // Grasp of the Undying - +100 LP on survive
  'rune_res_001': {
    trigger: 'ON_CHAMPION_SURVIVES',
    execute: (ctx) => {
      ctx.effects.push({
        type: 'GAIN_LP',
        playerIndex: ctx.playerIndex,
        amount: 100,
        message: 'Grasp of the Undying: +100 LP!'
      });
      return ctx;
    }
  },

  // Aftershock - Destroy set on survive
  'rune_res_002': {
    trigger: 'ON_CHAMPION_SURVIVES',
    execute: (ctx) => {
      ctx.effects.push({
        type: 'DESTROY_FACE_DOWN',
        message: 'Aftershock: Destroy a face-down card!'
      });
      return ctx;
    }
  },

  // Demolish - Destroy spell/trap on direct
  'rune_res_003': {
    trigger: 'ON_DIRECT_ATTACK',
    execute: (ctx) => {
      ctx.effects.push({
        type: 'DESTROY_SPELL_TRAP',
        message: 'Demolish: Destroy a Spell/Trap!'
      });
      return ctx;
    }
  },

  // Second Wind - +100 LP standby
  'rune_res_004': {
    trigger: 'ON_STANDBY_PHASE',
    execute: (ctx) => {
      ctx.effects.push({
        type: 'GAIN_LP',
        playerIndex: ctx.playerIndex,
        amount: 100,
        message: 'Second Wind: +100 LP!'
      });
      return ctx;
    }
  },

  // Bone Plating - Negate first damage
  'rune_res_005': {
    trigger: 'ON_TAKE_DAMAGE',
    execute: (ctx) => {
      const key = `${ctx.cardInstanceId}_bone`;
      if (!wasUsedThisTurn(ctx.gameId, key)) {
        markUsedThisTurn(ctx.gameId, key);
        ctx.effects.push({
          type: 'NEGATE_DAMAGE',
          message: 'Bone Plating: Damage negated!'
        });
      }
      return ctx;
    }
  },

  // Overgrowth - Draw on heal
  'rune_res_006': {
    trigger: 'ON_LP_GAIN',
    execute: (ctx) => {
      const key = `${ctx.cardInstanceId}_overgrowth`;
      if (!wasUsedThisTurn(ctx.gameId, key)) {
        markUsedThisTurn(ctx.gameId, key);
        ctx.effects.push({
          type: 'DRAW_CARDS',
          playerIndex: ctx.playerIndex,
          amount: 1,
          message: 'Overgrowth: Drew 1 card!'
        });
      }
      return ctx;
    }
  },

  // Revitalize - +50 all heals
  'rune_res_007': {
    trigger: 'ON_LP_GAIN',
    execute: (ctx) => {
      ctx.effects.push({
        type: 'BONUS_HEAL',
        amount: 50,
        message: 'Revitalize: +50 LP!'
      });
      return ctx;
    }
  },

  // Unflinching - Effects work in battle
  'rune_res_008': {
    trigger: 'PASSIVE',
    execute: (ctx) => {
      ctx.effects.push({
        type: 'EFFECTS_IN_BATTLE',
        message: 'Unflinching: Effects cannot be negated in battle!'
      });
      return ctx;
    }
  },

  // Glacial Augment - Battled monsters can't attack
  'rune_insp_001': {
    trigger: 'ON_BATTLE_END',
    execute: (ctx) => {
      if (ctx.defenderPlayerIndex === ctx.opponentIndex && ctx.defenderIndex >= 0) {
        ctx.effects.push({
          type: 'PREVENT_ATTACK_NEXT_TURN',
          targetPlayerIndex: ctx.defenderPlayerIndex,
          targetIndex: ctx.defenderIndex,
          message: 'Glacial Augment: Monster frozen!'
        });
      }
      return ctx;
    }
  },

  // First Strike - First attack no response
  'rune_insp_002': {
    trigger: 'PASSIVE',
    execute: (ctx) => {
      const state = getEffectState(ctx.gameId);
      if (state.attacksThisTurn[ctx.playerIndex] === 0) {
        ctx.effects.push({
          type: 'NO_RESPONSE_ATTACK',
          message: 'First Strike: Cannot be responded to!'
        });
      }
      return ctx;
    }
  },

  // Hextech Flashtraption - Free summon
  'rune_insp_003': {
    trigger: 'ACTIVATED',
    execute: (ctx) => {
      const key = `${ctx.cardInstanceId}_hexflash`;
      if (!wasUsedThisDuel(ctx.gameId, key)) {
        markUsedThisDuel(ctx.gameId, key);
        ctx.effects.push({
          type: 'FREE_SPECIAL_SUMMON',
          message: 'Hextech Flashtraption: Free Summon!'
        });
      }
      return ctx;
    }
  },

  // Magical Footwear - Extra draw after turn 5
  'rune_insp_004': {
    trigger: 'ON_DRAW_PHASE',
    execute: (ctx) => {
      const state = getEffectState(ctx.gameId);
      if (state.turnCount >= 5) {
        ctx.effects.push({
          type: 'DRAW_CARDS',
          playerIndex: ctx.playerIndex,
          amount: 1,
          message: 'Magical Footwear: +1 draw!'
        });
      }
      return ctx;
    }
  },

  // Biscuit Delivery - Draw + heal on turns 3/6/9
  'rune_insp_005': {
    trigger: 'ON_STANDBY_PHASE',
    execute: (ctx) => {
      const state = getEffectState(ctx.gameId);
      if ([3, 6, 9].includes(state.turnCount)) {
        ctx.effects.push({
          type: 'DRAW_CARDS',
          playerIndex: ctx.playerIndex,
          amount: 1,
          message: 'Biscuit Delivery: Drew 1!'
        });
        ctx.effects.push({
          type: 'GAIN_LP',
          playerIndex: ctx.playerIndex,
          amount: 100,
          message: 'Biscuit Delivery: +100 LP!'
        });
      }
      return ctx;
    }
  },

  // Cosmic Insight - Immediate continuous
  'rune_insp_006': {
    trigger: 'PASSIVE',
    execute: (ctx) => {
      ctx.effects.push({
        type: 'INSTANT_CONTINUOUS',
        message: 'Cosmic Insight: No wait for Continuous!'
      });
      return ctx;
    }
  },

  // Approach Velocity - Direct attack debuffed
  'rune_insp_007': {
    trigger: 'PASSIVE',
    execute: (ctx) => {
      ctx.effects.push({
        type: 'DIRECT_ATTACK_DEBUFFED',
        message: 'Approach Velocity: Direct attack debuffed monsters!'
      });
      return ctx;
    }
  },

  // Time Warp Tonic - Draw on heal
  'rune_insp_008': {
    trigger: 'ON_LP_GAIN',
    execute: (ctx) => {
      const key = `${ctx.cardInstanceId}_timewarp`;
      if (!wasUsedThisTurn(ctx.gameId, key)) {
        markUsedThisTurn(ctx.gameId, key);
        ctx.effects.push({
          type: 'DRAW_CARDS',
          playerIndex: ctx.playerIndex,
          amount: 1,
          message: 'Time Warp Tonic: Drew 1!'
        });
      }
      return ctx;
    }
  },
};

// Merge all handlers
const ALL_HANDLERS = { ...EFFECT_HANDLERS, ...RUNE_HANDLERS };

/**
 * Trigger effects for a specific event
 * @param {string} gameId - Game identifier
 * @param {string} trigger - Trigger type
 * @param {Object} context - Context for the trigger
 * @returns {Object} - Effects to apply
 */
export function triggerEffects(gameId, trigger, context) {
  const effects = [];
  context.effects = effects;
  context.gameId = gameId;

  // Check equipped items on champions
  const gameState = context.gameState;

  for (let playerIndex = 0; playerIndex < 2; playerIndex++) {
    const player = gameState.players[playerIndex];

    // Check field champions for equipped items
    player.field.champions.forEach((fc, champIndex) => {
      if (fc && fc.equippedItems) {
        fc.equippedItems.forEach((item, itemIndex) => {
          const handler = ALL_HANDLERS[item.id];
          if (handler && handler.trigger === trigger) {
            const ctx = {
              ...context,
              playerIndex,
              opponentIndex: playerIndex === 0 ? 1 : 0,
              equippedChampionIndex: champIndex,
              cardInstanceId: `${item.id}_${playerIndex}_${champIndex}_${itemIndex}`,
              card: item,
            };
            handler.execute(ctx);
          }
          // Check secondary trigger
          if (handler && handler.secondaryTrigger === trigger && handler.secondaryExecute) {
            const ctx = {
              ...context,
              playerIndex,
              opponentIndex: playerIndex === 0 ? 1 : 0,
              equippedChampionIndex: champIndex,
              cardInstanceId: `${item.id}_${playerIndex}_${champIndex}_${itemIndex}`,
              card: item,
            };
            handler.secondaryExecute(ctx);
          }
        });
      }
    });

    // Check spell zone for continuous spells/traps and runes
    if (player.field.spellZone) {
      player.field.spellZone.forEach((card, zoneIndex) => {
        if (card && (card.type === 'ITEM' || card.type === 'RUNE')) {
          const handler = ALL_HANDLERS[card.id];
          if (handler && handler.trigger === trigger) {
            const ctx = {
              ...context,
              playerIndex,
              opponentIndex: playerIndex === 0 ? 1 : 0,
              cardInstanceId: `${card.id}_${playerIndex}_zone_${zoneIndex}`,
              card,
            };
            handler.execute(ctx);
          }
        }
      });
    }
  }

  return effects;
}

/**
 * Apply a list of effects to game state
 * @param {Object} gameState - Current game state
 * @param {Array} effects - Effects to apply
 * @returns {Object} - Updated game state and messages
 */
export function applyEffects(gameState, effects) {
  const messages = [];

  for (const effect of effects) {
    switch (effect.type) {
      case 'GAIN_LP': {
        const state = getEffectState(gameState.gameId);
        if (!state.healingBlocked[effect.playerIndex]) {
          gameState.players[effect.playerIndex].lifePoints += effect.amount;
          state.lpGainedThisTurn[effect.playerIndex] = true;
          messages.push(effect.message);
        }
        break;
      }

      case 'DEAL_EFFECT_DAMAGE': {
        const state = getEffectState(gameState.gameId);
        let damage = effect.amount;
        damage = Math.max(0, damage - (state.effectDamageReduction[effect.targetPlayerIndex] || 0));
        gameState.players[effect.targetPlayerIndex].lifePoints =
          Math.max(0, gameState.players[effect.targetPlayerIndex].lifePoints - damage);
        state.effectDamageDealtThisTurn[effect.targetPlayerIndex === 0 ? 1 : 0] = true;
        messages.push(effect.message);

        // Check win condition
        if (gameState.players[effect.targetPlayerIndex].lifePoints <= 0) {
          gameState.winner = gameState.players[effect.targetPlayerIndex === 0 ? 1 : 0].id;
        }
        break;
      }

      case 'DRAW_CARDS': {
        const player = gameState.players[effect.playerIndex];
        for (let i = 0; i < effect.amount; i++) {
          if (player.deck.length > 0) {
            player.hand.push(player.deck.shift());
          }
        }
        messages.push(effect.message);
        break;
      }

      case 'PERMANENT_ATK_BOOST':
      case 'TEMP_ATK_BOOST': {
        const playerIdx = effect.targetPlayerIndex ?? effect.playerIndex;
        const champIdx = effect.championIndex ?? effect.targetIndex;
        const champion = gameState.players[playerIdx].field.champions[champIdx];
        if (champion) {
          champion.currentAttack = (champion.currentAttack || champion.card.attack || 0) + effect.amount;
        }
        if (effect.message) messages.push(effect.message);
        break;
      }

      case 'PERMANENT_STAT_BOOST': {
        const champion = gameState.players[effect.playerIndex].field.champions[effect.championIndex];
        if (champion) {
          champion.currentAttack = (champion.currentAttack || champion.card.attack || 0) + (effect.atkAmount || 0);
          champion.currentDefense = (champion.currentDefense || champion.card.defense || 0) + (effect.defAmount || 0);
        }
        messages.push(effect.message);
        break;
      }

      case 'ALLOW_ATTACK_AGAIN': {
        const champion = gameState.players[effect.playerIndex || 0].field.champions[effect.championIndex];
        if (champion) {
          champion.hasAttacked = false;
          champion.cannotDirectAttack = !effect.canDirectAttack;
        }
        messages.push(effect.message);
        break;
      }

      case 'NEGATE_DESTRUCTION': {
        // This is handled during combat resolution
        messages.push(effect.message);
        break;
      }

      case 'ALL_ATK_BOOST': {
        const player = gameState.players[effect.playerIndex];
        player.field.champions.forEach(fc => {
          if (fc) {
            fc.currentAttack = (fc.currentAttack || fc.card.attack || 0) + effect.amount;
          }
        });
        messages.push(effect.message);
        break;
      }

      case 'ALL_DEF_BOOST': {
        const player = gameState.players[effect.playerIndex];
        player.field.champions.forEach(fc => {
          if (fc) {
            fc.currentDefense = (fc.currentDefense || fc.card.defense || 0) + effect.amount;
          }
        });
        messages.push(effect.message);
        break;
      }

      default:
        // Log unhandled effect types for debugging
        console.log(`Unhandled effect type: ${effect.type}`);
        if (effect.message) messages.push(effect.message);
    }
  }

  return { gameState, messages };
}

/**
 * Get handler for a specific card
 */
export function getCardHandler(cardId) {
  return ALL_HANDLERS[cardId];
}

/**
 * Check if a card has an effect handler
 */
export function hasEffect(cardId) {
  return !!ALL_HANDLERS[cardId];
}

export default {
  initializeEffectState,
  getEffectState,
  resetTurnEffects,
  triggerEffects,
  applyEffects,
  getCardHandler,
  hasEffect,
};
