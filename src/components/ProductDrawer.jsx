import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';

// --- Lightbox Component ---
const Lightbox = ({ images, initialIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [direction, setDirection] = useState(0);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') paginate(-1);
      if (e.key === 'ArrowRight') paginate(1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, onClose]);

  const paginate = (newDirection) => {
    setDirection(newDirection);
    let newIndex = currentIndex + newDirection;
    if (newIndex < 0) newIndex = images.length - 1;
    if (newIndex >= images.length) newIndex = 0;
    setCurrentIndex(newIndex);
  };

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-void/95 flex flex-col justify-center items-center"
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-2 text-ink-muted hover:text-gold transition-colors z-50"
      >
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Main Image Area */}
      <div className="relative w-full h-[80vh] flex items-center justify-center overflow-hidden">
        <AnimatePresence initial={false} custom={direction}>
            <motion.img
            key={currentIndex}
            src={images[currentIndex]}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(e, { offset, velocity }) => {
                const swipe = Math.abs(offset.x) * velocity.x;

                if (swipe < -10000) {
                paginate(1);
                } else if (swipe > 10000) {
                paginate(-1);
                }
            }}
            className="absolute max-w-full max-h-full object-contain pointer-events-auto cursor-grab active:cursor-grabbing"
            />
        </AnimatePresence>

        {/* Navigation Arrows */}
        {images.length > 1 && (
            <>
                <button
                    className="absolute left-4 md:left-8 p-4 text-ink-faint hover:text-gold transition-colors z-20"
                    onClick={() => paginate(-1)}
                >
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <button
                    className="absolute right-4 md:right-8 p-4 text-ink-faint hover:text-gold transition-colors z-20"
                    onClick={() => paginate(1)}
                >
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </>
        )}
      </div>

      {/* Footer / Indicator */}
      <div className="absolute bottom-10 left-0 right-0 flex flex-col items-center gap-4 text-ink">
        <span className="text-xs tracking-[0.2em] font-light text-ink-muted">
            {String(currentIndex + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
        </span>
        {/* Progress Bar Line */}
        <div className="w-64 h-[1px] bg-hairline relative">
            <motion.div 
                className="absolute top-0 bottom-0 bg-gold h-full"
                layout
                initial={false}
                animate={{
                    left: `${(currentIndex / images.length) * 100}%`,
                    width: `${(1 / images.length) * 100}%`
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
        </div>
      </div>
    </motion.div>
  );
};

export default function ProductDrawer({ product, isOpen, onClose }) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const { addToCart } = useCart();

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Reset lightbox state when drawer closes
  useEffect(() => {
    if (!isOpen) setIsLightboxOpen(false);
  }, [isOpen]);

  const handleAddToCart = () => {
    if (product) {
        addToCart(product);
        // Optional: Close drawer after adding?
        // onClose(); 
    }
  };

  return (
    <>
    <AnimatePresence>
      {isOpen && product && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-void/70 backdrop-blur-xl"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 z-[70] w-full md:w-2/3 bg-overlay border-r border-hairline shadow-2xl flex flex-col md:flex-row h-full overflow-hidden"
          >
            {/* Close Button (Absolute position to overlays content) */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-ink-muted hover:text-gold transition-colors z-20 bg-void/60 rounded-full md:bg-transparent"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Left Column: Image */}
            <div 
                className="w-full md:w-1/2 h-64 md:h-full relative bg-surface cursor-zoom-in group overflow-hidden"
                onClick={() => setIsLightboxOpen(true)}
            >
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
               <div className="absolute inset-0 bg-void/0 group-hover:bg-void/40 transition-colors duration-300 flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 text-ink tracking-widest text-xs uppercase bg-void/70 border border-hairline px-4 py-2 rounded-full backdrop-blur-sm transition-opacity duration-300">
                        View Gallery
                    </span>
                </div>
            </div>

            {/* Right Column: Details */}
            <div className="w-full md:w-1/2 h-full flex flex-col overflow-y-auto no-scrollbar p-8 md:p-12 lg:p-16">
              
              <div className="flex-1">
                <p className="text-sm text-ink-muted mb-2 uppercase tracking-wider">{product.category}</p>
                <h2 className="text-3xl md:text-4xl font-serif text-ink mb-4">{product.name}</h2>
                <p className="text-xl font-medium text-gold mb-8">${product.price.toFixed(2)}</p>

                <div className="prose prose-sm text-ink-muted mb-10">
                  <h3 className="text-ink text-xs font-bold uppercase tracking-widest mb-4">Description</h3>
                  <p className="leading-relaxed text-base">{product.description}</p>
                </div>

                <div className="mb-10">
                  <h3 className="text-ink text-xs font-bold uppercase tracking-widest mb-4">Details & Materials</h3>
                  <ul className="text-sm text-ink-muted space-y-3">
                    <li className="flex justify-between border-b border-hairline pb-2">
                        <span>Material</span>
                        <span className="font-medium text-ink">{product.material}</span>
                    </li>
                    <li className="flex justify-between border-b border-hairline pb-2">
                        <span>In Stock</span>
                        <span className="font-medium text-ink">{product.stockCount} units</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-auto pt-6">
                <button 
                  onClick={handleAddToCart}
                  className="w-full bg-gold text-void font-medium text-sm uppercase tracking-[0.2em] py-4 hover:bg-gold-soft transition-colors duration-300 active:scale-[0.98]"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>

    {/* Lightbox Overlay */}
    <AnimatePresence>
        {isLightboxOpen && product && (
            <Lightbox 
                images={product.images} 
                initialIndex={0} 
                onClose={() => setIsLightboxOpen(false)} 
            />
        )}
    </AnimatePresence>
    </>
  );
}
