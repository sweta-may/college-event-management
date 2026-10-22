import { Link } from 'react-router-dom';

export default function EventCard({ event }) {
  const registered = event.registeredCount ?? 0;
  const capacity   = event.capacity ?? 1;
  const fill       = Math.min(100, Math.round((registered / capacity) * 100));
  const isFull     = registered >= capacity;
  const catClass   = (event.category ?? 'other').toLowerCase();

  const dateObj  = event.startDate ? new Date(event.startDate) : null;
  const dayNum   = dateObj ? String(dateObj.getDate()).padStart(2, '0') : '--';
  const monthStr = dateObj
    ? dateObj.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
    : '---';

  return (
    <article className="event-card">
      <div className={`event-color ${catClass}`}>
        <span>{event.category}</span>
        <strong>{dayNum}</strong>
        <small>{monthStr}</small>
      </div>
      <div className="event-card-body">
        <span className="event-category">{event.category}</span>
        <h3>{event.title}</h3>
        <p>
          {event.venue} ·{' '}
          {dateObj
            ? dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
            : 'TBD'}
        </p>
        <div className="card-footer">
          <span className={isFull ? 'status-full' : 'status-open'}>
            {isFull ? 'Full' : event.status ?? 'Open'}
          </span>
          <Link to={`/events/${event._id}`}>View details →</Link>
        </div>
        <div className="capacity">
          <span style={{ width: `${fill}%` }} />
        </div>
      </div>
    </article>
  );
}
