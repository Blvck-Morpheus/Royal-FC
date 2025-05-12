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

  // Player methods
  getPlayer(id: number): Promise<Player | undefined>;
  getPlayers(): Promise<Player[]>;
  getPlayersByIds(ids: number[]): Promise<Player[]>;
  getPlayersByPosition(position: string): Promise<Player[]>;
  createPlayer(player: InsertPlayer): Promise<Player>;
  updatePlayer(id: number, player: Partial<Player>): Promise<Player | undefined>;

  // Tournament methods
  getTournament(id: number): Promise<Tournament | undefined>;
  getTournaments(): Promise<Tournament[]>;
  getActiveTournaments(): Promise<Tournament[]>;
  getPastTournaments(): Promise<Tournament[]>;
  createTournament(tournament: InsertTournament): Promise<Tournament>;
  updateTournament(id: number, tournament: Partial<Tournament>): Promise<Tournament | undefined>;

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
    
    // Seed admin user
    this.createUser({
      username: "admin",
      password: "password123" // In a real app, we'd use bcrypt here
    });

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
  
  async generateTeams(data: TeamGenerationRequest): Promise<GeneratedTeam[]> {
    try {
      const players = await this.getPlayersByIds(data.playerIds);
      if (!players.length) return [];
      
      // Determine how many players per team
      let playersPerTeam: number;
      switch (data.format) {
        case "5-a-side": playersPerTeam = 5; break;
        case "7-a-side": playersPerTeam = 7; break;
        case "11-a-side": playersPerTeam = 11; break;
        default: playersPerTeam = 5;
      }
      
      // Calculate number of teams
      const teamsCount = data.teamsCount || 2;
      const minPlayersNeeded = teamsCount * Math.ceil(playersPerTeam * 0.8); // Allow for slightly smaller teams
      
      if (players.length < minPlayersNeeded) {
        // Not enough players for the requested number of teams
        return [];
      }
      
      // Initialize teams with names
      const teamNames = [
        "Team Blue", "Team Gold", "Team Red", "Team Green", 
        "Team Black", "Team White", "Team Purple", "Team Orange"
      ];
      
      const teams: GeneratedTeam[] = [];
      for (let i = 0; i < teamsCount; i++) {
        teams.push({
          name: teamNames[i] || `Team ${i+1}`,
          players: [],
          totalSkill: 0,
          matchHistory: []
        });
      }
      
      // Different balancing methods
      if (data.balanceMethod === "skill") {
        // Sort players by skill
        const sortedPlayers = [...players].sort((a, b) => {
          const aSkill = (a.stats as any)?.skillRating || 3;
          const bSkill = (b.stats as any)?.skillRating || 3;
          return bSkill - aSkill; // Highest skill first
        });
        
        // Distribute in snake draft order to balance skills
        // 0,1,2,3,3,2,1,0,0,1,2...
        let teamIndex = 0;
        let direction = 1;
        for (const player of sortedPlayers) {
          teams[teamIndex].players.push(player);
          teams[teamIndex].totalSkill = (teams[teamIndex].totalSkill || 0) + 
                                        ((player.stats as any)?.skillRating || 3);
          
          teamIndex += direction;
          
          // Change direction at the ends
          if (teamIndex >= teams.length - 1) direction = -1;
          if (teamIndex <= 0) direction = 1;
        }
      } 
      else if (data.balanceMethod === "position") {
        // Similar to the original algorithm but with multiple teams
        const goalkeepers = players.filter(p => p.position === "Goalkeeper");
        const defenders = players.filter(p => p.position === "Defender");
        const midfielders = players.filter(p => p.position === "Midfielder");
        const forwards = players.filter(p => p.position === "Forward");
        
        // Distribute goalkeepers
        if (goalkeepers.length >= teams.length) {
          // One goalkeeper per team if possible
          for (let i = 0; i < teams.length; i++) {
            teams[i].players.push(goalkeepers[i]);
            teams[i].totalSkill = (teams[i].totalSkill || 0) + 
                                   ((goalkeepers[i].stats as any)?.skillRating || 3);
          }
        } else {
          // Not enough goalkeepers, distribute what we have
          goalkeepers.forEach((gk, i) => {
            teams[i % teams.length].players.push(gk);
            teams[i % teams.length].totalSkill = (teams[i % teams.length].totalSkill || 0) + 
                                                ((gk.stats as any)?.skillRating || 3);
          });
        }
        
        // Helper to distribute players by position
        const distributePositionPlayers = (posPlayers: Player[]) => {
          // Shuffle position players for fairness
          const shuffled = [...posPlayers].sort(() => Math.random() - 0.5);
          
          for (const player of shuffled) {
            // Find team with fewest players
            const targetTeam = teams
              .sort((a, b) => a.players.length - b.players.length)[0];
            
            targetTeam.players.push(player);
            targetTeam.totalSkill = (targetTeam.totalSkill || 0) + 
                                   ((player.stats as any)?.skillRating || 3);
          }
        };
        
        distributePositionPlayers(defenders);
        distributePositionPlayers(midfielders);
        distributePositionPlayers(forwards);
      }
      else {
        // Mixed method (default) - balance both skill and position
        // First separate by position
        const positionGroups = {
          "Goalkeeper": players.filter(p => p.position === "Goalkeeper"),
          "Defender": players.filter(p => p.position === "Defender"),
          "Midfielder": players.filter(p => p.position === "Midfielder"),
          "Forward": players.filter(p => p.position === "Forward")
        };
        
        // Sort each position group by skill
        Object.keys(positionGroups).forEach(pos => {
          positionGroups[pos as keyof typeof positionGroups].sort((a, b) => {
            const aSkill = (a.stats as any)?.skillRating || 3;
            const bSkill = (b.stats as any)?.skillRating || 3;
            return bSkill - aSkill; // Highest skill first
          });
        });
        
        // Distribute in snake pattern within each position group
        Object.keys(positionGroups).forEach(pos => {
          let teamIndex = 0;
          let direction = 1;
          
          for (const player of positionGroups[pos as keyof typeof positionGroups]) {
            teams[teamIndex].players.push(player);
            teams[teamIndex].totalSkill = (teams[teamIndex].totalSkill || 0) + 
                                         ((player.stats as any)?.skillRating || 3);
            
            teamIndex += direction;
            
            // Change direction at the ends
            if (teamIndex >= teams.length - 1) direction = -1;
            if (teamIndex <= 0) direction = 1;
          }
        });
      }
      
      // Select captains for each team (highest skill player)
      teams.forEach(team => {
        if (team.players.length > 0) {
          const sortedPlayers = [...team.players].sort((a, b) => {
            const aSkill = (a.stats as any)?.skillRating || 3;
            const bSkill = (b.stats as any)?.skillRating || 3;
            return bSkill - aSkill; // Highest skill first
          });
          
          team.captain = sortedPlayers[0];
        }
      });
      
      // Consider player history for competitive mode
      if (data.considerHistory && data.competitionMode) {
        // Shuffle teams slightly based on past performance
        // This helps prevent the same dominant team patterns
        
        // We'll swap a few players between teams based on win/loss records
        for (let i = 0; i < teams.length; i++) {
          for (let j = i + 1; j < teams.length; j++) {
            // Find top performing player from each team based on win record
            const team1TopPlayer = teams[i].players
              .sort((a, b) => ((b.stats as any)?.teamWins || 0) - ((a.stats as any)?.teamWins || 0))[0];
            
            const team2TopPlayer = teams[j].players
              .sort((a, b) => ((b.stats as any)?.teamWins || 0) - ((a.stats as any)?.teamWins || 0))[0];
            
            // If the win difference is significant, swap to balance
            if (team1TopPlayer && team2TopPlayer) {
              const team1Wins = (team1TopPlayer.stats as any)?.teamWins || 0;
              const team2Wins = (team2TopPlayer.stats as any)?.teamWins || 0;
              
              if (Math.abs(team1Wins - team2Wins) > 3) {
                // Swap players to balance teams
                const team1Index = teams[i].players.findIndex(p => p.id === team1TopPlayer.id);
                const team2Index = teams[j].players.findIndex(p => p.id === team2TopPlayer.id);
                
                if (team1Index >= 0 && team2Index >= 0) {
                  // Check they're the same position for fair swapping
                  if (team1TopPlayer.position === team2TopPlayer.position) {
                    const temp = teams[i].players[team1Index];
                    teams[i].players[team1Index] = teams[j].players[team2Index];
                    teams[j].players[team2Index] = temp;
                  }
                }
              }
            }
          }
        }
      }
      
      return teams;
    } catch (error) {
      console.error("Error generating teams:", error);
      return [];
    }
  }
  
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
        case "gamesPlayed":
          aValue = aStats.gamesPlayed || 0;
          bValue = bStats.gamesPlayed || 0;
          break;
        default:
          aValue = aStats.goals || 0;
          bValue = bStats.goals || 0;
      }
      
      // Sort in descending order
      return bValue - aValue;
    });
  }
  
  async saveContactForm(data: ContactFormData): Promise<boolean> {
    try {
      // In a real app, this would save to a database
      // For this MVP, we just log it and return success
      console.log("Contact form submission:", data);
      return true;
    } catch (error) {
      console.error("Error saving contact form:", error);
      return false;
    }
  }

  // Method to seed initial data for development
  private async seedData() {
    // Create players
    const player1 = await this.createPlayer({
      name: "Jamal Okoye",
      position: "Forward",
      jerseyNumber: 9,
      photoUrl: "https://images.unsplash.com/photo-1526232684263-8a27761bc5aa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&h=150",
      stats: {
        goals: 12,
        assists: 5,
        cleanSheets: 0,
        tackles: 0,
        saves: 0,
        gamesPlayed: 18
      },
      badges: ["goldenBoot", "captain"]
    });

    const player2 = await this.createPlayer({
      name: "Moses Adams",
      position: "Goalkeeper",
      jerseyNumber: 1,
      photoUrl: "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&h=150",
      stats: {
        goals: 0,
        assists: 0,
        cleanSheets: 8,
        tackles: 0,
        saves: 47,
        gamesPlayed: 15
      },
      badges: []
    });

    const player3 = await this.createPlayer({
      name: "Tobi Chukwu",
      position: "Midfielder",
      jerseyNumber: 8,
      photoUrl: "https://images.unsplash.com/photo-1605235186583-a8272b61f9fe?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&h=150",
      stats: {
        goals: 4,
        assists: 11,
        cleanSheets: 0,
        tackles: 15,
        saves: 0,
        gamesPlayed: 16
      },
      badges: ["mostAssists"]
    });

    const player4 = await this.createPlayer({
      name: "Kene Nduka",
      position: "Defender",
      jerseyNumber: 5,
      photoUrl: "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&h=150",
      stats: {
        goals: 2,
        assists: 3,
        cleanSheets: 0,
        tackles: 24,
        saves: 0,
        gamesPlayed: 17
      },
      badges: ["ironMan"]
    });

    const player5 = await this.createPlayer({
      name: "Felix Eze",
      position: "Forward",
      jerseyNumber: 11,
      photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&h=150",
      stats: {
        goals: 9,
        assists: 2,
        cleanSheets: 0,
        tackles: 0,
        saves: 0,
        gamesPlayed: 15
      },
      badges: ["mostImproved"]
    });

    const player6 = await this.createPlayer({
      name: "Ola Iwobi",
      position: "Midfielder",
      jerseyNumber: 10,
      photoUrl: "https://images.unsplash.com/photo-1504257432389-52343af06ae3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&h=150",
      stats: {
        goals: 5,
        assists: 8,
        cleanSheets: 0,
        tackles: 10,
        saves: 0,
        gamesPlayed: 17
      },
      badges: ["fairPlay"]
    });

    // Create more players to have enough for the team generator
    for (let i = 7; i <= 15; i++) {
      await this.createPlayer({
        name: `Player ${i}`,
        position: i % 4 === 0 ? "Goalkeeper" : i % 4 === 1 ? "Defender" : i % 4 === 2 ? "Midfielder" : "Forward",
        jerseyNumber: i + 10,
        photoUrl: "",
        stats: {
          goals: Math.floor(Math.random() * 5),
          assists: Math.floor(Math.random() * 5),
          cleanSheets: i % 4 === 0 ? Math.floor(Math.random() * 3) : 0,
          tackles: i % 4 === 1 ? Math.floor(Math.random() * 10) : 0,
          saves: i % 4 === 0 ? Math.floor(Math.random() * 20) : 0,
          gamesPlayed: Math.floor(Math.random() * 10) + 5
        },
        badges: []
      });
    }

    // Create a tournament
    const tournament1 = await this.createTournament({
      name: "Summer Tournament 2025",
      status: "active",
      startDate: new Date("2025-05-10"),
      endDate: new Date("2025-06-20"),
      description: "Annual summer tournament between club members",
      format: "5-a-side"
    });

    // Create teams for the tournament
    const team1 = await this.createTournamentTeam({
      tournamentId: tournament1.id,
      name: "Team Alpha",
      captainId: player1.id,
      played: 3,
      won: 2,
      drawn: 1,
      lost: 0,
      goalsFor: 7,
      goalsAgainst: 3,
      points: 7
    });

    const team2 = await this.createTournamentTeam({
      tournamentId: tournament1.id,
      name: "Team Omega",
      captainId: player5.id,
      played: 3,
      won: 2,
      drawn: 0,
      lost: 1,
      goalsFor: 8,
      goalsAgainst: 5,
      points: 6
    });

    const team3 = await this.createTournamentTeam({
      tournamentId: tournament1.id,
      name: "Team Delta",
      captainId: player4.id,
      played: 3,
      won: 1,
      drawn: 1,
      lost: 1,
      goalsFor: 5,
      goalsAgainst: 5,
      points: 4
    });

    const team4 = await this.createTournamentTeam({
      tournamentId: tournament1.id,
      name: "Team Sigma",
      captainId: player3.id,
      played: 3,
      won: 0,
      drawn: 0,
      lost: 3,
      goalsFor: 2,
      goalsAgainst: 9,
      points: 0
    });

    // Create another tournament
    const tournament2 = await this.createTournament({
      name: "Knockout Cup 2025",
      status: "active",
      startDate: new Date("2025-04-15"),
      endDate: new Date("2025-06-05"),
      description: "Knockout format tournament",
      format: "7-a-side"
    });

    // Create teams for the knockout tournament
    const teams = ["Team Alpha", "Team Beta", "Team Gamma", "Team Delta", "Team Epsilon", "Team Zeta", "Team Eta", "Team Theta"];
    for (const teamName of teams) {
      await this.createTournamentTeam({
        tournamentId: tournament2.id,
        name: teamName,
        captainId: null,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        points: 0
      });
    }

    // Create fixtures
    const now = new Date();
    const future1 = new Date();
    future1.setDate(now.getDate() + 5);
    const future2 = new Date();
    future2.setDate(now.getDate() + 7);
    const future3 = new Date();
    future3.setDate(now.getDate() + 12);

    await this.createFixture({
      tournamentId: tournament1.id,
      homeTeamId: team1.id,
      awayTeamId: team2.id,
      homeTeamName: "Team Alpha",
      awayTeamName: "Team Omega",
      homeTeamCaptain: "J. Okoye",
      awayTeamCaptain: "F. Eze",
      date: future1,
      location: "Main Pitch, Asaba Sports Complex",
      tournamentName: "Summer Tournament"
    });

    await this.createFixture({
      tournamentId: tournament1.id,
      homeTeamId: team3.id,
      awayTeamId: team4.id,
      homeTeamName: "Team Delta",
      awayTeamName: "Team Sigma",
      homeTeamCaptain: "K. Nduka",
      awayTeamCaptain: "T. Chukwu",
      date: future2,
      location: "Main Pitch, Asaba Sports Complex",
      tournamentName: "Summer Tournament"
    });

    await this.createFixture({
      tournamentId: tournament1.id,
      homeTeamId: team1.id,
      awayTeamId: team4.id,
      homeTeamName: "Team Alpha",
      awayTeamName: "Team Sigma",
      homeTeamCaptain: "J. Okoye",
      awayTeamCaptain: "T. Chukwu",
      date: future3,
      location: "Main Pitch, Asaba Sports Complex",
      tournamentName: "Summer Tournament"
    });
  }
}

export const storage = new MemStorage();
