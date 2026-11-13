import { useState } from 'react'
import PageHeader from '../PageHeader.jsx'
import { SCHOOL } from '../../data/school.js'

const CONTACT_DETAILS = [
  {
    label: 'Phone',
    value: SCHOOL.phone,
    href: `tel:${SCHOOL.phone.replace(/[^\d+]/g, '')}`,
    icon: 'phone',
  },
  {
    label: 'Address',
    value: SCHOOL.location,
    icon: 'pin',
  },
  {
    label: 'Email',
    value: SCHOOL.email,
    href: `mailto:${SCHOOL.email}`,
    icon: 'mail',
  },
]

function ContactIcon({ name }) {
  const paths = {
    phone: (
      <>
        <rect x="7" y="2" width="10" height="20" rx="2" />
        <path d="M11 18h2" />
      </>
    ),
    pin: (
      <>
        <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m4 7 8 6 8-6" />
      </>
    ),
  }

  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6 shrink-0 text-[#f76b4a]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}

export default function Contact() {
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(event) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const name = formData.get('name')
    const email = formData.get('email')
    const subject = formData.get('subject')
    const message = formData.get('message')
    const mailSubject = encodeURIComponent(subject || `Website enquiry from ${name}`)
    const body = encodeURIComponent(`From: ${name}\nEmail: ${email}\n\n${message}`)

    setSubmitted(true)
    window.location.href = `mailto:${SCHOOL.email}?subject=${mailSubject}&body=${body}`
  }

  return (
    <>
      <PageHeader title="Contact Us" intro="Get in touch with our school team." />

      <section aria-label="School location" className="bg-neutral-200">
        <iframe
          title="Map showing the London area"
          src="https://www.openstreetmap.org/export/embed.html?bbox=-0.16%2C51.48%2C-0.08%2C51.53&layer=mapnik"
          className="h-[280px] w-full border-0 sm:h-[360px]"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
        <p className="bg-[#575354] px-4 py-4 text-center text-sm font-bold text-white sm:text-base">
          Map preview of the London area. Contact the school for directions to our exact location.
        </p>
      </section>

      <section className="bg-[#f8f8f8] px-4 py-14 sm:px-6 lg:py-16">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)] lg:gap-16 lg:px-16">
          <div>
            <h2 className="font-slab text-3xl text-ink sm:text-4xl">Contact Form</h2>
            <p className="mt-4 leading-7 text-neutral-500">
              Please fill in the form below to contact us online. Your email app will open with your message ready to send.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div>
                <label htmlFor="contact-name" className="mb-2 block font-slab text-lg text-neutral-600">
                  Your Name <span className="text-sm">(required)</span>
                </label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className="w-full rounded-full border border-neutral-300 bg-white px-5 py-3.5 outline-none transition focus:border-[#399be2] focus:ring-2 focus:ring-[#399be2]/20"
                />
              </div>

              <div>
                <label htmlFor="contact-email" className="mb-2 block font-slab text-lg text-neutral-600">
                  Your Email <span className="text-sm">(required)</span>
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full rounded-full border border-neutral-300 bg-white px-5 py-3.5 outline-none transition focus:border-[#399be2] focus:ring-2 focus:ring-[#399be2]/20"
                />
              </div>

              <div>
                <label htmlFor="contact-subject" className="mb-2 block font-slab text-lg text-neutral-600">
                  Subject
                </label>
                <input
                  id="contact-subject"
                  name="subject"
                  type="text"
                  className="w-full rounded-full border border-neutral-300 bg-white px-5 py-3.5 outline-none transition focus:border-[#399be2] focus:ring-2 focus:ring-[#399be2]/20"
                />
              </div>

              <div>
                <label htmlFor="contact-message" className="mb-2 block font-slab text-lg text-neutral-600">
                  Your Message <span className="text-sm">(required)</span>
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows="7"
                  required
                  className="w-full resize-y rounded-xl border border-neutral-300 bg-white px-5 py-4 outline-none transition focus:border-[#399be2] focus:ring-2 focus:ring-[#399be2]/20"
                />
              </div>

              <button
                type="submit"
                className="min-w-40 rounded-full bg-[#399be2] px-8 py-3.5 font-slab font-bold text-white transition-colors hover:bg-[#2588d0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#399be2]"
              >
                Send
              </button>
              {submitted && (
                <p role="status" className="text-sm text-neutral-600">
                  Your email app should open with the message. Please send it there to complete your enquiry.
                </p>
              )}
            </form>
          </div>

          <aside>
            <h2 className="font-slab text-2xl text-ink sm:text-3xl">Before Contacting Us</h2>
            <p className="mt-4 leading-7 text-neutral-500">
              For enquiries about admissions, subjects or school life, please include a few details in your message
              so our team can direct it to the right person.
            </p>

            <h2 className="mt-10 font-slab text-2xl text-ink sm:text-3xl">Contact Info</h2>
            <ul className="mt-5 divide-y divide-neutral-200">
              {CONTACT_DETAILS.map(({ label, value, href, icon }) => (
                <li key={label} className="flex items-center gap-4 py-5 text-neutral-500">
                  <ContactIcon name={icon} />
                  {href ? (
                    <a href={href} className="break-all hover:text-[#399be2]">{value}</a>
                  ) : (
                    <span>{value}</span>
                  )}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>
    </>
  )
}
