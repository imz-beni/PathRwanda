"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/SubmitButton";
import type { ContentFormState } from "../../actions";
import { createSkill, renameSkill } from "../../structure-actions";

const inputClass =
  "rounded-md border border-zinc-300 bg-transparent px-3 py-1.5 text-base dark:border-zinc-700";

function SkillNameForm({
  id,
  label,
  defaultName,
  action,
  submitLabel,
  savedText,
}: {
  id: string;
  label: string;
  defaultName: string;
  action: (state: ContentFormState | undefined, formData: FormData) => Promise<ContentFormState>;
  submitLabel: string;
  savedText: string;
}) {
  const [state, formAction] = useActionState(action, undefined);
  const error = state?.errors?.name?.[0] ?? state?.message;
  const errorId = `${id}-error`;

  return (
    <form action={formAction} className="flex flex-col gap-1" noValidate>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div className="flex flex-wrap items-center gap-2">
        <input
          id={id}
          name="name"
          defaultValue={state?.values?.name ?? defaultName}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`${inputClass} min-w-0 flex-1`}
        />
        <SubmitButton pendingText="Saving...">{submitLabel}</SubmitButton>
      </div>
      {error ? (
        <p id={errorId} role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : state?.saved ? (
        <p role="status" className="text-sm text-emerald-700 dark:text-emerald-400">
          {savedText}
        </p>
      ) : null}
    </form>
  );
}

export function AddSkillForm({ sectorId }: { sectorId: string }) {
  return (
    <SkillNameForm
      id="new-skill"
      label="New skill name"
      defaultName=""
      action={createSkill.bind(null, sectorId)}
      submitLabel="Add skill"
      savedText="The skill was added."
    />
  );
}

export function RenameSkillForm({ skillId, name }: { skillId: string; name: string }) {
  return (
    <SkillNameForm
      id={`skill-${skillId}`}
      label={`Name of skill ${name}`}
      defaultName={name}
      action={renameSkill.bind(null, skillId)}
      submitLabel="Rename"
      savedText="Saved."
    />
  );
}
