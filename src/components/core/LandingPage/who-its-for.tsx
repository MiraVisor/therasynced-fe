'use client';

import Image from 'next/image';
import Link from 'next/link';

const audience = [
  {
    id: 1,
    badge: '01',
    title: 'Discover Professionals',
    subtitle:
      'Browse verified physiotherapists, trainers, and wellness experts to find the right fit for your needs.',
    bullets: ['View profiles & ratings', 'Check availability', 'Read client reviews'],
    image: '/images/physio/physiotherapist-helping-female-patient-her-clinic.jpg',
    alt: 'User browsing professionals on the platform',
  },
  {
    id: 2,
    badge: '02',
    title: 'Book & Connect',
    subtitle: 'Schedule appointments, chat securely, and coordinate your sessions with ease.',
    bullets: ['Instant bookings', 'Secure in-app messaging', 'Flexible scheduling'],
    image: '/images/physio/doctor-glues-tepee-athlete-hospital.jpg',
    alt: 'User booking and chatting with a professional',
  },
  {
    id: 3,
    badge: '03',
    title: 'Get Support & Track Progress',
    subtitle:
      'Receive professional guidance, track appointments, and manage your wellness journey.',
    bullets: ['Session reminders', 'Follow-ups & updates', 'Track your progress'],
    image: '/images/physio/woman-working-with-personal-trainer.jpg',
    alt: 'User tracking sessions and progress on the platform',
  },
];

