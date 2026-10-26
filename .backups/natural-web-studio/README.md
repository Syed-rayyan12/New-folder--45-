# Natural Web Studio

A single-page agency website built with Next.js App Router, React, Tailwind CSS, Three.js, Framer Motion, Lenis, Zod, and Resend. All new application code is JavaScript/JSX. The pre-existing PRVLG components remain unused in the repository.

## Run

```sh
pnpm install
pnpm dev
```

```sh
pnpm build
pnpm start
```

## Enquiry email

Copy `.env.example` to `.env.local`. Configure `RESEND_API_KEY`, a verified `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL`, and the exact deployed `SITE_URL`. No credentials are shipped to the client. The form validates client-side and server-side; it only reports success after Resend accepts the message. No email is sent before these variables are configured.

The server endpoint limits body size, checks the request origin, validates a honeypot, and applies a bounded per-instance rate limit. For multi-instance deployments, use a shared rate-limit store and enforce trusted forwarding headers at the hosting edge.

## Content and artwork

- The three requested reference images were not attached. The procedural tunnel and particle sculpture follow the written brief and can be tuned once those references are supplied.
- Website previews are purpose-created HTML/CSS concepts, labelled as concepts. They are not presented as real client projects.
- No testimonials, customer metrics, or prices have been invented. Replace the client-story placeholder and enquiry-based package copy with approved business content.
- Lilex and Poppins are hosted locally through `next/font/local`.
- WebGL uses instanced tunnel detail and a single particle geometry. Rendering pauses outside the hero, in hidden tabs, and for reduced motion. CSS artwork remains visible if WebGL cannot initialize.

## Scope

Homepage only. Project previews open in accessible dialogs; category filters operate locally. Navigation and package buttons lead to sections on the same page. This implementation does not publish or deploy the site.
