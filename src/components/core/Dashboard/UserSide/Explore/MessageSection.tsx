import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import DotLoader from '@/components/common/DotLoader';
import { getDecodedToken } from '@/lib/utils';
import { fetchChatContacts, fetchChatHistory, fetchChatThread } from '@/redux/slices/chatSlice';
import { RootState } from '@/redux/store';
import { connectChatSocket, disconnectChatSocket } from '@/services/chatSocket';

export const MessageSection = () => {
  const dispatch = useDispatch();
  const { contacts, contactsLoading, thread, threadLoading, messages, messagesLoading } =
    useSelector((state: RootState) => state.chat);
  const [activeContact, setActiveContact] = useState<any>(null);
  const [currentMessage, setCurrentMessage] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [socket, setSocket] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [pendingMessages, setPendingMessages] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch contacts on mount
  useEffect(() => {
    dispatch(fetchChatContacts() as any);
  }, [dispatch]);

  // Connect/disconnect socket on mount/unmount
  useEffect(() => {
    const s = connectChatSocket();
    setSocket(s);
    return () => {
      disconnectChatSocket();
    };
  }, []);

  // Join thread room when thread changes
  useEffect(() => {
    if (socket && thread?.data?.id) {
      socket.emit('joinThread', { threadId: thread?.data?.id });
    }
  }, [socket, thread?.data?.id]);

  // Listen for newMessage events
  useEffect(() => {
    if (!socket) return;
    const handleNewMessage = (msg: any) => {
      // Remove pending message if it matches content, sender, and close timestamp
      setPendingMessages((prev) =>
        prev.filter(
          (pm) =>
            !(
              pm.content === msg.content &&
              pm.senderId === msg.senderId &&
              Math.abs(new Date(pm.createdAt).getTime() - new Date(msg.createdAt).getTime()) < 60000
            ),
        ),
      );
      dispatch({ type: 'chat/addMessage', payload: msg });
    };
    socket.on('newMessage', handleNewMessage);
    return () => {
      socket.off('newMessage', handleNewMessage);
    };
  }, [socket, dispatch]);

  // Get userId from JWT on mount
  useEffect(() => {
    const decoded = getDecodedToken();
    setUserId(decoded?.sub || null);
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handle contact selection
  const handleContactClick = useCallback(
    async (contact: any) => {
      setActiveContact(contact);
      const threadRes = await dispatch(fetchChatThread(contact.id) as any).unwrap();
      if (threadRes?.data?.id) {
        dispatch(fetchChatHistory(threadRes?.data?.id) as any);
      }
      setShowChat(true);
    },
    [dispatch],
  );

  // Handle message send
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMessage.trim()) return;
    if (!thread?.data?.id || !socket) {
      toast.error('Message not sent');
      return;
    }
    const tempId = `temp-${Date.now()}`;
    const pendingMsg = {
      tempId,
      id: tempId,
      threadId: thread.data.id,
      senderId: userId,
      content: currentMessage,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };
    setPendingMessages((prev) => [...prev, pendingMsg]);
    socket.emit(
      'sendMessage',
      { threadId: thread.data.id, senderId: userId, content: currentMessage },
      () => {
        setCurrentMessage('');
      },
    );
  };

  const userAvatar = 'https://randomuser.me/api/portraits/men/1.jpg';

  const allMessages = [...messages, ...pendingMessages];

  return (
    <div
      className="w-full h-[75vh] flex bg-card rounded-xl overflow-hidden"
      style={{ fontSize: '0.8em' }}
    >
      {/* Sidebar */}
      <aside className="flex flex-col min-w-[208px] max-w-[256px] w-full h-[80vh] bg-card border-r border-border">
        <div className="px-4 py-4 border-b border-border text-lg font-semibold text-foreground sticky top-0 bg-card z-10">
          Messages
        </div>
        <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 72px)' }}>
          {/* Contact list only, do not show selected contact under heading */}
          {contactsLoading ? (
            <div className="p-4 text-center flex justify-center items-center">
              <DotLoader size={14} />
            </div>
          ) : contacts.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">No contacts found</div>
          ) : (
            contacts.map((contact: any) => (
              <button
                key={contact.id}
                onClick={() => handleContactClick(contact)}
                className={`w-full flex items-center gap-3 px-4 py-3 border-b border-border text-left hover:bg-muted transition ${activeContact?.id === contact.id ? 'bg-muted mt-8' : ''}`}
              >
                <img
                  src={contact.profilePicture}
                  alt={contact.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex flex-col flex-1">
                  <span className="font-medium text-base text-foreground">{contact.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {contact.cardInfo?.mainService || ''}
                  </span>
                  <span className="text-xs text-muted-foreground truncate">
                    {contact.slotSummary?.lastMessage || ''}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>
      {/* Chat Area */}
      <main className="flex-1 flex flex-col h-[80vh] min-w-0 bg-card">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-card sticky top-0 z-20 min-h-[72px]">
          {activeContact ? (
            <>
              <img
                src={activeContact.profilePicture}
                alt={activeContact.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex flex-col">
                <span className="font-semibold text-lg text-foreground">{activeContact.name}</span>
                <span className="text-xs text-muted-foreground">
                  {activeContact.cardInfo?.mainService || ''}
                </span>
              </div>
            </>
          ) : (
            <div className="w-full flex flex-col items-center justify-center">
              <div className="text-3xl font-bold text-foreground mb-2">Start a Conversation</div>
              <div className="text-muted-foreground mb-6">
                Select a contact from the left to begin chatting.
              </div>
              <svg
                width="64"
                height="64"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="mx-auto text-primary mb-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 01-4-.8l-4 1 1-3.5A7.963 7.963 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
          )}
        </div>
        {/* Messages */}
        <div
          className="flex-1 px-3 py-1 bg-card overflow-y-auto"
          style={{ maxHeight: 'calc(80vh - 72px - 64px)' }}
        >
          {activeContact &&
            (messagesLoading ? (
              <div className="p-4 text-center flex justify-center items-center">
                <DotLoader size={14} />
              </div>
            ) : messages.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                No messages yet. Say hello!
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {allMessages
                  .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                  .map((msg: any, idx: number, arr: any[]) => {
                    const showDateSeparator =
                      idx === 0 ||
                      msg.createdAt?.split('T')[0] !== arr[idx - 1]?.createdAt?.split('T')[0];
                    const isOwn = msg.senderId !== activeContact.id;
                    return (
                      <React.Fragment key={msg.id}>
                        {showDateSeparator && msg.createdAt && (
                          <div className="flex justify-center my-2">
                            <span className="bg-blue-50 text-gray-600 text-xs px-3 py-1 rounded-lg font-medium shadow-none">
                              {new Date(msg.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        <div
                          className={`flex items-end ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          {!isOwn && (
                            <img
                              src={activeContact.profilePicture}
                              alt={msg.sender?.name}
                              className="w-8 h-8 rounded-full mr-2 object-cover"
                            />
                          )}
                          <div
                            className={`relative max-w-[85%] min-w-[60px] px-6 py-1 rounded-full text-base whitespace-pre-line break-words shadow-sm flex items-center ${isOwn ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground border border-border'}`}
                            style={{ boxShadow: isOwn ? '0 2px 8px rgba(0,0,0,0.04)' : undefined }}
                          >
                            <span className="flex-1">{msg.content}</span>
                            <span
                              className={`text-xs ml-4 whitespace-nowrap ${isOwn ? 'text-white' : 'text-muted-foreground'}`}
                            >
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            {isOwn && (
                              <span className="ml-2 flex items-center">
                                {msg.status === 'pending' ? (
                                  <svg
                                    className="animate-spin h-4 w-4 text-white/80"
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
                                    ></circle>
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8v8z"
                                    ></path>
                                  </svg>
                                ) : (
                                  <svg
                                    className="h-4 w-4 text-white/80"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                )}
                              </span>
                            )}
                          </div>
                          {isOwn && (
                            <img
                              src={userAvatar}
                              alt="You"
                              className="w-8 h-8 rounded-full ml-2 object-cover"
                            />
                          )}
                        </div>
                      </React.Fragment>
                    );
                  })}
                <div ref={messagesEndRef} />
              </div>
            ))}
        </div>
        {/* Typing Field */}
        {activeContact && (
          <form
            onSubmit={handleSendMessage}
            className="px-6 border-t border-border bg-card flex items-center min-h-[64px]"
          >
            <input
              type="text"
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              placeholder="Type your Message"
              className="flex-1 rounded-full border border-border px-4 py-2 text-base bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
            <button
              type="submit"
              className="ml-3 px-4 py-2 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition"
              disabled={!currentMessage.trim() || threadLoading}
            >
              Send
            </button>
          </form>
        )}
      </main>
    </div>
  );
};

export default MessageSection;
