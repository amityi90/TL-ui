import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useContent } from '../context/ContentContext';

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
    <div className="bg-[#FAF9F6] min-h-screen pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
        >
            <h1 className="text-4xl md:text-5xl font-serif mb-4">{c('contact.heading')}</h1>
            <p className="text-gray-500 text-sm tracking-[0.2em] uppercase">{c('contact.subtitle')}</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
            
            {/* Left Side: Boutique Info */}
            <motion.div 
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="space-y-12"
            >
                <div>
                    <h2 className="text-2xl font-serif mb-6">{c('contact.boutique_heading')}</h2>
                    <p className="text-gray-600 mb-2">{c('contact.address_line1')}</p>
                    <p className="text-gray-600 mb-4">{c('contact.address_line2')}</p>
                    <a href={`tel:${c('contact.phone_tel')}`} className="text-black border-b border-black text-sm uppercase tracking-widest pb-1 hover:opacity-60 transition-opacity">
                        {c('contact.phone_display')}
                    </a>
                </div>

                <div className="aspect-video w-full bg-gray-200 grayscale opacity-80 relative overflow-hidden">
                    <img
                        src={c('contact.map_image')}
                        alt={c('contact.map_image_alt')}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                        {/* A real link once a map URL is set; an inert badge until then. */}
                        {mapUrl ? (
                            <a
                                href={mapUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-white px-4 py-2 text-xs uppercase tracking-widest shadow-lg hover:opacity-80 transition-opacity"
                            >
                                {c('contact.map_label')}
                            </a>
                        ) : (
                            <span className="bg-white px-4 py-2 text-xs uppercase tracking-widest shadow-lg">
                                {c('contact.map_label')}
                            </span>
                        )}
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest mb-4">{c('contact.hours_heading')}</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 max-w-xs">
                        {hoursRows.map((row, i) => (
                            <React.Fragment key={i}>
                                <span>{row.label}</span>
                                <span className="text-right">{row.value}</span>
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
                <h2 className="text-2xl font-serif mb-8">{c('contact.form_heading')}</h2>
                <form onSubmit={handleSubmit} className="space-y-8">
                    
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400 uppercase tracking-wider">{c('contact.form_label_name')}</label>
                        <input 
                            type="text" 
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full bg-transparent border-b border-gray-300 py-2 focus:border-black outline-none transition-colors"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs text-gray-400 uppercase tracking-wider">{c('contact.form_label_email')}</label>
                        <input 
                            type="email" 
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full bg-transparent border-b border-gray-300 py-2 focus:border-black outline-none transition-colors"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs text-gray-400 uppercase tracking-wider">{c('contact.form_label_subject')}</label>
                        <select 
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            className="w-full bg-transparent border-b border-gray-300 py-2 focus:border-black outline-none transition-colors appearance-none"
                        >
                            {subjectOptions.map((option) => (
                                <option key={option}>{option}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs text-gray-400 uppercase tracking-wider">{c('contact.form_label_message')}</label>
                        <textarea 
                            name="message"
                            required
                            rows="4"
                            value={formData.message}
                            onChange={handleChange}
                            className="w-full bg-transparent border-b border-gray-300 py-2 focus:border-black outline-none transition-colors resize-none"
                        ></textarea>
                    </div>

                    <button 
                        type="submit"
                        className="w-full bg-black text-white text-sm uppercase tracking-[0.2em] py-4 hover:bg-gray-800 transition-colors duration-500"
                    >
                        {c('contact.form_submit')}
                    </button>
                </form>
            </motion.div>

        </div>
      </div>
    </div>
  );
}
