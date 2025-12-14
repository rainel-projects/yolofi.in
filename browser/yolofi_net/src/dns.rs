use std::net::UdpSocket;
use std::time::Duration;
use tracing::{info, warn};

use yolofi_config::PRIVATE_DNS_SERVER;

const CURRENT_DNS_SERVER: &str = PRIVATE_DNS_SERVER;

pub struct DnsResolver {
    socket: UdpSocket,
}

impl DnsResolver {
    pub fn new() -> std::io::Result<Self> {
        let socket = UdpSocket::bind("0.0.0.0:0")?;
        socket.set_read_timeout(Some(Duration::from_secs(2)))?;
        Ok(Self { socket })
    }

    pub fn resolve(&self, domain: &str) -> std::io::Result<String> {
        info!(target: "net::dns", "Resolving {} via {}", domain, CURRENT_DNS_SERVER);

        let query = self.build_query(domain);
        self.socket.send_to(&query, CURRENT_DNS_SERVER)?;

        let mut buffer = [0u8; 512];
        let (amt, _src) = self.socket.recv_from(&mut buffer)?;

        let response = &buffer[..amt];
        self.parse_response(response)
    }

    fn build_query(&self, domain: &str) -> Vec<u8> {
        let mut packet = Vec::with_capacity(512);

        // Header
        let id = 0x1234u16; // Fixed ID for now (Todo: randomize)
        packet.extend_from_slice(&id.to_be_bytes());
        packet.extend_from_slice(&0x0100u16.to_be_bytes()); // Flags: Standard Query, Recursion Desired
        packet.extend_from_slice(&0x0001u16.to_be_bytes()); // QDCOUNT: 1
        packet.extend_from_slice(&0x0000u16.to_be_bytes()); // ANCOUNT: 0
        packet.extend_from_slice(&0x0000u16.to_be_bytes()); // NSCOUNT: 0
        packet.extend_from_slice(&0x0000u16.to_be_bytes()); // ARCOUNT: 0

        // Question Section
        for part in domain.split('.') {
            packet.push(part.len() as u8);
            packet.extend_from_slice(part.as_bytes());
        }
        packet.push(0); // Root null byte

        packet.extend_from_slice(&0x0001u16.to_be_bytes()); // QTYPE: A (Host Address)
        packet.extend_from_slice(&0x0001u16.to_be_bytes()); // QCLASS: IN

        packet
    }

    fn parse_response(&self, buffer: &[u8]) -> std::io::Result<String> {
        // Very minimal parser. Skips header and question to find Answer.
        // Todo: Full RFC 1035 compliance.

        if buffer.len() < 12 {
            return Err(std::io::Error::new(std::io::ErrorKind::InvalidData, "Packet too short"));
        }

        // Skip Header (12 bytes)
        let mut pos = 12;

        // Skip Question
        // Find null byte
        while pos < buffer.len() {
            let label_len = buffer[pos];
            pos += 1;
            if label_len == 0 {
                break;
            }
            pos += label_len as usize;
        }
        pos += 4; // Skip QTYPE and QCLASS

        // Now at Answer section
        if pos >= buffer.len() {
             return Err(std::io::Error::new(std::io::ErrorKind::NotFound, "No answer section"));
        }

        // Name ptr (usually 0xc0...)
        if buffer[pos] & 0xC0 == 0xC0 {
            pos += 2;
        } else {
             // scan labels again... (omitted for brevity in v0.1)
             // simplified: assume pointer
             return Err(std::io::Error::new(std::io::ErrorKind::Unsupported, "Complex response parsing not impl"));
        }

        pos += 2; // Type
        pos += 2; // Class
        pos += 4; // TTL
        
        let rdlength = u16::from_be_bytes([buffer[pos], buffer[pos + 1]]) as usize;
        pos += 2;

        if rdlength == 4 {
             let ip = format!("{}.{}.{}.{}", buffer[pos], buffer[pos+1], buffer[pos+2], buffer[pos+3]);
             info!(target: "net::dns", "Resolved to {}", ip);
             Ok(ip)
        } else {
             warn!("Not an A record");
             Err(std::io::Error::new(std::io::ErrorKind::InvalidData, "Not an A record"))
        }
    }
}

pub fn resolve(host: &str) -> String {
    let resolver = DnsResolver::new().expect("Failed to bind UDP socket");
    resolver.resolve(host).unwrap_or_else(|e| {
        warn!("DNS resolution failed: {}", e);
        "0.0.0.0".to_string()
    })
}
