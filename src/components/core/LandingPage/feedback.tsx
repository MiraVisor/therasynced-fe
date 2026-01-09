'use client';

import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
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
    therapist: 'Dr. Sarah Mitchell, PT',
    highlight: true,
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
    therapist: 'Dr. James Wilson, LMT',
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
    therapist: 'Dr. Emily Chen, DPT',
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
    therapist: 'Dr. Michael Brown, PT',
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
    therapist: 'Dr. Lisa Anderson, LMT',
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
    therapist: 'Dr. Robert Taylor, PT',
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

  const featuredTestimonial = testimonialData.find((t) => t.highlight) || testimonialData[0];
  const otherTestimonials = testimonialData.filter((t) => !t.highlight).slice(0, 3);

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
        className="w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-18 lg:py-28 transition-all duration-500 relative overflow-hidden"
      >
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-mint-light/20 to-transparent dark:via-mint-light/10 pointer-events-none" />

        <div className="max-w-[1500px] mx-auto flex flex-col items-center gap-8 sm:gap-12 lg:gap-16 relative z-10">
          {/* Header */}
          <div
            className="text-center space-y-3 sm:space-y-4 lg:space-y-6 max-w-4xl mx-auto"
            data-aos="fade-up"
            data-aos-duration="800"
          >
            <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white leading-[1.1] font-playfair">
              What Our <span className="text-primary">Clients Say</span>
            </h2>
            <p className="text-sm xs:text-base sm:text-lg md:text-xl text-gray-600 dark:text-neutral-400 leading-relaxed font-open-sans">
              Hear from our satisfied clients about their experiences and transformations. Their
              success stories inspire us to continue delivering excellence.
            </p>
          </div>

          {/* Featured Testimonial */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-4xl"
            data-aos="fade-up"
            data-aos-delay="200"
            data-aos-duration="800"
          >
            <div className="relative p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-primary/10 via-sage-warm/10 to-mint-light/20 dark:from-primary/20 dark:via-sage-warm/20 dark:to-mint-light/30 border-2 border-primary/20 dark:border-primary/30 shadow-2xl overflow-hidden">
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-sage-warm/10 rounded-full blur-2xl" />

              <div className="relative z-10">
                <Quote className="w-12 h-12 text-primary/30 mb-6" />
                <div className="flex gap-1 mb-4">{renderStars(featuredTestimonial.rating)}</div>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4 font-playfair">
                  {featuredTestimonial.title}
                </h3>
                <p className="text-lg text-gray-700 dark:text-neutral-300 leading-relaxed mb-8 font-open-sans">
                  "{featuredTestimonial.description}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="relative flex-shrink-0">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-purple-600/20 ring-4 ring-white dark:ring-neutral-900">
                      <Image
                        src={featuredTestimonial.image}
                        alt={featuredTestimonial.author}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 dark:text-white text-lg font-poppins">
                      {featuredTestimonial.author}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-neutral-400 font-inter">
                      {featuredTestimonial.handle}
                    </p>
                    <p className="text-xs text-primary font-semibold mt-1 font-inter">
                      with {featuredTestimonial.therapist}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Other Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
            {otherTestimonials.map((testimonial, idx) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + idx * 0.1, duration: 0.5 }}
                className="group relative h-full"
                data-aos="fade-up"
                data-aos-delay={300 + idx * 100}
                data-aos-duration="700"
              >
                <div className="relative h-full flex flex-col p-6 rounded-2xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900/80 backdrop-blur-sm shadow-sm dark:shadow-lg transition-all duration-300 group-hover:shadow-lg dark:group-hover:shadow-primary/10 group-hover:border-primary/30 dark:hover:border-primary/40 hover:-translate-y-2">
                  <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/20 group-hover:text-primary/30 transition-colors duration-300" />
                  <div className="flex gap-0.5 mb-3">{renderStars(testimonial.rating)}</div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1 font-poppins">
                    {testimonial.title}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-4 flex-grow line-clamp-3 font-open-sans">
                    {testimonial.description}
                  </p>
                  <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-neutral-700 to-transparent mb-4" />
                  <div className="flex items-center gap-3">
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-purple-600/20">
                        <Image
                          src={testimonial.image}
                          alt={testimonial.author}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm truncate font-poppins">
                        {testimonial.author}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate font-inter">
                        {testimonial.handle}
                      </p>
                      <p className="text-xs text-primary font-medium mt-0.5 truncate font-inter">
                        {testimonial.therapist}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Marquee for Additional Testimonials */}
          <div
            className="w-full overflow-hidden"
            data-aos="fade-up"
            data-aos-delay="600"
            data-aos-duration="800"
          >
            <div className="marquee flex gap-4 items-stretch will-change-transform px-2">
              {repeatedTestimonials.map((testimonial, idx) => (
                <div
                  key={`${testimonial.id}-${idx}`}
                  className="basis-full sm:basis-1/2 lg:basis-1/3 min-w-[320px] sm:min-w-[380px] lg:min-w-[420px] flex-shrink-0"
                >
                  <div className="group relative h-full">
                    <div className="relative h-full flex flex-col p-5 sm:p-6 rounded-2xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900/80 backdrop-blur-sm shadow-sm dark:shadow-lg transition-all duration-300 group-hover:shadow-lg dark:group-hover:shadow-primary/10 group-hover:border-primary/30">
                      <Quote className="absolute top-4 right-4 opacity-40 group-hover:opacity-50 transition-opacity duration-300 w-8 h-8 text-primary" />
                      <div className="flex gap-0.5 mb-3">{renderStars(testimonial.rating)}</div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1 font-poppins">
                        {testimonial.title}
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm leading-relaxed mb-4 flex-grow line-clamp-2 font-open-sans">
                        {testimonial.description}
                      </p>
                      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-neutral-700 to-transparent mb-4" />
                      <div className="flex items-center gap-2.5">
                        <div className="relative flex-shrink-0">
                          <div className="w-11 h-11 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-purple-600/20">
                            <Image
                              src={testimonial.image}
                              alt={testimonial.author}
                              width={44}
                              height={44}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm truncate font-poppins">
                            {testimonial.author}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate font-inter">
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

          {/* Read More Link */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="text-center"
          >
            <a
              href="#reviews"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-semibold transition-colors duration-300 font-inter"
            >
              Read more success stories
              <span className="text-xl">→</span>
            </a>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default Feedback;
