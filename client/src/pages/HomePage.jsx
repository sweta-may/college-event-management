import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { events as eventsApi } from '../api/api';
import EventGrid from '../components/EventGrid';

export default function HomePage() {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    eventsApi.list({ status: 'upcoming', limit: 4 })
      .then((res) => setFeatured(res.data.events ?? []))
      .catch(() => {});
  }, []);

  return (
    <>
      <section className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow">Your campus, your community</p>
          <h1>Find your next <em>unforgettable</em> campus moment.</h1>
          <p className="hero-description">
            Discover events, connect with your community, and make memories that last beyond graduation.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary button-large" to="/events">
              Explore events <span>→</span>
            </Link>
            <Link className="text-link" to="/signup">
              Create an account <span>↗</span>
            </Link>
          </div>
        </div>
        <div className="hero-art">
          <div className="art-card art-card-main">
            <span>14</span><small>NOV</small>
            <strong>TechFest<br />2026</strong>
            <i>✦</i>
          </div>
          <div className="art-card art-card-float">
            <span>✦</span><strong>Find your<br />people.</strong>
          </div>
          <div className="art-circle" />
        </div>
      </section>

      <section className="feature-strip">
        <div><strong>500+</strong><span>events every year</span></div>
        <div><strong>12k</strong><span>students connected</span></div>
        <div><strong>40+</strong><span>active communities</span></div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Happening soon</p>
            <h2>Don&apos;t miss out.</h2>
          </div>
          <Link className="text-link" to="/events">View all events →</Link>
        </div>
        {featured.length > 0
          ? <EventGrid events={featured.slice(0, 2)} />
          : <p style={{ color: 'var(--muted)' }}>No upcoming events yet — check back soon!</p>
        }
      </section>
    </>
  );
}
