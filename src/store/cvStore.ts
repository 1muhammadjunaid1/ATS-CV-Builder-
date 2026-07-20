import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { blankCV, type CVData, type ThemeId } from '../types/cv'

type CVStore = { data: CVData; step: number; setTheme: (theme: ThemeId) => void; setData: (data: CVData) => void; setStep: (step: number) => void; clear: () => void }

export const useCVStore = create<CVStore>()(persist((set) => ({
  data: blankCV,
  step: 0,
  setTheme: (theme) => set((state) => ({ data: { ...state.data, theme } })),
  setData: (data) => set({ data }),
  setStep: (step) => set({ step }),
  clear: () => set({ data: blankCV, step: 0 }),
}), { name: 'resumeforge-cv' }))
