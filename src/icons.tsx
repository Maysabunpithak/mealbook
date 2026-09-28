type IconProps = { className?: string; filled?: boolean }

export function ArrowIcon({ className = '' }: IconProps) {
  return <svg className={`ui-icon ${className}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6" /></svg>
}

export function HeartIcon({ className = '', filled = false }: IconProps) {
  return <svg className={`ui-icon ${className}`} width="20" height="20" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20.4 5.6a5.2 5.2 0 0 0-7.4 0L12 6.7l-1-1.1a5.2 5.2 0 0 0-7.4 7.4L12 21l8.4-8a5.2 5.2 0 0 0 0-7.4Z" /></svg>
}
