import React from 'react';
import { InfoIcon } from 'lucide-react';
import TooltipIcon from './TooltipIcon';

const RiskIndicator = ({ risk }) => {
  // Map risk level to color and label
  const getRiskInfo = (risk) => {
    switch (risk.toLowerCase()) {
      case 'low':
        return { color: 'bg-green-500', label: 'Low Risk' };
      case 'medium':
        return { color: 'bg-yellow-500', label: 'Medium Risk' };
      case 'high':
        return { color: 'bg-red-500', label: 'High Risk' };
      default:
        return { color: 'bg-gray-400', label: 'Unknown Risk' };
    }
  };

  const { color, label } = getRiskInfo(risk);

  return (
    <div className="flex items-center gap-2">
      <div className={`w-4 h-4 rounded-full ${color}`}></div>
      <span>{label}</span>
      <TooltipIcon 
        content="Risk level is calculated based on historical volatility, fund composition, and market correlations."
      />
    </div>
  );
};

export default RiskIndicator;