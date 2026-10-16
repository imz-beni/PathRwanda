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
