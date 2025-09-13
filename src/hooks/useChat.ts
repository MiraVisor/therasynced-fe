import { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  addNewMessage,
  clearError,
  fetchContacts,
  fetchMessages,
  hideReconnectMessage,
  markAsRead,
  sendMessage,
  setActiveConversation,
  setConnectionInfo,
  setConnectionStatus,
  setRefreshing,
  updateTypingIndicator,
} from '@/redux/slices/chatSlice';
import { AppDispatch, RootState } from '@/redux/store';
import chatService, { ChatMessage } from '@/services/chatService';

export const useChat = (currentUserId?: string) => {
  const dispatch = useDispatch<AppDispatch>();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    contacts,
    conversations,
    activeConversationId,
    isConnected,
    unreadCounts,
    typingUsers,
    loading,
    error,
    pagination,
    connectionInfo,
  } = useSelector((state: RootState) => state.chat);

  // Initialize chat connection
  useEffect(() => {
    chatService.connect();

    // Set up event listeners
    const unsubscribeNewMessage = chatService.onNewMessage((message: ChatMessage) => {
      dispatch(addNewMessage({ ...message, currentUserId }));
    });

    const unsubscribeTypingIndicator = chatService.onTypingIndicator(({ userId, isTyping }) => {
      if (activeConversationId) {
        dispatch(
          updateTypingIndicator({
            conversationId: activeConversationId,
            userId,
            isTyping,
          }),
        );
      }
    });

    const unsubscribeMessageRead = chatService.onMessageRead(({ messageId }) => {
      if (activeConversationId) {
        dispatch(markAsRead(messageId));
      }
    });

    // Connection event handlers
    const handleConnectionRestored = () => {
      dispatch(setConnectionStatus(true));
      dispatch(setConnectionInfo({ isReconnecting: false, showReconnectMessage: false }));
    };

    const handleDisconnected = (event: CustomEvent) => {
      dispatch(setConnectionStatus(false));
      const reason = event.detail?.reason;
      dispatch(
        setConnectionInfo({
          lastDisconnectReason: reason,
          showReconnectMessage: reason === 'io server disconnect' || reason === 'ping timeout',
        }),
      );
    };

    const handleMaxReconnectAttempts = () => {
      dispatch(
        setConnectionInfo({
          isReconnecting: false,
          showReconnectMessage: true,
        }),
      );
    };

    // Add connection event listeners
    window.addEventListener('chat:connection_restored', handleConnectionRestored);
    window.addEventListener('chat:disconnected', handleDisconnected as EventListener);
    window.addEventListener('chat:max_reconnect_attempts_reached', handleMaxReconnectAttempts);

    // Update connection status
    const checkConnection = () => {
      const connected = chatService.isSocketConnected();
      const reconnectStatus = chatService.getReconnectionStatus();

      dispatch(setConnectionStatus(connected));
      dispatch(
        setConnectionInfo({
          isReconnecting: reconnectStatus.isReconnecting,
          reconnectAttempts: reconnectStatus.attempts,
        }),
      );
    };

    const interval = setInterval(checkConnection, 5000); // Check every 5 seconds
    checkConnection(); // Check immediately

    return () => {
      unsubscribeNewMessage();
      unsubscribeTypingIndicator();
      unsubscribeMessageRead();
      window.removeEventListener('chat:connection_restored', handleConnectionRestored);
      window.removeEventListener('chat:disconnected', handleDisconnected as EventListener);
      window.removeEventListener('chat:max_reconnect_attempts_reached', handleMaxReconnectAttempts);
      clearInterval(interval);
      chatService.disconnect();
    };
  }, [dispatch, activeConversationId, currentUserId]);

  // Load contacts on mount
  useEffect(() => {
    dispatch(fetchContacts());
  }, [dispatch]);

  // Refresh data when page comes back into focus (regardless of connection status)
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (!document.hidden) {
        // Page is now visible, refresh data and attempt reconnection if needed
        console.log('Page focused - refreshing chat data and checking connection');
        dispatch(setRefreshing(true));

        try {
          // If not connected, try to reconnect
          if (!isConnected) {
            console.log('Not connected on focus - attempting to reconnect');
            chatService.forceReconnect();
          }

          // Always refresh data on focus
          await dispatch(fetchContacts()).unwrap();
          if (activeConversationId) {
            await dispatch(
              fetchMessages({ conversationId: activeConversationId, page: 1 }),
            ).unwrap();
          }
        } catch (error) {
          console.error('Failed to refresh chat data on focus:', error);
        } finally {
          dispatch(setRefreshing(false));
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [dispatch, activeConversationId, isConnected]);

  // Join/leave conversations when active conversation changes
  useEffect(() => {
    if (activeConversationId) {
      console.log('useChat: Joining conversation and fetching messages for:', activeConversationId);
      chatService.joinConversation(activeConversationId);
      // Load messages for the active conversation
      dispatch(fetchMessages({ conversationId: activeConversationId, page: 1 }));
    }

    return () => {
      if (activeConversationId) {
        console.log('useChat: Leaving conversation:', activeConversationId);
        chatService.leaveConversation(activeConversationId);
      }
    };
  }, [activeConversationId, dispatch]);

  // Actions
  const selectConversation = useCallback(
    (conversationId: string) => {
      console.log('useChat: selectConversation called with:', conversationId);
      console.log('useChat: Current active conversation:', activeConversationId);
      dispatch(setActiveConversation(conversationId));
    },
    [dispatch, activeConversationId],
  );

  const sendChatMessage = useCallback(
    async (recipientId: string, content: string) => {
      if (!content.trim()) return;

      try {
        await dispatch(sendMessage({ recipientId, content })).unwrap();
        // Message will be added to the conversation through the fulfilled action
      } catch (error) {
        console.error('Failed to send message:', error);
        throw error;
      }
    },
    [dispatch],
  );

  const loadMoreMessages = useCallback(
    (conversationId: string) => {
      const currentPagination = pagination[conversationId];
      if (!currentPagination?.hasNext || currentPagination.loading) return;

      const nextPage = currentPagination.page + 1;
      dispatch(fetchMessages({ conversationId, page: nextPage }));
    },
    [dispatch, pagination],
  );

  const sendTypingIndicator = useCallback(
    (isTyping: boolean) => {
      if (!activeConversationId) return;

      chatService.sendTypingIndicator(activeConversationId, isTyping);

      // Auto-stop typing indicator after 3 seconds
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
    dispatch(fetchContacts());
  }, [dispatch]);

  const clearChatError = useCallback(
    (errorType: 'contacts' | 'messages' | 'sending') => {
      dispatch(clearError(errorType));
    },
    [dispatch],
  );

  const forceReconnect = useCallback(() => {
    chatService.forceReconnect();
    dispatch(hideReconnectMessage());
  }, [dispatch]);

  const dismissReconnectMessage = useCallback(() => {
    dispatch(hideReconnectMessage());
  }, [dispatch]);

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

  const canLoadMoreMessages = useCallback(
    (conversationId: string) => {
      const paginationInfo = pagination[conversationId];
      return paginationInfo?.hasNext && !paginationInfo.loading;
    },
    [pagination],
  );

  return {
    // State
    contacts,
    activeConversationId,
    activeConversation: getActiveConversation(),
    isConnected,
    unreadCounts,
    loading,
    error,
    totalUnreadCount: getTotalUnreadCount(),
    typingUsers: getTypingUsersForActiveConversation(),
    isRefreshing: loading.refreshing,
    connectionInfo,

    // Actions
    selectConversation,
    sendMessage: sendChatMessage,
    loadMoreMessages,
    sendTypingIndicator,
    refreshContacts,
    clearError: clearChatError,
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
