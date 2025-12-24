# WebSocket Implementation Review

## Overview

This document reviews the frontend WebSocket implementation against the backend API documentation to identify gaps, missing features, and required updates.

---

## 1. CHAT WEBSOCKET (`/chat` namespace)

### ✅ **Correctly Implemented**

1. **Connection Setup**
   - ✅ Connects to `/chat` namespace
   - ✅ Uses JWT token authentication via `auth.token`
   - ✅ Transports: `['websocket', 'polling']`
   - ✅ Auto-reconnection logic implemented

2. **Client Events**
   - ✅ `join_conversation` - Implemented in `chatService.joinConversation()`
   - ✅ `leave_conversation` - Implemented in `chatService.leaveConversation()`
   - ✅ `typing_indicator` - Implemented in `chatService.sendTypingIndicator()`

3. **Server Events**
   - ✅ `new_message` - Listened and handled
   - ✅ `typing_indicator` - Listened and handled
   - ✅ `message_read` - Listened and handled
   - ✅ `conversation_joined` - Listened (though backend may not emit this)
   - ✅ `conversation_left` - Listened (though backend may not emit this)

4. **REST API Integration**
   - ✅ `POST /api/v1/chat/send` - Implemented in `chatService.sendMessage()`
   - ✅ `GET /api/v1/chat/contacts` - Implemented in `chatService.getContacts()`
   - ✅ `GET /api/v1/chat/messages` - Implemented in `chatService.getMessages()`
   - ✅ `POST /api/v1/chat/messages/:id/read` - Implemented in `chatService.markMessageAsRead()`

### ❌ **Missing/Incomplete**

1. **Missing Server Event Handlers**
   - ❌ `conversation_context_changed` - **NOT IMPLEMENTED**
     - Backend emits this when conversation context is updated
     - Should update `conversationContexts` in chat store
   - ❌ `conversation_archived` - **NOT IMPLEMENTED**
     - Backend emits this when conversation is archived
     - Should move conversation to archived contacts

2. **ChatMessage Interface Missing Fields**

   ```typescript
   // Current interface (incomplete)
   export interface ChatMessage {
     id: string;
     content: string;
     createdAt: string;
     isRead: boolean;
     users: { id: string; name: string; profilePicture: string };
     conversationId: string;
   }

   // Backend sends (from documentation):
   {
     id: string,
     conversationId: string,
     senderId: string,              // ❌ MISSING
     content: string,
     encryptedContent: string,       // ❌ MISSING
     messageType: 'GENERAL' | 'INQUIRY' | 'APPOINTMENT_RELATED' | 'FOLLOW_UP', // ❌ MISSING
     bookingId?: string,             // ❌ MISSING
     createdAt: Date,
     updatedAt: Date,                // ❌ MISSING
     users: { id, name, profilePicture },
     booking?: { id, status }        // ❌ MISSING
   }
   ```

3. **SendMessageData Missing Fields**

   ```typescript
   // Current interface
   export interface SendMessageData {
     recipientId: string;
     content: string;
   }

   // Backend expects (from documentation):
   {
     recipientId: string,
     content: string,
     bookingId?: string,             // ❌ MISSING
     messageType?: 'GENERAL' | 'INQUIRY' | 'APPOINTMENT_RELATED' | 'FOLLOW_UP' // ❌ MISSING
   }
   ```

4. **User Room Join**
   - ⚠️ Backend automatically joins `user:${userId}` room on connection
   - ⚠️ Frontend doesn't explicitly handle this, but it should work automatically
   - ⚠️ Consider adding explicit handling/logging

---

## 2. BOOKINGS/SLOTS WEBSOCKET (`/slots` namespace)

### ✅ **Correctly Implemented**

1. **Connection Setup**
   - ✅ Connects to `/slots` namespace
   - ✅ Uses JWT token authentication via `auth.token`
   - ✅ Transports: `['websocket', 'polling']`
   - ✅ Auto-reconnection logic implemented

2. **Client Events**
   - ✅ `reserve-slot` - Implemented in `socketService.reserveSlot()`
   - ✅ `release-slot` - Implemented in `socketService.releaseSlot()`
   - ✅ `join-freelancer-slots` - Implemented in `socketService.joinFreelancerSlots()`
   - ✅ `leave-freelancer-slots` - Implemented in `socketService.leaveFreelancerSlots()`

3. **Server Events**
   - ✅ `slot-status-updated` - Listened and handled
   - ✅ `multiple-slots-updated` - Listened and handled
   - ✅ `slot-reserved` - Listened and handled
   - ✅ `slot-booked` - Listened and handled
   - ✅ `slot-removed` - Listened and handled
   - ✅ `slot-released` - Listened and handled
   - ✅ `slot-reservation-confirmed` - Listened and handled
   - ✅ `slot-reservation-failed` - Listened and handled
   - ✅ `joined-freelancer-slots` - Listened (acknowledgment)
   - ✅ `left-freelancer-slots` - Listened (acknowledgment)

