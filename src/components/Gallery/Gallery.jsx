import { Link } from 'react-router-dom'
import communityImage from '../../assets/community.jpg'
import parentsImage from '../../assets/parents.jpg'
import studentsImage from '../../assets/students.jpg'

const GALLERY_IMAGES = [
  { src: parentsImage, alt: 'A team collaborating around a table' },
  { src: studentsImage, alt: 'A student thinking through a classroom lesson' },
  { src: communityImage, alt: 'The school community walking through campus' },
]

export default function Gallery() {
  return (
    <>
      <section
        className="relative flex min-h-[280px] items-center justify-center bg-cover bg-center px-4 py-16 text-center text-white sm:min-h-80"
        style={{ backgroundImage: `url(${studentsImage})` }}
        aria-labelledby="gallery-heading"
      >
        <div className="absolute inset-0 bg-[#101c2a]/60" />
        <div className="relative">
          <h1 id="gallery-heading" className="font-slab text-5xl font-bold sm:text-6xl">Gallery</h1>
          <nav aria-label="Breadcrumb" className="mt-3 font-slab font-bold">
            <Link to="/" className="hover:underline">Home</Link>
            <span aria-hidden="true"> / </span>
            <span aria-current="page">Gallery</span>
          </nav>
        </div>
      </section>

      <section className="bg-[#f8f8f8] px-4 py-14 sm:px-6 lg:py-16" aria-labelledby="image-gallery-heading">
        <div className="mx-auto max-w-7xl lg:px-16">
          <h2 id="image-gallery-heading" className="text-center font-slab text-3xl text-ink sm:text-4xl">
            Image Gallery
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {GALLERY_IMAGES.map(({ src, alt }) => (
              <img
                key={src}
                src={src}
                alt={alt}
                className="aspect-[1.55/1] w-full object-cover"
                loading="lazy"
              />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
