'use client';

import { format } from 'date-fns';
import { Check, CheckCheck, ChevronLeft, Search, Send, User } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ChatContactsSkeleton,
  ChatMessagesSkeleton,
} from '@/components/ui/skeletons/ChatSkeletons';
import { useMySubscription } from '@/hooks/queries/useSubscription';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useAuth } from '@/hooks/useAuthZustand';
import useChat from '@/hooks/useChat';
import { cn, getDecodedToken } from '@/lib/utils';
import {
  formatLimit,
  getBillingCycleEndDate,
  getDaysUntilBillingCycleReset,
} from '@/utils/subscriptionHelpers';

// Types
interface Contact {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  status: 'active' | 'archived';
}

interface MessageType {
  id: string;
  content: string;
  timestamp: string;
  isFromMe: boolean;
  isRead: boolean;
  type: 'text' | 'image' | 'file';
}

const MessagesPageContent = () => {
  // Get current user ID for proper unread logic
  const currentUser = getDecodedToken();
  const currentUserId = currentUser?.sub;
  const { role } = useAuth();
  const searchParams = useSearchParams();
  const targetUserId = searchParams.get('userId') || searchParams.get('freelancerId');

  const {
    contacts,
    activeConversationId,
    activeConversation,
    isConnected,
    loading,
    error,
    selectConversation,
    sendMessage,
    getContactByConversationId,
    markConversationAsRead,
  } = useChat(currentUserId);
  const { data: subscription } = useMySubscription();

  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [showChat, setShowChat] = useState(false);

  const messagesUsed = subscription?.messagesUsed ?? 0;
  const messagesLimit = subscription?.maxMessagesPerBillingCycle ?? null;
  const isAtLimit = messagesLimit !== null && messagesUsed >= messagesLimit;
  const billingCycleEnd = getBillingCycleEndDate(subscription ?? null);
  const daysUntilReset = getDaysUntilBillingCycleReset(subscription ?? null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasHandledUserIdRef = useRef(false);
  const previousTargetUserIdRef = useRef<string | null>(null);

  const selectedContact = activeConversationId
    ? getContactByConversationId(activeConversationId)
    : null;

  // Function to scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Scroll to bottom when messages are loaded or updated
  useEffect(() => {
    if (!loading.messages && selectedContact?.conversationId) {
      // Small delay to ensure DOM is updated
      setTimeout(scrollToBottom, 100);
    }
  }, [activeConversation, loading.messages, selectedContact?.conversationId]);

  // Reset handler when targetUserId changes (e.g., navigating from different bookings)
  useEffect(() => {
    if (targetUserId !== previousTargetUserIdRef.current) {
      hasHandledUserIdRef.current = false;
      previousTargetUserIdRef.current = targetUserId;
    }
  }, [targetUserId]);

  // Handle userId/freelancerId query parameter - find or create conversation
  useEffect(() => {
    if (targetUserId && !hasHandledUserIdRef.current && !loading.contacts) {
      // Wait for contacts to load
      if ((!contacts || contacts.length === 0) && loading.contacts) {
        return;
      }

      hasHandledUserIdRef.current = true;

      // Find contact by userId
      const contact = contacts?.find((c) => c.id === targetUserId);

      if (contact) {
        // Contact exists, select the conversation
        selectConversation(contact.conversationId);
        if (isMobile) {
          setShowChat(true);
        }
        // Mark as read if there are unread messages
        if (contact.unreadCount > 0) {
          setTimeout(() => {
            markConversationAsRead(contact.conversationId);
          }, 500);
        }
      } else {
        // Contact doesn't exist, send a message to create conversation
        // The sendMessage will create the conversation automatically
        const createConversation = async () => {
          try {
            await sendMessage(targetUserId, 'Hello!');
            // The contact will appear via socket updates, handled in the next useEffect
          } catch (error: unknown) {
            const errorMessage =
              error instanceof Error ? error.message : 'Failed to start conversation';
            console.error('Failed to start conversation:', error);
            toast.error(errorMessage);
            hasHandledUserIdRef.current = false; // Allow retry
          }
        };

        createConversation();
      }
    }
  }, [
    targetUserId,
    contacts,
    loading.contacts,
    selectConversation,
    sendMessage,
    isMobile,
    markConversationAsRead,
  ]);

  // Handle new contact appearing after sending message (when conversation is created)
  useEffect(() => {
    if (targetUserId && hasHandledUserIdRef.current) {
      const contact = contacts?.find((c) => c.id === targetUserId);
      if (contact) {
        // Contact appeared (either existed or was just created), select it if not already selected
        if (activeConversationId !== contact.conversationId) {
          selectConversation(contact.conversationId);
          if (isMobile) {
            setShowChat(true);
          }
        }
      }
    }
  }, [contacts, targetUserId, activeConversationId, selectConversation, isMobile]);

  // Mark messages as read when viewing a conversation with unread messages
  useEffect(() => {
    if (
      selectedContact &&
      selectedContact.unreadCount > 0 &&
      activeConversation &&
      activeConversation.length > 0
    ) {
      // Mark messages as read after a short delay to ensure user is actually viewing the messages
      console.log(
        'Auto-marking conversation as read after delay:',
        selectedContact.conversationId,
        'unread count:',
        selectedContact.unreadCount,
      );
      const timer = setTimeout(() => {
        markConversationAsRead(selectedContact.conversationId);
      }, 1000); // 1 second delay

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [selectedContact, activeConversation, markConversationAsRead]);

  // Transform backend contacts to match original UI format
  const transformedContacts: Contact[] = (contacts || []).map((contact) => ({
    id: contact.id,
    name: contact.name,
    avatar: contact.profilePicture || '',
    lastMessage: contact.lastMessage?.content || 'No messages yet',
    lastMessageTime: contact.lastMessage?.createdAt || new Date().toISOString(),
    unreadCount: contact.unreadCount,
    status: 'active' as const,
  }));

  // Transform backend messages to match original UI format
  const getCurrentMessages = (): MessageType[] => {
    if (!selectedContact) return [];
    const backendMessages = activeConversation || [];
    return backendMessages
      .filter((message) => message && message.users && message.id) // Filter out invalid messages
      .map((message) => ({
        id: message.id,
        content: message.content || '',
        timestamp: message.createdAt || new Date().toISOString(),
        isFromMe: message.users?.id !== selectedContact.id,
        isRead: message.isRead ?? false,
        type: 'text' as const,
      }));
  };

  const filteredContacts = transformedContacts.filter((contact) => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleContactSelect = (contact: Contact) => {
    // Find the backend contact
    const backendContact = contacts?.find((c) => c.id === contact.id);
    if (backendContact) {
      // If clicking the same contact that's already selected, toggle chat
      if (selectedContact?.id === contact.id) {
        if (isMobile) {
          setShowChat(!showChat);
        } else {
          // On desktop, deselect the conversation to close chat
          selectConversation('');
        }
      } else {
        // Different contact selected - open conversation
        selectConversation(backendContact.conversationId);
        // Mark messages as read when opening conversation
        if (backendContact.unreadCount > 0) {
          console.log(
            'Marking conversation as read:',
            backendContact.conversationId,
            'unread count:',
            backendContact.unreadCount,
          );
          markConversationAsRead(backendContact.conversationId);
        }
        if (isMobile) {
          setShowChat(true);
        }
      }
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedContact) return;

    try {
      await sendMessage(selectedContact.id, newMessage.trim());
      setNewMessage('');
      // Scroll to bottom after sending message
      setTimeout(scrollToBottom, 100);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      console.error('Failed to send message:', error);
      toast.error(errorMessage);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleBackToContacts = () => {
    setShowChat(false);
    // Keep the conversation selected on mobile back - user might want to return to it
    // Only deselect if they want to truly close the conversation
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return format(date, 'HH:mm');
    } else if (diffInHours < 168) {
      // 7 days
      return format(date, 'EEE');
    } else {
      return format(date, 'MMM dd');
    }
  };

  const formatLastMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return format(date, 'HH:mm');
    } else if (diffInHours < 168) {
      // 7 days
      return format(date, 'EEE');
    } else {
      return format(date, 'MMM dd');
    }
  };

  // Show toast error for any errors but continue showing the interface
  // Note: error is currently null in useChat, but keeping this for future error handling
  useEffect(() => {
    if (error && typeof error === 'object' && error !== null) {
      const errorObj = error as Record<string, unknown>;
      if (errorObj['contacts']) {
        toast.error('Failed to load conversations. Please try again.');
      }
      if (errorObj['messages']) {
        toast.error('Failed to load messages. Please try again.');
      }
      if (errorObj['sending']) {
        toast.error('Failed to send message. Please try again.');
      }
    }
  }, [error]);

  return (
    <DashboardPageWrapper
      userRole={role}
      header={
        <div className="flex items-center justify-between w-full">
          <h2 className="text-xl lg:text-2xl font-semibold">Messages</h2>
          {messagesLimit !== null && role === 'FREELANCER' && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600 dark:text-gray-400">Messages:</span>
              <span
                className={cn(
                  'font-semibold',
                  isAtLimit ? 'text-red-600' : 'text-gray-900 dark:text-white',
                )}
              >
                {messagesUsed}/{formatLimit(messagesLimit)}
              </span>
              {billingCycleEnd && daysUntilReset !== null && (
                <span className="text-xs text-gray-500">
                  (Resets in {daysUntilReset} {daysUntilReset === 1 ? 'day' : 'days'})
                </span>
              )}
            </div>
          )}
        </div>
      }
    >
      <div className="h-[calc(100vh-200px)] flex flex-col">
        <div className="flex flex-1 min-h-0">
          {/* Contacts Sidebar */}
          <div
            className={`${showChat ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 border-r `}
          >
            {/* Search */}
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Contacts List */}
            <div className="flex-1 overflow-y-auto">
              {loading.contacts ? (
                <ChatContactsSkeleton />
              ) : filteredContacts.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-gray-500">
                  <div className="text-center">
                    <User className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No conversations found</p>
                    <p className="text-sm">Start a conversation by booking an appointment</p>
                  </div>
                </div>
              ) : (
                filteredContacts.map((contact) => (
                  <div
                    key={contact.id}
                    onClick={() => handleContactSelect(contact)}
                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedContact?.id === contact.id ? 'bg-primary/5 border-primary/20' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={contact.avatar} alt={contact.name} />
                          <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900 truncate">{contact.name}</h3>
                          <span className="text-xs text-gray-500">
                            {formatLastMessageTime(contact.lastMessageTime)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-sm text-gray-600 truncate">{contact.lastMessage}</p>
                          {contact.unreadCount > 0 && (
                            <Badge variant="destructive" className="ml-2">
                              {contact.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className={`${!showChat ? 'hidden md:flex' : 'flex'} flex-col flex-1 `}>
            {selectedContact ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b  flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {isMobile && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleBackToContacts}
                        className="md:hidden"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                    )}
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={selectedContact.profilePicture}
                          alt={selectedContact.name}
                        />
                        <AvatarFallback>{selectedContact.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </div>
                    <div>
                      <h3 className="font-medium">{selectedContact.name}</h3>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {loading.messages ? (
                    <ChatMessagesSkeleton />
                  ) : (
                    getCurrentMessages().map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.isFromMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.isFromMe ? 'bg-primary text-white' : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <div className="flex items-center justify-end mt-1 space-x-1">
                            <span className="text-xs opacity-70">
                              {formatMessageTime(message.timestamp)}
                            </span>
                            {message.isFromMe && (
                              <div className="flex items-center">
                                {message.isRead ? (
                                  <CheckCheck className="h-3 w-3" />
                                ) : (
                                  <Check className="h-3 w-3" />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  {/* Invisible element to scroll to */}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t ">
                  <div className="flex space-x-2">
                    <Input
                      placeholder={isConnected ? 'Type a message...' : 'Connecting...'}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1"
                      disabled={!isConnected || loading.sending}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || !isConnected || loading.sending}
                    >
                      {loading.sending ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <User className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">No conversation selected</h3>
                  <p>Choose a conversation from the sidebar to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardPageWrapper>
  );
};

function MessagesPageSkeleton() {
  return (
    <DashboardPageWrapper header={<h2 className="text-xl lg:text-2xl font-semibold">Messages</h2>}>
      <div className="h-[calc(100vh-200px)] flex flex-col">
        <div className="flex flex-1 min-h-0">
          <div className="flex flex-col w-full md:w-80 border-r">
            <div className="p-4 border-b">
              <div className="h-10 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="h-16 w-16 bg-gray-200 rounded-full mx-auto mb-4 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-32 mx-auto animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </DashboardPageWrapper>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<MessagesPageSkeleton />}>
      <MessagesPageContent />
    </Suspense>
  );
}
