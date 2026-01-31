/**
 * Summoner Spells System
 *
 * Rules:
 * - Can only activate during opponent's turn (reactive)
 * - Each spell usable once per duel
 * - Source: Separate 5-slot Spell Deck
 *
 * Available Spells:
 * - Flash: Revive champion from graveyard
 * - Ignite: 400 damage to enemy HP
 * - Heal: +600 HP
 * - Barrier: 1 champion invincible this turn
 * - Exhaust: Target champion ATK = 0 this turn
 * - Teleport: Summon champion from hand
 * - Smite: Destroy 1 enemy champion
 */

import { createFieldCard } from './regionSynergy.js';

// Spell constants
export const SPELL_EFFECTS = {
  FLASH: { damage: 0, heal: 0, description: 'Revive champion from graveyard' },
  IGNITE: { damage: 400, heal: 0, description: '400 damage to enemy HP' },
  HEAL: { damage: 0, heal: 600, description: '+600 HP' },
  BARRIER: { damage: 0, heal: 0, description: '1 champion invincible this turn' },
  EXHAUST: { damage: 0, heal: 0, description: 'Target champion ATK = 0 this turn' },
  TELEPORT: { damage: 0, heal: 0, description: 'Summon champion from hand' },
  SMITE: { damage: 0, heal: 0, description: 'Destroy 1 enemy champion' },
};

/**
 * Check if a player can use summoner spells (must be opponent's turn)
 * @param {Object} gameState - Current game state
 * @param {number} playerIndex - Index of player wanting to use spell
 * @returns {boolean} - Whether spells can be used
 */
export function canUseSummonerSpells(gameState, playerIndex) {
  // Can only use during opponent's turn
  return gameState.currentPlayer !== playerIndex;
}

/**
 * Check if a specific spell has been used
 * @param {Object} playerState - Player state
 * @param {string} spellId - Spell ID to check
 * @returns {boolean} - Whether spell has been used
 */
export function isSpellUsed(playerState, spellId) {
  return playerState.usedSummonerSpells?.includes(spellId) || false;
}

/**
 * Mark a spell as used
 * @param {Object} playerState - Player state to update
 * @param {string} spellId - Spell ID to mark
 */
function markSpellUsed(playerState, spellId) {
  if (!playerState.usedSummonerSpells) {
    playerState.usedSummonerSpells = [];
  }
  playerState.usedSummonerSpells.push(spellId);
}

/**
 * Use Flash - Revive champion from graveyard
 * @param {Object} gameState - Current game state
 * @param {number} playerIndex - Player using the spell
 * @param {number} graveyardIndex - Index of champion to revive
 * @param {number} fieldIndex - Field slot to place champion
 * @returns {Object} - { success: boolean, gameState: Object, error?: string }
 */
export function useFlash(gameState, playerIndex, graveyardIndex, fieldIndex) {
  const player = gameState.players[playerIndex];

  if (!canUseSummonerSpells(gameState, playerIndex)) {
    return { success: false, gameState, error: 'Can only use spells during opponent\'s turn' };
  }

  // Find Flash in spell deck
  const flashSpell = player.spellDeck?.find(s => s.id === 'FLASH' || s.name?.toUpperCase() === 'FLASH');
  if (!flashSpell || isSpellUsed(player, flashSpell.id)) {
    return { success: false, gameState, error: 'Flash not available or already used' };
  }

  const champion = player.graveyard[graveyardIndex];
  if (!champion || champion.type !== 'MONSTER') {
    return { success: false, gameState, error: 'Invalid champion to revive' };
  }

  if (player.field.champions[fieldIndex] !== null) {
    return { success: false, gameState, error: 'Field slot is occupied' };
  }

  // Remove from graveyard
  player.graveyard.splice(graveyardIndex, 1);

  // Add to field
  player.field.champions[fieldIndex] = createFieldCard(champion);

  // Mark spell as used
  markSpellUsed(player, flashSpell.id);

  return { success: true, gameState, spellUsed: 'FLASH' };
}

/**
 * Use Ignite - Deal 400 damage to enemy HP
 * @param {Object} gameState - Current game state
 * @param {number} playerIndex - Player using the spell
 * @returns {Object} - { success: boolean, gameState: Object, error?: string }
 */
export function useIgnite(gameState, playerIndex) {
  const player = gameState.players[playerIndex];
  const opponent = gameState.players[playerIndex === 0 ? 1 : 0];

  if (!canUseSummonerSpells(gameState, playerIndex)) {
    return { success: false, gameState, error: 'Can only use spells during opponent\'s turn' };
  }

  const igniteSpell = player.spellDeck?.find(s => s.id === 'IGNITE' || s.name?.toUpperCase() === 'IGNITE');
  if (!igniteSpell || isSpellUsed(player, igniteSpell.id)) {
    return { success: false, gameState, error: 'Ignite not available or already used' };
  }

  // Deal damage
  opponent.lifePoints = Math.max(0, opponent.lifePoints - SPELL_EFFECTS.IGNITE.damage);

  // Mark spell as used
  markSpellUsed(player, igniteSpell.id);

  // Check win condition
  if (opponent.lifePoints <= 0) {
    gameState.winner = player.id;
  }

  return { success: true, gameState, spellUsed: 'IGNITE', damage: SPELL_EFFECTS.IGNITE.damage };
}

