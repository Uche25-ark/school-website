import { Link } from 'react-router-dom'
import { SCHOOL, MAIN_LINKS } from '../data/school.js'

const YEAR = new Date().getFullYear()
const SOCIAL_PLATFORMS = [
  { name: 'Facebook', label: 'f' },
  { name: 'Instagram', label: '◎' },
  { name: 'X', label: '𝕏' },
  { name: 'LinkedIn', label: 'in' },
]

function SchoolLogo() {
  return (
    <Link
      to="/"
      className="inline-flex items-center gap-3"
      aria-label={`${SCHOOL.name} home`}
    >
      <svg viewBox="0 0 56 52" className="h-11 w-12 sm:h-[52px] sm:w-14" aria-hidden="true">
        <path d="M3 8h20v38H8a5 5 0 0 1-5-5V8Z" fill="none" stroke="#78c750" strokeWidth="3" strokeLinejoin="round" />
        <path d="M20 8l22 4v38l-22-4V8Z" fill="#f26b3f" />
        <path d="M30 14l6 1v14l-3-2-3 3V14Z" fill="#fff" opacity=".9" />
        <path d="M45 12h3v36h-3zM50 14h3v32h-3z" fill="#2aa7e0" />
      </svg>
      <span className="font-slab text-xl text-white">
        {SCHOOL.name}
        <span className="mt-1 block font-sans text-[9px] uppercase tracking-[0.14em] text-white/70">
          {SCHOOL.tagline}
        </span>
      </span>
    </Link>
  )
}

export default function Footer() {
  return (
    <footer className="bg-[#073b61] text-sm text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-16">
        <div>
          <SchoolLogo />
          <p className="mt-4 text-white/70">{SCHOOL.location}</p>
          <p className="text-white/70">{SCHOOL.phone}</p>
          <p className="text-white/70">{SCHOOL.email}</p>
          <ul className="mt-5 flex gap-3" aria-label="Social media">
            {SOCIAL_PLATFORMS.map(({ name, label }) => (
              <li key={name}>
                <span
                  aria-label={`${name} profile link not configured`}
                  title={`${name} profile link not configured`}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 font-sans text-sm font-bold text-white/80"
                >
                  {label}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <nav aria-label="Footer">
          <p className="font-slab font-bold">Explore</p>
          <ul className="mt-3 space-y-2">
            {MAIN_LINKS.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="text-white/70 hover:text-brand">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-white/15 py-4 text-center text-white/60">
        &copy; {YEAR} {SCHOOL.name}. All rights reserved.
      </div>
    </footer>
  )
}
