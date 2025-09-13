'use client';

import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import ChatDebug from '@/components/debug/ChatDebug';

const ChatTestPage = () => {
  return (
    <DashboardPageWrapper>
      <ChatDebug />
    </DashboardPageWrapper>
  );
};

export default ChatTestPage;
