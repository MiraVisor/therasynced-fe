'use client';

import { CheckCircle, Quote } from 'lucide-react';
import Image from 'next/image';
import { useEffect } from 'react';

const testimonialData = [
  {
    id: 1,
    title: 'Relieved My Back Pain Quickly',
    description:
      'I booked a session with a certified physiotherapist through the platform, and after just one session, I felt immediate relief. Highly professional and knowledgeable!',
    image: 'https://ui-avatars.com/api/?name=Ayesha+Khan&background=random&color=fff',
    rating: 5,
    author: 'Ayesha Khan',
    handle: '@ayeshakhan',
    verified: true,
  },
  {
    id: 2,
    title: 'Exceptional Care and Guidance',
    description:
      'The therapist tailored my treatment plan perfectly. They explained every step and helped me recover faster than I expected. The booking and communication were seamless.',
    image: 'https://ui-avatars.com/api/?name=Omar+Farooq&background=random&color=fff',
    rating: 5,
    author: 'Omar Farooq',
    handle: '@omarfarooq',
    verified: true,
  },
  {
    id: 3,
    title: 'Convenient and Professional',
    description:
      'I loved the convenience of booking an in-home physiotherapy session. The therapist was on time, professional, and very caring. Highly recommended for busy schedules!',
    image: 'https://ui-avatars.com/api/?name=Lina+Ahmed&background=random&color=fff',
    rating: 4,
    author: 'Lina Ahmed',
    handle: '@linaahmed',
    verified: true,
  },
  {
    id: 4,
    title: 'Friendly and Skilled Specialists',
    description:
      'The platform connects you with amazing specialists. My therapist really listened to my concerns and adjusted my sessions accordingly. I am very satisfied!',
    image: 'https://ui-avatars.com/api/?name=Hamza+Ali&background=random&color=fff',
    rating: 5,
    author: 'Hamza Ali',
    handle: '@hamzaali',
    verified: true,
  },
  {
    id: 5,
    title: 'Seamless Booking Experience',
    description:
      'Booking a session was easy and fast. The therapist was punctual, professional, and highly skilled. The whole experience was smooth and reassuring.',
    image: 'https://ui-avatars.com/api/?name=Sana+Mir&background=random&color=fff',
    rating: 5,
    author: 'Sana Mir',
    handle: '@sanamir',
    verified: true,
  },
  {
    id: 6,
    title: 'Highly Recommend for Wellness Services',
    description:
      'I have tried several wellness and physiotherapy services, but this platform stands out. The therapists are highly professional, caring, and always provide clear guidance.',
    image: 'https://ui-avatars.com/api/?name=Zain+Malik&background=random&color=fff',
    rating: 5,
    author: 'Zain Malik',
    handle: '@zainmalik',
    verified: true,
  },
];

const Feedback = () => {
  useEffect(() => {
    // AOS refresh is now handled globally in the Animation component
  }, []);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'}>
        ★
      </span>
    ));
  };

  // Duplicate testimonials for seamless marquee loop
  const repeatedTestimonials = [...testimonialData, ...testimonialData];

  return (
    <>
      <style>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .marquee {
          animation: marquee 10s linear infinite;
        }
        .marquee:hover {
          animation-play-state: paused;
        }
      `}</style>

      <section
        id="reviews"
        className="w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-18 lg:py-28 transition-all duration-500"
      >
        <div className="max-w-[1500px] mx-auto flex flex-col items-center gap-8 sm:gap-12 lg:gap-16">
          {/* Header */}
          <div
            className="text-center space-y-3 sm:space-y-4 lg:space-y-6 max-w-4xl mx-auto"
            data-aos="fade-up"
            data-aos-duration="800"
          >
            <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white leading-[1.1]">
              What Our <span className="text-primary">Clients Say</span>
            </h2>
            <p className="text-sm xs:text-base sm:text-lg md:text-xl text-gray-600 dark:text-neutral-400 leading-relaxed">
              Hear from our satisfied clients about their experiences and transformations. Their
              success stories inspire us to continue delivering excellence.
            </p>
          </div>

          {/* Testimonials Marquee */}
          <div
            className="w-full overflow-hidden"
            data-aos="fade-up"
            data-aos-delay="200"
            data-aos-duration="800"
            data-aos-once="false"
            data-aos-mirror="true"
          >
            <div
              className="marquee flex gap-4 items-stretch will-change-transform px-2"
              aria-hidden
            >
              {repeatedTestimonials.map((testimonial, idx) => (
                <div
                  key={`${testimonial.id}-${idx}`}
                  className="basis-full sm:basis-1/2 lg:basis-1/3 min-w-[320px] sm:min-w-[380px] lg:min-w-[420px] flex-shrink-0"
                  data-aos="fade-up"
                  data-aos-delay={(idx % testimonialData.length) * 100 + 300}
                  data-aos-duration="700"
                  data-aos-once="false"
                  data-aos-mirror="true"
                >
                  <div className="group relative h-full">
                    {/* Card Background Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-600/5 dark:from-primary/10 dark:to-purple-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Main Card */}
                    <div className="relative h-full flex flex-col p-5 sm:p-6 lg:p-7 rounded-2xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900/80 backdrop-blur-sm shadow-sm dark:shadow-lg transition-all duration-300 group-hover:shadow-lg dark:group-hover:shadow-primary/10 group-hover:border-primary/30 dark:hover:border-primary/40 hover:-translate-y-2 ">
                      {/* Quote Icon */}
                      <div className="absolute top-4 right-4 opacity-40 group-hover:opacity-50 transition-opacity duration-300">
                        <Quote className="w-8 h-8 sm:w-8 sm:h-10 text-primary" />
                      </div>

                      {/* Rating Stars */}
                      <div className="flex gap-0.5 mb-3">{renderStars(testimonial.rating)}</div>

                      {/* Title */}
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1">
                        {testimonial.title}
                      </h3>

                      {/* Testimonial Text */}
                      <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-5 flex-grow line-clamp-2">
                        {testimonial.description}
                      </p>

                      {/* Divider */}
                      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-neutral-700 to-transparent mb-4 sm:mb-5" />

                      {/* Author Info */}
                      <div className="flex items-center gap-2.5 sm:gap-3">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full dark:ring-primary/30 overflow-hidden bg-gradient-to-br from-primary/20 to-purple-600/20 flex items-center justify-center">
                            <Image
                              src={testimonial.image}
                              alt={testimonial.author}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          {/* {testimonial.verified && (
                            <div className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-0.5">
                              <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            </div>
                          )} */}
                        </div>

                        {/* Name and Handle */}
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm truncate">
                            {testimonial.author}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {testimonial.handle}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Feedback;
