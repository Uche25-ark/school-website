import { Link } from 'react-router-dom'
import communityImage from '../../assets/community.jpg'
import parentsImage from '../../assets/parents.jpg'
import studentsImage from '../../assets/students.jpg'

const CARDS = [
  {
    title: 'Community',
    text: 'Lorem ipsum dolor sit amet, consectetur cing elit. Suspe ndisse suscipit sagittis leo sit',
    image: communityImage,
    alt: 'The school building and lawn',
    to: '/about',
  },
  {
    title: 'Parents',
    text: 'Lorem ipsum dolor sit amet, consectetur cing elit. Suspe ndisse suscipit sagittis leo sit',
    image: parentsImage,
    alt: 'A parent speaking on the phone in a meeting room',
    to: '/contact',
  },
  {
    title: 'Students',
    text: 'Lorem ipsum dolor sit amet, consectetur cing elit. Suspe ndisse suscipit sagittis leo sit',
    image: studentsImage,
    alt: 'Students raising their hands in class',
    to: '/academics',
  },
]

export default function IntroSection() {
  return (
    <section className="bg-[#f8f8f8]">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-16 lg:py-20">
        {/* Intro */}
        <div className="grid gap-6 md:grid-cols-[1fr_2fr] md:gap-14">
          <h2 className="font-slab text-[26px] leading-snug text-[#333] sm:text-[30px]">
            We are London based Secondary School focused on excellence.
          </h2>
          <p className="leading-8 text-neutral-500">
            We are London based Secondary School focused on excellence. Lorem ipsum dolor sit amet, consectetur
            cing elit. Suspe ndisse suscipit sagittis leo sit met condimentum estibulum issim. Lorem ipsum dolor sit
            amet, consectetur cing elit. Suspe ndisse suscipit sagittis leo sit met condimentum estibulum issim
            posuere cubilia Curae Suspendisse at consectetur massa. Curabitur non ipsum nisinec dapibus elit. Donec
            nec magna id lacus conse posuere.
          </p>
        </div>

        {/* Cards */}
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {/* Highlighted card */}
          <div className="flex flex-col border-[3px] border-[#2f97e8] bg-white p-7 sm:p-9">
            <h3 className="font-slab text-2xl leading-snug text-[#222]">Apply for Admission</h3>
            <p className="mt-8 text-[15px] leading-7 text-neutral-500">
              Lorem ipsum dolor sit amet, consectetur cing elit. Suspe ndisse suscipit sagittis leo sit met
              condimentum estibulum issim
            </p>
            <Link
              to="/admissions"
              className="mt-8 w-fit rounded-full bg-brand px-6 py-2.5 font-slab text-sm font-bold text-white transition-colors hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Read More
            </Link>
          </div>

          {/* Image cards */}
          {CARDS.map((c) => (
            <article key={c.title} className="flex flex-col">
              <div
                role="img"
                aria-label={c.alt}
                className="aspect-[17/10] w-full bg-neutral-300 bg-cover bg-center"
                style={{ backgroundImage: `url(${c.image})` }}
              />
              <h3 className="mt-5 font-slab text-xl text-[#222]">{c.title}</h3>
              <p className="mt-3 text-[15px] leading-7 text-neutral-500">{c.text}</p>
              <Link
                to={c.to}
                className="mt-4 w-fit text-[15px] text-[#1a7ccb] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a7ccb]"
              >
                Learn More...
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}