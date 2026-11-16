import { supportEmail } from "@/lib/support";

// "email ..." when a contact address is configured, otherwise a plain fallback.
export function ContactLine({ fallback }: { fallback: string }) {
  const email = supportEmail();
  if (!email) return <>{fallback}</>;
  return (
    <>
      email{" "}
      <a href={`mailto:${email}`} className="font-medium underline">
        {email}
      </a>
    </>
  );
}
