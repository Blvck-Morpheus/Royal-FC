import {
  User, InsertUser,
  Player, InsertPlayer,
  Tournament, InsertTournament,
  TournamentTeam, InsertTournamentTeam,
  Fixture, InsertFixture,
  MatchResult, InsertMatchResult,
  MatchResultFormData,
  TeamGenerationRequest,
  GeneratedTeam,
  ContactFormData
} from "@shared/schema";

// Storage interface
export interface IStorage {
  // User (Admin) methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsers(): Promise<User[]>;
  deleteUser(id: number): Promise<boolean>;

  // Player methods
  getPlayer(id: number): Promise<Player | undefined>;
  getPlayers(): Promise<Player[]>;
  getPlayersByIds(ids: number[]): Promise<Player[]>;
  getPlayersByPosition(position: string): Promise<Player[]>;
  createPlayer(player: InsertPlayer): Promise<Player>;
  updatePlayer(id: number, player: Partial<Player>): Promise<Player | undefined>;
  deletePlayer(id: number): Promise<boolean>;
  saveRoster(players: Player[]): Promise<void>;

  // Tournament methods
  getTournament(id: number): Promise<Tournament | undefined>;
  getTournaments(): Promise<Tournament[]>;
  getActiveTournaments(): Promise<Tournament[]>;
  getPastTournaments(): Promise<Tournament[]>;
  createTournament(tournament: InsertTournament): Promise<Tournament>;
  updateTournament(id: number, tournament: Partial<Tournament>): Promise<Tournament | undefined>;
  deleteTournament(id: number): Promise<boolean>;

  // Tournament Team methods
  getTournamentTeam(id: number): Promise<TournamentTeam | undefined>;
  getTournamentTeamsByTournament(tournamentId: number): Promise<TournamentTeam[]>;
  createTournamentTeam(team: InsertTournamentTeam): Promise<TournamentTeam>;
  updateTournamentTeam(id: number, team: Partial<TournamentTeam>): Promise<TournamentTeam | undefined>;

  // Fixture methods
  getFixture(id: number): Promise<Fixture | undefined>;
  getFixtures(): Promise<Fixture[]>;
  getFixturesByTournament(tournamentId: number): Promise<Fixture[]>;
  getUpcomingFixtures(): Promise<Fixture[]>;
  getActiveFixtures(): Promise<Fixture[]>;
  createFixture(fixture: InsertFixture): Promise<Fixture>;
  updateFixture(id: number, fixture: Partial<Fixture>): Promise<Fixture | undefined>;

  // Match Result methods
  getMatchResult(id: number): Promise<MatchResult | undefined>;
  getMatchResultsByFixture(fixtureId: number): Promise<MatchResult[]>;
  getMatchResultsByPlayer(playerId: number): Promise<MatchResult[]>;
  createMatchResult(result: InsertMatchResult): Promise<MatchResult>;

  // Special methods for business logic
  recordMatchResult(data: MatchResultFormData): Promise<boolean>;
  generateTeams(data: TeamGenerationRequest): Promise<GeneratedTeam[]>;
  getLeaderboard(category: string): Promise<Player[]>;
  saveContactForm(data: ContactFormData): Promise<boolean>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private players: Map<number, Player>;
  private tournaments: Map<number, Tournament>;
  private tournamentTeams: Map<number, TournamentTeam>;
  private fixtures: Map<number, Fixture>;
  private matchResults: Map<number, MatchResult>;

  private userId: number = 1;
  private playerId: number = 1;
  private tournamentId: number = 1;
  private teamId: number = 1;
  private fixtureId: number = 1;
  private matchResultId: number = 1;

  constructor() {
    this.users = new Map();
    this.players = new Map();
    this.tournaments = new Map();
    this.tournamentTeams = new Map();
    this.fixtures = new Map();
    this.matchResults = new Map();

    // Remove admin user creation from here since it's handled in the implementation

    // Seed some initial data for development
    this.seedData();
  }

