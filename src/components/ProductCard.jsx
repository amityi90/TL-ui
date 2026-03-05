// src/components/ProductCard.jsx
import React from 'react';

const ProductCard = ({ product, onClick }) => {
  // Determine if product is new (e.g., created in the last 30 days)
  const isNew = (new Date() - new Date(product.createdAt)) / (1000 * 60 * 60 * 24) < 30;

  return (
    <div 
        onClick={() => onClick(product)}
        className="group relative w-full overflow-hidden bg-white shadow-sm hover:shadow-lg transition-all duration-300 rounded-lg cursor-pointer"
    >
      <div className="aspect-[3/4] w-full overflow-hidden bg-gray-200 relative">
        <img
          src={product.images[0]}
          alt={product.name}
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />
        {isNew && (
            <span className="absolute top-4 left-4 bg-black text-white text-xs uppercase tracking-widest py-1 px-3 z-10">
                New Arrival
            </span>
        )}
      </div>
      <div className="p-6 flex flex-col items-center text-center">
        <h3 className="font-serif text-2xl text-gray-900 mb-2">
            <span aria-hidden="true" className="absolute inset-0" />
            {product.name}
        </h3>
        <p className="text-gray-500 text-sm mb-1">{product.category}</p>
        <p className="font-medium text-lg text-gray-900 mt-2">${product.price.toFixed(2)}</p>
        
        {/* Simple visual cue that it's clickable on hover */}
        <p className="text-xs uppercase tracking-widest border-b border-black mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            View Details
        </p>
      </div>
    </div>
  );
};


export default ProductCard;
