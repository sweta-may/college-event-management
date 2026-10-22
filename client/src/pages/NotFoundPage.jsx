import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <section className="message-page">
      <p className="eyebrow">CampusEvents</p>
      <h1>Page not found</h1>
      <p>This campus moment seems to have moved.</p>
      <Link className="button button-primary" to="/">Back home</Link>
    </section>
  );
}
