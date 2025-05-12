import { Helmet } from "react-helmet";
import TeamGeneratorForm from "@/components/TeamGeneratorForm";

const TeamGeneratorPage = () => {
  return (
    <>
      <Helmet>
        <title>Team Generator | Asaba All-stars Club</title>
        <meta name="description" content="Create perfectly balanced teams for competition or training with our advanced team generator. Track performance and foster game time competition." />
      </Helmet>
      
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h1 className="font-montserrat font-bold text-3xl text-royal-blue">Team Generator</h1>
            <p className="text-gray-600 mt-2">Create balanced teams and track competition results</p>
          </div>
          
          <TeamGeneratorForm />
          
          <div className="max-w-4xl mx-auto mt-10">
            <div className="bg-royal-light rounded-lg p-6">
              <h3 className="font-montserrat font-semibold text-xl text-royal-blue mb-4">How It Works</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Select your preferred format (5-a-side, 7-a-side, or 11-a-side)</li>
                <li>Choose the players who will participate in the match</li>
                <li>Adjust advanced settings to enable competition mode and balancing options</li>
                <li>Click "Generate Teams" to create balanced teams based on your preferences</li>
                <li>Record match results to build player and team statistics over time</li>
              </ol>
              
              <div className="mt-6 bg-white rounded-lg p-4 border border-royal-blue/20">
                <h4 className="font-montserrat font-semibold text-lg text-royal-bright-blue mb-2">New: Competition Mode</h4>
                <p className="text-sm text-gray-700 mb-3">
                  Our enhanced team generator now includes competition features to foster friendly rivalry and track performance:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                  <li>Player skill ratings determine balanced team distribution</li>
                  <li>Record match results to track individual and team performance</li>
                  <li>System automatically balances teams based on past performance</li>
                  <li>Support for up to 4 teams with different balancing methods</li>
                  <li>Identify team captains based on skill and experience</li>
                </ul>
                <p className="mt-4 text-sm text-gray-600 font-bold">
                 Use the "Advanced Competition" tab to access all competition features.
                </p>
              </div>
              
              <p className="mt-6 text-sm text-gray-600">
                Our algorithm creates fair teams by distributing players evenly based on position, skill level, and past performance. 
                For best results, select an appropriate number of players for your chosen format and enable competition mode to 
                track results over time.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default TeamGeneratorPage;
