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
    { name: "Admin", href: "/admin" },
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
    <header className="shadow-md sticky top-0 z-50" style={{ backgroundColor: '#0c3b80' }}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          <Link href="/" className="flex items-center space-x-2">
              <Logo />
              <div>
                <h1 className="font-montserrat font-bold text-white text-xl">Royal FC</h1>
                <p className="text-royal-bright-blue text-xs">Asaba All-Stars Club</p>
                <p className="text-slogan text-xs">WINNING FOREVER!</p>
              </div>
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
              <Link
                key={item.name}
                href={item.href}
                className={`text-white hover:text-royal-gold transition duration-200 font-medium ${isActive(item.href) ? 'text-royal-gold' : ''}`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className={`lg:hidden bg-royal-dark ${mobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="container mx-auto px-4 py-3 space-y-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`block text-white hover:text-royal-bright-blue py-2 transition duration-200 ${isActive(item.href) ? 'text-royal-bright-blue' : ''}`}
              onClick={closeMobileMenu}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Header;
