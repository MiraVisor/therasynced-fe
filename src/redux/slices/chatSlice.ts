import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import chatService, { ChatMessage, ConversationContext, MessageType } from '@/services/chatService';

// Types for the enhanced chat state
export interface ChatContactState {
  id: string;
  name: string;
  email: string;
  profilePicture: string;
  conversationId: string;
  lastMessage?: {
    content: string;
    createdAt: string;
    isFromMe: boolean;
    isRead: boolean;
  };
  unreadCount: number;
  lastAppointment?: {
    id: string;
    status: string;
    completedAt?: string;
  };
  isOnline?: boolean;
  context?: ConversationContext;
  allowPreBookingMessages?: boolean;
  isArchived?: boolean;
  postCareDaysRemaining?: number;
}

interface ConnectionInfo {
  isReconnecting?: boolean;
  reconnectAttempts?: number;
  lastDisconnectReason?: string;
  showReconnectMessage?: boolean;
}

interface LoadingState {
  contacts: boolean;
  messages: boolean;
  sending: boolean;
  refreshing: boolean;
}

interface ErrorState {
  contacts: string | null;
  messages: string | null;
  sending: string | null;
}

interface PaginationInfo {
  page: number;
  hasNext: boolean;
  loading: boolean;
  total?: number;
}

interface ChatState {
  // Core data
  contacts: ChatContactState[];
  archivedContacts: ChatContactState[];
  conversations: { [conversationId: string]: ChatMessage[] };
  activeConversationId: string | null;
  conversationContexts: { [conversationId: string]: ConversationContext };

  // Connection state
  isConnected: boolean;
  connectionInfo: ConnectionInfo;

  // UI state
  unreadCounts: { [conversationId: string]: number };
  typingUsers: { [conversationId: string]: string[] };

  // Loading states
  loading: LoadingState;

  // Error states
  errorState: ErrorState;

  // Pagination
  pagination: { [conversationId: string]: PaginationInfo };

  // Legacy compatibility
  messages: { [conversationId: string]: ChatMessage[] };
  selectedContact: ChatContactState | null;
  isLoadingContacts: boolean;
  isLoadingMessages: boolean;
  error: string | null; // Legacy error field
}

const initialState: ChatState = {
  contacts: [],
  archivedContacts: [],
  conversations: {},
  activeConversationId: null,
  conversationContexts: {},
  isConnected: false,
  connectionInfo: {},
  unreadCounts: {},
  typingUsers: {},
  loading: {
    contacts: false,
    messages: false,
    sending: false,
    refreshing: false,
  },
  errorState: {
    contacts: null,
    messages: null,
    sending: null,
  },
  // Legacy error field
  error: null,
  pagination: {},
  // Legacy compatibility
  messages: {},
  selectedContact: null,
  isLoadingContacts: false,
  isLoadingMessages: false,
};

