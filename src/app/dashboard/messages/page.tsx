'use client';

import { format } from 'date-fns';
import {
  Archive,
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
import { useState } from 'react';

import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useMediaQuery } from '@/hooks/use-media-query';

// Types
interface Contact {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
  status: 'active' | 'archived';
}

interface Message {
  id: string;
  content: string;
  timestamp: string;
  isFromMe: boolean;
  isRead: boolean;
  type: 'text' | 'image' | 'file';
}

// Mock data
const mockContacts: Contact[] = [
  {
    id: '1',
    name: 'John Smith',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    lastMessage: 'Thank you for the session today. When can we schedule the next one?',
    lastMessageTime: '2:30 PM',
    unreadCount: 2,
    isOnline: true,
    status: 'active',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    lastMessage: 'I have some questions about the treatment plan',
    lastMessageTime: '1:45 PM',
    unreadCount: 0,
    isOnline: false,
    status: 'active',
  },
  {
    id: '3',
    name: 'Mike Wilson',
    avatar: 'https://randomuser.me/api/portraits/men/55.jpg',
    lastMessage: "Can we reschedule tomorrow's appointment?",
    lastMessageTime: '11:20 AM',
    unreadCount: 1,
    isOnline: true,
    status: 'active',
  },
  {
    id: '4',
    name: 'Emily Davis',
    avatar: 'https://randomuser.me/api/portraits/women/28.jpg',
    lastMessage: 'The exercises you recommended are really helping!',
    lastMessageTime: 'Yesterday',
    unreadCount: 0,
    isOnline: false,
    status: 'archived',
  },
];

const mockConversations: { [key: string]: Message[] } = {
  '1': [
    {
      id: '1',
      content: 'Hello Dr. Sarah, I wanted to thank you for the session today.',
      timestamp: '2:15 PM',
      isFromMe: false,
      isRead: true,
      type: 'text',
    },
    {
      id: '2',
      content: "You're very welcome, John! How are you feeling after the session?",
      timestamp: '2:18 PM',
      isFromMe: true,
      isRead: true,
      type: 'text',
    },
    {
      id: '3',
      content: 'Much better, thank you! When can we schedule the next one?',
      timestamp: '2:30 PM',
      isFromMe: false,
      isRead: false,
      type: 'text',
    },
  ],
  '2': [
    {
      id: '1',
      content: 'Hi Dr. Sarah, I have some questions about the treatment plan you gave me.',
      timestamp: '1:45 PM',
      isFromMe: false,
      isRead: true,
      type: 'text',
    },
  ],
  '3': [
    {
      id: '1',
      content: "Hi Dr. Sarah, I need to reschedule tomorrow's appointment. Is that possible?",
      timestamp: '11:20 AM',
      isFromMe: false,
      isRead: false,
      type: 'text',
    },
  ],
  '4': [
    {
      id: '1',
      content:
        'The exercises you recommended are really helping! I can feel the improvement already.',
      timestamp: 'Yesterday',
      isFromMe: false,
      isRead: true,
      type: 'text',
    },
  ],
};

