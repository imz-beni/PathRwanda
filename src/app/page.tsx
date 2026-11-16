import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/dal";
import { activeListingWhere } from "@/lib/listings";

const steps = [
  {
    title: "Discover",
    text: "See which careers exist in a sector and what each one involves.",
  },
  {
    title: "Learn",
    text: "Find free and low-cost courses for the skills those careers need, and track your progress.",
  },
  {
    title: "Find opportunities",
    text: "Browse open jobs, training and programs from approved organizations.",
  },
  {
    title: "Get matched",
    text: "See the opportunities that fit your interests, skills and courses, with the reasons why.",
  },
];

export default async function Home() {
  const [user, opportunities, courses, pathways] = await Promise.all([
    getCurrentUser(),
    db.listing.count({ where: { ...activeListingWhere(), organization: { status: "APPROVED" } } }),
    db.course.count({ where: { linkActive: true, sector: { status: "LIVE" } } }),
    db.careerPathway.count({ where: { sector: { status: "LIVE" } } }),
  ]);

  const stats = [
    { value: opportunities, label: "open opportunities" },
    { value: courses, label: "courses to learn from" },
    { value: pathways, label: "career pathways" },
  ];

  return (
    <main className="flex-1">
      <section className="border-b border-line bg-gradient-to-b from-brand-soft to-background">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-16 sm:py-24">
          <p className="eyebrow">Starting with Agritech</p>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            From a career interest to a clear path to work.
          </h1>
          <p className="max-w-2xl text-lg text-muted">
            PathRwanda helps young people in Rwanda explore a sector, learn the skills it needs, and
            find real jobs, training and programs that fit them.
          </p>
          <div className="flex flex-wrap gap-3">
            {user?.role === "YOUTH" ? (
              <Link href="/recommendations" className="btn btn-primary btn-lg">
                See your matches
              </Link>
            ) : (
              <Link href="/sectors/agritech" className="btn btn-primary btn-lg">
                Explore Agritech
              </Link>
            )}
            <Link href="/opportunities" className="btn btn-secondary btn-lg">
              Browse opportunities
            </Link>
          </div>
          <dl className="mt-4 grid max-w-2xl grid-cols-3 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col-reverse">
                <dt className="text-sm text-muted">{stat.label}</dt>
                <dd className="text-3xl font-semibold tracking-tight">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section aria-labelledby="how" className="mx-auto max-w-5xl px-4 py-16">
        <p className="eyebrow">How it works</p>
        <h2 id="how" className="mt-1 mb-8 text-2xl font-semibold tracking-tight">
          Four steps, one place
        </h2>
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <li key={step.title} className="card flex flex-col gap-2 p-5">
              <span
                aria-hidden="true"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-soft text-sm font-semibold text-brand-strong"
              >
                {i + 1}
              </span>
              <h3 className="text-lg font-medium">{step.title}</h3>
              <p className="text-sm text-muted">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="who" className="mx-auto max-w-5xl px-4 pb-20">
        <h2 id="who" className="sr-only">
          Who PathRwanda is for
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="card flex flex-col gap-3 p-6">
            <h3 className="text-xl font-semibold tracking-tight">For young people</h3>
            <p className="text-muted">
              Follow a sector, tick the skills you have and track your courses. PathRwanda then
              recommends opportunities and tells you why each one fits.
            </p>
            <div className="mt-auto pt-2">
              {user ? (
                <Link href="/sectors" className="btn btn-primary">
                  Explore sectors
                </Link>
              ) : (
                <Link href="/register" className="btn btn-primary">
                  Create a free account
                </Link>
              )}
            </div>
          </div>
          <div className="card flex flex-col gap-3 p-6">
            <h3 className="text-xl font-semibold tracking-tight">
              For employers and training providers
            </h3>
            <p className="text-muted">
              Publish jobs, training and programs to young people who are building the skills you
              need. Every organization is reviewed before its listings go live.
            </p>
            <div className="mt-auto pt-2">
              {user && user.role !== "YOUTH" ? (
                <Link href="/dashboard" className="btn btn-secondary">
                  Go to your dashboard
                </Link>
              ) : (
                <Link href="/register" className="btn btn-secondary">
                  Register your organization
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
