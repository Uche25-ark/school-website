import { Link } from 'react-router-dom'
import communityImage from '../../assets/community.jpg'
import parentsImage from '../../assets/parents.jpg'
import studentsImage from '../../assets/students.jpg'

const familyImage = '/slides/slide-1.jpg'

const CATEGORIES = [
  { title: 'Courses', to: '/academics', color: 'bg-[#075486]', icon: 'book' },
  { title: 'Donations', to: '/contact', color: 'bg-[#31b9d4]', icon: 'folder' },
]

const STORIES = [
  {
    title: 'A welcoming school community',
    category: 'Community',
    date: 'Our school',
    image: communityImage,
    alt: 'The school building surrounded by trees and lawn',
    to: '/about',
  },
  {
    title: 'Curiosity in every classroom',
    category: 'Learning',
    date: 'Student life',
    image: studentsImage,
    alt: 'Students raising their hands in class',
    to: '/academics',
  },
  {
    title: 'Working together for every student',
    category: 'Community',
    date: 'Our people',
    image: parentsImage,
    alt: 'Colleagues collaborating in a meeting',
    to: '/about',
  },
  {
    title: 'Families are part of our community',
    category: 'Community',
    date: 'Our families',
    image: familyImage,
    alt: 'A family spending time together',
    to: '/contact',
  },
]

function CategoryIcon({ name }) {
  const common = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className: 'h-8 w-8',
    'aria-hidden': true,
  }

  const paths = {
    book: (
      <>
        <path d="M3 5.5C6 4 9 4.5 12 6v15c-3-1.5-6-2-9-.5zM21 5.5C18 4 15 4.5 12 6v15c3-1.5 6-2 9-.5z" />
        <path d="M6 9h3M6 12h3M15 9h3M15 12h3" />
      </>
    ),
    folder: (
      <>
        <path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <path d="M3 10h18" />
      </>
    ),
  }

  return <svg {...common}>{paths[name]}</svg>
}

export default function SchoolLife() {
  return (
    <section className="bg-[#f8f8f8] py-14 sm:py-16" aria-labelledby="school-life-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-16">
        <div className="text-center">
          <h2 id="school-life-heading" className="font-slab text-3xl text-ink sm:text-4xl">
            Our School Life
          </h2>
          <p className="mt-1 text-sm text-neutral-500">Success Stories</p>
        </div>

        <nav className="mt-10 grid grid-cols-2 gap-1" aria-label="School life links">
          {CATEGORIES.map(({ title, to, color, icon }) => (
            <Link
              key={title}
              to={to}
              className={`${color} flex min-h-32 flex-col items-center justify-center gap-3 px-4 py-6 text-center font-slab font-bold text-white transition-[filter] hover:brightness-95 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink`}
            >
              <CategoryIcon name={icon} />
              {title}
            </Link>
          ))}
        </nav>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STORIES.map(({ title, category, date, image, alt, to }) => (
            <article key={title} className="overflow-hidden border border-neutral-200 bg-white shadow-sm">
              <Link to={to} className="group block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
                <img
                  src={image}
                  alt={alt}
                  className="aspect-[17/10] w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  loading="lazy"
                />
                <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-2.5 text-xs text-neutral-500">
                  <span>{date}</span>
                  <span>{category}</span>
                </div>
                <div className="min-h-32 p-4">
                  <h3 className="font-slab text-lg leading-snug text-ink group-hover:text-brand-dark">{title}</h3>
                  <span className="mt-4 inline-block text-sm font-bold text-[#3498e8]">Read more</span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
