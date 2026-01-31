/**
 * Combat System - Yu-Gi-Oh Style Combat Resolution
 *
 * Rules:
 * - ATK vs ATK: Lower ATK destroyed, difference = damage to owner's HP
 * - ATK vs DEF: If ATK > DEF, monster destroyed (no damage). If ATK < DEF, attacker takes difference as damage
 * - Direct Attack: If no enemy champions, deal ATK to enemy HP
 * - Starting HP: 8000
 */

import { triggerEffects, applyEffects, getEffectState } from './effectSystem.js';

/**
 * Get the effective attack value of a field card (base + modifiers + items + synergies)
 * @param {Object} fieldCard - The field card
 * @returns {number} - Effective attack value
 */
export function getEffectiveAttack(fieldCard) {
  if (!fieldCard || !fieldCard.card) return 0;

  const baseAttack = fieldCard.card.attack || 0;
  const itemBonus = fieldCard.equippedItems?.reduce((sum, item) => sum + (item.atkBonus || 0), 0) || 0;
  const modifier = fieldCard.attackModifier || 0;

  // If modifier is set to a specific value (like Exhaust setting ATK to 0)
  if (modifier === -999) return 0;

  return Math.max(0, fieldCard.currentAttack || (baseAttack + itemBonus + modifier));
}

/**
 * Get the effective defense value of a field card
 * @param {Object} fieldCard - The field card
 * @returns {number} - Effective defense value
 */
export function getEffectiveDefense(fieldCard) {
  if (!fieldCard || !fieldCard.card) return 0;

  const baseDefense = fieldCard.card.defense || 0;
  const itemBonus = fieldCard.equippedItems?.reduce((sum, item) => sum + (item.defBonus || 0), 0) || 0;
  const modifier = fieldCard.defenseModifier || 0;

  return Math.max(0, fieldCard.currentDefense || (baseDefense + itemBonus + modifier));
}

/**
 * Resolve combat between attacker and defender
 * @param {Object} attacker - Attacking field card
 * @param {Object} defender - Defending field card (or null for direct attack)
 * @returns {Object} - Combat result
 */
export function resolveCombat(attacker, defender) {
  const result = {
    attackerDestroyed: false,
    defenderDestroyed: false,
    damageToAttackerOwner: 0,
    damageToDefenderOwner: 0,
    attackerCard: attacker,
    defenderCard: defender,
  };

  // Check if attacker is invincible (should not happen, but safety check)
  if (attacker.isInvincible) {
    return result; // No combat occurs
  }

  const attackerATK = getEffectiveAttack(attacker);

  // Direct attack - no defender
  if (!defender) {
    result.damageToDefenderOwner = attackerATK;
    return result;
  }

  // Check if defender is invincible (Barrier)
  if (defender.isInvincible) {
    // Combat happens but defender survives
    return result;
  }

  const defenderPosition = defender.position || 'ATTACK';

  if (defenderPosition === 'ATTACK') {
    // ATK vs ATK battle
    const defenderATK = getEffectiveAttack(defender);

    if (attackerATK > defenderATK) {
      // Attacker wins - defender destroyed, damage = difference
      result.defenderDestroyed = true;
      result.damageToDefenderOwner = attackerATK - defenderATK;
    } else if (attackerATK < defenderATK) {
      // Defender wins - attacker destroyed, damage = difference
      result.attackerDestroyed = true;
      result.damageToAttackerOwner = defenderATK - attackerATK;
    } else {
      // Draw - both destroyed, no damage
      result.attackerDestroyed = true;
      result.defenderDestroyed = true;
    }
  } else {
    // ATK vs DEF battle (defender in DEFENSE or FACE_DOWN_DEFENSE position)
    const defenderDEF = getEffectiveDefense(defender);

    if (attackerATK > defenderDEF) {
      // Attacker wins - defender destroyed, no damage to either player
      result.defenderDestroyed = true;
    } else if (attackerATK < defenderDEF) {
      // Defender wins - attacker takes recoil damage, no one destroyed
      result.damageToAttackerOwner = defenderDEF - attackerATK;
    }
    // If equal, nothing happens (defender survives, no damage)
  }

  return result;
}

