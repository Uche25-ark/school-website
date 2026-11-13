export default function PageHeader({ title, intro }) {
  return (
    <section className="bg-brand text-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-16">
        <h1 className="font-slab text-3xl font-bold sm:text-4xl">{title}</h1>
        {intro && <p className="mt-2 max-w-2xl text-white/90">{intro}</p>}
      </div>
    </section>
  )
}
