// Simple WebSocket server using Node.js and ws (moved from Frontend)
const http = require('http');
const WebSocket = require('ws');

const PORT = process.env.PORT ? Number(process.env.PORT) : 3055;

/** @type {Map<string, Set<WebSocket>>} */
const channels = new Map();

function sendJson(ws, data) {
  try {
    ws.send(JSON.stringify(data));
  } catch {}
}

function handleClose(ws) {
  channels.forEach((clients, channelName) => {
    if (clients.has(ws)) {
      clients.delete(ws);
      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          sendJson(client, { type: 'system', message: 'A user has left the channel', channel: channelName });
        }
      });
    }
  });
}

function handleMessage(ws, raw) {
  try {
    const data = JSON.parse(raw);
    if (data.type === 'join') {
      const channelName = data.channel;
      if (!channelName || typeof channelName !== 'string') {
        return sendJson(ws, { type: 'error', message: 'Channel name is required' });
      }
      if (!channels.has(channelName)) channels.set(channelName, new Set());
      const channelClients = channels.get(channelName);
      channelClients.add(ws);
      sendJson(ws, { type: 'system', message: `Joined channel: ${channelName}`, channel: channelName });
      sendJson(ws, { type: 'system', message: { id: data.id, result: 'Connected to channel: ' + channelName }, channel: channelName });
      channelClients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          sendJson(client, { type: 'system', message: 'A new user has joined the channel', channel: channelName });
        }
      });
      return;
    }
    if (data.type === 'message') {
      const channelName = data.channel;
      if (!channelName || typeof channelName !== 'string') {
        return sendJson(ws, { type: 'error', message: 'Channel name is required' });
      }
      const channelClients = channels.get(channelName);
      if (!channelClients || !channelClients.has(ws)) {
        return sendJson(ws, { type: 'error', message: 'You must join the channel first' });
      }
      channelClients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          sendJson(client, { type: 'broadcast', message: data.message, sender: client === ws ? 'You' : 'User', channel: channelName });
        }
      });
    }
  } catch (err) {
    console.error('Error handling message:', err);
  }
}

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    return res.end();
  }
  res.writeHead(200, { 'Access-Control-Allow-Origin': '*' });
  res.end('WebSocket server running');
});

const wss = new WebSocket.Server({ server });
wss.on('connection', (ws) => {
  console.log('New client connected');
  sendJson(ws, { type: 'system', message: 'Please join a channel to start chatting' });
  ws.on('message', (data) => handleMessage(ws, String(data)));
  ws.on('close', () => handleClose(ws));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`WebSocket server running on port ${PORT}`);
});


