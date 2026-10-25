// Read at call time. Only 1/true/yes/on enable a flag; unset or anything else is OFF.
const TRUTHY = new Set(['1', 'true', 'yes', 'on']);

function flagEnabled(name: string): boolean {
  const raw = process.env[name];
  return raw !== undefined && TRUTHY.has(raw.trim().toLowerCase());
}

/** Advance as soon as every active player has answered the current question. */
export const isBattleEarlyAdvanceEnabled = () =>
  flagEnabled('BATTLE_EARLY_ADVANCE');

/** Ready both matched players and start the battle without the manual lobby. */
export const isMatchmakingAutoStartEnabled = () =>
  flagEnabled('MATCHMAKING_AUTO_START');
