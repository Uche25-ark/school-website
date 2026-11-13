import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

/*
  Put your photos in /public/slides/ (slide-1.jpg, slide-2.jpg, slide-3.jpg)
  or change the `image` paths below.
*/
const SLIDES = [
  {
    title: 'Learning Today For A Better ',
    cta: 'Take a Tour',
    to: '/admissions',
    image: '/slides/slide-1.jpg',
  },
  {
    title: 'Small Classes, Big Ambitions',
    cta: 'Explore Academics',
    to: '/academics',
    image: '/slides/slide-2.jpg',
  },
  {
    title: 'Build a bright future with us',
    cta: 'Explore Admissions',
    to: '/admissions',
    image: '/slides/slide-3.jpg',
  },
]

const INTERVAL = 6000

export default function HeroCarousel() {
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(
    () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const [hovering, setHovering] = useState(false)

  const count = SLIDES.length
  const next = () => setIndex((i) => (i + 1) % count)
  const prev = () => setIndex((i) => (i - 1 + count) % count)

  // Autoplay
  useEffect(() => {
    if (!playing || hovering) return
    const id = setInterval(() => setIndex((i) => (i + 1) % count), INTERVAL)
    return () => clearInterval(id)
  }, [playing, hovering, count])

  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') next()
    if (e.key === 'ArrowLeft') prev()
  }

  return (
    <section
      role="group"
      aria-roledescription="carousel"
      aria-label="Featured"
      onKeyDown={onKeyDown}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      className="relative h-[440px] w-full overflow-hidden bg-ink sm:h-[520px] lg:h-[620px]"
    >
      {/* Slides */}
      {SLIDES.map((s, i) => {
        const active = i === index
        return (
          <div
            key={s.title}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
            inert={!active}
            className={`absolute inset-0 transition-opacity duration-700 motion-reduce:transition-none ${
              active ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
          >
            {/* Photo + dark overlay */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${s.image})` }}
            />
            <div className="absolute inset-0 bg-black/45" />

            {/* Caption */}
            <div className="absolute inset-x-0 bottom-24 sm:bottom-28 lg:bottom-32">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-16">
                <div className="relative max-w-[480px] border-l-4 border-[#2aa7e0] bg-[#0b5a96]/95 px-6 pb-12 pt-7 text-white sm:px-12 sm:pt-9">
                  <h2 className="font-slab text-2xl leading-snug sm:text-[32px]">{s.title}</h2>
                  <Link
                    to={s.to}
                    className="absolute bottom-0 left-6 translate-y-1/2 rounded-full bg-brand px-7 py-3 font-slab text-[15px] font-bold text-white transition-colors hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:left-12"
                  >
                    {s.cta}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )
      })}

      {/* Controls */}
      <div className="absolute inset-x-0 bottom-5 flex items-center justify-center gap-3 text-white">
        <button
          type="button"
          onClick={next}
          aria-label="Next slide"
          className="rounded p-1 opacity-80 hover:opacity-100 focus-visible:outline-2 focus-visible:outline-white"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m9 5 7 7-7 7" />
          </svg>
        </button>

        <div className="flex items-center gap-2">
          {SLIDES.map((s, i) => (
            <button
              key={s.title}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === index}
              className={`h-3 w-3 rounded-full border-2 border-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                i === index ? 'bg-white' : 'bg-transparent hover:bg-white/50'
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? 'Pause slideshow' : 'Play slideshow'}
          className="rounded p-1 opacity-80 hover:opacity-100 focus-visible:outline-2 focus-visible:outline-white"
        >
          {playing ? (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
      </div>

      {/* Screen reader announcements */}
      <p className="sr-only" aria-live={playing ? 'off' : 'polite'}>
        Slide {index + 1} of {count}: {SLIDES[index].title}
      </p>
    </section>
  )
}