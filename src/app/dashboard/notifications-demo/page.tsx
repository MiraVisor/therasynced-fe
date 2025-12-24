'use client';

import { useState } from 'react';

import { NotificationDemo } from '@/components/common/notifications/NotificationDemo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ROLES, RoleType } from '@/types/types';

export default function NotificationsDemoPage() {
  const [selectedRole, setSelectedRole] = useState<RoleType>('PATIENT');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Notification System Demo</h1>
        <p className="text-gray-600">
          Test the notification popover system for different user roles
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select User Role</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {Object.values(ROLES).map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role as RoleType)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedRole === role
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <NotificationDemo userRole={selectedRole} />

        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span>Role-based notification filtering</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>Unread count badge</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full" />
              <span>Priority-based styling</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full" />
              <span>Action buttons</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full" />
              <span>Mark as read functionality</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-indigo-500 rounded-full" />
              <span>Responsive design</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notification Types</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-100 rounded flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded" />
              </div>
              <span>Appointments</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-100 rounded flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-green-500 rounded" />
              </div>
              <span>Bookings</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-100 rounded flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded" />
              </div>
              <span>Payments</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-indigo-100 rounded flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded" />
              </div>
              <span>Messages</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-100 rounded flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-yellow-500 rounded" />
              </div>
              <span>Reviews</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-100 rounded flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-gray-500 rounded" />
              </div>
              <span>System</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