const WhoItsFor = () => {
  return (
    <section
      id="who-its-for"
      data-aos="fade-up"
      data-aos-once="false"
      data-aos-mirror="true"
      className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-16 transition-all duration-500"
    >
      <div className="max-w-screen-xl mx-auto relative">
        {/* Decorative star shapes */}
        <div className="hidden xl:block absolute right-0 bottom-20 pointer-events-none">
          <svg
            width="100"
            height="100"
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-primary"
          >
            <path
              d="M60 0C60 33.1371 86.8629 60 120 60C86.8629 60 60 86.8629 60 120C60 86.8629 33.1371 60 0 60C33.1371 60 60 33.1371 60 0Z"
              fill="currentColor"
              fillOpacity="0.1"
            />
          </svg>
          <svg
            className="absolute top-6 left-6"
            width="50"
            height="50"
            viewBox="0 0 60 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M30 0C30 16.5685 43.4315 30 60 30C43.4315 30 30 43.4315 30 60C30 43.4315 16.5685 30 0 30C16.5685 30 30 16.5685 30 0Z"
              fill="currentColor"
              className="text-primary"
              fillOpacity="0.2"
            />
          </svg>
        </div>

        {/* Main layout container */}
        <div className="relative xl:min-h-[750px]">
          {/* Heading - positioned above card 03 (left side) */}
          <div className="xl:absolute xl:top-0 xl:left-0 xl:max-w-[600px] mb-10 xl:mb-0 z-10 text-center lg:text-left">
            <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary tracking-tight leading-[1.1]">
              How <span className="text-primary/70">our</span> Platform Works
            </h1>
            <p className="mt-4 sm:mt-6 text-sm xs:text-base sm:text-lg text-gray-600 max-w-sm mx-auto lg:mx-0 leading-relaxed">
              Whether you’re an individual, athlete, or clinic,our platform connects you with
              professionals across wellness fields:
            </p>
          </div>

          {/* Cards Container - Grid on lg, Absolute on xl+ */}
          <div className="flex flex-col lg:grid lg:grid-cols-2 lg:gap-6 xl:contents gap-6">
            {/* Card 01 - Top Right */}
            <article
              className="xl:absolute xl:top-0 xl:right-0 xl:w-[380px] 2xl:w-[420px] group p-4 sm:p-5 rounded-2xl border-2 border-dashed border-primary/30 hover:border-primary/50 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-lg shadow-primary/5"
              data-aos="fade-left"
              data-aos-once="false"
              data-aos-mirror="true"
              data-aos-delay="200"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 text-primary text-sm font-bold">
                  {audience[0]?.badge}
                </span>
                <h3 className="text-base sm:text-lg font-semibold text-primary">
                  {audience[0]?.title}
                </h3>
              </div>
              <div className="w-full h-36 sm:h-44 rounded-xl overflow-hidden relative mb-3">
                <Image
                  src={audience[0]?.image ?? ''}
                  alt={audience[0]?.alt ?? ''}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  priority
                />
              </div>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                {audience[0]?.subtitle}
              </p>
              <ul className="flex flex-wrap gap-2">
                {audience[0]?.bullets.map((bullet) => (
                  <li
                    key={bullet}
                    className="inline-flex items-center gap-1.5 text-xs text-gray-600 bg-primary/5 px-2.5 py-1 rounded-full"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {bullet}
                  </li>
                ))}
              </ul>
            </article>

            {/* Card 02 - Middle Center */}
            <div
              data-aos="fade-up"
              data-aos-once="false"
              data-aos-mirror="true"
              data-aos-delay="400"
            >
              <article className="xl:absolute xl:top-[240px] xl:left-1/2 xl:-translate-x-1/2 xl:w-[380px] 2xl:w-[420px] group p-4 sm:p-5 rounded-2xl border-2 border-dashed border-primary/30 hover:border-primary/50 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-lg shadow-primary/5">
                <div className="flex items-center gap-3 mb-3">
                  <span className="inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 text-primary text-sm font-bold">
                    {audience[1]?.badge}
                  </span>
                  <h3 className="text-base sm:text-lg font-semibold text-primary">
                    {audience[1]?.title}
                  </h3>
                </div>
                <div className="w-full h-36 sm:h-44 rounded-xl overflow-hidden relative mb-3">
                  <Image
                    src={audience[1]?.image ?? ''}
                    alt={audience[1]?.alt ?? ''}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    priority
                  />
                </div>
                <p className="text-sm text-gray-700 leading-relaxed mb-3">
                  {audience[1]?.subtitle}
                </p>
                <ul className="flex flex-wrap gap-2">
                  {audience[1]?.bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="inline-flex items-center gap-1.5 text-xs text-gray-600 bg-primary/5 px-2.5 py-1 rounded-full"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </article>
            </div>

            {/* Card 03 - Bottom Left (below heading) */}
            <article
              className="xl:absolute xl:top-[480px] xl:left-0 xl:w-[380px] 2xl:w-[420px] lg:col-span-2 lg:max-w-md group p-4 sm:p-5 rounded-2xl border-2 border-dashed border-primary/30 hover:border-primary/50 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-lg shadow-primary/5"
              data-aos="fade-right"
              data-aos-once="false"
              data-aos-mirror="true"
              data-aos-delay="400"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 text-primary text-sm font-bold">
                  {audience[2]?.badge}
                </span>
                <h3 className="text-base sm:text-lg font-semibold text-primary">
                  {audience[2]?.title}
                </h3>
              </div>
              <div className="w-full h-36 sm:h-44 rounded-xl overflow-hidden relative mb-3">
                <Image
                  src={audience[2]?.image ?? ''}
                  alt={audience[2]?.alt ?? ''}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  priority
                />
              </div>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                {audience[2]?.subtitle}
              </p>
              <ul className="flex flex-wrap gap-2">
                {audience[2]?.bullets.map((bullet) => (
                  <li
                    key={bullet}
                    className="inline-flex items-center gap-1.5 text-xs text-gray-600 bg-primary/5 px-2.5 py-1 rounded-full"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {bullet}
                  </li>
                ))}
              </ul>
            </article>
          </div>

          {/* CTA Button - Bottom Right */}
          <div
            className="xl:absolute xl:bottom-0 xl:right-0 mt-10 xl:mt-0 text-center lg:text-right"
            data-aos="fade-up"
            data-aos-once="false"
            data-aos-mirror="true"
            data-aos-delay="500"
          >
            <Link
              href="/authentication/sign-in"
              className="inline-flex items-center gap-3 bg-primary text-white px-6 py-3 rounded-full shadow-lg shadow-primary/20 hover:bg-primary/90 hover:shadow-primary/30 transition-all duration-300 text-sm sm:text-base font-medium"
            >
              Start Your Recovery Journey
              <span className="inline-flex items-center justify-center w-6 h-6 bg-white/20 rounded-lg">
                <span aria-hidden className="text-sm">
                  ↗
                </span>
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhoItsFor;
