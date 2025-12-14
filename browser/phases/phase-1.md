# Phase 1: Own The Internet Pipe
**Timeline**: Weeks 1-3
**Status**: PENDING

## Objectives
Build the networking stack from scratch. **No system DNS. No `reqwest`. No `curl`.**
We must own the bytes to ensure:
1.  **Privacy**: No leaks to OS resolvers.
2.  **Determinism**: We can record and replay network packets exactly.
3.  **Sovereignty**: We control the root of trust.

## Architecture

### 1. DNS Resolver (`yolofi_net::dns`)
*   **Input**: Hostname (e.g., `yolofi.in`)
*   **Logic**:
    *   Construct raw DNS query packet (UDP).
    *   Send to specific resolver (e.g., 1.1.1.1 or 9.9.9.9, configurable).
    *   Parse raw response.
    *   Cache result in-memory (Deterministic TTL).
*   **Output**: IP Address.
*   **Forbidden**: `std::net::ToSocketAddrs`.

### 2. TCP Construction (`yolofi_net::tcp`)
*   Zero-dependency TCP stream management if possible, or standard `TcpStream` wrapped with strict observability.
*   Ideally: Raw socket management for full timing control.
*   For Week 1: `std::net::TcpStream` is acceptable *if* wrapped in a `TraceStream` that logs every byte read/written.

### 3. TLS Handshake (`yolofi_net::tls`)
*   **Hardest Part**.
*   Use `rustls` (acceptable dependency as it is pure Rust and auditable) OR implement basic TLS 1.3 handshake if "extreme scratch" mode is active. *Recommendation: Use `rustls` for security, but wrap verification logic manually.*
*   **Constraint**: We must verify the certificate chain manually against our own "Trust Store", not the OS store.

### 4. HTTP/1.1 Parser (`yolofi_net::http`)
*   **Input**: Byte stream.
*   **Logic**: State machine parser.
    *   `RequestLine`
    *   `Headers`
    *   `Body` (Chunked transfer encoding support).
*   **Output**: `HttpRequest` / `HttpResponse` structs.

## Verification
*   **Test**: `./yolofi_browser fetch http://example.com`
*   **Success**:
    1.  Log shows DNS query sent/received.
    2.  Log shows TCP handshake.
    3.  Log shows valid HTTP request bytes.
    4.  Log shows HTML body printed to stdout.
