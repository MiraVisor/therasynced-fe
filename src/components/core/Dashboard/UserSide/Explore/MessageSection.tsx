import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import {
  ChannelFilters,
  ChannelSort,
  QueryChannelAPIResponse,
  Channel as StreamChannel,
  StreamChat,
} from 'stream-chat';
import {
  Channel,
  ChannelHeader,
  ChannelList,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from 'stream-chat-react';

import '@/styles/stream-chat-custom.css';
import { Expert } from '@/types/types';

// Import Stream Chat CSS
import 'stream-chat-react/dist/css/v2/index.css';

interface MessageSectionProps {
  onSendMessage?: (message: string) => void;
  expert: Expert;
}

const MessageSection: React.FC<MessageSectionProps> = ({ expert }) => {
  const [client, setClient] = useState<StreamChat | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const initChat = async () => {
      try {
        // Create a mock client for demo purposes
        const mockClient = new StreamChat('demo-api-key');

        // Set up mock user without connecting to real API
        mockClient.user = {
          id: 'user-1',
          name: 'Current User',
          image: undefined,
        };
        mockClient.userID = 'user-1';

        // Create dummy users/experts
        const dummyExperts = [
          {
            id: 'dr-lee-marshell',
            name: 'Dr Lee Marshell',
            title: 'Certified Physiotherapist',
            image: 'https://via.placeholder.com/40/4338ca/ffffff?text=DM',
            lastMessage: 'Hello! How are you doing?........',
            time: '16:20',
            isOnline: true,
          },
          {
            id: 'dr-sarah-wilson',
            name: 'Dr Sarah Wilson',
            title: 'Clinical Psychologist',
            image: 'https://via.placeholder.com/40/059669/ffffff?text=SW',
            lastMessage: 'Thank you for the session today',
            time: '15:45',
            isOnline: false,
          },
          {
            id: 'dr-james-parker',
            name: 'Dr James Parker',
            title: 'Orthopedic Specialist',
            image: 'https://via.placeholder.com/40/dc2626/ffffff?text=JP',
            lastMessage: 'Your treatment plan is ready',
            time: '14:30',
            isOnline: true,
          },
          {
            id: 'dr-emily-chen',
            name: 'Dr Emily Chen',
            title: 'Sports Medicine',
            image: 'https://via.placeholder.com/40/7c3aed/ffffff?text=EC',
            lastMessage: 'See you next week!',
            time: '12:15',
            isOnline: false,
          },
        ];

        // Create channels for each expert
        const channels: { [key: string]: StreamChannel } = {};

        for (const expertData of dummyExperts) {
          const channelId = `chat-user-1-${expertData.id}`;
          const channel = mockClient.channel('messaging', channelId, {
            members: ['user-1', expertData.id],
            created_by: { id: 'user-1', name: 'Current User' },
          });

          // Initialize channel state
          channel.state.members = {
            'user-1': {
              user_id: 'user-1',
              user: { id: 'user-1', name: 'Current User' },
              role: 'member',
            },
            [expertData.id]: {
              user_id: expertData.id,
              user: {
                id: expertData.id,
                name: expertData.name,
                image: expertData.image,
              },
              role: 'member',
            },
          };

          // Add different messages for different experts
          if (expertData.id === 'dr-lee-marshell') {
            channel.state.messages = [
              {
                id: 'msg-1',
                text: 'Hello! How are You? 😊',
                user: { id: expertData.id, name: expertData.name, image: expertData.image },
                created_at: new Date('2024-01-26T16:20:00'),
                updated_at: new Date('2024-01-26T16:20:00'),
                deleted_at: null,
                pinned_at: null,
                status: 'sent',
                type: 'regular',
                html: 'Hello! How are You? 😊',
              },
              {
                id: 'msg-2',
                text: 'Hello! i am good...how are you?? Hows everything going? 😊',
                user: { id: 'user-1', name: 'Current User' },
                created_at: new Date('2024-01-26T16:21:00'),
                updated_at: new Date('2024-01-26T16:21:00'),
                deleted_at: null,
                pinned_at: null,
                status: 'sent',
                type: 'regular',
                html: 'Hello! i am good...how are you?? Hows everything going? 😊',
              },
              {
                id: 'msg-3',
                text: 'Hello! i am good...how are you?? Hows everything going? 😊',
                user: { id: expertData.id, name: expertData.name, image: expertData.image },
                created_at: new Date('2024-01-26T16:22:00'),
                updated_at: new Date('2024-01-26T16:22:00'),
                deleted_at: null,
                pinned_at: null,
                status: 'sent',
                type: 'regular',
                html: 'Hello! i am good...how are you?? Hows everything going? 😊',
              },
              {
                id: 'msg-4',
                text: 'Hello! i am good...how are you?? Hows everything going? 😊',
                user: { id: 'user-1', name: 'Current User' },
                created_at: new Date('2024-01-26T16:23:00'),
                updated_at: new Date('2024-01-26T16:23:00'),
                deleted_at: null,
                pinned_at: null,
                status: 'sent',
                type: 'regular',
                html: 'Hello! i am good...how are you?? Hows everything going? 😊',
              },
            ] as unknown as typeof channel.state.messages;
          } else {
            // Add sample messages for other experts
            channel.state.messages = [
              {
                id: `msg-${expertData.id}-1`,
                text: expertData.lastMessage,
                user: { id: expertData.id, name: expertData.name, image: expertData.image },
                created_at: new Date('2024-01-26T15:00:00'),
                updated_at: new Date('2024-01-26T15:00:00'),
                deleted_at: null,
                pinned_at: null,
                status: 'sent',
                type: 'regular',
                html: expertData.lastMessage,
              },
            ] as unknown as typeof channel.state.messages;
          }

          channel.state.watcher_count = 2;
          channel.state.read = {};
          channel.state.typing = {};
          channel.state.last_message_at = new Date('2024-01-26T16:20:00');

          // Set additional channel properties for proper initialization
          channel.cid = `messaging:${channelId}`;
          channel.id = channelId;
          channel.type = 'messaging';
          channel.data = {
            created_by: { id: 'user-1', name: 'Current User' },
            members: ['user-1', expertData.id],
          };

          // Properly initialize the channel
          channel.initialized = true;
          channel._client = mockClient;

          // Mock the watch method
          channel.watch = () =>
            Promise.resolve({
              duration: '0ms',
              channel: {
                ...channel.state,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                id: channelId,
                type: 'messaging',
                cid: `messaging:${channelId}`,
                config: {},
                frozen: false,
                disabled: false,
              },
              messages: channel.state.messages,
              members: channel.state.members,
              membership: {
                user_id: 'user-1',
                user: { id: 'user-1', name: 'Current User' },
                role: 'member',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              pinned_messages: [],
              watcher_count: 2,
              read: [],
              hidden: false,
              truncated_at: null,
            } as unknown as QueryChannelAPIResponse);

          // Mock additional channel methods that might be called
          channel.query = () => channel.watch();
          channel.countUnread = () => 0;
          channel.muteStatus = () => ({
            muted: false,
            createdAt: null,
            expiresAt: null,
          });

          // Initialize the channel immediately
          await channel.watch();

          channels[channelId] = channel;
        }

        // Mock the queryChannels method to return our dummy channels
        mockClient.queryChannels = () => {
          const channelList = Object.values(channels);
          return Promise.resolve(channelList);
        };

        setClient(mockClient);
        setIsConnected(true);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error initializing chat:', error);
      }
    };

    initChat();
  }, [expert.id, expert.name]);

  if (!isConnected || !client) {
    return (
      <div className="bg-white dark:bg-gray-800 h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Connecting to chat...</p>
        </div>
      </div>
    );
  }

  const filters: ChannelFilters = {
    type: 'messaging',
    members: { $in: [client.userID!] },
  };
  const sort: ChannelSort = { last_message_at: -1 };
  const options = { limit: 10 };

  return (
    <div className="bg-white dark:bg-gray-800 h-full">
      <Chat client={client} theme="str-chat__theme-light">
        <div className="flex h-full">
          {/* Left side - Channel List */}
          <div className="w-1/3 border-r border-gray-200 dark:border-gray-700">
            <ChannelList
              // filters={filters}
              sort={sort}
              options={options}
              showChannelSearch
              Preview={(props) => {
                const { channel } = props;
                const members = Object.values(channel.state.members || {});
                const otherMember = members.find((member) => member.user?.id !== client.userID);
                const user = otherMember?.user;

                return (
                  <div className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-600">
                    <div className="relative">
                      <Image
                        src={
                          user?.image ||
                          `https://via.placeholder.com/40/4338ca/ffffff?text=${user?.name?.charAt(0) || 'U'}`
                        }
                        alt={user?.name || 'User'}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {user?.name || 'Unknown User'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Certified Physiotherapist
                          </p>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">16:20</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 truncate mt-1">
                        Hello! How are you doing?........
                      </p>
                    </div>
                  </div>
                );
              }}
            />
          </div>

          {/* Right side - Chat Interface */}
          <div className="flex-1">
            <Channel>
              <Window>
                <ChannelHeader />
                <MessageList />
                <MessageInput />
              </Window>
              <Thread />
            </Channel>
          </div>
        </div>
      </Chat>
    </div>
  );
};

export default MessageSection;
