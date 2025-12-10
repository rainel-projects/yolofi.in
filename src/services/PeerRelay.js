class PeerRelay {
    constructor() {
        this.ws = null;
        this.callbacks = {};
        this.connected = false;

        // Reliability
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 10;
        this.baseReconnectDelay = 1000;

        // Message Queueing for Offline Resilience
        this.messageQueue = [];
        this.reconnectTimeout = null;
    }

    connect(url = 'ws://localhost:8080') {
        if (this.ws && (this.ws.readyState === WebSocket.CONNECTING || this.ws.readyState === WebSocket.OPEN)) {
            return Promise.resolve(); // Already connected/connecting
        }

        return new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket(url);

                this.ws.onopen = () => {
                    console.log('✅ Connected to relay server');
                    this.connected = true;
                    this.reconnectAttempts = 0;
                    this.flushQueue(); // Send any offline messages
                    resolve();
                };

                this.ws.onmessage = (event) => {
                    try {
                        const msg = JSON.parse(event.data);
                        console.log('📩 Received:', msg.type);

                        if (this.callbacks[msg.type]) {
                            this.callbacks[msg.type](msg);
                        }
                    } catch (e) {
                        console.error('Message parse error:', e);
                    }
                };

                this.ws.onclose = () => {
                    console.log('❌ Disconnected from relay server');
                    this.connected = false;
                    this.attemptReconnect(url);
                };

                this.ws.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    // Don't reject here usually, let onclose handle reconnect, 
                    // unless it's the initial connection attempt.
                    if (this.reconnectAttempts === 0 && !this.connected) {
                        reject(error);
                    }
                };

            } catch (error) {
                reject(error);
            }
        });
    }

    attemptReconnect(url) {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            // Exponential Backoff + Jitter
            const delay = Math.min(30000, (Math.pow(2, this.reconnectAttempts) * this.baseReconnectDelay) + (Math.random() * 1000));

            this.reconnectAttempts++;
            console.log(`🔄 Reconnecting in ${Math.floor(delay)}ms... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

            if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);

            this.reconnectTimeout = setTimeout(() => {
                this.connect(url).catch(() => {
                    console.warn('Reconnection failed, retrying...');
                    // attemptReconnect will be called again by onclose logic if connect fails
                });
            }, delay);
        } else {
            console.error('Max reconnection attempts reached');
            if (this.callbacks['CONNECTION_LOST']) {
                this.callbacks['CONNECTION_LOST']();
            }
        }
    }

    send(message) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        } else {
            console.warn('⚠️ WebSocket not ready. Queuing message:', message.type);
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
        // Don't queue heartbeats, if we are offline we are offline
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
            this.ws.onclose = null; // Prevent reconnect loop on intentional disconnect
            this.ws.close();
            this.ws = null;
            this.connected = false;
        }
    }
}

export default new PeerRelay();
