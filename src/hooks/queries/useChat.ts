import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import chatService, { ChatMessage } from '@/services/chatService';
import { ChatContactState, useChatStore } from '@/stores/chatStore';

/**
 * Hook to fetch chat contacts
 */
export const useChatContacts = () => {
  const { setContacts, setArchivedContacts } = useChatStore();

  return useQuery({
    queryKey: ['chat', 'contacts'],
    queryFn: async () => {
      const response = await chatService.getContacts();
      return response.data;
    },
    select: (data) => {
      const contacts = (data.contacts || []) as ChatContactState[];
      const archived = (data.archivedContacts || []) as ChatContactState[];

      // Update Zustand store
      setContacts(contacts);
      setArchivedContacts(archived);

      return { contacts, archived };
    },
  });
};

/**
 * Hook to fetch messages for a conversation
 */
export const useChatMessages = (
  conversationId: string | null,
  page: number = 1,
  limit: number = 50,
) => {
  const { setMessages, prependMessages } = useChatStore();

  return useQuery({
    queryKey: ['chat', 'messages', conversationId, page],
    queryFn: async () => {
      const response = await chatService.getMessages(conversationId!, page, limit);
      return response;
    },
    enabled: !!conversationId,
    select: (data) => {
      const messages = data.data as ChatMessage[];

      // Update Zustand store
      if (page === 1) {
        setMessages(conversationId!, messages);
      } else {
        prependMessages(conversationId!, messages);
      }

      return {
        messages,
        pagination: data.pagination,
      };
    },
  });
};

/**
 * Hook to send a message
 */
export const useSendMessage = () => {
  const queryClient = useQueryClient();
  const { addMessage, updateContact } = useChatStore();

  return useMutation({
    mutationFn: (data: { recipientId: string; content: string }) => chatService.sendMessage(data),
    onSuccess: (response, variables) => {
      const message = response.data as ChatMessage;

      // Add message to Zustand store
      if (message.conversationId) {
        addMessage(message.conversationId, message);
      }

      // Update contact's last message
      const contact = useChatStore
        .getState()
        .contacts.find(
          (c) => c.id === variables.recipientId || c.conversationId === message.conversationId,
        );
      if (contact) {
        updateContact(contact.id, {
          lastMessage: {
            content: message.content,
            createdAt: message.createdAt,
            isFromMe: true,
            isRead: false,
          },
        });
      }

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['chat', 'messages'] });
      queryClient.invalidateQueries({ queryKey: ['chat', 'contacts'] });
    },
  });
};

/**
 * Hook to mark messages as read
 */
export const useMarkMessagesAsRead = () => {
  const queryClient = useQueryClient();
  const { clearUnreadCount, updateMessage } = useChatStore();

  return useMutation({
    mutationFn: (conversationId: string) => chatService.markAsRead(conversationId),
    onSuccess: (_, conversationId) => {
      // Clear unread count in Zustand
      clearUnreadCount(conversationId);

      // Mark all messages as read in store
      const messages = useChatStore.getState().conversations[conversationId] || [];
      messages.forEach((msg) => {
        if (!msg.isRead) {
          updateMessage(conversationId, msg.id, { isRead: true });
        }
      });

      queryClient.invalidateQueries({ queryKey: ['chat', 'messages', conversationId] });
    },
  });
};

/**
 * Hook to manage chat connection and WebSocket events
 */
export const useChatConnection = () => {
  const {
    setConnectionStatus,
    setConnectionInfo,
    addMessage,
    updateContact,
    incrementUnreadCount,
    setTypingUsers,
    removeTypingUser,
    setConversationContext,
  } = useChatStore();

  useEffect(() => {
    // Connect to chat service
    chatService.connect();

    // Set up event listeners
    const unsubscribeNewMessage = chatService.onNewMessage((message: ChatMessage) => {
      if (message.conversationId) {
        addMessage(message.conversationId, message);

        // Update contact's last message
        const contact = useChatStore
          .getState()
          .contacts.find((c) => c.conversationId === message.conversationId);
        if (contact) {
          updateContact(contact.id, {
            lastMessage: {
              content: message.content,
              createdAt: message.createdAt,
              isFromMe: false,
              isRead: false,
            },
          });

          // Increment unread if not active conversation
          const activeId = useChatStore.getState().activeConversationId;
          if (activeId !== message.conversationId) {
            incrementUnreadCount(message.conversationId);
          }
        }
      }
    });

    const unsubscribeTypingIndicator = chatService.onTypingIndicator(({ userId, isTyping }) => {
      const activeId = useChatStore.getState().activeConversationId;
      if (activeId) {
        if (isTyping) {
          setTypingUsers(activeId, [
            ...(useChatStore.getState().typingUsers[activeId] || []),
            userId,
          ]);
        } else {
          removeTypingUser(activeId, userId);
        }
      }
    });

    const unsubscribeMessageRead = chatService.onMessageRead(({ messageId }) => {
      const activeId = useChatStore.getState().activeConversationId;
      if (activeId) {
        const messages = useChatStore.getState().conversations[activeId] || [];
        const message = messages.find((m) => m.id === messageId);
        if (message) {
          useChatStore.getState().updateMessage(activeId, messageId, { isRead: true });
        }
      }
    });

    // Connection event handlers
    const handleConnectionRestored = () => {
      setConnectionStatus(true);
      setConnectionInfo({ isReconnecting: false, showReconnectMessage: false });
    };

    const handleDisconnected = (event: CustomEvent) => {
      setConnectionStatus(false);
      const reason = event.detail?.reason;
      setConnectionInfo({
        lastDisconnectReason: reason,
        showReconnectMessage: reason === 'io server disconnect' || reason === 'ping timeout',
      });
    };

    const handleMaxReconnectAttempts = () => {
      setConnectionInfo({
        isReconnecting: false,
        showReconnectMessage: true,
      });
    };

    window.addEventListener('chat:connection_restored', handleConnectionRestored);
    window.addEventListener('chat:disconnected', handleDisconnected as EventListener);
    window.addEventListener('chat:max_reconnect_attempts', handleMaxReconnectAttempts);

    // Check initial connection status
    setConnectionStatus(chatService.isConnected());

    return () => {
      unsubscribeNewMessage();
      unsubscribeTypingIndicator();
      unsubscribeMessageRead();
      window.removeEventListener('chat:connection_restored', handleConnectionRestored);
      window.removeEventListener('chat:disconnected', handleDisconnected as EventListener);
      window.removeEventListener('chat:max_reconnect_attempts', handleMaxReconnectAttempts);
    };
  }, [
    setConnectionStatus,
    setConnectionInfo,
    addMessage,
    updateContact,
    incrementUnreadCount,
    setTypingUsers,
    removeTypingUser,
  ]);

  return {
    isConnected: useChatStore((state) => state.isConnected),
    connectionInfo: useChatStore((state) => state.connectionInfo),
  };
};
