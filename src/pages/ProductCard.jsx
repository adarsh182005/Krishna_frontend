import React, { useContext } from 'react';
import CartContext from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useContext(CartContext);
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

  const handleAddToCart = () => {
    addToCart(product, 1);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <img src={imageUrl} alt={product.name} className="w-full h-60 object-cover" />
      <div className="p-6">
        <h3 className="text-2xl font-semibold text-gray-900">{product.name}</h3>
        <p className="text-gray-600 mt-2">{product.description}</p>
        <p className="text-xl font-bold text-red-600 mt-4">${product.price.toFixed(2)}</p>
        <button
          onClick={handleAddToCart}
          className="mt-4 inline-block bg-red-600 text-white px-6 py-3 rounded-full text-lg font-medium hover:bg-red-700 transition duration-300"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;