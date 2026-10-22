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
          <h3>Make your mark.</h3>
          <p>Have an event idea? Bring your community together.</p>
          <Link className="button button-dark" to="/events">See what&apos;s possible</Link>
        </div>
      </div>
    </>
  );
}

/* ─── Organizer ───────────────────────────────────────────────────────────── */
function OrganizerDashboard({ user }) {
  const [myEvents, setMyEvents] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    eventsApi.list({ limit: 50 })
      .then((res) => {
        const uid   = user.id ?? user._id;
        const owned = (res.data.events ?? []).filter((e) => e.organizer?._id === uid);
        setMyEvents(owned);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

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
      <div className="dashboard-content">
        <div>
          <div className="section-heading compact"><h2>Your events</h2></div>
          {loading
            ? <p style={{ color: 'var(--muted)' }}>Loading…</p>
            : myEvents.length > 0
              ? <EventGrid events={myEvents.slice(0, 4)} />
              : <p style={{ color: 'var(--muted)' }}>You haven&apos;t created any events yet.</p>
          }
        </div>
        <div className="tip-card">
          <span>✦</span>
          <h3>Grow your event.</h3>
          <p>Use the API to publish events and manage attendees.</p>
          <Link className="button button-dark" to="/events">Browse events</Link>
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
