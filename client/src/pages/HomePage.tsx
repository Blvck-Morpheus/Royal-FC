import { Helmet } from "react-helmet";
import Hero from "@/components/Hero";
import UpcomingFixtures from "@/components/UpcomingFixtures";
import { Link } from "wouter";

const HomePage = () => {
  return (
    <>
      <Helmet>
        <title>Royal FC Asaba | United Local FC Hub</title>
        <meta name="description" content="Royal FC Asaba - Fostering community, fitness, and competitive unity through football in Asaba. Join our amateur football club community." />
      </Helmet>
      
      <Hero />
      <UpcomingFixtures />
      
      {/* Quick Links Section */}
      <section className="py-12 bg-royal-light">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link href="/players">
              <a className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-royal-blue/10 flex items-center justify-center text-royal-blue mr-4">
                    <i className="ri-team-line text-2xl"></i>
                  </div>
                  <h3 className="font-montserrat font-bold text-xl text-royal-blue">Players</h3>
                </div>
                <p className="text-gray-600">Meet our talented roster of players who make Royal FC special</p>
                <div className="mt-4 text-royal-blue font-medium inline-flex items-center">
                  View Players <i className="ri-arrow-right-line ml-1"></i>
                </div>
              </a>
            </Link>
            
            <Link href="/tournaments">
              <a className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-royal-blue/10 flex items-center justify-center text-royal-blue mr-4">
                    <i className="ri-trophy-line text-2xl"></i>
                  </div>
                  <h3 className="font-montserrat font-bold text-xl text-royal-blue">Tournaments</h3>
                </div>
                <p className="text-gray-600">Follow our exciting internal competitions and match fixtures</p>
                <div className="mt-4 text-royal-blue font-medium inline-flex items-center">
                  View Tournaments <i className="ri-arrow-right-line ml-1"></i>
                </div>
              </a>
            </Link>
            
            <Link href="/team-generator">
              <a className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-royal-blue/10 flex items-center justify-center text-royal-blue mr-4">
                    <i className="ri-shuffle-line text-2xl"></i>
                  </div>
                  <h3 className="font-montserrat font-bold text-xl text-royal-blue">Team Generator</h3>
                </div>
                <p className="text-gray-600">Create balanced teams for your next match with our smart tool</p>
                <div className="mt-4 text-royal-blue font-medium inline-flex items-center">
                  Generate Teams <i className="ri-arrow-right-line ml-1"></i>
                </div>
              </a>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Club Stats Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h2 className="font-montserrat font-bold text-3xl text-royal-blue">Royal FC in Numbers</h2>
            <p className="text-gray-600 mt-2">Our community's growth and achievements</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-royal-light rounded-lg p-6 text-center">
              <div className="text-4xl font-bold text-royal-blue mb-2">40+</div>
              <p className="text-gray-600">Active Members</p>
            </div>
            
            <div className="bg-royal-light rounded-lg p-6 text-center">
              <div className="text-4xl font-bold text-royal-blue mb-2">12+</div>
              <p className="text-gray-600">Tournaments Hosted</p>
            </div>
            
            <div className="bg-royal-light rounded-lg p-6 text-center">
              <div className="text-4xl font-bold text-royal-blue mb-2">3</div>
              <p className="text-gray-600">Training Sessions Weekly</p>
            </div>
            
            <div className="bg-royal-light rounded-lg p-6 text-center">
              <div className="text-4xl font-bold text-royal-blue mb-2">2+</div>
              <p className="text-gray-600">Years of Community</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Join Us CTA */}
      <section className="py-16 bg-royal-blue text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-montserrat font-bold text-3xl mb-4">Ready to Join Royal FC?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">Whether you're looking to improve your skills, stay fit, or just have fun, our football community welcomes you</p>
          <Link href="/contact">
            <a className="inline-block bg-royal-gold text-royal-blue font-bold py-3 px-8 rounded-md hover:bg-yellow-400 transition duration-200 text-lg">
              Join Us Today
            </a>
          </Link>
        </div>
      </section>
    </>
  );
};

export default HomePage;
