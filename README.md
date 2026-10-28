# PathRwanda

Career discovery, learning and opportunity matching for Rwandan youth.
The first MVP focuses on the Agritech sector (Career Discovery -> Learning -> Opportunities -> Matching).

## Stack

Next.js (App Router) + TypeScript + Tailwind, PostgreSQL, Prisma.

## Getting started

Requires Node 22+ and Docker.

```bash
npm install
cp .env.example .env
docker compose up -d
npm run db:migrate
npm run db:seed
npm run dev
```

The app runs at http://localhost:3000.

## Accounts and roles

- Roles: youth, organization, training provider and admin. Access is enforced on the server (`src/lib/auth/dal.ts`).
- Registration requires users to confirm they are 16 or older. Organizations and providers start as `PENDING` until an admin approves them.
- Passwords are hashed with bcrypt. Sessions are stored in the database and sent in an HTTP-only cookie.
- `npm run db:seed` creates a development admin from `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env`.

## Learning features (Agritech)

- Sector pages show career pathways, the skills they need, and links to external courses.
- Young users can follow sectors, mark courses as started or completed, and pick the skills they have (`/profile`).
- Course links go through `/go/course/[id]` so clicks can be counted. Follows, clicks and course changes are logged in the `Event` table for the MVP metrics.
- Course links in `prisma/seed.ts` must be real and checked. Do not add URLs that have not been opened.

## Organizations and listings

- Employers, agencies and training providers register like anyone else and start as `PENDING`. An admin approves them at `/admin/organizations`; only approved organizations can publish (`src/lib/auth/org.ts`).
- Approved organizations manage listings at `/dashboard/listings`: create, edit, close, reopen and remove. Removing hides a listing everywhere but keeps the row so reports and history survive.
- Every listing needs a type, at least one sector, how to apply, and a closing date. It closes at the end of that day in Rwanda time.
- A listing counts as active only while it is published and its closing date is ahead (`src/lib/listings.ts`). Public pages filter on this at query time, so expired listings never appear as active even if nobody runs a cleanup.
- Visitors browse open listings at `/opportunities` and can filter by sector, type, or search by title and place.

## Scripts

| Script                                  | Purpose                             |
| --------------------------------------- | ----------------------------------- |
| `npm run dev`                           | Start the dev server                |
| `npm run build`                         | Production build                    |
| `npm run lint` / `typecheck` / `format` | Code quality checks                 |
| `npm test`                              | Run unit tests                      |
| `npm run db:migrate`                    | Create/apply migrations (dev)       |
| `npm run db:seed`                       | Seed sectors and Agritech content   |
| `npm run db:reset`                      | Drop, re-migrate and re-seed the DB |
| `npm run db:studio`                     | Browse data in Prisma Studio        |