const MessagesPage = () => {
  const [contacts, setContacts] = useState<Contact[]>(mockContacts);
  const [conversations, setConversations] = useState(mockConversations);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [showChat, setShowChat] = useState(false);

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = showArchived
      ? contact.status === 'archived'
      : contact.status === 'active';
    return matchesSearch && matchesStatus;
  });

  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact);
    if (isMobile) {
      setShowChat(true);
    }
    // Mark messages as read
    if (contact.unreadCount > 0) {
      setContacts((prev) => prev.map((c) => (c.id === contact.id ? { ...c, unreadCount: 0 } : c)));
      setConversations((prev) => ({
        ...prev,
        [contact.id]: prev[contact.id]?.map((msg) => ({ ...msg, isRead: true })) || [],
      }));
    }
  };

  const handleSendMessage = () => {
    if (!selectedContact || !newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      timestamp: format(new Date(), 'h:mm a'),
      isFromMe: true,
      isRead: false,
      type: 'text',
    };

    setConversations((prev) => ({
      ...prev,
      [selectedContact.id]: [...(prev[selectedContact.id] || []), message],
    }));

    // Update last message in contacts
    setContacts((prev) =>
      prev.map((contact) =>
        contact.id === selectedContact.id
          ? {
              ...contact,
              lastMessage: newMessage,
              lastMessageTime: format(new Date(), 'h:mm a'),
              unreadCount: 0,
            }
          : contact,
      ),
    );

    setNewMessage('');

    // Simulate response after 2 seconds
    setTimeout(() => {
      const response: Message = {
        id: (Date.now() + 1).toString(),
        content: "Thanks for your message! I'll get back to you soon.",
        timestamp: format(new Date(), 'h:mm a'),
        isFromMe: false,
        isRead: false,
        type: 'text',
      };

      setConversations((prev) => ({
        ...prev,
        [selectedContact.id]: [...(prev[selectedContact.id] || []), response],
      }));

      setContacts((prev) =>
        prev.map((contact) =>
          contact.id === selectedContact.id
            ? {
                ...contact,
                lastMessage: response.content,
                lastMessageTime: response.timestamp,
                unreadCount: 1,
              }
            : contact,
        ),
      );
    }, 2000);
  };

  const handleArchiveContact = (contactId: string) => {
    setContacts((prev) =>
      prev.map((contact) =>
        contact.id === contactId
          ? { ...contact, status: contact.status === 'archived' ? 'active' : 'archived' }
          : contact,
      ),
    );
  };

  const handleDeleteContact = (contactId: string) => {
    setContacts((prev) => prev.filter((contact) => contact.id !== contactId));
    if (selectedContact?.id === contactId) {
      setSelectedContact(null);
      setShowChat(false);
    }
  };

  const totalUnread = contacts.reduce((sum, contact) => sum + contact.unreadCount, 0);

  //   if (isLoading) {
  //     return (
  //       <div className="flex items-center justify-center h-full">
  //         <LoadingSpinner size="lg" />
  //       </div>
  //     );
  //   }

  return (
    <DashboardPageWrapper
      header={
        <div className="flex flex-col gap-2 w-full">
          <h2 className="text-2xl font-bold">Messages</h2>
          <p className="text-gray-600">Communicate with your clients</p>
          {totalUnread > 0 && (
            <Badge className="w-fit">
              {totalUnread} unread message{totalUnread !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      }
    >
      <div className="h-[calc(100vh-12rem)]">
        <div className="grid grid-cols-1 md:grid-cols-3 h-full gap-4">
          {/* Contacts List */}
          <div className={`${isMobile && showChat ? 'hidden' : 'block'} md:block`}>
            <Card className="h-full">
              <CardContent className="p-4 h-full flex flex-col">
                {/* Search and Filters */}
                <div className="space-y-3 mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search conversations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={!showArchived ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setShowArchived(false)}
                    >
                      Active
                    </Button>
                    <Button
                      variant={showArchived ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setShowArchived(true)}
                    >
                      Archived
                    </Button>
                  </div>
                </div>

                {/* Contacts */}
                <div className="flex-1 overflow-y-auto space-y-2">
                  {filteredContacts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      {showArchived ? 'No archived conversations' : 'No conversations found'}
                    </div>
                  ) : (
                    filteredContacts.map((contact) => (
                      <div
                        key={contact.id}
                        onClick={() => handleContactSelect(contact)}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedContact?.id === contact.id
                            ? 'bg-blue-50 border border-blue-200'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={contact.avatar} />
                              <AvatarFallback>
                                {contact.name
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')}
                              </AvatarFallback>
                            </Avatar>
                            {contact.isOnline && (
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium text-gray-900 truncate">{contact.name}</h3>
                              <span className="text-xs text-gray-500">
                                {contact.lastMessageTime}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 truncate">{contact.lastMessage}</p>
                          </div>
                          {contact.unreadCount > 0 && (
                            <Badge className="ml-2">{contact.unreadCount}</Badge>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Window */}
          <div className={`${isMobile && !showChat ? 'hidden' : 'block'} md:col-span-2`}>
            <Card className="h-full">
              <CardContent className="p-0 h-full flex flex-col">
                {selectedContact ? (
                  <>
                    {/* Chat Header */}
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isMobile && (
                          <Button variant="ghost" size="sm" onClick={() => setShowChat(false)}>
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                        )}
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={selectedContact.avatar} />
                          <AvatarFallback>
                            {selectedContact.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium text-gray-900">{selectedContact.name}</h3>
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${selectedContact.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}
                            ></div>
                            <span className="text-sm text-gray-500">
                              {selectedContact.isOnline ? 'Online' : 'Offline'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Video className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleArchiveContact(selectedContact.id)}
                        >
                          <Archive className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteContact(selectedContact.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {conversations[selectedContact.id]?.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.isFromMe ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.isFromMe
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <div
                              className={`flex items-center justify-end gap-1 mt-1 ${
                                message.isFromMe ? 'text-blue-100' : 'text-gray-500'
                              }`}
                            >
                              <span className="text-xs">{message.timestamp}</span>
                              {message.isFromMe &&
                                (message.isRead ? (
                                  <CheckCheck className="h-3 w-3" />
                                ) : (
                                  <Check className="h-3 w-3" />
                                ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Message Input */}
                    <div className="p-4 border-t border-gray-200">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Type a message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          className="flex-1"
                        />
                        <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Select a conversation
                      </h3>
                      <p className="text-gray-500">Choose a contact to start messaging</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardPageWrapper>
  );
};

export default MessagesPage;
