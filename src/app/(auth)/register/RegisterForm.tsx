"use client";

import { useActionState, useState } from "react";
import { FormField } from "@/components/FormField";
import { SubmitButton } from "@/components/SubmitButton";
import { register } from "./actions";

const ACCOUNT_OPTIONS = [
  { value: "youth", label: "I am a young person looking for opportunities" },
  { value: "employer", label: "I am an employer" },
  { value: "agency", label: "I represent a government or other agency" },
  { value: "provider", label: "I am a training provider (TVET, centre, bootcamp)" },
];

export function RegisterForm() {
  const [state, action] = useActionState(register, undefined);
  const [accountType, setAccountType] = useState(state?.values?.accountType ?? "youth");
  const errors = state?.errors;
  const values = state?.values;

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      {state?.message && (
        <p
          role="alert"
          className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
        >
          {state.message}
        </p>
      )}

      <div className="flex flex-col gap-1">
        <label htmlFor="accountType" className="text-sm font-medium">
          Account type
        </label>
        <select
          id="accountType"
          name="accountType"
          value={accountType}
          onChange={(e) => setAccountType(e.target.value)}
          className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 dark:border-zinc-700"
        >
          {ACCOUNT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {errors?.accountType && (
          <p role="alert" className="text-sm text-red-600">
            {errors.accountType[0]}
          </p>
        )}
      </div>

      <FormField
        label="Full name"
        name="name"
        autoComplete="name"
        defaultValue={values?.name}
        errors={errors?.name}
      />
      <FormField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        defaultValue={values?.email}
        errors={errors?.email}
      />

      {accountType !== "youth" && (
        <FormField
          label="Organization name"
          name="organizationName"
          defaultValue={values?.organizationName}
          errors={errors?.organizationName}
          hint="Your account will be reviewed by an administrator before you can publish listings."
        />
      )}

      <FormField
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        errors={errors?.password}
        hint="At least 8 characters."
      />

      <div className="flex flex-col gap-1">
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            name="ageConfirmed"
            defaultChecked={values?.ageConfirmed === "on"}
            className="mt-1"
          />
          <span>I confirm that I am 16 years old or older.</span>
        </label>
        {errors?.ageConfirmed && (
          <p role="alert" className="text-sm text-red-600">
            {errors.ageConfirmed[0]}
          </p>
        )}
      </div>

      <p className="text-sm text-zinc-500">
        We collect your name and email to run your account and match you to opportunities. We do not
        share them publicly.
      </p>

      <SubmitButton pendingText="Creating account...">Create account</SubmitButton>
    </form>
  );
}
