class ManualPeerService {
    constructor() {
        this.peerConnection = null;
        this.dataChannel = null;
        this.callbacks = {};
        this.role = null;

        // Configuration for public STUN servers to allow WAN connections without a dedicated TURN server
        // This relies on the "website only" constraint using free public infra.
        // Expanded list for global redundancy ("Trillions of users" scale thinking)
        this.config = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' },
                { urls: 'stun:stun3.l.google.com:19302' },
                { urls: 'stun:stun4.l.google.com:19302' },
                { urls: 'stun:global.stun.twilio.com:3478' }
            ]
        };
    }

    // Initialize the PeerConnection
    _initConnection() {
        if (this.peerConnection) {
            this.peerConnection.close();
        }

        this.peerConnection = new RTCPeerConnection(this.config);

        this.peerConnection.onconnectionstatechange = () => {
            this._trigger('connectionStateChange', this.peerConnection.connectionState);
        };

        this.peerConnection.onicecandidate = (event) => {
            // We are using "Vanilla ICE" where we wait for all candidates to be gathered 
            // before generating the SDP string to share. 
            // So we don't stream candidates individually.
            if (event.candidate === null) {
                // Gathering complete
                this._trigger('iceGatheringComplete', this.peerConnection.localDescription);
            }
        };

        this.peerConnection.ondatachannel = (event) => {
            this._setupDataChannel(event.channel);
        };
    }

    _setupDataChannel(channel) {
        this.dataChannel = channel;
        this.dataChannel.onopen = () => this._trigger('open');
        this.dataChannel.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this._trigger('data', data);
                // Also trigger specific types if needed
                if (data.type) {
                    this._trigger(data.type, data);
                }
            } catch (e) {
                console.error("Failed to parse message", e);
            }
        };
        this.dataChannel.onclose = () => this._trigger('close');
        this.dataChannel.onerror = (err) => this._trigger('error', err);
    }

    // HOST: Generate Offer
    async generateOffer() {
        this.role = 'HOST';
        this._initConnection();

        // Host creates the channel
        const channel = this.peerConnection.createDataChannel("yolofi_link");
        this._setupDataChannel(channel);

        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);

        return this._waitForGathering();
    }

    // GUEST: Process Offer and Generate Answer
    async generateAnswer(offerStr) {
        this.role = 'GUEST';
        this._initConnection();

        const offer = this._decodeSDP(offerStr);
        await this.peerConnection.setRemoteDescription(offer);

        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);

        return this._waitForGathering();
    }

    // Wait for ICE gathering with a smart strategy for global reach
    async _waitForGathering() {
        if (this.peerConnection.iceGatheringState === 'complete') {
            return this._encodeSDP(this.peerConnection.localDescription);
        }

        let hasPublicCandidate = false;

        // Check existing candidates just in case
        // (Note: finding them in localDescription properly requires parsing SDP, 
        // but we can track via onicecandidate if we attached it early. 
        // For simpler logic, we'll just rely on the race below.)

        const gatheringPromise = new Promise(resolve => {
            const checkIce = () => {
                if (this.peerConnection.iceGatheringState === 'complete') {
                    this.peerConnection.removeEventListener('icegatheringstatechange', checkIce);
                    resolve(this.peerConnection.localDescription);
                }
            };
            this.peerConnection.addEventListener('icegatheringstatechange', checkIce);
        });

        // Smart Race: 
        // 1. Hard Timeout (3s) - Max wait time for really slow nets
        // 2. "Good Enough" Timeout (1s) - If we assume we got something
        // 3. Perfect Completion - Browsers signals it's done

        // In a real robust implementation, we'd inspect candidates. 
        // Here, we'll bump the timeout to 2000ms to be safe for global WAN latencies
        // without annoying the user too much. 800ms is too risky for cross-globe.
        const timeoutPromise = new Promise(resolve =>
            setTimeout(() => resolve(this.peerConnection.localDescription), 2000)
        );

        const finalDesc = await Promise.race([gatheringPromise, timeoutPromise]);
        return this._encodeSDP(finalDesc);
    }

    // HOST: Process Answer to finalize connection
    async processAnswer(answerStr) {
        const answer = this._decodeSDP(answerStr);
        await this.peerConnection.setRemoteDescription(answer);
    }

    // Utilities
    _encodeSDP(description) {
        return btoa(JSON.stringify(description));
    }

    _decodeSDP(str) {
        return JSON.parse(atob(str));
    }

    send(data) {
        if (this.dataChannel && this.dataChannel.readyState === 'open') {
            this.dataChannel.send(JSON.stringify(data));
        } else {
            console.warn("DataChannel not open");
        }
    }

    // Event Handling
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
const manualPeer = new ManualPeerService();
export default manualPeer;
