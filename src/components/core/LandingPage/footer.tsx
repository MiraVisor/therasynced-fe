'use client';

import { useTheme } from 'next-themes';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const Footer = () => {
  useTheme();
  const router = useRouter();

  return (
    <footer className="w-full flex items-center justify-center ">
      <div className="w-full">
        {/* Top dark header (full width) */}
        <div className="relative bg-[#007745]/90 text-[var(--primary-foreground)] px-6 sm:px-10 py-6 flex items-center justify-between min-h-[130px]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-[var(--accent)]/30 flex items-center justify-center">
              {/* simple logo */}
              <Image
                src={'/svgs/NewLogoLight.svg'}
                alt="TheraSynced logo"
                width={150}
                height={100}
                className="object-contain"
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-wide">
                THERA<span className="text-[var(--accent-foreground)]">SYNCED</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <Link href="/privacy" className="hover:text-[var(--primary)] transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-[var(--primary)] transition-colors">
              Terms of Service
            </Link>
          </div>

          {/* decorative svg pattern */}
          <svg
            className="pointer-events-none absolute right-6 top-0 h-full opacity-10"
            viewBox="0 0 600 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
          >
            <path d="M300 0C380 0 480 60 600 120H0C120 60 220 0 300 0Z" fill="#ffffff" />
          </svg>
        </div>

        {/* Main light panel with columns (content constrained centrally but footer spans full width) */}
        <div className="bg-card px-6 sm:px-10 py-10 text-[var(--card-foreground)]">
          <div className="max-w-screen-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Follow Us */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Follow Us:</h3>
              <div className="flex gap-3 items-center">
                <button
                  aria-label="X"
                  className="w-9 h-9 rounded-full border border-[var(--border)] bg-white text-[var(--foreground)] flex items-center justify-center"
                >
                  X
                </button>
                <button
                  aria-label="LinkedIn"
                  className="w-9 h-9 rounded-full border border-[var(--border)] bg-white text-[var(--foreground)] flex items-center justify-center"
                >
                  in
                </button>
                <button
                  aria-label="Facebook"
                  className="w-9 h-9 rounded-full border border-[var(--border)] bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center"
                >
                  f
                </button>
                <button
                  aria-label="Pinterest"
                  className="w-9 h-9 rounded-full border border-[var(--border)] bg-white text-[var(--foreground)] flex items-center justify-center"
                >
                  p
                </button>
              </div>
              <p className="text-sm max-w-xs leading-relaxed text-[var(--muted-foreground)]">
                Combining modern physiotherapy techniques with holistic care, we help your body heal
                and thrive.
              </p>
            </div>

            {/* Quick Links (use existing links) */}
            <div>
              <h3 className="text-lg font-semibold">Quick Links</h3>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link href="/" className="hover:text-[var(--primary)] transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <a
                    href="#who-its-for"
                    onClick={(e) => {
                      e.preventDefault();
                      const el = document.getElementById('who-its-for');
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      else router.push('/#who-its-for');
                    }}
                    className="hover:text-[var(--primary)] transition-colors"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#services"
                    onClick={(e) => {
                      e.preventDefault();
                      const el = document.getElementById('services');
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      else router.push('/#services');
                    }}
                    className="hover:text-[var(--primary)] transition-colors"
                  >
                    Services
                  </a>
                </li>
                <li>
                  <a
                    href="#reviews"
                    onClick={(e) => {
                      e.preventDefault();
                      const el = document.getElementById('reviews');
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      else router.push('/#reviews');
                    }}
                    className="hover:text-[var(--primary)] transition-colors"
                  >
                    Reviews
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:support@therasynced.com"
                    className="hover:text-[var(--primary)] transition-colors"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal & Support */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-lg font-semibold">Legal & Support</h3>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link href="#" className="hover:text-[var(--primary)] transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#who-its-for"
                    className="hover:text-[var(--primary)] transition-colors"
                  >
                    How it works
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-[var(--primary)] transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-[var(--primary)] transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className="hover:text-[var(--primary)] transition-colors">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Platform Disclaimer (keep existing content) */}
          <div className="mt-8 border-t border-[var(--border)] pt-6 max-w-screen-2xl mx-auto">
            <p className="text-sm text-[var(--muted-foreground)]">
              <strong>Platform Disclaimer:</strong> TheraSynced is a booking platform that connects
              clients with licensed healthcare professionals and therapists. We do not provide
              medical advice, diagnosis, or treatment services. All healthcare services are provided
              by independent practitioners who are responsible for their own professional conduct
              and services.
            </p>
          </div>
        </div>

        {/* Bottom Bar (full width) */}
        <div className="bg-background border-t border-[var(--border)]">
          <div className="max-w-screen-2xl mx-auto px-6 sm:px-10 py-4 text-sm flex flex-col sm:flex-row justify-between items-center gap-3 text-[var(--muted-foreground)]">
            <div className="text-center sm:text-left">
              <p className="mb-0">
                © {new Date().getFullYear()} Therapy by Pixelean. All Rights Reserved.
              </p>
            </div>
            <div className="flex items-center gap-4 text-[var(--foreground)]">
              <Link href="/terms" className="hover:underline hover:text-[var(--primary)]">
                Terms and Conditions
              </Link>
              <span className="opacity-40">|</span>
              <Link href="/privacy" className="hover:underline hover:text-[var(--primary)]">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
