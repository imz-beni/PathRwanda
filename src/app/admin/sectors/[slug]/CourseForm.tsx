"use client";

import { useActionState } from "react";
import { FormField } from "@/components/FormField";
import { SubmitButton } from "@/components/SubmitButton";
import type { ContentFormState } from "../actions";

export type CourseDefaults = {
  title: string;
  provider: string;
  url: string;
  description: string;
  isFree: boolean;
};

type Props = {
  action: (state: ContentFormState | undefined, formData: FormData) => Promise<ContentFormState>;
  defaults?: CourseDefaults;
  submitLabel: string;
};

export function CourseForm({ action, defaults, submitLabel }: Props) {
  const [state, formAction] = useActionState(action, undefined);
  const values = state?.values;
  const errors = state?.errors;
  // After a failed submit, the checkbox keeps what the admin chose.
  const isFree = values ? values.isFree === "on" : (defaults?.isFree ?? true);

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
        label="Course title"
        name="title"
        defaultValue={values?.title ?? defaults?.title}
        errors={errors?.title}
      />
      <FormField
        label="Provider"
        name="provider"
        hint="Who runs the course, for example a university or TVET school."
        defaultValue={values?.provider ?? defaults?.provider}
        errors={errors?.provider}
      />
      <FormField
        label="Course address"
        name="url"
        type="url"
        hint="Open the link yourself before saving. Only add courses you have checked."
        defaultValue={values?.url ?? defaults?.url}
        errors={errors?.url}
      />
      <div className="flex flex-col gap-1">
        <label htmlFor="description" className="text-sm font-medium">
          Short description (optional)
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
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isFree" defaultChecked={isFree} />
        This course is free
      </label>
      <div>
        <SubmitButton pendingText="Saving...">{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}
