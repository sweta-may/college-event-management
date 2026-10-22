import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { events as eventsApi, registrations as regApi } from '../api/api';
import { useAuth } from '../context/AuthContext';

export default function EventDetailsPage() {
  const { eventId } = useParams();
  const { user }    = useAuth();
  const navigate    = useNavigate();

  const [event,      setEvent]      = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [loadError,  setLoadError]  = useState(null);
  const [registering,setRegistering]= useState(false);
  const [registered, setRegistered] = useState(false);
  const [regError,   setRegError]   = useState(null);

  useEffect(() => {
    eventsApi.get(eventId)
      .then((res) => setEvent(res.data.event))
      .catch(() => setLoadError('Event not found or unavailable.'))
      .finally(() => setLoading(false));
  }, [eventId]);

  if (loading) return (
    <div style={{ padding: '80px 24px', textAlign: 'center', color: 'var(--muted)' }}>Loading…</div>
  );

  if (loadError || !event) return (
    <section className="message-page">
      <p className="eyebrow">CampusEvents</p>
      <h1>Event not found</h1>
      <p>{loadError ?? 'This event may have been removed.'}</p>
      <Link className="button button-primary" to="/events">Back to events</Link>
    </section>
  );

  const isFull        = (event.registeredCount ?? 0) >= event.capacity;
  const deadlinePassed = new Date() > new Date(event.registrationDeadline);
  const isCancelled   = event.status === 'cancelled';
  const canRegister   = user?.role === 'student' && !isFull && !deadlinePassed && !isCancelled;
  const spotsLeft     = Math.max(0, event.capacity - (event.registeredCount ?? 0));
  const startDate     = new Date(event.startDate);

  const handleRegister = async () => {
    if (!user) return navigate('/login');
    setRegistering(true);
    setRegError(null);
    try {
      await regApi.register(event._id);
      setRegistered(true);
      setEvent((prev) => ({ ...prev, registeredCount: (prev.registeredCount ?? 0) + 1 }));
    } catch (err) {
      setRegError(err.response?.data?.message ?? 'Registration failed. Please try again.');
    } finally {
      setRegistering(false);
    }
  };

  return (
    <section className="section-block details-page">
      <Link className="back-link" to="/events">← Back to events</Link>
      <div className="detail-layout">
        <div>
          <span className="event-category">{event.category}</span>
          <h1>{event.title}</h1>
          <p className="detail-description">{event.description}</p>
          <div className="detail-meta">
            <span>
              ◷ <strong>
                {startDate.toLocaleDateString('en-US', { weekday:'short', month:'long', day:'numeric', year:'numeric' })}
              </strong>
              <small>{startDate.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' })}</small>
            </span>
            <span>⌖ <strong>{event.venue}</strong><small>Campus venue</small></span>
            <span>◎ <strong>{event.organizer?.name ?? 'Organizer'}</strong><small>{event.organizer?.department}</small></span>
          </div>
        </div>

        <aside className="registration-panel">
          <p className="eyebrow">Registration</p>
          <h3>
            {isCancelled ? 'Event cancelled'
              : isFull ? 'This event is full'
              : deadlinePassed ? 'Registration closed'
              : 'Reserve your spot'}
          </h3>
          <p>{spotsLeft} of {event.capacity} spots remaining</p>

          {registered ? (
            <div className="success-message">
              You&apos;re registered! Check your dashboard for details.
            </div>
          ) : (
            <>
              <button
                className="button button-primary button-full"
                disabled={!canRegister || registering}
                onClick={handleRegister}
              >
                {registering ? 'Registering…'
                  : !user ? 'Log in to register'
                  : user.role !== 'student' ? 'Only students can register'
                  : 'Register for event'}
              </button>
              {regError && <p style={{ color: '#b45d4d', fontSize: '12px', marginTop: '10px' }}>{regError}</p>}
              {!user && <Link className="panel-link" to="/login">Already have an account? Log in</Link>}
            </>
          )}
        </aside>
      </div>
    </section>
  );
}
