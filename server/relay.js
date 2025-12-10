const WebSocket = require('ws');

const PORT = process.env.PORT || 8080;
const wss = new WebSocket.Server({ port: PORT });

// O(1) Data Structures
// hostId -> { id, ws, timestamp, guests: Set<guestId> }
const hosts = new Map();
// guestId -> { id, ws, timestamp, connectedHostId: string|null }
const guests = new Map();

console.log(`🚀 WebSocket Relay Server running on port ${PORT}`);
console.log(`⚡ Features: Edge-First Multiplexing, Fanout, Resilient Shards`);

wss.on('connection', (ws) => {
    console.log('New connection established');

    ws.on('message', (data) => {
        try {
            const msg = JSON.parse(data);

            switch (msg.type) {
                case 'HOST_REGISTER':
                    // O(1) Write
                    hosts.set(msg.id, {
                        id: msg.id,
                        ws: ws,
                        timestamp: Date.now(),
                        guests: new Set()
                    });

                    // Attach metadata for O(1) cleanup
                    ws.isAlive = true;
                    ws.sessionId = msg.id;
                    ws.role = 'HOST';

                    console.log(`✅ Host registered: ${msg.id}`);

                    // Send confirmation
                    ws.send(JSON.stringify({
                        type: 'REGISTERED',
                        role: 'HOST',
                        id: msg.id
                    }));

                    // Broadcast to ALL guests (Fanout Availability)
                    broadcastToGuests({
                        type: 'HOST_AVAILABLE',
                        hostId: msg.id
                    });
                    break;

                case 'GUEST_REGISTER':
                    guests.set(msg.id, {
                        id: msg.id,
                        ws: ws,
                        timestamp: Date.now(),
                        connectedHostId: null
                    });

                    ws.isAlive = true;
                    ws.sessionId = msg.id;
                    ws.role = 'GUEST';

                    console.log(`🔍 Guest registered: ${msg.id}`);

                    // Send available hosts immediately
                    const availableHosts = Array.from(hosts.keys());
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify({
                            type: 'HOSTS_LIST',
                            hosts: availableHosts
                        }));
                    }

                    // Notify hosts of new guest
                    broadcastToHosts({
                        type: 'GUEST_AVAILABLE',
                        guestId: msg.id
                    });
                    break;

                case 'CLAIM_HOST':
                    handleClaimHost(ws, msg);
                    break;

                case 'MULTIPLEX':
                    handleMultiplex(ws, msg);
                    break;

                case 'HEARTBEAT':
                    ws.isAlive = true;
                    if (hosts.has(msg.id)) hosts.get(msg.id).timestamp = Date.now();
                    if (guests.has(msg.id)) guests.get(msg.id).timestamp = Date.now();
                    break;

                default:
                    console.warn(`Unknown message type: ${msg.type}`);
            }
        } catch (e) {
            console.error('Message parse error:', e);
        }
    });

    ws.on('close', () => {
        handleDisconnect(ws);
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

function handleClaimHost(ws, msg) {
    const host = hosts.get(msg.hostId);
    const guest = guests.get(msg.guestId);

    if (host && guest) {
        console.log(`🤝 Fanout Connect: Host ${msg.hostId} <- Guest ${msg.guestId}`);

        // Update Relationships
        host.guests.add(msg.guestId);
        guest.connectedHostId = msg.hostId;

        // Notify Host
        if (host.ws.readyState === WebSocket.OPEN) {
            host.ws.send(JSON.stringify({
                type: 'MATCHED',
                guestId: msg.guestId
            }));
        }

        // Notify Guest
        if (guest.ws.readyState === WebSocket.OPEN) {
            guest.ws.send(JSON.stringify({
                type: 'MATCHED',
                hostId: msg.hostId
            }));
        }

        // Send current guest list to Host (Sync)
        sendGuestListToHost(host);

    } else {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: 'CLAIM_FAILED',
                reason: 'Host or Guest not found'
            }));
        }
    }
}

