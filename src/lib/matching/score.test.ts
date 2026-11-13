import { describe, expect, it } from "vitest";
import { MAX_MATCH_SCORE } from "./config";
import type { MatchingInputs } from "./inputs";
import { hasNoMatchingInputs, rankListings, scoreListing, type MatchListing } from "./score";

const AGRI = { id: "sec-agri", name: "Agritech" };
const ENERGY = { id: "sec-energy", name: "Renewable Energy" };
const skill = (name: string) => ({ id: `sk-${name}`, name });
const IRRIGATION = skill("Irrigation management");
const CROPS = skill("Crop production");
const RECORDS = skill("Farm record keeping");
const DRONES = skill("Drone operation");
const SOLAR = skill("Solar installation");

const listing = (
  id: string,
  closesAt: string,
  sectors: MatchListing["sectors"],
  skills: MatchListing["skills"],
): MatchListing => ({ id, closesAt: new Date(closesAt), sectors, skills });

const listings = [
  listing("irrigation-tech", "2027-01-20", [AGRI], [IRRIGATION, CROPS, RECORDS]),
  listing("records-clerk", "2027-01-10", [AGRI], [RECORDS]),
  listing("drone-trainee", "2027-02-01", [AGRI], [DRONES, CROPS]),
  listing("farm-hand", "2027-01-05", [AGRI], []),
  listing("solar-installer", "2027-01-15", [ENERGY], [SOLAR]),
];

const course = (title: string, status: "STARTED" | "COMPLETED", sectorId = AGRI.id) => ({
  courseId: `c-${title}`,
  title,
  sectorId,
  status,
});

// Five sample users, from "just registered" to "has done everything".
const personas: Record<string, MatchingInputs> = {
  newcomer: { followedSectorIds: [], skillIds: [], courseProgress: [] },
  follower: { followedSectorIds: [AGRI.id], skillIds: [], courseProgress: [] },
  skilled: {
    followedSectorIds: [AGRI.id],
    skillIds: [IRRIGATION.id, CROPS.id, RECORDS.id],
    courseProgress: [],
  },
  learner: {
    followedSectorIds: [AGRI.id],
    skillIds: [RECORDS.id],
    courseProgress: [course("Farm records basics", "COMPLETED"), course("Soil care", "STARTED")],
  },
  // Has skills but never followed a sector, and follows nothing in Agritech.
  outsider: {
    followedSectorIds: [ENERGY.id],
    skillIds: [DRONES.id],
    courseProgress: [course("Solar basics", "STARTED", ENERGY.id)],
  },
};

const ids = (inputs: MatchingInputs) => rankListings(inputs, listings).map((m) => m.listing.id);

describe("scoreListing", () => {
  it("gives the full score for a followed sector, every skill and a completed course", () => {
    const inputs = { ...personas.skilled, courseProgress: [course("Irrigation 101", "COMPLETED")] };
    const match = scoreListing(inputs, listings[0]);
    expect(match.score).toBe(MAX_MATCH_SCORE);
    expect(match.level).toBe("STRONG");
    expect(match.reasons).toEqual([
      "You follow Agritech.",
      "You have 3 of the 3 skills it asks for: Irrigation management, Crop production and Farm record keeping.",
      'You completed "Irrigation 101".',
    ]);
  });

  it("shares the skill points by how many of the listing's skills the user has", () => {
    const match = scoreListing(personas.learner, listings[0]);
    // 50 followed + 10 for 1 of 3 skills + 20 completed course
    expect(match.score).toBe(80);
    expect(match.reasons[1]).toBe("You have 1 of the 3 skills it asks for: Farm record keeping.");
  });

  it("counts a started course for less than a completed one", () => {
    const started = { ...personas.follower, courseProgress: [course("Soil care", "STARTED")] };
    const match = scoreListing(started, listings[3]);
    expect(match.score).toBe(60);
    expect(match.reasons).toContain('You started "Soil care".');
  });

  it("ignores courses from sectors the listing is not in", () => {
    expect(scoreListing(personas.outsider, listings[0]).score).toBe(0);
  });

  it("scores nothing and gives no reasons when there is nothing in common", () => {
    const match = scoreListing(personas.newcomer, listings[0]);
    expect(match).toMatchObject({ score: 0, level: "POSSIBLE", reasons: [] });
  });
});

describe("rankListings for five sample users", () => {
  it("newcomer: no recommendations, and the page knows to ask for more information", () => {
    expect(ids(personas.newcomer)).toEqual([]);
    expect(hasNoMatchingInputs(personas.newcomer)).toBe(true);
    expect(hasNoMatchingInputs(personas.follower)).toBe(false);
  });

  it("follower: every Agritech listing, soonest closing date first", () => {
    expect(ids(personas.follower)).toEqual([
      "farm-hand",
      "records-clerk",
      "irrigation-tech",
      "drone-trainee",
    ]);
  });

  it("skilled: listings matching more of their skills come first", () => {
    expect(ids(personas.skilled)).toEqual([
      "records-clerk",
      "irrigation-tech",
      "drone-trainee",
      "farm-hand",
    ]);
  });

  it("learner: the listing asking for their one skill ranks first", () => {
    const matches = rankListings(personas.learner, listings);
    expect(matches.map((m) => [m.listing.id, m.score])).toEqual([
      ["records-clerk", 100],
      ["irrigation-tech", 80],
      ["farm-hand", 70],
      ["drone-trainee", 70],
    ]);
  });

  it("outsider: matches by sector, skill or course even without following Agritech", () => {
    const matches = rankListings(personas.outsider, listings);
    expect(matches.map((m) => [m.listing.id, m.score, m.level])).toEqual([
      ["solar-installer", 60, "GOOD"],
      ["drone-trainee", 15, "POSSIBLE"],
    ]);
  });

  it("keeps only the top results when a limit is given", () => {
    expect(rankListings(personas.follower, listings, 2)).toHaveLength(2);
  });
});
