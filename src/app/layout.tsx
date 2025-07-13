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
  title: 'TheraSynced',
  description: 'Move Better. Live Better.',
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
