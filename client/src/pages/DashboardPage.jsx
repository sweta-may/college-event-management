import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { admin as adminApi, events as eventsApi, registrations as regApi } from '../api/api';
import EventGrid from '../components/EventGrid';
import { useAuth } from '../context/AuthContext';

/* ─── Student ─────────────────────────────────────────────────────────────── */
function StudentDashboard({ user }) {
  const [myRegs,   setMyRegs]   = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([
      regApi.getMyRegistrations({ limit: 10 }),
      eventsApi.list({ status: 'upcoming', limit: 4 }),
    ])
      .then(([rRes, eRes]) => {
        setMyRegs(rRes.data.registrations ?? []);
        setUpcoming(eRes.data.events ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const confirmed = myRegs.filter((r) => r.status === 'confirmed').length;
  const stats = [
    [String(myRegs.length), 'Registered events'],
    [String(upcoming.length), 'Upcoming events'],
    [String(confirmed), 'Confirmed spots'],
  ];

  return (
    <>
      <div className="stats-grid">
        {stats.map(([v, l]) => <div className="stat-card" key={l}><strong>{v}</strong><span>{l}</span></div>)}
      </div>
      <div className="dashboard-content">
        <div>
          <div className="section-heading compact">
            <h2>Upcoming events</h2>
            <Link className="text-link" to="/events">Explore all →</Link>
          </div>
          {loading
            ? <p style={{ color: 'var(--muted)' }}>Loading…</p>
            : upcoming.length > 0
              ? <EventGrid events={upcoming.slice(0, 2)} />
              : <p style={{ color: 'var(--muted)' }}>No upcoming events right now.</p>
          }
        </div>
        <div className="tip-card">
          <span>✦</span>
          <h3>Want to host an event?</h3>
          <p>You are logged in as a <strong>Student</strong>. Students can explore and register for events. To create and host events, sign up or log in as an <strong>Event Organizer</strong>.</p>
          <Link className="button button-dark" to="/signup">Create Organizer Account</Link>
        </div>
      </div>
    </>
  );
}

/* ─── Organizer ───────────────────────────────────────────────────────────── */
function OrganizerDashboard({ user }) {
  const [myEvents, setMyEvents] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    title: '',
    category: 'technical',
    venue: '',
    capacity: 100,
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    description: '',
  });

  const loadEvents = () => {
    setLoading(true);
    eventsApi.list({ limit: 50 })
      .then((res) => {
        const uid   = user.id ?? user._id;
        const owned = (res.data.events ?? []).filter((e) => e.organizer?._id === uid);
        setMyEvents(owned);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadEvents();
  }, [user]);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await eventsApi.create(form);
      alert('Event created successfully!');
      setShowForm(false);
      setForm({
        title: '',
        category: 'technical',
        venue: '',
        capacity: 100,
        startDate: '',
        endDate: '',
        registrationDeadline: '',
        description: '',
      });
      loadEvents();
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to create event.');
    } finally {
      setSubmitting(false);
    }
  };

  const totalReg = myEvents.reduce((a, e) => a + (e.registeredCount ?? 0), 0);
  const active   = myEvents.filter((e) => ['upcoming','ongoing'].includes(e.status)).length;
  const stats = [
    [String(active), 'Active events'],
    [String(totalReg), 'Total registrations'],
    [String(myEvents.length), 'Events created'],
  ];

  return (
    <>
      <div className="stats-grid">
        {stats.map(([v, l]) => <div className="stat-card" key={l}><strong>{v}</strong><span>{l}</span></div>)}
      </div>

      {showForm && (
        <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: '12px', padding: '28px', marginBottom: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ margin: 0, fontSize: '20px' }}>Create New Campus Event</h2>
            <button type="button" className="button button-ghost" onClick={() => setShowForm(false)}>✕ Close</button>
          </div>
          {error && <p style={{ color: '#b45d4d', fontSize: '13px', marginBottom: '16px' }}>{error}</p>}
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>Event Title *</label>
              <input required name="title" placeholder="e.g. National Level Hackathon 2026" value={form.title} onChange={handleChange} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>Category *</label>
              <select name="category" value={form.category} onChange={handleChange}>
                <option value="technical">Technical</option>
                <option value="cultural">Cultural</option>
                <option value="sports">Sports</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>Venue *</label>
              <input required name="venue" placeholder="e.g. Main Auditorium / Lab 3" value={form.venue} onChange={handleChange} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>Capacity (Max Attendees) *</label>
              <input required type="number" min="1" name="capacity" value={form.capacity} onChange={handleChange} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>Registration Deadline *</label>
              <input required type="datetime-local" name="registrationDeadline" value={form.registrationDeadline} onChange={handleChange} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>Start Date & Time *</label>
              <input required type="datetime-local" name="startDate" value={form.startDate} onChange={handleChange} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>End Date & Time *</label>
              <input required type="datetime-local" name="endDate" value={form.endDate} onChange={handleChange} />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>Description *</label>
              <textarea required name="description" rows="3" placeholder="Provide event schedule, rules, guidelines, eligibility..." value={form.description} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--line)', fontFamily: 'inherit' }} />
            </div>

            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button className="button button-primary" type="submit" disabled={submitting}>
                {submitting ? 'Creating Event...' : 'Publish Event →'}
              </button>
              <button className="button button-ghost" type="button" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="dashboard-content">
        <div>
          <div className="section-heading compact" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Your events</h2>
            <button type="button" className="button button-primary" onClick={() => setShowForm(true)}>
              + Create New Event
            </button>
          </div>
          {loading
            ? <p style={{ color: 'var(--muted)' }}>Loading…</p>
            : myEvents.length > 0
              ? <EventGrid events={myEvents} />
              : (
                <div className="empty-state" style={{ marginTop: '20px' }}>
                  <h3>No events created yet</h3>
                  <p>Click &quot;+ Create New Event&quot; above to publish your first campus event.</p>
                </div>
              )
          }
        </div>
        <div className="tip-card">
          <span>✦</span>
          <h3>Organizer Hub</h3>
          <p>Create technical, cultural, or sports events, manage capacity, and track attendees.</p>
          <button type="button" className="button button-dark" onClick={() => setShowForm(true)}>
            + Create New Event
          </button>
        </div>
      </div>
    </>
  );
}

