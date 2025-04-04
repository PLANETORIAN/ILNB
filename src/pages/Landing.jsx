import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Shield, Zap, Star, ArrowRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { isDarkMode } = useTheme();
  const { user } = useAuth();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      title: "Intelligent Portfolio Tracking",
      icon: <TrendingUp className="w-8 h-8 text-purple-500" />,
      description: "Effortlessly track and visualize your investments across multiple platforms."
    },
    {
      title: "Advanced Analytics",
      icon: <Zap className="w-8 h-8 text-purple-600" />,
      description: "Get powerful insights with our cutting-edge performance analysis tools."
    },
    {
      title: "Secure & Private",
      icon: <Shield className="w-8 h-8 text-purple-700" />,
      description: "Your financial data stays private with enterprise-grade security protocols."
    },
    {
      title: "Smart Recommendations",
      icon: <Star className="w-8 h-8 text-purple-800" />,
      description: "Receive personalized investment suggestions based on your goals."
    }
  ];
  
  // Custom style for text shadow to improve visibility
  const textShadowStyle = isDarkMode 
    ? { textShadow: '0px 0px 15px rgba(255, 255, 255, 0.8)' }
    : { textShadow: '0px 0px 15px rgba(0, 0, 0, 0.3)' };

  return (
    <div className="min-h-screen -mt-20">
      {/* Hero Section */}
      <div className="min-h-[90vh] flex flex-col items-center justify-center relative overflow-hidden pt-16">
        {/* Purple gradient background with animation */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-800 to-purple-900 opacity-20"></div>
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-20 w-80 h-80 bg-purple-700 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-40 left-20 w-80 h-80 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className={`text-center ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">
              Portfolio Pro
            </h1>
            <p className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto">
              Your all-in-one solution for tracking, analyzing, and optimizing your investment portfolio
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link 
                  to="/dashboard" 
                  className={`button-animate ${isDarkMode 
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 border-2 border-white/30' 
                    : 'bg-gradient-to-r from-purple-500 to-indigo-500 border-2 border-white/50'
                  } text-white !text-white px-8 py-3 rounded-lg font-black text-lg shadow-purple-900/30 shadow-lg hover:shadow-purple-900/50 transition-all duration-300 transform hover:scale-105 flex items-center justify-center tracking-wide`}
                  style={textShadowStyle}
                >
                  Go to Dashboard <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className={`button-animate ${isDarkMode 
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 border-2 border-white/30' 
                      : 'bg-gradient-to-r from-purple-500 to-indigo-500 border-2 border-white/50'
                    } text-white !text-white px-8 py-3 rounded-lg font-black text-lg shadow-purple-900/30 shadow-lg hover:shadow-purple-900/50 transition-all duration-300 transform hover:scale-105 tracking-wide`}
                    style={textShadowStyle}
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/signup" 
                    className={`button-animate ${isDarkMode 
                      ? 'bg-purple-500/40 border-2 border-white/30 backdrop-blur-md' 
                      : 'bg-purple-400/50 border-2 border-white/60 backdrop-blur-md'
                    } text-white !text-white px-8 py-3 rounded-lg font-black text-lg shadow-purple-900/20 shadow-lg hover:shadow-purple-900/40 transition-all duration-300 transform hover:scale-105 tracking-wide`}
                    style={textShadowStyle}
                  >
                    Create Account
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className={`py-20 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
            Powerful Features for Savvy Investors
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className={`${isDarkMode ? 'bg-gray-800 border-purple-900/50 hover:border-purple-700' : 'bg-white border-purple-100 hover:border-purple-300'} p-6 rounded-xl shadow-xl border-t transition-all duration-300 transform hover:-translate-y-2 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className={`rounded-full ${isDarkMode ? 'bg-purple-900/50' : 'bg-purple-100'} w-16 h-16 flex items-center justify-center mb-4`}>
                  {feature.icon}
                </div>
                <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{feature.title}</h3>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing; 