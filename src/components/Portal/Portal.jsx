import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import schoolLogo from '../../assets/uc-visuals-logo.png'
import ProfilePhoto from './ProfilePhoto.jsx'

const DEMO_ACCOUNTS = [
  { role: 'Admin', email: 'admin@school.test', password: 'Admin123!', color: 'bg-violet-100 text-violet-700' },
  { role: 'Teacher', email: 'teacher@school.test', password: 'Teacher123!', color: 'bg-sky-100 text-sky-700' },
  { role: 'Student', email: 'student@school.test', password: 'Student123!', color: 'bg-emerald-100 text-emerald-700' },
]
const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '')

const NAVIGATION = {
  admin: [
    { id: 'overview', label: 'Overview', icon: '⌂' },
    { id: 'profile', label: 'My profile', icon: '◉' },
    { id: 'users', label: 'Manage users', icon: '♙' },
    { id: 'create-account', label: 'Create account', icon: '+' },
    { id: 'form-teachers', label: 'Form teachers', icon: '▣' },
    { id: 'approvals', label: 'Approvals', icon: '✓' },
    { id: 'results', label: 'School results', icon: '▤' },
    { id: 'report-cards', label: 'Report cards', icon: '▧' },
  ],
  teacher: [
    { id: 'overview', label: 'Overview', icon: '⌂' },
    { id: 'profile', label: 'My profile', icon: '◉' },
    { id: 'users', label: 'My students', icon: '♙' },
    { id: 'attendance', label: 'Attendance', icon: '✓' },
    { id: 'assignments', label: 'Assignments', icon: '▧' },
    { id: 'assessments', label: 'Assessments', icon: '◉' },
    { id: 'exams', label: 'Exams', icon: '✎' },
    { id: 'results', label: 'Results', icon: '▤' },
    { id: 'report-cards', label: 'Report cards', icon: '▧' },
  ],
  student: [
    { id: 'overview', label: 'Overview', icon: '⌂' },
    { id: 'profile', label: 'My profile', icon: '◉' },
    { id: 'assignments', label: 'My assignments', icon: '▧' },
    { id: 'assessments', label: 'My assessments', icon: '◉' },
    { id: 'exams', label: 'Exams & tests', icon: '✎' },
    { id: 'results', label: 'My results', icon: '▤' },
    { id: 'report-cards', label: 'My report cards', icon: '▧' },
  ],
}

async function request(path, { token, ...options } = {}) {
  let response
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { 'content-type': 'application/json' } : {}),
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    })
  } catch {
    throw new Error('Cannot reach the portal server. Check the API URL and backend deployment.')
  }
  let result
  try {
    result = await response.json()
  } catch {
    throw new Error('The portal server returned an invalid response. Check the API URL and backend deployment.')
  }
  if (!response.ok) throw new Error(result.error || 'Something went wrong. Please try again.')
  return result
}

async function uploadProfilePhoto(token, userId, file) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error('Choose a JPG, PNG, or WebP image.')
  }
  if (file.size > 700 * 1024) {
    throw new Error('Profile photos must be 700 KB or smaller.')
  }
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('The selected photo could not be read.'))
    reader.readAsDataURL(file)
  })
  return request(`/api/users/${encodeURIComponent(userId)}/profile-photo`, {
    token,
    method: 'POST',
    body: JSON.stringify({ dataUrl }),
  })
}

function useAttemptExit({ attemptId, endpoint, token, answers, registerAttemptSubmit, submit, completedRef }) {
  const answersRef = useRef(answers)
  const submitRef = useRef(submit)

  useEffect(() => {
    answersRef.current = answers
  }, [answers])

  useEffect(() => {
    submitRef.current = submit
  }, [submit])

  useEffect(() => {
    if (!attemptId) {
      registerAttemptSubmit(null)
      return undefined
    }

    const submitOnLeave = () => {
      if (completedRef.current) return
      completedRef.current = true
      void fetch(endpoint, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ answers: answersRef.current }),
        keepalive: true,
      }).catch((error) => console.error('Unable to submit the active school work on page exit:', error))
    }

    registerAttemptSubmit(() => submitRef.current())
    window.addEventListener('pagehide', submitOnLeave)
    return () => {
      window.removeEventListener('pagehide', submitOnLeave)
      registerAttemptSubmit(null)
      submitOnLeave()
    }
  }, [attemptId, completedRef, endpoint, registerAttemptSubmit, token])
}

function useCurrentTime() {
  const [now, setNow] = useState(0)

  useEffect(() => {
    const updateTime = () => setNow(Date.now())
    updateTime()
    const intervalId = window.setInterval(updateTime, 1000)
    return () => window.clearInterval(intervalId)
  }, [])

  return now
}

function formatDate(value) {
  if (!value) return '—'
  return new Date(`${value.slice(0, 10)}T12:00:00`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function getToday() {
  return new Date().toISOString().slice(0, 10)
}

function downloadCsv(filename, headers, rows) {
  const escapeCell = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`
  const csv = [headers, ...rows].map((row) => row.map(escapeCell).join(',')).join('\r\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function PaginationControls({ page, pageCount, onPageChange, pageSize, onPageSizeChange, total }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-4">
      <div className="flex items-center gap-3 text-sm text-slate-500">
        <span>{total ? `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)} of ${total}` : '0 accounts'}</span>
        <label className="flex items-center gap-2">Rows
          <select value={pageSize} onChange={(event) => onPageSizeChange(Number(event.target.value))} className="rounded-lg border border-slate-200 px-2 py-1">
            {[10, 25, 50].map((size) => <option key={size} value={size}>{size}</option>)}
          </select>
        </label>
      </div>
      <div className="flex items-center gap-2">
        <button type="button" disabled={page <= 1} onClick={() => onPageChange(page - 1)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600 disabled:opacity-40">Previous</button>
        <span className="text-sm text-slate-500">Page {page} of {pageCount}</span>
        <button type="button" disabled={page >= pageCount} onClick={() => onPageChange(page + 1)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600 disabled:opacity-40">Next</button>
      </div>
    </div>
  )
}

function StatCard({ label, value, note, icon, tint = 'bg-emerald-50 text-emerald-700' }) {
  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
          {note && <p className="mt-1 text-xs text-slate-400">{note}</p>}
        </div>
        <span className={`flex h-11 w-11 items-center justify-center rounded-xl text-lg font-bold ${tint}`} aria-hidden="true">{icon}</span>
      </div>
    </article>
  )
}

function EmptyState({ children }) {
  return <div className="rounded-xl border border-dashed border-slate-200 bg-white px-5 py-10 text-center text-sm text-slate-500">{children}</div>
}

function PortalHeader({ user, token, photoVersion, onSignOut }) {
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [passwordError, setPasswordError] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')
  const [passwordBusy, setPasswordBusy] = useState(false)

  function closePasswordDialog() {
    setPasswordDialogOpen(false)
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    setPasswordError('')
    setPasswordMessage('')
  }

  async function changePassword(event) {
    event.preventDefault()
    setPasswordError('')
    setPasswordMessage('')
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('The new passwords do not match.')
      return
    }

    setPasswordBusy(true)
    try {
      await request('/api/account/password', {
        token,
        method: 'POST',
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      })
      setPasswordMessage('Your password has been changed.')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (changeError) {
      setPasswordError(changeError.message)
    } finally {
      setPasswordBusy(false)
    }
  }

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-4 sm:px-7 lg:px-10">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-[#101c2a] p-0.5" aria-label="School home">
              <img src={schoolLogo} alt="" className="h-full w-full object-contain" />
            </Link>
            <div>
              <p className="font-slab text-base font-bold text-slate-900">UC COMMUNICATION</p>
              <p className="text-[11px] font-medium tracking-wide text-slate-400">SCHOOL PORTAL</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-800">{user.name}</p>
              <p className="text-xs capitalize text-slate-500">{user.role}{user.className ? ` · ${user.className}` : ''}{user.subject ? ` · ${user.subject}` : ''}</p>
            </div>
            <ProfilePhoto token={token} userId={user.id} name={user.name} refreshKey={photoVersion} className="h-10 w-10" />
            {['admin', 'teacher', 'student'].includes(user.role) && <button onClick={() => { setPasswordDialogOpen(true); setPasswordError(''); setPasswordMessage('') }} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"><span className="sm:hidden">Password</span><span className="hidden sm:inline">Change password</span></button>}
            <button onClick={onSignOut} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600">
              Sign out
            </button>
          </div>
        </div>
      </header>
      {passwordDialogOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
        <section role="dialog" aria-modal="true" aria-labelledby="change-password-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="change-password-title" className="font-slab text-xl font-bold text-slate-900">Change password</h2>
              <p className="mt-1 text-sm text-slate-500">Choose a new password with at least 8 characters.</p>
            </div>
            <button type="button" onClick={closePasswordDialog} aria-label="Close change password form" className="rounded-lg px-2 py-1 text-xl text-slate-500 hover:bg-slate-100">×</button>
          </div>
          <form onSubmit={changePassword} className="mt-5 space-y-4">
            <label className="block text-sm font-semibold text-slate-700">Current password<input required maxLength="100" autoComplete="current-password" type="password" value={passwordForm.currentPassword} onChange={(event) => setPasswordForm({ ...passwordForm, currentPassword: event.target.value })} className="portal-input" /></label>
            <label className="block text-sm font-semibold text-slate-700">New password<input required minLength="8" maxLength="100" autoComplete="new-password" type="password" value={passwordForm.newPassword} onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })} className="portal-input" /></label>
            <label className="block text-sm font-semibold text-slate-700">Confirm new password<input required minLength="8" maxLength="100" autoComplete="new-password" type="password" value={passwordForm.confirmPassword} onChange={(event) => setPasswordForm({ ...passwordForm, confirmPassword: event.target.value })} className="portal-input" /></label>
            {passwordError && <p role="alert" className="text-sm text-rose-700">{passwordError}</p>}
            {passwordMessage && <p role="status" className="text-sm text-emerald-700">{passwordMessage}</p>}
            <div className="flex justify-end gap-3">
              <button type="button" onClick={closePasswordDialog} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
              <button disabled={passwordBusy} className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-800 disabled:opacity-60">{passwordBusy ? 'Saving…' : 'Save password'}</button>
            </div>
          </form>
        </section>
      </div>}
    </>
  )
}

function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      await onLogin(email, password)
    } catch (loginError) {
      setError(loginError.message)
    } finally {
      setBusy(false)
    }
  }

  function chooseAccount(account) {
    setEmail(account.email)
    setPassword(account.password)
    setError('')
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb]">
      <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-12 px-4 py-10 md:grid-cols-[1.05fr_.95fr] md:px-8">
        <section className="hidden md:block">
          <Link to="/" className="inline-flex items-center gap-3 text-slate-900">
            <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-[#101c2a] p-0.5">
              <img src={schoolLogo} alt="" className="h-full w-full object-contain" />
            </span>
            <span className="font-slab text-xl font-bold">UC COMMUNICATION</span>
          </Link>
          <p className="mt-20 text-sm font-bold uppercase tracking-[.22em] text-emerald-700">Learning together</p>
          <h1 className="mt-4 max-w-lg font-slab text-5xl font-bold leading-tight text-slate-900">Your school day, all in one place.</h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-slate-500">A secure space for school staff, teachers and students to stay connected with learning.</p>
          <div className="mt-12 flex items-center gap-3 text-sm text-slate-500">
            <span className="flex -space-x-2">
              {['A', 'T', 'S'].map((letter, index) => <span key={letter} className={`flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#f5f7fb] font-bold text-white ${['bg-violet-500', 'bg-sky-500', 'bg-emerald-500'][index]}`}>{letter}</span>)}
            </span>
            <span>One portal for the whole school community</span>
          </div>
        </section>

        <section className="mx-auto w-full max-w-md">
          <div className="mb-8 text-center md:hidden">
            <span className="mx-auto flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-[#101c2a] p-0.5">
              <img src={schoolLogo} alt="" className="h-full w-full object-contain" />
            </span>
            <h1 className="mt-3 font-slab text-xl font-bold text-slate-900">UC COMMUNICATION</h1>
          </div>
          <div className="rounded-3xl border border-slate-100 bg-white p-7 shadow-xl shadow-slate-200/60 sm:p-9">
            <div className="mb-7">
              <p className="text-sm font-semibold text-emerald-700">Welcome back</p>
              <h2 className="mt-2 font-slab text-3xl font-bold text-slate-900">Sign in to your portal</h2>
              <p className="mt-2 text-sm text-slate-500">Use the account details provided by your school.</p>
            </div>
            <form onSubmit={submit} className="space-y-4">
              <label className="block text-sm font-semibold text-slate-700">
                Email address
                <input required autoComplete="username" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50" placeholder="you@school.com" />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Password
                <input required autoComplete="current-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50" placeholder="Enter your password" />
              </label>
              {error && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
              <button disabled={busy} className="w-full rounded-xl bg-slate-900 px-4 py-3.5 font-bold text-white transition hover:bg-slate-700 disabled:cursor-wait disabled:opacity-60">
                {busy ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
           
          </div>
          <Link to="/" className="mt-5 block text-center text-sm font-semibold text-slate-500 hover:text-slate-800">← Back to school website</Link>
        </section>
      </div>
    </main>
  )
}

function SectionTitle({ eyebrow, title, action }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow && <p className="text-xs font-bold uppercase tracking-[.16em] text-emerald-700">{eyebrow}</p>}
        <h1 className="mt-1 font-slab text-2xl font-bold text-slate-900 sm:text-3xl">{title}</h1>
      </div>
      {action}
    </div>
  )
}

function Panel({ title, children, action }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      {(title || action) && <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4"><h2 className="font-slab font-bold text-slate-800">{title}</h2>{action}</div>}
      {children}
    </section>
  )
}

