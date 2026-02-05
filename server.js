/**
 * WebSocket Chat Server
 * 
 * This server handles real-time chat messaging using WebSocket protocol.
 * Features:
 * - Tracks connected users and their WebSocket connections
 * - Broadcasts messages to all connected clients
 * - Manages user connect/disconnect events
 * - Sends live user list updates to all clients
 */

const http = require('http');
const WebSocket = require('ws');

const port = 3001;

// Create HTTP server (can be extended for additional routes)
const server = http.createServer((request, response) => {
  // Handle HTTP requests here
});

// Initialize WebSocket server on top of HTTP server
const wss = new WebSocket.Server({ server });

// Map to store userId -> WebSocket connection mappings
const users = new Map();

/**
 * Broadcasts the current list of online users to all connected clients
 * Called whenever a user connects or disconnects
 */
function broadcastUsersList() {
  // Convert Map keys to array of usernames
  const usersList = Array.from(users.keys());
  const usersMessage = JSON.stringify({
    type: 'users',
    users: usersList
  });
  
  // Send updated user list to all connected clients
  for (const [userId, socket] of users.entries()) {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(usersMessage);
    }
  }
}

// Handle new WebSocket connections
wss.on('connection', function connection(ws) {
    // Log WebSocket errors
    ws.on('error', console.error);

    // Handle client disconnection
    ws.on('close', function close() {
      // Remove user from the map
      for (const [userId, socket] of users.entries()) {
        if (socket === ws) {
          users.delete(userId);
          console.log(`User ${userId} disconnected`);
          broadcastUsersList();
          break;
        }
      }
    });

  // Handle incoming messages from clients
  ws.on('message', function incoming(message) {
    const data = JSON.parse(message);

    // Handle user registration
    if (data.type === 'setUserId') {
      const { userId } = data;
      
      // Only log and broadcast if this is a new user (prevents duplicate registrations)
      if (!users.has(userId)) {
        users.set(userId, ws);
        ws.userId = userId; // Store userId on the socket for later reference
        console.log(`User ${userId} connected`);
        broadcastUsersList();
      }
    } 
    // Handle chat messages
    else if (data.type === 'message') {     // Broadcast the message to all connected users
      for (const [userId, socket] of users.entries()) {
        if (socket.readyState === WebSocket.OPEN) {
          console.log(`Sending message to ${userId}: ${JSON.stringify(data)}`);       // Send message with all metadata for client reconciliation
          socket.send(JSON.stringify({
            sender: data.sender,
            text: data.text,
            timestamp: data.timestamp,
            localId: data.localId // Used for optimistic UI updates
          }));
        }
      }
    }
  });
});

// Start the server
server.listen(port, function() {
  console.log(`Server is listening on ${port}!`)
})