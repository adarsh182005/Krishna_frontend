import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import axios from 'axios';
import CheckoutForm from '../components/Payment/CheckoutForm';

// Load your Stripe publishable key from the .env file
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const PaymentPage = () => {
    const { orderId } = useParams();
    const [clientSecret, setClientSecret] = useState('');
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    useEffect(() => {
        const fetchOrderAndCreateIntent = async () => {
            try {
                const token = localStorage.getItem('userToken');
                if (!token) {
                    setLoading(false);
                    return;
                }
                const config = { headers: { Authorization: `Bearer ${token}` } };

                // 1. Fetch the order details to get the total price
                const { data: orderData } = await axios.get(
                    `${backendUrl}/api/orders/${orderId}`,
                    config
                );
                setOrder(orderData);

                // 2. Create the Payment Intent on your backend
                const { data: paymentData } = await axios.post(
                    `${backendUrl}/api/payment/create-payment-intent`,
                    { orderId }, // Send the orderId to the backend
                    config
                );
                setClientSecret(paymentData.clientSecret);
            } catch (error) {
                console.error('Failed to initialize payment', error);
            } finally {
                setLoading(false);
            }
        };

        if (orderId) {
            fetchOrderAndCreateIntent();
        }
    }, [orderId, backendUrl]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="ml-4 text-lg">Preparing secure payment...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 max-w-lg min-h-screen">
            <h1 className="text-3xl font-bold text-center my-6">Complete Your Payment</h1>
            {clientSecret && order ? (
                <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
                    <CheckoutForm orderId={orderId} orderTotal={order.totalPrice} />
                </Elements>
            ) : (
                <div className="text-center text-red-500">
                    <p>Could not initialize payment.</p>
                    <p>Please try again or contact support.</p>
                </div>
            )}
        </div>
    );
};

export default PaymentPage;