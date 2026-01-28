/**
 * Region Synergy System
 *
 * Bonuses:
 * | Region        | 2+ Bonus                    | 4+ Bonus                         |
 * |---------------|-----------------------------|---------------------------------|
 * | DEMACIA       | +100 DEF to all Demacians   | +200 ATK to all Demacians       |
 * | NOXUS         | +100 ATK on attacks         | First kill = +200 gold          |
 * | SHADOW_ISLES  | Death deals 200 to enemy HP | Revive 1 champion (once/game)   |
 */

// Synergy bonus constants
export const SYNERGY_BONUSES = {
  DEMACIA: {
    twoPlus: { type: 'STAT_BONUS', stat: 'defense', amount: 100, target: 'DEMACIA' },
    fourPlus: { type: 'STAT_BONUS', stat: 'attack', amount: 200, target: 'DEMACIA' },
  },
  NOXUS: {
    twoPlus: { type: 'ATTACK_BONUS', amount: 100 },
    fourPlus: { type: 'GOLD_ON_KILL', amount: 200 },
  },
  SHADOW_ISLES: {
    twoPlus: { type: 'DEATH_DAMAGE', amount: 200 },
    fourPlus: { type: 'REVIVE', uses: 1 },
  },
};

/**
 * Count champions by region on the field
 * @param {Object} playerState - Player state
 * @returns {Object} - Record of region -> count
 */
export function countRegions(playerState) {
  const regionCounts = {};

  playerState.field.champions.forEach(fc => {
    if (fc && fc.card && fc.card.region) {
      const region = fc.card.region;
      regionCounts[region] = (regionCounts[region] || 0) + 1;
    }
  });

  return regionCounts;
}

/**
 * Calculate active region bonuses for a player
 * @param {Object} playerState - Player state
 * @returns {Array} - Array of active region bonuses
 */
export function calculateRegionBonuses(playerState) {
  const regionCounts = countRegions(playerState);
  const bonuses = [];

  Object.entries(regionCounts).forEach(([region, count]) => {
    if (count >= 2) {
      bonuses.push({
        region,
        count,
        twoPlus: true,
        fourPlus: count >= 4,
      });
    }
  });

  return bonuses;
}

/**
 * Apply Demacia synergy stat bonuses to champions
 * @param {Object} playerState - Player state to update
 * @param {Object} bonus - Region bonus info
 */
export function applyDemaciaSynergy(playerState, bonus) {
  const demaciaBonus = SYNERGY_BONUSES.DEMACIA;

  playerState.field.champions.forEach(fc => {
    if (fc && fc.card && fc.card.region === 'DEMACIA') {
      // 2+ bonus: +100 DEF
      if (bonus.twoPlus) {
        fc.currentDefense = (fc.currentDefense || fc.card.defense || 0) + demaciaBonus.twoPlus.amount;
      }
      // 4+ bonus: +200 ATK
      if (bonus.fourPlus) {
        fc.currentAttack = (fc.currentAttack || fc.card.attack || 0) + demaciaBonus.fourPlus.amount;
      }
    }
  });
}

/**
 * Get Noxus attack bonus (applied during combat)
 * @param {Object} playerState - Player state
 * @returns {number} - Bonus ATK to add during attacks
 */
export function getNoxusAttackBonus(playerState) {
  const noxusBonus = playerState.regionBonuses?.find(b => b.region === 'NOXUS');
  if (noxusBonus && noxusBonus.twoPlus) {
    return SYNERGY_BONUSES.NOXUS.twoPlus.amount;
  }
  return 0;
}

/**
 * Check if Noxus 4+ gold bonus should apply
 * @param {Object} playerState - Player state
 * @returns {boolean} - Whether bonus should apply
 */
export function hasNoxusKillBonus(playerState) {
  const noxusBonus = playerState.regionBonuses?.find(b => b.region === 'NOXUS');
  return noxusBonus && noxusBonus.fourPlus && !playerState.hasGottenNoxusKillGold;
}

/**
 * Apply Shadow Isles death damage
 * @param {Object} attackerState - Player who lost the champion
 * @param {Object} defenderState - Opponent player
 * @returns {number} - Damage dealt
 */
export function applyShadowIslesDeathDamage(attackerState, defenderState) {
  const siBonus = attackerState.regionBonuses?.find(b => b.region === 'SHADOW_ISLES');
  if (siBonus && siBonus.twoPlus) {
    const damage = SYNERGY_BONUSES.SHADOW_ISLES.twoPlus.amount;
    defenderState.lifePoints = Math.max(0, defenderState.lifePoints - damage);
    return damage;
  }
  return 0;
}

