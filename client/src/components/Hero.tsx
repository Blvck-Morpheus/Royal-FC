import { Link } from "wouter";

const Hero = () => {
  return (
    <section className="relative h-[500px] md:h-[600px] bg-hero-pattern bg-cover bg-center">
      <div className="absolute inset-0 bg-gradient-to-t from-royal-blue/90 to-royal-blue/30"></div>
      <div className="container mx-auto px-4 h-full flex items-center relative z-10">
        <div className="max-w-2xl text-white">
          <h1 className="font-montserrat font-bold text-4xl md:text-5xl mb-4">United In Passion</h1>
          <p className="text-xl md:text-2xl mb-8">Fostering community, fitness & competitive unity in Asaba</p>
          
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/tournaments">
              <a className="bg-royal-gold text-royal-blue font-bold py-3 px-6 rounded-md hover:bg-yellow-400 transition duration-200 text-center">
                View Tournaments
              </a>
            </Link>
            <Link href="/contact">
              <a className="border-2 border-white text-white font-bold py-3 px-6 rounded-md hover:bg-white/10 transition duration-200 text-center">
                Join The Club
              </a>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
