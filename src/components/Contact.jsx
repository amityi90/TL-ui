import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useContent } from '../context/ContentContext';
import ConstellationDivider from './ConstellationDivider';

export default function Contact() {
  const { c } = useContent();

  const subjectOptions = [1, 2, 3, 4]
    .map((n) => c(`contact.subject${n}`))
    .filter(Boolean);
  const hoursRows = [1, 2, 3].map((n) => ({
    label: c(`contact.hours${n}_label`),
    value: c(`contact.hours${n}_value`)
  }));
  const mapUrl = c('contact.map_url');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    // Reads the first option rather than repeating its text, so renaming it in
    // the admin can't desync the default from the list.
    subject: subjectOptions[0] || '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert(c('contact.form_success'));
  };

  return (
    <div className="min-h-screen pt-40 pb-28">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">

        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-24"
        >
            <h1 className="font-serif font-light text-5xl md:text-6xl text-ivory mb-6">{c('contact.heading')}</h1>
            <p className="label-caps text-gold mb-8">{c('contact.subtitle')}</p>
            <ConstellationDivider />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-28">

            {/* Left Side: Boutique Info */}
            <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="space-y-14"
            >
                <div>
                    <h2 className="font-serif font-light text-3xl text-ivory mb-8">{c('contact.boutique_heading')}</h2>
                    <p className="text-muted mb-2">{c('contact.address_line1')}</p>
                    <p className="text-muted mb-7">{c('contact.address_line2')}</p>
                    <a
                      href={`tel:${c('contact.phone_tel')}`}
                      className="label-caps text-gold border-b border-gold/40 hover:border-gold pb-1 transition-colors duration-500"
                    >
                        {c('contact.phone_display')}
                    </a>
                </div>

                <div className="aspect-video w-full bg-velvet grayscale opacity-70 relative overflow-hidden">
                    <img
                        src={c('contact.map_image')}
                        alt={c('contact.map_image_alt')}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-night/45">
                        {/* A real link once a map URL is set; an inert badge until then. */}
                        {mapUrl ? (
                            <a
                                href={mapUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="label-caps text-ivory bg-panel/90 border border-gold/30 px-5 py-3 hover:border-gold transition-colors duration-500"
                            >
                                {c('contact.map_label')}
                            </a>
                        ) : (
                            <span className="label-caps text-ivory bg-panel/90 border border-gold/30 px-5 py-3">
                                {c('contact.map_label')}
                            </span>
                        )}
                    </div>
                </div>

                <div>
                    <h3 className="label-caps text-gold mb-6">{c('contact.hours_heading')}</h3>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm text-muted max-w-sm">
                        {hoursRows.map((row, i) => (
                            <React.Fragment key={i}>
                                <span>{row.label}</span>
                                <span className="text-right text-ivory">{row.value}</span>
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Right Side: Form */}
            <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
            >
                <h2 className="font-serif font-light text-3xl text-ivory mb-10">{c('contact.form_heading')}</h2>
                <form onSubmit={handleSubmit} className="space-y-10">

                    <div className="space-y-2">
                        <label className="label-caps text-faint text-[10px]">{c('contact.form_label_name')}</label>
                        <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="field"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="label-caps text-faint text-[10px]">{c('contact.form_label_email')}</label>
                        <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="field"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="label-caps text-faint text-[10px]">{c('contact.form_label_subject')}</label>
                        <select
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            className="field appearance-none"
                        >
                            {subjectOptions.map((option) => (
                                <option key={option}>{option}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="label-caps text-faint text-[10px]">{c('contact.form_label_message')}</label>
                        <textarea
                            name="message"
                            required
                            rows="4"
                            value={formData.message}
                            onChange={handleChange}
                            className="field resize-none"
                        ></textarea>
                    </div>

                    <button type="submit" className="btn-gold w-full">
                        {c('contact.form_submit')}
                    </button>
                </form>
            </motion.div>

        </div>
      </div>
    </div>
  );
}
