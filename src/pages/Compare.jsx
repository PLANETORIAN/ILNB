import { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import Card from '@/components/common/Card';
import { Star, Shield, Check, AlertTriangle } from 'lucide-react';

function Compare() {
  const [isLoading, setIsLoading] = useState(true);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 800);
  }, []);

  const portfolios = [
    { 
      id: 1, 
      name: 'Conservative', 
      risk: 3, 
      return: 8.2, 
      assets: 8, 
      riskProfile: 'conservative',
      trustScore: 4.5,
      safetyLevel: 'high', // high, medium, low
      fundManager: 'Vanguard Investments',
      comparisonResult: null
    },
    { 
      id: 2, 
      name: 'Balanced', 
      risk: 5, 
      return: 12.4, 
      assets: 12, 
      riskProfile: 'balanced',
      trustScore: 4.2,
      safetyLevel: 'medium',
      fundManager: 'Fidelity Management',
      comparisonResult: {
        betterThan: 'Conservative',
        difference: 4.2,
        sameRisk: false,
        recommendation: 'Switch for higher returns with moderate risk increase'
      }
    },
    { 
      id: 3, 
      name: 'Aggressive', 
      risk: 8, 
      return: 18.7, 
      assets: 15, 
      riskProfile: 'aggressive',
      trustScore: 3.8,
      safetyLevel: 'low',
      fundManager: 'BlackRock Advisors',
      comparisonResult: {
        betterThan: 'Balanced',
        difference: 6.3,
        sameRisk: false,
        recommendation: 'Consider if you can tolerate higher risk for maximum returns'
      }
    },
  ];

  // Render trust score stars
  const renderTrustScore = (score) => {
    const fullStars = Math.floor(score);
    const hasHalfStar = score % 1 >= 0.5;
    const stars = [];
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <Star className="w-4 h-4 text-yellow-400" />
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 absolute top-0 left-0" style={{ clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' }} />
          </div>
        );
      } else {
        stars.push(<Star key={i} className="w-4 h-4 text-gray-300" />);
      }
    }
    
    return (
      <div className="flex items-center">
        {stars}
        <span className="ml-1 text-sm font-medium">{score.toFixed(1)}</span>
      </div>
    );
  };
  
  // Render safety meter
  const renderSafetyMeter = (level) => {
    let color, icon, label;
    
    switch(level) {
      case 'high':
        color = 'bg-green-500';
        icon = <Shield className="w-4 h-4 text-green-600" />;
        label = 'High Safety';
        break;
      case 'medium':
        color = 'bg-yellow-500';
        icon = <Shield className="w-4 h-4 text-yellow-600" />;
        label = 'Medium Safety';
        break;
      case 'low':
        color = 'bg-red-500';
        icon = <AlertTriangle className="w-4 h-4 text-red-600" />;
        label = 'Low Safety';
        break;
      default:
        color = 'bg-gray-500';
        icon = <Shield className="w-4 h-4 text-gray-600" />;
        label = 'Unknown';
    }
    
    return (
      <div className="flex items-center">
        <div className={`w-3 h-3 rounded-full ${color} mr-2`}></div>
        <div className="flex items-center">
          {icon}
          <span className="ml-1 text-sm">{label}</span>
        </div>
      </div>
    );
  };

  const ComparisonCard = ({ portfolio }) => {
    // Determine the color scheme based on risk profile
    let gradientClass, riskColor;
    
    switch(portfolio.riskProfile) {
      case 'conservative':
        gradientClass = 'risk-profile-conservative';
        riskColor = 'text-blue-400';
        break;
      case 'aggressive':
        gradientClass = 'risk-profile-aggressive';
        riskColor = 'text-red-400';
        break;
      case 'balanced':
      default:
        gradientClass = 'risk-profile-balanced';
        riskColor = 'text-purple-400';
    }
    
    return (
      <div className={`glass-effect p-6 hover-card animate-fade-in transform hover:scale-105 transition-all duration-300 ${gradientClass}`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className={`text-xl font-bold ${riskColor}`}>
            {portfolio.name}
          </h3>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            portfolio.riskProfile === 'conservative' 
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 animate-pulse-slow' 
              : portfolio.riskProfile === 'aggressive'
                ? 'bg-gradient-to-r from-red-500 to-orange-500 animate-pulse-slow'
                : 'bg-gradient-to-r from-purple-500 to-blue-600 animate-pulse-slow'
          }`}>
            <span className="text-sm font-bold">{portfolio.risk}</span>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>Return Rate</span>
            <span className="text-lg font-bold text-green-400">+{portfolio.return}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>Assets</span>
            <span className="text-lg font-bold">{portfolio.assets}</span>
          </div>
          
          {/* Trust Score */}
          <div className="flex justify-between items-center">
            <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>Trust Score</span>
            {renderTrustScore(portfolio.trustScore)}
          </div>
          
          {/* Fund Manager */}
          <div className="flex justify-between items-center">
            <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>Fund Manager</span>
            <span className="text-sm font-medium">{portfolio.fundManager}</span>
          </div>
          
          {/* Safety Meter */}
          <div className="flex justify-between items-center">
            <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>Safety</span>
            {renderSafetyMeter(portfolio.safetyLevel)}
          </div>
          
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full animate-pulse-slow ${
                portfolio.riskProfile === 'conservative' 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-400' 
                  : portfolio.riskProfile === 'aggressive'
                    ? 'bg-gradient-to-r from-red-500 to-orange-400'
                    : 'bg-gradient-to-r from-purple-500 to-blue-500'
              }`}
              style={{ width: `${portfolio.risk * 10}%` }}
            />
          </div>
          
          {/* AI Recommendation */}
          {portfolio.comparisonResult && (
            <div className="mt-4 p-3 bg-white/10 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-0.5">
                  <Check className="w-4 h-4 text-green-400" />
                </div>
                <div className="ml-2">
                  <p className="text-sm font-medium">
                    <span className="text-green-400 font-bold">{portfolio.name}</span> is better than <span className="font-medium">{portfolio.comparisonResult.betterThan}</span>: 
                    {portfolio.comparisonResult.difference.toFixed(1)}% higher returns
                    {portfolio.comparisonResult.sameRisk ? ', same risk.' : '.'}
                  </p>
                  <p className="text-xs mt-1 text-gray-400">
                    {portfolio.comparisonResult.recommendation}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-20 px-4 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 animate-fade-in bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
        Compare Portfolios
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {portfolios.map((portfolio, index) => (
          <ComparisonCard 
            key={portfolio.id} 
            portfolio={portfolio} 
            style={{ animationDelay: `${index * 100}ms` }}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-effect animate-fade-in" style={{ animationDelay: '400ms' }}>
          <h2 className="text-xl font-semibold mb-4">Performance Comparison</h2>
          <div className="space-y-4">
            {portfolios.map((portfolio) => (
              <div key={portfolio.id} className="flex items-center p-3 bg-white/5 rounded-lg">
                <div className="w-24 text-sm font-medium">{portfolio.name}</div>
                <div className="flex-1 h-8 bg-white/10 rounded-lg relative">
                  <div 
                    className={`absolute top-0 left-0 h-full rounded-lg ${
                      portfolio.riskProfile === 'conservative' 
                        ? 'bg-gradient-to-r from-blue-500 to-blue-400' 
                        : portfolio.riskProfile === 'aggressive'
                          ? 'bg-gradient-to-r from-red-500 to-orange-400'
                          : 'bg-gradient-to-r from-purple-500 to-blue-500'
                    }`}
                    style={{ width: `${(portfolio.return / 20) * 100}%` }}
                  >
                    <div className="absolute top-0 right-2 h-full flex items-center">
                      <span className="text-sm font-bold text-white">{portfolio.return}%</span>
                    </div>
                  </div>
                </div>
                <div className="w-8 flex justify-center">
                  {portfolio.return > 10 && <Check className="w-5 h-5 text-green-400" />}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="glass-effect animate-fade-in" style={{ animationDelay: '500ms' }}>
          <h2 className="text-xl font-semibold mb-4">Risk Analysis</h2>
          <div className="space-y-4">
            {portfolios.map((portfolio, index) => {
              // Determine the color scheme based on risk profile
              let riskBgClass, riskTextColor;
              
              switch(portfolio.riskProfile) {
                case 'conservative':
                  riskBgClass = 'from-blue-500/20';
                  riskTextColor = 'text-blue-400';
                  break;
                case 'aggressive':
                  riskBgClass = 'from-red-500/20';
                  riskTextColor = 'text-red-400';
                  break;
                case 'balanced':
                default:
                  riskBgClass = 'from-purple-500/20';
                  riskTextColor = 'text-purple-400';
              }
              
              return (
                <div key={portfolio.id} className={`p-4 rounded-lg bg-gradient-to-r ${riskBgClass} to-transparent hover:bg-white/10 transition-all duration-300`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{portfolio.name}</span>
                    <div className="flex items-center">
                      <span className={`text-sm ${riskTextColor} mr-2`}>Risk Score: {portfolio.risk}</span>
                      {renderSafetyMeter(portfolio.safetyLevel)}
                    </div>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        portfolio.riskProfile === 'conservative' 
                          ? 'bg-gradient-to-r from-blue-500 to-blue-400' 
                          : portfolio.riskProfile === 'aggressive'
                            ? 'bg-gradient-to-r from-red-500 to-orange-400'
                            : 'bg-gradient-to-r from-purple-500 to-blue-500'
                      }`}
                      style={{ 
                        width: `${portfolio.risk * 10}%`,
                        animation: 'slideRight 1s ease-out forwards',
                        animationDelay: `${index * 200}ms`
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Compare; 