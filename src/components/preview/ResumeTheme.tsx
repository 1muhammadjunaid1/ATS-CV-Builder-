import type { CVData, SectionId } from '../../types/cv'

const dates = (start: string, end: string, current = false) => [start, current ? 'Present' : end].filter(Boolean).join(' – ')
const skillList = (value: string) => value.split(',').map((item) => item.trim()).filter(Boolean)
const empty = (children: React.ReactNode) => <div className="r-empty hide-on-print">{children}</div>

function Work({ data }: { data: CVData }) {
  if (!data.experience.some((item) => item.title || item.company)) return empty('Add your work experience')
  return <>{data.experience.filter((item) => item.title || item.company).map((item) => <div className="r-item work-item" key={item.id}><div className="r-itemhead"><b>{item.title || 'Role title'}{item.company && ` — ${item.company}`}</b><i>{dates(item.startDate, item.endDate, item.current)}</i></div>{item.location && <span className="r-location">{item.location}</span>}{item.bullets.filter(Boolean).map((bullet, index) => <div className="r-bullet" key={index}>• {bullet}</div>)}</div>)}</>
}

function Education({ data }: { data: CVData }) {
  if (!data.education.some((item) => item.school || item.degree)) return empty('Add your education')
  return <>{data.education.filter((item) => item.school || item.degree).map((item) => <div className="r-item education-item" key={item.id}><div className="r-itemhead"><b>{item.school || 'School or university'}</b><i>{dates(item.startDate, item.endDate)}</i></div><div><em>{[item.degree, item.field].filter(Boolean).join(' in ')}</em></div>{item.details && <div>{item.details}</div>}</div>)}</>
}

function Projects({ data }: { data: CVData }) {
  if (!data.projects.some((item) => item.name)) return empty('Add projects that show your impact')
  return <>{data.projects.filter((item) => item.name).map((item) => <div className="r-item project-item" key={item.id}><b>{item.name}</b>{item.tools && <span className="r-tools"> · {item.tools}</span>}{item.description && <div>{item.description}</div>}</div>)}</>
}

function Certifications({ data }: { data: CVData }) {
  if (!data.certifications.some((item) => item.name || item.issuer)) return empty('Add certifications')
  return <>{data.certifications.filter((item) => item.name || item.issuer).map((item) => <div className="r-item cert-item" key={item.id}><b>{item.name || 'Certification'}</b>{item.issuer && <span> — {item.issuer}</span>}{item.year && <i>{item.year}</i>}</div>)}</>
}

function Skills({ data }: { data: CVData }) {
  const groups = [['Technical skills', data.skills.technical], ['Tools & platforms', data.skills.tools], ['Professional strengths', data.skills.soft]].filter(([, value]) => value) as [string, string][]
  if (!groups.length) return empty('Add skills employers can scan quickly')
  return <div className="skills-content">{groups.map(([label, value]) => <p key={label}><b>{label}:</b> {skillList(value).join(' · ')}</p>)}</div>
}

type Layout = 'entry' | 'executive' | 'professional'
const labels: Record<Layout, Record<SectionId, string>> = {
  entry: { summary: 'SUMMARY', education: 'EDUCATION', skills: 'TECHNICAL SKILLS', projects: 'PROJECTS', experience: 'EXPERIENCE', certifications: 'CERTIFICATIONS' },
  executive: { summary: 'Professional Summary', education: 'Education', skills: 'Technical Competencies', projects: 'Selected Projects', experience: 'Professional Experience', certifications: 'Certifications' },
  professional: { summary: 'PROFESSIONAL SUMMARY', education: 'EDUCATION', skills: 'TECHNICAL SKILLS', projects: 'PROJECTS', experience: 'WORK EXPERIENCE', certifications: 'CERTIFICATIONS' },
}

function Content({ id, data }: { id: SectionId; data: CVData }) {
  if (id === 'summary') return data.summary ? <p className="summary-copy">{data.summary}</p> : empty('Write a brief professional summary')
  if (id === 'experience') return <Work data={data} />
  if (id === 'education') return <Education data={data} />
  if (id === 'skills') return <Skills data={data} />
  if (id === 'projects') return <Projects data={data} />
  return <Certifications data={data} />
}

function Sections({ data, layout }: { data: CVData; layout: Layout }) {
  return <>{data.sectionOrder.map((id) => <section className={`r-section section-${id}`} key={id}><h3>{labels[layout][id]}</h3><Content id={id} data={data} /></section>)}</>
}

function Contact({ data, centered = false }: { data: CVData; centered?: boolean }) {
  const c = data.contact
  const values = [c.location, c.phone, c.email, c.linkedin, c.website].filter(Boolean)
  return <div className={`contact ${centered ? 'contact-centered' : ''}`}>{values.map((value, index) => <span key={index}>{value}</span>)}</div>
}

/** Template 1: centered, editorial resume matching the supplied legal-resume reference. */
export function EntryTheme({ data }: { data: CVData }) {
  const c = data.contact
  return <article className="cv entry-theme"><header><h1>{c.fullName || <span className="hide-on-print placeholder">YOUR NAME</span>}</h1><h2>{c.title || <span className="hide-on-print placeholder">Your profession</span>}</h2>{c.location && <p className="entry-address">{c.location}</p>}<Contact data={data} centered /></header><Sections data={data} layout="entry" /></article>
}

/** Template 2: asymmetric executive layout matching the supplied modern reference. */
export function ExecutiveTheme({ data }: { data: CVData }) {
  const c = data.contact
  const [first, ...rest] = (c.fullName || 'YOUR NAME').split(' ')
  return <article className="cv executive-theme"><header><div className="executive-name"><h1><span>{first}</span> {rest.join(' ')}</h1><p>{c.title || <span className="hide-on-print placeholder">Your profession</span>}</p></div><Contact data={data} /></header><Sections data={data} layout="executive" /></article>
}

/** Template 3: compact ATS-first, centered technical resume. */
export function ProfessionalTheme({ data }: { data: CVData }) {
  const c = data.contact
  return <article className="cv professional-theme"><header><h1>{c.fullName || <span className="hide-on-print placeholder">YOUR NAME</span>}</h1><h2>{c.title || <span className="hide-on-print placeholder">Your profession</span>}</h2><Contact data={data} centered /></header><Sections data={data} layout="professional" /></article>
}

export function CVPreview({ data }: { data: CVData }) { return <div id="cv-preview-root">{data.theme === 'entry' ? <EntryTheme data={data} /> : data.theme === 'executive' ? <ExecutiveTheme data={data} /> : <ProfessionalTheme data={data} />}</div> }
