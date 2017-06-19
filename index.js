const static = require('node-static');
const http = require('http');
const WebSocket = require('ws');
const WebSocketServer = WebSocket.Server;

const file = new static.Server();
const port = process.env.PORT || 3000;

console.log('Creating static server on port:  ' + port);
const httpServer = http.createServer(function(request, response) {
  request.addListener('end', function() {
    file.serve(request, response);
  }).resume();
});
httpServer.listen(port);

console.log('Attaching WebSocket server');
const wss = new WebSocketServer({ server: httpServer });
wss.on('connection', function(ws) {
  ws.on('message', function(message) {
    // Broadcast any received message to all clients
    console.log('received: %s', message);
    wss.broadcast(message);
  });
});
wss.broadcast = function(data) {
  this.clients.forEach(function(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};
