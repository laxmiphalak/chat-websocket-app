const http = require('http');
const WebSocket = require('ws');

const port = 3001;

const server = http.createServer((request, response) => {
  // Handle HTTP requests here
});

const wss = new WebSocket.Server({ server });
const users = new Map();

wss.on('connection', function connection(ws) {
    ws.on('error', console.error);

    ws.on('open', function open() {
    console.log('connected');
    ws.send(Date.now());
    });

    ws.on('close', function close() {
    console.log('disconnected');
    });
  ws.on('message', function incoming(message) {
    const data = JSON.parse(message);

    if (data.type === 'setUserId') {
      const { userId } = data;
      users.set(userId, ws);
      console.log(`User ${userId} connected`);
    } else if (data.type === 'message') {
      // Broadcast the message to other users
      for (const [userId, socket] of users.entries()) {
        console.log(`User message`);
        //if (socket !== ws) {
            console.log(`User message ${JSON.stringify(data)}`);
          socket.send(JSON.stringify({
            sender: data.sender,
            text: data.text
          }));
        //}
      }
    }
  });
});

server.listen(port, function() {
  console.log(`Server is listening on ${port}!`)
})