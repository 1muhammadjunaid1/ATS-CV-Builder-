import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { blankCV, defaultSectionOrders, sectionIds, type CVData, type ThemeId } from '../types/cv'

type CVStore = { data: CVData; step: number; setTheme: (theme: ThemeId) => void; setData: (data: CVData) => void; setStep: (step: number) => void; clear: () => void }

export const useCVStore = create<CVStore>()(persist((set) => ({
  data: blankCV,
  step: 0,
  setTheme: (theme) => set((state) => ({ data: { ...state.data, theme, sectionOrder: defaultSectionOrders[theme] } })),
  setData: (data) => set({ data: { ...blankCV, ...data, sectionOrder: sectionIds.filter((id) => data.sectionOrder?.includes(id)).concat(sectionIds.filter((id) => !data.sectionOrder?.includes(id))) } }),
  setStep: (step) => set({ step }),
  clear: () => set({ data: blankCV, step: 0 }),
}), {
  name: 'resumeforge-cv',
  version: 1,
  migrate: (persisted: unknown) => {
    const state = persisted as Partial<CVStore>
    const theme = state.data?.theme ?? 'entry'
    return { ...state, data: { ...blankCV, ...state.data, sectionOrder: state.data?.sectionOrder ?? defaultSectionOrders[theme] } }
  },
}))
