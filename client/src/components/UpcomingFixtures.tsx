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

  if (!fixtures || fixtures.length === 0) {
    return (
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h2 className="font-montserrat font-bold text-3xl text-royal-blue">Upcoming Fixtures</h2>
            <p className="text-gray-600 mt-2">The next exciting matchdays in our club tournaments</p>
          </div>
          <div className="text-center py-8">
            <p className="text-gray-600">No upcoming fixtures scheduled at the moment.</p>
            <p className="mt-4">
              <Link href="/tournaments">
                <a className="inline-flex items-center text-royal-blue font-semibold hover:text-royal-gold transition duration-200">
                  View Tournaments <i className="ri-arrow-right-line ml-1"></i>
                </a>
              </Link>
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <h2 className="font-montserrat font-bold text-3xl text-royal-blue">Upcoming Fixtures</h2>
          <p className="text-gray-600 mt-2">The next exciting matchdays in our club tournaments</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fixtures.map((fixture) => (
            <div key={fixture.id} className="bg-royal-light rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="bg-royal-blue p-4 text-white">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{fixture.tournamentName}</span>
                  <span className="text-sm bg-royal-gold text-royal-blue px-2 py-1 rounded">
                    {format(new Date(fixture.date), 'MMM d, yyyy')}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div className="text-center flex-1">
                    <p className="font-montserrat font-bold text-xl">{fixture.homeTeamName}</p>
                    <p className="text-sm text-gray-600">Captain: {fixture.homeTeamCaptain}</p>
                  </div>
                  
                  <div className="text-center px-4">
                    <p className="font-montserrat font-bold text-lg">VS</p>
                    <p className="text-xs text-gray-500">{format(new Date(fixture.date), 'h:mm a')}</p>
                  </div>
                  
                  <div className="text-center flex-1">
                    <p className="font-montserrat font-bold text-xl">{fixture.awayTeamName}</p>
                    <p className="text-sm text-gray-600">Captain: {fixture.awayTeamCaptain}</p>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <p className="text-sm inline-flex items-center">
                    <i className="ri-map-pin-line mr-1"></i> {fixture.location}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <Link href="/tournaments">
            <a className="inline-flex items-center text-royal-blue font-semibold hover:text-royal-gold transition duration-200">
              View All Fixtures <i className="ri-arrow-right-line ml-1"></i>
            </a>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default UpcomingFixtures;
