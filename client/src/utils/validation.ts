import { z } from 'zod';
import { PLAYER_POSITIONS, TOURNAMENT_FORMATS, TOURNAMENT_STATUSES, FIXTURE_STATUSES, TEAM_BALANCING_METHODS } from '@shared/constants';

/**
 * Player form validation schema
 */
export const playerFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  position: z.enum(PLAYER_POSITIONS as unknown as [string, ...string[]]),
  jerseyNumber: z.number().int().min(1, 'Jersey number must be at least 1'),
  photoUrl: z.string().optional(),
  stats: z.object({
    goals: z.number().int().min(0, 'Goals must be at least 0').default(0),
    assists: z.number().int().min(0, 'Assists must be at least 0').default(0),
    cleanSheets: z.number().int().min(0, 'Clean sheets must be at least 0').default(0),
    tackles: z.number().int().min(0, 'Tackles must be at least 0').default(0),
    saves: z.number().int().min(0, 'Saves must be at least 0').default(0),
    gamesPlayed: z.number().int().min(0, 'Games played must be at least 0').default(0),
    skillRating: z.number().int().min(1, 'Skill rating must be at least 1').max(5, 'Skill rating must be at most 5').default(3)
  }).default({})
});

/**
 * Tournament form validation schema
 */
export const tournamentFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  status: z.enum(TOURNAMENT_STATUSES as unknown as [string, ...string[]]).default('active'),
  startDate: z.date(),
  endDate: z.date(),
  description: z.string().optional(),
  format: z.enum(TOURNAMENT_FORMATS as unknown as [string, ...string[]])
}).refine(data => {
  return new Date(data.startDate) <= new Date(data.endDate);
}, {
  message: 'End date must be after start date',
  path: ['endDate']
});

/**
 * Fixture form validation schema
 */
export const fixtureFormSchema = z.object({
  tournamentId: z.number().int().positive('Tournament is required'),
  homeTeamId: z.number().int().positive('Home team is required'),
  awayTeamId: z.number().int().positive('Away team is required'),
  date: z.date(),
  location: z.string().min(1, 'Location is required'),
  status: z.enum(FIXTURE_STATUSES as unknown as [string, ...string[]]).default('scheduled')
}).refine(data => {
  return data.homeTeamId !== data.awayTeamId;
}, {
  message: 'Home team and away team must be different',
  path: ['awayTeamId']
});

/**
 * Match result form validation schema
 */
export const matchResultFormSchema = z.object({
  fixtureId: z.string().min(1, 'Fixture is required'),
  homeTeamScore: z.number().int().min(0, 'Score must be at least 0'),
  awayTeamScore: z.number().int().min(0, 'Score must be at least 0'),
  scorers: z.array(
    z.object({
      playerId: z.string().min(1, 'Player is required'),
      goals: z.number().int().min(1, 'Goals must be at least 1')
    })
  ).optional()
});

/**
 * Team generator form validation schema
 */
export const teamGeneratorFormSchema = z.object({
  format: z.enum(TOURNAMENT_FORMATS as unknown as [string, ...string[]]),
  playerIds: z.array(z.number().int().positive()).min(1, 'At least one player is required'),
  balanceMethod: z.enum(TEAM_BALANCING_METHODS as unknown as [string, ...string[]]).default('mixed'),
  teamsCount: z.number().int().min(2, 'At least 2 teams are required').max(4, 'At most 4 teams are allowed').default(2),
  considerHistory: z.boolean().default(true),
  competitionMode: z.boolean().default(true)
});

/**
 * Login form validation schema
 */
export const loginFormSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required')
});

/**
 * Contact form validation schema
 */
export const contactFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  message: z.string().min(1, 'Message is required'),
  joinClub: z.boolean().default(false)
});
