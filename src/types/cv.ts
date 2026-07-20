export type ThemeId = 'entry' | 'executive' | 'professional'
export type SectionId = 'summary' | 'experience' | 'education' | 'skills' | 'projects' | 'certifications'
export const sectionIds: SectionId[] = ['summary', 'experience', 'education', 'skills', 'projects', 'certifications']
export const defaultSectionOrders: Record<ThemeId, SectionId[]> = {
  entry: ['summary', 'education', 'skills', 'projects', 'experience', 'certifications'],
  executive: ['summary', 'experience', 'projects', 'skills', 'education', 'certifications'],
  professional: ['summary', 'experience', 'education', 'projects', 'skills', 'certifications'],
}

export interface Experience {
  id: string
  title: string
  company: string
  location: string
  startDate: string
  endDate: string
  current: boolean
  bullets: string[]
}

export interface Education {
  id: string
  school: string
  degree: string
  field: string
  startDate: string
  endDate: string
  details: string
}

export interface Project {
  id: string
  name: string
  link: string
  description: string
  tools: string
}

export interface Certification {
  id: string
  name: string
  issuer: string
  year: string
}

export interface CVData {
  theme: ThemeId | null
  contact: { fullName: string; title: string; email: string; phone: string; location: string; linkedin: string; website: string }
  summary: string
  experience: Experience[]
  education: Education[]
  skills: { technical: string; tools: string; soft: string }
  projects: Project[]
  certifications: Certification[]
  sectionOrder: SectionId[]
}

export const blankCV: CVData = {
  theme: null,
  contact: { fullName: '', title: '', email: '', phone: '', location: '', linkedin: '', website: '' },
  summary: '',
  experience: [],
  education: [],
  skills: { technical: '', tools: '', soft: '' },
  projects: [],
  certifications: [],
  sectionOrder: defaultSectionOrders.entry,
}
