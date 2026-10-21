import { useEffect, useState } from 'react'
import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom'
import './App.css'

const demoEvents = [
  {
    id: 'techfest-2026',
    title: 'TechFest 2026',
    category: 'Technology',
    date: '2026-11-14',
    time: '10:00 AM',
    venue: 'Innovation Hall',
    description:
      'A day of coding challenges, product showcases, and practical workshops led by the campus technology community.',
    seats: 120,
    registered: 74,
    organizer: 'Computer Science Club',
    status: 'Open',
  },
  {
    id: 'cultural-night',
    title: 'Cultural Night',
    category: 'Cultural',
    date: '2026-12-05',
    time: '6:30 PM',
    venue: 'Main Auditorium',
    description:
      'Celebrate the many cultures on campus with music, dance, theatre, and food from student communities.',
    seats: 300,
    registered: 218,
    organizer: 'Student Council',
    status: 'Open',
  },
  {
    id: 'career-connect',
    title: 'Career Connect',
    category: 'Career',
    date: '2026-11-28',
    time: '11:00 AM',
    venue: 'Seminar Block A',
    description:
      'Meet recruiters, alumni, and mentors for practical advice about internships and early career planning.',
    seats: 180,
    registered: 180,
    organizer: 'Placement Cell',
    status: 'Full',
  },
]

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:eventId" element={<EventDetailsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/registrations" element={<ProtectedRoute><RegistrationsPage /></ProtectedRoute>} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('college-event-user')) || null
    } catch {
      return null
    }
  })

  const login = (email, role) => {
    const nextUser = { name: email.split('@')[0], email, role }
    localStorage.setItem('college-event-user', JSON.stringify(nextUser))
    setUser(nextUser)
  }

  const logout = () => {
    localStorage.removeItem('college-event-user')
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

import { createContext, useContext } from 'react'

const AuthContext = createContext(null)

function useAuth() {
  return useContext(AuthContext)
}

function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="app-shell">
      <header className="navbar">
        <Link className="brand" to="/">
          <span className="brand-mark">CE</span>
          <span>Campus<span>Events</span></span>
        </Link>
        <nav className="nav-links">
          <Link to="/events">Explore events</Link>
          {user && <Link to="/dashboard">Dashboard</Link>}
          {user && <Link to="/registrations">My registrations</Link>}
        </nav>
        <div className="nav-actions">
          {user ? (
            <>
              <span className="user-pill">{user.name} · {user.role}</span>
              <button className="button button-ghost" onClick={() => { logout(); navigate('/') }}>Log out</button>
            </>
          ) : (
            <>
              <Link className="button button-ghost" to="/login">Log in</Link>
              <Link className="button button-primary" to="/signup">Get started</Link>
            </>
          )}
        </div>
      </header>
      <main className="page-content"><Outlet /></main>
      <footer className="footer">
        <strong>CampusEvents</strong>
        <span>Make every campus moment count.</span>
      </footer>
    </div>
  )
}

import { Outlet } from 'react-router-dom'

function HomePage() {
  return (
    <>
      <section className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow">Your campus, your community</p>
          <h1>Find your next <em>unforgettable</em> campus moment.</h1>
          <p className="hero-description">Discover events, connect with your community, and make memories that last beyond graduation.</p>
          <div className="hero-actions">
            <Link className="button button-primary button-large" to="/events">Explore events <span>→</span></Link>
            <Link className="text-link" to="/signup">Create an account <span>↗</span></Link>
          </div>
        </div>
        <div className="hero-art">
          <div className="art-card art-card-main"><span>14</span><small>NOV</small><strong>TechFest<br />2026</strong><i>✦</i></div>
          <div className="art-card art-card-float"><span>✦</span><strong>Find your<br />people.</strong></div>
          <div className="art-circle"></div>
        </div>
      </section>
      <section className="feature-strip">
        <div><strong>500+</strong><span>events every year</span></div>
        <div><strong>12k</strong><span>students connected</span></div>
        <div><strong>40+</strong><span>active communities</span></div>
      </section>
      <section className="section-block">
        <div className="section-heading"><div><p className="eyebrow">Happening soon</p><h2>Don&apos;t miss out.</h2></div><Link className="text-link" to="/events">View all events →</Link></div>
        <EventGrid events={demoEvents.slice(0, 2)} />
      </section>
    </>
  )
}

