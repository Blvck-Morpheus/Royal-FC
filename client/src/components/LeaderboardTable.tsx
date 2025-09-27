import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Player } from "@shared/schema";

type LeaderboardCategory = "goals" | "assists" | "cleanSheets";

const LeaderboardTable = () => {
  const [category, setCategory] = useState<LeaderboardCategory>("goals");

  // Fetch players for leaderboard
  const { data: players = [], isLoading, error } = useQuery<Player[]>({
    queryKey: ["/api/players"],
  });

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading leaderboard...</div>;
  }

  if (error) {
    return <div className="flex justify-center p-8 text-red-600">Error loading leaderboard data</div>;
  }

  // Sort players by selected category
  const sortedPlayers = [...players].sort((a, b) => {
    const aValue = (a.stats as any)?.[category] || 0;
    const bValue = (b.stats as any)?.[category] || 0;
    return bValue - aValue;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-center space-x-4 mb-6">
        <button
          onClick={() => setCategory("goals")}
          className={`px-4 py-2 rounded ${category === "goals" ? "bg-royal-blue text-white" : "bg-gray-200"}`}
        >
          Goals
        </button>
        <button
          onClick={() => setCategory("assists")}
          className={`px-4 py-2 rounded ${category === "assists" ? "bg-royal-blue text-white" : "bg-gray-200"}`}
        >
          Assists
        </button>
        <button
          onClick={() => setCategory("cleanSheets")}
          className={`px-4 py-2 rounded ${category === "cleanSheets" ? "bg-royal-blue text-white" : "bg-gray-200"}`}
        >
          Clean Sheets
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded-lg shadow">
          <thead className="bg-royal-blue text-white">
            <tr>
              <th className="px-6 py-3 text-left">Rank</th>
              <th className="px-6 py-3 text-left">Player</th>
              <th className="px-6 py-3 text-left">Position</th>
              <th className="px-6 py-3 text-center">{category.charAt(0).toUpperCase() + category.slice(1)}</th>
              <th className="px-6 py-3 text-center">Games</th>
            </tr>
          </thead>
          <tbody>
            {sortedPlayers.slice(0, 10).map((player, index) => (
              <tr key={player.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4 font-bold text-royal-blue">#{index + 1}</td>
                <td className="px-6 py-4 font-medium">{player.name}</td>
                <td className="px-6 py-4">{player.position}</td>
                <td className="px-6 py-4 text-center font-bold">{(player.stats as any)?.[category] || 0}</td>
                <td className="px-6 py-4 text-center">{(player.stats as any)?.gamesPlayed || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaderboardTable;
