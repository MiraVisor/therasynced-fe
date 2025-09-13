import api from '@/services/api';
import {
  GetContactsResponse,
  GetMessagesResponse,
  SendMessageData,
  SendMessageResponse,
} from '@/services/chatService';
import { ENDPOINTS } from '@/services/endpoints';

export const getContactsApi = async (): Promise<GetContactsResponse> => {
  const response = await api.get(ENDPOINTS.chat.contacts);
  return response.data;
};

export const sendMessageApi = async (data: SendMessageData): Promise<SendMessageResponse> => {
  const response = await api.post(ENDPOINTS.chat.send, data);
  return response.data;
};

export const getMessagesApi = async (
  conversationId: string,
  page: number = 1,
  limit: number = 50,
): Promise<GetMessagesResponse> => {
  const response = await api.get(
    `${ENDPOINTS.chat.messages}?conversationId=${conversationId}&page=${page}&limit=${limit}`,
  );
  return response.data;
};

export const markMessageAsReadApi = async (messageId: string): Promise<void> => {
  await api.post(ENDPOINTS.chat.markRead(messageId));
};
