import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import api from '../../services/api';

const PlatformBreakdown = () => {
  const [platformData, setPlatformData] = useState([]);
  const [totalValue, setTotalValue] = useState(0);
  const [metric, setMetric] = useState('value');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPlatformData = async () => {
      setIsLoading(true);
      try {
        const response = await api.dashboard.getPlatformBreakdown();
        setPlatformData(response.data.platforms);
        setTotalValue(response.data.totalValue);
      } catch (error) {
        console.error('Error fetching platform breakdown:', error);
        // Fallback data in case of error
        setPlatformData([
          { name: 'Zerodha', value: 50000, percentage: 45, color: 'from-purple-500 to-purple-600' },
          { name: 'Groww', value: 33000, percentage: 30, color: 'from-blue-500 to-blue-600' },
          { name: 'Coin', value: 16500, percentage: 15, color: 'from-indigo-500 to-indigo-600' },
          { name: 'Upstox', value: 11000, percentage: 10, color: 'from-violet-500 to-violet-600' },
        ]);
        setTotalValue(110500);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlatformData();
  }, []);

  const handleMetricChange = (e) => {
    setMetric(e.target.value);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Platform Breakdown</h2>
        <select 
          className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-sm focus:outline-none focus:border-purple-500"
          value={metric}
          onChange={handleMetricChange}
        >
          <option value="value">By Value</option>
          <option value="returns">By Returns</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {platformData.map((platform) => (
            <div key={platform.name} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{platform.name}</span>
                <span className="font-medium">
                  {metric === 'value' 
                    ? formatCurrency(platform.value) 
                    : `${platform.returns || 0}%`}
                </span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${platform.color} transform origin-left transition-transform duration-500 ease-out animate-slide-in`}
                  style={{ width: `${platform.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 p-4 bg-white/5 rounded-lg">
        <div className="flex justify-between items-center text-sm text-gray-400">
          <span>Total Assets</span>
          <span className="font-medium">{formatCurrency(totalValue)}</span>
        </div>
      </div>
    </Card>
  );
};

export default PlatformBreakdown; 