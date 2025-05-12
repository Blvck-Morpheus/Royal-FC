import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AdminLogin from "@/components/AdminLogin";
import MatchResultForm from "@/components/MatchResultForm";
import LiveMatchAdmin from "@/components/LiveMatchAdmin";
import { apiRequest } from "@/lib/queryClient";
import { User } from "@shared/schema";

const AdminPage = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if admin is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await apiRequest("GET", "/api/admin/check-auth");
        if (response.ok) {
          const userData = await response.json();
          setCurrentUser(userData);
        } else {
          setCurrentUser(null);
        }
      } catch (error) {
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/admin/logout");
      setCurrentUser(null);
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
                        <p className="text-gray-600 mb-4">Add, edit, or remove players from the team roster.</p>
                        
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="font-montserrat font-semibold text-lg">Team Roster</h3>
                          <Button 
                            onClick={() => window.location.href = '/players'}
                            className="bg-royal-blue"
                          >
                            <i className="ri-user-settings-line mr-2"></i>
                            Manage Players
                          </Button>
                        </div>
                        
                        <div className="border border-gray-200 rounded-md p-4 bg-gray-50 mt-4">
                          <div className="flex items-center">
                            <i className="ri-information-line text-royal-blue text-xl mr-3"></i>
                            <div>
                              <p className="text-sm text-gray-600">
                                You are now logged in as a main administrator. Visit the Players page to manage the team roster. 
                                You'll be able to add new players, edit player information, and remove players from the roster.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="tournaments" className="mt-6">
                      <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="font-montserrat font-bold text-xl text-royal-blue mb-6">Tournament Management</h2>
                        <p className="text-gray-600">This feature is only available to main admin users.</p>
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
