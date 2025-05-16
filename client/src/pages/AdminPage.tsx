import { useState } from "react";
import { Helmet } from "react-helmet";

const AdminPage = () => {

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

          <div className="max-w-md mx-auto bg-white rounded-lg shadow-xl p-6">
            <h2 className="text-xl font-bold mb-4">Admin Login</h2>
            <p className="text-gray-600 mb-6">Authentication system is being updated. Please check back soon.</p>
          </div>
        </div>
      </section>
    </>
  );
};

export default AdminPage;
