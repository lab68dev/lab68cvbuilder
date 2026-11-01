import assert from "node:assert";
import { beforeEach, describe, it } from "node:test";
import { useResumeStore } from "../../store/resume-store";
import { EMPTY_RESUME_DATA } from "../constants";

const store = useResumeStore;

function snapshot() {
  const { title, templateId, fontFamily, data } = store.getState();
  return { title, templateId, fontFamily, data };
}

function typeSummary(summary: string) {
  store.getState().updatePersonalInfo({ summary });
}

describe("resume store autosave state", () => {
  beforeEach(() => {
    store.getState().reset();
    store.getState().setResume("id", "CV", "ats", "inter", EMPTY_RESUME_DATA);
  });

  it("is clean when nothing changed during the save", () => {
    typeSummary("first");
    store.getState().markSaved(snapshot());

    assert.strictEqual(store.getState().isDirty, false);
  });

  it("stays dirty when the user typed while the save was running", () => {
    typeSummary("first");
    const sent = snapshot();
    typeSummary("first and more");
    store.getState().markSaved(sent);

    assert.strictEqual(store.getState().isDirty, true);
    assert.strictEqual(store.getState().isSaving, false);
  });

  it("stays dirty when the title changed during the save", () => {
    typeSummary("first");
    const sent = snapshot();
    store.getState().setTitle("New title");
    store.getState().markSaved(sent);

    assert.strictEqual(store.getState().isDirty, true);
  });

  it("clears dirty without a snapshot, as a version restore does", () => {
    typeSummary("first");
    store.getState().markSaved();

    assert.strictEqual(store.getState().isDirty, false);
  });
});
