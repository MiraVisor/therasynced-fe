'use client';

import { format } from 'date-fns';
import {
  Check,
  CheckCheck,
  ChevronLeft,
  Phone,
  Search,
  Send,
  Trash2,
  User,
  Video,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';

import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useChatSocket } from '@/hooks/useChatSocket';
import {
  fetchChatContacts,
  fetchMessages,
  markMessagesAsRead,
  sendMessage,
  setSelectedContact,
} from '@/redux/slices/chatSlice';
import { RootState } from '@/redux/store';

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

const MessagesPage = () => {
  const dispatch = useDispatch();
  const { contacts, messages, selectedContact, isLoadingContacts, isLoadingMessages, error } =
    useSelector((state: RootState) => state.chat);
  const { joinConversation, leaveConversation } = useChatSocket();

  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [showChat, setShowChat] = useState(false);
  const [lastFetchedConversationId, setLastFetchedConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Function to scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Contacts are now loaded globally in the dashboard layout

  // Load messages when a contact is selected
  useEffect(() => {
    if (
      selectedContact?.conversationId &&
      selectedContact.conversationId !== lastFetchedConversationId
    ) {
      dispatch(
        fetchMessages({
          conversationId: selectedContact.conversationId,
          page: 1,
          limit: 50,
        }) as any,
      );

      setLastFetchedConversationId(selectedContact.conversationId);

      // Mark messages as read when opening conversation
      dispatch(markMessagesAsRead({ conversationId: selectedContact.conversationId }));

      // Join the conversation for real-time updates
      joinConversation(selectedContact.conversationId);
    }

    // Cleanup: leave conversation when component unmounts or contact changes
    return () => {
      if (selectedContact?.conversationId) {
        leaveConversation(selectedContact.conversationId);
      }
    };
  }, [
    selectedContact?.conversationId,
    dispatch,
    joinConversation,
    leaveConversation,
    lastFetchedConversationId,
  ]);

  // Scroll to bottom when messages are loaded or updated
  useEffect(() => {
    if (!isLoadingMessages && selectedContact?.conversationId) {
      // Small delay to ensure DOM is updated
      setTimeout(scrollToBottom, 100);
    }
  }, [messages, isLoadingMessages, selectedContact?.conversationId]);

  // Transform backend contacts to match original UI format
  const transformedContacts: Contact[] = contacts.map((contact) => ({
    id: contact.id,
    name: contact.name,
    avatar: contact.profilePicture || '',
    lastMessage: contact.lastMessage?.content || 'No messages yet',
    lastMessageTime:
      contact.lastMessage?.createdAt ||
      contact.lastAppointment?.createdAt ||
      new Date().toISOString(),
    unreadCount: contact.unreadCount,
    status: 'active' as const,
  }));

  // Transform backend messages to match original UI format
  const getCurrentMessages = (): MessageType[] => {
    if (!selectedContact) return [];
    const backendMessages = messages[selectedContact.conversationId] || [];
    return backendMessages.map((message) => ({
      id: message.id,
      content: message.content,
      timestamp: message.createdAt,
      isFromMe: message.sender.id !== selectedContact.id,
      isRead: message.isRead,
      type: 'text' as const,
    }));
  };

  const filteredContacts = transformedContacts.filter((contact) => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleContactSelect = (contact: Contact) => {
    // Find the backend contact
    const backendContact = contacts.find((c) => c.id === contact.id);
    if (backendContact) {
      dispatch(setSelectedContact(backendContact));
      if (isMobile) {
        setShowChat(true);
      }
      // Mark messages as read
      if (contact.unreadCount > 0) {
        dispatch(markMessagesAsRead({ conversationId: backendContact.conversationId }));
      }
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedContact) return;

    try {
      await dispatch(
        sendMessage({
          recipientId: selectedContact.id,
          content: newMessage.trim(),
        }) as any,
      ).unwrap();

      setNewMessage('');
      // Scroll to bottom after sending message
      setTimeout(scrollToBottom, 100);
    } catch (error: any) {
      toast.error(error.message || 'Failed to send message');
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

  if (error) {
    return (
      <DashboardPageWrapper
        header={<h2 className="text-xl lg:text-2xl font-semibold">Messages</h2>}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => dispatch(fetchChatContacts() as any)}>Try Again</Button>
          </div>
        </div>
      </DashboardPageWrapper>
    );
  }

  return (
    <DashboardPageWrapper header={<h2 className="text-xl lg:text-2xl font-semibold">Messages</h2>}>
      <div className="h-[calc(100vh-200px)] flex flex-col">
        <div className="flex flex-1 min-h-0">
          {/* Contacts Sidebar */}
          <div
            className={`${showChat ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 border-r bg-white`}
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
              {isLoadingContacts ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
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
                          <AvatarFallback>
                            {contact.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()}
                          </AvatarFallback>
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
          <div className={`${!showChat ? 'hidden md:flex' : 'flex'} flex-col flex-1 bg-white`}>
            {selectedContact ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b bg-white flex items-center justify-between">
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
                        <AvatarFallback>
                          {selectedContact.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div>
                      <h3 className="font-medium">{selectedContact.name}</h3>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Video className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {isLoadingMessages ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
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
                <div className="p-4 border-t bg-white">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1"
                    />
                    <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                      <Send className="h-4 w-4" />
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

export default MessagesPage;