function EventsPage() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const filteredEvents = demoEvents.filter((event) => {
    const matchesQuery = event.title.toLowerCase().includes(query.toLowerCase())
    return matchesQuery && (category === 'All' || event.category === category)
  })
  return (
    <section className="section-block events-page">
      <div className="page-heading"><p className="eyebrow">Discover</p><h1>All events</h1><p>There&apos;s always something happening on campus.</p></div>
      <div className="filters"><input aria-label="Search events" placeholder="Search events..." value={query} onChange={(event) => setQuery(event.target.value)} /><select value={category} onChange={(event) => setCategory(event.target.value)}><option>All</option><option>Technology</option><option>Cultural</option><option>Career</option></select></div>
      {filteredEvents.length ? <EventGrid events={filteredEvents} /> : <EmptyState />}
    </section>
  )
}

function EventGrid({ events }) {
  return <div className="event-grid">{events.map((event) => <EventCard key={event.id} event={event} />)}</div>
}

function EventCard({ event }) {
  const fill = Math.round((event.registered / event.seats) * 100)
  return (
    <article className="event-card">
      <div className={`event-color ${event.category.toLowerCase()}`}><span>{event.category}</span><strong>{event.date.slice(8)}</strong><small>{new Date(event.date).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}</small></div>
      <div className="event-card-body"><span className="event-category">{event.category}</span><h3>{event.title}</h3><p>{event.venue} · {event.time}</p><div className="card-footer"><span className={event.status === 'Full' ? 'status-full' : 'status-open'}>{event.status}</span><Link to={`/events/${event.id}`}>View details →</Link></div><div className="capacity"><span style={{ width: `${fill}%` }}></span></div></div>
    </article>
  )
}

function EventDetailsPage() {
  const { eventId } = useParams()
  const event = demoEvents.find((item) => item.id === eventId)
  const { user } = useAuth()
  const navigate = useNavigate()
  const [registered, setRegistered] = useState(false)
  if (!event) return <NotFoundPage />
  return (
    <section className="section-block details-page">
      <Link className="back-link" to="/events">← Back to events</Link>
      <div className="detail-layout"><div><span className="event-category">{event.category}</span><h1>{event.title}</h1><p className="detail-description">{event.description}</p><div className="detail-meta"><span>◷ <strong>{event.date}</strong><small>{event.time}</small></span><span>⌖ <strong>{event.venue}</strong><small>Campus venue</small></span><span>◎ <strong>{event.organizer}</strong><small>Organizer</small></span></div></div><aside className="registration-panel"><p className="eyebrow">Registration</p><h3>{event.status === 'Full' ? 'This event is full' : 'Reserve your spot'}</h3><p>{event.seats - event.registered} spots remaining</p>{registered ? <div className="success-message">You&apos;re registered! Check your dashboard for details.</div> : <button className="button button-primary button-full" disabled={event.status === 'Full'} onClick={() => user ? setRegistered(true) : navigate('/login')}>{user ? 'Register for event' : 'Log in to register'}</button>}{!user && <Link className="panel-link" to="/login">Already have an account? Log in</Link>}</aside></div>
    </section>
  )
}

function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  useEffect(() => { if (user) navigate('/dashboard', { replace: true }) }, [user, navigate])
  const submit = (event) => { event.preventDefault(); login(email || 'student@campus.edu', 'student'); navigate(location.state?.from || '/dashboard') }
  return <AuthPage title="Welcome back." subtitle="Log in to keep up with your campus community." onSubmit={submit} submitLabel="Log in"><input required type="email" placeholder="College email" value={email} onChange={(event) => setEmail(event.target.value)} /><input required type="password" placeholder="Password" defaultValue="campus-events" /><p className="form-note">Demo login: any email works. Connect this form to the Express auth route for production.</p></AuthPage>
}

function SignupPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const submit = (event) => { event.preventDefault(); login(event.target.email.value, event.target.role.value); navigate('/dashboard') }
  return <AuthPage title="Join the community." subtitle="One account for every event, club, and connection." onSubmit={submit} submitLabel="Create account"><input required name="name" placeholder="Full name" /><input required name="email" type="email" placeholder="College email" /><select name="role" defaultValue="student"><option value="student">Student</option><option value="organizer">Event organizer</option><option value="admin">Administrator</option></select><input required type="password" placeholder="Create a password" /></AuthPage>
}

function AuthPage({ title, subtitle, onSubmit, submitLabel, children }) {
  return <section className="auth-page"><div className="auth-card"><p className="eyebrow">CampusEvents</p><h1>{title}</h1><p>{subtitle}</p><form onSubmit={onSubmit}>{children}<button className="button button-primary button-full" type="submit">{submitLabel} →</button></form><p className="auth-switch">By continuing, you agree to our community guidelines.</p></div></section>
}

function DashboardPage() {
  const { user } = useAuth()
  const stats = user.role === 'student' ? [['3', 'Registered events'], ['12', 'Events explored'], ['2', 'Saved events']] : [['8', 'Active events'], ['246', 'Registrations'], ['92%', 'Attendance rate']]
  return <section className="section-block dashboard"><div className="page-heading"><p className="eyebrow">{user.role} dashboard</p><h1>Good to see you, {user.name}.</h1><p>Here&apos;s what&apos;s happening in your campus world.</p></div><div className="stats-grid">{stats.map(([value, label]) => <div className="stat-card" key={label}><strong>{value}</strong><span>{label}</span></div>)}</div><div className="dashboard-content"><div><div className="section-heading compact"><h2>{user.role === 'student' ? 'Upcoming events' : 'Your events'}</h2><Link className="text-link" to="/events">Explore all →</Link></div><EventGrid events={demoEvents.slice(0, 2)} /></div><div className="tip-card"><span>✦</span><h3>Make your mark.</h3><p>Have an event idea? Bring your community together and create something memorable.</p><Link className="button button-dark" to="/events">See what&apos;s possible</Link></div></div></section>
}

function RegistrationsPage() {
  const registrations = demoEvents.slice(0, 2)
  return <section className="section-block"><div className="page-heading"><p className="eyebrow">Your activity</p><h1>My registrations</h1><p>Keep track of the moments you&apos;ve reserved.</p></div><div className="registration-list">{registrations.map((event) => <div className="registration-row" key={event.id}><div className="mini-date"><strong>{event.date.slice(8)}</strong><span>{new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}</span></div><div><h3>{event.title}</h3><p>{event.date} · {event.venue}</p></div><span className="status-open">Confirmed</span><Link to={`/events/${event.id}`}>View →</Link></div>)}</div></section>
}

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  const location = useLocation()
  return user ? children : <Navigate to="/login" state={{ from: location.pathname }} replace />
}

function UnauthorizedPage() { return <MessagePage title="Access restricted" text="You do not have permission to view this page." link="/events" label="Explore public events" /> }
function NotFoundPage() { return <MessagePage title="Page not found" text="This campus moment seems to have moved." link="/" label="Back home" /> }
function EmptyState() { return <div className="empty-state"><h3>No events found</h3><p>Try a different search or category.</p></div> }
function MessagePage({ title, text, link, label }) { return <section className="message-page"><p className="eyebrow">CampusEvents</p><h1>{title}</h1><p>{text}</p><Link className="button button-primary" to={link}>{label}</Link></section> }

export default App