### ❌ **Missing/Incomplete**

1. **Room Management Not Called**
   - ❌ `joinFreelancerSlots()` is **NEVER CALLED** in `useSocketSlots` hook
   - ❌ `leaveFreelancerSlots()` is **NEVER CALLED** in `useSocketSlots` hook
   - ⚠️ The hook receives `freelancerId` but doesn't use it to join/leave rooms
   - **FIX REQUIRED**: Add `useEffect` in `useSocketSlots` to join/leave when `freelancerId` changes

2. **Incorrect Event Emission**

   ```typescript
   // In useSocketSlots.ts line 236:
   socketService.emit('reserve-slot', { slotId, duration }); // ❌ WRONG

   // Should be:
   socketService.reserveSlot(slotId, duration); // ✅ CORRECT
   ```

   - Same issue for `release-slot` on line 264

3. **Event Payload Structure Mismatch**
   - Backend sends `slot-status-updated` with structure:
     ```typescript
     {
       freelancerId: string,
       slot: { id, freelancerId, locationType, startTime, endTime, status, reservedUntil },
       timestamp: string
     }
     ```
   - Frontend expects: `{ slotId, statusInfo }`
   - **FIX REQUIRED**: Update event handlers to match backend structure

4. **Missing Slot Data Fields**
   - Backend sends full slot objects with: `id`, `freelancerId`, `locationType`, `startTime`, `endTime`, `status`, `reservedUntil`
   - Frontend may not be handling all these fields properly

5. **Reserve Slot Payload**
   - Backend expects: `{ slotId: string, duration?: number }`
   - Frontend sends: `{ slotId, duration, timestamp }` (extra `timestamp` field)
   - ⚠️ May cause issues if backend is strict

---

## 3. IMPLEMENTATION GAPS SUMMARY

### **High Priority Fixes**

1. **Chat Service**
   - [ ] Add `conversation_context_changed` event handler
   - [ ] Add `conversation_archived` event handler
   - [ ] Update `ChatMessage` interface with missing fields
   - [ ] Update `SendMessageData` interface with `bookingId` and `messageType`

2. **Slots Service**
   - [ ] Call `joinFreelancerSlots()` when `freelancerId` is provided
   - [ ] Call `leaveFreelancerSlots()` when component unmounts or `freelancerId` changes
   - [ ] Fix `reserve-slot` and `release-slot` to use service methods instead of direct emit
   - [ ] Update event handlers to match backend payload structure

### **Medium Priority Fixes**

1. **Type Safety**
   - [ ] Add proper TypeScript types for all WebSocket events
   - [ ] Ensure all message types are properly typed
   - [ ] Add validation for incoming WebSocket messages

2. **Error Handling**
   - [ ] Add better error handling for WebSocket connection failures
   - [ ] Add retry logic for failed slot reservations
   - [ ] Add user feedback for connection issues

### **Low Priority / Nice to Have**

1. **Optimization**
   - [ ] Debounce slot reservation requests
   - [ ] Cache slot status updates
   - [ ] Optimize reconnection logic

---

## 4. CODE CHANGES REQUIRED

### **File: `src/services/chatService.ts`**

1. Update `ChatMessage` interface:

```typescript
export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string; // ADD
  content: string;
  encryptedContent: string; // ADD
  messageType: 'GENERAL' | 'INQUIRY' | 'APPOINTMENT_RELATED' | 'FOLLOW_UP'; // ADD
  bookingId?: string; // ADD
  createdAt: string;
  updatedAt: string; // ADD
  isRead: boolean;
  users: {
    id: string;
    name: string;
    profilePicture: string;
  };
  booking?: {
    // ADD
    id: string;
    status: string;
  };
}
```

2. Update `SendMessageData` interface:

```typescript
export interface SendMessageData {
  recipientId: string;
  content: string;
  bookingId?: string; // ADD
  messageType?: 'GENERAL' | 'INQUIRY' | 'APPOINTMENT_RELATED' | 'FOLLOW_UP'; // ADD
}
```

3. Add event listeners in `setupEventListeners()`:

```typescript
// Listen for conversation context changes
this.socket.on(
  'conversation_context_changed',
  (data: { conversationId: string; context: string }) => {
    console.log('ChatService: Conversation context changed:', data);
    window.dispatchEvent(new CustomEvent('chat:conversation_context_changed', { detail: data }));
  },
);

// Listen for conversation archived
this.socket.on('conversation_archived', (data: { conversationId: string }) => {
  console.log('ChatService: Conversation archived:', data);
  window.dispatchEvent(new CustomEvent('chat:conversation_archived', { detail: data }));
});
```

