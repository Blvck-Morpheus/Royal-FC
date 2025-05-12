import { Helmet } from "react-helmet";

const AboutPage = () => {
  return (
    <>
      <Helmet>
        <title>About | Royal FC Asaba</title>
        <meta name="description" content="Learn about Royal FC Asaba's story, vision, and journey. Founded in 2022, we foster community and fitness through football in Asaba." />
      </Helmet>
      
      <section className="py-12 bg-royal-light">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h1 className="font-montserrat font-bold text-3xl text-royal-blue">About Royal FC</h1>
            <p className="text-gray-600 mt-2">Our story, vision, and journey</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* About text content */}
            <div>
              <div className="space-y-4">
                <h2 className="font-montserrat font-bold text-2xl text-royal-blue">Our Story</h2>
                <p className="text-gray-700">Royal FC was founded in 2022 by a group of football enthusiasts in Asaba who wanted to create more than just a football club. What started as casual weekend kickabouts quickly evolved into a structured amateur club with a vision to foster community, fitness, and competitive unity.</p>
                
                <h2 className="font-montserrat font-bold text-2xl text-royal-blue pt-2">Our Vision</h2>
                <p className="text-gray-700">We aim to be the premier amateur football community in Asaba, providing a platform for players to develop their skills, build lasting friendships, and promote physical fitness through the beautiful game. Our club is built on the values of respect, teamwork, and a shared passion for football.</p>
                
                <h2 className="font-montserrat font-bold text-2xl text-royal-blue pt-2">Club Values</h2>
                <ul className="list-disc pl-5 text-gray-700 space-y-2">
                  <li><span className="font-semibold">Community:</span> Building strong bonds beyond the pitch</li>
                  <li><span className="font-semibold">Development:</span> Improving skills at all levels</li>
                  <li><span className="font-semibold">Inclusion:</span> Football for everyone who shares our passion</li>
                  <li><span className="font-semibold">Fun:</span> Enjoying the beautiful game together</li>
                  <li><span className="font-semibold">Health:</span> Promoting fitness and wellbeing</li>
                </ul>
                
                <h2 className="font-montserrat font-bold text-2xl text-royal-blue pt-4">Training Schedule</h2>
                <div className="bg-white p-4 rounded-lg shadow-sm mt-2">
                  <div className="flex items-start space-x-2 mb-3">
                    <i className="ri-calendar-line text-royal-bright-blue mt-1"></i>
                    <div>
                      <p className="font-semibold">Wednesdays</p>
                      <p className="text-gray-700">4:00 PM - 6:30 PM</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2 mb-3">
                    <i className="ri-calendar-line text-royal-bright-blue mt-1"></i>
                    <div>
                      <p className="font-semibold">Saturdays</p>
                      <p className="text-gray-700">7:00 AM - 11:00 AM</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <i className="ri-map-pin-line text-royal-bright-blue mt-1"></i>
                    <div>
                      <p className="font-semibold">Location</p>
                      <p className="text-gray-700">Saint Patricks Catholic Church Field</p>
                      <p className="text-gray-600 text-sm">6P53+G38, Umuagu, Asaba 320242, Delta</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* About image collage */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg overflow-hidden h-48 shadow-md">
                <img src="https://pixabay.com/get/g4406534410031db0dfabf3d5dc3f364fe7bc64ef1b1f038f93526536266f5eccc80636c41bc600c7fd13a4089e42ce5836b5070181ac48829ac22a7fcdeb5460_1280.jpg" alt="Royal FC team photo" className="w-full h-full object-cover" />
              </div>
              
              <div className="rounded-lg overflow-hidden h-48 shadow-md">
                <img src="https://images.unsplash.com/photo-1518604666860-9ed391f76460?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400" alt="Match in progress" className="w-full h-full object-cover" />
              </div>
              
              <div className="rounded-lg overflow-hidden h-48 shadow-md">
                <img src="https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400" alt="Training session" className="w-full h-full object-cover" />
              </div>
              
              <div className="rounded-lg overflow-hidden h-48 shadow-md">
                <img src="https://images.unsplash.com/photo-1577471488278-16eec37ffcc2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400" alt="Trophy celebration" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
          
          {/* Milestones Timeline */}
          <div className="mt-16">
            <h2 className="font-montserrat font-bold text-2xl text-royal-blue text-center mb-10">Our Journey</h2>
            
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-royal-blue/30"></div>
              
              {/* Timeline Items */}
              <div className="relative z-10">
                {/* Milestone 1 */}
                <div className="flex flex-col md:flex-row items-center mb-8">
                  <div className="md:w-1/2 md:pr-8 mb-4 md:mb-0 md:text-right">
                    <h3 className="font-montserrat font-bold text-lg">Club Founded</h3>
                    <p className="text-gray-600">May 2022</p>
                    <p className="mt-2">A group of 15 friends begin regular weekend games at Asaba Central Park</p>
                  </div>
                  
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-royal-blue text-white border-4 border-white shadow-md z-10">
                    <i className="ri-flag-line"></i>
                  </div>
                  
                  <div className="md:w-1/2 md:pl-8 md:text-left"></div>
                </div>
                
                {/* Milestone 2 */}
                <div className="flex flex-col md:flex-row items-center mb-8">
                  <div className="md:w-1/2 md:pr-8 md:text-right"></div>
                  
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-royal-blue text-white border-4 border-white shadow-md z-10">
                    <i className="ri-team-line"></i>
                  </div>
                  
                  <div className="md:w-1/2 md:pl-8 mb-4 md:mb-0 md:text-left">
                    <h3 className="font-montserrat font-bold text-lg">First Tournament</h3>
                    <p className="text-gray-600">August 2022</p>
                    <p className="mt-2">Organized first internal 5-a-side tournament with 4 teams</p>
                  </div>
                </div>
                
                {/* Milestone 3 */}
                <div className="flex flex-col md:flex-row items-center mb-8">
                  <div className="md:w-1/2 md:pr-8 mb-4 md:mb-0 md:text-right">
                    <h3 className="font-montserrat font-bold text-lg">Membership Growth</h3>
                    <p className="text-gray-600">January 2023</p>
                    <p className="mt-2">Club expands to 25 regular members and secures training slots at Asaba Sports Complex</p>
                  </div>
                  
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-royal-blue text-white border-4 border-white shadow-md z-10">
                    <i className="ri-user-add-line"></i>
                  </div>
                  
                  <div className="md:w-1/2 md:pl-8 md:text-left"></div>
                </div>
                
                {/* Milestone 4 */}
                <div className="flex flex-col md:flex-row items-center">
                  <div className="md:w-1/2 md:pr-8 md:text-right"></div>
                  
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-royal-gold text-royal-blue border-4 border-white shadow-md z-10">
                    <i className="ri-rocket-line"></i>
                  </div>
                  
                  <div className="md:w-1/2 md:pl-8 mb-4 md:mb-0 md:text-left">
                    <h3 className="font-montserrat font-bold text-lg">Digital Platform Launch</h3>
                    <p className="text-gray-600">May 2025</p>
                    <p className="mt-2">Launch of Royal FC digital platform to manage over 40 members, tournaments, and club activities</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default AboutPage;
