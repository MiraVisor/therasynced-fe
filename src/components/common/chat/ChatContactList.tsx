'use client';

import { format, isToday, isYesterday } from 'date-fns';
import { Search, User } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { VerificationBadge } from '@/components/ui/verification-badge';
import { cn } from '@/lib/utils';
import { ChatContact } from '@/services/chatService';

interface ChatContactListProps {
  contacts: ChatContact[];
  activeConversationId: string | null;
  onContactSelect: (contact: ChatContact) => void;
  loading?: boolean;
  className?: string;
}

const ChatContactList: React.FC<ChatContactListProps> = ({
  contacts,
  onContactSelect,
  loading = false,
  className,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);

    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM dd');
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

  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <div className={cn('flex flex-col h-full', className)}>
        <div className="p-4 border-b border-gray-200">
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="flex-1 p-4 space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col h-full overflow-hidden w-full max-w-full', className)}>
      {/* Search Header */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0 w-full max-w-full overflow-hidden">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search people..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Contacts List */}
      <ScrollArea className="flex-1 overflow-hidden">
        {filteredContacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <User className="h-12 w-12 mb-4" />
            <p className="text-center">
              {searchTerm ? 'No contacts found' : 'No conversations yet'}
            </p>
            <p className="text-sm text-center text-gray-400 mt-1">
              {searchTerm
                ? 'Try searching with a different term'
                : 'Start a conversation with someone you have an appointment with'}
            </p>
          </div>
        ) : (
          <div className="p-2 w-full overflow-hidden">
            {filteredContacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => onContactSelect(contact)}
                className={cn(
                  'flex items-center p-3 cursor-pointer transition-colors hover:bg-gray-50 w-full max-w-full overflow-hidden min-w-0 last:border-b-0 border-b',
                )}
              >
                <div className="relative">
                  <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-lg flex-shrink-0">
                    {getInitials(contact.name)}
                  </div>
                  <div className="absolute -bottom-1 -right-1">
                    <VerificationBadge
                      status={contact.verificationStatus || 'unverified'}
                      size="sm"
                    />
                  </div>
                </div>

                <div className="ml-3 flex-1 min-w-0 overflow-hidden">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-medium text-gray-900 truncate flex-1 min-w-0 break-all">
                      {contact.name}
                    </h3>
                    <div className="flex items-center space-x-1 flex-shrink-0">
                      {contact.lastMessage && (
                        <span className="text-xs text-gray-500 overflow-clip">
                          {formatMessageTime(contact.lastMessage.createdAt)}
                        </span>
                      )}
                      {contact.unreadCount > 0 && (
                        <Badge
                          variant="default"
                          className="bg-green-600 hover:bg-green-700 text-white text-xs px-1.5 py-0.5 min-w-[18px] h-4 flex items-center justify-center flex-shrink-0"
                        >
                          {contact.unreadCount > 99 ? '99+' : contact.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {contact.lastMessage && (
                    <div className="w-full overflow-hidden">
                      <p
                        className="text-sm text-gray-600 truncate mt-1 block w-full break-all max-w-full"
                        style={{ wordBreak: 'break-word' }}
                      >
                        {contact.lastMessage.isFromMe && (
                          <span className="text-gray-400">You: </span>
                        )}
                        {contact.lastMessage.content}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default ChatContactList;
