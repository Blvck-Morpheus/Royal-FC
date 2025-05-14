import { Helmet } from "react-helmet";
import Hero from "@/components/Hero";
import UpcomingFixtures from "@/components/UpcomingFixtures";
import LiveMatchUpdates from "@/components/LiveMatchUpdates";
import { Link } from "wouter";

const HomePage = () => {
  return (
    <>
      <Helmet>
        <title>Royal FC Asaba | United Local FC Hub</title>
        <meta name="description" content="Royal FC Asaba - Fostering community, fitness, and competitive unity through football in Asaba. Join our amateur football club community." />
      </Helmet>

      <Hero />
      <LiveMatchUpdates />
      <UpcomingFixtures />

      {/* Club Features Section */}
      <section className="py-20" style={{ background: 'linear-gradient(to bottom, rgba(12, 59, 128, 0.15), rgba(255, 255, 255, 0.9))' }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-montserrat font-bold text-3xl text-royal-blue relative inline-block">
              Club Features
              <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-royal-gold"></span>
            </h2>
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">Explore the key features that make our football club special</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Players Card */}
            <Link href="/players">
              <a className="group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 border-b-4 border-transparent hover:border-royal-gold relative">
                {/* Badge */}
                <div className="absolute top-3 right-3 bg-royal-gold text-royal-blue text-xs font-bold px-2 py-1 rounded-full z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  40+ Players
                </div>

                <div className="h-48 relative overflow-hidden">
                  {/* Image Background with Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-royal-blue/80 to-royal-blue/60 z-10"></div>
                  <img
                    src="https://images.unsplash.com/photo-1459865264687-595d652de67e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    alt="Football players in a team huddle"
                    className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
                  />

                  {/* Icon Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    <i className="ri-team-line text-5xl text-white opacity-90 group-hover:scale-110 transition-transform duration-300"></i>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="font-montserrat font-bold text-xl text-royal-blue group-hover:text-royal-bright-blue transition-colors duration-300 flex items-center">
                    Players
                    <span className="ml-2 w-2 h-2 rounded-full bg-royal-gold inline-block"></span>
                  </h3>
                  <p className="text-gray-600 mt-2">Meet our talented roster of players who make Royal FC special</p>
                  <div className="mt-4 text-royal-blue font-medium inline-flex items-center group-hover:translate-x-2 transition-transform duration-300">
                    View Players <i className="ri-arrow-right-line ml-1 group-hover:ml-2 transition-all duration-300"></i>
                  </div>
                </div>
              </a>
            </Link>

            {/* Tournaments Card */}
            <Link href="/tournaments">
              <a className="group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 border-b-4 border-transparent hover:border-royal-gold relative">
                {/* Badge */}
                <div className="absolute top-3 right-3 bg-royal-gold text-royal-blue text-xs font-bold px-2 py-1 rounded-full z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Active Now
                </div>

                <div className="h-48 relative overflow-hidden">
                  {/* Image Background with Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-royal-blue/80 to-royal-blue/60 z-10"></div>
                  <img
                    src="https://images.unsplash.com/photo-1579952363873-27f3bade9f55?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    alt="Football trophy and medals"
                    className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
                  />

                  {/* Icon Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    <i className="ri-trophy-line text-5xl text-white opacity-90 group-hover:scale-110 transition-transform duration-300"></i>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="font-montserrat font-bold text-xl text-royal-blue group-hover:text-royal-bright-blue transition-colors duration-300 flex items-center">
                    Tournaments
                    <span className="ml-2 w-2 h-2 rounded-full bg-royal-gold inline-block"></span>
                  </h3>
                  <p className="text-gray-600 mt-2">Follow our exciting internal competitions and match fixtures</p>
                  <div className="mt-4 text-royal-blue font-medium inline-flex items-center group-hover:translate-x-2 transition-transform duration-300">
                    View Tournaments <i className="ri-arrow-right-line ml-1 group-hover:ml-2 transition-all duration-300"></i>
                  </div>
                </div>
              </a>
            </Link>

            {/* Team Generator Card */}
            <Link href="/team-generator">
              <a className="group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 border-b-4 border-transparent hover:border-royal-gold relative">
                {/* Badge */}
                <div className="absolute top-3 right-3 bg-royal-gold text-royal-blue text-xs font-bold px-2 py-1 rounded-full z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  New Features
                </div>

                <div className="h-48 relative overflow-hidden">
                  {/* Image Background with Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-royal-blue/80 to-royal-blue/60 z-10"></div>
                  <img
                    src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    alt="Football team selection board"
                    className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
                  />

                  {/* Icon Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    <i className="ri-shuffle-line text-5xl text-white opacity-90 group-hover:scale-110 transition-transform duration-300"></i>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="font-montserrat font-bold text-xl text-royal-blue group-hover:text-royal-bright-blue transition-colors duration-300 flex items-center">
                    Team Generator
                    <span className="ml-2 w-2 h-2 rounded-full bg-royal-gold inline-block"></span>
                  </h3>
                  <p className="text-gray-600 mt-2">Create balanced teams for your next match with our smart tool</p>
                  <div className="mt-4 text-royal-blue font-medium inline-flex items-center group-hover:translate-x-2 transition-transform duration-300">
                    Generate Teams <i className="ri-arrow-right-line ml-1 group-hover:ml-2 transition-all duration-300"></i>
                  </div>
                </div>
              </a>
            </Link>

            {/* Leaderboard Card */}
            <Link href="/leaderboard">
              <a className="group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 border-b-4 border-transparent hover:border-royal-gold relative">
                {/* Badge */}
                <div className="absolute top-3 right-3 bg-royal-gold text-royal-blue text-xs font-bold px-2 py-1 rounded-full z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Updated Weekly
                </div>

                <div className="h-48 relative overflow-hidden">
                  {/* Image Background with Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-royal-blue/80 to-royal-blue/60 z-10"></div>
                  <img
                    src="https://images.unsplash.com/photo-1560272564-c83b66b1ad12?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    alt="Football statistics and leaderboard"
                    className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
                  />

                  {/* Icon Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    <i className="ri-bar-chart-grouped-line text-5xl text-white opacity-90 group-hover:scale-110 transition-transform duration-300"></i>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="font-montserrat font-bold text-xl text-royal-blue group-hover:text-royal-bright-blue transition-colors duration-300 flex items-center">
                    Leaderboard
                    <span className="ml-2 w-2 h-2 rounded-full bg-royal-gold inline-block"></span>
                  </h3>
                  <p className="text-gray-600 mt-2">Track player stats and see who tops our performance rankings</p>
                  <div className="mt-4 text-royal-blue font-medium inline-flex items-center group-hover:translate-x-2 transition-transform duration-300">
                    View Leaderboard <i className="ri-arrow-right-line ml-1 group-hover:ml-2 transition-all duration-300"></i>
                  </div>
                </div>
              </a>
            </Link>
          </div>
        </div>
      </section>

      {/* Club Stats Section - Asaba Style */}
      <section className="py-20 relative overflow-hidden">
        {/* Background with cultural pattern */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(135deg, rgba(12, 59, 128, 0.05) 0%, rgba(255, 215, 0, 0.05) 100%)',
          backgroundSize: '10px 10px',
          backgroundImage: `repeating-linear-gradient(45deg, rgba(12, 59, 128, 0.1) 0, rgba(12, 59, 128, 0.1) 1px, transparent 0, transparent 50%)`
        }}></div>

        {/* River Niger-inspired wave decoration */}
        <div className="absolute bottom-0 left-0 right-0 h-12 opacity-20" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="20" viewBox="0 0 100 20" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M0 10 C30 20, 70 0, 100 10 L100 0 L0 0 Z" fill="%230c3b80"/%3E%3C/svg%3E")',
          backgroundSize: '100px 20px',
          backgroundRepeat: 'repeat-x'
        }}></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="mb-16 text-center">
            <div className="inline-block relative">
              <h2 className="font-montserrat font-bold text-4xl text-royal-blue relative inline-block">
                Royal FC by the Numbers
              </h2>
              {/* Nigerian flag-inspired underline */}
              <div className="flex justify-center mt-2">
                <div className="h-1.5 w-12 bg-green-600 rounded-l-full"></div>
                <div className="h-1.5 w-12 bg-white"></div>
                <div className="h-1.5 w-12 bg-green-600 rounded-r-full"></div>
              </div>
            </div>
            <p className="text-gray-700 mt-6 max-w-2xl mx-auto font-medium">Our Asaba football community continues to grow stronger with each passing season</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {/* Active Members Stat - Asaba Style */}
            <div className="group">
              <div className="rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500 transform group-hover:-translate-y-2 bg-gradient-to-br from-white to-blue-50 border-2 border-royal-blue/20 group-hover:border-royal-gold">
                {/* Cultural pattern top */}
                <div className="h-3 w-full bg-royal-gold"></div>

                {/* Content with vibrant styling */}
                <div className="p-6 pt-8 text-center">
                  {/* Icon with cultural styling */}
                  <div className="relative inline-block mb-4">
                    <div className="absolute inset-0 rounded-full bg-yellow-400/20 scale-150 animate-pulse"></div>
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-royal-blue to-royal-bright-blue flex items-center justify-center relative mx-auto">
                      <i className="ri-user-line text-3xl text-white"></i>
                    </div>
                  </div>

                  {/* Counter with cultural flair */}
                  <div className="mt-4">
                    <div className="text-5xl font-bold text-royal-blue mb-1">40+</div>
                    <div className="flex justify-center space-x-1 mb-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-royal-gold"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-royal-gold"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-royal-gold"></span>
                    </div>
                    <p className="text-gray-700 font-medium">Asaba Players</p>
                    <p className="text-xs text-royal-blue mt-1 italic">...and growing!</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Matches Played Stat - Asaba Style */}
            <div className="group">
              <div className="rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500 transform group-hover:-translate-y-2 bg-gradient-to-br from-white to-blue-50 border-2 border-royal-blue/20 group-hover:border-royal-gold">
                {/* Cultural pattern top */}
                <div className="h-3 w-full bg-royal-gold"></div>

                {/* Content with vibrant styling */}
                <div className="p-6 pt-8 text-center">
                  {/* Icon with cultural styling */}
                  <div className="relative inline-block mb-4">
                    <div className="absolute inset-0 rounded-full bg-yellow-400/20 scale-150 animate-pulse"></div>
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-royal-blue to-royal-bright-blue flex items-center justify-center relative mx-auto">
                      <i className="ri-football-line text-3xl text-white"></i>
                    </div>
                  </div>

                  {/* Counter with cultural flair */}
                  <div className="mt-4">
                    <div className="text-5xl font-bold text-royal-blue mb-1">25+</div>
                    <div className="flex justify-center space-x-1 mb-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-royal-gold"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-royal-gold"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-royal-gold"></span>
                    </div>
                    <p className="text-gray-700 font-medium">Exciting Matches</p>
                    <p className="text-xs text-royal-blue mt-1 italic">...full of goals!</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Training Sessions Stat - Asaba Style */}
            <div className="group">
              <div className="rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500 transform group-hover:-translate-y-2 bg-gradient-to-br from-white to-blue-50 border-2 border-royal-blue/20 group-hover:border-royal-gold">
                {/* Cultural pattern top */}
                <div className="h-3 w-full bg-royal-gold"></div>

                {/* Content with vibrant styling */}
                <div className="p-6 pt-8 text-center">
                  {/* Icon with cultural styling */}
                  <div className="relative inline-block mb-4">
                    <div className="absolute inset-0 rounded-full bg-yellow-400/20 scale-150 animate-pulse"></div>
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-royal-blue to-royal-bright-blue flex items-center justify-center relative mx-auto">
                      <i className="ri-calendar-line text-3xl text-white"></i>
                    </div>
                  </div>

                  {/* Counter with cultural flair */}
                  <div className="mt-4">
                    <div className="text-5xl font-bold text-royal-blue mb-1">2</div>
                    <div className="flex justify-center space-x-1 mb-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-royal-gold"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-royal-gold"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-royal-gold"></span>
                    </div>
                    <p className="text-gray-700 font-medium">Weekly Trainings</p>
                    <p className="text-xs text-royal-blue mt-1 italic">...rain or shine!</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Years of Community Stat - Asaba Style */}
            <div className="group">
              <div className="rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500 transform group-hover:-translate-y-2 bg-gradient-to-br from-white to-blue-50 border-2 border-royal-blue/20 group-hover:border-royal-gold">
                {/* Cultural pattern top */}
                <div className="h-3 w-full bg-royal-gold"></div>

                {/* Content with vibrant styling */}
                <div className="p-6 pt-8 text-center">
                  {/* Icon with cultural styling */}
                  <div className="relative inline-block mb-4">
                    <div className="absolute inset-0 rounded-full bg-yellow-400/20 scale-150 animate-pulse"></div>
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-royal-blue to-royal-bright-blue flex items-center justify-center relative mx-auto">
                      <i className="ri-award-line text-3xl text-white"></i>
                    </div>
                  </div>

                  {/* Counter with cultural flair */}
                  <div className="mt-4">
                    <div className="text-5xl font-bold text-royal-blue mb-1">5+</div>
                    <div className="flex justify-center space-x-1 mb-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-royal-gold"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-royal-gold"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-royal-gold"></span>
                    </div>
                    <p className="text-gray-700 font-medium">Years in Asaba</p>
                    <p className="text-xs text-royal-blue mt-1 italic">...since 2018!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Stats with Cultural Flair */}
          <div className="mt-12 max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-royal-blue to-royal-bright-blue rounded-2xl shadow-lg p-8 text-white relative overflow-hidden">
              {/* Cultural pattern overlay */}
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: 'url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%23ffffff" fill-opacity="1" fill-rule="evenodd"%3E%3Cpath d="M0 20 L20 0 L40 20 L20 40 Z"/%3E%3C/g%3E%3C/svg%3E")',
                backgroundSize: '40px 40px'
              }}></div>

              <h3 className="text-2xl font-bold mb-3 text-center relative">
                <span className="relative inline-block">
                  Asaba Football Pride
                  <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-royal-gold"></div>
                </span>
              </h3>
              <p className="text-white/90 text-center max-w-3xl mx-auto mb-8">
                Royal FC is more than just a football club - we're a vital part of Asaba's community spirit.
                Our club brings together people from all parts of the city, creating lasting friendships and promoting healthy competition.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                {/* Tournament Trophies - Enhanced with cultural elements and functionality */}
                <Link href="/tournaments">
                  <a className="block text-center transform transition-transform duration-300 hover:scale-105">
                    <div className="bg-white/20 rounded-xl p-5 backdrop-blur-sm border-2 border-white/10 hover:border-royal-gold/50 transition-colors duration-300">
                      {/* Icon with cultural styling */}
                      <div className="relative mx-auto mb-3">
                        {/* Decorative pattern */}
                        <div className="absolute inset-0 w-full h-full rounded-full opacity-30"
                          style={{
                            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M15 0 L30 15 L15 30 L0 15 Z" fill="%23ffffff"/%3E%3C/svg%3E")',
                            backgroundSize: '10px 10px',
                            transform: 'rotate(45deg)'
                          }}>
                        </div>

                        {/* Image container with traditional styling */}
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-royal-gold to-yellow-400 flex items-center justify-center mx-auto relative shadow-lg border-4 border-white/30 overflow-hidden">
                          <img
                            src="https://images.unsplash.com/photo-1560272564-c83b66b1ad12?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
                            alt="Royal FC Trophy"
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-royal-blue/30 flex items-center justify-center">
                            <i className="ri-medal-line text-2xl text-white"></i>
                          </div>
                        </div>

                        {/* Decorative beads */}
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                          <div className="w-3 h-3 rounded-full bg-white shadow-lg"></div>
                        </div>
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
                          <div className="w-3 h-3 rounded-full bg-white shadow-lg"></div>
                        </div>
                        <div className="absolute left-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                          <div className="w-3 h-3 rounded-full bg-white shadow-lg"></div>
                        </div>
                        <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2">
                          <div className="w-3 h-3 rounded-full bg-white shadow-lg"></div>
                        </div>
                      </div>

                      {/* Counter with cultural flair */}
                      <div className="text-3xl font-bold mb-1">12</div>
                      <div className="flex justify-center space-x-1 mb-2">
                        <span className="w-1 h-1 rounded-full bg-royal-gold"></span>
                        <span className="w-1 h-1 rounded-full bg-royal-gold"></span>
                        <span className="w-1 h-1 rounded-full bg-royal-gold"></span>
                      </div>
                      <p className="text-sm text-white font-medium">Tournament Trophies</p>
                      <p className="text-xs text-white/70 mt-1 italic">Asaba Champions League</p>

                      {/* Clear title and view link */}
                      <div className="mt-4 pt-3 border-t border-white/20">
                        <div className="bg-royal-blue py-1 px-2 rounded mb-2 -mx-2 shadow-md relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-royal-blue to-royal-bright-blue"></div>
                          <p className="font-bold text-white text-sm relative z-10">CLUB ACHIEVEMENTS</p>
                        </div>
                        <div className="inline-flex items-center text-royal-gold text-xs font-medium">
                          View Tournaments <i className="ri-arrow-right-line ml-1"></i>
                        </div>
                      </div>
                    </div>
                  </a>
                </Link>

                {/* Asaba Locations - Enhanced with cultural elements and functionality */}
                <Link href="/about">
                  <a className="block text-center transform transition-transform duration-300 hover:scale-105">
                    <div className="bg-white/20 rounded-xl p-5 backdrop-blur-sm border-2 border-white/10 hover:border-royal-gold/50 transition-colors duration-300">
                      {/* Icon with cultural styling */}
                      <div className="relative mx-auto mb-3">
                        {/* Decorative pattern */}
                        <div className="absolute inset-0 w-full h-full rounded-full opacity-30"
                          style={{
                            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M15 0 L30 15 L15 30 L0 15 Z" fill="%23ffffff"/%3E%3C/svg%3E")',
                            backgroundSize: '10px 10px',
                            transform: 'rotate(45deg)'
                          }}>
                        </div>

                        {/* Image container with traditional styling */}
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-royal-gold to-yellow-400 flex items-center justify-center mx-auto relative shadow-lg border-4 border-white/30 overflow-hidden">
                          <img
                            src="https://images.unsplash.com/photo-1580244923138-9e8e3ab8237c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
                            alt="Asaba Stadium"
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-royal-blue/30 flex items-center justify-center">
                            <i className="ri-map-pin-line text-2xl text-white"></i>
                          </div>
                        </div>

                        {/* Decorative beads */}
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                          <div className="w-3 h-3 rounded-full bg-white shadow-lg"></div>
                        </div>
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
                          <div className="w-3 h-3 rounded-full bg-white shadow-lg"></div>
                        </div>
                        <div className="absolute left-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                          <div className="w-3 h-3 rounded-full bg-white shadow-lg"></div>
                        </div>
                        <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2">
                          <div className="w-3 h-3 rounded-full bg-white shadow-lg"></div>
                        </div>
                      </div>

                      {/* Counter with cultural flair */}
                      <div className="text-3xl font-bold mb-1">3</div>
                      <div className="flex justify-center space-x-1 mb-2">
                        <span className="w-1 h-1 rounded-full bg-royal-gold"></span>
                        <span className="w-1 h-1 rounded-full bg-royal-gold"></span>
                        <span className="w-1 h-1 rounded-full bg-royal-gold"></span>
                      </div>
                      <p className="text-sm text-white font-medium">Asaba Locations</p>
                      <p className="text-xs text-white/70 mt-1 italic">Stephen Keshi Stadium</p>

                      {/* Clear title and view link */}
                      <div className="mt-4 pt-3 border-t border-white/20">
                        <div className="bg-royal-blue py-1 px-2 rounded mb-2 -mx-2 shadow-md relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-royal-blue to-royal-bright-blue"></div>
                          <p className="font-bold text-white text-sm relative z-10">TRAINING GROUNDS</p>
                        </div>
                        <div className="inline-flex items-center text-royal-gold text-xs font-medium">
                          View Locations <i className="ri-arrow-right-line ml-1"></i>
                        </div>
                      </div>
                    </div>
                  </a>
                </Link>

                {/* Team Categories - Enhanced with cultural elements and functionality */}
                <Link href="/team-generator">
                  <a className="block text-center transform transition-transform duration-300 hover:scale-105">
                    <div className="bg-white/20 rounded-xl p-5 backdrop-blur-sm border-2 border-white/10 hover:border-royal-gold/50 transition-colors duration-300">
                      {/* Icon with cultural styling */}
                      <div className="relative mx-auto mb-3">
                        {/* Decorative pattern */}
                        <div className="absolute inset-0 w-full h-full rounded-full opacity-30"
                          style={{
                            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M15 0 L30 15 L15 30 L0 15 Z" fill="%23ffffff"/%3E%3C/svg%3E")',
                            backgroundSize: '10px 10px',
                            transform: 'rotate(45deg)'
                          }}>
                        </div>

                        {/* Image container with traditional styling */}
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-royal-gold to-yellow-400 flex items-center justify-center mx-auto relative shadow-lg border-4 border-white/30 overflow-hidden">
                          <img
                            src="https://images.unsplash.com/photo-1577471488278-16eec37ffcc2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
                            alt="Royal FC Teams"
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-royal-blue/30 flex items-center justify-center">
                            <i className="ri-group-line text-2xl text-white"></i>
                          </div>
                        </div>

                        {/* Decorative beads */}
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                          <div className="w-3 h-3 rounded-full bg-white shadow-lg"></div>
                        </div>
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
                          <div className="w-3 h-3 rounded-full bg-white shadow-lg"></div>
                        </div>
                        <div className="absolute left-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                          <div className="w-3 h-3 rounded-full bg-white shadow-lg"></div>
                        </div>
                        <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2">
                          <div className="w-3 h-3 rounded-full bg-white shadow-lg"></div>
                        </div>
                      </div>

                      {/* Counter with cultural flair */}
                      <div className="text-3xl font-bold mb-1">4</div>
                      <div className="flex justify-center space-x-1 mb-2">
                        <span className="w-1 h-1 rounded-full bg-royal-gold"></span>
                        <span className="w-1 h-1 rounded-full bg-royal-gold"></span>
                        <span className="w-1 h-1 rounded-full bg-royal-gold"></span>
                      </div>
                      <p className="text-sm text-white font-medium">Team Categories</p>
                      <p className="text-xs text-white/70 mt-1 italic">Veterans & Youth Teams</p>

                      {/* Clear title and view link */}
                      <div className="mt-4 pt-3 border-t border-white/20">
                        <div className="bg-royal-blue py-1 px-2 rounded mb-2 -mx-2 shadow-md relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-royal-blue to-royal-bright-blue"></div>
                          <p className="font-bold text-white text-sm relative z-10">PLAYER DIVISIONS</p>
                        </div>
                        <div className="inline-flex items-center text-royal-gold text-xs font-medium">
                          Try Team Generator <i className="ri-arrow-right-line ml-1"></i>
                        </div>
                      </div>
                    </div>
                  </a>
                </Link>
              </div>

              {/* Cultural saying and call to action */}
              <div className="mt-10 text-center">
                <p className="italic text-white/90 text-lg mb-4">"Football unites Asaba like the River Niger flows through our land"</p>
                <p className="text-white/80 mb-6">Join us in celebrating our local football heritage and building a stronger community through sport</p>

                <Link href="/about">
                  <a className="inline-block bg-royal-gold text-royal-blue font-bold py-3 px-6 rounded-lg hover:bg-yellow-400 transition-all duration-300 transform hover:scale-105 shadow-lg relative">
                    <span className="relative z-10">Learn About Our History</span>
                    <span className="absolute inset-0 bg-royal-gold rounded-lg -z-0"></span>
                  </a>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Join Us CTA */}
      <section className="py-20 text-white relative overflow-hidden" style={{ background: 'linear-gradient(to right, #0c3b80, #3498db)' }}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-montserrat font-bold text-4xl mb-6">Ready to Join Royal FC?</h2>
            <p className="text-xl mb-10 leading-relaxed opacity-90">Whether you're looking to improve your skills, stay fit, or just have fun, our football community welcomes you</p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <a className="inline-block bg-royal-gold text-royal-blue font-bold py-4 px-8 rounded-lg hover:bg-yellow-400 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-lg relative">
                  <span className="relative z-10">Join Us Today</span>
                  <span className="absolute inset-0 bg-royal-gold rounded-lg -z-0"></span>
                </a>
              </Link>
              <Link href="/about">
                <a className="inline-block bg-transparent text-white border-2 border-white font-bold py-4 px-8 rounded-lg hover:bg-white/10 transition-all duration-300 transform hover:scale-105 text-lg relative">
                  <span className="relative z-10">Learn More</span>
                  <span className="absolute inset-0 bg-transparent rounded-lg -z-0"></span>
                </a>
              </Link>
            </div>

            {/* Vibrant Asaba-style info icons */}
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-lg mx-auto">
              {/* Location Icon */}
              <div className="group text-center transform transition-transform duration-300 hover:scale-105">
                <div className="relative mx-auto mb-3">
                  {/* Animated ring */}
                  <div className="absolute inset-0 rounded-full bg-royal-gold/30 animate-pulse"></div>
                  {/* Icon container with gradient */}
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-royal-gold to-yellow-400 flex items-center justify-center mx-auto relative shadow-lg">
                    <i className="ri-map-pin-line text-2xl text-royal-blue"></i>
                  </div>
                  {/* Decorative dots */}
                  <div className="absolute -right-1 -top-1 w-3 h-3 rounded-full bg-white"></div>
                  <div className="absolute -left-1 -bottom-1 w-3 h-3 rounded-full bg-white"></div>
                </div>
                <p className="text-base font-medium">Asaba, Delta State</p>
                <p className="text-xs text-white/80 mt-1">Home of champions</p>
              </div>

              {/* Training Schedule Icon */}
              <div className="group text-center transform transition-transform duration-300 hover:scale-105">
                <div className="relative mx-auto mb-3">
                  {/* Animated ring */}
                  <div className="absolute inset-0 rounded-full bg-royal-gold/30 animate-pulse"></div>
                  {/* Icon container with gradient */}
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-royal-gold to-yellow-400 flex items-center justify-center mx-auto relative shadow-lg">
                    <i className="ri-calendar-line text-2xl text-royal-blue"></i>
                  </div>
                  {/* Decorative dots */}
                  <div className="absolute -right-1 -top-1 w-3 h-3 rounded-full bg-white"></div>
                  <div className="absolute -left-1 -bottom-1 w-3 h-3 rounded-full bg-white"></div>
                </div>
                <p className="text-base font-medium">Tue & Thu, 4PM</p>
                <p className="text-xs text-white/80 mt-1">Regular training sessions</p>
              </div>

              {/* Skill Level Icon */}
              <div className="group text-center transform transition-transform duration-300 hover:scale-105">
                <div className="relative mx-auto mb-3">
                  {/* Animated ring */}
                  <div className="absolute inset-0 rounded-full bg-royal-gold/30 animate-pulse"></div>
                  {/* Icon container with gradient */}
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-royal-gold to-yellow-400 flex items-center justify-center mx-auto relative shadow-lg">
                    <i className="ri-user-add-line text-2xl text-royal-blue"></i>
                  </div>
                  {/* Decorative dots */}
                  <div className="absolute -right-1 -top-1 w-3 h-3 rounded-full bg-white"></div>
                  <div className="absolute -left-1 -bottom-1 w-3 h-3 rounded-full bg-white"></div>
                </div>
                <p className="text-base font-medium">All Skill Levels</p>
                <p className="text-xs text-white/80 mt-1">Everyone is welcome</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;
