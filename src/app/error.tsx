'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#faf9f6] px-4">
      <Image
        src="/svgs/NewLogoDark.svg"
        alt="TheraSynced"
        width={160}
        height={40}
        className="h-12 w-auto mb-8"
      />
      <h1 className="text-4xl font-bold text-gray-900 font-playfair mb-3">Something went wrong</h1>
      <p className="text-base text-gray-600 font-open-sans mb-8 text-center max-w-md">
        An unexpected error occurred. Please try again or go back to the home page.
      </p>
      <div className="flex gap-4">
        <button
          onClick={reset}
          className="px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
