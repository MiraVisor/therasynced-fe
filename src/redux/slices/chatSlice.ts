import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import {
  ChatContact,
  GetMessagesData,
  Message,
  SendMessageData,
  getChatContactsApi,
  getMessagesApi,
  sendMessageApi,
} from '../api/chatApi';

interface ChatState {
  contacts: ChatContact[];
  messages: { [conversationId: string]: Message[] };
  selectedContact: ChatContact | null;
  isLoadingContacts: boolean;
  isLoadingMessages: boolean;
  error: string | null;
}

const initialState: ChatState = {
  contacts: [],
  messages: {},
  selectedContact: null,
  isLoadingContacts: false,
  isLoadingMessages: false,
  error: null,
};

// Async thunks
export const fetchChatContacts = createAsyncThunk(
  'chat/fetchContacts',
  async (_, { rejectWithValue }) => {
    try {
      const contacts = await getChatContactsApi();
      return contacts;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch chat contacts');
    }
  },
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (data: SendMessageData, { rejectWithValue }) => {
    try {
      const message = await sendMessageApi(data);
      return message;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to send message');
    }
  },
);

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async (data: GetMessagesData, { rejectWithValue }) => {
    try {
      const messages = await getMessagesApi(data);
      return { conversationId: data.conversationId, messages };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch messages');
    }
  },
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setSelectedContact: (state, action) => {
      state.selectedContact = action.payload;
    },
    addMessage: (state, action) => {
      const { conversationId, message } = action.payload;
      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }

      // Check if message already exists to prevent duplicates
      const messageExists = state.messages[conversationId].some(
        (existingMessage) => existingMessage.id === message.id,
      );

      if (!messageExists) {
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
      if (state.messages[conversationId]) {
        state.messages[conversationId].forEach((message) => {
          message.isRead = true;
        });
      }
      // Update unread count for the contact
      const contact = state.contacts.find((c) => c.conversationId === conversationId);
      if (contact) {
        contact.unreadCount = 0;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch contacts
      .addCase(fetchChatContacts.pending, (state) => {
        state.isLoadingContacts = true;
        state.error = null;
      })
      .addCase(fetchChatContacts.fulfilled, (state, action) => {
        state.isLoadingContacts = false;
        state.contacts = action.payload;
      })
      .addCase(fetchChatContacts.rejected, (state, action) => {
        state.isLoadingContacts = false;
        state.error = action.payload as string;
      })

      // Send message
      .addCase(sendMessage.pending, (state) => {
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        const message = action.payload;
        const conversationId = state.selectedContact?.conversationId;
        if (conversationId) {
          if (!state.messages[conversationId]) {
            state.messages[conversationId] = [];
          }

          // Check if message already exists to prevent duplicates
          const messageExists = state.messages[conversationId].some(
            (existingMessage) => existingMessage.id === message.id,
          );

          if (!messageExists) {
            state.messages[conversationId].push(message);
          }
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      // Fetch messages
      .addCase(fetchMessages.pending, (state) => {
        state.isLoadingMessages = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.isLoadingMessages = false;
        const { conversationId, messages } = action.payload;
        state.messages[conversationId] = messages;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.isLoadingMessages = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setSelectedContact,
  addMessage,
  updateContactLastMessage,
  markMessagesAsRead,
  clearError,
} = chatSlice.actions;

// Selectors
export const selectTotalUnreadCount = (state: { chat: ChatState }) => {
  return state.chat.contacts.reduce((total, contact) => total + (contact.unreadCount || 0), 0);
};

export default chatSlice.reducer;
