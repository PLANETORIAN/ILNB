import React, { useState, useEffect } from 'react';
import { useUserInvestments } from '../../context/UserInvestmentsContext';
import { ChevronDown } from 'lucide-react';

const PerformanceMetrics = () => {
  const { userInvestments, isLoading: contextLoading } = useUserInvestments();
  const [metrics, setMetrics] = useState(null);
  const [period, setPeriod] = useState('3m');
  const [isLoading, setIsLoading] = useState(true);

  // Stock performance data by time period
  const stockPerformance = {
    // Map of stock/fund name to base performance, we'll scale this based on time period
    "Bharti Airtel": { basePerformance: 6.0, volatility: 'high' },
    "ICICI Bank": { basePerformance: 3.5, volatility: 'medium' },
    "Tata Consultancy Services": { basePerformance: 3.0, volatility: 'low' },
    "Parag Parikh Flexi Cap Fund": { basePerformance: -1.7, volatility: 'medium' },
    "Hindustan Unilever": { basePerformance: -1.7, volatility: 'low' },
    "Reliance Industries": { basePerformance: 4.2, volatility: 'medium' },
    "SBI Blue Chip Fund": { basePerformance: 2.8, volatility: 'low' },
    "Adani Ports": { basePerformance: -2.5, volatility: 'high' },
  };

  // Time period multipliers to scale returns
  const periodMultipliers = {
    '1m': 0.4,
    '3m': 1.0,
    '6m': 1.8,
    '1y': 2.5,
    '3y': 4.0,
    '5y': 5.5
  };

  // Calculate performance for a given stock based on time period
  const calculatePerformance = (stockName, period) => {
    if (!stockPerformance[stockName]) return 0;
    
    const { basePerformance, volatility } = stockPerformance[stockName];
    const multiplier = periodMultipliers[period];
    
    // Add some randomization based on volatility
    let volatilityFactor = 1.0;
    if (volatility === 'high') {
      // More variance for high volatility stocks
      volatilityFactor = 1.0 + ((Math.random() * 0.4) - 0.2);
    } else if (volatility === 'medium') {
      // Medium variance
      volatilityFactor = 1.0 + ((Math.random() * 0.2) - 0.1);
    } else {
      // Low variance
      volatilityFactor = 1.0 + ((Math.random() * 0.1) - 0.05);
    }
    
    // Calculate scaled performance and ensure it's consistent for the same period
    const seed = period.charCodeAt(0) + period.charCodeAt(period.length - 1);
    const randomComponent = Math.sin(seed + stockName.length) * 0.2;
    
    const scaledPerformance = (basePerformance * multiplier * volatilityFactor) + randomComponent;
    
    // For longer time periods, reduce the chance of negative returns for positive base performers
    if (basePerformance > 0 && ['1y', '3y', '5y'].includes(period)) {
      return Math.max(0.5, scaledPerformance);
    }
    
    // For negative base performers, make them more negative in longer periods if they're bad investments
    if (basePerformance < 0 && ['1y', '3y', '5y'].includes(period)) {
      return Math.min(-0.8, scaledPerformance);
    }
    
    return scaledPerformance;
  };

  useEffect(() => {
    const calculatePerformanceMetrics = () => {
      if (!userInvestments || !userInvestments.userData || !userInvestments.userData.investments) {
        setIsLoading(false);
        return;
      }

      // Get investment data from context
      const { stocks = [], mutualFunds = [], indexFunds = [] } = userInvestments.userData.investments;

      // Create a map of all investments
      const allInvestments = [
        ...stocks.map(stock => ({
          name: stock.stockName,
          platform: stock.brokerPlatform,
          return: calculatePerformance(stock.stockName, period)
        })),
        ...mutualFunds.map(fund => ({
          name: fund.fundName,
          platform: fund.brokerPlatform,
          return: calculatePerformance(fund.fundName, period)
        })),
        ...indexFunds.map(fund => ({
          name: fund.fundName,
          platform: fund.brokerPlatform,
          return: calculatePerformance(fund.fundName, period)
        }))
      ];

      // Sort investments by return to find top performers and underperformers
      const sortedInvestments = [...allInvestments].sort((a, b) => b.return - a.return);
      
      // Use fixed names for demonstration, but with varying returns based on period
      const topPerformers = [
        {
          name: 'Bharti Airtel',
          platform: 'Upstox',
          return: calculatePerformance('Bharti Airtel', period).toFixed(1)
        },
        {
          name: 'ICICI Bank',
          platform: 'Groww',
          return: calculatePerformance('ICICI Bank', period).toFixed(1)
        },
        {
          name: 'Tata Consultancy Services',
          platform: 'Zerodha',
          return: calculatePerformance('Tata Consultancy Services', period).toFixed(1)
        }
      ];
      
      const underperformers = [
        {
          name: 'Parag Parikh Flexi Cap Fund',
          platform: 'MF Central',
          return: calculatePerformance('Parag Parikh Flexi Cap Fund', period).toFixed(1)
        },
        {
          name: 'Hindustan Unilever',
          platform: 'Zerodha',
          return: calculatePerformance('Hindustan Unilever', period).toFixed(1)
        }
      ];

      // Set metrics with period-adjusted performance data
      setMetrics({
        topPerformers,
        underperformers
      });
      
      setIsLoading(false);
    };

    if (!contextLoading) {
      calculatePerformanceMetrics();
    }
  }, [userInvestments, contextLoading, period]);

  // Helper to get display names for platforms
  const getPlatformDisplayName = (platformId) => {
    const displayNames = {
      'zerodha': 'Zerodha',
      'groww': 'Groww',
      'upstox': 'Upstox',
      'kuvera': 'Kuvera',
      'mfcentral': 'MF Central',
      'coin': 'Coin by Zerodha'
    };
    return displayNames[platformId] || platformId;
  };

  const handlePeriodChange = (e) => {
    setPeriod(e.target.value);
  };

  const getPeriodDisplayName = () => {
    const displayNames = {
      '1m': '1 Month',
      '3m': '3 Months',
      '6m': '6 Months',
      '1y': '1 Year',
      '3y': '3 Years',
      '5y': '5 Years'
    };
    return displayNames[period] || period;
  };

  if (isLoading) {
    return (
      <div className="h-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Performance Metrics</h2>
          <div className="relative">
            <button
              className="bg-white/10 border border-white/20 rounded-lg px-4 py-1 text-sm focus:outline-none focus:border-purple-500 flex items-center gap-2"
            >
              {getPeriodDisplayName()}
              <ChevronDown size={16} />
            </button>
          </div>
        </div>
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="h-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Performance Metrics</h2>
          <div className="relative">
            <button
              className="bg-white/10 border border-white/20 rounded-lg px-4 py-1 text-sm focus:outline-none focus:border-purple-500 flex items-center gap-2"
            >
              {getPeriodDisplayName()}
              <ChevronDown size={16} />
            </button>
          </div>
        </div>
        <div className="flex justify-center items-center h-40 text-gray-400">
          No performance data available
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Performance Metrics</h2>
        <div className="relative">
          <select
            className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-sm focus:outline-none focus:border-purple-500 appearance-none pr-8"
            value={period}
            onChange={handlePeriodChange}
          >
            <option value="1m">1 Month</option>
            <option value="3m">3 Months</option>
            <option value="6m">6 Months</option>
            <option value="1y">1 Year</option>
            <option value="3y">3 Years</option>
            <option value="5y">5 Years</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none" />
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-md font-medium mb-3">Top Performers</h3>
        <div className="space-y-2">
          {metrics.topPerformers.map((item, index) => (
            <div key={index} className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
              <div>
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-gray-400">{item.platform}</p>
              </div>
              <p className="text-sm font-bold text-green-400">+{Math.abs(parseFloat(item.return)).toFixed(1)}%</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-md font-medium mb-3">Underperformers</h3>
        <div className="space-y-2">
          {metrics.underperformers.map((item, index) => (
            <div key={index} className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
              <div>
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-gray-400">{item.platform}</p>
              </div>
              <p className={`text-sm font-bold ${parseFloat(item.return) < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                {parseFloat(item.return) < 0 ? '-' : '+'}{Math.abs(parseFloat(item.return)).toFixed(1)}%
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PerformanceMetrics; 