import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Modal from '../common/Modal';
import api from '../../services/api';

const QuickBuyModal = ({ isOpen, onClose, asset, assetType, refreshData }) => {
  const [step, setStep] = useState(1); // 1: Initial, 2: Confirmation, 3: Success, 4: Error
  const [amount, setAmount] = useState('');
  const [units, setUnits] = useState('');
  const [price, setPrice] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [buyMode, setBuyMode] = useState('amount'); // 'amount' or 'units'
  
  // Reset the form when asset changes
  useEffect(() => {
    if (asset) {
      setAmount('');
      setUnits('');
      setStep(1);
      setErrorMessage('');
      
      // Default to amount-based for MFs, units-based for stocks and crypto
      if (assetType === 'mutual_fund') {
        setBuyMode('amount');
      } else {
        setBuyMode('units');
      }
      
      fetchCurrentPrice();
    }
  }, [asset, assetType]);
  
  const fetchCurrentPrice = async () => {
    if (!asset || !assetType) return;
    
    try {
      let response;
      if (assetType === 'crypto') {
        response = await api.crypto.getPrice(asset.symbol);
      } else if (assetType === 'stock') {
        response = await api.stocks.getDetails(asset.symbol);
      } else if (assetType === 'mutual_fund') {
        response = await api.mutualFunds.getDetails(asset.schemeCode);
      } else {
        // Unified API call for any asset type
        response = await api.trading.getQuote(asset.symbol || asset.schemeCode, assetType, 1);
      }
      
      setPrice(response.data.price || response.data.nav || response.data.lastPrice);
    } catch (error) {
      console.error('Error fetching price:', error);
      setErrorMessage('Unable to fetch current price. Please try again.');
    }
  };
  
  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (value === '' || (/^\d*\.?\d*$/.test(value) && parseFloat(value) >= 0)) {
      setAmount(value);
      if (price > 0 && value !== '') {
        setUnits((parseFloat(value) / price).toFixed(6));
      } else {
        setUnits('');
      }
    }
  };
  
  const handleUnitsChange = (e) => {
    const value = e.target.value;
    if (value === '' || (/^\d*\.?\d*$/.test(value) && parseFloat(value) >= 0)) {
      setUnits(value);
      if (price > 0 && value !== '') {
        setAmount((parseFloat(value) * price).toFixed(2));
      } else {
        setAmount('');
      }
    }
  };
  
  const handleSetAmount = (value) => {
    setAmount(value);
    if (price > 0) {
      setUnits((parseFloat(value) / price).toFixed(6));
    }
  };
  
  const handleToggleBuyMode = () => {
    setBuyMode(buyMode === 'amount' ? 'units' : 'amount');
  };
  
  const handleProceed = () => {
    if (buyMode === 'amount' && (!amount || parseFloat(amount) <= 0)) {
      setErrorMessage('Please enter a valid amount to invest');
      return;
    }
    
    if (buyMode === 'units' && (!units || parseFloat(units) <= 0)) {
      setErrorMessage('Please enter a valid number of units to buy');
      return;
    }
    
    setErrorMessage('');
    setStep(2);
  };
  
  const handleConfirm = async () => {
    setIsProcessing(true);
    setErrorMessage('');
    
    try {
      // Use the unified trading API
      const response = await api.trading.quickBuy(
        asset.symbol || asset.schemeCode,
        assetType,
        parseFloat(amount)
      );
      
      // Check for success
      if (response.data && response.data.success) {
        setStep(3); // Success
        
        // Refresh the data after a successful purchase
        if (refreshData) {
          setTimeout(() => {
            refreshData();
          }, 1000);
        }
      } else {
        throw new Error(response.data.message || 'Transaction failed');
      }
    } catch (error) {
      console.error('Error buying asset:', error);
      setErrorMessage(error.message || 'Failed to buy asset. Please try again.');
      setStep(4); // Error
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleClose = () => {
    setStep(1);
    setErrorMessage('');
    onClose();
  };
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount);
  };
  
  if (!asset) return null;
  
  const renderStep1 = () => (
    <>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-medium">{asset.name}</h3>
            <p className="text-sm text-gray-400">{asset.symbol || asset.schemeCode}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold">{formatCurrency(price)}</p>
            <p className="text-sm text-gray-400">Current Price</p>
          </div>
        </div>
        
        <div className="p-4 bg-white/5 rounded-lg mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span>Asset Type:</span>
            <span className="font-medium capitalize">{assetType.replace('_', ' ')}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Change (24h):</span>
            <span className={`font-medium ${asset.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {asset.change > 0 ? '+' : ''}{asset.change}%
            </span>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <label className="block text-sm font-medium text-gray-300">
            {buyMode === 'amount' ? 'Amount to invest' : 'Units to buy'}
          </label>
          <button
            onClick={handleToggleBuyMode}
            className="text-xs text-purple-400 hover:text-purple-300"
          >
            Switch to {buyMode === 'amount' ? 'units' : 'amount'}
          </button>
        </div>
        
        {buyMode === 'amount' ? (
          <>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">₹</span>
              <input
                type="text"
                value={amount}
                onChange={handleAmountChange}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 pl-8 focus:outline-none focus:border-purple-500"
                placeholder="Enter amount"
              />
            </div>
            <div className="flex justify-between mt-2">
              <button
                onClick={() => handleSetAmount('5000')}
                className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-xs"
              >
                ₹5,000
              </button>
              <button
                onClick={() => handleSetAmount('10000')}
                className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-xs"
              >
                ₹10,000
              </button>
              <button
                onClick={() => handleSetAmount('25000')}
                className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-xs"
              >
                ₹25,000
              </button>
              <button
                onClick={() => handleSetAmount('50000')}
                className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-xs"
              >
                ₹50,000
              </button>
            </div>
          </>
        ) : (
          <div className="relative">
            <input
              type="text"
              value={units}
              onChange={handleUnitsChange}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500"
              placeholder="Enter units"
            />
          </div>
        )}
      </div>
      
      <div className="p-4 bg-white/5 rounded-lg mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span>Amount:</span>
          <span className="font-medium">{formatCurrency(parseFloat(amount) || 0)}</span>
        </div>
        <div className="flex justify-between text-sm mb-2">
          <span>Units (approx):</span>
          <span className="font-medium">{parseFloat(units) ? parseFloat(units).toFixed(6) : '0'}</span>
        </div>
        <div className="flex justify-between text-sm font-medium pt-2 border-t border-white/10">
          <span>Price per unit:</span>
          <span className="font-medium">{formatCurrency(price)}</span>
        </div>
      </div>
      
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300 text-sm">
          {errorMessage}
        </div>
      )}
      
      <div className="flex justify-end space-x-3">
        <button
          onClick={handleClose}
          className="px-4 py-2 border border-white/20 rounded-lg hover:bg-white/10 transition"
        >
          Cancel
        </button>
        <button
          onClick={handleProceed}
          disabled={(buyMode === 'amount' && (!amount || parseFloat(amount) <= 0)) || 
                   (buyMode === 'units' && (!units || parseFloat(units) <= 0))}
          className={`px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition ${
            (buyMode === 'amount' && (!amount || parseFloat(amount) <= 0)) || 
            (buyMode === 'units' && (!units || parseFloat(units) <= 0)) 
              ? 'opacity-50 cursor-not-allowed' 
              : ''
          }`}
        >
          Proceed
        </button>
      </div>
    </>
  );
  
  const renderStep2 = () => (
    <>
      <div className="mb-6">
        <div className="p-4 bg-blue-800/20 border border-blue-600/30 rounded-lg mb-6">
          <p className="text-blue-200 font-medium mb-2">Confirm your purchase</p>
          <p className="text-sm text-gray-300">
            You are about to invest <span className="font-medium">{formatCurrency(parseFloat(amount))}</span> to buy approximately{' '}
            <span className="font-medium">{parseFloat(units).toFixed(6)} units</span> of{' '}
            <span className="font-medium">{asset.name}</span>.
          </p>
          <p className="text-sm text-gray-300 mt-2">
            This action cannot be undone. Market price may fluctuate and the actual number of units purchased may vary.
          </p>
        </div>
        
        <div className="p-4 bg-white/5 rounded-lg mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span>Asset:</span>
            <span className="font-medium">{asset.name}</span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span>Amount to invest:</span>
            <span className="font-medium">{formatCurrency(parseFloat(amount))}</span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span>Estimated units:</span>
            <span className="font-medium">{parseFloat(units).toFixed(6)}</span>
          </div>
          <div className="flex justify-between text-sm font-medium pt-2 border-t border-white/10">
            <span>Price per unit:</span>
            <span className="font-medium">{formatCurrency(price)}</span>
          </div>
        </div>
      </div>
      
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300 text-sm">
          {errorMessage}
        </div>
      )}
      
      <div className="flex justify-end space-x-3">
        <button
          onClick={() => setStep(1)}
          disabled={isProcessing}
          className={`px-4 py-2 border border-white/20 rounded-lg hover:bg-white/10 transition ${
            isProcessing ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          Back
        </button>
        <button
          onClick={handleConfirm}
          disabled={isProcessing}
          className={`px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center ${
            isProcessing ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isProcessing ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            'Confirm Purchase'
          )}
        </button>
      </div>
    </>
  );
  
  const renderStep3 = () => (
    <div className="text-center py-6">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-green-900/30 rounded-full mb-4">
        <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
        </svg>
      </div>
      <h3 className="text-xl font-bold mb-2">Purchase Successful!</h3>
      <p className="text-gray-300 mb-2">
        You have successfully invested {formatCurrency(parseFloat(amount))} in {asset.name}.
      </p>
      <p className="text-sm text-gray-400 mb-6">
        You will receive approximately {parseFloat(units).toFixed(6)} units. The exact quantity may vary slightly based on the execution price.
      </p>
      <button
        onClick={handleClose}
        className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
      >
        Close
      </button>
    </div>
  );
  
  const renderStep4 = () => (
    <div className="text-center py-6">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-red-900/30 rounded-full mb-4">
        <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </div>
      <h3 className="text-xl font-bold mb-2">Transaction Failed</h3>
      <p className="text-red-300 mb-6">
        {errorMessage || 'There was an error processing your transaction. Please try again.'}
      </p>
      <div className="flex justify-center space-x-3">
        <button
          onClick={handleClose}
          className="px-4 py-2 border border-white/20 rounded-lg hover:bg-white/10 transition"
        >
          Close
        </button>
        <button
          onClick={() => setStep(1)}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
        >
          Try Again
        </button>
      </div>
    </div>
  );
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={step === 3 ? 'Transaction Complete' : step === 4 ? 'Transaction Failed' : 'Quick Buy'}
      size="md"
    >
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}
    </Modal>
  );
};

QuickBuyModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  asset: PropTypes.object,
  assetType: PropTypes.string.isRequired,
  refreshData: PropTypes.func,
};

export default QuickBuyModal; 