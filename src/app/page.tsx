import Link from "next/link";
import { Hills } from "@/components/Hills";
import { Icon, type IconName } from "@/components/Icon";
import { ListingMeta } from "@/components/ListingCard";
import { TypeBadge } from "@/components/TypeBadge";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/dal";
import { activeListingWhere } from "@/lib/listings";

const steps: { title: string; text: string; icon: IconName }[] = [
  {
    title: "Discover",
    text: "See which careers exist in a sector and what each one involves.",
    icon: "compass",
  },
  {
    title: "Learn",
    text: "Find free and low-cost courses for the skills those careers need, and track your progress.",
    icon: "book",
  },
  {
    title: "Find opportunities",
    text: "Browse open jobs, training and programs from approved organizations.",
    icon: "briefcase",
  },
  {
    title: "Get matched",
    text: "See the opportunities that fit your interests, skills and courses, with the reasons why.",
    icon: "spark",
  },
];

const promises = ["Free to use", "Reviewed organizations", "Built for Rwanda"];

export default async function Home() {
  const openListings = { ...activeListingWhere(), organization: { status: "APPROVED" as const } };

  const [user, opportunities, courses, pathways, organizations, featured] = await Promise.all([
    getCurrentUser(),
    db.listing.count({ where: openListings }),
    db.course.count({ where: { linkActive: true, sector: { status: "LIVE" } } }),
    db.careerPathway.count({ where: { sector: { status: "LIVE" } } }),
    db.organization.count({ where: { status: "APPROVED" } }),
    // The three listings closing soonest: real content for the page, and a nudge to act.
    db.listing.findMany({
      where: openListings,
      orderBy: [{ closesAt: "asc" }, { id: "asc" }],
      take: 3,
      select: {
        id: true,
        title: true,
        type: true,
        location: true,
        closesAt: true,
        organization: { select: { name: true } },
        skills: { select: { name: true }, orderBy: { name: "asc" }, take: 3 },
      },
    }),
  ]);

  const stats = [
    { value: opportunities, label: "open opportunities" },
    { value: courses, label: "courses to learn from" },
    { value: pathways, label: "career pathways" },
    { value: organizations, label: "approved organizations" },
  ];
  const preview = featured[0];
  const isYouth = user?.role === "YOUTH";

  return (
    <main className="flex-1">
      <section className="forest relative overflow-hidden">
        <Hills />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pt-16 pb-28 sm:pt-24 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="flex flex-col gap-6">
            <p className="eyebrow flex items-center gap-2">
              <span className="h-px w-8 bg-gold" aria-hidden="true" />
              Starting with Agritech
            </p>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl">
              From a career interest to a <em className="text-gold">clear path</em> to work.
            </h1>
            <p className="forest-muted max-w-xl text-lg leading-relaxed">
              PathRwanda helps young people in Rwanda explore a sector, learn the skills it needs,
              and find real jobs, training and programs that fit them.
            </p>
            <div className="flex flex-wrap gap-3">
              {isYouth ? (
                <Link href="/recommendations" className="btn btn-gold btn-lg">
                  See your matches
                  <Icon name="arrow" className="h-4 w-4" />
                </Link>
              ) : (
                <Link href="/sectors/agritech" className="btn btn-gold btn-lg">
                  Explore Agritech
                  <Icon name="arrow" className="h-4 w-4" />
                </Link>
              )}
              <Link href="/opportunities" className="btn btn-ghost btn-lg">
                Browse opportunities
              </Link>
            </div>
            <ul className="forest-muted flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {promises.map((promise) => (
                <li key={promise} className="flex items-center gap-1.5">
                  <Icon name="check" className="h-4 w-4 text-gold" />
                  {promise}
                </li>
              ))}
            </ul>
          </div>

          {/* A picture of the product: how a recommendation looks, built from a real listing. */}
          {preview && (
            <div className="relative hidden lg:block" aria-hidden="true">
              <div className="absolute -inset-6 rounded-[2rem] bg-white/5 blur-2xl" />
              <div className="relative rotate-1 rounded-3xl border border-white/10 bg-white p-6 text-zinc-900 shadow-2xl">
                <div className="mb-4 flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold tracking-[0.14em] text-emerald-700 uppercase">
                    Recommended for you
                  </span>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-900">
                    Strong match
                  </span>
                </div>
                <p className="text-xl leading-snug font-semibold tracking-tight">{preview.title}</p>
                <p className="mt-1 text-sm text-zinc-600">
                  {preview.organization.name}
                  {preview.location ? ` · ${preview.location}` : ""}
                </p>
                <div className="mt-5 rounded-2xl bg-zinc-50 p-4">
                  <p className="mb-2 text-sm font-medium">Why this match</p>
                  <ul className="flex flex-col gap-2 text-sm text-zinc-700">
                    {[
                      "You follow Agritech.",
                      "You have the skills it asks for.",
                      "You completed a course in this sector.",
                    ].map((reason) => (
                      <li key={reason} className="flex items-start gap-2">
                        <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                          <Icon name="check" className="h-3 w-3" />
                        </span>
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
                {preview.skills.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {preview.skills.map((skill) => (
                      <span
                        key={skill.name}
                        className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-900"
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* The numbers sit on a card that overlaps the bottom of the hero. */}
      <section
        aria-label="PathRwanda in numbers"
        className="relative mx-auto -mt-14 max-w-6xl px-4"
      >
        <dl className="card grid grid-cols-2 divide-line overflow-hidden lg:grid-cols-4 lg:divide-x">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col-reverse gap-1 p-6">
              <dt className="text-sm text-muted">{stat.label}</dt>
              <dd className="font-display text-4xl font-medium tracking-tight">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="how" className="mx-auto max-w-6xl px-4 py-20">
        <div className="mb-10 max-w-2xl">
          <p className="eyebrow">How it works</p>
          <h2 id="how" className="font-display mt-2 text-4xl font-medium tracking-tight">
            Four steps, one place
          </h2>
          <p className="mt-3 text-lg text-muted">
            PathRwanda joins the steps that are usually separate, so learning leads somewhere.
          </p>
        </div>
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <li key={step.title} className="card flex flex-col gap-3 p-6">
              <div className="flex items-center justify-between">
                <span className="icon-tile">
                  <Icon name={step.icon} />
                </span>
                <span aria-hidden="true" className="font-display text-3xl text-line">
                  0{i + 1}
                </span>
              </div>
              <h3 className="text-lg font-semibold">{step.title}</h3>
              <p className="text-sm leading-relaxed text-muted">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {featured.length > 0 && (
        <section aria-labelledby="closing-soon" className="border-y border-line bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-20">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Closing soon</p>
                <h2
                  id="closing-soon"
                  className="font-display mt-2 text-4xl font-medium tracking-tight"
                >
                  Open opportunities
                </h2>
              </div>
              <Link href="/opportunities" className="btn btn-secondary">
                View all {opportunities}
                <Icon name="arrow" className="h-4 w-4" />
              </Link>
            </div>
            <ul className="grid gap-4 lg:grid-cols-3">
              {featured.map((listing) => (
                <li key={listing.id}>
                  <Link
                    href={`/opportunities/${listing.id}`}
                    className="card card-link flex h-full flex-col gap-4 p-6"
                  >
                    <span className="self-start">
                      <TypeBadge type={listing.type} />
                    </span>
                    <span className="text-lg leading-snug font-semibold">{listing.title}</span>
                    <span className="mt-auto">
                      <ListingMeta listing={listing} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section aria-labelledby="who" className="mx-auto max-w-6xl px-4 py-20">
        <h2 id="who" className="sr-only">
          Who PathRwanda is for
        </h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="forest relative flex flex-col gap-4 overflow-hidden rounded-3xl p-8 sm:p-10">
            <Hills />
            <div className="relative flex flex-col gap-4">
              <p className="eyebrow">For young people</p>
              <h3 className="font-display text-3xl font-medium tracking-tight">
                Know what to learn, and where it leads.
              </h3>
              <p className="forest-muted leading-relaxed">
                Follow a sector, tick the skills you have and track your courses. PathRwanda then
                recommends opportunities and tells you why each one fits.
              </p>
              <div className="pt-2">
                {user ? (
                  <Link href="/sectors" className="btn btn-gold">
                    Explore sectors
                  </Link>
                ) : (
                  <Link href="/register" className="btn btn-gold">
                    Create a free account
                  </Link>
                )}
              </div>
            </div>
          </div>
          <div className="card flex flex-col gap-4 rounded-3xl p-8 sm:p-10">
            <p className="eyebrow">For employers and training providers</p>
            <h3 className="font-display text-3xl font-medium tracking-tight">
              Reach young people who are building your skills.
            </h3>
            <p className="leading-relaxed text-muted">
              Publish jobs, training and programs. Every organization is reviewed before its
              listings go live, so young people can trust what they see.
            </p>
            <div className="mt-auto pt-2">
              {user && !isYouth ? (
                <Link href="/dashboard" className="btn btn-primary">
                  Go to your dashboard
                </Link>
              ) : (
                <Link href="/register" className="btn btn-primary">
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
