import { MemStorage } from './storage';
import { TeamGenerationRequest, GeneratedTeam } from '@shared/schema';

// Extend the MemStorage class to add the team generator implementation
export class MemStorageImpl extends MemStorage {
  private static instance: MemStorageImpl;

  private tournaments: Map<number, Tournament>;
  private tournamentTeams: Map<number, TournamentTeam[]>;
  private tournamentId: number;
  private teamId: number;

  constructor() {
    super();

    // Singleton pattern to ensure we don't reset the storage
    if (MemStorageImpl.instance) {
      return MemStorageImpl.instance;
    }

    // Initialize maps
    this.users = new Map();
    this.players = new Map();
    this.tournaments = new Map();
    this.tournamentTeams = new Map();
    this.fixtures = new Map();
    this.matchResults = new Map();

    // Initialize IDs
    this.userId = 2;
    this.tournamentId = 1;
    this.teamId = 1;
    this.playerId = 1;

    // Create the admin user with fixed ID 1
    const adminUser = {
      username: "admin",
      password: "password123", // Keep as plaintext for direct comparison
      role: "admin" as const,
      id: 1,
      createdAt: new Date()
    };

    // Set the admin user directly in the map
    this.users.set(adminUser.id, adminUser);
    console.log("Admin user created with plaintext password");

    // Seed some initial data for development
    this.seedData();

    // Set the instance AFTER all initialization is complete
    MemStorageImpl.instance = this;
  }

  // Override createUser to ensure we never overwrite admin
  async createUser(insertUser: InsertUser): Promise<User> {
    // If trying to create an admin, reject
    if (insertUser.role === "admin") {
      throw new Error("Cannot create additional admin users");
    }

    // Get next available ID (skip 1 as it's reserved for admin)
    const id = this.userId++;

    const user: User = {
      ...insertUser,
      id,
      createdAt: new Date(),
      role: "exco" // Force role to be exco
    };

    this.users.set(id, user);
    return user;
  }

  // Override getUserByUsername to ensure case-insensitive comparison
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      user => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  // Generate teams
  async generateTeams(request: TeamGenerationRequest): Promise<GeneratedTeam[]> {
    const { format, playerIds, balanceMethod, teamsCount, considerHistory, competitionMode } = request;

    // Get selected players and calculate their metrics
    const selectedPlayers = playerIds.map(id => {
      const player = this.players.get(id);
      if (!player) throw new Error(`Player with ID ${id} not found`);
      return {
        ...player,
        metrics: this.calculatePlayerMetrics(player)
      };
    });

    // Determine team size based on format
    const teamSize = format === '11-a-side' ? 11 : format === '7-a-side' ? 7 : 5;

    // Initialize teams
    const teams: GeneratedTeam[] = Array(teamsCount).fill(null).map((_, i) => ({
      name: `Team ${i + 1}`,
      players: [],
      totalSkill: 0,
      matchHistory: [],
      averageWinRate: 0,
      positionBalance: 0
    }));

    // Sort players by position and skill
    const sortedPlayers = [...selectedPlayers].sort((a, b) => {
      if (balanceMethod === 'position') {
        return a.position.localeCompare(b.position) ||
               (b.metrics?.positionStrength || 0) - (a.metrics?.positionStrength || 0);
      }
      return (b.metrics?.skillRating || 0) - (a.metrics?.skillRating || 0);
    });

    // Distribute players to teams
    sortedPlayers.forEach((player, index) => {
      const teamIndex = index % teamsCount;
      teams[teamIndex].players.push(player);
      teams[teamIndex].totalSkill += player.stats.skillRating;
    });

    // Balance teams based on selected method
    if (balanceMethod === 'skill' || balanceMethod === 'mixed') {
      this.balanceTeamsByMetric(teams, 'skillRating');
    }
    if (balanceMethod === 'position' || balanceMethod === 'mixed') {
      this.balanceTeamsByMetric(teams, 'positionStrength');
    }
    if (considerHistory) {
      this.balanceTeamsByMetric(teams, 'winRate');
    }

    // Calculate final metrics for each team
    teams.forEach(team => {
      team.averageWinRate = team.players.reduce((sum, p) => sum + (p.metrics?.winRate || 50), 0) / team.players.length;
      team.positionBalance = this.calculatePositionBalance(team.players);
    });

    // Assign captains if in competition mode
    if (competitionMode) {
      this.assignCaptains(teams);
    }

    return teams;
  }

  // Helper methods for team generation
  private calculatePlayerMetrics(player: Player): PlayerMetrics {
    const stats = player.stats;
    const gamesPlayed = stats.gamesPlayed || 1;

    // Calculate win rate
    const totalGames = (stats.teamWins || 0) + (stats.teamLosses || 0) + (stats.teamDraws || 0);
    const winRate = totalGames > 0 ? ((stats.teamWins || 0) / totalGames) * 100 : 50;

    // Calculate form rating based on recent performance
    const formRating = stats.formRating || stats.skillRating;

    // Calculate position-specific rating
    const positionStrength = stats.positionRating || stats.skillRating;

    return {
      winRate,
      formRating,
      skillRating: stats.skillRating,
      positionStrength
    };
  }

