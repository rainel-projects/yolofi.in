pub mod dns;
pub mod tcp;
pub mod tls;
pub mod http;

pub fn init() {
    tracing::info!("Networking stack initialized.");
}
