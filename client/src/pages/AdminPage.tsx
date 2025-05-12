import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import AdminLogin from "@/components/AdminLogin";
import MatchResultForm from "@/components/MatchResultForm";
import LiveMatchAdmin from "@/components/LiveMatchAdmin";
import { apiRequest } from "@/lib/queryClient";

const AdminPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if admin is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await apiRequest("GET", "/api/admin/check-auth");
        setIsAuthenticated(response.ok);
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/admin/logout");
      setIsAuthenticated(false);
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
          
          {isAuthenticated ? (
            <div className="max-w-5xl mx-auto">
              <div className="flex justify-end mb-6">
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
                  <TabsTrigger value="players">Players</TabsTrigger>
                  <TabsTrigger value="tournaments">Tournaments</TabsTrigger>
                </TabsList>
                
                <TabsContent value="match-results" className="mt-6">
                  <MatchResultForm />
                </TabsContent>
                
                <TabsContent value="live-updates" className="mt-6">
                  <LiveMatchAdmin />
                </TabsContent>
                
                <TabsContent value="players" className="mt-6">
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="font-montserrat font-bold text-xl text-royal-blue mb-6">Player Management</h2>
                    <p className="text-gray-600">This feature will be available in a future update.</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="tournaments" className="mt-6">
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="font-montserrat font-bold text-xl text-royal-blue mb-6">Tournament Management</h2>
                    <p className="text-gray-600">This feature will be available in a future update.</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="max-w-md mx-auto">
              <AdminLogin onLoginSuccess={() => setIsAuthenticated(true)} />
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default AdminPage;
