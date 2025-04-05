import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import { useUserInvestments } from '../../context/UserInvestmentsContext';
import { ChevronDown } from 'lucide-react';

const AllInvestmentsView = () => {
  const { userInvestments, isLoading: contextLoading } = useUserInvestments();
  const [processedData, setProcessedData] = useState(null);
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('value');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const processInvestmentsData = () => {
      if (!userInvestments || !userInvestments.userData || !userInvestments.userData.investments) {
        setIsLoading(false);
        return;
      }

      const { stocks = [], mutualFunds = [], indexFunds = [] } = userInvestments.userData.investments;

      // Transform to a unified format for display
      const allInvestments = [
        ...stocks.map(stock => ({
          id: stock.id,
          name: stock.stockName,
          symbol: stock.symbol,
          type: 'stock',
          platform: stock.brokerPlatform,
          quantity: stock.quantity,
          value: (Math.random() * 15000 + 5000).toFixed(0), // Mock value for demo
          purchaseDate: stock.purchaseDate,
          returns: (Math.random() * 25 - 5).toFixed(1) // Mock returns for demo
        })),
        ...mutualFunds.map(fund => ({
          id: fund.id,
          name: fund.fundName,
          symbol: fund.symbol,
          type: 'mutual_fund',
          platform: fund.brokerPlatform,
          quantity: fund.units,
          value: (Math.random() * 20000 + 3000).toFixed(0), // Mock value for demo
          purchaseDate: fund.purchaseDate,
          returns: (Math.random() * 20 + 2).toFixed(1) // Mock returns for demo
        })),
        ...indexFunds.map(fund => ({
          id: fund.id,
          name: fund.fundName,
          symbol: fund.symbol,
          type: 'index_fund',
          platform: fund.brokerPlatform,
          quantity: fund.units,
          value: (Math.random() * 10000 + 3000).toFixed(0), // Mock value for demo
          purchaseDate: fund.purchaseDate,
          returns: (Math.random() * 15 + 5).toFixed(1) // Mock returns for demo
        }))
      ];

      // Calculate platform summaries
      const platformMap = {};
      allInvestments.forEach(inv => {
        if (!platformMap[inv.platform]) {
          platformMap[inv.platform] = {
            id: inv.platform,
            name: getPlatformDisplayName(inv.platform),
            totalValue: 0,
            investments: [],
            returns: 0
          };
        }
        platformMap[inv.platform].investments.push(inv);
        platformMap[inv.platform].totalValue += Number(inv.value);
      });

      // Calculate average returns for each platform
      Object.values(platformMap).forEach(platform => {
        if (platform.investments.length > 0) {
          const totalReturns = platform.investments.reduce((sum, inv) => sum + Number(inv.returns), 0);
          platform.returns = (totalReturns / platform.investments.length).toFixed(1);
        }
      });

      // Calculate type summaries
      const typeMap = {
        stock: { id: 'stock', name: 'Stocks', totalValue: 0, returns: 0, count: 0 },
        mutual_fund: { id: 'mutual_fund', name: 'Mutual Funds', totalValue: 0, returns: 0, count: 0 },
        index_fund: { id: 'index_fund', name: 'Index Funds', totalValue: 0, returns: 0, count: 0 },
        etf: { id: 'etf', name: 'ETFs', totalValue: 0, returns: 0, count: 0 }
      };

      allInvestments.forEach(inv => {
        if (typeMap[inv.type]) {
          typeMap[inv.type].totalValue += Number(inv.value);
          typeMap[inv.type].returns += Number(inv.returns);
          typeMap[inv.type].count++;
        }
      });

      // Calculate average returns for each type
      Object.values(typeMap).forEach(type => {
        if (type.count > 0) {
          type.returns = (type.returns / type.count).toFixed(1);
        }
      });

      // Calculate total portfolio value and returns
      const totalValue = allInvestments.reduce((sum, inv) => sum + Number(inv.value), 0);
      const totalReturns = allInvestments.length > 0
        ? (allInvestments.reduce((sum, inv) => sum + Number(inv.returns), 0) / allInvestments.length).toFixed(1)
        : 0;

      setProcessedData({
        platforms: Object.values(platformMap),
        investments: allInvestments,
        types: Object.values(typeMap).filter(type => type.count > 0),
        totalValue,
        totalReturns
      });

      setIsLoading(false);
    };

    if (!contextLoading) {
      processInvestmentsData();
    }
  }, [userInvestments, contextLoading]);

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

  const filterInvestments = () => {
    if (!processedData) return [];
    
    let filtered = [...processedData.investments];
    
    if (filterPlatform !== 'all') {
      filtered = filtered.filter(investment => investment.platform === filterPlatform);
    }
    
    if (filterType !== 'all') {
      filtered = filtered.filter(investment => investment.type === filterType);
    }
    
    // Sort investments
    filtered.sort((a, b) => {
      if (sortBy === 'value') {
        return b.value - a.value;
      } else if (sortBy === 'returns') {
        return b.returns - a.returns;
      } else if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });
    
    return filtered;
  };

  const formatCurrency = (amount) => {
    return `₹${Number(amount).toLocaleString('en-IN')}`;
  };

  const getInvestmentTypeName = (typeId) => {
    const typeNames = {
      'stock': 'Stocks',
      'mutual_fund': 'Mutual Funds',
      'index_fund': 'Index Funds',
      'etf': 'ETFs',
      'bond': 'Bonds'
    };
    return typeNames[typeId] || typeId;
  };

  if (isLoading) {
    return (
      <Card className="h-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">All Investments</h2>
        </div>
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </Card>
    );
  }

  if (!processedData) {
    return (
      <Card className="h-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">All Investments</h2>
        </div>
        <div className="flex justify-center items-center h-40">
          <p className="text-gray-400">No investment data available</p>
        </div>
      </Card>
    );
  }

  const filteredInvestments = filterInvestments();

  return (
    <Card className="h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl font-semibold">All Investments</h2>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <select
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-sm focus:outline-none focus:border-purple-500 pr-8 appearance-none"
              value={filterPlatform}
              onChange={(e) => setFilterPlatform(e.target.value)}
            >
              <option value="all">All Platforms</option>
              {processedData.platforms.map(platform => (
                <option key={platform.id} value={platform.id}>{platform.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none" />
          </div>
          
          <div className="relative">
            <select
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-sm focus:outline-none focus:border-purple-500 pr-8 appearance-none"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Types</option>
              {processedData.types.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none" />
          </div>
          
          <div className="relative">
            <select
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-sm focus:outline-none focus:border-purple-500 pr-8 appearance-none"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="value">Sort by Value</option>
              <option value="returns">Sort by Returns</option>
              <option value="name">Sort by Name</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Platform Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {processedData.platforms.map(platform => (
          <div 
            key={platform.id} 
            className={`p-3 rounded-lg cursor-pointer ${filterPlatform === platform.id ? 'bg-purple-600/30 border border-purple-500/50' : 'bg-white/5 hover:bg-white/10'}`}
            onClick={() => setFilterPlatform(platform.id === filterPlatform ? 'all' : platform.id)}
          >
            <p className="text-sm font-medium">{platform.name}</p>
            <p className="text-lg font-bold mt-1">{formatCurrency(platform.totalValue)}</p>
            <p className={`text-xs mt-1 ${Number(platform.returns) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {Number(platform.returns) > 0 ? '+' : ''}{platform.returns}% return
            </p>
          </div>
        ))}
      </div>

      {/* Investments Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left text-xs font-medium text-gray-400 px-2 py-3">Name</th>
              <th className="text-left text-xs font-medium text-gray-400 px-2 py-3">Platform</th>
              <th className="text-left text-xs font-medium text-gray-400 px-2 py-3">Type</th>
              <th className="text-right text-xs font-medium text-gray-400 px-2 py-3">Value</th>
              <th className="text-right text-xs font-medium text-gray-400 px-2 py-3">Returns</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvestments.map((investment) => (
              <tr 
                key={investment.id} 
                className="border-b border-white/5 hover:bg-white/5 cursor-pointer"
              >
                <td className="text-sm font-medium px-2 py-3">{investment.name}</td>
                <td className="text-sm px-2 py-3">{getPlatformDisplayName(investment.platform)}</td>
                <td className="text-sm px-2 py-3">{getInvestmentTypeName(investment.type)}</td>
                <td className="text-sm text-right px-2 py-3">{formatCurrency(investment.value)}</td>
                <td className={`text-sm text-right px-2 py-3 ${Number(investment.returns) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {Number(investment.returns) > 0 ? '+' : ''}{investment.returns}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredInvestments.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-400">No investments match the selected filters</p>
        </div>
      )}

      <div className="mt-6 p-4 bg-white/5 rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-400">Total Assets</p>
            <p className="text-lg font-bold">{formatCurrency(processedData.totalValue)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Overall Returns</p>
            <p className={`text-lg font-bold ${Number(processedData.totalReturns) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {Number(processedData.totalReturns) > 0 ? '+' : ''}{processedData.totalReturns}%
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AllInvestmentsView; 