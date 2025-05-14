// Re-export shared types
export * from '@shared/types';

// Client-specific types

/**
 * Form values for player form
 */
export interface PlayerFormValues {
  name: string;
  position: string;
  jerseyNumber: number;
  photoUrl?: string;
  stats: {
    goals: number;
    assists: number;
    cleanSheets: number;
    tackles: number;
    saves: number;
    gamesPlayed: number;
    skillRating: number;
  };
}

/**
 * Form values for tournament form
 */
export interface TournamentFormValues {
  name: string;
  status: string;
  startDate: Date;
  endDate: Date;
  description?: string;
  format: string;
}

/**
 * Form values for fixture form
 */
export interface FixtureFormValues {
  tournamentId: number;
  homeTeamId: number;
  awayTeamId: number;
  date: Date;
  location: string;
  status: string;
}

/**
 * Form values for match result form
 */
export interface MatchResultFormValues {
  fixtureId: string;
  homeTeamScore: number;
  awayTeamScore: number;
  scorers?: {
    playerId: string;
    goals: number;
  }[];
}

/**
 * Form values for team generator form
 */
export interface TeamGeneratorFormValues {
  format: string;
  playerIds: number[];
  balanceMethod: string;
  teamsCount: number;
  considerHistory: boolean;
  competitionMode: boolean;
}

/**
 * Form values for login form
 */
export interface LoginFormValues {
  username: string;
  password: string;
}

/**
 * Form values for contact form
 */
export interface ContactFormValues {
  name: string;
  email: string;
  phone?: string;
  message: string;
  joinClub: boolean;
}

/**
 * Leaderboard category
 */
export type LeaderboardCategory = 'goals' | 'assists' | 'cleanSheets' | 'tackles' | 'saves';
