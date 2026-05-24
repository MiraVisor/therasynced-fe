import Image from 'next/image';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#faf9f6] px-4">
      <Image
        src="/svgs/NewLogoDark.svg"
        alt="TheraSynced"
        width={160}
        height={40}
        className="h-12 w-auto mb-8"
      />
      <h1 className="text-6xl font-bold text-gray-900 font-playfair mb-4">404</h1>
      <p className="text-lg text-gray-600 font-open-sans mb-8 text-center max-w-md">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex gap-4">
        <Link
          href="/"
          className="px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors"
        >
          Go Home
        </Link>
        <Link
          href="/contact"
          className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
        >
          Contact Us
        </Link>
      </div>
    </div>
  );
}
