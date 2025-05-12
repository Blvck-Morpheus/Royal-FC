import { Helmet } from "react-helmet";
import TeamGeneratorForm from "@/components/TeamGeneratorForm";

const TeamGeneratorPage = () => {
  return (
    <>
      <Helmet>
        <title>Team Generator | Royal FC Asaba</title>
        <meta name="description" content="Create balanced teams for your next match with our smart team generator tool. Select players and generate fair teams." />
      </Helmet>
      
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h1 className="font-montserrat font-bold text-3xl text-royal-blue">Team Generator</h1>
            <p className="text-gray-600 mt-2">Create balanced teams for your next match</p>
          </div>
          
          <TeamGeneratorForm />
          
          <div className="max-w-4xl mx-auto mt-10">
            <div className="bg-royal-light rounded-lg p-6">
              <h3 className="font-montserrat font-semibold text-xl text-royal-blue mb-4">How It Works</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Select your preferred format (5-a-side, 7-a-side, or 11-a-side)</li>
                <li>Choose the players who will participate in the match</li>
                <li>Click "Generate Teams" to create balanced teams based on player skills and positions</li>
                <li>You can regenerate if you're not happy with the selection</li>
                <li>Save the teams to keep a record for future reference</li>
              </ol>
              <p className="mt-4 text-sm text-gray-600">
                Our algorithm attempts to create fair teams by distributing players evenly based on position and skill level. 
                For best results, make sure to select an even number of players appropriate for your chosen format.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default TeamGeneratorPage;
