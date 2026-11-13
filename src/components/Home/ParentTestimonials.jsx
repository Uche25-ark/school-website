import communityImage from '../../assets/community.jpg'
import parentsImage from '../../assets/parents.jpg'
import studentsImage from '../../assets/students.jpg'

const TESTIMONIALS = [
  { image: parentsImage, quote: 'Add an approved parent or carer testimonial here.', name: 'Parent or carer', detail: 'School community', accent: 'bg-[#3498e8]' },
  { image: studentsImage, quote: 'Share what families value about learning and life at our school.', name: 'Parent or carer', detail: 'School community', accent: 'bg-[#f76b4a]' },
  { image: communityImage, quote: 'Replace this sample with a real testimonial approved for publication.', name: 'Parent or carer', detail: 'School community', accent: 'bg-brand' },
]

export default function ParentTestimonials() {
  return (
    <section className="bg-[#f8f8f8] py-14 sm:py-16" aria-labelledby="testimonials-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-16">
        <div className="text-center">
          <h2 id="testimonials-heading" className="font-slab text-3xl text-ink sm:text-4xl">
            Parents Testimonials
          </h2>
          <p className="mt-1 text-sm text-neutral-500">Students and Parents Club</p>
        </div>

        <div className="mt-10 grid gap-10 md:grid-cols-3 md:gap-8">
          {TESTIMONIALS.map(({ image, quote, name, detail, accent }, index) => (
            <figure key={index} className="pt-1">
              <blockquote className="relative min-h-48 border border-neutral-200 bg-white px-6 py-8 shadow-sm">
                <span className={`absolute left-10 top-0 h-1 w-9 ${accent}`} aria-hidden="true" />
                <p className="font-slab leading-7 text-neutral-600">{quote}</p>
              </blockquote>
              <figcaption className="mt-4 flex items-center gap-3 pl-2">
                <img src={image} alt="" className="h-14 w-14 rounded-full object-cover" loading="lazy" />
                <span>
                  <span className="block font-slab text-lg text-ink">{name}</span>
                  <span className="block text-sm text-neutral-500">{detail}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
