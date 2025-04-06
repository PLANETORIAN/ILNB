import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import { useUserInvestments } from '../../context/UserInvestmentsContext';
import { ChevronDown } from 'lucide-react';
import axios from 'axios';

const AllInvestmentsView = () => {
  const { userInvestments, isLoading: contextLoading } = useUserInvestments();
  const [processedData, setProcessedData] = useState(null);
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('value');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const processInvestmentsData = async () => {
      if (!userInvestments || !userInvestments.userData || !userInvestments.userData.investments) {
        setIsLoading(false);
        return;
      }

      const { stocks = [], mutualFunds = [], indexFunds = [] } = userInvestments.userData.investments;

      // Transform to a unified format for display
      const allInvestments = [];

      // Process stocks with real API data
      for (const stock of stocks) {
        try {
          // Get current price
          const response = await axios.get(`https://stock-server-j29j.onrender.com/stock/${stock.symbol}.NS`);
          const currentPrice = response.data.live_price;

          // Get historical price data to find purchase price
          const historicalResponse = await axios.get(`https://stock-server-j29j.onrender.com/stock/${stock.symbol}.NS`);
          const purchaseDate = new Date(stock.purchaseDate);
          
          // Find the closest historical price to purchase date
          const historicalData = historicalResponse.data.data;
          let purchasePrice = currentPrice; // default to current price if no historical data found
          
          if (historicalData && historicalData.length > 0) {
            const closestPriceData = historicalData.reduce((closest, current) => {
              const currentDate = new Date(current.Date);
              const closestDate = new Date(closest.Date);
              const purchaseTimeDiff = Math.abs(purchaseDate - currentDate);
              const closestTimeDiff = Math.abs(purchaseDate - closestDate);
              return purchaseTimeDiff < closestTimeDiff ? current : closest;
            });
            purchasePrice = closestPriceData.Close;
          }

          const value = currentPrice * stock.quantity;
          const investedAmount = purchasePrice * stock.quantity;
          const returns = ((value - investedAmount) / investedAmount * 100).toFixed(1);

          console.log(`Stock ${stock.symbol} - Current: ${currentPrice}, Purchase: ${purchasePrice}, Returns: ${returns}%`);

          allInvestments.push({
            id: stock.id,
            name: stock.stockName,
            symbol: stock.symbol,
            type: 'stock',
            platform: stock.brokerPlatform,
            quantity: stock.quantity,
            value: value.toFixed(0),
            purchaseDate: stock.purchaseDate,
            returns: returns,
            currentPrice,
            purchasePrice,
            investedAmount: investedAmount.toFixed(0)
          });
        } catch (error) {
          console.error(`Error fetching price for ${stock.symbol}:`, error);
          // Use fallback values if API fails
          const fallbackCurrentPrice = 1000;
          const fallbackPurchasePrice = 900; // Assume a lower purchase price for demonstration
          const fallbackValue = fallbackCurrentPrice * stock.quantity;
          const fallbackInvestedAmount = fallbackPurchasePrice * stock.quantity;
          const fallbackReturns = ((fallbackValue - fallbackInvestedAmount) / fallbackInvestedAmount * 100).toFixed(1);

          allInvestments.push({
            id: stock.id,
            name: stock.stockName,
            symbol: stock.symbol,
            type: 'stock',
            platform: stock.brokerPlatform,
            quantity: stock.quantity,
            value: fallbackValue.toFixed(0),
            purchaseDate: stock.purchaseDate,
            returns: fallbackReturns,
            currentPrice: fallbackCurrentPrice,
            purchasePrice: fallbackPurchasePrice,
            investedAmount: fallbackInvestedAmount.toFixed(0)
          });
        }
      }

      // Process mutual funds
      mutualFunds.forEach(fund => {
        // For mutual funds, use historical NAV data
        const currentNav = fund.currentNav || 120;
        const purchaseNav = 100; // This should ideally come from historical NAV data
        const value = currentNav * fund.units;
        const investedAmount = purchaseNav * fund.units;
        const returns = ((value - investedAmount) / investedAmount * 100).toFixed(1);

        allInvestments.push({
          id: fund.id,
          name: fund.fundName,
          symbol: fund.symbol,
          type: 'mutual_fund',
          platform: fund.brokerPlatform,
          quantity: fund.units,
          value: value.toFixed(0),
          purchaseDate: fund.purchaseDate,
          returns: returns,
          currentNav,
          purchaseNav,
          investedAmount: investedAmount.toFixed(0)
        });
      });

      // Process index funds
      indexFunds.forEach(fund => {
        // For index funds, use historical NAV data
        const currentNav = fund.currentNav || 180;
        const purchaseNav = 150; // This should ideally come from historical NAV data
        const value = currentNav * fund.units;
        const investedAmount = purchaseNav * fund.units;
        const returns = ((value - investedAmount) / investedAmount * 100).toFixed(1);

        allInvestments.push({
          id: fund.id,
          name: fund.fundName,
          symbol: fund.symbol,
          type: 'index_fund',
          platform: fund.brokerPlatform,
          quantity: fund.units,
          value: value.toFixed(0),
          purchaseDate: fund.purchaseDate,
          returns: returns,
          currentNav,
          purchaseNav,
          investedAmount: investedAmount.toFixed(0)
        });
      });

      // Calculate platform summaries
      const platformMap = {};
      allInvestments.forEach(inv => {
        if (!platformMap[inv.platform]) {
          platformMap[inv.platform] = {
            id: inv.platform,
            name: getPlatformDisplayName(inv.platform),
            totalValue: 0,
            totalInvested: 0,
            investments: [],
            returns: 0
          };
        }
        platformMap[inv.platform].investments.push(inv);
        platformMap[inv.platform].totalValue += Number(inv.value);
        platformMap[inv.platform].totalInvested += Number(inv.investedAmount);
      });

      // Calculate returns for each platform based on total value and total invested amount
      Object.values(platformMap).forEach(platform => {
        if (platform.totalInvested > 0) {
          platform.returns = ((platform.totalValue - platform.totalInvested) / platform.totalInvested * 100).toFixed(1);
        }
      });

      // Calculate type summaries
      const typeMap = {
        stock: { id: 'stock', name: 'Stocks', totalValue: 0, totalInvested: 0, count: 0 },
        mutual_fund: { id: 'mutual_fund', name: 'Mutual Funds', totalValue: 0, totalInvested: 0, count: 0 },
        index_fund: { id: 'index_fund', name: 'Index Funds', totalValue: 0, totalInvested: 0, count: 0 },
        etf: { id: 'etf', name: 'ETFs', totalValue: 0, totalInvested: 0, count: 0 }
      };

      allInvestments.forEach(inv => {
        if (typeMap[inv.type]) {
          typeMap[inv.type].totalValue += Number(inv.value);
          typeMap[inv.type].totalInvested += Number(inv.investedAmount);
          typeMap[inv.type].count++;
        }
      });

      // Calculate returns for each type based on total value and total invested amount
      Object.values(typeMap).forEach(type => {
        if (type.totalInvested > 0) {
          type.returns = ((type.totalValue - type.totalInvested) / type.totalInvested * 100).toFixed(1);
        }
      });

      // Calculate total portfolio value and returns
      const totalValue = allInvestments.reduce((sum, inv) => sum + Number(inv.value), 0);
      const totalInvested = allInvestments.reduce((sum, inv) => sum + Number(inv.investedAmount), 0);
      const totalReturns = totalInvested > 0 ? ((totalValue - totalInvested) / totalInvested * 100).toFixed(1) : '0.0';

      setProcessedData({
        platforms: Object.values(platformMap),
        investments: allInvestments,
        types: Object.values(typeMap).filter(type => type.count > 0),
        totalValue,
        totalInvested,
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