import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductCard from './components/ProductCard';
import ProductDrawer from './components/ProductDrawer';
import Footer from './components/Footer';
import CartPage from './components/CartPage';
import About from './components/About';
import Contact from './components/Contact';
import ConstellationDivider from './components/ConstellationDivider';
import { CartProvider } from './context/CartContext';
import { ContentProvider, useContent } from './context/ContentContext';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function Store() {
  const { c } = useContent();
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/products`, { signal: controller.signal });
        const data = await res.json();
        setProducts(Array.isArray(data?.data) ? data.data : []);
      } catch (error) {
        if (error.name === 'AbortError') return;
        console.error("Failed to fetch products:", error);
        setProducts([]);
      }
    };
    fetchProducts();
    return () => controller.abort();
  }, []);

  const [currentView, setCurrentView] = useState('home'); // 'home', 'cart', 'about', 'contact'

  // Covers programmatic view changes, e.g. CartPage's "Return to Shop".
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentView]);

  // Scrolls unconditionally. Setting the view to the one already active is a
  // no-op for React, so the effect above never re-runs — which made "Collections"
  // a dead click while already on the home page.
  const handleNavClick = (view) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
  };

  const closeDrawer = () => {
    setSelectedProduct(null);
  };

  const renderContent = () => {
    switch(currentView) {
        case 'cart':
            return (
                <main className="flex-grow pt-32 fade-in">
                    <CartPage onClose={() => setCurrentView('home')} apiUrl={apiUrl} />
                </main>
            );
        case 'about':
            return <About />;
        case 'contact':
            return <Contact />;
        case 'home':
        default:
            return (
                <>
                <Hero />
                <main className="flex-grow" id="collections">
                  <section className="py-28 md:py-44">
                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                      <div className="text-center max-w-xl mx-auto mb-20 md:mb-28">
                          <h2 className="font-serif font-light text-4xl md:text-5xl text-ivory mb-8">
                            {c('collections.heading')}
                          </h2>
                          <ConstellationDivider className="mb-8" />
                          <p className="text-muted leading-relaxed">
                              {c('collections.body')}
                          </p>
                      </div>

                      {/* Wide gutters: the restraint is what makes it read as a
                          gallery wall rather than a catalogue grid. */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 lg:gap-x-16 gap-y-20 md:gap-y-28">
                        {Array.isArray(products) && products.map((product) => (
                          <ProductCard
                            key={product.id}
                            product={product}
                            onClick={handleProductClick}
                          />
                        ))}
                      </div>
                    </div>
                  </section>
                </main>
                </>
            );
    }
  };

  return (
    <div className="font-sans antialiased text-muted bg-transparent flex flex-col min-h-screen">
      <Navbar
        onCartClick={() => handleNavClick(currentView === 'cart' ? 'home' : 'cart')}
        onNavClick={handleNavClick}
      />

      {renderContent()}

      <Footer onNavClick={handleNavClick} />

      <ProductDrawer
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={closeDrawer}
      />
    </div>
  );
}

function App() {
  return (
    <ContentProvider apiUrl={apiUrl}>
      <CartProvider>
        <Store />
      </CartProvider>
    </ContentProvider>
  );
}

export default App;
