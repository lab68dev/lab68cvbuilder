import assert from "node:assert";
import { describe, it } from "node:test";
import { pickResumeUpdate } from "../resume-update";
import { EMPTY_RESUME_DATA } from "../constants";

describe("pickResumeUpdate", () => {
  it("drops columns a client must not change", () => {
    const update = pickResumeUpdate({
      title: "My CV",
      userId: "someone-else",
      id: "other-id",
      isPublic: true,
      createdAt: "2020-01-01",
    });

    assert.deepStrictEqual(update, { title: "My CV" });
  });

  it("keeps valid fields", () => {
    const update = pickResumeUpdate({
      title: "My CV",
      data: EMPTY_RESUME_DATA,
      templateId: "modern",
      fontFamily: "inter",
    });

    assert.deepStrictEqual(update, {
      title: "My CV",
      data: EMPTY_RESUME_DATA,
      templateId: "modern",
      fontFamily: "inter",
    });
  });

  it("ignores retired template ids so old resumes can still save", () => {
    assert.deepStrictEqual(
      pickResumeUpdate({
        title: "Old",
        templateId: "bold-impact",
        fontFamily: "nope",
      }),
      { title: "Old" },
    );
  });

  it("rejects bad shapes with an error the API maps to 400", () => {
    assert.throws(() => pickResumeUpdate(null), /Invalid/);
    assert.throws(() => pickResumeUpdate({ title: 42 }), /Invalid/);
    assert.throws(() => pickResumeUpdate({ data: {} }), /Invalid/);
    assert.throws(
      () =>
        pickResumeUpdate({ data: { ...EMPTY_RESUME_DATA, education: [null] } }),
      /Invalid/,
    );
    assert.throws(
      () =>
        pickResumeUpdate({
          data: {
            ...EMPTY_RESUME_DATA,
            personalInfo: {
              ...EMPTY_RESUME_DATA.personalInfo,
              sharePhone: "false",
            },
          },
        }),
      /Invalid/,
    );
  });
});
