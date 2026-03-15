import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div id="screen-landing" style={{ background: '#fff', minHeight: '100vh', overflow: 'hidden' }}>
      <nav className="pub-nav">
        <Link to="/" className="pub-logo" onClick={() => setMenuOpen(false)}>
          <div className="pub-logo-mark">A</div>
          <div>
            <div className="pub-logo-name">Alamait Property Register</div>
            <span className="pub-logo-sub">Centurion</span>
          </div>
        </Link>
        <div className="pub-nav-links">
          <a href="#features">Features</a>
        </div>
        <button type="button" className="hamburger" aria-label="Open menu" onClick={() => setMenuOpen(true)}>
          <span /><span /><span />
        </button>
        <div className="pub-nav-right">
          <Link to="/login" className="btn-ghost" onClick={() => setMenuOpen(false)}>Sign In</Link>
          <Link to="/login" className="btn-cta" onClick={() => setMenuOpen(false)}>Access System →</Link>
        </div>
      </nav>
      <div className={`pub-nav-overlay ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(false)} aria-hidden="true" />
      <div className={`pub-nav-mobile ${menuOpen ? 'open' : ''}`}>
        <button type="button" className="pub-nav-mobile-close" aria-label="Close menu" onClick={() => setMenuOpen(false)}>×</button>
        <a href="#features" className="pub-nav-mobile-link" onClick={() => setMenuOpen(false)}>Features</a>
        <Link to="/login" className="pub-nav-mobile-link" onClick={() => setMenuOpen(false)}>Sign In</Link>
        <Link to="/login" className="pub-nav-mobile-cta" onClick={() => setMenuOpen(false)}>Access System →</Link>
      </div>

      <section className="hero">
        <div className="hero-grid-bg" />
        <div className="hero-blob" />
        <div className="hero-blob2" />
        <div className="hero-content">
          <div className="hero-tag">
            <span className="hero-tag-dot" />
            Alamait · Centurion · Property Management System
          </div>
          <h1 className="hero-h1">
            Your Properties.<br /><em>Perfectly Managed.</em>
          </h1>
          <p className="hero-p">
            A secure, centralised filing system for Alamait's full property portfolio —
            registers, insurance tracking, asset inventories and document management, all in one place.
          </p>
          <div className="hero-btns">
            <Link to="/login" className="hero-btn-primary">Access the System →</Link>
            <a href="#features" className="hero-btn-secondary">Explore Features</a>
          </div>
          </div>
      </section>

      <section className="features" id="features">
        <div className="section-eyebrow">What's Inside</div>
        <h2 className="section-title">Everything your<br />portfolio needs</h2>
        <p className="section-desc">A complete, structured system designed for Alamait's property register.</p>
        <div className="feat-grid">
          {[
            { num: '01', icon: '📋', title: 'Property Register', desc: 'Full listing with valuations, purchase details, entity ownership and income tracking.' },
            { num: '02', icon: '🛡️', title: 'Insurance Tracker', desc: 'Monitor coverage status, policy details, premium schedules and renewal dates for every property.' },
            { num: '03', icon: '📦', title: 'Asset Inventory', desc: 'Track physical assets at each property — equipment, furniture, infrastructure and quantities.' },
            { num: '04', icon: '🗂️', title: 'Document Vault', desc: 'Organise title deeds, lease agreements, valuation reports and compliance certificates by property.' }
          ].map((f) => (
            <Link key={f.num} to="/login" className="feat-item" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="feat-num">{f.num}</div>
              <span className="feat-icon">{f.icon}</span>
              <div className="feat-title">{f.title}</div>
              <p className="feat-desc">{f.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-text">
          <h2 className="cta-title">Ready to access<br />your system?</h2>
          <p className="cta-desc">Authorised personnel only. Sign in securely to view the complete property register.</p>
        </div>
        <div className="cta-action">
          <Link to="/login" className="btn-cta-white">Sign In Securely →</Link>
        </div>
      </section>

      <footer className="pub-footer">
        <div className="footer-logo">Alamait Property Register · Centurion</div>
        <div className="footer-text">© {new Date().getFullYear()} Alamait Property Register · Secure Property Filing System</div>
      </footer>
    </div>
  );
}
