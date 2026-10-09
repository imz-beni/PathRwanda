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

## Scripts

| Script                                  | Purpose                             |
| --------------------------------------- | ----------------------------------- |
| `npm run dev`                           | Start the dev server                |
| `npm run build`                         | Production build                    |
| `npm run lint` / `typecheck` / `format` | Code quality checks                 |
| `npm run db:migrate`                    | Create/apply migrations (dev)       |
| `npm run db:seed`                       | Seed sectors and Agritech content   |
| `npm run db:reset`                      | Drop, re-migrate and re-seed the DB |
| `npm run db:studio`                     | Browse data in Prisma Studio        |
