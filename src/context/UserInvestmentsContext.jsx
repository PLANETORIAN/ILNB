import { createContext, useContext, useEffect, useState } from 'react';
import userInvestmentData from '../data/userInvestmentData.json';

const UserInvestmentsContext = createContext();

export const UserInvestmentsProvider = ({ children }) => {
  const [userInvestments, setUserInvestments] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadInvestmentData = async () => {
      try {
        // In a real app, this would typically fetch from an API
        // For now, we're using our local JSON file
        setUserInvestments(userInvestmentData);
      } catch (err) {
        console.error('Failed to load investment data:', err);
        setError('Failed to load investment data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadInvestmentData();
  }, []);

  return (
    <UserInvestmentsContext.Provider value={{ 
      userInvestments,
      setUserInvestments,
      isLoading,
      error
    }}>
      {children}
    </UserInvestmentsContext.Provider>
  );
};

export const useUserInvestments = () => {
  const context = useContext(UserInvestmentsContext);
  if (context === undefined) {
    throw new Error('useUserInvestments must be used within a UserInvestmentsProvider');
  }
  return context;
};

export default UserInvestmentsContext; 