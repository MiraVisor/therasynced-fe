'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

const feedbackData = [
  {
    id: 1,
    title: 'Amazing Experience',
    description: 'Quick and professional service. I was able to get relief after just one session!',
    image: '/svgs/client.svg',
    rating: 5,
    author: 'Anna Smith',
    handle: '@annasmith',
  },
  {
    id: 2,
    title: 'Truly Exceptional and Life Changing',
    description:
      'I had persistent back pain for years. After trying this service, I finally feel like myself again. The therapist was knowledgeable, empathetic, and explained everything thoroughly.',
    image: '/svgs/client.svg',
    rating: 5,
    author: 'Michael Green',
    handle: '@mikeg',
  },
  {
    id: 3,
    title: 'Good',
    description: 'Quick service.',
    image: '/svgs/client.svg',
    rating: 4,
    author: 'Liam',
    handle: '@liamofficial',
  },
  {
    id: 4,
    title: 'Excellent service, very happy!',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    image: '/svgs/client.svg',
    rating: 5,
    author: 'Sophia Lee',
    handle: '@slee',
  },
];

const Feedback = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  useEffect(() => {
    if (!api || isPaused) return;

    const interval = setInterval(() => {
      api.scrollNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [api, isPaused]);

  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-16 transition-all duration-500">
      <div className="max-w-screen-xl mx-auto flex flex-col items-center gap-8 sm:gap-12 lg:gap-16">
        {/* Header */}
        <div className="text-center space-y-3 sm:space-y-4 lg:space-y-6 max-w-4xl mx-auto">
          <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white leading-[1.1]">
            What Our <span className="text-primary">Clients Say</span>
          </h2>
          <p className="text-sm xs:text-base sm:text-lg md:text-xl text-gray-600 dark:text-neutral-400 leading-relaxed">
            Hear from our satisfied clients about their experiences and transformations. Their
            success stories inspire us to continue delivering excellence.
          </p>
        </div>

        {/* Carousel */}
        <div
          className="w-full max-w-xl lg:max-w-6xl mx-auto relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <Carousel
            setApi={setApi}
            opts={{
              align: 'start',
              loop: true,
            }}
            orientation={'horizontal'}
            className="w-full h-full"
          >
            <CarouselContent className="-ml-4">
              {feedbackData.map((feedback) => (
                <CarouselItem key={feedback.id} className="pl-4 basis-full lg:basis-1/2">
                  <div className="flex flex-col lg:flex-row w-full gap-6 p-5 sm:p-6 lg:p-8 rounded-xl border border-black/25 dark:border-neutral-600 bg-white dark:bg-neutral-900 shadow-md transition-all duration-300 hover:shadow-lg hover:border-primary/20 dark:hover:border-primary/20 min-h-[260px] h-full">
                    {/* Image on the left */}
                    <div className="relative w-40 h-40 sm:w-52 sm:h-52 rounded-lg overflow-hidden shrink-0 mx-auto lg:mx-0">
                      <Image
                        src={feedback.image}
                        alt={feedback.author}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Content on the right */}
                    <div className="flex flex-col justify-between w-full h-full text-center lg:text-left">
                      {/* Title + Description */}
                      <div className="space-y-2">
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white line-clamp-1">
                          {feedback.title}
                        </h3>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 line-clamp-3">
                          {feedback.description}
                        </p>
                      </div>

                      {/* Ratings + Author */}
                      <div className="space-y-1 mt-4">
                        <div className="text-primary text-base">{'⭐'.repeat(feedback.rating)}</div>
                        <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                          {feedback.author}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                          {feedback.handle}
                        </p>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden xl:flex absolute -left-12 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full border-2 border-primary bg-transparent hover:bg-primary text-primary hover:text-white transition-all duration-300 hover:scale-110 z-50">
              <ChevronLeft className="h-5 w-5" />
            </CarouselPrevious>
            <CarouselNext className="hidden xl:flex absolute -right-12 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full border-2 border-primary bg-transparent hover:bg-primary text-primary hover:text-white transition-all duration-300 hover:scale-110 z-50">
              <ChevronRight className="h-5 w-5" />
            </CarouselNext>
          </Carousel>
          <div className="flex gap-2 mt-6 justify-center">
            {Array.from({ length: count }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => api?.scrollTo(idx)}
                className={`w-12 h-2 rounded-lg transition-all duration-300 ${
                  current === idx ? 'bg-primary' : 'bg-green-400/70'
                } hover:bg-primary/80`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Feedback;
