import { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import Card from '@/components/common/Card';
import { ArrowUp, ArrowDown, AlertTriangle, BarChart2, LineChart, PieChart, Calendar } from 'lucide-react';
import React from 'react';

function Reports() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('performance');
  const { isDarkMode } = useTheme();

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 800);
  }, []);

  // Sample data for demonstration
  const performanceData = [
    { month: 'Jan', value: 5.2 },
    { month: 'Feb', value: 7.8 },
    { month: 'Mar', value: 6.3 },
    { month: 'Apr', value: 9.1 },
    { month: 'May', value: 8.4 },
    { month: 'Jun', value: 10.7 },
  ];

  const allocationData = [
    { category: 'Stocks', percentage: 45, color: 'purple' },
    { category: 'Bonds', percentage: 25, color: 'blue' },
    { category: 'Crypto', percentage: 15, color: 'orange' },
    { category: 'Cash', percentage: 10, color: 'green' },
    { category: 'Commodities', percentage: 5, color: 'red' },
  ];

  const recentTransactions = [
    { id: 1, asset: 'Bitcoin', type: 'buy', amount: 0.5, value: 32000, date: '2023-06-15' },
    { id: 2, asset: 'Tesla', type: 'sell', amount: 10, value: 8500, date: '2023-06-10' },
    { id: 3, asset: 'ETH', type: 'buy', amount: 2.5, value: 7500, date: '2023-06-01' },
    { id: 4, asset: 'S&P 500 ETF', type: 'buy', amount: 5, value: 2250, date: '2023-05-28' },
  ];

  const alerts = [
    { id: 1, type: 'warning', message: 'Market volatility detected in tech sector', date: '2023-06-16' },
    { id: 2, type: 'info', message: 'Portfolio rebalancing recommended', date: '2023-06-14' },
    { id: 3, type: 'success', message: 'Investment target achieved for Q2', date: '2023-06-10' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const TabButton = ({ name, icon, label }) => {
    // Clone the icon element and modify its color based on active state
    const iconWithColor = React.cloneElement(icon, {
      className: `w-5 h-5 ${activeTab === name ? 'text-purple-500' : isDarkMode ? 'text-black' : 'text-black'}`
    });

    return (
      <button 
        onClick={() => setActiveTab(name)}
        className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all duration-300 ${
          activeTab === name 
            ? isDarkMode 
              ? 'bg-purple-900/50 border border-purple-500/30 text-purple-500'
              : 'bg-purple-600/20 border border-purple-500/30 text-purple-500'
            : isDarkMode
              ? 'hover:bg-purple-900/30 border border-transparent text-black'
              : 'hover:bg-purple-600/10 border border-transparent text-black'
        }`}
      >
        {iconWithColor}
        <span>{label}</span>
      </button>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'performance':
        return (
          <div className="space-y-6 animate-fade-in">
            <Card className="glass-effect p-6">
              <h3 className="text-xl font-semibold mb-4">Portfolio Performance</h3>
              <div className="h-64 bg-gradient-to-b from-purple-500/10 to-blue-500/10 rounded-lg p-4">
                <div className="flex justify-between items-end h-52">
                  {performanceData.map((item, index) => (
                    <div key={index} className="flex flex-col items-center w-1/6">
                      <div className="relative w-full">
                        <div 
                          className="w-8 bg-gradient-to-t from-purple-500 to-blue-500 rounded-t-lg mx-auto animate-fade-in" 
                          style={{ 
                            height: `${item.value * 5}px`,
                            animationDelay: `${index * 100}ms`
                          }}
                        ></div>
                      </div>
                      <span className="text-xs mt-2">{item.month}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 flex justify-between">
                <div>
                  <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>Overall Growth</span>
                  <p className="text-2xl font-bold text-green-400">+18.4%</p>
                </div>
                <div>
                  <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>Time Period</span>
                  <p className="text-lg">Last 6 Months</p>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="glass-effect p-6">
                <h3 className="text-xl font-semibold mb-4">Key Metrics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-transparent">
                    <span>Annual Return</span>
                    <span className="text-green-400 font-bold">+15.7%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-transparent">
                    <span>Sharpe Ratio</span>
                    <span className="font-bold">1.8</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-transparent">
                    <span>Volatility</span>
                    <span className="text-yellow-400 font-bold">12.3%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-transparent">
                    <span>Alpha</span>
                    <span className="text-green-400 font-bold">+2.4%</span>
                  </div>
                </div>
              </Card>

              <Card className="glass-effect p-6">
                <h3 className="text-xl font-semibold mb-4">Investment Growth</h3>
                <div className="h-48 relative mt-4">
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700 rounded"></div>
                  <div className="absolute bottom-0 left-0 h-40 w-1 bg-gray-700 rounded"></div>
                  <div className="absolute bottom-0 left-0 right-0 h-32 animate-fade-in" style={{ animationDelay: '300ms' }}>
                    <svg viewBox="0 0 300 100" className="w-full h-full overflow-visible">
                      <path
                        d="M0,100 C20,80 40,90 60,70 C80,50 100,60 120,40 C140,20 160,30 180,20 C200,10 220,5 240,15 C260,25 280,10 300,5"
                        fill="none"
                        stroke="url(#gradient)"
                        strokeWidth="3"
                        className="path"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#8B5CF6" />
                          <stop offset="100%" stopColor="#3B82F6" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>
                <div className="flex justify-between mt-4 text-sm">
                  <span>Initial: $10,000</span>
                  <span className="font-bold">Current: $14,570</span>
                </div>
              </Card>
            </div>
          </div>
        );
      case 'allocation':
        return (
          <div className="space-y-6 animate-fade-in">
            <Card className="glass-effect p-6">
              <h3 className="text-xl font-semibold mb-4">Asset Allocation</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-center">
                  <div className="relative w-48 h-48">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      {allocationData.map((item, index) => {
                        // Calculate the angles for the pie chart segments
                        const total = allocationData.reduce((sum, data) => sum + data.percentage, 0);
                        const startAngle = allocationData
                          .slice(0, index)
                          .reduce((sum, data) => sum + (data.percentage / total) * 360, 0);
                        const endAngle = startAngle + (item.percentage / total) * 360;
                        
                        // Convert angles to radians
                        const startRad = (startAngle - 90) * (Math.PI / 180);
                        const endRad = (endAngle - 90) * (Math.PI / 180);
                        
                        // Calculate the SVG arc path
                        const x1 = 50 + 40 * Math.cos(startRad);
                        const y1 = 50 + 40 * Math.sin(startRad);
                        const x2 = 50 + 40 * Math.cos(endRad);
                        const y2 = 50 + 40 * Math.sin(endRad);
                        
                        // Create the SVG path for the arc
                        const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
                        const pathData = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
                        
                        let color;
                        switch (item.color) {
                          case 'purple': color = '#8B5CF6'; break;
                          case 'blue': color = '#3B82F6'; break;
                          case 'orange': color = '#F59E0B'; break;
                          case 'green': color = '#10B981'; break;
                          case 'red': color = '#EF4444'; break;
                          default: color = '#8B5CF6';
                        }
                        
                        return (
                          <path 
                            key={index} 
                            d={pathData} 
                            fill={color} 
                            opacity="0.8"
                            className="hover:opacity-100 transition-opacity cursor-pointer"
                          />
                        );
                      })}
                    </svg>
                  </div>
                </div>
                <div className="space-y-3">
                  {allocationData.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                      <div className={`w-4 h-4 rounded-full bg-${item.color}-500`} style={{ backgroundColor: 
                        item.color === 'purple' ? '#8B5CF6' : 
                        item.color === 'blue' ? '#3B82F6' : 
                        item.color === 'orange' ? '#F59E0B' : 
                        item.color === 'green' ? '#10B981' : 
                        item.color === 'red' ? '#EF4444' : '#8B5CF6'
                      }}></div>
                      <div className="flex-1 flex justify-between">
                        <span>{item.category}</span>
                        <span className="font-bold">{item.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card className="glass-effect p-6">
              <h3 className="text-xl font-semibold mb-4">Allocation Recommendations</h3>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-gradient-to-r from-yellow-500/20 to-transparent">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-400" />
                    <span className="font-medium">Overweight in Technology</span>
                  </div>
                  <p className="text-sm">Consider reducing exposure to tech stocks by 5-10% to improve portfolio balance.</p>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-r from-green-500/20 to-transparent">
                  <div className="flex items-center space-x-2 mb-2">
                    <ArrowUp className="w-5 h-5 text-green-400" />
                    <span className="font-medium">Increase Bond Allocation</span>
                  </div>
                  <p className="text-sm">Current interest rate environment favors increasing bond allocation by 5%.</p>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-r from-blue-500/20 to-transparent">
                  <div className="flex items-center space-x-2 mb-2">
                    <BarChart2 className="w-5 h-5 text-blue-400" />
                    <span className="font-medium">Consider Alternatives</span>
                  </div>
                  <p className="text-sm">Adding 3-5% allocation to alternative investments may improve risk-adjusted returns.</p>
                </div>
              </div>
            </Card>
          </div>
        );
      case 'transactions':
        return (
          <div className="space-y-6 animate-fade-in">
            <Card className="glass-effect p-6">
              <h3 className="text-xl font-semibold mb-4">Recent Transactions</h3>
              <div className="overflow-x-auto">
                <table className="w-full min-w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="pb-3 text-left">Asset</th>
                      <th className="pb-3 text-left">Type</th>
                      <th className="pb-3 text-right">Amount</th>
                      <th className="pb-3 text-right">Value</th>
                      <th className="pb-3 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransactions.map((tx, index) => (
                      <tr 
                        key={tx.id} 
                        className="border-b border-gray-700 last:border-0 hover:bg-white/5 transition-colors cursor-pointer animate-fade-in"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <td className="py-4">{tx.asset}</td>
                        <td className="py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            tx.type === 'buy' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                          }`}>
                            {tx.type.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-4 text-right">{tx.amount}</td>
                        <td className="py-4 text-right">${tx.value.toLocaleString()}</td>
                        <td className="py-4 text-right">{new Date(tx.date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex justify-center">
                <button className="px-4 py-2 text-sm text-purple-400 border border-purple-500/20 rounded-lg hover:bg-purple-500/10 transition-colors">
                  View All Transactions
                </button>
              </div>
            </Card>

            <Card className="glass-effect p-6">
              <h3 className="text-xl font-semibold mb-4">Transaction Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-transparent">
                  <span className={`block text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Total Buy Volume</span>
                  <span className="block text-2xl font-bold">$41,750</span>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-transparent">
                  <span className={`block text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Total Sell Volume</span>
                  <span className="block text-2xl font-bold">$8,500</span>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-transparent">
                  <span className={`block text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Net Change</span>
                  <span className="block text-2xl font-bold text-green-400">+$33,250</span>
                </div>
              </div>
            </Card>
          </div>
        );
      case 'alerts':
        return (
          <div className="space-y-6 animate-fade-in">
            <Card className="glass-effect p-6">
              <h3 className="text-xl font-semibold mb-4">Alerts & Notifications</h3>
              <div className="space-y-4">
                {alerts.map((alert, index) => {
                  let bgColor, icon;
                  
                  switch (alert.type) {
                    case 'warning':
                      bgColor = 'from-yellow-500/20';
                      icon = <AlertTriangle className="w-5 h-5 text-yellow-400" />;
                      break;
                    case 'info':
                      bgColor = 'from-blue-500/20';
                      icon = <BarChart2 className="w-5 h-5 text-blue-400" />;
                      break;
                    case 'success':
                      bgColor = 'from-green-500/20';
                      icon = <ArrowUp className="w-5 h-5 text-green-400" />;
                      break;
                    default:
                      bgColor = 'from-purple-500/20';
                      icon = <BarChart2 className="w-5 h-5 text-purple-400" />;
                  }
                  
                  return (
                    <div 
                      key={alert.id} 
                      className={`p-4 rounded-lg bg-gradient-to-r ${bgColor} to-transparent animate-fade-in hover:from-opacity-30 transition-all cursor-pointer`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex justify-between">
                        <div className="flex items-center space-x-2">
                          {icon}
                          <span className="font-medium">{alert.message}</span>
                        </div>
                        <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>{new Date(alert.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 border-t border-gray-700 pt-4">
                <h4 className="font-medium mb-3">Notification Settings</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Market Alerts</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Portfolio Updates</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Price Alerts</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" value="" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="pt-20 px-4 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 animate-fade-in bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
        Reports & Analytics
      </h1>

      <div className="flex flex-wrap gap-2 mb-6">
        <TabButton name="performance" icon={<LineChart className="w-5 h-5" />} label="Performance" />
        <TabButton name="allocation" icon={<PieChart className="w-5 h-5" />} label="Allocation" />
        <TabButton name="transactions" icon={<Calendar className="w-5 h-5" />} label="Transactions" />
        <TabButton name="alerts" icon={<AlertTriangle className="w-5 h-5" />} label="Alerts" />
      </div>

      {renderTabContent()}
    </div>
  );
}

export default Reports; 