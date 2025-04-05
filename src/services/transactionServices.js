import { 
  collection, 
  doc, 
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  arrayUnion,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth, isFirebaseAuthAvailable } from '../firebase.config';

// Mock transaction data for development
const mockTransactions = [];

const transactionService = {
  // Add a new transaction to user's history
  addTransaction: async (transactionData) => {
    try {
      if (!isFirebaseAuthAvailable) {
        console.log("Using mock transaction service (Firebase not available)");
        const mockTransaction = {
          id: `mock_transaction_${Date.now()}`,
          ...transactionData,
          userId: 'mock_user',
          timestamp: new Date().toISOString()
        };
        mockTransactions.push(mockTransaction);
        return mockTransaction;
      }

      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      // Add transaction to transactions collection
      const newTransaction = {
        ...transactionData,
        userId: user.uid,
        timestamp: serverTimestamp()
      };
      
      const transactionRef = await addDoc(collection(db, 'transactions'), newTransaction);
      
      // Also add reference to user's transaction history array
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        transactionHistory: arrayUnion(transactionRef.id)
      });
      
      return {
        id: transactionRef.id,
        ...newTransaction,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to add transaction:', error);
      throw error;
    }
  },

  // Get user's transaction history
  getTransactionHistory: async (options = {}) => {
    try {
      if (!isFirebaseAuthAvailable) {
        console.log("Using mock transaction service (Firebase not available)");
        const sortedTransactions = [...mockTransactions].sort((a, b) => {
          return new Date(b.timestamp) - new Date(a.timestamp);
        });
        
        if (options.limit) {
          return sortedTransactions.slice(0, options.limit);
        }
        
        return sortedTransactions;
      }

      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      // Build query
      let transactionsQuery = query(
        collection(db, 'transactions'),
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc')
      );
      
      // Add limit if specified
      if (options.limit) {
        transactionsQuery = query(transactionsQuery, limit(options.limit));
      }
      
      // Execute query
      const querySnapshot = await getDocs(transactionsQuery);
      const transactions = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        transactions.push({
          id: doc.id,
          ...data,
          // Convert Firestore timestamp to ISO string
          timestamp: data.timestamp ? data.timestamp.toDate().toISOString() : new Date().toISOString()
        });
      });
      
      return transactions;
    } catch (error) {
      console.error('Failed to get transaction history:', error);
      throw error;
    }
  }
};

export default transactionService; 