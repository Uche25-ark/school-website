import { Link } from 'react-router-dom'
import communityImage from '../../assets/community.jpg'
import studentsImage from '../../assets/students.jpg'
import parentsImage from '../../assets/parents.jpg'

const STRENGTHS = [
  {
    title: 'Great Teachers',
    text: 'Our teachers help students build confidence, ask questions and make steady progress.',
    icon: 'teachers',
  },
  {
    title: 'Books & Library',
    text: 'Reading, research and independent study help students develop a lifelong love of learning.',
    icon: 'library',
  },
  {
    title: 'Class Schedule',
    text: 'A broad, balanced timetable gives students room to explore different subjects and interests.',
    icon: 'schedule',
  },
  {
    title: 'Certification',
    text: 'Students work towards recognised qualifications and celebrate their achievements.',
    icon: 'certificate',
  },
  {
    title: 'Athletic Programmes',
    text: 'Sport and physical education encourage teamwork, resilience and healthy habits.',
    icon: 'sport',
  },
  {
    title: 'Digital Learning',
    text: 'Technology supports research, creativity and collaboration across the curriculum.',
    icon: 'digital',
  },
]

const LEARNING_STEPS = [
  {
    number: '01',
    title: 'Build strong foundations',
    text: 'Students develop essential knowledge and skills across a broad range of subjects. Lessons encourage curiosity, clear thinking and confidence, while giving every student the opportunity to ask questions, practise new ideas and make steady progress. Teachers provide guidance and feedback so students can understand what they do well and what to work on next.',
    image: studentsImage,
    alt: 'Students participating in a classroom lesson',
  },
  {
    number: '02',
    title: 'Discover interests',
    text: 'Lessons and enrichment activities help students explore their strengths and interests. By trying different subjects and taking part in school life, students can discover what motivates them and where their talents lie. This experience helps them make thoughtful choices about the subjects and opportunities they want to pursue.',
    image: communityImage,
    alt: 'The school campus and grounds',
  },
  {
    number: '03',
    title: 'Get the right support',
    text: 'Teachers and families work together to help each student stay engaged and make progress. Regular communication and practical guidance help us understand each learner’s needs. Students are encouraged to ask for help, build good study habits and take an active role in their learning in a supportive environment.',
    image: parentsImage,
    alt: 'A team collaborating around a table',
  },
  {
    number: '04',
    title: 'Prepare for what comes next',
    text: 'Students build the skills and qualifications they need for further study and future opportunities. As they progress, they strengthen their independence, communication and problem-solving skills. These foundations help prepare them for the next stage of education and give them confidence as they consider their future goals.',
    image: '/slides/slide-2.png',
    alt: 'A member of the school community',
  },
]

const FAQS = [
  {
    question: 'What subjects can students study?',
    answer: 'Students study a broad curriculum. Subject availability and options can vary by year group.',
  },
  {
    question: 'How are students supported with their learning?',
    answer: 'Students can speak with their teachers for guidance, feedback and help with their studies.',
  },
  {
    question: 'Are there opportunities beyond the classroom?',
    answer: 'The school offers opportunities to take part in activities, events and experiences beyond lessons.',
  },
  {
    question: 'How can I find out more about a course or subject?',
    answer: 'Contact the school and our team can direct your question to the appropriate department.',
  },
]

function StrengthIcon({ name }) {
  const iconContent = {
    teachers: (
      <>
        <rect x="7" y="3" width="14" height="10" rx="1" />
        <path d="M10 7h8M10 10h5M4 21c0-3 1.5-5 4-5s4 2 4 5M16 16c2.5 0 4 2 4 5" />
        <circle cx="8" cy="14" r="2" />
        <circle cx="17" cy="14" r="2" />
      </>
    ),
    library: (
      <>
        <path d="M4 5c3-1 6-.5 8 1v15c-2-1.5-5-2-8-1zM20 5c-3-1-6-.5-8 1v15c2-1.5 5-2 8-1z" />
        <path d="M7 9h2M7 12h2M15 9h2M15 12h2" />
      </>
    ),
    schedule: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18M8 14h2M14 14h2M8 17h2" />
      </>
    ),
    certificate: (
      <>
        <path d="M4 4h16v13H4zM8 8h8M8 11h5" />
        <circle cx="12" cy="16" r="3" />
        <path d="m10 18-1 4 3-1 3 1-1-4" />
      </>
    ),
    sport: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m8 4 2 5-3 3-4-1M16 4l-2 5 3 3 4-1M7 18l5-3 5 3M10 9h4l2 3-2 3h-4l-2-3z" />
      </>
    ),
    digital: (
      <>
        <rect x="3" y="4" width="18" height="13" rx="1" />
        <path d="M8 21h8M12 17v4M7 8h10M7 11h6" />
        <path d="m15 13 3 2-3 2z" />
      </>
    ),
  }

  return (
    <svg
      viewBox="0 0 24 24"
      className="h-12 w-12 text-[#3498e8]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {iconContent[name]}
    </svg>
  )
}

