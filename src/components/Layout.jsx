import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo_english.png';
import UserContext from '../context/UserContext';
import CartContext from '../context/CartContext';
import { ShoppingBag, LogIn, UserPlus } from 'lucide-react'; // Import icons

const Layout = ({ children }) => {
  const { user, logout } = useContext(UserContext);
  const { cartItems } = useContext(CartContext);

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-md py-4">
        <div className="container mx-auto flex justify-between items-center px-4">
          <Link to="/" className="text-2xl font-bold text-gray-800 flex items-center">
            <img src={logo} alt="Sweet Shop Logo" className="h-10 mr-2" />
            <span className="font-['Playfair_Display']">Sweet Shop</span> {/* Added a more classy font */}
          </Link>
          <nav className="flex space-x-6 items-center">
            <Link to="/products" className="text-gray-600 hover:text-red-600 transition-colors duration-200 font-medium">
              Products
            </Link>
            <Link to="/cart" className="text-gray-600 hover:text-red-600 transition-colors duration-200 relative">
              <ShoppingBag className="w-6 h-6" /> {/* Icon for cart */}
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full -translate-y-1/2 translate-x-1/2">
                  {cartItems.reduce((acc, item) => acc + item.qty, 0)}
                </span>
              )}
            </Link>
            {user ? (
              <>
                <Link to="/profile" className="text-gray-600 hover:text-red-600 transition-colors duration-200 font-medium">
                  Profile
                </Link>
                <button
                  onClick={logout}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="flex items-center text-gray-800 hover:text-red-600 font-medium">
                  <LogIn className="mr-2" /> Login
                </Link>
                <Link to="/register" className="flex items-center bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-full transition-colors">
                  <UserPlus className="mr-2" /> Register
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="">{children}</main>
    </div>
  );
};

export default Layout;