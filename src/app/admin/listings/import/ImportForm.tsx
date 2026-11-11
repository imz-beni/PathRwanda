"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/SubmitButton";
import { importListings } from "./actions";

const MAX_SHOWN = 50;

type Props = { organizations: { id: string; name: string }[] };

export function ImportForm({ organizations }: Props) {
  const [state, action] = useActionState(importListings, undefined);
  const problems = state?.problems ?? [];

  return (
    <form action={action} className="flex flex-col gap-4">
      {state?.imported && (
        <p
          role="status"
          className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
        >
          Imported {state.imported.count} {state.imported.count === 1 ? "listing" : "listings"} for{" "}
          {state.imported.organization}.
        </p>
      )}
      {state?.message && (
        <p
          role="alert"
          className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
        >
          {state.message}
        </p>
      )}
      {problems.length > 0 && (
        <div
          role="alert"
          className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
        >
          <p className="mb-2 font-medium">
            Nothing was imported. Fix {problems.length === 1 ? "this problem" : "these problems"} in
            the file and upload it again.
          </p>
          <ul className="list-disc pl-5">
            {problems.slice(0, MAX_SHOWN).map((problem, index) => (
              <li key={index}>
                Row {problem.row}: {problem.message}
              </li>
            ))}
          </ul>
          {problems.length > MAX_SHOWN && (
            <p className="mt-2">And {problems.length - MAX_SHOWN} more.</p>
          )}
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label htmlFor="organizationId" className="text-sm font-medium">
          Organization
        </label>
        <select
          id="organizationId"
          name="organizationId"
          required
          defaultValue=""
          className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-base dark:border-zinc-700"
        >
          <option value="" disabled>
            Choose an organization
          </option>
          {organizations.map((organization) => (
            <option key={organization.id} value={organization.id}>
              {organization.name}
            </option>
          ))}
        </select>
        <p className="text-sm text-zinc-500">
          Every listing in the file is published under this organization.
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="file" className="text-sm font-medium">
          CSV file
        </label>
        <input id="file" name="file" type="file" accept=".csv,text/csv" required />
      </div>

      <div>
        <SubmitButton pendingText="Importing...">Import listings</SubmitButton>
      </div>
    </form>
  );
}
