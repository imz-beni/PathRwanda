import type { ReactNode } from "react";
import Link from "next/link";
import { ContactLine } from "@/components/ContactLine";

export const metadata = { title: "Help | PathRwanda" };

const a = "font-medium underline";

type Question = { q: string; a: ReactNode };

const sections: { id: string; title: string; questions: Question[] }[] = [
  {
    id: "start",
    title: "Getting started",
    questions: [
      {
        q: "What is PathRwanda?",
        a: (
          <>
            PathRwanda helps young people in Rwanda go from a career interest to real opportunities.
            You explore a sector, learn the skills it needs, and see jobs, training and programs
            that fit you. The first sector is Agritech.
          </>
        ),
      },
      {
        q: "Do I need an account?",
        a: (
          <>
            No account is needed to read{" "}
            <Link href="/sectors" className={a}>
              sector pages
            </Link>{" "}
            or browse{" "}
            <Link href="/opportunities" className={a}>
              opportunities
            </Link>
            . You need one to follow a sector, track courses, save opportunities and get
            recommendations.{" "}
            <Link href="/register" className={a}>
              Create an account
            </Link>
            .
          </>
        ),
      },
      {
        q: "Does it cost anything?",
        a: <>PathRwanda is free. Each course shows whether it is free or whether fees may apply.</>,
      },
    ],
  },
  {
    id: "youth",
    title: "For young people",
    questions: [
      {
        q: "How do I get recommendations?",
        a: (
          <>
            Do at least one of these: follow a sector on its page, tick your skills on{" "}
            <Link href="/profile" className={a}>
              My profile
            </Link>
            , or start a course. Then open{" "}
            <Link href="/recommendations" className={a}>
              For you
            </Link>
            . The list updates every time those change.
          </>
        ),
      },
      {
        q: "Why was an opportunity recommended to me?",
        a: (
          <>
            Each recommendation has a &quot;Why this match&quot; list. A match is stronger when the
            opportunity is in a sector you follow, asks for skills you have, and is in a sector
            where you have started or completed a course.
          </>
        ),
      },
      {
        q: "How do I track a course?",
        a: (
          <>
            On a sector page, use &quot;Mark as started&quot; or &quot;Mark as completed&quot; under
            a course. Courses open on the provider&apos;s own website. See everything on{" "}
            <Link href="/progress" className={a}>
              My progress
            </Link>
            .
          </>
        ),
      },
      {
        q: "How do I save an opportunity for later?",
        a: (
          <>
            Open the opportunity and choose &quot;Save this opportunity&quot;. Find it again under{" "}
            <Link href="/saved" className={a}>
              Saved
            </Link>
            .
          </>
        ),
      },
      {
        q: "How do I apply?",
        a: (
          <>
            Each open opportunity has a &quot;How to apply&quot; section written by the
            organization. You apply to them directly, not through PathRwanda. An opportunity closes
            at the end of its closing date and can no longer be applied for.
          </>
        ),
      },
      {
        q: "Something looks wrong or unsafe. What do I do?",
        a: (
          <>
            Open the opportunity and use &quot;Report a problem with this opportunity&quot;. An
            administrator reviews every report. Never pay money to apply for a job.
          </>
        ),
      },
    ],
  },
  {
    id: "organizations",
    title: "For employers, agencies and training providers",
    questions: [
      {
        q: "How do I publish a listing?",
        a: (
          <>
            Create an account and choose the type that fits your organization. An administrator
            reviews new organizations first. Once approved, open{" "}
            <Link href="/dashboard" className={a}>
              Dashboard
            </Link>{" "}
            and choose &quot;Create a listing&quot;.
          </>
        ),
      },
      {
        q: "What does a listing need?",
        a: (
          <>
            A title, a type (job, training or program), at least one sector, a description, how to
            apply, and a closing date. Adding the skills you want helps the right young people find
            it.
          </>
        ),
      },
      {
        q: "What happens after the closing date?",
        a: (
          <>
            The listing stops showing as open by itself. You can also close it early, reopen it,
            edit it or remove it from your dashboard.
          </>
        ),
      },
    ],
  },
  {
    id: "account",
    title: "Your account and data",
    questions: [
      {
        q: "I cannot log in.",
        a: (
          <>
            Check the email address and type the password carefully; capital and small letters
            matter. If your account was deactivated, or you forgot your password,{" "}
            <ContactLine fallback="contact the PathRwanda administrator" />. Password reset by email
            is not available in this prototype yet.
          </>
        ),
      },
      {
        q: "What do you do with my data?",
        a: (
          <>
            Read{" "}
            <Link href="/privacy" className={a}>
              Your data and privacy
            </Link>
            . In short: we collect only what is needed to run your account and recommend
            opportunities, and you can ask to see, correct or delete it.
          </>
        ),
      },
    ],
  },
];

export default function HelpPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
      <h1 className="mb-2 text-2xl font-semibold">Help</h1>
      <p className="mb-6 text-zinc-600 dark:text-zinc-400">
        Answers to common questions. Choose a question to open it.
      </p>

      {sections.map((section) => (
        <section key={section.id} aria-labelledby={section.id} className="mb-8">
          <h2 id={section.id} className="mb-2 text-lg font-medium">
            {section.title}
          </h2>
          <div className="flex flex-col gap-2">
            {section.questions.map((item) => (
              <details
                key={item.q}
                className="rounded-lg border border-zinc-200 px-4 py-3 dark:border-zinc-800"
              >
                <summary className="cursor-pointer font-medium">{item.q}</summary>
                <p className="mt-2 text-zinc-700 dark:text-zinc-300">{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      ))}

      <p className="text-sm text-zinc-500">
        Still stuck? You can{" "}
        <ContactLine fallback="contact the PathRwanda administrator who gave you this address" />.
      </p>
    </main>
  );
}
