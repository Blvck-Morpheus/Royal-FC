import { useState } from "react";
import { Link, useLocation } from "wouter";
import Logo from "@/components/ui/logo";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Players", href: "/players" },
    { name: "Tournaments", href: "/tournaments" },
    { name: "Leaderboard", href: "/leaderboard" },
    { name: "Team Generator", href: "/team-generator" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <header className="bg-royal-blue shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          <Link href="/">
            <a className="flex items-center space-x-2">
              <Logo />
              <div>
                <h1 className="font-montserrat font-bold text-white text-xl">Royal FC</h1>
                <p className="text-royal-bright-blue text-xs">Asaba All-stars Club</p>
                <p className="text-slogan text-xs">WINNING FOREVER!</p>
              </div>
            </a>
          </Link>
          
          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden text-white focus:outline-none"
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            <i className="ri-menu-line text-2xl"></i>
          </button>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href}>
                <a className={`text-white hover:text-royal-gold transition duration-200 font-medium ${isActive(item.href) ? 'text-royal-gold' : ''}`}>
                  {item.name}
                </a>
              </Link>
            ))}
            <Link href="/admin">
              <a className="px-4 py-2 bg-royal-bright-blue text-white rounded-md font-bold transition duration-200 hover:bg-blue-400">
                Admin
              </a>
            </Link>
          </nav>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <div className={`lg:hidden bg-royal-dark ${mobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="container mx-auto px-4 py-3 space-y-2">
          {navigation.map((item) => (
            <Link key={item.name} href={item.href}>
              <a 
                className={`block text-white hover:text-royal-bright-blue py-2 transition duration-200 ${isActive(item.href) ? 'text-royal-bright-blue' : ''}`}
                onClick={closeMobileMenu}
              >
                {item.name}
              </a>
            </Link>
          ))}
          <Link href="/admin">
            <a 
              className="block text-white hover:text-royal-gold py-2 transition duration-200 font-bold"
              onClick={closeMobileMenu}
            >
              Admin
            </a>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
