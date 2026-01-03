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
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';

const userTypeFeatures = {
  client: {
    title: 'For Clients',
    description: 'Everything you need to find and book with licensed freelancers',
    features: [
      {
        id: 1,
        title: 'Book Unlimited Sessions',
        description: 'Schedule appointments with certified freelancers anytime, anywhere.',
        icon: Calendar,
      },
      {
        id: 2,
        title: 'View Profiles & Ratings',
        description: 'Browse detailed freelancer profiles with authentic reviews and ratings.',
        icon: Star,
      },
      {
        id: 3,
        title: 'Secure In-App Messaging',
        description: 'Communicate directly with your freelancer before and after sessions.',
        icon: MessageCircle,
      },
      {
        id: 4,
        title: 'Flexible Scheduling Tools',
        description: 'Book at office, clinic, home visit, or online sessions.',
        icon: Clock,
      },
      {
        id: 5,
        title: 'Loyalty Rewards',
        description: 'Earn points and stamps for discounts on future bookings.',
        icon: Award,
      },
      {
        id: 6,
        title: 'Favorites System',
        description: 'Save your preferred freelancers for quick and easy booking.',
        icon: Heart,
      },
    ],
  },
  freelancer: {
    title: 'For Freelancers',
    description: 'Powerful tools to grow your wellness business and manage your practice',
    features: [
      {
        id: 1,
        title: 'Professional Public Profile',
        description: 'Showcase your expertise, services, and credentials to attract clients.',
        icon: UserPlus,
      },
      {
        id: 2,
        title: 'Client Booking System',
        description: 'Automated booking management with real-time availability updates.',
        icon: Calendar,
      },
      {
        id: 3,
        title: 'Automated Calendar Sync',
        description: 'Keep your schedule organized with seamless calendar integration.',
        icon: Clock,
      },
      {
        id: 4,
        title: 'Secure Payments & Payouts',
        description: 'Get paid on time with secure payment processing and automated payouts.',
        icon: Shield,
      },
      {
        id: 5,
        title: 'Advanced Analytics & Reporting',
        description: 'Track your performance with detailed insights and revenue reports.',
        icon: BarChart3,
      },
      {
        id: 6,
        title: 'Priority Support',
        description: 'Get dedicated support to help you succeed on the platform.',
        icon: CheckCircle2,
      },
    ],
  },
  team: {
    title: 'For Teams',
    description: 'Coming soon - Manage your clinic or group practice with team tools',
    features: [
      {
        id: 1,
        title: 'Multi-User Team Dashboard',
        description: 'Centralized dashboard for managing your entire team and practice.',
        icon: Users,
      },
      {
        id: 2,
        title: 'Assign Bookings to Staff',
        description: 'Easily delegate appointments and manage team schedules.',
        icon: Calendar,
      },
      {
        id: 3,
        title: 'Unified Calendar Management',
        description: 'View and manage all team schedules from one unified calendar.',
        icon: Clock,
      },
      {
        id: 4,
        title: 'Performance Insights & Reports',
        description: 'Track team performance with comprehensive analytics and reports.',
        icon: TrendingUp,
      },
      {
        id: 5,
        title: 'Custom Branding Options',
        description: 'Personalize your team profile with custom branding and settings.',
        icon: Award,
      },
      {
        id: 6,
        title: 'No Monthly Fee',
        description: 'Free team management tools (limited time offer).',
        icon: CheckCircle2,
      },
    ],
    comingSoon: true,
  },
};

const Features = () => {
  const [activeTab, setActiveTab] = useState<'client' | 'freelancer' | 'team'>('client');
  const currentFeatures = userTypeFeatures[activeTab];

  return (
    <section
      id="features"
      className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-16 transition-all duration-500"
    >
      <div className="max-w-screen-xl mx-auto flex flex-col gap-8 sm:gap-12 lg:gap-16">
        {/* Header Section */}
        <div className="text-center space-y-3 sm:space-y-4 lg:space-y-6 max-w-4xl mx-auto">
          <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary tracking-tight leading-[1.1]">
            Features for <span className="text-gray-900 dark:text-white">Everyone</span>
          </h1>
          <p className="text-sm xs:text-base sm:text-lg md:text-xl text-gray-600 dark:text-neutral-400 leading-relaxed">
            Whether you&apos;re looking for therapy services or building your wellness practice, we
            have the tools you need.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
          {Object.entries(userTypeFeatures).map(([key, value]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as 'client' | 'freelancer' | 'team')}
              className={`px-6 py-3 rounded-xl font-medium text-sm sm:text-base transition-all duration-300 ${
                activeTab === key
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'bg-white/80 dark:bg-neutral-900/80 text-gray-700 dark:text-neutral-300 hover:bg-primary/10 dark:hover:bg-primary/20 border-2 border-primary/30'
              }`}
            >
              <div className="flex items-center gap-2">
                {value.title}

                <Badge variant="secondary" className="text-xs">
                  Coming Soon
                </Badge>
              </div>
            </button>
          ))}
        </div>

        {/* Features Content */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {currentFeatures.title}
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-neutral-400">
              {currentFeatures.description}
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
      </div>
    </section>
  );
};

export default Features;
