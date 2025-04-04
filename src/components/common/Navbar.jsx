import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { DollarSign, TrendingUp, Layers, Settings, User, Menu, X, Sparkles, Sun, Moon, Hexagon, Activity } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [logoHovered, setLogoHovered] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Close mobile menu when navigating
    setMobileMenuOpen(false);
  }, [location]);

  const navLinks = user ? [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/compare', label: 'Compare' },
    { path: '/execute', label: 'Execute' },
    { path: '/reports', label: 'Reports' },
    { path: '/profile', label: 'Profile' },
  ] : [];

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleThemeToggle = () => {
    setIsRotating(true);
    toggleTheme();
    setTimeout(() => setIsRotating(false), 500);
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-500 ${
      scrolled 
        ? `${isDarkMode ? 'bg-gradient-to-r from-purple-900/90 to-indigo-900/90' : 'bg-gradient-to-r from-blue-100/90 to-blue-200/90'} backdrop-blur-2xl shadow-[0_10px_50px_-12px_rgba(147,51,234,0.5)]` 
        : `${isDarkMode ? 'bg-purple-900/30' : 'bg-blue-100/30'} backdrop-blur-xl`
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link 
            to="/" 
            className="flex items-center space-x-3 animate-fade-in group"
            onMouseEnter={() => setLogoHovered(true)}
            onMouseLeave={() => setLogoHovered(false)}
          >
            {/* Geometric Futuristic Logo */}
            <div className="w-10 h-10 relative transition-all duration-300 transform group-hover:scale-110">
              {/* Base hexagon container */}
              <div className={`absolute inset-0 ${
                isDarkMode ? 'bg-gradient-to-br from-purple-600 to-indigo-800' : 'bg-gradient-to-br from-blue-500 to-indigo-600'
              } clip-path-hexagon shadow-[0_0_15px_rgba(147,51,234,0.5)] group-hover:shadow-[0_0_25px_rgba(147,51,234,0.8)] transition-all duration-500`}></div>
              
              {/* Inner geometric patterns - animates on hover */}
              <div className={`absolute inset-[2px] clip-path-hexagon ${
                isDarkMode ? 'bg-purple-900' : 'bg-blue-100'
              } transition-all duration-500`}></div>
              
              {/* Animated geometric lines */}
              <div className={`absolute inset-0 clip-path-hexagon overflow-hidden transition-all duration-700 ${
                logoHovered ? 'opacity-100' : 'opacity-50'
              }`}>
                {/* Triangle patterns */}
                <div className={`absolute top-1/2 left-1/2 w-8 h-8 -translate-x-1/2 -translate-y-1/2 clip-path-triangle ${
                  isDarkMode ? 'bg-indigo-500/40' : 'bg-indigo-400/40'
                } ${logoHovered ? 'animate-spin-slow' : ''} transition-all duration-700`}></div>
                
                <div className={`absolute top-1/2 left-1/2 w-5 h-5 -translate-x-1/2 -translate-y-1/2 clip-path-triangle-inverse ${
                  isDarkMode ? 'bg-purple-400/60' : 'bg-blue-400/60'
                } ${logoHovered ? 'animate-spin-reverse-slow' : ''} transition-all duration-700`}></div>
                
                {/* Grid lines */}
                <div className={`absolute inset-0 grid grid-cols-3 grid-rows-3 transition-all duration-300 ${
                  logoHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                }`}>
                  <div className={`border-b border-r ${isDarkMode ? 'border-purple-500/30' : 'border-blue-500/30'}`}></div>
                  <div className={`border-b ${isDarkMode ? 'border-purple-500/30' : 'border-blue-500/30'}`}></div>
                  <div className={`border-b border-l ${isDarkMode ? 'border-purple-500/30' : 'border-blue-500/30'}`}></div>
                  <div className={`border-r ${isDarkMode ? 'border-purple-500/30' : 'border-blue-500/30'}`}></div>
                  <div></div>
                  <div className={`border-l ${isDarkMode ? 'border-purple-500/30' : 'border-blue-500/30'}`}></div>
                  <div className={`border-t border-r ${isDarkMode ? 'border-purple-500/30' : 'border-blue-500/30'}`}></div>
                  <div className={`border-t ${isDarkMode ? 'border-purple-500/30' : 'border-blue-500/30'}`}></div>
                  <div className={`border-t border-l ${isDarkMode ? 'border-purple-500/30' : 'border-blue-500/30'}`}></div>
                </div>
              </div>
              
              {/* Center sparkle icon */}
              <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ${
                logoHovered ? 'scale-110 rotate-90' : 'scale-100 rotate-0'
              }`}>
                <Activity className={`w-5 h-5 ${
                  isDarkMode ? 'text-purple-300' : 'text-indigo-100'
                } ${logoHovered ? 'animate-pulse' : ''}`} />
              </div>
              
              {/* Outer pulsing ring - appears on hover */}
              <div className={`absolute -inset-1 rounded-xl ${
                isDarkMode ? 'bg-gradient-to-r from-purple-600/0 to-indigo-600/0' : 'bg-gradient-to-r from-blue-500/0 to-indigo-500/0'
              } ${
                logoHovered ? (isDarkMode ? 'from-purple-600/20 to-indigo-600/20' : 'from-blue-500/20 to-indigo-500/20') : ''
              } transition-all duration-500 ${
                logoHovered ? 'animate-pulse-slow opacity-100' : 'opacity-0'
              }`}></div>
            </div>
            
            <span className={`text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400 group-hover:from-purple-300 group-hover:to-indigo-300 transition-all duration-300 hidden sm:inline-block`}>
              Portfolio Pro
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link, index) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-5 py-2 rounded-lg transition-all duration-300 overflow-hidden
                  ${location.pathname === link.path 
                    ? isDarkMode 
                      ? 'bg-purple-600/20 text-purple-300 border border-purple-500/20' 
                      : 'bg-purple-600/20 text-purple-900 border border-purple-500/20'
                    : isDarkMode
                      ? 'hover:bg-purple-600/10 text-gray-300 hover:text-purple-300 border border-transparent hover:border-purple-500/10'
                      : 'hover:bg-purple-600/10 text-gray-700 hover:text-purple-700 border border-transparent hover:border-purple-500/10'
                  }
                  animate-fade-in group`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <span className="relative z-10">{link.label}</span>
                <div className="absolute inset-0 -z-10 bg-gradient-to-r from-purple-600/0 via-purple-600/0 to-purple-600/0 group-hover:from-purple-600/10 group-hover:via-purple-600/20 group-hover:to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                {location.pathname === link.path && (
                  <div className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-purple-500 to-indigo-500"></div>
                )}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle Button */}
            <button
              onClick={handleThemeToggle}
              className="p-2 rounded-full transition-all duration-300 focus:outline-none relative z-10 bg-transparent"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? (
                <Sun className={`w-5 h-5 text-yellow-400 ${isRotating ? 'animate-spin' : ''}`} />
              ) : (
                <Moon className={`w-5 h-5 text-blue-600 ${isRotating ? 'animate-spin' : ''}`} />
              )}
            </button>

            {user ? (
              <button
                onClick={logout}
                className={`button-animate relative ${isDarkMode ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-[0_5px_20px_-5px_rgba(147,51,234,0.7)]' : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:shadow-[0_5px_20px_-5px_rgba(37,99,235,0.7)]'} 
                         text-white px-6 py-2 rounded-lg font-medium transition-all transform hover:-translate-y-0.5 overflow-hidden group`}
              >
                <span className="relative z-10">Logout</span>
                <div className={`absolute inset-0 w-full h-full transform scale-0 group-hover:scale-100 transition-transform duration-300 rounded-lg ${isDarkMode ? 'bg-gradient-to-r from-purple-700 to-indigo-700' : 'bg-gradient-to-r from-blue-600 to-blue-700'} origin-bottom`}></div>
              </button>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className={`font-medium transition-colors relative group ${isDarkMode ? 'text-purple-400 hover:text-purple-300' : 'text-blue-600 hover:text-blue-500'}`}
                >
                  <span>Login</span>
                  <div className={`absolute bottom-0 left-0 w-0 h-0.5 ${isDarkMode ? 'bg-gradient-to-r from-purple-500 to-indigo-500' : 'bg-gradient-to-r from-blue-500 to-blue-600'} group-hover:w-full transition-all duration-300`}></div>
                </Link>
                <Link
                  to="/signup"
                  className={`button-animate relative ${isDarkMode ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-[0_5px_20px_-5px_rgba(147,51,234,0.7)]' : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:shadow-[0_5px_20px_-5px_rgba(37,99,235,0.7)]'} 
                           text-white px-6 py-2 rounded-lg font-medium transition-all transform hover:-translate-y-0.5 overflow-hidden group`}
                >
                  <span className="relative z-10">Sign Up</span>
                  <div className={`absolute inset-0 w-full h-full transform scale-0 group-hover:scale-100 transition-transform duration-300 rounded-lg ${isDarkMode ? 'bg-gradient-to-r from-purple-700 to-indigo-700' : 'bg-gradient-to-r from-blue-600 to-blue-700'} origin-bottom`}></div>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button and theme toggle */}
          <div className="md:hidden flex items-center space-x-1">
            <button
              onClick={handleThemeToggle}
              className="p-2 rounded-full transition-all duration-300 focus:outline-none relative z-10 bg-transparent"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? (
                <Sun className={`w-5 h-5 text-yellow-400 ${isRotating ? 'animate-spin' : ''}`} />
              ) : (
                <Moon className={`w-5 h-5 text-blue-600 ${isRotating ? 'animate-spin' : ''}`} />
              )}
            </button>
            
            <button 
              onClick={toggleMobileMenu}
              className={`inline-flex items-center justify-center p-2 rounded-md ${isDarkMode ? 'text-purple-400 hover:text-purple-300 hover:bg-purple-600/10' : 'text-blue-600 hover:text-blue-500 hover:bg-blue-600/10'} focus:outline-none transition-all duration-300 relative overflow-hidden group`}
            >
              <div className={`absolute inset-0 w-full h-full transform scale-0 group-hover:scale-100 transition-transform duration-300 rounded-lg ${isDarkMode ? 'bg-gradient-to-r from-purple-800/20 to-indigo-800/20' : 'bg-gradient-to-r from-blue-700/20 to-blue-800/20'} origin-center`}></div>
              {mobileMenuOpen ? (
                <X className="block h-6 w-6 relative z-10" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6 relative z-10" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div 
        className={`${mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} md:hidden ${isDarkMode ? 'bg-gradient-to-r from-purple-900/95 to-indigo-900/95' : 'bg-gradient-to-r from-blue-100/95 to-blue-200/95'} backdrop-blur-xl ${isDarkMode ? 'shadow-[0_10px_50px_-12px_rgba(147,51,234,0.5)]' : 'shadow-[0_10px_50px_-12px_rgba(37,99,235,0.5)]'} transition-all duration-500 overflow-hidden`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`block px-3 py-2 rounded-md relative overflow-hidden group ${
                location.pathname === link.path
                  ? isDarkMode 
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/20' 
                    : 'bg-blue-600/20 text-blue-900 border border-blue-500/20'
                  : isDarkMode
                    ? 'text-gray-300 hover:text-purple-300 border border-transparent hover:border-purple-500/10'
                    : 'text-gray-700 hover:text-blue-700 border border-transparent hover:border-blue-500/10'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="relative z-10">{link.label}</span>
              <div className={`absolute inset-0 -z-10 bg-gradient-to-r ${isDarkMode ? 'from-purple-600/0 via-purple-600/0 to-purple-600/0 group-hover:from-purple-600/10 group-hover:via-purple-600/20 group-hover:to-purple-600/10' : 'from-blue-600/0 via-blue-600/0 to-blue-600/0 group-hover:from-blue-600/10 group-hover:via-blue-600/20 group-hover:to-blue-600/10'} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
            </Link>
          ))}
          {!user && (
            <>
              <Link
                to="/login"
                className={`block px-3 py-2 rounded-md ${isDarkMode ? 'text-gray-300 hover:text-purple-300' : 'text-gray-700 hover:text-blue-700'} relative group`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="relative z-10">Login</span>
                <div className={`absolute inset-0 -z-10 bg-gradient-to-r ${isDarkMode ? 'from-purple-600/0 via-purple-600/0 to-purple-600/0 group-hover:from-purple-600/10 group-hover:via-purple-600/20 group-hover:to-purple-600/10' : 'from-blue-600/0 via-blue-600/0 to-blue-600/0 group-hover:from-blue-600/10 group-hover:via-blue-600/20 group-hover:to-blue-600/10'} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              </Link>
              <Link
                to="/signup"
                className={`block px-3 py-2 rounded-md ${isDarkMode ? 'bg-purple-600/20 text-purple-300 border border-purple-500/20' : 'bg-blue-600/20 text-blue-900 border border-blue-500/20'} relative group`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="relative z-10">Sign Up</span>
                <div className={`absolute inset-0 -z-10 bg-gradient-to-r ${isDarkMode ? 'from-purple-600/10 via-purple-600/20 to-purple-600/10' : 'from-blue-600/10 via-blue-600/20 to-blue-600/10'} opacity-100 transition-opacity duration-300`}></div>
              </Link>
            </>
          )}
          {user && (
            <button
              onClick={() => {
                logout();
                setMobileMenuOpen(false);
              }}
              className={`block w-full text-left px-3 py-2 rounded-md ${isDarkMode ? 'text-gray-300 hover:text-purple-300' : 'text-gray-700 hover:text-blue-700'} relative group`}
            >
              <span className="relative z-10">Logout</span>
              <div className={`absolute inset-0 -z-10 bg-gradient-to-r ${isDarkMode ? 'from-purple-600/0 via-purple-600/0 to-purple-600/0 group-hover:from-purple-600/10 group-hover:via-purple-600/20 group-hover:to-purple-600/10' : 'from-blue-600/0 via-blue-600/0 to-blue-600/0 group-hover:from-blue-600/10 group-hover:via-blue-600/20 group-hover:to-blue-600/10'} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;