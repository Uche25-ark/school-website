import { Link } from 'react-router-dom'
import communityImage from '../../assets/community.jpg'

/* ---------- Icons (24 x 24, white line style) ---------- */
const iconProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  className: 'h-9 w-9',
  'aria-hidden': true,
}

const ThumbIcon = () => (
  <svg {...iconProps}>
    <path d="M7 11v9H4v-9h3zM7 11l4-7c1.5 0 2.5 1 2.5 2.5V9H19a2 2 0 0 1 2 2.3l-1.2 6.5A2 2 0 0 1 17.8 19H7" />
  </svg>
)

const PeopleIcon = () => (
  <svg {...iconProps}>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20c0-4 2.8-6 6.5-6s6.5 2 6.5 6" />
    <path d="M15 4.7a3.5 3.5 0 0 1 0 6.6M17.5 14c2.4.6 4 2.4 4 6" />
  </svg>
)

const AwardIcon = () => (
  <svg {...iconProps}>
    <circle cx="12" cy="9" r="6" />
    <circle cx="12" cy="9" r="3" />
    <path d="m8.5 14-2 7 5.5-3 5.5 3-2-7" />
  </svg>
)

const CalendarIcon = () => (
  <svg {...iconProps}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M8 3v4M16 3v4M3 10h18M8 14h2M12 14h2M16 14h2M8 18h2M12 18h2" />
  </svg>
)

const SmileIcon = () => (
  <svg {...iconProps}>
    <circle cx="12" cy="12" r="9" />
    <path d="M8 14c1 1.8 2.4 2.5 4 2.5s3-.7 4-2.5M9 9.5v1M15 9.5v1" />
  </svg>
)

/* ---------- Content ---------- */
const STATS = [
  { Icon: ThumbIcon, value: '100%', label: 'Passing to Universities' },
  { Icon: PeopleIcon, value: '126', label: 'People working' },
  { Icon: AwardIcon, value: '2480', label: 'Students Enrolled' },
  { Icon: CalendarIcon, value: '72', label: 'Years of experience' },
  { Icon: SmileIcon, value: '7856', label: 'Happy Smiles' },
]

export default function StatsBand() {
  return (
    <>
      {/* Stats on a fixed background image */}
      <section
        aria-labelledby="stats-heading"
        className="relative bg-ink bg-cover bg-center text-white md:bg-fixed"
        style={{ backgroundImage: `url(${communityImage})` }}
      >
        <div className="absolute inset-0 bg-[#0c2f38]/75" />

        <div className="relative mx-auto max-w-5xl px-4 py-14 text-center sm:px-6 lg:py-16">
          <h2 id="stats-heading" className="font-slab text-2xl sm:text-[28px]">
            More than 70 Years of Experience
          </h2>

          <dl className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
            {STATS.map(({ Icon, value, label }) => (
              <div key={label} className="flex flex-col items-center">
                <div className="order-1">
                  <Icon />
                </div>
                <dt className="order-3 mt-2 text-[13px]">{label}</dt>
                <dd className="order-2 mt-2 font-slab text-3xl leading-none sm:text-[34px]">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Green call-to-action strip */}
      <section className="bg-brand text-white" aria-label="Admission letter">
        <div className="mx-auto flex max-w-4xl flex-col items-start gap-4 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between">
          <p className="font-slab text-xl font-light sm:text-[22px]">
            Apply Letter for Admission to Secondary School
          </p>
          <Link
            to="/admissions"
            className="w-fit shrink-0 rounded-full bg-white px-10 py-2.5 font-slab text-xs font-bold text-[#3f8a22] transition-colors hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Learn More
          </Link>
        </div>
      </section>
    </>
  )
}