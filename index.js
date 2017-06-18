const static = require('node-static');
const https = require('http');
const WebSocket = require('ws');
const WebSocketServer = WebSocket.Server;

const file = new static.Server();
const port = process.env.PORT || 3000;

/*const serverConfig = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem'),
};
*/

console.log('Creating static server on port:  ' + port);
const httpsServer = https.createServer(function(request, response) {
  request.addListener('end', function() {
    file.serve(request, response);
  }).resume();
});
httpsServer.listen(port);

console.log('Creating WebSocket server');
const wss = new WebSocketServer({server: httpsServer});

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
