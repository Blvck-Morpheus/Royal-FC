import { Link } from "wouter";
import Logo from "@/components/ui/logo";

const Footer = () => {
  return (
    <footer className="bg-royal-dark text-white py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Logo />
              <div>
                <h3 className="font-montserrat font-bold text-white text-xl">Royal FC</h3>
                <p className="text-royal-bright-blue text-xs">Asaba All-stars Club</p>
                <p className="text-slogan text-xs">WINNING FOREVER!</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm">Fostering community, fitness, and competitive unity through football in Asaba.</p>
          </div>
          
          <div>
            <h4 className="font-montserrat font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/"><a className="text-gray-400 hover:text-royal-bright-blue transition duration-200">Home</a></Link></li>
              <li><Link href="/players"><a className="text-gray-400 hover:text-royal-bright-blue transition duration-200">Players</a></Link></li>
              <li><Link href="/tournaments"><a className="text-gray-400 hover:text-royal-bright-blue transition duration-200">Tournaments</a></Link></li>
              <li><Link href="/leaderboard"><a className="text-gray-400 hover:text-royal-bright-blue transition duration-200">Leaderboard</a></Link></li>
              <li><Link href="/team-generator"><a className="text-gray-400 hover:text-royal-bright-blue transition duration-200">Team Generator</a></Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-montserrat font-semibold text-lg mb-4">About Us</h4>
            <ul className="space-y-2">
              <li><Link href="/about"><a className="text-gray-400 hover:text-royal-bright-blue transition duration-200">Our Story</a></Link></li>
              <li><Link href="/about"><a className="text-gray-400 hover:text-royal-bright-blue transition duration-200">Club Values</a></Link></li>
              <li><Link href="/about"><a className="text-gray-400 hover:text-royal-bright-blue transition duration-200">Timeline</a></Link></li>
              <li><Link href="/contact"><a className="text-gray-400 hover:text-royal-bright-blue transition duration-200">Join the Club</a></Link></li>
              <li><Link href="/contact"><a className="text-gray-400 hover:text-royal-bright-blue transition duration-200">Contact Us</a></Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-montserrat font-semibold text-lg mb-4">Connect</h4>
            <div className="flex space-x-4 mb-4">
              <a href="#" className="h-10 w-10 rounded-full bg-royal-blue/30 text-white flex items-center justify-center hover:bg-royal-bright-blue transition duration-200">
                <i className="ri-instagram-line"></i>
              </a>
              <a href="#" className="h-10 w-10 rounded-full bg-royal-blue/30 text-white flex items-center justify-center hover:bg-royal-bright-blue transition duration-200">
                <i className="ri-twitter-x-line"></i>
              </a>
              <a href="#" className="h-10 w-10 rounded-full bg-royal-blue/30 text-white flex items-center justify-center hover:bg-royal-bright-blue transition duration-200">
                <i className="ri-facebook-fill"></i>
              </a>
              <a href="#" className="h-10 w-10 rounded-full bg-royal-blue/30 text-white flex items-center justify-center hover:bg-royal-bright-blue transition duration-200">
                <i className="ri-youtube-line"></i>
              </a>
            </div>
            <p className="text-gray-400 text-sm">Subscribe to our newsletter for updates on matches, tournaments, and club events.</p>
            <div className="mt-2 flex">
              <input 
                type="email" 
                placeholder="Your email" 
                className="px-4 py-2 rounded-l-md focus:outline-none focus:ring-2 focus:ring-royal-blue focus:border-transparent flex-grow bg-royal-dark border border-gray-700"
              />
              <button className="bg-royal-bright-blue text-white px-4 py-2 rounded-r-md font-semibold">
                Subscribe
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-10 pt-6 border-t border-gray-700 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Royal FC Asaba. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
