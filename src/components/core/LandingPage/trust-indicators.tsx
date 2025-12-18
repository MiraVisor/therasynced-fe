'use client';

import { Award, MessageCircle, Shield, Star, Users } from 'lucide-react';

const trustData = [
  {
    id: 1,
    title: 'Verified Professionals',
    description: 'All therapists are licensed and verified.',
    icon: Shield,
  },
  {
    id: 2,
    title: 'Real-Time Messaging',
    description: 'Communicate directly with your therapist through secure messaging.',
    icon: MessageCircle,
  },
  {
    id: 3,
    title: 'Reviews & Ratings',
    description: 'See authentic reviews from other clients to help you choose.',
    icon: Star,
  },
  {
    id: 4,
    title: 'Loyalty Rewards',
    description: 'Earn points and stamps with every booking for future discounts.',
    icon: Award,
  },
];

const TrustIndicators = () => {
  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-16 transition-all duration-500">
      <div className="max-w-screen-xl mx-auto flex flex-col items-center gap-8 sm:gap-12 lg:gap-16">
        {/* Header */}
        <div className="text-center space-y-3 sm:space-y-4 lg:space-y-6 max-w-4xl mx-auto">
          <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white leading-[1.1]">
            Why Choose <span className="text-primary">TheraSynced</span>
          </h2>
          <p className="text-sm xs:text-base sm:text-lg md:text-xl text-gray-600 dark:text-neutral-400 leading-relaxed">
            A trusted platform connecting you with licensed professionals.
          </p>
        </div>

        {/* Trust Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 w-full">
          {trustData.map((item) => (
            <div
              key={item.id}
              className="flex flex-col items-center text-center p-6 rounded-2xl border-2 border-dashed border-primary/30 hover:border-primary/50 transition-all duration-300 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm shadow-lg shadow-primary/5 dark:shadow-primary/10 hover:shadow-xl hover:shadow-primary/10"
            >
              {/* Icon */}
              <div className="w-16 h-16 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-4">
                <item.icon className="w-8 h-8 text-primary dark:text-primary/90" />
              </div>

              {/* Content */}
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {item.title}
              </h3>
              <p className="text-sm sm:text-base text-gray-700 dark:text-neutral-300 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustIndicators;
