import { create } from "zustand";
import type { ResumeData } from "@/db/schema";
import { EMPTY_RESUME_DATA } from "@/lib/constants";

type SavedSnapshot = Pick<
  ResumeState,
  "title" | "templateId" | "fontFamily" | "data"
>;

interface ResumeState {
  // ── State ─────────────────────────────────────────────
  resumeId: string | null;
  title: string;
  templateId: string;
  fontFamily: string;
  pdfLocale: string;
  data: ResumeData;
  isDirty: boolean;
  isSaving: boolean;
  lastSavedAt: Date | null;
  hiddenSections: string[];
  activeSection: string;

  // ── Actions ───────────────────────────────────────────
  setResume: (
    id: string,
    title: string,
    templateId: string,
    fontFamily: string,
    data: ResumeData,
  ) => void;
  setTitle: (title: string) => void;
  setTemplateId: (templateId: string) => void;
  setFontFamily: (fontFamily: string) => void;
  setPdfLocale: (locale: string) => void;
  setData: (data: ResumeData) => void;
  updatePersonalInfo: (info: Partial<ResumeData["personalInfo"]>) => void;
  setIsSaving: (saving: boolean) => void;
  markSaved: (saved?: SavedSnapshot) => void;
  toggleSectionVisibility: (sectionId: string) => void;
  setActiveSection: (sectionId: string) => void;
  reset: () => void;
}

export const useResumeStore = create<ResumeState>((set) => ({
  // ── Initial State ─────────────────────────────────────
  resumeId: null,
  title: "Untitled Resume",
  templateId: "harvard",
  fontFamily: "inter",
  pdfLocale: "en",
  data: EMPTY_RESUME_DATA,
  isDirty: false,
  isSaving: false,
  lastSavedAt: null,
  hiddenSections: [],
  activeSection: "personal",

  // ── Actions ───────────────────────────────────────────
  setResume: (id, title, templateId, fontFamily, data) =>
    set({
      resumeId: id,
      title,
      templateId,
      fontFamily,
      data,
      isDirty: false,
    }),

  setTitle: (title) => set({ title, isDirty: true }),

  setTemplateId: (templateId) => set({ templateId, isDirty: true }),

  setFontFamily: (fontFamily) => set({ fontFamily, isDirty: true }),

  setPdfLocale: (pdfLocale) => set({ pdfLocale }),

  setData: (data) => set({ data, isDirty: true }),

  updatePersonalInfo: (info) =>
    set((state) => ({
      data: {
        ...state.data,
        personalInfo: { ...state.data.personalInfo, ...info },
      },
      isDirty: true,
    })),

  setIsSaving: (isSaving) => set({ isSaving }),

  // With a snapshot, anything edited after that save started stays dirty.
  markSaved: (saved) =>
    set((state) => ({
      isDirty: saved
        ? state.data !== saved.data ||
          state.title !== saved.title ||
          state.templateId !== saved.templateId ||
          state.fontFamily !== saved.fontFamily
        : false,
      isSaving: false,
      lastSavedAt: new Date(),
    })),

  toggleSectionVisibility: (sectionId) =>
    set((state) => {
      const hidden = state.hiddenSections.includes(sectionId)
        ? state.hiddenSections.filter((id) => id !== sectionId)
        : [...state.hiddenSections, sectionId];
      return { hiddenSections: hidden };
    }),

  setActiveSection: (activeSection) => set({ activeSection }),

  reset: () =>
    set({
      resumeId: null,
      title: "Untitled Resume",
      templateId: "harvard",
      fontFamily: "inter",
      pdfLocale: "en",
      data: EMPTY_RESUME_DATA,
      isDirty: false,
      isSaving: false,
      lastSavedAt: null,
      hiddenSections: [],
      activeSection: "personal",
    }),
}));
