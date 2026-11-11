"use client";

import { useActionState } from "react";
import { FormField } from "@/components/FormField";
import { SubmitButton } from "@/components/SubmitButton";
import type { ContentFormState } from "../../actions";

export type PathwayDefaults = {
  title: string;
  description: string;
  incomeNote: string;
  skillIds: string[];
};

type Props = {
  action: (state: ContentFormState | undefined, formData: FormData) => Promise<ContentFormState>;
  skills: { id: string; name: string }[];
  defaults?: PathwayDefaults;
  submitLabel: string;
};

export function PathwayForm({ action, skills, defaults, submitLabel }: Props) {
  const [state, formAction] = useActionState(action, undefined);
  const values = state?.values;
  const errors = state?.errors;
  // After a failed submit, the boxes keep what the admin ticked.
  const chosen = new Set(values ? values.skillIds.split(",") : (defaults?.skillIds ?? []));

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      {state?.message && (
        <p
          role="alert"
          className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
        >
          {state.message}
        </p>
      )}
      <FormField
        label="Pathway title"
        name="title"
        hint="A job or role, for example Farm technician."
        defaultValue={values?.title ?? defaults?.title}
        errors={errors?.title}
      />
      <div className="flex flex-col gap-1">
        <label htmlFor="description" className="text-sm font-medium">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={values?.description ?? defaults?.description}
          aria-invalid={errors?.description?.length ? true : undefined}
          aria-describedby={errors?.description?.length ? "description-error" : undefined}
          className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-base dark:border-zinc-700"
        />
        {errors?.description?.length ? (
          <p id="description-error" role="alert" className="text-sm text-red-600 dark:text-red-400">
            {errors.description[0]}
          </p>
        ) : null}
      </div>
      <FormField
        label="Typical income (optional)"
        name="incomeNote"
        hint="Only fill this in when a reliable source backs it. Leave it empty otherwise."
        defaultValue={values?.incomeNote ?? defaults?.incomeNote}
        errors={errors?.incomeNote}
      />
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-medium">Skills this pathway needs</legend>
        {skills.length === 0 ? (
          <p className="text-sm text-zinc-500">Add skills to this sector first.</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {skills.map((skill) => (
              <label key={skill.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="skillIds"
                  value={skill.id}
                  defaultChecked={chosen.has(skill.id)}
                />
                {skill.name}
              </label>
            ))}
          </div>
        )}
        {errors?.skillIds?.length ? (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {errors.skillIds[0]}
          </p>
        ) : null}
      </fieldset>
      <div>
        <SubmitButton pendingText="Saving...">{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}
