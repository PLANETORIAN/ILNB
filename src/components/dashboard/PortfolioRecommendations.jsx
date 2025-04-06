import React, { useState, useEffect } from 'react';
import { useUserInvestments } from '../../context/UserInvestmentsContext';
import { TrendingUp, AlertTriangle, Info, Shield, ChevronDown, ChevronUp, Star, Check, AlertCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const PortfolioRecommendations = () => {
  const { userInvestments, setUserInvestments } = useUserInvestments();
  const [stockRecommendations, setStockRecommendations] = useState([]);
  const [analysis, setAnalysis] = useState({});
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [addingStock, setAddingStock] = useState(null);

  // Sample stock data for recommendations
  const stockUniverse = [
    { name: "HDFC Bank", symbol: "HDFCBANK", sector: "Banking", growth: "high", risk: "medium", description: "One of India's largest private banks with strong growth and solid fundamentals." },
    { name: "Infosys", symbol: "INFY", sector: "IT", growth: "medium", risk: "low", description: "Leading IT company with stable returns and global presence." },
    { name: "Reliance Industries", symbol: "RELIANCE", sector: "Conglomerate", growth: "high", risk: "medium", description: "Diversified business across retail, telecom, and petrochemicals with strong market position." },
    { name: "Asian Paints", symbol: "ASIANPAINT", sector: "Consumer", growth: "medium", risk: "low", description: "Market leader in paints with consistent growth and high-quality products." },
    { name: "Bajaj Finance", symbol: "BAJFINANCE", sector: "Finance", growth: "high", risk: "medium", description: "Leading consumer finance company with innovative digital offerings." },
    { name: "TCS", symbol: "TCS", sector: "IT", growth: "medium", risk: "low", description: "India's largest IT services company with stable dividends and global clients." },
    { name: "Titan Company", symbol: "TITAN", sector: "Consumer", growth: "high", risk: "medium", description: "Leading jewelry and watches retailer with strong brand value." },
    { name: "Maruti Suzuki", symbol: "MARUTI", sector: "Automotive", growth: "medium", risk: "medium", description: "India's largest car manufacturer with strong market share and fuel-efficient vehicles." },
    { name: "Sun Pharma", symbol: "SUNPHARMA", sector: "Healthcare", growth: "medium", risk: "medium", description: "Leading pharmaceutical company with global presence and diverse product portfolio." },
    { name: "Kotak Mahindra Bank", symbol: "KOTAKBANK", sector: "Banking", growth: "high", risk: "medium", description: "Private bank known for conservative approach and strong management." },
    { name: "Nestle India", symbol: "NESTLEIND", sector: "Consumer", growth: "medium", risk: "low", description: "FMCG company with strong brands and consistent performance." },
    { name: "ITC Limited", symbol: "ITC", sector: "Conglomerate", growth: "low", risk: "low", description: "Diversified company with businesses in tobacco, hotels, and FMCG with high dividend yield." },
    { name: "Hindustan Unilever", symbol: "HINDUNILVR", sector: "Consumer", growth: "medium", risk: "low", description: "Consumer goods company with widespread distribution and trusted brands." },
    { name: "Larsen & Toubro", symbol: "LT", sector: "Engineering", growth: "medium", risk: "medium", description: "Engineering and construction giant involved in major infrastructure projects." },
    { name: "Adani Ports", symbol: "ADANIPORTS", sector: "Infrastructure", growth: "high", risk: "high", description: "India's largest port operator with expanding operations." },
    { name: "Bharti Airtel", symbol: "BHARTIARTL", sector: "Telecom", growth: "medium", risk: "medium", description: "Leading telecom operator with growing data business." }
  ];

  useEffect(() => {
    if (!userInvestments || !userInvestments.userData) {
      setIsLoading(false);
      return;
    }

    // Generate recommendations based on user investments
    analyzePortfolio(userInvestments.userData.investments);
  }, [userInvestments]);

  const analyzePortfolio = (investments) => {
    setIsLoading(true);
    
    const { stocks = [], mutualFunds = [], indexFunds = [] } = investments;
    const allInvestments = [...stocks, ...mutualFunds, ...indexFunds];
    
    // Count sectors and platforms
    const existingSectors = new Set();
    const existingStocks = new Set();
    
    // Extract sectors from stocks (simplified approach)
    stocks.forEach(stock => {
      existingStocks.add(stock.stockName);
      
      // Map some common stocks to sectors
      if (stock.stockName.includes("Bank") || stock.symbol.includes("BANK")) {
        existingSectors.add("Banking");
      } else if (stock.stockName.includes("Tech") || stock.stockName.includes("Infosys") || stock.stockName.includes("TCS")) {
        existingSectors.add("IT");
      } else if (stock.stockName.includes("Pharma") || stock.stockName.includes("Healthcare")) {
        existingSectors.add("Healthcare");
      } else if (stock.stockName.includes("Reliance") || stock.stockName.includes("Adani")) {
        existingSectors.add("Conglomerate");
      } else if (stock.stockName.includes("Airtel") || stock.stockName.includes("Telecom")) {
        existingSectors.add("Telecom");
      } else if (stock.stockName.includes("Unilever") || stock.stockName.includes("ITC") || stock.stockName.includes("Nestle")) {
        existingSectors.add("Consumer");
      }
    });
    
    // Check mutual funds for additional sector exposure (simplified)
    mutualFunds.forEach(fund => {
      if (fund.fundName.includes("Technology") || fund.fundName.includes("Digital")) {
        existingSectors.add("IT");
      } else if (fund.fundName.includes("Pharma") || fund.fundName.includes("Healthcare")) {
        existingSectors.add("Healthcare");
      } else if (fund.fundName.includes("Banking") || fund.fundName.includes("Financial")) {
        existingSectors.add("Banking");
      } else if (fund.fundName.includes("Consumer") || fund.fundName.includes("FMCG")) {
        existingSectors.add("Consumer");
      }
    });
    
    // Generate personalized stock recommendations
    const recommendations = [];
    
    // 1. Suggest stocks from missing sectors
    const missingSectors = ["Banking", "IT", "Healthcare", "Consumer", "Conglomerate", "Telecom", "Automotive", "Engineering"]
      .filter(sector => !existingSectors.has(sector));
    
    if (missingSectors.length > 0) {
      // Select up to 3 missing sectors
      const sectorsToRecommend = missingSectors.slice(0, 3);
      
      sectorsToRecommend.forEach(sector => {
        // Find stocks in this sector
        const sectorStocks = stockUniverse.filter(stock => 
          stock.sector === sector && !existingStocks.has(stock.name)
        );
        
        if (sectorStocks.length > 0) {
          // Recommend a stock from this sector
          const recommendedStock = sectorStocks[0];
          recommendations.push({
            name: recommendedStock.name,
            symbol: recommendedStock.symbol,
            reason: `Adds exposure to the ${sector} sector, which isn't in your current portfolio`,
            description: recommendedStock.description,
            riskLevel: recommendedStock.risk
          });
        }
      });
    }
    
    // 2. Add a couple of generally good stocks if we don't have enough recommendations
    if (recommendations.length < 3) {
      const goodStocks = stockUniverse.filter(stock => 
        stock.growth === "high" && 
        stock.risk !== "high" && 
        !existingStocks.has(stock.name) &&
        !recommendations.find(rec => rec.name === stock.name)
      );
      
      // Add up to 3 stocks total
      for (let i = 0; i < goodStocks.length && recommendations.length < 3; i++) {
        recommendations.push({
          name: goodStocks[i].name,
          symbol: goodStocks[i].symbol,
          reason: "Strong growth potential with reasonable risk level",
          description: goodStocks[i].description,
          riskLevel: goodStocks[i].risk
        });
      }
    }
    
    // 3. Add a safety pick if the user has mostly high-risk investments
    const safetyPick = stockUniverse.find(stock => 
      stock.risk === "low" && 
      stock.growth !== "low" && 
      !existingStocks.has(stock.name) &&
      !recommendations.find(rec => rec.name === stock.name)
    );
    
    if (safetyPick && recommendations.length < 5) {
      recommendations.push({
        name: safetyPick.name,
        symbol: safetyPick.symbol,
        reason: "A steady performer that can add stability to your portfolio",
        description: safetyPick.description,
        riskLevel: safetyPick.risk
      });
    }
    
    // Generate simple portfolio analysis
    const portfolioAnalysis = {
      composition: `Your portfolio has ${stocks.length} stocks, ${mutualFunds.length} mutual funds, and ${indexFunds.length} index funds.`,
      platforms: `You're using ${new Set(allInvestments.map(inv => inv.brokerPlatform)).size} different platforms to manage your investments.`,
      diversity: getSectorDiversityAnalysis(existingSectors),
      suggestion: stocks.length > 0 ? 
        "Based on your current stocks, we've recommended a few more that might fit well with your portfolio." :
        "Since you don't have any individual stocks yet, we've suggested a few good starter options."
    };
    
    // Update state with recommendations and analysis
    setStockRecommendations(recommendations);
    setAnalysis(portfolioAnalysis);
    setIsLoading(false);
  };
  
  // Helper function to analyze sector diversity
  const getSectorDiversityAnalysis = (sectors) => {
    const sectorCount = sectors.size;
    
    if (sectorCount >= 5) {
      return "Your stock portfolio covers many different sectors, which is good for spreading out risk.";
    } else if (sectorCount >= 3) {
      return "Your stock portfolio has some variety across different business types, but you could add more.";
    } else if (sectorCount > 0) {
      return "Your stocks are concentrated in just a few sectors. Adding companies from different industries would help spread your risk.";
    } else {
      return "You don't have many stocks yet, so we've suggested some from different business sectors.";
    }
  };
  
  const toggleAnalysis = () => {
    setIsAnalysisOpen(!isAnalysisOpen);
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'low':
        return 'text-green-400';
      case 'medium':
        return 'text-yellow-400';
      case 'high':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  // Handle adding a stock to portfolio
  const handleAddToPortfolio = (stock) => {
    if (!userInvestments || !userInvestments.userData) return;
    
    setAddingStock(stock.symbol);
    
    try {
      // Create a new stock investment object
      const newStock = {
        id: `stock_inv_${uuidv4().substring(0, 8)}`,
        investmentType: 'stock',
        stockName: stock.name,
        symbol: stock.symbol,
        brokerPlatform: 'zerodha', // Default platform
        quantity: 1, // Default quantity
        purchaseDate: new Date().toISOString().split('T')[0], // Today's date
      };
      
      // Generate mock price history for the graph (similar to what you'd see in dashboard)
      const priceHistory = generateMockPriceHistory(newStock);
      newStock.priceHistory = priceHistory;
      
      // Clone the current user investments
      const updatedUserInvestments = JSON.parse(JSON.stringify(userInvestments));
      
      // Add the new stock to the stocks array
      updatedUserInvestments.userData.investments.stocks.push(newStock);
      
      // Update context with new investment data
      setUserInvestments(updatedUserInvestments);
      
      // Mark this recommendation as added
      const updatedRecommendations = stockRecommendations.map(rec => {
        if (rec.symbol === stock.symbol) {
          return { ...rec, added: true };
        }
        return rec;
      });
      setStockRecommendations(updatedRecommendations);
      
      // Show success notification
      setNotification({
        type: 'success',
        message: `${stock.name} added to your portfolio!`
      });
      
      // Update analysis since portfolio has changed
      setTimeout(() => {
        analyzePortfolio(updatedUserInvestments.userData.investments);
      }, 1000);
      
    } catch (error) {
      console.error('Error adding stock to portfolio:', error);
      setNotification({
        type: 'error',
        message: 'Failed to add stock. Please try again.'
      });
    } finally {
      setAddingStock(null);
      
      // Clear notification after 5 seconds
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    }
  };
  
  // Generate mock price history for visualization
  const generateMockPriceHistory = (stock) => {
    const prices = [];
    const days = 90; // 3 months of data
    const today = new Date();
    const basePrice = 1000 + Math.random() * 4000; // Random starting price between 1000-5000
    let currentPrice = basePrice;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Add some randomness to price movement (between -2% and +2%)
      const change = (Math.random() * 4 - 2) / 100;
      currentPrice = currentPrice * (1 + change);
      
      prices.push({
        date: date.toISOString().split('T')[0],
        price: currentPrice
      });
    }
    
    return prices;
  };

  if (isLoading) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Stock Recommendations</h2>
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Stock Recommendations</h2>
      
      {notification && (
        <div className={`flex items-center gap-2 p-3 rounded-lg mb-4 ${
          notification.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
        }`}>
          {notification.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          <p>{notification.message}</p>
        </div>
      )}
      
      {/* Simple Portfolio Analysis */}
      <div className="mb-6 bg-white/5 rounded-lg p-4">
        <div 
          className="flex justify-between items-center cursor-pointer"
          onClick={toggleAnalysis}
        >
          <h3 className="text-lg font-medium">Your Portfolio at a Glance</h3>
          {isAnalysisOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
        
        {isAnalysisOpen && (
          <div className="mt-3 space-y-3 text-gray-300 text-sm">
            <p>{analysis.composition}</p>
            <p>{analysis.platforms}</p>
            <p>{analysis.diversity}</p>
            <p className="text-purple-400 font-medium mt-4">{analysis.suggestion}</p>
          </div>
        )}
      </div>
      
      {/* Stock Recommendations */}
      <h3 className="text-lg font-medium mb-3">Recommended Stocks for You</h3>
      
      {stockRecommendations.length === 0 ? (
        <p className="text-gray-400 text-sm">No specific stock recommendations at this time.</p>
      ) : (
        <div className="space-y-4">
          {stockRecommendations.map((stock, index) => (
            <div key={index} className="bg-white/5 rounded-lg overflow-hidden">
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{stock.name}</h4>
                    <p className="text-sm text-gray-400">{stock.symbol}</p>
                  </div>
                  <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(stock.riskLevel)} bg-white/10`}>
                    {stock.riskLevel === 'low' ? 'Lower risk' : stock.riskLevel === 'medium' ? 'Medium risk' : 'Higher risk'}
                  </div>
                </div>
                
                <p className="mt-2 text-sm">{stock.description}</p>
                
                <div className="mt-3 flex items-start gap-2">
                  <Star size={16} className="text-yellow-400 mt-0.5" />
                  <p className="text-sm text-purple-300">{stock.reason}</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-500/20 to-indigo-500/20 p-3 text-center">
                {stock.added ? (
                  <div className="flex items-center justify-center text-sm text-green-400">
                    <Check size={16} className="mr-1.5" />
                    Added to Portfolio
                  </div>
                ) : (
                  <button 
                    onClick={() => handleAddToPortfolio(stock)}
                    disabled={addingStock === stock.symbol}
                    className="text-sm text-white hover:text-purple-300 transition-colors flex items-center justify-center w-full"
                  >
                    {addingStock === stock.symbol ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Adding...
                      </>
                    ) : (
                      'Add to Portfolio'
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PortfolioRecommendations; 