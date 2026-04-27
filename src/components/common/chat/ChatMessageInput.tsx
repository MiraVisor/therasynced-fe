'use client';

import { AlertTriangle, Send } from 'lucide-react';
import { KeyboardEvent, useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { formatLimit, isApproachingLimit } from '@/utils/subscriptionHelpers';

interface ChatMessageInputProps {
  onSendMessage: (message: string) => void | Promise<void>;
  onTypingStart?: () => void;
  onTypingStop?: () => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  loading?: boolean;
  messagesUsed?: number;
  messagesLimit?: number | null;
  isAtLimit?: boolean;
}

const ChatMessageInput: React.FC<ChatMessageInputProps> = ({
  onSendMessage,
  onTypingStart,
  onTypingStop,
  disabled = false,
  placeholder = 'Type your message...',
  className,
  loading = false,
  messagesUsed = 0,
  messagesLimit = null,
  isAtLimit = false,
}) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const isUnlimited = messagesLimit === null;
  const messagesPercentage =
    !isUnlimited && messagesLimit !== null && messagesLimit > 0
      ? Math.min((messagesUsed / messagesLimit) * 100, 100)
      : 0;
  const isNearLimit = isApproachingLimit(messagesUsed, messagesLimit);
  const isDisabledByLimit = isAtLimit || disabled;

  const handleSendMessage = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isDisabledByLimit || loading) return;

    try {
      await onSendMessage(trimmedMessage);
      setMessage('');

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

  const canSend = message.trim().length > 0 && !isDisabledByLimit && !loading;

  return (
    <div className={cn('border-t border-gray-200 p-4', className)}>
      {/* Messaging Limit Display */}
      {!isUnlimited && messagesLimit !== null && (
        <div className="mb-2 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600 this billing cycle</span>
            <span
              className={cn(
                'font-semibold',
                isAtLimit ? 'text-red-600' : isNearLimit ? 'text-orange-600' : 'text-gray-700',
              )}
            >
              {messagesUsed}/{formatLimit(messagesLimit)}
            </span>
          </div>
          <Progress
            value={messagesPercentage}
            className={cn(
              'h-1.5',
              isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-orange-500' : 'bg-primary',
            )}
          />
        </div>
      )}

      {/* Limit Reached Alert */}
      {isAtLimit && (
        <Alert variant="destructive" className="mb-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Messaging limit reached. Please upgrade your subscription or wait for your billing cycle
            to reset.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-end space-x-2">
        <div className="flex-1">
          <Textarea
            value={message}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isAtLimit ? 'Messaging limit reached' : placeholder}
            disabled={isDisabledByLimit || loading}
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
