import assert from "node:assert";
import { describe, it } from "node:test";
import { sanitizeResumeData } from "../sanitize-resume";
import { EMPTY_RESUME_DATA } from "../constants";
import type { ResumeData } from "@/db/schema";

describe("Sanitize Resume Data", () => {
  it("keeps text with angle brackets exactly as typed", () => {
    const data: ResumeData = {
      ...EMPTY_RESUME_DATA,
      personalInfo: {
        ...EMPTY_RESUME_DATA.personalInfo,
        summary: "Cut p95 from >800ms to <200ms and raised throughput >3x",
      },
      skills: [
        { id: "1", category: "Java", items: ["List<String>", "Map<K, V>"] },
      ],
    };

    const sanitized = sanitizeResumeData(data);

    assert.strictEqual(
      sanitized.personalInfo.summary,
      data.personalInfo.summary,
    );
    assert.deepStrictEqual(sanitized.skills[0].items, [
      "List<String>",
      "Map<K, V>",
    ]);
  });

  it("caps the bullet symbol and keeps share settings explicit", () => {
    const sanitized = sanitizeResumeData({
      ...EMPTY_RESUME_DATA,
      personalInfo: {
        fullName: "",
        email: "",
        bulletSymbol: "-----",
        sharePhone: false,
      },
    });

    assert.strictEqual(sanitized.personalInfo.bulletSymbol, "---");
    assert.strictEqual(sanitized.personalInfo.sharePhone, false);
    assert.strictEqual(sanitized.personalInfo.shareEmail, true);
  });

  it("fills in fields that older resumes lack", () => {
    const older: Partial<ResumeData> = { ...EMPTY_RESUME_DATA };
    delete older.competitions;

    const sanitized = sanitizeResumeData({
      ...older,
      education: [
        {
          id: "1",
          institution: "",
          degree: "",
          field: "",
          startDate: "",
          current: false,
          highlights: [],
        },
      ],
    } as ResumeData);

    assert.deepStrictEqual(sanitized.competitions, []);
    assert.deepStrictEqual(sanitized.education[0].coursework, []);
  });
});