  private balanceTeamsByMetric(teams: GeneratedTeam[], metric: keyof PlayerMetrics): void {
    let maxDiff = 0;
    do {
      const teamMetrics = teams.map(team => {
        const avgMetric = team.players.reduce((sum, p) => sum + (p.metrics?.[metric] || 0), 0) / team.players.length;
        return { team, avgMetric };
      });

      const maxTeam = teamMetrics.reduce((max, curr) => curr.avgMetric > max.avgMetric ? curr : max);
      const minTeam = teamMetrics.reduce((min, curr) => curr.avgMetric < min.avgMetric ? curr : min);
      maxDiff = maxTeam.avgMetric - minTeam.avgMetric;

      if (maxDiff > 20) {
        // Swap players to balance teams
        const strongPlayer = maxTeam.team.players.reduce((max, p) =>
          (p.metrics?.[metric] || 0) > (max.metrics?.[metric] || 0) ? p : max
        );
        const weakPlayer = minTeam.team.players.reduce((min, p) =>
          (p.metrics?.[metric] || 0) < (min.metrics?.[metric] || 0) ? p : min
        );

        // Swap players if they play similar positions
        if (strongPlayer.position === weakPlayer.position) {
          const strongIndex = maxTeam.team.players.indexOf(strongPlayer);
          const weakIndex = minTeam.team.players.indexOf(weakPlayer);
          maxTeam.team.players[strongIndex] = weakPlayer;
          minTeam.team.players[weakIndex] = strongPlayer;
        }
      }
    } while (maxDiff > 20);
  }

  private assignCaptains(teams: GeneratedTeam[]): void {
    teams.forEach(team => {
      // Choose captain based on experience and form
      team.captain = team.players.reduce((bestCandidate, player) => {
        const candidateScore = (player.stats.gamesPlayed * 0.4) +
                              ((player.metrics?.formRating || 0) * 0.3) +
                              (player.stats.skillRating * 0.3);
        const bestScore = (bestCandidate.stats.gamesPlayed * 0.4) +
                         ((bestCandidate.metrics?.formRating || 0) * 0.3) +
                         (bestCandidate.stats.skillRating * 0.3);
        return candidateScore > bestScore ? player : bestCandidate;
      }, team.players[0]);
    });
  }

