import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/dal";
import { safeNextPath } from "@/lib/safe-redirect";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Log in | PathRwanda" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  if (await getCurrentUser()) redirect(safeNextPath(next));

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-12">
      <div className="card p-6 sm:p-8">
        <h1 className="mb-1 text-2xl font-semibold">Log in</h1>
        <p className="mb-6 text-sm text-muted">Welcome back to PathRwanda.</p>
        <LoginForm next={next ? safeNextPath(next) : undefined} />
      </div>
      <p className="mt-6 text-center text-sm">
        New to PathRwanda?{" "}
        <Link href="/register" className="font-medium underline">
          Create an account
        </Link>
      </p>
    </main>
  );
}
