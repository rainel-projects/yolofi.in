# Phase 0: Language & Discipline
**Timeline**: Week 0
**Status**: PENDING

## Objectives
Establish the "Language & Discipline". This phase is about setting up the infrastructure required to build a verifiable, deterministic system. **We are building infrastructure, not vibes.**

> **Golden Rule**: Logs > Visuals. If it isn't logged, it didn't happen.

## Tech Stack
*   **Language**: Rust (2024 edition)
    *   Why: Memory safety without GC, type system expressiveness, performance matching C++.
*   **Build System**: Cargo
*   **Linting**: Clippy (Pedantic mode)
*   **Formatting**: Rustfmt (Strict)

## Core Tasks

### 1. Repository Initialization
- [ ] Initialize Rust workspace.
- [ ] Set up `.gitignore`.
- [ ] Configure `Cargo.toml` with workspace members.

### 2. Module Boundaries (The "Skeleton")
Create the following crate structure:
*   `yolofi_core`: The deterministic runtime (Event loop, basic types).
*   `yolofi_net`: The networking stack (DNS, TCP, HTTP).
*   `yolofi_html`: HTML tokenizer and parser.
*   `yolofi_css`: CSS parser and cascade.
*   `yolofi_layout`: Geometry and box model.
*   `yolofi_paint`: Rasterization.
*   `yolofi_browser`: The main entry point (CLI for now).

### 3. Verification Infrastructure
- [ ] Implement a structured logging system (`tracing`).
- [ ] Create a "Journal" system: An append-only log of every decision the browser makes (for the deterministic replay feature).

## Definition of Done
*   `cargo build` passes.
*   `cargo test` passes.
*   Running `yolofi_browser` outputs a structured log line saying "System initialized".
