# Phase 2: HTML Engine
**Timeline**: Weeks 4-6
**Status**: PENDING

## Objectives
Turn raw bytes into a document structure. 
Strict adherence to the **HTML Living Standard** tokenization and tree construction rules.

## Architecture (`yolofi_html`)

### 1. Setup & Encoding
*   Detect encoding (Assume UTF-8 for now, fail on others).
*   Preprocessor (Handling CRLF).

### 2. Tokenization (State Machine)
*   **Input**: Character stream.
*   **States**: `Data`, `TagOpen`, `EndTagOpen`, `TagName`, `AttributeName`, etc.
*   **Output**: Stream of `Tokens` (StartTag, EndTag, Character, Comment, Doctype).
*   **Critical**: Must handle parse errors gracefully (HTML is fault-tolerant).

### 3. Tree Construction
*   **Input**: Stream of Tokens.
*   **Logic**: The "Insertion Modes" (Initial, BeforeHtml, BeforeHead, InHead, InBody, etc.).
*   **Output**: The `DOM Tree`.

### 4. The DOM (`yolofi_dom`)
*   **Node Types**: `Document`, `Element`, `Text`, `Comment`.
*   **Structure**: A tree data structure.
    *   *Challenge in Rust*: Pointers/References.
    *   *Strategy*: Use an arena allocator (e.g., vector of nodes with indices as handles) to avoid `Rc<RefCell<Node>>` hell and ensure memory safety/determinism.

## Verification
*   **Test**: `./yolofi_browser parse http://example.com`
*   **Success**: Prints a visual tree representation of the downloaded HTML.
    ```
    Document
      <html>
        <head>
          <title>
            "Example Domain"
        <body>
          <div>
            <h1>
              "Example Domain"
    ```
