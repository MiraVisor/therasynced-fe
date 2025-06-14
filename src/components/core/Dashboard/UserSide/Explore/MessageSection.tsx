import React, { useState } from 'react';

import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

import { Expert } from './ExpertCard';

interface Message {
  id: string;
  text: string;
  isFromUser: boolean;
  timestamp: Date;
}

interface MessageSectionProps {
  expert: Expert;
  messages?: Message[];
  onSendMessage?: (message: string) => void;
}

export const MessageSection: React.FC<MessageSectionProps> = ({
  expert,
  messages = [],
  onSendMessage,
}) => {
  const [newMessage, setNewMessage] = useState('');

  const handleSend = () => {
    if (newMessage.trim() && onSendMessage) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  return (
    <div className="border rounded-lg p-4 bg-white dark:bg-gray-800">
      <div className="flex items-center gap-4 mb-4 border-b pb-4">
        <Avatar />
        <div>
          <h4 className="font-semibold">{expert.name}</h4>
          <p className="text-sm text-gray-500">Certified Physiotherapist</p>
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex items-start gap-2">
          <Avatar className="w-8 h-8" />
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-2 max-w-[80%]">
            <p className="text-sm">Hello! How are you doing?........</p>
          </div>
        </div>
        <div className="flex items-start gap-2 justify-end">
          <div className="bg-green-100 dark:bg-green-900 rounded-lg p-2 max-w-[80%]">
            <p className="text-sm">Hello! I am good...how are you?? Hows everythings going? 😊</p>
          </div>
          <Avatar className="w-8 h-8" />
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message...."
          className="flex-1 rounded-lg border p-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <Button onClick={handleSend}>
          <span className="transform rotate-90">➤</span>
        </Button>
      </div>
    </div>
  );
};
