import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Fixture } from "@shared/schema";
import { format } from "date-fns";

const LiveMatchUpdates = () => {
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());

  // Poll for active matches every 30 seconds
  const { data: activeMatches, isLoading, error } = useQuery<Fixture[]>({
    queryKey: ['/api/fixtures/active'],
    refetchInterval: 30000, // 30 seconds
  });

  // Update the last refresh time whenever we get new data
  useEffect(() => {
    if (activeMatches) {
      setLastUpdateTime(new Date());
    }
  }, [activeMatches]);

  if (isLoading) {
    return (
      <section className="py-8 text-white" style={{ backgroundColor: '#0c3b80' }}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-montserrat font-bold text-2xl">Live Matches</h2>
            <span className="text-xs text-royal-gold">
              Loading match data...
            </span>
          </div>
          <div className="animate-pulse bg-white/10 rounded-lg h-32"></div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-8 text-white" style={{ backgroundColor: '#0c3b80' }}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-montserrat font-bold text-2xl">Live Matches</h2>
            <span className="text-xs text-royal-gold">
              Error loading matches
            </span>
          </div>
          <div className="bg-white/10 p-4 rounded-lg">
            <p>Unable to load live match data. Please try again later.</p>
          </div>
        </div>
      </section>
    );
  }

  if (!activeMatches || activeMatches.length === 0) {
    return null; // Don't show the section if no active matches
  }

  return (
    <section className="py-8 text-white" style={{ backgroundColor: '#0c3b80' }}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-montserrat font-bold text-2xl">Live Matches</h2>
          <span className="text-xs text-royal-gold">
            Last updated: {format(lastUpdateTime, 'h:mm:ss a')}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeMatches.map((match) => (
            <div key={match.id} className="bg-white/10 p-4 rounded-lg hover:bg-white/20 transition-colors duration-200">
              <div className="text-center text-royal-gold text-sm mb-2">
                {match.tournamentName} • {format(new Date(match.date), 'MMM d, yyyy')}
              </div>

              <div className="flex justify-between items-center">
                <div className="text-center flex-1">
                  <p className="font-semibold text-lg">{match.homeTeamName}</p>
                  <div className="mt-1 text-xs opacity-75">
                    {match.homeTeamCaptain && <p>Captain: {match.homeTeamCaptain}</p>}
                  </div>
                </div>

                <div className="flex-shrink-0 mx-4">
                  <div className="flex items-center space-x-2">
                    <div className="bg-royal-gold text-royal-blue font-bold text-2xl rounded-md w-12 h-12 flex items-center justify-center">
                      {match.homeTeamScore ?? 0}
                    </div>
                    <span className="text-sm">vs</span>
                    <div className="bg-royal-gold text-royal-blue font-bold text-2xl rounded-md w-12 h-12 flex items-center justify-center">
                      {match.awayTeamScore ?? 0}
                    </div>
                  </div>
                  <div className="text-center mt-1">
                    <span className="inline-flex items-center text-xs bg-green-500 text-white px-2 py-1 rounded">
                      <span className="animate-pulse h-2 w-2 bg-white rounded-full mr-1"></span> LIVE
                    </span>
                  </div>
                </div>

                <div className="text-center flex-1">
                  <p className="font-semibold text-lg">{match.awayTeamName}</p>
                  <div className="mt-1 text-xs opacity-75">
                    {match.awayTeamCaptain && <p>Captain: {match.awayTeamCaptain}</p>}
                  </div>
                </div>
              </div>

              <div className="mt-4 text-center text-sm">
                <p>
                  <i className="ri-map-pin-line mr-1"></i> {match.location}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center text-sm mt-4">
          <p>Scores automatically update every 30 seconds</p>
        </div>
      </div>
    </section>
  );
};

export default LiveMatchUpdates;