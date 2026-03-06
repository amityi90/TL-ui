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

function Store() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [apiUrl] = useState('https://zukpyagzmf.eu-west-3.awsapprunner.com');
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/products`);
        const data = await res.json();
        
        // Log to see what the backend is actually returning
        console.log("API Response:", data);

        // Handle different response structures
        if (Array.isArray(data)) {
            setProducts(data);
        } else if (data && Array.isArray(data.products)) {
            // If backend returns { products: [...] }
            setProducts(data.products); 
        } else if (data && Array.isArray(data.data)) {
             // If backend returns { data: [...] }
            setProducts(data.data);
        } else {
            console.error("Unexpected API response format:", data);
            setProducts([]); // Fallback to empty array to prevent crash
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setProducts([]);
      }
    };
    fetchProducts();
  }, []);

  const [currentView, setCurrentView] = useState('home'); // 'home', 'cart', 'about', 'contact'

  // Update navbar to scroll back to top on view change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentView]);

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
                  <section className="py-20 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                      <div className="text-center max-w-2xl mx-auto mb-16">
                          <h2 className="text-3xl md:text-4xl font-serif mb-4">Latest Arrivals</h2>
                          <div className="h-1 w-20 bg-black mx-auto mb-6"></div>
                          <p className="text-gray-500">
                              Discover our curated selection of premium goods, designed for the modern connoisseur.
                          </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                        {Array.isArray(products) && products.map((product) => (
                          <ProductCard 
                            key={product._id} 
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
    <div className="font-sans antialiased text-gray-900 bg-white flex flex-col min-h-screen">
      <Navbar 
        onCartClick={() => setCurrentView(currentView === 'cart' ? 'home' : 'cart')} 
        onNavClick={(view) => setCurrentView(view)}
      />
      
      {renderContent()}

      <Footer onNavClick={(view) => setCurrentView(view)} />
      
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
    <CartProvider>
      <Store />
    </CartProvider>
  );
}

export default App;
