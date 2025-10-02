import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import CartContext from '../context/CartContext';
import { toast } from 'react-hot-toast';
import { ShoppingBag } from 'lucide-react'; // Import ShoppingBag icon

const ProductCard = ({ product }) => {
  const { addToCart, cartItems } = useContext(CartContext);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const getImageUrl = (image) => {
    if (image.startsWith('http://') || image.startsWith('https://')) {
      return image;
    }
    const imagePath = image.startsWith('/uploads/') ?
      image.substring('/uploads/'.length) :
      image.startsWith('/') ?
      image.substring(1) :
      image;
    return `${backendUrl}/uploads/${imagePath}`;
  };

  const imageUrl = getImageUrl(product.image);
  const cartItem = cartItems.find(item => item._id === product._id);
  const currentQtyInCart = cartItem ? cartItem.qty : 0;
  const isOutOfStock = product.countInStock === 0;
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
    addToCart(product, 1);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-gray-200">
      <Link to={`/products/${product._id}`}>
        <img src={imageUrl} alt={product.name} className="w-full h-60 object-cover" />
      </Link>
      <div className="p-6">
        <Link to={`/products/${product._id}`}>
          <h3 className="text-xl font-bold text-gray-900 hover:text-red-600 transition-colors">{product.name}</h3>
        </Link>
        <p className="text-gray-500 mt-2 text-sm">{product.description}</p>
        <p className="text-2xl font-extrabold text-red-600 mt-4">₹{product.price.toFixed(2)}</p>
        
        <p className={`mt-2 text-sm font-medium ${isOutOfStock ? 'text-red-500' : 'text-green-600'}`}>
            Stock: {isOutOfStock ? 'Out of Stock' : product.countInStock}
        </p>

        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock || isMaxQuantityReached}
          className={`mt-4 w-full flex items-center justify-center text-white px-6 py-3 rounded-full text-base font-semibold transition duration-300 ${
            isOutOfStock || isMaxQuantityReached
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          <ShoppingBag className="h-5 w-5 mr-2" />
          {isOutOfStock ? 'Out of Stock' : isMaxQuantityReached ? 'Max Reached' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;