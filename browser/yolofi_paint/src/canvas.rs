#[derive(Debug, Clone, Copy, PartialEq)]
pub struct Color {
    pub r: u8,
    pub g: u8,
    pub b: u8,
}

impl Color {
    pub fn new(r: u8, g: u8, b: u8) -> Self {
        Self { r, g, b }
    }
}

pub struct Canvas {
    pub width: usize,
    pub height: usize,
    pixels: Vec<Color>,
}

impl Canvas {
    pub fn new(width: usize, height: usize) -> Self {
        let pixels = vec![Color::new(255, 255, 255); width * height];
        Self { width, height, pixels }
    }

    pub fn set_pixel(&mut self, x: usize, y: usize, color: Color) {
        if x < self.width && y < self.height {
            self.pixels[y * self.width + x] = color;
        }
    }

    pub fn fill(&mut self, color: Color) {
        for pixel in &mut self.pixels {
            *pixel = color;
        }
    }

    // Output to PPM (Portable Pixel Map) - Simple text-based image format
    pub fn save_to_ppm(&self, path: &str) -> std::io::Result<()> {
        use std::io::Write;
        let mut file = std::fs::File::create(path)?;
        
        // P3 header (Ascii RGB)
        write!(file, "P3\n{} {}\n255\n", self.width, self.height)?;
        
        for pixel in &self.pixels {
            writeln!(file, "{} {} {}", pixel.r, pixel.g, pixel.b)?;
        }
        Ok(())
    }
}
