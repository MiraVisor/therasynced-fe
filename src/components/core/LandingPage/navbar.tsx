'use client';

import { MenuIcon, X } from 'lucide-react';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import SlideArrowButton from '@/components/ui/SlideArrowButton';

const navLinks = [
  { href: '#services', label: 'Our Services' },
  { href: '#features', label: 'Why Us' },
  { href: '#freelancers', label: 'Experts' },
  { href: '#pricing', label: 'Pricing' },
];

const Navbar = () => {
  const { resolvedTheme } = useTheme();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen((prev) => !prev);
  const closeMenu = () => setIsOpen(false);

  return (
    <header className="w-full z-50 px-4 sm:px-6 lg:px-8 py-2.5 border-b border-muted/10">
      <div className=" max-w-screen-xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center" onClick={closeMenu}>
          <Image
            src={resolvedTheme === 'dark' ? '/svgs/NewLogoLight.svg' : '/svgs/NewLogoDark.svg'}
            alt="logo"
            width={77}
            height={77}
            className="transition-transform duration-300"
          />
        </Link>

        {/* Desktop Nav */}
        <ul className="hidden md:flex items-center gap-6 lg:gap-8">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="relative px-3 py-1.5 text-sm font-medium tracking-wide text-gray-600 dark:text-zinc-300 hover:text-primary dark:hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* CTA + Theme Toggle */}
        <div className="flex items-center gap-4">
          <SlideArrowButton
            text="Get Started"
            className="hidden sm:flex lg:w-52 lg:h-12"
            onClick={() => router.push('/authentication/sign-in')}
          />

          {/* Mobile Hamburger */}
          <button
            className="md:hidden inline-flex items-center justify-center p-2"
            onClick={toggleMenu}
            aria-label="Toggle Menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <div
        className={`md:hidden fixed top-0 right-0 h-full w-64 bg-white dark:bg-zinc-900 shadow-lg transform transition-transform duration-300 z-40 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col p-6 gap-6 pt-20">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeMenu}
              className="text-base font-medium text-gray-800 dark:text-gray-200 hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}

          <SlideArrowButton
            text="Get Started"
            className="hidden sm:flex lg:w-52 lg:h-12"
            onClick={() => {
              closeMenu();
              router.push('/authentication/sign-in');
            }}
          />
        </div>
      </div>

      {/* Overlay when menu is open */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-40 md:hidden"
          onClick={closeMenu}
        ></div>
      )}
    </header>
  );
};

export default Navbar;
