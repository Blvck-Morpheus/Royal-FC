import { useState } from "react";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import { Tournament } from "@shared/schema";
import TournamentCard from "@/components/TournamentCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TournamentsPage = () => {
  const [activeTab, setActiveTab] = useState("active");
  
  const { data: tournaments, isLoading, error } = useQuery<Tournament[]>({
    queryKey: ['/api/tournaments'],
  });

  const activeTournaments = tournaments?.filter(t => t.status === "active") || [];
  const pastTournaments = tournaments?.filter(t => t.status === "completed") || [];

  return (
    <>
      <Helmet>
        <title>Tournaments | Royal FC Asaba</title>
        <meta name="description" content="Follow our exciting football tournaments, view fixtures, results and leaderboards for Royal FC Asaba's competitions." />
      </Helmet>
      
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h1 className="font-montserrat font-bold text-3xl text-royal-blue">Tournaments</h1>
            <p className="text-gray-600 mt-2">Follow our exciting internal competitions</p>
          </div>
          
          {/* Tournament Tabs */}
          <div className="mb-8 max-w-xl mx-auto">
            <Tabs defaultValue="active" onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="active">Active Tournaments</TabsTrigger>
                <TabsTrigger value="past">Past Tournaments</TabsTrigger>
              </TabsList>
              
              <TabsContent value="active">
                {isLoading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Loading tournaments...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-8 text-red-500">
                    <p>Error loading tournaments: {(error as Error).message}</p>
                  </div>
                ) : activeTournaments.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                    {activeTournaments.map(tournament => (
                      <TournamentCard key={tournament.id} tournament={tournament} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No active tournaments at the moment.</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="past">
                {isLoading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Loading tournaments...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-8 text-red-500">
                    <p>Error loading tournaments: {(error as Error).message}</p>
                  </div>
                ) : pastTournaments.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                    {pastTournaments.map(tournament => (
                      <TournamentCard key={tournament.id} tournament={tournament} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No past tournaments available.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>
    </>
  );
};

export default TournamentsPage;
