import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Package, ArrowRight, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

// This page now serves as the Order Confirmation/Payment Disabled page.

const PaymentDisabledPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        const token = localStorage.getItem('userToken');
        if (!token) {
          setError('Authentication token not found.');
          setLoading(false);
          return;
        }

        // Fetch the newly created order details from the backend
        const response = await axios.get(
          `${backendUrl}/api/orders/${orderId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        // Normalize the order data structure (assuming orderItems and totalPrice)
        const orderData = {
          ...response.data,
          totalAmount: response.data.totalPrice || 0,
          items: response.data.orderItems || []
        };

        setOrder(orderData);
        toast('Your order was placed successfully!', { icon: '👏' });

      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Failed to load order details. Check your Orders page.');
        toast.error('Failed to load order details.');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderData();
    }
  }, [orderId, backendUrl]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <XCircle className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Order Placed!
          </h1>
          <p className="text-lg text-gray-600 mb-6 font-semibold border-b pb-4">
            Online payment is **TEMPORARILY DISABLED** for deployment purposes.
          </p>
          <p className="text-red-500 mb-6">
            **Your order has been recorded.** Please proceed to **Order History** to track its status (currently *Pending*).
          </p>
          
          {error && <p className="text-red-500 mb-4">{error}</p>}
          
          {order && (
            <div className="text-left bg-gray-100 p-6 rounded-lg mb-6 shadow-inner">
              <h3 className="font-bold text-lg text-gray-800 mb-2">Order Summary:</h3>
              <p className="text-sm text-gray-700 mb-1"><span className="font-medium">Order ID:</span> <span className="font-mono bg-gray-200 px-1 rounded">{order._id}</span></p>
              <p className="text-sm text-gray-700 mb-3"><span className="font-medium">Total:</span> <span className="font-bold text-xl text-red-600">₹{order.totalAmount.toFixed(2)}</span></p>
              
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  <li className='font-semibold'>Items:</li>
                  {order.items.map((item, index) => (
                      <li key={index} className='ml-4'>{item.name} x {item.qty} (₹{item.price.toFixed(2)})</li>
                  ))}
              </ul>

              <p className="mt-3 text-sm text-gray-600"><span className="font-medium">Payment Type:</span> {order.paymentMethod}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* BUTTON UPDATED TO SAY "Go to Order History" */}
            <button
              onClick={() => navigate('/orders')}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <Package className="w-5 h-5 mr-2" />
              Go to Order History
            </button>
            
            <button
              onClick={() => navigate('/products')}
              className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center"
            >
              Continue Shopping
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Export the component with the original name for the route configuration
export default PaymentDisabledPage;
