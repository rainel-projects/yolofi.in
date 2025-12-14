pub struct BrowserState {
    pub determinism_checked: bool,
}

impl Default for BrowserState {
    fn default() -> Self {
        Self {
            determinism_checked: true,
        }
    }
}
