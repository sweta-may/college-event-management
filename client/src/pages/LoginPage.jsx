import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AuthCard({ title, subtitle, onSubmit, submitLabel, error, children }) {
  return (
    <section className="auth-page">
      <div className="auth-card">
        <p className="eyebrow">CampusEvents</p>
        <h1>{title}</h1>
        <p>{subtitle}</p>
        <form onSubmit={onSubmit}>
          {children}
          {error && <p style={{ color: '#b45d4d', fontSize: '12px', margin: 0 }}>{error}</p>}
          <button className="button button-primary button-full" type="submit">{submitLabel} →</button>
        </form>
        <p className="auth-switch">By continuing, you agree to our community guidelines.</p>
      </div>
    </section>
  );
}

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate        = useNavigate();
  const location        = useLocation();
  const from            = location.state?.from ?? '/dashboard';

  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [error,      setError]      = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (user) navigate(from, { replace: true }); }, [user, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message ?? 'Login failed. Check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Welcome back."
      subtitle="Log in to keep up with your campus community."
      onSubmit={handleSubmit}
      submitLabel={submitting ? 'Logging in…' : 'Log in'}
      error={error}
    >
      <input required type="email"    placeholder="College email" value={email}    onChange={(e) => setEmail(e.target.value)} />
      <input required type="password" placeholder="Password"      value={password} onChange={(e) => setPassword(e.target.value)} />
      <p className="form-note">
        Don&apos;t have an account? <Link to="/signup" style={{ color: 'var(--orange)' }}>Sign up</Link>
      </p>
    </AuthCard>
  );
}