  // User (Admin) methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      user => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
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

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Player methods
  async getPlayer(id: number): Promise<Player | undefined> {
    return this.players.get(id);
  }

  async getPlayers(): Promise<Player[]> {
    return Array.from(this.players.values());
  }

  async getPlayersByIds(ids: number[]): Promise<Player[]> {
    return Array.from(this.players.values()).filter(player => ids.includes(player.id));
  }

  async getPlayersByPosition(position: string): Promise<Player[]> {
    return Array.from(this.players.values()).filter(
      player => player.position.toLowerCase() === position.toLowerCase()
    );
  }

  async createPlayer(player: InsertPlayer): Promise<Player> {
    const id = this.playerId++;
    const newPlayer: Player = {
      ...player,
      id,
      badges: [],
      createdAt: new Date()
    };
    this.players.set(id, newPlayer);
    return newPlayer;
  }

  async updatePlayer(id: number, playerUpdate: Partial<Player>): Promise<Player | undefined> {
    const player = this.players.get(id);
    if (!player) return undefined;

    const updatedPlayer: Player = { ...player, ...playerUpdate };
    this.players.set(id, updatedPlayer);
    return updatedPlayer;
  }

  async deletePlayer(id: number): Promise<boolean> {
    return this.players.delete(id);
  }

  async saveRoster(players: Player[]): Promise<void> {
    // Clear existing players
    this.players.clear();

    // Add all players from the roster
    for (const player of players) {
      this.players.set(player.id, player);
    }

    // Update the playerId counter to be greater than the highest ID
    const maxId = Math.max(...players.map(p => p.id), 0);
    this.playerId = maxId + 1;
  }

  // Tournament methods
  async getTournament(id: number): Promise<Tournament | undefined> {
    const tournament = this.tournaments.get(id);
    if (!tournament) return undefined;

    // Add teams and fixtures to tournament
    const teams = await this.getTournamentTeamsByTournament(id);
    const tournamentFixtures = await this.getFixturesByTournament(id);

    return {
      ...tournament,
      teams,
      fixtures: tournamentFixtures
    };
  }

  async getTournaments(): Promise<Tournament[]> {
    const tournaments = Array.from(this.tournaments.values());

    // Add teams and fixtures to each tournament
    return Promise.all(tournaments.map(async tournament => {
      const teams = await this.getTournamentTeamsByTournament(tournament.id);
      const fixtures = await this.getFixturesByTournament(tournament.id);
      return {
        ...tournament,
        teams,
        fixtures
      };
    }));
  }

  async getActiveTournaments(): Promise<Tournament[]> {
    const tournaments = await this.getTournaments();
    return tournaments.filter(t => t.status === "active");
  }

  async getPastTournaments(): Promise<Tournament[]> {
    const tournaments = await this.getTournaments();
    return tournaments.filter(t => t.status === "completed");
  }

  async createTournament(tournament: InsertTournament): Promise<Tournament> {
    const id = this.tournamentId++;
    const newTournament: Tournament = {
      ...tournament,
      id,
      createdAt: new Date(),
      teams: [],
      fixtures: []
    };
    this.tournaments.set(id, newTournament);
    return newTournament;
  }

  async updateTournament(id: number, tournamentUpdate: Partial<Tournament>): Promise<Tournament | undefined> {
    const tournament = await this.getTournament(id);
    if (!tournament) return undefined;

    // Exclude teams and fixtures from the update
    const { teams, fixtures, ...tournamentData } = tournament;
    const { teams: _, fixtures: __, ...updateData } = tournamentUpdate as any;

    const updatedTournament: Tournament = {
      ...tournamentData,
      ...updateData,
      teams,
      fixtures
    };

    this.tournaments.set(id, updatedTournament);
    return updatedTournament;
  }

  async deleteTournament(id: number): Promise<boolean> {
    return this.tournaments.delete(id);
  }

