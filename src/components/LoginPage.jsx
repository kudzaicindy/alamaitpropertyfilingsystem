import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="screen-login" style={{ display: 'flex', minHeight: '100vh' }}>
      <div className="login-left">
        <div className="ll-content">
          <Link to="/" className="ll-back" style={{ color: 'inherit', textDecoration: 'none' }}>← Back to Home</Link>
          <div className="ll-logo">
            <div className="ll-logo-mark">A</div>
            <div>
              <div className="ll-logo-name">Alamait Property Register</div>
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>Centurion · Secure Portal</div>
            </div>
          </div>
          <h2 className="ll-title">Welcome<br /><em>back.</em></h2>
          <p className="ll-desc">Access your complete property portfolio — registers, insurance, assets and documents.</p>
        </div>
      </div>
      <div className="login-right">
        <div className="login-box">
          <div className="login-box-tag">🔒 Secure System Login</div>
          <div className="login-box-title">Sign In</div>
          <div className="login-box-sub">Alamait Property Register</div>
          <form onSubmit={handleSubmit}>
            {error && <div className="l-err show">{error}</div>}
            <div className="l-field">
              <label className="l-label">Email</label>
              <input className="l-input" type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
            </div>
            <div className="l-field">
              <label className="l-label">Password</label>
              <input className="l-input" type="password" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
            </div>
            <button type="submit" className="btn-login" disabled={loading}>{loading ? 'Signing in...' : 'Sign In to Dashboard →'}</button>
          </form>
          <div className="l-footer">
            <Link to="/register" style={{ color: 'var(--maroon)' }}>Create an account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
