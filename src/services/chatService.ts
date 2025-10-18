import { Socket, io } from 'socket.io-client';

import { getCookie } from '@/lib/utils';

import api from './api';

// Types for chat functionality
export interface ChatContact {
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
  };
  isOnline?: boolean;
}

export interface ChatMessage {
  id: string;
  content: string;
  createdAt: string;
  isRead: boolean;
  users: {
    id: string;
    name: string;
    profilePicture: string;
  };
  conversationId: string;
}

export interface SendMessageData {
  recipientId: string;
  content: string;
}

export interface SendMessageResponse {
  success: boolean;
  message: string;
  data: ChatMessage;
}

export interface GetContactsResponse {
  success: boolean;
  data: ChatContact[];
}

export interface GetMessagesResponse {
  success: boolean;
  data: ChatMessage[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
  };
}

class ChatService {
  private socket: Socket | null = null;
  private isConnected = false;
  private isInitialized = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000;
  private isReconnecting = false;
  private currentConversationId: string | null = null;

  constructor() {
    // Initialize socket connection when service is created
    this.initializeSocket();
  }

  private initializeSocket() {
    if (this.isInitialized) return;

    const token = getCookie('token');
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    if (!backendUrl) {
      console.error('ChatService: NEXT_PUBLIC_BACKEND_URL is not defined');
      return;
    }

    if (!token) {
      console.warn('ChatService: No authentication token found');
      return;
    }

    // Extract the base domain from the API URL
    let baseUrl: string;
    if (backendUrl.includes('/api/v1')) {
      baseUrl = backendUrl.split('/api/v1')[0];
    } else {
      baseUrl = backendUrl;
    }

    // Convert HTTP URL to WebSocket URL
    let socketUrl: string;
    if (baseUrl.startsWith('https://')) {
      socketUrl = baseUrl.replace('https://', 'wss://');
    } else if (baseUrl.startsWith('http://')) {
      socketUrl = baseUrl.replace('http://', 'ws://');
    } else {
      socketUrl = `wss://${baseUrl}`;
    }

    // Connect to the /chat namespace
    const chatSocketUrl = `${socketUrl}/chat`;
    console.log('ChatService: Connecting to chat namespace:', chatSocketUrl);

    this.socket = io(chatSocketUrl, {
      auth: {
        token: token,
      },
      transports: ['websocket', 'polling'],
      autoConnect: false,
      timeout: 20000,
      forceNew: true,
    });

    this.setupEventListeners();
    this.isInitialized = true;
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('ChatService: Connected to chat socket, ID:', this.socket?.id);
      this.isConnected = true;
      this.reconnectAttempts = 0;

      // Dispatch connection event for UI updates
      window.dispatchEvent(new CustomEvent('chat:connection_restored'));
    });

    this.socket.on('disconnect', (reason) => {
      console.log('ChatService: Disconnected from chat socket, reason:', reason);
      this.isConnected = false;

      // Dispatch disconnect event for UI updates
      window.dispatchEvent(new CustomEvent('chat:disconnected', { detail: { reason } }));

      // Only attempt automatic reconnection for certain reasons
      if (reason === 'io server disconnect' || reason === 'ping timeout') {
        this.attemptReconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('ChatService: Connection error:', error);
      this.isConnected = false;

      // Only attempt reconnect if not already in the process
      if (!this.isReconnecting) {
        this.attemptReconnect();
      }
    });

    // Listen for incoming messages
    this.socket.on('new_message', (message: ChatMessage) => {
      console.log('ChatService: New message received:', message);
      window.dispatchEvent(new CustomEvent('chat:new_message', { detail: message }));
    });

    // Listen for typing indicators
    this.socket.on('typing_indicator', (data: { userId: string; isTyping: boolean }) => {
      console.log('ChatService: Typing indicator:', data);
      window.dispatchEvent(new CustomEvent('chat:typing_indicator', { detail: data }));
    });

    // Listen for message read receipts
    this.socket.on('message_read', (data: { messageId: string; userId: string }) => {
      console.log('ChatService: Message read:', data);
      window.dispatchEvent(new CustomEvent('chat:message_read', { detail: data }));
    });

    // Listen for conversation join confirmations
    this.socket.on('conversation_joined', (data: { conversationId: string }) => {
      console.log('ChatService: Joined conversation:', data);
      window.dispatchEvent(new CustomEvent('chat:conversation_joined', { detail: data }));
    });

    // Listen for conversation leave confirmations
    this.socket.on('conversation_left', (data: { conversationId: string }) => {
      console.log('ChatService: Left conversation:', data);
      window.dispatchEvent(new CustomEvent('chat:conversation_left', { detail: data }));
    });
  }

  private attemptReconnect() {
    if (this.isReconnecting || this.reconnectAttempts >= this.maxReconnectAttempts) {
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('ChatService: Max reconnection attempts reached');
        window.dispatchEvent(new CustomEvent('chat:max_reconnect_attempts_reached'));
      }
      return;
    }

    this.isReconnecting = true;
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts), 30000); // Max 30 seconds

    console.log(
      `ChatService: Attempting silent reconnect ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts} in ${delay}ms`,
    );

    setTimeout(() => {
      this.reconnectAttempts++;
      this.socket?.connect();
      this.isReconnecting = false;
    }, delay);
  }

  // WebSocket Methods
  public connect() {
    console.log('ChatService: connect() called');

    if (!this.isInitialized) {
      this.initializeSocket();
    }

    if (!this.socket) {
      console.error('ChatService: Socket not initialized');
      return;
    }

    if (!this.isConnected) {
      console.log('ChatService: Attempting to connect...');
      this.socket.connect();
    } else {
      console.log('ChatService: Already connected');
    }
  }

  public disconnect() {
    console.log('ChatService: disconnect() called');

    if (this.socket) {
      this.socket.disconnect();
      this.isConnected = false;
      this.isInitialized = false;
    }
  }

  public joinConversation(conversationId: string) {
    if (this.socket && this.isConnected) {
      console.log(`ChatService: Joining conversation: ${conversationId}`);
      this.currentConversationId = conversationId;
      this.socket.emit('join_conversation', { conversationId });
    } else {
      console.warn(
        `ChatService: Cannot join conversation ${conversationId} - socket not connected`,
      );
    }
  }

  public leaveConversation(conversationId: string) {
    if (this.socket && this.isConnected) {
      console.log(`ChatService: Leaving conversation: ${conversationId}`);
      this.socket.emit('leave_conversation', { conversationId });
      if (this.currentConversationId === conversationId) {
        this.currentConversationId = null;
      }
    } else {
      console.warn(
        `ChatService: Cannot leave conversation ${conversationId} - socket not connected`,
      );
    }
  }

  public sendTypingIndicator(conversationId: string, isTyping: boolean) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing_indicator', { conversationId, isTyping });
    }
  }

  // REST API Methods
  public async getContacts(): Promise<GetContactsResponse> {
    try {
      const response = await api.get('/chat/contacts');
      return response.data;
    } catch (error) {
      console.error('ChatService: Error fetching contacts:', error);
      throw error;
    }
  }

  public async sendMessage(data: SendMessageData): Promise<SendMessageResponse> {
    try {
      const response = await api.post('/chat/send', data);
      return response.data;
    } catch (error) {
      console.error('ChatService: Error sending message:', error);
      throw error;
    }
  }

  public async getMessages(
    conversationId: string,
    page: number = 1,
    limit: number = 50,
  ): Promise<GetMessagesResponse> {
    try {
      const response = await api.get(
        `/chat/messages?conversationId=${conversationId}&page=${page}&limit=${limit}`,
      );
      return response.data;
    } catch (error) {
      console.error('ChatService: Error fetching messages:', error);
      throw error;
    }
  }

  public async markMessageAsRead(messageId: string): Promise<void> {
    try {
      await api.post(`/chat/messages/${messageId}/read`);
    } catch (error) {
      console.error('ChatService: Error marking message as read:', error);
      throw error;
    }
  }

  // Event Listener Helpers
  public onNewMessage(callback: (message: ChatMessage) => void) {
    const handler = (event: CustomEvent) => callback(event.detail);
    window.addEventListener('chat:new_message', handler as EventListener);
    return () => window.removeEventListener('chat:new_message', handler as EventListener);
  }

  public onTypingIndicator(callback: (data: { userId: string; isTyping: boolean }) => void) {
    const handler = (event: CustomEvent) => callback(event.detail);
    window.addEventListener('chat:typing_indicator', handler as EventListener);
    return () => window.removeEventListener('chat:typing_indicator', handler as EventListener);
  }

  public onMessageRead(callback: (data: { messageId: string; userId: string }) => void) {
    const handler = (event: CustomEvent) => callback(event.detail);
    window.addEventListener('chat:message_read', handler as EventListener);
    return () => window.removeEventListener('chat:message_read', handler as EventListener);
  }

  public onConversationJoined(callback: (data: { conversationId: string }) => void) {
    const handler = (event: CustomEvent) => callback(event.detail);
    window.addEventListener('chat:conversation_joined', handler as EventListener);
    return () => window.removeEventListener('chat:conversation_joined', handler as EventListener);
  }

  public onConversationLeft(callback: (data: { conversationId: string }) => void) {
    const handler = (event: CustomEvent) => callback(event.detail);
    window.addEventListener('chat:conversation_left', handler as EventListener);
    return () => window.removeEventListener('chat:conversation_left', handler as EventListener);
  }

  // Utility Methods
  public isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  public getCurrentConversationId(): string | null {
    return this.currentConversationId;
  }

  public getConnectionStatus() {
    return {
      connected: this.isConnected,
      socketConnected: this.socket?.connected,
      socketId: this.socket?.id,
      reconnectAttempts: this.reconnectAttempts,
      isInitialized: this.isInitialized,
      currentConversation: this.currentConversationId,
      hasToken: !!getCookie('token'),
    };
  }

  // Force reconnection (resets attempt counter)
  public forceReconnect() {
    console.log('ChatService: Force reconnecting...');
    this.reconnectAttempts = 0;
    this.isReconnecting = false;
    this.disconnect();
    setTimeout(() => {
      this.connect();
    }, 1000);
  }

  // Get reconnection status
  public getReconnectionStatus() {
    return {
      isReconnecting: this.isReconnecting,
      attempts: this.reconnectAttempts,
      maxAttempts: this.maxReconnectAttempts,
    };
  }
}

// Create a singleton instance
const chatService = new ChatService();

export default chatService;
