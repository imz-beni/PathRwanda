// Rwanda's 30 districts, in alphabetical order.
export const DISTRICTS = [
  "Bugesera",
  "Burera",
  "Gakenke",
  "Gasabo",
  "Gatsibo",
  "Gicumbi",
  "Gisagara",
  "Huye",
  "Kamonyi",
  "Karongi",
  "Kayonza",
  "Kicukiro",
  "Kirehe",
  "Muhanga",
  "Musanze",
  "Ngoma",
  "Ngororero",
  "Nyabihu",
  "Nyagatare",
  "Nyamagabe",
  "Nyamasheke",
  "Nyanza",
  "Nyarugenge",
  "Nyaruguru",
  "Rubavu",
  "Ruhango",
  "Rulindo",
  "Rusizi",
  "Rutsiro",
  "Rwamagana",
] as const;

export const EDUCATION_LEVELS = [
  "Primary school",
  "Lower secondary (O-Level)",
  "Upper secondary (A-Level)",
  "TVET certificate",
  "Diploma",
  "Bachelor's degree or higher",
] as const;

// Both profile details are optional and come from fixed lists. Anything that is not on the
// list, including an empty choice, is stored as "not given" rather than rejected.
export function pickFrom<T extends string>(options: readonly T[], value: unknown): T | null {
  return options.find((option) => option === value) ?? null;
}
