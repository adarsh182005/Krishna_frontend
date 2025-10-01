import React, { useState, useEffect } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import axios from 'axios';

const CheckoutForm = ({ orderId, orderTotal, cartItems, onPaymentSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    // Create PaymentIntent as soon as the page loads
    const createPaymentIntent = async () => {
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/payment/create-payment-intent`,
          {
            amount: orderTotal,
            orderId: orderId,
            items: cartItems
          },
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        setClientSecret(response.data.clientSecret);
      } catch (error) {
        console.error('Error creating payment intent:', error);
        setMessage('Failed to initialize payment. Please try again.');
      }
    };

    if (orderId && orderTotal && cartItems.length > 0) {
      createPaymentIntent();
    }
  }, [orderId, orderTotal, cartItems]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (error) {
      if (error.type === 'card_error' || error.type === 'validation_error') {
        setMessage(error.message);
      } else {
        setMessage('An unexpected error occurred.');
      }
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      // Payment succeeded, confirm with backend
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/payment/confirm-payment`,
          {
            paymentIntentId: paymentIntent.id,
            orderId: orderId
          },
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        if (response.data.success) {
          setMessage('Payment succeeded!');
          onPaymentSuccess && onPaymentSuccess(response.data.order);
        } else {
          setMessage('Payment confirmation failed. Please contact support.');
        }
      } catch (error) {
        console.error('Error confirming payment:', error);
        setMessage('Payment succeeded but confirmation failed. Please contact support.');
      }
    }

    setIsLoading(false);
  };

  const paymentElementOptions = {
    layout: 'tabs',
    paymentMethodOrder: ['card', 'digital_wallet'],
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Complete Your Payment</h2>
      
      <div className="mb-6">
        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
          <span className="font-medium">Total Amount:</span>
          <span className="text-2xl font-bold text-green-600">
            ₹{orderTotal.toFixed(2)}
          </span>
        </div>
      </div>

      <form id="payment-form" onSubmit={handleSubmit}>
        {clientSecret && (
          <PaymentElement 
            id="payment-element" 
            options={paymentElementOptions}
          />
        )}
        
        <button
          disabled={isLoading || !stripe || !elements || !clientSecret}
          id="submit"
          className={`w-full mt-6 py-3 px-4 rounded-lg font-medium transition-colors ${
            isLoading || !stripe || !elements || !clientSecret
              ? 'bg-gray-300 cursor-not-allowed text-gray-500'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          <span id="button-text">
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing...
              </div>
            ) : (
              `Pay ₹${orderTotal.toFixed(2)}`
            )}
          </span>
        </button>

        {/* Show any error or success messages */}
        {message && (
          <div className={`mt-4 p-3 rounded-lg text-center ${
            message.includes('succeeded') 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
};

export default CheckoutForm;