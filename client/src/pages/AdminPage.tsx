import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AdminLogin from "@/components/AdminLogin";
import MatchResultForm from "@/components/MatchResultForm";
import LiveMatchAdmin from "@/components/LiveMatchAdmin";
import PlayerManagement from "@/components/PlayerManagement";
import { apiRequest } from "@/lib/queryClient";
import { User } from "@shared/schema";
import UserManagement from "@/components/UserManagement";
import TournamentManagement from "@/components/TournamentManagement";

const AdminPage = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if admin is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/admin/check-auth", {
          credentials: "include",
        });

        const userData = await response.json();
        console.log("Auth check response:", userData);

        if (userData.authenticated || (userData.id && userData.username)) {
          setCurrentUser(userData);
        } else {
          setCurrentUser(null);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLoginSuccess = (user: User) => {
    console.log("Login success, setting user:", user);
    setCurrentUser(user);
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        setCurrentUser(null);
      } else {
        console.error("Logout failed with status:", response.status);
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (isLoading) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center py-10">
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <Helmet>
        <title>Admin | Royal FC Asaba</title>
        <meta name="description" content="Admin panel for Royal FC Asaba. Manage match results, player stats, and tournaments." />
      </Helmet>

      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h1 className="font-montserrat font-bold text-3xl text-royal-blue">Admin Panel</h1>
            <p className="text-gray-600 mt-2">Manage match results, player stats, and tournaments</p>
          </div>

          {currentUser ? (
            <div className="max-w-5xl mx-auto">
              <div className="flex justify-between mb-6 items-center">
                <div className="flex items-center">
                  <span className="text-gray-700 mr-2">Logged in as:</span>
                  <span className="font-semibold">{currentUser.username}</span>
                  <Badge className={currentUser.role === "admin" ? "bg-royal-blue ml-2" : "bg-royal-bright-blue ml-2"}>
                    {currentUser.role === "admin" ? "Main Admin" : "Exco Member"}
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  className="bg-white"
                  onClick={handleLogout}
                >
                  <i className="ri-logout-box-r-line mr-1"></i> Logout
                </Button>
              </div>

              <Tabs defaultValue="match-results">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="match-results">Match Results</TabsTrigger>
                  <TabsTrigger value="live-updates">Live Updates</TabsTrigger>
                  {currentUser.role === "admin" && (
                    <>
                      <TabsTrigger value="players">Players</TabsTrigger>
                      <TabsTrigger value="tournaments">Tournaments</TabsTrigger>
                      <TabsTrigger value="users">User Management</TabsTrigger>
                    </>
                  )}
                  {currentUser.role === "exco" && (
                    <>
                      <TabsTrigger value="team-generator">Team Generator</TabsTrigger>
                      <TabsTrigger value="contact-messages">Contact Messages</TabsTrigger>
                    </>
                  )}
                </TabsList>

                <TabsContent value="match-results" className="mt-6">
                  <MatchResultForm />
                </TabsContent>

                <TabsContent value="live-updates" className="mt-6">
                  <LiveMatchAdmin />
                </TabsContent>

                {currentUser.role === "admin" && (
                  <>
                    <TabsContent value="players" className="mt-6">
                      <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="font-montserrat font-bold text-xl text-royal-blue mb-4">Player Management</h2>
                        <p className="text-gray-600 mb-6">Add, edit, or remove players from the team roster.</p>
                        <PlayerManagement />
                      </div>
                    </TabsContent>

                    <TabsContent value="tournaments" className="mt-6">
                      <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="font-montserrat font-bold text-xl text-royal-blue mb-4">Tournament Management</h2>
                        <p className="text-gray-600 mb-6">Create and manage tournaments, add teams, and track progress.</p>
                        <TournamentManagement />
                      </div>
                    </TabsContent>

                    <TabsContent value="users" className="mt-6">
                      <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="font-montserrat font-bold text-xl text-royal-blue mb-4">User Management</h2>
                        <p className="text-gray-600 mb-6">Create and manage exco member accounts.</p>
                        <UserManagement />
                      </div>
                    </TabsContent>
                  </>
                )}

                {currentUser.role === "exco" && (
                  <>
                    <TabsContent value="team-generator" className="mt-6">
                      <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="font-montserrat font-bold text-xl text-royal-blue mb-6">Team Generator Access</h2>
                        <p className="text-gray-600">Access team generation features for training sessions and matches.</p>
                      </div>
                    </TabsContent>

                    <TabsContent value="contact-messages" className="mt-6">
                      <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="font-montserrat font-bold text-xl text-royal-blue mb-6">Contact Form Messages</h2>
                        <p className="text-gray-600">View messages from the contact form.</p>
                      </div>
                    </TabsContent>
                  </>
                )}
              </Tabs>
            </div>
          ) : (
            <div className="max-w-md mx-auto">
              <AdminLogin onLoginSuccess={handleLoginSuccess} />
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default AdminPage;
