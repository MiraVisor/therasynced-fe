'use client';

import { Send } from 'lucide-react';
import { KeyboardEvent, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface ChatMessageInputProps {
  onSendMessage: (message: string) => void | Promise<void>;
  onTypingStart?: () => void;
  onTypingStop?: () => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  loading?: boolean;
}

const ChatMessageInput: React.FC<ChatMessageInputProps> = ({
  onSendMessage,
  onTypingStart,
  onTypingStop,
  disabled = false,
  placeholder = 'Type your message...',
  className,
  loading = false,
}) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || disabled || loading) return;

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

  const canSend = message.trim().length > 0 && !disabled && !loading;

  return (
    <div className={cn('border-t border-gray-200 p-4', className)}>
      <div className="flex items-end space-x-2">
        <div className="flex-1">
          <Textarea
            value={message}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
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
