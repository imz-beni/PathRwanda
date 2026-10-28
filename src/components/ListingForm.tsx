"use client";

import { useActionState, useState } from "react";
import { FormField } from "@/components/FormField";
import { SubmitButton } from "@/components/SubmitButton";
import type { ListingFormState } from "@/app/dashboard/listings/actions";
import { LISTING_TYPES, TYPE_LABEL } from "@/lib/validation/listing";

type SectorOption = { id: string; name: string; skills: { id: string; name: string }[] };

export type ListingDefaults = {
  title?: string;
  type?: string;
  sectorIds?: string[];
  skillIds?: string[];
  description?: string;
  requirements?: string;
  location?: string;
  applyInfo?: string;
  closesAt?: string;
};

type Props = {
  action: (state: ListingFormState | undefined, formData: FormData) => Promise<ListingFormState>;
  sectors: SectorOption[];
  defaults?: ListingDefaults;
  submitLabel: string;
  originalClosesAt?: string;
};

function Textarea({
  label,
  name,
  defaultValue,
  errors,
  rows = 4,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  errors?: string[];
  rows?: number;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        aria-invalid={errors?.length ? true : undefined}
        className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 dark:border-zinc-700"
      />
      {errors?.length ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {errors[0]}
        </p>
      ) : null}
    </div>
  );
}

function ErrorText({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return (
    <p role="alert" className="text-sm text-red-600 dark:text-red-400">
      {messages[0]}
    </p>
  );
}

// React resets an uncontrolled form after every action, which would drop the chosen type and sectors.
// Re-mounting the form body whenever the server sends values back makes it start from those values.
export function ListingForm(props: Props) {
  const [state, formAction] = useActionState(props.action, undefined);
  return (
    <ListingFormBody
      key={state ? JSON.stringify(state.values) : "initial"}
      {...props}
      state={state}
      formAction={formAction}
    />
  );
}

type BodyProps = Props & {
  state: ListingFormState | undefined;
  formAction: (formData: FormData) => void;
};

function ListingFormBody({
  state,
  formAction,
  sectors,
  defaults,
  submitLabel,
  originalClosesAt,
}: BodyProps) {
  const errors = state?.errors;
  const values = state?.values;

  // After a failed submit the values come back from the server; otherwise use the defaults.
  const text = (key: keyof ListingDefaults, formKey: string = key) => {
    const fromState = values?.[formKey];
    return typeof fromState === "string" ? fromState : (defaults?.[key] as string | undefined);
  };
  const initialSectors = (values?.sectorId as string[] | undefined) ?? defaults?.sectorIds ?? [];
  const initialSkills = (values?.skillId as string[] | undefined) ?? defaults?.skillIds ?? [];
  const [selectedSectors, setSelectedSectors] = useState<string[]>(initialSectors);

  const toggleSector = (id: string) =>
    setSelectedSectors((cur) => (cur.includes(id) ? cur.filter((s) => s !== id) : [...cur, id]));

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      {state?.message && (
        <p
          role="alert"
          className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
        >
          {state.message}
        </p>
      )}
      {originalClosesAt && <input type="hidden" name="originalClosesAt" value={originalClosesAt} />}

      <FormField label="Title" name="title" defaultValue={text("title")} errors={errors?.title} />

      <div className="flex flex-col gap-1">
        <label htmlFor="type" className="text-sm font-medium">
          Type
        </label>
        <select
          id="type"
          name="type"
          defaultValue={text("type") ?? ""}
          className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 dark:border-zinc-700"
        >
          <option value="" disabled>
            Choose one
          </option>
          {LISTING_TYPES.map((t) => (
            <option key={t} value={t}>
              {TYPE_LABEL[t]}
            </option>
          ))}
        </select>
        <ErrorText messages={errors?.type} />
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium">Sectors (choose at least one)</legend>
        {sectors.map((s) => (
          <label key={s.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              name="sectorId"
              value={s.id}
              checked={selectedSectors.includes(s.id)}
              onChange={() => toggleSector(s.id)}
            />
            {s.name}
          </label>
        ))}
        <ErrorText messages={errors?.sectorIds} />
      </fieldset>

      {sectors
        .filter((s) => selectedSectors.includes(s.id) && s.skills.length > 0)
        .map((s) => (
          <fieldset key={s.id} className="flex flex-col gap-2">
            <legend className="text-sm font-medium">Skills wanted: {s.name} (optional)</legend>
            {s.skills.map((skill) => (
              <label key={skill.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="skillId"
                  value={skill.id}
                  defaultChecked={initialSkills.includes(skill.id)}
                />
                {skill.name}
              </label>
            ))}
          </fieldset>
        ))}

      <Textarea
        label="Description"
        name="description"
        defaultValue={text("description")}
        errors={errors?.description}
        rows={6}
      />
      <Textarea
        label="Requirements (optional)"
        name="requirements"
        defaultValue={text("requirements")}
        errors={errors?.requirements}
      />
      <FormField
        label="Location (optional)"
        name="location"
        defaultValue={text("location")}
        errors={errors?.location}
      />
      <Textarea
        label="How to apply or register"
        name="applyInfo"
        defaultValue={text("applyInfo")}
        errors={errors?.applyInfo}
        rows={3}
      />
      <FormField
        label="Closing date"
        name="closesAt"
        type="date"
        defaultValue={text("closesAt")}
        errors={errors?.closesAt}
        hint="The listing closes at the end of this day (Rwanda time)."
      />

      <SubmitButton pendingText="Saving...">{submitLabel}</SubmitButton>
    </form>
  );
}
