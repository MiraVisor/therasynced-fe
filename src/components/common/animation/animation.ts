'use client';

import AOS from 'aos';
import { useEffect } from 'react';

export default function Animation() {
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-out-back',
      once: false,
      mirror: true,
      offset: 100,
    });

    // Refresh AOS after a short delay to ensure DOM is fully rendered
    const refreshAOS = () => {
      if (typeof window !== 'undefined' && window.AOS) {
        window.AOS.refresh();
      }
    };

    // Initial refresh
    setTimeout(refreshAOS, 100);

    // Additional refresh for dynamic content
    setTimeout(refreshAOS, 500);
    setTimeout(refreshAOS, 1000);

    // Listen for window resize to refresh animations
    const handleResize = () => {
      setTimeout(refreshAOS, 100);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return null;
}
