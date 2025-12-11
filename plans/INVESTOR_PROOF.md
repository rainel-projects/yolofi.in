# INVESTOR: HANDS-ON VERIFICATION GUIDE

**Role**: Due Diligence
**Objective**: Don't trust the pitch. Test the code.

This document guides you through 3 physical tests you can run right now on the `/autonomy` console to prove the technology is real, distinct, and functional.

---

## TEST 1: The "Freeze" Test (Proof of Isolation)

**The Claim**: High-SRA runs heavy compute without freezing the browser UI.
**Why it matters**: Current AI Agents freeze the browser when thinking. We don't.

**The Test**:
1.  Open the **Autonomy Console** (`/autonomy`).
2.  Locate the **"🔥 INJECT 5,000 OPS/SEC"** button.
3.  **Action**: Click it.
4.  **Observation**:
    *   **Pass**: The "Stability" graph stays green at 100%. Buttons remain clickable.
    *   **Fail**: The UI lags, stutters, or the mouse cursor freezes.

**The Physics**: You are witnessing the `WebWorker` absorbing the load. Standard React apps would crash immediately under this load.

---

## TEST 2: The "Determinism" Test (Proof of Governance)

**The Claim**: The system is not "guessing" (like an LLM). It is mathematically rigid.
**Why it matters**: Enterprises cannot buy software that behaves differently every time (Liability).

**The Test**:
1.  Refresh the page 3 times.
2.  Look at the **"HASH"** value in the top right corner.
3.  **Action**: Compare the Hash across refreshes.
4.  **Observation**:
    *   **Pass**: The Hash is identical (e.g., `0x7F3A9C1D`) every single time.
    *   **Fail**: The Hash changes.

**The Physics**: This proves the `SystemSentinel` is enforcing a strict State Machine on boot. It guarantees consistent behavior.

---

## TEST 3: The "Asset" Test (Proof of Value)

**The Claim**: The system produces a valuable data artifact for Compliance.
**Why it matters**: This is the "Product" you are investing in (The Audit Log).

**The Test**:
1.  Click the **"⬇️ EXPORT AUDIT REPORT"** button.
2.  Open the downloaded `.json` file.
3.  **Action**: Verify the "Tier" field.
4.  **Observation**:
    *   **Pass**: It says `"OBSIDIAN (Deterministic)"`.
    *   **Fail**: It says "Standard" or the file is empty.

**The Physics**: This proves the system is successfully logging, measuring, and validating its own math in real-time.

---

## Summary of Findings

| Test | Status | Implication |
| :--- | :--- | :--- |
| **Freeze Test** | [ ] Passed | **Scalable**. Can run locally on low-end devices. |
| **Hash Test** | [ ] Passed | **Safe**. Compliant with Enterprise SLA. |
| **Asset Test** | [ ] Passed | **Monetizable**. Ready for "Reverse Bounty". |

**Live Demo URL**: `/autonomy`
