'use client';

import { Calendar, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { KeyboardEvent, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { ConversationContext, MessageType } from '@/services/chatService';
import { Booking } from '@/types/types';
import {
  getDefaultMessageType,
  getMessageTypeLabel,
  shouldShowBookingSelector,
} from '@/utils/chatUtils';

interface ChatMessageInputProps {
  onSendMessage: (
    message: string,
    bookingId?: string,
    messageType?: MessageType,
  ) => void | Promise<void>;
  onTypingStart?: () => void;
  onTypingStop?: () => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  loading?: boolean;
  errorMessage?: string;
  context?: ConversationContext;
  bookings?: Booking[];
  selectedBookingId?: string;
  freelancerId?: string;
}

const ChatMessageInput: React.FC<ChatMessageInputProps> = ({
  onSendMessage,
  onTypingStart,
  onTypingStop,
  disabled = false,
  placeholder = 'Type your message...',
  className,
  loading = false,
  errorMessage,
  context,
  bookings = [],
  selectedBookingId: initialBookingId,
  freelancerId,
}) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | undefined>(initialBookingId);
  const [messageType, setMessageType] = useState<MessageType | undefined>(
    context ? getDefaultMessageType(context) : undefined,
  );

  const showBookingSelector = shouldShowBookingSelector(
    context || ConversationContext.GENERAL,
    bookings,
  );
  const showMessageTypeSelector = context !== undefined;

  const handleSendMessage = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || disabled || loading) return;

    try {
      await onSendMessage(trimmedMessage, selectedBookingId, messageType);
      setMessage('');
      // Reset booking selection if not persistent
      if (!initialBookingId) {
        setSelectedBookingId(undefined);
      }

      // Stop typing indicator
      if (isTyping) {
        setIsTyping(false);
        onTypingStop?.();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (value: string) => {
    setMessage(value);

    // Handle typing indicators
    if (value.trim() && !isTyping) {
      setIsTyping(true);
      onTypingStart?.();
    } else if (!value.trim() && isTyping) {
      setIsTyping(false);
      onTypingStop?.();
    }
  };

  const canSend = message.trim().length > 0 && !disabled && !loading;

  const formatBookingLabel = (booking: Booking) => {
    const date = new Date(booking.slot.startTime);
    return `${date.toLocaleDateString()} - ${booking.status}`;
  };

  const router = useRouter();

  // Check if messaging is disabled (no valid context means no booking relationship)
  const isMessagingDisabled =
    !context ||
    (context !== ConversationContext.ACTIVE_BOOKING &&
      context !== ConversationContext.POST_CARE &&
      context !== ConversationContext.ONGOING);

  // Context-aware hints (only show when messaging is enabled)
  const getContextHint = () => {
    if (!context || isMessagingDisabled) return null;
    switch (context) {
      case ConversationContext.ACTIVE_BOOKING:
        return {
          message: 'Active appointment - messaging enabled',
          type: 'info' as const,
        };
      case ConversationContext.POST_CARE:
        return {
          message: 'Recent appointment - messaging enabled',
          type: 'info' as const,
        };
      case ConversationContext.ONGOING:
        return {
          message: 'Ongoing patient relationship - messaging enabled',
          type: 'info' as const,
        };
      default:
        return null;
    }
  };

  const contextHint = getContextHint();

  return (
    <div className={cn('border-t border-gray-200 p-4 space-y-3', className)}>
      {/* Error Message / Disabled State */}
      {(errorMessage || isMessagingDisabled) && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-800 font-medium mb-2">
            {errorMessage ||
              'Messaging is only available after booking an appointment. Please book an appointment first.'}
          </p>
          {(errorMessage?.includes('messaging is only available') ||
            errorMessage?.includes('booking an appointment') ||
            isMessagingDisabled) && (
            <div className="mt-3">
              <Button
                onClick={() => {
                  // Navigate to booking page for this freelancer
                  if (freelancerId) {
                    router.push(`/dashboard/freelancer/${freelancerId}`);
                  } else {
                    router.push('/dashboard/explore');
                  }
                }}
                className="w-full bg-primary hover:bg-primary/90 text-white"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Book Appointment
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Context-aware hint */}
      {contextHint && !errorMessage && (
        <div
          className={cn(
            'rounded-md p-2.5 text-xs',
            contextHint.type === 'info' && 'bg-blue-50 text-blue-800 border border-blue-200',
          )}
        >
          <p>{contextHint.message}</p>
        </div>
      )}

      {/* Booking Selector */}
      {showBookingSelector && bookings.length > 0 && (
        <div className="space-y-1">
          <Label htmlFor="booking-select" className="text-xs text-gray-600 flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Link to booking (optional)
          </Label>
          <Select value={selectedBookingId || ''} onValueChange={setSelectedBookingId}>
            <SelectTrigger id="booking-select" className="h-9 text-sm">
              <SelectValue placeholder="Select a booking" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">No booking</SelectItem>
              {bookings.map((booking) => (
                <SelectItem key={booking.id} value={booking.id}>
                  {formatBookingLabel(booking)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Message Type Selector */}
      {showMessageTypeSelector && (
        <div className="space-y-1">
          <Label htmlFor="message-type-select" className="text-xs text-gray-600">
            Message type
          </Label>
          <Select
            value={messageType || ''}
            onValueChange={(value) => setMessageType(value as MessageType)}
          >
            <SelectTrigger id="message-type-select" className="h-9 text-sm">
              <SelectValue placeholder="Select message type" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(MessageType).map((type) => (
                <SelectItem key={type} value={type}>
                  {getMessageTypeLabel(type)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Booking Badge */}
      {selectedBookingId && (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            <Calendar className="h-3 w-3 mr-1" />
            Linked to booking
          </Badge>
        </div>
      )}

      {/* Message Input */}
      <div className="flex items-end space-x-2">
        <div className="flex-1">
          <Textarea
            value={message}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={disabled && errorMessage ? errorMessage : placeholder}
            disabled={disabled || loading}
            className="min-h-[60px] max-h-32 resize-none border-gray-200 focus:border-green-500 focus:ring-green-500"
            rows={2}
          />
        </div>

        <Button
          onClick={handleSendMessage}
          disabled={!canSend}
          size="sm"
          className={cn(
            'h-[60px] w-12 p-0 bg-green-600 hover:bg-green-700 disabled:bg-gray-300',
            loading && 'animate-pulse',
          )}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {/* Character limit indicator (optional) */}
      {message.length > 500 && (
        <div className="flex justify-end mt-1">
          <span className={cn('text-xs', message.length > 1000 ? 'text-red-500' : 'text-gray-500')}>
            {message.length}/1000
          </span>
        </div>
      )}
    </div>
  );
};

export default ChatMessageInput;
