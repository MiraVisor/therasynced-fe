'use client';

import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import useChat from '@/hooks/useChat';
import chatService from '@/services/chatService';

const ChatDebug = () => {
  const [connectionStatus, setConnectionStatus] = useState<any>(null);

  const {
    contacts,
    activeConversationId,
    activeConversation,
    isConnected,
    loading,
    error,
    totalUnreadCount,
    typingUsers,
    selectConversation,
    refreshContacts,
  } = useChat();

  // Test backend connectivity
  const testBackendApi = async () => {
    try {
      console.log('Testing backend API connectivity...');
      const response = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + '/chat/contacts', {
        headers: {
          Authorization: `Bearer ${document.cookie.split('token=')[1]?.split(';')[0] || ''}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('Backend response status:', response.status);
      const data = await response.json();
      console.log('Backend response data:', data);
    } catch (error) {
      console.error('Backend API test failed:', error);
    }
  };

  useEffect(() => {
    const updateStatus = () => {
      setConnectionStatus(chatService.getConnectionStatus());
    };

    updateStatus();
    const interval = setInterval(updateStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  const testConnection = () => {
    chatService.connect();
  };

  const testDisconnection = () => {
    chatService.disconnect();
  };

  const testForceReconnect = () => {
    chatService.forceReconnect();
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Chat System Debug</h1>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle>Connection Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Connected:</span>
              <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
                {isConnected ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Socket ID:</span>
              <span className="font-mono text-sm">{connectionStatus?.socketId || 'None'}</span>
            </div>
            <div className="flex justify-between">
              <span>Has Token:</span>
              <span className={connectionStatus?.hasToken ? 'text-green-600' : 'text-red-600'}>
                {connectionStatus?.hasToken ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Reconnect Attempts:</span>
              <span>{connectionStatus?.reconnectAttempts || 0}</span>
            </div>
          </div>

          <div className="mt-4 flex gap-2 flex-wrap">
            <Button onClick={testConnection} size="sm">
              Connect
            </Button>
            <Button onClick={testDisconnection} variant="outline" size="sm">
              Disconnect
            </Button>
            <Button onClick={testForceReconnect} variant="destructive" size="sm">
              Force Reconnect
            </Button>
            <Button onClick={testBackendApi} variant="secondary" size="sm">
              Test API
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contacts */}
      <Card>
        <CardHeader>
          <CardTitle>Contacts ({contacts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Loading:</span>
              <span>{loading.contacts ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex justify-between">
              <span>Error:</span>
              <span className="text-red-600">{error.contacts || 'None'}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Unread:</span>
              <span className="font-bold">{totalUnreadCount}</span>
            </div>
          </div>

          <div className="mt-4">
            <Button onClick={refreshContacts} size="sm">
              Refresh Contacts
            </Button>
          </div>

          {contacts.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Contact List:</h4>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className={`p-2 rounded border cursor-pointer ${
                      activeConversationId === contact.conversationId
                        ? 'bg-blue-50 border-blue-200'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => selectConversation(contact.conversationId)}
                  >
                    <div className="flex justify-between">
                      <span className="font-medium">{contact.name}</span>
                      {contact.unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          {contact.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 truncate">
                      {contact.lastMessage?.content || 'No messages'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Conversation */}
      {activeConversationId && (
        <Card>
          <CardHeader>
            <CardTitle>Active Conversation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Conversation ID:</span>
                <span className="font-mono text-sm">{activeConversationId}</span>
              </div>
              <div className="flex justify-between">
                <span>Messages:</span>
                <span>{activeConversation?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Loading Messages:</span>
                <span>{loading.messages ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between">
                <span>Typing Users:</span>
                <span>{typingUsers.length}</span>
              </div>
            </div>

            {activeConversation && activeConversation.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Recent Messages:</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {activeConversation.slice(-5).map((message) => (
                    <div key={message.id} className="p-2 bg-gray-50 rounded">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{message.sender.name}</span>
                        <span className="text-gray-500">
                          {new Date(message.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-sm mt-1">{message.content}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* API Endpoints */}
      <Card>
        <CardHeader>
          <CardTitle>API Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Backend URL:</span>
              <span className="font-mono text-sm">{process.env.NEXT_PUBLIC_BACKEND_URL}</span>
            </div>
            <div className="flex justify-between">
              <span>Socket URL:</span>
              <span className="font-mono text-sm">{connectionStatus?.socketUrl}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatDebug;
