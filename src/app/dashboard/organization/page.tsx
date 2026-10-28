import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/dal";
import { redirect } from "next/navigation";
import { OrganizationForm } from "./OrganizationForm";

export const metadata = { title: "Organization profile | PathRwanda" };

export default async function OrganizationPage() {
  const user = await requireRole("ORGANIZATION", "TRAINING_PROVIDER");
  const organization = await db.organization.findUnique({ where: { ownerId: user.id } });
  if (!organization) redirect("/dashboard");

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-10">
      <Link href="/dashboard" className="text-sm underline">
        Dashboard
      </Link>
      <h1 className="mt-3 mb-6 text-2xl font-semibold">Organization profile</h1>
      <OrganizationForm name={organization.name} website={organization.website ?? ""} />
    </main>
  );
}
