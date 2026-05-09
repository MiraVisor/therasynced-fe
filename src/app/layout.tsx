import type { Metadata } from 'next';
import { Inter, Open_Sans, Playfair_Display, Poppins } from 'next/font/google';
import { ToastContainer } from 'react-toastify';

import Animation from '@/components/common/animation/animation';
import CookieConsent from '@/components/common/CookieConsent';
import { ThemeProvider } from '@/components/theme-provider';
import { QueryProvider } from '@/providers/QueryProvider';

import './globals.css';

import 'aos/dist/aos.css';
import 'react-toastify/dist/ReactToastify.css';

const openSans = Open_Sans({
  variable: '--font-open-sans',
  subsets: ['latin'],
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});

const playfairDisplay = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: {
    default: 'TheraSynced - Connect. Work. Thrive.',
    template: '%s | TheraSynced',
  },
  description:
    'TheraSynced connects you with qualified physiotherapists, athletic therapists, massage therapists, and fitness professionals. Book freelance sessions for clinics, teams, events, and more.',
  keywords: [
    'physiotherapy',
    'freelance therapist',
    'athletic therapy',
    'massage therapy',
    'sports rehabilitation',
    'therapist booking',
    'healthcare freelancer',
    'locum physiotherapist',
  ],
  authors: [{ name: 'TheraSynced Team' }],
  creator: 'TheraSynced',
  publisher: 'TheraSynced',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env['NEXT_PUBLIC_APP_URL'] || 'https://therasynced.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://therasynced.com',
    siteName: 'TheraSynced',
    title: 'TheraSynced - Connect. Work. Thrive.',
    description:
      'Find qualified physiotherapists, athletic therapists, and fitness professionals for freelance bookings. Clinics, teams, events, and more.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'TheraSynced - Connect. Work. Thrive.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TheraSynced - Connect. Work. Thrive.',
    description:
      'Find qualified physiotherapists, athletic therapists, and fitness professionals for freelance bookings.',
    images: ['/og-image.jpg'],
    creator: '@therasynced',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
  icons: {
    icon: [
      { url: '/svgs/NewLogoLight.svg', type: 'image/svg+xml' },
      {
        url: '/svgs/NewLogoDark.svg',
        type: 'image/svg+xml',
        media: '(prefers-color-scheme: dark)',
      },
    ],
    shortcut: '/svgs/NewLogoLight.svg',
    apple: '/svgs/NewLogoLight.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${openSans.variable} ${inter.variable} ${poppins.variable} ${playfairDisplay.variable} antialiased`}
        suppressHydrationWarning
      >
        {/* Skip to main content link for accessibility */}
        <a
          href="#main-content"
          className="absolute left-[-9999px] focus:left-4 focus:top-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:not-sr-only"
          aria-label="Skip to main content"
        >
          Skip to main content
        </a>
        <QueryProvider>
          <ToastContainer />
          {/* <SocketConnectionTest /> */}
          <ThemeProvider>
            <Animation />
            <main id="main-content" tabIndex={-1}>
              {children}
            </main>
            <CookieConsent />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
