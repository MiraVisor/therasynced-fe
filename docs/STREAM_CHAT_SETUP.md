# Stream Chat Integration Setup Guide

This document explains how to set up and use Stream Chat in your React application.

## Prerequisites

1. Create a Stream account at [getstream.io](https://getstream.io)
2. Get your API key from the Stream Dashboard
3. Install the required packages (already done):
   ```bash
   npm install stream-chat stream-chat-react
   ```

## Environment Variables

Add your Stream API key to your environment variables:

1. Copy `.env.example` to `.env.local`
2. Replace `your-stream-api-key-here` with your actual API key from Stream Dashboard:
   ```bash
   NEXT_PUBLIC_STREAM_CHAT_API_KEY=your-actual-api-key
   ```

## Files Structure

- `src/lib/streamChat.ts` - Stream Chat client configuration
- `src/components/core/Dashboard/UserSide/Explore/MessageSection.tsx` - Main chat component
- `src/styles/stream-chat-custom.css` - Custom styling to match your design

## How It Works

### 1. User Authentication

The `connectUser` function in `streamChat.ts` connects a user to Stream Chat. In production, you should:

- Generate user tokens on your backend for security
- Use actual user data from your authentication system

### 2. Channel Creation

Channels are automatically created between users and experts. Each conversation gets a unique channel ID based on the user and expert IDs.

### 3. Real-time Messaging

Stream Chat provides real-time messaging out of the box with:

- Message delivery receipts
- Typing indicators
- Online presence
- Message reactions
- File uploads

## Customization

### Styling

The component uses custom CSS in `stream-chat-custom.css` to match your design system. You can modify:

- Colors to match your green theme
- Typography
- Spacing and layout
- Dark mode support

### Features

You can extend the chat with:

- Custom message types
- File/image sharing
- Voice messages
- Video calls integration
- Message threads
- Emoji reactions

## Security Considerations

1. **API Key**: Never expose your Stream secret key on the frontend
2. **User Tokens**: Generate tokens on your backend using the secret key
3. **Channel Permissions**: Configure proper channel permissions in Stream Dashboard
4. **User Authentication**: Ensure users are properly authenticated before connecting to chat

## Production Setup

For production deployment:

1. Replace the demo API key with your production key
2. Implement proper user authentication
3. Set up backend token generation
4. Configure webhooks for chat events
5. Set up moderation and content filtering

## Backend Integration

You'll need to create backend endpoints for:

- User token generation
- Channel creation with proper permissions
- User management (create/update/delete)
- Webhook handling for chat events

Example backend implementation (Node.js/Express):

```javascript
const StreamChat = require('stream-chat').StreamChat;

const serverClient = StreamChat.getInstance(
  process.env.STREAM_API_KEY,
  process.env.STREAM_SECRET_KEY,
);

// Generate user token
app.post('/api/chat/token', async (req, res) => {
  const { userId } = req.body;
  const token = serverClient.createToken(userId);
  res.json({ token });
});

// Create or update user
app.post('/api/chat/users', async (req, res) => {
  const { userId, name, image } = req.body;
  await serverClient.upsertUser({
    id: userId,
    name,
    image,
  });
  res.json({ success: true });
});
```

## Testing

For testing purposes, the current implementation uses:

- Development tokens (client.devToken())
- Mock user data
- Demo API key

This is sufficient for development but should be replaced with proper authentication for production.

## Support

- [Stream Chat React Documentation](https://getstream.io/chat/docs/sdk/react/)
- [Stream Chat API Reference](https://getstream.io/chat/docs/rest/)
- [Community Support](https://community.getstream.io/)
