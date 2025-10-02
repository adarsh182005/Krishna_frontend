import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import Login from './pages/Login';
import Register from './pages/Register';
import CartPage from './pages/CartPage';
import PaymentPage from './pages/PaymentPage';
import OrdersPage from './pages/OrdersPage';
import ProtectedRoute from './components/ProtectedRoute';
import ProductDetailPage from './pages/ProductDetailPage'; // New component import

const App = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* New Product Detail Page Route */}
        <Route path="/products/:id" element={<ProductDetailPage />} />

        {/* Protected Routes - require authentication */}
        <Route path="/cart" element={
          <ProtectedRoute>
            <CartPage />
          </ProtectedRoute>
        } />
        
        {/*
          This route now serves as the order confirmation page
          since the payment feature has been disabled.
        */}
        <Route path="/payment/:orderId" element={
          <ProtectedRoute>
            <PaymentPage />
          </ProtectedRoute>
        } />
        
        <Route path="/orders" element={
          <ProtectedRoute>
            <OrdersPage />
          </ProtectedRoute>
        } />
        
        {/* The original OrderSuccessPage route has been removed. */}

      </Routes>
    </Layout>
  );
};

export default App;