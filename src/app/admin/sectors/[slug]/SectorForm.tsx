"use client";

import { useActionState } from "react";
import { FormField } from "@/components/FormField";
import { SubmitButton } from "@/components/SubmitButton";
import { SECTOR_STATUSES, SECTOR_STATUS_LABEL } from "@/lib/validation/content";
import { updateSector } from "../actions";

type Props = { sectorId: string; name: string; overview: string; status: string };

export function SectorForm({ sectorId, name, overview, status }: Props) {
  const [state, action] = useActionState(updateSector.bind(null, sectorId), undefined);
  const values = state?.values;

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      {state?.saved && (
        <p
          role="status"
          className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
        >
          The sector was saved.
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
      <FormField
        label="Name"
        name="name"
        defaultValue={values?.name ?? name}
        errors={state?.errors?.name}
      />
      <div className="flex flex-col gap-1">
        <label htmlFor="overview" className="text-sm font-medium">
          Overview
        </label>
        <textarea
          id="overview"
          name="overview"
          rows={3}
          defaultValue={values?.overview ?? overview}
          aria-invalid={state?.errors?.overview?.length ? true : undefined}
          aria-describedby={state?.errors?.overview?.length ? "overview-error" : undefined}
          className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-base dark:border-zinc-700"
        />
        {state?.errors?.overview?.length ? (
          <p id="overview-error" role="alert" className="text-sm text-red-600 dark:text-red-400">
            {state.errors.overview[0]}
          </p>
        ) : null}
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="status" className="text-sm font-medium">
          Status
        </label>
        <select
          id="status"
          name="status"
          defaultValue={values?.status ?? status}
          className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-base dark:border-zinc-700"
        >
          {SECTOR_STATUSES.map((s) => (
            <option key={s} value={s}>
              {SECTOR_STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        <p className="text-sm text-zinc-500">
          Coming soon sectors show a short message instead of pathways and courses.
        </p>
      </div>
      <div>
        <SubmitButton pendingText="Saving...">Save sector</SubmitButton>
      </div>
    </form>
  );
}
