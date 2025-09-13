import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { ChatContact, ChatMessage } from '@/services/chatService';

import {
  getContactsApi,
  getMessagesApi,
  markMessageAsReadApi,
  sendMessageApi,
} from '../api/chatApi';

// Async thunks
export const fetchContacts = createAsyncThunk(
  'chat/fetchContacts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getContactsApi();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch contacts');
    }
  },
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (data: { recipientId: string; content: string }, { rejectWithValue }) => {
    try {
      const response = await sendMessageApi(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to send message');
    }
  },
);

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async (
    {
      conversationId,
      page = 1,
      limit = 50,
    }: { conversationId: string; page?: number; limit?: number },
    { rejectWithValue },
  ) => {
    try {
      const response = await getMessagesApi(conversationId, page, limit);
      return { ...response, conversationId, page };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch messages');
    }
  },
);

export const markAsRead = createAsyncThunk(
  'chat/markAsRead',
  async (messageId: string, { rejectWithValue }) => {
    try {
      await markMessageAsReadApi(messageId);
      return messageId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to mark message as read');
    }
  },
);

// Interface for chat state
interface ChatState {
  contacts: ChatContact[];
  conversations: { [conversationId: string]: ChatMessage[] };
  activeConversationId: string | null;
  isConnected: boolean;
  unreadCounts: { [conversationId: string]: number };
  typingUsers: { [conversationId: string]: string[] };
  loading: {
    contacts: boolean;
    messages: boolean;
    sending: boolean;
    refreshing: boolean;
  };
  connectionInfo: {
    isReconnecting: boolean;
    reconnectAttempts: number;
    showReconnectMessage: boolean;
    lastDisconnectReason?: string;
  };
  error: {
    contacts: string | null;
    messages: string | null;
    sending: string | null;
  };
  pagination: {
    [conversationId: string]: {
      page: number;
      hasNext: boolean;
      loading: boolean;
    };
  };
}

