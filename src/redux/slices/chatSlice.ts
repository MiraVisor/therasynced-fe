import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { getBookedFreelancers, getChatHistory, getOrCreateChatThread } from '../api/chatApi';

export const fetchChatContacts = createAsyncThunk(
  'chat/fetchChatContacts',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getBookedFreelancers();
      return data.data || [];
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to fetch chat contacts');
    }
  },
);

export const fetchChatThread = createAsyncThunk(
  'chat/fetchChatThread',
  async (freelancerId: string, { rejectWithValue }) => {
    try {
      const data = await getOrCreateChatThread(freelancerId);
      return data;
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to get chat thread');
    }
  },
);

export const fetchChatHistory = createAsyncThunk(
  'chat/fetchChatHistory',
  async (threadId: string, { rejectWithValue }) => {
    try {
      const data = await getChatHistory(threadId);
      return data;
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to fetch chat history');
    }
  },
);

const initialState = {
  contacts: [],
  contactsLoading: false,
  contactsError: null as string | null,
  thread: null as any,
  threadLoading: false,
  threadError: null as string | null,
  messages: [] as any[],
  messagesLoading: false,
  messagesError: null as string | null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action) => {
      state.messages = [...(state.messages || []), action.payload];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChatContacts.pending, (state) => {
        state.contactsLoading = true;
        state.contactsError = null;
      })
      .addCase(fetchChatContacts.fulfilled, (state, action) => {
        state.contactsLoading = false;
        state.contacts = action.payload;
      })
      .addCase(fetchChatContacts.rejected, (state, action) => {
        state.contactsLoading = false;
        state.contactsError = action.payload as string;
      })
      .addCase(fetchChatThread.pending, (state) => {
        state.threadLoading = true;
        state.threadError = null;
      })
      .addCase(fetchChatThread.fulfilled, (state, action) => {
        state.threadLoading = false;
        state.thread = action.payload;
      })
      .addCase(fetchChatThread.rejected, (state, action) => {
        state.threadLoading = false;
        state.threadError = action.payload as string;
      })
      .addCase(fetchChatHistory.pending, (state) => {
        state.messagesLoading = true;
        state.messagesError = null;
      })
      .addCase(fetchChatHistory.fulfilled, (state, action) => {
        state.messagesLoading = false;
        // If response is { data: { ...thread, messages: [...] } }, set only messages
        if (action.payload?.data?.messages) {
          state.messages = action.payload.data.messages;
        } else if (action.payload?.messages) {
          state.messages = action.payload.messages;
        } else {
          state.messages = [];
        }
      })
      .addCase(fetchChatHistory.rejected, (state, action) => {
        state.messagesLoading = false;
        state.messagesError = action.payload as string;
      });
  },
});

export const { addMessage } = chatSlice.actions;

export default chatSlice.reducer;
