import { describe, expect, it } from "vitest";
import { deactivationProblem } from "./deactivation";

describe("deactivationProblem", () => {
  it("allows deactivating youth and organization accounts", () => {
    expect(deactivationProblem("admin1", { id: "u1", role: "YOUTH" })).toBeNull();
    expect(deactivationProblem("admin1", { id: "u2", role: "ORGANIZATION" })).toBeNull();
    expect(deactivationProblem("admin1", { id: "u3", role: "TRAINING_PROVIDER" })).toBeNull();
  });

  it("blocks deactivating yourself", () => {
    expect(deactivationProblem("admin1", { id: "admin1", role: "ADMIN" })).not.toBeNull();
  });

  it("blocks deactivating another admin", () => {
    expect(deactivationProblem("admin1", { id: "admin2", role: "ADMIN" })).not.toBeNull();
  });

  it("reports a missing account", () => {
    expect(deactivationProblem("admin1", null)).not.toBeNull();
  });
});
