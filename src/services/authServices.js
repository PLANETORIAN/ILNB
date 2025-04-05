import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, db, isFirebaseAuthAvailable } from '../firebase.config';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// Mock user storage for development when Firebase auth is not available
const mockUsers = {};
let mockCurrentUser = null;

// Helper function to store authentication data in local storage
const saveUserToLocalStorage = (user) => {
  if (!user) return;
  localStorage.setItem('user', JSON.stringify({
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL
  }));
};

// Helper function to clear authentication data
const clearUserFromLocalStorage = () => {
  localStorage.removeItem('user');
};

// Get stored user data
const getStoredUser = () => {
  const userData = localStorage.getItem('user');
  return userData ? JSON.parse(userData) : null;
};

// Check if user is authenticated
const isAuthenticated = () => {
  if (isFirebaseAuthAvailable) {
    return !!auth.currentUser || !!getStoredUser();
  } else {
    return !!mockCurrentUser || !!getStoredUser();
  }
};

// Validate Firebase initialization
const validateFirebaseAuth = () => {
  if (!isFirebaseAuthAvailable) {
    console.warn("Firebase Auth is not available, using mock implementation");
    return false;
  }
  if (!auth) {
    throw new Error("Firebase Auth is not initialized");
  }
  return true;
};

const authService = {
  // Login user
  login: async (email, password) => {
    try {
      if (validateFirebaseAuth()) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        saveUserToLocalStorage(user);
        return user;
      } else {
        // Mock login for development
        console.log("Using mock authentication (Firebase Auth not available)");
        
        // Check if user exists in mock storage
        if (mockUsers[email] && mockUsers[email].password === password) {
          mockCurrentUser = { ...mockUsers[email], password: undefined };
          saveUserToLocalStorage(mockCurrentUser);
          return mockCurrentUser;
        } else {
          throw { code: 'auth/user-not-found', message: 'User not found' };
        }
      }
    } catch (error) {
      console.error('Login failed:', error.message || error);
      throw error;
    }
  },

  // Register new user
  register: async (userData) => {
    try {
      const { name, email, password } = userData;
      
      if (validateFirebaseAuth()) {
        // Create user with email and password
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Update profile with display name
        await updateProfile(user, {
          displayName: name
        });
        
        // Create initial user document in Firestore
        try {
          await setDoc(doc(db, "users", user.uid), {
            name,
            email,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            portfolioIds: [],
            preferences: {},
            // Initialize with empty portfolio data
            portfolio: {
              mutualFunds: [],
              stocks: [],
              totalValue: 0,
              platformBreakdown: {}
            }
          });
          console.log("User document created in Firestore");
        } catch (firestoreError) {
          console.error("Error creating user document:", firestoreError);
          // Don't throw here - user is still created in Auth
        }
        
        saveUserToLocalStorage(user);
        return user;
      } else {
        // Mock registration for development
        console.log("Using mock authentication (Firebase Auth not available)");
        
        // Check if user already exists
        if (mockUsers[email]) {
          throw { code: 'auth/email-already-in-use', message: 'Email already in use' };
        }
        
        // Create a new mock user
        const mockUser = {
          uid: `mock_${Date.now()}`,
          email,
          displayName: name,
          password, // Store for mock login (will be removed when returning)
          createdAt: new Date().toISOString()
        };
        
        mockUsers[email] = mockUser;
        mockCurrentUser = { ...mockUser, password: undefined };
        
        saveUserToLocalStorage(mockCurrentUser);
        return mockCurrentUser;
      }
    } catch (error) {
      console.error('Registration failed:', error.message || error);
      throw error;
    }
  },

  // Get current user profile
  getCurrentUser: async () => {
    if (validateFirebaseAuth()) {
      return new Promise((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          unsubscribe();
          if (user) {
            try {
              const userDoc = await getDoc(doc(db, "users", user.uid));
              if (userDoc.exists()) {
                const userData = userDoc.data();
                const enrichedUser = {
                  ...user,
                  ...userData
                };
                saveUserToLocalStorage(enrichedUser);
                resolve(enrichedUser);
              } else {
                saveUserToLocalStorage(user);
                resolve(user);
              }
            } catch (error) {
              console.error('Error getting user data:', error);
              saveUserToLocalStorage(user);
              resolve(user);
            }
          } else {
            const storedUser = getStoredUser();
            resolve(storedUser);
          }
        }, reject);
      });
    } else {
      return mockCurrentUser || getStoredUser();
    }
  },

  // Logout user
  logout: async () => {
    try {
      if (validateFirebaseAuth()) {
        await signOut(auth);
      } else {
        mockCurrentUser = null;
      }
      clearUserFromLocalStorage();
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  },

  // Check if user is authenticated
  isAuthenticated,

  // Get stored user without API call
  getStoredUser,
};

export default authService;