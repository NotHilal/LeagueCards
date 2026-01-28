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
 * @returns {Object} - { success: boolean, gameState: Object, error?: string }
 */
export function equipItem(gameState, playerIndex, itemHandIndex, championFieldIndex) {
  const player = gameState.players[playerIndex];

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

  return {
    success: true,
    gameState,
    goldSpent: item.goldCost || 0,
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
};