function Overview({ user, data, setSection }) {
  const pendingAssignments = data.assignments.length
  const studentCount = data.students.length
  const completedResults = data.results.length
  const stats = user.role === 'admin'
    ? [
        { label: 'School accounts', value: data.users.length, note: 'Across all roles', icon: '♙', tint: 'bg-violet-50 text-violet-700' },
        { label: 'Teachers', value: data.users.filter((item) => item.role === 'teacher').length, note: 'Active accounts', icon: '▣', tint: 'bg-sky-50 text-sky-700' },
        { label: 'Students', value: data.users.filter((item) => item.role === 'student').length, note: 'Registered learners', icon: '♧' },
        { label: 'Recorded results', value: completedResults, note: 'Exam submissions', icon: '▤', tint: 'bg-amber-50 text-amber-700' },
      ]
    : user.role === 'teacher'
      ? [
          { label: 'Students in class', value: studentCount, note: user.className || 'Your class', icon: '♙', tint: 'bg-sky-50 text-sky-700' },
          { label: 'Assignments', value: pendingAssignments, note: 'Shared with your class', icon: '▧' },
          { label: 'Exams & tests', value: data.exams.length, note: 'Available in your class', icon: '✎', tint: 'bg-amber-50 text-amber-700' },
          { label: 'Results recorded', value: completedResults, note: 'Student submissions', icon: '▤', tint: 'bg-violet-50 text-violet-700' },
        ]
      : [
          { label: 'Assignments', value: pendingAssignments, note: 'Shared with your class', icon: '▧' },
          { label: 'Available exams', value: data.exams.length, note: 'Ready to take', icon: '✎', tint: 'bg-amber-50 text-amber-700' },
          { label: 'Results recorded', value: completedResults, note: 'Your saved scores', icon: '▤', tint: 'bg-violet-50 text-violet-700' },
        ]
  const greeting = user.name.split(' ')[0]
  return (
    <>
      <SectionTitle eyebrow={`Good to see you, ${greeting}`} title="Your dashboard" />
      <div className={`grid gap-4 sm:grid-cols-2 ${stats.length === 3 ? 'xl:grid-cols-3' : 'xl:grid-cols-4'}`}>
        {stats.map((stat) => <StatCard key={stat.label} {...stat} />)}
      </div>
      <div className="mt-6 grid gap-5 xl:grid-cols-[1.35fr_.8fr]">
        <Panel title={user.role === 'student' ? 'Your next steps' : 'Recent activity'}>
          {user.role === 'student' ? (
            <div className="divide-y divide-slate-100">
              {data.assignments.slice(0, 3).map((assignment) => <div key={assignment.id} className="flex items-center justify-between gap-3 px-5 py-4"><div><p className="font-semibold text-slate-800">{assignment.title}</p><p className="mt-1 text-xs text-slate-500">Due {formatDate(assignment.dueDate)}</p></div><button onClick={() => setSection('assignments')} className="text-sm font-bold text-emerald-700">View</button></div>)}
              {!data.assignments.length && <div className="p-5 text-sm text-slate-500">You are all caught up. New classwork will appear here.</div>}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {data.assignments.slice(0, 3).map((assignment) => <div key={assignment.id} className="flex items-center justify-between gap-3 px-5 py-4"><div><p className="font-semibold text-slate-800">{assignment.title}</p><p className="mt-1 text-xs text-slate-500">{assignment.className} · due {formatDate(assignment.dueDate)}</p></div><button onClick={() => setSection(user.role === 'admin' ? 'users' : 'assignments')} className="text-sm font-bold text-emerald-700">{user.role === 'admin' ? 'Manage' : 'Open'}</button></div>)}
              {!data.assignments.length && <div className="p-5 text-sm text-slate-500">Activity will appear here as teachers add classwork.</div>}
            </div>
          )}
        </Panel>
        <div className="rounded-2xl bg-slate-900 p-6 text-white">
          <p className="text-xs font-bold uppercase tracking-[.16em] text-emerald-300">{user.role === 'admin' ? 'School overview' : user.role === 'teacher' ? 'Classroom tools' : 'Your learning'}</p>
          <h2 className="mt-3 font-slab text-xl font-bold">{user.role === 'admin' ? 'Keep your school connected.' : user.role === 'teacher' ? 'Everything ready for class.' : 'Make today count.'}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">{user.role === 'admin' ? 'Manage accounts and review saved student results from one secure place.' : user.role === 'teacher' ? 'Record attendance, share classwork, and create auto-marked quizzes.' : 'Find assignments, take class quizzes, and check your saved results.'}</p>
          <button onClick={() => setSection(user.role === 'admin' ? 'users' : user.role === 'teacher' ? 'attendance' : 'exams')} className="mt-5 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-slate-900 hover:bg-emerald-50">
            {user.role === 'admin' ? 'Manage accounts' : user.role === 'teacher' ? 'Take attendance' : 'View my exams'} <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </>
  )
}

function ProfileSection({ user, token, photoVersion, onPhotoUpdated }) {
  const [photoError, setPhotoError] = useState('')
  const [photoMessage, setPhotoMessage] = useState('')
  const [photoBusy, setPhotoBusy] = useState(false)
  const canUploadPhoto = user.role === 'admin' || user.role === 'teacher'

  async function handlePhotoChange(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setPhotoError('')
    setPhotoMessage('')
    setPhotoBusy(true)
    try {
      const result = await uploadProfilePhoto(token, user.id, file)
      if (result.approval) {
        setPhotoMessage('Your profile photo request was submitted for admin approval.')
      } else {
        onPhotoUpdated()
        setPhotoMessage('Your profile photo has been updated.')
      }
    } catch (uploadError) {
      setPhotoError(uploadError.message)
    } finally {
      setPhotoBusy(false)
    }
  }

  return (
    <>
      <SectionTitle eyebrow="Account" title="My profile" />
      <div className="grid items-start gap-5 lg:grid-cols-[.8fr_1.2fr]">
        <Panel title="Profile photo">
          <div className="flex flex-col items-center gap-4 p-6 text-center">
            <ProfilePhoto token={token} userId={user.id} name={user.name} refreshKey={photoVersion} className="h-28 w-28 text-2xl" />
            <div>
              <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
              <p className="mt-1 text-sm capitalize text-slate-500">{user.role}</p>
            </div>
            {canUploadPhoto
              ? <label className="cursor-pointer rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-700">{photoBusy ? 'Uploading…' : 'Upload profile photo'}<input type="file" accept="image/jpeg,image/png,image/webp" disabled={photoBusy} onChange={(event) => void handlePhotoChange(event)} className="sr-only" /></label>
              : <p className="text-sm text-slate-500">Ask an administrator or teacher to upload or change your profile photo.</p>}
            <p className="text-xs text-slate-400">JPG, PNG, or WebP · maximum 700 KB</p>
            {photoError && <p role="alert" className="text-sm text-rose-700">{photoError}</p>}
            {photoMessage && <p role="status" className="text-sm text-emerald-700">{photoMessage}</p>}
          </div>
        </Panel>
        <Panel title="Account information">
          <dl className="divide-y divide-slate-100">
            <div className="grid gap-1 px-5 py-4 sm:grid-cols-[150px_1fr]"><dt className="text-sm font-semibold text-slate-500">Full name</dt><dd className="text-sm text-slate-800">{user.name}</dd></div>
            <div className="grid gap-1 px-5 py-4 sm:grid-cols-[150px_1fr]"><dt className="text-sm font-semibold text-slate-500">Email address</dt><dd className="text-sm text-slate-800">{user.email}</dd></div>
            <div className="grid gap-1 px-5 py-4 sm:grid-cols-[150px_1fr]"><dt className="text-sm font-semibold text-slate-500">Account type</dt><dd className="text-sm capitalize text-slate-800">{user.role}</dd></div>
            {user.className && <div className="grid gap-1 px-5 py-4 sm:grid-cols-[150px_1fr]"><dt className="text-sm font-semibold text-slate-500">Class</dt><dd className="text-sm text-slate-800">{user.className}</dd></div>}
            {user.subject && <div className="grid gap-1 px-5 py-4 sm:grid-cols-[150px_1fr]"><dt className="text-sm font-semibold text-slate-500">Subject</dt><dd className="text-sm text-slate-800">{user.subject}</dd></div>}
            {user.role === 'teacher' && <div className="grid gap-1 px-5 py-4 sm:grid-cols-[150px_1fr]"><dt className="text-sm font-semibold text-slate-500">Form-teacher role</dt><dd className="text-sm text-slate-800">{user.isFormTeacher ? 'Assigned' : 'Not assigned'}</dd></div>}
            {user.role === 'teacher' && user.formTeacherClassNames?.length > 0 && <div className="grid gap-1 px-5 py-4 sm:grid-cols-[150px_1fr]"><dt className="text-sm font-semibold text-slate-500">Form-teacher classes</dt><dd className="text-sm text-slate-800">{user.formTeacherClassNames.join(', ')}</dd></div>}
          </dl>
        </Panel>
      </div>
    </>
  )
}

function CreateAccountSection({ data, user, token, onRefresh, onBack }) {
  const isAdmin = user.role === 'admin'
  const allowedClasses = [...new Set([user.className, ...(user.formTeacherClassNames || [])].filter(Boolean))]
  const allClasses = [...new Set([
    ...data.students.map((student) => student.className),
    ...data.users.map((account) => account.className),
  ].filter(Boolean))]
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'student',
    className: user.role === 'teacher' ? allowedClasses[0] || '' : '',
    subject: '',
    password: '',
    gender: '',
    dateOfBirth: '',
    dateJoined: getToday(),
  })
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  async function createAccount(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    setBusy(true)
    try {
      const result = await request('/api/users', { token, method: 'POST', body: JSON.stringify(form) })
      if (result.approval) {
        setMessage('Student account request submitted for admin approval.')
      } else {
        setMessage('Account created successfully.')
        await onRefresh()
      }
      setForm({ ...form, name: '', email: '', password: '', gender: '', dateOfBirth: '', dateJoined: getToday() })
    } catch (createError) {
      setError(createError.message)
    } finally {
      setBusy(false)
    }
  }

  const canCreateStudent = isAdmin || (user.role === 'teacher' && user.isFormTeacher)
  const invalidTeacherClass = user.role === 'teacher' && !allowedClasses.includes(form.className)

  return (
    <>
      <SectionTitle
        eyebrow={isAdmin ? 'Administration' : 'Form teacher'}
        title="Create account"
        action={<button type="button" onClick={onBack} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-white">Back</button>}
      />
      {!canCreateStudent ? <EmptyState>Only an admin or a designated form teacher can create student accounts.</EmptyState> : (
        <Panel title={isAdmin ? 'New school account' : 'Request a student account'}>
          <form onSubmit={createAccount} className="grid gap-4 p-5 md:grid-cols-2">
            <label className="block text-sm font-semibold text-slate-700">Full name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="portal-input" placeholder="Full name" /></label>
            <label className="block text-sm font-semibold text-slate-700">Email address<input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="portal-input" placeholder="name@school.com" /></label>
            {isAdmin && <label className="block text-sm font-semibold text-slate-700">Role<select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} className="portal-input"><option value="student">Student</option><option value="teacher">Teacher</option></select></label>}
            <label className="block text-sm font-semibold text-slate-700">Class
              {user.role === 'teacher'
                ? <select required value={form.className} onChange={(event) => setForm({ ...form, className: event.target.value })} className="portal-input">{allowedClasses.map((className) => <option key={className} value={className}>{className}</option>)}</select>
                : <input required value={form.className} onChange={(event) => setForm({ ...form, className: event.target.value })} list="portal-create-classes" className="portal-input" placeholder="Class name" />}
            </label>
            {isAdmin && <datalist id="portal-create-classes">{allClasses.map((className) => <option key={className} value={className} />)}</datalist>}
            {form.role === 'teacher' && <label className="block text-sm font-semibold text-slate-700">Teaching subject<input required value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} className="portal-input" placeholder="e.g. Mathematics" /></label>}
            {form.role === 'student' && <>
              <label className="block text-sm font-semibold text-slate-700">Gender<select required value={form.gender} onChange={(event) => setForm({ ...form, gender: event.target.value })} className="portal-input"><option value="" disabled>Select gender</option><option value="male">Male</option><option value="female">Female</option></select></label>
              <label className="block text-sm font-semibold text-slate-700">Date of birth<input required type="date" value={form.dateOfBirth} onChange={(event) => setForm({ ...form, dateOfBirth: event.target.value })} className="portal-input" /></label>
              <label className="block text-sm font-semibold text-slate-700">Date joined<input required type="date" value={form.dateJoined} onChange={(event) => setForm({ ...form, dateJoined: event.target.value })} className="portal-input" /></label>
            </>}
            <label className="block text-sm font-semibold text-slate-700">Temporary password<input required minLength="8" maxLength="100" type="password" autoComplete="new-password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="portal-input" placeholder="At least 8 characters" /></label>
            {user.role === 'teacher' && <p className="text-sm leading-6 text-slate-500 md:col-span-2">Student account requests are reviewed by an administrator before the account is created.</p>}
            {error && <p role="alert" className="text-sm text-rose-700 md:col-span-2">{error}</p>}
            {message && <p role="status" className="text-sm text-emerald-700 md:col-span-2">{message}</p>}
            <div className="md:col-span-2"><button disabled={busy || invalidTeacherClass || (user.role === 'teacher' && !allowedClasses.length)} className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white disabled:opacity-60">{busy ? 'Submitting…' : user.role === 'teacher' ? 'Request student account' : 'Create account'}</button></div>
          </form>
        </Panel>
      )}
    </>
  )
}

