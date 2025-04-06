/**
 * Razorpay payment service for handling payment initialization and processing
 */
import api from './api';

// Load the Razorpay script dynamically
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

/**
 * Initialize Razorpay payment
 * @param {Object} options - Payment options
 * @param {number} options.amount - Amount in smallest currency unit (paise for INR)
 * @param {string} options.currency - Currency code (default: INR)
 * @param {string} options.name - Company/merchant name
 * @param {string} options.description - Payment description
 * @param {Object} options.notes - Additional notes for the payment
 * @returns {Promise} - Resolves with payment success details or rejects with error
 */
export const initiatePayment = async (options) => {
  // Load Razorpay script
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded) {
    throw new Error('Razorpay SDK failed to load');
  }

  // Default options
  const defaultOptions = {
    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
    amount: 0, // in paise
    currency: 'INR',
    name: 'InvestHub',
    description: 'Investment Transaction',
    theme: {
      color: '#7c3aed', // Purple color to match theme
    },
  };

  // Merge options
  const paymentOptions = { ...defaultOptions, ...options };

  // Validate amount
  if (!paymentOptions.amount || paymentOptions.amount <= 0) {
    throw new Error('Invalid payment amount');
  }

  // Create Razorpay instance and open payment modal
  return new Promise((resolve, reject) => {
    const razorpay = new window.Razorpay(paymentOptions);

    // Handle payment success
    razorpay.on('payment.success', (response) => {
      // Verify payment with backend
      verifyPayment(response).then(resolve).catch(reject);
    });

    // Handle payment error
    razorpay.on('payment.error', (error) => {
      reject(error);
    });

    // Open payment modal
    razorpay.open();
  });
};

/**
 * Verify payment with the backend server
 * @param {Object} paymentResponse - Response from Razorpay on successful payment
 * @returns {Promise} - Resolves with verification result or rejects with error
 */
export const verifyPayment = async (paymentResponse) => {
  try {
    const response = await api.payments.verifyPayment(paymentResponse);
    return response.data;
  } catch (error) {
    console.error('Payment verification error:', error);
    throw new Error(error.response?.data?.message || 'Payment verification failed');
  }
};

export default {
  initiatePayment,
  verifyPayment,
}; 