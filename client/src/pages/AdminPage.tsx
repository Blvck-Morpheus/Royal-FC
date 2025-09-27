import { useState } from "react";
import { Helmet } from "react-helmet";
import AdminLogin from "@/components/AdminLogin";
import TournamentManagement from "@/components/TournamentManagement";
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

      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h1 className="font-montserrat font-bold text-3xl text-royal-blue">Admin Panel</h1>
            <p className="text-gray-600 mt-2">Manage match results, player stats, and tournaments</p>
          </div>

          {!user ? (
            <div className="max-w-md mx-auto">
              <AdminLogin onLoginSuccess={handleLoginSuccess} />
            </div>
          ) : (
            <div className="space-y-8">
              <div className="bg-white rounded-lg shadow-xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-xl font-bold">Welcome, {user.username}!</h2>
                    <p className="text-gray-600">Role: {user.role}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Logout
                  </button>
                </div>
              </div>
              
              <TournamentManagement />
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default AdminPage;