### **File: `src/hooks/useSocketSlots.ts`**

1. Add room management:

```typescript
// Join/leave freelancer slots room when freelancerId changes
useEffect(() => {
  if (freelancerId && socketService.isSocketConnected()) {
    socketService.joinFreelancerSlots(freelancerId);
  }

  return () => {
    if (freelancerId && socketService.isSocketConnected()) {
      socketService.leaveFreelancerSlots(freelancerId);
    }
  };
}, [freelancerId]);
```

2. Fix event emission:

```typescript
// In reserveSlotLocal function (line ~236):
// Change from:
socketService.emit('reserve-slot', { slotId, duration });

// To:
socketService.reserveSlot(slotId, duration);

// In releaseSlotLocal function (line ~264):
// Change from:
socketService.emit('release-slot', { slotId });

// To:
socketService.releaseSlot(slotId);
```

3. Update event handlers to match backend structure:

```typescript
const handleSlotStatusUpdated = (event: CustomEvent) => {
  const { slot, freelancerId } = event.detail; // Backend sends { slot, freelancerId, timestamp }
  if (slot?.id) {
    updateSlotStatus(slot.id, {
      status: slot.status,
      isAvailable: slot.status === 'AVAILABLE',
      isReserved: slot.status === 'RESERVED',
      isBooked: slot.status === 'BOOKED',
      canBeReserved: slot.status === 'AVAILABLE',
      statusMessage: `Status: ${slot.status}`,
    });
  }
};
```

### **File: `src/hooks/useChat.ts`**

1. Add handlers for new events:

```typescript
const unsubscribeContextChanged = chatService.onConversationContextChanged(
  ({ conversationId, context }) => {
    setConversationContext(conversationId, context);
  },
);

const unsubscribeArchived = chatService.onConversationArchived(({ conversationId }) => {
  archiveConversation(conversationId);
});
```

### **File: `src/services/chatService.ts`**

1. Add helper methods:

```typescript
public onConversationContextChanged(callback: (data: { conversationId: string; context: string }) => void) {
  const handler = (event: CustomEvent) => callback(event.detail);
  window.addEventListener('chat:conversation_context_changed', handler as EventListener);
  return () => window.removeEventListener('chat:conversation_context_changed', handler as EventListener);
}

public onConversationArchived(callback: (data: { conversationId: string }) => void) {
  const handler = (event: CustomEvent) => callback(event.detail);
  window.addEventListener('chat:conversation_archived', handler as EventListener);
  return () => window.removeEventListener('chat:conversation_archived', handler as EventListener);
}
```

---

## 5. TESTING CHECKLIST

### **Chat WebSocket**

- [ ] Test connection to `/chat` namespace
- [ ] Test `join_conversation` event
- [ ] Test `leave_conversation` event
- [ ] Test `new_message` event reception
- [ ] Test `typing_indicator` event
- [ ] Test `message_read` event
- [ ] Test `conversation_context_changed` event (after implementation)
- [ ] Test `conversation_archived` event (after implementation)
- [ ] Test sending message with `bookingId` and `messageType`
- [ ] Test reconnection logic

### **Slots WebSocket**

- [ ] Test connection to `/slots` namespace
- [ ] Test `join-freelancer-slots` when viewing freelancer
- [ ] Test `leave-freelancer-slots` when leaving page
- [ ] Test `reserve-slot` event
- [ ] Test `release-slot` event
- [ ] Test `slot-status-updated` event reception
- [ ] Test `slot-booked` event reception
- [ ] Test `slot-reserved` event reception
- [ ] Test `slot-removed` event reception
- [ ] Test `slot-reservation-confirmed` event
- [ ] Test `slot-reservation-failed` event
- [ ] Test multiple freelancer rooms (switching between freelancers)

---

## 6. NOTES

- The backend documentation mentions that users automatically join `user:${userId}` room on connection - this should work automatically, but consider adding explicit logging
- The `conversation_joined` and `conversation_left` events may not be emitted by the backend - verify with backend team
- Slot reservation should use the service method, not direct socket emit, to ensure proper error handling
- All timestamps from backend are ISO 8601 strings or Date objects - ensure proper parsing

---

## 7. REFERENCES

- Backend WebSocket Documentation (provided by user)
- Frontend Implementation:
  - `src/services/socketService.ts` - Slots WebSocket service
  - `src/services/chatService.ts` - Chat WebSocket service
  - `src/hooks/useSocketSlots.ts` - Slots WebSocket hook
  - `src/hooks/useChat.ts` - Chat WebSocket hook
  - `src/stores/chatStore.ts` - Chat state management
  - `src/stores/slotStore.ts` - Slot state management
