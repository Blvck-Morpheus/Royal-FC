import { useState } from "react";
import { Helmet } from "react-helmet";
import AdminLogin from "@/components/AdminLogin";
import AdminDashboard from "@/components/AdminDashboard";
import { User } from "@shared/schema";

const AdminPage = () => {
  const [user, setUser] = useState<User | null>(null);

  const handleLoginSuccess = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    // Clear any stored tokens
    localStorage.removeItem('auth-token');
  };

  return (
    <>
      <Helmet>
        <title>Admin | Royal FC Asaba</title>
        <meta name="description" content="Admin panel for Royal FC Asaba. Manage match results, player stats, and tournaments." />
      </Helmet>

      <section className="py-12 bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4">
          {!user ? (
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
