import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { SCHOOL, UTILITY_LINKS, MAIN_LINKS } from '../data/school.js'
import schoolLogo from '../assets/uc-visuals-logo.png'

/* ---------- Component ---------- */
export default function Navbar() {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <header className="w-full">
      {/* Logo */}
      <div className="bg-white">
        <Link to="/" onClick={close} className="mx-auto flex w-fit items-center gap-3 px-4 py-5 sm:py-7" aria-label={`${SCHOOL.name} home`}>
          <span className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-[#101c2a] p-1 sm:h-16 sm:w-16">
            <img src={schoolLogo} alt="" className="h-full w-full object-contain" />
          </span>
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
