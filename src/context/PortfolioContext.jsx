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
    'MF Central': 55000,
    'Groww': 28750,
    'Zerodha': 27500,
    'Angel One': 23000
  }
};

// Mock transactions for development
const mockTransactions = [
  {
    id: 'tr1',
    type: 'buy',
    investmentType: 'mutualFund',
    investmentId: 'mf1',
    name: 'HDFC Top 100 Fund',
    platform: 'MF Central',
    quantity: 100,
    price: 500,
    totalAmount: 50000,
    timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
  },
  {
    id: 'tr2',
    type: 'buy',
    investmentType: 'mutualFund',
    investmentId: 'mf2',
    name: 'Axis Blue Chip Fund',
    platform: 'Groww',
    quantity: 200,
    price: 125,
    totalAmount: 25000,
    timestamp: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) // 20 days ago
  },
  {
    id: 'tr3',
    type: 'buy',
    investmentType: 'stock',
    investmentId: 'st1',
    name: 'Reliance Industries',
    symbol: 'RELIANCE',
    platform: 'Zerodha',
    quantity: 10,
    price: 2500,
    totalAmount: 25000,
    timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) // 15 days ago
  },
  {
    id: 'tr4',
    type: 'buy',
    investmentType: 'stock',
    investmentId: 'st2',
    name: 'Infosys',
    symbol: 'INFY',
    platform: 'Angel One',
    quantity: 15,
    price: 1333.33,
    totalAmount: 20000,
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
  }
];

export const PortfolioProvider = ({ children }) => {
  const [portfolio, setPortfolio] = useState({
    mutualFunds: [],
    stocks: [],
    totalValue: 0,
    platformBreakdown: {}
  });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      refreshPortfolio();
      refreshTransactions();
    }
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
  
  const refreshTransactions = async (options = {}) => {
    if (!user) return;
    
    try {
      if (!isFirebaseAuthAvailable) {
        console.log("Using mock transaction data (Firebase not available)");
        // Sort by timestamp descending (newest first)
        const sortedTransactions = [...mockTransactions].sort((a, b) => 
          new Date(b.timestamp) - new Date(a.timestamp)
        );
        // Apply limit if provided
        const limitCount = options.limit || sortedTransactions.length;
        setTransactions(sortedTransactions.slice(0, limitCount));
      } else {
        const transactionHistory = await portfolioService.getTransactionHistory(options);
        setTransactions(transactionHistory);
      }
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
      setError("Failed to fetch transaction history");
    }
  };

  const executeTransaction = async (transaction) => {
    try {
      if (!isFirebaseAuthAvailable) {
        console.log("Mock transaction execution (Firebase not available):", transaction);
        // Simulate successful transaction and add to mock transactions
        const mockTransaction = {
          id: `tr${mockTransactions.length + 1}`,
          type: transaction.type,
          investmentType: transaction.investmentType,
          investmentId: transaction.investmentId || `new_${Date.now()}`,
          name: transaction.name,
          symbol: transaction.symbol,
          platform: transaction.platform,
          quantity: transaction.quantity,
          price: transaction.price,
          totalAmount: transaction.quantity * transaction.price,
          timestamp: new Date()
        };
        mockTransactions.push(mockTransaction);
        
        // Refresh portfolio and transactions
        setTimeout(() => {
          refreshPortfolio();
          refreshTransactions();
        }, 500);
        return true;
      } else {
        await portfolioService.executeTransaction(transaction);
        await refreshPortfolio();
        await refreshTransactions();
        return true;
      }
    } catch (err) {
      console.error("Transaction failed:", err);
      setError("Transaction failed");
      return false;
    }
  };
  
  const getInvestmentTransactions = async (investmentId, options = {}) => {
    try {
      if (!isFirebaseAuthAvailable) {
        // Filter mock transactions by investment ID
        const filteredTransactions = mockTransactions.filter(
          t => t.investmentId === investmentId
        );
        
        // Sort by timestamp descending (newest first)
        const sortedTransactions = [...filteredTransactions].sort((a, b) => 
          new Date(b.timestamp) - new Date(a.timestamp)
        );
        
        // Apply limit if provided
        const limitCount = options.limit || sortedTransactions.length;
        return sortedTransactions.slice(0, limitCount);
      } else {
        return await portfolioService.getInvestmentTransactions(investmentId, options);
      }
    } catch (err) {
      console.error("Failed to fetch investment transactions:", err);
      setError("Failed to fetch investment transaction history");
      return [];
    }
  };

  const value = {
    portfolio,
    transactions,
    loading,
    error,
    refreshPortfolio,
    refreshTransactions,
    executeTransaction,
    getInvestmentTransactions
  };

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
};