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

    AOS.refresh();
  }, []);

  return null;
}
