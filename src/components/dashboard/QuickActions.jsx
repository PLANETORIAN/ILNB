import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../common/Card';
import { ArrowUpDown, TrendingUp, BarChart3, Settings, Zap, Check } from 'lucide-react';

const QuickActions = () => {
  const [showQuickInvest, setShowQuickInvest] = useState(false);
  const [processingInvestment, setProcessingInvestment] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  const actions = [
    {
      name: 'Quick Invest',
      description: 'Instantly invest in recommended funds',
      path: '#quick-invest',
      icon: <Zap className="w-5 h-5 text-yellow-400" />,
      onClick: () => setShowQuickInvest(true)
    },
    {
      name: 'Buy Assets',
      description: 'Purchase stocks, mutual funds, or ETFs',
      path: '/execute',
      icon: <ArrowUpDown className="w-5 h-5 text-blue-400" />,
    },
    {
      name: 'Compare Markets',
      description: 'Analyze market performance',
      path: '/compare',
      icon: <BarChart3 className="w-5 h-5 text-purple-400" />,
    },
    {
      name: 'View Reports',
      description: 'Check your portfolio reports',
      path: '/reports',
      icon: <TrendingUp className="w-5 h-5 text-green-400" />,
    },
    {
      name: 'Settings',
      description: 'Manage your preferences',
      path: '/profile',
      icon: <Settings className="w-5 h-5 text-gray-400" />,
    },
  ];

  // Quick investment options with updated mfuLinks
  const quickInvestOptions = [
    { 
      id: 1, 
      name: 'SBI Bluechip Fund', 
      type: 'mf', 
      returns: '12.3%', 
      risk: 'Medium', 
      amount: 5000,
      mfuLink: 'https://www.mfuindia.com/SBI-Bluechip-Fund'
    },
    { 
      id: 2, 
      name: 'Axis Long Term Equity Fund', 
      type: 'mf', 
      returns: '14.8%', 
      risk: 'Medium-High', 
      amount: 10000,
      mfuLink: 'https://www.mfuindia.com/Axis-Long-Term-Equity-Fund'
    },
    { 
      id: 3, 
      name: 'ICICI Prudential Value Discovery Fund', 
      type: 'mf', 
      returns: '11.5%', 
      risk: 'Medium', 
      amount: 5000,
      mfuLink: 'https://www.mfuindia.com/ICICI-Prudential-Value-Discovery-Fund'
    }
  ];

  // Handle quick investment
  const handleQuickInvest = (option) => {
    // Start processing animation
    setProcessingInvestment(option.id);
    
    // Simulate API call
    setTimeout(() => {
      // Complete the investment
      setProcessingInvestment(null);
      setSuccessMessage(`Successfully invested ₹${option.amount.toLocaleString()} in ${option.name}`);
      
      // Close the quick invest dialog after showing success message
      setTimeout(() => {
        setSuccessMessage('');
        setShowQuickInvest(false);
        
        // Navigate to the execute page with the selected asset
        // This is optional - can be removed if you prefer to stay on the dashboard
        // navigate(`/execute?asset=${option.id}&type=${option.type}`);
      }, 2000);
    }, 1500);
  };

  // Function to handle execution on MFU
  const handleMFUExecution = (option, e) => {
    e.stopPropagation(); // Prevent the parent element's onClick from firing
    window.open(option.mfuLink, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card className="h-full relative">
      <h2 className="text-xl font-semibold mb-6">Quick Actions</h2>
      
      {/* Quick Invest Dialog */}
      {showQuickInvest && (
        <div className="absolute inset-0 bg-white/90 dark:bg-gray-900/90 p-6 z-10 backdrop-blur-sm rounded-lg animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">One-Click Investment</h3>
            <button 
              onClick={() => setShowQuickInvest(false)}
              className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              &times;
            </button>
          </div>
          
          {successMessage ? (
            <div className="bg-green-100 dark:bg-green-800/30 text-green-800 dark:text-green-300 p-4 rounded-lg flex items-center justify-center mb-4">
              <Check className="w-5 h-5 mr-2" />
              <span>{successMessage}</span>
            </div>
          ) : (
            <p className="text-sm mb-4">Choose a pre-vetted fund to instantly invest:</p>
          )}
          
          <div className="space-y-3">
            {quickInvestOptions.map(option => (
              <div key={option.id} className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-medium">{option.name}</h4>
                  <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                    {option.type === 'mf' ? 'Mutual Fund' : option.type}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm mb-3">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Returns: </span>
                    <span className="text-green-600 dark:text-green-400">{option.returns}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Risk: </span>
                    <span>{option.risk}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="font-medium">₹{option.amount.toLocaleString()}</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleQuickInvest(option)}
                      disabled={processingInvestment === option.id}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processingInvestment === option.id ? (
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></div>
                      ) : (
                        <Zap className="w-3 h-3 mr-1" />
                      )}
                      Invest Now
                    </button>
                    {option.type === 'mf' && option.mfuLink && (
                      <button
                        onClick={(e) => handleMFUExecution(option, e)}
                        className="px-3 py-1 border border-blue-600 text-blue-600 text-sm rounded hover:bg-blue-50 flex items-center"
                      >
                        MFU
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {actions.map((action) => (
          action.onClick ? (
            <div
              key={action.name}
              onClick={action.onClick}
              className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-300 group hover:scale-105 transform cursor-pointer"
            >
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                  {action.icon}
                </div>
                <div>
                  <h3 className="font-medium group-hover:text-purple-400 transition-colors">
                    {action.name}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {action.description}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <Link
              key={action.name}
              to={action.path}
              className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-300 group hover:scale-105 transform"
            >
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                  {action.icon}
                </div>
                <div>
                  <h3 className="font-medium group-hover:text-purple-400 transition-colors">
                    {action.name}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {action.description}
                  </p>
                </div>
              </div>
            </Link>
          )
        ))}
      </div>
    </Card>
  );
};

export default QuickActions; 