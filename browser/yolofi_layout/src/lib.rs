pub mod box_model;
pub mod layout_tree;

use yolofi_html::dom::Document;
use yolofi_css::stylesheet::Stylesheet;
use layout_tree::LayoutBox;

pub fn layout(dom: &Document, style: &Stylesheet, width: f32) -> LayoutBox {
    tracing::info!("Starting Layout Calculation...");
    // 1. Build the Layout Tree (DOM + Style)
    let mut root_box = layout_tree::build_layout_tree(&dom.root);
    
    // 2. Perform Layout (Calculate geometries)
    root_box.layout(box_model::Dimensions::viewport(width));
    
    root_box
}
