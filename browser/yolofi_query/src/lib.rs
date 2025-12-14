use tracing::info;

pub enum NavigationAction {
    DirectUrl(String),
    SearchFallback(String), // If we really can't figure it out (should be minimized)
}

pub struct IntentRouter;

impl IntentRouter {
    pub fn resolve(query: &str) -> NavigationAction {
        info!("Analyzing Intent: '{}'", query);
        let q_lower = query.to_lowercase();
        let parts: Vec<&str> = q_lower.split_whitespace().collect();

        // 1. Crypto Prices (Direct Data)
        // Query: "price btc" -> CoinGecko
        if parts.len() >= 2 && (parts[0] == "price" || parts[0] == "value") {
            let ticker = parts[1];
            // Modern: Navigate to a dedicated data view, not a generic search
            return NavigationAction::DirectUrl(format!("https://www.coingecko.com/en/coins/{}", ticker));
        }

        // 2. Weather (Direct Data)
        // Query: "weather london" -> wttr.in (Perfect for our terminal/text browser)
        if parts.len() >= 2 && parts[0] == "weather" {
            let city = parts[1];
            return NavigationAction::DirectUrl(format!("https://wttr.in/{}", city));
        }

        // 3. GitHub (Direct Repo)
        // Query: "gh rust-lang/rust"
        if parts.len() >= 2 && (parts[0] == "gh" || parts[0] == "github") {
             return NavigationAction::DirectUrl(format!("https://github.com/{}", parts[1]));
        }

        // 4. Wikipedia (Knowledge)
        // Query: "define quantum"
        if parts.len() >= 2 && (parts[0] == "define" || parts[0] == "wiki") {
            return NavigationAction::DirectUrl(format!("https://en.wikipedia.org/wiki/{}", parts[1]));
        }

        // Default: If it looks like a domain, go there.
        if query.contains('.') && !query.contains(' ') {
             if query.starts_with("http") {
                 return NavigationAction::DirectUrl(query.to_string());
             }
             return NavigationAction::DirectUrl(format!("https://{}", query));
        }

        // Fallback (We try strictly to avoid this in the "No Search" philosophy)
        NavigationAction::SearchFallback(query.to_string())
    }
}
