import { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import Card from '@/components/common/Card';
import { Search, X, Star, StarHalf } from 'lucide-react';
import axios from 'axios';
import AssetChart from '@/components/dashboard/AssetChart';
import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Area } from 'recharts';

// Star Rating Component
const StarRating = ({ rating, size = 16 }) => {
  console.log('StarRating component received rating:', rating, typeof rating);
  const numericRating = parseFloat(rating);
  const stars = [];
  
  // Always render exactly 5 stars
  for (let i = 1; i <= 5; i++) {
    if (i <= numericRating) {
      // Full star
      stars.push(
        <Star 
          key={`star-${i}`} 
          size={size} 
          className="text-yellow-400 fill-yellow-400" 
        />
      );
    } else if (i - 0.5 <= numericRating) {
      // Half star
      stars.push(
        <StarHalf 
          key={`star-${i}`} 
          size={size} 
          className="text-yellow-400 fill-yellow-400" 
        />
      );
    } else {
      // Empty star
      stars.push(
        <Star 
          key={`star-${i}`} 
          size={size} 
          className="text-gray-400" 
        />
      );
    }
  }
  
  return (
    <div className="flex items-center gap-0.5">
      {stars}
    </div>
  );
};

function Compare() {
  console.log('Compare component rendering');
  
  const [isLoading, setIsLoading] = useState(false);
  const { isDarkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStocks, setSelectedStocks] = useState([]);
  const [stockData, setStockData] = useState([]);
  const [error, setError] = useState(null);
  const [pendingSymbols, setPendingSymbols] = useState([]);
  const [correlations, setCorrelations] = useState([]);
  const [marketIndex, setMarketIndex] = useState(null);
  const [apiStatus, setApiStatus] = useState('checking'); // 'checking', 'working', 'error'

  // Parse input for multiple symbols
  const parseSymbols = (input) => {
    return input.toUpperCase().split(/[,\s]+/).filter(Boolean);
  };

  // Calculate standard deviation
  const calculateStandardDeviation = (values) => {
    if (!values || values.length < 2) return 0;
    
    // Calculate log returns: ln(price_t / price_{t-1})
    const logReturns = [];
    for (let i = 1; i < values.length; i++) {
      logReturns.push(Math.log(values[i] / values[i-1]));
    }
    
    // Calculate mean of log returns
    const mean = logReturns.reduce((sum, val) => sum + val, 0) / logReturns.length;
    
    // Calculate sum of squared differences from mean
    const squaredDifferences = logReturns.map(val => Math.pow(val - mean, 2));
    
    // Calculate variance
    const variance = squaredDifferences.reduce((sum, val) => sum + val, 0) / (logReturns.length - 1);
    
    // Calculate standard deviation
    const stdDev = Math.sqrt(variance);
    
    // Annualize (assuming daily data, multiply by sqrt of trading days in a year)
    const annualizedStdDev = stdDev * Math.sqrt(252);
    
    // Convert to percentage
    return annualizedStdDev * 100;
  };

  // Calculate raw standard deviation
  const calculateRawStandardDeviation = (values) => {
    if (!values || values.length < 2) return 0;
    
    // Calculate log returns: ln(price_t / price_{t-1})
    const logReturns = [];
    for (let i = 1; i < values.length; i++) {
      logReturns.push(Math.log(values[i] / values[i-1]));
    }
    
    // Calculate mean of log returns
    const mean = logReturns.reduce((sum, val) => sum + val, 0) / logReturns.length;
    
    // Calculate sum of squared differences from mean
    const squaredDifferences = logReturns.map(val => Math.pow(val - mean, 2));
    
    // Calculate variance
    const variance = squaredDifferences.reduce((sum, val) => sum + val, 0) / (logReturns.length - 1);
    
    // Calculate standard deviation
    const stdDev = Math.sqrt(variance);
    
    return stdDev;
  };

  // Calculate mean of the values
  const calculateMean = (values) => {
    if (!values || values.length === 0) return 0;
    const sum = values.reduce((total, value) => total + value, 0);
    return sum / values.length;
  };

  // Calculate returns from prices
  const calculateReturns = (prices) => {
    if (!prices || prices.length < 2) return [];
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      // Using simple returns instead of log returns for alpha calculation
      returns.push((prices[i] - prices[i-1]) / prices[i-1]);
    }
    return returns;
  };

  // Calculate beta (requires market index data)
  const calculateBeta = (stockPrices, marketPrices) => {
    if (!stockPrices || !marketPrices || stockPrices.length < 2 || marketPrices.length < 2) return 0;
    
    try {
      // Calculate returns
      const stockReturns = calculateReturns(stockPrices);
      const marketReturns = calculateReturns(marketPrices);
      
      // Use the smaller length
      const length = Math.min(stockReturns.length, marketReturns.length);
      
      // Trim arrays to same length
      const trimmedStockReturns = stockReturns.slice(0, length);
      const trimmedMarketReturns = marketReturns.slice(0, length);
      
      // Calculate covariance and market variance
      let sumCov = 0;
      let sumMarketVar = 0;
      
      // Calculate means
      const stockMean = trimmedStockReturns.reduce((sum, val) => sum + val, 0) / length;
      const marketMean = trimmedMarketReturns.reduce((sum, val) => sum + val, 0) / length;
      
      for (let i = 0; i < length; i++) {
        sumCov += (trimmedStockReturns[i] - stockMean) * (trimmedMarketReturns[i] - marketMean);
        sumMarketVar += Math.pow(trimmedMarketReturns[i] - marketMean, 2);
      }
      
      const covariance = sumCov / length;
      const marketVariance = sumMarketVar / length;
      
      // Calculate beta = covariance / market variance
      const beta = covariance / marketVariance;
      
      console.log('Beta calculation:', {
        covariance,
        marketVariance,
        beta
      });
      
      return beta;
    } catch (error) {
      console.error('Error calculating beta:', error);
      return 1.0; // Default to market beta on error
    }
  };

  // Calculate alpha (Jensen's Alpha)
  const calculateAlpha = (stockPrices, marketPrices) => {
    if (!stockPrices || !marketPrices || stockPrices.length < 2 || marketPrices.length < 2) {
      console.log('Invalid input data for alpha calculation');
      return 1.00;
    }
    
    try {
      // Calculate daily returns
      const stockReturns = calculateReturns(stockPrices);
      const marketReturns = calculateReturns(marketPrices);
      
      // Debug log the returns
      console.log('Stock returns length:', stockReturns.length);
      console.log('Market returns length:', marketReturns.length);
      
      // Use the smaller length
      const length = Math.min(stockReturns.length, marketReturns.length);
      
      // Trim arrays to same length
      const trimmedStockReturns = stockReturns.slice(0, length);
      const trimmedMarketReturns = marketReturns.slice(0, length);
      
      // Calculate average daily returns
      const avgStockReturn = trimmedStockReturns.reduce((sum, val) => sum + val, 0) / length;
      const avgMarketReturn = trimmedMarketReturns.reduce((sum, val) => sum + val, 0) / length;
      
      // Debug log average returns
      console.log('Average stock return:', avgStockReturn);
      console.log('Average market return:', avgMarketReturn);
      
      // Calculate daily risk-free rate (assuming 3% annual risk-free rate)
      const annualRiskFreeRate = 0.03; // 3% annual risk-free rate
      const dailyRiskFreeRate = Math.pow(1 + annualRiskFreeRate, 1/252) - 1;
      
      // Calculate beta using daily returns
      let sumCov = 0;
      let sumMarketVar = 0;
      
      // Calculate means
      const stockMean = trimmedStockReturns.reduce((sum, val) => sum + val, 0) / length;
      const marketMean = trimmedMarketReturns.reduce((sum, val) => sum + val, 0) / length;
      
      for (let i = 0; i < length; i++) {
        sumCov += (trimmedStockReturns[i] - stockMean) * (trimmedMarketReturns[i] - marketMean);
        sumMarketVar += Math.pow(trimmedMarketReturns[i] - marketMean, 2);
      }
      
      const beta = sumCov / sumMarketVar;
      
      // Debug log beta
      console.log('Calculated beta for alpha:', beta);
      
      // Calculate daily alpha
      const dailyAlpha = avgStockReturn - (dailyRiskFreeRate + beta * (avgMarketReturn - dailyRiskFreeRate));
      
      // Debug log daily alpha
      console.log('Daily alpha:', dailyAlpha);
      
      // Annualize alpha and convert to 1.xx format
      const annualizedAlpha = 1 + (dailyAlpha * 252);
      
      // Debug log final alpha
      console.log('Final alpha (1.xx format):', annualizedAlpha);
      
      return annualizedAlpha;
    } catch (error) {
      console.error('Error calculating alpha:', error);
      return 1.00; // Default to neutral alpha on error
    }
  };

  // Test API connection
  const testApiConnection = async () => {
    try {
      console.log('Testing API connection...');
      setApiStatus('checking');
      const response = await axios.get('https://stock-server-j29j.onrender.com/stock/AAPL');
      console.log('API test successful:', response.data);
      setApiStatus('working');
      return true;
    } catch (err) {
      console.error('API test failed:', err);
      setApiStatus('error');
      return false;
    }
  };

  // Load market index data (using ^NSEI as default for India/NSE)
  useEffect(() => {
    async function fetchMarketIndex() {
      try {
        // Test API connection first
        const apiWorking = await testApiConnection();
        if (!apiWorking) {
          console.error('API connection test failed. Stock data may not be available.');
          setError('Unable to connect to the stock data service. Please try again later.');
          return;
        }
        
        // Using NIFTY 50 as the market index
        const response = await axios.get('https://stock-server-j29j.onrender.com/stock/^NSEI');
        const indexPrices = response.data.data.map(day => day.Close);
        
        setMarketIndex({
          symbol: '^NSEI',
          name: 'NIFTY 50',
          prices: indexPrices,
          priceHistory: response.data.data.map(item => ({
            date: new Date(item.Date).toLocaleDateString(),
            price: item.Close
          })).reverse()
        });
      } catch (err) {
        console.error('Error fetching market index:', err);
        // Try S&P 500 for US stocks as fallback
        try {
          const response = await axios.get('https://stock-server-j29j.onrender.com/stock/^GSPC');
          const indexPrices = response.data.data.map(day => day.Close);
          
          setMarketIndex({
            symbol: '^GSPC',
            name: 'S&P 500',
            prices: indexPrices,
            priceHistory: response.data.data.map(item => ({
              date: new Date(item.Date).toLocaleDateString(),
              price: item.Close
            })).reverse()
          });
        } catch (err2) {
          console.error('Error fetching fallback market index:', err2);
        }
      }
    }
    
    fetchMarketIndex();
  }, []);

  // Calculate trust score based on various metrics
  const calculateTrustScore = (stock) => {
    let score = 0;
    
    try {
      // Base score of 3.0 for being a listed stock
      score = 3.0;

      // Alpha contribution (max 1.0 points)
      const alpha = parseFloat(stock.alpha) || 1.0;
      if (alpha > 1.10) score += 1.0;
      else if (alpha > 1.05) score += 0.8;
      else if (alpha > 1.00) score += 0.6;
      else if (alpha < 0.90) score -= 0.8; // Severe penalty for very poor performance
      else if (alpha < 0.95) score -= 0.5; // Penalty for poor performance

      // Beta contribution (max 0.5 points)
      const beta = parseFloat(stock.beta) || 1.0;
      const betaDiff = Math.abs(1 - beta);
      if (betaDiff < 0.1) score += 0.5;
      else if (betaDiff < 0.2) score += 0.3;
      else if (betaDiff < 0.3) score += 0.2;
      else if (betaDiff > 0.5) score -= 0.3; // Penalty for high volatility difference

      // Volatility contribution (max 0.25 points)
      const volatility = parseFloat(stock.volatility) || 0;
      if (volatility < 15) score += 0.25;
      else if (volatility < 20) score += 0.2;
      else if (volatility < 25) score += 0.1;
      else if (volatility > 35) score -= 0.2; // Penalty for very high volatility

      // Return contribution (max 0.25 points, with more balanced penalties)
      const change = parseFloat(stock.change) || 0;
      if (change > 20) score += 0.25;
      else if (change > 10) score += 0.2;
      else if (change > 0) score += 0.1;
      else if (change < -20) score -= 0.3; // Larger penalty for severe negative returns
      else if (change < -10) score -= 0.2; // Moderate penalty for significant negative returns

      // Market Cap consideration - bonus for large-cap stability
      const marketCap = parseFloat(stock.marketCap) || 0;
      if (marketCap > 100000) score += 0.3; // Significant bonus for very large-cap stocks
      else if (marketCap > 50000) score += 0.2; // Moderate bonus for large-cap stocks
      else if (marketCap > 25000) score += 0.1; // Small bonus for mid-cap stocks

      // Risk-Adjusted Return consideration (max 0.2 points)
      const riskAdjustedReturn = parseFloat(stock.riskAdjustedReturn) || 1.0;
      if (riskAdjustedReturn > 1.1) score += 0.2;
      else if (riskAdjustedReturn > 1.05) score += 0.15;
      else if (riskAdjustedReturn > 1.0) score += 0.1;
      else if (riskAdjustedReturn < 0.9) score -= 0.2;

      console.log('Trust Score Calculation:', {
        symbol: stock.symbol,
        baseScore: 3.0,
        alpha: `${alpha} (${alpha > 1.0 ? '+' : ''}${((alpha - 1) * 100).toFixed(1)}%)`,
        beta: `${beta} (diff: ${betaDiff.toFixed(2)})`,
        volatility: `${volatility}%`,
        change: `${change}%`,
        marketCap: `${(marketCap / 1000).toFixed(1)}B`,
        riskAdjustedReturn: riskAdjustedReturn,
        finalScore: score
      });

    } catch (error) {
      console.error('Error calculating trust score:', error);
      score = 3.0; // Default to neutral score on error
    }

    // Ensure score stays within 1-5 range
    score = Math.min(5, Math.max(1, score));
    
    // Return the exact score for display and the numeric value for stars
    return {
      score: score.toFixed(2),
      starRating: score // Use the exact score for the StarRating component
    };
  };

  // Generate star display with half stars
  const renderStars = (rating) => {
    console.log('Rendering stars for rating:', rating, typeof rating);
    return <StarRating rating={parseFloat(rating)} size={20} />;
  };

  // Update beta and alpha values when market index changes
  useEffect(() => {
    if (marketIndex && stockData.length > 0) {
      console.log('Updating stock data with market index');
      
      try {
        const updatedStockData = stockData.map(stock => {
          try {
            // Extract raw price values from price history
            const stockPrices = stock.priceHistory.map(item => item.price).reverse();
            const beta = calculateBeta(stockPrices, marketIndex.prices);
            const alpha = calculateAlpha(stockPrices, marketIndex.prices);
            
            // Format values
            const formattedAlpha = alpha.toFixed(3);
            const formattedBeta = beta.toFixed(2);
            const riskAdjustedReturn = (alpha * (1 + 0.03)).toFixed(3);
            
            // Calculate trust score with updated metrics
            const updatedStock = {
              ...stock,
              beta: formattedBeta,
              alpha: formattedAlpha,
              riskAdjustedReturn
            };
            
            const trustScore = calculateTrustScore(updatedStock);
            
            console.log('Updated metrics for', stock.symbol, {
              beta: formattedBeta,
              alpha: formattedAlpha,
              trustScore
            });

            return {
              ...updatedStock,
              trustScore: trustScore.score,
              starRating: trustScore.starRating
            };
          } catch (err) {
            console.error(`Error updating metrics for ${stock.symbol}:`, err);
            return stock; // Return original stock data on error
          }
        });
        
        setStockData(updatedStockData);
      } catch (err) {
        console.error('Error updating stock data with market index:', err);
      }
    }
  }, [marketIndex]);

  // Fetch stock data
  const fetchStockData = async (symbol) => {
    setIsLoading(true);
    setError(null);
    console.log(`Attempting to fetch data for symbol: ${symbol}`);
    
    try {
      // Try Indian stock format first (.NS suffix)
      try {
        console.log(`Trying Indian stock format: ${symbol}.NS`);
        const response = await axios.get(`https://stock-server-j29j.onrender.com/stock/${symbol}.NS`);
        
        if (!response.data || !response.data.data || response.data.data.length === 0) {
          console.error(`No data returned for ${symbol}.NS`);
          throw new Error(`No data available for ${symbol}.NS`);
        }
        
        console.log(`Successfully fetched data for ${symbol}.NS:`, response.data);
        
        // Calculate standard deviation of prices over the period
        const prices = response.data.data.map(day => day.Close);
        
        // Calculate volatility and standard deviation
        const volatility = calculateStandardDeviation(prices);
        const rawStdDev = calculateRawStandardDeviation(prices);
        
        // Calculate mean price
        const meanPrice = calculateMean(prices);
        
        // Calculate beta and alpha if market index is available
        let beta = 1.000;
        let alpha = 1.000;
        if (marketIndex) {
          console.log('Calculating beta and alpha with market index:', marketIndex.symbol);
          beta = calculateBeta(prices, marketIndex.prices);
          alpha = calculateAlpha(prices, marketIndex.prices);
        }
        
        const initialStockInfo = {
          id: symbol,
          symbol: symbol,
          name: response.data.name,
          sector: response.data.sector,
          marketCap: response.data.market_cap,
          currentPrice: response.data.live_price,
          currentValue: response.data.live_price,
          investedAmount: response.data.live_price,
          quantity: 1,
          volatility: volatility.toFixed(2),
          stdDev: rawStdDev.toFixed(3),
          meanPrice: meanPrice.toFixed(2),
          beta: beta.toFixed(2),
          alpha: alpha.toFixed(3),
          change: response.data.data.length >= 2 
            ? ((response.data.live_price - response.data.data[1].Close) / response.data.data[1].Close * 100).toFixed(2)
            : '0.00',
          volume: response.data.data[0]?.Volume || 0,
          priceHistory: response.data.data.map(item => ({
            date: new Date(item.Date).toLocaleDateString(),
            price: item.Close
          })).reverse()
        };
        
        // Calculate initial trust score
        const trustScore = calculateTrustScore(initialStockInfo);
        const stockInfo = {
          ...initialStockInfo,
          trustScore: trustScore.score,
          starRating: trustScore.starRating
        };
        
        console.log('Stock info with trust score:', {
          symbol,
          trustScore: trustScore.score,
          starRating: trustScore.starRating
        });
        
        setStockData(prev => [...prev, stockInfo]);
        return true;
      } catch (err) {
        console.error(`Error fetching Indian stock ${symbol}.NS:`, err);
        
        // If Indian stock format fails, try without .NS suffix for US stocks
        try {
          console.log(`Trying US stock format: ${symbol}`);
          const response = await axios.get(`https://stock-server-j29j.onrender.com/stock/${symbol}`);
          
          if (!response.data || !response.data.data || response.data.data.length === 0) {
            console.error(`No data returned for ${symbol}`);
            throw new Error(`No data available for ${symbol}`);
          }
          
          console.log(`Successfully fetched data for ${symbol}:`, response.data);
          
          // Calculate standard deviation of prices over the period
          const prices = response.data.data.map(day => day.Close);
          
          // Calculate volatility and standard deviation
          const volatility = calculateStandardDeviation(prices);
          const rawStdDev = calculateRawStandardDeviation(prices);
          
          // Calculate mean price
          const meanPrice = calculateMean(prices);
          
          // Calculate beta and alpha if market index is available
          let beta = 0;
          let alpha = 0;
          if (marketIndex) {
            beta = calculateBeta(prices, marketIndex.prices);
            alpha = calculateAlpha(prices, marketIndex.prices);
          }
          
          const stockInfo = {
            id: symbol,
            symbol: symbol,
            name: response.data.name,
            sector: response.data.sector,
            marketCap: response.data.market_cap,
            currentPrice: response.data.live_price,
            currentValue: response.data.live_price,
            investedAmount: response.data.live_price,
            quantity: 1,
            volatility: volatility.toFixed(2), // Actual calculated volatility
            stdDev: rawStdDev.toFixed(4), // Actual calculated std dev
            meanPrice: meanPrice.toFixed(2), // Average price
            beta: beta.toFixed(2),
            alpha: alpha.toFixed(3),
            change: response.data.data.length >= 2 
              ? ((response.data.live_price - response.data.data[1].Close) / response.data.data[1].Close * 100).toFixed(2)
              : '0.00',
            volume: response.data.data[0]?.Volume || 0,
            priceHistory: response.data.data.map(item => ({
              date: new Date(item.Date).toLocaleDateString(),
              price: item.Close
            })).reverse()
          };
          
          // Calculate trust score for US stock
          const trustScore = calculateTrustScore(stockInfo);
          const stockInfoWithTrust = {
            ...stockInfo,
            trustScore: trustScore.score,
            starRating: trustScore.starRating
          };
          
          console.log('US Stock info with trust score:', {
            symbol,
            trustScore: trustScore.score,
            starRating: trustScore.starRating
          });
          
          setStockData(prev => [...prev, stockInfoWithTrust]);
          return true;
        } catch (usErr) {
          console.error(`Error fetching US stock ${symbol}:`, usErr);
          throw usErr;
        }
      }
    } catch (err) {
      const errorMessage = `Failed to fetch data for ${symbol}. Please make sure you've entered a valid stock symbol.`;
      console.error(errorMessage, err);
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate correlation between two stocks
  const calculateCorrelation = (stockA, stockB) => {
    // Get the price histories of both stocks
    const pricesA = stockA.priceHistory.map(day => day.price);
    const pricesB = stockB.priceHistory.map(day => day.price);
    
    // We need at least 2 data points to calculate correlation
    if (pricesA.length < 2 || pricesB.length < 2) return 0;
    
    // Use the shorter of the two arrays
    const length = Math.min(pricesA.length, pricesB.length);
    
    // Calculate log returns
    const returnsA = [];
    const returnsB = [];
    
    for (let i = 1; i < length; i++) {
      returnsA.push(Math.log(pricesA[i] / pricesA[i-1]));
      returnsB.push(Math.log(pricesB[i] / pricesB[i-1]));
    }
    
    // Calculate means
    const meanA = returnsA.reduce((sum, val) => sum + val, 0) / returnsA.length;
    const meanB = returnsB.reduce((sum, val) => sum + val, 0) / returnsB.length;
    
    // Calculate covariance and variances
    let covariance = 0;
    let varianceA = 0;
    let varianceB = 0;
    
    for (let i = 0; i < returnsA.length; i++) {
      covariance += (returnsA[i] - meanA) * (returnsB[i] - meanB);
      varianceA += Math.pow(returnsA[i] - meanA, 2);
      varianceB += Math.pow(returnsB[i] - meanB, 2);
    }
    
    covariance /= returnsA.length;
    varianceA /= returnsA.length;
    varianceB /= returnsB.length;
    
    // Calculate correlation
    const correlation = covariance / (Math.sqrt(varianceA) * Math.sqrt(varianceB));
    
    return correlation;
  };

  // Update correlations when stock data changes
  useEffect(() => {
    if (stockData.length >= 2) {
      const newCorrelations = [];
      
      for (let i = 0; i < stockData.length; i++) {
        for (let j = i + 1; j < stockData.length; j++) {
          const stockA = stockData[i];
          const stockB = stockData[j];
          const correlation = calculateCorrelation(stockA, stockB);
          
          newCorrelations.push({
            stockA: stockA.symbol,
            stockB: stockB.symbol,
            correlation: correlation
          });
        }
      }
      
      setCorrelations(newCorrelations);
    } else {
      setCorrelations([]);
    }
  }, [stockData]);

  // Handle compare button click
  const handleCompare = async () => {
    const symbols = parseSymbols(searchQuery);
    if (symbols.length === 0) {
      setError('Please enter stock symbols to compare');
      return;
    }

    setIsLoading(true);
    setError(null);
    const newStocks = [];
    let successCount = 0;

    for (const symbol of symbols) {
      if (selectedStocks.includes(symbol)) {
        console.log(`Skipping already selected stock: ${symbol}`);
        continue; // Skip already selected stocks
      }
      console.log(`Processing symbol: ${symbol}`);
      const success = await fetchStockData(symbol);
      if (success) {
        newStocks.push(symbol);
        successCount++;
      }
    }

    if (successCount === 0 && symbols.length > 0) {
      setError(`Failed to fetch data for any of the symbols. Please check your input and try again.`);
    } else if (successCount < symbols.length) {
      setError(`Successfully added ${successCount} of ${symbols.length} symbols. Some symbols may not be available.`);
    }

    setSelectedStocks(prev => [...prev, ...newStocks]);
    setSearchQuery('');
  };

  // Remove stock from comparison
  const removeStock = (symbol) => {
    setSelectedStocks(prev => prev.filter(s => s !== symbol));
    setStockData(prev => prev.filter(stock => stock.symbol !== symbol));
  };

  return (
    <div className="pt-20 px-2 max-w-full mx-auto">
      <div className="mb-6 max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-4 animate-fade-in bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
          Compare Stocks
        </h1>
        <p className="text-gray-400">Enter any stock symbols to compare (e.g., RELIANCE, TCS for Indian stocks or AAPL, GOOGL for US stocks)</p>
        <p className="text-sm text-gray-500 mt-2">Tip: You can enter multiple symbols at once, separated by commas</p>
        
        {/* API Status Indicator */}
        <div className="mt-2 flex items-center">
          <span className="text-sm mr-2">Service Status:</span>
          {apiStatus === 'checking' && (
            <span className="text-yellow-400 text-sm flex items-center">
              <span className="w-2 h-2 bg-yellow-400 rounded-full mr-1 animate-pulse"></span>
              Checking...
            </span>
          )}
          {apiStatus === 'working' && (
            <span className="text-green-400 text-sm flex items-center">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
              Ready
            </span>
          )}
          {apiStatus === 'error' && (
            <div className="flex items-center">
              <span className="text-red-400 text-sm flex items-center mr-2">
                <span className="w-2 h-2 bg-red-400 rounded-full mr-1"></span>
                Connection Error
              </span>
              <button 
                onClick={testApiConnection}
                className="text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 px-2 py-1 rounded"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto">
        <Card className="glass-effect p-4 mb-6">
          <div className="relative">
            <div className="flex items-center gap-4">
              <div className="flex-1 bg-white/5 rounded-lg px-4 py-2 flex items-center">
                <Search className="w-5 h-5 text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder="Type stock symbols here..."
                  className="bg-transparent w-full focus:outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCompare();
                    }
                  }}
                />
              </div>
              <button
                onClick={handleCompare}
                disabled={isLoading}
                className={`px-6 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 transition-colors ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Loading...' : 'Compare'}
              </button>
            </div>
          </div>
        </Card>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 text-red-400">
            {error}
          </div>
        )}

        {/* Stock Relationships */}
        {correlations.length > 0 && (
          <Card className="p-4 mb-6">
            <h3 className="text-xl font-bold mb-4">How These Stocks Move Together</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {correlations.map((corr, index) => (
                <div key={index} className="bg-white/5 p-3 rounded-lg">
                  <p className="text-sm">{corr.stockA} & {corr.stockB}</p>
                  <p className={`text-lg font-medium ${
                    corr.correlation > 0.7 ? 'text-red-400' : 
                    corr.correlation > 0.3 ? 'text-yellow-400' : 
                    corr.correlation > -0.3 ? 'text-gray-400' : 
                    corr.correlation > -0.7 ? 'text-cyan-400' : 'text-green-400'
                  }`}>
                    {corr.correlation > 0.7 ? 'Move very similarly' : 
                     corr.correlation > 0.3 ? 'Move somewhat similarly' : 
                     corr.correlation > -0.3 ? 'Move independently' : 
                     corr.correlation > -0.7 ? 'Move somewhat opposite' : 'Move very opposite'}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Stock Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 mb-8">
          {stockData.map((stock) => (
            <Card key={stock.symbol} className="p-3 relative overflow-hidden">
              <button
                onClick={() => removeStock(stock.symbol)}
                className="absolute top-2 right-2 p-1 hover:bg-white/10 rounded-full"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
              
              <div className="mb-3">
                <h3 className="text-xl font-bold truncate">{stock.name}</h3>
                <p className="text-gray-400">{stock.symbol}</p>
                {stock.sector && (
                  <p className="text-sm text-gray-500 mt-1 truncate">Industry: {stock.sector}</p>
                )}
              </div>

              {/* Price Chart */}
              <div className="h-[180px] mb-3">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stock.priceHistory} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                    <defs>
                      <linearGradient id={`gradient-${stock.symbol}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={parseFloat(stock.change) >= 0 ? '#4ADE80' : '#F87171'} stopOpacity={0.8} />
                        <stop offset="95%" stopColor={parseFloat(stock.change) >= 0 ? '#4ADE80' : '#F87171'} stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 9 }} 
                      tickLine={false}
                      axisLine={{ stroke: '#333' }}
                      tickMargin={5}
                    />
                    <YAxis 
                      tick={{ fontSize: 9 }} 
                      tickLine={false}
                      axisLine={{ stroke: '#333' }}
                      tickFormatter={value => `₹${value.toFixed(0)}`}
                    />
                    <Tooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-gray-800 p-2 rounded-md border border-gray-700 text-sm">
                              <p className="font-medium">{label}</p>
                              <p className="text-cyan-400">
                                Price: ₹{payload[0].value.toFixed(2)}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="price" 
                      stroke={parseFloat(stock.change) >= 0 ? '#4ADE80' : '#F87171'} 
                      fillOpacity={1} 
                      fill={`url(#gradient-${stock.symbol})`} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Stock Details */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-400">Current Price</p>
                    <p className="font-medium">₹{stock.currentPrice.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Price Change</p>
                    <p className={`font-medium ${parseFloat(stock.change) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {parseFloat(stock.change) >= 0 ? '↑' : '↓'} {Math.abs(parseFloat(stock.change))}%
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-400 mb-1">Market Performance</p>
                  <p className={`font-medium ${
                    parseFloat(stock.alpha) > 1.10 ? 'text-green-400' : 
                    parseFloat(stock.alpha) > 1.00 ? 'text-cyan-400' : 
                    parseFloat(stock.alpha) > 0.90 ? 'text-yellow-400' : 
                    'text-red-400'
                  }`}>
                    {parseFloat(stock.alpha) > 1.10 ? 'Significantly outperforming the market' :
                     parseFloat(stock.alpha) > 1.00 ? 'Slightly outperforming the market' :
                     parseFloat(stock.alpha) > 0.90 ? 'Slightly underperforming the market' :
                     'Significantly underperforming the market'}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400 mb-1">Risk Level</p>
                  <p className={`font-medium ${
                    parseFloat(stock.volatility) < 20 ? 'text-green-400' : 
                    parseFloat(stock.volatility) < 30 ? 'text-cyan-400' : 
                    parseFloat(stock.volatility) < 40 ? 'text-yellow-400' : 
                    'text-red-400'
                  }`}>
                    {parseFloat(stock.volatility) < 20 ? 'Low risk' :
                     parseFloat(stock.volatility) < 30 ? 'Moderate risk' :
                     parseFloat(stock.volatility) < 40 ? 'High risk' :
                     'Very high risk'} 
                    ({stock.volatility}% price swings)
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400 mb-1">Market Movement</p>
                  <p className={`font-medium ${
                    parseFloat(stock.beta) < 0.8 ? 'text-green-400' : 
                    parseFloat(stock.beta) < 1.2 ? 'text-cyan-400' : 
                    'text-yellow-400'
                  }`}>
                    {parseFloat(stock.beta) < 0.8 ? 'More stable than the market' :
                     parseFloat(stock.beta) < 1.2 ? 'Moves with the market' :
                     'More volatile than the market'}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400 mb-1">Company Size</p>
                  <p className="font-medium">
                    {parseFloat(stock.marketCap) > 100000 ? 'Very Large Company' :
                     parseFloat(stock.marketCap) > 50000 ? 'Large Company' :
                     parseFloat(stock.marketCap) > 10000 ? 'Medium Company' :
                     'Small Company'} 
                    (₹{(stock.marketCap / 1e9).toFixed(1)}B)
                  </p>
                </div>

                <div className="bg-gray-800/50 p-3 rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">Overall Rating</p>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      {renderStars(stock.starRating)}
                      <p className="text-xs text-gray-400">
                        {parseFloat(stock.trustScore) >= 4.5 ? 'Excellent Investment' :
                         parseFloat(stock.trustScore) >= 3.5 ? 'Good Investment' :
                         parseFloat(stock.trustScore) >= 2.5 ? 'Average Investment' :
                         parseFloat(stock.trustScore) >= 1.5 ? 'Risky Investment' :
                         'Very Risky Investment'}
                      </p>
                    </div>
                    <div className="text-xs text-gray-500">
                      <p>Based on:</p>
                      <ul className="list-disc list-inside pl-2 mt-1 text-xs">
                        <li>Market Performance</li>
                        <li>Risk Level</li>
                        <li>Price Stability</li>
                        <li>Historical Returns</li>
                        {parseFloat(stock.marketCap) > 50000 && <li>Company Size Advantage</li>}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

export default Compare;