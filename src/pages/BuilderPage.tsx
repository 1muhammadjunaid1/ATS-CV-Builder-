import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Bot, ChevronDown, Clipboard, Download, FileText, Plus, Sparkles, Trash2, X, Check, AlertTriangle, Sun, Printer } from 'lucide-react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { useCVStore } from '../store/cvStore'
import { sectionIds, type Certification, type Education, type Experience, type Project, type SectionId } from '../types/cv'
import { CVPreview } from '../components/preview/ResumeTheme'
import { scoreATS } from '../utils/atsScorer'
import { copyAsPlainText, exportToPDF } from '../utils/pdfExport'
import { useGeminiAI } from '../hooks/useGeminiAI'

const steps = ['Contact', 'Summary', 'Experience', 'Education', 'Skills', 'Projects', 'Certifications']
const id = () => Math.random().toString(36).slice(2)
const Field = ({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) => <label className="field">
<span>{label}</span>
<input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
</label>
const Text = ({ label, value, onChange, placeholder, maxLength }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; maxLength?: number }) => <label className="field field-text">
<span>{label}</span>
<textarea value={value} maxLength={maxLength} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />{maxLength && <small>{value.length}/{maxLength}</small>}</label>

function ItemControls({ onDelete }: { onDelete: () => void }) { return <button className="icon-button delete" title="Remove entry" onClick={onDelete}>
<Trash2 size={16} />
</button> }

