import { useState, useEffect } from 'react';
import axios from 'axios';
import Card from '../common/Card';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useUserInvestments } from '../../context/UserInvestmentsContext';

// Utility function to generate color based on investment type
const getInvestmentColor = (type) => {
  const colors = {
    stock: '#4ADE80',
    mutualFund: '#22D3EE',
    indexFund: '#A78BFA'
  };
  return colors[type] || '#FCD34D';
};

// Custom tooltip to display percentage gain/loss
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 text-sm transition-all duration-150 transform scale-105">
        <p className="font-medium text-black dark:text-white mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: entry.color }}></div>
              <span className="text-black dark:text-white mr-3">{entry.name}: </span>
            </div>
            <span className={entry.value >= 0 ? 'text-green-500' : 'text-red-500'}>
              {entry.value >= 0 ? '+' : ''}{entry.value.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const InvestmentPerformance = () => {
  const [performanceData, setPerformanceData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedInvestments, setSelectedInvestments] = useState([]);
  const { userInvestments } = useUserInvestments();

  // Function to calculate performance data for a stock
  const calculatePerformanceData = async (investment) => {
    try {
      const { symbol, investmentType, purchaseDate } = investment;
      
      // Format to use for API call based on investment type
      let apiSymbol = symbol;
      
      // For stock investments, add .NS suffix for Indian stocks
      if (investmentType === 'stock') {
        apiSymbol = `${symbol}.NS`;
      }
      
      console.log(`Fetching data for ${investment.id} (${apiSymbol})`);
      
      // Get stock data from API
      const response = await axios.get(`https://stock-server-j29j.onrender.com/stock/${apiSymbol}`);
      
      if (!response.data || !response.data.data || response.data.data.length === 0) {
        throw new Error(`No data available for ${symbol}`);
      }
      
      // Sort data by date
      const sortedData = [...response.data.data].sort((a, b) => new Date(a.Date) - new Date(b.Date));
      
      // Find purchase date index or closest date after purchase
      const purchaseDateObj = new Date(purchaseDate);
      let startIndex = 0;
      
      for (let i = 0; i < sortedData.length; i++) {
        const currentDate = new Date(sortedData[i].Date);
        if (currentDate >= purchaseDateObj) {
          startIndex = i;
          break;
        }
      }
      
      // Get purchase price or closest price after purchase date
      const purchasePrice = sortedData[startIndex].Close;
      
      // Calculate percentage change from purchase date for each subsequent data point
      const performanceEntries = sortedData.slice(startIndex).map(item => {
        const percentChange = ((item.Close - purchasePrice) / purchasePrice) * 100;
        return {
          date: new Date(item.Date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
          [investment.id]: percentChange,
          investmentType: investmentType
        };
      });
      
      return {
        id: investment.id,
        name: investmentType === 'stock' ? investment.stockName : investment.fundName,
        type: investmentType,
        performanceData: performanceEntries
      };
    } catch (err) {
      console.error(`Error fetching data for ${investment.id}:`, err);
      throw err;
    }
  };

  useEffect(() => {
    const fetchPerformanceData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Check if userInvestments is available and has data
        if (!userInvestments || !userInvestments.userData || !userInvestments.userData.investments) {
          console.log('No investment data available, generating mock data');
          const mockData = generateMockPerformanceData();
          setPerformanceData(mockData);
          setSelectedInvestments(Object.keys(mockData[0]).filter(key => key !== 'date'));
          setIsLoading(false);
          return;
        }
        
        console.log('User investments data:', userInvestments);
        
        // Get all investments from context
        const allInvestments = [
          ...(userInvestments.userData.investments.stocks || []),
          ...(userInvestments.userData.investments.mutualFunds || []),
          ...(userInvestments.userData.investments.indexFunds || [])
        ];
        
        console.log('All investments:', allInvestments);
        
        if (allInvestments.length === 0) {
          console.log('No investments found in data, generating mock data');
          const mockData = generateMockPerformanceData();
          setPerformanceData(mockData);
          setSelectedInvestments(Object.keys(mockData[0]).filter(key => key !== 'date'));
          setIsLoading(false);
          return;
        }
        
        // Select up to 5 investments to display
        const investmentsToShow = allInvestments.slice(0, 5);
        
        console.log('Investments to show:', investmentsToShow);
        
        // Fetch performance data for each investment
        const investmentDataPromises = investmentsToShow.map(investment => 
          calculatePerformanceData(investment)
        );
        
        const investmentDataResults = await Promise.allSettled(investmentDataPromises);
        
        // Process successful results
        const successfulResults = investmentDataResults
          .filter(result => result.status === 'fulfilled')
          .map(result => result.value);
        
        console.log('Successful results:', successfulResults);
        
        if (successfulResults.length === 0) {
          throw new Error('No investment data could be fetched successfully');
        }
        
        // Merge all performance data by date
        const mergedData = {};
        const selectedIds = [];
        
        successfulResults.forEach(result => {
          selectedIds.push(result.id);
          
          result.performanceData.forEach(entry => {
            const dateKey = entry.date;
            
            if (!mergedData[dateKey]) {
              mergedData[dateKey] = { date: dateKey };
            }
            
            mergedData[dateKey][result.id] = entry[result.id];
          });
        });
        
        // Convert merged data to array and sort by date
        const sortedMergedData = Object.values(mergedData).sort((a, b) => 
          new Date(a.date) - new Date(b.date)
        );
        
        console.log('Performance data generated:', sortedMergedData);
        console.log('Selected investment IDs:', selectedIds);
        
        setPerformanceData(sortedMergedData);
        setSelectedInvestments(selectedIds);
      } catch (err) {
        console.error('Error fetching performance data:', err);
        setError('Failed to fetch performance data. Using mock data instead.');
        
        // Fall back to mock data on error
        const mockData = generateMockPerformanceData();
        setPerformanceData(mockData);
        setSelectedInvestments(Object.keys(mockData[0]).filter(key => key !== 'date'));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPerformanceData();
  }, [userInvestments]);

  // Generate mock performance data for demo purposes
  const generateMockPerformanceData = () => {
    const startDate = new Date('2023-01-01');
    const data = [];
    
    // Create 5 mock investments
    const mockInvestments = [
      { id: 'stock_inv_1', name: 'TCS', type: 'stock' },
      { id: 'stock_inv_2', name: 'Reliance', type: 'stock' },
      { id: 'mf_inv_1', name: 'SBI Blue Chip Fund', type: 'mutualFund' },
      { id: 'index_inv_1', name: 'UTI Nifty Index Fund', type: 'indexFund' },
      { id: 'mf_inv_2', name: 'Mirae Asset Fund', type: 'mutualFund' }
    ];
    
    // Generate random starting points between -5 and +5
    const startPoints = {};
    mockInvestments.forEach(inv => {
      startPoints[inv.id] = Math.random() * 10 - 5;
    });
    
    // Generate 12 months of data
    for (let i = 0; i < 12; i++) {
      const currentDate = new Date(startDate);
      currentDate.setMonth(currentDate.getMonth() + i);
      
      const entry = {
        date: currentDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      };
      
      // Update each investment with random walk
      mockInvestments.forEach(inv => {
        const prevValue = i === 0 ? startPoints[inv.id] : data[i-1][inv.id];
        const change = (Math.random() * 6) - 3; // Random change between -3% and +3%
        entry[inv.id] = prevValue + change;
      });
      
      data.push(entry);
    }
    
    return data;
  };

  return (
    <Card className="h-full p-4">
      <h2 className="text-xl font-semibold mb-4">Investment Performance Over Time</h2>
      <p className="text-sm text-gray-400 mb-4">
        Percentage gain/loss from purchase date
      </p>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-red-400 text-center my-4">{error}</div>
      ) : performanceData.length === 0 ? (
        <div className="text-center my-4 text-gray-400">No performance data available</div>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={performanceData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 10 }} 
                tickLine={false}
                axisLine={{ stroke: '#333' }}
                tickMargin={5}
              />
              <YAxis 
                tick={{ fontSize: 10 }} 
                tickLine={false}
                axisLine={{ stroke: '#333' }}
                tickFormatter={value => `${value.toFixed(0)}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              {selectedInvestments.map((investmentId, index) => {
                // Find investment details in userInvestments
                const allInvestments = [
                  ...(userInvestments?.userData?.investments?.stocks || []),
                  ...(userInvestments?.userData?.investments?.mutualFunds || []),
                  ...(userInvestments?.userData?.investments?.indexFunds || [])
                ];
                
                const investment = allInvestments.find(inv => inv.id === investmentId) || 
                  { id: investmentId, investmentType: 'stock' };
                
                const investmentType = investment.investmentType || 'stock';
                const color = getInvestmentColor(investmentType);
                const name = investment.stockName || investment.fundName || investmentId;
                
                return (
                  <Line 
                    key={investmentId}
                    type="monotone" 
                    dataKey={investmentId} 
                    name={name}
                    stroke={color} 
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6, fill: color }}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
};

export default InvestmentPerformance; 