const initialState: ChatState = {
  contacts: [],
  conversations: {},
  activeConversationId: null,
  isConnected: false,
  unreadCounts: {},
  typingUsers: {},
  loading: {
    contacts: false,
    messages: false,
    sending: false,
    refreshing: false,
  },
  connectionInfo: {
    isReconnecting: false,
    reconnectAttempts: 0,
    showReconnectMessage: false,
  },
  error: {
    contacts: null,
    messages: null,
    sending: null,
  },
  pagination: {},
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    // WebSocket connection status
    setConnectionStatus: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },

    // Set active conversation
    setActiveConversation: (state, action: PayloadAction<string | null>) => {
      state.activeConversationId = action.payload;
      // Mark messages as read when conversation becomes active
      if (action.payload && state.unreadCounts[action.payload]) {
        state.unreadCounts[action.payload] = 0;
      }
    },

    // Add new message from WebSocket
    addNewMessage: (state, action: PayloadAction<ChatMessage & { currentUserId?: string }>) => {
      const message = action.payload;
      const conversationId = message.conversationId;
      const currentUserId = (action.payload as any).currentUserId;

      // Add message to conversation
      if (!state.conversations[conversationId]) {
        state.conversations[conversationId] = [];
      }

      // Avoid duplicates
      const exists = state.conversations[conversationId].some((m) => m.id === message.id);
      if (!exists) {
        state.conversations[conversationId].push(message);
      }

      // Determine if message is from current user
      const isFromCurrentUser = message.sender.id === currentUserId;

      // Update unread count ONLY if:
      // 1. Not the active conversation AND
      // 2. Message is not read AND
      // 3. Message is NOT from the current user
      if (state.activeConversationId !== conversationId && !message.isRead && !isFromCurrentUser) {
        state.unreadCounts[conversationId] = (state.unreadCounts[conversationId] || 0) + 1;
      }

      // Update contact's last message
      const contactIndex = state.contacts.findIndex((c) => c.conversationId === conversationId);
      if (contactIndex !== -1) {
        state.contacts[contactIndex].lastMessage = {
          content: message.content,
          createdAt: message.createdAt,
          isFromMe: isFromCurrentUser,
          isRead: message.isRead,
        };
        state.contacts[contactIndex].unreadCount = state.unreadCounts[conversationId] || 0;
      }
    },

    // Update typing indicator
    updateTypingIndicator: (
      state,
      action: PayloadAction<{ conversationId: string; userId: string; isTyping: boolean }>,
    ) => {
      const { conversationId, userId, isTyping } = action.payload;

      if (!state.typingUsers[conversationId]) {
        state.typingUsers[conversationId] = [];
      }

      if (isTyping) {
        if (!state.typingUsers[conversationId].includes(userId)) {
          state.typingUsers[conversationId].push(userId);
        }
      } else {
        state.typingUsers[conversationId] = state.typingUsers[conversationId].filter(
          (id) => id !== userId,
        );
      }
    },

    // Mark message as read
    markMessageRead: (
      state,
      action: PayloadAction<{ messageId: string; conversationId: string }>,
    ) => {
      const { messageId, conversationId } = action.payload;

      if (state.conversations[conversationId]) {
        const messageIndex = state.conversations[conversationId].findIndex(
          (m) => m.id === messageId,
        );
        if (messageIndex !== -1) {
          state.conversations[conversationId][messageIndex].isRead = true;
        }
      }
    },

    // Clear error messages
    clearError: (state, action: PayloadAction<'contacts' | 'messages' | 'sending'>) => {
      state.error[action.payload] = null;
    },

    // Set refreshing state
    setRefreshing: (state, action: PayloadAction<boolean>) => {
      state.loading.refreshing = action.payload;
    },

    // Connection info actions
    setConnectionInfo: (
      state,
      action: PayloadAction<{
        isReconnecting?: boolean;
        reconnectAttempts?: number;
        showReconnectMessage?: boolean;
        lastDisconnectReason?: string;
      }>,
    ) => {
      state.connectionInfo = { ...state.connectionInfo, ...action.payload };
    },

    // Hide reconnect message
    hideReconnectMessage: (state) => {
      state.connectionInfo.showReconnectMessage = false;
    },

    // Reset chat state (useful for logout)
    resetChatState: () => initialState,

    // Load more messages for pagination
    setMessagesPagination: (
      state,
      action: PayloadAction<{
        conversationId: string;
        page: number;
        hasNext: boolean;
        loading: boolean;
      }>,
    ) => {
      const { conversationId, page, hasNext, loading } = action.payload;
      state.pagination[conversationId] = { page, hasNext, loading };
    },
  },
  extraReducers: (builder) => {
    // Fetch contacts
    builder
      .addCase(fetchContacts.pending, (state) => {
        state.loading.contacts = true;
        state.error.contacts = null;
      })
      .addCase(fetchContacts.fulfilled, (state, action) => {
        state.loading.contacts = false;
        // Handle the API response structure (action.payload is the API response)
        const responseData = action.payload as any;
        const contactsData = responseData.data || responseData; // Handle both formats
        state.contacts = Array.isArray(contactsData) ? contactsData : contactsData.data || [];

        // Initialize unread counts
        state.contacts.forEach((contact) => {
          state.unreadCounts[contact.conversationId] = contact.unreadCount || 0;
        });
      })
      .addCase(fetchContacts.rejected, (state, action) => {
        state.loading.contacts = false;
        state.error.contacts = action.payload as string;
      })

      // Send message
      .addCase(sendMessage.pending, (state) => {
        state.loading.sending = true;
        state.error.sending = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading.sending = false;
        // Handle the API response structure
        const responseData = action.payload as any;
        const messageData = responseData.data || responseData;
        const message = messageData.data || messageData; // Handle nested data structure
        const conversationId = message.conversationId;

        // Add message to conversation
        if (!state.conversations[conversationId]) {
          state.conversations[conversationId] = [];
        }
        state.conversations[conversationId].push(message);

        // Update contact's last message
        const contactIndex = state.contacts.findIndex((c) => c.conversationId === conversationId);
        if (contactIndex !== -1) {
          state.contacts[contactIndex].lastMessage = {
            content: message.content,
            createdAt: message.createdAt,
            isFromMe: true,
            isRead: message.isRead,
          };
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading.sending = false;
        state.error.sending = action.payload as string;
      })

      // Fetch messages
      .addCase(fetchMessages.pending, (state, action) => {
        const conversationId = action.meta.arg.conversationId;
        const page = action.meta.arg.page || 1;

        if (page === 1) {
          state.loading.messages = true;
        } else {
          // For pagination, update pagination loading state
          if (!state.pagination[conversationId]) {
            state.pagination[conversationId] = { page: 1, hasNext: false, loading: false };
          }
          state.pagination[conversationId].loading = true;
        }
        state.error.messages = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        const { conversationId, page } = action.payload;
        const messagesData = action.payload.data; // This is the array of messages directly
        state.loading.messages = false;

        console.log('fetchMessages.fulfilled - Raw action payload:', action.payload);
        console.log('fetchMessages.fulfilled - Messages data:', messagesData);
        console.log('fetchMessages.fulfilled - Conversation ID:', conversationId);

        if (page === 1) {
          // Replace messages for first page - messagesData IS the array
          state.conversations[conversationId] = messagesData;
          console.log(
            'fetchMessages.fulfilled - Set messages for conversation:',
            conversationId,
            messagesData,
          );
        } else {
          // Append messages for pagination (older messages at the beginning)
          if (!state.conversations[conversationId]) {
            state.conversations[conversationId] = [];
          }
          state.conversations[conversationId] = [
            ...messagesData,
            ...state.conversations[conversationId],
          ];
        }

        // Update pagination info - backend doesn't seem to include pagination in response yet
        const hasNext = (messagesData as any).pagination?.hasNext || false;
        state.pagination[conversationId] = {
          page: page,
          hasNext,
          loading: false,
        };

        // Mark conversation messages as read since we're viewing them
        if (state.unreadCounts[conversationId] > 0) {
          state.unreadCounts[conversationId] = 0;
          // Update contact unread count
          const contactIndex = state.contacts.findIndex((c) => c.conversationId === conversationId);
          if (contactIndex !== -1) {
            state.contacts[contactIndex].unreadCount = 0;
          }
        }
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading.messages = false;
        const conversationId = action.meta.arg.conversationId;
        if (state.pagination[conversationId]) {
          state.pagination[conversationId].loading = false;
        }
        state.error.messages = action.payload as string;
      })

      // Mark as read
      .addCase(markAsRead.fulfilled, (state, action) => {
        const messageId = action.payload;
        // Find and update the message across all conversations
        Object.keys(state.conversations).forEach((conversationId) => {
          const messageIndex = state.conversations[conversationId].findIndex(
            (m) => m.id === messageId,
          );
          if (messageIndex !== -1) {
            state.conversations[conversationId][messageIndex].isRead = true;
          }
        });
      });
  },
});

export const {
  setConnectionStatus,
  setActiveConversation,
  addNewMessage,
  updateTypingIndicator,
  markMessageRead,
  clearError,
  setRefreshing,
  setConnectionInfo,
  hideReconnectMessage,
  resetChatState,
  setMessagesPagination,
} = chatSlice.actions;

export default chatSlice.reducer;
