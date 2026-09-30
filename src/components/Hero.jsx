import { motion, useReducedMotion } from "framer-motion";
import { useContent } from "../context/ContentContext";

// Hand-placed rather than random so the scatter reads as dust on velvet: grouped,
// uneven, with clear empty space. A uniform random spread looks like a screensaver.
// Kept clear of the centre so nothing twinkles behind the headline itself.
const STARS = [
  { top: '12%', left: '8%',  size: 2,   delay: 0,   dur: 7 },
  { top: '22%', left: '17%', size: 1,   delay: 2.4, dur: 9 },
  { top: '9%',  left: '26%', size: 1.5, delay: 1.1, dur: 8 },
  { top: '34%', left: '6%',  size: 1,   delay: 3.6, dur: 11 },
  { top: '17%', left: '77%', size: 1.5, delay: 0.7, dur: 9 },
  { top: '8%',  left: '86%', size: 2,   delay: 2.9, dur: 7.5 },
  { top: '29%', left: '92%', size: 1,   delay: 1.8, dur: 10 },
  { top: '41%', left: '81%', size: 1,   delay: 4.2, dur: 8.5 },
  { top: '68%', left: '14%', size: 1.5, delay: 1.4, dur: 9.5 },
  { top: '79%', left: '24%', size: 1,   delay: 3.1, dur: 8 },
  { top: '73%', left: '88%', size: 1.5, delay: 0.4, dur: 10.5 },
  { top: '85%', left: '72%', size: 1,   delay: 2.2, dur: 9 },
];

export default function Hero() {
  const { c } = useContent();
  // Framer Motion animates via JS, so the CSS reduced-motion block cannot reach
  // the Ken Burns drift. This opts it out explicitly.
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative h-screen w-full overflow-hidden bg-velvet">
      {/* 1. Image, drifting slowly */}
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ scale: 1 }}
        animate={reduceMotion ? { scale: 1 } : { scale: 1.08 }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { duration: 18, ease: "linear", repeat: Infinity, repeatType: "reverse" }
        }
      >
        <img
          src={c('hero.image')}
          alt={c('hero.image_alt')}
          className="w-full h-full object-cover"
        />
      </motion.div>

      {/* 2. Scrim. Darkens the image toward the edges and melts its bottom into
             the page, so the hero has no visible seam. */}
      <div className="absolute inset-0 z-10 pointer-events-none bg-night/45" />
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background:
            'radial-gradient(120% 95% at 50% 40%, transparent 35%, rgba(6,6,6,0.85) 100%)'
        }}
      />
      <div className="absolute inset-x-0 bottom-0 h-56 z-10 pointer-events-none bg-gradient-to-b from-transparent to-night" />

      {/* 3. The warm spotlight falling on the velvet. */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background:
            'radial-gradient(55% 45% at 50% 42%, rgba(201,169,110,0.16), transparent 72%)'
        }}
      />

      {/* 4. Dust in the light */}
      <div className="absolute inset-0 z-10 pointer-events-none" aria-hidden="true">
        {STARS.map((s, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-ivory"
            style={{
              top: s.top,
              left: s.left,
              width: `${s.size}px`,
              height: `${s.size}px`,
              animation: `twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`
            }}
          />
        ))}
      </div>

      {/* 5. Content */}
      <div className="relative z-20 h-full flex flex-col items-center justify-center text-center px-6">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.2, ease: "easeOut" }}
          className="label-caps text-gold mb-8"
        >
          {c('hero.eyebrow')}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.45, ease: "easeOut" }}
          className="font-serif font-light text-ivory text-6xl md:text-8xl lg:text-9xl leading-[0.95] tracking-[0.02em] mb-12"
        >
          {c('hero.title')}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.9 }}
        >
          <button className="btn-gold">{c('hero.cta')}</button>
        </motion.div>
      </div>
    </section>
  );
}
