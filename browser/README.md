# YoloFi Sovereign Browser Engine
> **Status**: Prototype (Phase 0-5 Complete)
> **License**: MIT / Proprietary
> **Architecture**: Deterministic, Sovereign, Rust-based.

This repository contains the source code for the **YoloFi Browser**, a deterministic web runtime built from scratch to guarantee user sovereignty, privacy, and explainability.

---

## 🏗️ Architecture Stack

The browser is composed of modular, independently verifiable crates:

| Crate | Responsibility | Status |
|-------|----------------|--------|
| `yolofi_browser` | Entry point & orchestration | ✅ Active |
| `yolofi_net` | **Sovereign Network Stack**. Custom DNS (UDP), TCP, HTTP/1.1. | ✅ Done |
| `yolofi_dns_server` | **Local DNS Proxy**. Intercepts browser traffic, proxies to 9.9.9.9. | ✅ Done |
| `yolofi_html` | Spec-compliant Tokenizer & DOM Tree construction. | ✅ Done |
| `yolofi_css` | Tokenizer, Parser, and **YoloFi Theme** injection. | ✅ Done |
| `yolofi_layout` | **Layout Engine**. Box Model & Geometry calculations. | ✅ Done |
| `yolofi_paint` | **Software Rasterizer**. Renders pixels to `.ppm` files. | ✅ Done |
| `yolofi_config` | Secure configuration & Enclaves. | ✅ Done |

---

## 🚀 Operations Guide (Production)

To run the YoloFi Browser environment, you must run two services: the **Infrastructure Layer** (DNS) and the **Runtime Layer** (Browser).

### 1. Prerequisites
*   **Rust Toolchain**: Install via [rustup.rs](https://rustup.rs).
*   **Windows/Linux/Mac**: Cross-platform support.

### 2. Start the Sovereign DNS Infrastructure
The browser is configured to usage a **private, local DNS authority** (`127.0.0.1:5353`) to bypass OS and ISP tracking. You must start this server first.

```powershell
# In a dedicated terminal:
cd browser
cargo run -p yolofi_dns_server --release
```

**Expected Output:**
```text
Starting YoloFi Sovereign DNS Server...
Listening on: 127.0.0.1:5353
Upstream (Privacy): 9.9.9.9:53
```

> **Security Note**: This server acts as a firewall for your DNS. It logs all queries locally so you can see exactly what sites the browser is trying to contact.

### 3. Run the Browser Engine
Once the infrastructure is live, you can launch the browser engine. currently, it runs in **Headless Verification Mode**, fetching a test page and rendering it to disk.

```powershell
# In a new terminal:
cd browser
cargo run -p yolofi_browser --release
```

**Expected Pipeline Output:**
1.  **NET**: Resolves domain via your Local DNS.
2.  **NET**: Fetches raw HTML bytes (HTTP/1.1).
3.  **HTML**: Parses tokens -> DOM Tree.
4.  **CSS**: Loads `yolofi_css` (Sky Blue/Navy Theme).
5.  **LAYOUT**: Calculates X/Y/W/H for every element.
6.  **PAINT**: Renders the frame to `output.ppm`.

### 4. Verify Output
The browser produces a raw image argument.

*   **Logs**: Check stdout for the execution trace.
*   **Visuals**: Open `output.ppm` (in IrfanView, GIMP, or convert to PNG) to see the rendered page.

---

## 🔧 Configuration & Security

### Secure Endpoints
Configuration is hardcoded in `yolofi_config` for security.
*   **Deep Path**: `yolofi.in/v1/x/9/secure/enclave/browser`
*   **DNS IP**: `127.0.0.1:5353` (Configurable in `yolofi_config/src/lib.rs`)

### Identity
The browser identifies itself as:
`User-Agent: YoloFi/1.0 (Sovereign; Privacy-First)`

---

## ⚠️ Known Limitations (Phase 5)
*   **No GUI Window**: Output is to file (`.ppm`) only.
*   **No JavaScript**: Scripting engine (Phase 7) is not yet integrated.
*   **Block Layout Only**: Complex inline formatting contexts are simplified.
*   **HTTP Only**: TLS Handshake (Phase 1.5) implementation is pending `rustls` integration.

---

**Built with First Principles.**
*Determinism. Autonomy. Decentralization.*
