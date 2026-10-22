import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

export default function SignupPage() {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [form, setForm] = useState({ name:'', email:'', password:'', department:'', role:'student' });
  const [error,      setError]      = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setSubmitting(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message ?? 'Signup failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Join the community."
      subtitle="One account for every event, club, and connection."
      onSubmit={handleSubmit}
      submitLabel={submitting ? 'Creating account…' : 'Create account'}
      error={error}
    >
      <input required name="name"       placeholder="Full name"                           value={form.name}       onChange={handleChange} />
      <input required name="email"      type="email" placeholder="College email"          value={form.email}      onChange={handleChange} />
      <input required name="department" placeholder="Department (e.g. Computer Science)" value={form.department} onChange={handleChange} />
      <select name="role" value={form.role} onChange={handleChange}>
        <option value="student">Student</option>
        <option value="organizer">Event Organizer</option>
      </select>
      <input required name="password" type="password" placeholder="Password (min. 6 chars)" value={form.password} onChange={handleChange} />
      <p className="form-note">
        Already have an account? <Link to="/login" style={{ color: 'var(--orange)' }}>Log in</Link>
      </p>
    </AuthCard>
  );
}
