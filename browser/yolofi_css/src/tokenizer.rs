#[derive(Debug, Clone, PartialEq)]
pub enum Token {
    Ident(String),
    Hash(String), // #id
    Delim(char),  // . : ; {}
    String(String),
    Number(f64),
    Whitespace,
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

    pub fn next_token(&mut self) -> Token {
        self.consume_whitespace();

        match self.input.next() {
            Some(c) => match c {
                '{' | '}' | ':' | ';' | '.' | ',' => Token::Delim(c),
                '#' => {
                    let name = self.consume_ident();
                    Token::Hash(name)
                }
                c if c.is_alphabetic() || c == '-' => {
                    let mut ident = c.to_string();
                    ident.push_str(&self.consume_ident());
                    Token::Ident(ident)
                }
                c if c.is_ascii_digit() => {
                    // Simplified number parsing
                    let mut num = c.to_string();
                    while let Some(&n) = self.input.peek() {
                        if n.is_ascii_digit() || n == '.' {
                            num.push(self.input.next().unwrap());
                        } else {
                            break;
                        }
                    }
                    Token::Number(num.parse().unwrap_or(0.0))
                }
                _ => Token::Delim(c), // Fallback
            },
            None => Token::Eof,
        }
    }

    fn consume_whitespace(&mut self) {
        while let Some(&c) = self.input.peek() {
            if c.is_whitespace() {
                self.input.next();
            } else {
                break;
            }
        }
    }

    fn consume_ident(&mut self) -> String {
        let mut res = String::new();
        while let Some(&c) = self.input.peek() {
            if c.is_alphanumeric() || c == '-' || c == '_' {
                res.push(self.input.next().unwrap());
            } else {
                break;
            }
        }
        res
    }
}
