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

All content is placeholder data in `src/data/`. Membership, bookings, the bag and the admin session live in the browser's localStorage. The RAW access code and the admin login are checked in the browser and protect nothing; real auth needs a backend.
