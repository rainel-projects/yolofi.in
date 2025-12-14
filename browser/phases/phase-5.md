# Phase 5: Paint & Compositing
**Timeline**: Weeks 17-19
**Status**: PENDING

## Objectives
Turn layout rectangles into pixels.

## Architecture (`yolofi_paint`)

### 1. Display List Generation
*   Traverse Layout Tree.
*   Issue low-level paint commands:
    *   `DrawRect(x, y, w, h, color)`
    *   `DrawText(x, y, text, font)`
    *   `DrawImage(x, y, bitmap)`

### 2. Rasterization
*   Execute commands onto a pixel buffer (bitmap).
*   **Constraint**: No GPU initially. Software rasterization for perfect determinism. (Later: deterministic GPU shaders).

### 3. Windowing (The "Viewer")
*   Use a minimal windowing library (e.g., `winit`) to display the framebuffer.
*   **Note**: The engine itself just produces a buffer. The window is just a viewer.

## Verification
*   **Test**: `./yolofi_browser`
*   **Success**: A window opens and displays a rendered HTML page.
