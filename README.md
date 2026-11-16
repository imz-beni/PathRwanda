# PathRwanda

Career discovery, learning and opportunity matching for Rwandan youth.

Many young people in Rwanda finish school without a clear picture of which careers exist, which
skills those careers need, or where to find real openings. PathRwanda joins those steps in one
place: **discover** a sector, **learn** its skills through vetted courses, **find** open jobs,
training and programs, and **get matched** to the ones that fit. The first version covers the
Agritech sector.

## Live site

**<https://path-rwanda.vercel.app>**

The app runs on Vercel with a PostgreSQL database on Neon. Without an account you can read the
sector pages, browse and search opportunities, and open the help and privacy pages. To try the
rest, choose **Create account**, or use a demo account from the list under
[Log in](#8-log-in). The demo passwords for the live site are not published here; they are
shared with reviewers in the project submission.

## Who uses it and what they can do

| User                                  | What they can do                                                                                                                                                                                                       |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Visitor (no account)                  | Read sector pages with career pathways, skills and courses. Browse and search open opportunities. Read the help and privacy pages.                                                                                     |
| Young user                            | Follow a sector, mark courses as started or completed, pick skills, see personal recommendations with "why this match", save opportunities, and report a listing.                                                      |
| Employer, agency or training provider | Register an organization, wait for approval, then create, edit, close, reopen and remove listings.                                                                                                                     |
| Administrator                         | Approve organizations, handle reported listings, remove or restore any listing, deactivate users, edit sectors, pathways, skills and courses, re-check course links, and import many listings from a CSV file at once. |

## Built with

Next.js 16 (App Router), TypeScript and Tailwind CSS for the app; PostgreSQL with Prisma for
the data; Vitest for tests; GitHub Actions for automated checks.

## Run it on your computer

### 1. Install what you need

| Tool                                                              | Version     | Check it with      |
| ----------------------------------------------------------------- | ----------- | ------------------ |
| [Node.js](https://nodejs.org)                                     | 22 or newer | `node --version`   |
| [Git](https://git-scm.com)                                        | any         | `git --version`    |
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | any         | `docker --version` |

Docker runs the PostgreSQL database. Start Docker Desktop and wait until it says the engine is
running before you continue.

### 2. Get the code

```bash
git clone https://github.com/imz-beni/PathRwanda.git
cd PathRwanda
npm install
```

### 3. Create your settings file

Copy the example file to a new file called `.env`:

```bash
cp .env.example .env
```

On Windows PowerShell, use `Copy-Item .env.example .env` instead.

Open `.env` in a text editor and set the values:

| Setting              | What to put                                                                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`       | Leave as it is. It already points at the Docker database.                                                                                   |
| `ADMIN_EMAIL`        | The email you will log in with as administrator.                                                                                            |
| `ADMIN_PASSWORD`     | A password of your choice for that account. Replace `change-me`; the setup refuses it.                                                      |
| `TEST_USER_PASSWORD` | One password shared by all the demo accounts below. Replace `change-me`. Leave it empty if you do not want demo accounts and demo listings. |
| `SUPPORT_EMAIL`      | Optional. A contact address shown on the help and privacy pages. Add this line yourself if you want one.                                    |

### 4. Start the database

```bash
docker compose up -d
```

### 5. Create the tables

```bash
npm run db:deploy
```

### 6. Add the starter content

```bash
npm run db:seed
```

This adds the four sectors, the Agritech pathways, skills and courses, your admin account, and
the demo accounts and listings. It prints `Seed complete` when it is done. Running it again is
safe: it only adds what is missing.

### 7. Start the app

```bash
npm run dev
```

Open <http://localhost:3000> in your browser.

### 8. Log in

| Account                           | Password             | What it shows                                     |
| --------------------------------- | -------------------- | ------------------------------------------------- |
| The `ADMIN_EMAIL` you chose       | `ADMIN_PASSWORD`     | The admin pages at `/admin`                       |
| `youth.test@pathrwanda.local`     | `TEST_USER_PASSWORD` | A young user: follow, progress, recommendations   |
| `employer.test@pathrwanda.local`  | `TEST_USER_PASSWORD` | An approved employer with listings (`/dashboard`) |
| `coop.test@pathrwanda.local`      | `TEST_USER_PASSWORD` | An approved cooperative with listings             |
| `agency.test@pathrwanda.local`    | `TEST_USER_PASSWORD` | An approved agency with listings                  |
| `institute.test@pathrwanda.local` | `TEST_USER_PASSWORD` | An approved training provider with courses        |
| `provider.test@pathrwanda.local`  | `TEST_USER_PASSWORD` | A provider still waiting for admin approval       |

You can also create your own account with **Create account**.

### Stopping and starting again

- Stop the app with `Ctrl+C` in its terminal. Stop the database with `docker compose down`.
- Next time, run only `docker compose up -d` and `npm run dev`.

### If something goes wrong

| Problem                                                      | Fix                                                                                                                           |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| `docker compose up` says it cannot connect to the Docker API | Docker Desktop is not running. Open it and wait for the engine to start.                                                      |
| "Can't reach database server at localhost:5432"              | The database is not running. Run `docker compose up -d`.                                                                      |
| Port 5432 or 3000 is already in use                          | Another program is using it. Close that program, or stop an old copy with `docker compose down`.                              |
| "The email or password is not correct"                       | Type the password exactly as it is in `.env`, without quotes. After changing `.env`, run `npm run db:seed` again to apply it. |
| The seed says a password "is still the placeholder"          | Replace `change-me` in `.env` with a real password, then run `npm run db:seed` again.                                         |
| `EPERM` error from Prisma on Windows                         | Stop `npm run dev`, run the command again, then restart the app.                                                              |
| You want a clean start                                       | `npm run db:reset` deletes all data, recreates the tables and runs the seed.                                                  |

## Run the checks

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

The same checks run on GitHub for every pull request and every change to `main`.

## Put it online

[docs/deployment.md](docs/deployment.md) explains, step by step, how to deploy PathRwanda to a
public address with a hosted database.

## Known limitations

This is a prototype. These parts of the design are not built yet:

- **Email verification.** Accounts work as soon as they are created; no confirmation email is sent.
- **Email alerts for new matches.** New matches are flagged inside the app only; no email is sent.
- **Password reset by email.** An administrator has to help a user who forgets their password.
- **Sectors other than Agritech** are listed as "coming soon".
- **Demo data.** The seeded listings are made up for testing and say so. Only a few real courses are included.

## How each part works

### Accounts and roles

- Roles: youth, organization, training provider and admin. Access is enforced on the server (`src/lib/auth/dal.ts`).
- Registration requires users to confirm they are 16 or older. Organizations and providers start as `PENDING` until an admin approves them.
- Passwords are hashed with bcrypt. Sessions are stored in the database and sent in an HTTP-only cookie.
- `npm run db:seed` creates a development admin from `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env`.

### Learning features (Agritech)

- Sector pages show career pathways, the skills they need, and links to external courses.
- Young users can follow sectors, mark courses as started or completed, and pick the skills they have (`/profile`).
- Course links go through `/go/course/[id]` so clicks can be counted. Follows, clicks and course changes are logged in the `Event` table for the MVP metrics.
- Course links in `prisma/seed.ts` must be real and checked. Do not add URLs that have not been opened.
- Admins edit sectors and courses at `/admin/sectors`: change a sector's name, overview and live/coming-soon status, and add, edit, hide, show or delete courses. Courses that learners have progress on can be hidden but not deleted.
- "Re-check link" fetches a course address from the server. A clearly dead link (404, 410 or an unknown site) hides the course. If the site blocks the check or does not answer, nothing changes. A working link does not un-hide a course an admin hid.
- Admins also manage each sector's career pathways (title, description, optional income note, linked skills) and skills. Renaming a skill updates it everywhere. A skill that a learner or listing uses cannot be deleted; deleting an unused skill removes it from pathways.
- Hidden courses disappear from sector and progress pages, and old `/go/course/...` links send people to the sector page instead.
- `npm run db:seed` only adds starter content that is missing, so it never undoes admin edits. Use `npm run db:reset` for a fresh copy of the starter content.

### Organizations and listings

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

### Matching and saved opportunities

- Young users see their top 10 matches at `/recommendations`. Each open listing is scored out of 100: 50 if it is in a sector they follow, up to 30 for how many of its skills they have, and 20 for a completed course in that sector (10 if only started). The weights live in `src/lib/matching/config.ts`.
- The scoring is a pure function (`src/lib/matching/score.ts`) with tests for five sample users. Only open listings from approved organizations are scored.
- Every match shows "Why this match" in plain sentences. Recommendations are worked out on each visit and never stored, so they always reflect the latest follows, skills and course progress.
- Recommendation links go through `/go/match/[id]`, which logs a `MATCHED_LISTING_VIEWED` event for the MVP metrics.
- New matches raise an in-app alert: a count beside "For you" in the menu and a "new" section on the recommendations page. A listing counts when it was published after the user last chose "Mark as seen" (or after they joined) and scores 50 or more.
- Young users can save a listing from its page and see their list at `/saved`. Saved listings that have closed are marked; removed ones disappear.

### Help and privacy

- `/help` answers common questions for young users and organizations.
- `/privacy` explains in plain words what data is collected, why, who can see it, and how to ask for it to be corrected or deleted, in line with Rwanda's Law No. 058/2021.
- Set `SUPPORT_EMAIL` to show a contact address on both pages. Without it, they ask people to contact the administrator.

## Scripts

| Script                                  | Purpose                                                        |
| --------------------------------------- | -------------------------------------------------------------- |
| `npm run dev`                           | Start the app for development                                  |
| `npm run build` / `npm start`           | Build the app, then run the built version                      |
| `npm run lint` / `typecheck` / `format` | Code quality checks                                            |
| `npm test`                              | Run the unit tests                                             |
| `npm run db:deploy`                     | Create or update the tables from the saved migrations          |
| `npm run db:migrate`                    | Create a new migration after changing `prisma/schema.prisma`   |
| `npm run db:seed`                       | Add the starter content, admin account and demo data           |
| `npm run db:reset`                      | Delete everything, recreate the tables and seed again          |
| `npm run db:studio`                     | Browse the data in Prisma Studio                               |
| `npm run vercel-build`                  | The build used when deploying: applies migrations, then builds |

## Project layout

| Folder           | What is in it                                                                  |
| ---------------- | ------------------------------------------------------------------------------ |
| `src/app`        | Pages and server actions, one folder per address (for example `src/app/admin`) |
| `src/components` | Shared interface pieces such as the header and forms                           |
| `src/lib`        | Logic with tests: sign-in, validation, matching, CSV import, link checks       |
| `prisma`         | The database design (`schema.prisma`), migrations and the seed script          |
| `docs`           | The deployment guide                                                           |
