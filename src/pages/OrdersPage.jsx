import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Eye, Calendar, CreditCard } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast'; // Import toast for errors/feedback

const OrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('userToken');
        if (!token) {
             // Handle case where token is missing (should be caught by ProtectedRoute, but good fallback)
            setError('Authentication required to view orders.');
            setLoading(false);
            return;
        }

        // Note: Assuming backend route is /api/orders/myorders (as per general e-commerce convention) 
        // OR /api/orders. Sticking to /api/orders which the user provided is the current fetch URL.
        const response = await axios.get(
          `${backendUrl}/api/orders`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        // The response data is expected to be the user's list of orders
        setOrders(response.data); 
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError('Failed to load orders. Please check your network connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [backendUrl]);

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'confirmed': 'bg-green-100 text-green-800',
      'processing': 'bg-blue-100 text-blue-800',
      'shipped': 'bg-purple-100 text-purple-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
      'payment_failed': 'bg-red-100 text-red-800'
    };
    // Use the simpler 'isDelivered' or 'isPaid' status from the Mongoose model 
    // until the full status pipeline is implemented in the backend.
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-green-100 text-green-800',
      'failed': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Order History Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/profile')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go to Profile
          </button>
        </div>
      </div>
    );
  }
  
  // Normalize the object structure from the backend (using orderItems and totalPrice)
  const normalizedOrders = orders.map(order => ({
      ...order,
      // Ensure 'items' exists for map function in the component body
      items: order.orderItems || [], 
      totalAmount: order.totalPrice || 0,
      // Use existing status if available, fallback to payment status from old schema
      status: order.isDelivered ? 'delivered' : (order.isPaid ? 'confirmed' : 'pending'),
      paymentStatus: order.isPaid ? 'completed' : 'pending' 
  }));

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">Track and manage your sweet orders</p>
        </div>

        {normalizedOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Orders Yet</h2>
            <p className="text-gray-600 mb-6">You haven't placed any orders yet. Start shopping for delicious sweets!</p>
            <button
              onClick={() => navigate('/products')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Shop Now
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {normalizedOrders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                  <div className="mb-4 lg:mb-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Order #{order._id.slice(-8)}
                    </h3>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                      Payment: {order.paymentStatus.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Items ({order.items.length})</h4>
                    <div className="space-y-2">
                      {order.items.slice(0, 3).map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {item.name} × {item.quantity || item.qty}
                          </span>
                          <span className="text-gray-900">
                            ₹{(item.price * (item.quantity || item.qty)).toFixed(2)}
                          </span>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <p className="text-sm text-gray-500">
                          +{order.items.length - 3} more items
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="font-semibold text-lg">₹{order.totalAmount.toFixed(2)}</span>
                    </div>
                    {/* Hiding paymentIntentId since payment is disabled */}
                    {/* order.paymentIntentId && (...) */}
                  </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <button
                    // Redirect to the Payment Page, which is now the Order Confirmation/Disabled Payment Page
                    onClick={() => navigate(`/payment/${order._id}`)}
                    className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </button>
                  
                  {/* Removed Complete Payment button since Stripe is disabled */}
                  
                  {order.status === 'delivered' && (
                    <button className="flex items-center justify-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
                      Rate Order
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
