'use client';

import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { io } from 'socket.io-client';

import { getCookie, getDecodedToken } from '@/lib/utils';
import { addMessage, fetchChatContacts, updateContactLastMessage } from '@/redux/slices/chatSlice';

interface ChatProviderProps {
  children: React.ReactNode;
}

// Global socket instance
let globalSocket: any = null;
let isInitialized = false;

export const ChatProvider = ({ children }: ChatProviderProps) => {
  const dispatch = useDispatch();
  const dispatchRef = useRef(dispatch);

  // Keep dispatch ref updated
  useEffect(() => {
    dispatchRef.current = dispatch;
  }, [dispatch]);

  useEffect(() => {
    const token = getCookie('token');
    if (!token) return;

    // Initialize socket only once
    if (!isInitialized) {
      globalSocket = io(`${process.env.NEXT_PUBLIC_BACKEND_URL?.replace('/api/v1', '')}/chat`, {
        auth: {
          token,
        },
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      // Set global socket for useChatSocket hook
      (global as any).globalChatSocket = globalSocket;
      isInitialized = true;

      // Handle new messages
      globalSocket.on('new_message', (message: any) => {
        console.log('Received new message:', message);

        // Get current user ID to check if message is from current user
        const decodedToken = getDecodedToken();
        const currentUserId = decodedToken?.id;

        // Only add message if it's from another user (not from current user)
        if (message.sender.id !== currentUserId) {
          dispatchRef.current(
            addMessage({
              conversationId: message.conversationId,
              message: {
                id: message.id,
                content: message.content,
                createdAt: message.createdAt,
                isRead: message.isRead,
                sender: message.sender,
              },
            }),
          );

          // Update contact's last message and unread count
          dispatchRef.current(
            updateContactLastMessage({
              contactId: message.sender.id,
              message: {
                content: message.content,
                createdAt: message.createdAt,
                isFromMe: false,
                isRead: message.isRead,
              },
            }),
          );
        }
      });

      // Handle connection events
      globalSocket.on('connect', () => {
        console.log('Connected to chat socket globally');
        // Load chat contacts when connected
        dispatchRef.current(fetchChatContacts() as any);
      });

      globalSocket.on('disconnect', () => {
        console.log('Disconnected from chat socket globally');
      });

      globalSocket.on('connect_error', (error: any) => {
        console.error('Chat socket connection error:', error);
      });

      globalSocket.on('reconnect', () => {
        console.log('Reconnected to chat socket globally');
        // Reload chat contacts when reconnected
        dispatchRef.current(fetchChatContacts() as any);
      });
    }

    return () => {
      // Don't disconnect the global socket here as it's used by other components
    };
  }, []); // Empty dependency array to run only once

  return <div>{children}</div>;
};
