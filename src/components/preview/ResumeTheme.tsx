import type { CVData } from '../../types/cv'

const dates = (start: string, end: string, current = false) => [start, current ? 'Present' : end].filter(Boolean).join(' - ')
const lines = (value: string) => value.split(',').map((x) => x.trim()).filter(Boolean).join('  |  ')

function SkeletonBars({ lines }: { lines: number[] }) {
  return (
    <div className="skeleton-bars" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px', marginTop: '6px' }}>
      {lines.map((width, i) => (
        <div key={i} style={{ height: '12px', background: '#f0f3f6', borderRadius: '4px', width: `${width}%` }} />
      ))}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) { return <section className="r-section"><h3>{title}</h3>{children}</section> }

function Work({ data }: { data: CVData }) { 
  const isEmpty = !data.experience.length || (data.experience.length === 1 && !data.experience[0].title && !data.experience[0].company);
  if (isEmpty) return <SkeletonBars lines={[50, 100, 80]} />
  return <>{data.experience.map((x) => <div className="r-item" key={x.id}><div className="r-itemhead"><b>{x.title}</b><i>{dates(x.startDate, x.endDate, x.current)}</i></div><div>{x.company}{x.location ? `, ${x.location}` : ''}</div>{x.bullets.filter(Boolean).map((b, i) => <div className="r-bullet" key={i}>• {b}</div>)}</div>)}</> 
}

function Education({ data }: { data: CVData }) { 
  const isEmpty = !data.education.length || (data.education.length === 1 && !data.education[0].school && !data.education[0].degree);
  if (isEmpty) return <SkeletonBars lines={[50, 30]} />
  return <>{data.education.map((x) => <div className="r-item" key={x.id}><div className="r-itemhead"><b>{[x.degree, x.field].filter(Boolean).join(' in ')}</b><i>{dates(x.startDate, x.endDate)}</i></div><div>{x.school}</div>{x.details && <div>{x.details}</div>}</div>)}</> 
}

function Projects({ data }: { data: CVData }) { 
  const isEmpty = !data.projects.length || (data.projects.length === 1 && !data.projects[0].name);
  if (isEmpty) return <SkeletonBars lines={[40, 90, 60]} />
  return <>{data.projects.map((x) => <div className="r-item" key={x.id}><b>{x.name}</b>{x.tools && <span> | {x.tools}</span>}{x.description && <div>{x.description}</div>}</div>)}</> 
}

function Certs({ data }: { data: CVData }) { 
  const isEmpty = !data.certifications.length || (data.certifications.length === 1 && !data.certifications[0].name && !data.certifications[0].issuer);
  if (isEmpty) return <SkeletonBars lines={[40, 20]} />
  return <>{data.certifications.map((x) => <div className="r-item" key={x.id}><b>{x.name}</b>{x.issuer && <span> - {x.issuer}</span>}<i className="cert-year">{x.year}</i></div>)}</> 
}

export function EntryTheme({ data }: { data: CVData }) { 
  const c = data.contact; 
  const contactItems = [c.phone, c.location, c.email, c.linkedin, c.website].filter(Boolean);
  return <article className="cv entry-theme">
    <header>
      <h1>{c.fullName || <span className="hide-on-print" style={{ color: '#a0aab5' }}>YOUR NAME</span>}</h1>
      <h2>{c.title || <span className="hide-on-print" style={{ color: '#a0aab5' }}>YOUR ROLE</span>}</h2>
      {contactItems.length > 0 && <div className="contact" style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '12px' }}>{contactItems.map((item, i) => <span key={i}>{item}</span>)}</div>}
    </header>
    <Section title="OBJECTIVE">{data.summary ? <p>{data.summary}</p> : <SkeletonBars lines={[100, 80]} />}</Section>
    <Section title="EDUCATION"><Education data={data} /></Section>
    <Section title="INTERNSHIP"><Work data={data} /></Section>
    <Section title="SKILLS">
      {!data.skills.technical && !data.skills.tools && !data.skills.soft ? <SkeletonBars lines={[40, 80, 60]} /> : <>
        {data.skills.technical && <p><b>Programming/Tools:</b> {lines(data.skills.technical)}</p>}
        {data.skills.tools && <p><b>Tools:</b> {lines(data.skills.tools)}</p>}
        {data.skills.soft && <p><b>Soft Skills:</b> {lines(data.skills.soft)}</p>}
      </>}
    </Section>
    <Section title="CERTIFICATION"><Certs data={data} /></Section>
    <Section title="PROJECTS"><Projects data={data} /></Section>
  </article> 
}

