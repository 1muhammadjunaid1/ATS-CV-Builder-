import { FileText, ArrowRight, Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCVStore } from '../store/cvStore'
import { EntryTheme, ExecutiveTheme, ProfessionalTheme } from '../components/preview/ResumeTheme'
import { defaultSectionOrders, type ThemeId } from '../types/cv'

const templates: { id: ThemeId; name: string; eyebrow: string; description: string; detail: string }[] = [
  { id: 'entry', name: 'Entry Level', eyebrow: 'Clean and structured', description: 'Perfect for students and recent graduates building their first professional CV.', detail: 'Prioritizes education and foundational skills' },
  { id: 'executive', name: 'Executive', eyebrow: 'Bold and authoritative', description: 'Designed for senior leaders and managers to highlight strategic impact.', detail: 'Emphasizes leadership and key achievements' },
  { id: 'professional', name: 'Professional', eyebrow: 'Versatile and precise', description: 'A compact, ATS-first CV for technical and business professionals.', detail: 'Balanced detail with exceptional scanability' },
]

function MiniPreview({ id }: { id: ThemeId }) { 
  const c = { 
    theme: id, 
    contact: { fullName: 'Alex Morgan', title: 'Product Designer', email: 'hello@alex.com', phone: '555-0100', location: 'New York, NY', linkedin: 'in/alex', website: '' }, 
    summary: 'Creative and detail-oriented product designer with 4 years of experience building intuitive user interfaces. Passionate about accessibility, responsive design, and creating systems that scale gracefully across platforms.', 
    experience: [
      { id: '1', title: 'Senior UX Designer', company: 'Tech Innovators', location: 'New York, NY', startDate: '2022', endDate: 'Present', current: true, bullets: ['Led the redesign of the core product dashboard, improving user retention by 24%.', 'Collaborated with cross-functional teams to implement a new design system.'] },
      { id: '2', title: 'UI/UX Designer', company: 'Creative Solutions', location: 'Remote', startDate: '2019', endDate: '2022', current: false, bullets: ['Conducted user research and usability testing for various client projects.', 'Created wireframes, prototypes, and high-fidelity mockups for fintech apps.'] },
      { id: '3', title: 'Graphic Design Intern', company: 'Studio Co.', location: 'Boston, MA', startDate: '2018', endDate: '2019', current: false, bullets: ['Assisted in the creation of marketing materials and brand identity guidelines.'] }
    ], 
    education: [
      { id: '1', school: 'State University', degree: 'B.S.', field: 'Design', startDate: '2015', endDate: '2019', details: 'Graduated with Honors. President of the Design Club.' },
      { id: '2', school: 'Design Institute', degree: 'Certificate', field: 'HCI', startDate: '2014', endDate: '2015', details: 'Focused on human-computer interaction and user psychology.' }
    ], 
    skills: { technical: 'Figma, Sketch, Adobe CC, HTML/CSS, React, Vue', tools: 'Jira, Notion, Webflow, Miro', soft: 'Leadership, Communication, Problem Solving' }, 
    projects: [
      { id: '1', name: 'E-commerce App Redesign', tools: 'Figma, Protopie', description: 'Redesigned the mobile checkout experience, reducing cart abandonment by 15%.', link: '' },
      { id: '2', name: 'Design System V2', tools: 'React, Storybook', description: 'Built an accessible component library adopted by 4 internal engineering teams.', link: '' }
    ], 
    certifications: [{ id: '1', name: 'Google UX Design Professional', issuer: 'Coursera', year: '2021' }, { id: '2', name: 'Accessibility Advocate', issuer: 'W3C', year: '2022' }],
    sectionOrder: defaultSectionOrders[id],
  }; 
  return <div className="mini-sheet">{id === 'entry' ? <EntryTheme data={c} /> : id === 'executive' ? <ExecutiveTheme data={c} /> : <ProfessionalTheme data={c} />}</div> 
}

export default function ThemeSelectPage() {
  const navigate = useNavigate(); const setTheme = useCVStore((s) => s.setTheme)
  const choose = (id: ThemeId) => { setTheme(id); navigate('/build') }
  return <main className="gallery"><nav className="brand"><span className="brand-mark"><FileText size={19} /></span><span>CVForge</span></nav><div className="gallery-intro"><p className="eyebrow">Choose your foundation</p><h1>Pick a CV that feels like you.</h1><p>Each layout is designed for sharp reading on screen, in print, and in applicant tracking systems.</p></div><section className="template-grid">{templates.map((template) => <article className="template-card" key={template.id}><div className="template-preview"><MiniPreview id={template.id} /></div><div className="template-info"><p className="eyebrow">{template.eyebrow}</p><h2>{template.name}</h2><p>{template.description}</p><div className="template-detail"><Check size={15} /> {template.detail}</div><button onClick={() => choose(template.id)}>Use this template <ArrowRight size={17} /></button></div></article>)}</section><p className="gallery-foot">Your CV stays in this browser until you choose to export it.</p></main> 
}
