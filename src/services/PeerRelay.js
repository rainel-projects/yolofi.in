import { db } from "../firebase/config"; // Not used here directly but good practice to keep imports clean if needed later, but actually PeerRelay is pure WS.

class PeerRelay {
    constructor() {
        this.ws = null;
        this.callbacks = {};
        this.streamHandlers = {}; // channel -> callback
        this.connected = false;

        // Reliability
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 10;
        this.baseReconnectDelay = 1000;

        // Edge Shards ( prioritized by latency )
        this.shards = [
            'ws://localhost:8080',
            'ws://localhost:8081', // Fallback/Failover shards
            'ws://localhost:8082'
        ];
        this.currentShard = null;

        // Message Queueing for Offline Resilience
        this.messageQueue = [];
        this.reconnectTimeout = null;
    }

    // EDGE FIRST: Find the fastest healthy shard
    async findBestRelay() {
        console.log('🌐 Pinging Edge Shards...');
        const pings = this.shards.map(url => {
            return new Promise((resolve) => {
                const start = Date.now();
                const ws = new WebSocket(url);
                ws.onopen = () => {
                    const latency = Date.now() - start;
                    ws.close();
                    resolve({ url, latency });
                };
                ws.onerror = () => resolve({ url, latency: Infinity });
            });
        });

        // Race with timeout? No, just wait for all settled or race them.
        // Simple race:
        const results = await Promise.all(pings);
        const best = results.sort((a, b) => a.latency - b.latency)[0];

        if (best.latency === Infinity) throw new Error("No available shards");
        console.log(`⚡ Best Edge Found: ${best.url} (${best.latency}ms)`);
        return best.url;
    }

    async connect() {
        if (this.ws && (this.ws.readyState === WebSocket.CONNECTING || this.ws.readyState === WebSocket.OPEN)) {
            return Promise.resolve();
        }

        try {
            // Select best shard if not already selected (or if reconnecting from scratch)
            if (!this.currentShard) {
                try {
                    this.currentShard = await this.findBestRelay();
                } catch (e) {
                    console.warn("⚠️ Edge discovery failed, using default primary");
                    this.currentShard = this.shards[0];
                }
            }

            return new Promise((resolve, reject) => {
                this.ws = new WebSocket(this.currentShard);

                this.ws.onopen = () => {
                    console.log(`✅ Connected to Relay Node: ${this.currentShard}`);
                    this.connected = true;
                    this.reconnectAttempts = 0;
                    this.flushQueue();
                    resolve();
                };

                this.ws.onmessage = (event) => {
                    try {
                        const msg = JSON.parse(event.data);

                        // Handle Multiplexed Streams
                        if (msg.type === 'MULTIPLEX') {
                            this.handleStream(msg);
                            return;
                        }

                        console.log('📩 Received:', msg.type);
                        if (this.callbacks[msg.type]) {
                            this.callbacks[msg.type](msg);
                        }
                    } catch (e) {
                        console.error('Message parse error:', e);
                    }
                };

                this.ws.onclose = () => {
                    console.log('❌ Connection lost');
                    this.connected = false;
                    this.attemptReconnect();
                };

                this.ws.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    // Only reject if it's the initial explicit connect call
                    if (this.reconnectAttempts === 0 && !this.connected) reject(error);
                };
            });
        } catch (e) {
            console.error("Connection Fatal Error", e);
        }
    }

    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            // Rotate shards on failure
            const nextShardIndex = (this.shards.indexOf(this.currentShard) + 1) % this.shards.length;
            this.currentShard = this.shards[nextShardIndex];

            const delay = Math.min(30000, (Math.pow(2, this.reconnectAttempts) * this.baseReconnectDelay) + (Math.random() * 1000));
            this.reconnectAttempts++;

            console.log(`🔄 Switching Shard -> ${this.currentShard}`);
            console.log(`⏳ Reconnecting in ${Math.floor(delay)}ms... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

            if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = setTimeout(() => {
                this.connect().catch(() => console.warn('Retrying...'));
            }, delay);
        } else {
            console.error('Max reconnection attempts reached');
            if (this.callbacks['CONNECTION_LOST']) this.callbacks['CONNECTION_LOST']();
        }
    }

    // --- MULTIPLEXING ---
    multiplex(channel, payload, targetId = null) {
        this.send({
            type: 'MULTIPLEX',
            channel,
            targetId, // If null, broadcasts to session (Fanout)
            payload,
            timestamp: Date.now()
        });
    }

    onStream(channel, callback) {
        this.streamHandlers[channel] = callback;
    }

    handleStream(msg) {
        const handler = this.streamHandlers[msg.channel];
        if (handler) {
            handler(msg.payload, msg.from);
        } else {
            console.warn(`No handler for channel: ${msg.channel}`);
        }
    }

    send(message) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        } else {
            console.warn('⚠️ Queuing offline message:', message.type);
            this.messageQueue.push(message);
        }
    }

    flushQueue() {
        if (this.messageQueue.length > 0) {
            console.log(`🚀 Flushing ${this.messageQueue.length} offline messages...`);
            while (this.messageQueue.length > 0 && this.ws.readyState === WebSocket.OPEN) {
                const msg = this.messageQueue.shift();
                this.ws.send(JSON.stringify(msg));
            }
        }
    }

    registerHost(hostId) {
        console.log(`📡 Registering host: ${hostId}`);
        this.send({ type: 'HOST_REGISTER', id: hostId });
    }

    registerGuest(guestId) {
        console.log(`📡 Registering guest: ${guestId}`);
        this.send({ type: 'GUEST_REGISTER', id: guestId });
    }

    claimHost(hostId, guestId) {
        console.log(`📡 Claiming host: ${hostId} by guest: ${guestId}`);
        this.send({ type: 'CLAIM_HOST', hostId, guestId });
    }

    heartbeat(id) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.send({ type: 'HEARTBEAT', id });
        }
    }

    on(eventType, callback) {
        this.callbacks[eventType] = callback;
    }

    disconnect() {
        if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
        if (this.ws) {
            this.ws.onclose = null;
            this.ws.close();
            this.ws = null;
            this.connected = false;
        }
    }
}

export default new PeerRelay();
