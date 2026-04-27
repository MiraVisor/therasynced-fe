'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { isTokenValid } from '@/lib/utils';

const navLinks: Array<{ href: string; label: string; isPage?: boolean }> = [
  { href: '#how-it-works', label: 'Process' },
  { href: '#features', label: 'Why Us' },
  { href: '#pricing', label: 'Pricing' },
  { href: '/guide', label: 'Guide', isPage: true },
  { href: '/contact', label: 'Contact', isPage: true },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasValidToken, setHasValidToken] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setHasValidToken(isTokenValid());

    // Throttle scroll handler for better performance
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setIsOpen(false);
    if (href.startsWith('#')) {
      const id = href.slice(1);
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-200 border-b ${
        scrolled
          ? 'bg-white/80 backdrop-blur-md border-gray-100 py-3'
          : 'bg-transparent border-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/svgs/NewLogoDark.svg"
            alt="TheraSynced"
            width={180}
            height={45}
            className="h-14 w-auto transition-opacity hover:opacity-80"
            priority
            sizes="(max-width: 768px) 150px, 180px"
          />
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          {navLinks.map((link) =>
            link.isPage ? (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-sm font-medium text-gray-600 hover:text-primary transition-colors relative group font-inter"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
              </Link>
            ) : (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="text-sm font-medium text-gray-600 hover:text-primary transition-colors relative group font-inter"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
              </button>
            ),
          )}

          <div className="w-px h-4 bg-gray-200 />
          <Link href={hasValidToken ? '/dashboard' : '/authentication/sign-in'}>
            <Button size="sm" className="bg-primary text-white font-semibold font-inter">
              {hasValidToken ? 'Go to Dashboard' : 'Sign In'}
            </Button>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 text-gray-600
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-100 p-6 space-y-4 shadow-xl"
          >
            {navLinks.map((link) =>
              link.isPage ? (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-left text-base font-medium text-gray-600 font-inter"
                >
                  {link.label}
                </Link>
              ) : (
                <button
                  key={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className="block w-full text-left text-base font-medium text-gray-600 font-inter"
                >
                  {link.label}
                </button>
              ),
            )}
            <Link href={hasValidToken ? '/dashboard' : '/authentication/sign-in'} className="block">
              <Button className="w-full bg-primary text-white font-inter">
                {hasValidToken ? 'Dashboard' : 'Sign In'}
              </Button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
