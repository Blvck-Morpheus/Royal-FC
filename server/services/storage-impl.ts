import { MemStorage } from './storage';
import { TeamGenerationRequest, GeneratedTeam, User, InsertUser, Player, PlayerMetrics, Tournament, TournamentTeam, CreateTournamentInput, CreateTournamentTeamInput } from '@shared/schema';
import { AuthService } from './authService';

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
    
    // Set the userId counter to start at 1
    this.userId = 1;

    // Seed some initial data for development
    this.seedData();
    
    // Set the instance AFTER all initialization is complete
    MemStorageImpl.instance = this;

    this.tournamentId = 1;
    this.teamId = 1;
  }

  // Override createUser to work with AuthService
  async createUser(insertUser: InsertUser): Promise<User> {
    // Get next available ID
    const id = this.userId++;
    
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date(),
      role: insertUser.role || "exco"
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
    // Your football hangout squad (26 players)
    const players = [
      { name: "Khalifa", position: "Goalkeeper", jerseyNumber: 1, stats: { goals: 0, assists: 0, cleanSheets: 0, tackles: 0, saves: 0, gamesPlayed: 0, skillRating: 3 } },
      { name: "IK", position: "Defender", jerseyNumber: 2, stats: { goals: 0, assists: 0, cleanSheets: 0, tackles: 0, saves: 0, gamesPlayed: 0, skillRating: 3 } },
      { name: "Happy", position: "Midfielder", jerseyNumber: 3, stats: { goals: 0, assists: 0, cleanSheets: 0, tackles: 0, saves: 0, gamesPlayed: 0, skillRating: 3 } },
      { name: "Uche", position: "Defender", jerseyNumber: 4, stats: { goals: 0, assists: 0, cleanSheets: 0, tackles: 0, saves: 0, gamesPlayed: 0, skillRating: 3 } },
      { name: "Ibori", position: "Midfielder", jerseyNumber: 5, stats: { goals: 0, assists: 0, cleanSheets: 0, tackles: 0, saves: 0, gamesPlayed: 0, skillRating: 3 } },
      { name: "Ifeanyi", position: "Midfielder", jerseyNumber: 6, stats: { goals: 0, assists: 0, cleanSheets: 0, tackles: 0, saves: 0, gamesPlayed: 0, skillRating: 3 } },
      { name: "Collins", position: "Defender", jerseyNumber: 7, stats: { goals: 0, assists: 0, cleanSheets: 0, tackles: 0, saves: 0, gamesPlayed: 0, skillRating: 3 } },
      { name: "Lamptey", position: "Midfielder", jerseyNumber: 8, stats: { goals: 0, assists: 0, cleanSheets: 0, tackles: 0, saves: 0, gamesPlayed: 0, skillRating: 3 } },
      { name: "Sureboy", position: "Goalkeeper", jerseyNumber: 12, stats: { goals: 0, assists: 0, cleanSheets: 0, tackles: 0, saves: 0, gamesPlayed: 0, skillRating: 3 } },
      { name: "Onose", position: "Defender", jerseyNumber: 13, stats: { goals: 0, assists: 0, cleanSheets: 0, tackles: 0, saves: 0, gamesPlayed: 0, skillRating: 3 } },
      { name: "Arnold", position: "Defender", jerseyNumber: 14, stats: { goals: 0, assists: 0, cleanSheets: 0, tackles: 0, saves: 0, gamesPlayed: 0, skillRating: 3 } },
      { name: "Onochie", position: "Midfielder", jerseyNumber: 15, stats: { goals: 0, assists: 0, cleanSheets: 0, tackles: 0, saves: 0, gamesPlayed: 0, skillRating: 3 } },
      { name: "Batshuayi", position: "Forward", jerseyNumber: 16, stats: { goals: 0, assists: 0, cleanSheets: 0, tackles: 0, saves: 0, gamesPlayed: 0, skillRating: 4 } },
      { name: "Simon", position: "Defender", jerseyNumber: 17, stats: { goals: 0, assists: 0, cleanSheets: 0, tackles: 0, saves: 0, gamesPlayed: 0, skillRating: 3 } },
      { name: "Shedrach", position: "Midfielder", jerseyNumber: 18, stats: { goals: 0, assists: 0, cleanSheets: 0, tackles: 0, saves: 0, gamesPlayed: 0, skillRating: 3 } },
      { name: "Iron Man", position: "Forward", jerseyNumber: 19, stats: { goals: 0, assists: 0, cleanSheets: 0, tackles: 0, saves: 0, gamesPlayed: 0, skillRating: 4 } },
      { name: "Successful", position: "Midfielder", jerseyNumber: 20, stats: { goals: 0, assists: 0, cleanSheets: 0, tackles: 0, saves: 0, gamesPlayed: 0, skillRating: 3 } },
      { name: "Messi", position: "Forward", jerseyNumber: 21, stats: { goals: 0, assists: 0, cleanSheets: 0, tackles: 0, saves: 0, gamesPlayed: 0, skillRating: 5 } },
      { name: "Solibe", position: "Midfielder", jerseyNumber: 22, stats: { goals: 0, assists: 0, cleanSheets: 0, tackles: 0, saves: 0, gamesPlayed: 0, skillRating: 3 } },
      { name: "Ugo", position: "Forward", jerseyNumber: 23, stats: { goals: 0, assists: 0, cleanSheets: 0, tackles: 0, saves: 0, gamesPlayed: 0, skillRating: 4 } },
      { name: "Arinze", position: "Defender", jerseyNumber: 24, stats: { goals: 0, assists: 0, cleanSheets: 0, tackles: 0, saves: 0, gamesPlayed: 0, skillRating: 3 } },
      { name: "Meshack", position: "Midfielder", jerseyNumber: 25, stats: { goals: 0, assists: 0, cleanSheets: 0, tackles: 0, saves: 0, gamesPlayed: 0, skillRating: 3 } },
      { name: "Sammy", position: "Forward", jerseyNumber: 26, stats: { goals: 0, assists: 0, cleanSheets: 0, tackles: 0, saves: 0, gamesPlayed: 0, skillRating: 4 } },
      { name: "Levino", position: "Midfielder", jerseyNumber: 27, stats: { goals: 0, assists: 0, cleanSheets: 0, tackles: 0, saves: 0, gamesPlayed: 0, skillRating: 3 } },
      { name: "Henry", position: "Defender", jerseyNumber: 28, stats: { goals: 0, assists: 0, cleanSheets: 0, tackles: 0, saves: 0, gamesPlayed: 0, skillRating: 3 } }
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
      name: data.name,
      description: data.description,
      format: data.format,
      maxTeams: data.maxTeams,
      status: 'active',
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      registrationDeadline: new Date(data.registrationDeadline),
      createdAt: new Date(),
      updatedAt: new Date(),
      teams: [],
      fixtures: []
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

  async getActiveTournaments(): Promise<Tournament[]> {
    return Array.from(this.tournaments.values()).filter(t => t.status === 'active');
  }

  async getPastTournaments(): Promise<Tournament[]> {
    return Array.from(this.tournaments.values()).filter(t => t.status === 'completed');
  }

  async getTournament(id: number): Promise<Tournament | null> {
    const tournament = this.tournaments.get(id);
    if (!tournament) return null;
    
    // Include teams and fixtures
    const teams = this.tournamentTeams.get(id) || [];
    const fixtures = Array.from(this.fixtures.values()).filter(f => f.tournamentId === id);
    
    return {
      ...tournament,
      teams,
      fixtures
    };
  }
}

// Create and export a singleton instance
export const storage = new MemStorageImpl();
