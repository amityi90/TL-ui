import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductCard from './components/ProductCard';
import ProductDrawer from './components/ProductDrawer';
import Footer from './components/Footer';
import CartPage from './components/CartPage';
import About from './components/About';
import Contact from './components/Contact';
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
                <main className="flex-grow pt-20 fade-in">
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
                  <section className="py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                      <div className="text-center max-w-2xl mx-auto mb-16">
                          <h2 className="text-3xl md:text-4xl font-serif mb-4">{c('collections.heading')}</h2>
                          <div className="h-1 w-20 bg-gold mx-auto mb-6"></div>
                          <p className="text-ink-muted">
                              {c('collections.body')}
                          </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
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
    <div className="font-sans antialiased text-ink bg-transparent flex flex-col min-h-screen">
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
