import { Link } from 'react-router-dom';

export default function UnauthorizedPage() {
  return (
    <section className="message-page">
      <p className="eyebrow">CampusEvents</p>
      <h1>Access restricted</h1>
      <p>You do not have permission to view this page.</p>
      <Link className="button button-primary" to="/events">Explore public events</Link>
    </section>
  );
}
