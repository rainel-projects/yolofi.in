# Phase 3: CSS Engine
**Timeline**: Weeks 7-10
**Status**: PENDING

## Objectives
Parse CSS and apply it to the DOM to create the "Render Tree" (or Style Tree).

## Architecture (`yolofi_css`)

### 1. Tokenizer & Parser
*   **Input**: CSS Text.
*   **Output**: Stylesheet Object (List of rules).
*   **Logic**:
    *   Parse Selectors (`div`, `.class`, `#id`).
    *   Parse Declarations (`color: red`).

### 2. Selector Matching
*   For each element in the DOM, find all matching rules.
*   **Complexity**: `O(n)` per element.
*   **Optimization**: Bloom filters or hash maps for classes/ids.

### 3. The Cascade
*   Sort matching rules by:
    1.  Origin (User agent vs User vs Author).
    2.  Specificity (ID > Class > Tag).
    3.  Source Order.
*   Compute final value for every property.

### 4. Inheritance
*   Propagate values from parent to child (e.g., `font-family`).
*   Handle `inherit`, `initial`, `unset`.

## Verification
*   **Test**: `./yolofi_browser style input.html`
*   **Success**: Prints the DOM with attached computed styles.
    ```
    div { display: block; color: rgb(0,0,0); }
    ```
