import { useState } from "react";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { useCart } from "../context/CartContext";

const LINKS = [
  { label: "Collections", view: "home" },
  { label: "About", view: "about" },
  { label: "Contact", view: "contact" }
];

export default function Navbar({ onCartClick, onNavClick }) {
  const [isScrolled, setIsScrolled] = useState(false);
  // Previously there was no mobile navigation at all -- the links were hidden
  // below md, leaving the cart as the only reachable control on a phone.
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const { totalItems, isToastOpen } = useCart();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  const go = (view) => {
    setIsMenuOpen(false);
    onNavClick(view);
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
          isScrolled
            ? "bg-night/95 backdrop-blur-md border-b border-gold/25 py-4"
            : "bg-transparent border-b border-transparent py-6"
        }`}
      >
        {/* Three tracks so the wordmark stays optically centred regardless of how
            wide the links or the cart count get. */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center px-6 md:px-12">
          {/* Left: links on desktop, menu toggle on mobile */}
          <div className="justify-self-start">
            <div className="hidden md:flex gap-10 label-caps">
              {LINKS.map(({ label, view }) => (
                <button key={view} onClick={() => go(view)} className="nav-link">
                  {label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setIsMenuOpen((open) => !open)}
              className="md:hidden p-2 -ml-2 text-ivory hover:text-gold transition-colors"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                {isMenuOpen ? (
                  <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Centre: wordmark */}
          <button
            onClick={() => go("home")}
            className="justify-self-center font-serif font-light text-ivory text-lg md:text-2xl tracking-[0.35em] uppercase hover:text-gold transition-colors duration-500 pl-[0.35em]"
          >
            Tehila Levi
          </button>

          {/* Right: cart */}
          <button
            onClick={onCartClick}
            className="justify-self-end label-caps text-ivory hover:text-gold transition-colors duration-500 flex items-center gap-2"
          >
            <span className="hidden sm:inline">Cart</span>
            <svg className="w-4 h-4 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 5h14" />
            </svg>
            {totalItems > 0 && (
              <span className="w-5 h-5 flex items-center justify-center border border-gold/60 text-gold rounded-full text-[10px] leading-none">
                {totalItems}
              </span>
            )}
          </button>
        </div>

        {/* Mobile panel */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="md:hidden overflow-hidden bg-night/95 backdrop-blur-md"
            >
              <div className="flex flex-col items-center gap-7 py-10 border-t border-gold/20 mt-4">
                {LINKS.map(({ label, view }) => (
                  <button key={view} onClick={() => go(view)} className="label-caps text-ivory hover:text-gold transition-colors">
                    {label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Toast */}
      <AnimatePresence>
        {isToastOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-24 right-6 md:right-12 z-[100] bg-panel border border-gold/30 text-ivory label-caps px-6 py-4 shadow-2xl shadow-black/60"
          >
            Item Added to Cart
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