/**
 * Check if Shadow Isles revive is available
 * @param {Object} playerState - Player state
 * @returns {boolean} - Whether revive is available
 */
export function canUseShadowIslesRevive(playerState) {
  const siBonus = playerState.regionBonuses?.find(b => b.region === 'SHADOW_ISLES');
  return siBonus && siBonus.fourPlus && !playerState.hasUsedRevive;
}

/**
 * Use Shadow Isles revive ability
 * @param {Object} gameState - Current game state
 * @param {number} playerIndex - Player index
 * @param {number} graveyardIndex - Index of champion in graveyard to revive
 * @param {number} fieldIndex - Index on field to place revived champion
 * @returns {Object} - { success: boolean, gameState: Object, error?: string }
 */
export function useShadowIslesRevive(gameState, playerIndex, graveyardIndex, fieldIndex) {
  const player = gameState.players[playerIndex];

  if (!canUseShadowIslesRevive(player)) {
    return { success: false, gameState, error: 'Shadow Isles revive not available' };
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

  // Mark revive as used
  player.hasUsedRevive = true;

  return { success: true, gameState };
}

/**
 * Create a field card from a game card
 * @param {Object} card - Game card
 * @returns {Object} - Field card
 */
export function createFieldCard(card) {
  return {
    card,
    position: 'ATTACK',
    faceUp: true,
    turnsOnBoard: 0,
    hasAttacked: false,
    hasChangedPosition: false,
    currentAttack: card.attack || 0,
    currentDefense: card.defense || 0,
    equippedItems: [],
    isInvincible: false,
    attackModifier: 0,
    defenseModifier: 0,
    hasUsedSpell: false,
    hasUsedUltimate: false,
  };
}

/**
 * Update all region synergies for a player
 * @param {Object} playerState - Player state to update
 */
export function updateRegionSynergies(playerState) {
  // Recalculate region counts
  playerState.regionCounts = countRegions(playerState);

  // Calculate active bonuses
  playerState.regionBonuses = calculateRegionBonuses(playerState);

  // Reset champion stats to base before applying synergies
  playerState.field.champions.forEach(fc => {
    if (fc && fc.card) {
      // Start from base stats + item bonuses
      const itemAtkBonus = fc.equippedItems?.reduce((sum, item) => sum + (item.atkBonus || 0), 0) || 0;
      const itemDefBonus = fc.equippedItems?.reduce((sum, item) => sum + (item.defBonus || 0), 0) || 0;
      fc.currentAttack = (fc.card.attack || 0) + itemAtkBonus;
      fc.currentDefense = (fc.card.defense || 0) + itemDefBonus;
    }
  });

  // Apply Demacia synergy if active
  const demaciaBonus = playerState.regionBonuses.find(b => b.region === 'DEMACIA');
  if (demaciaBonus) {
    applyDemaciaSynergy(playerState, demaciaBonus);
  }
}

/**
 * Get synergy description for UI
 * @param {string} region - Region name
 * @param {number} count - Champion count
 * @returns {Object} - { twoPlus?: string, fourPlus?: string }
 */
export function getSynergyDescription(region, count) {
  const descriptions = {
    DEMACIA: {
      twoPlus: '+100 DEF to Demacians',
      fourPlus: '+200 ATK to Demacians',
    },
    NOXUS: {
      twoPlus: '+100 ATK on attacks',
      fourPlus: 'First kill: +200 gold',
    },
    SHADOW_ISLES: {
      twoPlus: 'Death deals 200 damage',
      fourPlus: 'Revive 1 champion (1/game)',
    },
  };

  const regionDesc = descriptions[region];
  if (!regionDesc) return {};

  return {
    twoPlus: count >= 2 ? regionDesc.twoPlus : undefined,
    fourPlus: count >= 4 ? regionDesc.fourPlus : undefined,
  };
}

export default {
  SYNERGY_BONUSES,
  countRegions,
  calculateRegionBonuses,
  applyDemaciaSynergy,
  getNoxusAttackBonus,
  hasNoxusKillBonus,
  applyShadowIslesDeathDamage,
  canUseShadowIslesRevive,
  useShadowIslesRevive,
  createFieldCard,
  updateRegionSynergies,
  getSynergyDescription,
};
