import React from 'react';
import { motion } from 'framer-motion';

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

export default function About() {
  return (
    <div className="bg-[#FAF9F6] min-h-screen pt-20">
      
      {/* Hero Section */}
      <section className="relative h-[60vh] w-full overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-black/20 z-10" />
        <img 
            src="https://images.unsplash.com/photo-1617038224538-2763fcc16382?q=80&w=2000&auto=format&fit=crop" 
            alt="Jeweler working" 
            className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 text-center px-4">
            <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="text-5xl md:text-7xl font-serif text-white mb-4"
            >
                The Art of Timelessness
            </motion.h1>
            <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="text-white/90 text-sm tracking-[0.2em] uppercase"
            >
                Est. 2026
            </motion.p>
        </div>
      </section>

      {/* Storytelling Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            
            {/* Image Side */}
            <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative h-[500px] bg-gray-200"
            >
                <img 
                    src="https://images.unsplash.com/photo-1573408301185-9146fe634ad0?q=80&w=1000&auto=format&fit=crop" 
                    alt="Craftsmanship process" 
                    className="w-full h-full object-cover"
                />
            </motion.div>

            {/* Content Side */}
            <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
                className="space-y-8"
            >
                <motion.h2 variants={fadeInUp} className="text-4xl font-serif text-gray-900">
                    Heritage & Quality
                </motion.h2>
                <motion.div variants={fadeInUp} className="w-12 h-1 bg-black" />
                <motion.p variants={fadeInUp} className="text-gray-600 leading-relaxed">
                    Founded on the principles of classic elegance and modern sensibility, Tehila Levi is more than a jewelry brand; it is a celebration of enduring beauty. Every piece is a testament to the meticulous art of jewelry making, designed not just for today, but to be cherished for generations.
                </motion.p>
                <motion.p variants={fadeInUp} className="text-gray-600 leading-relaxed">
                    We believe in slow fashion—creating fewer, better things. Our ateliers employ traditional techniques passed down through decades, ensuring that each curve, setting, and polish meets our exacting standards of perfection.
                </motion.p>
            </motion.div>
        </div>
      </section>

      {/* Values / Promise */}
      <section className="bg-white py-24 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
                className="grid grid-cols-1 md:grid-cols-3 gap-12"
            >
                <motion.div variants={fadeInUp} className="space-y-4">
                    <div className="w-12 h-12 border border-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="font-serif text-xl">01</span>
                    </div>
                    <h3 className="text-lg font-serif">Ethically Sourced</h3>
                    <p className="text-sm text-gray-500 max-w-xs mx-auto">
                        We are committed to using only conflict-free diamonds and recycled precious metals.
                    </p>
                </motion.div>

                <motion.div variants={fadeInUp} className="space-y-4">
                    <div className="w-12 h-12 border border-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="font-serif text-xl">02</span>
                    </div>
                    <h3 className="text-lg font-serif">Hand-Crafted</h3>
                    <p className="text-sm text-gray-500 max-w-xs mx-auto">
                        Each piece is finished by hand in our Los Angeles studio by master jewelers.
                    </p>
                </motion.div>

                <motion.div variants={fadeInUp} className="space-y-4">
                    <div className="w-12 h-12 border border-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="font-serif text-xl">03</span>
                    </div>
                    <h3 className="text-lg font-serif">Lifetime Warranty</h3>
                    <p className="text-sm text-gray-500 max-w-xs mx-auto">
                        We stand behind the quality of our jewelry with a comprehensive lifetime guarantee.
                    </p>
                </motion.div>
            </motion.div>
        </div>
      </section>

    </div>
  );
}