/**
 * Check if a player can declare an attack
 * @param {Object} gameState - Current game state
 * @param {number} playerIndex - Index of the player
 * @returns {Object} - { canAttack: boolean, reason?: string }
 */
export function canDeclareAttack(gameState, playerIndex) {
  if (gameState.currentPlayer !== playerIndex) {
    return { canAttack: false, reason: 'Not your turn' };
  }

  if (gameState.phase !== 'BATTLE') {
    return { canAttack: false, reason: 'Not in Battle Phase' };
  }

  const player = gameState.players[playerIndex];
  const hasAttacker = player.field.champions.some(
    fc => fc && !fc.hasAttacked && fc.position === 'ATTACK'
  );

  if (!hasAttacker) {
    return { canAttack: false, reason: 'No available attackers' };
  }

  return { canAttack: true };
}

/**
 * Check if a specific card can attack
 * @param {Object} fieldCard - The field card to check
 * @returns {Object} - { canAttack: boolean, reason?: string }
 */
export function canCardAttack(fieldCard) {
  if (!fieldCard) {
    return { canAttack: false, reason: 'No card selected' };
  }

  if (fieldCard.hasAttacked) {
    return { canAttack: false, reason: 'This card has already attacked this turn' };
  }

  if (fieldCard.position !== 'ATTACK') {
    return { canAttack: false, reason: 'Card must be in Attack Position to attack' };
  }

  // Cards summoned this turn cannot attack (summoning sickness)
  if (fieldCard.turnsOnBoard === 0) {
    return { canAttack: false, reason: 'Card cannot attack the turn it was summoned' };
  }

  return { canAttack: true };
}

/**
 * Check if a direct attack is possible
 * @param {Object} gameState - Current game state
 * @param {number} defenderIndex - Index of the defending player
 * @returns {boolean} - Whether direct attack is possible
 */
export function canDirectAttack(gameState, defenderIndex) {
  const defender = gameState.players[defenderIndex];
  const hasDefenders = defender.field.champions.some(fc => fc !== null);
  return !hasDefenders;
}

/**
 * Apply combat result to game state
 * @param {Object} gameState - Current game state
 * @param {number} attackerPlayerIndex - Index of attacking player
 * @param {number} attackerCardIndex - Index of attacking card on field
 * @param {number} defenderCardIndex - Index of defending card (-1 for direct attack)
 * @param {Object} combatResult - Result from resolveCombat
 * @returns {Object} - Updated game state
 */
export function applyCombatResult(gameState, attackerPlayerIndex, attackerCardIndex, defenderCardIndex, combatResult) {
  const defenderPlayerIndex = attackerPlayerIndex === 0 ? 1 : 0;
  const attackerPlayer = gameState.players[attackerPlayerIndex];
  const defenderPlayer = gameState.players[defenderPlayerIndex];

  // Apply damage to players
  attackerPlayer.lifePoints = Math.max(0, attackerPlayer.lifePoints - combatResult.damageToAttackerOwner);
  defenderPlayer.lifePoints = Math.max(0, defenderPlayer.lifePoints - combatResult.damageToDefenderOwner);

  // Handle destroyed cards
  if (combatResult.attackerDestroyed) {
    const destroyedCard = attackerPlayer.field.champions[attackerCardIndex];
    if (destroyedCard) {
      attackerPlayer.graveyard.push(destroyedCard.card);
      attackerPlayer.field.champions[attackerCardIndex] = null;
    }
  } else {
    // Mark attacker as having attacked
    if (attackerPlayer.field.champions[attackerCardIndex]) {
      attackerPlayer.field.champions[attackerCardIndex].hasAttacked = true;
    }
  }

  if (combatResult.defenderDestroyed && defenderCardIndex >= 0) {
    const destroyedCard = defenderPlayer.field.champions[defenderCardIndex];
    if (destroyedCard) {
      defenderPlayer.graveyard.push(destroyedCard.card);
      defenderPlayer.field.champions[defenderCardIndex] = null;
    }
  }

  // Check win condition
  if (attackerPlayer.lifePoints <= 0) {
    gameState.winner = defenderPlayer.id;
  } else if (defenderPlayer.lifePoints <= 0) {
    gameState.winner = attackerPlayer.id;
  }

  return gameState;
}

