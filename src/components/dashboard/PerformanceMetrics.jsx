import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import api from '../../services/api';

const PerformanceMetrics = () => {
  const [metrics, setMetrics] = useState(null);
  const [period, setPeriod] = useState('1y');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPerformanceMetrics = async () => {
      setIsLoading(true);
      try {
        const response = await api.dashboard.getPerformanceMetrics(period);
        setMetrics(response.data);
      } catch (error) {
        console.error('Error fetching performance metrics:', error);
        // Fallback data
        setMetrics({
          totalReturn: 18.5,
          benchmarkReturn: 15.2,
          alpha: 3.3,
          beta: 0.85,
          sharpeRatio: 1.2,
          volatility: 12.5,
          drawdown: -8.2,
          topPerformers: [
            { name: 'HDFC Bank', platform: 'Zerodha', return: 25.3 },
            { name: 'Axis Bluechip Fund', platform: 'Groww', return: 22.8 },
            { name: 'Infosys', platform: 'Upstox', return: 19.6 }
          ],
          underperformers: [
            { name: 'Yes Bank', platform: 'Zerodha', return: -12.5 },
            { name: 'IDFC Infrastructure Fund', platform: 'Groww', return: -5.8 },
            { name: 'ITC', platform: 'Coin', return: 2.3 }
          ]
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPerformanceMetrics();
  }, [period]);

  const handlePeriodChange = (e) => {
    setPeriod(e.target.value);
  };

  if (isLoading) {
    return (
      <Card className="h-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Performance Metrics</h2>
          <select
            className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-sm focus:outline-none focus:border-purple-500"
            value={period}
            onChange={handlePeriodChange}
          >
            <option value="1m">1 Month</option>
            <option value="3m">3 Months</option>
            <option value="6m">6 Months</option>
            <option value="1y">1 Year</option>
            <option value="3y">3 Years</option>
            <option value="5y">5 Years</option>
          </select>
        </div>
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Performance Metrics</h2>
        <select
          className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-sm focus:outline-none focus:border-purple-500"
          value={period}
          onChange={handlePeriodChange}
        >
          <option value="1m">1 Month</option>
          <option value="3m">3 Months</option>
          <option value="6m">6 Months</option>
          <option value="1y">1 Year</option>
          <option value="3y">3 Years</option>
          <option value="5y">5 Years</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-3 bg-white/5 rounded-lg">
          <p className="text-sm text-gray-400">Total Return</p>
          <p className={`text-xl font-bold ${metrics.totalReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {metrics.totalReturn}%
          </p>
        </div>
        <div className="p-3 bg-white/5 rounded-lg">
          <p className="text-sm text-gray-400">Benchmark</p>
          <p className={`text-xl font-bold ${metrics.benchmarkReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {metrics.benchmarkReturn}%
          </p>
        </div>
        <div className="p-3 bg-white/5 rounded-lg">
          <p className="text-sm text-gray-400">Alpha</p>
          <p className={`text-xl font-bold ${metrics.alpha >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {metrics.alpha}%
          </p>
        </div>
        <div className="p-3 bg-white/5 rounded-lg">
          <p className="text-sm text-gray-400">Sharpe Ratio</p>
          <p className="text-xl font-bold">{metrics.sharpeRatio}</p>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-md font-medium mb-3">Top Performers</h3>
        <div className="space-y-2">
          {metrics.topPerformers.map((item, index) => (
            <div key={index} className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
              <div>
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-gray-400">{item.platform}</p>
              </div>
              <p className="text-sm font-bold text-green-400">+{item.return}%</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-md font-medium mb-3">Underperformers</h3>
        <div className="space-y-2">
          {metrics.underperformers.map((item, index) => (
            <div key={index} className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
              <div>
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-gray-400">{item.platform}</p>
              </div>
              <p className={`text-sm font-bold ${item.return < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                {item.return > 0 ? '+' : ''}{item.return}%
              </p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default PerformanceMetrics; 