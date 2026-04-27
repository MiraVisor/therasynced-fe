'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronUp } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';

import Footer from './footer';
import Hero from './hero';
import Navbar from './navbar';

// Lazy load below-the-fold components to improve initial load time
const ForWho = dynamic(() => import('./for-who'), {
  ssr: true,
  loading: () => <div className="h-[600px] bg-[#f5f4f1]" />,
});

const HowItWorks = dynamic(() => import('./how-it-works'), {
  ssr: true,
  loading: () => <div className="h-[600px] bg-white />,
});

const Features = dynamic(() => import('./features'), {
  ssr: true,
  loading: () => <div className="h-[600px] bg-[#f5f4f1]" />,
});

// Temporarily hidden - uncomment when ready to show
// const WhyChooseUs = dynamic(() => import('./why-choose-us'), {
//   ssr: true,
//   loading: () => <div className="h-[600px] bg-[#f5f4f1]" />,
// });

const Pricing = dynamic(() => import('./pricing'), {
  ssr: true,
  loading: () => <div className="h-[600px] bg-white />,
});

const LandingPage = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Throttle scroll handler for better performance
  const toggleVisibility = useCallback(() => {
    const { scrollY } = window;
    setIsVisible(scrollY > 400);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    // Throttle scroll events for better performance
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          toggleVisibility();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [toggleVisibility]);

  return (
    <div className="min-h-screen bg-[#faf9f6] font-sans selection:bg-primary/10 selection:text-primary overflow-x-hidden">
      <Navbar />
      <main className="relative">
        <Hero />
        <ForWho />
        <HowItWorks />
        <Features />
        {/* <WhyChooseUs /> - Temporarily hidden */}
        <Pricing />
      </main>
      <Footer />

      {/* Back to Top Button */}
      <AnimatePresence>
        {isVisible && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 bg-[#faf9f6] border border-gray-100 text-primary p-4 rounded-2xl shadow-2xl shadow-primary/10 hover:border-primary hover:shadow-primary/20 transition-all duration-300 z-50 group focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            aria-label="Back to top"
          >
            <ChevronUp size={24} className="transition-colors duration-300" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LandingPage;
