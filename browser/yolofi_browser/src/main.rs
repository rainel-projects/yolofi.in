fn main() {
    // Initialize logging
    tracing_subscriber::fmt::init();

    tracing::info!("YoloFi Browser Engine initializing...");
    tracing::info!("Core Laws: Determinism, Autonomy, Decentralization.");

    // Phase 1 Verification: Networking
    tracing::info!("--- PHASE 1 VERIFICATION ---");
    
    // 1. DNS
    let domain = "google.com";
    tracing::info!("Attempting to resolve {} via raw UDP...", domain);
    let ip = yolofi_net::dns::resolve(domain);
    tracing::info!("Result: {} -> {}", domain, ip);

    // 2. HTTP Parsing (Manual test)
    tracing::info!("Testing HTTP request...");
    let raw_response = b"HTTP/1.1 200 OK\r\nServer: Custom\r\n\r\n<html><head><title>Verify</title></head><body><h1>Hello Phase 2</h1></body></html>";
    
    if let Some(res) = yolofi_net::http::HttpResponse::parse(raw_response) {
        tracing::info!("Parsed Response status: {}", res.status);
        
        // Phase 2 Verification: HTML Engine
        tracing::info!("--- PHASE 2 VERIFICATION ---");
        let html_string = String::from_utf8_lossy(&res.body);
        let dom = yolofi_html::parse(&html_string);
        
        tracing::info!("Generated DOM Tree:\n{}", dom);

        // Phase 3 Verification: CSS Engine
        tracing::info!("--- PHASE 3 VERIFICATION ---");
        
        // 1. Load User Agent Styles (Yolofi Theme)
        let ua_css = yolofi_css::get_user_agent_style();
        tracing::info!("Loaded User Agent Theme (Yolofi Default). Length: {} bytes", ua_css.len());

        // 2. Parse CSS
        let stylesheet = yolofi_css::parse(&ua_css);
        tracing::info!("Parsed Stylesheet (Top 3 Rules):\n");
        // Manually iterate to avoid tons of output logic
        for (i, rule) in stylesheet.rules.iter().take(3).enumerate() {
            tracing::info!("Rule {}: {:?}", i, rule.selectors);
            for decl in &rule.declarations {
                tracing::info!("  {}: {}", decl.name, decl.value);
            }
        }

        // Phase 4 Verification: Layout Engine
        tracing::info!("--- PHASE 4 VERIFICATION ---");
        
        // 1. Calculate Layout
        let viewport_width = 800.0;
        let layout_tree = yolofi_layout::layout(&dom, &stylesheet, viewport_width);
        
        tracing::info!("Generated Layout Tree (Viewport Width: {}):\n{}", viewport_width, layout_tree);

        // Phase 5 Verification: Paint
        tracing::info!("--- PHASE 5 VERIFICATION ---");
        
        let canvas_width = 800;
        let canvas_height = 600;
        let canvas = yolofi_paint::paint(&layout_tree, canvas_width, canvas_height);
        
        tracing::info!("Painted Frame. Canvas {}x{}", canvas.width, canvas.height);
        
        let output_file = "output.ppm";
        if let Err(e) = canvas.save_to_ppm(output_file) {
            tracing::error!("Failed to save image: {}", e);
        } else {
            tracing::info!("Saved verified render to '{}'", output_file);
        }

    } else {
        tracing::error!("Failed to parse HTTP response");
    }

    tracing::info!("System ready.");
}
