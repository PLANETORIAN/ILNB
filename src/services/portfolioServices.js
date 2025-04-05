import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  arrayUnion, 
  arrayRemove,
  serverTimestamp,
  setDoc,
  orderBy,
  limit
} from 'firebase/firestore';
import { db, auth, isFirebaseAuthAvailable } from '../firebase.config';

// Import mock data
const mockPortfolioData = {
  mutualFunds: [],
  stocks: [],
  totalValue: 0,
  platformBreakdown: {}
};

// Mock implementation for when Firebase is not available
const mockInvestments = [];
const mockTransactions = [];

const portfolioService = {
  // Get user's portfolio data
  getUserPortfolio: async () => {
    try {
      if (!isFirebaseAuthAvailable) {
        console.log("Using mock portfolio service (Firebase not available)");
        return mockPortfolioData;
      }

      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      // Get user document
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        // If user document doesn't exist, create it with empty portfolio
        const emptyPortfolio = {
          mutualFunds: [],
          stocks: [],
          totalValue: 0,
          platformBreakdown: {}
        };
        
        await setDoc(userDocRef, {
          name: user.displayName,
          email: user.email,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          portfolioIds: [],
          preferences: {},
          portfolio: emptyPortfolio
        });
        
        return emptyPortfolio;
      }

      // Get portfolio data from user document
      const userData = userDoc.data();
      return userData.portfolio || {
        mutualFunds: [],
        stocks: [],
        totalValue: 0,
        platformBreakdown: {}
      };
    } catch (error) {
      console.error('Failed to fetch portfolio data:', error);
      throw error;
    }
  },

  // Get investments by platform
  getInvestmentsByPlatform: async (platform) => {
    try {
      if (!isFirebaseAuthAvailable) {
        return mockInvestments.filter(item => item.platform === platform);
      }

      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const investmentsQuery = query(
        collection(db, 'investments'),
        where('userId', '==', user.uid),
        where('platform', '==', platform)
      );
      
      const investmentsSnapshot = await getDocs(investmentsQuery);
      const investments = [];
      
      investmentsSnapshot.forEach((doc) => {
        investments.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return investments;
    } catch (error) {
      console.error(`Failed to fetch ${platform} investments:`, error);
      throw error;
    }
  },

  // Add new investment
  addInvestment: async (investmentData) => {
    try {
      if (!isFirebaseAuthAvailable) {
        const newInvestment = {
          id: `mock_investment_${Date.now()}`,
          ...investmentData,
          userId: 'mock_user',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        mockInvestments.push(newInvestment);
        return newInvestment;
      }

      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const newInvestment = {
        ...investmentData,
        userId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'investments'), newInvestment);
      
      // Add reference to user's portfolio
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        portfolioIds: arrayUnion(docRef.id)
      });
      
      return {
        id: docRef.id,
        ...newInvestment
      };
    } catch (error) {
      console.error('Failed to add investment:', error);
      throw error;
    }
  },

  // Execute a buy/sell transaction
  executeTransaction: async (transaction) => {
    try {
      if (!isFirebaseAuthAvailable) {
        console.log("Mock transaction execution:", transaction);
        const { type, investmentId, quantity, price, platform } = transaction;
        
        // Record the transaction in mock storage
        const mockTransaction = {
          id: `mock_transaction_${Date.now()}`,
          type,
          investmentId: investmentId || `new_investment_${Date.now()}`,
          investmentType: transaction.investmentType,
          name: transaction.name,
          symbol: transaction.symbol,
          platform,
          quantity,
          price,
          totalAmount: price * quantity,
          timestamp: new Date().toISOString(),
          userId: 'mock_user'
        };
        
        mockTransactions.push(mockTransaction);
        
        // If buying a new investment that doesn't exist yet
        if (type === 'buy' && !investmentId) {
          const newInvestment = {
            id: `mock_investment_${Date.now()}`,
            type: transaction.investmentType, // 'stock' or 'mutualFund'
            name: transaction.name,
            symbol: transaction.symbol,
            platform,
            quantity,
            investedAmount: price * quantity,
            currentValue: price * quantity,
            purchaseDate: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            userId: 'mock_user'
          };
          
          mockInvestments.push(newInvestment);
          return { success: true, investment: newInvestment, transaction: mockTransaction };
        }
        
        // If updating an existing investment
        const investmentIndex = mockInvestments.findIndex(inv => inv.id === investmentId);
        
        if (investmentIndex === -1) {
          throw new Error('Investment not found');
        }
        
        const investment = mockInvestments[investmentIndex];
        
        if (type === 'buy') {
          // Add to existing position
          const newQuantity = investment.quantity + quantity;
          const newInvestedAmount = investment.investedAmount + (price * quantity);
          const newCurrentValue = newQuantity * price;
          
          mockInvestments[investmentIndex] = {
            ...investment,
            quantity: newQuantity,
            investedAmount: newInvestedAmount,
            currentValue: newCurrentValue,
            lastUpdated: new Date().toISOString()
          };
        } else if (type === 'sell') {
          // Sell some or all of position
          if (quantity > investment.quantity) {
            throw new Error('Cannot sell more than you own');
          }
          
          const newQuantity = investment.quantity - quantity;
          
          // Calculate the portion of invested amount being sold
          const portionSold = quantity / investment.quantity;
          const investedAmountSold = investment.investedAmount * portionSold;
          const newInvestedAmount = investment.investedAmount - investedAmountSold;
          
          if (newQuantity === 0) {
            // Remove investment if selling all
            mockInvestments.splice(investmentIndex, 1);
          } else {
            // Update with new values
            mockInvestments[investmentIndex] = {
              ...investment,
              quantity: newQuantity,
              investedAmount: newInvestedAmount,
              currentValue: newQuantity * price,
              lastUpdated: new Date().toISOString()
            };
          }
        }
        
        return { success: true, transaction: mockTransaction };
      }

      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const { type, investmentId, quantity, price, platform } = transaction;
      let transactionResult = null;
      
      // Create transaction record first
      const transactionData = {
        type,
        investmentId: investmentId || null,
        investmentType: transaction.investmentType,
        name: transaction.name,
        symbol: transaction.symbol,
        platform,
        quantity,
        price,
        totalAmount: price * quantity,
        timestamp: serverTimestamp(),
        userId: user.uid
      };
      
      // Add transaction to Firestore
      const transactionRef = await addDoc(collection(db, 'transactions'), transactionData);
      transactionResult = { 
        id: transactionRef.id,
        ...transactionData 
      };
      
      // If buying a new investment that doesn't exist yet
      if (type === 'buy' && !investmentId) {
        const newInvestment = {
          type: transaction.investmentType, // 'stock' or 'mutualFund'
          name: transaction.name,
          symbol: transaction.symbol,
          platform,
          quantity,
          investedAmount: price * quantity,
          currentValue: price * quantity,
          purchaseDate: serverTimestamp(),
          lastUpdated: serverTimestamp(),
          userId: user.uid,
          transactions: [transactionRef.id] // Keep track of transactions
        };
        
        const addedInvestment = await portfolioService.addInvestment(newInvestment);
        
        // Update the transaction with the new investment ID
        await updateDoc(transactionRef, {
          investmentId: addedInvestment.id
        });
        
        return { success: true, investment: addedInvestment, transaction: transactionResult };
      }
      
      // If updating an existing investment
      const investmentRef = doc(db, 'investments', investmentId);
      const investmentDoc = await getDoc(investmentRef);
      
      if (!investmentDoc.exists()) {
        throw new Error('Investment not found');
      }
      
      const investment = investmentDoc.data();
      
      // Ensure the user owns this investment
      if (investment.userId !== user.uid) {
        throw new Error('Unauthorized access to investment');
      }
      
      if (type === 'buy') {
        // Add to existing position
        const newQuantity = investment.quantity + quantity;
        const newInvestedAmount = investment.investedAmount + (price * quantity);
        const newCurrentValue = newQuantity * price;
        
        await updateDoc(investmentRef, {
          quantity: newQuantity,
          investedAmount: newInvestedAmount,
          currentValue: newCurrentValue,
          lastUpdated: serverTimestamp(),
          transactions: arrayUnion(transactionRef.id) // Add this transaction to the array
        });
      } else if (type === 'sell') {
        // Sell some or all of position
        if (quantity > investment.quantity) {
          throw new Error('Cannot sell more than you own');
        }
        
        const newQuantity = investment.quantity - quantity;
        
        // Calculate the portion of invested amount being sold
        const portionSold = quantity / investment.quantity;
        const investedAmountSold = investment.investedAmount * portionSold;
        const newInvestedAmount = investment.investedAmount - investedAmountSold;
        
        if (newQuantity === 0) {
          // Remove investment if selling all
          await deleteDoc(investmentRef);
          
          // Remove from user's portfolio
          const userDocRef = doc(db, 'users', user.uid);
          await updateDoc(userDocRef, {
            portfolioIds: arrayRemove(investmentId)
          });
        } else {
          // Update with new values
          await updateDoc(investmentRef, {
            quantity: newQuantity,
            investedAmount: newInvestedAmount,
            currentValue: newQuantity * price,
            lastUpdated: serverTimestamp(),
            transactions: arrayUnion(transactionRef.id) // Add this transaction to the array
          });
        }
      }
      
      return { success: true, transaction: transactionResult };
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    }
  },
  
  // Get user's transaction history
  getTransactionHistory: async (options = {}) => {
    try {
      if (!isFirebaseAuthAvailable) {
        console.log("Using mock transaction service (Firebase not available)");
        
        // Sort by timestamp descending (newest first)
        const sortedTransactions = [...mockTransactions].sort((a, b) => {
          return new Date(b.timestamp) - new Date(a.timestamp);
        });
        
        // Apply limit if provided
        const limitCount = options.limit || sortedTransactions.length;
        return sortedTransactions.slice(0, limitCount);
      }

      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      // Create query
      let transactionsQuery = query(
        collection(db, 'transactions'),
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc')
      );
      
      // Apply limit if provided
      if (options.limit) {
        transactionsQuery = query(transactionsQuery, limit(options.limit));
      }
      
      // Filter by investment type if provided
      if (options.investmentType) {
        transactionsQuery = query(
          transactionsQuery,
          where('investmentType', '==', options.investmentType)
        );
      }
      
      // Filter by transaction type if provided
      if (options.type) {
        transactionsQuery = query(
          transactionsQuery,
          where('type', '==', options.type)
        );
      }
      
      // Get transactions
      const transactionsSnapshot = await getDocs(transactionsQuery);
      
      // Map transactions
      const transactions = [];
      transactionsSnapshot.forEach((doc) => {
        const transaction = {
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate?.() || doc.data().timestamp
        };
        transactions.push(transaction);
      });
      
      return transactions;
    } catch (error) {
      console.error('Failed to fetch transaction history:', error);
      throw error;
    }
  },
  
  // Get investment transaction history
  getInvestmentTransactions: async (investmentId, options = {}) => {
    try {
      if (!isFirebaseAuthAvailable) {
        console.log("Using mock investment transactions service (Firebase not available)");
        
        // Filter by investment ID
        const filteredTransactions = mockTransactions.filter(t => t.investmentId === investmentId);
        
        // Sort by timestamp descending (newest first)
        const sortedTransactions = [...filteredTransactions].sort((a, b) => {
          return new Date(b.timestamp) - new Date(a.timestamp);
        });
        
        // Apply limit if provided
        const limitCount = options.limit || sortedTransactions.length;
        return sortedTransactions.slice(0, limitCount);
      }

      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      // Create query
      let transactionsQuery = query(
        collection(db, 'transactions'),
        where('userId', '==', user.uid),
        where('investmentId', '==', investmentId),
        orderBy('timestamp', 'desc')
      );
      
      // Apply limit if provided
      if (options.limit) {
        transactionsQuery = query(transactionsQuery, limit(options.limit));
      }
      
      // Get transactions
      const transactionsSnapshot = await getDocs(transactionsQuery);
      
      // Map transactions
      const transactions = [];
      transactionsSnapshot.forEach((doc) => {
        const transaction = {
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate?.() || doc.data().timestamp
        };
        transactions.push(transaction);
      });
      
      return transactions;
    } catch (error) {
      console.error('Failed to fetch investment transactions:', error);
      throw error;
    }
  }
};

export default portfolioService;