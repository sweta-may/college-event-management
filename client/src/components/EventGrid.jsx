import EventCard from './EventCard';

export default function EventGrid({ events }) {
  return (
    <div className="event-grid">
      {events.map((e) => <EventCard key={e._id} event={e} />)}
    </div>
  );
}
