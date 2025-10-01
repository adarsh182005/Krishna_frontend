import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  // Construct the full URL to the image using the backend's address
  const backgroundImageUrl = `${import.meta.env.VITE_BACKEND_URL}/uploads/Home_bg_white.png`; 

  return (
    <section
      className="relative min-h-screen w-full bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: `url(${backgroundImageUrl})` }}
    >
      <div className="absolute inset-0 bg-black/50"></div>

      <div className="relative z-10 text-center px-6 max-w-3xl">
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white drop-shadow-xl">
          A Taste of Sweet Perfection
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-gray-200 leading-relaxed">
          Discover the finest sweets, crafted with love and perfection. 
          Your journey to happiness begins here.
        </p>

        <div className="mt-10 flex justify-center">
          <Link
            to="/products"
            className="inline-block bg-red-600 text-white px-8 py-4 rounded-full text-lg font-semibold 
                       shadow-lg hover:bg-red-700 hover:scale-105 transform transition duration-300"
          >
            Shop Now
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HomePage;
