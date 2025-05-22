'use client';

import { ChevronUp } from 'lucide-react';
import { useEffect, useState } from 'react';

import Features from './features';
import Feedback from './feedback';
import Footer from './footer';
import Freelancers from './freelancers';
import Hero from './hero';
import Navbar from './navbar';
import Pricing from './pricing';
import Services from './services';

const LandingPage = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down
  const toggleVisibility = () => {
    if (window.scrollY > 400) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Scroll to top when button is clicked
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
    <>
      <div className="transition-all duration-300 bg-white dark:bg-black">
        <Navbar />
        <Hero />
        <div className="space-y-24 sm:space-y-32 lg:space-y-40">
          <Services />
          <Features />
          <Freelancers />
          <Pricing />
          <Feedback />
          <Footer />
        </div>

        {/* Back to Top Button */}
        <button
          onClick={scrollToTop}
          className={`fixed bottom-10 right-10 bg-primary text-white p-3 rounded-full shadow-lg hover:bg-primary/90 transition-all duration-300 z-50 ${
            isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          aria-label="Back to top"
        >
          <ChevronUp size={24} />
        </button>
      </div>
    </>
  );
};

export default LandingPage;
