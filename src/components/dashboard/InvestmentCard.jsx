import React, { useState } from 'react';
import { ArrowRight, TrendingUp, TrendingDown, Plus, ExternalLink, ArrowUpDown, Check, Zap } from 'lucide-react';
import RiskIndicator from '../common/RiskIndicator';
import TooltipIcon from '../common/TooltipIcon';
import { Link } from 'react-router-dom';

const InvestmentCard = ({ investment }) => {
  const [showQuickBuy, setShowQuickBuy] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  
  const {
    id,
    name,
    type,
    investedAmount,
    currentValue,
    returns,
    returnPercentage,
    risk,
    lastUpdated,
    mfuLink
  } = investment;

  // Calculate if return is positive
  const isPositiveReturn = returns >= 0;

  // Format lastUpdated to a readable string
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const handleQuickBuy = (amount) => {
    // Validate amount
    if (!amount) return;
    
    // Start processing
    setIsProcessing(true);
    
    // Simulate API call to purchase investment
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      
      // Reset after showing success
      setTimeout(() => {
        setIsSuccess(false);
        setShowQuickBuy(false);
        setCustomAmount('');
        
        // Optionally navigate to execute page with this asset pre-selected
        // navigate(`/execute?asset=${id}&type=${type}`);
      }, 2000);
    }, 1500);
  };

  const handleCustomAmountChange = (e) => {
    // Allow only positive numbers
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setCustomAmount(value);
    }
  };

  // Note: handleQuickBuy takes care of quick investments directly

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-lg">{name}</h3>
          <span className="text-xs px-2 py-1 bg-gray-100 rounded-full capitalize">
            {type === 'mf' ? 'Mutual Fund' : type === 'etf' ? 'ETF' : type}
          </span>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-sm">Invested</span>
            <span className="font-medium">₹{investedAmount.toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-sm">Current Value</span>
            <span className="font-medium">₹{currentValue.toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-sm">Returns</span>
            <div className={`flex items-center ${isPositiveReturn ? 'text-green-600' : 'text-red-600'}`}>
              {isPositiveReturn ? (
                <TrendingUp className="w-4 h-4 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 mr-1" />
              )}
              <span>
                ₹{Math.abs(returns).toLocaleString()} ({returnPercentage.toFixed(1)}%)
              </span>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-sm">Risk</span>
            <RiskIndicator risk={risk} />
          </div>

          {showQuickBuy && (
            <div className="mt-2 p-3 bg-gray-50 rounded-lg animate-fade-in">
              {isSuccess ? (
                <div className="bg-green-100 text-green-800 p-2 rounded-lg flex items-center justify-center">
                  <Check className="w-4 h-4 mr-1" />
                  <span className="text-sm">Investment successful!</span>
                </div>
              ) : (
                <>
                  <h4 className="font-medium text-sm mb-2">Quick Invest</h4>
                  <div className="flex gap-2 mb-2">
                    {[5000, 10000, 25000].map((amount) => (
                      <button 
                        key={amount}
                        onClick={() => handleQuickBuy(amount)}
                        disabled={isProcessing}
                        className="flex-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ₹{amount.toLocaleString()}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Custom amount" 
                      value={customAmount}
                      onChange={handleCustomAmountChange}
                      disabled={isProcessing}
                      className="flex-1 px-2 py-1 text-xs border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <button 
                      onClick={() => handleQuickBuy(customAmount)}
                      disabled={isProcessing || !customAmount}
                      className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {isProcessing ? (
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></div>
                      ) : (
                        <Zap className="w-3 h-3 mr-1" />
                      )}
                      Invest
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
        <span className="text-xs text-gray-500">
          Last updated: {formatDate(lastUpdated)}
        </span>
        
        <div className="flex gap-2">
          <button className="px-3 py-1 text-sm border border-blue-600 text-blue-600 rounded hover:bg-blue-50">
            Compare
          </button>
          <button 
            onClick={() => setShowQuickBuy(!showQuickBuy)}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
          >
            <Plus className="w-3 h-3 mr-1" />
            Buy more
          </button>
          <Link 
            to={`/execute?asset=${id}&type=${type}`}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
          >
            <ArrowUpDown className="w-3 h-3 mr-1" />
            Trade
          </Link>
          {type === 'mf' && mfuLink && (
            <a 
              href={mfuLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-3 py-1 text-sm border border-blue-600 text-blue-600 rounded hover:bg-blue-50 flex items-center"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              MFU
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvestmentCard;