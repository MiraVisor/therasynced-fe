'use client';

import { Calendar, Clock, Users } from 'lucide-react';

const Teams = () => {
  return (
    <section
      id="teams"
      className="w-full px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 bg-white
    >
      <div className="max-w-4xl mx-auto">
        <div className="text-center space-y-6 sm:space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Clock className="w-4 h-4" />
            <span>Coming Soon</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-[1.1]">
            Built for <span className="text-primary">Teams</span>
          </h2>

          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            We're working on something great for clinics and group practices. Tools to manage your
            team, schedule appointments, and grow together.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mt-12">
            <div className="flex flex-col items-center text-center p-6 rounded-xl border border-gray-200 bg-gray-50
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Team Management
              </h3>
              <p className="text-sm text-gray-600
                Manage your entire team from one dashboard
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-xl border border-gray-200 bg-gray-50
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Unified Scheduling
              </h3>
              <p className="text-sm text-gray-600
                See all appointments across your practice
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-xl border border-gray-200 bg-gray-50
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Performance Insights
              </h3>
              <p className="text-sm text-gray-600
                Track how your team is doing
              </p>
            </div>
          </div>

          <p className="text-sm text-gray-500 mt-8">
            Want to be notified when Teams launches?{' '}
            <a
              href="mailto:support@therasynced.com?subject=Teams Launch Notification"
              className="text-primary hover:underline"
            >
              Send us an email
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Teams;
