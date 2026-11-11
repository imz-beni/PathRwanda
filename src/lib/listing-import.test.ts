import { describe, expect, it } from "vitest";
import { MAX_IMPORT_ROWS, parseListingImport, type ImportSector } from "./listing-import";

const sectors: ImportSector[] = [
  {
    id: "sec-agri",
    slug: "agritech",
    name: "Agritech",
    skills: [
      { id: "sk-soil", name: "Soil health" },
      { id: "sk-crop", name: "Crop production" },
    ],
  },
  { id: "sec-energy", slug: "renewable-energy", name: "Renewable Energy", skills: [] },
];

const now = new Date("2026-11-11T08:00:00Z");
const HEADER = "title,type,sectors,description,requirements,location,applyInfo,closesAt,skills";
const row = (overrides: Partial<Record<string, string>> = {}) => {
  const values: Record<string, string> = {
    title: "Greenhouse assistant",
    type: "JOB",
    sectors: "agritech",
    description: "Help run a tomato greenhouse in Musanze.",
    requirements: "",
    location: "Musanze",
    applyInfo: "Send your CV to the farm office.",
    closesAt: "2027-01-31",
    skills: "Soil health; crop production",
    ...overrides,
  };
  return HEADER.split(",")
    .map((name) => `"${values[name].replace(/"/g, '""')}"`)
    .join(",");
};

describe("parseListingImport", () => {
  it("turns a valid row into a listing with sector and skill ids", () => {
    const result = parseListingImport(`${HEADER}\n${row()}`, sectors, now);
    expect(result.problems).toEqual([]);
    expect(result.listings).toHaveLength(1);
    expect(result.listings[0]).toMatchObject({
      row: 2,
      title: "Greenhouse assistant",
      type: "JOB",
      sectorIds: ["sec-agri"],
      skillIds: ["sk-soil", "sk-crop"],
      requirements: undefined,
    });
    expect(result.listings[0].closesAt.toISOString()).toBe("2027-01-31T21:59:59.000Z");
  });

  it("accepts sector names, lower-case types and headings in any order or case", () => {
    const csv = [
      "CLOSESAT,Title,type,Sectors,description,applyinfo",
      '2027-02-01,Solar farm intern,program,"Agritech; Renewable Energy",A six-month paid internship.,Apply online.',
    ].join("\n");
    const result = parseListingImport(csv, sectors, now);
    expect(result.problems).toEqual([]);
    expect(result.listings[0]).toMatchObject({
      type: "PROGRAM",
      sectorIds: ["sec-agri", "sec-energy"],
      skillIds: [],
    });
  });

  it("reports a missing heading", () => {
    const result = parseListingImport("title,type\nA job,JOB", sectors, now);
    expect(result.listings).toEqual([]);
    expect(result.problems[0].message).toContain("sectors, description, applyInfo, closesAt");
  });

  it("reports every problem with its row number and imports nothing from a bad row", () => {
    const csv = [
      HEADER,
      row(),
      row({ title: "Bad", sectors: "fishing", closesAt: "31/01/2027", skills: "Welding" }),
    ].join("\n");
    const result = parseListingImport(csv, sectors, now);
    expect(result.listings.map((l) => l.row)).toEqual([2]);
    expect(result.problems.every((p) => p.row === 3)).toBe(true);
    const messages = result.problems.map((p) => p.message).join("\n");
    expect(messages).toContain('sectors: "fishing" is not a sector.');
    expect(messages).toContain('skills: "Welding"');
    expect(messages).toContain("title: Enter a title of at least 5 characters.");
    expect(messages).toContain("Use the format 2027-01-31.");
    expect(messages).not.toContain("Choose at least one sector");
  });

  it("rejects closing dates in the past and repeated titles", () => {
    const csv = [HEADER, row({ title: "Old listing", closesAt: "2026-01-01" }), row(), row()].join(
      "\n",
    );
    const result = parseListingImport(csv, sectors, now);
    expect(result.problems).toEqual([
      { row: 2, message: "closesAt: The closing date must be in the future." },
      { row: 4, message: "title: this is the same title as row 3." },
    ]);
  });

  it("rejects empty and oversized files", () => {
    expect(parseListingImport("", sectors, now).problems[0].message).toBe("The file is empty.");
    expect(parseListingImport(HEADER, sectors, now).problems[0].message).toBe(
      "The file has no listings.",
    );
    const many = [HEADER, ...Array.from({ length: MAX_IMPORT_ROWS + 1 }, () => row())].join("\n");
    expect(parseListingImport(many, sectors, now).problems[0].message).toContain("at most");
  });
});
