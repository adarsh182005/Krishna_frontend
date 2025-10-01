import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo_english.png';
import UserContext from '../context/UserContext';
import CartContext from '../context/CartContext';

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
            Sweet Shop
          </Link>
          <nav className="flex space-x-4 items-center">
            <Link to="/products" className="text-gray-600 hover:text-gray-900 transition-colors duration-200">
              Products
            </Link>
            <Link to="/cart" className="text-gray-600 hover:text-gray-900 transition-colors duration-200 relative">
              Cart
              {cartItems.length > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full -translate-y-1/2 translate-x-1/2">
                  {cartItems.reduce((acc, item) => acc + item.qty, 0)}
                </span>
              )}
            </Link>
            {user ? (
              <button
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Logout
              </button>
            ) : (
              <>
                <Link to="/login" className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                  Login
                </Link>
                <Link to="/register" className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* This is the main content area with no container class or padding */}
      <main className="">{children}</main>
    </div>
  );
};

export default Layout;