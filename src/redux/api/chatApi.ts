import api from '@/services/api';

export interface ChatContact {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
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
    createdAt: string;
  };
}

export interface Message {
  id: string;
  content: string;
  createdAt: string;
  isRead: boolean;
  users: {
    id: string;
    name: string;
    profilePicture?: string;
  };
}

export interface SendMessageData {
  recipientId: string;
  content: string;
}

export interface GetMessagesData {
  conversationId: string;
  page?: number;
  limit?: number;
}

export const getChatContactsApi = async (): Promise<ChatContact[]> => {
  const response = await api.get('/chat/contacts');
  return response.data.data;
};

export const sendMessageApi = async (data: SendMessageData): Promise<Message> => {
  const response = await api.post('/chat/send', data);
  return response.data.data;
};

export const getMessagesApi = async (data: GetMessagesData): Promise<Message[]> => {
  const response = await api.get('/chat/messages', { params: data });
  return response.data.data;
};
