use yolofi_layout::layout_tree::LayoutBox;

pub mod canvas;

use canvas::{Canvas, Color};

pub fn paint(layout_root: &LayoutBox, width: usize, height: usize) -> Canvas {
    tracing::info!("Starting Paint (Software Rasterization)...");
    let mut canvas = Canvas::new(width, height);
    
    // Fill background (White)
    canvas.fill(Color::new(255, 255, 255));

    render_box(&mut canvas, layout_root);
    
    canvas
}

fn render_box(canvas: &mut Canvas, layout_box: &LayoutBox) {
    let rect = layout_box.dimensions.content;
    
    // Simplified: Draw border/background based on some heuristic
    // In a real engine, we'd read layout_box.style
    
    // Debug visualization:
    // Draw a border for every box to see the layout
    let color = Color::new(52, 152, 219); // Yolofi Blue
    
    // Draw rectangle outline
    draw_rect_outline(canvas, rect.x as usize, rect.y as usize, rect.width as usize, rect.height as usize, color);

    for child in &layout_box.children {
        render_box(canvas, child);
    }
}

fn draw_rect_outline(canvas: &mut Canvas, x: usize, y: usize, w: usize, h: usize, color: Color) {
    // Top & Bottom
    for i in x..(x + w).min(canvas.width) {
        canvas.set_pixel(i, y, color);
        if y + h > 0 {
             canvas.set_pixel(i, (y + h - 1).min(canvas.height - 1), color);
        }
    }
    // Left & Right
    for j in y..(y + h).min(canvas.height) {
        canvas.set_pixel(x, j, color);
        if x + w > 0 {
            canvas.set_pixel((x + w - 1).min(canvas.width - 1), j, color);
        }
    }
}
