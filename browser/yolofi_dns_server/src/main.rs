use std::net::UdpSocket;
use tracing::{info, warn};

// Sovereign Local DNS Server
// Intercepts traffic, logs it, and forwards securely.

const LOCAL_BIND: &str = "127.0.0.1:5353";
const UPSTREAM_DNS: &str = "9.9.9.9:53"; // Quad9 (Privacy focused, non-Google/CF)

fn main() -> std::io::Result<()> {
    tracing_subscriber::fmt::init();
    
    info!("Starting YoloFi Sovereign DNS Server...");
    info!("Listening on: {}", LOCAL_BIND);
    info!("Upstream (Privacy): {}", UPSTREAM_DNS);

    let socket = UdpSocket::bind(LOCAL_BIND)?;

    let mut buf = [0u8; 512];

    loop {
        match socket.recv_from(&mut buf) {
            Ok((amt, src)) => {
                let query = &buf[..amt];
                
                // Simple logging of the transaction (Proof of Ownership)
                // In a real implementation we would parse the headers to show the domain name here
                info!("Recv {} bytes from Browser ({}). Forwarding...", amt, src);

                // 1. Forward to Upstream
                let upstream_socket = UdpSocket::bind("0.0.0.0:0")?;
                upstream_socket.set_read_timeout(Some(std::time::Duration::from_secs(2)))?;
                
                if let Err(e) = upstream_socket.send_to(query, UPSTREAM_DNS) {
                    warn!("Failed to send to upstream: {}", e);
                    continue;
                }

                // 2. Receive Response
                let mut resp_buf = [0u8; 512];
                match upstream_socket.recv_from(&mut resp_buf) {
                    Ok((resp_amt, _resp_src)) => {
                        info!("Got response from Quad9. Relaying to Browser...");
                        // 3. Send back to Browser
                        socket.send_to(&resp_buf[..resp_amt], src)?;
                    }
                    Err(e) => {
                        warn!("Upstream timeout/error: {}", e);
                    }
                }
            }
            Err(e) => {
                warn!("Socket error: {}", e);
            }
        }
    }
}
