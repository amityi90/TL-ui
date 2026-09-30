// src/components/Footer.jsx
import { useContent } from '../context/ContentContext';

// Only links that actually go somewhere. The previous footer carried a Support
// column, a newsletter form and social icons that were all inert placeholders.
const links = [
    { label: 'Collections', view: 'home' },
    { label: 'About', view: 'about' },
    { label: 'Contact', view: 'contact' },
];

// Four-point star, the same glyph family as the constellation dividers.
const Star = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" className="text-gold">
        <path
            d="M7 0c.4 3.4 3.2 6.2 6.6 6.6v.8C10.2 7.8 7.4 10.6 7 14c-.4-3.4-3.2-6.2-6.6-6.6v-.8C3.8 6.2 6.6 3.4 7 0Z"
            fill="currentColor"
            fillOpacity="0.75"
        />
    </svg>
);

const Footer = ({ onNavClick }) => {
    const { c } = useContent();

    return (
        <footer className="border-t border-gold/20 mt-auto">
            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-20 md:py-24">
                <div className="flex flex-col items-center gap-10 text-center">
                    <Star />

                    <button
                        onClick={() => onNavClick('home')}
                        className="font-serif font-light text-xl tracking-[0.35em] uppercase text-ivory hover:text-gold transition-colors duration-500 pl-[0.35em]"
                    >
                        {c('footer.brand')}
                    </button>

                    {/* Matches the Navbar's link treatment so the two read as one system */}
                    <nav className="flex flex-wrap justify-center gap-8 md:gap-12 label-caps">
                        {links.map(({ label, view }) => (
                            <button key={view} onClick={() => onNavClick(view)} className="nav-link">
                                {label}
                            </button>
                        ))}
                    </nav>

                    <p className="label-caps text-faint text-[10px] mt-6">
                        &copy; {new Date().getFullYear()} {c('footer.brand')}. {c('footer.rights')}
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
