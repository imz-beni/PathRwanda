import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
  errors?: string[];
  hint?: string;
};

export function FormField({ label, name, errors, hint, ...input }: Props) {
  const errorId = `${name}-error`;
  const hintId = `${name}-hint`;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={name}
        name={name}
        aria-invalid={errors?.length ? true : undefined}
        aria-describedby={
          [errors?.length ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ") ||
          undefined
        }
        className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-base dark:border-zinc-700"
        {...input}
      />
      {hint && (
        <p id={hintId} className="text-sm text-zinc-500">
          {hint}
        </p>
      )}
      {errors?.length ? (
        <p id={errorId} role="alert" className="text-sm text-red-600 dark:text-red-400">
          {errors[0]}
        </p>
      ) : null}
    </div>
  );
}
