import { db } from "../firebase/config";

class PeerRelay {
    constructor() {
        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const hostname = window.location.hostname;
        const port = 8080;

        // Dynamic URL based on where the app is served from
        // If VITE_RELAY_URL is set, use it. Otherwise, construct likely URL.
        // If testing on 'yolofi.in', using 'wss://yolofi.in:8080' is a good default assumption if not overridden.
        // But for localhost, we stick to standard.
        this.signalingUrl = import.meta.env.VITE_RELAY_URL || `${protocol}://${hostname}:${port}`;

        this.ws = null;
        this.peers = new Map(); // guestId -> RTCPeerConnection
        this.dataChannels = new Map(); // guestId -> RTCDataChannel

        this.myRole = null;
        this.myKey = null;
        this.connectedHostKey = null;

        this.callbacks = {};

        this.iceServers = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:global.stun.twilio.com:3478' }
            ]
        };
    }

    // --- 1. CONNECT TO SIGNALING SERVER ---
    connect() {
        if (this.ws && (this.ws.readyState === WebSocket.OPEN)) return Promise.resolve();

        return new Promise((resolve, reject) => {
            console.log(`🔌 Connecting to Signaling: ${this.signalingUrl}`);
            this.ws = new WebSocket(this.signalingUrl);

            this.ws.onopen = () => {
                console.log('✅ Connected to Signaling Server');
                resolve();
            };

            this.ws.onmessage = (event) => this.handleSignalMessage(JSON.parse(event.data));

            this.ws.onerror = (err) => {
                console.error('Signaling Error:', err);
                // Only reject if initial connect
                if (!this.ws || this.ws.readyState !== WebSocket.OPEN) reject(err);
            };

            this.ws.onclose = () => {
                console.warn('❌ Signaling Disconnected');
                // Auto-reconnect logic could go here
            };
        });
    }

    // --- 2. REGISTRATION ---
    registerHost(key) {
        this.myRole = 'HOST';
        this.myKey = key;
        this.sendSignal({ type: 'REGISTER', key });
    }

    joinHost(key) {
        this.myRole = 'GUEST';
        this.connectedHostKey = key;
        this.sendSignal({ type: 'JOIN', key });
    }

    // --- 3. SIGNALING HANDLER ---
    async handleSignalMessage(msg) {
        // console.log('📩 Signal:', msg.type);

        switch (msg.type) {
            case 'GUEST_JOINED':
                // Host receives this. Initiate P2P to this Guest.
                console.log(`👤 New Guest: ${msg.guestId}. Initiating P2P...`);
                // Create Offer
                this.createPeerConnection(msg.guestId, true);
                break;

            case 'SIGNAL':
                // Routing P2P signals (SDP / ICE)
                const { from, payload } = msg;
                if (!this.peers.has(from)) {
                    // Guest receives Offer -> Create PC (Passive)
                    this.createPeerConnection(from, false);
                }

                const pc = this.peers.get(from);

                if (payload.sdp) {
                    await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
                    if (payload.sdp.type === 'offer') {
                        const answer = await pc.createAnswer();
                        await pc.setLocalDescription(answer);
                        this.sendTargetSignal(from, { sdp: pc.localDescription });
                    }
                } else if (payload.ice) {
                    try {
                        if (payload.ice) await pc.addIceCandidate(new RTCIceCandidate(payload.ice));
                    } catch (e) { console.error('ICE Error', e); }
                }
                break;

            case 'ERROR':
                console.error('Signaling Error:', msg.message);
                if (this.callbacks['ERROR']) this.callbacks['ERROR'](msg.message);
                break;
        }
    }

    // --- 4. WEBRTC CORE ---
    createPeerConnection(peerId, isInitiator) {
        console.log(`🛠️ Creating PC for ${peerId} (Initiator: ${isInitiator})`);

        const pc = new RTCPeerConnection(this.iceServers);
        this.peers.set(peerId, pc);

        // ICE Candidates
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                this.sendTargetSignal(peerId, { ice: event.candidate });
            }
        };

        pc.onconnectionstatechange = () => {
            console.log(`📶 Connection State (${peerId}): ${pc.connectionState}`);
            if (pc.connectionState === 'connected') {
                if (this.callbacks['CONNECTED']) this.callbacks['CONNECTED'](peerId);
            }
        };

        if (isInitiator) {
            // Host creates Data Channel
            const dc = pc.createDataChannel("yolofi_sync");
            this.setupDataChannel(dc, peerId);

            // Create Offer
            pc.createOffer().then(offer => {
                pc.setLocalDescription(offer);
                this.sendTargetSignal(peerId, { sdp: offer });
            });
        } else {
            // Guest waits for Data Channel
            pc.ondatachannel = (event) => {
                this.setupDataChannel(event.channel, peerId);
            };
        }
    }

    setupDataChannel(dc, peerId) {
        console.log(`⚡ DataChannel Setup for ${peerId}`);
        this.dataChannels.set(peerId, dc);

        dc.onopen = () => {
            console.log(`🚀 DataChannel OPEN with ${peerId}`);
            if (this.callbacks['READY']) this.callbacks['READY'](peerId);
        };

        dc.onmessage = (event) => {
            const data = JSON.parse(event.data);
            // console.log('📨 P2P Message:', data);

            // Route to Application Callbacks
            if (data.type && this.callbacks[data.type]) {
                this.callbacks[data.type](data.payload, peerId);
            }
        };

        dc.onclose = () => {
            console.log('🚫 DataChannel Closed');
            this.dataChannels.delete(peerId);
            this.peers.delete(peerId);
        };
    }

    // --- 5. PUBLIC API ---
    // Broadcast to all connected peers
    multiplex(type, payload) {
        const msg = JSON.stringify({ type, payload });
        this.dataChannels.forEach(dc => {
            if (dc.readyState === 'open') dc.send(msg);
        });
    }

    // Send to specific peer
    sendTo(peerId, type, payload) {
        const dc = this.dataChannels.get(peerId);
        if (dc && dc.readyState === 'open') {
            dc.send(JSON.stringify({ type, payload }));
        }
    }

    // Helper: Send to Signaling Server
    sendSignal(msg) {
        if (this.ws.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify(msg));
    }

    // Helper: Send targeted Signal (via Server)
    sendTargetSignal(targetId, payload) {
        this.sendSignal({
            type: 'SIGNAL',
            targetId,
            payload
        });
    }

    on(event, cb) {
        this.callbacks[event] = cb;
    }

    // Alias for old code compatibility
    onStream(type, cb) {
        this.on(type, cb);
    }

    // Heartbeat Placeholder (WebRTC doesn't strictly need app-level heartbeat if ICE checks are active, but for keeping signaling alive)
    heartbeat(id) {
        // Keep signaling socket alive if needed
    }
}

export default new PeerRelay();
