use std::fmt;

#[derive(Debug)]
pub struct Document {
    pub root: Node,
}

#[derive(Debug, Clone)]
pub enum Node {
    Element(ElementData),
    Text(String),
}

#[derive(Debug, Clone)]
pub struct ElementData {
    pub tag_name: String,
    pub children: Vec<Node>,
}

impl fmt::Display for Document {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "Document\n{}", self.root)
    }
}

impl fmt::Display for Node {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Node::Element(e) => {
                writeln!(f, "<{}>", e.tag_name)?;
                for child in &e.children {
                    write!(f, "  {}", child)?; // Simple indentation TODO
                }
                Ok(())
            }
            Node::Text(t) => writeln!(f, "\"{}\"", t),
        }
    }
}