export default function BuilderPage() {
  const navigate = useNavigate(); const { data, setData, step, setStep, clear } = useCVStore(); const [previewOpen, setPreviewOpen] = useState(false); const [confirmClear, setConfirmClear] = useState(false); const [aiOpen, setAiOpen] = useState(false); const [aiSuggestion, setAiSuggestion] = useState(''); const [aiTarget, setAiTarget] = useState<SectionId>('summary'); const [aiInstruction, setAiInstruction] = useState('Make this more concise and impactful for the target role.'); const ai = useGeminiAI()
  const ats = useMemo(() => scoreATS(data), [data]);
  if (!data.theme) return <Navigate to="/" replace />
  const update = (fn: (current: typeof data) => typeof data) => setData(fn(data))
  const updateContact = (key: keyof typeof data.contact, value: string) => update((d) => ({ ...d, contact: { ...d.contact, [key]: value } }))
  const replaceList = <T,>(key: 'experience' | 'education' | 'projects' | 'certifications', index: number, item: T) => update((d) => ({ ...d, [key]: (d[key] as T[]).map((v, i) => i === index ? item : v) }))
  const remove = (key: 'experience' | 'education' | 'projects' | 'certifications', index: number) => update((d) => ({ ...d, [key]: d[key].filter((_, i) => i !== index) }))
  const copyText = JSON.stringify(data, null, 2)
  const title = steps[step]
  
  const currentSectionStatus = ats.sectionStatus[title] || { warnings: [], passes: [] }
  const displayWarnings = currentSectionStatus.warnings.slice(0, 3)
  const displayPasses = currentSectionStatus.passes.slice(0, 3 - displayWarnings.length)
  const sectionWarningsCount = currentSectionStatus.warnings.length
  const sectionLabel: Record<SectionId, string> = { summary: 'Professional summary', experience: 'Work experience', education: 'Education details', skills: 'Technical skills', projects: 'Project descriptions', certifications: 'Certifications' }
  const targetContent = (target: SectionId) => {
    if (target === 'summary') return data.summary
    if (target === 'experience') return data.experience.map((x) => `${x.title} at ${x.company}: ${x.bullets.join(' ')}`).join('\n')
    if (target === 'education') return data.education.map((x) => `${x.degree} ${x.field} — ${x.school}. ${x.details}`).join('\n')
    if (target === 'skills') return [data.skills.technical, data.skills.tools, data.skills.soft].filter(Boolean).join(', ')
    if (target === 'projects') return data.projects.map((x) => `${x.name}: ${x.description}`).join('\n')
    return data.certifications.map((x) => `${x.name} — ${x.issuer} (${x.year})`).join('\n')
  }
  const applySuggestion = () => update((d) => {
    if (aiTarget === 'summary') return { ...d, summary: aiSuggestion }
    if (aiTarget === 'skills') return { ...d, skills: { ...d.skills, technical: aiSuggestion } }
    if (aiTarget === 'experience' && d.experience.length) return { ...d, experience: d.experience.map((x, i) => i ? x : { ...x, bullets: aiSuggestion.split('\n').map((line) => line.replace(/^[-•]\s*/, '')).filter(Boolean) }) }
    if (aiTarget === 'education' && d.education.length) return { ...d, education: d.education.map((x, i) => i ? x : { ...x, details: aiSuggestion }) }
    if (aiTarget === 'projects' && d.projects.length) return { ...d, projects: d.projects.map((x, i) => i ? x : { ...x, description: aiSuggestion }) }
    if (aiTarget === 'certifications' && d.certifications.length) return { ...d, certifications: d.certifications.map((x, i) => i ? x : { ...x, name: aiSuggestion }) }
    return d
  })
  const enhanceWithAI = async () => { const suggestion = await ai.enhance({ content: targetContent(aiTarget), section: sectionLabel[aiTarget], instruction: aiInstruction, targetRole: data.contact.title, template: data.theme }); if (suggestion) setAiSuggestion(suggestion) }

  return <main className="builder">
<header className="builder-top">
<button className="back" onClick={() => navigate('/')}>
<ArrowLeft size={18} /> Templates</button>
<div className="builder-brand" style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
<FileText size={18} /> CVForge</div>
<button className="preview-mobile" onClick={() => setPreviewOpen(true)}>Preview</button>
</header>
<div className="builder-shell">
<section className="editor">
<div className="editor-head">
<div>
<p className="eyebrow">CV builder</p>
<h1>{title}</h1>
</div>
<div className="step-count">{step + 1} / {steps.length}</div>
</div>
<nav className="steps" aria-label="CV sections">{steps.map((x, i) => <button key={x} className={i === step ? 'active' : i < step ? 'done' : ''} onClick={() => setStep(i)}>
<span>{i < step ? '✓' : i + 1}</span>{x}</button>)}</nav>
<div className="mobile-actions"><div><b>ATS Score <span>{ats.score}%</span></b><small>{sectionWarningsCount} warning{sectionWarningsCount !== 1 ? 's' : ''}</small></div><button className="btn-gemini" disabled={ai.usesLeft === 0} onClick={() => { setAiSuggestion(''); setAiOpen(true) }}><Sparkles size={14} /> Gemini AI</button><button onClick={exportToPDF}><Download size={14} /> PDF</button><button onClick={() => window.print()}><Printer size={14} /> Print</button></div>
<AnimatePresence mode="wait">
<motion.div key={step} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: .18 }} className="form-area">{step === 0 && <Contact data={data} update={updateContact} />}{step === 1 && <Summary data={data} update={update} openAI={() => setAiOpen(true)} />}{step === 2 && <ExperienceForm data={data} update={update} replace={replaceList} remove={remove} />}{step === 3 && <EducationForm data={data} update={update} replace={replaceList} remove={remove} />}{step === 4 && <Skills data={data} update={update} />}{step === 5 && <ProjectsForm data={data} update={update} replace={replaceList} remove={remove} />}{step === 6 && <CertificationsForm data={data} update={update} replace={replaceList} remove={remove} />}</motion.div>
</AnimatePresence>
<footer className="form-nav">
<button className="secondary" disabled={step === 0} onClick={() => setStep(step - 1)}>
<ArrowLeft size={16} /> Back</button>
<button className="primary" onClick={() => setStep(Math.min(steps.length - 1, step + 1))}>{step === steps.length - 1 ? 'Done' : 'Continue'} <ArrowRight size={16} />
</button>
</footer>
</section>
<aside className="preview-pane">
<div className="preview-pane-header">
<div className="ats-card">
<header className="card-header">
<h3>ATS Score <span className={`score-value score-${ats.score >= 75 ? 'high' : ats.score >= 50 ? 'med' : 'low'}`}>{ats.score}%</span>
</h3>
<span className="warning-text">{sectionWarningsCount} warning{sectionWarningsCount !== 1 ? 's' : ''}</span>
</header>
<div className="status-list">{displayWarnings.map((warn) => <div className="status-item warn" key={warn}>
<AlertTriangle size={14} /> <span>{warn}</span>
</div>)}{displayPasses.map((pass) => <div className="status-item pass" key={pass}>
<Check size={14} /> <span>{pass}</span>
</div>)}</div>
</div>
<div className="actions-card">
<header className="card-header">
<h3>Actions</h3>
<button className="theme-toggle" onClick={() => document.body.classList.toggle('dark')}>
<Sun size={16} />
</button>
</header>
<button className="btn-gemini" title={ai.usesLeft === 0 ? 'Daily limit reached — resets at midnight' : undefined} disabled={ai.usesLeft === 0} onClick={() => { setAiSuggestion(''); setAiOpen(true) }}>
<Sparkles size={14} /> Enhance with Gemini AI</button>
<small className="ai-uses">AI uses left today: {ai.usesLeft ?? 5}/5</small>{ai.error && <small className="ai-error">{ai.error}</small>}
<div className="btn-grid">
<button className="btn-action" onClick={exportToPDF}>
<Download size={14} /> Save PDF</button>
<button className="btn-action" onClick={() => window.print()}>
<Printer size={14} /> Print</button>
<button className="btn-action" onClick={() => copyAsPlainText(copyText)}>
<Clipboard size={14} /> Copy text</button>
<button className="btn-clear" onClick={() => setConfirmClear(true)}>
<X size={14} /> Clear all</button>
</div>
</div>
</div>
<div className="preview-scroll">
<CVPreview data={data} />
</div>
</aside>
</div>{previewOpen && <div className="mobile-overlay">
<button className="close-preview" onClick={() => setPreviewOpen(false)}>
<X /> </button>
<div className="preview-scroll">
<CVPreview data={data} />
</div>
</div>}{confirmClear && <div className="modal-wrap">
<div className="modal">
<h2>Clear your CV?</h2>
<p>This removes all currently entered content from this browser.</p>
<div>
<button className="secondary" onClick={() => setConfirmClear(false)}>Cancel</button>
<button className="danger" onClick={() => { clear(); setConfirmClear(false); navigate('/') }}>Clear all</button>
</div>
</div>
</div>}{aiOpen && <div className="modal-wrap">
<div className="modal ai-modal">
<button className="modal-close" onClick={() => setAiOpen(false)}>
<X size={18} />
</button>
<p className="eyebrow">
<Bot size={15} /> AI assistant</p>
<h2>Enhance any CV section</h2>
<label className="field"><span>Section</span><select value={aiTarget} onChange={(e) => { setAiTarget(e.target.value as SectionId); setAiSuggestion('') }}>{sectionIds.map((id) => <option key={id} value={id}>{sectionLabel[id]}</option>)}</select></label>
<Text label="What should Gemini improve?" value={aiInstruction} onChange={setAiInstruction} placeholder="e.g. Make this stronger for a product manager role" />
<div className="ai-columns">
<div>
<small>CURRENT</small>
<p>{targetContent(aiTarget) || `Add ${sectionLabel[aiTarget].toLowerCase()} content first.`}</p>
</div>
<div>
<small>SUGGESTION</small>
<p>{aiSuggestion}</p>
</div>
</div>
<div className="pills">
<span>Concise</span>
<span>Impact-led</span>
<span>Professional</span>
</div>
<div>
<button className="secondary" onClick={() => setAiOpen(false)}>Discard</button>
{aiSuggestion ? <button className="primary" onClick={() => { applySuggestion(); setAiOpen(false) }}>Apply suggestion</button> : <button className="primary" disabled={ai.isLoading || !targetContent(aiTarget)} onClick={enhanceWithAI}>{ai.isLoading ? 'Enhancing…' : 'Generate suggestion'}</button>}
</div>
</div>
</div>}</main>
}

