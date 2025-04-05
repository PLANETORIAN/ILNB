import React from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import Card from '../common/Card';

const PortfolioSummary = () => {
  const { portfolio } = usePortfolio();
  
  const stats = [
    {
      label: 'Total Value',
      value: '$1,234,567',
      change: '+5.2%',
      isPositive: true,
    },
    {
      label: 'Today\'s Return',
      value: '$12,345',
      change: '+1.8%',
      isPositive: true,
    },
    {
      label: 'Total Return',
      value: '$234,567',
      change: '+23.4%',
      isPositive: true,
    },
    {
      label: 'Risk Score',
      value: '7.2',
      change: '-0.3',
      isPositive: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <Card key={stat.label} className="hover-card">
          <div className="space-y-2">
            <p className="text-gray-400 text-sm">{stat.label}</p>
            <div className="flex items-end space-x-2">
              <span className="text-2xl font-bold">{stat.value}</span>
              <span className={`text-sm ${
                stat.isPositive ? 'text-green-400' : 'text-red-400'
              }`}>
                {stat.change}
              </span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default PortfolioSummary;