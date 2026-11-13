/* ---------- Line icons (64 x 64) ---------- */
const iconProps = {
  viewBox: '0 0 64 64',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  className: 'h-16 w-16',
  'aria-hidden': true,
}

const BookIcon = () => (
  <svg {...iconProps}>
    <path d="M8 16h28v40H12a4 4 0 0 1-4-4V16z" />
    <path d="M13 16v40M19 26h12M19 32h8" />
    <path d="M19 56v-9l3.5 2.5L26 47v9" />
    <path d="M45 10c4-5 12-2 12 5 0 6-8 11-12 15-4-4-12-9-12-15 0-7 8-10 12-5z" />
  </svg>
)

const CertificateIcon = () => (
  <svg {...iconProps}>
    <rect x="26" y="10" width="34" height="24" rx="1.5" />
    <path d="M33 17h16M33 22h12" />
    <circle cx="51" cy="27" r="3" />
    <path d="M10 14h20v10a10 10 0 0 1-20 0V14z" />
    <path d="M10 17H5v3a5 5 0 0 0 5 5M30 17h5v3a5 5 0 0 1-5 5" />
    <path d="M20 34v10M14 44h12v10H14zM11 54h18" />
  </svg>
)

const TeachersIcon = () => (
  <svg {...iconProps}>
    <rect x="22" y="6" width="32" height="20" rx="2" />
    <path d="M28 13h20M28 19h12M30 26v6l6-6" />
    <circle cx="18" cy="40" r="6" />
    <path d="M6 58c0-8 5-12 12-12s12 4 12 12z" />
    <circle cx="46" cy="40" r="6" />
    <path d="M34 58c0-8 5-12 12-12s12 4 12 12z" />
  </svg>
)

const CourseIcon = () => (
  <svg {...iconProps}>
    <path d="M32 6 8 15l24 9 24-9L32 6z" />
    <path d="M18 21v7c0 3 6 5 14 5s14-2 14-5v-7M56 16v13" />
    <circle cx="32" cy="46" r="12" />
    <path d="M20 46h24M32 34c-5 6-5 18 0 24M32 34c5 6 5 18 0 24" />
  </svg>
)

/* ---------- Content ---------- */
const TILES = [
  {
    title: 'Books & Library',
    text: 'Lorem ipsum dolor sit amet, consectur cing elit. Suspe ndisse suscipit...',
    Icon: BookIcon,
    bg: 'bg-[#f76b4a]',
    iconColor: 'text-[#ffb79f]',
  },
  {
    title: 'Certification',
    text: 'Lorem ipsum dolor sit amet, consectur cing elit. Suspe ndisse suscipit...',
    Icon: CertificateIcon,
    bg: 'bg-brand',
    iconColor: 'text-[#cdf28f]',
  },
  {
    title: 'Great Teachers',
    text: 'Lorem ipsum dolor sit amet, consectur cing elit. Suspe ndisse suscipit...',
    Icon: TeachersIcon,
    bg: 'bg-[#04508a]',
    iconColor: 'text-[#2fc4e8]',
  },
  {
    title: 'Online Courses',
    text: 'Lorem ipsum dolor sit amet, consectur cing elit. Suspe ndisse suscipit...',
    Icon: CourseIcon,
    bg: 'bg-[#3498e8]',
    iconColor: 'text-[#6be6ee]',
  },
]

export default function FeatureTiles() {
  return (
    <section className="bg-[#f8f8f8] pb-14 lg:pb-20" aria-label="What we offer">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4">
          {TILES.map(({ title, text, Icon, bg, iconColor }) => (
            <article key={title} className={`${bg} px-8 py-10 text-white sm:px-10`}>
              <div className={iconColor}>
                <Icon />
              </div>
              <h3 className="mt-9 font-slab text-[22px] leading-snug">{title}</h3>
              <p className="mt-4 text-[15px] leading-7">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}