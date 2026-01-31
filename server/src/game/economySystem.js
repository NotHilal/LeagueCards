/**
 * Economy System - Gold Management
 *
 * Constants:
 * - Starting Gold: 500
 * - Per Turn Income: 100 gold (STANDBY phase)
 * - Kill Reward: 150 gold
 *
 * Usage:
 * - Champions summon FREE (no gold cost)
 * - Items require gold to equip
 */

import { triggerEffects, applyEffects, getEffectState } from './effectSystem.js';

// Economy constants
export const STARTING_GOLD = 500;
export const TURN_INCOME = 100;
export const KILL_REWARD = 150;
export const NOXUS_FIRST_KILL_BONUS = 200;

/**
 * Initialize gold for a player
 * @returns {number} - Starting gold amount
 */
export function initializeGold() {
  return STARTING_GOLD;
}

/**
 * Apply turn income to a player
 * @param {Object} playerState - Player state to update
 * @returns {number} - New gold amount
 */
export function applyTurnIncome(playerState) {
  playerState.gold = (playerState.gold || 0) + TURN_INCOME;
  return playerState.gold;
}

/**
 * Apply kill reward to a player
 * @param {Object} playerState - Player state to update
 * @param {boolean} hasNoxusBonus - Whether Noxus 4+ bonus applies
 * @returns {number} - Gold gained
 */
export function applyKillReward(playerState, hasNoxusBonus = false) {
  let reward = KILL_REWARD;

  // Noxus 4+ bonus: First kill gives +200 gold (once per game)
  if (hasNoxusBonus && !playerState.hasGottenNoxusKillGold) {
    reward += NOXUS_FIRST_KILL_BONUS;
    playerState.hasGottenNoxusKillGold = true;
  }

  playerState.gold = (playerState.gold || 0) + reward;
  return reward;
}

/**
 * Check if player can afford an item
 * @param {Object} playerState - Player state
 * @param {Object} item - Item card to check
 * @returns {boolean} - Whether player can afford
 */
export function canAffordItem(playerState, item) {
  const cost = item.goldCost || 0;
  return (playerState.gold || 0) >= cost;
}

/**
 * Deduct gold for item purchase
 * @param {Object} playerState - Player state to update
 * @param {Object} item - Item being purchased
 * @returns {Object} - { success: boolean, newGold: number, error?: string }
 */
export function deductGoldForItem(playerState, item) {
  const cost = item.goldCost || 0;

  if (!canAffordItem(playerState, item)) {
    return {
      success: false,
      newGold: playerState.gold,
      error: `Not enough gold. Need ${cost}, have ${playerState.gold}`,
    };
  }

  playerState.gold -= cost;
  return {
    success: true,
    newGold: playerState.gold,
  };
}

/**
 * Equip an item to a champion
 * @param {Object} gameState - Current game state
 * @param {number} playerIndex - Player index
 * @param {number} itemHandIndex - Index of item in hand
 * @param {number} championFieldIndex - Index of champion on field
 * @returns {Object} - { success: boolean, gameState: Object, error?: string, effectMessages?: Array }
 */
