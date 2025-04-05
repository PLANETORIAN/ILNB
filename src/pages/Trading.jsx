import React from 'react';
import UnifiedTrading from '../components/trading/UnifiedTrading';

const Trading = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Trading Platform</h1>
        <div className="text-sm text-gray-400">
          Trade stocks, mutual funds, and cryptocurrencies in one place
        </div>
      </div>
      
      <div className="dashboard-component glass-effect rounded-xl p-4">
        <UnifiedTrading />
      </div>
    </div>
  );
};

export default Trading; 