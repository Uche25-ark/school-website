import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { SCHOOL, UTILITY_LINKS, MAIN_LINKS } from '../data/school.js'

/* ---------- Icons ---------- */
const PinIcon = () => (
  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11Z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
)

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <rect x="7" y="2" width="10" height="20" rx="2" />
    <path d="M11 18h2" />
  </svg>
)

const MailIcon = () => (
  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
)

const BookLogo = () => (
  <svg viewBox="0 0 56 52" className="h-11 w-12 sm:h-[52px] sm:w-14" aria-hidden="true">
    <path d="M3 8h20v38H8a5 5 0 0 1-5-5V8Z" fill="none" stroke="#78c750" strokeWidth="3" strokeLinejoin="round" />
    <path d="M20 8l22 4v38l-22-4V8Z" fill="#f26b3f" />
    <path d="M30 14l6 1v14l-3-2-3 3V14Z" fill="#fff" opacity=".9" />
    <path d="M45 12h3v36h-3z" fill="#2aa7e0" />
    <path d="M50 14h3v32h-3z" fill="#2aa7e0" opacity=".7" />
  </svg>
)

/* ---------- Component ---------- */
export default function Navbar() {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <header className="w-full">
      {/* Top bar */}
      <div className="bg-ink text-[12.5px] text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-8 gap-y-1 px-4 py-2 sm:px-6 lg:px-16">
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-1">
            <li className="hidden items-center gap-2 md:flex">
              <PinIcon />
              <span>{SCHOOL.location}</span>
            </li>
            <li className="flex items-center gap-2">
              <PhoneIcon />
              <a href={`tel:${SCHOOL.phone.replace(/-/g, '')}`} className="hover:text-brand focus-visible:outline-2 focus-visible:outline-brand">
                {SCHOOL.phone}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <MailIcon />
              <a href={`mailto:${SCHOOL.email}`} className="hover:text-brand focus-visible:outline-2 focus-visible:outline-brand">
                {SCHOOL.email}
              </a>
            </li>
          </ul>

          <nav aria-label="Secondary" className="hidden md:block">
            <ul className="flex items-center gap-x-6 tracking-[0.08em]">
              {UTILITY_LINKS.map((l) => (
                <li key={l.to}>
                  <NavLink
                    to={l.to}
                    className={({ isActive }) =>
                      `hover:text-brand focus-visible:outline-2 focus-visible:outline-brand ${isActive ? 'text-brand' : ''}`
                    }
                  >
                    {l.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      {/* Logo */}
      <div className="bg-white">
        <Link to="/" onClick={close} className="mx-auto flex w-fit items-center gap-3 px-4 py-5 sm:py-7" aria-label={`${SCHOOL.name} home`}>
          <BookLogo />
          <span className="flex flex-col leading-none">
            <span className="font-slab text-[28px] text-[#333] sm:text-[34px]">{SCHOOL.name}</span>
            <span className="mt-1.5 font-slab text-[9px] uppercase tracking-[0.14em] text-[#555] sm:text-[10.5px]">
              {SCHOOL.tagline}
            </span>
          </span>
        </Link>
      </div>

      {/* Main nav */}
      <div className="bg-brand">
        <div className="flex items-center justify-between gap-3 px-4 py-3 md:hidden">
          <span className="font-slab text-sm font-bold uppercase tracking-wide text-white">Menu</span>
          <div className="flex items-center gap-3">
            <Link to="/portal" onClick={close} className="rounded-full bg-white px-4 py-2 font-slab text-xs font-bold uppercase tracking-wide text-[#397c20]">
              Portal Login
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="main-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              className="rounded p-1 text-white focus-visible:outline-2 focus-visible:outline-white"
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
              </svg>
            </button>
          </div>
        </div>

        <nav id="main-menu" aria-label="Main" className={`${open ? 'block' : 'hidden'} md:block`}>
          <ul className="mx-auto flex max-w-7xl flex-col md:flex-row md:justify-center md:gap-x-2">
            {MAIN_LINKS.map((l) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  end={l.to === '/'}
                  onClick={close}
                  className={({ isActive }) =>
                    `block px-6 py-3 font-slab text-[15px] font-bold uppercase tracking-[0.01em] text-white transition-colors hover:bg-brand-dark focus-visible:-outline-offset-2 focus-visible:outline-2 focus-visible:outline-white md:px-5 md:py-[15px] ${
                      isActive ? 'bg-brand-dark' : ''
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <ul className="border-t border-white/25 bg-ink px-6 py-3 text-sm text-white md:hidden">
            {UTILITY_LINKS.map((l) => (
              <li key={l.to}>
                <NavLink to={l.to} onClick={close} className="block py-2 hover:text-brand">
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}
