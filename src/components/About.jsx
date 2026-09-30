import { motion } from 'framer-motion';
import { useContent } from '../context/ContentContext';
import ConstellationDivider from './ConstellationDivider';

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
    <div className="min-h-screen pt-28">

      {/* Hero Section */}
      <section className="relative h-[62vh] w-full overflow-hidden flex items-center justify-center bg-velvet">
        <img
            src={c('about.hero_image')}
            alt={c('about.hero_image_alt')}
            className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Scrim, then a bottom fade so the image dissolves into the page. */}
        <div className="absolute inset-0 z-10 bg-night/55" />
        <div
          className="absolute inset-0 z-10"
          style={{ background: 'radial-gradient(115% 90% at 50% 40%, transparent 35%, rgba(6,6,6,0.8) 100%)' }}
        />
        <div className="absolute inset-x-0 bottom-0 h-40 z-10 bg-gradient-to-b from-transparent to-night" />

        <div className="relative z-20 text-center px-6">
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="label-caps text-gold mb-7"
            >
                {c('about.hero_eyebrow')}
            </motion.p>
            <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.4 }}
                className="font-serif font-light text-5xl md:text-7xl lg:text-8xl text-ivory leading-[1.02]"
            >
                {c('about.hero_title')}
            </motion.h1>
        </div>
      </section>

      {/* Storytelling Section */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-28 md:py-40">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-center">

            {/* Image Side */}
            <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.9 }}
                className="relative h-[560px] bg-velvet overflow-hidden"
            >
                <img
                    src={c('about.story_image')}
                    alt={c('about.story_image_alt')}
                    className="w-full h-full object-cover"
                />
                <div className="pointer-events-none absolute inset-5 border border-gold/20" />
            </motion.div>

            {/* Content Side */}
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
                className="space-y-8"
            >
                <motion.h2 variants={fadeInUp} className="font-serif font-light text-4xl md:text-5xl text-ivory">
                    {c('about.story_heading')}
                </motion.h2>
                <motion.div variants={fadeInUp} className="w-20 h-px bg-gold/50" />
                <motion.p variants={fadeInUp} className="text-muted leading-[1.9]">
                    {c('about.story_body1')}
                </motion.p>
                <motion.p variants={fadeInUp} className="text-muted leading-[1.9]">
                    {c('about.story_body2')}
                </motion.p>
            </motion.div>
        </div>
      </section>

      <ConstellationDivider />

      {/* Values / Promise */}
      <section className="py-28 md:py-40">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
                className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-20"
            >
                {[1, 2, 3].map((n) => (
                    <motion.div key={n} variants={fadeInUp} className="space-y-5">
                        <div className="w-14 h-14 border border-gold/40 rounded-full flex items-center justify-center mx-auto mb-8">
                            <span className="font-serif text-lg text-gold">{c(`about.pillar${n}.badge`)}</span>
                        </div>
                        <h3 className="font-serif font-light text-2xl text-ivory">{c(`about.pillar${n}.title`)}</h3>
                        <p className="text-sm text-muted leading-[1.9] max-w-xs mx-auto">
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
