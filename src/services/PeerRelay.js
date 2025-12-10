class PeerRelay {
    constructor() {
        this.ws = null;
        this.callbacks = {};
        this.connected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
    }

    connect(url = 'ws://localhost:8080') {
        return new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket(url);

                this.ws.onopen = () => {
                    console.log('✅ Connected to relay server');
                    this.connected = true;
                    this.reconnectAttempts = 0;
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
                    reject(error);
                };

            } catch (error) {
                reject(error);
            }
        });
    }

    attemptReconnect(url) {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`🔄 Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

            setTimeout(() => {
                this.connect(url).catch(() => {
                    console.warn('Reconnection failed');
                });
            }, 2000 * this.reconnectAttempts);
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
            console.error('WebSocket not ready');
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
        this.send({ type: 'HEARTBEAT', id });
    }

    on(eventType, callback) {
        this.callbacks[eventType] = callback;
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
            this.connected = false;
        }
    }
}

export default new PeerRelay();
