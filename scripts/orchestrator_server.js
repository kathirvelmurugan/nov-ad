import { WebSocketServer } from 'ws';
import http from 'http';

const PORT = 8080;
const clients = new Map(); // machineId -> ws
const ipToMachine = {
  '192.168.29.62': 'hp', // PC 1 - Old HP (DESKTOP-J5CMKRK)
  '192.168.29.109': 'dell', // PC 2 - Dell 32GB (ionaad-9MJV1Y3)
  '192.168.29.194': 'center', // PC 3 - Center Mac (Kathirvels-MacBook-Air)
  '192.168.29.218': 'rightmac', // PC 4 - Right Mac (azeem-mac)
  '127.0.0.1': 'center',
  '192.168.29.20': 'center',
};

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.url === '/status') {
    const list = Array.from(clients.entries()).map(([id, ws]) => ({
      machineId: id,
      ip: ws.remoteIp,
      ready: ws.readyState === 1,
      hostname: ws.hostname || '',
    }));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ activeMachines: list, count: list.length }));
  }

  if (req.method === 'POST' && req.url === '/command') {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const targetId = payload.target; // 'hp', 'dell', 'mac2', or 'all'
        let sentCount = 0;
        clients.forEach((ws, id) => {
          if (targetId === 'all' || id === targetId || id.includes(targetId)) {
            ws.send(JSON.stringify(payload.command));
            sentCount++;
          }
        });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, sentCount }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('ALO Master Orchestrator Hub Active');
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
  let remoteIp = req.socket.remoteAddress || '';
  if (remoteIp.startsWith('::ffff:')) {
    remoteIp = remoteIp.slice(7);
  }
  ws.remoteIp = remoteIp;

  // Auto-assign machineId based on known IP mapping
  let autoId = ipToMachine[remoteIp] || `machine-${remoteIp.replace(/\./g, '_')}`;
  ws.machineId = autoId;
  clients.set(autoId, ws);
  console.log(`✅ Handshake accepted: [${autoId.toUpperCase()}] from IP: ${remoteIp}`);

  ws.send(JSON.stringify({ type: 'REGISTERED', machineId: autoId, status: 'READY' }));

  ws.on('message', (data) => {
    const raw = data.toString().trim();
    console.log(`📩 [${ws.machineId}] Received:`, raw);
    try {
      const msg = JSON.parse(raw);
      if (msg.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
        return;
      }
      if (msg.type === 'register' || msg.type === 'REGISTER') {
        const assignedId = msg.nodeId || msg.machineId || ws.machineId;
        ws.machineId = assignedId;
        ws.hostname = msg.hostname || '';
        clients.set(assignedId, ws);
        ws.send(JSON.stringify({
          type: 'registered',
          status: 'ok',
          nodeId: assignedId,
          success: true,
          message: 'Connected to Master Orchestrator',
        }));
        console.log(`✅ Fully Registered Node: [${assignedId}] (${ws.hostname})`);
        return;
      }
    } catch {
      // Plain text message is fine
    }
  });

  ws.on('close', () => {
    if (ws.machineId && clients.get(ws.machineId) === ws) {
      clients.delete(ws.machineId);
      console.log(`⚠️ Disconnected: [${ws.machineId.toUpperCase()}]`);
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🎯 Master Orchestrator Hub (Robust IP Auto-Mapper) active on 0.0.0.0:${PORT}`);
});
