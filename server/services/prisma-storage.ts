import { PrismaClient } from '@prisma/client';
import { 
  User, InsertUser, 
  Player, InsertPlayer, 
  Tournament, InsertTournament, 
  TournamentTeam, InsertTournamentTeam,
  Fixture, InsertFixture,
  MatchResult, InsertMatchResult,
  TeamGenerationRequest,
  GeneratedTeam,
  ContactFormData,
  PlayerMetrics
} from '@shared/schema';
import { IStorage } from './storage';

const prisma = new PrismaClient();

export class PrismaStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const user = await prisma.user.findUnique({ where: { id } });
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const user = await prisma.user.findUnique({ where: { username } });
    return user || undefined;
  }

  async createUser(data: InsertUser): Promise<User> {
    return await prisma.user.create({
      data: {
        username: data.username,
        password: data.password,
        role: data.role || 'exco'
      }
    });
  }

  async getUsers(): Promise<User[]> {
    return await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async deleteUser(id: number): Promise<boolean> {
    try {
      await prisma.user.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  // Player methods
  async getPlayer(id: number): Promise<Player | undefined> {
    const player = await prisma.player.findUnique({ where: { id } });
    if (!player) return undefined;
    
    return {
      ...player,
      stats: player.stats as any,
      badges: player.badges as string[]
    };
  }

  async getPlayers(): Promise<Player[]> {
    const players = await prisma.player.findMany({
      orderBy: { jerseyNumber: 'asc' }
    });
    
    return players.map(p => ({
      ...p,
      stats: p.stats as any,
      badges: p.badges as string[]
    }));
  }

  async getPlayersByIds(ids: number[]): Promise<Player[]> {
    const players = await prisma.player.findMany({
      where: { id: { in: ids } }
    });
    
    return players.map(p => ({
      ...p,
      stats: p.stats as any,
      badges: p.badges as string[]
    }));
  }

  async getPlayersByPosition(position: string): Promise<Player[]> {
    const players = await prisma.player.findMany({
      where: { position }
    });
    
    return players.map(p => ({
      ...p,
      stats: p.stats as any,
      badges: p.badges as string[]
    }));
  }

  async createPlayer(data: InsertPlayer): Promise<Player> {
    const player = await prisma.player.create({
      data: {
        name: data.name,
        position: data.position,
        jerseyNumber: data.jerseyNumber,
        photoUrl: data.photoUrl,
        stats: data.stats || {
          goals: 0,
          assists: 0,
          cleanSheets: 0,
          tackles: 0,
          saves: 0,
          gamesPlayed: 0,
          skillRating: 3,
          teamWins: 0,
          teamLosses: 0,
          teamDraws: 0
        },
        badges: data.badges || []
      }
    });
    
    return {
      ...player,
      stats: player.stats as any,
      badges: player.badges as string[]
    };
  }

  async updatePlayer(id: number, data: Partial<Player>): Promise<Player | undefined> {
    try {
      const player = await prisma.player.update({
        where: { id },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.position && { position: data.position }),
          ...(data.jerseyNumber !== undefined && { jerseyNumber: data.jerseyNumber }),
          ...(data.photoUrl !== undefined && { photoUrl: data.photoUrl }),
          ...(data.stats && { stats: data.stats as any }),
          ...(data.badges && { badges: data.badges as any })
        }
      });
      
      return {
        ...player,
        stats: player.stats as any,
        badges: player.badges as string[]
      };
    } catch {
      return undefined;
    }
  }

  async deletePlayer(id: number): Promise<boolean> {
    try {
      await prisma.player.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  async saveRoster(players: Player[]): Promise<void> {
    // Delete all existing players
    await prisma.player.deleteMany();
    
    // Create new players
    for (const player of players) {
      await prisma.player.create({
        data: {
          name: player.name,
          position: player.position,
          jerseyNumber: player.jerseyNumber,
          photoUrl: player.photoUrl,
          stats: player.stats as any,
          badges: player.badges as any
        }
      });
    }
  }

  // Tournament methods
  async getTournament(id: number): Promise<Tournament | undefined> {
    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: {
        teams: true,
        fixtures: {
          include: {
            homeTeam: true,
            awayTeam: true
          }
        }
      }
    });
    
    if (!tournament) return undefined;
    
    return {
      ...tournament,
      teams: tournament.teams as any,
      fixtures: tournament.fixtures as any
    };
  }

  async getTournaments(): Promise<Tournament[]> {
    const tournaments = await prisma.tournament.findMany({
      include: {
        teams: true,
        fixtures: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return tournaments.map(t => ({
      ...t,
      teams: t.teams as any,
      fixtures: t.fixtures as any
    }));
  }

  async getActiveTournaments(): Promise<Tournament[]> {
    const tournaments = await prisma.tournament.findMany({
      where: { status: 'active' },
      include: {
        teams: true,
        fixtures: true
      }
    });
    
    return tournaments.map(t => ({
      ...t,
      teams: t.teams as any,
      fixtures: t.fixtures as any
    }));
  }

  async getPastTournaments(): Promise<Tournament[]> {
    const tournaments = await prisma.tournament.findMany({
      where: { status: 'completed' },
      include: {
        teams: true,
        fixtures: true
      }
    });
    
    return tournaments.map(t => ({
      ...t,
      teams: t.teams as any,
      fixtures: t.fixtures as any
    }));
  }

  async createTournament(data: InsertTournament): Promise<Tournament> {
    const tournament = await prisma.tournament.create({
      data: {
        name: data.name,
        status: data.status || 'active',
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        description: data.description,
        format: data.format
      },
      include: {
        teams: true,
        fixtures: true
      }
    });
    
    return {
      ...tournament,
      teams: tournament.teams as any,
      fixtures: tournament.fixtures as any
    };
  }

  async updateTournament(id: number, data: Partial<Tournament>): Promise<Tournament | undefined> {
    try {
      const tournament = await prisma.tournament.update({
        where: { id },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.status && { status: data.status }),
          ...(data.startDate && { startDate: new Date(data.startDate) }),
          ...(data.endDate && { endDate: new Date(data.endDate) }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.format && { format: data.format })
        },
        include: {
          teams: true,
          fixtures: true
        }
      });
      
      return {
        ...tournament,
        teams: tournament.teams as any,
        fixtures: tournament.fixtures as any
      };
    } catch {
      return undefined;
    }
  }

  async deleteTournament(id: number): Promise<boolean> {
    try {
      await prisma.tournament.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  // Tournament Team methods
  async getTournamentTeam(id: number): Promise<TournamentTeam | undefined> {
    const team = await prisma.tournamentTeam.findUnique({ where: { id } });
    return team as any || undefined;
  }

  async getTournamentTeamsByTournament(tournamentId: number): Promise<TournamentTeam[]> {
    const teams = await prisma.tournamentTeam.findMany({
      where: { tournamentId }
    });
    return teams as any;
  }

  async createTournamentTeam(data: InsertTournamentTeam): Promise<TournamentTeam> {
    const team = await prisma.tournamentTeam.create({
      data: {
        tournamentId: data.tournamentId,
        name: data.name,
        captainId: data.captainId,
        played: data.played || 0,
        won: data.won || 0,
        drawn: data.drawn || 0,
        lost: data.lost || 0,
        goalsFor: data.goalsFor || 0,
        goalsAgainst: data.goalsAgainst || 0,
        points: data.points || 0
      }
    });
    return team as any;
  }

  async updateTournamentTeam(id: number, data: Partial<TournamentTeam>): Promise<TournamentTeam | undefined> {
    try {
      const team = await prisma.tournamentTeam.update({
        where: { id },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.captainId !== undefined && { captainId: data.captainId }),
          ...(data.played !== undefined && { played: data.played }),
          ...(data.won !== undefined && { won: data.won }),
          ...(data.drawn !== undefined && { drawn: data.drawn }),
          ...(data.lost !== undefined && { lost: data.lost }),
          ...(data.goalsFor !== undefined && { goalsFor: data.goalsFor }),
          ...(data.goalsAgainst !== undefined && { goalsAgainst: data.goalsAgainst }),
          ...(data.points !== undefined && { points: data.points })
        }
      });
      return team as any;
    } catch {
      return undefined;
    }
  }

  // Fixture methods
  async getFixture(id: number): Promise<Fixture | undefined> {
    const fixture = await prisma.fixture.findUnique({ where: { id } });
    return fixture as any || undefined;
  }

  async getFixtures(): Promise<Fixture[]> {
    const fixtures = await prisma.fixture.findMany({
      orderBy: { date: 'desc' }
    });
    return fixtures as any;
  }

  async getFixturesByTournament(tournamentId: number): Promise<Fixture[]> {
    const fixtures = await prisma.fixture.findMany({
      where: { tournamentId },
      orderBy: { date: 'asc' }
    });
    return fixtures as any;
  }

  async getUpcomingFixtures(): Promise<Fixture[]> {
    const fixtures = await prisma.fixture.findMany({
      where: {
        date: { gt: new Date() },
        status: 'scheduled'
      },
      orderBy: { date: 'asc' },
      take: 3
    });
    return fixtures as any;
  }

  async getActiveFixtures(): Promise<Fixture[]> {
    const fixtures = await prisma.fixture.findMany({
      where: { status: 'in_progress' },
      orderBy: { date: 'asc' }
    });
    return fixtures as any;
  }

  async createFixture(data: InsertFixture): Promise<Fixture> {
    const fixture = await prisma.fixture.create({
      data: {
        tournamentId: data.tournamentId,
        homeTeamId: data.homeTeamId,
        awayTeamId: data.awayTeamId,
        homeTeamName: data.homeTeamName,
        awayTeamName: data.awayTeamName,
        homeTeamCaptain: data.homeTeamCaptain,
        awayTeamCaptain: data.awayTeamCaptain,
        homeTeamScore: data.homeTeamScore,
        awayTeamScore: data.awayTeamScore,
        date: new Date(data.date),
        location: data.location,
        status: data.status || 'scheduled',
        tournamentName: data.tournamentName
      }
    });
    return fixture as any;
  }

  async updateFixture(id: number, data: Partial<Fixture>): Promise<Fixture | undefined> {
    try {
      const fixture = await prisma.fixture.update({
        where: { id },
        data: {
          ...(data.homeTeamScore !== undefined && { homeTeamScore: data.homeTeamScore }),
          ...(data.awayTeamScore !== undefined && { awayTeamScore: data.awayTeamScore }),
          ...(data.status && { status: data.status }),
          ...(data.date && { date: new Date(data.date) })
        }
      });
      return fixture as any;
    } catch {
      return undefined;
    }
  }

  // Match Result methods
  async getMatchResult(id: number): Promise<MatchResult | undefined> {
    const result = await prisma.matchResult.findUnique({ where: { id } });
    return result as any || undefined;
  }

  async getMatchResultsByFixture(fixtureId: number): Promise<MatchResult[]> {
    const results = await prisma.matchResult.findMany({
      where: { fixtureId }
    });
    return results as any;
  }

  async getMatchResultsByPlayer(playerId: number): Promise<MatchResult[]> {
    const results = await prisma.matchResult.findMany({
      where: { playerId }
    });
    return results as any;
  }

  async createMatchResult(data: InsertMatchResult): Promise<MatchResult> {
    const result = await prisma.matchResult.create({
      data: {
        fixtureId: data.fixtureId,
        playerId: data.playerId,
        goals: data.goals || 0,
        assists: data.assists || 0,
        cleanSheet: data.cleanSheet || false,
        tackles: data.tackles || 0,
        saves: data.saves || 0
      }
    });
    return result as any;
  }

  // Business logic methods
  async recordMatchResult(data: any): Promise<boolean> {
    try {
      const fixtureId = parseInt(data.fixtureId);
      
      // Update fixture
      await this.updateFixture(fixtureId, {
        homeTeamScore: data.homeTeamScore,
        awayTeamScore: data.awayTeamScore,
        status: 'completed'
      });
      
      const fixture = await this.getFixture(fixtureId);
      if (!fixture) return false;
      
      // Update team stats
      const homeTeam = await this.getTournamentTeam(fixture.homeTeamId);
      const awayTeam = await this.getTournamentTeam(fixture.awayTeamId);
      
      if (homeTeam && awayTeam) {
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
          homeUpdate.won = homeTeam.won + 1;
          homeUpdate.points = homeTeam.points + 3;
          awayUpdate.lost = awayTeam.lost + 1;
        } else if (data.awayTeamScore > data.homeTeamScore) {
          awayUpdate.won = awayTeam.won + 1;
          awayUpdate.points = awayTeam.points + 3;
          homeUpdate.lost = homeTeam.lost + 1;
        } else {
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
          
          const stats = { ...player.stats };
          stats.goals = (stats.goals || 0) + scorer.goals;
          stats.gamesPlayed = (stats.gamesPlayed || 0) + 1;
          
          await this.updatePlayer(playerId, { stats });
          
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
      console.error('Error recording match result:', error);
      return false;
    }
  }

  async getLeaderboard(category: string = 'goals'): Promise<Player[]> {
    const players = await this.getPlayers();
    
    return players.sort((a, b) => {
      const aStats = a.stats as any || {};
      const bStats = b.stats as any || {};
      
      const aValue = aStats[category] || 0;
      const bValue = bStats[category] || 0;
      
      return bValue - aValue;
    });
  }

  async saveContactForm(data: ContactFormData): Promise<boolean> {
    try {
      await prisma.contactForm.create({
        data: {
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          position: data.position,
          experience: data.experience,
          message: data.message,
          termsAccepted: data.termsAccepted
        }
      });
      return true;
    } catch (error) {
      console.error('Error saving contact form:', error);
      return false;
    }
  }

  // Team generation (reuse from MemStorageImpl)
  async generateTeams(request: TeamGenerationRequest): Promise<GeneratedTeam[]> {
    const { format, playerIds, balanceMethod, teamsCount, considerHistory, competitionMode } = request;
    
    const selectedPlayers = await this.getPlayersByIds(playerIds);
    const playersWithMetrics = selectedPlayers.map(p => ({
      ...p,
      metrics: this.calculatePlayerMetrics(p)
    }));

    const teamSize = format === '11-a-side' ? 11 : format === '7-a-side' ? 7 : 5;
    
    const teams: GeneratedTeam[] = Array(teamsCount).fill(null).map((_, i) => ({
      name: `Team ${i + 1}`,
      players: [],
      totalSkill: 0,
      matchHistory: [],
      averageWinRate: 0,
      positionBalance: 0
    }));

    const sortedPlayers = [...playersWithMetrics].sort((a, b) => {
      if (balanceMethod === 'position') {
        return a.position.localeCompare(b.position) || 
               (b.metrics?.positionStrength || 0) - (a.metrics?.positionStrength || 0);
      }
      return (b.metrics?.skillRating || 0) - (a.metrics?.skillRating || 0);
    });

    sortedPlayers.forEach((player, index) => {
      const teamIndex = index % teamsCount;
      teams[teamIndex].players.push(player);
      teams[teamIndex].totalSkill += player.stats.skillRating;
    });

    if (balanceMethod === 'skill' || balanceMethod === 'mixed') {
      this.balanceTeamsByMetric(teams, 'skillRating');
    }
    if (balanceMethod === 'position' || balanceMethod === 'mixed') {
      this.balanceTeamsByMetric(teams, 'positionStrength');
    }
    if (considerHistory) {
      this.balanceTeamsByMetric(teams, 'winRate');
    }

    teams.forEach(team => {
      team.averageWinRate = team.players.reduce((sum, p) => sum + (p.metrics?.winRate || 50), 0) / team.players.length;
      team.positionBalance = this.calculatePositionBalance(team.players);
    });

    if (competitionMode) {
      this.assignCaptains(teams);
    }

    return teams;
  }

  private calculatePlayerMetrics(player: Player): PlayerMetrics {
    const stats = player.stats;
    const totalGames = (stats.teamWins || 0) + (stats.teamLosses || 0) + (stats.teamDraws || 0);
    const winRate = totalGames > 0 ? ((stats.teamWins || 0) / totalGames) * 100 : 50;
    
    return {
      winRate,
      formRating: stats.formRating || stats.skillRating,
      skillRating: stats.skillRating,
      positionStrength: stats.positionRating || stats.skillRating
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
        const strongPlayer = maxTeam.team.players.reduce((max, p) => 
          (p.metrics?.[metric] || 0) > (max.metrics?.[metric] || 0) ? p : max
        );
        const weakPlayer = minTeam.team.players.reduce((min, p) => 
          (p.metrics?.[metric] || 0) < (min.metrics?.[metric] || 0) ? p : min
        );
        
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

  // Tournament-specific methods for compatibility
  async getTournamentById(id: number): Promise<Tournament | null> {
    const tournament = await this.getTournament(id);
    return tournament || null;
  }

  async getTournamentTeams(tournamentId: number): Promise<TournamentTeam[]> {
    return this.getTournamentTeamsByTournament(tournamentId);
  }

  async updateTournamentStatus(tournamentId: number, status: string): Promise<Tournament> {
    const tournament = await this.updateTournament(tournamentId, { status });
    if (!tournament) {
      throw new Error('Tournament not found');
    }
    return tournament;
  }
}

export const prismaStorage = new PrismaStorage();
