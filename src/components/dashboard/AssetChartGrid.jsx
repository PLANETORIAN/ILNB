import React, { useState, useEffect } from 'react';
import AssetChart from './AssetChart';
import { assets as assetsData } from '../../data/assetsData.json';

const AssetChartGrid = () => {
  const [assets, setAssets] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [chartType, setChartType] = useState('area');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAssets = async () => {
      setIsLoading(true);
      try {
        // In a real app, we would fetch from API
        // const response = await api.assets.getAll();
        // setAssets(response.data);
        
        // Using dummy data for now
        const combinedAssets = [
          ...assetsData.stocks,
          ...assetsData.mutualFunds,
          ...assetsData.etfs,
          ...assetsData.bonds,
          ...assetsData.crypto
        ];
        setAssets(combinedAssets);
      } catch (error) {
        console.error('Error fetching assets:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssets();
  }, []);

  // Filter assets based on selected type
  const filteredAssets = filterType === 'all' 
    ? assets 
    : assets.filter(asset => asset.type === filterType);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Portfolio Performance</h2>
        <div className="flex space-x-2">
          <select
            className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-sm focus:outline-none focus:border-purple-500"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Assets</option>
            <option value="stock">Stocks</option>
            <option value="mutualFund">Mutual Funds</option>
            <option value="etf">ETFs</option>
            <option value="bond">Bonds</option>
            <option value="crypto">Crypto</option>
          </select>
          <select
            className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-sm focus:outline-none focus:border-purple-500"
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
          >
            <option value="area">Area Chart</option>
            <option value="line">Line Chart</option>
          </select>
        </div>
      </div>

      {filteredAssets.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-400">No assets found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssets.map(asset => (
            <AssetChart 
              key={asset.id} 
              asset={asset} 
              chartType={chartType}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AssetChartGrid; 