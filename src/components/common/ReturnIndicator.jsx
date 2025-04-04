import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import TooltipIcon from './TooltipIcon';

const ReturnIndicator = ({ initialAmount, currentAmount, period = '1 year' }) => {
  const returnAmount = currentAmount - initialAmount;
  const returnPercentage = (returnAmount / initialAmount) * 100;
  const isPositive = returnAmount >= 0;

  return (
    <div className="flex items-center gap-2">
      <div className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? (
          <TrendingUp className="w-4 h-4 mr-1" />
        ) : (
          <TrendingDown className="w-4 h-4 mr-1" />
        )}
        <span className="font-medium">
          ₹{Math.abs(returnAmount).toLocaleString()} ({returnPercentage.toFixed(1)}%)
        </span>
        <span className="text-gray-500 text-sm ml-1">in {period}</span>
      </div>
      <TooltipIcon 
        content={`Initial investment of ₹${initialAmount.toLocaleString()} ${isPositive ? 'grew to' : 'decreased to'} ₹${currentAmount.toLocaleString()} over ${period}.`}
      />
    </div>
  );
};

export default ReturnIndicator;