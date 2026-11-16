# Deploying PathRwanda

This guide puts PathRwanda on a public address using two free services:

- **Neon** hosts the PostgreSQL database.
- **Vercel** hosts the app and rebuilds it every time `main` changes on GitHub.

Any host that runs Node.js 22 and any PostgreSQL database will also work. The app only needs
the `DATABASE_URL` setting and the build command `npm run vercel-build`.

## 1. Create the database (Neon)

1. Sign up at <https://neon.tech> and create a project. Choose the region closest to your users.
2. Open **Connect** and turn **Connection pooling off**, so you get the direct connection.
3. Copy the connection string. It looks like
   `postgresql://USER:PASSWORD@HOST/DBNAME?sslmode=require`. Keep it private: anyone who has
   it can read and change the database.

## 2. Deploy the app (Vercel)

1. Sign up at <https://vercel.com> with your GitHub account.
2. Choose **Add New > Project** and import the `PathRwanda` repository.
3. Vercel detects Next.js. Leave the build settings as they are: it runs the `vercel-build`
   script from `package.json`, which prepares the database client, applies any new database
   migrations and builds the app.
4. Under **Environment Variables**, add `DATABASE_URL` with the connection string from step 1.
5. Click **Deploy**. When it finishes, Vercel shows the public address
   (`https://<project>.vercel.app`).

The first deploy creates all the tables. The database is still empty, so the next step adds
the starter content.

## 3. Add the starter content (once)

Run the seed script from your own computer, pointed at the live database. Choose new
passwords here. Do not reuse the ones from your local `.env`.

PowerShell (Windows):

```powershell
$env:DATABASE_URL = "postgresql://USER:PASSWORD@HOST/DBNAME?sslmode=require"
$env:ADMIN_EMAIL = "you@example.com"
$env:ADMIN_PASSWORD = "a-long-private-password"
$env:TEST_USER_PASSWORD = "a-password-for-the-demo-accounts"
npm run db:seed
```

Bash (macOS, Linux, Git Bash):

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DBNAME?sslmode=require" \
ADMIN_EMAIL="you@example.com" \
ADMIN_PASSWORD="a-long-private-password" \
TEST_USER_PASSWORD="a-password-for-the-demo-accounts" \
npm run db:seed
```

Values set in the terminal win over the ones in `.env`, so your local database is not touched.
Close that terminal afterwards so later commands go back to the local database.

This creates the four sectors, the Agritech pathways, skills and courses, the admin account,
and (because `TEST_USER_PASSWORD` is set) the demo accounts and demo listings. Leave
`TEST_USER_PASSWORD` out if you do not want demo data on the live site.

Running the seed again is safe: it only adds what is missing and never undoes changes made in
the admin pages.

## 4. Check the live site

Open the public address in a private browser window and check that:

- the home page and `/sectors/agritech` load;
- `/opportunities` lists the demo listings;
- you can log in as the admin and open `/admin`;
- you can log in as `youth.test@pathrwanda.local`, follow Agritech and see `/recommendations`.

## Updating the live site

Merge a pull request into `main`. Vercel rebuilds automatically and applies any new database
migrations during the build.

## Problems and fixes

| Problem                                             | Fix                                                                                                                                    |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Build fails with "Can't reach database server"      | Check `DATABASE_URL` in Vercel. It must be the direct (not pooled) Neon string and end with `?sslmode=require`.                        |
| Pages load but show no sectors                      | The seed has not been run against the live database (step 3).                                                                          |
| "The email or password is not correct"              | The account was seeded with a different password. Run step 3 again with the password you want; it updates the admin and demo accounts. |
| The seed says a password "is still the placeholder" | `change-me` is refused on purpose. Set a real password.                                                                                |
