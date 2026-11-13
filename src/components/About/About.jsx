import { Link } from "react-router-dom";
import FeatureTiles from "../Home/Featuretiles.jsx";
import communityImage from "../../assets/community.jpg";
import parentsImage from "../../assets/parents.jpg";

const HISTORY = [
  {
    year: "Our beginnings",
    text: "A commitment to learning, opportunity and a strong school community.",
  },
  {
    year: "Growing together",
    text: "Our students, families and staff have helped shape the school over time.",
  },
  {
    year: "A place to belong",
    text: "A welcoming environment helps every student find their path and potential.",
  },
  {
    year: "Learning for life",
    text: "We continue to prepare young people for the opportunities ahead.",
  },
  {
    year: "Today",
    text: "Our community builds on its shared experience and looks to the future.",
  },
  {
    year: "Tomorrow",
    text: "We remain focused on helping every student learn, grow and succeed.",
  },
];

const TEACHERS = [
  { initials: "TS", subject: "Teaching and learning", color: "bg-[#f76b4a]" },
  { initials: "ST", subject: "Student support", color: "bg-brand" },
  { initials: "SC", subject: "School community", color: "bg-[#3498e8]" },
  { initials: "PA", subject: "Pastoral care", color: "bg-[#31b9d4]" },
];

const CERTIFICATES = [
  "Academic achievement",
  "Learning and progress",
  "Student recognition",
  "School community",
];

function CertificateCard({ title }) {
  return (
    <div className="flex aspect-[1.4/1] items-center justify-center bg-[#e8e5e1] p-3">
      <div className="flex h-full w-full flex-col items-center justify-center border-[5px] border-double border-[#7b8d88] bg-[#fffdf7] p-3 text-center text-[#475b5c] shadow-sm">
        <span className="font-slab text-[10px] uppercase tracking-[0.18em]">
          UC COMMUNICATION
        </span>
        <span className="mt-2 h-px w-3/4 bg-[#9caaa2]" />
        <span className="mt-3 font-slab text-sm sm:text-base">Certificate</span>
        <span className="mt-1 text-[9px] uppercase tracking-wide">
          Sample design
        </span>
        <span className="mt-2 font-slab text-xs sm:text-sm">{title}</span>
        <span
          className="mt-3 h-5 w-5 rounded-full border-2 border-[#bca66c] bg-[#f5edcf]"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

export default function About() {
  return (
    <>
      <section
        className="relative flex min-h-64 items-center justify-center bg-cover bg-center py-16 text-center text-white sm:min-h-80"
        style={{ backgroundImage: `url(${communityImage})` }}
        aria-labelledby="about-heading"
      >
        <div className="absolute inset-0 bg-[#101c2a]/65" />
        <div className="relative px-4">
          <h1
            id="about-heading"
            className="font-slab text-4xl font-bold sm:text-5xl"
          >
            About Us
          </h1>
          <nav aria-label="Breadcrumb" className="mt-2 text-sm font-bold">
            <Link to="/" className="hover:underline">
              Home
            </Link>
            <span aria-hidden="true"> / </span>
            <span aria-current="page">About Us</span>
          </nav>
        </div>
      </section>

      <section
        className="bg-[#f8f8f8] px-4 py-14 sm:px-6 lg:py-16"
        aria-labelledby="history-heading"
      >
        <div className="mx-auto max-w-7xl lg:px-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2
              id="history-heading"
              className="font-slab text-3xl text-ink sm:text-4xl"
            >
              Our School Story
            </h2>
            <p className="mt-4 leading-7 text-neutral-500">
              A community shaped by learning, opportunity and the people who
              make our school what it is.
            </p>
          </div>
          <ol className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {HISTORY.map(({ year, text }, index) => (
              <li key={year} className="border-l-2 border-brand pl-5">
                <span className="font-slab text-2xl text-ink">{year}</span>
                <p className="mt-2 leading-6 text-neutral-500">{text}</p>
                <span className="sr-only">
                  Story point {index + 1} of {HISTORY.length}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <FeatureTiles />

      <section
        className="bg-[#31b9d4] py-12 text-white sm:py-14"
        aria-labelledby="about-stats-heading"
      >
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
          <h2
            id="about-stats-heading"
            className="font-slab text-2xl sm:text-3xl"
          >
            More than 70 Years of Experience
          </h2>
          <dl className="mt-9 grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
            {[
              ["100%", "Passing to Universities"],
              ["126", "People working"],
              ["2,480", "Students enrolled"],
              ["72", "Years of experience"],
              ["7,856", "Happy smiles"],
            ].map(([value, label]) => (
              <div key={label}>
                <dt className="font-slab text-3xl sm:text-4xl">{value}</dt>
                <dd className="mt-2 text-sm">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section
        className="bg-[#f8f8f8] py-14 sm:py-16"
        aria-labelledby="teachers-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-16">
          <div className="text-center">
            <h2
              id="teachers-heading"
              className="font-slab text-3xl text-ink sm:text-4xl"
            >
              Our Teachers
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              Meet Our Professionals
            </p>
          </div>

          <div className="mt-9 grid items-center gap-8 border border-neutral-200 bg-white p-6 shadow-sm md:grid-cols-[1fr_auto] md:p-8">
            <div>
              <h3 className="font-slab text-2xl text-ink">
                A community of dedicated educators
              </h3>
              <p className="mt-2 text-sm font-bold text-[#3498e8]">
                Supporting every student
              </p>
              <p className="mt-4 max-w-3xl leading-7 text-neutral-500">
                Our staff work together to create a supportive environment where
                students can ask questions, build confidence and make progress.
              </p>
            </div>
            <img
              src={parentsImage}
              alt="Colleagues working together in a meeting"
              className="h-40 w-full object-cover md:h-44 md:w-64"
            />
          </div>

          <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-4">
            {TEACHERS.map(({ initials, subject, color }) => (
              <article
                key={subject}
                className="border border-neutral-200 bg-white p-5 text-center shadow-sm"
              >
                <div
                  className={`mx-auto flex h-24 w-24 items-center justify-center rounded-full ${color} font-slab text-2xl font-bold text-white`}
                >
                  {initials}
                </div>
                <h3 className="mt-4 font-slab text-lg text-ink">Our Team</h3>
                <p className="mt-1 text-sm text-[#3498e8]">{subject}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        className="bg-white py-14 sm:py-16"
        aria-labelledby="certificates-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-16">
          <div className="text-center">
            <h2
              id="certificates-heading"
              className="font-slab text-3xl text-ink sm:text-4xl"
            >
              Our Certificates
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              Center for Continuing Education
            </p>
          </div>
          <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-neutral-500">
            Sample certificate designs are shown below; replace them with the
            school’s verified certificates when available.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-4 sm:gap-8">
            {CERTIFICATES.map((title) => (
              <CertificateCard key={title} title={title} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
