import React, { useState } from 'react';
import { useUserInvestments } from '../../context/UserInvestmentsContext';
import { v4 as uuidv4 } from 'uuid';
import { PlusCircle, Check, AlertCircle } from 'lucide-react';

const AddInvestmentForm = () => {
  const { userInvestments, setUserInvestments } = useUserInvestments();
  const [investmentType, setInvestmentType] = useState('stock');
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [broker, setBroker] = useState('zerodha');
  const [quantity, setQuantity] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  const brokerOptions = [
    { value: 'zerodha', label: 'Zerodha' },
    { value: 'groww', label: 'Groww' },
    { value: 'upstox', label: 'Upstox' },
    { value: 'angel', label: 'Angel One' },
    { value: 'kuvera', label: 'Kuvera' },
    { value: 'mfcentral', label: 'MF Central' },
    { value: 'coin', label: 'Coin by Zerodha' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate inputs
    if (!name || !symbol || !quantity || !purchaseDate) {
      setNotification({
        type: 'error',
        message: 'Please fill in all required fields.'
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // Create new investment object
      const newInvestment = {
        id: `${investmentType}_inv_${uuidv4().substring(0, 8)}`,
        investmentType,
        brokerPlatform: broker,
        purchaseDate,
        symbol: symbol.toUpperCase(),
      };

      // Add specific fields based on investment type
      if (investmentType === 'stock') {
        newInvestment.stockName = name;
        newInvestment.quantity = Number(quantity);
      } else {
        // For mutual funds and index funds
        newInvestment.fundName = name;
        newInvestment.units = Number(quantity);
      }

      // Clone the current user investments
      const updatedUserInvestments = JSON.parse(JSON.stringify(userInvestments));
      
      // Add the new investment to the appropriate array
      if (investmentType === 'stock') {
        updatedUserInvestments.userData.investments.stocks.push(newInvestment);
      } else if (investmentType === 'mutualFund') {
        updatedUserInvestments.userData.investments.mutualFunds.push(newInvestment);
      } else if (investmentType === 'indexFund') {
        updatedUserInvestments.userData.investments.indexFunds.push(newInvestment);
      }

      // Update context with new investment data
      setUserInvestments(updatedUserInvestments);

      // Show success notification
      setNotification({
        type: 'success',
        message: 'Investment added successfully!'
      });

      // Reset form fields
      setName('');
      setSymbol('');
      setQuantity('');
      setPurchaseDate(new Date().toISOString().split('T')[0]);

    } catch (error) {
      console.error('Error adding investment:', error);
      setNotification({
        type: 'error',
        message: 'Failed to add investment. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
      
      // Clear notification after 5 seconds
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Add New Investment</h2>
      
      {notification && (
        <div className={`flex items-center gap-2 p-3 rounded-lg mb-4 ${
          notification.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
        }`}>
          {notification.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          <p>{notification.message}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Investment Type */}
          <div>
            <label htmlFor="investmentType" className="block text-sm font-medium text-gray-400 mb-1">
              Investment Type
            </label>
            <select
              id="investmentType"
              value={investmentType}
              onChange={(e) => setInvestmentType(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500 text-gray-400"
            >
              <option value="stock">Stock</option>
              <option value="mutualFund">Mutual Fund</option>
              <option value="indexFund">Index Fund</option>
            </select>
          </div>

          {/* Broker Platform */}
          <div>
            <label htmlFor="broker" className="block text-sm font-medium text-gray-400 mb-1">
              Broker Platform
            </label>
            <select
              id="broker"
              value={broker}
              onChange={(e) => setBroker(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500 text-gray-400"
            >
              {brokerOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Investment Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-1">
              {investmentType === 'stock' ? 'Stock Name' : 'Fund Name'}
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={investmentType === 'stock' ? 'e.g. Tata Consultancy Services' : 'e.g. SBI Blue Chip Fund'}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Symbol */}
          <div>
            <label htmlFor="symbol" className="block text-sm font-medium text-gray-400 mb-1">
              Symbol
            </label>
            <input
              id="symbol"
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder={investmentType === 'stock' ? 'e.g. TCS' : 'e.g. SBIBLUECHIP'}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Quantity/Units */}
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-400 mb-1">
              {investmentType === 'stock' ? 'Quantity' : 'Units'}
            </label>
            <input
              id="quantity"
              type="number"
              min="0.01"
              step="0.01"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter quantity"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Purchase Date */}
          <div>
            <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-400 mb-1">
              Purchase Date
            </label>
            <input
              id="purchaseDate"
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-colors flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              <span>Adding...</span>
            </>
          ) : (
            <>
              <PlusCircle size={18} />
              <span>Add Investment</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default AddInvestmentForm; 