/**
 * Process a full attack action
 * @param {Object} gameState - Current game state
 * @param {number} attackerPlayerIndex - Index of attacking player
 * @param {number} attackerCardIndex - Index of attacking card on field
 * @param {number} targetCardIndex - Index of target card (-1 for direct attack)
 * @returns {Object} - { success: boolean, gameState: Object, combatResult?: Object, error?: string, effectMessages?: Array }
 */
export function processAttack(gameState, attackerPlayerIndex, attackerCardIndex, targetCardIndex) {
  // Validate attack declaration
  const canAttackResult = canDeclareAttack(gameState, attackerPlayerIndex);
  if (!canAttackResult.canAttack) {
    return { success: false, gameState, error: canAttackResult.reason };
  }

  const attackerPlayer = gameState.players[attackerPlayerIndex];
  const defenderPlayerIndex = attackerPlayerIndex === 0 ? 1 : 0;
  const defenderPlayer = gameState.players[defenderPlayerIndex];

  // Validate attacker card
  const attacker = attackerPlayer.field.champions[attackerCardIndex];
  const cardCanAttack = canCardAttack(attacker);
  if (!cardCanAttack.canAttack) {
    return { success: false, gameState, error: cardCanAttack.reason };
  }

  // Get defender (if any)
  let defender = null;
  if (targetCardIndex >= 0) {
    defender = defenderPlayer.field.champions[targetCardIndex];
    if (!defender) {
      return { success: false, gameState, error: 'Invalid target' };
    }
  } else {
    // Direct attack - check if allowed
    if (!canDirectAttack(gameState, defenderPlayerIndex)) {
      return { success: false, gameState, error: 'Cannot attack directly while opponent has monsters' };
    }
  }

  const effectMessages = [];

  // Track attack count
  const effectState = getEffectState(gameState.gameId || 'default');
  effectState.attacksThisTurn[attackerPlayerIndex]++;

  // Trigger ON_ATTACK effects
  const attackEffects = triggerEffects(gameState.gameId || 'default', 'ON_ATTACK', {
    gameState,
    attackerPlayerIndex,
    attackerIndex: attackerCardIndex,
    defenderPlayerIndex,
    defenderIndex: targetCardIndex,
    attacker,
    defender,
  });
  if (attackEffects.length > 0) {
    const result = applyEffects(gameState, attackEffects);
    gameState = result.gameState;
    effectMessages.push(...result.messages);
  }

  // Trigger ON_DIRECT_ATTACK if applicable
  if (targetCardIndex < 0) {
    const directEffects = triggerEffects(gameState.gameId || 'default', 'ON_DIRECT_ATTACK', {
      gameState,
      attackerPlayerIndex,
      attackerIndex: attackerCardIndex,
      attacker,
    });
    if (directEffects.length > 0) {
      const result = applyEffects(gameState, directEffects);
      gameState = result.gameState;
      effectMessages.push(...result.messages);
    }
  }

  // Trigger ON_ATTACKED effects (for defender's items)
  if (defender) {
    const attackedEffects = triggerEffects(gameState.gameId || 'default', 'ON_ATTACKED', {
      gameState,
      attackerPlayerIndex,
      attackerIndex: attackerCardIndex,
      defenderPlayerIndex,
      defenderIndex: targetCardIndex,
      attacker,
      defender,
    });
    if (attackedEffects.length > 0) {
      const result = applyEffects(gameState, attackedEffects);
      gameState = result.gameState;
      effectMessages.push(...result.messages);
    }
  }

  // Resolve combat
  const combatResult = resolveCombat(attacker, defender);

  // Check for destruction negation effects
  let attackerDestroyed = combatResult.attackerDestroyed;
  let defenderDestroyed = combatResult.defenderDestroyed;

  // Trigger ON_CHAMPION_DESTROYED effects for attacker
  if (attackerDestroyed) {
    const destroyEffects = triggerEffects(gameState.gameId || 'default', 'ON_CHAMPION_DESTROYED', {
      gameState,
      playerIndex: attackerPlayerIndex,
      destroyedChampionIndex: attackerCardIndex,
      destroyedCard: attacker.card,
    });
    // Check if destruction was negated
    const negated = destroyEffects.find(e => e.type === 'NEGATE_DESTRUCTION');
    if (negated) {
      attackerDestroyed = false;
      combatResult.attackerDestroyed = false;
    }
    const result = applyEffects(gameState, destroyEffects);
    gameState = result.gameState;
    effectMessages.push(...result.messages);
  }

  // Trigger ON_CHAMPION_DESTROYED effects for defender
  if (defenderDestroyed && defender) {
    const destroyEffects = triggerEffects(gameState.gameId || 'default', 'ON_CHAMPION_DESTROYED', {
      gameState,
      playerIndex: defenderPlayerIndex,
      destroyedChampionIndex: targetCardIndex,
      destroyedCard: defender.card,
    });
    // Check if destruction was negated
    const negated = destroyEffects.find(e => e.type === 'NEGATE_DESTRUCTION');
    if (negated) {
      defenderDestroyed = false;
      combatResult.defenderDestroyed = false;
    }
    const result = applyEffects(gameState, destroyEffects);
    gameState = result.gameState;
    effectMessages.push(...result.messages);
  }

  // Trigger ON_DESTROY_MONSTER if attacker destroyed defender
  if (defenderDestroyed) {
    const killEffects = triggerEffects(gameState.gameId || 'default', 'ON_DESTROY_MONSTER', {
      gameState,
      attackerPlayerIndex,
      attackerIndex: attackerCardIndex,
      defenderPlayerIndex,
      defenderIndex: targetCardIndex,
      opponentIndex: defenderPlayerIndex,
    });
    if (killEffects.length > 0) {
      const result = applyEffects(gameState, killEffects);
      gameState = result.gameState;
      effectMessages.push(...result.messages);
    }
  }

  // Trigger ON_CHAMPION_SURVIVES if champion survived
  if (!attackerDestroyed && defender) {
    attacker.survivedBattle = true;
    const surviveEffects = triggerEffects(gameState.gameId || 'default', 'ON_CHAMPION_SURVIVES', {
      gameState,
      playerIndex: attackerPlayerIndex,
      championIndex: attackerCardIndex,
      attackerPlayerIndex,
      attackerIndex: attackerCardIndex,
    });
    if (surviveEffects.length > 0) {
      const result = applyEffects(gameState, surviveEffects);
      gameState = result.gameState;
      effectMessages.push(...result.messages);
    }
  }
  if (!defenderDestroyed && defender) {
    defender.survivedBattle = true;
    const surviveEffects = triggerEffects(gameState.gameId || 'default', 'ON_CHAMPION_SURVIVES', {
      gameState,
      playerIndex: defenderPlayerIndex,
      championIndex: targetCardIndex,
      attackerPlayerIndex,
      attackerIndex: attackerCardIndex,
    });
    if (surviveEffects.length > 0) {
      const result = applyEffects(gameState, surviveEffects);
      gameState = result.gameState;
      effectMessages.push(...result.messages);
    }
  }

  // Trigger ON_BATTLE_DAMAGE if damage was dealt
  if (combatResult.damageToDefenderOwner > 0) {
    const damageEffects = triggerEffects(gameState.gameId || 'default', 'ON_BATTLE_DAMAGE', {
      gameState,
      attackerPlayerIndex,
      attackerIndex: attackerCardIndex,
      damageAmount: combatResult.damageToDefenderOwner,
    });
    if (damageEffects.length > 0) {
      const result = applyEffects(gameState, damageEffects);
      gameState = result.gameState;
      effectMessages.push(...result.messages);
    }
  }

  // Trigger ON_TAKE_DAMAGE for damage taken
  if (combatResult.damageToAttackerOwner > 0) {
    const takeDamageEffects = triggerEffects(gameState.gameId || 'default', 'ON_TAKE_DAMAGE', {
      gameState,
      playerIndex: attackerPlayerIndex,
      opponentIndex: defenderPlayerIndex,
      damageAmount: combatResult.damageToAttackerOwner,
    });
    if (takeDamageEffects.length > 0) {
      const result = applyEffects(gameState, takeDamageEffects);
      gameState = result.gameState;
      effectMessages.push(...result.messages);
    }
  }
  if (combatResult.damageToDefenderOwner > 0) {
    const takeDamageEffects = triggerEffects(gameState.gameId || 'default', 'ON_TAKE_DAMAGE', {
      gameState,
      playerIndex: defenderPlayerIndex,
      opponentIndex: attackerPlayerIndex,
      damageAmount: combatResult.damageToDefenderOwner,
    });
    if (takeDamageEffects.length > 0) {
      const result = applyEffects(gameState, takeDamageEffects);
      gameState = result.gameState;
      effectMessages.push(...result.messages);
    }
  }

  // Trigger ON_BATTLE_END effects
  const battleEndEffects = triggerEffects(gameState.gameId || 'default', 'ON_BATTLE_END', {
    gameState,
    attackerPlayerIndex,
    attackerIndex: attackerCardIndex,
    defenderPlayerIndex,
    defenderIndex: targetCardIndex,
    attacker,
    defender,
    combatResult,
  });
  if (battleEndEffects.length > 0) {
    const result = applyEffects(gameState, battleEndEffects);
    gameState = result.gameState;
    effectMessages.push(...result.messages);
  }

  // Apply result (with updated destruction flags)
  combatResult.attackerDestroyed = attackerDestroyed;
  combatResult.defenderDestroyed = defenderDestroyed;

  const updatedState = applyCombatResult(
    gameState,
    attackerPlayerIndex,
    attackerCardIndex,
    targetCardIndex,
    combatResult
  );

  return {
    success: true,
    gameState: updatedState,
    combatResult,
    effectMessages,
  };
}

