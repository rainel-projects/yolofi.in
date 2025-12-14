use std::collections::HashMap;
use tracing::{debug, info};

#[derive(Debug)]
pub struct HttpRequest {
    pub method: String,
    pub path: String,
    pub headers: HashMap<String, String>,
}

#[derive(Debug)]
pub struct HttpResponse {
    pub status: u16,
    pub headers: HashMap<String, String>,
    pub body: Vec<u8>,
}

impl HttpResponse {
    pub fn parse(bytes: &[u8]) -> Option<Self> {
        let text = String::from_utf8_lossy(bytes);
        
        // Find double newline splitting headers and body
        let split_idx = bytes.windows(4).position(|w| w == b"\r\n\r\n")?;
        
        let header_part = &text[..split_idx];
        let body_part = &bytes[split_idx + 4..];

        let mut lines = header_part.lines();
        let status_line = lines.next()?;
        
        // Parse Status Line: "HTTP/1.1 200 OK"
        let parts: Vec<&str> = status_line.split_whitespace().collect();
        if parts.len() < 2 { return None; }
        let status = parts[1].parse::<u16>().ok()?;
        
        let mut headers = HashMap::new();
        for line in lines {
            if let Some((key, value)) = line.split_once(':') {
                headers.insert(key.trim().to_string(), value.trim().to_string());
            }
        }

        info!(target: "net::http", "Parsed response: {} Status {}", parts[0], status);
        
        Some(HttpResponse {
            status,
            headers,
            body: body_part.to_vec(),
        })
    }
}

pub fn build_get_request(host: &str, path: &str) -> Vec<u8> {
    let request = format!(
        "GET {} HTTP/1.1\r\nHost: {}\r\nUser-Agent: YolofiBrowser/0.1\r\nConnection: close\r\n\r\n",
        path, host
    );
    debug!(target: "net::http", "Built Request:\n{}", request.trim());
    request.into_bytes()
}