// Async thunks
export const fetchContacts = createAsyncThunk(
  'chat/fetchContacts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await chatService.getContacts();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch contacts');
    }
  },
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (
    data: { recipientId: string; content: string; bookingId?: string; messageType?: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await chatService.sendMessage({
        recipientId: data.recipientId,
        content: data.content,
        bookingId: data.bookingId,
        messageType: data.messageType as MessageType,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to send message');
    }
  },
);

export const archiveConversationThunk = createAsyncThunk(
  'chat/archiveConversation',
  async (conversationId: string, { rejectWithValue }) => {
    try {
      await chatService.archiveConversation(conversationId);
      return conversationId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to archive conversation');
    }
  },
);

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async (data: { conversationId: string; page: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await chatService.getMessages(data.conversationId, data.page, data.limit);
      return {
        conversationId: data.conversationId,
        messages: response.data,
        pagination: response.pagination,
        page: data.page,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch messages');
    }
  },
);

// Legacy thunks for compatibility
export const fetchChatContacts = fetchContacts;

// Legacy types for compatibility
export interface GetMessagesData {
  conversationId: string;
  page: number;
  limit?: number;
}

export interface SendMessageData {
  recipientId: string;
  content: string;
  bookingId?: string;
  messageType?: string;
}

export interface Message extends ChatMessage {}

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    // Modern chat actions
    setActiveConversation: (state, action) => {
      state.activeConversationId = action.payload;
    },

    addNewMessage: (state, action) => {
      const { currentUserId, ...message } = action.payload;
      const conversationId = message.conversationId;

      if (!state.conversations[conversationId]) {
        state.conversations[conversationId] = [];
      }

      // Check if message already exists to prevent duplicates
      const messageExists = state.conversations[conversationId].some(
        (existingMessage) => existingMessage.id === message.id,
      );

      if (!messageExists) {
        state.conversations[conversationId].push(message);

        // Update legacy messages for compatibility
        if (!state.messages[conversationId]) {
          state.messages[conversationId] = [];
        }
        state.messages[conversationId].push(message);

        // Update unread count if message is not from current user
        if (message.users.id !== currentUserId) {
          state.unreadCounts[conversationId] = (state.unreadCounts[conversationId] || 0) + 1;
        }

        // Update contact's last message for real-time updates
        const contact = state.contacts.find((c) => c.conversationId === conversationId);
        if (contact) {
          console.log(
            'Updating contact lastMessage for:',
            contact.name,
            'new message:',
            message.content,
          );
          contact.lastMessage = {
            content: message.content,
            createdAt: message.createdAt,
            isFromMe: message.users.id === currentUserId,
            isRead: message.isRead,
          };

          // Update contact's unread count
          if (message.users.id !== currentUserId) {
            const oldCount = contact.unreadCount || 0;
            contact.unreadCount = oldCount + 1;
            console.log(
              'Updated unread count for',
              contact.name,
              'from',
              oldCount,
              'to',
              contact.unreadCount,
            );
          }
        } else {
          console.log('No contact found for conversation:', conversationId);
        }
      }
    },

    markMessageRead: (state, action) => {
      const messageId = action.payload;
      // Find and mark message as read in all conversations
      Object.values(state.conversations).forEach((conversation) => {
        const message = conversation.find((msg) => msg.id === messageId);
        if (message) {
          message.isRead = true;
        }
      });

      // Also update legacy messages
      Object.values(state.messages).forEach((conversation) => {
        const message = conversation.find((msg) => msg.id === messageId);
        if (message) {
          message.isRead = true;
        }
      });
    },

    setConnectionStatus: (state, action) => {
      state.isConnected = action.payload;
    },

    setConnectionInfo: (state, action) => {
      state.connectionInfo = { ...state.connectionInfo, ...action.payload };
    },

    hideReconnectMessage: (state) => {
      state.connectionInfo.showReconnectMessage = false;
    },

    setRefreshing: (state, action) => {
      state.loading.refreshing = action.payload;
    },

    updateTypingIndicator: (state, action) => {
      const { conversationId, userId, isTyping } = action.payload;

      if (!state.typingUsers[conversationId]) {
        state.typingUsers[conversationId] = [];
      }

      const typingList = state.typingUsers[conversationId];
      const userIndex = typingList.indexOf(userId);

      if (isTyping && userIndex === -1) {
        typingList.push(userId);
      } else if (!isTyping && userIndex !== -1) {
        typingList.splice(userIndex, 1);
      }
    },

    clearError: (state, action) => {
      const errorType = action.payload;
      if (errorType && state.errorState[errorType as keyof ErrorState] !== undefined) {
        state.errorState[errorType as keyof ErrorState] = null;
      } else {
        // Clear all errors if no specific type provided
        state.errorState = {
          contacts: null,
          messages: null,
          sending: null,
        };
      }
      // Also clear legacy error
      state.error = null;
    },

    // Legacy compatibility actions
    setSelectedContact: (state, action) => {
      state.selectedContact = action.payload;
      if (action.payload?.conversationId) {
        state.activeConversationId = action.payload.conversationId;
      }
    },

    addMessage: (state, action) => {
      const { conversationId, message } = action.payload;

      // Update modern conversations
      if (!state.conversations[conversationId]) {
        state.conversations[conversationId] = [];
      }

      const messageExists = state.conversations[conversationId].some(
        (existingMessage) => existingMessage.id === message.id,
      );

      if (!messageExists) {
        state.conversations[conversationId].push(message);
      }

      // Update legacy messages
      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }

      const legacyMessageExists = state.messages[conversationId].some(
        (existingMessage) => existingMessage.id === message.id,
      );

      if (!legacyMessageExists) {
        state.messages[conversationId].push(message);
      }
    },

    updateContactLastMessage: (state, action) => {
      const { contactId, message } = action.payload;
      const contact = state.contacts.find((c) => c.id === contactId);
      if (contact) {
        contact.lastMessage = message;
        contact.unreadCount = message.isFromMe ? contact.unreadCount : contact.unreadCount + 1;
      }
    },

    markMessagesAsRead: (state, action) => {
      const { conversationId } = action.payload;

      // Update modern conversations
      if (state.conversations[conversationId]) {
        state.conversations[conversationId].forEach((message) => {
          message.isRead = true;
        });
      }

      // Update legacy messages
      if (state.messages[conversationId]) {
        state.messages[conversationId].forEach((message) => {
          message.isRead = true;
        });
      }

      // Reset unread count
      state.unreadCounts[conversationId] = 0;

      // Update contact unread count
      const contact = state.contacts.find((c) => c.conversationId === conversationId);
      if (contact) {
        contact.unreadCount = 0;
      }
    },

    archiveConversation: (state, action) => {
      const conversationId = action.payload;
      const contact = state.contacts.find((c) => c.conversationId === conversationId);
      if (contact) {
        contact.isArchived = true;
        state.archivedContacts.push(contact);
        state.contacts = state.contacts.filter((c) => c.conversationId !== conversationId);
      }
    },

    unarchiveConversation: (state, action) => {
      const conversationId = action.payload;
      const contact = state.archivedContacts.find((c) => c.conversationId === conversationId);
      if (contact) {
        contact.isArchived = false;
        state.contacts.push(contact);
        state.archivedContacts = state.archivedContacts.filter(
          (c) => c.conversationId !== conversationId,
        );
      }
    },

    updateConversationContext: (state, action) => {
      const { conversationId, context } = action.payload;
      state.conversationContexts[conversationId] = context;

      // Update contact context
      const contact = state.contacts.find((c) => c.conversationId === conversationId);
      if (contact) {
        contact.context = context;
      }

      const archivedContact = state.archivedContacts.find(
        (c) => c.conversationId === conversationId,
      );
      if (archivedContact) {
        archivedContact.context = context;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch contacts
      .addCase(fetchContacts.pending, (state) => {
        state.loading.contacts = true;
        state.errorState.contacts = null;
        // Legacy compatibility
        state.isLoadingContacts = true;
        state.error = null;
      })
      .addCase(fetchContacts.fulfilled, (state, action) => {
        state.loading.contacts = false;
        // Separate archived and active contacts
        const allContacts = action.payload;
        state.contacts = allContacts.filter((contact) => !contact.isArchived);
        state.archivedContacts = allContacts.filter((contact) => contact.isArchived);

        // Update conversation contexts
        allContacts.forEach((contact) => {
          if (contact.context && contact.conversationId) {
            state.conversationContexts[contact.conversationId] = contact.context;
          }
        });

        // Legacy compatibility
        state.isLoadingContacts = false;
      })
      .addCase(fetchContacts.rejected, (state, action) => {
        state.loading.contacts = false;
        state.errorState.contacts = action.payload as string;
        // Legacy compatibility
        state.isLoadingContacts = false;
        state.error = action.payload as string;
      })

      // Send message
      .addCase(sendMessage.pending, (state) => {
        state.loading.sending = true;
        state.errorState.sending = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading.sending = false;
        const message = action.payload;
        const conversationId = message.conversationId;

        // Add to modern conversations
        if (!state.conversations[conversationId]) {
          state.conversations[conversationId] = [];
        }

        const messageExists = state.conversations[conversationId].some(
          (existingMessage) => existingMessage.id === message.id,
        );

        if (!messageExists) {
          state.conversations[conversationId].push(message);
        }

        // Legacy compatibility
        if (!state.messages[conversationId]) {
          state.messages[conversationId] = [];
        }

        const legacyMessageExists = state.messages[conversationId].some(
          (existingMessage) => existingMessage.id === message.id,
        );

        if (!legacyMessageExists) {
          state.messages[conversationId].push(message);
        }

        // Update contact's last message when sending a message
        const contact = state.contacts.find((c) => c.conversationId === conversationId);
        if (contact) {
          contact.lastMessage = {
            content: message.content,
            createdAt: message.createdAt,
            isFromMe: true,
            isRead: true,
          };
          // Don't increment unread count for own messages
          // Keep current unread count as is
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading.sending = false;
        state.errorState.sending = action.payload as string;
      })

      // Archive conversation
      .addCase(archiveConversationThunk.pending, (state) => {
        // No loading state needed for archiving
      })
      .addCase(archiveConversationThunk.fulfilled, (state, action) => {
        const conversationId = action.payload;
        const contact = state.contacts.find((c) => c.conversationId === conversationId);
        if (contact) {
          contact.isArchived = true;
          state.archivedContacts.push(contact);
          state.contacts = state.contacts.filter((c) => c.conversationId !== conversationId);
        }
      })
      .addCase(archiveConversationThunk.rejected, (state, action) => {
        // Handle error if needed
        console.error('Failed to archive conversation:', action.payload);
      })

      // Fetch messages
      .addCase(fetchMessages.pending, (state, action) => {
        const conversationId = action.meta.arg.conversationId;
        state.loading.messages = true;
        state.errorState.messages = null;

        // Initialize pagination info
        if (!state.pagination[conversationId]) {
          state.pagination[conversationId] = {
            page: 0,
            hasNext: true,
            loading: false,
          };
        }
        state.pagination[conversationId].loading = true;

        // Legacy compatibility
        state.isLoadingMessages = true;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading.messages = false;
        const { conversationId, messages, pagination, page } = action.payload;

        // Update pagination info
        state.pagination[conversationId] = {
          page: page,
          hasNext: pagination?.hasNext || false,
          loading: false,
          total: pagination?.total,
        };

        // For page 1, replace messages; for subsequent pages, prepend
        if (page === 1) {
          state.conversations[conversationId] = messages;
          state.messages[conversationId] = messages; // Legacy compatibility
        } else {
          // Prepend older messages for pagination
          const existingMessages = state.conversations[conversationId] || [];
          state.conversations[conversationId] = [...messages, ...existingMessages];
          state.messages[conversationId] = [...messages, ...(state.messages[conversationId] || [])];
        }

        // Legacy compatibility
        state.isLoadingMessages = false;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        const conversationId = action.meta.arg.conversationId;
        state.loading.messages = false;
        state.errorState.messages = action.payload as string;

        if (state.pagination[conversationId]) {
          state.pagination[conversationId].loading = false;
        }

        // Legacy compatibility
        state.isLoadingMessages = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  // Modern actions
  setActiveConversation,
  addNewMessage,
  markMessageRead,
  setConnectionStatus,
  setConnectionInfo,
  hideReconnectMessage,
  setRefreshing,
  updateTypingIndicator,
  clearError,
  archiveConversation,
  unarchiveConversation,
  updateConversationContext,
  // Legacy actions
  setSelectedContact,
  addMessage,
  updateContactLastMessage,
  markMessagesAsRead,
} = chatSlice.actions;

// Modern alias for legacy compatibility
export const markAsRead = markMessageRead;

// Selectors
export const selectTotalUnreadCount = (state: { chat: ChatState }) => {
  const contactsUnread = state.chat.contacts.reduce(
    (total, contact) => total + contact.unreadCount,
    0,
  );
  const conversationsUnread = Object.values(state.chat.unreadCounts).reduce(
    (total, count) => total + count,
    0,
  );
  return Math.max(contactsUnread, conversationsUnread);
};

export default chatSlice.reducer;

// Export types for external use
export type { ChatState, ConnectionInfo, ErrorState, LoadingState, PaginationInfo };

// Re-export ChatContact from service for compatibility
export type { ChatContact } from '../../services/chatService';
