const express = require('express');
const http    = require('http');
const { WebSocketServer, WebSocket } = require('ws');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

const server = http.createServer(app);
const wss    = new WebSocketServer({ server });

// In-Memory-Store: sessionId → { participants: { name → location } }
const sessions = new Map();
// Client-Zuordnung: ws → { sessionId, role, name }
const clients  = new Map();

function getSession(id) {
  if (!sessions.has(id)) sessions.set(id, { participants: new Map() });
  return sessions.get(id);
}

function broadcast(sessionId, msg) {
  const payload = JSON.stringify(msg);
  for (const [ws, meta] of clients) {
    if (meta.sessionId === sessionId && ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    }
  }
}

function participantsSnapshot(sessionId) {
  const session = getSession(sessionId);
  const data = {};
  for (const [name, loc] of session.participants) data[name] = loc;
  return { type: 'snapshot', participants: data };
}

wss.on('connection', ws => {
  ws.on('message', raw => {
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }

    if (msg.type === 'join') {
      const { sessionId, role, name } = msg;
      clients.set(ws, { sessionId, role, name });
      if (role === 'viewer') {
        ws.send(JSON.stringify(participantsSnapshot(sessionId)));
      }
    }

    else if (msg.type === 'location') {
      const meta = clients.get(ws);
      if (!meta) return;
      const session = getSession(meta.sessionId);
      const loc = { lat: msg.lat, lng: msg.lng, acc: msg.acc, ts: msg.ts, speed: msg.speed };
      session.participants.set(meta.name, loc);
      broadcast(meta.sessionId, { type: 'location', name: meta.name, ...loc });
    }

    else if (msg.type === 'stop') {
      const meta = clients.get(ws);
      if (!meta) return;
      const session = getSession(meta.sessionId);
      session.participants.delete(meta.name);
      broadcast(meta.sessionId, { type: 'left', name: meta.name });
    }
  });

  ws.on('close', () => {
    const meta = clients.get(ws);
    if (meta?.role === 'tracker') {
      const session = getSession(meta.sessionId);
      session.participants.delete(meta.name);
      broadcast(meta.sessionId, { type: 'left', name: meta.name });
    }
    clients.delete(ws);
  });
});

// Session-Info API
app.get('/api/session/:id', (req, res) => {
  const session = sessions.get(req.params.id);
  if (!session) return res.json({ participants: 0 });
  res.json({ participants: session.participants.size });
});

server.listen(PORT, () => {
  console.log(`LiveTrack läuft auf http://localhost:${PORT}`);
  console.log(`  Karte:   http://localhost:${PORT}/`);
  console.log(`  Tracker: http://localhost:${PORT}/track.html`);
});
