import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Fixture } from "@shared/schema";
import { format } from "date-fns";

const UpcomingFixtures = () => {
  const { data: fixtures, isLoading, error } = useQuery<Fixture[]>({
    queryKey: ['/api/fixtures/upcoming'],
  });

  if (isLoading) {
    return (
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h2 className="font-montserrat font-bold text-3xl text-royal-blue">Upcoming Fixtures</h2>
            <p className="text-gray-600 mt-2">Loading upcoming matches...</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-royal-light rounded-lg overflow-hidden shadow-md animate-pulse">
                <div className="bg-royal-blue p-4"></div>
                <div className="p-6 h-40"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h2 className="font-montserrat font-bold text-3xl text-royal-blue">Upcoming Fixtures</h2>
            <p className="text-gray-600 mt-2">The next exciting matchdays in our club tournaments</p>
          </div>
          <div className="text-center text-red-500">
            Error loading fixtures: {(error as Error).message}
          </div>
        </div>
      </section>
    );
  }

  // Always show the announcement instead of fixtures
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <h2 className="font-montserrat font-bold text-3xl text-royal-blue">Upcoming Tournaments</h2>
          <p className="text-gray-600 mt-2">Stay tuned for exciting competitions coming soon</p>
        </div>

        <div className="max-w-4xl mx-auto bg-royal-light rounded-lg shadow-lg overflow-hidden">
          <div className="bg-royal-blue text-white p-5">
            <h3 className="font-montserrat font-bold text-xl">Tournament Announcement</h3>
          </div>

          <div className="p-6">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/3 mb-6 md:mb-0 md:pr-6">
                <div className="rounded-lg overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    alt="Tournament announcement"
                    className="w-full h-auto"
                  />
                </div>
              </div>

              <div className="md:w-2/3">
                <h4 className="font-montserrat font-semibold text-lg text-royal-blue mb-3">New Tournaments in the Offing</h4>
                <p className="text-gray-600 mb-4">
                  We're excited to announce that new tournaments are currently being planned for our club members.
                  These competitions will provide opportunities for friendly rivalry, skill development, and community building.
                </p>
                <p className="text-gray-600 mb-4">
                  Tournament details including format, teams, and schedules will be announced soon.
                  Make sure to check back regularly for updates or join our WhatsApp group for instant notifications.
                </p>

                <div className="flex flex-wrap gap-4 mt-6">
                  <div className="inline-flex items-center bg-royal-blue/10 px-3 py-2 rounded-md">
                    <i className="ri-calendar-line text-royal-blue mr-2"></i>
                    <span className="text-sm font-medium">Coming Soon</span>
                  </div>

                  <div className="inline-flex items-center bg-royal-blue/10 px-3 py-2 rounded-md">
                    <i className="ri-team-line text-royal-blue mr-2"></i>
                    <span className="text-sm font-medium">All Members Welcome</span>
                  </div>

                  <div className="inline-flex items-center bg-royal-blue/10 px-3 py-2 rounded-md">
                    <i className="ri-trophy-line text-royal-blue mr-2"></i>
                    <span className="text-sm font-medium">Multiple Formats</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Link href="/tournaments">
                <a className="inline-block bg-royal-blue text-white font-bold py-3 px-6 rounded-md hover:bg-royal-bright-blue transition duration-200">
                  View Tournament Page
                </a>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UpcomingFixtures;
