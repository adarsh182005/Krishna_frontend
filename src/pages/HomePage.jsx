import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const backgroundImageUrl = `${import.meta.env.VITE_BACKEND_URL}/uploads/Home_bg_white.png`; 

  return (
    <section
      className="relative min-h-screen w-full bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: `url(${backgroundImageUrl})` }}
    >
      <div className="absolute inset-0 bg-black/60"></div> {/* Darkened overlay */}

      <div className="relative z-10 text-center px-6 max-w-4xl">
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-white leading-tight drop-shadow-lg font-['Playfair_Display']">
          A Taste of Sweet Perfection
        </h1>

        <p className="mt-8 text-xl sm:text-2xl text-gray-200 leading-relaxed max-w-2xl mx-auto">
          Discover the finest sweets, crafted with love and perfection. 
          Your journey to happiness begins here.
        </p>

        <div className="mt-12">
          <Link
            to="/products"
            className="inline-block bg-red-600 text-white px-10 py-5 rounded-full text-xl font-semibold 
                       shadow-xl hover:bg-red-700 hover:scale-105 transform transition duration-300 tracking-wide"
          >
            Shop Now
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HomePage;