import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import { Inter, Open_Sans, Poppins } from 'next/font/google';
import { ToastContainer } from 'react-toastify';

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
  authors: [{ name: 'TheraSynced Team' }],
  creator: 'TheraSynced',
  publisher: 'TheraSynced',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://therasynced.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://therasynced.com',
    siteName: 'TheraSynced',
    title: 'TheraSynced - Professional Therapy & Wellness Services',
    description:
      'Connect with licensed therapists and wellness professionals online. Book appointments instantly and get personalized care.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'TheraSynced - Professional Therapy & Wellness Services',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TheraSynced - Professional Therapy & Wellness Services',
    description:
      'Connect with licensed therapists and wellness professionals online. Book appointments instantly and get personalized care.',
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
          {/* <SocketConnectionTest /> */}
          <ThemeProvider attribute="class">{children}</ThemeProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
