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
  setDoc
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
          return newInvestment;
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
        
        return { success: true };
      }

      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const { type, investmentId, quantity, price, platform } = transaction;
      
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
          userId: user.uid
        };
        
        return await portfolioService.addInvestment(newInvestment);
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
          lastUpdated: serverTimestamp()
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
            lastUpdated: serverTimestamp()
          });
        }
      }
      
      return { success: true };
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    }
  }
};

export default portfolioService;