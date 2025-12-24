import { create } from 'zustand';

import { ChatMessage, ConversationContext } from '@/services/chatService';

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

  // Actions
  setContacts: (contacts: ChatContactState[]) => void;
  setArchivedContacts: (contacts: ChatContactState[]) => void;
  addContact: (contact: ChatContactState) => void;
  updateContact: (contactId: string, updates: Partial<ChatContactState>) => void;
  setActiveConversation: (conversationId: string | null) => void;
  addMessage: (conversationId: string, message: ChatMessage) => void;
  setMessages: (conversationId: string, messages: ChatMessage[]) => void;
  prependMessages: (conversationId: string, messages: ChatMessage[]) => void;
  updateMessage: (conversationId: string, messageId: string, updates: Partial<ChatMessage>) => void;
  setConnectionStatus: (isConnected: boolean) => void;
  setConnectionInfo: (info: Partial<ConnectionInfo>) => void;
  setUnreadCount: (conversationId: string, count: number) => void;
  incrementUnreadCount: (conversationId: string) => void;
  clearUnreadCount: (conversationId: string) => void;
  setTypingUsers: (conversationId: string, userIds: string[]) => void;
  addTypingUser: (conversationId: string, userId: string) => void;
  removeTypingUser: (conversationId: string, userId: string) => void;
  setConversationContext: (conversationId: string, context: ConversationContext) => void;
  archiveConversation: (conversationId: string) => void;
  unarchiveConversation: (conversationId: string) => void;
  clearChat: () => void;
}

const initialState = {
  contacts: [],
  archivedContacts: [],
  conversations: {},
  activeConversationId: null,
  conversationContexts: {},
  isConnected: false,
  connectionInfo: {},
  unreadCounts: {},
  typingUsers: {},
};

export const useChatStore = create<ChatState>((set) => ({
  ...initialState,

  setContacts: (contacts) => set({ contacts }),

  setArchivedContacts: (contacts) => set({ archivedContacts: contacts }),

  addContact: (contact) =>
    set((state) => ({
      contacts: [...state.contacts.filter((c) => c.id !== contact.id), contact],
    })),

  updateContact: (contactId, updates) =>
    set((state) => ({
      contacts: state.contacts.map((c) => (c.id === contactId ? { ...c, ...updates } : c)),
      archivedContacts: state.archivedContacts.map((c) =>
        c.id === contactId ? { ...c, ...updates } : c,
      ),
    })),

  setActiveConversation: (conversationId) => set({ activeConversationId: conversationId }),

  addMessage: (conversationId, message) =>
    set((state) => {
      const existingMessages = state.conversations[conversationId] || [];
      // Check if message already exists (deduplicate by message ID)
      const messageExists = existingMessages.some((msg) => msg.id === message.id);
      if (messageExists) {
        return state; // Don't add duplicate
      }
      return {
        conversations: {
          ...state.conversations,
          [conversationId]: [...existingMessages, message],
        },
      };
    }),

  setMessages: (conversationId, messages) =>
    set((state) => ({
      conversations: {
        ...state.conversations,
        [conversationId]: messages,
      },
    })),

  prependMessages: (conversationId, messages) =>
    set((state) => ({
      conversations: {
        ...state.conversations,
        [conversationId]: [...messages, ...(state.conversations[conversationId] || [])],
      },
    })),

  updateMessage: (conversationId, messageId, updates) =>
    set((state) => ({
      conversations: {
        ...state.conversations,
        [conversationId]: (state.conversations[conversationId] || []).map((msg) =>
          msg.id === messageId ? { ...msg, ...updates } : msg,
        ),
      },
    })),

  setConnectionStatus: (isConnected) => set({ isConnected }),

  setConnectionInfo: (info) =>
    set((state) => ({
      connectionInfo: { ...state.connectionInfo, ...info },
    })),

  setUnreadCount: (conversationId, count) =>
    set((state) => ({
      unreadCounts: { ...state.unreadCounts, [conversationId]: count },
    })),

  incrementUnreadCount: (conversationId) =>
    set((state) => ({
      unreadCounts: {
        ...state.unreadCounts,
        [conversationId]: (state.unreadCounts[conversationId] || 0) + 1,
      },
    })),

  clearUnreadCount: (conversationId) =>
    set((state) => {
      const newCounts = { ...state.unreadCounts };
      delete newCounts[conversationId];
      return { unreadCounts: newCounts };
    }),

  setTypingUsers: (conversationId, userIds) =>
    set((state) => ({
      typingUsers: { ...state.typingUsers, [conversationId]: userIds },
    })),

  addTypingUser: (conversationId, userId) =>
    set((state) => {
      const currentUsers = state.typingUsers[conversationId] || [];
      if (!currentUsers.includes(userId)) {
        return {
          typingUsers: {
            ...state.typingUsers,
            [conversationId]: [...currentUsers, userId],
          },
        };
      }
      return state;
    }),

  removeTypingUser: (conversationId, userId) =>
    set((state) => ({
      typingUsers: {
        ...state.typingUsers,
        [conversationId]: (state.typingUsers[conversationId] || []).filter((id) => id !== userId),
      },
    })),

  setConversationContext: (conversationId, context) =>
    set((state) => ({
      conversationContexts: {
        ...state.conversationContexts,
        [conversationId]: context,
      },
    })),

  archiveConversation: (conversationId) =>
    set((state) => {
      const contact = state.contacts.find((c) => c.conversationId === conversationId);
      if (!contact) return state;

      return {
        contacts: state.contacts.filter((c) => c.conversationId !== conversationId),
        archivedContacts: [...state.archivedContacts, { ...contact, isArchived: true }],
        activeConversationId:
          state.activeConversationId === conversationId ? null : state.activeConversationId,
      };
    }),

  unarchiveConversation: (conversationId) =>
    set((state) => {
      const contact = state.archivedContacts.find((c) => c.conversationId === conversationId);
      if (!contact) return state;

      return {
        archivedContacts: state.archivedContacts.filter((c) => c.conversationId !== conversationId),
        contacts: [...state.contacts, { ...contact, isArchived: false }],
      };
    }),

  clearChat: () => set(initialState),
}));
