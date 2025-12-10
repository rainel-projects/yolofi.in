const WebSocket = require('ws');

const PORT = process.env.PORT || 8080;
const wss = new WebSocket.Server({ port: PORT });

// O(1) Data Structures
const hosts = new Map();        // hostId -> { id, ws, timestamp }
const guests = new Map();       // guestId -> { id, ws, timestamp }

console.log(`🚀 WebSocket Relay Server running on port ${PORT}`);

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
                        timestamp: Date.now()
                    });

                    console.log(`✅ Host registered: ${msg.id} (Total hosts: ${hosts.size})`);

                    // Send confirmation
                    ws.send(JSON.stringify({
                        type: 'REGISTERED',
                        role: 'HOST',
                        id: msg.id
                    }));

                    // Broadcast to all guests
                    guests.forEach((guest) => {
                        if (guest.ws.readyState === WebSocket.OPEN) {
                            guest.ws.send(JSON.stringify({
                                type: 'HOST_AVAILABLE',
                                hostId: msg.id
                            }));
                        }
                    });
                    break;

                case 'GUEST_REGISTER':
                    // O(1) Write
                    guests.set(msg.id, {
                        id: msg.id,
                        ws: ws,
                        timestamp: Date.now()
                    });

                    console.log(`🔍 Guest registered: ${msg.id} (Total guests: ${guests.size})`);

                    // Send available hosts immediately
                    const availableHosts = Array.from(hosts.keys());
                    ws.send(JSON.stringify({
                        type: 'HOSTS_LIST',
                        hosts: availableHosts
                    }));

                    // Broadcast to all hosts
                    hosts.forEach((host) => {
                        if (host.ws.readyState === WebSocket.OPEN) {
                            host.ws.send(JSON.stringify({
                                type: 'GUEST_AVAILABLE',
                                guestId: msg.id
                            }));
                        }
                    });
                    break;

                case 'CLAIM_HOST':
                    const host = hosts.get(msg.hostId);
                    const guest = guests.get(msg.guestId);

                    if (host && guest) {
                        console.log(`🤝 Match: Host ${msg.hostId} <-> Guest ${msg.guestId}`);

                        // Notify host
                        if (host.ws.readyState === WebSocket.OPEN) {
                            host.ws.send(JSON.stringify({
                                type: 'MATCHED',
                                guestId: msg.guestId
                            }));
                        }

                        // Notify guest
                        if (guest.ws.readyState === WebSocket.OPEN) {
                            guest.ws.send(JSON.stringify({
                                type: 'MATCHED',
                                hostId: msg.hostId
                            }));
                        }

                        // Remove from pools (O(1))
                        hosts.delete(msg.hostId);
                        guests.delete(msg.guestId);
                    } else {
                        ws.send(JSON.stringify({
                            type: 'CLAIM_FAILED',
                            reason: 'Host or Guest not found'
                        }));
                    }
                    break;

                case 'HEARTBEAT':
                    // Update timestamp (O(1))
                    if (hosts.has(msg.id)) {
                        hosts.get(msg.id).timestamp = Date.now();
                    }
                    if (guests.has(msg.id)) {
                        guests.get(msg.id).timestamp = Date.now();
                    }
                    break;

                default:
                    console.warn(`Unknown message type: ${msg.type}`);
            }
        } catch (e) {
            console.error('Message parse error:', e);
        }
    });

    ws.on('close', () => {
        console.log('Connection closed, cleaning up...');

        // Remove from hosts (O(n) but rare operation)
        for (let [id, data] of hosts) {
            if (data.ws === ws) {
                hosts.delete(id);
                console.log(`🗑️ Host removed: ${id}`);
            }
        }

        // Remove from guests
        for (let [id, data] of guests) {
            if (data.ws === ws) {
                guests.delete(id);
                console.log(`🗑️ Guest removed: ${id}`);
            }
        }
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

// Cleanup stale connections (no heartbeat for >30s)
setInterval(() => {
    const now = Date.now();
    const STALE_THRESHOLD = 30000; // 30 seconds

    for (let [id, data] of hosts) {
        if (now - data.timestamp > STALE_THRESHOLD) {
            console.log(`⏰ Stale host removed: ${id}`);
            hosts.delete(id);
        }
    }

    for (let [id, data] of guests) {
        if (now - data.timestamp > STALE_THRESHOLD) {
            console.log(`⏰ Stale guest removed: ${id}`);
            guests.delete(id);
        }
    }
}, 10000); // Check every 10 seconds

// Status endpoint
setInterval(() => {
    console.log(`📊 Status: ${hosts.size} hosts, ${guests.size} guests`);
}, 30000); // Log every 30s
