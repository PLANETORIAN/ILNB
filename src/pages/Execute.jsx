import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useLocation, useNavigate } from 'react-router-dom';
import Card from '@/components/common/Card';
import { ArrowUp, ArrowDown, Sparkles, ChevronDown, ExternalLink, Check, Zap, ArrowUpDown, HelpCircle, BarChart3, DollarSign, Info } from 'lucide-react';
// Import API service when ready to implement real API calls
// import api from '@/services/api';

// Tooltip component for financial terms
const Tooltip = ({ children, content }) => {
  const [isVisible, setIsVisible] = useState(false);
  const { isDarkMode } = useTheme();
  
  return (
    <div className="relative inline-flex items-center group">
      {children}
      <button 
        className="ml-1.5 inline-flex items-center justify-center"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={(e) => {
          e.stopPropagation();
          setIsVisible(!isVisible);
        }}
      >
        <Info className="w-3.5 h-3.5 text-gray-400 hover:text-purple-400 transition-colors" />
      </button>
      
      {isVisible && (
        <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 rounded-lg shadow-lg z-50 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200 shadow-xl'}`}>
          <div className="text-sm">{content}</div>
          <div className={`absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 ${isDarkMode ? 'bg-gray-800 border-r border-b border-gray-700' : 'bg-white border-r border-b border-gray-200'}`}></div>
        </div>
      )}
    </div>
  );
};

