import { useCallback } from 'react';

// Global socket instance (shared with ChatProvider)
declare global {
  interface Window {
    globalChatSocket: any;
  }
}

export const useChatSocket = () => {
  const joinConversation = useCallback((conversationId: string) => {
    if ((global as any).globalChatSocket) {
      (global as any).globalChatSocket.emit('join_conversation', { conversationId });
    }
  }, []);

  const leaveConversation = useCallback((conversationId: string) => {
    if ((global as any).globalChatSocket) {
      (global as any).globalChatSocket.emit('leave_conversation', { conversationId });
    }
  }, []);

  return {
    joinConversation,
    leaveConversation,
  };
};
