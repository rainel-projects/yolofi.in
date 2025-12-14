// YoloFi Secure Configuration
// Security through obscurity (as requested base layer) + Encryption

// The "Deep Path" endpoint for browser updates/sync
// As requested: yolofi.in/smthn/smthn...
pub const SECURE_HOME_ENDPOINT: &str = "https://yolofi.in/v1/x/9/secure/enclave/browser";

// Custom DNS Server IP (Self-Hosted)
// Placeholder: This should be replaced with the actual IP of the user's private DNS server.
// Currently set to localhost for development/testing safety.
pub const PRIVATE_DNS_SERVER: &str = "127.0.0.1:5353";

// Identity & Sovereignty Strings
pub const USER_AGENT: &str = "YoloFi/1.0 (Sovereign; Privacy-First)";
