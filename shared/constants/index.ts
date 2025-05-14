// Shared constants

// Player positions
export const PLAYER_POSITIONS = [
  'Goalkeeper',
  'Defender',
  'Midfielder',
  'Forward'
] as const;

// Tournament formats
export const TOURNAMENT_FORMATS = [
  '5-a-side',
  '7-a-side',
  '11-a-side'
] as const;

// Tournament statuses
export const TOURNAMENT_STATUSES = [
  'active',
  'completed'
] as const;

// Fixture statuses
export const FIXTURE_STATUSES = [
  'scheduled',
  'in_progress',
  'completed',
  'cancelled'
] as const;

// Team balancing methods
export const TEAM_BALANCING_METHODS = [
  'skill',
  'position',
  'mixed'
] as const;

// User roles
export const USER_ROLES = [
  'admin',
  'exco'
] as const;

// Badge types
export const BADGE_TYPES = [
  'goldenBoot',
  'playmaker',
  'cleanSheetKing',
  'ironDefense',
  'safeHands',
  'mvp',
  'captain'
] as const;

// Leaderboard categories
export const LEADERBOARD_CATEGORIES = [
  'goals',
  'assists',
  'cleanSheets',
  'tackles',
  'saves'
] as const;
