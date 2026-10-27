# Raw Vision Collective

Frontend for the Raw Vision Collective site and its admin dashboard. React 19, Vite and Tailwind 4.

## Run

```bash
pnpm install
pnpm dev
```

## What's inside

- Public site: exclusive photos, videos and merch, past shows, upcoming events, RSVP and booking, and the RAW membership vault.
- `/admin`: the control room behind a demo login, with pages for Overview, Events, Bookings, Merch and Members. Tables filter, page, export CSV and open detail drawers.

All content starts as placeholder data in `src/data/`. Admins edit every landing page list and text block under Content in `/admin` (site and hero, photos, videos, past shows, upcoming events, products, membership). Edits, uploaded images, membership, bookings, the bag and the admin session live in the browser's localStorage, so they stay on one device until a CMS backend exists. The RAW access code and the admin login are checked in the browser and protect nothing; real auth needs a backend.
