import {
  Avatar,
  ChatContainer,
  Conversation,
  ConversationHeader,
  ConversationList,
  MainContainer,
  Message,
  MessageInput,
  MessageList,
  Sidebar,
  TypingIndicator,
} from '@chatscope/chat-ui-kit-react';
import React, { useEffect, useState } from 'react';

import { useMediaQuery } from '@/hooks/use-media-query';

import styles from './MessageSection.module.css';

import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';

interface Contact {
  id: number;
  name: string;
  info: string;
  time: string;
  preview: string;
  avatar: string;
  unreadCount?: number;
}

interface MessageType {
  id: string;
  sender: string;
  message: string;
  sentTime: string;
  sentDate?: string;
  direction: 'incoming' | 'outgoing';
}

interface Messages {
  [key: number]: MessageType[];
}

const contacts: Contact[] = [
  {
    id: 1,
    name: 'Dr Lee Marshell',
    info: 'Certified Physiotherapist',
    time: '16:20',
    preview: 'Hello! How are you doing?',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    unreadCount: 2,
  },
  {
    id: 2,
    name: 'Dr Emily Stone',
    info: 'Certified Physiotherapist',
    time: '16:21',
    preview: 'How can I help you today?',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    unreadCount: 0,
  },
  {
    id: 3,
    name: 'Dr John Doe',
    info: 'Certified Physiotherapist',
    time: '16:22',
    preview: 'Please share your reports.',
    avatar: 'https://randomuser.me/api/portraits/men/55.jpg',
    unreadCount: 1,
  },
];