export function equipItem(gameState, playerIndex, itemHandIndex, championFieldIndex) {
  const player = gameState.players[playerIndex];
  const effectMessages = [];

  // Validate item
  const item = player.hand[itemHandIndex];
  if (!item) {
    return { success: false, gameState, error: 'Invalid item index' };
  }
  if (item.type !== 'ITEM') {
    return { success: false, gameState, error: 'Selected card is not an item' };
  }

  // Validate champion
  const champion = player.field.champions[championFieldIndex];
  if (!champion) {
    return { success: false, gameState, error: 'No champion at specified field position' };
  }
  if (champion.card.type !== 'MONSTER') {
    return { success: false, gameState, error: 'Cannot equip items to non-champion cards' };
  }

  // Check gold
  const goldResult = deductGoldForItem(player, item);
  if (!goldResult.success) {
    return { success: false, gameState, error: goldResult.error };
  }

  // Remove item from hand
  player.hand.splice(itemHandIndex, 1);

  // Initialize equippedItems array if needed
  if (!champion.equippedItems) {
    champion.equippedItems = [];
  }

  // Add item to champion
  champion.equippedItems.push(item);

  // Update champion stats
  champion.currentAttack = (champion.currentAttack || champion.card.attack || 0) + (item.atkBonus || 0);
  champion.currentDefense = (champion.currentDefense || champion.card.defense || 0) + (item.defBonus || 0);

  // Trigger ON_EQUIP effects
  const equipEffects = triggerEffects(gameState.gameId || 'default', 'ON_EQUIP', {
    gameState,
    playerIndex,
    opponentIndex: playerIndex === 0 ? 1 : 0,
    equippedChampionIndex: championFieldIndex,
    item,
    champion,
  });

  if (equipEffects.length > 0) {
    const result = applyEffects(gameState, equipEffects);
    gameState = result.gameState;
    effectMessages.push(...result.messages);
  }

  // Trigger PASSIVE effects to apply stat bonuses
  const passiveEffects = triggerEffects(gameState.gameId || 'default', 'PASSIVE', {
    gameState,
    playerIndex,
    opponentIndex: playerIndex === 0 ? 1 : 0,
    equippedChampionIndex: championFieldIndex,
    cardInstanceId: `${item.id}_${playerIndex}_${championFieldIndex}_${champion.equippedItems.length - 1}`,
    card: item,
  });

  if (passiveEffects.length > 0) {
    const result = applyEffects(gameState, passiveEffects);
    gameState = result.gameState;
    effectMessages.push(...result.messages);
  }

  return {
    success: true,
    gameState,
    goldSpent: item.goldCost || 0,
    effectMessages,
  };
}

/**
 * Get total value of equipped items on a champion
 * @param {Object} fieldCard - Field card with equipped items
 * @returns {Object} - { totalCost: number, atkBonus: number, defBonus: number }
 */
export function getEquippedItemsValue(fieldCard) {
  if (!fieldCard || !fieldCard.equippedItems) {
    return { totalCost: 0, atkBonus: 0, defBonus: 0 };
  }

  return fieldCard.equippedItems.reduce(
    (acc, item) => ({
      totalCost: acc.totalCost + (item.goldCost || 0),
      atkBonus: acc.atkBonus + (item.atkBonus || 0),
      defBonus: acc.defBonus + (item.defBonus || 0),
    }),
    { totalCost: 0, atkBonus: 0, defBonus: 0 }
  );
}

/**
 * Check if it's a valid phase for equipping items
 * @param {string} phase - Current game phase
 * @returns {boolean} - Whether items can be equipped
 */
export function canEquipInPhase(phase) {
  // Can only equip items during MAIN1 or MAIN2 phases
  return phase === 'MAIN1' || phase === 'MAIN2';
}

/**
 * Play a spell card from hand
 * @param {Object} gameState - Current game state
 * @param {number} playerIndex - Player index
 * @param {number} cardHandIndex - Index of card in hand
 * @param {Object} targetData - Target data for the spell
 * @returns {Object} - { success: boolean, gameState: Object, error?: string, effectMessages?: Array }
 */
