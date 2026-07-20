export async function exportToPDF() {
  const root = document.getElementById('cv-preview-root')
  if (!root) return
  
  document.body.classList.add('pdf-exporting')
  try {
    const html2pdf = (await import('html2pdf.js')).default
    await html2pdf().set({ margin: 0, filename: 'CV.pdf', image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2, useCORS: true }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } }).from(root).save()
  } finally {
    document.body.classList.remove('pdf-exporting')
  }
}

export async function copyAsPlainText(text: string) { await navigator.clipboard.writeText(text) }
