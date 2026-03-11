import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    username: '', email: '', password: '', confirmPassword: '',
    firstName: '', lastName: '', role: 'assistant'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await register({
        username: form.username,
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        role: form.role
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  return (
    <div id="screen-login" style={{ display: 'flex', minHeight: '100vh' }}>
      <div className="login-left">
        <div className="ll-content">
          <Link to="/" className="ll-back" style={{ color: 'inherit', textDecoration: 'none' }}>← Back to Home</Link>
          <div className="ll-logo">
            <div className="ll-logo-mark">A</div>
            <div>
              <div className="ll-logo-name">Alamait Property Register</div>
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>Create account</div>
            </div>
          </div>
          <h2 className="ll-title">Join us.</h2>
          <p className="ll-desc">Create your account to access the property register.</p>
        </div>
      </div>
      <div className="login-right">
        <div className="login-box">
          <div className="login-box-tag">Create account</div>
          <div className="login-box-title">Register</div>
          <div className="login-box-sub">Alamait Property Register</div>
          <form onSubmit={handleSubmit}>
            {error && <div className="l-err show">{error}</div>}
            {['username', 'email', 'firstName', 'lastName'].map(f => (
              <div key={f} className="l-field">
                <label className="l-label">{f.replace(/([A-Z])/g, ' $1').trim()}</label>
                <input className="l-input" type={f === 'email' ? 'email' : 'text'} value={form[f]} onChange={e => update(f, e.target.value)} required />
              </div>
            ))}
            <div className="l-field">
              <label className="l-label">Role</label>
              <select className="l-input" value={form.role} onChange={e => update('role', e.target.value)}>
                <option value="assistant">Assistant</option>
                <option value="property_manager">Property Manager</option>
                <option value="finance">Finance</option>
                <option value="ceo">CEO</option>
              </select>
            </div>
            <div className="l-field">
              <label className="l-label">Password</label>
              <input className="l-input" type="password" value={form.password} onChange={e => update('password', e.target.value)} required />
            </div>
            <div className="l-field">
              <label className="l-label">Confirm password</label>
              <input className="l-input" type="password" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} required />
            </div>
            <button type="submit" className="btn-login" disabled={loading}>{loading ? 'Creating...' : 'Create account'}</button>
          </form>
          <div className="l-footer">
            <Link to="/login" style={{ color: 'var(--maroon)' }}>Already have an account? Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
