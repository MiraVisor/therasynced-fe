import { ChatContact, ConversationContext, MessageType } from '@/services/chatService';
import { Booking, Freelancer } from '@/types/types';

/**
 * Get badge color for conversation context
 */
export function getContextBadgeColor(context: ConversationContext): string {
  switch (context) {
    case ConversationContext.PRE_BOOKING:
      return 'bg-blue-100 text-blue-800';
    case ConversationContext.ACTIVE_BOOKING:
      return 'bg-green-100 text-green-800';
    case ConversationContext.POST_CARE:
      return 'bg-yellow-100 text-yellow-800';
    case ConversationContext.ONGOING:
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

/**
 * Get human-readable label for conversation context
 */
export function getContextLabel(context: ConversationContext): string {
  switch (context) {
    case ConversationContext.PRE_BOOKING:
      return 'Pre-Booking';
    case ConversationContext.ACTIVE_BOOKING:
      return 'Active Booking';
    case ConversationContext.POST_CARE:
      return 'Post-Care';
    case ConversationContext.ONGOING:
      return 'Ongoing';
    default:
      return 'General';
  }
}

/**
 * Get human-readable label for message type
 */
export function getMessageTypeLabel(type: MessageType): string {
  switch (type) {
    case MessageType.INQUIRY:
      return 'Inquiry';
    case MessageType.APPOINTMENT_RELATED:
      return 'Appointment Related';
    case MessageType.FOLLOW_UP:
      return 'Follow-Up';
    case MessageType.GENERAL:
      return 'General';
    default:
      return 'General';
  }
}

/**
 * Check if user can message a freelancer
 * Messaging is only allowed when there's a booking relationship
 */
export function canMessageFreelancer(freelancer: Freelancer, hasBooking: boolean): boolean {
  // Messaging requires an active booking, post-care, or ongoing relationship
  return hasBooking;
}

/**
 * Calculate days remaining for post-care access (90 days from completion)
 */
export function getPostCareDaysRemaining(completedAt: string): number {
  const completedDate = new Date(completedAt);
  const now = new Date();
  const daysSinceCompletion = Math.floor(
    (now.getTime() - completedDate.getTime()) / (1000 * 60 * 60 * 24),
  );
  const daysRemaining = 90 - daysSinceCompletion;
  return Math.max(0, daysRemaining);
}

/**
 * Determine if booking selector should be shown
 */
export function shouldShowBookingSelector(
  context: ConversationContext,
  bookings: Booking[],
): boolean {
  // Show selector if there are multiple bookings and context allows booking selection
  if (bookings.length <= 1) {
    return false;
  }
  // Show for active booking, post-care, and ongoing contexts
  return (
    context === ConversationContext.ACTIVE_BOOKING ||
    context === ConversationContext.POST_CARE ||
    context === ConversationContext.ONGOING
  );
}

/**
 * Get default message type based on conversation context
 */
export function getDefaultMessageType(context?: ConversationContext): MessageType {
  if (!context) {
    return MessageType.GENERAL;
  }
  switch (context) {
    case ConversationContext.ACTIVE_BOOKING:
      return MessageType.APPOINTMENT_RELATED;
    case ConversationContext.POST_CARE:
      return MessageType.FOLLOW_UP;
    case ConversationContext.ONGOING:
      return MessageType.GENERAL;
    default:
      return MessageType.GENERAL;
  }
}

/**
 * Check if user can message a contact based on context
 * Messaging is only allowed when there's an active booking, post-care, or ongoing relationship
 * @param contact - The chat contact object
 * @returns true if messaging is allowed, false otherwise
 */
export function canUserMessage(contact: ChatContact): boolean {
  const { context } = contact;

  // Messaging is only allowed with active booking, post-care, or ongoing relationship
  return (
    context === ConversationContext.ACTIVE_BOOKING ||
    context === ConversationContext.POST_CARE ||
    context === ConversationContext.ONGOING
  );
}

/**
 * Get user-friendly message explaining messaging status
 * @param contact - The chat contact object
 * @returns Message string explaining the messaging status
 */
export function getMessageForUser(contact: ChatContact): string {
  const { context } = contact;

  if (context === ConversationContext.ACTIVE_BOOKING) {
    return 'Active appointment - messaging enabled';
  }

  if (context === ConversationContext.POST_CARE) {
    return 'Recent appointment - messaging enabled';
  }

  if (context === ConversationContext.ONGOING) {
    return 'Ongoing patient relationship - messaging enabled';
  }

  // If no valid context (shouldn't happen as backend filters), show booking required message
  return 'Messaging is only available after booking an appointment. Please book an appointment first.';
}
