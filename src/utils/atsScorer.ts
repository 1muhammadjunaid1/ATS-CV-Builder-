import type { CVData } from '../types/cv'

export type SectionStatus = { warnings: string[]; passes: string[] }
export type ATSResult = { score: number; breakdown: { contact: number; sections: number; keywords: number; bullets: number; length: number }; sectionStatus: Record<string, SectionStatus> }
const verbs = ['achieved', 'built', 'created', 'delivered', 'designed', 'developed', 'improved', 'increased', 'led', 'managed', 'optimized', 'reduced', 'streamlined']

export function scoreATS(data: CVData): ATSResult {
  const c = data.contact
  const contact = [c.fullName, c.email, c.phone, c.location, c.linkedin || c.website].filter(Boolean).length * 4
  const sections = (data.summary.length > 50 ? 5 : 0) + (data.experience.length ? 5 : 0) + (data.education.length ? 5 : 0) + ([data.skills.technical, data.skills.tools, data.skills.soft].join(',').split(',').filter(Boolean).length > 3 ? 5 : 0)
  const bulletText = [...data.experience.flatMap((x) => x.bullets), ...data.projects.map((x) => x.description)].join(' ')
  const words = `${data.summary} ${bulletText}`.trim().split(/\s+/).filter(Boolean).length
  const keywords = words <= 100 ? 5 : words <= 200 ? 10 : words <= 350 ? 15 : words <= 600 ? 20 : 15
  const bullets = data.experience.flatMap((x) => x.bullets).filter(Boolean)
  const strong = bullets.filter((b) => verbs.some((v) => b.toLowerCase().startsWith(v))).length
  const bulletScore = bullets.length ? Math.round((strong / bullets.length) * 20) : 0
  const chars = JSON.stringify(data).length
  const length = chars < 1000 ? 5 : chars <= 2500 ? 15 : chars <= 4000 ? 20 : 10
  
  const sectionStatus: Record<string, SectionStatus> = {
    Contact: {
      warnings: [
        !c.fullName ? 'Missing full name.' : '',
        !c.title ? 'Target role is highly recommended for ATS matching.' : '',
        !c.email ? 'Professional email address is required.' : '',
        !c.phone ? 'Phone number is missing.' : '',
        !c.linkedin ? 'LinkedIn profile adds professional credibility.' : ''
      ].filter(Boolean),
      passes: [
        c.fullName && c.title ? 'Clear professional identity established' : '',
        c.email && c.phone ? 'Essential contact methods provided' : '',
        c.linkedin || c.website ? 'Professional online presence included' : ''
      ].filter(Boolean)
    },
    Summary: {
      warnings: [
        data.summary.length === 0 ? 'Professional summary is missing.' : '',
        data.summary.length > 0 && data.summary.length < 50 ? 'Summary is too brief. Aim for at least 2-3 impactful sentences.' : ''
      ].filter(Boolean),
      passes: [
        data.summary.length >= 50 ? 'Optimal summary length for quick scanning' : '',
        data.summary.length >= 100 ? 'Detailed overview of professional background' : '',
        data.summary.includes('years') ? 'Quantifiable experience highlighted in summary' : ''
      ].filter(Boolean)
    },
    Experience: {
      warnings: [
        data.experience.length === 0 ? 'Work experience is empty.' : '',
        data.experience.some(x => !x.title || !x.company) ? 'Missing job titles or company names in some entries.' : '',
        data.experience.some(x => !x.startDate || !x.endDate) ? 'Incomplete employment dates may flag ATS.' : '',
        data.experience.some(x => x.bullets.some(b => b.length > 0 && b.length < 15)) ? 'Some achievement bullets lack detailed context.' : ''
      ].filter(Boolean),
      passes: [
        data.experience.length > 0 ? 'Experience timeline is active' : '',
        bullets.length > 0 && strong === bullets.length ? 'Consistent use of strong action verbs' : '',
        data.experience.length > 0 && data.experience.every(x => x.title && x.company) ? 'Clear and structured role progression' : ''
      ].filter(Boolean)
    },
    Education: {
      warnings: [
        data.education.length === 0 ? 'Education history is empty.' : '',
        data.education.some(x => !x.school || !x.degree) ? 'Missing institution or degree information.' : ''
      ].filter(Boolean),
      passes: [
        data.education.length > 0 ? 'Academic background provided' : '',
        data.education.length > 0 && data.education.every(x => x.school && x.degree) ? 'Structured formatting for degrees' : '',
        data.education.some(x => x.details) ? 'Additional context added to education entries' : ''
      ].filter(Boolean)
    },
    Skills: {
      warnings: [
        !data.skills.technical ? 'Technical/Hard skills are crucial for ATS keyword matching.' : '',
        !data.skills.soft ? 'Soft skills help round out your professional profile.' : ''
      ].filter(Boolean),
      passes: [
        data.skills.technical.length > 10 ? 'Strong foundation of technical competencies' : '',
        data.skills.tools.length > 5 ? 'Software and platform proficiencies listed' : '',
        data.skills.soft.length > 5 ? 'Balanced technical and interpersonal skillset' : ''
      ].filter(Boolean)
    },
    Projects: {
      warnings: [
        data.projects.some(x => !x.name || !x.description) ? 'Missing project names or descriptions.' : '',
        data.projects.some(x => !x.tools) ? 'Technologies used in projects are not specified.' : ''
      ].filter(Boolean),
      passes: [
        data.projects.length > 0 ? 'Practical application of skills demonstrated' : '',
        data.projects.length > 0 && data.projects.every(x => x.tools) ? 'Clear technical stack listed for all projects' : '',
        data.projects.some(x => x.link) ? 'Actionable links to project repositories provided' : ''
      ].filter(Boolean)
    },
    Certifications: {
      warnings: [
        data.certifications.some(x => !x.name || !x.issuer) ? 'Missing certification names or issuers.' : ''
      ].filter(Boolean),
      passes: [
        data.certifications.length > 0 ? 'Commitment to continuous learning shown' : '',
        data.certifications.length > 0 && data.certifications.every(x => x.issuer) ? 'Recognized issuing organizations specified' : ''
      ].filter(Boolean)
    }
  }

  return { score: contact + sections + keywords + bulletScore + length, breakdown: { contact, sections, keywords, bullets: bulletScore, length }, sectionStatus }
}