  private calculatePositionBalance(players: Player[]): number {
    const positions = players.reduce((acc, p) => {
      acc[p.position] = (acc[p.position] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate balance score (0-100) based on position distribution
    const idealDistribution = {
      'Goalkeeper': 0.1,
      'Defender': 0.3,
      'Midfielder': 0.4,
      'Forward': 0.2
    };

    let balanceScore = 100;
    Object.entries(idealDistribution).forEach(([pos, ideal]) => {
      const actual = (positions[pos] || 0) / players.length;
      balanceScore -= Math.abs(ideal - actual) * 100;
    });

    return Math.max(0, balanceScore);
  }

  // Seed data for development
  async seedData() {
    // Create some players
    const players = [
      {
        name: "Jamal Okoye",
        position: "Forward",
        jerseyNumber: 9,
        photoUrl: "https://randomuser.me/api/portraits/men/1.jpg",
        stats: {
          goals: 12,
          assists: 5,
          cleanSheets: 0,
          tackles: 0,
          saves: 0,
          gamesPlayed: 18,
          skillRating: 4
        },
        badges: ["goldenBoot"]
      },
      {
        name: "Kwame Nduka",
        position: "Midfielder",
        jerseyNumber: 10,
        photoUrl: "https://randomuser.me/api/portraits/men/2.jpg",
        stats: {
          goals: 5,
          assists: 10,
          cleanSheets: 0,
          tackles: 15,
          saves: 0,
          gamesPlayed: 20,
          skillRating: 5
        },
        badges: ["playmaker"]
      },
      {
        name: "Tunde Chukwu",
        position: "Goalkeeper",
        jerseyNumber: 1,
        photoUrl: "https://randomuser.me/api/portraits/men/3.jpg",
        stats: {
          goals: 0,
          assists: 0,
          cleanSheets: 8,
          tackles: 0,
          saves: 45,
          gamesPlayed: 15,
          skillRating: 4
        },
        badges: ["cleanSheetKing"]
      },
      {
        name: "Emeka Obi",
        position: "Defender",
        jerseyNumber: 4,
        photoUrl: "https://randomuser.me/api/portraits/men/4.jpg",
        stats: {
          goals: 1,
          assists: 2,
          cleanSheets: 0,
          tackles: 30,
          saves: 0,
          gamesPlayed: 18,
          skillRating: 4
        },
        badges: ["ironDefense"]
      },
      {
        name: "Chidi Eze",
        position: "Forward",
        jerseyNumber: 11,
        photoUrl: "https://randomuser.me/api/portraits/men/5.jpg",
        stats: {
          goals: 8,
          assists: 3,
          cleanSheets: 0,
          tackles: 0,
          saves: 0,
          gamesPlayed: 16,
          skillRating: 3
        }
      }
    ];

    // Create players and store their IDs
    const createdPlayers = [];
    for (const player of players) {
      const createdPlayer = await this.createPlayer(player as any);
      createdPlayers.push(createdPlayer);
    }

    // Create a tournament
    const tournament = await this.createTournament({
      name: "Summer Tournament",
      startDate: new Date("2024-06-01").toISOString(),
      endDate: new Date("2024-06-30").toISOString(),
      description: "Annual summer tournament",
      format: "5-a-side",
      maxTeams: 4,
      registrationDeadline: new Date("2024-05-25").toISOString()
    });

    // Create teams with proper player assignments
    const team1 = await this.createTournamentTeam({
      tournamentId: tournament.id,
      name: "Team Alpha",
      captainId: createdPlayers[0].id, // Jamal Okoye as captain
      playerIds: [createdPlayers[0].id, createdPlayers[2].id, createdPlayers[3].id] // First 3 players
    });

    const team2 = await this.createTournamentTeam({
      tournamentId: tournament.id,
      name: "Team Beta",
      captainId: createdPlayers[1].id, // Kwame Nduka as captain
      playerIds: [createdPlayers[1].id, createdPlayers[4].id] // Other 2 players
    });

    // Create fixtures
    await this.createFixture({
      tournamentId: tournament.id,
      homeTeamId: team1.id,
      awayTeamId: team2.id,
      homeTeamName: team1.name,
      awayTeamName: team2.name,
      homeTeamCaptain: "J. Okoye",
      awayTeamCaptain: "K. Nduka",
      homeTeamScore: 3,
      awayTeamScore: 1,
      date: new Date("2024-06-15T14:00:00"),
      location: "Main Pitch",
      status: "completed",
      tournamentName: tournament.name
    });

    await this.createFixture({
      tournamentId: tournament.id,
      homeTeamId: team2.id,
      awayTeamId: team1.id,
      homeTeamName: team2.name,
      awayTeamName: team1.name,
      homeTeamCaptain: "K. Nduka",
      awayTeamCaptain: "J. Okoye",
      homeTeamScore: 2,
      awayTeamScore: 2,
      date: new Date("2024-06-18T14:00:00"),
      location: "Main Pitch",
      status: "completed",
      tournamentName: tournament.name
    });

    // Create upcoming fixture
    await this.createFixture({
      tournamentId: tournament.id,
      homeTeamId: team1.id,
      awayTeamId: team2.id,
      homeTeamName: team1.name,
      awayTeamName: team2.name,
      homeTeamCaptain: "J. Okoye",
      awayTeamCaptain: "K. Nduka",
      date: new Date(Date.now() + 86400000), // Tomorrow
      location: "Main Pitch",
      status: "scheduled",
      tournamentName: tournament.name
    });
  }

  // Tournament methods
  async createTournament(data: CreateTournamentInput): Promise<Tournament> {
    const tournament: Tournament = {
      id: this.tournamentId++,
      ...data,
      status: 'upcoming',
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      registrationDeadline: new Date(data.registrationDeadline),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.tournaments.set(tournament.id, tournament);
    this.tournamentTeams.set(tournament.id, []);
    return tournament;
  }

  async getTournaments(): Promise<Tournament[]> {
    return Array.from(this.tournaments.values());
  }

  async getTournamentById(id: number): Promise<Tournament | null> {
    return this.tournaments.get(id) || null;
  }

  async createTournamentTeam(data: CreateTournamentTeamInput): Promise<TournamentTeam> {
    const tournament = this.tournaments.get(data.tournamentId);
    if (!tournament) {
      throw new Error('Tournament not found');
    }

    const captain = this.players.get(data.captainId);
    if (!captain) {
      throw new Error('Captain not found');
    }

    const players = data.playerIds.map(id => {
      const player = this.players.get(id);
      if (!player) throw new Error(`Player with ID ${id} not found`);
      return player;
    });

    if (!players.includes(captain)) {
      players.push(captain);
    }

    const team: TournamentTeam = {
      id: this.teamId++,
      tournamentId: tournament.id,
      name: data.name,
      captain,
      players,
      wins: 0,
      losses: 0,
      draws: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      points: 0,
      createdAt: new Date()
    };

    const tournamentTeams = this.tournamentTeams.get(tournament.id) || [];
    if (tournamentTeams.length >= tournament.maxTeams) {
      throw new Error('Maximum number of teams reached for this tournament');
    }

    tournamentTeams.push(team);
    this.tournamentTeams.set(tournament.id, tournamentTeams);
    return team;
  }

  async getTournamentTeams(tournamentId: number): Promise<TournamentTeam[]> {
    return this.tournamentTeams.get(tournamentId) || [];
  }

  async updateTournamentStatus(tournamentId: number, status: Tournament['status']): Promise<Tournament> {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) {
      throw new Error('Tournament not found');
    }

    tournament.status = status;
    tournament.updatedAt = new Date();
    this.tournaments.set(tournamentId, tournament);
    return tournament;
  }
}

// Create and export a singleton instance
export const storage = new MemStorageImpl();
