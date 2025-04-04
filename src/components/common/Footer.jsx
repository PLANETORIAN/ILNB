import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { Activity } from 'lucide-react';

function Footer() {
  const currentYear = new Date().getFullYear();
  const { isDarkMode } = useTheme();
  const [logoHovered, setLogoHovered] = useState(false);

  return (
    <footer className={`${isDarkMode ? 'bg-[#1a1a2e]/50' : 'bg-purple-100'} backdrop-blur-lg border-t ${isDarkMode ? 'border-white/10' : 'border-purple-200'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 group"
                 onMouseEnter={() => setLogoHovered(true)}
                 onMouseLeave={() => setLogoHovered(false)}>
              {/* Geometric Futuristic Logo */}
              <div className="w-8 h-8 relative transition-all duration-300 transform group-hover:scale-110">
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
                  <div className={`absolute top-1/2 left-1/2 w-6 h-6 -translate-x-1/2 -translate-y-1/2 clip-path-triangle ${
                    isDarkMode ? 'bg-indigo-500/40' : 'bg-indigo-400/40'
                  } ${logoHovered ? 'animate-spin-slow' : ''} transition-all duration-700`}></div>
                  
                  <div className={`absolute top-1/2 left-1/2 w-4 h-4 -translate-x-1/2 -translate-y-1/2 clip-path-triangle-inverse ${
                    isDarkMode ? 'bg-purple-400/60' : 'bg-blue-400/60'
                  } ${logoHovered ? 'animate-spin-reverse-slow' : ''} transition-all duration-700`}></div>
                </div>
                
                {/* Center sparkle icon */}
                <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ${
                  logoHovered ? 'scale-110 rotate-90' : 'scale-100 rotate-0'
                }`}>
                  <Activity className={`w-4 h-4 ${
                    isDarkMode ? 'text-purple-300' : 'text-indigo-100'
                  } ${logoHovered ? 'animate-pulse' : ''}`} />
                </div>
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                Portfolio Pro
              </span>
            </div>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
              Advanced portfolio management and analysis tools for modern investors.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className={`${isDarkMode ? 'text-white' : 'text-gray-800'} font-semibold mb-4`}>Quick Links</h3>
            <ul className="space-y-2">
              {['Dashboard', 'Compare', 'Execute', 'Profile'].map((item) => (
                <li key={item}>
                  <Link
                    to={`/${item.toLowerCase()}`}
                    className={`${isDarkMode ? 'text-gray-400 hover:text-purple-400' : 'text-gray-600 hover:text-purple-600'} transition-colors text-sm`}
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className={`${isDarkMode ? 'text-white' : 'text-gray-800'} font-semibold mb-4`}>Resources</h3>
            <ul className="space-y-2">
              {['Documentation', 'API', 'Support', 'FAQ'].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className={`${isDarkMode ? 'text-gray-400 hover:text-purple-400' : 'text-gray-600 hover:text-purple-600'} transition-colors text-sm`}
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className={`${isDarkMode ? 'text-white' : 'text-gray-800'} font-semibold mb-4`}>Contact Us</h3>
            <div className="space-y-2">
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>Email: support@portfoliopro.com</p>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>Phone: +1 (555) 123-4567</p>
              <div className="flex space-x-4 mt-4">
                {['Twitter', 'LinkedIn', 'GitHub'].map((platform) => (
                  <a
                    key={platform}
                    href="#"
                    className={`w-8 h-8 rounded-full ${isDarkMode ? 'bg-white/10 hover:bg-purple-500/20' : 'bg-purple-200/50 hover:bg-purple-300/50'} 
                             flex items-center justify-center transition-colors`}
                  >
                    <span className={`${isDarkMode ? 'text-gray-400 hover:text-purple-400' : 'text-gray-600 hover:text-purple-600'} text-sm`}>
                      {platform[0]}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={`mt-8 pt-8 border-t ${isDarkMode ? 'border-white/10' : 'border-purple-200'}`}>
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
              © {currentYear} Portfolio Pro. All rights reserved.
            </p>
            <div className="flex space-x-6">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
                <a
                  key={item}
                  href="#"
                  className={`${isDarkMode ? 'text-gray-400 hover:text-purple-400' : 'text-gray-600 hover:text-purple-600'} transition-colors text-sm`}
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer; 