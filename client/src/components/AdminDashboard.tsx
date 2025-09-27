import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Trophy, 
  Calendar, 
  BarChart3, 
  Settings, 
  UserPlus,
  TrendingUp,
  Target,
  Clock,
  Award
} from "lucide-react";
import { User, Player, Tournament, Fixture } from "@shared/schema";
import PlayerManagement from "./admin/PlayerManagement";
import TournamentManagement from "./TournamentManagement";
import FixtureManagement from "./admin/FixtureManagement";
import UserManagement from "./admin/UserManagement";
import StatsDashboard from "./admin/StatsDashboard";
import TeamGeneratorAdmin from "./admin/TeamGeneratorAdmin";

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

const AdminDashboard = ({ user, onLogout }: AdminDashboardProps) => {
  const [activeTab, setActiveTab] = useState("overview");

  const isAdmin = user.role === "admin";

  // Fetch dashboard data
  const { data: players = [] } = useQuery<Player[]>({
    queryKey: ["/api/players"],
  });

  const { data: tournaments = [] } = useQuery<Tournament[]>({
    queryKey: ["/api/tournaments"],
  });

  const { data: fixtures = [] } = useQuery<Fixture[]>({
    queryKey: ["/api/fixtures"],
  });

  // Calculate dashboard statistics
  const totalPlayers = players.length;
  const activeTournaments = tournaments.filter(t => t.status === 'active').length;
  const upcomingFixtures = fixtures.filter(f => f.status === 'scheduled').length;
  const totalMatches = fixtures.filter(f => f.status === 'completed').length;

  // Get top performers
  const topScorer = players.reduce((top, player) => {
    const goals = (player.stats as any)?.goals || 0;
    const topGoals = (top.stats as any)?.goals || 0;
    return goals > topGoals ? player : top;
  }, players[0]);

  const topAssister = players.reduce((top, player) => {
    const assists = (player.stats as any)?.assists || 0;
    const topAssists = (top.stats as any)?.assists || 0;
    return assists > topAssists ? player : top;
  }, players[0]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-xl p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-royal-blue">Royal FC Admin Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user.username}!</p>
            <Badge variant={isAdmin ? "default" : "secondary"} className="mt-2">
              {user.role.toUpperCase()}
            </Badge>
          </div>
          <Button onClick={onLogout} variant="outline">
            Logout
          </Button>
        </div>
      </div>

      {/* Main Dashboard */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 lg:grid-cols-7">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="players" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Players
          </TabsTrigger>
          <TabsTrigger value="tournaments" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Tournaments
          </TabsTrigger>
          <TabsTrigger value="fixtures" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Fixtures
          </TabsTrigger>
          <TabsTrigger value="teams" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Team Gen
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="users" className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Users
            </TabsTrigger>
          )}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Players</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-royal-blue">{totalPlayers}</div>
                <p className="text-xs text-muted-foreground">Active roster</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Tournaments</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{activeTournaments}</div>
                <p className="text-xs text-muted-foreground">Currently running</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Fixtures</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{upcomingFixtures}</div>
                <p className="text-xs text-muted-foreground">Scheduled</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{totalMatches}</div>
                <p className="text-xs text-muted-foreground">Completed</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest system activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{totalPlayers} players loaded</p>
                      <p className="text-xs text-muted-foreground">Ready for team generation</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Admin panel active</p>
                      <p className="text-xs text-muted-foreground">All features operational</p>
                    </div>
                  </div>
                  {activeTournaments > 0 && (
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activeTournaments} active tournament{activeTournaments > 1 ? 's' : ''}</p>
                        <p className="text-xs text-muted-foreground">Currently running</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  onClick={() => setActiveTab("players")} 
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Manage Players
                </Button>
                <Button 
                  onClick={() => setActiveTab("tournaments")} 
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  Create Tournament
                </Button>
                <Button 
                  onClick={() => setActiveTab("fixtures")} 
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Match
                </Button>
                <Button 
                  onClick={() => setActiveTab("teams")} 
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Target className="w-4 h-4 mr-2" />
                  Generate Teams
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Players Tab */}
        <TabsContent value="players">
          <PlayerManagement />
        </TabsContent>

        {/* Tournaments Tab */}
        <TabsContent value="tournaments">
          <TournamentManagement />
        </TabsContent>

        {/* Fixtures Tab */}
        <TabsContent value="fixtures">
          <FixtureManagement />
        </TabsContent>

        {/* Team Generator Tab */}
        <TabsContent value="teams">
          <TeamGeneratorAdmin />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="stats">
          <StatsDashboard />
        </TabsContent>

        {/* Users Tab (Admin Only) */}
        {isAdmin && (
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
