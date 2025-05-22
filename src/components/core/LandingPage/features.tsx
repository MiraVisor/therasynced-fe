'use client';

import { BadgeCheck, Calendar, HandHeart, Heart, Shield, Users } from 'lucide-react';
import Image from 'next/image';

const featuresData = [
  {
    id: 1,
    title: 'Certified & Compassionate Therapists',
    description: 'Our team is trained, experienced, and genuinely cares about your well-being.',
    icon: BadgeCheck,
  },
  {
    id: 2,
    title: 'Personalized Healing Plans',
    description: 'Every session is tailored to your unique body, mind, and goals.',
    icon: HandHeart,
  },
  {
    id: 3,
    title: 'Safe & Soothing Environment',
    description: 'We create a calm space where you can truly relax and heal.',
    icon: Shield,
  },
  {
    id: 4,
    title: 'Holistic Approach',
    description: 'We blend traditional techniques with modern practices for complete wellness.',
    icon: Heart,
  },
  {
    id: 5,
    title: 'Flexible Appointments',
    description: 'Book sessions that work around your schedule—because your time matters.',
    icon: Calendar,
  },
  {
    id: 6,
    title: 'Trusted by Our Community',
    description: "We're proud to be a go-to wellness space for so many happy clients.",
    icon: Users,
  },
];

const Features = () => {
  return (
    <section
      id="features"
      className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-16 transition-all duration-500"
    >
      <div className="max-w-screen-xl mx-auto flex flex-col h-full lg:flex-row gap-10 lg:gap-16 items-stretch">
        {/* Content Section (Header + Cards) */}
        <div className="flex flex-col justify-between min-h-[300px] gap-20">
          {/* Header Section */}
          <div className="text-center lg:text-left space-y-4">
            <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary tracking-tight">
              Why Choose Us
            </h1>
            <p className="text-sm xs:text-base sm:text-lg md:text-xl text-gray-700 dark:text-neutral-300 max-w-3xl lg:max-w-none mx-auto lg:mx-0">
              We&apos;re committed to providing exceptional care and service. Our approach combines
              expertise, personalization, and modern techniques to ensure you receive the best
              possible wellness experience.
            </p>
          </div>

          {/* Features List */}
          <div className="flex flex-col gap-4">
            {featuresData.map((feature) => (
              <div
                key={feature.id}
                className="flex items-start gap-4 p-3 rounded-lg transition-all duration-300"
              >
                <div
                  className="relative w-14 h-14 rounded-lg overflow-hidden bg-primary/10 dark:bg-primary/20 flex-shrink-0 flex items-center justify-center sbg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm
                  shadow-lg shadow-primary/5 dark:shadow-primary/10"
                >
                  <feature.icon width={32} height={32} className="object-cover p-1" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-700 dark:text-neutral-300">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Image Section */}
        <div className="relative w-full max-w-[450px] mx-0 aspect-square rounded-2xl overflow-hidden hidden lg:block">
          <Image
            src={'/svgs/features.svg'}
            alt="Why Choose Us"
            fill
            className="object-cover transition-transform duration-500 hover:scale-105"
            priority
          />
        </div>
      </div>
    </section>
  );
};

export default Features;
