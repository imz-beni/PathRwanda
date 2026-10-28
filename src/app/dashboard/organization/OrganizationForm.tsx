"use client";

import { useActionState } from "react";
import { FormField } from "@/components/FormField";
import { SubmitButton } from "@/components/SubmitButton";
import { updateOrganization } from "./actions";

export function OrganizationForm({ name, website }: { name: string; website: string }) {
  const [state, action] = useActionState(updateOrganization, undefined);

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      {state?.saved && (
        <p
          role="status"
          className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
        >
          Your organization details were saved.
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
        label="Organization name"
        name="name"
        defaultValue={state?.values?.name ?? name}
        errors={state?.errors?.name}
      />
      <FormField
        label="Website (optional)"
        name="website"
        type="url"
        defaultValue={state?.values?.website ?? website}
        errors={state?.errors?.website}
      />
      <SubmitButton pendingText="Saving...">Save</SubmitButton>
    </form>
  );
}
