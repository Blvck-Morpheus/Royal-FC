import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import MainLayout from "@/layouts/MainLayout";
import HomePage from "@/pages/HomePage";
import PlayersPage from "@/pages/PlayersPage";
import TournamentsPage from "@/pages/TournamentsPage";
import LeaderboardPage from "@/pages/LeaderboardPage";
import TeamGeneratorPage from "@/pages/TeamGeneratorPage";
import AboutPage from "@/pages/AboutPage";
import ContactPage from "@/pages/ContactPage";
import AdminPage from "@/pages/AdminPage";
import { AuthProvider } from "@/contexts/AuthContext";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/players" component={PlayersPage} />
      <Route path="/tournaments" component={TournamentsPage} />
      <Route path="/leaderboard" component={LeaderboardPage} />
      <Route path="/team-generator" component={TeamGeneratorPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/admin" component={AdminPage} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <MainLayout>
            <Router />
          </MainLayout>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
