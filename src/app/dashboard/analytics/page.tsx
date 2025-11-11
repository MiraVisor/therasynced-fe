'use client';

import {
  CheckCircle,
  Clock,
  MapPin,
  MessageSquare,
  Star,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useState } from 'react';

import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Types
interface Session {
  id: string;
  clientName: string;
  date: string;
  service: string;
  duration: number; // in minutes
  status: 'completed' | 'cancelled' | 'no-show';
  rating?: number;
  location: 'clinic' | 'home' | 'online';
  notes?: string;
  clientType: 'new' | 'returning';
}

interface Client {
  id: string;
  name: string;
  totalSessions: number;
  lastSession: string;
  averageRating: number;
  totalHours: number;
  status: 'active' | 'inactive';
  preferredLocation: 'clinic' | 'home' | 'online';
}

// Mock data - replace with actual API calls
const mockSessions: Session[] = [
  {
    id: '1',
    clientName: 'John Smith',
    date: '2025-01-15',
    service: 'Physical Therapy',
    duration: 60,
    status: 'completed',
    rating: 5,
    location: 'clinic',
    clientType: 'returning',
  },
  {
    id: '2',
    clientName: 'Sarah Johnson',
    date: '2025-01-14',
    service: 'Occupational Therapy',
    duration: 45,
    status: 'completed',
    rating: 4,
    location: 'home',
    clientType: 'new',
  },
  {
    id: '3',
    clientName: 'Mike Wilson',
    date: '2025-01-13',
    service: 'Speech Therapy',
    duration: 30,
    status: 'completed',
    rating: 5,
    location: 'online',
    clientType: 'returning',
  },
  {
    id: '4',
    clientName: 'Emily Davis',
    date: '2025-01-12',
    service: 'Physical Therapy',
    duration: 60,
    status: 'cancelled',
    location: 'clinic',
    clientType: 'new',
  },
  {
    id: '5',
    clientName: 'David Brown',
    date: '2025-01-11',
    service: 'Occupational Therapy',
    duration: 45,
    status: 'completed',
    rating: 4,
    location: 'home',
    clientType: 'returning',
  },
  {
    id: '6',
    clientName: 'Lisa Anderson',
    date: '2025-01-10',
    service: 'Physical Therapy',
    duration: 60,
    status: 'no-show',
    location: 'clinic',
    clientType: 'returning',
  },
];

const mockClients: Client[] = [
  {
    id: '1',
    name: 'John Smith',
    totalSessions: 12,
    lastSession: '2025-01-15',
    averageRating: 4.8,
    totalHours: 10.5,
    status: 'active',
    preferredLocation: 'clinic',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    totalSessions: 3,
    lastSession: '2025-01-14',
    averageRating: 4.5,
    totalHours: 2.25,
    status: 'active',
    preferredLocation: 'home',
  },
  {
    id: '3',
    name: 'Mike Wilson',
    totalSessions: 8,
    lastSession: '2025-01-13',
    averageRating: 4.9,
    totalHours: 4,
    status: 'active',
    preferredLocation: 'online',
  },
  {
    id: '4',
    name: 'Emily Davis',
    totalSessions: 1,
    lastSession: '2025-01-12',
    averageRating: 0,
    totalHours: 0,
    status: 'inactive',
    preferredLocation: 'clinic',
  },
  {
    id: '5',
    name: 'David Brown',
    totalSessions: 6,
    lastSession: '2025-01-11',
    averageRating: 4.7,
    totalHours: 4.5,
    status: 'active',
    preferredLocation: 'home',
  },
];

