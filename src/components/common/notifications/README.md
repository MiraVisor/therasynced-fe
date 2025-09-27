# Notification System

A comprehensive notification popover system designed for patient, freelancer, and admin sides of the TheraSynced application.

## Features

- **Role-based filtering**: Different notification types for different user roles
- **Unread count badge**: Visual indicator of unread notifications
- **Priority-based styling**: Color-coded notifications based on priority levels
- **Action buttons**: Clickable actions for each notification
- **Mark as read functionality**: Individual and bulk mark as read
- **Responsive design**: Works on all screen sizes
- **Real-time updates**: Hook-based state management

## Components

### NotificationPopover

The main popover component that displays notifications in a dropdown format.

```tsx
import { NotificationPopover } from '@/components/common/notifications';

<NotificationPopover
  notifications={notifications}
  unreadCount={unreadCount}
  onMarkAsRead={markAsRead}
  onMarkAllAsRead={markAllAsRead}
  onNotificationClick={handleNotificationClick}
  userRole="PATIENT"
/>;
```

### NotificationItem

Individual notification item component with icon, priority badge, and action buttons.

### NotificationBadge

Badge component for displaying unread count with animation.

### useNotifications Hook

Custom hook for managing notification state and operations.

```tsx
import { useNotifications } from '@/hooks/useNotifications';

const {
  notifications,
  unreadCount,
  isLoading,
  error,
  markAsRead,
  markAllAsRead,
  addNotification,
  removeNotification,
  clearAllNotifications,
} = useNotifications();
```

## Notification Types

- **APPOINTMENT**: Calendar-related notifications
- **BOOKING**: Booking confirmations and updates
- **PAYMENT**: Payment processing notifications
- **MESSAGE**: Chat and communication notifications
- **REVIEW**: Review and rating notifications
- **SYSTEM**: System alerts and updates

## Priority Levels

- **LOW**: Blue styling, low urgency
- **MEDIUM**: Yellow styling, medium urgency
- **HIGH**: Orange styling, high urgency
- **URGENT**: Red styling, immediate attention required

## Role-based Filtering

### Patient (PATIENT)

- Appointments
- Bookings
- Payments
- Messages
- Reviews

### Freelancer (FREELANCER)

- Appointments
- Bookings
- Messages
- Reviews
- System

### Admin (ADMIN)

- All notification types
- System alerts
- User management
- Platform analytics

## Usage in Dashboard

The notification system is automatically integrated into the dashboard header via `DashboardPageWrapper`. Each dashboard component (AdminHome, FreelancerHome, UserExploreMain) passes the user role to enable proper filtering.

## Demo

Visit `/dashboard/notifications-demo` to see the notification system in action with different user roles and sample notifications.

## Styling

The notification system uses Tailwind CSS classes and follows the application's design system. Colors and styling are consistent with the overall theme while providing clear visual hierarchy for different notification types and priorities.

## Future Enhancements

- Real-time WebSocket integration
- Push notifications
- Email notification preferences
- Notification sound settings
- Advanced filtering and search
- Notification templates
- Bulk actions
