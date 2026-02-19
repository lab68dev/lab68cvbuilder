# LAB68DEV CV Builder

> A brutalist SaaS resume builder — engineered for speed, clarity, and pixel-perfect PDF output.

<br/>

<a href="https://unikorn.vn/p/lab68dev-cv-builder?ref=embed" target="_blank">
  <img src="https://unikorn.vn/api/widgets/badge/lab68dev-cv-builder?theme=light" alt="lab68dev CV Builder trên Unikorn.vn" width="256" height="64" />
</a>
&nbsp;
<a href="https://unikorn.vn/p/lab68dev-cv-builder?ref=embed" target="_blank">
  <img src="https://unikorn.vn/api/widgets/badge/lab68dev-cv-builder/rank?theme=light&type=daily" alt="lab68dev CV Builder - Hàng ngày" width="250" height="64" />
</a>

<br/>

**[→ View on Unikorn.vn](https://unikorn.vn/p/lab68dev-cv-builder)**

<br/>

---

## Features

### Authentication

- Email-only sign-in with auto-registration — no password required
- JWT-based sessions with protected routes via middleware

### Resume Builder

- **Split-view editor** — live preview updates as you type
- **Auto-save** — debounced 2‑second save with visible status indicator (`SAVING` / `SAVED`)
- **Five section types:** Personal Info, Experience, Education, Skills, Projects
- **Tag-based input** for skills and project technologies
- **10 Google Fonts** selectable per resume, applied to both preview and PDF export

### Templates

| Template | Style |
|----------|-------|
| **Lab Protocol** | Brutalist sidebar — black 2.5‑inch sidebar with white text |
| **The Executive** | Traditional top‑down with professional summary header |
| **Mono Stack** | Developer-oriented — monospace code-style section headers |
| **Clean Slate** | Minimal — generous whitespace, subtle section dividers |
| **Bold Impact** | High contrast — bold typography, strong visual hierarchy |
| **Compact Pro** | Dense layout for fitting maximum content on one page |

### PDF Export

- One-click export to PDF with matching template fidelity
- Clickable hyperlinks preserved in exported PDF (website, LinkedIn, GitHub)
- Dynamic font loading — selected Google Font is embedded in the PDF

### Dashboard

- Bento grid layout for resume management
- Create, rename, and delete resumes
- Instant navigation to any resume's builder view

---

## Design Philosophy

Built on a **brutalist aesthetic** — raw, functional, and intentional:

- Zero border radius — square corners everywhere
- Monochrome palette — black and white only
- Visible 1px borders on all interactive elements
- Inverted focus states — black background, white text on focus
- Monospace labels in uppercase with wide letter-spacing
- Grid overlay on the landing page for an industrial feel

No smooth gradients. No rounded pills. Pure function.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, React 19, Turbopack) |
| Language | TypeScript (strict) |
| Database | Neon (Serverless Postgres) |
| ORM | Drizzle ORM |
| Auth | Auth.js v5 — Credentials provider |
| Styling | Tailwind CSS 4 |
| State | Zustand |
| PDF | @react-pdf/renderer |

---

## License

Licensed under the [Apache License 2.0](LICENSE).

---

<sub>Built with brutalist design principles by <a href="https://www.youtube.com/@lab68dev">lab68dev</a>.</sub>
