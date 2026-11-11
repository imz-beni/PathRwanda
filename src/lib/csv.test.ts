import { describe, expect, it } from "vitest";
import { parseCsv } from "./csv";

describe("parseCsv", () => {
  it("reads simple rows", () => {
    expect(parseCsv("a,b\n1,2\n")).toEqual([
      ["a", "b"],
      ["1", "2"],
    ]);
  });

  it("keeps commas, quotes and line breaks inside quoted fields", () => {
    expect(parseCsv('title,notes\n"Farm, field","She said ""hi""\nsecond line"')).toEqual([
      ["title", "notes"],
      ["Farm, field", 'She said "hi"\nsecond line'],
    ]);
  });

  it("handles Windows line endings, a byte-order mark and blank lines", () => {
    expect(parseCsv("﻿a,b\r\n\r\n1,2\r\n")).toEqual([
      ["a", "b"],
      ["1", "2"],
    ]);
  });

  it("keeps empty fields", () => {
    expect(parseCsv("a,,c")).toEqual([["a", "", "c"]]);
  });
});
