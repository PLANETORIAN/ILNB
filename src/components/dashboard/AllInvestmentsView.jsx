import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import api from '../../services/api';

const AllInvestmentsView = () => {
  const [investmentsData, setInvestmentsData] = useState(null);
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('value');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllInvestments = async () => {
      setIsLoading(true);
      try {
        const response = await api.portfolio.getAll();
        setInvestmentsData(response.data);
      } catch (error) {
        console.error('Error fetching all investments:', error);
        // Fallback data
        setInvestmentsData({
          platforms: [
            { id: 'zerodha', name: 'Zerodha', totalValue: 50000, returns: 12.5 },
            { id: 'groww', name: 'Groww', totalValue: 33000, returns: 8.2 },
            { id: 'coin', name: 'Coin by Zerodha', totalValue: 16500, returns: 7.8 },
            { id: 'upstox', name: 'Upstox', totalValue: 11000, returns: 5.5 },
          ],
          investments: [
            { id: 1, name: 'HDFC Bank', type: 'stock', platform: 'zerodha', value: 15000, returns: 18.5, quantity: 10 },
            { id: 2, name: 'Axis Bluechip Fund', type: 'mutual_fund', platform: 'groww', value: 20000, returns: 12.3, quantity: null },
            { id: 3, name: 'Reliance Industries', type: 'stock', platform: 'upstox', value: 8000, returns: 6.8, quantity: 5 },
            { id: 4, name: 'ICICI Prudential Balanced Advantage', type: 'mutual_fund', platform: 'coin', value: 12500, returns: 9.4, quantity: null },
            { id: 5, name: 'ITC Ltd', type: 'stock', platform: 'zerodha', value: 5500, returns: -2.1, quantity: 25 },
            { id: 6, name: 'SBI Gold ETF', type: 'etf', platform: 'groww', value: 7500, returns: 15.2, quantity: null },
            { id: 7, name: 'Mirae Asset Emerging Bluechip', type: 'mutual_fund', platform: 'coin', value: 4000, returns: 22.8, quantity: null },
            { id: 8, name: 'Bajaj Finance', type: 'stock', platform: 'zerodha', value: 12000, returns: 8.9, quantity: 6 },
            { id: 9, name: 'Parag Parikh Flexi Cap Fund', type: 'mutual_fund', platform: 'groww', value: 5500, returns: 14.7, quantity: null },
            { id: 10, name: 'Tata Motors', type: 'stock', platform: 'upstox', value: 3000, returns: 4.2, quantity: 15 },
          ],
          types: [
            { id: 'stock', name: 'Stocks', totalValue: 43500, returns: 9.2 },
            { id: 'mutual_fund', name: 'Mutual Funds', totalValue: 42000, returns: 13.8 },
            { id: 'etf', name: 'ETFs', totalValue: 7500, returns: 15.2 },
            { id: 'bond', name: 'Bonds', totalValue: 17500, returns: 6.5 },
          ],
          totalValue: 110500,
          totalReturns: 10.8,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllInvestments();
  }, []);

  const filterInvestments = () => {
    if (!investmentsData) return [];
    
    let filtered = [...investmentsData.investments];
    
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
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getPlatformName = (platformId) => {
    if (!investmentsData) return platformId;
    const platform = investmentsData.platforms.find(p => p.id === platformId);
    return platform ? platform.name : platformId;
  };

  const getInvestmentTypeName = (typeId) => {
    if (!investmentsData) return typeId;
    const type = investmentsData.types.find(t => t.id === typeId);
    return type ? type.name : typeId;
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

  const filteredInvestments = filterInvestments();

  return (
    <Card className="h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl font-semibold">All Investments</h2>
        <div className="flex flex-wrap gap-2">
          <select
            className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-sm focus:outline-none focus:border-purple-500"
            value={filterPlatform}
            onChange={(e) => setFilterPlatform(e.target.value)}
          >
            <option value="all">All Platforms</option>
            {investmentsData.platforms.map(platform => (
              <option key={platform.id} value={platform.id}>{platform.name}</option>
            ))}
          </select>
          <select
            className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-sm focus:outline-none focus:border-purple-500"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            {investmentsData.types.map(type => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
          <select
            className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-sm focus:outline-none focus:border-purple-500"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="value">Sort by Value</option>
            <option value="returns">Sort by Returns</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>
      </div>

      {/* Platform Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {investmentsData.platforms.map(platform => (
          <div 
            key={platform.id} 
            className={`p-3 rounded-lg cursor-pointer ${filterPlatform === platform.id ? 'bg-purple-600/30 border border-purple-500/50' : 'bg-white/5 hover:bg-white/10'}`}
            onClick={() => setFilterPlatform(platform.id === filterPlatform ? 'all' : platform.id)}
          >
            <p className="text-sm font-medium">{platform.name}</p>
            <p className="text-lg font-bold mt-1">{formatCurrency(platform.totalValue)}</p>
            <p className={`text-xs mt-1 ${platform.returns >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {platform.returns > 0 ? '+' : ''}{platform.returns}% return
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
                <td className="text-sm px-2 py-3">{getPlatformName(investment.platform)}</td>
                <td className="text-sm px-2 py-3">{getInvestmentTypeName(investment.type)}</td>
                <td className="text-sm text-right px-2 py-3">{formatCurrency(investment.value)}</td>
                <td className={`text-sm text-right px-2 py-3 ${investment.returns >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {investment.returns > 0 ? '+' : ''}{investment.returns}%
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
            <p className="text-lg font-bold">{formatCurrency(investmentsData.totalValue)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Overall Returns</p>
            <p className={`text-lg font-bold ${investmentsData.totalReturns >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {investmentsData.totalReturns > 0 ? '+' : ''}{investmentsData.totalReturns}%
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AllInvestmentsView; 