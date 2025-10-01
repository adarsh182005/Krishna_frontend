import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, CreditCard } from 'lucide-react';
import CartContext from '../context/CartContext';
import { UserContext } from '../context/UserContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const CartPage = () => {
  const { cartItems, addToCart, removeFromCart, clearCart } = useContext(CartContext);
  const { user } = useContext(UserContext); // Get user object directly from context
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [loading, setLoading] = useState(false);

  const calculateTotal = () => {
    return cartItems
      .reduce((acc, item) => acc + item.qty * item.price, 0)
      .toFixed(2);
  };

  const handleIncrement = (product) => {
    addToCart(product, 1);
  };

  const handleDecrement = (product) => {
    if (product.qty > 1) {
      addToCart(product, -1);
    } else {
      removeFromCart(product._id);
    }
  };

  const handleRemove = (id) => {
    removeFromCart(id);
  };

  // Normalize image path just like in ProductCard
  const getImageUrl = (image) => {
    // Check if the image is a full URL (starts with http or https)
    if (image.startsWith('http')) {
      return image;
    }
    // If it's a local path, prepend the backend URL
    const imagePath = image.startsWith('/uploads/') ?
      image.substring('/uploads/'.length) :
      image.startsWith('/') ?
      image.substring(1) :
      image;
    return `${backendUrl}/uploads/${imagePath}`;
  };

  const handleCheckout = async () => {
    // Check if user is logged in using the user context
    if (!user || !user.token) {
      toast.error('You must be logged in to proceed to checkout.');
      navigate('/login', { state: { from: '/cart' } });
      return;
    }

    try {
      setLoading(true);
      
      // Calculate total
      const totalAmount = parseFloat(calculateTotal());

      // Create order
      const orderData = {
        orderItems: cartItems.map(item => ({
          name: item.name,
          qty: item.qty,
          image: item.image,
          price: item.price,
          product: item._id // Use `product` to match the backend schema
        })),
        totalPrice: totalAmount,
        paymentMethod: 'Stripe', // Assuming a default payment method
        shippingAddress: { // Placeholder shipping address
          address: '123 Sweet Street',
          city: 'Candy Town',
          postalCode: '12345',
          country: 'India'
        }
      };

      const response = await axios.post(
        `${backendUrl}/api/orders`,
        orderData,
        {
          headers: {
            // Correctly retrieve the token from the user context
            'Authorization': `Bearer ${user.token}`, 
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data._id) {
        // Clear cart after successful order creation
        clearCart();
        toast.success('Order created successfully!');
        // Redirect to payment page
        navigate(`/payment/${response.data._id}`);
      }
    } catch (error) {
      console.error('Error creating order:', error);
      
      // Better error handling
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Failed to create order. Please try again.';
      
      // Replaced alert with toast for a better user experience
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800 flex items-center justify-center">
          <ShoppingBag className="mr-3 text-red-600" />
          Your Shopping Cart
        </h1>
        
        {cartItems.length === 0 ? (
          <div className="text-center text-gray-500 bg-white rounded-lg shadow-md p-12">
            <ShoppingBag className="mx-auto h-24 w-24 text-gray-300 mb-4" />
            <p className="text-2xl font-semibold mb-2">Your cart is empty</p>
            <p className="text-lg mb-6">Looks like you haven't added any delicious sweets yet!</p>
            <Link
              to="/products"
              className="inline-flex items-center bg-red-600 text-white px-8 py-3 rounded-full text-lg font-medium hover:bg-red-700 transition duration-300 shadow-lg"
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="flex flex-col xl:flex-row gap-8">
            {/* Cart Items */}
            <div className="xl:w-2/3">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-6 text-gray-800">
                  Cart Items ({cartItems.length})
                </h2>
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div
                      key={item._id}
                      className="flex items-center bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-md mr-4 shadow-sm"
                        onError={(e) => {
                          e.target.src = '/placeholder-sweet.jpg'; // Add a placeholder image
                        }}
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800 mb-1">
                          {item.name}
                        </h3>
                        <p className="text-gray-600 font-medium">₹{item.price.toFixed(2)} each</p>
                      </div>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-3 bg-white rounded-lg border px-3 py-2">
                        <button
                          onClick={() => handleDecrement(item)}
                          className="text-gray-600 hover:text-red-600 font-bold text-lg w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 transition-colors"
                        >
                          -
                        </button>
                        <span className="font-semibold text-lg min-w-[2rem] text-center">{item.qty}</span>
                        <button
                          onClick={() => handleIncrement(item)}
                          className="text-gray-600 hover:text-green-600 font-bold text-lg w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 transition-colors"
                        >
                          +
                        </button>
                      </div>
                      
                      {/* Item Total */}
                      <p className="ml-6 text-lg font-bold text-gray-800 min-w-[4rem]">
                        ₹{(item.price * item.qty).toFixed(2)}
                      </p>
                      
                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemove(item._id)}
                        className="ml-4 text-gray-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors"
                        title="Remove item"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="xl:w-1/3">
              <div className="bg-white p-6 rounded-lg shadow-md sticky top-4">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">
                  Order Summary
                </h2>
                
                {/* Order Details */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Items ({cartItems.length}):</span>
                    <span>₹{calculateTotal()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery:</span>
                    <span className="text-green-600 font-medium">FREE</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax:</span>
                    <span>Included</span>
                  </div>
                  <hr className="border-gray-300" />
                  <div className="flex justify-between text-xl font-bold text-gray-900">
                    <span>Total:</span>
                    <span>₹{calculateTotal()}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button 
                  onClick={handleCheckout}
                  disabled={loading || cartItems.length === 0}
                  className="w-full bg-red-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Creating Order...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-3 h-5 w-5" />
                      Proceed to Payment
                    </>
                  )}
                </button>

                {/* Security Notice */}
                <div className="mt-4 text-center text-sm text-gray-500">
                  <p className="flex items-center justify-center">
                    <svg className="w-4 h-4 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    Secure Checkout
                  </p>
                </div>

                {/* Continue Shopping Link */}
                <div className="mt-6 text-center">
                  <Link
                    to="/products"
                    className="text-red-600 hover:text-red-800 font-medium underline"
                  >
                    ← Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;