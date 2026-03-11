import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { usePropertyData } from '../../hooks/usePropertyData';
import { useInsuranceData } from '../../hooks/useInsuranceData';

/* ─── helpers ─────────────────────────────────────────────────── */
const fmt = (n) =>
  n != null && n !== '' ? '$' + Number(n).toLocaleString() : '—';

const TYPE_META = {
  House:      { icon: '⌂', color: '#7a1c2e' },
  Land:       { icon: '◻', color: '#186a40' },
  Flat:       { icon: '▦', color: '#2e5280' },
  Cottage:    { icon: '◈', color: '#9b2437' },
  Cluster:    { icon: '⬡', color: '#243d5e' },
  Commercial: { icon: '▤', color: '#2e5280' },
};

const typeMeta = (t) => TYPE_META[t] || { icon: '◻', color: '#7a1c2e' };
const badgeClass = (t) => ({ House: 'bh', Land: 'bl', Flat: 'bf', Cottage: 'bc', Cluster: 'bk', Commercial: 'bco', 'Commercial Property': 'bco' }[t] || 'bh');

/* ─── inline styles (navy + maroon) ───────────────────────────── */
const S = {
  root: {
    display: 'flex', flexDirection: 'column', minHeight: '100vh',
    background: '#ffffff', color: 'var(--ink)',
    fontFamily: "'IBM Plex Sans', 'Helvetica Neue', sans-serif",
  },

  /* NAV — fixed at top */
  nav: {
    display: 'flex', alignItems: 'center', gap: 0,
    padding: '0 32px', height: 58,
    background: 'var(--navy)',
    borderBottom: '3px solid var(--maroon)',
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
    boxShadow: '0 2px 16px rgba(26,46,74,0.25)',
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: 10,
    textDecoration: 'none', marginRight: 40, color: 'inherit',
  },
  logoMark: {
    width: 34, height: 34, borderRadius: 8,
    background: 'var(--maroon)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'Playfair Display', Georgia, serif",
    fontWeight: 700, fontSize: 18, color: '#fff',
  },
  logoText: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: 17, fontWeight: 600, color: '#fff',
    letterSpacing: '0.02em',
  },
  navTabs: { display: 'flex', gap: 2, flex: 1 },
  navTab: (active) => ({
    padding: '0 18px', height: 58, border: 'none', cursor: 'pointer',
    background: active ? 'rgba(255,255,255,0.06)' : 'none',
    fontSize: 13, letterSpacing: '0.06em',
    fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 500,
    textTransform: 'uppercase', transition: 'all .2s',
    color: active ? '#fff' : 'rgba(255,255,255,0.55)',
    borderBottom: active ? '2px solid var(--maroon-light)' : '2px solid transparent',
  }),
  navRight: { display: 'flex', alignItems: 'center', gap: 14 },
  userDot: {
    width: 30, height: 30, borderRadius: '50%',
    background: 'var(--maroon)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 12, color: '#fff', fontWeight: 700,
  },
  userEmail: { fontSize: 12, color: 'rgba(255,255,255,0.65)' },
  signOut: {
    padding: '6px 14px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.2)',
    background: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer',
    fontSize: 12, letterSpacing: '0.05em', fontFamily: "'IBM Plex Sans',sans-serif",
    transition: 'all .2s',
  },

  /* BODY — padding-top so content is below fixed nav */
  body: {
    flex: 1,
    padding: 'calc(58px + 36px) 40px 36px',
    maxWidth: 1240,
    width: '100%',
    margin: '0 auto',
    boxSizing: 'border-box',
    minHeight: '100vh',
  },

  /* PAGE HEADER */
  pgHd: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
    marginBottom: 32,
  },
  eyebrow: {
    fontSize: 11, fontWeight: 600, letterSpacing: '0.14em',
    textTransform: 'uppercase', color: 'var(--maroon)', marginBottom: 4,
  },
  title: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: 34, fontWeight: 600, color: 'rgba(255,255,255,0.95)', lineHeight: 1,
  },
  pgActions: { display: 'flex', gap: 10 },

  /* BUTTONS */
  btnOutline: {
    padding: '9px 18px', borderRadius: 7, cursor: 'pointer',
    border: '1px solid rgba(255,255,255,0.2)', background: 'transparent',
    color: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: 500,
    letterSpacing: '0.05em', fontFamily: "'IBM Plex Sans',sans-serif",
    transition: 'all .2s',
  },
  btnGold: {
    padding: '9px 20px', borderRadius: 7, cursor: 'pointer',
    border: 'none', background: 'var(--maroon)',
    color: '#fff', fontSize: 12, fontWeight: 600,
    letterSpacing: '0.06em', fontFamily: "'IBM Plex Sans',sans-serif",
    boxShadow: '0 4px 16px rgba(122,28,46,0.3)', transition: 'all .2s',
  },

  /* KPI ROW */
  kpiRow: {
    display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 32,
  },
  kpi: (accent) => ({
    background: 'var(--navy)', border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 12, padding: '20px 22px',
    borderLeft: `3px solid ${accent || 'rgba(255,255,255,0.08)'}`,
    position: 'relative', overflow: 'hidden',
  }),
  kpiGlow: (accent) => ({
    position: 'absolute', top: -20, right: -20,
    width: 80, height: 80, borderRadius: '50%',
    background: accent ? `${accent}18` : 'transparent',
    pointerEvents: 'none',
  }),
  kpiLbl: { fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', marginBottom: 8 },
  kpiVal: (accent) => ({
    fontFamily: "'Playfair Display',Georgia,serif",
    fontSize: 28, fontWeight: 600,
    color: accent || 'rgba(255,255,255,0.95)', lineHeight: 1, marginBottom: 4,
  }),
  kpiSub: { fontSize: 11, color: 'rgba(255,255,255,0.35)' },

  /* FILTER BAR */
  fbar: {
    display: 'flex', gap: 10, marginBottom: 20,
    background: 'var(--navy)', border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 10, padding: '10px 14px',
  },
  fi: {
    flex: 1, background: 'transparent', border: 'none', outline: 'none',
    color: 'rgba(255,255,255,0.9)', fontSize: 13, fontFamily: "'IBM Plex Sans',sans-serif",
  },
  fs: {
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 6, color: 'rgba(255,255,255,0.9)', fontSize: 12, padding: '4px 10px',
    fontFamily: "'IBM Plex Mono',monospace", outline: 'none',
  },

  /* TABLE */
  tw: { overflowX: 'auto', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    background: 'var(--navy)', padding: '13px 16px',
    textAlign: 'left', fontSize: 10, fontWeight: 700,
    letterSpacing: '0.12em', textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.5)', borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  tr: (hover) => ({
    cursor: 'pointer', transition: 'background .15s',
    background: hover ? 'rgba(122,28,46,0.08)' : 'transparent',
  }),
  td: { padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 13 },
  tdRef: { fontSize: 11, color: 'rgba(255,255,255,0.35)', fontVariantNumeric: 'tabular-nums' },
  tdName: { fontFamily: "'Playfair Display',Georgia,serif", fontSize: 15, color: 'rgba(255,255,255,0.95)', fontWeight: 600 },
  tdAddr: { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  tdMono: { fontVariantNumeric: 'tabular-nums', fontSize: 13, color: 'var(--maroon-light)', fontWeight: 500 },
  badge: (color) => ({
    display: 'inline-flex', alignItems: 'center', gap: 5,
    padding: '3px 10px', borderRadius: 20,
    background: `${color}18`, border: `1px solid ${color}40`,
    color: color, fontSize: 11, fontWeight: 600,
  }),
  tdGo: {
    padding: '5px 12px', borderRadius: 6, border: '1px solid rgba(122,28,46,0.4)',
    background: 'transparent', color: 'var(--maroon-light)', cursor: 'pointer',
    fontSize: 11, fontFamily: "'IBM Plex Sans',sans-serif", transition: 'all .2s',
  },

  /* DASHBOARD CARDS */
  propCard: (hover) => ({
    display: 'flex', alignItems: 'center', gap: 14,
    padding: '14px 18px', borderRadius: 10, cursor: 'pointer',
    border: '1px solid rgba(255,255,255,0.06)',
    background: hover ? 'rgba(122,28,46,0.08)' : 'var(--navy)',
    transition: 'all .2s', marginBottom: 10,
  }),
  propIcon: (color) => ({
    width: 40, height: 40, borderRadius: 8,
    background: `${color}18`, border: `1px solid ${color}30`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 18, color: color, flexShrink: 0,
  }),

  /* INSURANCE CARDS */
  insCard: {
    background: 'var(--navy)', border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 12, padding: '18px 20px',
  },

  /* MODAL (backdrop only; modal content uses theme classes for white bg) */
  mbg: {
    position: 'fixed', inset: 0, background: 'rgba(26,46,74,0.5)',
    backdropFilter: 'blur(4px)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', zIndex: 200,
  },
  mbody: { padding: '22px 26px' },
  mgrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 },
  mfFull: { gridColumn: '1/-1' },
  mi: {
    width: '100%', background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
    padding: '9px 12px', color: 'rgba(255,255,255,0.9)', fontSize: 13,
    fontFamily: "'IBM Plex Sans',sans-serif", outline: 'none', boxSizing: 'border-box',
  },
  ms: {
    width: '100%', background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
    padding: '9px 12px', color: 'rgba(255,255,255,0.9)', fontSize: 13,
    fontFamily: "'IBM Plex Sans',sans-serif", outline: 'none',
  },
  mfoot: {
    padding: '16px 26px 22px', display: 'flex',
    justifyContent: 'flex-end', gap: 10,
    borderTop: '1px solid rgba(255,255,255,0.06)',
  },

  /* TOAST */
  toast: {
    position: 'fixed', bottom: 28, right: 28, zIndex: 300,
    background: 'var(--maroon)',
    color: '#fff', padding: '11px 20px', borderRadius: 10,
    fontSize: 13, fontWeight: 500, boxShadow: '0 8px 24px rgba(122,28,46,0.4)',
    borderLeft: '3px solid var(--maroon-light)',
  },

  /* DETAIL MODAL */
  detailGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  detailCell: {
    background: 'rgba(255,255,255,0.03)', borderRadius: 10,
    padding: '14px 16px', border: '1px solid rgba(255,255,255,0.06)',
  },
  detailLbl: { fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 6 },
  detailVal: { fontFamily: "'Playfair Display',Georgia,serif", fontSize: 22, color: 'var(--maroon-light)', fontWeight: 600 },
};

