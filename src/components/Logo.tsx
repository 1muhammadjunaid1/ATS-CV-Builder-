export default function Logo({ className = '' }: { className?: string }) {
  return <div className={`brand-logo ${className}`.trim()} aria-label="CVForge">
    <span className="brand-symbol" aria-hidden="true">
      <svg viewBox="0 0 124 92" focusable="false">
        <path className="logo-c" d="M76 25C68 16 55 12 42 14C23 17 10 34 10 53C10 73 25 86 46 86C59 86 69 81 76 73" />
        <circle className="logo-dot" cx="45" cy="52" r="13" />
        <path className="logo-v" d="M56 42L79 78L112 11" />
      </svg>
    </span>
    <span className="brand-word" aria-hidden="true">
      Forge
    </span>
  </div>
}
