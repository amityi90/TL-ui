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
      className="fixed inset-0 z-[100] bg-velvet/98 flex flex-col justify-center items-center"
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-8 right-8 p-2 text-muted hover:text-gold transition-colors duration-500 z-50"
      >
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                    className="absolute left-4 md:left-10 p-4 text-faint hover:text-gold transition-colors duration-500 z-20"
                    onClick={() => paginate(-1)}
                >
                    <svg className="w-9 h-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <button
                    className="absolute right-4 md:right-10 p-4 text-faint hover:text-gold transition-colors duration-500 z-20"
                    onClick={() => paginate(1)}
                >
                    <svg className="w-9 h-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </>
        )}
      </div>

      {/* Footer / Indicator */}
      <div className="absolute bottom-12 left-0 right-0 flex flex-col items-center gap-5">
        <span className="label-caps text-faint text-[10px]">
            {String(currentIndex + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
        </span>
        {/* Progress Bar Line */}
        <div className="w-64 h-px bg-gold/20 relative">
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
            className="fixed inset-0 z-[60] bg-velvet/80 backdrop-blur-xl"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 z-[70] w-full md:w-2/3 bg-panel border-r border-gold/20 shadow-2xl shadow-black/60 flex flex-col md:flex-row h-full overflow-hidden"
          >
            {/* Close Button (Absolute position to overlays content) */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-muted hover:text-gold transition-colors duration-500 z-20 bg-night/60 rounded-full md:bg-transparent"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Left Column: Image */}
            <div
                className="w-full md:w-1/2 h-72 md:h-full relative bg-velvet cursor-zoom-in group overflow-hidden"
                onClick={() => setIsLightboxOpen(true)}
            >
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
              <div className="pointer-events-none absolute inset-6 border border-gold/0 group-hover:border-gold/30 transition-colors duration-500" />
              <div className="absolute inset-0 flex items-end justify-center pb-10">
                    <span className="label-caps text-[10px] opacity-0 group-hover:opacity-100 text-ivory bg-night/70 border border-gold/25 px-5 py-3 backdrop-blur-sm transition-opacity duration-500">
                        View Gallery
                    </span>
                </div>
            </div>

            {/* Right Column: Details */}
            <div className="w-full md:w-1/2 h-full flex flex-col overflow-y-auto no-scrollbar p-10 md:p-14 lg:p-20">

              <div className="flex-1">
                <p className="label-caps text-gold mb-5">{product.category}</p>
                <h2 className="font-serif font-light text-4xl md:text-5xl text-ivory mb-6 leading-[1.1]">{product.name}</h2>
                <p className="label-caps text-gold text-xs mb-12">${product.price.toFixed(2)}</p>

                <hr className="hairline mb-10" />

                <div className="mb-12">
                  <h3 className="label-caps text-faint text-[10px] mb-5">Description</h3>
                  <p className="leading-[1.9] text-muted">{product.description}</p>
                </div>

                <hr className="hairline mb-10" />

                <div className="mb-12">
                  <h3 className="label-caps text-faint text-[10px] mb-6">Details &amp; Materials</h3>
                  <ul className="text-sm text-muted space-y-4">
                    <li className="flex justify-between border-b border-gold/15 pb-3">
                        <span>Material</span>
                        <span className="text-ivory">{product.material}</span>
                    </li>
                    <li className="flex justify-between border-b border-gold/15 pb-3">
                        <span>In Stock</span>
                        <span className="text-ivory">{product.stockCount} units</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-auto pt-8">
                <button onClick={handleAddToCart} className="btn-gold w-full">
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
