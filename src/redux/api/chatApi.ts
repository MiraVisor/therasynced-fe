import api from '@/services/api';

// 1. Get all booked freelancers for the patient (chat contacts)
export const getBookedFreelancers = async () => {
  const response = await api.get('/freelancer/all');
  return response.data;
};

// 2. Get or create chat thread for patient and freelancer
export const getOrCreateChatThread = async (freelancerId: string) => {
  const response = await api.post('/chat/thread', { freelancerId });
  return response.data;
};

// 3. Get chat history for a thread
export const getChatHistory = async (threadId: string) => {
  const response = await api.get(`/chat/history?threadId=${threadId}`);
  return response.data;
};

// 4. (WebSocket logic will be handled in the component or a separate util)
