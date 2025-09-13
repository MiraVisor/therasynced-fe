'use client';

import { ChatContainer } from '@/components/common/chat';
import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { getDecodedToken } from '@/lib/utils';

const MessagesPage = () => {
  // Get current user ID from token
  const decodedToken = getDecodedToken();
  const currentUserId = decodedToken?.sub;

  return (
    <DashboardPageWrapper
      header={<div className="text-2xl font-bold">Messages</div>}
      showNotifications={false}
    >
      <div className="h-[calc(100vh-120px)]">
        <ChatContainer currentUserId={currentUserId} />
      </div>
    </DashboardPageWrapper>
  );
};

export default MessagesPage;
