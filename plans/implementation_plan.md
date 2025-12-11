# implementation_plan.md

# Goal: "Reference Implementation" for High-SRA Whitepaper

**Context**: This implementation is the **Evidence** that backs up the claims in the Whitepaper.
**Deliverable**: A standalone `/autonomy` route that visually demonstrates the 3 pillars of High-SRA: Isolation, Determinism, and Resilience.

## Whitepaper Alignment Map

| Whitepaper Concept | Code Component | Function / proof |
| :--- | :--- | :--- |
| **4.1. Sandbox Isolation** | `src/workers/integrity.worker.js` | Runs heavy math/diagnostics in separate thread. **Proof**: UI stays at 60fps during load. |
| **4.2. Deterministic Governance** | `src/autonomy/SystemSentinel.js` | State Machine (Idle -> Locked). **Proof**: Same input always = same audit log entry. |
| **4.3. Zero-Risk Resilience** | `src/autonomy/AutonomyEngine.js` | Bridge that handles Worker crashes gracefully. **Proof**: "Stress Test" fails open to Safe Mode. |
| **5.0. Stress Simulation** | `Traffic Simulator` (in Worker) | Generates synthetic load. **Proof**: Visual graph of "Entropy" vs "Stability". |

---

## Technical Implementation (The Parallel Stack)

### Phase 1: The Core Evidence (The Sandbox)
#### [NEW] `src/workers/integrity.worker.js`
*   **Deliverable**: A Web Worker that accepts a snapshot and returns a Risk Score.
*   **Revenue Hook**: `generateAuditReport()` function.
    *   Generates a professional JSON summary suitable for the $5k Consulting Audit.
*   **Key Logic**:
    *   `assessMemoryRisk(snapshot)`: Pure function.
    *   `runStressTest(intensity)`: High-CPU calculation loop.

### Phase 2: The Governance (The Sentinel)
#### [NEW] `src/autonomy/SystemSentinel.js`
*   **Deliverable**: A Class that acts as the "Gatekeeper".
*   **Revenue Hook**: "Plugin Architecture".
    *   Standard: Basic In-Memory Log.
    *   Enterprise (Future): Hooks for `registerAdapter('Splunk')` (The Paid Tier).
*   **Key Logic**:
    *   `requestAction(action)`: Checks rate limits.
    *   `auditLog`: An in-memory array of every decision.

### Phase 3: The Visual Proof (The Console)
#### [NEW] `src/components/AutonomyConsole.jsx`
*   **Deliverable**: The UI for Whitepaper screenshots & Sponsorship Bait.
*   **Features**:
    *   **Visuals**: High-Contrast "Hacker Mode" Graphs (Designed to look cool on Twitter/X).
    *   **The "Money Button"**: "Export Audit Report" (Downloads PDF/JSON).
    *   **The "Patron Link"**: Small badge: "Core Engine Supported by [GitHub Sponsors]".

#### [MODIFY] `src/App.jsx`
*   Add `<Route path="/autonomy" ... />` (The Sandbox Entry Point).

---

## Verification Plan (The "Abstract" Validation)
1.  **Isolation Proof**: Start "High Traffic Simulation". Click buttons in UI. **Pass**: Instant response (no lag).
2.  **Determinism Proof**: Run Scan 5 times. **Pass**: Returns exact same "Risk Score" and "Audit ID".
3.  **Safety Proof**: Terminate Worker manually. **Pass**: UI shows "Audit Paused - System Safe" (No crash).
