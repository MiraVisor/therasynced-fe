'use client';

import { format, isToday, isYesterday } from 'date-fns';
import { Check, CheckCheck, Clock } from 'lucide-react';
import { useEffect, useRef } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { ChatMessage } from '@/services/chatService';

interface ChatMessageListProps {
  messages: ChatMessage[];
  currentUserId?: string;
  loading?: boolean;
  canLoadMore?: boolean;
  onLoadMore?: () => void;
  className?: string;
}

const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  currentUserId,
  loading = false,
  canLoadMore = false,
  onLoadMore,
  className,
}) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);

    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return `Yesterday ${format(date, 'HH:mm')}`;
    } else {
      return format(date, 'MMM dd, HH:mm');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part.charAt(0))
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const groupMessagesByDate = (messages: ChatMessage[]) => {
    const groups: { date: string; messages: ChatMessage[] }[] = [];
    let currentDate = '';
    let currentGroup: ChatMessage[] = [];

    messages.forEach((message) => {
      const messageDate = format(new Date(message.createdAt), 'yyyy-MM-dd');

      if (messageDate !== currentDate) {
        if (currentGroup.length > 0) {
          groups.push({ date: currentDate, messages: currentGroup });
        }
        currentDate = messageDate;
        currentGroup = [message];
      } else {
        currentGroup.push(message);
      }
    });

    if (currentGroup.length > 0) {
      groups.push({ date: currentDate, messages: currentGroup });
    }

    return groups;
  };

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);

    if (isToday(date)) {
      return 'Today';
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMMM dd, yyyy');
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const messageGroups = groupMessagesByDate(messages);

  if (loading && messages.length === 0) {
    return (
      <div className={cn('flex flex-col h-full', className)}>
        <div className="flex-1 p-4 space-y-4">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className={cn('flex space-x-3', index % 2 === 0 ? 'justify-start' : 'justify-end')}
            >
              {index % 2 === 0 && (
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
              )}
              <div
                className={cn(
                  'max-w-xs p-3 rounded-lg animate-pulse',
                  index % 2 === 0 ? 'bg-gray-200' : 'bg-green-200',
                )}
              >
                <div className="h-4 bg-gray-300 rounded mb-2" />
                <div className="h-3 bg-gray-300 rounded w-3/4" />
              </div>
              {index % 2 === 1 && (
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div
        className={cn('flex flex-col items-center justify-center h-full text-gray-500', className)}
      >
        <div className="text-center">
          <p className="text-lg font-medium mb-2">No messages yet</p>
          <p className="text-sm text-gray-400">Start the conversation by sending a message</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className={cn('flex-1', className)} ref={scrollAreaRef}>
      <div className="p-4 space-y-6">
        {/* Load More Button */}
        {canLoadMore && (
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={onLoadMore}
              disabled={loading}
              className="text-green-600 border-green-200 hover:bg-green-50"
            >
              {loading ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                'Load older messages'
              )}
            </Button>
          </div>
        )}

        {/* Message Groups by Date */}
        {messageGroups.map(({ date, messages: groupMessages }) => (
          <div key={date} className="space-y-4">
            {/* Date Header */}
            <div className="flex justify-center">
              <div className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                {formatDateHeader(date)}
              </div>
            </div>

            {/* Messages */}
            <div className="space-y-3">
              {groupMessages.map((message) => {
                const isOwnMessage =
                  message.senderId === currentUserId ||
                  (message.users?.id && message.users.id === currentUserId);

                return (
                  <div
                    key={message.id}
                    className={cn('flex gap-3', isOwnMessage ? 'justify-end' : 'justify-start')}
                  >
                    {!isOwnMessage && message.users && (
                      <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
                        <AvatarImage
                          src={message.users.profilePicture || ''}
                          alt={message.users.name || 'User'}
                        />
                        <AvatarFallback className="bg-green-100 text-green-700 text-xs">
                          {message.users.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <div className="max-w-xs lg:max-w-md">
                      <div
                        className={cn(
                          'px-4 py-2 rounded-lg',
                          isOwnMessage ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-900',
                        )}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                      </div>

                      <div
                        className={cn(
                          'flex items-center mt-1 space-x-1 text-xs text-gray-500',
                          isOwnMessage ? 'justify-end' : 'justify-start',
                        )}
                      >
                        <span>{formatMessageTime(message.createdAt)}</span>
                        {isOwnMessage && (
                          <div className="ml-1">
                            {message.isRead ? (
                              <CheckCheck className="w-3 h-3 text-green-500" />
                            ) : (
                              <Check className="w-3 h-3" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {isOwnMessage && (
                      <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
                        <AvatarImage src={message.users.profilePicture} alt={message.users.name} />
                        <AvatarFallback className="bg-green-100 text-green-700 text-xs">
                          {message.users.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
};

export default ChatMessageList;
