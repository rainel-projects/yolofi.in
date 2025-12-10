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

        // Wait for ICE gathering to complete
        return new Promise((resolve) => {
            if (this.peerConnection.iceGatheringState === 'complete') {
                resolve(this._encodeSDP(this.peerConnection.localDescription));
            } else {
                const checkIce = () => {
                    if (this.peerConnection.iceGatheringState === 'complete') {
                        this.peerConnection.removeEventListener('icegatheringstatechange', checkIce);
                        resolve(this._encodeSDP(this.peerConnection.localDescription));
                    }
                };
                this.peerConnection.addEventListener('icegatheringstatechange', checkIce);
            }
        });
    }

    // GUEST: Process Offer and Generate Answer
    async generateAnswer(offerStr) {
        this.role = 'GUEST';
        this._initConnection();

        const offer = this._decodeSDP(offerStr);
        await this.peerConnection.setRemoteDescription(offer);

        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);

        // Wait for ICE gathering
        return new Promise((resolve) => {
            if (this.peerConnection.iceGatheringState === 'complete') {
                resolve(this._encodeSDP(this.peerConnection.localDescription));
            } else {
                const checkIce = () => {
                    if (this.peerConnection.iceGatheringState === 'complete') {
                        this.peerConnection.removeEventListener('icegatheringstatechange', checkIce);
                        resolve(this._encodeSDP(this.peerConnection.localDescription));
                    }
                };
                this.peerConnection.addEventListener('icegatheringstatechange', checkIce);
            }
        });
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
