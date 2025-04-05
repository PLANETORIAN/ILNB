import api from './api';

const comparisonService = {
  // Compare multiple investments
  compareInvestments: async (investmentIds) => {
    try {
      const response = await api.comparison.compare(investmentIds);
      return response.data;
    } catch (error) {
      console.error('Failed to compare investments:', error);
      throw error;
    }
  },
  
  // Get AI-powered recommendations similar to an investment
  getRecommendations: async (investmentId) => {
    try {
      const response = await api.comparison.getRecommendations(investmentId);
      return response.data;
    } catch (error) {
      console.error(`Failed to get recommendations for investment ${investmentId}:`, error);
      throw error;
    }
  },
  
  // Helper methods for comparison visualizations
  generateComparisonMetrics: (items) => {
    if (!items || items.length < 2) {
      throw new Error('At least 2 items are required for comparison');
    }
    
    // Extract common comparison metrics
    const metrics = [
      { name: 'Returns (1 Year)', key: 'returns1Y', higher: true, format: 'percentage' },
      { name: 'Returns (3 Years)', key: 'returns3Y', higher: true, format: 'percentage' },
      { name: 'Returns (5 Years)', key: 'returns5Y', higher: true, format: 'percentage' },
      { name: 'Risk Level', key: 'riskScore', higher: false, format: 'score' },
      { name: 'Expense Ratio', key: 'expenseRatio', higher: false, format: 'percentage' },
      { name: 'Fund Size', key: 'fundSize', higher: true, format: 'currency' },
      { name: 'Min Investment', key: 'minInvestment', higher: false, format: 'currency' },
    ];
    
    // Calculate best values for each metric
    const results = metrics.map(metric => {
      const values = items.map(item => ({
        name: item.name,
        value: item[metric.key],
      }));
      
      // Find best value (highest or lowest based on metric preference)
      const bestValue = metric.higher 
        ? Math.max(...values.map(v => v.value))
        : Math.min(...values.map(v => v.value));
      
      // Find the item with the best value
      const bestItem = values.find(v => v.value === bestValue);
      
      return {
        ...metric,
        items: values,
        bestValue,
        bestItem: bestItem ? bestItem.name : null,
      };
    });
    
    return results;
  },
  
  // Format comparison data for visualization
  formatForVisualization: (comparisonData) => {
    // Structure data for radar chart, bar charts, etc.
    const formattedData = {
      radar: [],
      returns: [],
      risk: [],
      summary: []
    };
    
    // Create data structure for charts
    comparisonData.items.forEach(item => {
      // Data for radar chart
      formattedData.radar.push({
        name: item.name,
        returns: item.returns1Y,
        risk: 10 - item.riskScore, // Invert so lower risk is better
        expense: 10 - (item.expenseRatio * 100), // Invert so lower expense is better
        size: item.fundSize / 1000000, // Normalize fund size to millions
        rating: item.rating,
      });
      
      // Data for returns chart
      formattedData.returns.push({
        name: item.name,
        '1Y': item.returns1Y,
        '3Y': item.returns3Y,
        '5Y': item.returns5Y,
      });
      
      // Summary data
      formattedData.summary.push({
        name: item.name,
        returns1Y: item.returns1Y,
        riskLevel: item.riskLevel,
        expenseRatio: item.expenseRatio,
        fundManager: item.fundManager,
        rating: item.rating,
        recommendation: comparisonData.recommendations[item.id] || 'No specific recommendation',
      });
    });
    
    return formattedData;
  },
};

export default comparisonService;   