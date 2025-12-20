'use client';

import { format, isToday, isYesterday } from 'date-fns';
import { Archive, Search, User } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VerificationBadge } from '@/components/ui/verification-badge';
import { cn } from '@/lib/utils';
import { ChatContact, ConversationContext } from '@/services/chatService';
import {
  canUserMessage,
  getContextBadgeColor,
  getContextLabel,
  getMessageForUser,
} from '@/utils/chatUtils';

interface ChatContactListProps {
  contacts: ChatContact[];
  archivedContacts?: ChatContact[];
  activeConversationId: string | null;
  onContactSelect: (contact: ChatContact) => void;
  loading?: boolean;
  className?: string;
}

const ChatContactList: React.FC<ChatContactListProps> = ({
  contacts,
  archivedContacts = [],
  onContactSelect,
  loading = false,
  className,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');

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

  const currentContacts = activeTab === 'active' ? contacts : archivedContacts;
  const filteredContacts = currentContacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const renderContactItem = (contact: ChatContact) => {
    const isActive = contact.conversationId === activeConversationId;
    const hasActiveBooking = contact.context === ConversationContext.ACTIVE_BOOKING;
    const canMessage = canUserMessage(contact);
    const isDisabled = !canMessage;

    return (
      <div
        key={contact.id}
        onClick={() => {
          if (!isDisabled) {
            onContactSelect(contact);
          }
        }}
        className={cn(
          'flex items-center p-3 transition-colors w-full max-w-full overflow-hidden min-w-0 last:border-b-0 border-b',
          isActive && 'bg-green-50 border-green-200',
          hasActiveBooking && 'border-l-4 border-l-green-500',
          isDisabled
            ? 'opacity-60 cursor-not-allowed bg-gray-50'
            : 'cursor-pointer hover:bg-gray-50',
        )}
      >
        <div className="relative">
          <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-lg flex-shrink-0">
            {getInitials(contact.name)}
          </div>
          <div className="absolute -bottom-1 -right-1">
            <VerificationBadge status={contact.verificationStatus || 'unverified'} size="sm" />
          </div>
        </div>

        <div className="ml-3 flex-1 min-w-0 overflow-hidden">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 truncate flex-1 min-w-0 break-all">
                {contact.name}
              </h3>
              {contact.context && (
                <Badge
                  variant="outline"
                  className={cn('text-xs flex-shrink-0', getContextBadgeColor(contact.context))}
                >
                  {getContextLabel(contact.context)}
                </Badge>
              )}
              {contact.context === ConversationContext.POST_CARE &&
                contact.postCareDaysRemaining !== undefined && (
                  <Badge
                    variant="outline"
                    className="text-xs flex-shrink-0 bg-yellow-50 text-yellow-700 border-yellow-200"
                  >
                    {contact.postCareDaysRemaining}d left
                  </Badge>
                )}
              {/* No valid context - messaging not available (shouldn't appear as backend filters) */}
              {!contact.context ||
              (contact.context !== ConversationContext.ACTIVE_BOOKING &&
                contact.context !== ConversationContext.POST_CARE &&
                contact.context !== ConversationContext.ONGOING) ? (
                <Badge
                  variant="outline"
                  className="text-xs flex-shrink-0 bg-orange-50 text-orange-700 border-orange-200"
                >
                  Booking required
                </Badge>
              ) : null}
            </div>
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

          {isDisabled ? (
            <div className="w-full overflow-hidden mt-1">
              <p className="text-xs text-orange-600 font-medium">Book appointment to message</p>
            </div>
          ) : contact.lastMessage ? (
            <div className="w-full overflow-hidden">
              <p
                className="text-sm text-gray-600 truncate mt-1 block w-full break-all max-w-full"
                style={{ wordBreak: 'break-word' }}
              >
                {contact.lastMessage.isFromMe && <span className="text-gray-400">You: </span>}
                {contact.lastMessage.content}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    );
  };

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
      {/* Tabs */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as 'active' | 'archived')}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="archived" className="flex items-center gap-2">
              <Archive className="h-4 w-4" />
              Archived
              {archivedContacts.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {archivedContacts.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

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
            {activeTab === 'archived' ? (
              <Archive className="h-12 w-12 mb-4" />
            ) : (
              <User className="h-12 w-12 mb-4" />
            )}
            <p className="text-center">
              {searchTerm
                ? 'No contacts found'
                : activeTab === 'archived'
                  ? 'No archived conversations'
                  : 'No conversations yet'}
            </p>
            <p className="text-sm text-center text-gray-400 mt-1">
              {searchTerm
                ? 'Try searching with a different term'
                : activeTab === 'archived'
                  ? 'Archived conversations will appear here'
                  : 'Start a conversation with someone you have an appointment with'}
            </p>
          </div>
        ) : (
          <div className="p-2 w-full overflow-hidden">
            {filteredContacts.map((contact) => renderContactItem(contact))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default ChatContactList;
