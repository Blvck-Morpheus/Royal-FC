import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Player, Tournament, Fixture } from "@shared/schema";
import { Trophy, Users, Calendar, Target, TrendingUp, Award } from "lucide-react";

const StatsDashboard = () => {
  // Fetch data
  const { data: players = [] } = useQuery<Player[]>({
    queryKey: ["/api/players"],
  });

  const { data: tournaments = [] } = useQuery<Tournament[]>({
    queryKey: ["/api/tournaments"],
  });

  const { data: fixtures = [] } = useQuery<Fixture[]>({
    queryKey: ["/api/fixtures"],
  });

  // Calculate statistics
  const totalPlayers = players.length;
  const activeTournaments = tournaments.filter(t => t.status === "active").length;
  const completedMatches = fixtures.filter(f => f.status === "completed").length;
  const upcomingMatches = fixtures.filter(f => f.status === "scheduled").length;

  // Player statistics
  const topScorers = players
    .sort((a, b) => b.stats.goals - a.stats.goals)
    .slice(0, 5);

  const topAssists = players
    .sort((a, b) => b.stats.assists - a.stats.assists)
    .slice(0, 5);

  const mostExperienced = players
    .sort((a, b) => b.stats.gamesPlayed - a.stats.gamesPlayed)
    .slice(0, 5);

  // Position distribution
  const positionStats = players.reduce((acc, player) => {
    acc[player.position] = (acc[player.position] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Statistics & Analytics</h2>
        <p className="text-gray-600">Club performance and player statistics</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Players</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPlayers}</div>
            <p className="text-xs text-muted-foreground">Active roster</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tournaments</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTournaments}</div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Matches</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedMatches}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Matches</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingMatches}</div>
            <p className="text-xs text-muted-foreground">Scheduled</p>
          </CardContent>
        </Card>
      </div>

      {/* Player Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Scorers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Top Scorers
            </CardTitle>
            <CardDescription>Players with most goals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topScorers.map((player, index) => (
                <div key={player.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                      {index + 1}
                    </Badge>
                    <span className="font-medium">{player.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{player.stats.goals}</span>
                    <span className="text-sm text-gray-500">goals</span>
                  </div>
                </div>
              ))}
              {topScorers.length === 0 && (
                <p className="text-gray-500 text-center py-4">No goal data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Assists */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Top Assists
            </CardTitle>
            <CardDescription>Players with most assists</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topAssists.map((player, index) => (
                <div key={player.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                      {index + 1}
                    </Badge>
                    <span className="font-medium">{player.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{player.stats.assists}</span>
                    <span className="text-sm text-gray-500">assists</span>
                  </div>
                </div>
              ))}
              {topAssists.length === 0 && (
                <p className="text-gray-500 text-center py-4">No assist data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Most Experienced */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-green-500" />
              Most Experienced
            </CardTitle>
            <CardDescription>Players with most games</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mostExperienced.map((player, index) => (
                <div key={player.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                      {index + 1}
                    </Badge>
                    <span className="font-medium">{player.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{player.stats.gamesPlayed}</span>
                    <span className="text-sm text-gray-500">games</span>
                  </div>
                </div>
              ))}
              {mostExperienced.length === 0 && (
                <p className="text-gray-500 text-center py-4">No game data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Position Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Squad Composition</CardTitle>
          <CardDescription>Player distribution by position</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(positionStats).map(([position, count]) => (
              <div key={position} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-royal-blue">{count}</div>
                <div className="text-sm text-gray-600">{position}s</div>
              </div>
            ))}
            {Object.keys(positionStats).length === 0 && (
              <div className="col-span-full text-center py-8 text-gray-500">
                No players added yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tournament Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Tournament Overview</CardTitle>
          <CardDescription>Current tournament status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tournaments.map((tournament) => (
              <div key={tournament.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-semibold">{tournament.name}</h4>
                  <p className="text-sm text-gray-600">{tournament.format}</p>
                </div>
                <Badge variant={tournament.status === "active" ? "default" : "secondary"}>
                  {tournament.status}
                </Badge>
              </div>
            ))}
            {tournaments.length === 0 && (
              <p className="text-gray-500 text-center py-4">No tournaments created yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsDashboard;
