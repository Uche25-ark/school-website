import PageHeader from '../PageHeader.jsx'

export default function News() {
  return (
    <>
      <PageHeader title="News" intro="The latest announcements from the school." />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-16">
        <p className="text-neutral-600">Content for this page goes here.</p>
      </section>
    </>
  )
}
