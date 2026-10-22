import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="app-shell">
      <header className="navbar">
        <Link className="brand" to="/">
          <span className="brand-mark">CE</span>
          <span>Campus<span>Events</span></span>
        </Link>

        <nav className="nav-links">
          <Link to="/events">Explore events</Link>
          {user && <Link to="/dashboard">Dashboard</Link>}
          {user?.role === 'student' && <Link to="/registrations">My registrations</Link>}
        </nav>

        <div className="nav-actions">
          {user ? (
            <>
              <span className="user-pill">{user.name} · {user.role}</span>
              <button className="button button-ghost" onClick={handleLogout}>Log out</button>
            </>
          ) : (
            <>
              <Link className="button button-ghost" to="/login">Log in</Link>
              <Link className="button button-primary" to="/signup">Get started</Link>
            </>
          )}
        </div>
      </header>

      <main className="page-content"><Outlet /></main>

      <footer className="footer">
        <strong>CampusEvents</strong>
        <span>Make every campus moment count.</span>
      </footer>
    </div>
  );
}
