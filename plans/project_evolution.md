# project_evolution.md

# The Origin Story: From Script to Standard

**Document Goal**: Explain the "Why" and "How" of High-SRA.
**Status**: Architecture Manifesto.

---

## 🏛️ Phase 1: The Monolith (What it Started As)
**The Artifact**: `src/utils/BrowserEngine.js`
**The Logic**: A static Class running on the Main Thread.

### The Root Analysis
We started with a "performance script". It was a single file (`BrowserEngine.js`) designed to fix lag.
*   **The Code**: It used `yieldToMain()` and `requestIdleCallback()` to "polite" the diagnostics.
*   **The Flaw**: It suffered from the **Observer Effect**.
    *   By running `countDOMNodes()` and `detectMemoryLeaks()` on the main thread, the *diagnostic tool itself* caused frame drops.
    *   Result: You could not measure performance without degrading performance.
    *   Risk: If the `BrowserEngine` crashed, the entire React App (`App.jsx`) crashed.

> **Verdict**: Good for side projects, unacceptable for Enterprise SLAs.

---

## ⚡ Phase 2: The Pivot (The Zero-Risk Realization)
**The Insight**: "You cannot secure a system from inside the system."
**The Shift**: We needed to move the "Brain" outside the "Body".

### The Architectural Change
We abandoned the Monolith for the **High-SRA Model** (Sandboxed, Read-Only, Authorized).

1.  **Isolation (The Sandbox)**:
    *   *Old*: `BrowserEngine.detectMemoryLeaks()` (Blocking).
    *   *New*: `integrity.worker.js` (Non-Blocking).
    *   *Why*: Even if the Worker enters an infinite loop (e.g., our Stress Test), the Main Thread UI stays at 60fps.

2.  **Determinism (The Control Theory)**:
    *   *Old*: Heuristics ("If memory > 90%, maybe clear cache?").
    *   *New*: `SystemSentinel.js` (State Machine). "If Risk > 0.9 -> State = LOCKED".
    *   *Why*: Enterprises hate "Maybe". They pay for "Definitely".

---

## 🤖 Phase 3: The Deterministic Agent (What it Became)
**The Artifact**: `src/workers/integrity.worker.js` + `AutonomyEngine.js`
**The Positioning**: "The Anti-AI".

### Why "Agent"?
In Computer Science, an Agent is a system that:
1.  **Perceives**: Function `runSafeDiagnostics(snapshot)`.
2.  **Decides**: Function `getSystemTier(score)`.
3.  **Acts**: Function `postMessage('OPTIMIZE')`.

### Why "Deterministic"?
Unlike LLM Agents (which guess), High-SRA Agents use **Control Theory Logic**.
*   Input: `Heap = 95%`.
*   Logic: `Risk = 1.0`.
*   Output: `Action = PURGE_CACHE`.
*   **Result**: 100% Predictable. Zero Hallucinations.

---

## 💰 Phase 4: The Enterprise Asset (Revenue)
**The Shift**: From "Code" to "Reliability".

We realized that CTOs don't buy "Optimization Scripts". They buy **Insurance**.
*   **The Product**: It's not the code. It's the **Audit Capabilities**.
*   **The Revenue**: We sell the *proof* that a system is safe.
    *   The `generateAuditReport()` function isn't a feature; it's the product.

---

## 🔮 Summary: The Evolution
| Feature | Phase 1 (Legacy) | Phase 2 (High-SRA) |
| :--- | :--- | :--- |
| **Location** | Main Thread (`utils/`) | Web Worker (`workers/`) |
| **Risk** | High (Crash Risk) | Zero (Fail-Open) |
| **Logic** | Heuristic (If/Else) | Deterministic (State Machine) |
| **Value** | Faster Loading | Enterprise Reliability |

**Final Status**: We are no longer building a "Tool". We are building a **Standard**.
