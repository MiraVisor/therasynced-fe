'use client';

import { useState } from 'react';

import { useMediaQuery } from '@/hooks/use-media-query';
import useChat from '@/hooks/useChat';
import { cn } from '@/lib/utils';

import ChatContactList from './ChatContactList';
import ChatHeader from './ChatHeader';
import ChatMessageInput from './ChatMessageInput';
import ChatMessageList from './ChatMessageList';

interface ChatContainerProps {
  className?: string;
  currentUserId?: string;
}

const ChatContainer: React.FC<ChatContainerProps> = ({ className, currentUserId }) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [showChat, setShowChat] = useState(false);
  const [hasAutoSelected, setHasAutoSelected] = useState(false);

  const {
    contacts,
    activeConversationId,
    activeConversation,
    isConnected,
    loading,
    error,
    typingUsers,
    isRefreshing,
    connectionInfo,
    selectConversation,
    sendMessage,
    loadMoreMessages,
    sendTypingIndicator,
    getContactByConversationId,
    canLoadMoreMessages,
    forceReconnect,
    dismissReconnectMessage,
  } = useChat(currentUserId);

  const activeContact = activeConversationId
    ? getContactByConversationId(activeConversationId)
    : null;

  const handleContactSelect = (contact: { id: string; name: string; [key: string]: unknown }) => {
    console.log('Contact selected:', contact);
    console.log('Conversation ID:', contact.conversationId);

    // Toggle functionality: if clicking the same contact, close the chat
    if (activeConversationId === contact.conversationId) {
      console.log('Same contact clicked - closing chat');
      selectConversation('');
      if (isMobile) {
        setShowChat(false);
      }
    } else {
      // Different contact selected - open/switch to new conversation
      console.log('Different contact clicked - opening chat');
      selectConversation(contact.conversationId);
      if (isMobile) {
        setShowChat(true);
      }
    }
  };

  const handleBackToContacts = () => {
    setShowChat(false);
    selectConversation('');
  };

  const handleSendMessage = async (content: string) => {
    if (!activeContact) return;

    try {
      await sendMessage(activeContact.id, content);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Could show a toast notification here
    }
  };

  const handleLoadMoreMessages = () => {
    if (activeConversationId && canLoadMoreMessages(activeConversationId)) {
      loadMoreMessages(activeConversationId);
    }
  };

  // // Auto-select first contact on desktop if none selected (only on initial load)
  // useEffect(() => {
  //   if (!isMobile && contacts.length > 0 && !activeConversationId && !hasAutoSelected) {
  //     // Only auto-select once when contacts first become available
  //     selectConversation(contacts[0].conversationId);
  //     setHasAutoSelected(true);
  //   }
  // }, [contacts, activeConversationId, isMobile, selectConversation, hasAutoSelected]);

  return (
    <div className={cn('flex h-full rounded-lg overflow-hidden', className)}>
      {/* Contact List - Hidden on mobile when chat is showing */}
      <div
        className={cn(
          'w-full md:w-80 md:max-w-80 border-r border-gray-200 overflow-hidden',
          isMobile && showChat && 'hidden',
        )}
      >
        <ChatContactList
          contacts={contacts}
          activeConversationId={activeConversationId}
          onContactSelect={handleContactSelect}
          loading={loading.contacts}
        />
      </div>

      {/* Chat Area - Hidden on mobile when contact list is showing */}
      <div className={cn('flex-1 flex flex-col', isMobile && !showChat && 'hidden')}>
        {activeContact ? (
          <>
            {/* Chat Header */}
            <ChatHeader
              contact={activeContact}
              isConnected={isConnected}
              typingUsers={typingUsers}
              onBack={handleBackToContacts}
              showBackButton={isMobile}
            />

            {/* Messages */}
            <ChatMessageList
              messages={activeConversation || []}
              currentUserId={currentUserId}
              loading={loading.messages}
              canLoadMore={canLoadMoreMessages(activeConversationId || '')}
              onLoadMore={handleLoadMoreMessages}
              className="flex-1"
            />

            {/* Message Input */}
            <ChatMessageInput
              onSendMessage={handleSendMessage}
              onTypingStart={() => sendTypingIndicator(true)}
              onTypingStop={() => sendTypingIndicator(false)}
              disabled={!isConnected}
              loading={loading.sending}
              placeholder={!isConnected ? 'Connecting...' : `Message ${activeContact.name}...`}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center text-gray-500">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
              <p className="text-gray-500 max-w-sm">
                Choose a contact from the list to start messaging
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Connection Status - Only show when there's an actual problem that needs user attention */}
      {connectionInfo.showReconnectMessage && (
        <div className="absolute top-0 left-0 right-0 bg-amber-500 text-white text-sm py-2 px-4 z-10 flex items-center justify-between">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>Connection lost. Messages may not be delivered.</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={forceReconnect}
              className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-sm transition-colors"
            >
              Retry
            </button>
            <button
              onClick={dismissReconnectMessage}
              className="bg-white/20 hover:bg-white/30 p-1 rounded transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Quiet Refreshing Indicator - Small and unobtrusive */}
      {isRefreshing && (
        <div className="absolute top-2 right-2 z-10">
          <div className="bg-black/50 text-white text-xs px-2 py-1 rounded-full flex items-center">
            <svg
              className="animate-spin -ml-1 mr-1 h-3 w-3 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Syncing
          </div>
        </div>
      )}

      {/* Error Display */}
      {(error.contacts || error.messages || error.sending) && (
        <div className="absolute bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-sm z-10">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">
            {error.contacts || error.messages || error.sending || 'An error occurred'}
          </span>
        </div>
      )}
    </div>
  );
};

export default ChatContainer;
