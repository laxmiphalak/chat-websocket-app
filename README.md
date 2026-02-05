# WebSocket Chat Application

A real-time chat application built with React and WebSocket, featuring a modern chat interface with live user tracking and instant messaging.

![Chat Application](https://img.shields.io/badge/React-18.3.1-blue) ![WebSocket](https://img.shields.io/badge/WebSocket-ws-green) ![License](https://img.shields.io/badge/license-MIT-blue)

## ✨ Features

- **Real-time Messaging** - Instant message delivery using WebSocket connections
- **Online User Tracking** - See who's currently online with live updates
- **Modern UI** - Slack-inspired interface with smooth animations
- **Optimistic Updates** - Messages appear instantly before server confirmation
- **Message Timestamps** - All messages include formatted timestamps
- **Auto-reconnect** - Automatic WebSocket reconnection on connection loss
- **Responsive Design** - Works seamlessly on desktop and mobile devices
- **Keyboard Shortcuts** - Send messages with Enter key

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd chat-websocket-app
```

2. Install dependencies:
```bash
npm install
```

### Running the Application

You need to run both the WebSocket server and the React client:

1. **Start the WebSocket Server** (Terminal 1):
```bash
npm run start_server
```
Server will start on `ws://localhost:3001`

2. **Start the React Client** (Terminal 2):
```bash
npm start
```
Client will open at `http://localhost:3000`

3. **Test the Chat**:
   - Open multiple browser windows/tabs
   - Login with different usernames
   - Start chatting in real-time!

## 📁 Project Structure

```
chat-websocket-app/
├── public/               # Static files
├── src/
│   ├── modules/
│   │   ├── Chat.jsx     # Main chat component
│   │   ├── Login.jsx    # Login screen
│   │   └── styles.css   # Component styles
│   ├── App.js           # Root component
│   ├── App.css          # App styles
│   └── index.js         # Entry point
├── server.js            # WebSocket server
└── package.json         # Dependencies & scripts
```

## 🔧 Available Scripts

### `npm run start_server`
Starts the WebSocket server on port 3001. Required for chat functionality.

### `npm start`
Runs the React app in development mode on port 3000.

### `npm test`
Launches the test runner in interactive watch mode.

### `npm run build`
Builds the app for production to the `build` folder with optimized performance.

## 🎨 Features in Detail

### User Authentication
- Simple username-based login
- No password required (demo app)
- Persistent session during WebSocket connection

### Real-time Communication
- WebSocket protocol for bi-directional communication
- Server broadcasts messages to all connected clients
- Automatic user list updates on connect/disconnect

### Message Features
- Sender identification with avatars
- Timestamp formatting (HH:MM)
- Message status indicators (pending/sent)
- Optimistic UI updates with server reconciliation

### User Interface
- Fixed chat container with scrollable messages
- Slack-inspired message bubbles
- Online users counter with hover dropdown
- Gradient backgrounds and smooth animations
- Focus states and keyboard navigation

## 🛠️ Technology Stack

- **Frontend**: React 18, CSS3
- **Backend**: Node.js, WebSocket (ws library)
- **Build Tool**: Create React App
- **Real-time**: WebSocket Protocol

## 🔌 WebSocket API

### Client → Server Messages

**Set User ID**
```json
{
  "type": "setUserId",
  "userId": "username"
}
```

**Send Message**
```json
{
  "type": "message",
  "text": "Hello world",
  "sender": "username",
  "timestamp": 1234567890,
  "localId": "local-123"
}
```

### Server → Client Messages

**User List Update**
```json
{
  "type": "users",
  "users": ["user1", "user2"]
}
```

**Broadcast Message**
```json
{
  "sender": "username",
  "text": "Hello world",
  "timestamp": 1234567890,
  "localId": "local-123"
}
```

## 🚧 Future Enhancements

- [ ] Message persistence (database integration)
- [ ] Private/direct messaging
- [ ] Typing indicators
- [ ] File/image sharing
- [ ] Emoji reactions
- [ ] Message editing/deletion
- [ ] User authentication with JWT
- [ ] Chat rooms/channels
- [ ] Message search
- [ ] Desktop notifications

## 📝 License

This project is open source and available under the MIT License.

---

Built with ❤️ using React and WebSockets
