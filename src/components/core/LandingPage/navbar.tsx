'use client';

import { Menu, X } from 'lucide-react';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { isTokenValid } from '@/lib/utils';

const navLinks = [
  { href: '#how-it-works', label: 'Process' },
  { href: '#features', label: 'Features' },
  { href: '#why-choose-us', label: 'Trust' },
  { href: '#pricing', label: 'Pricing' },
];

const Navbar = () => {
  const { resolvedTheme } = useTheme();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [hasValidToken, setHasValidToken] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setHasValidToken(isTokenValid());
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
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
          ? 'bg-white/80 dark:bg-black/80 backdrop-blur-md border-gray-100 dark:border-neutral-900 py-3'
          : 'bg-transparent border-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src={resolvedTheme === 'dark' ? '/svgs/NewLogoLight.svg' : '/svgs/NewLogoDark.svg'}
            alt="TheraSynced"
            width={180}
            height={45}
            className="h-10 w-auto"
          />
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNavClick(link.href)}
              className="text-sm font-medium text-gray-600 dark:text-neutral-400 hover:text-primary dark:hover:text-primary transition-colors"
            >
              {link.label}
            </button>
          ))}
          <div className="w-px h-4 bg-gray-200 dark:bg-neutral-800" />
          <Link href={hasValidToken ? '/dashboard' : '/authentication/sign-in'}>
            <Button size="sm" className="bg-primary text-white font-semibold">
              {hasValidToken ? 'Go to Dashboard' : 'Sign In'}
            </Button>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 text-gray-600 dark:text-neutral-400"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-neutral-900 border-b border-gray-100 dark:border-neutral-800 p-6 space-y-4 shadow-xl">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNavClick(link.href)}
              className="block w-full text-left text-base font-medium text-gray-600 dark:text-neutral-400"
            >
              {link.label}
            </button>
          ))}
          <Link href={hasValidToken ? '/dashboard' : '/authentication/sign-in'} className="block">
            <Button className="w-full bg-primary text-white">
              {hasValidToken ? 'Dashboard' : 'Sign In'}
            </Button>
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
