"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/SubmitButton";
import { reportListing } from "./actions";

export function ReportForm({ listingId }: { listingId: string }) {
  const [state, action] = useActionState(reportListing, undefined);

  if (state?.sent) {
    return (
      <p
        role="status"
        className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
      >
        Thank you. Our team will look at this opportunity.
      </p>
    );
  }

  const errors = state?.errors?.reason;
  return (
    <form action={action} className="flex flex-col gap-3" noValidate>
      {state?.message && (
        <p
          role="alert"
          className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
        >
          {state.message}
        </p>
      )}
      <input type="hidden" name="listingId" value={listingId} />
      <div className="flex flex-col gap-1">
        <label htmlFor="reason" className="text-sm font-medium">
          What is wrong with this opportunity?
        </label>
        <textarea
          id="reason"
          name="reason"
          rows={3}
          maxLength={500}
          defaultValue={state?.values?.reason}
          aria-invalid={errors?.length ? true : undefined}
          aria-describedby={["reason-hint", errors?.length ? "reason-error" : null]
            .filter(Boolean)
            .join(" ")}
          className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-base dark:border-zinc-700"
        />
        <p id="reason-hint" className="text-sm text-zinc-500">
          For example: they asked for money, the details are false, or the link does not work.
        </p>
        {errors?.length ? (
          <p id="reason-error" role="alert" className="text-sm text-red-600 dark:text-red-400">
            {errors[0]}
          </p>
        ) : null}
      </div>
      <div>
        <SubmitButton pendingText="Sending...">Send report</SubmitButton>
      </div>
    </form>
  );
}
