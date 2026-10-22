import { useEffect, useState } from 'react';
import { events as eventsApi } from '../api/api';
import EventGrid from '../components/EventGrid';

const CATEGORIES = ['All', 'technical', 'cultural', 'sports', 'other'];

export default function EventsPage() {
  const [allEvents, setAllEvents] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [query,     setQuery]     = useState('');
  const [category,  setCategory]  = useState('All');

  useEffect(() => {
    setLoading(true);
    setError(null);
    const params = { limit: 50 };
    if (category !== 'All') params.category = category;

    eventsApi.list(params)
      .then((res) => setAllEvents(res.data.events ?? []))
      .catch((err) => setError(err.response?.data?.message ?? 'Failed to load events'))
      .finally(() => setLoading(false));
  }, [category]);

  const filtered = allEvents.filter((e) =>
    e.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <section className="section-block events-page">
      <div className="page-heading">
        <p className="eyebrow">Discover</p>
        <h1>All events</h1>
        <p>There&apos;s always something happening on campus.</p>
      </div>

      <div className="filters">
        <input
          aria-label="Search events"
          placeholder="Search events…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c === 'All' ? 'All categories' : c.charAt(0).toUpperCase() + c.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {loading && <p style={{ color: 'var(--muted)' }}>Loading events…</p>}
      {error   && <p style={{ color: '#b45d4d' }}>{error}</p>}
      {!loading && !error && (
        filtered.length > 0
          ? <EventGrid events={filtered} />
          : <div className="empty-state"><h3>No events found</h3><p>Try a different search or category.</p></div>
      )}
    </section>
  );
}
