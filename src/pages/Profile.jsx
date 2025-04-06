import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useUserInvestments } from '@/context/UserInvestmentsContext';
import Card from '@/components/common/Card';
import { User, ArrowUp, ArrowDown } from 'lucide-react';
import axios from 'axios';

function Profile() {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const { userInvestments, isLoading: investmentsLoading } = useUserInvestments();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState([]);
  const [activities, setActivities] = useState([]);
  
  // Use a fallback name if user.name is not available
  const userName = user?.name || user?.email?.split('@')[0] || 'User';
  const userInitial = userName[0]?.toUpperCase() || 'U';

  useEffect(() => {
    if (!investmentsLoading && userInvestments) {
      calculateStats();
      generateActivities();
      setIsLoading(false);
    }
  }, [investmentsLoading, userInvestments]);

  const calculateStats = async () => {
    if (!userInvestments?.userData?.investments) return;

    const { stocks = [], mutualFunds = [], indexFunds = [] } = userInvestments.userData.investments;
    const totalInvestments = stocks.length + mutualFunds.length + indexFunds.length;
    
    let totalCurrentValue = 0;
    let totalInvestedAmount = 0;

    // Process stocks with real API data
    for (const stock of stocks) {
      try {
        // Get current price and historical data
        const response = await axios.get(`https://stock-server-j29j.onrender.com/stock/${stock.symbol}.NS`);
        const currentPrice = response.data.live_price;
        const historicalData = response.data.data;
        const purchaseDate = new Date(stock.purchaseDate);

        // Find the closest historical price to purchase date
        let purchasePrice = currentPrice; // default to current price if no historical data found
        if (historicalData && historicalData.length > 0) {
          const closestPriceData = historicalData.reduce((closest, current) => {
            const currentDate = new Date(current.Date);
            const closestDate = new Date(closest.Date);
            const purchaseTimeDiff = Math.abs(purchaseDate - currentDate);
            const closestTimeDiff = Math.abs(purchaseDate - closestDate);
            return purchaseTimeDiff < closestTimeDiff ? current : closest;
          });
          purchasePrice = closestPriceData.Close;
        }

        const value = currentPrice * stock.quantity;
        const investedAmount = purchasePrice * stock.quantity;
        
        totalCurrentValue += value;
        totalInvestedAmount += investedAmount;

      } catch (error) {
        console.error(`Error fetching price for ${stock.symbol}:`, error);
        // Use fallback values if API fails
        const fallbackCurrentPrice = 1000;
        const fallbackPurchasePrice = 900;
        totalCurrentValue += fallbackCurrentPrice * stock.quantity;
        totalInvestedAmount += fallbackPurchasePrice * stock.quantity;
      }
    }

    // Process mutual funds
    mutualFunds.forEach(fund => {
      const currentNav = fund.currentNav || 120;
      const purchaseNav = 100; // This should ideally come from historical NAV data
      const value = currentNav * fund.units;
      const investedAmount = purchaseNav * fund.units;
      
      totalCurrentValue += value;
      totalInvestedAmount += investedAmount;
    });

    // Process index funds
    indexFunds.forEach(fund => {
      const currentNav = fund.currentNav || 180;
      const purchaseNav = 150; // This should ideally come from historical NAV data
      const value = currentNav * fund.units;
      const investedAmount = purchaseNav * fund.units;
      
      totalCurrentValue += value;
      totalInvestedAmount += investedAmount;
    });

    // Calculate returns percentage
    const returns = totalInvestedAmount > 0 
      ? ((totalCurrentValue - totalInvestedAmount) / totalInvestedAmount * 100).toFixed(1)
      : '0.0';

    console.log('Portfolio Stats:', {
      totalInvestments,
      totalCurrentValue,
      totalInvestedAmount,
      returns
    });

    setStats([
      { label: 'Total Investments', value: totalInvestments.toString() },
      { label: 'Portfolio Value', value: `₹${totalCurrentValue.toLocaleString()}` },
      { label: 'Total Returns', value: `${returns}%` },
      { label: 'Investment Types', value: '3' }
    ]);
  };

  const generateActivities = () => {
    if (!userInvestments?.userData?.investments) return;

    const { stocks = [], mutualFunds = [], indexFunds = [] } = userInvestments.userData.investments;
    const allInvestments = [...stocks, ...mutualFunds, ...indexFunds];
    
    // Sort by purchase date and take the 3 most recent
    const recentInvestments = allInvestments
      .sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate))
      .slice(0, 3);

    const newActivities = recentInvestments.map(investment => {
      const isStock = 'stockName' in investment;
      const name = isStock ? investment.stockName : investment.fundName;
      const amount = isStock 
        ? `₹${(investment.quantity * 1000).toLocaleString()}` 
        : `₹${(investment.units * 100).toLocaleString()}`;
      
      return {
        type: isStock ? 'Stock' : 'Fund',
        asset: name,
        amount: amount,
        time: new Date(investment.purchaseDate).toLocaleDateString()
      };
    });

    setActivities(newActivities);
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
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 animate-fade-in bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
          Profile
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="col-span-1 md:col-span-2 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 rounded-full bg-purple-500/20 flex items-center justify-center">
              <span className="text-3xl font-bold text-purple-500">{userInitial}</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold">{userName}</h2>
              <p className="text-gray-400">{user?.email}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Account Status</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Member Since</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Account Type</span>
              <span className="text-purple-500">Premium</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} className="p-4">
            <p className="text-gray-400 text-sm">{stat.label}</p>
            <p className="text-xl font-bold">{stat.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Activities</h3>
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.type === 'Stock' ? 'bg-green-500/20' : 'bg-blue-500/20'
                  }`}>
                    {activity.type === 'Stock' ? (
                      <ArrowUp className="w-4 h-4 text-green-500" />
                    ) : (
                      <ArrowDown className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{activity.asset}</p>
                    <p className="text-sm text-gray-400">{activity.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{activity.amount}</p>
                  <p className="text-sm text-gray-400">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Investment Distribution</h3>
          <div className="space-y-4">
            {userInvestments?.userData?.investments && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Stocks</span>
                  <span className="font-medium">{userInvestments.userData.investments.stocks?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Mutual Funds</span>
                  <span className="font-medium">{userInvestments.userData.investments.mutualFunds?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Index Funds</span>
                  <span className="font-medium">{userInvestments.userData.investments.indexFunds?.length || 0}</span>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Profile; 