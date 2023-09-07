const http = require('http');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const WebSocket = require('ws');

const router = require('./src/router');

// Create Express webapp
const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors());
app.use(router);

// Create http server and run it
const server = http.createServer(app);
const wss = new WebSocket.Server({server});
const port = process.env.PORT || 5000;

wss.on('stream', function connection(ws) {
  console.log('New Connection Initiated');

  ws.on('message', function incoming(message) {
    const msg = JSON.parse(message);
    switch (msg.event) {
      case 'connected':
        console.log(`A new call has connected.`);
        break;
      case 'start':
        console.log(`Starting Media Stream ${msg.streamSid}`);
        break;
      case 'media':
        console.log(`Receiving Audio...`);
        break;
      case 'stop':
        console.log(`Call Has Ended`);
        break;
    }
  });
});
server.listen(port, function() {
  console.log('Express server running on *:' + port);
});