export function ExecutiveTheme({ data }: { data: CVData }) { 
  const c = data.contact; 
  const contactItems = [c.location, c.phone, c.email].filter(Boolean);
  return <article className="cv executive-theme">
    <header>
      <div>
        <h1>{c.fullName ? <><span>{c.fullName.split(' ').slice(0, -1).join(' ')}</span> {c.fullName.split(' ').slice(-1)}</> : <span className="hide-on-print" style={{ color: '#a0aab5' }}>YOUR NAME</span>}</h1>
        <p>{c.title || <span className="hide-on-print" style={{ color: '#a0aab5' }}>YOUR ROLE</span>}</p>
      </div>
      {contactItems.length > 0 && <div className="contact right" style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>{contactItems.map((x, i) => <div key={i}>{x}</div>)}</div>}
    </header>
    <div className="summary">{data.summary ? <p>{data.summary}</p> : <SkeletonBars lines={[100, 90, 60]} />}</div>
    <Section title="Education"><Education data={data} /></Section>
    <Section title="Technical Competencies">
      {!data.skills.technical && !data.skills.tools && !data.skills.soft ? <SkeletonBars lines={[40, 80]} /> : <>
        {data.skills.technical && <p>{lines(data.skills.technical)}</p>}
        {data.skills.tools && <p>{lines(data.skills.tools)}</p>}
        {data.skills.soft && <p>{lines(data.skills.soft)}</p>}
      </>}
    </Section>
    <Section title="Professional Experience"><Work data={data} /></Section>
    <Section title="Selected Projects"><Projects data={data} /></Section>
    <Section title="Certifications"><Certs data={data} /></Section>
  </article> 
}

export function ProfessionalTheme({ data }: { data: CVData }) { 
  const c = data.contact; 
  const contactItems = [c.location, c.phone, c.email, c.linkedin, c.website].filter(Boolean);
  return <article className="cv professional-theme">
    <header>
      <h1>{c.fullName || <span className="hide-on-print" style={{ color: '#a0aab5' }}>YOUR NAME</span>}</h1>
      <h2>{c.title || <span className="hide-on-print" style={{ color: '#a0aab5' }}>YOUR ROLE</span>}</h2>
      {contactItems.length > 0 && <div className="contact" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '12px' }}>{contactItems.map((x, i) => <span key={i}>{x}</span>)}</div>}
    </header>
    <Section title="PROFESSIONAL SUMMARY">{data.summary ? <p>{data.summary}</p> : <SkeletonBars lines={[100, 80]} />}</Section>
    <Section title="EDUCATION"><Education data={data} /></Section>
    <Section title="WORK EXPERIENCE"><Work data={data} /></Section>
    <Section title="PROJECTS"><Projects data={data} /></Section>
    <Section title="TECHNICAL SKILLS">
      {!data.skills.technical && !data.skills.tools && !data.skills.soft ? <SkeletonBars lines={[50, 90, 60]} /> : <>
        {data.skills.technical && <p><b>Programming Languages:</b> {lines(data.skills.technical)}</p>}
        {data.skills.tools && <p><b>Tools & Platforms:</b> {lines(data.skills.tools)}</p>}
        {data.skills.soft && <p><b>Soft Skills:</b> {lines(data.skills.soft)}</p>}
      </>}
    </Section>
    <Section title="CERTIFICATIONS"><Certs data={data} /></Section>
  </article> 
}

export function CVPreview({ data }: { data: CVData }) { return <div id="cv-preview-root">{data.theme === 'entry' ? <EntryTheme data={data} /> : data.theme === 'executive' ? <ExecutiveTheme data={data} /> : <ProfessionalTheme data={data} />}</div> }
