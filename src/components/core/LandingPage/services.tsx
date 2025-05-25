'use client';

import { useTheme } from 'next-themes';
import Image from 'next/image';

const servicesData = [
  {
    id: 1,
    title: 'Massage Therapy',
    description:
      'Experience deep relaxation and stress relief through our expert massage therapy services.',
    icon: '/svgs/file.svg',
  },
  {
    id: 2,
    title: 'Athletic Training',
    description:
      'Enhance your performance with personalized athletic training programs designed for your goals.',
    icon: '/svgs/file.svg',
  },
  {
    id: 3,
    title: 'Physiotherapy',
    description: 'Recover and rehabilitate with our specialized physiotherapy treatments and care.',
    icon: '/svgs/file.svg',
  },
];

const Services = () => {
  useTheme();

  return (
    <section
      id="services"
      className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-16 transition-all duration-500"
    >
      <div className="max-w-screen-xl mx-auto flex flex-col h-full lg:flex-row gap-10 lg:gap-16 items-stretch">
        {/* Image Section (hidden on small screens) */}
        <div className="relative w-full max-w-[300px] mx-0 aspect-[9/16] rounded-2xl overflow-hidden hidden lg:block">
          <Image
            src={'/svgs/service.svg'}
            alt="Wellness Services"
            fill
            className="object-cover transition-transform duration-500 hover:scale-105"
            priority
          />
        </div>

        {/* Text + Services Cards */}
        <div className="flex flex-col justify-between w-full">
          {/* Header Section */}
          <div className="text-center lg:text-left space-y-4 px-2 sm:px-0">
            <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary tracking-tight leading-[1.1]">
              Our Services
            </h1>
            <p className="text-sm xs:text-base sm:text-lg md:text-xl text-gray-600 dark:text-neutral-400 max-w-3xl mx-auto lg:mx-0 leading-relaxed">
              Discover a world of holistic healing and professional care. We offer expert services
              that nurture your body, mind, and spirit. Experience the perfect blend of traditional
              techniques and modern wellness practices, all tailored to help you achieve your
              optimal state of well-being.
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 mt-10">
            {servicesData.map((service) => (
              <div
                key={service.id}
                className={`w-full group p-6 rounded-2xl border-2 border-dashed border-primary/30 hover:border-primary/50 transition-all duration-300 
                  bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm
                  shadow-lg shadow-primary/5 dark:shadow-primary/10
                  `}
              >
                <div className="flex flex-col justify-between h-full gap-6">
                  {/* Icon */}
                  <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-primary/10 dark:bg-primary/20 mx-auto lg:mx-0">
                    <Image
                      src={service.icon}
                      alt={service.title}
                      fill
                      className="object-cover p-3 transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>

                  {/* Text */}
                  <div className="space-y-2 mt-4 sm:mt-6">
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-primary dark:text-primary/90 line-clamp-2">
                      {service.title}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-700 dark:text-neutral-300 line-clamp-4">
                      {service.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
