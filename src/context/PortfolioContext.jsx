import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import portfolioService from '../services/portfolioServices';
import { isFirebaseAuthAvailable } from '../firebase.config';

const PortfolioContext = createContext();

export const usePortfolio = () => useContext(PortfolioContext);

// Mock data for development when Firebase is not available
const mockPortfolioData = {
  mutualFunds: [
    {
      id: 'mf1',
      name: 'HDFC Top 100 Fund',
      type: 'mutualFund',
      platform: 'MF Central',
      quantity: 100,
      investedAmount: 50000,
      currentValue: 55000,
      returns: 5000,
      returnPercentage: 10,
      riskLevel: 'Medium',
      sector: 'Large Cap'
    },
    {
      id: 'mf2',
      name: 'Axis Blue Chip Fund',
      type: 'mutualFund',
      platform: 'Groww',
      quantity: 200,
      investedAmount: 25000,
      currentValue: 28750,
      returns: 3750,
      returnPercentage: 15,
      riskLevel: 'Low',
      sector: 'Large Cap'
    }
  ],
  stocks: [
    {
      id: 'st1',
      name: 'Reliance Industries',
      symbol: 'RELIANCE',
      type: 'stock',
      platform: 'Zerodha',
      quantity: 10,
      investedAmount: 25000,
      currentValue: 27500,
      returns: 2500,
      returnPercentage: 10,
      sector: 'Energy'
    },
    {
      id: 'st2',
      name: 'Infosys',
      symbol: 'INFY',
      type: 'stock',
      platform: 'Angel One',
      quantity: 15,
      investedAmount: 20000,
      currentValue: 23000,
      returns: 3000,
      returnPercentage: 15,
      sector: 'IT'
    }
  ],
  totalValue: 134250,
  platformBreakdown: {
    'MF Central': {
      totalValue: 55000,
      mutualFunds: 1,
      stocks: 0
    },
    'Groww': {
      totalValue: 28750,
      mutualFunds: 1,
      stocks: 0
    },
    'Zerodha': {
      totalValue: 27500,
      mutualFunds: 0,
      stocks: 1
    },
    'Angel One': {
      totalValue: 23000,
      mutualFunds: 0,
      stocks: 1
    }
  }
};

export const PortfolioProvider = ({ children }) => {
  const { user } = useAuth();
  const [portfolio, setPortfolio] = useState({
    mutualFunds: [],
    stocks: [],
    totalValue: 0,
    platformBreakdown: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setPortfolio({
        mutualFunds: [],
        stocks: [],
        totalValue: 0,
        platformBreakdown: {}
      });
      setLoading(false);
      return;
    }

    const fetchPortfolio = async () => {
      setLoading(true);
      try {
        if (!isFirebaseAuthAvailable) {
          console.log("Using mock portfolio data (Firebase not available)");
          setPortfolio(mockPortfolioData);
        } else {
          const portfolioData = await portfolioService.getUserPortfolio();
          setPortfolio(portfolioData);
        }
        setError(null);
      } catch (err) {
        console.error("Failed to fetch portfolio:", err);
        setError("Failed to load portfolio data");
        
        // Use mock data as fallback
        if (!isFirebaseAuthAvailable) {
          setPortfolio(mockPortfolioData);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, [user]);

  const refreshPortfolio = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      if (!isFirebaseAuthAvailable) {
        console.log("Using mock portfolio data (Firebase not available)");
        setPortfolio(mockPortfolioData);
      } else {
        const portfolioData = await portfolioService.getUserPortfolio();
        setPortfolio(portfolioData);
      }
      setError(null);
    } catch (err) {
      console.error("Failed to refresh portfolio:", err);
      setError("Failed to refresh portfolio data");
    } finally {
      setLoading(false);
    }
  };

  const executeTransaction = async (transaction) => {
    try {
      if (!isFirebaseAuthAvailable) {
        console.log("Mock transaction execution (Firebase not available):", transaction);
        // Simulate successful transaction
        setTimeout(() => refreshPortfolio(), 500);
        return true;
      } else {
        await portfolioService.executeTransaction(transaction);
        await refreshPortfolio();
        return true;
      }
    } catch (err) {
      console.error("Transaction failed:", err);
      setError("Transaction failed");
      return false;
    }
  };

  const value = {
    portfolio,
    loading,
    error,
    refreshPortfolio,
    executeTransaction
  };

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
};