function EditAccountDialog({ account, user, token, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: account.name || '',
    email: account.email || '',
    className: account.className || '',
    subject: account.subject || '',
    gender: account.gender || '',
    dateOfBirth: account.dateOfBirth || '',
    dateJoined: account.dateJoined || '',
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function saveAccount(event) {
    event.preventDefault()
    setError('')
    setBusy(true)
    const body = { name: form.name, email: form.email }
    if (account.role !== 'admin') body.className = form.className
    if (account.role === 'teacher') body.subject = form.subject
    if (account.role === 'student') {
      body.gender = form.gender
      body.dateOfBirth = form.dateOfBirth
      body.dateJoined = form.dateJoined
    }
    try {
      const result = await request(`/api/users/${encodeURIComponent(account.id)}`, {
        token,
        method: 'PUT',
        body: JSON.stringify(body),
      })
      await onSaved(Boolean(result.approval))
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <section role="dialog" aria-modal="true" aria-labelledby="edit-account-title" className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div><h2 id="edit-account-title" className="font-slab text-xl font-bold text-slate-900">Edit account</h2><p className="mt-1 text-sm text-slate-500">{account.name} · {account.role}</p></div>
          <button type="button" onClick={onClose} aria-label="Close edit account form" className="rounded-lg px-2 py-1 text-xl text-slate-500 hover:bg-slate-100">×</button>
        </div>
        <form onSubmit={saveAccount} className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="block text-sm font-semibold text-slate-700">Full name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="portal-input" /></label>
          <label className="block text-sm font-semibold text-slate-700">Email<input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="portal-input" /></label>
          {account.role !== 'admin' && <label className="block text-sm font-semibold text-slate-700">Class<input required value={form.className} onChange={(event) => setForm({ ...form, className: event.target.value })} className="portal-input" /></label>}
          {account.role === 'teacher' && <label className="block text-sm font-semibold text-slate-700">Subject<input required value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} className="portal-input" /></label>}
          {account.role === 'student' && <>
            <label className="block text-sm font-semibold text-slate-700">Gender<select value={form.gender} onChange={(event) => setForm({ ...form, gender: event.target.value })} className="portal-input"><option value="">Not set</option><option value="male">Male</option><option value="female">Female</option></select></label>
            <label className="block text-sm font-semibold text-slate-700">Date of birth<input type="date" value={form.dateOfBirth} onChange={(event) => setForm({ ...form, dateOfBirth: event.target.value })} className="portal-input" /></label>
            <label className="block text-sm font-semibold text-slate-700">Date joined<input type="date" value={form.dateJoined} onChange={(event) => setForm({ ...form, dateJoined: event.target.value })} className="portal-input" /></label>
          </>}
          {user.role === 'teacher' && <p className="text-sm text-slate-500 md:col-span-2">This edit will be sent to an administrator for approval.</p>}
          {error && <p role="alert" className="text-sm text-rose-700 md:col-span-2">{error}</p>}
          <div className="flex justify-end gap-3 md:col-span-2"><button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600">Cancel</button><button disabled={busy} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white disabled:opacity-60">{busy ? 'Saving…' : user.role === 'teacher' ? 'Request edit' : 'Save changes'}</button></div>
        </form>
      </section>
    </div>
  )
}

function UsersSection({ data, user, token, onRefresh, setSection, onPhotoUpdated }) {
  const [sortBy, setSortBy] = useState('number')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [resetPasswords, setResetPasswords] = useState({})
  const [resettingId, setResettingId] = useState('')
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [photoVersions, setPhotoVersions] = useState({})
  const [photoBusyId, setPhotoBusyId] = useState('')
  const [editingAccount, setEditingAccount] = useState(null)
  const [deletingId, setDeletingId] = useState('')

  const numberedUsers = data.users.map((account, index) => ({ ...account, accountNumber: index + 1 }))
  const sortedUsers = [...numberedUsers].sort((a, b) => sortBy === 'number'
    ? a.accountNumber - b.accountNumber
    : String(a[sortBy] || '').localeCompare(String(b[sortBy] || ''), undefined, { numeric: true, sensitivity: 'base' }))
  const pageCount = Math.max(1, Math.ceil(sortedUsers.length / pageSize))
  const activePage = Math.min(page, pageCount)
  const visibleUsers = sortedUsers.slice((activePage - 1) * pageSize, activePage * pageSize)

  async function resetPassword(account) {
    const newPassword = resetPasswords[account.id] || ''
    if (newPassword.length < 8) {
      setError('Enter a temporary password with at least 8 characters.')
      return
    }
    setError('')
    setNotice('')
    setResettingId(account.id)
    try {
      await request(`/api/users/${encodeURIComponent(account.id)}/reset-password`, {
        token,
        method: 'POST',
        body: JSON.stringify({ newPassword }),
      })
      setResetPasswords({ ...resetPasswords, [account.id]: '' })
      setNotice(`Password reset for ${account.name}.`)
    } catch (resetError) {
      setError(resetError.message)
    } finally {
      setResettingId('')
    }
  }

  async function uploadPhoto(account, file) {
    setError('')
    setNotice('')
    setPhotoBusyId(account.id)
    try {
      await uploadProfilePhoto(token, account.id, file)
      setPhotoVersions((versions) => ({ ...versions, [account.id]: (versions[account.id] || 0) + 1 }))
      if (account.id === user.id) onPhotoUpdated()
      setNotice(`Profile photo updated for ${account.name}.`)
    } catch (uploadError) {
      setError(uploadError.message)
    } finally {
      setPhotoBusyId('')
    }
  }

  async function deleteUser(account) {
    if (!window.confirm(`Delete ${account.name}'s account? Existing assessment records will be kept.`)) return
    setError('')
    setNotice('')
    setDeletingId(account.id)
    try {
      await request(`/api/users/${encodeURIComponent(account.id)}`, { token, method: 'DELETE' })
      setNotice(`${account.name}'s account was deleted.`)
      await onRefresh()
    } catch (deleteError) {
      setError(deleteError.message)
    } finally {
      setDeletingId('')
    }
  }

  function exportAccounts() {
    const headers = ['Number', 'Name', 'Email', 'Role', 'Form teacher', 'Class', 'Subject', 'Gender', 'Date of birth', 'Date joined']
    const rows = sortedUsers.map((account) => [
      account.accountNumber,
      account.name,
      account.email,
      account.role,
      account.isFormTeacher ? 'Yes' : 'No',
      account.className,
      account.subject,
      account.gender,
      account.dateOfBirth,
      account.dateJoined,
    ])
    downloadCsv('school-accounts.csv', headers, rows)
  }

  async function accountSaved(isPending) {
    setEditingAccount(null)
    setError('')
    setNotice(isPending ? 'Edit request submitted for admin approval.' : 'Account updated successfully.')
    if (!isPending) await onRefresh()
  }

  return (
    <>
      <SectionTitle eyebrow="Administration" title="All accounts" action={<div className="flex flex-wrap gap-2">
        <button type="button" onClick={exportAccounts} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-white">Download CSV</button>
        <button type="button" onClick={() => setSection('create-account')} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-700">Create account</button>
      </div>} />
      {error && <p role="alert" className="mb-4 text-sm text-rose-700">{error}</p>}
      {notice && <p role="status" className="mb-4 text-sm text-emerald-700">{notice}</p>}
      <Panel title={`${data.users.length} account${data.users.length === 1 ? '' : 's'}`} action={<label className="text-sm font-semibold text-slate-600">Sort by<select value={sortBy} onChange={(event) => { setSortBy(event.target.value); setPage(1) }} className="ml-2 rounded-lg border border-slate-200 px-3 py-2"><option value="number">Number</option><option value="name">Name</option><option value="role">Role</option><option value="className">Class</option></select></label>}>
        {!visibleUsers.length ? <div className="p-5"><EmptyState>No accounts have been created yet.</EmptyState></div> : <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">No.</th><th className="px-4 py-3">Account</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Class</th><th className="px-4 py-3">Gender / DOB</th><th className="px-4 py-3">Joined</th><th className="px-4 py-3">Actions</th></tr></thead>
            <tbody className="divide-y divide-slate-100">{visibleUsers.map((account, index) => <tr key={account.id}>
              <td className="px-4 py-4 font-semibold text-slate-500">{(activePage - 1) * pageSize + index + 1}</td>
              <td className="px-4 py-4"><span className="flex items-center gap-3"><ProfilePhoto token={token} userId={account.id} name={account.name} refreshKey={photoVersions[account.id] || 0} className="h-9 w-9 shrink-0 text-[10px]" /><span className="font-semibold text-slate-800">{account.name}</span></span></td>
              <td className="px-4 py-4 text-slate-500">{account.email}</td>
              <td className="px-4 py-4"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold capitalize text-slate-600">{account.role}</span>{account.role === 'teacher' && account.isFormTeacher && <span className="ml-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-800">Form teacher</span>}</td>
              <td className="px-4 py-4 text-slate-500">{account.className || '—'}{account.subject ? <span className="block text-xs">{account.subject}</span> : null}</td>
              <td className="px-4 py-4 text-slate-500">{account.role === 'student' ? <>{account.gender || '—'}<span className="block text-xs">{account.dateOfBirth || 'DOB not set'}</span></> : '—'}</td>
              <td className="px-4 py-4 text-slate-500">{account.role === 'student' ? account.dateJoined || '—' : '—'}</td>
              <td className="px-4 py-4"><div className="flex min-w-40 flex-col items-start gap-2">
                <button type="button" onClick={() => setEditingAccount(account)} className="text-xs font-bold text-sky-700">Edit account</button>
                <label className="cursor-pointer text-xs font-bold text-emerald-700">{photoBusyId === account.id ? 'Uploading…' : 'Upload photo'}<input type="file" accept="image/jpeg,image/png,image/webp" disabled={photoBusyId === account.id} onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadPhoto(account, file); event.target.value = '' }} className="sr-only" /></label>
                <div className="flex gap-1"><input aria-label={`New password for ${account.name}`} type="password" minLength="8" value={resetPasswords[account.id] || ''} onChange={(event) => setResetPasswords({ ...resetPasswords, [account.id]: event.target.value })} className="w-28 rounded-md border border-slate-200 px-2 py-1 text-xs" placeholder="New password" /><button type="button" disabled={resettingId === account.id} onClick={() => void resetPassword(account)} className="text-xs font-bold text-indigo-700 disabled:opacity-60">{resettingId === account.id ? 'Resetting…' : 'Reset'}</button></div>
                <button type="button" disabled={account.id === user.id || deletingId === account.id} onClick={() => void deleteUser(account)} className="text-xs font-bold text-rose-700 disabled:opacity-40">{deletingId === account.id ? 'Deleting…' : account.id === user.id ? 'Current account' : 'Delete account'}</button>
              </div></td>
            </tr>)}</tbody>
          </table>
        </div>}
        <PaginationControls page={activePage} pageCount={pageCount} onPageChange={setPage} pageSize={pageSize} onPageSizeChange={(size) => { setPageSize(size); setPage(1) }} total={sortedUsers.length} />
      </Panel>
      {editingAccount && <EditAccountDialog account={editingAccount} user={user} token={token} onClose={() => setEditingAccount(null)} onSaved={accountSaved} />}
    </>
  )
}

function StudentsSection({ data, user, token, setSection, onRefresh, onPhotoUpdated }) {
  const [sortBy, setSortBy] = useState('number')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [editingStudent, setEditingStudent] = useState(null)
  const [photoBusyId, setPhotoBusyId] = useState('')
  const [photoVersions, setPhotoVersions] = useState({})
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const numberedStudents = data.students.map((student, index) => ({ ...student, rosterNumber: index + 1 }))
  const sortedStudents = [...numberedStudents].sort((a, b) => sortBy === 'number'
    ? a.rosterNumber - b.rosterNumber
    : String(a[sortBy] || '').localeCompare(String(b[sortBy] || ''), undefined, { numeric: true, sensitivity: 'base' }))
  const pageCount = Math.max(1, Math.ceil(sortedStudents.length / pageSize))
  const activePage = Math.min(page, pageCount)
  const visibleStudents = sortedStudents.slice((activePage - 1) * pageSize, activePage * pageSize)

  async function uploadPhoto(student, file) {
    setError('')
    setNotice('')
    setPhotoBusyId(student.id)
    try {
      const result = await uploadProfilePhoto(token, student.id, file)
      if (result.approval) {
        setNotice(`Photo update for ${student.name} was sent for admin approval.`)
      } else {
        setPhotoVersions((versions) => ({ ...versions, [student.id]: (versions[student.id] || 0) + 1 }))
        if (student.id === user.id) onPhotoUpdated()
        setNotice(`Profile photo updated for ${student.name}.`)
      }
    } catch (uploadError) {
      setError(uploadError.message)
    } finally {
      setPhotoBusyId('')
    }
  }

  async function studentSaved(isPending) {
    setEditingStudent(null)
    setError('')
    setNotice(isPending ? 'Student edit request submitted for admin approval.' : 'Student account updated.')
    if (!isPending) await onRefresh()
  }

  function exportStudents() {
    const headers = ['Number', 'Name', 'Email', 'Class', 'Gender', 'Date of birth', 'Date joined']
    const rows = sortedStudents.map((student) => [
      student.rosterNumber,
      student.name,
      student.email,
      student.className,
      student.gender,
      student.dateOfBirth,
      student.dateJoined,
    ])
    downloadCsv('students-in-assigned-classes.csv', headers, rows)
  }

  return (
    <>
      <SectionTitle eyebrow="Classroom" title="Students in assigned classes" action={<div className="flex flex-wrap gap-2">
        <button type="button" onClick={exportStudents} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-white">Download CSV</button>
        {user.isFormTeacher && <button type="button" onClick={() => setSection('create-account')} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-700">Create student</button>}
      </div>} />
      {error && <p role="alert" className="mb-4 text-sm text-rose-700">{error}</p>}
      {notice && <p role="status" className="mb-4 text-sm text-emerald-700">{notice}</p>}
      <Panel title={`${data.students.length} student${data.students.length === 1 ? '' : 's'}`} action={<label className="text-sm font-semibold text-slate-600">Sort by<select value={sortBy} onChange={(event) => { setSortBy(event.target.value); setPage(1) }} className="ml-2 rounded-lg border border-slate-200 px-3 py-2"><option value="number">Number</option><option value="name">Name</option><option value="className">Class</option><option value="email">Email</option></select></label>}>
        {!visibleStudents.length ? <div className="p-5"><EmptyState>No students are currently assigned to your classes.</EmptyState></div> : <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">No.</th><th className="px-4 py-3">Student</th><th className="px-4 py-3">Class</th><th className="px-4 py-3">Gender</th><th className="px-4 py-3">Date of birth</th><th className="px-4 py-3">Date joined</th><th className="px-4 py-3">Actions</th></tr></thead>
            <tbody className="divide-y divide-slate-100">{visibleStudents.map((student, index) => <tr key={student.id}>
              <td className="px-4 py-4 font-semibold text-slate-500">{(activePage - 1) * pageSize + index + 1}</td>
              <td className="px-4 py-4"><span className="flex items-center gap-3"><ProfilePhoto token={token} userId={student.id} name={student.name} refreshKey={photoVersions[student.id] || 0} className="h-10 w-10 shrink-0 text-xs" /><span><span className="block font-semibold text-slate-800">{student.name}</span><span className="text-xs text-slate-500">{student.email}</span></span></span></td>
              <td className="px-4 py-4 text-slate-600">{student.className}</td>
              <td className="px-4 py-4 capitalize text-slate-600">{student.gender || '—'}</td>
              <td className="px-4 py-4 text-slate-600">{student.dateOfBirth || '—'}</td>
              <td className="px-4 py-4 text-slate-600">{student.dateJoined || '—'}</td>
              <td className="px-4 py-4"><div className="flex gap-3">
                {user.isFormTeacher && <button type="button" onClick={() => setEditingStudent(student)} className="text-xs font-bold text-sky-700">Edit</button>}
                <label className="cursor-pointer text-xs font-bold text-emerald-700">{photoBusyId === student.id ? 'Uploading…' : 'Upload photo'}<input type="file" accept="image/jpeg,image/png,image/webp" disabled={photoBusyId === student.id} onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadPhoto(student, file); event.target.value = '' }} className="sr-only" /></label>
              </div></td>
            </tr>)}</tbody>
          </table>
        </div>}
        <PaginationControls page={activePage} pageCount={pageCount} onPageChange={setPage} pageSize={pageSize} onPageSizeChange={(size) => { setPageSize(size); setPage(1) }} total={sortedStudents.length} />
      </Panel>
      {editingStudent && <EditAccountDialog account={editingStudent} user={user} token={token} onClose={() => setEditingStudent(null)} onSaved={studentSaved} />}
    </>
  )
}