export default function Academics() {
  return (
    <>
      <section
        className="relative flex min-h-64 items-center justify-center bg-cover bg-center py-16 text-center text-white sm:min-h-80"
        style={{ backgroundImage: `url(${studentsImage})` }}
        aria-labelledby="academics-heading"
      >
        <div className="absolute inset-0 bg-[#101c2a]/60" />
        <div className="relative px-4">
          <h1 id="academics-heading" className="font-slab text-4xl font-bold sm:text-5xl">
            Academics
          </h1>
          <nav aria-label="Breadcrumb" className="mt-2 text-sm font-bold">
            <Link to="/" className="hover:underline">Home</Link>
            <span aria-hidden="true"> / </span>
            <span aria-current="page">Academics</span>
          </nav>
        </div>
      </section>

      <section className="bg-[#f8f8f8] px-4 py-14 sm:px-6 lg:py-16" aria-labelledby="strengths-heading">
        <div className="mx-auto max-w-7xl lg:px-16">
          <div className="text-center">
            <h2 id="strengths-heading" className="font-slab text-3xl text-ink sm:text-4xl">
              Why Choose Our School?
            </h2>
            <p className="mt-2 text-neutral-500">A supportive place to learn, grow and find your strengths</p>
          </div>
          <div className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {STRENGTHS.map(({ title, text, icon }) => (
              <article key={title} className="px-4 text-center">
                <div className="flex justify-center">
                  <StrengthIcon name={icon} />
                </div>
                <h3 className="mt-4 font-slab text-xl text-ink">{title}</h3>
                <p className="mx-auto mt-3 max-w-sm leading-7 text-neutral-500">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        className="relative bg-ink bg-cover bg-center text-white md:bg-fixed"
        style={{ backgroundImage: `url(${communityImage})` }}
        aria-labelledby="academic-stats-heading"
      >
        <div className="absolute inset-0 bg-[#0c2f38]/75" />
        <div className="relative mx-auto max-w-6xl px-4 py-14 text-center sm:px-6 lg:py-16">
          <h2 id="academic-stats-heading" className="font-slab text-2xl sm:text-3xl">
            Learning for a bright future
          </h2>
          <dl className="mt-9 grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
            {[
              ['100%', 'University progression'],
              ['126', 'School staff'],
              ['2,480', 'Students enrolled'],
              ['72', 'Years of experience'],
              ['7,856', 'Happy smiles'],
            ].map(([value, label]) => (
              <div key={label}>
                <dt className="font-slab text-3xl sm:text-4xl">{value}</dt>
                <dd className="mt-2 text-sm">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="bg-[#f8f8f8] px-4 py-14 sm:px-6 lg:py-16" aria-labelledby="learning-journey-heading">
        <div className="mx-auto max-w-[1410px]">
          <div className="mb-10 text-center">
            <h2 id="learning-journey-heading" className="font-slab text-3xl text-ink sm:text-4xl">
              The Learning Journey
            </h2>
            <p className="mt-2 text-neutral-500">Helping every student take their next step</p>
          </div>
          <ol className="space-y-8 lg:space-y-10">
            {LEARNING_STEPS.map(({ number, title, text, image, alt }) => (
              <li key={number} className="grid items-start gap-5 sm:grid-cols-[minmax(240px,0.9fr)_minmax(0,1.9fr)] sm:gap-8 lg:gap-12">
                <img
                  src={image}
                  alt={alt}
                  className="aspect-[1.8/1] w-full object-cover"
                  loading="lazy"
                />
                <div className="min-h-[280px] bg-white px-6 py-8 shadow-sm sm:min-h-[320px] sm:px-8 sm:py-10 lg:min-h-[460px] lg:px-16 lg:py-14">
                  <h3 className="font-slab text-3xl text-[#31b9d4] sm:text-4xl lg:text-5xl">
                    {number}. {title}
                  </h3>
                  <p className="mt-6 max-w-4xl text-base leading-8 text-neutral-500 sm:mt-8 sm:text-lg sm:leading-9 lg:text-[22px]">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-[#f8f8f8] px-4 py-14 sm:px-6 lg:py-16" aria-labelledby="academic-faq-heading">
        <div className="mx-auto max-w-7xl">
          <h2 id="academic-faq-heading" className="text-center font-slab text-4xl text-[#333] sm:text-5xl">
            FAQ
          </h2>
          <div className="mt-10 grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
            <div className="border border-neutral-200">
              {FAQS.map(({ question, answer }, index) => (
                <details
                  key={question}
                  open={index === 0}
                  className="group border-b border-neutral-200 last:border-b-0 open:border-[#399be2] open:bg-[#399be2]"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-5 font-slab text-lg text-ink marker:hidden sm:px-8 sm:py-6 sm:text-xl group-open:text-white">
                    <span>{index + 1}. {question}</span>
                    <span className="shrink-0 text-2xl text-neutral-500 transition-transform group-open:rotate-180 group-open:text-white" aria-hidden="true">⌄</span>
                  </summary>
                  <p className="px-5 pb-6 leading-7 text-neutral-600 group-open:text-white sm:px-8 sm:pb-8">{answer}</p>
                </details>
              ))}
            </div>
            <div className="space-y-10 px-1 text-base leading-8 text-neutral-500 sm:px-2 sm:text-lg">
              <p>
                Want to know more about subjects, courses or the way we support learning? Our team can help you find
                the information you need.
              </p>
              <p>
                For questions about the curriculum or a particular subject, please get in touch with the school.
              </p>
              <Link to="/contact" className="inline-flex font-slab font-bold text-[#3498e8] hover:underline">
                Contact our school
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
