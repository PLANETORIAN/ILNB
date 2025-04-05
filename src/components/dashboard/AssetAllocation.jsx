import React, { useState, useEffect } from 'react';
import { useUserInvestments } from '../../context/UserInvestmentsContext';
import Card from '../common/Card';

// Force component update with version number
const COMPONENT_VERSION = 2;

const AssetAllocation = () => {
  const { userInvestments, isLoading: contextLoading } = useUserInvestments();
  const [assetAllocation, setAssetAllocation] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [totalInvestmentValue, setTotalInvestmentValue] = useState(0);

  // Log the component version to ensure we're running the latest code
  useEffect(() => {
    console.log(`AssetAllocation component version ${COMPONENT_VERSION} loaded`);
  }, []);

  // Log the investment data to help debugging
  useEffect(() => {
    if (userInvestments && userInvestments.userData && userInvestments.userData.investments) {
      console.log('User Investment Data:', userInvestments.userData.investments);
    }
  }, [userInvestments]);

  useEffect(() => {
    const calculateAssetAllocation = () => {
      if (contextLoading) return;
      
      console.log('Calculating asset allocation');
      setIsLoading(true);

      try {
        if (!userInvestments || !userInvestments.userData || !userInvestments.userData.investments) {
          console.log('No user investment data available');
          setIsLoading(false);
          return;
        }

        // Get all investments
        const { stocks = [], mutualFunds = [], indexFunds = [] } = userInvestments.userData.investments;
        console.log(`Found ${stocks.length} stocks, ${mutualFunds.length} mutual funds, ${indexFunds.length} index funds`);

        // Calculate investment values for each category
        let totalValue = 0;
        let stocksValue = 0;
        let mutualFundsValue = 0;
        let indexFundsValue = 0;

        // Process stocks
        stocks.forEach(stock => {
          const { symbol, quantity } = stock;
          console.log(`Processing stock: ${symbol}, quantity: ${quantity}`);
          
          // Fixed prices for known stocks
          const stockPrices = {
            'TCS': 3800,
            'BHARTIARTL': 1200,
            'ICICIBANK': 1050,
            'HINDUNILVR': 2500,
            'RELIANCE': 2900,
            'ADANIPORTS': 850
          };
          
          const price = stockPrices[symbol] || 1000;
          const value = quantity * price;
          
          console.log(`  ${symbol}: ${quantity} x ₹${price} = ₹${value}`);
          stocksValue += value;
          totalValue += value;
        });

        // Process mutual funds
        mutualFunds.forEach(fund => {
          const { symbol, units } = fund;
          console.log(`Processing mutual fund: ${symbol}, units: ${units}`);
          
          // Fixed NAVs for known mutual funds
          const fundNavs = {
            'SBIBLUECHIP': 85,
            'MAEBL': 95,
            'PPFCF': 55,
            'AXISMID': 70,
            'HDFCSMALL': 65,
            'ICICIPRUTECH': 75
          };
          
          const nav = fundNavs[symbol] || 60;
          const value = units * nav;
          
          console.log(`  ${symbol}: ${units} x ₹${nav} = ₹${value}`);
          mutualFundsValue += value;
          totalValue += value;
        });

        // Process index funds
        indexFunds.forEach(fund => {
          const { symbol, units } = fund;
          console.log(`Processing index fund: ${symbol}, units: ${units}`);
          
          // Fixed NAVs for known index funds
          const indexNavs = {
            'UTINIFTY': 120,
            'HDFCSENSEX': 150,
            'SBINIFTY': 110,
            'NRIINDEX': 130,
            'ICICINN50': 100
          };
          
          const nav = indexNavs[symbol] || 100;
          const value = units * nav;
          
          console.log(`  ${symbol}: ${units} x ₹${nav} = ₹${value}`);
          indexFundsValue += value;
          totalValue += value;
        });

        console.log('Category Values:');
        console.log(`- Stocks: ₹${stocksValue}`);
        console.log(`- Mutual Funds: ₹${mutualFundsValue}`);
        console.log(`- Index Funds: ₹${indexFundsValue}`);
        console.log(`Total Value: ₹${totalValue}`);

        // Update total investment value
        setTotalInvestmentValue(totalValue);

        // Calculate percentages and create new allocation object
        const newAllocation = {};
        
        if (stocksValue > 0) {
          const percentage = (stocksValue / totalValue) * 100;
          console.log(`Stocks percentage: ${percentage}%`);
          newAllocation.stocks = {
            name: 'Stocks',
            value: stocksValue,
            percentage: Math.round(percentage),
            color: '#FF6B6B'
          };
        }
        
        if (mutualFundsValue > 0) {
          const percentage = (mutualFundsValue / totalValue) * 100;
          console.log(`Mutual Funds percentage: ${percentage}%`);
          newAllocation.mutualFunds = {
            name: 'Mutual Funds',
            value: mutualFundsValue,
            percentage: Math.round(percentage),
            color: '#4ECDC4'
          };
        }
        
        if (indexFundsValue > 0) {
          const percentage = (indexFundsValue / totalValue) * 100;
          console.log(`Index Funds percentage: ${percentage}%`);
          newAllocation.indexFunds = {
            name: 'Index Funds',
            value: indexFundsValue,
            percentage: Math.round(percentage),
            color: '#FFE66D'
          };
        }

        // Ensure percentages sum to 100%
        let totalPercentage = 0;
        Object.values(newAllocation).forEach(item => {
          totalPercentage += item.percentage;
        });
        
        console.log(`Total percentage before adjustment: ${totalPercentage}%`);
        
        if (totalPercentage !== 100 && Object.keys(newAllocation).length > 0) {
          // Find the largest category to adjust
          let largest = null;
          let largestKey = '';
          
          Object.entries(newAllocation).forEach(([key, value]) => {
            if (!largest || value.percentage > largest.percentage) {
              largest = value;
              largestKey = key;
            }
          });
          
          if (largest) {
            const diff = 100 - totalPercentage;
            newAllocation[largestKey].percentage += diff;
            console.log(`Adjusted ${largestKey} by ${diff}%, new percentage: ${newAllocation[largestKey].percentage}%`);
          }
        }

        console.log('Final allocation:', newAllocation);
        setAssetAllocation(newAllocation);
      } catch (error) {
        console.error('Error calculating asset allocation:', error);
      } finally {
        setIsLoading(false);
      }
    };

    calculateAssetAllocation();
  }, [userInvestments, contextLoading]);

  // Create pie chart segments
  const renderPieChart = () => {
    const allocationArray = Object.values(assetAllocation);
    
    // Start from the top (12 o'clock position)
    let cumulativeAngle = 0;
    
    return allocationArray.map((item, index) => {
      if (item.percentage === 0) return null;
      
      // Calculate angles
      const startAngle = cumulativeAngle;
      const angleInDegrees = (item.percentage / 100) * 360; // Using exact 100% as the total
      cumulativeAngle += angleInDegrees;
      const endAngle = cumulativeAngle;
      
      // Convert angles to radians
      const startRad = (startAngle - 90) * (Math.PI / 180);
      const endRad = (endAngle - 90) * (Math.PI / 180);
      
      // Calculate the points for the arc
      const radius = 40;
      const x1 = 50 + radius * Math.cos(startRad);
      const y1 = 50 + radius * Math.sin(startRad);
      const x2 = 50 + radius * Math.cos(endRad);
      const y2 = 50 + radius * Math.sin(endRad);
      
      // Determine if the arc is more than 180 degrees
      const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
      
      // Create the SVG path
      const pathData = `M 50 50 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
      
      return (
        <path
          key={index}
          d={pathData}
          fill={item.color}
          stroke="#1e1e2d"
          strokeWidth="0.5"
        />
      );
    });
  };

  return (
    <Card className="p-4">
      <h2 className="text-xl font-semibold mb-4">Asset Allocation</h2>
      
      {isLoading ? (
        <div className="flex justify-center items-center p-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : Object.keys(assetAllocation).length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-400">No investment data available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center justify-center">
            <div className="relative w-48 h-48">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {renderPieChart()}
              </svg>
            </div>
          </div>
          
          <div className="flex flex-col justify-center">
            <div className="space-y-3">
              {Object.values(assetAllocation).map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded-sm mr-2" 
                      style={{ backgroundColor: item.color }} 
                    />
                    <span>{item.name}</span>
                  </div>
                  <div className="font-semibold">{item.percentage}%</div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center text-sm text-gray-400">
              Total Investment: ₹{totalInvestmentValue.toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default AssetAllocation; 