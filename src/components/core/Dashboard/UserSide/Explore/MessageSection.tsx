import { Paperclip, Send } from 'lucide-react';
import React, { useState } from 'react';
import { text } from 'stream/consumers';

import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Expert } from '@/types/types';

interface Message {
  id: string;
  text: string;
  isFromUser: boolean;
  timestamp: string;
}

interface Contact {
  id: string;
  name: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  avatar: string;
  isVerified?: boolean;
}

interface MessageSectionProps {
  onSendMessage?: (message: string) => void;
  expert: Expert;
}

const MessageSection: React.FC<MessageSectionProps> = ({ onSendMessage, expert }) => {
  // expert prop is received but not used in the current implementation
  // can be used in the future to customize messages or display expert info
  const [newMessage, setNewMessage] = useState('');
  const [selectedContact, setSelectedContact] = useState<string>('1');

  // Dummy contacts list to match the UI
  const contacts: Contact[] = [
    {
      id: '1',
      name: 'Dr Lee Marshell',
      title: 'Certified Physiotherapist',
      lastMessage: 'Hello! How are you doing?........',
      timestamp: '16:20',
      avatar: '/api/placeholder/40/40',
      isVerified: true,
    },
    {
      id: '2',
      name: 'Dr Lee Marshell',
      title: 'Certified Physiotherapist',
      lastMessage: 'Hello! How are you doing?........',
      timestamp: '16:20',
      avatar: '/api/placeholder/40/40',
      isVerified: true,
    },
    {
      id: '3',
      name: 'Dr Lee Marshell',
      title: 'Certified Physiotherapist',
      lastMessage: 'Hello! How are you doing?........',
      timestamp: '16:20',
      avatar: '/api/placeholder/40/40',
      isVerified: true,
    },
    {
      id: '4',
      name: 'Dr Lee Marshell',
      title: 'Certified Physiotherapist',
      lastMessage: 'Hello! How are you doing?........',
      timestamp: '16:20',
      avatar: '/api/placeholder/40/40',
      isVerified: true,
    },
  ];

  // Mock chat messages for selected contact
  const chatMessages: { [key: string]: Message[] } = {
    '1': [
      {
        id: '1',
        text: 'Hello! How are You? 😊',
        isFromUser: true,
        timestamp: '',
      },
      {
        id: '2',
        text: 'Hello! I am good...how are you?? Hows everythings going? 😊',
        isFromUser: false,
        timestamp: '',
      },
      {
        id: '3',
        text: 'Hello! I am good...how are you?? Hows everythings going? 😊',
        isFromUser: true,
        timestamp: '',
      },
    ],
    '2': [
      {
        id: '1',
        text: 'Hello! How are You? 😊',
        isFromUser: true,
        timestamp: '',
      },
      {
        id: '2',
        text: 'Hello! I am good...how are you?? Hows everythings going? 😊',
        isFromUser: false,
        timestamp: '',
      },
      {
        id: '3',
        text: 'Hello! I am good...how are you?? Hows everythings going? 😊',
        isFromUser: true,
        timestamp: '',
      },
    ],
    '3': [
      {
        id: '1',
        text: 'Hello! How are You? 😊',
        isFromUser: true,
        timestamp: '',
      },
      {
        id: '2',
        text: 'Hello! I am good...how are you?? Hows everythings going? 😊',
        isFromUser: false,
        timestamp: '',
      },
    ],
    '4': [
      {
        id: '1',
        text: 'Hello! I am good...how are you?? Hows everythings going? 😊',
        isFromUser: false,
        timestamp: '',
      },
      {
        id: '2',
        text: 'Hello! I am good...how are you?? Hows everythings going? 😊',
        isFromUser: true,
        timestamp: '',
      },
    ],
  };

  const currentMessages = chatMessages[selectedContact] || [];

  const handleSend = () => {
    if (newMessage.trim() && onSendMessage) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 h-full flex">
      {/* Left Panel - Messages List */}
      <div className="w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="flex-1 overflow-y-auto">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => setSelectedContact(contact.id)}
              className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                selectedContact === contact.id ? 'bg-green-50 dark:bg-green-900/20' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="relative">
                  <Avatar className="w-12 h-12">
                    <div className="w-full h-full bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        {contact.name.charAt(0)}
                      </span>
                    </div>
                  </Avatar>
                  {contact.isVerified && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg
                        className="w-2.5 h-2.5 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                      {contact.name}
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {contact.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{contact.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                    {contact.lastMessage}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel - Chat Messages */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <div className="w-full h-full bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {contacts.find((c) => c.id === selectedContact)?.name.charAt(0)}
                </span>
              </div>
            </Avatar>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100">
                {contacts.find((c) => c.id === selectedContact)?.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {contacts.find((c) => c.id === selectedContact)?.title}
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {currentMessages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isFromUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className="flex items-start gap-3 max-w-[70%]">
                {!message.isFromUser && (
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <div className="w-full h-full bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                        D
                      </span>
                    </div>
                  </Avatar>
                )}

                <div
                  className={`rounded-2xl px-4 py-2 ${
                    message.isFromUser
                      ? 'bg-green-500 text-white'
                      : 'bg-green-100 dark:bg-green-900/30 text-gray-800 dark:text-gray-200'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                </div>

                {message.isFromUser && (
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <div className="w-full h-full bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                        Y
                      </span>
                    </div>
                  </Avatar>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message...."
                className="w-full rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full"
              >
                <Paperclip className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </Button>
            </div>
            <Button
              onClick={handleSend}
              className="bg-green-600 hover:bg-green-700 text-white rounded-full w-12 h-12 p-0"
              disabled={!newMessage.trim()}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageSection;
