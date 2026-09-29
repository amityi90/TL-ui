import React from 'react';
import { motion } from 'framer-motion';
import { useContent } from '../context/ContentContext';

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
  const { c } = useContent();

  return (
    <div className="min-h-screen pt-20">
      
      {/* Hero Section */}
      <section className="relative h-[60vh] w-full overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-void/50 z-10" />
        <img
            src={c('about.hero_image')}
            alt={c('about.hero_image_alt')}
            className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 text-center px-4">
            <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="text-5xl md:text-7xl font-serif text-ink mb-4"
            >
                {c('about.hero_title')}
            </motion.h1>
            <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="text-ink/80 text-sm tracking-[0.2em] uppercase"
            >
                {c('about.hero_eyebrow')}
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
                className="relative h-[500px] bg-surface"
            >
                <img
                    src={c('about.story_image')}
                    alt={c('about.story_image_alt')}
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
                <motion.h2 variants={fadeInUp} className="text-4xl font-serif text-ink">
                    {c('about.story_heading')}
                </motion.h2>
                <motion.div variants={fadeInUp} className="w-12 h-1 bg-gold" />
                <motion.p variants={fadeInUp} className="text-ink-muted leading-relaxed">
                    {c('about.story_body1')}
                </motion.p>
                <motion.p variants={fadeInUp} className="text-ink-muted leading-relaxed">
                    {c('about.story_body2')}
                </motion.p>
            </motion.div>
        </div>
      </section>

      {/* Values / Promise */}
      <section className="bg-surface/50 py-24 border-t border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
                className="grid grid-cols-1 md:grid-cols-3 gap-12"
            >
                {[1, 2, 3].map((n) => (
                    <motion.div key={n} variants={fadeInUp} className="space-y-4">
                        <div className="w-12 h-12 border border-gold rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="font-serif text-xl text-gold">{c(`about.pillar${n}.badge`)}</span>
                        </div>
                        <h3 className="text-lg font-serif text-ink">{c(`about.pillar${n}.title`)}</h3>
                        <p className="text-sm text-ink-muted max-w-xs mx-auto">
                            {c(`about.pillar${n}.body`)}
                        </p>
                    </motion.div>
                ))}
            </motion.div>
        </div>
      </section>

    </div>
  );
}
