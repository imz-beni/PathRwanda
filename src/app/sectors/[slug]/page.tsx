import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const sector = await db.sector.findUnique({ where: { slug } });
  return { title: `${sector?.name ?? "Sector"} | PathRwanda` };
}

export default async function SectorPage({ params }: Props) {
  const { slug } = await params;
  const sector = await db.sector.findUnique({
    where: { slug },
    include: { pathways: { orderBy: { title: "asc" } } },
  });
  if (!sector) notFound();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <Link href="/sectors" className="text-sm underline">
        All sectors
      </Link>
      <h1 className="mt-3 mb-2 text-2xl font-semibold">{sector.name}</h1>
      <p className="mb-6 text-zinc-600 dark:text-zinc-400">{sector.overview}</p>

      {sector.status === "COMING_SOON" ? (
        <p className="rounded-md bg-zinc-100 p-4 dark:bg-zinc-900">
          We are still building this sector. Agritech is available now.
        </p>
      ) : (
        <section>
          <h2 className="mb-3 text-lg font-medium">Career pathways</h2>
          <ul className="flex flex-col gap-3">
            {sector.pathways.map((pathway) => (
              <li
                key={pathway.id}
                className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
              >
                <h3 className="font-medium">{pathway.title}</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{pathway.description}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
