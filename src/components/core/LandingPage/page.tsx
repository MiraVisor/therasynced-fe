'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronUp } from 'lucide-react';
import { useEffect, useState } from 'react';

import Features from './features';
import Footer from './footer';
import Hero from './hero';
import HowItWorks from './how-it-works';
import Navbar from './navbar';
import Pricing from './pricing';
import WhyChooseUs from './why-choose-us';

const LandingPage = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.scrollY > 400) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-black font-sans selection:bg-primary/10 selection:text-primary overflow-x-hidden">
      <Navbar />
      <main className="relative">
        <Hero />
        <HowItWorks />
        <Features />
        <WhyChooseUs />
        <Pricing />
      </main>
      <Footer />

      {/* Back to Top Button */}
      <AnimatePresence>
        {isVisible && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 text-primary p-4 rounded-2xl shadow-2xl shadow-primary/10 hover:border-primary transition-all z-50 group"
            aria-label="Back to top"
          >
            <ChevronUp size={24} className="group-hover:-translate-y-1 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LandingPage;
