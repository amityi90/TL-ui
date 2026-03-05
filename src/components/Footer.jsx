// src/components/Footer.jsx
import React from 'react';

const Footer = ({ onNavClick }) => {
    return (
        <footer className="bg-gray-50 pt-16 pb-12 border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand / About */}
                    <div className="col-span-1 md:col-span-1">
                        <span className="font-serif text-2xl font-bold tracking-tight text-gray-900">TL SHOP</span>
                        <p className="mt-6 text-gray-500 text-sm leading-relaxed">
                            Crafting elegance for the modern lifestyle. Quality materials, timeless design, and sustainable practices.
                        </p>
                    </div>

                    {/* Navigation Menu */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-6">Shop</h3>
                        <ul className="space-y-4">
                            <li><button onClick={() => onNavClick && onNavClick('home')} className="text-base text-gray-500 hover:text-gray-900 transition-colors">New Arrivals</button></li>
                            <li><button onClick={() => onNavClick && onNavClick('about')} className="text-base text-gray-500 hover:text-gray-900 transition-colors">About Us</button></li>
                            <li><button onClick={() => onNavClick && onNavClick('contact')} className="text-base text-gray-500 hover:text-gray-900 transition-colors">Contact</button></li>
                        </ul>
                    </div>

                    {/* Support / Navigator */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-6">Support</h3>
                        <ul className="space-y-4">
                            <li><a href="#" className="text-base text-gray-500 hover:text-gray-900 transition-colors">Contact Us</a></li>
                            <li><a href="#" className="text-base text-gray-500 hover:text-gray-900 transition-colors">FAQs</a></li>
                            <li><a href="#" className="text-base text-gray-500 hover:text-gray-900 transition-colors">Shipping & Returns</a></li>
                            <li><a href="#" className="text-base text-gray-500 hover:text-gray-900 transition-colors">Size Guide</a></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-6">Stay Connected</h3>
                        <p className="text-gray-500 text-sm mb-4">Subscribe to receive updates, access to exclusive deals, and more.</p>
                        <form className="flex flex-col gap-2">
                            <input 
                                type="email" 
                                placeholder="Enter your email" 
                                className="px-4 py-2 border border-gray-300 focus:ring-1 focus:ring-black focus:border-black outline-none transition-colors"
                            />
                            <button 
                                type="button" 
                                className="bg-black text-white px-4 py-2 text-sm uppercase tracking-widest hover:bg-gray-800 transition-colors"
                            >
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>

                <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-400">
                        &copy; {new Date().getFullYear()} TL Shop. All rights reserved.
                    </p>
                    <div className="flex space-x-6">
                        <a href="#" className="text-gray-400 hover:text-gray-500">
                            <span className="sr-only">Instagram</span>
                            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772 4.902 4.902 0 011.772-1.153c.636-.247 1.363-.416 2.427-.465 1.067-.047 1.409-.06 3.809-.06H12.315zm0 2.163c-2.41 0-2.749.01-3.696.054-.973.045-1.504.207-1.856.344-.469.182-.806.4-1.15.748-.344.344-.562.681-.744 1.15-.137.353-.3.882-.344 1.857-.047.953-.056 1.288-.056 3.795l-.001.27c0 2.435.006 2.766.05 3.68.045.973.207 1.504.344 1.856.182.469.4.806.748 1.15.344.344.681.562 1.15.744.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.64-.045.973-.045 1.504-.207 1.856-.344.469-.182.806-.4 1.15-.748.344-.344.562-.681.744-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.045-3.64-.045-.973-.207-1.504-.344-1.856-.182-.469-.4-.806-.748-1.15-.344-.344-.681-.562-1.15-.744-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.054-3.807-.054l-.63-.002zm0 5.038a5.275 5.275 0 110 10.55 5.275 5.275 0 010-10.55zm0 1.993a3.282 3.282 0 100 6.564 3.282 3.282 0 000-6.564zm5.33-4.52a1.325 1.325 0 110 2.65 1.325 1.325 0 010-2.65z" clipRule="evenodd" />
                            </svg>
                        </a>
                        <a href="#" className="text-gray-400 hover:text-gray-500">
                             <span className="sr-only">Twitter</span>
                             <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
