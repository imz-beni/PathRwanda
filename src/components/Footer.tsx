import { strings } from "@/lib/strings";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex max-w-5xl flex-col gap-1 px-4 py-6 text-sm text-zinc-600 dark:text-zinc-400">
        <p className="font-medium">{strings.footer.tagline}</p>
        <p>{strings.footer.privacy}</p>
      </div>
    </footer>
  );
}