function handleMultiplex(ws, msg) {
    // msg: { type: 'MULTIPLEX', channel, targetId?, payload, timestamp }
    const senderId = ws.sessionId;
    const senderRole = ws.role;

    // console.log(`🔀 Mux: ${senderRole} ${senderId} -> ${msg.channel}`);

    if (msg.targetId) {
        // Direct routing
        let targetWs = null;
        if (hosts.has(msg.targetId)) targetWs = hosts.get(msg.targetId).ws;
        else if (guests.has(msg.targetId)) targetWs = guests.get(msg.targetId).ws;

        if (targetWs && targetWs.readyState === WebSocket.OPEN) {
            targetWs.send(JSON.stringify({ ...msg, from: senderId }));
        }
    } else {
        // Broadcast / Fanout Logic
        if (senderRole === 'HOST') {
            // Host -> All Connected Guests
            const host = hosts.get(senderId);
            if (host) {
                host.guests.forEach(guestId => {
                    const guest = guests.get(guestId);
                    if (guest && guest.ws.readyState === WebSocket.OPEN) {
                        guest.ws.send(JSON.stringify({ ...msg, from: senderId }));
                    }
                });
            }
        } else if (senderRole === 'GUEST') {
            // Guest -> Connected Host
            const guest = guests.get(senderId);
            if (guest && guest.connectedHostId) {
                const host = hosts.get(guest.connectedHostId);
                if (host && host.ws.readyState === WebSocket.OPEN) {
                    host.ws.send(JSON.stringify({ ...msg, from: senderId }));
                }
            }
        }
    }
}

function handleDisconnect(ws) {
    if (ws.sessionId && ws.role) {
        if (ws.role === 'HOST') {
            // Check if active
            const host = hosts.get(ws.sessionId);
            if (host) {
                // Notify all guests
                host.guests.forEach(guestId => {
                    const guest = guests.get(guestId);
                    if (guest && guest.ws.readyState === WebSocket.OPEN) {
                        guest.ws.send(JSON.stringify({ type: 'HOST_DISCONNECTED', hostId: ws.sessionId }));
                        guest.connectedHostId = null;
                    }
                });
                hosts.delete(ws.sessionId);
                console.log(`🗑️ Host removed: ${ws.sessionId}`);
            }
        } else if (ws.role === 'GUEST') {
            const guest = guests.get(ws.sessionId);
            if (guest) {
                // Remove from Host's guest list
                if (guest.connectedHostId) {
                    const host = hosts.get(guest.connectedHostId);
                    if (host) {
                        host.guests.delete(ws.sessionId);
                        // Notify Host
                        sendGuestListToHost(host);
                        if (host.ws.readyState === WebSocket.OPEN) {
                            host.ws.send(JSON.stringify({ type: 'GUEST_LEFT', guestId: ws.sessionId }));
                        }
                    }
                }
                guests.delete(ws.sessionId);
                console.log(`🗑️ Guest removed: ${ws.sessionId}`);
            }
        }
    }
}

// Helpers
function broadcastToGuests(msg) {
    guests.forEach(guest => {
        if (guest.ws.readyState === WebSocket.OPEN) {
            guest.ws.send(JSON.stringify(msg));
        }
    });
}

function broadcastToHosts(msg) {
    hosts.forEach(host => {
        if (host.ws.readyState === WebSocket.OPEN) {
            host.ws.send(JSON.stringify(msg));
        }
    });
}

function sendGuestListToHost(host) {
    if (host.ws.readyState === WebSocket.OPEN) {
        host.ws.send(JSON.stringify({
            type: 'GUESTS_UPDATE',
            guests: Array.from(host.guests)
        }));
    }
}

// Cleanup stale connections
setInterval(() => {
    const now = Date.now();
    const STALE_THRESHOLD = 30000;

    for (let [id, data] of hosts) {
        if (now - data.timestamp > STALE_THRESHOLD) {
            hosts.delete(id);
            // Could notify guests here too
        }
    }
    for (let [id, data] of guests) {
        if (now - data.timestamp > STALE_THRESHOLD) {
            guests.delete(id);
        }
    }
}, 10000);

// Status endpoint
setInterval(() => {
    console.log(`📊 Status: ${hosts.size} hosts, ${guests.size} guests`);
}, 30000);
