import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const storedCartItems = localStorage.getItem('cartItems');
    if (storedCartItems) {
      setCartItems(JSON.parse(storedCartItems));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = async (product, qtyChange) => {
    const existItem = cartItems.find((x) => x._id === product._id);
    const newQty = (existItem ? existItem.qty : 0) + qtyChange;
    
    // --- New: Fetch current stock to validate request from the source of truth ---
    try {
        if (!backendUrl) {
             toast.error("Configuration error: Backend URL missing.");
             return;
        }

        const { data } = await axios.get(`${backendUrl}/api/products/${product._id}`);
        const currentStock = data.countInStock;

        if (newQty < 1) { // Prevent quantity from going below 1
             return; 
        }

        if (newQty > currentStock) {
            toast.error(`Cannot add. Only ${currentStock} units of ${product.name} left in stock.`);
            return; 
        }
    } catch (error) {
        console.error("Error fetching product stock:", error);
        toast.error("Could not verify product stock. Please try again.");
        return;
    }
    // --- End New Stock Check ---

    if (existItem) {
      setCartItems(
        cartItems.map((x) =>
          x._id === existItem._id ? { ...existItem, qty: newQty } : x
        )
      );
    } else {
      setCartItems([...cartItems, { ...product, qty: qtyChange }]);
    }
    
    if(qtyChange > 0) {
        toast.success(`${product.name} added to cart.`);
    }
  };

  const removeFromCart = (id) => {
    setCartItems(cartItems.filter((x) => x._id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;