/**
 * Reset combat-related flags at the start of a turn
 * @param {Object} playerState - Player state to reset
 */
export function resetTurnCombatFlags(playerState) {
  playerState.field.champions.forEach(fc => {
    if (fc) {
      fc.hasAttacked = false;
      fc.hasChangedPosition = false;
      fc.hasUsedSpell = false;
      fc.attackModifier = 0; // Reset temporary modifiers
      fc.defenseModifier = 0;
      fc.isInvincible = false; // Reset Barrier
    }
  });
}

/**
 * Increment turnsOnBoard for all champions at STANDBY phase
 * @param {Object} playerState - Player state to update
 */
export function incrementTurnsOnBoard(playerState) {
  playerState.field.champions.forEach(fc => {
    if (fc) {
      fc.turnsOnBoard = (fc.turnsOnBoard || 0) + 1;
    }
  });
}

/**
 * Process standby phase effects
 * @param {Object} gameState - Current game state
 * @param {number} playerIndex - Current player index
 * @returns {Object} - { gameState, effectMessages }
 */
export function processStandbyPhase(gameState, playerIndex) {
  const effectMessages = [];

  // Trigger ON_STANDBY_PHASE effects
  const standbyEffects = triggerEffects(gameState.gameId || 'default', 'ON_STANDBY_PHASE', {
    gameState,
    playerIndex,
    opponentIndex: playerIndex === 0 ? 1 : 0,
  });

  if (standbyEffects.length > 0) {
    const result = applyEffects(gameState, standbyEffects);
    gameState = result.gameState;
    effectMessages.push(...result.messages);
  }

  return { gameState, effectMessages };
}

