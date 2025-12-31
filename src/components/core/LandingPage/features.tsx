'use client';

import {
  Award,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  Heart,
  MessageCircle,
  Shield,
  Star,
  TrendingUp,
  UserPlus,
  Users,
} from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

const Features = () => {
  const userTypeFeatures = {
    client: {
      features: [
        {
          id: 1,
          icon: Heart,
          title: 'Personalized Care',
          description: 'Therapists matched to your unique goals, preferences, and challenges.',
        },
        {
          id: 2,
          icon: Calendar,
          title: 'Flexible Scheduling',
          description: 'Book sessions that fit your busy life—from anywhere, any time.',
        },
        {
          id: 3,
          icon: MessageCircle,
          title: 'Ongoing Support',
          description:
            'Stay connected to your care team between appointments for continued progress.',
        },
        {
          id: 4,
          icon: Shield,
          title: 'Confidential & Secure',
          description: 'Your privacy is encrypted and protected at every step.',
        },
        {
          id: 5,
          icon: Award,
          title: 'Qualified Professionals',
          description: 'Work only with licensed, vetted, and tested therapists.',
        },
        {
          id: 6,
          icon: Star,
          title: 'Verified Reviews',
          description: 'Real ratings from verified clients to help you choose the best fit.',
        },
      ],
    },
    freelancer: {
      features: [
        {
          id: 1,
          icon: TrendingUp,
          title: 'Grow Your Practice',
          description: 'Attract new clients and expand your reach with our marketing tools.',
        },
        {
          id: 2,
          icon: Clock,
          title: 'Flexible Hours',
          description: 'Set your own schedule and control your availability.',
        },
        {
          id: 3,
          icon: BarChart3,
          title: 'Track Your Growth',
          description: 'Easy analytics for your earnings, client progress, and performance.',
        },
        {
          id: 4,
          icon: UserPlus,
          title: 'Client Matching',
          description: 'We connect you with clients aligned with your expertise.',
        },
        {
          id: 5,
          icon: CheckCircle2,
          title: 'Easy Booking & Payments',
          description: 'Integrated scheduling and secure, instant payouts.',
        },
        {
          id: 6,
          icon: Shield,
          title: 'Protected Sessions',
          description: 'Session protection and dispute resolution for peace of mind.',
        },
      ],
    },
    team: {
      features: [
        {
          id: 1,
          icon: Users,
          title: 'Team Collaboration',
          description: 'Assign cases, share notes, and manage your provider team on one platform.',
        },
        {
          id: 2,
          icon: Calendar,
          title: 'Centralized Scheduling',
          description:
            'Oversee and automate your organization’s appointments from a unified dashboard.',
        },
        {
          id: 3,
          icon: Shield,
          title: 'Compliance & Privacy',
          description: 'HIPAA-compliant infrastructure and robust permissions for sensitive data.',
        },
        {
          id: 4,
          icon: Award,
          title: 'Talent Sourcing',
          description: 'Find & onboard new therapists quickly with credential verification.',
        },
        {
          id: 5,
          icon: Star,
          title: 'Outcomes Tracking',
          description: 'Monitor client results and provider performance with powerful analytics.',
        },
        {
          id: 6,
          icon: Heart,
          title: 'Employee Wellness',
          description: 'Support your staff with integrated resources and well-being programs.',
        },
      ],
    },
  };

  const [activeTab] = useState<'client' | 'freelancer' | 'team'>('client');
  const currentFeatures = userTypeFeatures[activeTab];

  return (
    <section
      id="features"
      data-aos="fade-up"
      data-aos-once="false"
      data-aos-mirror="true"
      className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-16 transition-all duration-500 mt-16"
    >
      <div className="max-w-screen-xl mx-auto flex flex-col h-full lg:flex-row gap-10 lg:gap-16 items-stretch">
        {/* Content Section (Header + Cards) */}
        <div
          className="flex flex-col justify-between min-h-[300px] gap-20"
          data-aos="fade-right"
          data-aos-once="false"
          data-aos-mirror="true"
        >
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

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {currentFeatures.features.map((feature) => (
              <div
                key={feature.id}
                className="flex flex-col p-5 sm:p-6 rounded-2xl border-2 border-dashed border-primary/30 hover:border-primary/50 transition-all duration-300 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm shadow-lg shadow-primary/5 dark:shadow-primary/10 hover:shadow-xl hover:shadow-primary/10"
              >
                <div className="flex items-start gap-4">
                  <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden bg-primary/10 dark:bg-primary/20 flex-shrink-0 flex items-center justify-center">
                    <feature.icon className="w-6 h-6 sm:w-7 sm:h-7 text-primary dark:text-primary/90" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                      {feature.title}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-700 dark:text-neutral-300 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Image Section */}
        <div
          className="relative w-full max-w-[500px] mx-0 aspect-square rounded-2xl overflow-hidden hidden lg:block"
          data-aos="fade-left"
          data-aos-once="false"
          data-aos-mirror="true"
        >
          <Image
            src={'/images/physio/woman-working-with-personal-trainer.jpg'}
            alt="Why Choose Us"
            fill
            className="object-cover object-center transition-transform duration-500 hover:scale-105"
            priority
          />
        </div>
      </div>
    </section>
  );
};

export default Features;