function Contact({ data, update }: any) { const c = data.contact; return <div className="form-grid">
<Field label="Full name" value={c.fullName} onChange={(v) => update('fullName', v)} placeholder="Alex Morgan" />
<Field label="Target role" value={c.title} onChange={(v) => update('title', v)} placeholder="Product Designer" />
<Field label="Email" type="email" value={c.email} onChange={(v) => update('email', v)} placeholder="alex@email.com" />
<Field label="Phone" value={c.phone} onChange={(v) => update('phone', v)} placeholder="+92 300 0000000" />
<Field label="Location" value={c.location} onChange={(v) => update('location', v)} placeholder="Karachi, Pakistan" />
<Field label="LinkedIn" value={c.linkedin} onChange={(v) => update('linkedin', v)} placeholder="linkedin.com/in/alex" />
<Field label="Portfolio / GitHub" value={c.website} onChange={(v) => update('website', v)} placeholder="alexmorgan.dev" />
</div> }
function Summary({ data, update }: any) { return <div>
<div className="section-note">
<p>Give employers the short version of your professional story.</p>
</div>
<Text label="Professional summary" value={data.summary} maxLength={600} onChange={(v) => update((d: any) => ({ ...d, summary: v }))} placeholder="Describe your experience, strengths, and the impact you want to make..." />
</div> }
function ExperienceForm({ data, update, replace, remove }: any) { const add = () => update((d: any) => ({ ...d, experience: [...d.experience, { id: id(), title: '', company: '', location: '', startDate: '', endDate: '', current: false, bullets: [''] }] })); return <EntryList title="Work experience" note="Include roles, internships, freelance work, or leadership." add="Add experience" onAdd={add}>{data.experience.map((x: Experience, i: number) => <div className="entry-card" key={x.id}>
<ItemControls onDelete={() => remove('experience', i)} />
<div className="form-grid">
<Field label="Role" value={x.title} onChange={(v) => replace('experience', i, { ...x, title: v })} placeholder="Product Design Intern" />
<Field label="Company" value={x.company} onChange={(v) => replace('experience', i, { ...x, company: v })} placeholder="Company name" />
<Field label="Location" value={x.location} onChange={(v) => replace('experience', i, { ...x, location: v })} placeholder="City, Country" />
<Field label="Start date" value={x.startDate} onChange={(v) => replace('experience', i, { ...x, startDate: v })} placeholder="Jun 2024" />
<Field label="End date" value={x.endDate} onChange={(v) => replace('experience', i, { ...x, endDate: v })} placeholder="Aug 2025" />
</div>
<Text label="Achievement bullets (one per line)" value={x.bullets.join('\n')} onChange={(v) => replace('experience', i, { ...x, bullets: v.split('\n') })} placeholder="Built a feature that improved..." />
</div>)}</EntryList> }
function EducationForm({ data, update, replace, remove }: any) { const add = () => update((d: any) => ({ ...d, education: [...d.education, { id: id(), school: '', degree: '', field: '', startDate: '', endDate: '', details: '' }] })); return <EntryList title="Education" note="Start with your most recent qualification." add="Add education" onAdd={add}>{data.education.map((x: Education, i: number) => <div className="entry-card" key={x.id}>
<ItemControls onDelete={() => remove('education', i)} />
<div className="form-grid">
<Field label="School or university" value={x.school} onChange={(v) => replace('education', i, { ...x, school: v })} placeholder="University name" />
<Field label="Degree" value={x.degree} onChange={(v) => replace('education', i, { ...x, degree: v })} placeholder="Bachelor of Science" />
<Field label="Field of study" value={x.field} onChange={(v) => replace('education', i, { ...x, field: v })} placeholder="Computer Science" />
<Field label="Start year" value={x.startDate} onChange={(v) => replace('education', i, { ...x, startDate: v })} placeholder="2021" />
<Field label="End year" value={x.endDate} onChange={(v) => replace('education', i, { ...x, endDate: v })} placeholder="2025" />
</div>
<Text label="Details" value={x.details} onChange={(v) => replace('education', i, { ...x, details: v })} placeholder="GPA, relevant coursework, honors..." />
</div>)}</EntryList> }
function Skills({ data, update }: any) { return <div>
<div className="section-note">
<p>Separate each skill with a comma so they remain easy to scan.</p>
</div>
<div className="form-grid single">
<Field label="Technical skills" value={data.skills.technical} onChange={(v) => update((d: any) => ({ ...d, skills: { ...d.skills, technical: v } }))} placeholder="JavaScript, Python, SQL, Figma" />
<Field label="Tools & platforms" value={data.skills.tools} onChange={(v) => update((d: any) => ({ ...d, skills: { ...d.skills, tools: v } }))} placeholder="GitHub, Notion, VS Code" />
<Field label="Soft skills" value={data.skills.soft} onChange={(v) => update((d: any) => ({ ...d, skills: { ...d.skills, soft: v } }))} placeholder="Communication, Leadership, Research" />
</div>
</div> }
function ProjectsForm({ data, update, replace, remove }: any) { const add = () => update((d: any) => ({ ...d, projects: [...d.projects, { id: id(), name: '', link: '', description: '', tools: '' }] })); return <EntryList title="Projects" note="Show work that demonstrates your strongest relevant skills." add="Add project" onAdd={add}>{data.projects.map((x: Project, i: number) => <div className="entry-card" key={x.id}>
<ItemControls onDelete={() => remove('projects', i)} />
<div className="form-grid">
<Field label="Project name" value={x.name} onChange={(v) => replace('projects', i, { ...x, name: v })} placeholder="Portfolio redesign" />
<Field label="Tools used" value={x.tools} onChange={(v) => replace('projects', i, { ...x, tools: v })} placeholder="React, Figma" />
<Field label="Project link" value={x.link} onChange={(v) => replace('projects', i, { ...x, link: v })} placeholder="github.com/..." />
</div>
<Text label="Description" value={x.description} onChange={(v) => replace('projects', i, { ...x, description: v })} placeholder="What you built, who it served, and what changed." />
</div>)}</EntryList> }
function CertificationsForm({ data, update, replace, remove }: any) { const add = () => update((d: any) => ({ ...d, certifications: [...d.certifications, { id: id(), name: '', issuer: '', year: '' }] })); return <EntryList title="Certifications" note="Add relevant professional credentials and courses." add="Add certification" onAdd={add}>{data.certifications.map((x: Certification, i: number) => <div className="entry-card compact" key={x.id}>
<ItemControls onDelete={() => remove('certifications', i)} />
<div className="form-grid">
<Field label="Certification" value={x.name} onChange={(v) => replace('certifications', i, { ...x, name: v })} placeholder="Google UX Design" />
<Field label="Issuer" value={x.issuer} onChange={(v) => replace('certifications', i, { ...x, issuer: v })} placeholder="Google" />
<Field label="Year" value={x.year} onChange={(v) => replace('certifications', i, { ...x, year: v })} placeholder="2026" />
</div>
</div>)}</EntryList> }
function EntryList({ title, note, add, onAdd, children }: any) { return <div>
<div className="section-note">
<div>
<h2>{title}</h2>
<p>{note}</p>
</div>
<button className="add" onClick={onAdd}>
<Plus size={16} /> {add}</button>
</div>{children || <div className="empty-state">
<ChevronDown size={22} />
<p>Nothing here yet. Add your first entry when you are ready.</p>
</div>}</div> }
