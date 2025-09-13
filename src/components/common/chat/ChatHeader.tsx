'use client';

import { ArrowLeft, Phone, Video } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChatContact } from '@/services/chatService';

interface ChatHeaderProps {
  contact: ChatContact | null;
  isConnected?: boolean;
  typingUsers?: string[];
  onBack?: () => void;
  onCall?: () => void;
  onVideoCall?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  showBackButton?: boolean;
  className?: string;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  contact,
  isConnected = false,
  typingUsers = [],
  onBack,
  onCall,
  onVideoCall,
  showBackButton = false,
  className,
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part.charAt(0))
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const getStatusText = () => {
    if (typingUsers.length > 0) {
      return 'Typing...';
    }

    if (!contact) return '';

    if (contact.isOnline) {
      return 'Online';
    }

    if (contact.lastMessage) {
      return `Last seen ${new Date(contact.lastMessage.createdAt).toLocaleDateString()}`;
    }

    return '';
  };

  if (!contact) {
    return (
      <div className={cn('border-b border-gray-200 p-4', className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {showBackButton && (
              <Button variant="ghost" size="sm" onClick={onBack} className="p-1 h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('border-b border-gray-200 p-4', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {showBackButton && (
            <Button variant="ghost" size="sm" onClick={onBack} className="p-1 h-8 w-8 md:hidden">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}

          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarImage src={contact.profilePicture} alt={contact.name} />
              <AvatarFallback className="bg-green-100 text-green-700 font-medium">
                {getInitials(contact.name)}
              </AvatarFallback>
            </Avatar>
            {contact.isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-gray-900 truncate">{contact.name}</h2>
            <div className="flex items-center space-x-2">
              <p
                className={cn(
                  'text-sm truncate',
                  typingUsers.length > 0 ? 'text-green-600 font-medium' : 'text-gray-500',
                )}
              >
                {getStatusText()}
              </p>
              {!isConnected && (
                <div className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                  <span className="text-xs text-gray-400 ml-1">Disconnected</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {onCall && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCall}
              className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600"
              title="Voice call"
            >
              <Phone className="h-4 w-4" />
            </Button>
          )}

          {onVideoCall && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onVideoCall}
              className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600"
              title="Video call"
            >
              <Video className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
