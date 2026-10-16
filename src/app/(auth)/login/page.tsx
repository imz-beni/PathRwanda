import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/dal";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Log in | PathRwanda" };

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/sectors");

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold">Log in</h1>
      <LoginForm />
      <p className="mt-6 text-sm">
        New to PathRwanda?{" "}
        <Link href="/register" className="font-medium underline">
          Create an account
        </Link>
      </p>
    </main>
  );
}
