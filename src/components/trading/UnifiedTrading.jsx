import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import QuickSellModal from './QuickSellModal';
import QuickBuyModal from './QuickBuyModal';
import api from '../../services/api';

const UnifiedTrading = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [assetType, setAssetType] = useState('all');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [assetTypes, setAssetTypes] = useState([]);
  const [isQuickSellModalOpen, setIsQuickSellModalOpen] = useState(false);
  const [isQuickBuyModalOpen, setIsQuickBuyModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('search'); // search, watchlist, portfolio
  
  // Fetch available asset types for the dropdown
  useEffect(() => {
    const fetchAssetTypes = async () => {
      try {
        const response = await api.trading.getAssetTypes();
        setAssetTypes(response.data);
      } catch (error) {
        console.error('Error fetching asset types:', error);
        // Fallback data
        setAssetTypes([
          { id: 'all', name: 'All Assets' },
          { id: 'stock', name: 'Stocks' },
          { id: 'mutual_fund', name: 'Mutual Funds' },
          { id: 'crypto', name: 'Cryptocurrencies' },
          { id: 'etf', name: 'ETFs' },
          { id: 'bond', name: 'Bonds' },
        ]);
      }
    };
    
    fetchAssetTypes();
  }, []);
  
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await api.trading.search(searchQuery, assetType);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error searching assets:', error);
      // Fallback data
      setSearchResults([
        { id: 1, name: 'HDFC Bank', symbol: 'HDFCBANK', type: 'stock', price: 1450.75, change: 2.3 },
        { id: 2, name: 'Bitcoin', symbol: 'BTC', type: 'crypto', price: 3650000, change: -1.2 },
        { id: 3, name: 'Axis Bluechip Fund', schemeCode: 'AXIS123', type: 'mutual_fund', nav: 45.23, change: 0.8 },
        { id: 4, name: 'Ethereum', symbol: 'ETH', type: 'crypto', price: 243000, change: 3.1 },
        { id: 5, name: 'Tata Digital India Fund', schemeCode: 'TATA456', type: 'mutual_fund', nav: 28.12, change: 1.5 },
        { id: 6, name: 'Solana', symbol: 'SOL', type: 'crypto', price: 9850, change: 5.7 },
        { id: 7, name: 'Reliance Industries', symbol: 'RELIANCE', type: 'stock', price: 2340.50, change: -0.3 },
        { id: 8, name: 'Polkadot', symbol: 'DOT', type: 'crypto', price: 1450, change: 2.8 },
        { id: 9, name: 'Cardano', symbol: 'ADA', type: 'crypto', price: 49.75, change: 1.2 },
        { id: 10, name: 'Mirae Asset Emerging Bluechip', schemeCode: 'MIRAE789', type: 'mutual_fund', nav: 89.45, change: 2.1 },
      ]);
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  const handleAssetTypeChange = (e) => {
    setAssetType(e.target.value);
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  const handleQuickSell = (asset) => {
    setSelectedAsset(asset);
    setIsQuickSellModalOpen(true);
  };
  
  const handleQuickBuy = (asset) => {
    setSelectedAsset(asset);
    setIsQuickBuyModalOpen(true);
  };
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount);
  };
  
  const refreshData = () => {
    // Refresh data after transactions
    if (activeTab === 'search' && searchQuery) {
      handleSearch();
    }
  };
  
  const renderAssetTypeIcon = (type) => {
    switch (type) {
      case 'stock':
        return <span className="text-blue-400">📈</span>;
      case 'mutual_fund':
        return <span className="text-purple-400">📊</span>;
      case 'crypto':
        return <span className="text-yellow-400">₿</span>;
      case 'etf':
        return <span className="text-green-400">📋</span>;
      case 'bond':
        return <span className="text-red-400">🔒</span>;
      default:
        return <span className="text-gray-400">📄</span>;
    }
  };
  
  const getAssetTypeLabel = (type) => {
    switch (type) {
      case 'stock':
        return 'Stock';
      case 'mutual_fund':
        return 'Mutual Fund';
      case 'crypto':
        return 'Crypto';
      case 'etf':
        return 'ETF';
      case 'bond':
        return 'Bond';
      default:
        return type;
    }
  };
  
  return (
    <Card className="h-full">
      <div className="flex items-center mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('search')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'search' ? 'bg-purple-600' : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            Search
          </button>
          <button
            onClick={() => setActiveTab('watchlist')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'watchlist' ? 'bg-purple-600' : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            Watchlist
          </button>
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'portfolio' ? 'bg-purple-600' : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            Portfolio
          </button>
        </div>
      </div>
      
      {activeTab === 'search' && (
        <>
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mb-6">
            <div className="relative flex-grow">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Search for stocks, mutual funds, cryptocurrencies..."
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500 pl-10"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            <select
              value={assetType}
              onChange={handleAssetTypeChange}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500"
            >
              {assetTypes.map((type) => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
            
            <button
              onClick={handleSearch}
              className="bg-purple-600 text-white rounded-lg px-4 py-2 hover:bg-purple-700 transition"
            >
              Search
            </button>
          </div>
          
          {isSearching ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            <>
              {searchResults.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left text-xs font-medium text-gray-400 px-2 py-3">Type</th>
                        <th className="text-left text-xs font-medium text-gray-400 px-2 py-3">Name</th>
                        <th className="text-left text-xs font-medium text-gray-400 px-2 py-3">Symbol/Code</th>
                        <th className="text-right text-xs font-medium text-gray-400 px-2 py-3">Price/NAV</th>
                        <th className="text-right text-xs font-medium text-gray-400 px-2 py-3">Change</th>
                        <th className="text-right text-xs font-medium text-gray-400 px-2 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {searchResults.map((asset) => (
                        <tr key={asset.id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="text-sm px-2 py-3">
                            <div className="flex items-center">
                              {renderAssetTypeIcon(asset.type)}
                              <span className="ml-2">{getAssetTypeLabel(asset.type)}</span>
                            </div>
                          </td>
                          <td className="text-sm font-medium px-2 py-3">{asset.name}</td>
                          <td className="text-sm px-2 py-3">{asset.symbol || asset.schemeCode}</td>
                          <td className="text-sm text-right px-2 py-3">
                            {formatCurrency(asset.price || asset.nav || 0)}
                          </td>
                          <td className={`text-sm text-right px-2 py-3 ${
                            asset.change >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {asset.change > 0 ? '+' : ''}{asset.change}%
                          </td>
                          <td className="text-sm text-right px-2 py-3">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => handleQuickBuy(asset)}
                                className="px-3 py-1 bg-green-600/30 hover:bg-green-600/50 text-green-300 rounded text-xs"
                              >
                                Buy
                              </button>
                              <button
                                onClick={() => handleQuickSell(asset)}
                                className="px-3 py-1 bg-red-600/30 hover:bg-red-600/50 text-red-300 rounded text-xs"
                              >
                                Sell
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                searchQuery ? (
                  <div className="text-center py-12">
                    <p className="text-gray-400">No results found. Try a different search term or asset type.</p>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-400">Search for assets above to get started.</p>
                  </div>
                )
              )}
            </>
          )}
        </>
      )}
      
      {activeTab === 'watchlist' && (
        <div className="text-center py-12">
          <p className="text-gray-400">Your watchlist will appear here.</p>
        </div>
      )}
      
      {activeTab === 'portfolio' && (
        <div className="text-center py-12">
          <p className="text-gray-400">Your portfolio will appear here.</p>
        </div>
      )}
      
      {/* Quick Sell Modal */}
      <QuickSellModal
        isOpen={isQuickSellModalOpen}
        onClose={() => setIsQuickSellModalOpen(false)}
        asset={selectedAsset}
        assetType={selectedAsset?.type || ''}
        refreshData={refreshData}
      />
      
      {/* Quick Buy Modal */}
      <QuickBuyModal
        isOpen={isQuickBuyModalOpen}
        onClose={() => setIsQuickBuyModalOpen(false)}
        asset={selectedAsset}
        assetType={selectedAsset?.type || ''}
        refreshData={refreshData}
      />
    </Card>
  );
};

export default UnifiedTrading; 