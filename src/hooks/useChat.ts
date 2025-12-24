import { useCallback, useEffect, useRef } from 'react';

import {
  useChatConnection,
  useChatContacts,
  useChatMessages,
  useMarkMessagesAsRead,
  useSendMessage,
} from '@/hooks/queries/useChat';
import chatService, { ChatMessage } from '@/services/chatService';
import { useChatStore } from '@/stores/chatStore';

export const useChat = (currentUserId?: string) => {
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get state from Zustand store
  const {
    contacts,
    conversations,
    activeConversationId,
    isConnected,
    unreadCounts,
    typingUsers,
    connectionInfo,
    setActiveConversation,
    addMessage,
    updateContact,
    incrementUnreadCount,
    setTypingUsers,
    removeTypingUser,
    updateMessage,
    setConversationContext,
    archiveConversation,
  } = useChatStore();

  // Use React Query hooks
  const { isLoading: isLoadingContacts, refetch: refetchContacts } = useChatContacts();
  const { isLoading: isLoadingMessages } = useChatMessages(activeConversationId, 1);
  const { mutate: sendMessageMutation, isPending: isSending } = useSendMessage();
  const { mutate: markAsReadMutation } = useMarkMessagesAsRead();
  const { isConnected: connectionStatus } = useChatConnection();

  // Set up WebSocket listeners
  useEffect(() => {
    // Set up event listeners
    const unsubscribeNewMessage = chatService.onNewMessage((message: ChatMessage) => {
      console.log('Received new message via WebSocket:', message);
      console.log('Current user ID:', currentUserId);

      if (message.conversationId) {
        // Deduplication in addMessage prevents duplicates (from REST API + WebSocket)
        addMessage(message.conversationId, message);

        // Update contact's last message
        const contact = useChatStore
          .getState()
          .contacts.find((c) => c.conversationId === message.conversationId);
        if (contact) {
          // Determine if message is from current user using senderId if available, otherwise fallback to users.id
          const isFromMe =
            message.senderId === currentUserId ||
            (message.users?.id && message.users.id === currentUserId) ||
            false;
          updateContact(contact.id, {
            lastMessage: {
              content: message.content || '',
              createdAt: message.createdAt || new Date().toISOString(),
              isFromMe,
              isRead: false,
            },
          });

          // Increment unread if not active conversation
          if (activeConversationId !== message.conversationId) {
            incrementUnreadCount(message.conversationId);
          }
        }
      }
    });

    const unsubscribeTypingIndicator = chatService.onTypingIndicator(({ userId, isTyping }) => {
      const currentActiveConversationId = chatService.getCurrentConversationId();
      if (currentActiveConversationId) {
        if (isTyping) {
          const currentUsers = typingUsers[currentActiveConversationId] || [];
          if (!currentUsers.includes(userId)) {
            setTypingUsers(currentActiveConversationId, [...currentUsers, userId]);
          }
        } else {
          removeTypingUser(currentActiveConversationId, userId);
        }
      }
    });

    const unsubscribeMessageRead = chatService.onMessageRead(({ messageId }) => {
      if (activeConversationId) {
        updateMessage(activeConversationId, messageId, { isRead: true });
      }
    });

    const unsubscribeContextChanged = chatService.onConversationContextChanged(
      ({ conversationId, context }) => {
        // Update conversation context in store
        // Note: context is a string from backend, may need to parse if it's JSON
        try {
          const parsedContext = typeof context === 'string' ? JSON.parse(context) : context;
          setConversationContext(conversationId, parsedContext);
        } catch {
          // If parsing fails, store as string
          setConversationContext(conversationId, context as any);
        }
      },
    );

    const unsubscribeArchived = chatService.onConversationArchived(({ conversationId }) => {
      archiveConversation(conversationId);
    });

    return () => {
      unsubscribeNewMessage();
      unsubscribeTypingIndicator();
      unsubscribeMessageRead();
      unsubscribeContextChanged();
      unsubscribeArchived();
    };
  }, [
    currentUserId,
    activeConversationId,
    addMessage,
    updateContact,
    incrementUnreadCount,
    setTypingUsers,
    removeTypingUser,
    updateMessage,
    typingUsers,
    setConversationContext,
    archiveConversation,
  ]);

  // Refresh data when page comes back into focus
  useEffect(() => {
    let lastRefreshTime = 0;
    const REFRESH_THROTTLE = 30000; // 30 seconds

    const handleVisibilityChange = async () => {
      if (!document.hidden) {
        const now = Date.now();

        if (now - lastRefreshTime < REFRESH_THROTTLE) {
          console.log('Skipping refresh - too soon since last refresh');
          return;
        }

        console.log('Page focused - refreshing chat data and checking connection');
        lastRefreshTime = now;

        try {
          if (!isConnected) {
            console.log('Not connected on focus - attempting to reconnect');
            chatService.forceReconnect();
          }

          await refetchContacts();
        } catch (error) {
          console.error('Failed to refresh chat data on focus:', error);
        }
      }
    };

    const wrappedHandler = () => {
      void handleVisibilityChange();
    };

    document.addEventListener('visibilitychange', wrappedHandler);
    window.addEventListener('focus', wrappedHandler);

    return () => {
      document.removeEventListener('visibilitychange', wrappedHandler);
      window.removeEventListener('focus', wrappedHandler);
    };
  }, [isConnected, refetchContacts]);

  // Join/leave conversations when active conversation changes
  useEffect(() => {
    if (activeConversationId) {
      console.log('useChat: Joining conversation:', activeConversationId);
      chatService.joinConversation(activeConversationId);
    }

    return () => {
      if (activeConversationId) {
        console.log('useChat: Leaving conversation:', activeConversationId);
        chatService.leaveConversation(activeConversationId);
      }
    };
  }, [activeConversationId]);

  // Actions
  const selectConversation = useCallback(
    (conversationId: string) => {
      console.log('useChat: selectConversation called with:', conversationId);
      setActiveConversation(conversationId);
    },
    [setActiveConversation],
  );

  const sendChatMessage = useCallback(
    async (recipientId: string, content: string) => {
      if (!content.trim()) return;

      return new Promise<void>((resolve, reject) => {
        sendMessageMutation(
          { recipientId, content },
          {
            onSuccess: () => resolve(),
            onError: (error) => {
              console.error('Failed to send message:', error);
              reject(error);
            },
          },
        );
      });
    },
    [sendMessageMutation],
  );

  const loadMoreMessages = useCallback((_conversationId: string) => {
    // Note: useChatMessages doesn't support infinite queries yet
    // This function is a placeholder for future implementation
    console.log('loadMoreMessages called for:', _conversationId);
  }, []);

  const sendTypingIndicator = useCallback(
    (isTyping: boolean) => {
      if (!activeConversationId) return;

      chatService.sendTypingIndicator(activeConversationId, isTyping);

      if (isTyping) {
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
          chatService.sendTypingIndicator(activeConversationId, false);
        }, 3000);
      }
    },
    [activeConversationId],
  );

  const refreshContacts = useCallback(() => {
    void refetchContacts();
  }, [refetchContacts]);

  const clearChatError = useCallback(() => {
    // Error handling is done by React Query
  }, []);

  const forceReconnect = useCallback(() => {
    chatService.forceReconnect();
    useChatStore.getState().setConnectionInfo({ showReconnectMessage: false });
  }, []);

  const dismissReconnectMessage = useCallback(() => {
    useChatStore.getState().setConnectionInfo({ showReconnectMessage: false });
  }, []);

  const markConversationAsRead = useCallback(
    (conversationId: string) => {
      console.log('markConversationAsRead called for:', conversationId);
      markAsReadMutation(conversationId);
    },
    [markAsReadMutation],
  );

  // Helper functions
  const getActiveConversation = useCallback(() => {
    if (!activeConversationId) return null;
    return conversations[activeConversationId] || [];
  }, [activeConversationId, conversations]);

  const getContactById = useCallback(
    (contactId: string) => {
      return contacts.find((contact) => contact.id === contactId);
    },
    [contacts],
  );

  const getContactByConversationId = useCallback(
    (conversationId: string) => {
      return contacts.find((contact) => contact.conversationId === conversationId);
    },
    [contacts],
  );

  const getTotalUnreadCount = useCallback(() => {
    return Object.values(unreadCounts).reduce((total, count) => total + count, 0);
  }, [unreadCounts]);

  const getTypingUsersForActiveConversation = useCallback(() => {
    if (!activeConversationId) return [];
    return typingUsers[activeConversationId] || [];
  }, [activeConversationId, typingUsers]);

  const canLoadMoreMessages = useCallback((_conversationId: string) => {
    // Note: useChatMessages doesn't support infinite queries yet
    // This function always returns false as a placeholder
    return false;
  }, []);

  return {
    // State
    contacts,
    activeConversationId,
    activeConversation: getActiveConversation(),
    isConnected: connectionStatus || isConnected,
    unreadCounts,
    loading: {
      contacts: isLoadingContacts,
      messages: isLoadingMessages,
      sending: isSending,
      refreshing: false,
    },
    error: null, // React Query handles errors
    totalUnreadCount: getTotalUnreadCount(),
    typingUsers: getTypingUsersForActiveConversation(),
    isRefreshing: false,
    connectionInfo,

    // Actions
    selectConversation,
    sendMessage: sendChatMessage,
    loadMoreMessages,
    sendTypingIndicator,
    refreshContacts,
    clearError: clearChatError,
    markConversationAsRead,
    forceReconnect,
    dismissReconnectMessage,

    // Helpers
    getContactById,
    getContactByConversationId,
    canLoadMoreMessages,

    // Utility
    connectionStatus: chatService.getConnectionStatus(),
  };
};

export default useChat;
