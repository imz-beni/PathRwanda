import type { z } from "zod";
import { parseCsv } from "@/lib/csv";
import { listingSchema, requireFutureClosing } from "@/lib/validation/listing";

// Column names for the listing import file. Order in the file does not matter.
export const REQUIRED_COLUMNS = [
  "title",
  "type",
  "sectors",
  "description",
  "applyInfo",
  "closesAt",
] as const;
export const OPTIONAL_COLUMNS = ["requirements", "location", "skills"] as const;
export const IMPORT_COLUMNS = [...REQUIRED_COLUMNS, ...OPTIONAL_COLUMNS];

export const MAX_IMPORT_ROWS = 200;
export const MAX_IMPORT_BYTES = 200 * 1024;

export type ImportSector = {
  id: string;
  slug: string;
  name: string;
  skills: { id: string; name: string }[];
};

export type ImportedListing = Omit<z.infer<typeof listingSchema>, "sectorIds" | "skillIds"> & {
  sectorIds: string[];
  skillIds: string[];
  // The row in the file, counting the heading row as row 1, like a spreadsheet does.
  row: number;
};

export type ImportProblem = { row: number; message: string };

export type ImportResult = { listings: ImportedListing[]; problems: ImportProblem[] };

const FIELD_LABEL: Record<string, string> = {
  title: "title",
  type: "type",
  sectorIds: "sectors",
  skillIds: "skills",
  description: "description",
  requirements: "requirements",
  location: "location",
  applyInfo: "applyInfo",
  closesAt: "closesAt",
};

const key = (value: string) => value.trim().toLowerCase();
const splitList = (value: string) =>
  value
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean);

// Checks the whole file with the same rules as the listing form. Nothing here touches the
// database, so the caller decides what to do with the result.
export function parseListingImport(
  text: string,
  sectors: ImportSector[],
  now = new Date(),
): ImportResult {
  const rows = parseCsv(text);
  if (rows.length === 0) {
    return { listings: [], problems: [{ row: 1, message: "The file is empty." }] };
  }

  const header = rows[0].map(key);
  const column = (name: string) => header.indexOf(key(name));
  const missing = REQUIRED_COLUMNS.filter((name) => column(name) === -1);
  if (missing.length > 0) {
    return {
      listings: [],
      problems: [{ row: 1, message: `The heading row is missing: ${missing.join(", ")}.` }],
    };
  }

  const dataRows = rows.slice(1);
  if (dataRows.length === 0) {
    return { listings: [], problems: [{ row: 1, message: "The file has no listings." }] };
  }
  if (dataRows.length > MAX_IMPORT_ROWS) {
    return {
      listings: [],
      problems: [
        { row: 1, message: `A file can hold at most ${MAX_IMPORT_ROWS} listings. Split it up.` },
      ],
    };
  }

  const listings: ImportedListing[] = [];
  const problems: ImportProblem[] = [];
  const seenTitles = new Map<string, number>();

  dataRows.forEach((cells, index) => {
    const row = index + 2;
    const cell = (name: string) => {
      const position = column(name);
      return position === -1 ? "" : (cells[position] ?? "").trim();
    };
    const rowProblems: string[] = [];

    const chosenSectors: ImportSector[] = [];
    for (const wanted of splitList(cell("sectors"))) {
      const sector = sectors.find(
        (s) => key(s.slug) === key(wanted) || key(s.name) === key(wanted),
      );
      if (sector) chosenSectors.push(sector);
      else rowProblems.push(`sectors: "${wanted}" is not a sector.`);
    }

    const skillIds: string[] = [];
    for (const wanted of splitList(cell("skills"))) {
      const skill = chosenSectors
        .flatMap((sector) => sector.skills)
        .find((s) => key(s.name) === key(wanted));
      if (skill) skillIds.push(skill.id);
      else rowProblems.push(`skills: "${wanted}" is not a skill in this listing's sectors.`);
    }

    const parsed = listingSchema.safeParse({
      title: cell("title"),
      type: cell("type").toUpperCase(),
      sectorIds: [...new Set(chosenSectors.map((s) => s.id))],
      skillIds: [...new Set(skillIds)],
      description: cell("description"),
      requirements: cell("requirements"),
      location: cell("location"),
      applyInfo: cell("applyInfo"),
      closesAt: cell("closesAt"),
    });

    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = FIELD_LABEL[String(issue.path[0])] ?? String(issue.path[0]);
        // An unknown sector is already reported above; do not also say none was chosen.
        if (rowProblems.some((problem) => problem.startsWith(`${field}:`))) continue;
        const hint = field === "closesAt" ? " Use the format 2027-01-31." : "";
        rowProblems.push(`${field}: ${issue.message}${hint}`);
      }
    } else {
      const late = requireFutureClosing(parsed.data.closesAt, now);
      if (late) rowProblems.push(`closesAt: ${late}`);

      const titleKey = key(parsed.data.title);
      const firstRow = seenTitles.get(titleKey);
      if (firstRow) rowProblems.push(`title: this is the same title as row ${firstRow}.`);
      else seenTitles.set(titleKey, row);
    }

    if (rowProblems.length > 0 || !parsed.success) {
      problems.push(...rowProblems.map((message) => ({ row, message })));
    } else {
      listings.push({ ...parsed.data, row });
    }
  });

  return { listings, problems };
}
