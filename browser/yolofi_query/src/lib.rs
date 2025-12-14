use tracing::info;

pub mod intent_generator;
pub use intent_generator::{IntentGenerator, Intent, IntentDomain, IntentAction, TemporalDimension};

pub enum NavigationAction {
    DirectUrl(String),
    SearchFallback(String),
}

pub struct IntentRouter;

impl IntentRouter {
    pub fn resolve(query: &str) -> NavigationAction {
        info!("Analyzing Intent: '{}'", query);
        let q_lower = query.to_lowercase();
        let parts: Vec<&str> = q_lower.split_whitespace().collect();

        // ========== FINANCE & CRYPTO ==========
        // Crypto prices: "price btc", "btc price"
        if (parts.len() >= 2 && (parts[0] == "price" || parts[0] == "value"))
            || (parts.len() >= 2 && parts[1] == "price")
        {
            let ticker = if parts[0] == "price" { parts[1] } else { parts[0] };
            return NavigationAction::DirectUrl(format!(
                "https://www.coingecko.com/en/coins/{}",
                ticker
            ));
        }

        // Stock prices: "stock aapl", "aapl stock"
        if parts.len() >= 2 && (parts[0] == "stock" || parts[1] == "stock") {
            let ticker = if parts[0] == "stock" { parts[1] } else { parts[0] };
            return NavigationAction::DirectUrl(format!(
                "https://finance.yahoo.com/quote/{}",
                ticker.to_uppercase()
            ));
        }

        // Forex: "usd to eur", "convert usd eur"
        if parts.len() >= 3 && (parts.contains(&"to") || parts[0] == "convert") {
            return NavigationAction::DirectUrl(
                "https://www.xe.com/currencyconverter/".to_string(),
            );
        }

        // ========== WEATHER & LOCATION ==========
        // Weather: "weather london", "forecast tokyo"
        if parts.len() >= 2 && (parts[0] == "weather" || parts[0] == "forecast") {
            let city = parts[1];
            return NavigationAction::DirectUrl(format!("https://wttr.in/{}", city));
        }

        // Maps: "map paris", "directions to nyc"
        if parts.len() >= 2 && (parts[0] == "map" || parts[0] == "directions") {
            let location = parts[1..].join("+");
            return NavigationAction::DirectUrl(format!(
                "https://www.google.com/maps/search/{}",
                location
            ));
        }

        // ========== HEALTH & MEDICAL ==========
        // Medical info: "symptoms fever", "disease covid"
        if parts.len() >= 2 && (parts[0] == "symptoms" || parts[0] == "disease" || parts[0] == "treatment") {
            let condition = parts[1..].join("_");
            return NavigationAction::DirectUrl(format!(
                "https://www.mayoclinic.org/diseases-conditions/{}",
                condition
            ));
        }

        // Drugs/Medications: "drug aspirin", "medication ibuprofen"
        if parts.len() >= 2 && (parts[0] == "drug" || parts[0] == "medication" || parts[0] == "medicine") {
            let drug = parts[1];
            return NavigationAction::DirectUrl(format!(
                "https://www.drugs.com/{}",
                drug
            ));
        }

        // ========== EDUCATION & RESEARCH ==========
        // Academic papers: "paper quantum computing", "research ai"
        if parts.len() >= 2 && (parts[0] == "paper" || parts[0] == "research" || parts[0] == "study") {
            let topic = parts[1..].join("+");
            return NavigationAction::DirectUrl(format!(
                "https://scholar.google.com/scholar?q={}",
                topic
            ));
        }

        // Courses: "course python", "learn rust"
        if parts.len() >= 2 && (parts[0] == "course" || parts[0] == "learn" || parts[0] == "tutorial") {
            let subject = parts[1];
            return NavigationAction::DirectUrl(format!(
                "https://www.coursera.org/search?query={}",
                subject
            ));
        }

        // ========== ENTERTAINMENT ==========
        // Movies: "movie inception", "watch avatar"
        if parts.len() >= 2 && (parts[0] == "movie" || parts[0] == "film" || parts[0] == "watch") {
            let title = parts[1..].join("+");
            return NavigationAction::DirectUrl(format!(
                "https://www.imdb.com/find?q={}",
                title
            ));
        }

        // Music: "song bohemian", "artist queen", "album thriller"
        if parts.len() >= 2 && (parts[0] == "song" || parts[0] == "artist" || parts[0] == "album" || parts[0] == "music") {
            let query_str = parts[1..].join("+");
            return NavigationAction::DirectUrl(format!(
                "https://open.spotify.com/search/{}",
                query_str
            ));
        }

        // Games: "game minecraft", "play chess"
        if parts.len() >= 2 && (parts[0] == "game" || parts[0] == "play") {
            let game = parts[1..].join("+");
            return NavigationAction::DirectUrl(format!(
                "https://store.steampowered.com/search/?term={}",
                game
            ));
        }

        // ========== FOOD & RECIPES ==========
        // Recipes: "recipe pasta", "cook chicken"
        if parts.len() >= 2 && (parts[0] == "recipe" || parts[0] == "cook" || parts[0] == "make") {
            let dish = parts[1..].join("+");
            return NavigationAction::DirectUrl(format!(
                "https://www.allrecipes.com/search?q={}",
                dish
            ));
        }

        // Restaurants: "restaurant near me", "food delivery"
        if parts.len() >= 1 && (parts[0] == "restaurant" || parts[0] == "food" || parts[0] == "delivery") {
            return NavigationAction::DirectUrl(
                "https://www.yelp.com/search?find_desc=restaurants".to_string(),
            );
        }

        // ========== TRAVEL ==========
        // Flights: "flight nyc to la", "flights to paris"
        if parts.len() >= 2 && (parts[0] == "flight" || parts[0] == "flights" || parts[0] == "fly") {
            return NavigationAction::DirectUrl(
                "https://www.google.com/travel/flights".to_string(),
            );
        }

        // Hotels: "hotel paris", "stay london"
        if parts.len() >= 2 && (parts[0] == "hotel" || parts[0] == "stay" || parts[0] == "accommodation") {
            let location = parts[1];
            return NavigationAction::DirectUrl(format!(
                "https://www.booking.com/searchresults.html?ss={}",
                location
            ));
        }

        // ========== SHOPPING & COMMERCE ==========
        // General shopping: "buy laptop", "shop shoes"
        if parts.len() >= 2 && (parts[0] == "buy" || parts[0] == "shop" || parts[0] == "purchase") {
            let product = parts[1..].join("+");
            return NavigationAction::DirectUrl(format!(
                "https://www.amazon.com/s?k={}",
                product
            ));
        }

        // Price comparison: "compare iphone", "best price laptop"
        if parts.len() >= 2 && (parts[0] == "compare" || parts.contains(&"best") && parts.contains(&"price")) {
            let product = parts[1..].join("+");
            return NavigationAction::DirectUrl(format!(
                "https://www.pricerunner.com/search?q={}",
                product
            ));
        }

        // ========== NEWS & MEDIA ==========
        // News: "news tech", "latest politics"
        if parts.len() >= 1 && (parts[0] == "news" || parts[0] == "latest" || parts[0] == "headlines") {
            let topic = if parts.len() > 1 { parts[1] } else { "world" };
            return NavigationAction::DirectUrl(format!(
                "https://news.google.com/search?q={}",
                topic
            ));
        }

        // ========== SPORTS ==========
        // Sports scores: "score lakers", "game arsenal"
        if parts.len() >= 2 && (parts[0] == "score" || parts[0] == "game" || parts[0] == "match") {
            let team = parts[1];
            return NavigationAction::DirectUrl(format!(
                "https://www.espn.com/search?q={}",
                team
            ));
        }

        // ========== PROFESSIONAL & CAREER ==========
        // Jobs: "job software engineer", "careers google"
        if parts.len() >= 2 && (parts[0] == "job" || parts[0] == "jobs" || parts[0] == "career" || parts[0] == "careers") {
            let position = parts[1..].join("+");
            return NavigationAction::DirectUrl(format!(
                "https://www.linkedin.com/jobs/search/?keywords={}",
                position
            ));
        }

        // Professional networking: "connect", "network"
        if parts.len() >= 1 && (parts[0] == "connect" || parts[0] == "network" || parts[0] == "linkedin") {
            return NavigationAction::DirectUrl("https://www.linkedin.com".to_string());
        }

        // ========== DEVELOPMENT & TECH ==========
        // GitHub: "gh rust-lang/rust", "github repo"
        if parts.len() >= 2 && (parts[0] == "gh" || parts[0] == "github") {
            return NavigationAction::DirectUrl(format!("https://github.com/{}", parts[1]));
        }

        // Stack Overflow: "error rust", "debug python", "fix javascript"
        if parts.len() >= 2 && (parts[0] == "error" || parts[0] == "debug" || parts[0] == "fix" || parts[0] == "stackoverflow") {
            let query_str = parts[1..].join("+");
            return NavigationAction::DirectUrl(format!(
                "https://stackoverflow.com/search?q={}",
                query_str
            ));
        }

        // Package managers: "npm package", "crate tokio", "pip install"
        if parts.len() >= 2 && (parts[0] == "npm" || parts[0] == "crate" || parts[0] == "pip" || parts[0] == "package") {
            let pkg = parts[1];
            let url = match parts[0] {
                "npm" => format!("https://www.npmjs.com/package/{}", pkg),
                "crate" => format!("https://crates.io/crates/{}", pkg),
                "pip" => format!("https://pypi.org/project/{}", pkg),
                _ => format!("https://www.npmjs.com/package/{}", pkg),
            };
            return NavigationAction::DirectUrl(url);
        }

        // ========== KNOWLEDGE & REFERENCE ==========
        // Wikipedia: "define quantum", "wiki einstein"
        if parts.len() >= 2 && (parts[0] == "define" || parts[0] == "wiki" || parts[0] == "wikipedia") {
            let topic = parts[1..].join("_");
            return NavigationAction::DirectUrl(format!(
                "https://en.wikipedia.org/wiki/{}",
                topic
            ));
        }

        // Dictionary: "meaning ubiquitous", "word etymology"
        if parts.len() >= 2 && (parts[0] == "meaning" || parts[0] == "word" || parts[0] == "dictionary") {
            let word = parts[1];
            return NavigationAction::DirectUrl(format!(
                "https://www.merriam-webster.com/dictionary/{}",
                word
            ));
        }

        // Translations: "translate hello spanish"
        if parts.len() >= 3 && parts[0] == "translate" {
            return NavigationAction::DirectUrl(
                "https://translate.google.com/".to_string(),
            );
        }

        // ========== SOCIAL MEDIA ==========
        // Twitter/X: "tweet", "x @username"
        if parts.len() >= 1 && (parts[0] == "tweet" || parts[0] == "twitter" || parts[0] == "x") {
            let handle = if parts.len() > 1 { parts[1] } else { "" };
            return NavigationAction::DirectUrl(format!("https://twitter.com/{}", handle));
        }

        // Reddit: "reddit programming", "r/rust"
        if parts.len() >= 1 && (parts[0] == "reddit" || parts[0].starts_with("r/")) {
            let subreddit = if parts[0].starts_with("r/") {
                parts[0]
            } else if parts.len() > 1 {
                parts[1]
            } else {
                ""
            };
            return NavigationAction::DirectUrl(format!("https://www.reddit.com/{}", subreddit));
        }

        // ========== UTILITIES ==========
        // Calculator: "calc 2+2", "calculate 15%"
        if parts.len() >= 2 && (parts[0] == "calc" || parts[0] == "calculate" || parts[0] == "math") {
            let expr = parts[1..].join("+");
            return NavigationAction::DirectUrl(format!(
                "https://www.wolframalpha.com/input?i={}",
                expr
            ));
        }

        // Time zones: "time tokyo", "timezone est"
        if parts.len() >= 2 && (parts[0] == "time" || parts[0] == "timezone") {
            let zone = parts[1];
            return NavigationAction::DirectUrl(format!(
                "https://www.timeanddate.com/worldclock/{}",
                zone
            ));
        }

        // ========== DEFAULT: URL DETECTION ==========
        // If it looks like a domain, navigate there
        if query.contains('.') && !query.contains(' ') {
            if query.starts_with("http") {
                return NavigationAction::DirectUrl(query.to_string());
            }
            return NavigationAction::DirectUrl(format!("https://{}", query));
        }

        // Fallback to search (minimized)
        NavigationAction::SearchFallback(query.to_string())
    }
}
