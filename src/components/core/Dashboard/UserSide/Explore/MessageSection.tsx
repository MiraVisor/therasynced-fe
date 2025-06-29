import Image from 'next/image';
import React, { useEffect, useState } from 'react';

import { useIsMobile } from '@/hooks/use-mobile';
import '@/styles/stream-chat-custom.css';
import { Expert } from '@/types/types';

interface MessageSectionProps {
  onSendMessage?: (message: string) => void;
  expert: Expert;
}

interface DummyExpert {
  id: string;
  name: string;
  title: string;
  image: string;
  lastMessage: string;
  time: string;
  isOnline: boolean;
  messages: Array<{
    id: string;
    text: string;
    sender: 'user' | 'expert';
    time: string;
  }>;
}

const MessageSection: React.FC<MessageSectionProps> = () => {
  const [selectedExpert, setSelectedExpert] = useState<DummyExpert | null>(null);
  const [showChannelList, setShowChannelList] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const isMobile = useIsMobile();

  // Create diverse dummy experts with different specialties
  const dummyExperts: DummyExpert[] = [
    {
      id: 'dr-lee-marshell',
      name: 'Dr Lee Marshell',
      title: 'Certified Physiotherapist',
      image:
        'https://images.unsplash.com/photo-1607746882042-944635dfe10e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
      lastMessage: 'Hello! How are you doing?',
      time: '16:20',
      isOnline: true,
      messages: [
        { id: '1', text: 'Hello! How are You? 😊', sender: 'expert', time: '16:20' },
        {
          id: '2',
          text: 'Hello! i am good...how are you?? Hows everything going? 😊',
          sender: 'user',
          time: '16:21',
        },
        {
          id: '3',
          text: "I'm doing great! How has your recovery been progressing?",
          sender: 'expert',
          time: '16:22',
        },
        {
          id: '4',
          text: 'Much better! The exercises you recommended are really helping.',
          sender: 'user',
          time: '16:23',
        },
      ],
    },
    {
      id: 'dr-sarah-wilson',
      name: 'Dr Sarah Wilson',
      title: 'Clinical Psychologist',
      image:
        'https://images.unsplash.com/photo-1603398938378-24b5719c9b1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
      lastMessage: 'Great progress in our last session! Keep up the mindfulness exercises.',
      time: '15:45',
      isOnline: true,
      messages: [
        {
          id: '1',
          text: 'Good morning! How did the breathing exercises go this week?',
          sender: 'expert',
          time: '15:40',
        },
        {
          id: '2',
          text: "They've been really helpful for managing stress at work.",
          sender: 'user',
          time: '15:42',
        },
        {
          id: '3',
          text: 'Great progress in our last session! Keep up the mindfulness exercises.',
          sender: 'expert',
          time: '15:45',
        },
      ],
    },
    {
      id: 'dr-james-parker',
      name: 'Dr James Parker',
      title: 'Orthopedic Specialist',
      image:
        'https://images.unsplash.com/photo-1622556492150-1b9f5c01306b?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
      lastMessage: "Your X-ray results look good. Let's schedule a follow-up.",
      time: '14:30',
      isOnline: false,
      messages: [
        { id: '1', text: "Hi! I've reviewed your latest scans.", sender: 'expert', time: '14:25' },
        { id: '2', text: "That's great news! What do they show?", sender: 'user', time: '14:28' },
        {
          id: '3',
          text: "Your X-ray results look good. Let's schedule a follow-up.",
          sender: 'expert',
          time: '14:30',
        },
      ],
    },
    {
      id: 'dr-emily-chen',
      name: 'Dr Emily Chen',
      title: 'Sports Medicine',
      image:
        'https://images.unsplash.com/photo-1584467735871-bfb3e45b8d42?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
      lastMessage: 'Remember to ice after workouts. See you next week!',
      time: '12:15',
      isOnline: true,
      messages: [
        { id: '1', text: "How's the training routine going?", sender: 'expert', time: '12:10' },
        {
          id: '2',
          text: "Good! Though I had some soreness after yesterday's workout.",
          sender: 'user',
          time: '12:12',
        },
        {
          id: '3',
          text: 'Remember to ice after workouts. See you next week!',
          sender: 'expert',
          time: '12:15',
        },
      ],
    },
    {
      id: 'dr-michael-brown',
      name: 'Dr Michael Brown',
      title: 'Cardiologist',
      image:
        'https://images.unsplash.com/photo-1603393070569-7e8f8757f46d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
      lastMessage: 'Your heart rate monitoring looks excellent this week.',
      time: '11:30',
      isOnline: false,
      messages: [
        {
          id: '1',
          text: 'Your heart rate monitoring looks excellent this week.',
          sender: 'expert',
          time: '11:30',
        },
      ],
    },
    {
      id: 'dr-lisa-garcia',
      name: 'Dr Lisa Garcia',
      title: 'Nutritionist',
      image:
        'https://images.unsplash.com/photo-1599058918148-42d7e7f547e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
      lastMessage: 'Try the Mediterranean diet plan I sent you.',
      time: '10:45',
      isOnline: true,
      messages: [
        {
          id: '1',
          text: 'How are you finding the new meal plan?',
          sender: 'expert',
          time: '10:40',
        },
        {
          id: '2',
          text: "It's been great! More energy throughout the day.",
          sender: 'user',
          time: '10:43',
        },
        {
          id: '3',
          text: 'Try the Mediterranean diet plan I sent you.',
          sender: 'expert',
          time: '10:45',
        },
      ],
    },
  ];

  useEffect(() => {
    // Set the first expert as selected by default
    if (dummyExperts.length > 0) {
      setSelectedExpert(dummyExperts[0]);
    }
  }, []);

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedExpert) {
      // In a real app, this would send the message to the server
      const updatedExpert = {
        ...selectedExpert,
        messages: [
          ...selectedExpert.messages,
          {
            id: Date.now().toString(),
            text: newMessage,
            sender: 'user' as const,
            time: new Date().toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            }),
          },
        ],
      };
      setSelectedExpert(updatedExpert);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 h-[509px] flex flex-col overflow-hidden ">
      <div className="flex h-full">
        {/* Channel List - Desktop: always visible, Mobile: toggleable */}
        <div
          className={`${
            isMobile ? (showChannelList ? 'w-full' : 'hidden') : 'w-1/3'
          } border-r border-gray-200 dark:border-gray-700 flex flex-col`}
        >
          {/* Mobile header for channel list */}
          {isMobile && showChannelList && (
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Chats</h2>
            </div>
          )}

          {/* Channel List */}
          <div className="flex-1 overflow-y-auto">
            {dummyExperts.map((expertData) => (
              <div
                key={expertData.id}
                className={`flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-600 transition-colors ${
                  selectedExpert?.id === expertData.id
                    ? 'bg-green-50 dark:bg-green-900/20 border-l-4 border-l-green-500'
                    : ''
                }`}
                onClick={() => {
                  setSelectedExpert(expertData);
                  if (isMobile) {
                    setShowChannelList(false);
                  }
                }}
              >
                <div className="relative flex-shrink-0 w-12 h-12">
                  <Image
                    src={expertData.image}
                    alt={expertData.name}
                    fill
                    sizes="48px"
                    className="rounded-full object-cover"
                  />
                  {expertData.isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-400 border-2 border-white dark:border-gray-800 rounded-full"></div>
                  )}
                </div>

                <div className="ml-3 flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {expertData.name}
                    </p>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
                      {expertData.time}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    {expertData.title}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                    {expertData.lastMessage}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Interface */}
        <div
          className={`${
            isMobile ? (showChannelList ? 'hidden' : 'w-full') : 'flex-1'
          } flex flex-col`}
        >
          {selectedExpert ? (
            <>
              {/* Chat Header */}
              <div className="border-b border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center">
                  {isMobile && !showChannelList && (
                    <button
                      onClick={() => setShowChannelList(true)}
                      className="mr-3 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <svg
                        className="w-6 h-6 text-gray-600 dark:text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>
                  )}
                  <div className="relative w-10 h-10 mr-3">
                    <Image
                      src={selectedExpert.image}
                      alt={selectedExpert.name}
                      fill
                      sizes="40px"
                      className="rounded-full object-cover"
                    />
                    {selectedExpert.isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white dark:border-gray-800 rounded-full"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {selectedExpert.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedExpert.title} • {selectedExpert.isOnline ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedExpert.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender === 'user'
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.sender === 'user'
                            ? 'text-green-100'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        {message.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <p className="text-gray-500 dark:text-gray-400">
                  Select a conversation to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageSection;
