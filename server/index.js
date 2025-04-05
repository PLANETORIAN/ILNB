const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Razorpay API keys
const razorpayKeyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_A6jyuYzUHgt2MR';
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || 'zwCM7KHtiUxy27QNteiNgTgz';

// Root endpoint
app.get('/', (req, res) => {
  res.send('Razorpay Payment Server is running');
});

// Verify Razorpay payment signature
app.post('/api/verify-payment', (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature 
    } = req.body;

    // Create a signature using the payment ID and order ID
    const generated_signature = crypto
      .createHmac('sha256', razorpayKeySecret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    // Compare the generated signature with the one from Razorpay
    if (generated_signature === razorpay_signature) {
      // Payment is legitimate
      res.status(200).json({ 
        success: true, 
        message: 'Payment has been verified',
        payment_id: razorpay_payment_id
      });
    } else {
      // Payment verification failed
      res.status(400).json({ 
        success: false, 
        message: 'Payment verification failed'
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 