/**
 * Use Heal - Restore 600 HP
 * @param {Object} gameState - Current game state
 * @param {number} playerIndex - Player using the spell
 * @returns {Object} - { success: boolean, gameState: Object, error?: string }
 */
export function useHeal(gameState, playerIndex) {
  const player = gameState.players[playerIndex];

  if (!canUseSummonerSpells(gameState, playerIndex)) {
    return { success: false, gameState, error: 'Can only use spells during opponent\'s turn' };
  }

  const healSpell = player.spellDeck?.find(s => s.id === 'HEAL' || s.name?.toUpperCase() === 'HEAL');
  if (!healSpell || isSpellUsed(player, healSpell.id)) {
    return { success: false, gameState, error: 'Heal not available or already used' };
  }

  // Restore HP (no cap - can exceed 8000)
  player.lifePoints = player.lifePoints + SPELL_EFFECTS.HEAL.heal;

  // Mark spell as used
  markSpellUsed(player, healSpell.id);

  return { success: true, gameState, spellUsed: 'HEAL', healed: SPELL_EFFECTS.HEAL.heal };
}

/**
 * Use Barrier - Make 1 champion invincible this turn
 * @param {Object} gameState - Current game state
 * @param {number} playerIndex - Player using the spell
 * @param {number} championIndex - Index of champion to protect
 * @returns {Object} - { success: boolean, gameState: Object, error?: string }
 */
export function useBarrier(gameState, playerIndex, championIndex) {
  const player = gameState.players[playerIndex];

  if (!canUseSummonerSpells(gameState, playerIndex)) {
    return { success: false, gameState, error: 'Can only use spells during opponent\'s turn' };
  }

  const barrierSpell = player.spellDeck?.find(s => s.id === 'BARRIER' || s.name?.toUpperCase() === 'BARRIER');
  if (!barrierSpell || isSpellUsed(player, barrierSpell.id)) {
    return { success: false, gameState, error: 'Barrier not available or already used' };
  }

  const champion = player.field.champions[championIndex];
  if (!champion) {
    return { success: false, gameState, error: 'No champion at specified position' };
  }

  // Make champion invincible
  champion.isInvincible = true;

  // Mark spell as used
  markSpellUsed(player, barrierSpell.id);

  return { success: true, gameState, spellUsed: 'BARRIER', protectedChampion: championIndex };
}

/**
 * Use Exhaust - Set target champion's ATK to 0 this turn
 * @param {Object} gameState - Current game state
 * @param {number} playerIndex - Player using the spell
 * @param {number} targetChampionIndex - Index of enemy champion to exhaust
 * @returns {Object} - { success: boolean, gameState: Object, error?: string }
 */
export function useExhaust(gameState, playerIndex, targetChampionIndex) {
  const player = gameState.players[playerIndex];
  const opponent = gameState.players[playerIndex === 0 ? 1 : 0];

  if (!canUseSummonerSpells(gameState, playerIndex)) {
    return { success: false, gameState, error: 'Can only use spells during opponent\'s turn' };
  }

  const exhaustSpell = player.spellDeck?.find(s => s.id === 'EXHAUST' || s.name?.toUpperCase() === 'EXHAUST');
  if (!exhaustSpell || isSpellUsed(player, exhaustSpell.id)) {
    return { success: false, gameState, error: 'Exhaust not available or already used' };
  }

  const target = opponent.field.champions[targetChampionIndex];
  if (!target) {
    return { success: false, gameState, error: 'No enemy champion at specified position' };
  }

  // Set ATK to 0 (use special marker)
  target.attackModifier = -999; // Special value indicating ATK = 0

  // Mark spell as used
  markSpellUsed(player, exhaustSpell.id);

  return { success: true, gameState, spellUsed: 'EXHAUST', exhaustedChampion: targetChampionIndex };
}

/**
 * Use Teleport - Summon champion from hand immediately
 * @param {Object} gameState - Current game state
 * @param {number} playerIndex - Player using the spell
 * @param {number} handIndex - Index of champion in hand
 * @param {number} fieldIndex - Field slot to place champion
 * @returns {Object} - { success: boolean, gameState: Object, error?: string }
 */