/**
 * Process end phase effects
 * @param {Object} gameState - Current game state
 * @param {number} playerIndex - Current player index
 * @returns {Object} - { gameState, effectMessages }
 */
export function processEndPhase(gameState, playerIndex) {
  const effectMessages = [];

  // Trigger ON_END_PHASE effects
  const endEffects = triggerEffects(gameState.gameId || 'default', 'ON_END_PHASE', {
    gameState,
    playerIndex,
    opponentIndex: playerIndex === 0 ? 1 : 0,
  });

  if (endEffects.length > 0) {
    const result = applyEffects(gameState, endEffects);
    gameState = result.gameState;
    effectMessages.push(...result.messages);
  }

  // Process revives at end phase
  const effectState = getEffectState(gameState.gameId || 'default');
  if (effectState.reviveAtEndPhase && effectState.reviveAtEndPhase.length > 0) {
    for (const revive of effectState.reviveAtEndPhase) {
      if (revive.playerIndex === playerIndex) {
        const player = gameState.players[revive.playerIndex];
        // Find empty slot
        const emptySlot = player.field.champions.findIndex(c => c === null);
        if (emptySlot >= 0) {
          player.field.champions[emptySlot] = {
            card: revive.card,
            turnsOnBoard: 0,
            hasAttacked: false,
            position: revive.position || 'DEFENSE',
            currentAttack: revive.card.attack,
            currentDefense: revive.card.defense,
            equippedItems: [],
          };
          effectMessages.push(`${revive.card.name} revived in ${revive.position} position!`);
        }
      }
    }
    // Clear processed revives
    effectState.reviveAtEndPhase = effectState.reviveAtEndPhase.filter(r => r.playerIndex !== playerIndex);
  }

  // Process marked for destruction
  if (effectState.markedForDestruction && effectState.markedForDestruction.length > 0) {
    for (const mark of effectState.markedForDestruction) {
      if (mark.playerIndex === playerIndex) {
        const player = gameState.players[mark.playerIndex];
        const champion = player.field.champions[mark.fieldIndex];
        if (champion) {
          player.graveyard.push(champion.card);
          player.field.champions[mark.fieldIndex] = null;
          effectMessages.push(`${champion.card.name} was destroyed!`);
        }
      }
    }
    // Clear processed destructions
    effectState.markedForDestruction = effectState.markedForDestruction.filter(m => m.playerIndex !== playerIndex);
  }

  return { gameState, effectMessages };
}

/**
 * Process draw phase effects
 * @param {Object} gameState - Current game state
 * @param {number} playerIndex - Current player index
 * @returns {Object} - { gameState, effectMessages }
 */
export function processDrawPhase(gameState, playerIndex) {
  const effectMessages = [];

  // Trigger ON_DRAW_PHASE effects
  const drawEffects = triggerEffects(gameState.gameId || 'default', 'ON_DRAW_PHASE', {
    gameState,
    playerIndex,
    opponentIndex: playerIndex === 0 ? 1 : 0,
  });

  if (drawEffects.length > 0) {
    const result = applyEffects(gameState, drawEffects);
    gameState = result.gameState;
    effectMessages.push(...result.messages);
  }

  return { gameState, effectMessages };
}

export default {
  getEffectiveAttack,
  getEffectiveDefense,
  resolveCombat,
  canDeclareAttack,
  canCardAttack,
  canDirectAttack,
  applyCombatResult,
  processAttack,
  resetTurnCombatFlags,
  incrementTurnsOnBoard,
  processStandbyPhase,
  processEndPhase,
  processDrawPhase,
};
