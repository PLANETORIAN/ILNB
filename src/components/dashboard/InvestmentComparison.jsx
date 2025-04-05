import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import api from '../../services/api';

const InvestmentComparison = () => {
  const [comparisonData, setComparisonData] = useState(null);
  const [selectedMetrics, setSelectedMetrics] = useState(['returns', 'risk']);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchComparisonData = async () => {
      setIsLoading(true);
      try {
        const response = await api.dashboard.getComparisonData(selectedMetrics);
        setComparisonData(response.data);
      } catch (error) {
        console.error('Error fetching comparison data:', error);
        // Fallback data
        setComparisonData({
          categories: ['Equity MFs', 'Equity Stocks', 'Debt MFs', 'Gold ETFs'],
          metrics: [
            {
              name: 'Returns (%)',
              data: [15.8, 18.2, 9.5, 12.1],
              color: 'from-blue-500 to-blue-600'
            },
            {
              name: 'Risk (Volatility)',
              data: [12.5, 18.4, 2.8, 8.9],
              color: 'from-red-500 to-red-600'
            },
            {
              name: 'Sharpe Ratio',
              data: [1.2, 0.9, 1.8, 1.3],
              color: 'from-green-500 to-green-600'
            }
          ],
          platforms: [
            { name: 'Zerodha', bestPerforming: 'Equity Stocks' },
            { name: 'Groww', bestPerforming: 'Equity MFs' },
            { name: 'Coin', bestPerforming: 'Debt MFs' },
            { name: 'Upstox', bestPerforming: 'Gold ETFs' }
          ]
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchComparisonData();
  }, [selectedMetrics]);

  const handleMetricChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setSelectedMetrics([...selectedMetrics, value]);
    } else {
      setSelectedMetrics(selectedMetrics.filter(metric => metric !== value));
    }
  };

  if (isLoading) {
    return (
      <Card className="h-full">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Investment Comparison</h2>
          <div className="flex flex-wrap gap-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                value="returns"
                checked={selectedMetrics.includes('returns')}
                onChange={handleMetricChange}
                className="form-checkbox rounded bg-white/10 border-white/20"
              />
              <span className="text-sm">Returns</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                value="risk"
                checked={selectedMetrics.includes('risk')}
                onChange={handleMetricChange}
                className="form-checkbox rounded bg-white/10 border-white/20"
              />
              <span className="text-sm">Risk</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                value="sharpe"
                checked={selectedMetrics.includes('sharpe')}
                onChange={handleMetricChange}
                className="form-checkbox rounded bg-white/10 border-white/20"
              />
              <span className="text-sm">Sharpe Ratio</span>
            </label>
          </div>
        </div>
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Investment Comparison</h2>
        <div className="flex flex-wrap gap-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              value="returns"
              checked={selectedMetrics.includes('returns')}
              onChange={handleMetricChange}
              className="form-checkbox rounded bg-white/10 border-white/20"
            />
            <span className="text-sm">Returns</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              value="risk"
              checked={selectedMetrics.includes('risk')}
              onChange={handleMetricChange}
              className="form-checkbox rounded bg-white/10 border-white/20"
            />
            <span className="text-sm">Risk</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              value="sharpe"
              checked={selectedMetrics.includes('sharpe')}
              onChange={handleMetricChange}
              className="form-checkbox rounded bg-white/10 border-white/20"
            />
            <span className="text-sm">Sharpe Ratio</span>
          </label>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="text-left text-sm font-medium text-gray-400 px-2 py-2">Category</th>
              {comparisonData.metrics.map((metric, index) => (
                <th key={index} className="text-left text-sm font-medium text-gray-400 px-2 py-2">{metric.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comparisonData.categories.map((category, categoryIndex) => (
              <tr key={categoryIndex} className={categoryIndex % 2 === 0 ? 'bg-white/5' : ''}>
                <td className="text-sm font-medium px-2 py-2">{category}</td>
                {comparisonData.metrics.map((metric, metricIndex) => (
                  <td key={metricIndex} className="text-sm px-2 py-2">
                    <div className="flex items-center">
                      <span className="mr-2">{metric.data[categoryIndex]}</span>
                      <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${metric.color}`}
                          style={{ width: `${(metric.data[categoryIndex] / Math.max(...metric.data)) * 100}%` }}
                        />
                      </div>
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6">
        <h3 className="text-md font-medium mb-3">Platform Best Performance</h3>
        <div className="grid grid-cols-2 gap-3">
          {comparisonData.platforms.map((platform, index) => (
            <div key={index} className="p-2 bg-white/5 rounded-lg">
              <p className="text-sm font-medium">{platform.name}</p>
              <p className="text-xs text-gray-400">Best in: <span className="text-purple-400">{platform.bestPerforming}</span></p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default InvestmentComparison; 