const AnalyticsPage = () => {
  const [sessions, setSessions] = useState<Session[]>(mockSessions);
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Calculate stats
  const totalSessions = sessions.filter((s) => s.status === 'completed').length;
  const totalHours = sessions
    .filter((s) => s.status === 'completed')
    .reduce((sum, s) => sum + s.duration / 60, 0);

  const completionRate = sessions.length > 0 ? (totalSessions / sessions.length) * 100 : 0;

  const averageRating =
    sessions.filter((s) => s.rating).reduce((sum, s) => sum + (s.rating || 0), 0) /
      sessions.filter((s) => s.rating).length || 0;

  const newClients = sessions.filter((s) => s.clientType === 'new').length;
  const returningClients = sessions.filter((s) => s.clientType === 'returning').length;

  // Calculate trends (mock data)
  const previousPeriodSessions = totalSessions * 0.85; // 15% increase
  const sessionsTrend = ((totalSessions - previousPeriodSessions) / previousPeriodSessions) * 100;

  const getLocationIcon = (location: string) => {
    switch (location) {
      case 'clinic':
        return <MapPin className="h-4 w-4" />;
      case 'home':
        return <Users className="h-4 w-4" />;
      case 'online':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  // Top performing services
  const serviceStats = sessions.reduce(
    (acc, session) => {
      if (!acc[session.service]) {
        acc[session.service] = { count: 0, totalDuration: 0, avgRating: 0, ratings: [] };
      }
      acc[session.service].count++;
      acc[session.service].totalDuration += session.duration;
      if (session.rating) {
        acc[session.service].ratings.push(session.rating);
      }
      return acc;
    },
    {} as Record<
      string,
      { count: number; totalDuration: number; avgRating: number; ratings: number[] }
    >,
  );

  Object.keys(serviceStats).forEach((service) => {
    serviceStats[service].avgRating =
      serviceStats[service].ratings.length > 0
        ? serviceStats[service].ratings.reduce((a, b) => a + b, 0) /
          serviceStats[service].ratings.length
        : 0;
  });

  return (
    <DashboardPageWrapper
      header={
        <div className="flex flex-col gap-2 w-full">
          <h2 className="text-2xl font-poppins font-bold text-charcoal">Analytics & Insights</h2>
          <p className="font-inter text-muted-foreground">
            Track your performance and client engagement
          </p>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <Card
                key={index}
                className="group border border-gray-200/80 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] backdrop-blur-sm bg-white/80 rounded-xl"
              >
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                        <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-32"></div>
                      </div>
                      <div className="w-12 h-12 bg-gray-200 rounded-2xl"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="group border border-gray-200/80 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] backdrop-blur-sm bg-white/80 rounded-xl hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-inter font-medium text-success">
                      Completed Sessions
                    </p>
                    <p className="text-2xl font-poppins font-bold text-charcoal">{totalSessions}</p>
                    <div className="flex items-center mt-1">
                      {sessionsTrend > 0 ? (
                        <TrendingUp className="h-4 w-4 text-emerald-600 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                      )}
                      <span
                        className={`text-xs ${sessionsTrend > 0 ? 'text-emerald-600' : 'text-red-600'}`}
                      >
                        {Math.abs(sessionsTrend).toFixed(1)}% from last period
                      </span>
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-emerald-50 group-hover:scale-110 transition-transform duration-300">
                    <CheckCircle className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group border border-gray-200/80 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] backdrop-blur-sm bg-white/80 rounded-xl hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-inter font-medium text-info">Total Hours</p>
                    <p className="text-2xl font-poppins font-bold text-charcoal">
                      {totalHours.toFixed(1)}h
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      {completionRate.toFixed(1)}% completion rate
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-blue-50 group-hover:scale-110 transition-transform duration-300">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group border border-gray-200/80 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] backdrop-blur-sm bg-white/80 rounded-xl hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-inter font-medium text-warning">Average Rating</p>
                    <p className="text-2xl font-poppins font-bold text-charcoal">
                      {averageRating.toFixed(1)}
                    </p>
                    <div className="flex items-center mt-1">
                      <Star className="h-4 w-4 text-purple-600 mr-1" />
                      <span className="text-xs text-purple-600">
                        {sessions.filter((s) => s.rating).length} rated sessions
                      </span>
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-purple-50 group-hover:scale-110 transition-transform duration-300">
                    <Star className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group border border-gray-200/80 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] backdrop-blur-sm bg-white/80 rounded-xl hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-inter font-medium text-primary">Active Clients</p>
                    <p className="text-2xl font-poppins font-bold text-charcoal">
                      {clients.filter((c) => c.status === 'active').length}
                    </p>
                    <p className="text-xs text-amber-600 mt-1">
                      {newClients} new, {returningClients} returning
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-amber-50 group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Client Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-poppins text-charcoal">
                <Users className="h-5 w-5" />
                Top Clients
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="animate-pulse">
                      <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                          <div>
                            <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                            <div className="h-3 bg-gray-200 rounded w-16"></div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 mb-1">
                            <div className="w-3 h-3 bg-gray-200 rounded"></div>
                            <div className="h-4 bg-gray-200 rounded w-8"></div>
                          </div>
                          <div className="h-3 bg-gray-200 rounded w-12"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {clients
                    .filter((c) => c.status === 'active')
                    .sort((a, b) => b.totalSessions - a.totalSessions)
                    .slice(0, 5)
                    .map((client) => (
                      <div
                        key={client.id}
                        className="flex items-center justify-between p-3 border border-gray-100 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-emerald-600">
                              {client.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-poppins font-medium text-charcoal">{client.name}</p>
                            <p className="text-xs font-inter text-muted-foreground">
                              {client.totalSessions} sessions
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-amber-500" />
                            <span className="text-sm font-medium">
                              {client.averageRating.toFixed(1)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">{client.totalHours.toFixed(1)}h</p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-poppins text-charcoal">
                <MapPin className="h-5 w-5" />
                Location Preferences
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="animate-pulse">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-gray-200 rounded"></div>
                          <div className="h-4 bg-gray-200 rounded w-16"></div>
                        </div>
                        <div className="text-right">
                          <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
                          <div className="h-3 bg-gray-200 rounded w-12"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {['clinic', 'home', 'online'].map((location) => {
                    const locationSessions = sessions.filter((s) => s.location === location);
                    const locationCount = locationSessions.length;
                    const locationPercentage =
                      sessions.length > 0 ? (locationCount / sessions.length) * 100 : 0;

                    return (
                      <div key={location} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getLocationIcon(location)}
                          <span className="text-sm font-inter font-medium capitalize">
                            {location}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-poppins font-semibold">
                            {locationCount} sessions
                          </p>
                          <p className="text-xs font-inter text-muted-foreground">
                            {locationPercentage.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardPageWrapper>
  );
};

export default AnalyticsPage;
