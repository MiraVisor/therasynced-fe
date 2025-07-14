import { Socket, io } from 'socket.io-client';

import { getCookie } from '@/lib/utils';

let socket: Socket | null = null;

export function connectChatSocket() {
  if (!socket) {
    const token = getCookie('token');
    console.log('Connecting to chat socket with token:', token);
    socket = io(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'ws://localhost:4000'}`, {
      path: '/socket.io', // <-- FIXED: use default path
      forceNew: true,
      //   transports: ['polling'],
      reconnectionAttempts: 3,
      timeout: 2000,
      auth: { token: token },
    });
    socket.on('connect', () => {
      console.log('Chat socket connected');
    });
  }
  return socket;
}

export function disconnectChatSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function getChatSocket() {
  return socket;
}
