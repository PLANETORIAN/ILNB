import React from 'react';
import PropTypes from 'prop-types';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import Card from '../common/Card';

const AssetChart = ({ asset, chartType = 'line' }) => {
  // Extract price history data based on asset type
  const priceData = asset.type === 'mutualFund' 
    ? asset.navHistory 
    : asset.priceHistory;
  
  // Format data for chart
  const chartData = priceData.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
    value: item.price || item.nav,
  }));

  // Determine color based on returns (green for positive, red for negative)
  const chartColor = asset.returns >= 0 ? '#4ADE80' : '#F87171';

  // Calculate min and max values for y-axis domain with some padding
  const minValue = Math.min(...chartData.map(d => d.value)) * 0.95;
  const maxValue = Math.max(...chartData.map(d => d.value)) * 1.05;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 p-2 rounded-md border border-gray-700 text-sm">
          <p className="font-medium">{label}</p>
          <p className="text-cyan-400">
            {asset.type === 'mutualFund' ? 'NAV: ' : 'Price: '}
            ₹{payload[0].value.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };
  
  CustomTooltip.propTypes = {
    active: PropTypes.bool,
    payload: PropTypes.array,
    label: PropTypes.string,
  };

  return (
    <Card className="h-full p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-medium text-lg">{asset.name}</h3>
          <p className="text-sm text-gray-400">{asset.symbol}</p>
        </div>
        <div className="text-right">
          <p className="font-medium text-lg">
            ₹{asset.currentValue.toLocaleString()}
          </p>
          <p className={`text-sm ${asset.returns >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {asset.returns >= 0 ? '+' : ''}{asset.returns}%
          </p>
        </div>
      </div>
      
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id={`gradient-${asset.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColor} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={chartColor} stopOpacity={0.1} />
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
                domain={[minValue, maxValue]}
                tick={{ fontSize: 10 }} 
                tickLine={false}
                axisLine={{ stroke: '#333' }}
                tickFormatter={value => `₹${value.toFixed(0)}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={chartColor} 
                fillOpacity={1} 
                fill={`url(#gradient-${asset.id})`} 
              />
            </AreaChart>
          ) : (
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 10 }} 
                tickLine={false}
                axisLine={{ stroke: '#333' }}
                tickMargin={5}
              />
              <YAxis 
                domain={[minValue, maxValue]}
                tick={{ fontSize: 10 }} 
                tickLine={false}
                axisLine={{ stroke: '#333' }}
                tickFormatter={value => `₹${value.toFixed(0)}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={chartColor} 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, fill: chartColor }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <div className="bg-gray-800/50 p-2 rounded">
          <p className="text-gray-400">Invested</p>
          <p className="font-medium">₹{asset.investedAmount.toLocaleString()}</p>
        </div>
        <div className="bg-gray-800/50 p-2 rounded">
          <p className="text-gray-400">
            {asset.type === 'stock' || asset.type === 'etf' ? 'Quantity' : 'Units'}
          </p>
          <p className="font-medium">
            {asset.quantity || asset.units}
          </p>
        </div>
      </div>
    </Card>
  );
};

AssetChart.propTypes = {
  asset: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    symbol: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    currentValue: PropTypes.number.isRequired,
    investedAmount: PropTypes.number.isRequired,
    returns: PropTypes.number.isRequired,
    quantity: PropTypes.number,
    units: PropTypes.number,
    priceHistory: PropTypes.arrayOf(
      PropTypes.shape({
        date: PropTypes.string.isRequired,
        price: PropTypes.number,
      })
    ),
    navHistory: PropTypes.arrayOf(
      PropTypes.shape({
        date: PropTypes.string.isRequired,
        nav: PropTypes.number,
      })
    ),
  }).isRequired,
  chartType: PropTypes.oneOf(['line', 'area']),
};

export default AssetChart; 