/* ─── static data for assets & documents ──────────────────────── */
const STATIC_ASSETS = {
  Greystone: [
    { n: 'Diesel Generator', q: 1 },
    { n: 'Solar System', q: 1 },
    { n: 'Battery', q: 1 },
    { n: 'Inverter', q: 1 },
  ],
  'Mason Court': [
    { n: 'Chairs', q: 9 },
    { n: 'Printer', q: 1 },
    { n: 'Water Dispenser', q: 1 },
    { n: 'Land Phone', q: 1 },
    { n: 'Adapters (3 long)', q: 10 },
    { n: 'Heater', q: 3 },
    { n: 'White Board', q: 1 },
  ],
};

const DOCUMENT_CATEGORIES = [
  { id: 'deeds', label: 'Title Deeds', icon: '📜' },
  { id: 'insurance', label: 'Insurance', icon: '🛡️' },
  { id: 'valuations', label: 'Valuations', icon: '📊' },
  { id: 'legal', label: 'Legal', icon: '📄' },
];
const getCategoryIcon = (cat) => DOCUMENT_CATEGORIES.find((c) => c.id === cat)?.icon || '📄';

const DOCUMENTS_INITIAL = [
  { id: 'd1', name: 'Title Deed', propertyName: 'Breach',       date: 'Aug 2021', category: 'deeds', hasDigitalCopy: true,  hasPhysicalCopy: true,  physicalLocation: 'Filing cabinet A, drawer 2', digitalFileName: null },
  { id: 'd2', name: 'Title Deed', propertyName: 'Kingsmead',    date: 'Aug 2021', category: 'deeds', hasDigitalCopy: false, hasPhysicalCopy: true,  physicalLocation: 'Safe, office', digitalFileName: null },
  { id: 'd3', name: 'Title Deed', propertyName: 'Greendale',    date: 'Mar 2022', category: 'deeds', hasDigitalCopy: true,  hasPhysicalCopy: false, physicalLocation: '', digitalFileName: null },
  { id: 'd4', name: 'Insurance Policy', propertyName: 'Breach',    date: 'Jun 2024', category: 'insurance', hasDigitalCopy: true,  hasPhysicalCopy: true,  physicalLocation: 'Filing cabinet B', digitalFileName: null },
  { id: 'd5', name: 'Insurance Policy', propertyName: 'Kingsmead', date: 'Jun 2024', category: 'insurance', hasDigitalCopy: false, hasPhysicalCopy: false, physicalLocation: '', digitalFileName: null },
  { id: 'd6', name: 'Insurance Policy', propertyName: 'Cambridge', date: 'Jun 2024', category: 'insurance', hasDigitalCopy: true,  hasPhysicalCopy: false, physicalLocation: '', digitalFileName: null },
  { id: 'd7', name: 'Valuation Report', propertyName: 'Greendale', date: 'Jan 2024', category: 'valuations', hasDigitalCopy: true,  hasPhysicalCopy: true,  physicalLocation: 'Office shelf', digitalFileName: null },
  { id: 'd8', name: 'Valuation Report', propertyName: 'Kingsmead', date: 'Jan 2024', category: 'valuations', hasDigitalCopy: false, hasPhysicalCopy: true,  physicalLocation: 'Filing cabinet A', digitalFileName: null },
  { id: 'd9', name: 'Sale Agreement',   propertyName: 'Belvedere', date: 'Sep 2023', category: 'legal', hasDigitalCopy: true,  hasPhysicalCopy: true,  physicalLocation: 'Legal folder 1', digitalFileName: null },
  { id: 'd10', name: 'Lease Agreement', propertyName: 'Mason Court', date: 'Nov 2023', category: 'legal', hasDigitalCopy: false, hasPhysicalCopy: true,  physicalLocation: 'Lease files', digitalFileName: null },
];

/* ─── hover helper ────────────────────────────────────────────── */
function HoverRow({ children, onClick, style }) {
  const [h, setH] = useState(false);
  return (
    <tr
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      onClick={onClick}
      style={{ ...S.tr(h), ...style }}
    >{children}</tr>
  );
}

function HoverCard({ children, onClick, style }) {
  const [h, setH] = useState(false);
  return (
    <div
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      onClick={onClick}
      style={{ ...S.propCard(h), ...style }}
    >{children}</div>
  );
}

