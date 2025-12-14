use crate::box_model::Dimensions;
use yolofi_html::dom::Node;
use std::fmt;

pub struct LayoutBox {
    pub dimensions: Dimensions,
    pub box_type: BoxType,
    pub children: Vec<LayoutBox>,
}

pub enum BoxType {
    BlockNode,
    InlineNode,
    AnonymousBlock,
}

impl LayoutBox {
    pub fn new(box_type: BoxType) -> Self {
        Self {
            dimensions: Dimensions::default(),
            box_type,
            children: Vec::new(),
        }
    }

    pub fn layout(&mut self, containing_block: Dimensions) {
        // Simplified Block Layout Algorithm
        
        // 1. Calculate Width
        self.dimensions.content.width = containing_block.content.width; // Assume full width for blocks (simplified)
        
        // 2. Position
        self.dimensions.content.x = containing_block.content.x;
        self.dimensions.content.y = containing_block.content.height; // Stack below previous content
        
        // 3. Layout Children
        let mut current_y = 0.0;
        for child in &mut self.children {
            child.layout(self.dimensions); // Pass parent dims
            child.dimensions.content.y = self.dimensions.content.y + current_y;
            current_y += child.dimensions.content.height;
        }

        // 4. Calculate Height
        self.dimensions.content.height = current_y; // Height is sum of children
    }
}

pub fn build_layout_tree(node: &Node) -> LayoutBox {
    // Very simplified: Convert every element to a Block Box
    let mut root = LayoutBox::new(BoxType::BlockNode);
    
    if let Node::Element(e) = node {
        for child in &e.children {
             match child {
                 Node::Element(_) => {
                     root.children.push(build_layout_tree(child));
                 }
                 Node::Text(_t) => {
                     // Text nodes would be anonymous inline boxes usually
                     // Ignoring for pure block layout phase 1 prototype
                 }
             }
        }
    }
    root
}

impl fmt::Display for LayoutBox {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "BlockBox ({:.1}x{:.1} at {},{})", 
            self.dimensions.content.width, 
            self.dimensions.content.height,
            self.dimensions.content.x,
            self.dimensions.content.y
        )?;
        for child in &self.children {
            write!(f, "\n  {}", child)?;
        }
        Ok(())
    }
}
