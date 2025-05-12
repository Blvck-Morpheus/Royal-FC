import { Link } from "wouter";
import { Tournament, TournamentTeam } from "@shared/schema";

interface TournamentCardProps {
  tournament: Tournament;
}

const TournamentCard = ({ tournament }: TournamentCardProps) => {
  const isActive = tournament.status === "active";
  
  return (
    <div className="bg-royal-light rounded-lg overflow-hidden shadow-lg border border-gray-200">
      <div className="bg-royal-blue p-4">
        <div className="flex justify-between items-center text-white">
          <h3 className="font-montserrat font-bold text-xl">{tournament.name}</h3>
          <span className={`px-2 py-1 rounded text-royal-blue text-sm font-bold ${isActive ? 'bg-royal-gold' : 'bg-gray-300'}`}>
            {isActive ? 'Active' : 'Completed'}
          </span>
        </div>
        <p className="text-royal-gold mt-1 text-sm">
          {new Date(tournament.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - 
          {new Date(tournament.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>
      
      <div className="p-6">
        <div className="mb-6">
          <h4 className="font-montserrat font-semibold mb-3 text-royal-blue">Tournament Standings</h4>
          <div className="bg-white rounded-md shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Team</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">P</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">W</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">D</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">L</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Pts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tournament.teams
                  .sort((a, b) => b.points - a.points)
                  .map((team, index) => (
                    <tr key={team.id}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                        {team.name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                        {team.played}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                        {team.won}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                        {team.drawn}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                        {team.lost}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-center font-bold">
                        {team.points}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="text-center">
          <Link href={`/tournaments/${tournament.id}`}>
            <a className="inline-flex items-center text-royal-blue font-semibold hover:text-royal-gold transition duration-200">
              View Full Tournament <i className="ri-arrow-right-line ml-1"></i>
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TournamentCard;
