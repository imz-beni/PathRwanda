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
- Admins edit sectors and courses at `/admin/sectors`: change a sector's name, overview and live/coming-soon status, and add, edit, hide, show or delete courses. Courses that learners have progress on can be hidden but not deleted.
- "Re-check link" fetches a course address from the server. A clearly dead link (404, 410 or an unknown site) hides the course. If the site blocks the check or does not answer, nothing changes. A working link does not un-hide a course an admin hid.
- Admins also manage each sector's career pathways (title, description, optional income note, linked skills) and skills. Renaming a skill updates it everywhere. A skill that a learner or listing uses cannot be deleted; deleting an unused skill removes it from pathways.
- Hidden courses disappear from sector and progress pages, and old `/go/course/...` links send people to the sector page instead.
- `npm run db:seed` only adds starter content that is missing, so it never undoes admin edits. Use `npm run db:reset` for a fresh copy of the starter content.

## Organizations and listings

- Employers, agencies and training providers register like anyone else and start as `PENDING`. An admin approves them at `/admin/organizations`; only approved organizations can publish (`src/lib/auth/org.ts`).
- Approved organizations manage listings at `/dashboard/listings`: create, edit, close, reopen and remove. Removing hides a listing everywhere but keeps the row so reports and history survive.
- Every listing needs a type, at least one sector, how to apply, and a closing date. It closes at the end of that day in Rwanda time.
- A listing counts as active only while it is published and its closing date is ahead (`src/lib/listings.ts`). Public pages filter on this at query time, so expired listings never appear as active even if nobody runs a cleanup.
- Visitors browse open listings at `/opportunities` and can filter by sector, type, or search by title and place. Results come 20 to a page.
- Signed-in users can report a listing from its page (one open report per person per listing). Admins work through reports at `/admin/reports`: remove the listing (which resolves all its open reports), mark a report resolved, or dismiss it.
- Admins see every listing at `/admin/listings` and can remove one or restore a removed one. A restored listing comes back as closed, so it only goes public again when its organization reopens it.
- Admins add many listings at once at `/admin/listings/import`: pick an approved organization and upload a CSV file (a template is on the page). Rows follow the same rules as the listing form. If any row has a problem, nothing is imported and each problem is shown with its row number. A title the organization already uses is rejected, so the same file cannot be imported twice.
- When `TEST_USER_PASSWORD` is set, `npm run db:seed` also adds four approved demo organizations and 20+ made-up Agritech listings (`prisma/demo-listings.ts`). Each one says it is a demo, so it cannot be mistaken for a real offer.
- Admins search users at `/admin/users` and can deactivate or reactivate accounts. A deactivated user is signed out at once and cannot log in; their data is kept. Admin accounts cannot be deactivated there. Deactivating an organization's owner does not hide its listings; reject the organization for that.

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
