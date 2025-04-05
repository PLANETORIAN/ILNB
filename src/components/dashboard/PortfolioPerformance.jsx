import { useState, useEffect } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { useUserInvestments } from '../../context/UserInvestmentsContext';
import axios from 'axios';
import { ChevronDown } from 'lucide-react';

const PortfolioPerformance = () => {
  const [investmentData, setInvestmentData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChartType, setSelectedChartType] = useState('area');
  const [selectedAssetFilter, setSelectedAssetFilter] = useState('all');
  const [showAssetFilterDropdown, setShowAssetFilterDropdown] = useState(false);
  const [showChartTypeDropdown, setShowChartTypeDropdown] = useState(false);
  const { userInvestments } = useUserInvestments();

  // Filter options
  const filterOptions = [
    { value: 'all', label: 'All Assets' },
    { value: 'stock', label: 'Stocks' },
    { value: 'mutualFund', label: 'Mutual Funds' },
    { value: 'indexFund', label: 'Index Funds' }
  ];

  // Chart type options
  const chartTypeOptions = [
    { value: 'area', label: 'Area Chart' },
    { value: 'line', label: 'Line Chart' }
  ];

  // Get investment color based on type
  const getInvestmentColor = (type) => {
    const colors = {
      stock: '#4ADE80',
      mutualFund: '#38BDF8',
      indexFund: '#A78BFA'
    };
    return colors[type] || '#FCD34D';
  };

  useEffect(() => {
    const fetchInvestmentData = async () => {
      setIsLoading(true);
      try {
        if (!userInvestments?.userData?.investments) {
          throw new Error('No investment data available');
        }

        // Get all investment types
        const allInvestments = [
          ...(userInvestments.userData.investments.stocks || []).map(item => ({ ...item, investmentType: 'stock' })),
          ...(userInvestments.userData.investments.mutualFunds || []).map(item => ({ ...item, investmentType: 'mutualFund' })),
          ...(userInvestments.userData.investments.indexFunds || []).map(item => ({ ...item, investmentType: 'indexFund' }))
        ];

        // Process each investment to get historical data
        const investmentDataPromises = allInvestments.map(async (investment) => {
          try {
            // Format API symbol based on investment type
            let apiSymbol = investment.symbol;
            if (investment.investmentType === 'stock') {
              apiSymbol = `${investment.symbol}.NS`;
            }
            
            // For mutual funds and index funds, attempt to use the API with fallback to mocked data
            // In a real app, we'd use a different API for mutual funds/index funds
            const response = await axios.get(`https://stock-server-j29j.onrender.com/stock/${apiSymbol}`);
            
            if (!response.data || !response.data.data || response.data.data.length === 0) {
              throw new Error(`No data available for ${investment.symbol}`);
            }

            // Sort data chronologically
            const sortedData = [...response.data.data].sort((a, b) => new Date(a.Date) - new Date(b.Date));
            
            // Get price history from sorted data
            const priceHistory = sortedData.map(item => ({
              date: new Date(item.Date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
              price: item.Close
            }));

            // Calculate returns
            const firstPrice = priceHistory[0]?.price || 0;
            const lastPrice = priceHistory[priceHistory.length - 1]?.price || 0;
            const returns = firstPrice > 0 ? ((lastPrice - firstPrice) / firstPrice) * 100 : 0;
            
            // Calculate quantity or units
            const quantity = investment.quantity || investment.units || 0;
            
            // Calculate values
            const currentValue = quantity * lastPrice;
            const investedAmount = quantity * firstPrice;

            return {
              id: investment.id,
              name: investment.stockName || investment.fundName,
              symbol: investment.symbol,
              investmentType: investment.investmentType,
              priceHistory,
              currentValue: currentValue.toFixed(0),
              investedAmount: investedAmount.toFixed(0),
              returns: returns.toFixed(2),
              quantity: quantity
            };
          } catch (err) {
            console.error(`Error fetching data for ${investment.symbol}:`, err);
            
            // For errors, fall back to mock data for the investment
            return generateMockInvestmentData(investment);
          }
        });

        const results = await Promise.all(investmentDataPromises);
        setInvestmentData(results.filter(result => result !== null));
      } catch (err) {
        console.error('Error fetching investment data:', err);
        // Fall back to complete mock data
        setInvestmentData(generateCompleteMockData());
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvestmentData();
  }, [userInvestments]);

  // Generate mock data for a single investment
  const generateMockInvestmentData = (investment) => {
    const basePrice = investment.investmentType === 'stock' 
      ? Math.random() * 2000 + 500  // 500-2500 for stocks
      : Math.random() * 100 + 50;   // 50-150 for funds
      
    // Generate mock returns between -10% and 30%
    const mockReturns = (Math.random() * 40) - 10;
    
    // Generate mock price history
    const priceHistory = generateMockPriceHistory(basePrice, mockReturns);
    
    // Calculate quantity or units
    const quantity = investment.quantity || investment.units || 
      (investment.investmentType === 'stock' ? Math.floor(Math.random() * 40) + 10 : Math.floor(Math.random() * 200) + 100);
    
    const lastPrice = priceHistory[priceHistory.length - 1]?.price || basePrice;
    const currentValue = quantity * lastPrice;
    const investedAmount = quantity * basePrice;
    
    return {
      id: investment.id,
      name: investment.stockName || investment.fundName,
      symbol: investment.symbol,
      investmentType: investment.investmentType,
      priceHistory,
      currentValue: currentValue.toFixed(0),
      investedAmount: investedAmount.toFixed(0),
      returns: mockReturns.toFixed(2),
      quantity: quantity
    };
  };

  // Generate complete mock data if no real investments are available
  const generateCompleteMockData = () => {
    const mockInvestments = [
      { id: 'mock_stock_1', name: 'Reliance Industries', symbol: 'RELIANCE', investmentType: 'stock', quantity: 10 },
      { id: 'mock_stock_2', name: 'HDFC Bank', symbol: 'HDFCBANK', investmentType: 'stock', quantity: 20 },
      { id: 'mock_stock_3', name: 'Infosys', symbol: 'INFY', investmentType: 'stock', quantity: 15 },
      { id: 'mock_mf_1', name: 'SBI Blue Chip Fund', symbol: 'SBIBLUECHIP', investmentType: 'mutualFund', units: 250 },
      { id: 'mock_mf_2', name: 'Axis Midcap Fund', symbol: 'AXISMID', investmentType: 'mutualFund', units: 180 },
      { id: 'mock_index_1', name: 'UTI Nifty Index Fund', symbol: 'UTINIFTY', investmentType: 'indexFund', units: 300 }
    ];
    
    return mockInvestments.map(investment => generateMockInvestmentData(investment));
  };

  // Generate mock price history for an investment
  const generateMockPriceHistory = (startPrice, totalReturn) => {
    const months = 12;
    const data = [];
    const startDate = new Date(Date.now() - (months * 30 * 24 * 60 * 60 * 1000));
    
    // Calculate monthly return rate (compound)
    const monthlyReturnRate = Math.pow(1 + totalReturn / 100, 1 / months) - 1;
    
    // Current price starts at startPrice
    let currentPrice = startPrice;
    
    for (let i = 0; i < months; i++) {
      const currentDate = new Date(startDate);
      currentDate.setMonth(startDate.getMonth() + i);
      
      // Add some randomness to the price movement
      const randomFactor = 0.97 + Math.random() * 0.06; // Random between 0.97 and 1.03
      currentPrice = currentPrice * (1 + monthlyReturnRate) * randomFactor;
      
      data.push({
        date: currentDate.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
        price: currentPrice
      });
    }
    
    return data;
  };

  // Calculate min and max values for y-axis with padding
  const calculateYAxisDomain = (priceHistory) => {
    if (!priceHistory || priceHistory.length === 0) return [0, 100];
    
    const prices = priceHistory.map(item => item.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    // Add padding (5% on both sides)
    const padding = (maxPrice - minPrice) * 0.05;
    return [Math.max(0, minPrice - padding), maxPrice + padding];
  };

  // Filter investments based on selected type
  const filteredInvestments = selectedAssetFilter === 'all'
    ? investmentData
    : investmentData.filter(investment => investment.investmentType === selectedAssetFilter);

  return (
    <div className="glass-effect rounded-xl overflow-hidden">
      <div className="p-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Portfolio Performance</h2>
        <div className="flex gap-2">
          <div className="relative">
            <button 
              className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg flex items-center gap-2"
              onClick={() => setShowAssetFilterDropdown(prev => !prev)}
            >
              {filterOptions.find(option => option.value === selectedAssetFilter)?.label}
              <ChevronDown size={16} />
            </button>
            
            {showAssetFilterDropdown && (
              <div className="absolute right-0 mt-1 w-48 bg-gray-800 rounded-lg shadow-lg z-10">
                {filterOptions.map(option => (
                  <button
                    key={option.value}
                    className="w-full text-left px-4 py-2 hover:bg-gray-700 rounded-lg"
                    onClick={() => {
                      setSelectedAssetFilter(option.value);
                      setShowAssetFilterDropdown(false);
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="relative">
            <button 
              className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg flex items-center gap-2"
              onClick={() => setShowChartTypeDropdown(prev => !prev)}
            >
              {chartTypeOptions.find(option => option.value === selectedChartType)?.label}
              <ChevronDown size={16} />
            </button>
            
            {showChartTypeDropdown && (
              <div className="absolute right-0 mt-1 w-36 bg-gray-800 rounded-lg shadow-lg z-10">
                {chartTypeOptions.map(option => (
                  <button
                    key={option.value}
                    className="w-full text-left px-4 py-2 hover:bg-gray-700 rounded-lg"
                    onClick={() => {
                      setSelectedChartType(option.value);
                      setShowChartTypeDropdown(false);
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center p-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredInvestments.length === 0 ? (
        <div className="text-center p-20 text-gray-400">
          No {selectedAssetFilter === 'all' ? 'investment' : selectedAssetFilter} data available
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {filteredInvestments.map((investment) => {
            const color = getInvestmentColor(investment.investmentType);
            return (
              <div key={investment.id} className="bg-gray-800/60 rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-medium text-lg">{investment.name}</h3>
                    <p className="text-sm text-gray-400">{investment.symbol}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-lg">₹{Number(investment.currentValue).toLocaleString()}</p>
                    <p className={`text-sm ${Number(investment.returns) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {Number(investment.returns) >= 0 ? '+' : ''}{investment.returns}%
                    </p>
                  </div>
                </div>

                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    {selectedChartType === 'area' ? (
                      <AreaChart data={investment.priceHistory} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                        <defs>
                          <linearGradient id={`gradient-${investment.id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                            <stop offset="95%" stopColor={color} stopOpacity={0.1} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 10 }} 
                          tickLine={false}
                          axisLine={{ stroke: '#333' }}
                          tickMargin={5}
                        />
                        <YAxis 
                          domain={calculateYAxisDomain(investment.priceHistory)}
                          tick={{ fontSize: 10 }} 
                          tickLine={false}
                          axisLine={{ stroke: '#333' }}
                          tickFormatter={value => `₹${value.toFixed(0)}`}
                        />
                        <Tooltip 
                          formatter={(value) => [`₹${value.toFixed(2)}`, 'Price']}
                          labelFormatter={(label) => label}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="price" 
                          stroke={color} 
                          fillOpacity={1} 
                          fill={`url(#gradient-${investment.id})`} 
                        />
                      </AreaChart>
                    ) : (
                      <LineChart data={investment.priceHistory} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 10 }} 
                          tickLine={false}
                          axisLine={{ stroke: '#333' }}
                          tickMargin={5}
                        />
                        <YAxis 
                          domain={calculateYAxisDomain(investment.priceHistory)}
                          tick={{ fontSize: 10 }} 
                          tickLine={false}
                          axisLine={{ stroke: '#333' }}
                          tickFormatter={value => `₹${value.toFixed(0)}`}
                        />
                        <Tooltip 
                          formatter={(value) => [`₹${value.toFixed(2)}`, 'Price']}
                          labelFormatter={(label) => label}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="price" 
                          stroke={color}
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    )}
                  </ResponsiveContainer>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-gray-800/50 p-2 rounded">
                    <p className="text-gray-400">Invested</p>
                    <p className="font-medium">₹{Number(investment.investedAmount).toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-800/50 p-2 rounded">
                    <p className="text-gray-400">
                      {investment.investmentType === 'stock' ? 'Quantity' : 'Units'}
                    </p>
                    <p className="font-medium">{investment.quantity}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PortfolioPerformance; 