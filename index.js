const http = require('http');
const uuid = require('uuid').v4;

const httpServer = http.createServer((req, res) => {
  res.end('Hello World');
});

const WebSocketServer = require('websocket').server;

// Storing all the clients here
const clients = {};

const ws = new WebSocketServer({
  httpServer: httpServer,
});

ws.on('request', (request) => {
  const connection = request.accept(null, request.origin);

  connection.on('open', () => {
    console.log('Connection Opend!');
  });

  connection.on('close', () => {
    console.log('Connection Closed!');
  });

  connection.on('message', (message) => {
    const response = JSON.parse(message.utf8Data);

    if (response.action === 'addnewlift') {
      for (let key in clients) {
        if (key !== response.clientId) {
          clients[key].connection.send(
            JSON.stringify({
              action: 'addnewlift',
            }),
          );
        }
      }
    }

    if (response.action === 'addnewfloor') {
      for (let key in clients) {
        if (key !== response.clientId) {
          clients[key].connection.send(
            JSON.stringify({
              action: 'addnewfloor',
            }),
          );
        }
      }
    }

    if (response.action === 'movelift') {
      for (let key in clients) {
        if (key !== response.clientId) {
          clients[key].connection.send(
            JSON.stringify({
              action: 'movelift',
              floorIndex: response.floorIndex,
            }),
          );
        }
      }
    }
  });

  const clientId = uuid();
  clients[clientId] = {
    connection: connection,
  };

  const payload = {
    action: 'connect',
    clientId,
  };

  connection.send(JSON.stringify(payload));
});

httpServer.listen(8080, () => {
  console.log('Server is listening on port 8080');
});
