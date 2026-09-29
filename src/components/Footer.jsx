// src/components/Footer.jsx
import React from 'react';
import { useContent } from '../context/ContentContext';

// Only links that actually go somewhere. The previous footer carried a Support
// column, a newsletter form and social icons that were all inert placeholders.
const links = [
    { label: 'Collections', view: 'home' },
    { label: 'About', view: 'about' },
    { label: 'Contact', view: 'contact' },
];

const Footer = ({ onNavClick }) => {
    const { c } = useContent();

    return (
        <footer className="bg-transparent border-t border-hairline">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <button
                        onClick={() => onNavClick('home')}
                        className="font-serif text-xl tracking-widest uppercase text-ink hover:text-gold transition-opacity"
                    >
                        {c('footer.brand')}
                    </button>

                    {/* Matches the Navbar's link treatment so the two read as one system */}
                    <nav className="flex gap-8 text-xs font-bold tracking-[0.15em] uppercase text-ink">
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

                <div className="border-t border-hairline mt-10 pt-8 text-center md:text-left">
                    <p className="text-sm text-ink-faint">
                        &copy; {new Date().getFullYear()} {c('footer.brand')}. {c('footer.rights')}
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
