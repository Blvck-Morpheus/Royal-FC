import { format, formatDistance } from 'date-fns';

/**
 * Format a date for display
 * @param date Date to format
 * @param formatString Format string
 * @returns Formatted date string
 */
export function formatDate(date: Date | string | number, formatString: string = 'MMM d, yyyy'): string {
  if (!date) return '';
  return format(new Date(date), formatString);
}

/**
 * Format a time for display
 * @param date Date to format
 * @param formatString Format string
 * @returns Formatted time string
 */
export function formatTime(date: Date | string | number, formatString: string = 'h:mm a'): string {
  if (!date) return '';
  return format(new Date(date), formatString);
}

/**
 * Format a date and time for display
 * @param date Date to format
 * @returns Formatted date and time string
 */
export function formatDateTime(date: Date | string | number): string {
  if (!date) return '';
  return `${formatDate(date)} at ${formatTime(date)}`;
}

/**
 * Format a relative time (e.g., "2 days ago")
 * @param date Date to format
 * @returns Relative time string
 */
export function formatRelativeTime(date: Date | string | number): string {
  if (!date) return '';
  return formatDistance(new Date(date), new Date(), { addSuffix: true });
}

/**
 * Format a player position
 * @param position Player position
 * @returns Formatted position string
 */
export function formatPosition(position: string): string {
  switch (position) {
    case 'Goalkeeper':
      return 'GK';
    case 'Defender':
      return 'DEF';
    case 'Midfielder':
      return 'MID';
    case 'Forward':
      return 'FWD';
    default:
      return position;
  }
}

/**
 * Format a score
 * @param homeScore Home team score
 * @param awayScore Away team score
 * @returns Formatted score string
 */
export function formatScore(homeScore: number | null | undefined, awayScore: number | null | undefined): string {
  if (homeScore === null || homeScore === undefined || awayScore === null || awayScore === undefined) {
    return 'vs';
  }
  return `${homeScore} - ${awayScore}`;
}

/**
 * Format a tournament format
 * @param format Tournament format
 * @returns Formatted format string
 */
export function formatTournamentFormat(format: string): string {
  switch (format) {
    case '5-a-side':
      return '5v5';
    case '7-a-side':
      return '7v7';
    case '11-a-side':
      return '11v11';
    default:
      return format;
  }
}
