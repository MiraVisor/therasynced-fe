import { Mail } from 'lucide-react';
import React from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CardContent } from '@/components/ui/card';
import { EnhancedCard } from '@/components/ui/enhanced-card';

interface ProfileCardProps {
  id: string;
  name: string;
  email: string;
  role?: string;
  profilePicture?: string;
  className?: string;
  showRole?: boolean;
  onClick?: () => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  id,
  name,
  email,
  role,
  profilePicture,
  className,
  showRole = true,
  onClick,
}) => {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <EnhancedCard variant="default" className={className} interactive={!!onClick} onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={profilePicture} alt={name} />
            <AvatarFallback className="bg-primary/10 text-primary font-inter font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-inter font-semibold text-sm text-foreground truncate">{name}</h4>
              {showRole && role && (
                <Badge variant="outline" className="text-xs">
                  {role}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-3 w-3" />
              <span className="font-open-sans truncate">{email}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </EnhancedCard>
  );
};