function FormTeachersSection({ data, token, onRefresh }) {
  const teachers = data.users.filter((account) => account.role === 'teacher')
  const classes = [...new Set([
    ...data.students.map((student) => student.className),
    ...data.users.map((account) => account.className),
  ].filter(Boolean))]
  const [teacherId, setTeacherId] = useState(teachers[0]?.id || '')
  const [isFormTeacher, setIsFormTeacher] = useState(teachers[0]?.isFormTeacher || false)
  const [classNames, setClassNames] = useState(teachers[0]?.formTeacherClassNames || [])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const teacher = teachers.find((account) => account.id === teacherId)
  const assignableClasses = classes.filter((className) => className !== teacher?.className)

  function chooseTeacher(id) {
    const nextTeacher = teachers.find((account) => account.id === id)
    setTeacherId(id)
    setIsFormTeacher(Boolean(nextTeacher?.isFormTeacher))
    setClassNames(nextTeacher?.formTeacherClassNames || [])
    setError('')
    setMessage('')
  }

  async function saveAssignments(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    setBusy(true)
    try {
      await request(`/api/users/${encodeURIComponent(teacherId)}/form-teacher-classes`, {
        token,
        method: 'PUT',
        body: JSON.stringify({ isFormTeacher, classNames: isFormTeacher ? classNames : [] }),
      })
      setMessage(isFormTeacher ? 'Form-teacher role and classes saved.' : 'Form-teacher role removed.')
      await onRefresh()
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <SectionTitle eyebrow="Administration" title="Assign form-teacher role" />
      {!teachers.length ? <EmptyState>Create a teacher account before assigning the form-teacher role.</EmptyState> : <Panel title="Form-teacher assignment">
        <form onSubmit={saveAssignments} className="space-y-5 p-5">
          <label className="block text-sm font-semibold text-slate-700">Teacher<select value={teacherId} onChange={(event) => chooseTeacher(event.target.value)} className="portal-input">{teachers.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.className || 'No primary class'}</option>)}</select></label>
          <label className="flex items-start gap-3 rounded-xl border border-slate-200 p-4 text-sm">
            <input type="checkbox" checked={isFormTeacher} onChange={(event) => { setIsFormTeacher(event.target.checked); if (!event.target.checked) setClassNames([]) }} className="mt-1 h-4 w-4 accent-emerald-700" />
            <span><span className="block font-bold text-slate-800">Designate as form teacher</span><span className="mt-1 block text-slate-500">Form teachers can request student account creation and edits. The teacher’s primary class remains accessible independently.</span></span>
          </label>
          {isFormTeacher && <fieldset><legend className="text-sm font-semibold text-slate-700">Additional form-teacher classes</legend>
            {assignableClasses.length ? <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{assignableClasses.map((className) => <label key={className} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"><input type="checkbox" checked={classNames.includes(className)} onChange={(event) => setClassNames(event.target.checked ? [...classNames, className] : classNames.filter((name) => name !== className))} />{className}</label>)}</div> : <p className="mt-2 text-sm text-slate-500">No additional classes are available. The primary class remains included.</p>}
          </fieldset>}
          {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
          {message && <p role="status" className="text-sm text-emerald-700">{message}</p>}
          <button disabled={busy} className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white disabled:opacity-60">{busy ? 'Saving…' : 'Save role and classes'}</button>
        </form>
      </Panel>}
    </>
  )
}

function ApprovalsSection({ token }) {
  const [approvals, setApprovals] = useState([])
  const [filter, setFilter] = useState('pending')
  const [notes, setNotes] = useState({})
  const [busyId, setBusyId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const loadApprovals = useCallback(async () => {
    setError('')
    try {
      const result = await request('/api/approvals', { token })
      setApprovals(result.approvals)
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { void loadApprovals() }, [loadApprovals])

  async function review(approval, decision) {
    setBusyId(approval.id)
    setError('')
    setMessage('')
    try {
      const result = await request(`/api/approvals/${encodeURIComponent(approval.id)}/decision`, {
        token,
        method: 'POST',
        body: JSON.stringify({ decision, note: notes[approval.id] || '' }),
      })
      setMessage(result.approval.status === 'approved'
        ? 'Request approved and applied.'
        : result.approval.status === 'rejected'
          ? 'Request disapproved.'
          : `Request could not be applied: ${result.approval.error}`)
      if (result.approval.status === 'failed') setFilter('all')
      await loadApprovals()
    } catch (reviewError) {
      setError(reviewError.message)
    } finally {
      setBusyId('')
    }
  }

  const visibleApprovals = approvals.filter((approval) => filter === 'all' || approval.status === filter)
  const statusStyles = {
    pending: 'bg-amber-50 text-amber-800',
    processing: 'bg-sky-50 text-sky-800',
    approved: 'bg-emerald-50 text-emerald-800',
    rejected: 'bg-rose-50 text-rose-800',
    failed: 'bg-rose-50 text-rose-800',
  }

  return (
    <>
      <SectionTitle eyebrow="Administration" title="Teacher approvals" action={<div className="flex items-center gap-2">
        <label className="text-sm font-semibold text-slate-600">View<select value={filter} onChange={(event) => setFilter(event.target.value)} className="ml-2 rounded-lg border border-slate-200 px-3 py-2"><option value="pending">Pending</option><option value="all">All requests</option><option value="approved">Approved</option><option value="rejected">Disapproved</option><option value="failed">Failed</option></select></label>
        <button type="button" onClick={() => void loadApprovals()} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600">Refresh</button>
      </div>} />
      {error && <p role="alert" className="mb-4 text-sm text-rose-700">{error}</p>}
      {message && <p role="status" className="mb-4 text-sm text-emerald-700">{message}</p>}
      {loading ? <p className="text-sm text-slate-500">Loading approval requests…</p> : !visibleApprovals.length ? <EmptyState>No {filter === 'all' ? '' : `${filter} `}teacher requests.</EmptyState> : <div className="space-y-4">
        {visibleApprovals.map((approval) => <Panel key={approval.id} title={approval.title} action={<span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${statusStyles[approval.status] || 'bg-slate-100 text-slate-600'}`}>{approval.status}</span>}>
          <div className="space-y-4 p-5">
            <p className="text-sm text-slate-600">Requested by <span className="font-semibold text-slate-800">{approval.actorName}</span>{approval.actorEmail ? ` · ${approval.actorEmail}` : ''} · {new Date(approval.createdAt).toLocaleString()}<span className="mt-1 block text-xs text-slate-400">{approval.method} {approval.path}</span></p>
            <details className="rounded-xl border border-slate-200 p-4">
              <summary className="cursor-pointer text-sm font-semibold text-slate-700">View request details</summary>
              <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-slate-50 p-3 text-xs text-slate-700">{JSON.stringify(approval.body, null, 2)}</pre>
            </details>
            {approval.error && <p role="alert" className="text-sm text-rose-700">{approval.error}</p>}
            {approval.decisionNote && <p className="text-sm text-slate-600">Admin note: {approval.decisionNote}</p>}
            {approval.status === 'pending' && <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-700">Review note (optional)<input value={notes[approval.id] || ''} onChange={(event) => setNotes({ ...notes, [approval.id]: event.target.value })} className="portal-input" placeholder="Reason for approval or disapproval" /></label>
              <div className="flex gap-2"><button type="button" disabled={busyId === approval.id} onClick={() => void review(approval, 'approve')} className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-60">{busyId === approval.id ? 'Reviewing…' : 'Approve'}</button><button type="button" disabled={busyId === approval.id} onClick={() => void review(approval, 'reject')} className="rounded-lg border border-rose-200 px-4 py-2 text-sm font-bold text-rose-700 disabled:opacity-60">Disapprove</button></div>
            </div>}
          </div>
        </Panel>)}
      </div>}
    </>
  )
}

function AttendanceSection({ data, user, token, onRefresh }) {
  const [date, setDate] = useState(getToday)
  const classNames = [...new Set(data.students.map((student) => student.className).filter(Boolean))]
  const [selectedClass, setSelectedClass] = useState(user.className || classNames[0] || '')
  const [attendanceOverrides, setAttendanceOverrides] = useState({})
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const activeClass = classNames.includes(selectedClass) ? selectedClass : classNames[0] || ''
  const classStudents = data.students.filter((student) => student.className === activeClass)
  const canRecordAttendance = user.role === 'admin' || user.className === activeClass
  const todaysAttendance = data.attendance.filter((entry) => entry.date === date && entry.className === activeClass)
  const present = Object.fromEntries(classStudents.map((student) => {
    const recorded = todaysAttendance.find((entry) => entry.studentId === student.id)
    return [student.id, attendanceOverrides[`${date}:${student.id}`] ?? recorded?.present ?? true]
  }))

  async function saveAttendance(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    setBusy(true)
    try {
      const result = await request('/api/attendance', {
        token,
        method: 'POST',
        body: JSON.stringify({
          date,
          className: activeClass,
          entries: classStudents.map((student) => ({ studentId: student.id, present: present[student.id] })),
        }),
      })
      setMessage(result.approval ? 'Attendance request submitted for admin approval.' : 'Attendance saved.')
      await onRefresh()
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <SectionTitle eyebrow="Classroom" title="Take attendance" action={<div className="flex flex-wrap gap-3">
        {classNames.length > 0 && <label className="text-sm font-semibold text-slate-600">Class<select value={activeClass} onChange={(event) => setSelectedClass(event.target.value)} className="ml-2 rounded-lg border border-slate-200 px-3 py-2">{classNames.map((className) => <option key={className}>{className}</option>)}</select></label>}
        <label className="text-sm font-semibold text-slate-600">Date<input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="ml-2 rounded-lg border border-slate-200 px-3 py-2" /></label>
      </div>} />
      <Panel title={`${activeClass || 'Assigned classes'} · ${classStudents.length} students`}>
        {!classStudents.length ? <div className="p-5"><EmptyState>No student accounts have been assigned to this class yet.</EmptyState></div> : canRecordAttendance ? (
          <form onSubmit={saveAttendance}>
            <div className="divide-y divide-slate-100">
              {classStudents.map((student) => <label key={student.id} className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50"><span className="flex items-center gap-3"><ProfilePhoto token={token} userId={student.id} name={student.name} className="h-10 w-10 shrink-0 text-xs" /><span><span className="block font-semibold text-slate-800">{student.name}</span><span className="text-xs text-slate-500">{student.email}</span></span></span><span className="flex items-center gap-3 text-sm"><span className={present[student.id] === false ? 'text-rose-700' : 'text-emerald-700'}>{present[student.id] === false ? 'Absent' : 'Present'}</span><input type="checkbox" checked={present[student.id]} onChange={(event) => setAttendanceOverrides({ ...attendanceOverrides, [`${date}:${student.id}`]: event.target.checked })} className="h-5 w-5 accent-emerald-600" aria-label={`${student.name} present`} /></span></label>)}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-4">
              <div>{error && <p role="alert" className="text-sm text-rose-700">{error}</p>}{message && <p role="status" className="text-sm text-emerald-700">{message}</p>}</div>
              <button disabled={busy} className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-700 disabled:opacity-60">{busy ? 'Saving…' : 'Save attendance'}</button>
            </div>
          </form>
        ) : <div className="divide-y divide-slate-100">
          {classStudents.map((student) => {
            const recorded = todaysAttendance.find((entry) => entry.studentId === student.id)
            return <div key={student.id} className="flex items-center justify-between gap-4 px-5 py-4"><span className="flex items-center gap-3"><ProfilePhoto token={token} userId={student.id} name={student.name} className="h-10 w-10 shrink-0 text-xs" /><span><span className="block font-semibold text-slate-800">{student.name}</span><span className="text-xs text-slate-500">{student.email}</span></span></span><span className={`text-sm font-semibold ${recorded?.present === false ? 'text-rose-700' : recorded?.present === true ? 'text-emerald-700' : 'text-slate-400'}`}>{recorded ? recorded.present ? 'Present' : 'Absent' : 'Not recorded'}</span></div>
          })}
          <p className="px-5 py-4 text-sm text-slate-500">You can view attendance for your assigned form class. Only the class teacher or an admin can record it.</p>
        </div>}
      </Panel>
    </>
  )
}

function AssignmentsSection({ data, user, token, onRefresh, registerAttemptSubmit }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    durationMinutes: 30,
    className: user.className || '',
    subject: user.subject || '',
    questions: [{ text: '', options: ['', '', '', ''], correctIndex: 0 }],
  })
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [activeAssignment, setActiveAssignment] = useState(null)
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(null)
  const [lastSubmission, setLastSubmission] = useState(null)
  const answersRef = useRef(answers)
  const completedRef = useRef(true)
  const submissionPromiseRef = useRef(null)
  const saveAnswersQueueRef = useRef(Promise.resolve())
  const now = useCurrentTime()
  const classNames = [...new Set([...data.students, ...data.users].map((student) => student.className).filter(Boolean))]

  function updateQuestion(questionIndex, changes) {
    setForm({
      ...form,
      questions: form.questions.map((question, index) => index === questionIndex ? { ...question, ...changes } : question),
    })
  }

  async function createAssignment(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    setBusy(true)
    try {
      const result = await request('/api/assignments', {
        token,
        method: 'POST',
        body: JSON.stringify({ ...form, dueDate: new Date(form.dueDate).toISOString() }),
      })
      setMessage(result.approval ? 'Assignment request submitted for admin approval.' : 'Assignment shared with the class.')
      setForm({
        title: '',
        description: '',
        dueDate: '',
        durationMinutes: 30,
        className: user.className || '',
        subject: user.subject || '',
        questions: [{ text: '', options: ['', '', '', ''], correctIndex: 0 }],
      })
      await onRefresh()
    } catch (createError) {
      setError(createError.message)
    } finally {
      setBusy(false)
    }
  }

  async function refreshActivities() {
    setError('')
    setBusy(true)
    try {
      await onRefresh()
      setMessage('Assignments refreshed.')
    } catch (refreshError) {
      setError(refreshError.message)
    } finally {
      setBusy(false)
    }
  }

  const submitAssignment = useCallback(() => {
    if (!activeAssignment) return Promise.resolve(true)
    if (submissionPromiseRef.current) return submissionPromiseRef.current

    const pending = (async () => {
      setError('')
      setBusy(true)
      try {
        const response = await request(`/api/assignments/${activeAssignment.assignment.id}/submit`, {
          token,
          method: 'POST',
          body: JSON.stringify({ answers: answersRef.current }),
        })
        completedRef.current = true
        setLastSubmission(response.submission)
        setActiveAssignment(null)
        setTimeLeft(null)
        void onRefresh().catch((refreshError) => setError(refreshError.message))
        return true
      } catch (submitError) {
        setError(submitError.message)
        return false
      } finally {
        setBusy(false)
      }
    })()
    let tracked
    tracked = pending.finally(() => {
      if (submissionPromiseRef.current === tracked) submissionPromiseRef.current = null
    })
    submissionPromiseRef.current = tracked
    return tracked
  }, [activeAssignment, onRefresh, token])

  useEffect(() => {
    if (!activeAssignment) return undefined
    const updateTime = () => {
      const startedAt = Date.parse(activeAssignment.attempt.startedAt)
      const timerEndsAt = startedAt + activeAssignment.assignment.durationMinutes * 60_000
      const dueAt = Date.parse(activeAssignment.assignment.dueDate)
      const secondsLeft = Math.max(0, Math.ceil((Math.min(timerEndsAt, dueAt) - Date.now()) / 1000))
      setTimeLeft(secondsLeft)
      if (secondsLeft === 0) void submitAssignment()
    }
    updateTime()
    const intervalId = window.setInterval(updateTime, 1000)
    return () => window.clearInterval(intervalId)
  }, [activeAssignment, submitAssignment])

  useAttemptExit({
    attemptId: activeAssignment?.attempt.id,
    endpoint: activeAssignment ? `/api/assignments/${activeAssignment.assignment.id}/submit` : '',
    token,
    answers,
    registerAttemptSubmit,
    submit: submitAssignment,
    completedRef,
  })

  function updateAnswer(questionId, optionIndex) {
    const nextAnswers = { ...answersRef.current, [questionId]: optionIndex }
    answersRef.current = nextAnswers
    setAnswers(nextAnswers)
    saveAnswersQueueRef.current = saveAnswersQueueRef.current
      .then(() => request(`/api/assignments/${activeAssignment.assignment.id}/answers`, {
        token,
        method: 'POST',
        body: JSON.stringify({ answers: nextAnswers }),
      }))
      .catch((saveError) => setError(saveError.message))
  }

  async function startAssignment(assignment) {
    setError('')
    setBusy(true)
    try {
      const response = await request(`/api/assignments/${assignment.id}/start`, { token, method: 'POST' })
      completedRef.current = false
      answersRef.current = {}
      setAnswers({})
      setActiveAssignment({ assignment: response.assignment, attempt: response.attempt })
    } catch (startError) {
      setError(startError.message)
    } finally {
      setBusy(false)
    }
  }

  if (activeAssignment) {
    return (
      <>
        <SectionTitle
          eyebrow={`${activeAssignment.assignment.subject} · timed assignment`}
          title={activeAssignment.assignment.title}
          action={<span className={`rounded-xl px-4 py-2 font-mono text-lg font-bold ${timeLeft < 60 ? 'bg-rose-100 text-rose-700' : 'bg-slate-900 text-white'}`} role="timer" aria-live="polite">{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</span>}
        />
        <p className="mb-5 text-sm text-slate-500">{activeAssignment.assignment.description}</p>
        <form onSubmit={(event) => { event.preventDefault(); void submitAssignment() }} className="space-y-4">
          {activeAssignment.assignment.questions.map((question, index) => (
            <fieldset key={question.id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <legend className="px-1 text-sm font-bold text-slate-800">{index + 1}. {question.text}</legend>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">{question.options.map((option, optionIndex) =>               <label key={`${question.id}-${option}`} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm ${Number(answers[question.id]) === optionIndex ? 'border-emerald-500 bg-emerald-50 text-slate-900' : 'border-slate-200 text-slate-600'}`}><input required type="radio" name={question.id} value={optionIndex} checked={Number(answers[question.id]) === optionIndex} onChange={() => updateAnswer(question.id, optionIndex)} className="accent-emerald-600" />{option}</label>)}</div>
            </fieldset>
          ))}
          {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
          <button disabled={busy || timeLeft === 0} className="rounded-xl bg-slate-900 px-6 py-3 font-bold text-white hover:bg-slate-700 disabled:opacity-60">{busy ? 'Submitting…' : 'Submit assignment'}</button>
        </form>
      </>
    )
  }

  return (
    <>
      <SectionTitle eyebrow={user.role === 'student' ? 'Your classwork' : `Classroom${user.subject ? ` · ${user.subject}` : ''}`} title={user.role === 'student' ? 'My assignments' : 'Assignments'} action={<button type="button" disabled={busy} onClick={() => void refreshActivities()} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 disabled:opacity-50">{busy ? 'Refreshing…' : 'Refresh assignments'}</button>} />
      {user.role === 'student' && message && <p role="status" className="mb-4 text-sm text-emerald-700">{message}</p>}
      {user.role !== 'student' && <Panel title="Create a timed assignment"><form onSubmit={createAssignment} className="grid gap-4 p-5 md:grid-cols-2">
        <label className="block text-sm font-semibold text-slate-700">Assignment title<input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="portal-input" placeholder="e.g. Chapter 4 questions" /></label>
        <label className="block text-sm font-semibold text-slate-700">Class<input required list="assignment-classes" value={form.className} onChange={(event) => setForm({ ...form, className: event.target.value })} className="portal-input" placeholder="Class name" /></label>
        <datalist id="assignment-classes">{classNames.map((className) => <option key={className} value={className} />)}</datalist>
        <label className="block text-sm font-semibold text-slate-700">Subject<input required readOnly={user.role === 'teacher' && Boolean(user.subject)} value={user.subject || form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} className="portal-input read-only:bg-slate-50" placeholder="e.g. Mathematics" /></label>
        <label className="block text-sm font-semibold text-slate-700">Time allowed (minutes)<input required type="number" min="1" max="240" value={form.durationMinutes} onChange={(event) => setForm({ ...form, durationMinutes: Number(event.target.value) })} className="portal-input" /></label>
        <label className="block text-sm font-semibold text-slate-700">Due date and time<input required type="datetime-local" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} className="portal-input" /></label>
        <label className="block text-sm font-semibold text-slate-700 md:col-span-2">Instructions<textarea required rows="2" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="portal-input" placeholder="Tell students what the assignment covers." /></label>
        <div className="space-y-4 md:col-span-2">
          {form.questions.map((question, questionIndex) => <fieldset key={`assignment-question-${questionIndex}`} className="rounded-xl border border-slate-200 p-4">
            <div className="mb-3 flex items-center justify-between gap-3"><legend className="font-bold text-slate-800">Question {questionIndex + 1}</legend>{form.questions.length > 1 && <button type="button" onClick={() => setForm({ ...form, questions: form.questions.filter((_, index) => index !== questionIndex) })} className="text-xs font-semibold text-rose-700">Remove</button>}</div>
            <label className="block text-sm font-semibold text-slate-700">Question text<input required value={question.text} onChange={(event) => updateQuestion(questionIndex, { text: event.target.value })} className="portal-input" /></label>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">{question.options.map((option, optionIndex) => <label key={`answer-${optionIndex}`} className="block text-sm font-semibold text-slate-700"><span className="flex items-center justify-between">Option {optionIndex + 1}<span className="flex items-center gap-1 text-xs font-medium text-slate-500"><input type="radio" name={`assignment-correct-${questionIndex}`} checked={Number(question.correctIndex) === optionIndex} onChange={() => updateQuestion(questionIndex, { correctIndex: optionIndex })} className="accent-emerald-600" /> Correct</span></span><input required value={option} onChange={(event) => updateQuestion(questionIndex, { options: question.options.map((value, index) => index === optionIndex ? event.target.value : value) })} className="portal-input" placeholder={`Answer ${optionIndex + 1}`} /></label>)}</div>
          </fieldset>)}
          <button type="button" onClick={() => setForm({ ...form, questions: [...form.questions, { text: '', options: ['', '', '', ''], correctIndex: 0 }] })} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50">+ Add question</button>
        </div>
        <div className="flex flex-wrap items-center gap-3 md:col-span-2"><button disabled={busy} className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-700 disabled:opacity-60">{busy ? 'Sharing…' : 'Publish assignment'}</button>{error && <p role="alert" className="text-sm text-rose-700">{error}</p>}{message && <p role="status" className="text-sm text-emerald-700">{message}</p>}</div>
      </form></Panel>}
      {user.role === 'student' && error && <p role="alert" className="mb-4 text-sm text-rose-700">{error}</p>}
      {lastSubmission && <div role="status" className="my-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5"><div><p className="font-bold text-emerald-900">Assignment submitted and scored</p><p className="mt-1 text-sm text-emerald-800">{lastSubmission.assignmentTitle}</p></div><span className="rounded-xl bg-white px-4 py-2 text-lg font-bold text-emerald-800">{lastSubmission.score}/{lastSubmission.total}</span></div>}
      <div className={`${user.role !== 'student' ? 'mt-5' : ''} grid gap-4 md:grid-cols-2`}>
        {data.assignments.map((assignment) => {
          const submission = data.assignmentSubmissions.find((item) => item.assignmentId === assignment.id && item.studentId === user.id)
          const attempt = data.assignmentAttempts.find((item) => item.assignmentId === assignment.id)
          const questionCount = assignment.questionCount ?? assignment.questions?.length ?? 0
          const isTimed = questionCount > 0 && assignment.durationMinutes
          return <article key={assignment.id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3"><span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">{assignment.subject || assignment.className}</span><span className="text-xs font-semibold text-slate-500">Due {new Date(assignment.dueDate).toLocaleString()}</span></div>
          <h2 className="mt-4 font-slab text-lg font-bold text-slate-900">{assignment.title}</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-500">{assignment.description}</p>
          {isTimed && user.role === 'student' && (submission
            ? <p className="mt-4 text-sm font-bold text-emerald-700">{submission.missed ? 'Missed deadline' : 'Submitted'} · score {submission.score}/{submission.total}</p>
            : attempt
              ? <p className="mt-4 text-sm font-semibold text-amber-700">Attempt started. It cannot be resumed; it will be submitted automatically when time expires.</p>
              : now >= Date.parse(assignment.dueDate)
                ? <p className="mt-4 text-sm font-bold text-rose-700">Deadline passed · score 0/{questionCount}</p>
                : <button disabled={busy} onClick={() => startAssignment(assignment)} className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50">Start timed assignment · {assignment.durationMinutes} min</button>)}
          {isTimed && user.role !== 'student' && <p className="mt-4 text-sm font-medium text-slate-500">{assignment.durationMinutes} minutes · {questionCount} questions</p>}
        </article>
        })}
        {!data.assignments.length && <EmptyState>No assignments have been shared with {user.className || 'your class'} yet.</EmptyState>}
      </div>
    </>
  )
}

function ExamsSection({ data, user, token, onRefresh, registerAttemptSubmit }) {
  const [form, setForm] = useState({
    title: '',
    className: user.className || '',
    subject: user.subject || '',
    dueDate: '',
    durationMinutes: 30,
    questions: [{ text: '', options: ['', '', '', ''], correctIndex: 0 }],
  })
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [activeExam, setActiveExam] = useState(null)
  const [answers, setAnswers] = useState({})
  const [score, setScore] = useState(null)
  const [timeLeft, setTimeLeft] = useState(null)
  const answersRef = useRef(answers)
  const completedRef = useRef(true)
  const submissionPromiseRef = useRef(null)
  const saveAnswersQueueRef = useRef(Promise.resolve())
  const now = useCurrentTime()
  const classNames = [...new Set([...data.students, ...data.users].map((student) => student.className).filter(Boolean))]

  function updateQuestion(questionIndex, changes) {
    setForm({
      ...form,
      questions: form.questions.map((question, index) => index === questionIndex ? { ...question, ...changes } : question),
    })
  }

  async function createExam(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    setBusy(true)
    try {
      const result = await request('/api/exams', {
        token,
        method: 'POST',
        body: JSON.stringify({
          title: form.title,
          className: form.className,
          subject: form.subject,
          dueDate: new Date(form.dueDate).toISOString(),
          durationMinutes: form.durationMinutes,
          questions: form.questions,
        }),
      })
      setMessage(result.approval ? 'Exam request submitted for admin approval.' : 'Exam published. Students in this class can now take it.')
      setForm({ title: '', className: user.className || '', subject: user.subject || '', dueDate: '', durationMinutes: 30, questions: [{ text: '', options: ['', '', '', ''], correctIndex: 0 }] })
      await onRefresh()
    } catch (createError) {
      setError(createError.message)
    } finally {
      setBusy(false)
    }
  }

  async function refreshActivities() {
    setError('')
    setBusy(true)
    try {
      await onRefresh()
      setMessage('Exams and tests refreshed.')
    } catch (refreshError) {
      setError(refreshError.message)
    } finally {
      setBusy(false)
    }
  }

  const submitExam = useCallback((event) => {
    event?.preventDefault()
    if (!activeExam) return Promise.resolve(true)
    if (submissionPromiseRef.current) return submissionPromiseRef.current

    const pending = (async () => {
      setError('')
      setBusy(true)
      try {
        const response = await request(`/api/exams/${activeExam.exam.id}/submit`, {
          token,
          method: 'POST',
          body: JSON.stringify({ answers: answersRef.current }),
        })
        completedRef.current = true
        setScore(response.result)
        setActiveExam(null)
        setTimeLeft(null)
        void onRefresh().catch((refreshError) => setError(refreshError.message))
        return true
      } catch (submitError) {
        setError(submitError.message)
        return false
      } finally {
        setBusy(false)
      }
    })()
    let tracked
    tracked = pending.finally(() => {
      if (submissionPromiseRef.current === tracked) submissionPromiseRef.current = null
    })
    submissionPromiseRef.current = tracked
    return tracked
  }, [activeExam, onRefresh, token])

  useEffect(() => {
    if (!activeExam) return undefined
    const updateTime = () => {
      const deadline = Date.parse(activeExam.exam.dueDate)
      const timerEndsAt = Date.parse(activeExam.attempt.startedAt) + activeExam.exam.durationMinutes * 60_000
      const secondsLeft = Math.max(0, Math.ceil((Math.min(deadline, timerEndsAt) - Date.now()) / 1000))
      setTimeLeft(secondsLeft)
      if (secondsLeft === 0) void submitExam()
    }
    updateTime()
    const intervalId = window.setInterval(updateTime, 1000)
    return () => window.clearInterval(intervalId)
  }, [activeExam, submitExam])

  useAttemptExit({
    attemptId: activeExam?.attempt.id,
    endpoint: activeExam ? `/api/exams/${activeExam.exam.id}/submit` : '',
    token,
    answers,
    registerAttemptSubmit,
    submit: submitExam,
    completedRef,
  })

  async function startExam(exam) {
    setError('')
    setBusy(true)
    try {
      const response = await request(`/api/exams/${exam.id}/start`, { token, method: 'POST' })
      completedRef.current = false
      answersRef.current = {}
      setAnswers({})
      setActiveExam({ exam: response.exam, attempt: response.attempt })
      setScore(null)
    } catch (startError) {
      setError(startError.message)
    } finally {
      setBusy(false)
    }
  }

  function updateAnswer(questionId, optionIndex) {
    const nextAnswers = { ...answersRef.current, [questionId]: optionIndex }
    answersRef.current = nextAnswers
    setAnswers(nextAnswers)
    saveAnswersQueueRef.current = saveAnswersQueueRef.current
      .then(() => request(`/api/exams/${activeExam.exam.id}/answers`, {
        token,
        method: 'POST',
        body: JSON.stringify({ answers: nextAnswers }),
      }))
      .catch((saveError) => setError(saveError.message))
  }

  if (activeExam) {
    return (
      <>
        <SectionTitle eyebrow="Exams & tests" title={activeExam.exam.title} action={<span className={`rounded-xl px-4 py-2 font-mono text-lg font-bold ${timeLeft < 60 ? 'bg-rose-100 text-rose-700' : 'bg-slate-900 text-white'}`} role="timer" aria-live="polite">{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</span>} />
        <form onSubmit={(event) => { event.preventDefault(); void submitExam() }} className="space-y-4">
          {activeExam.exam.questions.map((question, index) => <fieldset key={question.id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"><legend className="px-1 text-sm font-bold text-slate-800">{index + 1}. {question.text}</legend><div className="mt-3 grid gap-2 sm:grid-cols-2">{question.options.map((option, optionIndex) => <label key={`${question.id}-${option}`} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm ${Number(answers[question.id]) === optionIndex ? 'border-emerald-500 bg-emerald-50 text-slate-900' : 'border-slate-200 text-slate-600'}`}><input required type="radio" name={question.id} value={optionIndex} checked={Number(answers[question.id]) === optionIndex} onChange={() => updateAnswer(question.id, optionIndex)} className="accent-emerald-600" />{option}</label>)}</div></fieldset>)}
          {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
          <button disabled={busy || timeLeft === 0} className="rounded-xl bg-slate-900 px-6 py-3 font-bold text-white hover:bg-slate-700 disabled:opacity-60">{busy ? 'Submitting…' : 'Submit exam'}</button>
        </form>
      </>
    )
  }

  return (
    <>
      <SectionTitle eyebrow={user.role === 'student' ? 'Show what you know' : 'Classroom'} title="Exams & tests" action={<button type="button" disabled={busy} onClick={() => void refreshActivities()} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 disabled:opacity-50">{busy ? 'Refreshing…' : 'Refresh exams & tests'}</button>} />
      {user.role === 'student' && message && <p role="status" className="mb-4 text-sm text-emerald-700">{message}</p>}
      {score && <div role="status" className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5"><div><p className="font-bold text-emerald-900">Your result has been recorded.</p><p className="mt-1 text-sm text-emerald-800">{score.examTitle}</p></div><span className="rounded-xl bg-white px-4 py-2 text-lg font-bold text-emerald-800">{score.score} / {score.total}</span></div>}
      {user.role !== 'student' && <Panel title="Create a multiple-choice exam">
        <form onSubmit={createExam} className="grid gap-4 p-5 md:grid-cols-2">
          <label className="block text-sm font-semibold text-slate-700">Exam title<input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="portal-input" placeholder="e.g. Fractions check-in" /></label>
          <label className="block text-sm font-semibold text-slate-700">Class<input required list="exam-classes" value={form.className} onChange={(event) => setForm({ ...form, className: event.target.value })} className="portal-input" /></label>
          <datalist id="exam-classes">{classNames.map((className) => <option key={className} value={className} />)}</datalist>
          <label className="block text-sm font-semibold text-slate-700 md:col-span-2">Subject<input required readOnly={user.role === 'teacher' && Boolean(user.subject)} value={user.subject || form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} className="portal-input read-only:bg-slate-50" placeholder="e.g. Mathematics" /></label>
          <label className="block text-sm font-semibold text-slate-700">Time allowed (minutes)<input required type="number" min="1" max="240" value={form.durationMinutes} onChange={(event) => setForm({ ...form, durationMinutes: Number(event.target.value) })} className="portal-input" /></label>
          <label className="block text-sm font-semibold text-slate-700">Deadline<input required type="datetime-local" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} className="portal-input" /></label>
          <div className="space-y-4 md:col-span-2">
            {form.questions.map((question, questionIndex) => <fieldset key={`question-${questionIndex}`} className="rounded-xl border border-slate-200 p-4">
              <div className="mb-3 flex items-center justify-between gap-3"><legend className="font-bold text-slate-800">Question {questionIndex + 1}</legend>{form.questions.length > 1 && <button type="button" onClick={() => setForm({ ...form, questions: form.questions.filter((_, index) => index !== questionIndex) })} className="text-xs font-semibold text-rose-700">Remove</button>}</div>
              <label className="block text-sm font-semibold text-slate-700">Question text<input required value={question.text} onChange={(event) => updateQuestion(questionIndex, { text: event.target.value })} className="portal-input" placeholder="Write the question" /></label>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">{question.options.map((option, optionIndex) => <label key={`option-${optionIndex}`} className="block text-sm font-semibold text-slate-700"><span className="flex items-center justify-between">Option {optionIndex + 1}<span className="flex items-center gap-1 text-xs font-medium text-slate-500"><input type="radio" name={`correct-answer-${questionIndex}`} checked={Number(question.correctIndex) === optionIndex} onChange={() => updateQuestion(questionIndex, { correctIndex: optionIndex })} className="accent-emerald-600" /> Correct</span></span><input required value={option} onChange={(event) => updateQuestion(questionIndex, { options: question.options.map((value, index) => index === optionIndex ? event.target.value : value) })} className="portal-input" placeholder={`Answer ${optionIndex + 1}`} /></label>)}</div>
            </fieldset>)}
            <button type="button" onClick={() => setForm({ ...form, questions: [...form.questions, { text: '', options: ['', '', '', ''], correctIndex: 0 }] })} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50">+ Add question</button>
          </div>
          <div className="flex flex-wrap items-center gap-3 md:col-span-2"><button disabled={busy} className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-700 disabled:opacity-60">{busy ? 'Publishing…' : 'Publish exam'}</button>{error && <p role="alert" className="text-sm text-rose-700">{error}</p>}{message && <p role="status" className="text-sm text-emerald-700">{message}</p>}</div>
        </form>
      </Panel>}
      <div className={`${user.role !== 'student' ? 'mt-5' : ''} grid gap-4 md:grid-cols-2`}>
        {data.exams.map((exam) => {
          const result = data.results.find((item) => item.examId === exam.id && item.studentId === user.id)
          const attempt = data.examAttempts.find((item) => item.examId === exam.id)
          const expired = now >= Date.parse(exam.dueDate)
          const questionCount = exam.questionCount ?? exam.questions.length
          return <article key={exam.id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><span className="rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800">{exam.className}</span><span className="text-xs text-slate-400">{questionCount} question{questionCount === 1 ? '' : 's'}</span></div><h2 className="mt-4 font-slab text-lg font-bold text-slate-900">{exam.title}</h2><p className="mt-2 text-xs text-slate-500">Due {new Date(exam.dueDate).toLocaleString()} · {exam.durationMinutes} minutes</p>{user.role === 'student' ? result ? <p className="mt-3 text-sm font-semibold text-emerald-700">{result.missed ? 'Missed deadline' : 'Completed'} · score {result.score}/{result.total}</p> : attempt ? <p className="mt-3 text-sm font-semibold text-amber-700">Attempt started. It cannot be resumed; it will be submitted automatically when time expires.</p> : expired ? <p className="mt-3 text-sm font-bold text-rose-700">Deadline passed · score 0/{questionCount}</p> : <button disabled={busy} onClick={() => startExam(exam)} className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50">Start exam →</button> : <p className="mt-2 text-sm text-slate-500">Available to {exam.className}</p>}</article>
        })}
        {!data.exams.length && <EmptyState>No exams or tests have been published for {user.className || 'your class'} yet.</EmptyState>}
      </div>
    </>
  )
}

function AssessmentsSection({ data, user, token, onRefresh }) {
  const [form, setForm] = useState({
    title: '',
    category: 'Quiz',
    subject: user.subject || '',
    className: user.className || '',
    maxScore: 100,
    date: getToday(),
  })
  const [scores, setScores] = useState({})
  const [feedback, setFeedback] = useState({})
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const classNames = [...new Set([...data.students, ...data.users].map((student) => student.className).filter(Boolean))]

  async function createAssessment(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    setBusy(true)
    try {
      const result = await request('/api/assessments', { token, method: 'POST', body: JSON.stringify(form) })
      setMessage(result.approval ? 'Assessment request submitted for admin approval.' : 'Assessment added to the subject gradebook.')
      setForm({ ...form, title: '', date: getToday() })
      await onRefresh()
    } catch (createError) {
      setError(createError.message)
    } finally {
      setBusy(false)
    }
  }

  async function refreshAssessments() {
    setError('')
    setBusy(true)
    try {
      await onRefresh()
      setMessage('Assessments refreshed.')
    } catch (refreshError) {
      setError(refreshError.message)
    } finally {
      setBusy(false)
    }
  }

  async function sendResults(assessment) {
    setError('')
    setMessage('')
    setBusy(true)
    try {
      const result = await request(`/api/assessments/${assessment.id}/records`, {
        token,
        method: 'POST',
        body: JSON.stringify({
          records: data.students.map((student) => ({
            studentId: student.id,
            score: scores[`${assessment.id}:${student.id}`] ?? data.assessmentRecords.find((record) => record.assessmentId === assessment.id && record.studentId === student.id)?.score,
            feedback: feedback[`${assessment.id}:${student.id}`] ?? data.assessmentRecords.find((record) => record.assessmentId === assessment.id && record.studentId === student.id)?.feedback ?? '',
          })),
        }),
      })
      setMessage(result.approval ? 'Marks request submitted for admin approval.' : 'Marks and feedback saved and shared with students.')
      await onRefresh()
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <SectionTitle eyebrow={user.subject ? `Subject · ${user.subject}` : 'Teaching & learning'} title={user.role === 'student' ? 'My assessments' : 'Subject assessments'} action={<button type="button" disabled={busy} onClick={() => void refreshAssessments()} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 disabled:opacity-50">{busy ? 'Refreshing…' : 'Refresh assessments'}</button>} />
      {user.role === 'student' && message && <p role="status" className="mb-4 text-sm text-emerald-700">{message}</p>}
      {user.role !== 'student' && <Panel title="Document an assessment"><form onSubmit={createAssessment} className="grid gap-4 p-5 md:grid-cols-2">
        <label className="block text-sm font-semibold text-slate-700">Assessment name<input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="portal-input" placeholder="e.g. Fractions test" /></label>
        <label className="block text-sm font-semibold text-slate-700">Type<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="portal-input">{['Classwork', 'Quiz', 'Test', 'Project', 'Practical', 'Examination', 'Other'].map((category) => <option key={category}>{category}</option>)}</select></label>
        <label className="block text-sm font-semibold text-slate-700">Subject<input required readOnly={user.role === 'teacher' && Boolean(user.subject)} value={user.subject || form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} className="portal-input read-only:bg-slate-50" placeholder="Subject" /></label>
        <label className="block text-sm font-semibold text-slate-700">Class<input required list="assessment-classes" value={form.className} onChange={(event) => setForm({ ...form, className: event.target.value })} className="portal-input" placeholder="Class" /></label>
        <datalist id="assessment-classes">{classNames.map((className) => <option key={className} value={className} />)}</datalist>
        <label className="block text-sm font-semibold text-slate-700">Maximum score<input required type="number" min="1" max="1000" value={form.maxScore} onChange={(event) => setForm({ ...form, maxScore: Number(event.target.value) })} className="portal-input" /></label>
        <label className="block text-sm font-semibold text-slate-700">Assessment date<input required type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} className="portal-input" /></label>
        <div className="flex flex-wrap items-center gap-3 md:col-span-2"><button disabled={busy} className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-700 disabled:opacity-60">{busy ? 'Saving…' : 'Add to gradebook'}</button>{error && <p role="alert" className="text-sm text-rose-700">{error}</p>}{message && <p role="status" className="text-sm text-emerald-700">{message}</p>}</div>
      </form></Panel>}
      {user.role === 'student' && <div className="mb-5 space-y-3">{data.assessmentRecords.map((record) => <article key={record.id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-slab text-lg font-bold text-slate-900">{record.assessmentTitle}</p><p className="mt-1 text-sm text-slate-500">{record.subject} · {record.category}</p></div><span className="rounded-xl bg-emerald-50 px-3 py-2 font-bold text-emerald-800">{record.score}/{record.maxScore}</span></div><p className="mt-3 text-sm text-slate-500">Feedback: {record.feedback || 'No written feedback.'}</p></article>)}{!data.assessmentRecords.length && <EmptyState>Your subject marks and teacher feedback will appear here once they are shared.</EmptyState>}</div>}
      <div className={`${user.role !== 'student' ? 'mt-5' : ''} space-y-4`}>
        {data.assessments.map((assessment) => {
          const records = data.assessmentRecords.filter((record) => record.assessmentId === assessment.id)
          if (user.role === 'student') {
            const record = records.find((item) => item.studentId === user.id)
            return record ? null : <article key={assessment.id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"><p className="font-bold text-slate-800">{assessment.title}</p><p className="mt-1 text-sm text-slate-500">{assessment.subject} · {assessment.category} · {assessment.maxScore} marks</p><p className="mt-2 text-xs text-slate-400">Your teacher has not released your mark yet.</p></article>
          }
          return <Panel key={assessment.id} title={`${assessment.title} · ${assessment.subject} · ${assessment.maxScore} marks`}>
            <div className="divide-y divide-slate-100">
              {data.students.filter((student) => student.className === assessment.className).map((student) => {
                const record = records.find((item) => item.studentId === student.id)
                const key = `${assessment.id}:${student.id}`
                return <div key={student.id} className="grid items-center gap-3 px-5 py-4 md:grid-cols-[1.1fr_.55fr_1.4fr]"><div><p className="font-semibold text-slate-800">{student.name}</p><p className="text-xs text-slate-500">{record?.releasedAt ? 'Result shared' : 'Not marked yet'}</p></div><label className="text-xs font-semibold text-slate-500">Score<input required type="number" min="0" max={assessment.maxScore} step="any" value={scores[key] ?? record?.score ?? ''} onChange={(event) => setScores({ ...scores, [key]: event.target.value })} className="portal-input" /></label><label className="text-xs font-semibold text-slate-500">Feedback<input value={feedback[key] ?? record?.feedback ?? ''} onChange={(event) => setFeedback({ ...feedback, [key]: event.target.value })} className="portal-input" placeholder="Feedback for this student" /></label></div>
              })}
              {!data.students.some((student) => student.className === assessment.className) && <div className="p-5"><EmptyState>No students are assigned to this class.</EmptyState></div>}
            </div>
            <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 px-5 py-4"><button disabled={busy || !data.students.some((student) => student.className === assessment.className)} onClick={() => sendResults(assessment)} className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-700 disabled:opacity-60">{busy ? 'Saving…' : 'Save marks & send to students'}</button>{error && <p role="alert" className="text-sm text-rose-700">{error}</p>}{message && <p role="status" className="text-sm text-emerald-700">{message}</p>}</div>
          </Panel>
        })}
        {!data.assessments.length && <EmptyState>No assessments have been documented yet.</EmptyState>}
      </div>
    </>
  )
}

function ResultsSection({ data, user, token, onRefresh }) {
  const results = useMemo(() => [...data.results].sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)), [data.results])
  const [feedback, setFeedback] = useState({})
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [busyId, setBusyId] = useState('')

  async function sendFeedback(resultId, currentFeedback) {
    const text = feedback[resultId] ?? currentFeedback
    if (!text?.trim()) {
      setError('Write feedback before sending it to the student.')
      return
    }
    setError('')
    setMessage('')
    setBusyId(resultId)
    try {
      const result = await request(`/api/results/${resultId}/feedback`, { token, method: 'POST', body: JSON.stringify({ feedback: text }) })
      setMessage(result.approval ? 'Feedback request submitted for admin approval.' : 'Feedback sent to the student.')
      await onRefresh()
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setBusyId('')
    }
  }

  const rows = [
    ...results,
    ...data.assignmentSubmissions.map((submission) => ({
      ...submission,
      examTitle: submission.assignmentTitle,
      examId: submission.assignmentId,
      total: submission.total,
      subject: submission.subject || '—',
    })),
  ].sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))

  return (
    <>
      <SectionTitle eyebrow={user.role === 'student' ? 'Your progress' : 'Assessment'} title={user.role === 'student' ? 'My results' : 'Exam results'} />
      {error && <p role="alert" className="mb-4 text-sm text-rose-700">{error}</p>}
      {message && <p role="status" className="mb-4 text-sm text-emerald-700">{message}</p>}
      <Panel title={`${rows.length} saved result${rows.length === 1 ? '' : 's'}`}>
        {rows.length ? <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr>{user.role !== 'student' && <th className="px-5 py-3">Student</th>}<th className="px-5 py-3">Assessment</th><th className="px-5 py-3">Subject</th><th className="px-5 py-3">Class</th><th className="px-5 py-3">Score</th><th className="px-5 py-3">Submitted</th></tr></thead><tbody className="divide-y divide-slate-100">{rows.map((result) => <tr key={result.id} className="align-top">{user.role !== 'student' && <td className="px-5 py-4 font-semibold text-slate-800">{result.studentName}</td>}<td className="px-5 py-4 font-semibold text-slate-800">{result.examTitle}<p className="mt-1 text-xs font-normal text-slate-500">{result.teacherFeedback ? `Teacher: ${result.teacherFeedback}` : user.role === 'student' ? 'No teacher feedback yet.' : 'Feedback not sent yet.'}</p>{user.role !== 'student' && <div className="mt-2 flex min-w-56 gap-2"><input aria-label={`Feedback for ${result.studentName}`} value={feedback[result.id] ?? result.teacherFeedback ?? ''} onChange={(event) => setFeedback({ ...feedback, [result.id]: event.target.value })} className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs" placeholder="Write feedback" /><button disabled={busyId === result.id} onClick={() => sendFeedback(result.id, result.teacherFeedback)} className="shrink-0 rounded-lg bg-emerald-600 px-2 py-1 text-xs font-bold text-white disabled:opacity-60">{busyId === result.id ? 'Sending' : 'Send'}</button></div>}</td><td className="px-5 py-4 text-slate-500">{result.subject || '—'}</td><td className="px-5 py-4 text-slate-500">{result.className}</td><td className="px-5 py-4"><span className="rounded-full bg-emerald-50 px-2.5 py-1 font-bold text-emerald-800">{result.score}/{result.total}</span></td><td className="px-5 py-4 text-slate-500">{formatDate(result.submittedAt)}</td></tr>)}</tbody></table></div> : <div className="p-5"><EmptyState>Completed exam and assignment results will be saved here.</EmptyState></div>}
      </Panel>
    </>
  )
}

function parseCsvRows(content) {
  const rows = []
  let row = []
  let field = ''
  let quoted = false

  for (let index = 0; index < content.length; index += 1) {
    const character = content[index]
    if (character === '"') {
      if (quoted && content[index + 1] === '"') {
        field += '"'
        index += 1
      } else {
        quoted = !quoted
      }
    } else if (character === ',' && !quoted) {
      row.push(field.trim())
      field = ''
    } else if (character === '\n' && !quoted) {
      row.push(field.trim())
      if (row.some(Boolean)) rows.push(row)
      row = []
      field = ''
    } else if (character !== '\r' || quoted) {
      field += character
    }
  }
  if (quoted) throw new Error('The CSV contains an unclosed quoted field.')
  row.push(field.trim())
  if (row.some(Boolean)) rows.push(row)
  return rows
}

function downloadReportCardTemplate() {
  const headers = 'studentEmail,subject,term,academicYear,continuousAssessment,examScore,attendancePresent,attendanceTotal,teacherComment,conduct,headTeacherRemark'
  const url = URL.createObjectURL(new Blob([`${headers}\r\n`], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = 'report-card-results-template.csv'
  link.click()
  URL.revokeObjectURL(url)
}

function ReportCardsSection({ data, user, token, onRefresh }) {
  const [form, setForm] = useState({
    studentId: data.students[0]?.id || '',
    subject: user.subject || '',
    term: 'Autumn term',
    academicYear: '2026/27',
    continuousAssessment: 0,
    examScore: 0,
    attendancePresent: 0,
    attendanceTotal: 0,
    conduct: 'Excellent',
    teacherComment: '',
    headTeacherRemark: '',
  })
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [importError, setImportError] = useState('')
  const [importMessage, setImportMessage] = useState('')
  const [importBusy, setImportBusy] = useState(false)

  async function saveReportCard(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    setBusy(true)
    try {
      const result = await request('/api/report-cards', { token, method: 'POST', body: JSON.stringify(form) })
      setMessage(result.approval ? 'Report-card request submitted for admin approval.' : 'Report card saved and shared with the student.')
      setForm({ ...form, subject: user.subject || '', continuousAssessment: 0, examScore: 0, teacherComment: '' })
      await onRefresh()
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setBusy(false)
    }
  }

  async function importCsv(file) {
    setImportError('')
    setImportMessage('')
    setImportBusy(true)
    try {
      const rows = parseCsvRows(await file.text())
      if (rows.length < 2) throw new Error('The CSV must include a header row and at least one result row.')
      const headers = rows[0].map((header) => header.toLowerCase())
      const requiredHeaders = ['studentemail', 'subject', 'term', 'academicyear', 'continuousassessment', 'examscore']
      const missingHeaders = requiredHeaders.filter((header) => !headers.includes(header))
      if (missingHeaders.length) throw new Error(`Missing required CSV columns: ${missingHeaders.join(', ')}.`)
      const valueAt = (row, header) => {
        const index = headers.indexOf(header)
        return index < 0 ? '' : (row[index] || '').trim()
      }
      const numericValue = (row, header, minimum, maximum, optional = false) => {
        const raw = valueAt(row, header)
        if (optional && !raw) return 0
        if (!raw) throw new Error(`${header} is required.`)
        const value = Number(raw)
        if (!Number.isFinite(value) || value < minimum || value > maximum) {
          throw new Error(`${header} must be a number from ${minimum} to ${maximum}.`)
        }
        return value
      }
      const records = rows.slice(1).map((row, index) => {
        const rowNumber = index + 2
        try {
          const studentEmail = valueAt(row, 'studentemail').toLowerCase()
          const student = data.students.find((item) => item.email.toLowerCase() === studentEmail)
          if (!student) throw new Error(`No accessible student matches "${studentEmail}".`)
          const subject = valueAt(row, 'subject')
          const term = valueAt(row, 'term')
          const academicYear = valueAt(row, 'academicyear')
          if (!subject || !term || !academicYear) throw new Error('Student email, subject, term, and academic year are required.')
          const attendancePresent = numericValue(row, 'attendancepresent', 0, 1000, true)
          const attendanceTotal = numericValue(row, 'attendancetotal', 0, 1000, true)
          if (!Number.isInteger(attendancePresent) || !Number.isInteger(attendanceTotal) || attendancePresent > attendanceTotal) {
            throw new Error('Attendance must use whole numbers; days present cannot exceed school days.')
          }
          return {
            studentId: student.id,
            subject,
            term,
            academicYear,
            continuousAssessment: numericValue(row, 'continuousassessment', 0, 40),
            examScore: numericValue(row, 'examscore', 0, 60),
            attendancePresent,
            attendanceTotal,
            teacherComment: valueAt(row, 'teachercomment'),
            conduct: valueAt(row, 'conduct'),
            headTeacherRemark: valueAt(row, 'headteacherremark'),
          }
        } catch (rowError) {
          throw new Error(`CSV row ${rowNumber}: ${rowError.message}`)
        }
      })
      if (records.length > 500) throw new Error('Import no more than 500 result rows at a time.')
      const response = await request('/api/report-cards/import', {
        token,
        method: 'POST',
        body: JSON.stringify({ records }),
      })
      setImportMessage(response.approval
        ? 'Results-sheet import request submitted for admin approval.'
        : `${response.imported} report-card result${response.imported === 1 ? '' : 's'} imported successfully.`)
      await onRefresh()
    } catch (importException) {
      setImportError(importException.message)
    } finally {
      setImportBusy(false)
    }
  }

  const reportCards = useMemo(() => {
    const groups = new Map()
    for (const card of data.reportCards) {
      const key = `${card.studentId}:${card.academicYear || 'Previous records'}:${card.term}`
      if (!groups.has(key)) groups.set(key, { studentName: card.studentName, className: card.className, academicYear: card.academicYear || 'Previous records', term: card.term, subjects: [], attendancePresent: card.attendancePresent, attendanceTotal: card.attendanceTotal, conduct: card.conduct, headTeacherRemark: card.headTeacherRemark })
      groups.get(key).subjects.push(card)
    }
    return [...groups.values()]
  }, [data.reportCards])

  return (
    <>
      <SectionTitle eyebrow={user.role === 'student' ? 'Your progress' : `Academic records${user.subject ? ` · ${user.subject}` : ''}`} title={user.role === 'student' ? 'My school report cards' : 'School report cards'} />
      {user.role !== 'student' && <Panel title="Upload results sheet">
        <div className="space-y-4 p-5">
          <p className="text-sm leading-6 text-slate-600">Import subject marks from a CSV file. The import is validated as a whole; if a row is invalid, no results from that file are saved. Existing marks for the same student, subject, term, and academic year are updated.</p>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={downloadReportCardTemplate} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">Download CSV template</button>
            <label className="cursor-pointer rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-700">{importBusy ? 'Importing…' : 'Choose CSV file'}<input type="file" accept=".csv,text/csv" disabled={importBusy} onChange={(event) => { const file = event.target.files?.[0]; if (file) void importCsv(file); event.target.value = '' }} className="sr-only" /></label>
          </div>
          {importError && <p role="alert" className="text-sm text-rose-700">{importError}</p>}
          {importMessage && <p role="status" className="text-sm text-emerald-700">{importMessage}</p>}
          <p className="text-xs leading-5 text-slate-500">Required columns: studentEmail, subject, term, academicYear, continuousAssessment (0–40), examScore (0–60). Attendance and comments are optional. Use each student’s registered email.</p>
        </div>
      </Panel>}
      {user.role !== 'student' && <Panel title="Enter subject marks for a report card"><form onSubmit={saveReportCard} className="grid gap-4 p-5 md:grid-cols-2">
        <label className="block text-sm font-semibold text-slate-700">Student<select required value={form.studentId} onChange={(event) => setForm({ ...form, studentId: event.target.value })} className="portal-input"><option value="" disabled>Select a student</option>{data.students.map((student) => <option key={student.id} value={student.id}>{student.name} · {student.className}</option>)}</select></label>
        <label className="block text-sm font-semibold text-slate-700">Subject<input required readOnly={user.role === 'teacher' && Boolean(user.subject)} value={user.subject || form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} className="portal-input read-only:bg-slate-50" placeholder="e.g. Mathematics" /></label>
        <label className="block text-sm font-semibold text-slate-700">Academic year<input required value={form.academicYear} onChange={(event) => setForm({ ...form, academicYear: event.target.value })} className="portal-input" placeholder="2026/27" /></label>
        <label className="block text-sm font-semibold text-slate-700">Term<select value={form.term} onChange={(event) => setForm({ ...form, term: event.target.value })} className="portal-input">{['Autumn term', 'Spring term', 'Summer term'].map((term) => <option key={term}>{term}</option>)}</select></label>
        <label className="block text-sm font-semibold text-slate-700">Continuous assessment (max 40)<input required type="number" min="0" max="40" step="any" value={form.continuousAssessment} onChange={(event) => setForm({ ...form, continuousAssessment: Number(event.target.value) })} className="portal-input" /></label>
        <label className="block text-sm font-semibold text-slate-700">Examination score (max 60)<input required type="number" min="0" max="60" step="any" value={form.examScore} onChange={(event) => setForm({ ...form, examScore: Number(event.target.value) })} className="portal-input" /></label>
        <div className="grid gap-4 sm:grid-cols-2 md:col-span-2">
          <label className="block text-sm font-semibold text-slate-700">Days present<input required type="number" min="0" value={form.attendancePresent} onChange={(event) => setForm({ ...form, attendancePresent: Number(event.target.value) })} className="portal-input" /></label>
          <label className="block text-sm font-semibold text-slate-700">School days<input required type="number" min="0" value={form.attendanceTotal} onChange={(event) => setForm({ ...form, attendanceTotal: Number(event.target.value) })} className="portal-input" /></label>
        </div>
        <label className="block text-sm font-semibold text-slate-700">Conduct<select value={form.conduct} onChange={(event) => setForm({ ...form, conduct: event.target.value })} className="portal-input">{['Excellent', 'Very good', 'Good', 'Satisfactory', 'Needs improvement'].map((conduct) => <option key={conduct}>{conduct}</option>)}</select></label>
        <label className="block text-sm font-semibold text-slate-700 md:col-span-2">Subject teacher’s comment<textarea required rows="2" value={form.teacherComment} onChange={(event) => setForm({ ...form, teacherComment: event.target.value })} className="portal-input" placeholder="Comment on the learner’s progress in this subject." /></label>
        {user.role === 'admin' && <label className="block text-sm font-semibold text-slate-700 md:col-span-2">Head teacher’s remark<textarea rows="2" value={form.headTeacherRemark} onChange={(event) => setForm({ ...form, headTeacherRemark: event.target.value })} className="portal-input" placeholder="Overall term remark" /></label>}
        <div className="flex flex-wrap items-center gap-3 md:col-span-2"><button disabled={busy || !data.students.length} className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-700 disabled:opacity-60">{busy ? 'Saving…' : 'Save & share report card'}</button>{error && <p role="alert" className="text-sm text-rose-700">{error}</p>}{message && <p role="status" className="text-sm text-emerald-700">{message}</p>}{!data.students.length && <p className="text-sm text-slate-500">Create a student account before adding report-card marks.</p>}</div>
      </form></Panel>}
      <div className={`${user.role !== 'student' ? 'mt-5' : ''} space-y-5`}>
        {reportCards.map((report, index) => {
          const scoredSubjects = report.subjects.filter((item) => Number.isFinite(Number(item.totalScore)))
          const average = scoredSubjects.length ? Math.round(scoredSubjects.reduce((sum, item) => sum + Number(item.totalScore), 0) / scoredSubjects.length) : null
          return <Panel key={`${report.studentName}-${report.academicYear}-${report.term}-${index}`} title={`${report.studentName} · ${report.className} · ${report.academicYear}`}>
            <div className="border-b border-slate-100 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-600">{report.term}</div>
            <div className="overflow-x-auto"><table className="w-full min-w-[560px] text-left text-sm"><thead className="text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Subject</th><th className="px-5 py-3">Assessment / 40</th><th className="px-5 py-3">Examination / 60</th><th className="px-5 py-3">Total / 100</th><th className="px-5 py-3">Grade</th></tr></thead><tbody className="divide-y divide-slate-100">{report.subjects.map((subject) => <tr key={subject.id}><td className="px-5 py-3 font-semibold text-slate-800">{subject.subject}</td><td className="px-5 py-3 text-slate-600">{subject.continuousAssessment ?? '—'}</td><td className="px-5 py-3 text-slate-600">{subject.examScore ?? '—'}</td><td className="px-5 py-3 text-slate-600">{subject.totalScore ?? '—'}</td><td className="px-5 py-3 font-bold text-emerald-800">{subject.grade}</td></tr>)}</tbody></table></div>
            <div className="grid gap-4 border-t border-slate-100 px-5 py-4 sm:grid-cols-3"><p className="text-sm text-slate-600"><span className="block text-xs font-bold uppercase text-slate-400">Attendance</span>{report.attendancePresent ?? '—'} / {report.attendanceTotal ?? '—'} days</p><p className="text-sm text-slate-600"><span className="block text-xs font-bold uppercase text-slate-400">Conduct</span>{report.conduct || '—'}</p><p className="text-sm text-slate-600"><span className="block text-xs font-bold uppercase text-slate-400">Average</span>{average === null ? '—' : `${average}%`}</p></div>
            {report.subjects.map((subject) => <p key={`${subject.id}-comment`} className="border-t border-slate-100 px-5 py-3 text-sm leading-6 text-slate-600"><span className="font-semibold text-slate-800">{subject.subject} teacher:</span> {subject.teacherComment || subject.comment || '—'}</p>)}
            {report.headTeacherRemark && <p className="border-t border-slate-100 bg-emerald-50 px-5 py-4 text-sm leading-6 text-emerald-900"><span className="font-bold">Head teacher’s remark:</span> {report.headTeacherRemark}</p>}
          </Panel>
        })}
        {!reportCards.length && <EmptyState>No report cards have been recorded yet.</EmptyState>}
      </div>
    </>
  )
}

function PortalWorkspace({ user, data, token, onRefresh, onSignOut, syncError }) {
  const [section, setSection] = useState('overview')
  const [profilePhotoVersion, setProfilePhotoVersion] = useState(0)
  const activeAttemptSubmit = useRef(null)
  const registerAttemptSubmit = useCallback((submit) => {
    activeAttemptSubmit.current = submit
  }, [])
  const navigateToSection = useCallback(async (nextSection) => {
    if (nextSection === section) return
    const submitted = await activeAttemptSubmit.current?.()
    if (submitted === false) return
    setSection(nextSection)
  }, [section])
  const handleSignOut = useCallback(async () => {
    const submitted = await activeAttemptSubmit.current?.()
    if (submitted === false) return
    await onSignOut()
  }, [onSignOut])
  const links = user.role === 'teacher' && user.isFormTeacher
      ? [...NAVIGATION.teacher.slice(0, 3), { id: 'create-account', label: 'Create student', icon: '+' }, ...NAVIGATION.teacher.slice(3)]
      : NAVIGATION[user.role]
  const content = section === 'overview'
    ? <Overview user={user} data={data} setSection={setSection} />
    : section === 'profile'
      ? <ProfileSection user={user} token={token} photoVersion={profilePhotoVersion} onPhotoUpdated={() => setProfilePhotoVersion((version) => version + 1)} />
    : section === 'users'
        ? user.role === 'admin'
          ? <UsersSection data={data} user={user} token={token} onRefresh={onRefresh} setSection={setSection} onPhotoUpdated={() => setProfilePhotoVersion((version) => version + 1)} />
          : <StudentsSection data={data} user={user} token={token} setSection={setSection} onRefresh={onRefresh} onPhotoUpdated={() => setProfilePhotoVersion((version) => version + 1)} />
        : section === 'create-account'
          ? <CreateAccountSection data={data} user={user} token={token} onRefresh={onRefresh} onBack={() => setSection('users')} />
          : section === 'form-teachers'
            ? <FormTeachersSection data={data} token={token} onRefresh={onRefresh} />
            : section === 'approvals'
              ? <ApprovalsSection token={token} />
      : section === 'attendance'
        ? <AttendanceSection data={data} user={user} token={token} onRefresh={onRefresh} />
        : section === 'assignments'
        ? <AssignmentsSection data={data} user={user} token={token} onRefresh={onRefresh} registerAttemptSubmit={registerAttemptSubmit} />
          : section === 'assessments'
            ? <AssessmentsSection data={data} user={user} token={token} onRefresh={onRefresh} />
          : section === 'exams'
          ? <ExamsSection data={data} user={user} token={token} onRefresh={onRefresh} registerAttemptSubmit={registerAttemptSubmit} />
            : section === 'report-cards'
              ? <ReportCardsSection data={data} user={user} token={token} onRefresh={onRefresh} />
            : <ResultsSection data={data} user={user} token={token} onRefresh={onRefresh} />

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <PortalHeader user={user} token={token} photoVersion={profilePhotoVersion} onSignOut={handleSignOut} />
      <div className="mx-auto flex max-w-[1440px]">
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white px-4 py-7 lg:block">
          <p className="px-3 text-[11px] font-bold uppercase tracking-[.16em] text-slate-400">Workspace</p>
          <nav className="mt-3 space-y-1" aria-label="Portal sections">{links.map((link) => <button key={link.id} onClick={() => void navigateToSection(link.id)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${section === link.id ? 'bg-emerald-50 text-emerald-800' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}><span className="w-5 text-center text-base" aria-hidden="true">{link.icon}</span>{link.label}</button>)}</nav>
          <div className="mt-12 rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold text-slate-700">Need help?</p><p className="mt-1 text-xs leading-5 text-slate-500">Contact the school office if you need help with your account.</p><Link to="/contact" className="mt-3 inline-block text-xs font-bold text-emerald-700">Contact school →</Link></div>
        </aside>
        <main className="min-w-0 flex-1 px-4 py-7 sm:px-7 lg:px-9 lg:py-9">
          <nav className="mb-6 flex gap-2 overflow-x-auto pb-1 lg:hidden" aria-label="Portal sections">{links.map((link) => <button key={link.id} onClick={() => void navigateToSection(link.id)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${section === link.id ? 'bg-slate-900 text-white' : 'bg-white text-slate-600'}`}>{link.label}</button>)}</nav>
          {syncError && <p role="alert" className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">Portal updates could not be loaded: {syncError}</p>}
          {content}
        </main>
      </div>
    </div>
  )
}

export default function Portal() {
  const [token, setToken] = useState(() => localStorage.getItem('school-portal-token') || '')
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [syncError, setSyncError] = useState('')
  const [loading, setLoading] = useState(Boolean(token))
  const portalLoaded = Boolean(data)

  const refresh = useCallback(async (activeToken = token) => {
    const response = await request('/api/portal', { token: activeToken })
    setData(response)
    setError('')
    setSyncError('')
  }, [token])

  useEffect(() => {
    if (!token) return
    let active = true
    request('/api/portal', { token })
      .then((response) => { if (active) { setData(response); setError('') } })
      .catch((loadError) => {
        if (active) {
          localStorage.removeItem('school-portal-token')
          setToken('')
          setData(null)
          setError(loadError.message)
        }
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [token])

  useEffect(() => {
    if (!token || !portalLoaded) return undefined
    let active = true
    let syncing = false
    const syncPortal = async () => {
      if (!active || document.visibilityState === 'hidden' || syncing) return
      syncing = true
      try {
        await refresh(token)
      } catch (syncFailure) {
        if (active) setSyncError(syncFailure.message)
      } finally {
        syncing = false
      }
    }
    window.addEventListener('focus', syncPortal)
    document.addEventListener('visibilitychange', syncPortal)
    return () => {
      active = false
      window.removeEventListener('focus', syncPortal)
      document.removeEventListener('visibilitychange', syncPortal)
    }
  }, [portalLoaded, refresh, token])

  async function login(email, password) {
    const response = await request('/api/login', { method: 'POST', body: JSON.stringify({ email, password }) })
    localStorage.setItem('school-portal-token', response.token)
    setError('')
    setSyncError('')
    setLoading(true)
    setToken(response.token)
  }

  async function signOut() {
    try {
      await request('/api/logout', { token, method: 'POST' })
    } finally {
      localStorage.removeItem('school-portal-token')
      setToken('')
      setData(null)
      setSyncError('')
    }
  }

  if (!token) return <Login onLogin={login} />
  if (loading) return <main className="flex min-h-screen items-center justify-center bg-[#f5f7fb] text-sm font-semibold text-slate-500">Loading your portal…</main>
  if (!data) return <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f5f7fb] px-4 text-center"><p role="alert" className="text-sm text-rose-700">{error || 'Unable to load your portal.'}</p><button onClick={() => setToken('')} className="font-bold text-emerald-700">Return to sign in</button></main>
  return <PortalWorkspace user={data.user} data={data} token={token} onRefresh={refresh} onSignOut={signOut} syncError={syncError} />
}
