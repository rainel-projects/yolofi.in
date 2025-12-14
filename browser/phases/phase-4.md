# Phase 4: Layout Engine
**Timeline**: Weeks 11-16
**Status**: PENDING

## Objectives
Calculate the geometry (x, y, width, height) of every box. This is pure math.

## Architecture (`yolofi_layout`)

### 1. Box Tree Generation
*   Convert "Styled Elements" into "Layout Boxes".
*   Some elements need multiple boxes (lines of text).
*   Some elements need zero boxes (`display: none`).

### 2. The Box Model
*   Compute `margin`, `border`, `padding`, `content`.
*   Handle `box-sizing: border-box`.

### 3. Layout Algorithms
*   **Normal Flow**:
    *   Block layout: Stack vertically.
    *   Inline layout: Flow horizontally within line boxes.
*   **Floats**: Shift left/right.
*   **Positioning**: Absolute/Relative/Fixed.

### 4. Tree Traversal
*   Recursive pass: `layout(node, container_width)`.
*   1. Determine width.
*   2. Lay out children.
*   3. Determine height (based on children).

## Verification
*   **Test**: `./yolofi_browser layout input.html`
*   **Success**: Prints a layout tree with coordinates.
    ```
    BlockBox (0,0, 800x600)
      BlockBox (0,0, 800x50) [Header]
    ```
