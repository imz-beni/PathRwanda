import Link from "next/link";
import { ContactLine } from "@/components/ContactLine";

export const metadata = { title: "Your data and privacy | PathRwanda" };

const h2 = "mt-8 mb-2 text-lg font-medium";
const list = "flex list-disc flex-col gap-1 pl-5";

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
      <h1 className="mb-2 text-2xl font-semibold">Your data and privacy</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        This page explains, in plain words, what PathRwanda knows about you, why, and what you can
        do about it. PathRwanda is a student prototype. It follows Rwanda&apos;s law on the
        protection of personal data and privacy (Law No. 058/2021).
      </p>

      <h2 className={h2}>What we collect</h2>
      <ul className={list}>
        <li>
          <span className="font-medium">Your account:</span> your name, your email address, and your
          password. The password is stored scrambled (hashed), so nobody, including us, can read it.
        </li>
        <li>
          <span className="font-medium">Your age confirmation:</span> the date you confirmed you are
          16 or older. We do not ask for your date of birth.
        </li>
        <li>
          <span className="font-medium">If you are a young user:</span> the sectors you follow, the
          skills you tick on your profile, the courses you mark as started or completed, and the
          opportunities you save.
        </li>
        <li>
          <span className="font-medium">If you represent an organization:</span> its name, type and
          website, and the listings you publish.
        </li>
        <li>
          <span className="font-medium">Reports:</span> what you write when you report a listing.
        </li>
        <li>
          <span className="font-medium">Activity counts:</span> when you follow a sector, click a
          course link, start or complete a course, or open a recommended opportunity. We use these
          to measure whether PathRwanda is helping.
        </li>
      </ul>

      <h2 className={h2}>What we do not collect</h2>
      <ul className={list}>
        <li>No national ID number, phone number, home address or payment details.</li>
        <li>No advertising or tracking by other companies.</li>
        <li>
          One cookie only: it keeps you signed in and lasts up to 7 days. Logging out removes it.
        </li>
      </ul>

      <h2 className={h2}>Why we use it</h2>
      <ul className={list}>
        <li>To let you sign in and keep your account safe.</li>
        <li>
          To recommend opportunities. Your followed sectors, skills and courses are compared with
          each open listing, and the page tells you why each one was suggested.
        </li>
        <li>To keep listings trustworthy, by reviewing organizations and reports.</li>
      </ul>

      <h2 className={h2}>Who can see it</h2>
      <ul className={list}>
        <li>Your skills, progress, follows and saved opportunities are visible only to you.</li>
        <li>
          Administrators can see your name, email and account type so they can manage accounts, and
          they read the reports you send.
        </li>
        <li>
          An organization&apos;s name and its listings are public. Organizations never see who
          viewed or saved a listing.
        </li>
        <li>We do not sell your data or share it for advertising.</li>
        <li>
          The data is stored with the hosting companies that run this website and its database.
        </li>
        <li>Course links open other websites. Those sites have their own privacy rules.</li>
      </ul>

      <h2 className={h2}>How long we keep it</h2>
      <p>
        We keep your data while your account exists. If an administrator deactivates an account, its
        data is kept but nobody can sign in to it.
      </p>

      <h2 className={h2}>Your rights</h2>
      <p className="mb-2">You can ask to:</p>
      <ul className={list}>
        <li>see the data we hold about you;</li>
        <li>correct anything that is wrong;</li>
        <li>delete your account and its data.</li>
      </ul>
      <p className="mt-2">
        To do any of these,{" "}
        <ContactLine fallback="contact the PathRwanda administrator who gave you this address" />.
        You can change your skills at any time on your{" "}
        <Link href="/profile" className="font-medium underline">
          profile
        </Link>
        .
      </p>

      <h2 className={h2}>Age</h2>
      <p>
        PathRwanda is for people aged 16 and older. You confirm this when you create an account.
      </p>

      <p className="mt-8 text-sm text-zinc-500">
        Questions about using the site? See{" "}
        <Link href="/help" className="underline">
          Help
        </Link>
        .
      </p>
    </main>
  );
}
