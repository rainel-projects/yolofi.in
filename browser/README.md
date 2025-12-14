# YoloFi Browser: The Sovereign Intent Engine

> **"Find exactly what you need."**

YoloFi is a **Deterministic Browser Engine**. Unlike traditional browsers that act as passive viewing panes for search engines, YoloFi actively interprets user intent to navigate directly to data sources.

## Core Philosophy: Determinism vs. Probability
*   **Traditional (Google/Bing)**: You search "weather". They give you 10 links *about* weather. You click one. (Probabilistic).
*   **YoloFi**: You type "weather". The browser parses the intent `FACT` + `LOCATION` and renders the weather directly or routes you to a trusted meteorological source. (Deterministic).

## The Quantum Query Engine (v1)
Currently live at `/v1/x/9/q/index.html`.

### Features
1.  **Client-Side NLP**: All intent analysis happens locally in your browser logic (JavaScript/Rust) using high-performance tokenization.
2.  **Smart Branching**:
    *   **Tech vs. Life**: Distinguishes "How to Python" (StackOverflow) from "How to Pasta" (wikiHow).
    *   **Grocery vs. Tech**: Distinguishes "Buy Apple" (Food) from "Buy Apple Watch" (Electronics).
3.  **Security Enclave**:
    *   **HSTS Enforcement**: Forces HTTPS.
    *   **Anti-Tamper**: Blocks inspection and debugging to protect the sovereign code.
    *   **CSP**: Strict whitelisting of resources.

## Intent Categories

| Intent | Trigger Examples | Deterministic Destination |
| :--- | :--- | :--- |
| **COMPUTE** | `solve`, `math`, `graph`, `x^2` | **WolframAlpha** |
| **DEV GUIDE** | `rust`, `error`, `debug`, `npm` | **StackOverflow** |
| **LIFE GUIDE** | `how to cook`, `clean`, `fix` | **wikiHow** |
| **GROCERY** | `milk`, `bread`, `fruit` | **Amazon Fresh** |
| **COMMERCE** | `buy`, `price`, `shop` | **Amazon** |
| **FACT** | `who is`, `define`, `history` | **Wikipedia** |
| **VIDEO** | `watch`, `trailer`, `stream` | **YouTube** |

## Architecture
*   **Frontend**: HTML5 / CSS3 (Vanillla) with "Security Enclave" pattern.
*   **Engine**: Rust (WIP) for native intent resolution.
*   **Network**: Direct-to-Source routing.

## Run Locally
Open `public/v1/x/9/q/index.html` in any browser.