function Execute() {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [amount, setAmount] = useState('');
  const [transactionType, setTransactionType] = useState('buy'); // buy or sell
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [installmentType, setInstallmentType] = useState('oneTime'); // oneTime or sip
  
  const dropdownRef = useRef(null);
  const { isDarkMode } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 800);
    
    // Check for query parameters
    const params = new URLSearchParams(location.search);
    const assetId = params.get('asset');
    const assetType = params.get('type');
    
    if (assetId && assetType) {
      // Find the asset in the list
      const matchingAsset = [...mutualFunds, ...stocks].find(
        asset => asset.id.toString() === assetId && asset.type === assetType
      );
      
      if (matchingAsset) {
        setSelectedAsset(matchingAsset);
      }
    }
  }, [location]);

  const mutualFunds = [
    { 
      id: 1, 
      name: 'SBI Bluechip Fund', 
      type: 'mf', 
      nav: 67.25, 
      change: '+1.4%',
      description: 'Large Cap Fund',
      minInvestment: 5000,
      mfuLink: 'https://www.mfuindia.com/SBI-Bluechip-Fund',
      amc: 'SBI Mutual Fund',
      returns: { '1Y': '12.5%', '3Y': '15.2%', '5Y': '11.8%' },
      riskRating: 'Moderate',
      expenseRatio: '1.8%',
      fundSize: '₹12,500 Cr',
      rating: 4.2,
      performance: 'Outperforms 75% of similar funds',
      assetAllocation: 'Mostly large companies with stable growth'
    },
    { 
      id: 2, 
      name: 'Axis Midcap Fund', 
      type: 'mf', 
      nav: 85.75, 
      change: '+2.1%',
      description: 'Mid Cap Fund',
      minInvestment: 1000,
      mfuLink: 'https://www.mfuindia.com/Axis-Midcap-Fund',
      amc: 'Axis Mutual Fund',
      returns: { '1Y': '18.7%', '3Y': '22.3%', '5Y': '16.2%' },
      riskRating: 'Moderately High',
      expenseRatio: '1.95%',
      fundSize: '₹8,200 Cr',
      rating: 4.5,
      performance: 'Outperforms 90% of similar funds',
      assetAllocation: 'Medium-sized growing companies'
    },
    { 
      id: 3, 
      name: 'HDFC Small Cap Fund', 
      type: 'mf', 
      nav: 93.50, 
      change: '+2.8%',
      description: 'Small Cap Fund',
      minInvestment: 2500,
      mfuLink: 'https://www.mfuindia.com/HDFC-Small-Cap-Fund',
      amc: 'HDFC Mutual Fund',
      returns: { '1Y': '22.5%', '3Y': '25.8%', '5Y': '18.3%' },
      riskRating: 'High',
      expenseRatio: '2.1%',
      fundSize: '₹5,800 Cr',
      rating: 4.0,
      performance: 'Outperforms 82% of similar funds',
      assetAllocation: 'Smaller companies with high growth potential'
    },
  ];

  const stocks = [
    { 
      id: 101, 
      name: 'Reliance Industries', 
      type: 'stock', 
      price: 2750, 
      change: '+1.2%', 
      exchange: 'NSE', 
      code: 'RELIANCE',
      sector: 'Oil & Gas',
      marketCap: '₹17.2 Lakh Cr',
      pe: 25.8,
      volume: '3.2M',
      dayRange: '₹2730 - ₹2765',
      performance: 'Top performer in Nifty 50',
      analystRating: 'Buy (18 analysts)'
    },
    { 
      id: 102, 
      name: 'Infosys', 
      type: 'stock', 
      price: 1650, 
      change: '-0.5%', 
      exchange: 'NSE', 
      code: 'INFY',
      sector: 'Information Technology',
      marketCap: '₹6.8 Lakh Cr',
      pe: 22.3,
      volume: '2.8M',
      dayRange: '₹1640 - ₹1662',
      performance: 'Stable IT leader',
      analystRating: 'Hold (12 analysts)'
    },
    { 
      id: 103, 
      name: 'HDFC Bank', 
      type: 'stock', 
      price: 1825, 
      change: '+0.8%', 
      exchange: 'NSE', 
      code: 'HDFCBANK',
      sector: 'Banking',
      marketCap: '₹10.1 Lakh Cr',
      pe: 20.1,
      volume: '4.5M',
      dayRange: '₹1810 - ₹1830',
      performance: 'India\'s leading private sector bank',
      analystRating: 'Strong Buy (22 analysts)'
    },
  ];

  const allAssets = [...mutualFunds, ...stocks];

  // Filter assets based on search
  const filteredAssets = allAssets.filter(asset => 
    asset.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Financial term explanations
  const getFinancialTermExplanation = (term) => {
    const explanations = {
      'nav': 'Net Asset Value (NAV) is the price per unit of a mutual fund. It represents the total value of the fund\'s portfolio minus liabilities, divided by the number of outstanding units.',
      'minInvestment': 'The minimum amount required to invest in this mutual fund scheme.',
      'expenseRatio': 'The annual fee charged by the fund house to manage the mutual fund, expressed as a percentage of assets.',
      'sip': 'Systematic Investment Plan (SIP) allows you to invest a fixed amount regularly (usually monthly) instead of a lump sum.',
      'marketCap': 'Market Capitalization is the total value of a company\'s outstanding shares, calculated by multiplying the share price by the number of shares.',
      'pe': 'Price to Earnings (P/E) Ratio measures a company\'s current share price relative to its earnings per share. Lower P/E may indicate undervaluation.',
      'large_cap': 'Large Cap funds invest primarily in large established companies with stable growth and lower risk.',
      'mid_cap': 'Mid Cap funds invest in medium-sized companies with good growth potential and moderate risk.',
      'small_cap': 'Small Cap funds invest in smaller companies with high growth potential but also higher risk.'
    };
    
    return explanations[term] || 'No explanation available';
  };

  const handleExecute = () => {
    if (!selectedAsset || !amount) return;
    
    setIsProcessing(true);
    
    // Create transaction data
    const transactionData = {
      assetId: selectedAsset.id,
      assetType: selectedAsset.type,
      amount: parseFloat(amount),
      transactionType, // 'buy' or 'sell'
      installmentType,  // 'oneTime' or 'sip'
      timestamp: new Date().toISOString()
    };
    
    // For demo purposes, we'll determine API endpoint but simulate call
    let apiEndpoint;
    if (selectedAsset.type === 'mf') {
      apiEndpoint = transactionType === 'buy' ? 'mutualFunds.buy' : 'mutualFunds.sell';
    } else {
      apiEndpoint = transactionType === 'buy' ? 'stocks.buy' : 'stocks.sell';
    }
    console.log(`Would call API endpoint: ${apiEndpoint}`);
    
    // For demo purposes, we'll simulate the API call
    setTimeout(() => {
      console.log('Transaction data:', transactionData);
      setIsProcessing(false);
      setIsSuccess(true);
      
      // Reset after showing success message
      setTimeout(() => {
        setIsSuccess(false);
        setAmount('');
        // Optionally navigate back to dashboard
        // navigate('/');
      }, 3000);
    }, 1500);
    
    // In a real implementation, you would use:
    // apiCall
    //   .then(response => {
    //     setIsProcessing(false);
    //     setIsSuccess(true);
    //     setTimeout(() => {
    //       setIsSuccess(false);
    //       setAmount('');
    //     }, 3000);
    //   })
    //   .catch(error => {
    //     setIsProcessing(false);
    //     // Handle error state
    //   });
  };

  // Handle quick buy - one-click purchase 
  const handleQuickBuy = () => {
    if (!selectedAsset) return;
    
    // Set default amount based on minimum investment for mutual funds
    // or 1 unit for stocks
    if (selectedAsset.type === 'mf') {
      setAmount(selectedAsset.minInvestment.toString());
    } else {
      setAmount('1');
    }
    
    // Set transaction type to buy
    setTransactionType('buy');
    
    // Create quick transaction data
    const quickTransactionData = {
      assetId: selectedAsset.id,
      assetType: selectedAsset.type,
      amount: selectedAsset.type === 'mf' ? selectedAsset.minInvestment : selectedAsset.price,
      transactionType: 'buy',
      installmentType: 'oneTime',
      isQuickBuy: true,
      timestamp: new Date().toISOString()
    };
    
    // Execute quick transaction
    setIsProcessing(true);
    
    // Call the quick execute API
    setTimeout(() => {
      console.log('Quick transaction data:', quickTransactionData);
      setIsProcessing(false);
      setIsSuccess(true);
      
      // Reset after showing success message
      setTimeout(() => {
        setIsSuccess(false);
      }, 3000);
    }, 1000);
    
    // In a real implementation, you would use:
    // api.transactions.quickExecute(quickTransactionData)
    //   .then(response => {
    //     setIsProcessing(false);
    //     setIsSuccess(true);
    //     setTimeout(() => {
    //       setIsSuccess(false);
    //     }, 3000);
    //   })
    //   .catch(error => {
    //     setIsProcessing(false);
    //     // Handle error state
    //   });
  };

  // Handle transaction type change
  const handleTransactionTypeChange = (type) => {
    setTransactionType(type);
  };

  // Handle installment type change
  const handleInstallmentTypeChange = (type) => {
    setInstallmentType(type);
  };

  // Calculate total based on selected asset and amount
  const calculateTotal = () => {
    if (!selectedAsset || !amount) return 0;
    
    if (selectedAsset.type === 'stock') {
      return selectedAsset.price * parseFloat(amount);
    } else {
      return parseFloat(amount);
    }
  };

  // Handle compare action
  const handleCompare = (asset, e) => {
    e.stopPropagation();
    navigate(`/compare?asset=${asset.id}&type=${asset.type}`);
  };

  // Handle invest now action
  const handleInvestNow = (asset, e) => {
    e.stopPropagation();
    setSelectedAsset(asset);
    setTransactionType('buy');
    
    // Auto-scroll to the trade details section
    setTimeout(() => {
      document.querySelector('.trade-details-section')?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
      });
    }, 100);
  };

  const AssetCard = ({ asset }) => {
    const isStock = asset.type === 'stock';
    const priceOrNav = isStock ? asset.price : asset.nav;
    const isSelected = selectedAsset?.id === asset.id;
    
    return (
      <div 
        onClick={() => setSelectedAsset(asset)}
        className={`glass-effect p-6 cursor-pointer transition-all duration-500 relative group ${
          isSelected
            ? 'border-2 border-purple-500 shadow-lg shadow-purple-500/20 transform scale-[1.02]' 
            : 'hover:border-purple-500/50 hover:shadow-md hover:shadow-purple-500/10 hover:transform hover:scale-[1.01]'
        }`}
      >
        <div className="flex items-center space-x-4 relative z-10">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center transform transition-transform duration-500 group-hover:scale-110 ${
            isSelected 
              ? 'bg-gradient-to-r from-purple-500 to-blue-500 animate-pulse'
              : 'bg-gradient-to-r from-purple-500/70 to-blue-600/70'
          }`}>
            <span className="font-bold text-sm">{isStock ? asset.code : asset.type.toUpperCase()}</span>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg transition-all duration-300 group-hover:text-purple-400">{asset.name}</h3>
            <div className="flex items-center space-x-2">
              <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                ₹{priceOrNav.toLocaleString()}
              </span>
              {isStock ? null : (
                <Tooltip content={getFinancialTermExplanation('nav')}>
                  <span className="text-xs">NAV</span>
                </Tooltip>
              )}
              <span className={`text-sm flex items-center ${
                asset.change.startsWith('+') ? 'text-green-400' : 'text-red-400'
              }`}>
                {asset.change.startsWith('+') 
                  ? <ArrowUp className="w-3 h-3 mr-1 transition-transform duration-300 group-hover:translate-y-[-2px]" /> 
                  : <ArrowDown className="w-3 h-3 mr-1 transition-transform duration-300 group-hover:translate-y-[2px]" />
                }
                {asset.change}
              </span>
              <span className="text-xs text-gray-400">
                {isStock ? asset.exchange : asset.description}
              </span>
            </div>
            
            {/* Simple performance metric in plain English */}
            <div className="mt-2">
              <p className="text-sm text-purple-400 font-medium">
                {asset.performance}
              </p>
            </div>
            
            {/* Additional mutual fund information */}
            {!isStock && (
              <div className="mt-1 grid grid-cols-2 gap-2">
                <div className="flex items-center">
                  <span className="text-xs text-gray-400">Min Investment:</span>
                  <span className="text-xs ml-1">₹{asset.minInvestment.toLocaleString()}</span>
                  <Tooltip content={getFinancialTermExplanation('minInvestment')}>
                    <span></span>
                  </Tooltip>
                </div>
                <div className="flex items-center">
                  <span className="text-xs text-gray-400">Expense:</span>
                  <span className="text-xs ml-1">{asset.expenseRatio}</span>
                  <Tooltip content={getFinancialTermExplanation('expenseRatio')}>
                    <span></span>
                  </Tooltip>
                </div>
                <div className="flex items-center">
                  <span className="text-xs text-gray-400">Risk:</span>
                  <span className="text-xs ml-1">{asset.riskRating}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-xs text-gray-400">Fund Size:</span>
                  <span className="text-xs ml-1">{asset.fundSize}</span>
                </div>
              </div>
            )}
            
            {/* Additional stock information */}
            {isStock && (
              <div className="mt-1 grid grid-cols-2 gap-2">
                <div className="flex items-center">
                  <span className="text-xs text-gray-400">Market Cap:</span>
                  <span className="text-xs ml-1">{asset.marketCap}</span>
                  <Tooltip content={getFinancialTermExplanation('marketCap')}>
                    <span></span>
                  </Tooltip>
                </div>
                <div className="flex items-center">
                  <span className="text-xs text-gray-400">P/E Ratio:</span>
                  <span className="text-xs ml-1">{asset.pe}</span>
                  <Tooltip content={getFinancialTermExplanation('pe')}>
                    <span></span>
                  </Tooltip>
                </div>
                <div className="flex items-center">
                  <span className="text-xs text-gray-400">Sector:</span>
                  <span className="text-xs ml-1">{asset.sector}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-xs text-gray-400">Rating:</span>
                  <span className="text-xs ml-1">{asset.analystRating}</span>
                </div>
              </div>
            )}
          </div>
          
          {asset.type === 'mf' && (
            <a href={asset.mfuLink} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-blue-500 hover:text-blue-600">
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>

        {/* Action buttons */}
        <div className="mt-4 flex space-x-2">
          <button 
            onClick={(e) => handleCompare(asset, e)}
            className="flex-1 flex items-center justify-center py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 transition-colors text-sm font-medium"
          >
            <BarChart3 className="w-3.5 h-3.5 mr-1.5" />
            Compare
          </button>
          <button 
            onClick={(e) => handleInvestNow(asset, e)}
            className="flex-1 flex items-center justify-center py-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 transition-colors text-sm font-medium"
          >
            <DollarSign className="w-3.5 h-3.5 mr-1.5" />
            Invest Now
          </button>
        </div>

        {/* Hover effect elements */}
        <div className="absolute inset-0 rounded-xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-xl transform translate-x-8 translate-y-[-50%] group-hover:translate-y-[-30%] transition-transform duration-700"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl transform translate-y-[50%] group-hover:translate-y-[30%] transition-transform duration-700"></div>
        </div>
        
        {/* Sparkles effect on selection or hover */}
        <div className={`absolute top-2 right-2 transition-all duration-500 ${
          isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-0 group-hover:opacity-70 group-hover:scale-100'
        }`}>
          <div className="bg-yellow-400/20 rounded-full p-1.5">
            <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
          </div>
        </div>
        
        {/* Selected badge */}
        {isSelected && (
          <div className="absolute top-2 left-2 bg-purple-500 text-white text-xs px-2 py-0.5 rounded animate-pulse">
            Selected
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-20 px-4 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 animate-fade-in bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
        Execute Trade
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6 animate-fade-in">
          <div className="glass-effect p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Select Asset</h2>
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <span>Filter</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-10">
                    <div className="p-2">
                      <div className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer" onClick={() => setShowDropdown(false)}>
                        All Assets
                      </div>
                      <div className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer" onClick={() => setShowDropdown(false)}>
                        Mutual Funds
                      </div>
                      <div className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer" onClick={() => setShowDropdown(false)}>
                        Stocks
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search assets..."
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:border-purple-500 focus:outline-none transition-colors"
              />
            </div>
            
            <div className="grid gap-4">
              {filteredAssets.map((asset) => (
                <AssetCard 
                  key={asset.id} 
                  asset={asset}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="animate-fade-in trade-details-section" style={{ animationDelay: '300ms' }}>
          <Card className="glass-effect sticky top-24">
            <h2 className="text-xl font-semibold mb-4">Trade Details</h2>
            {selectedAsset ? (
              <div className="space-y-4">
                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <p className="text-sm font-medium">Transaction Type</p>
                    <Tooltip content="Buy: Purchase new units/shares. Sell: Convert your investment back to cash.">
                      <span></span>
                    </Tooltip>
                  </div>
                  <div className={`relative flex rounded-lg overflow-hidden border-2 ${isDarkMode ? 'border-gray-600/30' : 'border-gray-300'} h-12`}>
                    {/* Background highlight that slides */}
                    <div 
                      className={`absolute top-0 bottom-0 w-1/2 transition-all duration-300 ease-out ${
                        transactionType === 'buy' 
                          ? 'left-0 bg-gradient-to-r from-green-600 to-green-500 rounded-r-sm' 
                          : 'left-1/2 bg-gradient-to-r from-red-500 to-red-600 rounded-l-sm'
                      } ${!isDarkMode ? 'opacity-70' : ''}`}
                    ></div>
                    
                    {/* Toggle buttons */}
                    <button
                      onClick={() => handleTransactionTypeChange('buy')}
                      className="flex-1 py-2 text-center font-medium transition-all z-10 relative text-base hover:bg-white/10"
                      type="button"
                    >
                      <span className={`flex items-center justify-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Buy
                      </span>
                    </button>
                    <button
                      onClick={() => handleTransactionTypeChange('sell')}
                      className="flex-1 py-2 text-center font-medium transition-all z-10 relative text-base hover:bg-white/10"
                      type="button"
                    >
                      <span className={`flex items-center justify-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Sell
                      </span>
                    </button>
                  </div>
                </div>
                
                {selectedAsset.type === 'mf' && (
                  <div className="mb-4">
                    <div className="flex items-center mb-2">
                      <p className="text-sm font-medium">Investment Frequency</p>
                      <Tooltip content={getFinancialTermExplanation('sip')}>
                        <span></span>
                      </Tooltip>
                    </div>
                    <div className={`relative flex rounded-lg overflow-hidden border-2 ${isDarkMode ? 'border-gray-600/30' : 'border-gray-300'} h-12`}>
                      {/* Background highlight that slides */}
                      <div 
                        className={`absolute top-0 bottom-0 w-1/2 transition-all duration-300 ease-out ${
                          installmentType === 'oneTime' 
                            ? 'left-0 bg-gradient-to-r from-blue-600 to-blue-500 rounded-r-sm' 
                            : 'left-1/2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-l-sm'
                        } ${!isDarkMode ? 'opacity-70' : ''}`}
                      ></div>
                      
                      {/* Toggle buttons */}
                      <button
                        onClick={() => handleInstallmentTypeChange('oneTime')}
                        className="flex-1 py-2 text-center font-medium transition-all z-10 relative text-base hover:bg-white/10"
                        type="button"
                      >
                        <span className={`flex items-center justify-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          One-time
                        </span>
                      </button>
                      <button
                        onClick={() => handleInstallmentTypeChange('sip')}
                        className="flex-1 py-2 text-center font-medium transition-all z-10 relative text-base hover:bg-white/10"
                        type="button"
                      >
                        <span className={`flex items-center justify-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          SIP
                        </span>
                      </button>
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {installmentType === 'sip' ? 'Monthly amount' : 'Amount'}
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    placeholder="Enter amount"
                  />
                  
                  {selectedAsset.type === 'mf' && (
                    <p className="text-xs mt-1 text-gray-400">
                      Minimum investment: ₹{selectedAsset.minInvestment.toLocaleString()}
                    </p>
                  )}
                  
                  {/* Educational content based on investment type */}
                  {selectedAsset.type === 'mf' && (
                    <div className={`mt-3 p-3 rounded-lg ${isDarkMode ? 'bg-purple-900/20 border border-purple-800/30' : 'bg-purple-50 border border-purple-100'}`}>
                      <h4 className="text-sm font-medium mb-1">Investment Tips</h4>
                      {installmentType === 'sip' ? (
                        <p className="text-xs text-gray-400">
                          SIPs help reduce risk through rupee cost averaging and are ideal for long-term wealth creation. Consider investing for at least 5-7 years.
                        </p>
                      ) : (
                        <p className="text-xs text-gray-400">
                          This fund {selectedAsset.performance.toLowerCase()}. Consider a SIP approach for volatility protection or invest a lump sum if you have a longer time horizon.
                        </p>
                      )}
                    </div>
                  )}
                  
                  {selectedAsset.type === 'stock' && (
                    <div className={`mt-3 p-3 rounded-lg ${isDarkMode ? 'bg-blue-900/20 border border-blue-800/30' : 'bg-blue-50 border border-blue-100'}`}>
                      <h4 className="text-sm font-medium mb-1">Investment Tips</h4>
                      <p className="text-xs text-gray-400">
                        Stocks may be more volatile than mutual funds. {selectedAsset.analystRating} suggest this could be a {selectedAsset.analystRating.includes('Buy') ? 'good addition' : 'stock to research further'} for your portfolio.
                      </p>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-white/5 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>Asset</span>
                    <span>{selectedAsset.name}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <div className="flex items-center">
                      <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                        {selectedAsset.type === 'stock' ? 'Price' : 'NAV'}
                      </span>
                      {selectedAsset.type === 'mf' && (
                        <Tooltip content={getFinancialTermExplanation('nav')}>
                          <span></span>
                        </Tooltip>
                      )}
                    </div>
                    <span>₹{(selectedAsset.type === 'stock' ? selectedAsset.price : selectedAsset.nav).toLocaleString()}</span>
                  </div>
                  
                  {selectedAsset.type === 'mf' && installmentType === 'sip' && (
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center">
                        <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>Frequency</span>
                        <Tooltip content="How often your investment will be automatically made. Monthly SIPs are most common for building long-term wealth.">
                          <span></span>
                        </Tooltip>
                      </div>
                      <span>Monthly</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <div className="flex items-center">
                      <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                        {installmentType === 'sip' ? 'Monthly Investment' : 'Total'}
                      </span>
                      {installmentType === 'sip' && (
                        <Tooltip content="This amount will be invested automatically every month from your registered bank account.">
                          <span></span>
                        </Tooltip>
                      )}
                    </div>
                    <span>₹{calculateTotal().toLocaleString()}</span>
                  </div>
                </div>

                {isSuccess ? (
                  <div className="bg-green-100 dark:bg-green-800/30 text-green-800 dark:text-green-300 p-3 rounded-lg flex items-center">
                    <Check className="w-5 h-5 mr-2" />
                    <span>Transaction successful!</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <button
                      onClick={handleExecute}
                      disabled={isProcessing || !amount}
                      className={`w-full button-animate text-lg ${
                        transactionType === 'buy' 
                          ? 'bg-gradient-to-r from-green-600 to-blue-600' 
                          : 'bg-gradient-to-r from-red-600 to-orange-600'
                      } text-white py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed relative`}
                    >
                      {isProcessing ? (
                        <div className="flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Processing...
                        </div>
                      ) : (
                        <>
                          {transactionType === 'buy' ? 'Buy' : 'Sell'} 
                          {selectedAsset.type === 'stock' ? ` ${amount || ''} Shares` : ` ₹${amount || '0'}`}
                          {installmentType === 'sip' ? ' Monthly SIP' : ''}
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={handleQuickBuy}
                      disabled={isProcessing}
                      className="w-full button-animate bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      {selectedAsset.type === 'stock' 
                        ? `Quick Buy 1 Share of ${selectedAsset.name}` 
                        : `Quick Invest ₹${selectedAsset.minInvestment.toLocaleString()}`
                      }
                    </button>
                  </div>
                )}
                
                {selectedAsset.type === 'mf' && (
                  <div className="mt-3 flex justify-center">
                    <a 
                      href={selectedAsset.mfuLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors flex items-center justify-center"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Execute on MFU Portal
                      <Tooltip content="MF Utility (MFU) is a shared service platform for the mutual fund industry, providing a single point of service for investors.">
                        <span></span>
                      </Tooltip>
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 px-6">
                <div className="w-16 h-16 bg-white/5 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <ArrowUpDown className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-300 mb-2">No Asset Selected</h3>
                <p className="text-gray-400 mb-4">Select an asset from the list to view trade options</p>
                <div className="w-20 h-1 bg-white/10 mx-auto"></div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Execute; 