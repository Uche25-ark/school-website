import { useState } from 'react'
import communityImage from '../../assets/community.jpg'
import parentsImage from '../../assets/parents.jpg'
import studentsImage from '../../assets/students.jpg'
import { SCHOOL } from '../../data/school.js'

const familyImage = '/slides/slide-1.jpg'
const portraitImage = '/slides/slide-2.jpg'
const staffImage = '/slides/slide-3.jpg'

const PHOTOS = [
  { src: studentsImage, alt: 'Students taking part in a classroom lesson', className: 'row-span-2' },
  { src: communityImage, alt: 'The school building and its grounds', className: '' },
  { src: parentsImage, alt: 'A group collaborating in a meeting', className: 'row-span-2' },
  { src: familyImage, alt: 'Family members together', className: '' },
  { src: portraitImage, alt: 'A smiling member of the community', className: '' },
  { src: staffImage, alt: 'A member of the community', className: '' },
]

export default function MediaGallery() {
  const [email, setEmail] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    const subject = encodeURIComponent('Please add me to the school newsletter')
    const body = encodeURIComponent(`Please send school newsletter updates to ${email}.`)
    window.location.href = `mailto:${SCHOOL.email}?subject=${subject}&body=${body}`
  }

  return (
    <>
      <section className="bg-[#f8f8f8] pt-14 sm:pt-16" aria-labelledby="media-heading">
        <div className="text-center">
          <h2 id="media-heading" className="font-slab text-3xl text-ink sm:text-4xl">
            Our Media
          </h2>
          <p className="mt-1 text-sm text-neutral-500">Photo Gallery</p>
        </div>

        <div className="mt-10 grid auto-rows-[150px] grid-cols-2 gap-1 overflow-hidden sm:auto-rows-[190px] sm:grid-cols-3 lg:auto-rows-[230px] lg:grid-cols-4">
          {PHOTOS.map(({ src, alt, className }) => (
            <div key={src} className={`overflow-hidden ${className}`}>
              <img
                src={src}
                alt={alt}
                className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#31b9d4] px-4 py-9 text-white sm:py-12" aria-labelledby="newsletter-heading">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 id="newsletter-heading" className="font-slab text-2xl sm:text-3xl">
              Subscribe to our newsletter
            </h2>
            <p className="mt-1 text-sm text-white/80">Your email app will open to send us your subscription request.</p>
          </div>
          <form onSubmit={handleSubmit} className="flex w-full max-w-xl rounded-full border border-white/50 bg-white/10 p-1">
            <label className="sr-only" htmlFor="newsletter-email">Your email</label>
            <input
              id="newsletter-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Your email"
              required
              className="min-w-0 flex-1 bg-transparent px-4 text-sm text-white outline-none placeholder:text-white/60"
            />
            <button
              type="submit"
              className="shrink-0 rounded-full bg-white px-5 py-3 text-sm font-bold text-[#31b9d4] transition-colors hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </>
  )
}
