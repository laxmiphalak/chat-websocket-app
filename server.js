const http = require('http');
const WebSocket = require('ws');

const port = 3001;

const server = http.createServer((request, response) => {
  // Handle HTTP requests here
});

const wss = new WebSocket.Server({ server });
const users = new Map();

function broadcastUsersList() {
  const usersList = Array.from(users.keys());
  const usersMessage = JSON.stringify({
    type: 'users',
    users: usersList
  });
  
  for (const [userId, socket] of users.entries()) {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(usersMessage);
    }
  }
}

wss.on('connection', function connection(ws) {
    ws.on('error', console.error);

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

  ws.on('message', function incoming(message) {
    const data = JSON.parse(message);

    if (data.type === 'setUserId') {
      const { userId } = data;
      
      // Only log and broadcast if this is a new user
      if (!users.has(userId)) {
        users.set(userId, ws);
        ws.userId = userId;
        console.log(`User ${userId} connected`);
        broadcastUsersList();
      }
    } else if (data.type === 'message') {
      // Broadcast the message to all users
      for (const [userId, socket] of users.entries()) {
        if (socket.readyState === WebSocket.OPEN) {
          console.log(`Sending message to ${userId}: ${JSON.stringify(data)}`);
          socket.send(JSON.stringify({
            sender: data.sender,
            text: data.text,
            timestamp: data.timestamp,
            localId: data.localId
          }));
        }
      }
    }
  });
});

server.listen(port, function() {
  console.log(`Server is listening on ${port}!`)
})