# Phase 7: Scripting (Controlled Entry)
**Timeline**: Post-Week 22
**Status**: PENDING

## Objectives
Add dynamic behavior while maintaining the prime directive: Determinism.

## Architecture (`yolofi_script`)

### 1. The Engine
*   **Initial**: Embed a lightweight JS engine like `Boa` or `QuickJS` (Rust bindings).
*   **Constraint**: Must be seeded deterministically (Math.random, Date.now must be hooked).

### 2. The Bindings (Web IDL)
*   Expose DOM methods to JS.
*   `document.getElementById(...)` maps to our DOM Arena.

### 3. The Sandbox
*   Scripts run in a locked box.
*   Network access is explicit (Fetch API hooked into our `yolofi_net`).
*   Storage access is explicit.

## Verification
*   **Test**: A page with a counter button.
*   **Success**: Clicking increments the counter. Replaying the session increments the counter at the exact same frame.
