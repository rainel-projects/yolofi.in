# Phase 6: Deterministic Event Loop
**Timeline**: Weeks 20-22
**Status**: PENDING

## Objectives
Introduce time and interactivity without losing trust.

## Architecture (`yolofi_core`)

### 1. The Tick
*   The browser advances in discrete "ticks".
*   Input is sampled only at tick boundaries.

### 2. Task Queues
*   **Task Queue**: Events, SetTimeout callbacks.
*   **Microtask Queue**: Promises, MutationObservers.
*   **Render Steps**: Style -> Layout -> Paint.

### 3. The Replay System
*   Record every input event (Mouse x/y, Key press, Network arrival) with its Tick count.
*   **Replay Mode**: Disconnect real input, feed recorded input at exact Ticks.
*   **Result**: The browser state must vary by EXACTLY 0 bits from the original session.

## Verification
*   **Test**: Record a session. Replay it. Compare frame hashes.
*   **Success**: Hashes match 100%.
