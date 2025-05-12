import type { Metadata } from 'next';
import { Open_Sans } from 'next/font/google';
import { ToastContainer } from 'react-toastify';

import { ThemeProvider } from '@/components/theme-provider';
import { StoreProvider } from '@/redux/StoreProvider';

import './globals.css';

import 'react-toastify/dist/ReactToastify.css';

const openSans = Open_Sans({
  variable: '--font-open-sans',
  subsets: ['latin'],
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
      <body className={`${openSans.variable} antialiased`} suppressHydrationWarning>
        <StoreProvider>
          <ToastContainer />

          <ThemeProvider attribute="class">{children}</ThemeProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
