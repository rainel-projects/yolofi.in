pub mod tokenizer;
pub mod tree_builder;
pub mod dom;

pub fn parse(html: &str) -> dom::Document {
    tracing::info!("Starting HTML parse for {} bytes...", html.len());
    let mut tokenizer = tokenizer::Tokenizer::new(html);
    let mut tree_builder = tree_builder::TreeBuilder::new();
    
    while let Some(token) = tokenizer.next_token() {
        tree_builder.process(token);
    }
    
    tree_builder.finish()
}
