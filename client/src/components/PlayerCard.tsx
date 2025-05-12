import { Link } from "wouter";
import { Player } from "@shared/schema";

interface PlayerCardProps {
  player: Player;
}

const PlayerCard = ({ player }: PlayerCardProps) => {
  const getPositionLabel = (position: string) => {
    switch (position.toLowerCase()) {
      case "goalkeeper": return "GK";
      case "defender": return "DEF";
      case "midfielder": return "MID";
      case "forward": return "FWD";
      default: return position;
    }
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="h-48 bg-gray-200 relative overflow-hidden">
        {player.photoUrl ? (
          <img 
            src={player.photoUrl} 
            alt={player.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-royal-blue/10">
            <i className="ri-user-line text-4xl text-royal-blue/30"></i>
          </div>
        )}
        <div className="absolute top-0 right-0 bg-royal-gold text-royal-blue px-2 py-1 text-sm font-bold">
          {getPositionLabel(player.position)}
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-montserrat font-bold text-lg">{player.name}</h3>
          <span className="bg-royal-blue text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
            {player.jerseyNumber}
          </span>
        </div>
        
        <div className="grid grid-cols-3 gap-2 mb-4">
          {player.position === "Goalkeeper" ? (
            <>
              <div className="text-center">
                <p className="text-xs text-gray-500">Clean Sheets</p>
                <p className="font-bold text-royal-blue">{player.stats.cleanSheets || 0}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Saves</p>
                <p className="font-bold text-royal-blue">{player.stats.saves || 0}</p>
              </div>
            </>
          ) : (
            <>
              <div className="text-center">
                <p className="text-xs text-gray-500">Goals</p>
                <p className="font-bold text-royal-blue">{player.stats.goals || 0}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">{player.position === "Defender" ? "Tackles" : "Assists"}</p>
                <p className="font-bold text-royal-blue">
                  {player.position === "Defender" ? player.stats.tackles || 0 : player.stats.assists || 0}
                </p>
              </div>
            </>
          )}
          <div className="text-center">
            <p className="text-xs text-gray-500">Games</p>
            <p className="font-bold text-royal-blue">{player.stats.gamesPlayed || 0}</p>
          </div>
        </div>
        
        <Link href={`/players/${player.id}`}>
          <a className="block text-center text-royal-blue hover:text-royal-gold transition duration-200 text-sm font-semibold">
            View Full Profile
          </a>
        </Link>
      </div>
    </div>
  );
};

export default PlayerCard;
