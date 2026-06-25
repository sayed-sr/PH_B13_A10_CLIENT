# TicketBari

> **CRITICAL OPERATIONS NOTICE (PLEASE READ FIRST):**
> 1. **Propagation Delay:** After completing any interactive client-side action—such as clicking a navigation button or modifying view filter queries via the layout navigation bar—you must explicitly wait at least 5 to 8 seconds for background network frames and session caches to completely sync.
> 2. **Vendor Dashboard Activation Flow:** When an administrator approves a registered user's elevation request to status, the targeted user must perform a hard logout and log back in cleanly to recalculate session tokens and correctly activate the vendor dashboard view layout.

---

## Project Purpose
**TicketBari** is a premium, real-time transportation routing and ticket purchasing gateway optimized for local ecosystem management. Built as a high-performance single-page web app, it enables transit operators to list available tickets while enforcing automated fraud prevention mechanisms. It serves as a unified digital platform bridging everyday transit clients, verification administrators, and certified regional travel vendors under one secure routing architecture.

## Deployment Live URL
- **Production Hub:** [https://ticketbari.vercel.app](https://ticketbari.vercel.app)

---

## Key Feature Architecture

### 1. Unified Authentication & Stateful Session Control
- Implements secure, cross-layer session indexing using server-verified headers and browser cookies.
- Synchronized client-side hooks dynamically detect user authenticity states across layout routes.

### 2. Client-Side Authentication Guards
- **Interception Pipelines:** Automatically blocks access to deep ticket items or purchase interfaces if no authenticated session context is verified.
- **Cache Isolation:** Bypasses stale browser states to prevent unauthenticated detail exposures, executing clean relative fallback routing to `/auth/signin`.

### 3. Multifaceted Trans-Transit Search Engine
- Advanced structural queries targeting explicit operational keys (`approved` validation status fields).
- Granular data filters including multi-axis sorting options (High-to-Low and Low-to-High pricing scales) and transport classification parameters (Bus, Train, Launch, Flight).

### 4. Adaptive Layout Navigation Interface
- **Responsive Navigation:** Smooth cross-device layout rendering equipped with an interactive mobile viewport navigation drawer.
- **Role-Based Dynamic Dropdowns:** Automated user profile calculation dynamically selecting layout links (`/dashboard/user`, `/dashboard/vendor`, or `/dashboard/admin`) according to structural identity variables.

### 5. Automated Inventory Counting & Fraud Prevention
- Active inventory threshold checking with administrative dashboard controls.
- Preventative structural mechanisms preventing black-market double-bookings or chronological booking anomalies (past-date lockouts).

---

## Integrated Dependency Matrix

The core architecture operates efficiently across the following chosen production npm packages:

| Package Group / Name | Target Purpose & Core Functionality |
| :--- | :--- |
| **`next`** | Core framework engine supplying App Router structures, static optimizations, and performance optimization layers. |
| **`@heroui/react`** | High-performance UI library context powering design consistency, inputs, cards, button arrays, pagination components, and load layout spinners. |
| **`lucide-react`** | Flexible vectorized icon provider rendering consistent context imagery across navigation paths and layout grids. |
| **`axios`** | Promise-based asynchronous HTTP layout architecture utilized to process explicit backend data payloads. |
| **`tailwindcss`** | Utility-first programmatic layout styling handling fully responsive structural dimensions. |

---

## Getting Started

### 1. Clone & Initialize
```bash
git clone <repository-url>
cd ticketbari
npm install