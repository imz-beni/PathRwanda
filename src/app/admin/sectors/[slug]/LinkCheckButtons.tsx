"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { recheckCourseLink, recheckSectorLinks } from "../actions";

const RESULT_TEXT = {
  OK: "The link works.",
  BROKEN: "The link is broken, so the course is now hidden.",
  UNKNOWN: "We could not check this link (the site may block automatic checks). Nothing changed.",
};

function CheckButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded border border-zinc-300 px-3 py-1 text-sm disabled:opacity-60 dark:border-zinc-700"
    >
      {pending ? "Checking..." : label}
    </button>
  );
}

export function RecheckLinkButton({ courseId }: { courseId: string }) {
  const [state, action] = useActionState(recheckCourseLink.bind(null, courseId), undefined);
  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <CheckButton label="Re-check link" />
      {state?.result && (
        <span role="status" className="text-sm">
          {RESULT_TEXT[state.result]}
        </span>
      )}
    </form>
  );
}

export function RecheckAllButton({ sectorId }: { sectorId: string }) {
  const [state, action] = useActionState(recheckSectorLinks.bind(null, sectorId), undefined);
  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <CheckButton label="Re-check all links" />
      {state?.checked !== undefined && (
        <span role="status" className="text-sm">
          Checked {state.checked}. {state.broken} broken and hidden
          {state.unknown ? `, ${state.unknown} could not be checked` : ""}.
        </span>
      )}
    </form>
  );
}