export function useTeleport(gameState, playerIndex, handIndex, fieldIndex) {
  const player = gameState.players[playerIndex];

  if (!canUseSummonerSpells(gameState, playerIndex)) {
    return { success: false, gameState, error: 'Can only use spells during opponent\'s turn' };
  }

  const teleportSpell = player.spellDeck?.find(s => s.id === 'TELEPORT' || s.name?.toUpperCase() === 'TELEPORT');
  if (!teleportSpell || isSpellUsed(player, teleportSpell.id)) {
    return { success: false, gameState, error: 'Teleport not available or already used' };
  }

  const champion = player.hand[handIndex];
  if (!champion || champion.type !== 'MONSTER') {
    return { success: false, gameState, error: 'No valid champion at hand position' };
  }

  if (player.field.champions[fieldIndex] !== null) {
    return { success: false, gameState, error: 'Field slot is occupied' };
  }

  // Remove from hand
  player.hand.splice(handIndex, 1);

  // Add to field (can attack immediately since it's opponent's turn anyway)
  player.field.champions[fieldIndex] = createFieldCard(champion);

  // Mark spell as used
  markSpellUsed(player, teleportSpell.id);

  return { success: true, gameState, spellUsed: 'TELEPORT' };
}

/**
 * Use Smite - Destroy 1 enemy champion
 * @param {Object} gameState - Current game state
 * @param {number} playerIndex - Player using the spell
 * @param {number} targetChampionIndex - Index of enemy champion to destroy
 * @returns {Object} - { success: boolean, gameState: Object, error?: string }
 */
export function useSmite(gameState, playerIndex, targetChampionIndex) {
  const player = gameState.players[playerIndex];
  const opponent = gameState.players[playerIndex === 0 ? 1 : 0];

  if (!canUseSummonerSpells(gameState, playerIndex)) {
    return { success: false, gameState, error: 'Can only use spells during opponent\'s turn' };
  }

  const smiteSpell = player.spellDeck?.find(s => s.id === 'SMITE' || s.name?.toUpperCase() === 'SMITE');
  if (!smiteSpell || isSpellUsed(player, smiteSpell.id)) {
    return { success: false, gameState, error: 'Smite not available or already used' };
  }

  const target = opponent.field.champions[targetChampionIndex];
  if (!target) {
    return { success: false, gameState, error: 'No enemy champion at specified position' };
  }

  // Check if target is invincible (Barrier)
  if (target.isInvincible) {
    return { success: false, gameState, error: 'Cannot destroy invincible champion' };
  }

  // Destroy target
  opponent.graveyard.push(target.card);
  opponent.field.champions[targetChampionIndex] = null;

  // Mark spell as used
  markSpellUsed(player, smiteSpell.id);

  return { success: true, gameState, spellUsed: 'SMITE', destroyedChampion: targetChampionIndex };
}

/**
 * Process any summoner spell action
 * @param {Object} gameState - Current game state
 * @param {number} playerIndex - Player using the spell
 * @param {string} spellType - Type of spell (FLASH, IGNITE, etc.)
 * @param {Object} data - Additional data for the spell
 * @returns {Object} - Result of spell use
 */
export function useSummonerSpell(gameState, playerIndex, spellType, data = {}) {
  switch (spellType.toUpperCase()) {
    case 'FLASH':
      return useFlash(gameState, playerIndex, data.graveyardIndex, data.fieldIndex);
    case 'IGNITE':
      return useIgnite(gameState, playerIndex);
    case 'HEAL':
      return useHeal(gameState, playerIndex);
    case 'BARRIER':
      return useBarrier(gameState, playerIndex, data.championIndex);
    case 'EXHAUST':
      return useExhaust(gameState, playerIndex, data.targetChampionIndex);
    case 'TELEPORT':
      return useTeleport(gameState, playerIndex, data.handIndex, data.fieldIndex);
    case 'SMITE':
      return useSmite(gameState, playerIndex, data.targetChampionIndex);
    default:
      return { success: false, gameState, error: `Unknown spell type: ${spellType}` };
  }
}

/**
 * Get available (unused) summoner spells for a player
 * @param {Object} playerState - Player state
 * @returns {Array} - Array of available spell cards
 */
export function getAvailableSpells(playerState) {
  if (!playerState.spellDeck) return [];

  return playerState.spellDeck.filter(spell => !isSpellUsed(playerState, spell.id));
}

/**
 * Initialize default summoner spells for a player
 * @returns {Array} - Default spell deck
 */
export function initializeSpellDeck() {
  return [
    { id: 'FLASH', name: 'Flash', type: 'SUMMONER_SPELL', summonerEffect: SPELL_EFFECTS.FLASH.description },
    { id: 'IGNITE', name: 'Ignite', type: 'SUMMONER_SPELL', summonerEffect: SPELL_EFFECTS.IGNITE.description },
    { id: 'HEAL', name: 'Heal', type: 'SUMMONER_SPELL', summonerEffect: SPELL_EFFECTS.HEAL.description },
    { id: 'BARRIER', name: 'Barrier', type: 'SUMMONER_SPELL', summonerEffect: SPELL_EFFECTS.BARRIER.description },
    { id: 'EXHAUST', name: 'Exhaust', type: 'SUMMONER_SPELL', summonerEffect: SPELL_EFFECTS.EXHAUST.description },
  ];
}

export default {
  SPELL_EFFECTS,
  canUseSummonerSpells,
  isSpellUsed,
  useFlash,
  useIgnite,
  useHeal,
  useBarrier,
  useExhaust,
  useTeleport,
  useSmite,
  useSummonerSpell,
  getAvailableSpells,
  initializeSpellDeck,
};
