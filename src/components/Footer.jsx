// src/components/Footer.jsx
import React from 'react';

// Only links that actually go somewhere. The previous footer carried a Support
// column, a newsletter form and social icons that were all inert placeholders.
const links = [
    { label: 'Collections', view: 'home' },
    { label: 'About', view: 'about' },
    { label: 'Contact', view: 'contact' },
];

const Footer = ({ onNavClick }) => {
    return (
        <footer className="bg-gray-50 border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <button
                        onClick={() => onNavClick('home')}
                        className="font-serif text-xl tracking-widest uppercase text-gray-900 hover:opacity-60 transition-opacity"
                    >
                        Tehila Levi
                    </button>

                    {/* Matches the Navbar's link treatment so the two read as one system */}
                    <nav className="flex gap-8 text-xs font-bold tracking-[0.15em] uppercase text-gray-900">
                        {links.map(({ label, view }) => (
                            <button
                                key={view}
                                onClick={() => onNavClick(view)}
                                className="hover:opacity-60 transition-opacity"
                            >
                                {label}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="border-t border-gray-200 mt-10 pt-8 text-center md:text-left">
                    <p className="text-sm text-gray-400">
                        &copy; {new Date().getFullYear()} Tehila Levi. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
