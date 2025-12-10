import { joinRoom } from 'trystero';

class SwarmPeerService {
    constructor() {
        this.room = null;
        this.peers = {}; // Map of peerId -> peerInfo
        this.callbacks = {};
        this.role = null;
        this.myId = Math.random().toString(36).substr(2, 9);
        this.connectedPeerId = null;

        // Actions
        this.sendData = null; // Function assigned by trystero
    }

    // Connect to the Global Swarm
    connectToSwarm(role) {
        this.role = role;
        // Use a fixed App ID and Room ID for the "Global Abstract Environment"
        // In production for trillions, we'd use sharding (e.g. 'yolofi-lobby-' + region)
        const config = { appId: 'yolofi-global-network' };
        this.room = joinRoom(config, 'main-lobby');

        // Setup Actions
        const [sendData, getAction] = this.room.makeAction('session');
        this.sendData = sendData;

        // Listen for new peers in the swarm
        this.room.onPeerJoin(peerId => {
            console.log(`Swarm: Peer ${peerId} joined`);
            this._trigger('peer-joined', peerId);
            // Announce ourselves immediately
            this.broadcastStatus();
        });

        this.room.onPeerLeave(peerId => {
            console.log(`Swarm: Peer ${peerId} left`);
            delete this.peers[peerId];
            this._trigger('peer-left', peerId);
            this._trigger('peers-update', Object.values(this.peers));
        });

        // Handle incoming data
        getAction((data, peerId) => {
            this._handleMessage(data, peerId);
        });

        console.log(`Joined Swarm as ${this.role} (${this.myId})`);

        // Initial broadcast
        setTimeout(() => this.broadcastStatus(), 500);
        setTimeout(() => this.broadcastStatus(), 2000); // Retry for stability
    }

    broadcastStatus() {
        if (!this.room) return;
        // Broadcast my existence and role
        const status = {
            type: 'ANNOUNCE',
            role: this.role,
            id: this.myId,
            timestamp: Date.now()
        };
        // Trystero broadcasts to all by default if no target
        this.sendData(status);
    }

    connectToPeer(targetPeerId) {
        // In Trystero, we are already "connected" via the room for small data.
        // For the high-bandwidth "Link", we essentially just designate this peer as our target
        // and start a focused session.
        console.log(`Initiating Direct Link to ${targetPeerId}`);
        this.connectedPeerId = targetPeerId;

        // Send a direct handshake
        this.sendData({
            type: 'HANDSHAKE_INIT',
            from: this.myId
        }, targetPeerId);
    }

    send(data) {
        if (this.sendData && this.connectedPeerId) {
            // Send specifically to the connected peer
            this.sendData(data, this.connectedPeerId);
        } else {
            console.warn("Cannot send: No active swarm link");
        }
    }

    _handleMessage(data, peerId) {
        // 1. Discovery Updates
        if (data.type === 'ANNOUNCE') {
            this.peers[peerId] = { ...data, trysteroId: peerId };
            this._trigger('peers-update', Object.values(this.peers));
            return;
        }

        // 2. Direct Handshakes
        if (data.type === 'HANDSHAKE_INIT') {
            if (this.role === 'HOST' || (this.role === 'GUEST' && !this.connectedPeerId)) {
                // Accept connection
                this.connectedPeerId = peerId;
                this._trigger('connection-request', peerId);

                // Auto-reply ACK
                this.sendData({ type: 'HANDSHAKE_ACK', from: this.myId }, peerId);

                // Trigger 'open' to simulate the data channel opening
                setTimeout(() => this._trigger('open', peerId), 500);
            }
        }
        else if (data.type === 'HANDSHAKE_ACK') {
            if (this.connectedPeerId === peerId) {
                console.log("Handshake Accepted!");
                this._trigger('open', peerId);
            }
        }

        // 3. Application Data (Simulating the DataChannel 'data' event)
        // LinkSystem/RemoteView expect { channel: 'cmd', ... } etc.
        if (data.channel || data.type === 'state-update') {
            // Verify source
            if (peerId === this.connectedPeerId) {
                this._trigger('data', data);
            }
        }
    }

    leave() {
        if (this.room) {
            this.room.leave();
            this.room = null;
        }
    }

    // Event System
    on(event, callback) {
        if (!this.callbacks[event]) this.callbacks[event] = [];
        this.callbacks[event].push(callback);
    }

    off(event, callback) {
        if (!this.callbacks[event]) return;
        this.callbacks[event] = this.callbacks[event].filter(cb => cb !== callback);
    }

    _trigger(event, payload) {
        if (this.callbacks[event]) {
            this.callbacks[event].forEach(cb => cb(payload));
        }
    }
}

// Singleton
const swarmPeer = new SwarmPeerService();
export default swarmPeer;
