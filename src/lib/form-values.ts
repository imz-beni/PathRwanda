// Copies the named fields out of a form so a failed submit can show what the user typed.
export function formValues(formData: FormData, names: string[]): Record<string, string> {
  return Object.fromEntries(names.map((name) => [name, String(formData.get(name) ?? "")]));
}
