class ManualPeerService {
    constructor() {
        this.peerConnection = null;
        this.dataChannel = null;
        this.callbacks = {};
        this.role = null;

        // Configuration for public STUN servers to allow WAN connections without a dedicated TURN server
        // This relies on the "website only" constraint using free public infra.
        this.config = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' }
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

    // Wait for ICE gathering with a timeout race
    async _waitForGathering() {
        if (this.peerConnection.iceGatheringState === 'complete') {
            return this._encodeSDP(this.peerConnection.localDescription);
        }

        const gatheringPromise = new Promise(resolve => {
            const checkIce = () => {
                if (this.peerConnection.iceGatheringState === 'complete') {
                    this.peerConnection.removeEventListener('icegatheringstatechange', checkIce);
                    resolve(this.peerConnection.localDescription);
                }
            };
            this.peerConnection.addEventListener('icegatheringstatechange', checkIce);
        });

        // Race: Wait max 800ms for candidates to gather, then just take what we have.
        // This speeds up the UX significantly while usually capturing local/STUN candidates.
        const timeoutPromise = new Promise(resolve =>
            setTimeout(() => resolve(this.peerConnection.localDescription), 800)
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
