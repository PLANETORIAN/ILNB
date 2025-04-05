/**
 * helpers.js - Utility functions for the investment tracking application
 */

/**
 * Format currency values to Indian Rupee format with ₹ symbol
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '₹0';
    
    // Format as Indian currency with commas for thousands
    const formatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
    
    return formatter.format(amount);
  };
  
  /**
   * Calculate percentage change between two values
   * @param {number} oldValue - Original value
   * @param {number} newValue - New value
   * @returns {number} Percentage change (positive or negative)
   */
  export const calculatePercentageChange = (oldValue, newValue) => {
    if (!oldValue || oldValue === 0) return 0;
    return ((newValue - oldValue) / oldValue) * 100;
  };
  
  /**
   * Format percentage values with % symbol
   * @param {number} value - Percentage value
   * @param {number} decimals - Number of decimal places
   * @returns {string} Formatted percentage string
   */
  export const formatPercentage = (value, decimals = 2) => {
    if (value === undefined || value === null) return '0%';
    return `${value.toFixed(decimals)}%`;
  };
  
  /**
   * Compare two investments based on a specific metric
   * @param {Object} a - First investment
   * @param {Object} b - Second investment
   * @param {string} metric - Metric to compare (returns, risk, etc.)
   * @param {boolean} ascending - Sort direction
   * @returns {number} Comparison result
   */
  export const compareInvestments = (a, b, metric, ascending = true) => {
    const multiplier = ascending ? 1 : -1;
    
    if (!a[metric] && !b[metric]) return 0;
    if (!a[metric]) return 1 * multiplier;
    if (!b[metric]) return -1 * multiplier;
    
    return (a[metric] - b[metric]) * multiplier;
  };
  
  /**
   * Group investments by platform
   * @param {Array} investments - List of investment objects
   * @returns {Object} Grouped investments by platform
   */
  export const groupByPlatform = (investments) => {
    return investments.reduce((grouped, investment) => {
      const platform = investment.platform || 'Unknown';
      
      if (!grouped[platform]) {
        grouped[platform] = [];
      }
      
      grouped[platform].push(investment);
      return grouped;
    }, {});
  };
  
  /**
   * Calculate total value of investments
   * @param {Array} investments - List of investment objects
   * @returns {number} Total value
   */
  export const calculateTotalValue = (investments) => {
    return investments.reduce((total, investment) => {
      return total + (investment.currentValue || 0);
    }, 0);
  };
  
  /**
   * Determine risk level text based on numerical risk score
   * @param {number} riskScore - Risk score (typically 0-100)
   * @returns {Object} Risk level with text and color code
   */
  export const getRiskLevel = (riskScore) => {
    if (riskScore < 30) {
      return { text: 'Low Risk', color: 'green' };
    } else if (riskScore < 70) {
      return { text: 'Medium Risk', color: 'yellow' };
    } else {
      return { text: 'High Risk', color: 'red' };
    }
  };
  
  /**
   * Format date object or string to readable format
   * @param {Date|string} date - Date to format
   * @param {string} format - Optional format specification
   * @returns {string} Formatted date string
   */
  export const formatDate = (date, format = 'short') => {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (format === 'short') {
      return dateObj.toLocaleDateString('en-IN');
    } else if (format === 'long') {
      return dateObj.toLocaleDateString('en-IN', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
    
    return dateObj.toLocaleDateString('en-IN');
  };
  
  /**
   * Simplify complex investment terminology for user-friendly display
   * @param {string} term - Technical investment term
   * @returns {string} Simplified explanation
   */
  export const simplifyTerm = (term) => {
    const simplifications = {
      'Alpha': 'Performance compared to market',
      'Beta': 'Market sensitivity',
      'Sharpe Ratio': 'Return vs risk measure',
      'Standard Deviation': 'Volatility measure',
      'Expense Ratio': 'Annual fund costs',
      'Dividend Yield': 'Annual dividend percentage',
      'P/E Ratio': 'Price to earnings ratio',
      'Market Cap': 'Company size',
      'NAV': 'Net asset value per unit',
      'SIP': 'Regular investment plan',
      'Lumpsum': 'One-time investment'
    };
    
    return simplifications[term] || term;
  };
  
  /**
   * Generate a unique ID for new elements
   * @returns {string} Unique ID
   */
  export const generateUniqueId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };
  
  /**
   * Truncate text with ellipsis if it exceeds max length
   * @param {string} text - Text to truncate
   * @param {number} maxLength - Maximum length before truncation
   * @returns {string} Truncated text
   */
  export const truncateText = (text, maxLength = 30) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };
  
  /**
   * Debounce function to limit how often a function is called
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} Debounced function
   */
  export const debounce = (func, wait = 300) => {
    let timeout;
    
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };