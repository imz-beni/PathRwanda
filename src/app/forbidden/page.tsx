import Link from "next/link";

export const metadata = { title: "Access not allowed | PathRwanda" };

export default function ForbiddenPage() {
  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-10">
      <h1 className="mb-3 text-2xl font-semibold">You cannot open this page</h1>
      <p className="mb-6 text-zinc-600 dark:text-zinc-400">
        Your account does not have access to this part of PathRwanda.
      </p>
      <Link href="/" className="font-medium underline">
        Go back home
      </Link>
    </main>
  );
}
