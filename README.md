# LAB68DEV CV Builder

> A brutalist SaaS resume builder — engineered for speed, clarity, and pixel-perfect PDF output.

<a href="https://unikorn.vn/p/lab68dev-cv-builder?ref=embed" target="_blank">
  <img src="https://unikorn.vn/api/widgets/badge/lab68dev-cv-builder?theme=light" alt="lab68dev CV Builder trên Unikorn.vn" width="250" height="64" />
</a>
&nbsp;
<a href="https://unikorn.vn/p/lab68dev-cv-builder?ref=embed" target="_blank">
  <img src="https://unikorn.vn/api/widgets/badge/lab68dev-cv-builder/rank?theme=light&type=daily" alt="lab68dev CV Builder - Daily" width="250" height="64" />
</a>
<a href="https://forg.to/products/lab68-cv-builder" target="_blank" rel="noopener">
  <img src="https://forg.to/api/badges/upvote/lab68-cv-builder?theme=dark&shape=rounded" alt="lab68-cv-builder - Upvote on Forg on forg." height="48" />
</a>
<a href="https://www.producthunt.com/products/lab68dev-cv-builder?embed=true&amp;utm_source=badge-featured&amp;utm_medium=badge&amp;utm_campaign=badge-lab68dev-cv-builder" target="_blank" rel="noopener noreferrer"><img alt="lab68dev CV Builder - Unlock Your Potential. Build Your Future. | Product Hunt" width="250" height="64" src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1093292&amp;theme=light&amp;t=1773540360352"></a>
<a href="https://marketingdb.live" target="_blank"><img src="https://marketingdb.live/badge.svg" alt="Listed on MarketingDB" width="250" height="64"/></a>

**[View on Unikorn.vn](https://unikorn.vn/p/lab68dev-cv-builder)**

---

## Features

### Authentication

- Passwordless sign-in — a one-time link sent by email, with auto-registration
- JWT-based sessions with protected routes via middleware

### Resume Builder

- **Split-view editor** — live preview updates as you type
- **Auto-save** — debounced 2-second save with visible status indicator
- **Five section types:** Personal Info, Experience, Education, Skills, Projects
- **Tag-based input** for skills and project technologies
- **Project Links** — each project supports separate Project URL, GitHub URL, and Website URL displayed as `Project | GitHub | Website`
- **Avatar Upload** — optional profile photo for the Creative / Portfolio template, powered by Cloudinary with face-detection cropping (up to 10MB)
- **11 Google Fonts** selectable per resume, including Calibri, Inter, Raleway, Montserrat, and more
- **Bilingual** — full English and Vietnamese (Tiếng Việt) support via next-intl

### Templates

| Template                   | Style                                                                 |
| -------------------------- | --------------------------------------------------------------------- |
| **Harvard Style**          | Classic academic — left date column with structured content blocks    |
| **Creative / Portfolio**   | Brutalist sidebar — black 2.5-inch sidebar with optional avatar photo |
| **ATS-Optimized**          | Two-column clean layout optimized for Applicant Tracking Systems      |
| **Executive / Leadership** | Traditional top-down with professional summary header                 |

### PDF Export

- **Preview before download** — fullscreen modal with the rendered PDF in an iframe
- One-click export with matching template fidelity
- Clickable hyperlinks preserved in exported PDF (website, LinkedIn, GitHub, project links)
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

No smooth gradients. No rounded pills. Pure function.

---

## Tech Stack

| Layer        | Technology                                   |
| ------------ | -------------------------------------------- |
| Framework    | Next.js 16 (App Router, React 19, Turbopack) |
| Language     | TypeScript (strict)                          |
| Database     | Neon (Serverless Postgres)                   |
| ORM          | Drizzle ORM                                  |
| Auth         | Auth.js v5 — Resend magic link               |
| Styling      | Tailwind CSS 4                               |
| State        | Zustand                                      |
| PDF          | @react-pdf/renderer                          |
| Image Upload | Cloudinary                                   |
| i18n         | next-intl (EN / VI)                          |
| Font         | IBM Plex Sans (UI) + 11 Google Fonts (CV)    |

---

## Support the Project

If this tool saves you time, a coffee goes a long way.

<table>
  <tr>
    <td align="center">
      <a href="https://ko-fi.com/dongphuduong" target="_blank">
        <img src="https://img.shields.io/badge/Ko--fi-FF5E5B?style=for-the-badge&logo=ko-fi&logoColor=white" alt="Ko-fi" />
      </a>
    </td>
    <td align="center">
      <a href="https://buymeacoffee.com/lab68dev" target="_blank">
        <img src="https://img.shields.io/badge/Buy_Me_A_Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black" alt="Buy Me A Coffee" />
      </a>
    </td>
    <td align="center">
      <a href="https://paypal.me/DDuong884" target="_blank">
        <img src="https://img.shields.io/badge/PayPal-00457C?style=for-the-badge&logo=paypal&logoColor=white" alt="PayPal" />
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/sponsors/lab68dev" target="_blank">
        <img src="https://img.shields.io/badge/GitHub_Sponsors-EA4AAA?style=for-the-badge&logo=github-sponsors&logoColor=white" alt="GitHub Sponsors" />
      </a>
    </td>
  </tr>
</table>

### Vietnamese Bank Transfer (ACB)

![ACB Bank QR Code](https://raw.githubusercontent.com/DongDuong2001/lab68cvbuilder/main/public/acb_support.png)

---

## License

Licensed under the [Apache License 2.0](LICENSE).

---

<sub>Built with brutalist design principles by <a href="https://www.youtube.com/@lab68dev">lab68dev</a>.</sub>
