use std::io::{self, Read, Write};
use std::net::TcpStream;
use tracing::info;

pub struct TracedTcpStream {
    inner: TcpStream,
    peer_addr: String,
}

impl TracedTcpStream {
    pub fn connect(addr: &str) -> io::Result<Self> {
        info!(target: "net::tcp", "Connecting to {}...", addr);
        let stream = TcpStream::connect(addr)?;
        info!(target: "net::tcp", "Connected.");
        Ok(Self { inner: stream, peer_addr: addr.to_string() })
    }
}

impl Read for TracedTcpStream {
    fn read(&mut self, buf: &mut [u8]) -> io::Result<usize> {
        let n = self.inner.read(buf)?;
        info!(target: "net::tcp", "Read {} bytes from {}", n, self.peer_addr);
        Ok(n)
    }
}

impl Write for TracedTcpStream {
    fn write(&mut self, buf: &[u8]) -> io::Result<usize> {
        let n = self.inner.write(buf)?;
        info!(target: "net::tcp", "Wrote {} bytes to {}", n, self.peer_addr);
        Ok(n)
    }

    fn flush(&mut self) -> io::Result<()> {
        self.inner.flush()
    }
}
