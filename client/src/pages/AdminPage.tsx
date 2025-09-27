import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import AdminLogin from "@/components/AdminLogin";
import AdminDashboard from "@/components/AdminDashboard";
import { User } from "@shared/schema";
import { authManager } from "@/lib/auth";

const AdminPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check for existing authentication on component mount
  useEffect(() => {
    const checkExistingAuth = async () => {
      try {
        const userData = await authManager.checkAuth();
        if (userData) {
          setUser(userData);
        }
      } catch (error) {
        console.log("Auth check failed:", error);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkExistingAuth();
  }, []);

  const handleLoginSuccess = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    authManager.logout();
    setUser(null);
  };

  return (
    <>
      <Helmet>
        <title>Admin | Royal FC Asaba</title>
        <meta name="description" content="Admin panel for Royal FC Asaba. Manage match results, player stats, and tournaments." />
      </Helmet>

      <section className="py-12 bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4">
          {isCheckingAuth ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-royal-blue mx-auto mb-4"></div>
                <p className="text-gray-600">Checking authentication...</p>
              </div>
            </div>
          ) : !user ? (
            <>
              <div className="mb-10 text-center">
                <h1 className="font-montserrat font-bold text-3xl text-royal-blue">Admin Panel</h1>
                <p className="text-gray-600 mt-2">Manage match results, player stats, and tournaments</p>
              </div>
              <div className="max-w-md mx-auto">
                <AdminLogin onLoginSuccess={handleLoginSuccess} />
              </div>
            </>
          ) : (
            <AdminDashboard user={user} onLogout={handleLogout} />
          )}
        </div>
      </section>
    </>
  );
};

export default AdminPage;