  // Tournament Team methods
  async getTournamentTeam(id: number): Promise<TournamentTeam | undefined> {
    return this.tournamentTeams.get(id);
  }

  async getTournamentTeamsByTournament(tournamentId: number): Promise<TournamentTeam[]> {
    return Array.from(this.tournamentTeams.values()).filter(
      team => team.tournamentId === tournamentId
    );
  }

  async createTournamentTeam(team: InsertTournamentTeam): Promise<TournamentTeam> {
    const id = this.teamId++;
    const newTeam: TournamentTeam = {
      ...team,
      id,
      createdAt: new Date()
    };
    this.tournamentTeams.set(id, newTeam);
    return newTeam;
  }

  async updateTournamentTeam(id: number, teamUpdate: Partial<TournamentTeam>): Promise<TournamentTeam | undefined> {
    const team = this.tournamentTeams.get(id);
    if (!team) return undefined;

    const updatedTeam: TournamentTeam = { ...team, ...teamUpdate };
    this.tournamentTeams.set(id, updatedTeam);
    return updatedTeam;
  }

  // Fixture methods
  async getFixture(id: number): Promise<Fixture | undefined> {
    return this.fixtures.get(id);
  }

  async getFixtures(): Promise<Fixture[]> {
    return Array.from(this.fixtures.values());
  }

  async getFixturesByTournament(tournamentId: number): Promise<Fixture[]> {
    return Array.from(this.fixtures.values()).filter(
      fixture => fixture.tournamentId === tournamentId
    );
  }

  async getUpcomingFixtures(): Promise<Fixture[]> {
    const now = new Date();
    return Array.from(this.fixtures.values())
      .filter(fixture =>
        new Date(fixture.date) > now &&
        fixture.status === "scheduled"
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3); // Get next 3 fixtures
  }

