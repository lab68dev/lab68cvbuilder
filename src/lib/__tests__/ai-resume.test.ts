import assert from "node:assert";
import { describe, it } from "node:test";
import { mergeAiResume } from "../ai-resume";
import { EMPTY_RESUME_DATA } from "../constants";
import type { ResumeData } from "@/db/schema";

const experienceItem = {
  id: "exp-1",
  company: "Acme",
  position: "Engineer",
  location: "",
  startDate: "2020-01",
  current: true,
  description: "Bilt things",
  highlights: ["Led teh team", "Shipped"],
};

const original: ResumeData = {
  ...EMPTY_RESUME_DATA,
  personalInfo: {
    ...EMPTY_RESUME_DATA.personalInfo,
    fullName: "Dong",
    email: "me@example.com",
    summary: "Experienced develper",
    bulletSymbol: "-",
    sharePhone: false,
  },
  experience: [experienceItem],
  competitions: [
    {
      id: "comp-1",
      name: "Hackathon",
      date: "2024-01",
      description: "Won",
      highlights: [],
    },
  ],
};

describe("mergeAiResume", () => {
  it("takes corrected wording", () => {
    const merged = mergeAiResume(original, {
      personalInfo: { summary: "Experienced developer" },
      experience: [
        {
          ...experienceItem,
          description: "Built things",
          highlights: ["Led the team", "Shipped"],
        },
      ],
    });

    assert.strictEqual(merged.personalInfo.summary, "Experienced developer");
    assert.strictEqual(merged.experience[0].description, "Built things");
    assert.deepStrictEqual(merged.experience[0].highlights, [
      "Led the team",
      "Shipped",
    ]);
  });

  it("keeps sections and settings the AI left out", () => {
    const merged = mergeAiResume(original, {
      personalInfo: { fullName: "Dong" },
    });

    assert.deepStrictEqual(merged.competitions, original.competitions);
    assert.deepStrictEqual(merged.experience, original.experience);
    assert.strictEqual(merged.personalInfo.sharePhone, false);
    assert.strictEqual(merged.personalInfo.bulletSymbol, "-");
  });

  it("ignores changes to contact details, dates and ids", () => {
    const merged = mergeAiResume(original, {
      personalInfo: { email: "attacker@example.com", sharePhone: true },
      experience: [{ ...experienceItem, startDate: "1999-01", current: false }],
    });

    assert.strictEqual(merged.personalInfo.email, "me@example.com");
    assert.strictEqual(merged.personalInfo.sharePhone, false);
    assert.strictEqual(merged.experience[0].startDate, "2020-01");
    assert.strictEqual(merged.experience[0].current, true);
  });

  it("never adds entries, drops bullets or fills empty fields", () => {
    const merged = mergeAiResume(original, {
      personalInfo: { location: "Invented City" },
      experience: [
        {
          ...experienceItem,
          highlights: ["Only one left"],
          location: "Invented City",
        },
        { ...experienceItem, id: "made-up", company: "Fake Corp" },
      ],
    });

    assert.strictEqual(merged.experience.length, 1);
    assert.deepStrictEqual(
      merged.experience[0].highlights,
      experienceItem.highlights,
    );
    assert.strictEqual(merged.experience[0].location, "");
    assert.strictEqual(merged.personalInfo.location, "");
  });

  it("follows the AI's order without losing entries", () => {
    const second = { ...experienceItem, id: "exp-2", company: "Beta" };
    const third = { ...experienceItem, id: "exp-3", company: "Gamma" };
    const merged = mergeAiResume(
      { ...original, experience: [experienceItem, second, third] },
      { personalInfo: {}, experience: [{ id: "exp-3" }, { id: "exp-1" }] },
    );

    assert.deepStrictEqual(
      merged.experience.map((item) => item.id),
      ["exp-3", "exp-1", "exp-2"],
    );
  });

  it("rejects output that is not a resume", () => {
    assert.throws(() => mergeAiResume(original, null), /invalid resume/);
    assert.throws(() => mergeAiResume(original, []), /invalid resume/);
    assert.throws(
      () => mergeAiResume(original, { experience: [] }),
      /invalid resume/,
    );
  });
});
