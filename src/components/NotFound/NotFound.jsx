import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 text-center">
      <h1 className="font-slab text-4xl font-bold text-ink">Page not found</h1>
      <p className="mt-3 text-neutral-600">That page doesn't exist or has moved.</p>
      <Link to="/" className="mt-6 inline-block rounded bg-brand px-5 py-2.5 font-bold text-white hover:bg-brand-dark">
        Back to home
      </Link>
    </section>
  )
}
