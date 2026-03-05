import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative h-screen w-full overflow-hidden bg-black">
      {/* 1. The Image with Ken Burns Effect */}
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ scale: 1 }}
        animate={{ scale: 1.08 }}
        transition={{
          duration: 12,
          ease: "linear",
          repeat: Infinity,
          repeatType: "reverse", // Makes it breathe in and out
        }}
      >
        <img
          src="https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=2515&auto=format&fit=crop"
          alt="Diamond Ring Close up"
          className="w-full h-full object-cover opacity-90"
        />
      </motion.div>

      {/* 2. Elegant Overlay */}
      <div className="absolute inset-0 bg-black/15 z-10 pointer-events-none" />

      {/* 3. Center Content */}
      <div className="relative z-20 h-full flex flex-col items-center justify-center text-center text-white px-4">
        
        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-xs md:text-sm tracking-[0.3em] font-medium uppercase mb-6"
        >
          Established 2026
        </motion.p>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="text-5xl md:text-7xl lg:text-8xl font-serif mb-10 tracking-tight"
          style={{ fontFamily: '"Playfair Display", serif' }}
        >
          The Signature Series
        </motion.h1>

        {/* Minimalist Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          <button className="group relative text-sm tracking-[0.2em] uppercase py-2 border-b border-white/70 hover:border-white transition-colors duration-300">
            Shop the Collection
            <span className="absolute -bottom-px left-0 w-0 h-px bg-white transition-all duration-300 group-hover:w-full"></span>
          </button>
        </motion.div>
      </div>
    </section>
  );
}