'use client';

import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

const expertsData = [
  {
    id: 1,
    name: 'Dr Elon',
    description:
      'Experienced in deep tissue and relaxation therapy, Dr Lee helps you unwind, relieve pain.',
    image: '/svgs/freelancer.svg',
    rating: 4,
    patients: '10k Patients',
  },
  {
    id: 2,
    name: 'Dr Jinping',
    description:
      'Experienced in deep tissue and relaxation therapy, Dr Lee helps you unwind, relieve pain.',
    image: '/svgs/freelancer.svg',
    rating: 4,
    patients: '10k Patients',
  },
  {
    id: 3,
    name: 'Dr Trump',
    description:
      'Experienced in deep tissue and relaxation therapy, Dr Lee helps you unwind, relieve pain.',
    image: '/svgs/freelancer.svg',
    rating: 4,
    patients: '10k Patients',
  },
  {
    id: 4,
    name: 'Dr Puttin',
    description:
      'Experienced in deep tissue and relaxation therapy, Dr Lee helps you unwind, relieve pain.',
    image: '/svgs/freelancer.svg',
    rating: 4,
    patients: '10k Patients',
  },
];

const Freelancers = () => {
  return (
    <section
      id="freelancers"
      className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-16 transition-all duration-500"
    >
      <div className="max-w-screen-xl mx-auto flex flex-col items-center gap-8 sm:gap-12 lg:gap-16">
        {/* Header */}
        <div className="text-center space-y-3 sm:space-y-4 lg:space-y-6 max-w-4xl mx-auto">
          <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white leading-[1.1]">
            Meet Our <span className="text-primary">Experts</span>
          </h2>
          <p className="text-sm xs:text-base sm:text-lg md:text-xl text-gray-600 dark:text-neutral-400 leading-relaxed">
            Our mentors are seasoned professionals with years of experience. They bring real-world
            insights and hands-on guidance to help you excel in your healing journey.
          </p>
        </div>

        {/* Experts List/Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 w-full max-w-xl lg:max-w-none mx-auto">
          {expertsData.map((expert) => (
            <div
              key={expert.id}
              className="flex flex-col items-center p-4 sm:p-6 rounded-2xl transition-all duration-300 lg:hover:scale-[1.02] border lg:border-transparent lg:hover:border-border"
            >
              {/* Image Section */}
              <div className="relative w-full aspect-[3/4] flex items-end justify-center rounded-t-xl overflow-hidden">
                {/* Green Background Shape */}
                <div className="absolute bottom-0 w-[calc(100%-32px)] h-[70%] bg-green-100/80 dark:bg-green-900/20 rounded-lg"></div>
                <Image
                  src={expert.image}
                  alt={expert.name}
                  fill
                  className="object-cover object-bottom relative z-10 transition-transform duration-300"
                />
              </div>
              <div className="flex flex-col items-center p-4 sm:p-6 gap-3 sm:gap-4 w-full">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-primary tracking-tight">
                  {expert.name}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-neutral-400 flex-grow leading-relaxed">
                  {expert.description}
                </p>
                {/* Rating */}
                <div className="flex w-full items-center justify-between gap-2 mt-2">
                  <div className="text-yellow-500 text-sm sm:text-base">
                    {'⭐'.repeat(expert.rating)}
                  </div>
                  <span className="text-xs sm:text-sm text-gray-500 dark:text-neutral-400">
                    {expert.patients}
                  </span>
                </div>
                {/* Enquire Button */}
                <Button
                  variant={'outline'}
                  className="w-full h-10 sm:h-12 rounded-lg border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300 font-medium text-sm sm:text-base flex items-center justify-center gap-2"
                >
                  Enquire
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Explore All Button */}
        <Link href="#">
          <Button
            variant={'default'}
            className="text-white w-full sm:w-[140px] md:w-[180px] lg:w-[220px] h-8 xs:h-10 sm:h-12 md:h-[54px] rounded-lg xs:rounded-xl bg-primary hover:bg-primary/90 transition-all duration-300 shadow-lg hover:scale-105 font-medium text-xs xs:text-sm sm:text-base group flex items-center justify-center gap-2"
          >
            Explore All
            <ArrowRight className="hidden lg:block w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default Freelancers;
