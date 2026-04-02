import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsState {
  geminiApiKey: string;
  selectedExam: string;
  settingsPanelOpen: boolean;
  setGeminiApiKey: (key: string) => void;
  setSelectedExam: (exam: string) => void;
  setSettingsPanelOpen: (open: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      geminiApiKey: "",
      selectedExam: "upsc",
      settingsPanelOpen: false,
      setGeminiApiKey: (key) => set({ geminiApiKey: key }),
      setSelectedExam: (exam) => set({ selectedExam: exam }),
      setSettingsPanelOpen: (open) => set({ settingsPanelOpen: open }),
    }),
    {
      name: "upsc-hub-settings",
      partialize: (state) => ({
        geminiApiKey: state.geminiApiKey,
        selectedExam: state.selectedExam,
      }),
    }
  )
);