/* ─── main component ──────────────────────────────────────────── */
export default function AppDashboard() {
  const { logout, user } = useAuth();
  const { properties, isLoading: propLoading, addProperty } = usePropertyData();
  const { propertyInsurance, vehicleInsurance, assetInsurance, insuredCover, isLoading: insLoading } = useInsuranceData();

  const [page, setPage] = useState('dashboard');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
   const [docCategory, setDocCategory] = useState('all');
  const [docSearch, setDocSearch] = useState('');
  const [documentsList, setDocumentsList] = useState(DOCUMENTS_INITIAL);
  const [docUploadOpen, setDocUploadOpen] = useState(false);
  const [docUploadFile, setDocUploadFile] = useState(null);
  const [insCategory, setInsCategory] = useState('all');
  const [insSearch, setInsSearch] = useState('');
  const [insStatusFilter, setInsStatusFilter] = useState(''); // '', 'insured', 'uninsured'
  const [assetSearch, setAssetSearch] = useState('');
  const [assetKey, setAssetKey] = useState(Object.keys(STATIC_ASSETS)[0] || null);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailProp, setDetailProp] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [toast, setToast] = useState('');

  const totalVal = properties.reduce((s, p) => s + (p.estimatedCurrentValue || 0), 0);
  const totalInv = properties.reduce((s, p) => s + (p.totalPurchaseAmount || 0), 0);
  const roi = totalInv > 0 ? ((totalVal - totalInv) / totalInv * 100).toFixed(1) : '0';
  const roiPositive = parseFloat(roi) >= 0;

  let filtered = properties.filter(p =>
    [p.name, p.address, p.propertyType].some(v =>
      String(v).toLowerCase().includes(search.toLowerCase())
    )
  );
  if (typeFilter) filtered = filtered.filter(p => p.propertyType === typeFilter);
  if (entityFilter) filtered = filtered.filter(p => (p.ownedEntity || p.entity || '') === entityFilter);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = (msg) => setToast(msg);

  const handleSaveProperty = async (e) => {
    e.preventDefault();
    const name = document.getElementById('f-name')?.value?.trim();
    if (!name) { showToast('Enter property name'); return; }
    const price = Number(document.getElementById('f-price')?.value) || 0;
    const fees = Number(document.getElementById('f-fees')?.value) || 0;
    try {
      await addProperty({
        name,
        address: document.getElementById('f-addr')?.value?.trim() || '',
        propertyType: document.getElementById('f-type')?.value || 'House',
        ownedEntity: document.getElementById('f-entity')?.value || '',
        usage: document.getElementById('f-usage')?.value?.trim() || '',
        purchaseDate: document.getElementById('f-date')?.value || '',
        totalPurchaseAmount: price + fees,
        purchasePrice: price,
        purchaseFees: fees,
        estimatedCurrentValue: Number(document.getElementById('f-value')?.value) || 0,
        investmentRequired: Number(document.getElementById('f-investment')?.value) || 0,
        potentialIncome: Number(document.getElementById('f-income')?.value) || 0,
      });
      setModalOpen(false);
      showToast('Property added successfully');
    } catch (err) {
      showToast(err.message || 'Failed to add property');
    }
  };

  const handleDocUpload = (e) => {
    e.preventDefault();
    const name = document.getElementById('doc-name')?.value?.trim();
    if (!name) { showToast('Enter document name'); return; }
    const category = document.getElementById('doc-category')?.value || 'legal';
    const propertyName = document.getElementById('doc-property')?.value?.trim() || '—';
    const date = document.getElementById('doc-date')?.value?.trim() || new Date().toISOString().slice(0, 7);
    const hasPhysical = document.getElementById('doc-has-physical')?.checked ?? false;
    const physicalLocation = document.getElementById('doc-physical-location')?.value?.trim() || '';
    const hasDigital = !!docUploadFile;
    const newDoc = {
      id: 'd' + Date.now(),
      name,
      propertyName,
      date: date.length >= 7 ? new Date(date + '-01').toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : date,
      category,
      hasDigitalCopy: hasDigital,
      hasPhysicalCopy: hasPhysical,
      physicalLocation: hasPhysical ? physicalLocation : '',
      digitalFileName: docUploadFile?.name || null,
    };
    setDocumentsList((prev) => [...prev, newDoc]);
    setDocUploadOpen(false);
    setDocUploadFile(null);
    document.getElementById('doc-upload-form')?.reset();
    showToast('Document added. Upload storage requires backend.');
  };

  /* initials from email */
  const initials = user?.email ? user.email[0].toUpperCase() : 'U';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .modal ::placeholder { color: var(--muted); }
        .modal select option { background: #fff; color: var(--ink); }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        ::-webkit-scrollbar { width:5px; height:5px; }
        ::-webkit-scrollbar-track { background: var(--navy-deep); }
        ::-webkit-scrollbar-thumb { background: rgba(122,28,46,0.4); border-radius:10px; }
      `}</style>

      <div style={S.root}>
        {/* ── NAV ── */}
        <nav style={S.nav}>
          <Link to="/dashboard" style={S.logo}>
            <div style={S.logoMark}>A</div>
            <div style={S.logoText}>Alamait Property Register</div>
          </Link>

          <div style={S.navTabs}>
            {['dashboard', 'register', 'insurance', 'assets', 'documents'].map(p => (
              <button key={p} type="button" style={S.navTab(page === p)} onClick={() => setPage(p)}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>

          <div style={S.navRight}>
            <div style={S.userDot}>{initials}</div>
            <span style={S.userEmail}>{user?.email || 'User'}</span>
            <button type="button" style={S.signOut} onClick={logout}>Sign Out</button>
          </div>
        </nav>

        {/* ── BODY ── */}
        <div style={S.body}>

          {/* ════ DASHBOARD (light bg, no blue) ════ */}
          {page === 'dashboard' && (
            <>
              <div className="pg-hd">
                <div>
                  <div className="pg-eyebrow">Overview</div>
                  <div className="pg-title">Portfolio Dashboard</div>
                </div>
                <div className="pg-actions">
                  <button type="button" className="btn btn-outline btn-sm">↓ Export CSV</button>
                  <button type="button" className="btn btn-maroon btn-sm" onClick={() => setModalOpen(true)}>+ Add Property</button>
                </div>
              </div>

              <div className="kpi-row">
                <div className="kpi">
                  <div className="kpi-lbl">Holdings</div>
                  <div className="kpi-val">{properties.length}</div>
                  <div className="kpi-sub">Total Properties</div>
                </div>
                <div className="kpi k-maroon">
                  <div className="kpi-lbl">Current</div>
                  <div className="kpi-val">{fmt(totalVal)}</div>
                  <div className="kpi-sub">Estimated Value</div>
                </div>
                <div className={`kpi ${roiPositive ? 'k-green' : ''}`}>
                  <div className="kpi-lbl">{roiPositive ? '▲ vs purchase' : '▼ vs purchase'}</div>
                  <div className="kpi-val">{roi}%</div>
                  <div className="kpi-sub">Return on Investment</div>
                </div>
                <div className="kpi">
                  <div className="kpi-lbl">Purchase</div>
                  <div className="kpi-val">{fmt(totalInv)}</div>
                  <div className="kpi-sub">Total Invested</div>
                </div>
              </div>

              <div className="fbar">
                <input
                  className="fi"
                  type="text"
                  placeholder="Search name or address…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <select className="fs" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                  <option value="">All Types</option>
                  {Object.keys(TYPE_META).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select className="fs" value={entityFilter} onChange={e => setEntityFilter(e.target.value)}>
                  <option value="">All Entities</option>
                  {['SC', 'Alamait', 'TMT', 'Maitalan', 'VV'].map(ent => <option key={ent} value={ent}>{ent}</option>)}
                </select>
              </div>

              {propLoading && <p style={{ color: 'var(--muted)', fontSize: 13 }}>Loading properties…</p>}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10, marginTop: 8 }}>
                {filtered.slice(0, 8).map(p => {
                  const meta = typeMeta(p.propertyType);
                  return (
                    <div
                      key={p.id}
                      onClick={() => setDetailProp(p)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '12px 14px',
                        background: '#fff',
                        border: '1px solid var(--border)',
                        borderRadius: 0,
                        boxShadow: 'var(--shadow-sm)',
                        cursor: 'pointer',
                        transition: 'border-color .2s, box-shadow .2s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--navy-light)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = ''; }}
                    >
                      <div style={S.propIcon(meta.color)}>{meta.icon}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="tdname" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                        <div className="tdaddr">{p.propertyType} · {p.address || '—'}</div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div className="tdmono">{fmt(p.estimatedCurrentValue)}</div>
                        <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>est. value</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filtered.length > 8 && (
                <div style={{ textAlign: 'center', marginTop: 20 }}>
                  <button type="button" className="btn btn-outline" onClick={() => setPage('register')}>
                    View all {filtered.length} properties →
                  </button>
                </div>
              )}
            </>
          )}

          {/* ════ REGISTER ════ */}
          {page === 'register' && (
            <>
              <div className="pg-hd">
                <div>
                  <div className="pg-eyebrow">Alamait · Centurion</div>
                  <div className="pg-title">Property Register</div>
                </div>
                <div className="pg-actions">
                  <button type="button" className="btn btn-outline btn-sm">↓ CSV</button>
                  <button type="button" className="btn btn-maroon btn-sm" onClick={() => setModalOpen(true)}>+ Add Property</button>
                </div>
              </div>

              <div className="kpi-row">
                <div className="kpi">
                  <div className="kpi-lbl">Properties</div>
                  <div className="kpi-val">{filtered.length}</div>
                  <div className="kpi-sub">Listed</div>
                </div>
                <div className="kpi k-maroon">
                  <div className="kpi-lbl">Total acquisition</div>
                  <div className="kpi-val">{fmt(totalInv)}</div>
                  <div className="kpi-sub">Purchase value</div>
                </div>
                <div className="kpi">
                  <div className="kpi-lbl">Estimated</div>
                  <div className="kpi-val">{fmt(totalVal)}</div>
                  <div className="kpi-sub">Current value</div>
                </div>
                <div className={`kpi ${roiPositive ? 'k-green' : ''}`}>
                  <div className="kpi-lbl">Since acquisition</div>
                  <div className="kpi-val">{roi}%</div>
                  <div className="kpi-sub">Value growth</div>
                </div>
              </div>

              <div className="fbar">
                <input
                  className="fi"
                  type="text"
                  placeholder="Search name or address…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <select className="fs" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                  <option value="">All Types</option>
                  {Object.keys(TYPE_META).map(t => <option key={t}>{t}</option>)}
                </select>
                <select className="fs" value={entityFilter} onChange={e => setEntityFilter(e.target.value)}>
                  <option value="">All Entities</option>
                  {['SC', 'Alamait', 'TMT', 'Maitalan', 'VV'].map(ent => <option key={ent}>{ent}</option>)}
                </select>
              </div>

              {propLoading && <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 12 }}>Loading…</p>}

              <div className="tw">
                <table>
                  <thead>
                    <tr>
                      <th>Ref</th>
                      <th>Property</th>
                      <th>Type</th>
                      <th>Entity</th>
                      <th>Date</th>
                      <th>Price</th>
                      <th>Est. Value</th>
                      <th>Insurance</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p, i) => (
                      <tr key={p.id} onClick={() => setDetailProp(p)} style={{ cursor: 'pointer' }}>
                        <td className="tdref">#{String(i + 1).padStart(2, '0')}</td>
                        <td>
                          <div className="tdname">{p.name}</div>
                          <div className="tdaddr">{p.address || '—'}</div>
                        </td>
                        <td>
                          <span className={`badge ${badgeClass(p.propertyType)}`}>{p.propertyType}</span>
                        </td>
                        <td style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11 }}>{p.ownedEntity || '—'}</td>
                        <td className="tdmono">{p.purchaseDate ? p.purchaseDate.slice(0, 7) : '—'}</td>
                        <td className="tdmono">{fmt(p.totalPurchaseAmount)}</td>
                        <td className="tdmono">{fmt(p.estimatedCurrentValue)}</td>
                        <td>
                          <span className={p.insured ? 'ins-y' : 'ins-n'}>{p.insured ? '✓ Insured' : '✗ None'}</span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="tdgo"
                            onClick={e => { e.stopPropagation(); setDetailProp(p); }}
                          >View →</button>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={9} style={{ textAlign: 'center', color: 'var(--muted)', padding: '40px 0' }}>
                          No properties match your filters
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ════ INSURANCE (tabs + grid; Property tab matches screenshot) ════ */}
          {page === 'insurance' && (() => {
            const q = (insSearch || '').toLowerCase();
            const matchProp = (p) => !q || [p.propertyName, p.insurer, p.address, p.propertyRef].some(v => String(v || '').toLowerCase().includes(q));
            const matchCover = (c) => !q || [c.cover, c.insurer, c.address, c.propertyRef].some(v => String(v || '').toLowerCase().includes(q));
            const matchVehicle = (v) => !q || [v.name, v.vehicleName, v.insurer, v.provider, v.policyNumber].some(x => String(x || '').toLowerCase().includes(q));
            const isInsured = (item) => item.insurance === 'Yes' || item.insurance === true;
            let filteredPropertyInsurance = propertyInsurance.filter(matchProp);
            let filteredInsuredCover = insuredCover.filter(matchCover);
            const filteredVehicleInsurance = vehicleInsurance.filter(matchVehicle);
            if (insStatusFilter === 'insured') {
              filteredPropertyInsurance = filteredPropertyInsurance.filter(isInsured);
              filteredInsuredCover = filteredInsuredCover.filter(isInsured);
            } else if (insStatusFilter === 'uninsured') {
              filteredPropertyInsurance = filteredPropertyInsurance.filter(p => !isInsured(p));
              filteredInsuredCover = filteredInsuredCover.filter(c => !isInsured(c));
            }
            const propInsured = filteredPropertyInsurance.filter(isInsured);
            const propUninsured = filteredPropertyInsurance.filter(p => !isInsured(p));
            const totalInsuredValue = filteredPropertyInsurance.reduce((s, p) => s + (Number(p.amountInsured) || 0), 0);
            const annualPremium = filteredPropertyInsurance.reduce((s, p) => s + (Number(p.termlyPremium) || 0) * 4, 0);
            const coverInsured = filteredInsuredCover.filter(isInsured);
            const coverUninsured = filteredInsuredCover.filter(c => !isInsured(c));
            const totalCoverValue = filteredInsuredCover.reduce((s, c) => s + (Number(c.amountInsured) || 0), 0);
            const annualCoverPremium = filteredInsuredCover.reduce((s, c) => s + (Number(c.termlyPremium) || 0) * 4, 0);
            const fmtCur = (n) => (n >= 1e6 ? '$' + (n / 1e6).toFixed(2) + 'M' : n >= 1e3 ? '~$' + (n / 1e3).toFixed(0) + 'K' : '$' + (n || 0).toLocaleString());
            const nextRenewal = (d) => (d ? (typeof d === 'string' ? d.slice(0, 7) : d) : '—');
            const getPropType = (ref) => {
              const p = properties.find((x) => String(x.id) === ref || String(x.id).endsWith(ref));
              if (p?.propertyType) return p.propertyType;
              const num = parseInt(ref, 10);
              if (!isNaN(num) && properties[num - 1]) return properties[num - 1].propertyType || 'Property';
              return 'Property';
            };
            return (
              <>
                <div className="pg-hd">
                  <div>
                    <div className="pg-eyebrow">Coverage</div>
                    <div className="pg-title">Insurance Register</div>
                  </div>
                  <div className="pg-actions">
                    <button type="button" className="btn btn-maroon btn-sm" onClick={() => setModalOpen(true)}>+ Add Property</button>
                  </div>
                </div>

                {insCategory === 'property' ? (
                  <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
                    <div className="kpi k-green">
                      <div className="kpi-lbl">Insured</div>
                      <div className="kpi-val">{propInsured.length}</div>
                      <div className="kpi-sub">Properties covered</div>
                    </div>
                    <div className="kpi k-red">
                      <div className="kpi-lbl">Uninsured</div>
                      <div className="kpi-val">{propUninsured.length}</div>
                      <div className="kpi-sub">Need attention</div>
                    </div>
                    <div className="kpi">
                      <div className="kpi-lbl">Total insured value</div>
                      <div className="kpi-val">{fmtCur(totalInsuredValue)}</div>
                      <div className="kpi-sub">Sum insured</div>
                    </div>
                    <div className="kpi">
                      <div className="kpi-lbl">Annual premium</div>
                      <div className="kpi-val">{fmtCur(annualPremium)}</div>
                      <div className="kpi-sub">Est. annual cost</div>
                    </div>
                  </div>
                ) : insCategory === 'vehicle' ? (
                  <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
                    <div className="kpi k-green">
                      <div className="kpi-lbl">Policies</div>
                      <div className="kpi-val">{filteredVehicleInsurance.length}</div>
                      <div className="kpi-sub">Vehicle policies</div>
                    </div>
                    <div className="kpi k-red">
                      <div className="kpi-lbl">Uninsured</div>
                      <div className="kpi-val">0</div>
                      <div className="kpi-sub">Need attention</div>
                    </div>
                    <div className="kpi">
                      <div className="kpi-lbl">Total value</div>
                      <div className="kpi-val">—</div>
                      <div className="kpi-sub">Sum insured</div>
                    </div>
                    <div className="kpi">
                      <div className="kpi-lbl">Annual premium</div>
                      <div className="kpi-val">—</div>
                      <div className="kpi-sub">Est. annual cost</div>
                    </div>
                  </div>
                ) : insCategory === 'cover' ? (
                  <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
                    <div className="kpi k-green">
                      <div className="kpi-lbl">Insured</div>
                      <div className="kpi-val">{coverInsured.length}</div>
                      <div className="kpi-sub">Covers covered</div>
                    </div>
                    <div className="kpi k-red">
                      <div className="kpi-lbl">Uninsured</div>
                      <div className="kpi-val">{coverUninsured.length}</div>
                      <div className="kpi-sub">Need attention</div>
                    </div>
                    <div className="kpi">
                      <div className="kpi-lbl">Total insured value</div>
                      <div className="kpi-val">{totalCoverValue ? fmtCur(totalCoverValue) : '—'}</div>
                      <div className="kpi-sub">Sum insured</div>
                    </div>
                    <div className="kpi">
                      <div className="kpi-lbl">Annual premium</div>
                      <div className="kpi-val">{annualCoverPremium ? fmtCur(annualCoverPremium) : '—'}</div>
                      <div className="kpi-sub">Est. annual cost</div>
                    </div>
                  </div>
                ) : (
                  <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
                    <div className="kpi k-green">
                      <div className="kpi-lbl">Property</div>
                      <div className="kpi-val">{filteredPropertyInsurance.length}</div>
                      <div className="kpi-sub">Policies</div>
                    </div>
                    <div className="kpi">
                      <div className="kpi-lbl">Vehicle</div>
                      <div className="kpi-val">{filteredVehicleInsurance.length}</div>
                      <div className="kpi-sub">Policies</div>
                    </div>
                    <div className="kpi k-maroon">
                      <div className="kpi-lbl">Asset Cover</div>
                      <div className="kpi-val">{filteredInsuredCover.length}</div>
                      <div className="kpi-sub">Policies</div>
                    </div>
                    <div className="kpi">
                      <div className="kpi-lbl">Total</div>
                      <div className="kpi-val">{filteredPropertyInsurance.length + filteredVehicleInsurance.length + filteredInsuredCover.length}</div>
                      <div className="kpi-sub">All types</div>
                    </div>
                  </div>
                )}

                <div className="fbar">
                  <input
                    className="fi"
                    type="text"
                    placeholder="Search name, insurer, address…"
                    value={insSearch}
                    onChange={e => setInsSearch(e.target.value)}
                  />
                  {(insCategory === 'property' || insCategory === 'cover') && (
                    <select className="fs" value={insStatusFilter} onChange={e => setInsStatusFilter(e.target.value)}>
                      <option value="">All status</option>
                      <option value="insured">Insured only</option>
                      <option value="uninsured">Uninsured only</option>
                    </select>
                  )}
                </div>

                <div className="dtabs">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'property', label: 'Property Insurance' },
                    { id: 'vehicle', label: 'Vehicle' },
                    { id: 'cover', label: 'Asset Cover' },
                  ].map(({ id, label }) => (
                    <button
                      key={id}
                      type="button"
                      className={`dtab ${insCategory === id ? 'active' : ''}`}
                      onClick={() => setInsCategory(id)}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {insLoading && <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 16 }}>Loading insurance…</p>}

                {insCategory === 'property' ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
                    {filteredPropertyInsurance.length === 0 && !insLoading && (
                      <div style={{ padding: 16, background: 'var(--navy-mist)', borderRadius: 0, color: 'var(--muted)', fontSize: 13, gridColumn: '1 / -1' }}>No property insurance records</div>
                    )}
                    {filteredPropertyInsurance.map((item) => {
                      const insured = item.insurance === 'Yes' || item.insurance === true;
                      return (
                        <div
                          key={item._id || item.propertyRef}
                          style={{
                            background: '#fff',
                            border: '1px solid var(--border)',
                            borderTop: '3px solid ' + (insured ? 'var(--green)' : '#c53030'),
                            borderRadius: 0,
                            padding: '12px 14px',
                            boxShadow: 'var(--shadow-sm)',
                            cursor: 'pointer',
                          }}
                          onClick={() => showToast(item.propertyName || item.propertyRef)}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: 'var(--muted)' }}>
                              #{item.propertyRef} • {getPropType(item.propertyRef)}
                            </div>
                            <div style={{ fontSize: 12 }}>
                              <span className={insured ? 'ins-y' : 'ins-n'}>{insured ? '✓ Insured' : '✗ None'}</span>
                            </div>
                          </div>
                          <div className="tdname" style={{ marginBottom: 10 }}>{item.propertyName || '—'}</div>
                          <div style={{ marginTop: 10, borderTop: '1px solid #e0e4e8', paddingTop: 10, fontSize: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e0e4e8' }}>
                              <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>Insurer</span>
                              <span>{item.insurer || '—'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e0e4e8' }}>
                              <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>Termly premium</span>
                              <span>{item.termlyPremium != null ? '$' + Number(item.termlyPremium).toLocaleString() : '—'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e0e4e8' }}>
                              <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>Sum insured</span>
                              <span>{item.amountInsured != null ? '$' + Number(item.amountInsured).toLocaleString() : '—'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                              <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>Next renewal</span>
                              <span>{nextRenewal(item.nextPaymentDate)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : insCategory === 'cover' ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
                    {filteredInsuredCover.length === 0 && !insLoading && (
                      <div style={{ padding: 16, background: 'var(--navy-mist)', borderRadius: 0, color: 'var(--muted)', fontSize: 13, gridColumn: '1 / -1' }}>No insured cover records</div>
                    )}
                    {filteredInsuredCover.map((item) => {
                      const insured = item.insurance === 'Yes' || item.insurance === true;
                      return (
                        <div
                          key={item._id || item.propertyRef}
                          style={{
                            background: '#fff',
                            border: '1px solid var(--border)',
                            borderTop: '3px solid ' + (insured ? 'var(--green)' : '#c53030'),
                            borderRadius: 0,
                            padding: '12px 14px',
                            boxShadow: 'var(--shadow-sm)',
                            cursor: 'pointer',
                          }}
                          onClick={() => showToast(item.cover || item.propertyRef)}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: 'var(--muted)' }}>
                              #{item.propertyRef} • Cover
                            </div>
                            <div style={{ fontSize: 12 }}>
                              <span className={insured ? 'ins-y' : 'ins-n'}>{insured ? '✓ Insured' : '✗ None'}</span>
                            </div>
                          </div>
                          <div className="tdname" style={{ marginBottom: 10 }}>{item.cover || '—'}</div>
                          <div style={{ marginTop: 10, borderTop: '1px solid #e0e4e8', paddingTop: 10, fontSize: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e0e4e8' }}>
                              <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>Insurer</span>
                              <span>{item.insurer || '—'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e0e4e8' }}>
                              <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>Termly premium</span>
                              <span>{item.termlyPremium != null ? '$' + Number(item.termlyPremium).toLocaleString() : '—'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e0e4e8' }}>
                              <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>Sum insured</span>
                              <span>{item.amountInsured != null ? '$' + Number(item.amountInsured).toLocaleString() : '—'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                              <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>Next renewal</span>
                              <span>{nextRenewal(item.nextPaymentDate)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="dgrid">
                    {insCategory === 'all' && propertyInsurance.length === 0 && vehicleInsurance.length === 0 && assetInsurance.length === 0 && !insLoading && (
                      <div className="dcard" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 32, color: 'var(--muted)' }}>
                        No insurance records
                      </div>
                    )}
                    {insCategory === 'all' && propertyInsurance.map((item) => (
                      <div key={item._id || item.propertyRef} className="dcard" onClick={() => setInsCategory('property')}>
                        <div className="dicon" style={{ color: 'var(--green)' }}>⌂</div>
                        <div className="dname">{item.propertyName || item.propertyRef || '—'}</div>
                        <div className="dprop">{item.insurer || '—'}</div>
                        <div className="ddate">{nextRenewal(item.nextPaymentDate)} · {item.termlyPremium != null ? '$' + Number(item.termlyPremium).toLocaleString() : '—'}</div>
                      </div>
                    ))}
                    {(insCategory === 'all' || insCategory === 'vehicle') && vehicleInsurance.map((item, i) => (
                      <div key={item._id || item.id || i} className="dcard" onClick={() => showToast(item.name || item.vehicleName || 'Vehicle policy')}>
                        <div className="dicon">🚗</div>
                        <div className="dname">{item.name || item.vehicleName || item.title || 'Vehicle policy'}</div>
                        <div className="dprop">{item.insurer || item.provider || '—'}</div>
                        <div className="ddate">{item.policyNumber || '—'}</div>
                      </div>
                    ))}
                    {(insCategory === 'all' || insCategory === 'cover') && assetInsurance.map((item, i) => (
                      <div key={item._id || item.id || i} className="dcard" onClick={() => setInsCategory('cover')}>
                        <div className="dicon" style={{ color: 'var(--maroon)' }}>🛡</div>
                        <div className="dname">{item.cover || item.name || item.title || item.type || 'Cover'}</div>
                        <div className="dprop">{item.insurer || item.description || item.category || '—'}</div>
                        <div className="ddate">{item.nextPaymentDate ? nextRenewal(item.nextPaymentDate) : 'Asset cover'}</div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            );
          })()}

          {/* ════ ASSETS (light bg) ════ */}
          {page === 'assets' && (
            <>
              <div className="pg-hd">
                <div>
                  <div className="pg-eyebrow">Inventory</div>
                  <div className="pg-title">Asset Register</div>
                </div>
                <div className="pg-actions">
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => showToast('Export coming soon')}>
                    ↓ Export
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '230px 1fr', gap: 18 }}>
                <div style={{ background: '#fff', borderRadius: 0, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden', alignSelf: 'flex-start', position: 'sticky', top: 80 }}>
                  <div style={{ background: 'var(--navy)', padding: '13px 16px', fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)' }}>
                    Properties
                  </div>
                  {Object.keys(STATIC_ASSETS).map((name) => {
                    const active = assetKey === name;
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => setAssetKey(name)}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '11px 16px',
                          border: 'none',
                          borderBottom: '1px solid var(--border-light)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: 13,
                          cursor: 'pointer',
                          background: active ? 'var(--navy-pale)' : '#fff',
                          color: active ? 'var(--navy)' : 'var(--body)',
                          borderLeft: active ? '3px solid var(--maroon)' : '3px solid transparent',
                        }}
                      >
                        <span>{name}</span>
                        <span style={{ background: 'var(--maroon-pale)', color: 'var(--maroon)', fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, padding: '2px 7px', borderRadius: 4 }}>
                          {STATIC_ASSETS[name].length}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div style={{ background: '#fff', borderRadius: 0, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', padding: 20 }}>
                  {!assetKey && (
                    <div style={{ textAlign: 'center', padding: '56px 20px', color: 'var(--muted)' }}>
                      <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
                      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, color: 'var(--navy)' }}>Select a property</div>
                      <div style={{ fontSize: 13, marginTop: 5 }}>to view its recorded assets</div>
                    </div>
                  )}
                  {assetKey && (
                    <>
                      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, color: 'var(--navy)', marginBottom: 3 }}>
                        {assetKey}
                      </div>
                      <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: '0.15em', color: 'var(--maroon)', textTransform: 'uppercase', marginBottom: 20 }}>
                        {STATIC_ASSETS[assetKey].length} items on record
                      </div>
                      {STATIC_ASSETS[assetKey].map((a, i) => (
                        <div key={a.n + i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
                          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: 'var(--muted)', width: 20, textAlign: 'right', flexShrink: 0 }}>
                            {String(i + 1).padStart(2, '0')}
                          </div>
                          <div style={{ flex: 1, fontSize: 14, color: 'var(--body)' }}>{a.n}</div>
                          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, fontWeight: 500, color: 'var(--navy)', background: 'var(--navy-mist)', padding: '3px 10px', minWidth: 34, textAlign: 'center' }}>
                            ×{a.q}
                          </div>
                        </div>
                      ))}
                      <div style={{ marginTop: 18 }}>
                        <button type="button" className="btn btn-outline btn-sm" onClick={() => showToast('Add asset — coming soon')}>
                          + Add Asset
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ════ DOCUMENTS (light bg) ════ */}
          {page === 'documents' && (
            <>
              <div className="pg-hd">
                <div>
                  <div className="pg-eyebrow">Filing</div>
                  <div className="pg-title">Document Vault</div>
                </div>
                <div className="pg-actions">
                  <button
                    type="button"
                    className="btn btn-maroon btn-sm"
                    onClick={() => setDocUploadOpen(true)}
                  >
                    ↑ Upload
                  </button>
                </div>
              </div>

              <div className="dtabs">
                {[{ id: 'all', label: 'All' }, ...DOCUMENT_CATEGORIES].map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    className={`dtab ${docCategory === id ? 'active' : ''}`}
                    onClick={() => setDocCategory(id)}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="fbar">
                <input
                  className="fi"
                  type="text"
                  placeholder="Search name, property, location…"
                  value={docSearch}
                  onChange={e => setDocSearch(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
                <div
                  className="dcard dupload"
                  onClick={() => setDocUploadOpen(true)}
                  style={{ margin: 0, borderRadius: 0 }}
                >
                  <div className="dicon" style={{ color: 'var(--muted)' }}>↑</div>
                  <div className="dname">Upload Document</div>
                  <div className="ddate" style={{ marginTop: 3 }}>Digital copy + physical location</div>
                </div>

                {(docCategory === 'all'
                  ? documentsList
                  : documentsList.filter((d) => d.category === docCategory)
                )
                  .filter((doc) => {
                    const q = (docSearch || '').toLowerCase();
                    if (!q) return true;
                    return [doc.name, doc.propertyName, doc.category, doc.physicalLocation, doc.digitalFileName]
                      .some(v => String(v || '').toLowerCase().includes(q));
                  })
                  .map((doc) => {
                  const hasDigital = doc.hasDigitalCopy;
                  const categoryLabel = DOCUMENT_CATEGORIES.find((c) => c.id === doc.category)?.label || doc.category;
                  return (
                    <div
                      key={doc.id}
                      style={{
                        background: '#fff',
                        border: '1px solid var(--border)',
                        borderTop: '3px solid ' + (hasDigital ? 'var(--green)' : '#e0e4e8'),
                        borderRadius: 0,
                        padding: '12px 14px',
                        boxShadow: 'var(--shadow-sm)',
                        cursor: 'pointer',
                      }}
                      onClick={() => setSelectedDoc(doc)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: 'var(--muted)' }}>
                          {doc.id} • {categoryLabel}
                        </div>
                        <div style={{ fontSize: 12 }}>
                          <span className={hasDigital ? 'ins-y' : 'ins-n'}>{hasDigital ? '✓ Digital' : '✗ No digital'}</span>
                        </div>
                      </div>
                      <div className="tdname" style={{ marginBottom: 10 }}>{doc.name}</div>
                      <div style={{ marginTop: 10, borderTop: '1px solid #e0e4e8', paddingTop: 10, fontSize: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e0e4e8' }}>
                          <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>Property</span>
                          <span>{doc.propertyName || '—'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e0e4e8' }}>
                          <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>Date</span>
                          <span>{doc.date || '—'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e0e4e8' }}>
                          <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>Digital</span>
                          <span>{doc.hasDigitalCopy ? (doc.digitalFileName || 'Yes') : '—'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                          <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>Physical location</span>
                          <span style={{ textAlign: 'right', maxWidth: '60%' }}>{doc.hasPhysicalCopy ? (doc.physicalLocation || 'Yes') : '—'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* ════ ADD PROPERTY MODAL (white bg, all fields) ════ */}
        {modalOpen && (
          <div style={S.mbg} onClick={() => setModalOpen(false)}>
            <div className="modal" style={{ maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
              <div className="mhd">
                <button type="button" className="mx" onClick={() => setModalOpen(false)}>×</button>
                <div className="mtitle">Add New Property</div>
                <div className="msub">Property Register · Alamait</div>
              </div>
              <form onSubmit={handleSaveProperty}>
                <div className="mbody">
                  <div className="mgrid">
                    <div>
                      <label className="ml" htmlFor="f-name">Property Name *</label>
                      <input className="mi" id="f-name" placeholder="e.g. Cambridge" required />
                    </div>
                    <div>
                      <label className="ml" htmlFor="f-type">Type *</label>
                      <select className="ms" id="f-type">
                        {Object.keys(TYPE_META).map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="full">
                      <label className="ml" htmlFor="f-addr">Address</label>
                      <input className="mi" id="f-addr" placeholder="Full address" />
                    </div>
                    <div>
                      <label className="ml" htmlFor="f-entity">Entity</label>
                      <select className="ms" id="f-entity">
                        <option value="">—</option>
                        {['SC', 'Alamait', 'TMT', 'Maitalan', 'VV'].map(ent => <option key={ent} value={ent}>{ent}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="ml" htmlFor="f-usage">Usage</label>
                      <input className="mi" id="f-usage" placeholder="e.g. Residential, Temp School" />
                    </div>
                    <div>
                      <label className="ml" htmlFor="f-date">Purchase Date</label>
                      <input className="mi" id="f-date" type="date" />
                    </div>
                    <div>
                      <label className="ml" htmlFor="f-price">Purchase Price (USD)</label>
                      <input className="mi" id="f-price" type="number" placeholder="0" min="0" />
                    </div>
                    <div>
                      <label className="ml" htmlFor="f-fees">Fees (USD)</label>
                      <input className="mi" id="f-fees" type="number" placeholder="0" min="0" />
                    </div>
                    <div>
                      <label className="ml" htmlFor="f-value">Est. Current Value (USD)</label>
                      <input className="mi" id="f-value" type="number" placeholder="0" min="0" />
                    </div>
                    <div>
                      <label className="ml" htmlFor="f-investment">Investment Required (USD)</label>
                      <input className="mi" id="f-investment" type="number" placeholder="—" min="0" />
                    </div>
                    <div>
                      <label className="ml" htmlFor="f-income">Potential Income / month (USD)</label>
                      <input className="mi" id="f-income" type="number" placeholder="—" min="0" />
                    </div>
                  </div>
                </div>
                <div className="mfoot">
                  <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn btn-maroon">Save Property</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ════ DOCUMENT DETAIL MODAL ════ */}
        {selectedDoc && (
          <div style={S.mbg} onClick={() => setSelectedDoc(null)}>
            <div className="modal" style={{ maxWidth: 460, maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
              <div className="mhd">
                <button type="button" className="mx" onClick={() => setSelectedDoc(null)}>×</button>
                <div className="mtitle">{selectedDoc.name}</div>
                <div className="msub">Document · {selectedDoc.propertyName || '—'}</div>
              </div>
              <div className="mbody">
                <div style={{ fontSize: 13 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                    <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>Category</span>
                    <span>{DOCUMENT_CATEGORIES.find(c => c.id === selectedDoc.category)?.label || selectedDoc.category}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                    <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>Property</span>
                    <span>{selectedDoc.propertyName || '—'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                    <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>Date</span>
                    <span>{selectedDoc.date || '—'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                    <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>Digital copy</span>
                    <span>{selectedDoc.hasDigitalCopy ? (selectedDoc.digitalFileName || 'Yes') : 'No digital copy'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                    <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>Physical location</span>
                    <span style={{ textAlign: 'right', maxWidth: '60%' }}>
                      {selectedDoc.hasPhysicalCopy ? (selectedDoc.physicalLocation || 'Recorded') : 'No physical copy'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mfoot">
                <button type="button" className="btn btn-outline" onClick={() => setSelectedDoc(null)}>Close</button>
              </div>
            </div>
          </div>
        )}

        {/* ════ UPLOAD DOCUMENT MODAL ════ */}
        {docUploadOpen && (
          <div style={S.mbg} onClick={() => { setDocUploadOpen(false); setDocUploadFile(null); }}>
            <div className="modal" style={{ maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
              <div className="mhd">
                <button type="button" className="mx" onClick={() => { setDocUploadOpen(false); setDocUploadFile(null); }}>×</button>
                <div className="mtitle">Upload Document</div>
                <div className="msub">Digital copy here · physical location below</div>
              </div>
              <form id="doc-upload-form" onSubmit={handleDocUpload}>
                <div className="mbody">
                  <div className="mgrid">
                    <div className="full">
                      <label className="ml" htmlFor="doc-name">Document name *</label>
                      <input className="mi" id="doc-name" placeholder="e.g. Title Deed, Insurance Policy" required />
                    </div>
                    <div>
                      <label className="ml" htmlFor="doc-category">Category</label>
                      <select className="ms" id="doc-category">
                        {DOCUMENT_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="ml" htmlFor="doc-property">Property</label>
                      <input className="mi" id="doc-property" list="doc-property-list" placeholder="e.g. Breach, Kingsmead" />
                      <datalist id="doc-property-list">
                        {properties.map(p => <option key={p.id} value={p.name} />)}
                      </datalist>
                    </div>
                    <div>
                      <label className="ml" htmlFor="doc-date">Date (month)</label>
                      <input className="mi" id="doc-date" type="month" />
                    </div>
                    <div className="full">
                      <label className="ml" htmlFor="doc-file">Digital copy (upload here)</label>
                      <input
                        className="mi"
                        id="doc-file"
                        type="file"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={e => setDocUploadFile(e.target.files?.[0] || null)}
                      />
                      {docUploadFile && <span style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4, display: 'block' }}>Selected: {docUploadFile.name}</span>}
                    </div>
                    <div className="full" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <input type="checkbox" id="doc-has-physical" />
                      <label className="ml" htmlFor="doc-has-physical" style={{ marginBottom: 0 }}>I have a physical copy</label>
                    </div>
                    <div className="full">
                      <label className="ml" htmlFor="doc-physical-location">Physical copy location</label>
                      <input className="mi" id="doc-physical-location" placeholder="e.g. Filing cabinet A, Safe, Office shelf" />
                    </div>
                  </div>
                </div>
                <div className="mfoot">
                  <button type="button" className="btn btn-outline" onClick={() => { setDocUploadOpen(false); setDocUploadFile(null); }}>Cancel</button>
                  <button type="submit" className="btn btn-maroon">Add document</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ════ DETAIL SIDE PANEL ════ */}
        {detailProp && (
          <>
            <div className="povl open" onClick={() => setDetailProp(null)} aria-hidden="true" />
            <div className="sp open" onClick={e => e.stopPropagation()}>
              <div className="sp-hd">
                <button type="button" className="sp-x" onClick={() => setDetailProp(null)}>×</button>
                <div className="sp-ref">Property #{String((filtered.findIndex(p => p.id === detailProp.id) + 1) || 1).padStart(2, '0')} · {detailProp.ownedEntity || '—'}</div>
                <div className="sp-name">{detailProp.name}</div>
                <div className="sp-addr">{detailProp.address || '—'}</div>
              </div>
              <div className="sp-body">
                <div className="sp-sec">
                  <div className="sp-sec-t">Classification</div>
                  <div className="sp-grid">
                    <div>
                      <div className="sp-key">Type</div>
                      <div className="sp-val"><span className={`badge ${badgeClass(detailProp.propertyType)}`}>{detailProp.propertyType}</span></div>
                    </div>
                    <div>
                      <div className="sp-key">Entity</div>
                      <div className="sp-val">{detailProp.ownedEntity || '—'}</div>
                    </div>
                    <div>
                      <div className="sp-key">Usage</div>
                      <div className="sp-val">{detailProp.usage || '—'}</div>
                    </div>
                    <div>
                      <div className="sp-key">Purchase Date</div>
                      <div className="sp-val">{detailProp.purchaseDate ? detailProp.purchaseDate.slice(0, 7) : '—'}</div>
                    </div>
                  </div>
                </div>
                <div className="sp-sec">
                  <div className="sp-sec-t">Financials</div>
                  <div className="sp-grid">
                    <div>
                      <div className="sp-key">Purchase Price</div>
                      <div className="sp-val mn">{fmt(detailProp.totalPurchaseAmount)}</div>
                    </div>
                    <div>
                      <div className="sp-key">Fees</div>
                      <div className="sp-val mn">{fmt(detailProp.purchaseFees)}</div>
                    </div>
                    <div>
                      <div className="sp-key">Total Acquisition</div>
                      <div className="sp-val mn" style={{ color: 'var(--maroon)' }}>{fmt((detailProp.totalPurchaseAmount || 0) + (detailProp.purchaseFees || 0))}</div>
                    </div>
                    <div>
                      <div className="sp-key">Est. Current Value</div>
                      <div className="sp-val mn" style={{ color: 'var(--green)' }}>{fmt(detailProp.estimatedCurrentValue)}</div>
                    </div>
                    <div>
                      <div className="sp-key">Investment Req.</div>
                      <div className="sp-val mn">{detailProp.investmentRequired ? fmt(detailProp.investmentRequired) : '—'}</div>
                    </div>
                    <div>
                      <div className="sp-key">Potential Income/mo</div>
                      <div className="sp-val mn">{detailProp.potentialIncome ? fmt(detailProp.potentialIncome) : '—'}</div>
                    </div>
                  </div>
                </div>
                <div className="sp-sec">
                  <div className="sp-sec-t">Insurance</div>
                  <div className="sp-grid">
                    <div>
                      <div className="sp-key">Status</div>
                      <div className="sp-val"><span className={detailProp.insured ? 'ins-y' : 'ins-n'}>{detailProp.insured ? '✓ Insured' : '✗ Not Insured'}</span></div>
                    </div>
                    <div>
                      <div className="sp-key">Insurer</div>
                      <div className="sp-val">{detailProp.insurer || '—'}</div>
                    </div>
                    <div>
                      <div className="sp-key">Termly Premium</div>
                      <div className="sp-val mn">{detailProp.termlyPremium ? fmt(detailProp.termlyPremium) : '—'}</div>
                    </div>
                    <div>
                      <div className="sp-key">Sum Insured</div>
                      <div className="sp-val mn">{detailProp.sumInsured ? fmt(detailProp.sumInsured) : '—'}</div>
                    </div>
                    <div>
                      <div className="sp-key">Next Payment</div>
                      <div className="sp-val">{detailProp.nextPayment || '—'}</div>
                    </div>
                  </div>
                </div>
                <div className="sp-sec">
                  <div className="sp-sec-t">Documents</div>
                  {(() => {
                    const docsForProp = documentsList.filter(d => d.propertyName === detailProp.name);
                    if (!docsForProp.length) {
                      return <div style={{ fontSize: 12, color: 'var(--muted)' }}>No documents linked to this property yet.</div>;
                    }
                    return (
                      <div style={{ fontSize: 12 }}>
                        <div style={{ marginBottom: 6 }}>
                          <strong>{docsForProp.length}</strong> document{docsForProp.length > 1 ? 's' : ''} on file
                        </div>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {docsForProp.slice(0, 4).map(d => (
                            <li key={d.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                              <span>{d.name}</span>
                              <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                                {d.hasDigitalCopy ? 'Digital' : 'No digital'} · {d.hasPhysicalCopy ? 'Physical' : 'No physical'}
                              </span>
                            </li>
                          ))}
                        </ul>
                        {docsForProp.length > 4 && (
                          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
                            +{docsForProp.length - 4} more…
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
                <div className="sp-acts">
                  <button type="button" className="btn btn-navy btn-sm" onClick={() => showToast('Edit — coming soon')}>Edit</button>
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => { setDetailProp(null); setPage('documents'); }}>Documents</button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ════ TOAST ════ */}
        {toast && <div style={S.toast}>{toast}</div>}
      </div>
    </>
  );
}