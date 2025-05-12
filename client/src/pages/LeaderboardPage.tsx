import { Helmet } from "react-helmet";
import LeaderboardTable from "@/components/LeaderboardTable";

const LeaderboardPage = () => {
  return (
    <>
      <Helmet>
        <title>Leaderboard | Royal FC Asaba</title>
        <meta name="description" content="See the top performers in our club across various statistics including goals, assists, and clean sheets." />
      </Helmet>
      
      <section className="py-12 bg-royal-light">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h1 className="font-montserrat font-bold text-3xl text-royal-blue">Leaderboard</h1>
            <p className="text-gray-600 mt-2">Top performers across all tournaments</p>
          </div>
          
          <LeaderboardTable />
          
          <div className="text-center mt-8">
            <p className="text-gray-600 text-sm italic mt-4">
              Stats are updated automatically after each match result is entered by admins
            </p>
          </div>
        </div>
      </section>
    </>
  );
};

export default LeaderboardPage;
