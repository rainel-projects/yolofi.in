use crate::tokenizer::Token;
use crate::dom::{Document, Node, ElementData};

pub struct TreeBuilder {
    root_children: Vec<Node>,
    // Stack of open elements to be implemented
}

impl TreeBuilder {
    pub fn new() -> Self {
        Self {
            root_children: Vec::new(),
        }
    }

    pub fn process(&mut self, token: Token) {
        match token {
            Token::StartTag(name) => {
                // Simplified: Just add flat to root for prototype
                self.root_children.push(Node::Element(ElementData {
                    tag_name: name,
                    children: Vec::new(),
                }));
            }
            Token::Character(c) => {
                // Simplified text handling
                if !c.is_whitespace() {
                     // Logic to append to text node
                }
            }
            _ => {}
        }
    }

    pub fn finish(self) -> Document {
        Document {
            root: Node::Element(ElementData {
                tag_name: "html".to_string(),
                children: self.root_children,
            }),
        }
    }
}
