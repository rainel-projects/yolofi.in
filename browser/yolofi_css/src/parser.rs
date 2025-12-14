use crate::tokenizer::{Tokenizer, Token};
use crate::stylesheet::{Stylesheet, Rule, Selector, SimpleSelector, Declaration};

pub struct Parser<'a> {
    tokenizer: Tokenizer<'a>,
    current_token: Token,
}

impl<'a> Parser<'a> {
    pub fn new(input: &'a str) -> Self {
        let mut tokenizer = Tokenizer::new(input);
        let current_token = tokenizer.next_token();
        Self {
            tokenizer,
            current_token,
        }
    }

    fn step(&mut self) {
        self.current_token = self.tokenizer.next_token();
    }

    pub fn parse_stylesheet(&mut self) -> Stylesheet {
        let mut rules = Vec::new();
        while self.current_token != Token::Eof {
             // simplified: assume list of rules
             rules.push(self.parse_rule());
        }
        Stylesheet { rules }
    }

    fn parse_rule(&mut self) -> Rule {
        let mut selectors = Vec::new();
        // Parse selectors until '{'
        while self.current_token != Token::Delim('{') && self.current_token != Token::Eof {
            if let Token::Ident(name) = &self.current_token {
                selectors.push(Selector::Simple(SimpleSelector {
                    tag_name: Some(name.clone()),
                    id: None,
                    class: Vec::new(),
                }));
            }
            // Handle #id, .class later
            self.step();
        }

        // Consume '{'
        self.step();

        let declarations = self.parse_declarations();
        
        // Consume '}'
        if self.current_token == Token::Delim('}') {
            self.step();
        }

        Rule { selectors, declarations }
    }

    fn parse_declarations(&mut self) -> Vec<Declaration> {
        let mut declarations = Vec::new();
        while self.current_token != Token::Delim('}') && self.current_token != Token::Eof {
            if let Token::Ident(name) = &self.current_token {
                let prop_name = name.clone();
                self.step();
                
                if self.current_token == Token::Delim(':') {
                    self.step();
                    // Eat value
                    // Very simplified: just take next token as value
                    // In reality, value can be many tokens
                    if let Token::Ident(val) = &self.current_token {
                         declarations.push(Declaration { name: prop_name, value: val.clone() });
                    } else if let Token::Hash(val) = &self.current_token {
                         declarations.push(Declaration { name: prop_name, value: format!("#{}", val) });
                    }
                    self.step();
                    if self.current_token == Token::Delim(';') {
                        self.step();
                    }
                }
            } else {
                self.step();
            }
        }
        declarations
    }
}