  async getActiveFixtures(): Promise<Fixture[]> {
    return Array.from(this.fixtures.values())
      .filter(fixture => fixture.status === "in_progress")
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  async createFixture(fixture: InsertFixture): Promise<Fixture> {
    const id = this.fixtureId++;
    const newFixture: Fixture = {
      ...fixture,
      id,
      createdAt: new Date()
    };
    this.fixtures.set(id, newFixture);
    return newFixture;
  }

  async updateFixture(id: number, fixtureUpdate: Partial<Fixture>): Promise<Fixture | undefined> {
    const fixture = this.fixtures.get(id);
    if (!fixture) return undefined;

    const updatedFixture: Fixture = { ...fixture, ...fixtureUpdate };
    this.fixtures.set(id, updatedFixture);
    return updatedFixture;
  }

  // Match Result methods
  async getMatchResult(id: number): Promise<MatchResult | undefined> {
    return this.matchResults.get(id);
  }

  async getMatchResultsByFixture(fixtureId: number): Promise<MatchResult[]> {
    return Array.from(this.matchResults.values()).filter(
      result => result.fixtureId === fixtureId
    );
  }

  async getMatchResultsByPlayer(playerId: number): Promise<MatchResult[]> {
    return Array.from(this.matchResults.values()).filter(
      result => result.playerId === playerId
    );
  }

  async createMatchResult(result: InsertMatchResult): Promise<MatchResult> {
    const id = this.matchResultId++;
    const newResult: MatchResult = {
      ...result,
      id,
      createdAt: new Date()
    };
    this.matchResults.set(id, newResult);
    return newResult;
  }

  // Special methods for business logic
  async recordMatchResult(data: MatchResultFormData): Promise<boolean> {
    try {
      const fixtureId = parseInt(data.fixtureId);
      const fixture = await this.getFixture(fixtureId);
      if (!fixture) return false;

      // Update fixture with scores
      await this.updateFixture(fixtureId, {
        homeTeamScore: data.homeTeamScore,
        awayTeamScore: data.awayTeamScore,
        status: "completed"
      });

      // Find the teams
      const homeTeam = await this.getTournamentTeam(fixture.homeTeamId);
      const awayTeam = await this.getTournamentTeam(fixture.awayTeamId);

      if (homeTeam && awayTeam) {
        // Update team stats
        const homeUpdate: Partial<TournamentTeam> = {
          played: homeTeam.played + 1,
          goalsFor: homeTeam.goalsFor + data.homeTeamScore,
          goalsAgainst: homeTeam.goalsAgainst + data.awayTeamScore
        };

        const awayUpdate: Partial<TournamentTeam> = {
          played: awayTeam.played + 1,
          goalsFor: awayTeam.goalsFor + data.awayTeamScore,
          goalsAgainst: awayTeam.goalsAgainst + data.homeTeamScore
        };

        if (data.homeTeamScore > data.awayTeamScore) {
          // Home team wins
          homeUpdate.won = homeTeam.won + 1;
          homeUpdate.points = homeTeam.points + 3;
          awayUpdate.lost = awayTeam.lost + 1;
        } else if (data.awayTeamScore > data.homeTeamScore) {
          // Away team wins
          awayUpdate.won = awayTeam.won + 1;
          awayUpdate.points = awayTeam.points + 3;
          homeUpdate.lost = homeTeam.lost + 1;
        } else {
          // Draw
          homeUpdate.drawn = homeTeam.drawn + 1;
          homeUpdate.points = homeTeam.points + 1;
          awayUpdate.drawn = awayTeam.drawn + 1;
          awayUpdate.points = awayTeam.points + 1;
        }

        await this.updateTournamentTeam(homeTeam.id, homeUpdate);
        await this.updateTournamentTeam(awayTeam.id, awayUpdate);
      }

      // Record player stats
      if (data.scorers && data.scorers.length > 0) {
        for (const scorer of data.scorers) {
          if (!scorer.playerId) continue;

          const playerId = parseInt(scorer.playerId);
          const player = await this.getPlayer(playerId);
          if (!player) continue;

          // Update player stats
          const stats = { ...player.stats };
          stats.goals = (stats.goals || 0) + scorer.goals;
          stats.gamesPlayed = (stats.gamesPlayed || 0) + 1;

          await this.updatePlayer(playerId, { stats });

          // Record match result
          await this.createMatchResult({
            fixtureId,
            playerId,
            goals: scorer.goals,
            assists: 0,
            cleanSheet: false,
            tackles: 0,
            saves: 0
          });
        }
      }

      return true;
    } catch (error) {
      console.error("Error recording match result:", error);
      return false;
    }
  }

  // Implementation of other methods will be added in the next file due to size limitations

  // Seed data for development
  private async seedData() {
    // This will be implemented in a separate file
  }

  // Get leaderboard
  async getLeaderboard(category: string = "goals"): Promise<Player[]> {
    const players = await this.getPlayers();

    // Sort players based on the requested category
    return players.sort((a, b) => {
      const aStats = a.stats as any || {};
      const bStats = b.stats as any || {};

      // Get values for the requested category
      let aValue = 0;
      let bValue = 0;

      switch (category) {
        case "goals":
          aValue = aStats.goals || 0;
          bValue = bStats.goals || 0;
          break;
        case "assists":
          aValue = aStats.assists || 0;
          bValue = bStats.assists || 0;
          break;
        case "cleanSheets":
          aValue = aStats.cleanSheets || 0;
          bValue = bStats.cleanSheets || 0;
          break;
        case "tackles":
          aValue = aStats.tackles || 0;
          bValue = bStats.tackles || 0;
          break;
        case "saves":
          aValue = aStats.saves || 0;
          bValue = bStats.saves || 0;
          break;
      }

      // Sort by category value (descending)
      return bValue - aValue;
    });
  }

  // Save contact form
  async saveContactForm(data: ContactFormData): Promise<boolean> {
    // In a real app, we would save this to a database
    console.log("Contact form submitted:", data);
    return true;
  }
}
