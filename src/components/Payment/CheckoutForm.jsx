import React, { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const CheckoutForm = ({ orderId, orderTotal }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);

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
      toast.error(error.message || 'An unexpected error occurred.');
      setIsLoading(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      try {
        const token = localStorage.getItem('userToken');
        await axios.put(
          `${import.meta.env.VITE_BACKEND_URL}/api/orders/${orderId}/pay`,
          {
            id: paymentIntent.id,
            status: paymentIntent.status,
            update_time: paymentIntent.created,
            payer: { email_address: 'default@example.com' } // Placeholder
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        toast.success('Payment Successful!');
        navigate(`/order-success/${orderId}`);
      } catch (err) {
        toast.error('Payment succeeded, but failed to update order status.');
        console.error(err);
        setIsLoading(false);
      }
    } else {
        toast.error('Payment was not successful. Please try again.');
        setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="mb-6">
        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
          <span className="font-medium">Total Amount:</span>
          <span className="text-2xl font-bold text-green-600">
            ₹{orderTotal.toFixed(2)}
          </span>
        </div>
      </div>

      <form id="payment-form" onSubmit={handleSubmit}>
        <PaymentElement id="payment-element" />
        
        <button
          disabled={isLoading || !stripe || !elements}
          id="submit"
          className={`w-full mt-6 py-3 px-4 rounded-lg font-bold text-white transition-colors ${
            isLoading || !stripe || !elements
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700'
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
      </form>
    </div>
  );
};

export default CheckoutForm;