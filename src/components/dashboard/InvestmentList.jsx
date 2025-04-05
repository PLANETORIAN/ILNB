import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import InvestmentCard from './InvestmentCard';
import Card from '../common/Card';

const InvestmentList = () => {
  const { portfolio, loading, error } = usePortfolio();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('value');

  // Combine mutual funds and stocks
  const allInvestments = [...(portfolio.mutualFunds || []), ...(portfolio.stocks || [])];

  // Filter investments based on search and type filter
  const filteredInvestments = allInvestments.filter(investment => {
    const matchesSearch = investment.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || investment.type === filterType;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <Card className="h-full">
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full">
        <div className="flex justify-center items-center h-64 text-red-500">
          {error}
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Investments</h2>
        <select 
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-sm focus:outline-none focus:border-purple-500"
        >
          <option value="value" className="text-black">Sort by Value</option>
          <option value="change" className="text-black">Sort by Change</option>
          <option value="name" className="text-black">Sort by Name</option>
        </select>
      </div>

      {filteredInvestments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No investments found
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInvestments.map((investment) => (
            <div
              key={investment.id}
              className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-300 cursor-pointer"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{investment.name}</h3>
                  <p className="text-sm text-gray-400">{investment.type}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    ₹{investment.currentValue.toLocaleString()}
                  </p>
                  <p className={`text-sm ${
                    investment.returns >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {investment.returns >= 0 ? '+' : ''}{investment.returnPercentage}%
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default InvestmentList;