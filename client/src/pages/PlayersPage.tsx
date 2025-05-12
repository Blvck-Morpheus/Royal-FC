import { useState } from "react";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import { Player } from "@shared/schema";
import PlayerCard from "@/components/PlayerCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PlayersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [positionFilter, setPositionFilter] = useState("");
  
  const { data: players, isLoading, error } = useQuery<Player[]>({
    queryKey: ['/api/players'],
  });

  const filteredPlayers = players?.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPosition = positionFilter === "" || player.position.toLowerCase() === positionFilter.toLowerCase();
    return matchesSearch && matchesPosition;
  });

  return (
    <>
      <Helmet>
        <title>Players | Royal FC Asaba</title>
        <meta name="description" content="Meet the talented players who make up Royal FC Asaba, with detailed player profiles and statistics." />
      </Helmet>
      
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h1 className="font-montserrat font-bold text-3xl text-royal-blue">Our Players</h1>
            <p className="text-gray-600 mt-2">Meet the talent that makes Royal FC special</p>
          </div>
          
          {/* Player Search and Filter */}
          <div className="mb-8 max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Search players..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2"
                    />
                    <i className="ri-search-line absolute left-3 top-3 text-gray-400"></i>
                  </div>
                </div>
                
                <div className="md:w-1/3">
                  <Select value={positionFilter} onValueChange={setPositionFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Positions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Positions</SelectItem>
                      <SelectItem value="goalkeeper">Goalkeeper</SelectItem>
                      <SelectItem value="defender">Defender</SelectItem>
                      <SelectItem value="midfielder">Midfielder</SelectItem>
                      <SelectItem value="forward">Forward</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
          
          {/* Players Grid */}
          {isLoading ? (
            <div className="text-center py-10">
              <p className="text-gray-600">Loading players...</p>
            </div>
          ) : error ? (
            <div className="text-center py-10 text-red-500">
              <p>Error loading players: {(error as Error).message}</p>
            </div>
          ) : filteredPlayers && filteredPlayers.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredPlayers.map(player => (
                  <PlayerCard key={player.id} player={player} />
                ))}
              </div>
              
              {filteredPlayers.length < (players?.length || 0) && (
                <div className="text-center mt-6">
                  <p className="text-gray-600">
                    Showing {filteredPlayers.length} of {players?.length} players
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-600">No players found matching your filters.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default PlayersPage;
