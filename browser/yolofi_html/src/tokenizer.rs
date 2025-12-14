#[derive(Debug, Clone)]
pub enum Token {
    StartTag(String),
    EndTag(String),
    Character(char),
    Eof,
}

pub struct Tokenizer<'a> {
    input: std::iter::Peekable<std::str::Chars<'a>>,
}

impl<'a> Tokenizer<'a> {
    pub fn new(input: &'a str) -> Self {
        Self {
            input: input.chars().peekable(),
        }
    }

    pub fn next_token(&mut self) -> Option<Token> {
        // Very simplified state machine for Phase 2 prototype
        let c = self.input.next()?;
        
        if c == '<' {
            // Tag?
            if let Some(&next) = self.input.peek() {
                if next == '/' {
                    self.input.next(); // consume /
                    return Some(Token::EndTag(self.read_tag_name()));
                } else {
                    return Some(Token::StartTag(self.read_tag_name()));
                }
            }
        }
        
        Some(Token::Character(c))
    }

    fn read_tag_name(&mut self) -> String {
        let mut name = String::new();
        while let Some(&c) = self.input.peek() {
            if c == '>' || c.is_whitespace() {
                break;
            }
            name.push(self.input.next().unwrap());
        }
        // Consume '>' if present
        if let Some(&c) = self.input.peek() {
            if c == '>' { self.input.next(); }
        }
        name
    }
}
