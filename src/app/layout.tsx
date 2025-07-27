import type { Metadata } from 'next';
import { Inter, Open_Sans, Poppins } from 'next/font/google';
import { ToastContainer } from 'react-toastify';

import { ThemeProvider } from '@/components/theme-provider';
import { StoreProvider } from '@/redux/StoreProvider';

import './globals.css';

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

export const metadata: Metadata = {
  title: {
    default: 'TheraSynced - Professional Therapy & Wellness Services',
    template: '%s | TheraSynced',
  },
  description:
    'Connect with licensed therapists, wellness professionals, and healthcare experts online. Book appointments instantly, get personalized care, and improve your mental and physical health with TheraSynced.',
  keywords: [
    'online therapy',
    'mental health',
    'wellness services',
    'professional therapists',
    'healthcare booking',
    'telehealth',
    'counseling',
    'psychotherapy',
  ],
  openGraph: {
    type: 'website',
    title: 'TheraSynced - Professional Therapy & Wellness Services',
    description: 'Connect with licensed therapists and wellness professionals online.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TheraSynced - Professional Therapy & Wellness Services',
    description: 'Connect with licensed therapists and wellness professionals online.',
    images: ['/og-image.jpg'],
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="light">
      <body
        className={`${openSans.variable} ${inter.variable} ${poppins.variable} antialiased`}
        suppressHydrationWarning
      >
        <StoreProvider>
          <ToastContainer />

          <ThemeProvider attribute="class">{children}</ThemeProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
