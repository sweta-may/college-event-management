import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { registrations as regApi } from '../api/api';

export default function RegistrationsPage() {
  const [registrations, setRegistrations] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    regApi.getMyRegistrations()
      .then((res) => setRegistrations(res.data.registrations ?? []))
      .catch((err) => setError(err.response?.data?.message ?? 'Failed to load registrations'))
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (regId) => {
    if (!window.confirm('Cancel this registration?')) return;
    setCancelling(regId);
    try {
      await regApi.cancel(regId);
      setRegistrations((prev) =>
        prev.map((r) => r._id === regId ? { ...r, status: 'cancelled' } : r)
      );
    } catch (err) {
      alert(err.response?.data?.message ?? 'Could not cancel registration.');
    } finally {
      setCancelling(null);
    }
  };

  return (
    <section className="section-block">
      <div className="page-heading">
        <p className="eyebrow">Your activity</p>
        <h1>My registrations</h1>
        <p>Keep track of the moments you&apos;ve reserved.</p>
      </div>

      {loading && <p style={{ color: 'var(--muted)' }}>Loading registrations…</p>}
      {error   && <p style={{ color: '#b45d4d' }}>{error}</p>}

      {!loading && !error && registrations.length === 0 && (
        <div className="empty-state">
          <h3>No registrations yet</h3>
          <p>Explore events and reserve your spot.</p>
          <Link className="button button-primary" to="/events">Explore events</Link>
        </div>
      )}

      {!loading && !error && registrations.length > 0 && (
        <div className="registration-list">
          {registrations.map((reg) => {
            const ev = reg.eventId;
            if (!ev) return null;
            const dateObj     = new Date(ev.startDate);
            const isCancelled = reg.status === 'cancelled';

            return (
              <div className="registration-row" key={reg._id}>
                <div className="mini-date">
                  <strong>{dateObj.getDate()}</strong>
                  <span>{dateObj.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}</span>
                </div>
                <div>
                  <h3>{ev.title}</h3>
                  <p>{dateObj.toLocaleDateString()} · {ev.venue}</p>
                </div>
                <span className={isCancelled ? 'status-full' : 'status-open'}>
                  {reg.status.charAt(0).toUpperCase() + reg.status.slice(1)}
                </span>
                {!isCancelled && (
                  <button
                    className="button button-ghost"
                    style={{ fontSize: '11px', padding: '6px 12px' }}
                    onClick={() => handleCancel(reg._id)}
                    disabled={cancelling === reg._id}
                  >
                    {cancelling === reg._id ? 'Cancelling…' : 'Cancel'}
                  </button>
                )}
                <Link to={`/events/${ev._id}`}>View →</Link>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
