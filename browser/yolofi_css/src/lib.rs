pub mod tokenizer;
pub mod parser;
pub mod stylesheet;
pub mod ua_styles; // User Agent Styles (Yolofi Theme)

use stylesheet::Stylesheet;

pub fn parse(css: &str) -> Stylesheet {
    tracing::info!("Starting CSS parse for {} bytes...", css.len());
    let mut parser = parser::Parser::new(css);
    parser.parse_stylesheet()
}

pub fn get_user_agent_style() -> String {
    ua_styles::YOLOFI_UA_CSS.to_string()
}
