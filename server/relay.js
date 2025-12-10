const WebSocket = require('ws');

const PORT = process.env.PORT || 8080;
const wss = new WebSocket.Server({ port: PORT });

// O(1) Lookup: hostKey -> hostSocket
const hosts = new Map();

console.log(`🚀 SIGNALING Server running on port ${PORT}`);
console.log(`📡 Mode: WebRTC Signaling (SDP/ICE Routes Only)`);

wss.on('connection', (ws) => {
    ws.id = Date.now().toString(36) + Math.random().toString(36).substr(2);
    ws.isAlive = true;

    ws.on('pong', () => { ws.isAlive = true; });

    ws.on('message', (data) => {
        try {
            const msg = JSON.parse(data);

            switch (msg.type) {
                // 1. Host Registers (O(1) Write)
                case 'REGISTER':
                    // msg: { type: 'REGISTER', key: 'A7K9...' }
                    hosts.set(msg.key, ws);
                    ws.role = 'HOST';
                    ws.key = msg.key;
                    console.log(`✅ Host Active: ${msg.key}`);
                    break;

                // 2. Guest Joins (O(1) Lookup)
                case 'JOIN':
                    // msg: { type: 'JOIN', key: 'A7K9...' }
                    const hostWs = hosts.get(msg.key);
                    if (hostWs && hostWs.readyState === WebSocket.OPEN) {
                        console.log(`🔗 Match Found: Guest -> ${msg.key}`);

                        // Tell Host a guest is here, Host will initiate Offer
                        hostWs.send(JSON.stringify({
                            type: 'GUEST_JOINED',
                            guestId: ws.id
                        }));

                        // Store ephemeral link for signaling routing if needed
                        // Or just rely on ID routing in SIGNAL messages
                        ws.role = 'GUEST';
                        ws.connectedHostKey = msg.key;
                    } else {
                        ws.send(JSON.stringify({ type: 'ERROR', message: 'Host not found' }));
                    }
                    break;

                // 3. Signaling (SDP / ICE) - The Relay
                case 'SIGNAL':
                    // msg: { type: 'SIGNAL', targetId: '...', payload: { sdp/ice } }
                    // Route directly to target
                    // Note: In this simple model, Host needs Guest's socket ID and vice versa.
                    // We can find socket by ID if we keep a map, or efficient routing.

                    // For massive scale, we might look up by ID. 
                    // To keep it simple O(1) & fast for now:

                    // If Host sending -> send to specific Guest (using ID)
                    // If Guest sending -> send to their Connected Host

                    if (ws.role === 'GUEST') {
                        const h = hosts.get(ws.connectedHostKey);
                        if (h && h.readyState === WebSocket.OPEN) {
                            h.send(JSON.stringify({
                                type: 'SIGNAL',
                                from: ws.id,
                                payload: msg.payload
                            }));
                        }
                    }
                    else if (ws.role === 'HOST') {
                        // Host needs to broadcast to all or specific guest?
                        // WebRTC is 1:1 usually, so Host needs to know WHICH guest.
                        // We will assume `msg.targetId` is provided by Host.

                        // We need a global lookup for socket by ID? 
                        // Or we broadcast to all clients?
                        // A global ID map is best.

                        // For this implementation, let's add a global clients map.
                        // Or just iterate (slow)? No, user wants O(1).

                        const target = clients.get(msg.targetId);
                        if (target && target.readyState === WebSocket.OPEN) {
                            target.send(JSON.stringify({
                                type: 'SIGNAL',
                                from: ws.id,
                                payload: msg.payload
                            }));
                        }
                    }
                    break;
            }

        } catch (e) {
            console.error(e);
        }
    });

    // Cleanup
    ws.on('close', () => {
        if (ws.role === 'HOST' && ws.key) {
            hosts.delete(ws.key);
            console.log(`🛑 Host Offline: ${ws.key}`);
        }
        clients.delete(ws.id);
    });

    // Track all clients for O(1) routing
    clients.set(ws.id, ws);
});

// Global Client Map for O(1) Routing
const clients = new Map();

// Heartbeat
setInterval(() => {
    wss.clients.forEach((ws) => {
        if (ws.isAlive === false) return ws.terminate();
        ws.isAlive = false;
        ws.ping();
    });
    console.log(`📊 Status: ${hosts.size} Hosts | ${clients.size} Peers`);
}, 30000);