export const MessageSection = () => {
  const [activeContact, setActiveContact] = useState<Contact>(contacts[0]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showChat, setShowChat] = useState(false);
  // Use 1023px as breakpoint for tablet/mobile behavior
  const isMobile = useMediaQuery('(max-width: 1023px)');

  // Handle contact selection - for mobile and tablet, show chat view
  const handleContactClick = (contact: Contact) => {
    setActiveContact(contact);
    if (isMobile) {
      setShowChat(true);
    }
  };

  // Handle back button - return to contacts list on mobile/tablet
  const handleBackToContacts = () => {
    setShowChat(false);
  };

  // Reset chat view when screen size changes to desktop
  useEffect(() => {
    if (!isMobile) {
      setShowChat(false);
    }
  }, [isMobile]);
  // User avatar - can be made dynamic based on logged-in user
  const userAvatar = 'https://randomuser.me/api/portraits/men/1.jpg';
  const [messages, setMessages] = useState<Messages>({
    1: [
      {
        id: '1',
        sender: 'Dr Lee Marshell',
        message: 'Hello! How are you doing?........',
        sentTime: '16:20',
        sentDate: 'July 10, 2025',
        direction: 'incoming',
      },
      {
        id: '2',
        sender: 'Dr Lee Marshell',
        message: 'Hello! How are you doing?........',
        sentTime: '16:20',
        sentDate: 'July 10, 2025',
        direction: 'incoming',
      },
      {
        id: '3',
        sender: 'Dr Lee Marshell',
        message: 'Hello! How are you doing?........',
        sentTime: '16:20',
        sentDate: 'July 10, 2025',
        direction: 'incoming',
      },
      {
        id: '4',
        sender: 'You',
        message: 'Hello! How are You? 😊',
        sentTime: '16:20',
        sentDate: 'July 10, 2025',
        direction: 'outgoing',
      },
      {
        id: '5',
        sender: 'Dr Lee Marshell',
        message: 'Hello! i am good...how are you?? Hows everythings going? 😊',
        sentTime: '16:20',
        sentDate: 'July 12, 2025',
        direction: 'incoming',
      },
      {
        id: '6',
        sender: 'You',
        message: 'Hello! i am good...how are you?? Hows everythings going? 😊',
        sentTime: '16:20',
        sentDate: 'July 12, 2025',
        direction: 'outgoing',
      },
    ],
    2: [
      {
        id: '5',
        sender: 'Dr Lee Marshell',
        message: 'Hello! i am good...how are you?? Hows everythings going? 😊',
        sentTime: '16:20',
        sentDate: 'July 12, 2025',
        direction: 'incoming',
      },
      {
        id: '6',
        sender: 'You',
        message: 'Hello! i am good...how are you?? Hows everythings going? 😊',
        sentTime: '16:20',
        sentDate: 'July 12, 2025',
        direction: 'outgoing',
      },
    ],
    3: [
      {
        id: '5',
        sender: 'Dr Lee Marshell',
        message: 'Hello! How are you doing?........ 😊',
        sentTime: '16:20',
        sentDate: 'July 12, 2025',
        direction: 'incoming',
      },
      {
        id: '6',
        sender: 'You',
        message: 'Hello! i am good...how are you?? Hows everythings going? 😊',
        sentTime: '16:20',
        sentDate: 'July 12, 2025',
        direction: 'outgoing',
      },
    ],
  });

  const handleChange = (value: string) => {
    setCurrentMessage(value);
    // Simulate typing indicator
    if (value.length > 0 && !isTyping) {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 3000);
    }
  };

  const handleSendMessage = (text: string) => {
    if (!activeContact || !text.trim()) return;

    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const newMessage: MessageType = {
      id: Date.now().toString(),
      sender: 'You',
      message: text,
      sentTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sentDate: formattedDate,
      direction: 'outgoing',
    };

    setMessages((prev) => ({
      ...prev,
      [activeContact.id]: [...(prev[activeContact.id] || []), newMessage],
    }));

    setCurrentMessage('');

    // Simulate response after 2 seconds
    setTimeout(() => {
      const responseTime = new Date();
      const responseMessage: MessageType = {
        id: (Date.now() + 1).toString(),
        sender: activeContact.name,
        message: `Thanks for your message! I'll get back to you soon.`,
        sentTime: responseTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sentDate: formattedDate,
        direction: 'incoming',
      };

      setMessages((prev) => ({
        ...prev,
        [activeContact.id]: [...(prev[activeContact.id] || []), responseMessage],
      }));
    }, 2000);
  };

  const getTypingIndicator = () => {
    if (isTyping && activeContact) {
      return <TypingIndicator content={`${activeContact.name} is typing`} />;
    }
    return undefined;
  };

  return (
    <div className={styles.messageContainer}>
      <MainContainer responsive>
        {/* Sidebar - Hidden on XS when chat is showing */}
        <div className={showChat ? styles.hiddenOnMobile : styles.showOnMobile}>
          <Sidebar position="left" scrollable>
            <ConversationList>
              {contacts.map((contact) => (
                <Conversation
                  key={contact.id}
                  name={contact.name}
                  lastSenderName={contact.info}
                  info={contact.preview}
                  lastActivityTime={contact.time}
                  active={activeContact?.id === contact.id}
                  unreadCnt={contact.unreadCount}
                  onClick={() => handleContactClick(contact)}
                >
                  <Avatar src={contact.avatar} name={contact.name} />
                </Conversation>
              ))}
            </ConversationList>
          </Sidebar>
        </div>

        {/* Chat Container - Shown on XS when contact is selected */}
        <div
          className={`${!showChat ? styles.hiddenOnMobile : styles.showOnMobile} ${styles.chatContainerWrapper}`}
        >
          <ChatContainer>
            {activeContact && (
              <ConversationHeader className={styles.conversationHeader}>
                {isMobile && (
                  <ConversationHeader.Back
                    onClick={handleBackToContacts}
                    className={styles.backButtonWrapper}
                  />
                )}

                <Avatar src={activeContact.avatar} name={activeContact.name} />
                <ConversationHeader.Content
                  userName={activeContact.name}
                  info={activeContact.info}
                />
              </ConversationHeader>
            )}

            <MessageList typingIndicator={getTypingIndicator()}>
              {activeContact &&
                messages[activeContact.id]?.map(
                  (msg: MessageType, index: number, array: MessageType[]) => {
                    // Check if this is the first message or if the date is different from the previous message
                    const showDateSeparator =
                      index === 0 || msg.sentDate !== array[index - 1].sentDate;

                    return (
                      <React.Fragment key={msg.id}>
                        {showDateSeparator && msg.sentDate && (
                          <div className={styles.dateSeparator}>
                            <div className={styles.dateSeparatorText}>{msg.sentDate}</div>
                          </div>
                        )}
                        <Message
                          model={{
                            message: msg.message,
                            sentTime: msg.sentTime,
                            sender: msg.sender,
                            direction: msg.direction,
                            position: 'single',
                          }}
                        >
                          {msg.direction === 'incoming' && (
                            <Avatar src={activeContact.avatar} name={msg.sender} />
                          )}
                          {msg.direction === 'outgoing' && <Avatar src={userAvatar} name="You" />}
                        </Message>
                      </React.Fragment>
                    );
                  },
                )}
            </MessageList>

            <MessageInput
              value={currentMessage}
              onChange={handleChange}
              onSend={handleSendMessage}
              disabled={!activeContact}
              attachButton={false}
              placeholder="Type your Message"
            />
          </ChatContainer>
        </div>
      </MainContainer>
    </div>
  );
};

export default MessageSection;
