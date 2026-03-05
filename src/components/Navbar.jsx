import { useState, useEffect } from "react";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { useCart } from "../context/CartContext";

export default function Navbar({ onCartClick, onNavClick }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();
  const { totalItems, isToastOpen } = useCart();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  return (
    <>
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out px-6 md:px-12 py-5 flex justify-between items-center ${
        isScrolled
          ? "bg-white/90 backdrop-blur-md text-gray-900 shadow-sm"
          : "bg-transparent text-white mix-blend-difference"
      }`}
    >
      {/* Brand Logo */}
      <button 
        className="text-xl md:text-2xl font-serif tracking-widest font-bold uppercase cursor-pointer" 
        onClick={() => onNavClick('home')}
      >
        TEHILA LEVI
      </button>

      {/* Desktop Links */}
      <div className="hidden md:flex gap-8 text-xs font-bold tracking-[0.15em] uppercase">
        <button onClick={() => onNavClick('home')} className="hover:opacity-60 transition-opacity">
          Collections
        </button>
        <button onClick={() => onNavClick('about')} className="hover:opacity-60 transition-opacity">
          About
        </button>
        <button onClick={() => onNavClick('contact')} className="hover:opacity-60 transition-opacity">
          Contact
        </button>
      </div>

      {/* Action / Icon Placeholder */}
      <div className="flex gap-4 text-xs font-bold tracking-widest uppercase">
        <button 
            onClick={onCartClick}
            className="hover:opacity-60 transition-opacity flex items-center gap-2"
        >
            Cart 
            {totalItems > 0 && (
                <span className="w-5 h-5 flex items-center justify-center bg-black text-white rounded-full text-[10px] leading-none">
                    {totalItems}
                </span>
            )}
        </button>
      </div>
    </nav>

    {/* Toast Notification */}
    <AnimatePresence>
        {isToastOpen && (
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="fixed top-20 right-6 md:right-12 z-[100] bg-black text-white px-6 py-3 text-xs uppercase tracking-widest shadow-lg"
            >
                Item Added to Cart
            </motion.div>
        )}
    </AnimatePresence>
    </>
  );
}