export function playSpellCard(gameState, playerIndex, cardHandIndex, targetData = {}) {
  const player = gameState.players[playerIndex];
  const effectMessages = [];

  // Validate card
  const card = player.hand[cardHandIndex];
  if (!card) {
    return { success: false, gameState, error: 'Invalid card index' };
  }
  if (card.type !== 'ITEM' && card.type !== 'RUNE') {
    return { success: false, gameState, error: 'Card is not a spell' };
  }

  // Check gold cost
  if (card.goldCost) {
    const goldResult = deductGoldForItem(player, card);
    if (!goldResult.success) {
      return { success: false, gameState, error: goldResult.error };
    }
  }

  // Track spell activation
  const effectState = getEffectState(gameState.gameId || 'default');
  effectState.spellsActivatedThisTurn[playerIndex]++;

  // Trigger ON_SPELL_ACTIVATE effects
  const spellActivateEffects = triggerEffects(gameState.gameId || 'default', 'ON_SPELL_ACTIVATE', {
    gameState,
    playerIndex,
    opponentIndex: playerIndex === 0 ? 1 : 0,
    activatingPlayerIndex: playerIndex,
    card,
  });

  if (spellActivateEffects.length > 0) {
    const result = applyEffects(gameState, spellActivateEffects);
    gameState = result.gameState;
    effectMessages.push(...result.messages);
  }

  const spellType = card.spellType;

  // Handle based on spell type
  if (spellType === 'NORMAL_SPELL') {
    // Remove from hand, send to graveyard
    player.hand.splice(cardHandIndex, 1);
    player.graveyard.push(card);

    // Trigger ON_PLAY effects
    const playEffects = triggerEffects(gameState.gameId || 'default', 'ON_PLAY', {
      gameState,
      playerIndex,
      opponentIndex: playerIndex === 0 ? 1 : 0,
      card,
      cardInstanceId: `${card.id}_${playerIndex}_played`,
      ...targetData,
    });

    if (playEffects.length > 0) {
      const result = applyEffects(gameState, playEffects);
      gameState = result.gameState;
      effectMessages.push(...result.messages);
    }

    effectMessages.push(`${card.name} activated!`);
  } else if (spellType === 'CONTINUOUS_SPELL' || spellType === 'CONTINUOUS_TRAP') {
    // Remove from hand, place in spell zone
    player.hand.splice(cardHandIndex, 1);
    if (!player.field.spellZone) {
      player.field.spellZone = [null, null, null, null, null];
    }
    const emptySlot = player.field.spellZone.findIndex(s => s === null);
    if (emptySlot >= 0) {
      player.field.spellZone[emptySlot] = card;
      effectMessages.push(`${card.name} placed in Spell Zone!`);
    } else {
      return { success: false, gameState, error: 'No empty spell zone slots' };
    }
  } else if (spellType === 'NORMAL_TRAP') {
    // Set the trap (face-down in spell zone)
    player.hand.splice(cardHandIndex, 1);
    if (!player.field.spellZone) {
      player.field.spellZone = [null, null, null, null, null];
    }
    const emptySlot = player.field.spellZone.findIndex(s => s === null);
    if (emptySlot >= 0) {
      player.field.spellZone[emptySlot] = { ...card, faceDown: true };
      effectMessages.push(`${card.name} set!`);
    } else {
      return { success: false, gameState, error: 'No empty spell zone slots' };
    }
  }

  return {
    success: true,
    gameState,
    effectMessages,
  };
}

/**
 * Gain LP with effect tracking
 * @param {Object} gameState - Current game state
 * @param {number} playerIndex - Player gaining LP
 * @param {number} amount - Amount of LP to gain
 * @returns {Object} - { gameState, effectMessages }
 */
export function gainLP(gameState, playerIndex, amount) {
  const effectMessages = [];
  const effectState = getEffectState(gameState.gameId || 'default');

  // Check if healing is blocked
  if (effectState.healingBlocked[playerIndex]) {
    effectMessages.push('Healing is blocked!');
    return { gameState, effectMessages };
  }

  // Apply base healing
  gameState.players[playerIndex].lifePoints += amount;
  effectState.lpGainedThisTurn[playerIndex] = true;

  // Trigger ON_LP_GAIN effects
  const lpGainEffects = triggerEffects(gameState.gameId || 'default', 'ON_LP_GAIN', {
    gameState,
    playerIndex,
    opponentIndex: playerIndex === 0 ? 1 : 0,
    amount,
  });

  if (lpGainEffects.length > 0) {
    const result = applyEffects(gameState, lpGainEffects);
    gameState = result.gameState;
    effectMessages.push(...result.messages);
  }

  return { gameState, effectMessages };
}

export default {
  STARTING_GOLD,
  TURN_INCOME,
  KILL_REWARD,
  NOXUS_FIRST_KILL_BONUS,
  initializeGold,
  applyTurnIncome,
  applyKillReward,
  canAffordItem,
  deductGoldForItem,
  equipItem,
  getEquippedItemsValue,
  canEquipInPhase,
  playSpellCard,
  gainLP,
};