/* ─── Admin ───────────────────────────────────────────────────────────────── */
function AdminDashboard() {
  const [totals,      setTotals]      = useState({ users:0, events:0, registrations:0 });
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([
      adminApi.getUsers({ limit: 5 }),
      adminApi.getEvents({ limit: 1 }),
      adminApi.getRegistrations({ limit: 1 }),
    ])
      .then(([uRes, eRes, rRes]) => {
        setRecentUsers(uRes.data.users ?? []);
        setTotals({ users: uRes.data.total ?? 0, events: eRes.data.total ?? 0, registrations: rRes.data.total ?? 0 });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    [String(totals.users), 'Total users'],
    [String(totals.events), 'Total events'],
    [String(totals.registrations), 'Total registrations'],
  ];

  return (
    <>
      <div className="stats-grid">
        {stats.map(([v, l]) => <div className="stat-card" key={l}><strong>{v}</strong><span>{l}</span></div>)}
      </div>
      <div className="dashboard-content">
        <div>
          <div className="section-heading compact"><h2>Recent users</h2></div>
          {loading
            ? <p style={{ color:'var(--muted)' }}>Loading…</p>
            : recentUsers.length > 0
              ? (
                <div className="registration-list">
                  {recentUsers.map((u) => (
                    <div className="registration-row" key={u._id} style={{ gridTemplateColumns:'1fr 1fr auto' }}>
                      <div>
                        <h3 style={{ margin:0, fontSize:'15px' }}>{u.name}</h3>
                        <p style={{ margin:0 }}>{u.email} · {u.department}</p>
                      </div>
                      <p style={{ margin:0, color:'var(--muted)' }}>{u.role}</p>
                      <span className="status-open">{new Date(u.createdAt).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              )
              : <p style={{ color:'var(--muted)' }}>No users yet.</p>
          }
        </div>
        <div className="tip-card">
          <span>✦</span>
          <h3>Admin panel.</h3>
          <p>Manage users, approve events, and oversee registrations via the admin API.</p>
          <Link className="button button-dark" to="/events">Browse events</Link>
        </div>
      </div>
    </>
  );
}

/* ─── Page ────────────────────────────────────────────────────────────────── */
export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <section className="section-block dashboard">
      <div className="page-heading">
        <p className="eyebrow">{user.role} dashboard</p>
        <h1>Good to see you, {user.name}.</h1>
        <p>Here&apos;s what&apos;s happening in your campus world.</p>
      </div>
      {user.role === 'student'   && <StudentDashboard   user={user} />}
      {user.role === 'organizer' && <OrganizerDashboard user={user} />}
      {user.role === 'admin'     && <AdminDashboard />}
    </section>
  );
}
