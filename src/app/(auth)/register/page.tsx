import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/dal";
import { RegisterForm } from "./RegisterForm";

export const metadata = { title: "Create an account | PathRwanda" };

export default async function RegisterPage() {
  if (await getCurrentUser()) redirect("/sectors");

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold">Create your account</h1>
      <RegisterForm />
      <p className="mt-6 text-sm">
        Already have an account?{" "}
        <Link href="/login" className="font-medium underline">
          Log in
        </Link>
      </p>
    </main>
  );
}
