import React, { useContext } from 'react';
import { Link } from 'react-router-dom'; // Import Link
import CartContext from '../context/CartContext';
import { toast } from 'react-hot-toast'; 

const ProductCard = ({ product }) => {
  const { addToCart, cartItems } = useContext(CartContext);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Determine the correct image URL based on whether it's an external link or a local path.
  const getImageUrl = (image) => {
    if (image.startsWith('http://') || image.startsWith('https://')) {
      return image;
    }
    // Logic for local path (from uploaded files)
    const imagePath = image.startsWith('/uploads/') ?
      image.substring('/uploads/'.length) :
      image.startsWith('/') ?
      image.substring(1) :
      image;
    return `${backendUrl}/uploads/${imagePath}`;
  };

  const imageUrl = getImageUrl(product.image);

  // Check current quantity in cart
  const cartItem = cartItems.find(item => item._id === product._id);
  const currentQtyInCart = cartItem ? cartItem.qty : 0;
  
  const isOutOfStock = product.countInStock === 0;
  // Check if adding 1 more would exceed current stock (based on local data for immediate UI feedback)
  const isMaxQuantityReached = currentQtyInCart >= product.countInStock;


  const handleAddToCart = () => {
    if (isOutOfStock) {
        toast.error('This product is currently out of stock.');
        return;
    }
    if (isMaxQuantityReached) {
        toast.error('You have the maximum available quantity in your cart.');
        return;
    }
    // Request to add 1. The CartContext will perform the final stock validation with the backend.
    addToCart(product, 1);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Wrap image in Link */}
      <Link to={`/products/${product._id}`}>
        <img src={imageUrl} alt={product.name} className="w-full h-60 object-cover" />
      </Link>
      <div className="p-6">
        {/* Wrap name in Link */}
        <Link to={`/products/${product._id}`}>
          <h3 className="text-2xl font-semibold text-gray-900 hover:text-red-600 transition-colors">{product.name}</h3>
        </Link>
        <p className="text-gray-600 mt-2">{product.description}</p>
        <p className="text-xl font-bold text-red-600 mt-4">₹{product.price.toFixed(2)}</p>
        
        <p className={`mt-2 text-sm font-medium ${isOutOfStock ? 'text-red-500' : 'text-green-600'}`}>
            Stock: {isOutOfStock ? 'Out of Stock' : product.countInStock}
        </p>

        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock || isMaxQuantityReached}
          className={`mt-4 inline-block text-white px-6 py-3 rounded-full text-lg font-medium transition duration-300 ${
            isOutOfStock || isMaxQuantityReached
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          {isOutOfStock ? 'Out of Stock' : isMaxQuantityReached ? 'Max Reached' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;