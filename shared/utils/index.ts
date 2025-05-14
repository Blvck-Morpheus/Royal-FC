// Shared utility functions

/**
 * Calculate goal difference for a team
 */
export function calculateGoalDifference(goalsFor: number, goalsAgainst: number): number {
  return goalsFor - goalsAgainst;
}

/**
 * Calculate points for a team based on wins, draws, and losses
 */
export function calculatePoints(wins: number, draws: number): number {
  return (wins * 3) + draws;
}

/**
 * Get badge icon class based on badge type
 */
export function getBadgeIcon(badgeType: string): string {
  switch (badgeType) {
    case 'goldenBoot':
      return 'ri-football-line';
    case 'playmaker':
      return 'ri-magic-line';
    case 'cleanSheetKing':
      return 'ri-shield-check-line';
    case 'ironDefense':
      return 'ri-shield-star-line';
    case 'safeHands':
      return 'ri-hand-coin-line';
    case 'mvp':
      return 'ri-award-line';
    case 'captain':
      return 'ri-vip-crown-line';
    default:
      return 'ri-medal-line';
  }
}

/**
 * Get badge tooltip text based on badge type
 */
export function getBadgeTooltip(badgeType: string): string {
  switch (badgeType) {
    case 'goldenBoot':
      return 'Golden Boot - Top Goal Scorer';
    case 'playmaker':
      return 'Playmaker - Most Assists';
    case 'cleanSheetKing':
      return 'Clean Sheet King - Most Clean Sheets';
    case 'ironDefense':
      return 'Iron Defense - Most Tackles';
    case 'safeHands':
      return 'Safe Hands - Most Saves';
    case 'mvp':
      return 'MVP - Most Valuable Player';
    case 'captain':
      return 'Captain';
    default:
      return 'Achievement';
  }
}

/**
 * Get minimum number of players needed for a specific format
 */
export function getMinimumPlayers(format: string): number {
  switch (format) {
    case '5-a-side':
      return 10; // 5 players per team, 2 teams
    case '7-a-side':
      return 14; // 7 players per team, 2 teams
    case '11-a-side':
      return 22; // 11 players per team, 2 teams
    default:
      return 10;
  }
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Format time for display
 */
export function formatTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Format date and time for display
 */
export function formatDateTime(date: Date | string): string {
  return `${formatDate(date)} at ${formatTime(date)}`;
}
