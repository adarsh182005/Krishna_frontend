import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { ShoppingBag, Star } from 'lucide-react';
import CartContext from '../context/CartContext';

const ProductDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart, cartItems } = useContext(CartContext);

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    // Helper function to get the current quantity of this product already in the cart
    const getQtyInCart = () => {
        const existingItem = cartItems.find(item => item._id === product?._id);
        return existingItem ? existingItem.qty : 0;
    };
    
    // Calculate maximum quantity user can add on this interaction
    const maxAddableQty = product ? product.countInStock - getQtyInCart() : 0;
    const currentQtyInCart = getQtyInCart();
    const isOutOfStock = product?.countInStock === 0;

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const { data } = await axios.get(`${backendUrl}/api/products/${id}`);
                setProduct(data);
                
                // Reset quantity selector based on stock
                if (data.countInStock === 0) {
                    setQuantity(0);
                } else {
                    // Ensure the initial quantity is not more than available stock
                    const initialQty = Math.min(1, data.countInStock);
                    setQuantity(initialQty);
                }
                
                setLoading(false);
            } catch (err) {
                setError('Product not found or an error occurred.');
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id, backendUrl]);

    // Handle adding selected quantity to cart
    const handleAddToCart = () => {
        if (!product) return;
        
        if (isOutOfStock) {
            toast.error('This product is currently out of stock.');
            return;
        }

        // The CartContext handles the ultimate stock check against total quantity,
        // but this local check provides immediate UX feedback.
        if (quantity > maxAddableQty) {
             toast.error(`You can only add ${maxAddableQty} more units to your cart.`);
             return;
        }
        
        // The addToCart function is designed to handle stock limits from the context itself
        // by calling the API, but we pass the selected quantity here.
        addToCart(product, quantity);
        setQuantity(1); // Reset quantity picker after adding to cart
    };

    // New Quantity Picker logic
    const handleQuantityChange = (change) => {
        const newQty = quantity + change;
        
        // 1. Must be at least 1
        // 2. Must not exceed the total stock 
        if (newQty >= 1 && newQty <= product.countInStock) {
            setQuantity(newQty);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !product) {
        return <div className="text-center text-red-500 mt-10 text-xl font-semibold">{error || "Product data not available."}</div>;
    }
    
    const qtyPickerMax = product.countInStock;
    const isMaxQtySelected = quantity === qtyPickerMax;
    const totalQtyInCart = currentQtyInCart + quantity;

    // Use this function to normalize the image path for display
    const getImagePath = () => {
        if (product.image.startsWith('http')) return product.image;
        const path = product.image.split('/uploads/').pop();
        return `${backendUrl}/uploads/${path}`;
    };


    return (
        <div className="container mx-auto p-4 md:p-8 min-h-screen">
            <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline mb-6">
                ← Back to Products
            </button>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col md:flex-row">
                <div className="md:w-1/2">
                    <img 
                        src={getImagePath()} 
                        alt={product.name} 
                        className="w-full h-full object-cover" 
                        onError={(e) => e.target.src = '/placeholder-sweet.jpg'}
                    />
                </div>
                <div className="md:w-1/2 p-6 md:p-10">
                    <h1 className="text-4xl font-bold text-gray-900 mb-3">{product.name}</h1>
                    <p className="text-red-600 text-3xl font-extrabold mb-4">₹{product.price.toFixed(2)}</p>
                    
                    <div className="flex items-center text-yellow-500 mb-4">
                        {/* Placeholder for ratings - you can implement logic here later */}
                        <Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" />
                        <Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" />
                        <Star className="w-5 h-5 text-gray-300" />
                        <span className="ml-2 text-gray-600 text-sm">(4.0 / 5 Reviews)</span>
                    </div>

                    <p className="text-gray-700 leading-relaxed mb-6">
                        {product.description}
                    </p>

                    <div className="flex flex-col mb-6 space-y-4">
                        <div className="flex items-center space-x-4">
                            <span className="font-semibold text-lg text-gray-800">Quantity:</span>
                            <div className="flex items-center border rounded-lg overflow-hidden">
                                <button
                                    onClick={() => handleQuantityChange(-1)}
                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                                    disabled={quantity <= 1}
                                >
                                    -
                                </button>
                                <span className="px-4 py-2 border-l border-r text-lg font-semibold">{quantity}</span>
                                <button
                                    onClick={() => handleQuantityChange(1)}
                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                                    disabled={quantity >= qtyPickerMax || isMaxQtySelected}
                                >
                                    +
                                </button>
                            </div>
                        </div>
                        <div className={`text-sm font-medium ${isOutOfStock ? 'text-red-600' : 'text-green-600'}`}>
                            {isOutOfStock ? 
                                'Currently Out of Stock' : 
                                `Only ${product.countInStock} available. (In Cart: ${currentQtyInCart})`
                            }
                        </div>
                    </div>

                    <button
                        onClick={handleAddToCart}
                        disabled={isOutOfStock || totalQtyInCart > product.countInStock}
                        className={`w-full py-4 rounded-full font-bold text-white text-xl transition duration-300 ${
                            isOutOfStock || totalQtyInCart > product.countInStock
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-red-600 hover:bg-red-700'
                        }`}
                    >
                        <ShoppingBag className="inline-block w-6 h-6 mr-3" />
                        {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                </div>
            </div>
            
            {/* Placeholder for Reviews Section */}
            <div className="mt-10 p-6 bg-white rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
                <p className="text-gray-500">This section is a placeholder for future development of customer reviews and ratings.</p>
            </div>
            
        </div>
    );
};

export default ProductDetailPage;
