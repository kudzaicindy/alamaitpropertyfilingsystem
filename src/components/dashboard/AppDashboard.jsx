import React, { useState, useEffect, useRef, useMemo, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { usePropertyData } from '../../hooks/usePropertyData';
import { useInsuranceData } from '../../hooks/useInsuranceData';
import { useDocuments } from '../../hooks/useDocuments';
import { usePropertyDocuments } from '../../hooks/usePropertyDocuments';
import { useAssets } from '../../hooks/useAssets';

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
    display: 'inline-flex', alignItems: 'center', gap: 6,
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

/* ─── documents ────────────────────────────────────────────────── */
const DOCUMENT_CATEGORIES = [
  { id: 'deeds', label: 'Title Deeds', icon: '📜' },
  { id: 'plans', label: 'Plans', icon: '📐' },
  { id: 'permits', label: 'Permits', icon: '📑' },
  { id: 'insurance', label: 'Insurance', icon: '🛡️' },
  { id: 'valuations', label: 'Valuations', icon: '📊' },
  { id: 'legal', label: 'Legal', icon: '📄' },
];
const getCategoryIcon = (cat) => DOCUMENT_CATEGORIES.find((c) => c.id === cat)?.icon || '📄';

/** Assign each digital file to one checklist row. Plan-like files → Plans (not Lease) even if stored as type "legal". */
function buildVaultChecklist(row, apiDocsForProperty) {
  const list = (apiDocsForProperty || []).filter((d) => d.digitalFileUrl);
  const used = new Set();
  const take = (pred) => {
    const d = list.find((x) => !used.has(x) && pred(x));
    if (d) used.add(d);
    return d || null;
  };
  const type = (d) => String(d.category || d.documentType || '').toLowerCase();
  const title = (d) => `${d.name || ''} ${d.digitalFileName || ''} ${d.title || ''}`.toLowerCase();
  const urlFromText = (v) => {
    const s = String(v || '').trim();
    return s && /^https?:\/\//i.test(s) ? s : null;
  };
  const findDocByUrl = (url) => {
    if (!url) return null;
    return (apiDocsForProperty || []).find(d => d?.digitalFileUrl === url) || null;
  };
  const looksLikePlan = (d) => {
    const t = title(d);
    const u = String(d.digitalFileUrl || d.digitalFileKey || '').toLowerCase();
    if (type(d) === 'plans') return true;
    if (/\bplan\b|plans?\b|floor\s*plan|layout|blueprint|site\s*plan|as[-\s]?built|existing_plan|_plan|plan\.(pdf|png|jpg)/i.test(t)) return true;
    if (/\/plan|_plan|existing_plan|floorplan|siteplan/i.test(u)) return true;
    return /\bplan\b/i.test(t) && !/\blease\b|tenancy|sublease/i.test(t);
  };
  const looksLikeLease = (d) => /\blease\b|tenancy|letting|rental\s*agre|sublease|landlord/i.test(title(d));

  const deedsDoc = take((d) => type(d) === 'deeds');
  const permitsDoc = take((d) => type(d) === 'permits');
  const plansDoc = take((d) => type(d) === 'plans')
    || take((d) => looksLikePlan(d) && type(d) !== 'deeds' && type(d) !== 'permits');
  const leaseDoc = take((d) => type(d) === 'legal' && looksLikeLease(d) && !looksLikePlan(d))
    || take((d) => type(d) === 'legal' && !looksLikePlan(d));
  const generalDoc = take((d) => type(d) === 'general');

  const slot = (doc) => (doc ? { url: doc.digitalFileUrl, doc } : null);
  const digDeeds = slot(deedsDoc);
  const digPlans = slot(plansDoc);
  const digPermits = slot(permitsDoc);
  const digLease = slot(leaseDoc);
  const digGeneral = slot(generalDoc);

  // Fallback: sometimes the property register stores the uploaded filename/text,
  // while /api/documents grouping might not have matched perfectly.
  // If we can find a matching uploaded doc by filename/text, enable View correctly.
  const norm2 = (s) => String(s || '')
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const findByExpected = (docType, expectedText) => {
    const expected = norm2(expectedText);
    if (!expected) return null;
    const match = (apiDocsForProperty || []).find((d) => {
      if (!d?.digitalFileUrl) return false;
      if (type(d) !== docType) return false;
      const file = norm2(d.digitalFileName || '');
      const titleTxt = norm2(d.title || d.name || '');
      const key = norm2(d.digitalFileKey || '');
      return (
        (file && file.includes(expected)) ||
        (titleTxt && titleTxt.includes(expected)) ||
        (key && key.includes(expected)) ||
        (expected && file && expected.includes(file))
      );
    });
    return match ? { url: match.digitalFileUrl, doc: match } : null;
  };

  const digDeedsFinal = digDeeds || findByExpected('deeds', row.titleDeedsDigitalDescription);
  const digPlansFinal = digPlans || findByExpected('plans', row.plansDescription);
  const digPermitsFinal = digPermits || findByExpected('permits', row.permitsDescription);
  const digLeaseFinal = digLease || findByExpected('legal', row.leaseAgreementDescription);
  const digGeneralFinal = digGeneral || findByExpected('general', row.fileLocationNotes);

  // If the property register already stores the URL in the text fields,
  // enable View directly even if /api/documents doesn't group it correctly.
  const deedsRegisterUrl = urlFromText(row.titleDeedsDigitalDescription);
  const plansRegisterUrl = urlFromText(row.plansDescription);
  const permitsRegisterUrl = urlFromText(row.permitsDescription);
  const leaseRegisterUrl = urlFromText(row.leaseAgreementDescription);
  const generalRegisterUrl = urlFromText(row.fileLocationNotes);

  const digDeedsFinalUrl = digDeedsFinal?.url || deedsRegisterUrl;
  const digPlansFinalUrl = digPlansFinal?.url || plansRegisterUrl;
  const digPermitsFinalUrl = digPermitsFinal?.url || permitsRegisterUrl;
  const digLeaseFinalUrl = digLeaseFinal?.url || leaseRegisterUrl;
  const digGeneralFinalUrl = digGeneralFinal?.url || generalRegisterUrl;

  const digDeedsFinalDoc = digDeedsFinal?.doc || findDocByUrl(digDeedsFinalUrl);
  const digPlansFinalDoc = digPlansFinal?.doc || findDocByUrl(digPlansFinalUrl);
  const digPermitsFinalDoc = digPermitsFinal?.doc || findDocByUrl(digPermitsFinalUrl);
  const digLeaseFinalDoc = digLeaseFinal?.doc || findDocByUrl(digLeaseFinalUrl);
  const digGeneralFinalDoc = digGeneralFinal?.doc || findDocByUrl(digGeneralFinalUrl);

  const items = [
    {
      key: 'deeds',
      label: 'Title deed',
      uploadType: 'deeds',
      physical: !!(row.titleDeedsPhysicalLocation || '').trim(),
      digital: !!(row.titleDeedsDigitalDescription || '').trim() || !!digDeedsFinalUrl,
      digitalUrl: digDeedsFinalUrl || null,
      viewDoc: digDeedsFinalDoc || null,
    },
    {
      key: 'plans',
      label: 'Plans',
      uploadType: 'plans',
      physical: !!(row.plansDescription || '').trim(),
      digital: !!(row.plansDescription || '').trim() || !!digPlansFinalUrl,
      digitalUrl: digPlansFinalUrl || null,
      viewDoc: digPlansFinalDoc || null,
    },
    {
      key: 'permits',
      label: 'Permits',
      uploadType: 'permits',
      physical: !!(row.permitsDescription || '').trim(),
      digital: !!(row.permitsDescription || '').trim() || !!digPermitsFinalUrl,
      digitalUrl: digPermitsFinalUrl || null,
      viewDoc: digPermitsFinalDoc || null,
    },
    {
      key: 'lease',
      label: 'Lease agreement',
      uploadType: 'legal',
      physical: !!(row.leaseAgreementDescription || '').trim(),
      digital: !!(row.leaseAgreementDescription || '').trim() || !!digLeaseFinalUrl,
      digitalUrl: digLeaseFinalUrl || null,
      viewDoc: digLeaseFinalDoc || null,
    },
    {
      key: 'general',
      label: 'General docs',
      uploadType: 'general',
      physical: !!(row.fileLocationNotes || '').trim(),
      digital: !!(row.fileLocationNotes || '').trim() || !!digGeneralFinalUrl,
      digitalUrl: digGeneralFinalUrl || null,
      viewDoc: digGeneralFinalDoc || null,
    },
  ];
  const bothCount = items.filter((i) => i.digital && i.physical).length;
  const missingDigital = items.filter((i) => !i.digital).length;
  const isFullyComplete = bothCount === items.length;
  return { items, bothCount, total: items.length, isFullyComplete, missingDigital };
}

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
  const { logout, user, fetchWithAuth } = useAuth();
  const { properties, isLoading: propLoading, addProperty, updateProperty, deleteProperty } = usePropertyData();
  const { propertyInsurance, vehicleInsurance, assetInsurance, insuredCover, isLoading: insLoading, updateInsurance, deleteInsurance, refreshInsuranceData } = useInsuranceData();
  const {
    documents: documentsList,
    uploadDocument,
    getDocument,
    refreshDocuments,
  } = useDocuments(properties);
  const {
    propertyDocuments,
    isLoading: propDocsLoading,
    getPropertyDocument,
    updatePropertyDocument,
    deletePropertyDocument,
    uploadPropertyDocumentFile,
    refreshPropertyDocuments,
  } = usePropertyDocuments();
  const { assets, isLoading: assetsLoading, addAsset: apiAddAsset, deleteAsset: apiDeleteAsset, refreshAssets } = useAssets();

  const [page, setPage] = useState('dashboard');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [docCategory, setDocCategory] = useState('all');
  const [docSearch, setDocSearch] = useState('');
  const [docUploadOpen, setDocUploadOpen] = useState(false);
  const [docUploadFile, setDocUploadFile] = useState(null);
  const [docUploadPropertyId, setDocUploadPropertyId] = useState('');
  const [docUploadCategory, setDocUploadCategory] = useState('deeds');
  const [docVaultCompliance, setDocVaultCompliance] = useState('all'); // all | incomplete | complete
  const [docVaultExpandedId, setDocVaultExpandedId] = useState(null);
  const [docUploading, setDocUploading] = useState(false);
  const [insCategory, setInsCategory] = useState('all');
  const [insSearch, setInsSearch] = useState('');
  const [insStatusFilter, setInsStatusFilter] = useState(''); // '', 'insured', 'uninsured'
  const [assetSearch, setAssetSearch] = useState('');
  const assetMapFromApi = useMemo(() => {
    const m = {};
    const seen = {}; // per property: Set of lowercased names to avoid duplicates
    (assets || []).forEach(a => {
      const p = a.propertyName || 'Property';
      if (!m[p]) { m[p] = []; seen[p] = new Set(); }
      const nameKey = (a.name || '').trim().toLowerCase();
      if (nameKey && !seen[p].has(nameKey)) {
        seen[p].add(nameKey);
        m[p].push({ n: a.name, q: a.quantity ?? 1, id: a._id || a.id });
      }
    });
    return m;
  }, [assets]);
  const [assetSnapshots, setAssetSnapshots] = useState({}); // { 'YYYY-MM-DD': { propertyName: [{n,q}], ... } }
  const [assetViewDate, setAssetViewDate] = useState(null); // null = current, else snapshot date
  const [assetKey, setAssetKey] = useState(null);
  const [assetAddOpen, setAssetAddOpen] = useState(false);
  const [assetAddProperty, setAssetAddProperty] = useState('');
  const [assetAddName, setAssetAddName] = useState('');
  const [assetAddQty, setAssetAddQty] = useState('1');
  const assetCsvInputRef = useRef(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailProp, setDetailProp] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [docDetail, setDocDetail] = useState(null); // full doc with digitalFileUrl when viewing
  const [docEditFile, setDocEditFile] = useState(null); // file chosen in edit modal
  const [propDocEdit, setPropDocEdit] = useState(null); // property document row being edited
  const [toast, setToast] = useState('');
  const [detailSaving, setDetailSaving] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [docFilterPropertyName, setDocFilterPropertyName] = useState(null); // when opening Documents from a property, show only that property's docs
  const [registerExpandedId, setRegisterExpandedId] = useState(null); // property id for expandable mobile row
  const [isMobileRegister, setIsMobileRegister] = useState(typeof window !== 'undefined' && window.innerWidth < 768);
  const [insEditItem, setInsEditItem] = useState(null); // { item, type: 'property'|'vehicle'|'cover' }
  const [insEditSaving, setInsEditSaving] = useState(false);
  useEffect(() => {
    const mq = () => setIsMobileRegister(window.innerWidth < 768);
    window.addEventListener('resize', mq);
    return () => window.removeEventListener('resize', mq);
  }, []);

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

  const assetPropertyOptions = [...new Set([...Object.keys(assetMapFromApi), ...(properties || []).map(p => p.name).filter(Boolean)])].sort();

  const effectiveAssetMap = assetViewDate && assetSnapshots[assetViewDate]
    ? assetSnapshots[assetViewDate]
    : assetMapFromApi;
  const assetSnapshotDates = Object.keys(assetSnapshots).sort().reverse();
  const isViewingSnapshot = !!assetViewDate;

  const handleRecordAssetSnapshot = () => {
    const today = new Date().toISOString().slice(0, 10);
    const snapshot = {};
    Object.entries(assetMapFromApi).forEach(([prop, items]) => {
      snapshot[prop] = (items || []).map(({ n, q }) => ({ n, q }));
    });
    setAssetSnapshots(prev => ({ ...prev, [today]: snapshot }));
    setAssetViewDate(today);
    showToast('Recorded as at ' + new Date(today + 'Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }));
  };

  const assetExistsForProperty = (propertyName, assetName, map = assetMapFromApi) => {
    const list = map[propertyName] || [];
    const key = (assetName || '').trim().toLowerCase();
    return key && list.some(item => (item.n || '').trim().toLowerCase() === key);
  };

  const handleAddAsset = async (e) => {
    e.preventDefault();
    const prop = (assetAddProperty || '').trim();
    const name = (assetAddName || '').trim();
    const qty = Math.max(1, parseInt(assetAddQty, 10) || 1);
    if (!prop) { showToast('Select or enter a property'); return; }
    if (!name) { showToast('Enter asset name'); return; }
    if (assetExistsForProperty(prop, name)) {
      showToast('This asset already exists for this property');
      return;
    }
    try {
      await apiAddAsset({ name, propertyName: prop, quantity: qty });
      if (!assetMapFromApi[prop]) setAssetKey(prop);
      setAssetAddOpen(false);
      setAssetAddProperty('');
      setAssetAddName('');
      setAssetAddQty('1');
      showToast('Asset added');
    } catch (err) {
      showToast(err.message || 'Failed to add asset');
    }
  };

  const handleExportAssetsCsv = () => {
    const rows = [];
    Object.entries(effectiveAssetMap).forEach(([property, items]) => {
      (items || []).forEach(({ n, q }) => rows.push([property, n, q]));
    });
    const header = 'Property,Asset Name,Quantity';
    const body = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const csv = header + '\n' + body;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assets-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Export downloaded');
  };

  const handleUploadAssetsCsv = (e) => {
    const file = e?.target?.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const text = (ev.target?.result || '').toString().trim();
        const lines = text.split(/\r?\n/).filter(Boolean);
        if (lines.length === 0) { showToast('CSV is empty'); e.target.value = ''; return; }
        const parseCsvLine = (line) => {
          const out = [];
          let cur = '';
          let inQuotes = false;
          for (let i = 0; i < line.length; i++) {
            const c = line[i];
            if (c === '"') inQuotes = !inQuotes;
            else if ((c === ',' && !inQuotes) || c === '\t') { out.push(cur.trim()); cur = ''; }
            else cur += c;
          }
          out.push(cur.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
          return out;
        };
        const header = lines[0].toLowerCase();
        const hasHeader = header.includes('property') && (header.includes('asset') || header.includes('name'));
        const start = hasHeader ? 1 : 0;
        const targetProp = assetKey || Object.keys(assetMapFromApi)[0] || 'Property';
        const key = (prop, assetName) => `${(prop || '').toLowerCase()}|${(assetName || '').trim().toLowerCase()}`;
        const existingKeys = new Set();
        Object.entries(assetMapFromApi).forEach(([p, items]) => {
          (items || []).forEach(({ n }) => { if (n) existingKeys.add(key(p, n)); });
        });
        let count = 0;
        let skipped = 0;
        for (let i = start; i < lines.length; i++) {
          const parts = parseCsvLine(lines[i]);
          if (parts.length >= 3) {
            const prop = (parts[0] || '').trim();
            const name = (parts[1] || '').trim();
            const qty = Math.max(1, parseInt(parts[2], 10) || 1);
            if (!prop || !name) continue;
            const k = key(prop, name);
            if (existingKeys.has(k)) { skipped++; continue; }
            try {
              await apiAddAsset({ name, propertyName: prop, quantity: qty });
              existingKeys.add(k);
              count++;
            } catch (_) { /* skip failed row */ }
          } else if (parts.length >= 2) {
            const name = (parts[0] || '').trim();
            const qty = Math.max(1, parseInt(parts[1], 10) || 1);
            if (!name) continue;
            const k = key(targetProp, name);
            if (existingKeys.has(k)) { skipped++; continue; }
            try {
              await apiAddAsset({ name, propertyName: targetProp, quantity: qty });
              existingKeys.add(k);
              count++;
            } catch (_) { /* skip failed row */ }
          }
        }
        const msg = count ? `Imported ${count} asset(s)` : 'No rows imported. Use: Property,Asset Name,Quantity';
        showToast(skipped ? `${msg} (${skipped} duplicate(s) skipped)` : msg);
      } catch (err) {
        showToast('Invalid CSV: ' + (err.message || 'parse error'));
      }
      e.target.value = '';
    };
    reader.readAsText(file, 'UTF-8');
  };

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

  useEffect(() => {
    if (!selectedDoc) {
      setDocDetail(null);
      setDocEditFile(null);
      return;
    }
    let cancelled = false;
    getDocument(selectedDoc.id).then((full) => {
      if (!cancelled && full) setDocDetail(full);
    });
    return () => { cancelled = true; };
  }, [selectedDoc?.id, getDocument]);

  const handleDocUpload = async (e) => {
    e.preventDefault();
    const name = document.getElementById('doc-name')?.value?.trim();
    if (!name) { showToast('Enter document name'); return; }
    const category = docUploadCategory || document.getElementById('doc-category')?.value || 'deeds';
    const referenceId = document.getElementById('doc-property-id')?.value?.trim() || '';
    const hasPhysical = document.getElementById('doc-has-physical')?.checked ?? false;
    const physicalLocation = document.getElementById('doc-physical-location')?.value?.trim() || '';
    if (!referenceId) { showToast('Select a property'); return; }
    if (!docUploadFile) { showToast('Choose a file to upload'); return; }
    setDocUploading(true);
    try {
      const selectedProperty = (properties || []).find((p) => String(p.id || p._id) === referenceId);
      const selectedOptionText = document.getElementById('doc-property-id')?.selectedOptions?.[0]?.text || '';
      const norm = (v) => String(v || '').trim().toLowerCase();
      const selectedName = norm(selectedProperty?.name || selectedOptionText);
      const pickRow = (rows) => (rows || []).find((r) =>
        norm(r.propertyName) === selectedName ||
        norm(r.propertyName).includes(selectedName) ||
        selectedName.includes(norm(r.propertyName)) ||
        String(r.referenceId || '') === referenceId ||
        String(r.propertyId || '') === referenceId
      );
      let targetRow = pickRow(propertyDocuments);
      if (!targetRow) {
        const refreshedRows = await refreshPropertyDocuments();
        targetRow = pickRow(refreshedRows);
      }
      if (!targetRow) {
        // final fallback: read raw endpoint directly in case hook filtering/state is stale
        const res = await fetchWithAuth('/api/property-documents');
        if (res.ok) {
          const json = await res.json().catch(() => ({}));
          const rawRows = Array.isArray(json?.data) ? json.data : [];
          targetRow = pickRow(rawRows);
        }
      }
      const targetRowId = targetRow?._id || targetRow?.id;
      if (!targetRowId) {
        throw new Error('No property document register row found for this property');
      }

      const formData = new FormData();
      formData.append('file', docUploadFile);
      formData.append('title', name);
      formData.append('documentType', category);
      formData.append('hasPhysicalCopy', hasPhysical ? 'true' : 'false');
      if (physicalLocation) formData.append('physicalCopyLocation', physicalLocation);
      await uploadPropertyDocumentFile(targetRowId, formData);
      showToast('Document uploaded to property register');
      await refreshDocuments();
      await refreshPropertyDocuments();
      setDocUploadOpen(false);
      setDocUploadFile(null);
      setDocUploadPropertyId('');
      setDocUploadCategory('deeds');
      document.getElementById('doc-upload-form')?.reset();
    } catch (err) {
      showToast(err.message || 'Failed to save document');
    } finally {
      setDocUploading(false);
    }
  };

  const handleDocEditUpload = async (e) => {
    e.preventDefault();
    if (!selectedDoc || !docEditFile) {
      showToast('Choose a file first');
      return;
    }
    const doc = docDetail || selectedDoc;
    setDocUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', docEditFile);
      formData.append('title', doc.name || 'Document');
      if (doc.category) formData.append('documentType', doc.category);
      if (doc.referenceType) formData.append('referenceType', doc.referenceType);
      if (doc.referenceId) formData.append('referenceId', doc.referenceId);
      await uploadDocument(formData);
      await refreshDocuments();
      showToast('Digital copy uploaded');
      setDocEditFile(null);
    } catch (err) {
      showToast(err.message || 'Failed to upload digital copy');
    } finally {
      setDocUploading(false);
    }
  };

  const handleSavePropertyDocument = async (e) => {
    e.preventDefault();
    if (!propDocEdit?._id) return;
    try {
      await updatePropertyDocument(propDocEdit._id, {
        propertyName: document.getElementById('prop-doc-propertyName')?.value?.trim() ?? '',
        propertyUse: document.getElementById('prop-doc-propertyUse')?.value?.trim() ?? '',
        titleDeedsPhysicalLocation: document.getElementById('prop-doc-titleDeedsPhysical')?.value?.trim() ?? '',
        titleDeedsDigitalDescription: document.getElementById('prop-doc-titleDeedsDigital')?.value?.trim() ?? '',
        plansDescription: document.getElementById('prop-doc-plans')?.value?.trim() ?? '',
        permitsDescription: document.getElementById('prop-doc-permits')?.value?.trim() ?? '',
        leaseAgreementDescription: document.getElementById('prop-doc-lease')?.value?.trim() ?? '',
        fileLocationNotes: document.getElementById('prop-doc-notes')?.value?.trim() ?? '',
      });
      setPropDocEdit(null);
      showToast('Property document updated');
    } catch (err) {
      showToast(err.message || 'Update failed');
    }
  };

  const handleDeletePropertyDocument = async (row) => {
    if (!window.confirm(`Delete property document for "${row.propertyName}"?`)) return;
    try {
      await deletePropertyDocument(row._id || row.id);
      showToast('Property document deleted');
    } catch (err) {
      showToast(err.message || 'Delete failed');
    }
  };

  const handleDeleteProperty = async () => {
    if (!detailProp) return;
    if (!window.confirm(`Delete property "${detailProp.name}"? This cannot be undone.`)) return;
    try {
      await deleteProperty(detailProp.id);
      setDetailProp(null);
      showToast('Property deleted');
    } catch (err) {
      showToast(err.message || 'Delete failed');
    }
  };

  const handleDeleteAsset = async (asset) => {
    const id = asset.id ?? asset._id;
    if (!id) return;
    if (!window.confirm(`Delete asset "${asset.n || asset.name}"?`)) return;
    try {
      await apiDeleteAsset(id);
      showToast('Asset deleted');
    } catch (err) {
      showToast(err.message || 'Delete failed');
    }
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
        <nav style={S.nav} className="dashboard-nav">
          <Link to="/dashboard" style={S.logo} onClick={() => setMobileNavOpen(false)}>
            <div style={S.logoMark}>A</div>
            <div style={S.logoText}>{isMobileRegister ? 'Property Register' : 'Alamait Property Register'}</div>
          </Link>

          <button type="button" className="hamburger hamburger-dash" aria-label="Open menu" onClick={() => setMobileNavOpen(true)}>
            <span /><span /><span />
          </button>

          <div style={S.navTabs} className="dashboard-nav-tabs">
            {['dashboard', 'register', 'insurance', 'assets', 'documents'].map(p => (
              <button key={p} type="button" style={S.navTab(page === p)} onClick={() => { setPage(p); setMobileNavOpen(false); }}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>

          <div style={S.navRight} className="dashboard-nav-right">
            <div style={S.userDot} title={user?.email || 'User'}>{initials}</div>
            {!isMobileRegister && <span style={S.userEmail}>{user?.email || 'User'}</span>}
            <button type="button" style={S.signOut} onClick={logout} aria-label="Sign out">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Sign Out
            </button>
          </div>
        </nav>

        <div className={`dashboard-nav-overlay ${mobileNavOpen ? 'open' : ''}`} onClick={() => setMobileNavOpen(false)} aria-hidden="true" />
        <div className={`dashboard-nav-mobile ${mobileNavOpen ? 'open' : ''}`}>
          <button type="button" className="dashboard-nav-mobile-close" aria-label="Close menu" onClick={() => setMobileNavOpen(false)}>×</button>
          {['dashboard', 'register', 'insurance', 'assets', 'documents'].map(p => (
            <button key={p} type="button" className={page === p ? 'dashboard-nav-mobile-link active' : 'dashboard-nav-mobile-link'} onClick={() => { setPage(p); setMobileNavOpen(false); }}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>

        {/* ── BODY ── */}
        <div style={S.body} className="dashboard-body">

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

              <div className="dashboard-cards-grid dashboard-overview-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10, marginTop: 8 }}>
                {filtered.slice(0, 8).map(p => {
                  const meta = typeMeta(p.propertyType);
                  return (
                    <div
                      key={p.id}
                      className="dashboard-property-card"
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
                  {Object.keys(TYPE_META).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select className="fs" value={entityFilter} onChange={e => setEntityFilter(e.target.value)}>
                  <option value="">All Entities</option>
                  {['SC', 'Alamait', 'TMT', 'Maitalan', 'VV'].map(ent => <option key={ent} value={ent}>{ent}</option>)}
                </select>
              </div>

              {propLoading && <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 12 }}>Loading…</p>}

              {/* Mobile: compact expandable rows (filter bar is the fbar above) */}
              {isMobileRegister ? (
                <div className="register-mobile">
                  <div className="register-mobile-list">
                    {filtered.length === 0 && (
                      <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '32px 16px' }}>No properties match your filters</div>
                    )}
                    {filtered.map((p, i) => {
                      const doc = (propertyDocuments || []).find(d => String(d.propertyName || '').trim() === String(p.name || '').trim());
                      const insRecord = (propertyInsurance || []).find(pi =>
                        String(pi.propertyName || '').trim() === String(p.name || '').trim() ||
                        String(pi.propertyRef || '') === String(p.id || '') || pi.propertyRef === p.id
                      );
                      const isInsured = insRecord ? (insRecord.insurance === 'Yes' || insRecord.insurance === true) : !!p.insured;
                      const hasDocs = doc && (!!(doc.titleDeedsPhysicalLocation || '').trim() || !!(doc.titleDeedsDigitalDescription || '').trim());
                      const hasDeedP = !!(doc?.titleDeedsPhysicalLocation?.trim());
                      const hasDeedD = !!(doc?.titleDeedsDigitalDescription?.trim());
                      const deedStatus = doc ? (hasDeedP && hasDeedD ? '✓ D+P' : hasDeedP ? '✓ P' : hasDeedD ? '✓ D' : '✗') : '✗';
                      const hasPlans = !!(doc?.plansDescription?.trim());
                      const plansStatus = doc ? (hasPlans ? '✓' : '✗') : '✗';
                      const hasLease = !!(doc?.leaseAgreementDescription?.trim());
                      const leaseStatus = doc ? (hasLease ? '✓' : '✗') : '✗';
                      const expanded = registerExpandedId === p.id;
                      return (
                        <div
                          key={p.id}
                          className={`register-mobile-row ${expanded ? 'expanded' : ''}`}
                          style={{ border: '1px solid var(--border)', borderRadius: 8, marginBottom: 8, overflow: 'hidden', background: '#fff', boxShadow: 'var(--shadow-sm)' }}
                        >
                          <div
                            className="register-mobile-row-head"
                            onClick={() => setRegisterExpandedId(expanded ? null : p.id)}
                            style={{ padding: '12px 14px', cursor: 'pointer', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px 12px' }}
                          >
                            <span className="tdref" style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: 'var(--muted)' }}>#{String(i + 1).padStart(2, '0')}</span>
                            <div style={{ flex: '1 1 100%', minWidth: 0 }}>
                              <div className="tdname" style={{ fontSize: 15, fontWeight: 600, color: 'var(--navy)' }}>{p.name}</div>
                              <div className="tdaddr" style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{p.address || '—'}</div>
                            </div>
                            <span className={`badge ${badgeClass(p.propertyType)}`} style={{ flexShrink: 0 }}>{p.propertyType}</span>
                            <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: 'var(--body)' }}>{p.ownedEntity || '—'}</span>
                            <span title={hasDocs ? 'Title deeds on file' : 'No title deeds'} style={{ display: 'inline-flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
                              <span style={{ fontSize: 12 }}>📄</span>
                              <span className={hasDocs ? 'ins-y' : 'ins-n'} style={{ fontSize: 10 }}>{hasDocs ? '✓' : '—'}</span>
                            </span>
                            <span
                              title={isInsured && insRecord?.insurer ? insRecord.insurer : (isInsured ? 'Insured' : 'Not insured')}
                              style={{
                                width: 10,
                                height: 10,
                                borderRadius: '50%',
                                flexShrink: 0,
                                background: isInsured ? 'var(--green)' : '#c53030',
                              }}
                            />
                            <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 13, fontWeight: 600, color: 'var(--navy)', marginLeft: 'auto' }}>{fmt(p.totalPurchaseAmount)}</span>
                            <span style={{ fontSize: 12, color: 'var(--muted)' }}>{expanded ? '▼' : '▶'}</span>
                          </div>
                          {expanded && (
                            <div className="register-mobile-row-detail" style={{ borderTop: '1px solid var(--border)', padding: '14px', background: 'var(--navy-mist)' }}>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px', fontSize: 13 }}>
                                <div><span style={{ color: 'var(--muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Est. value</span><div style={{ fontWeight: 600 }}>{fmt(p.estimatedCurrentValue)}</div></div>
                                <div><span style={{ color: 'var(--muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Insurance</span><div className={isInsured ? 'ins-y' : 'ins-n'}>{isInsured ? (insRecord?.insurer || '✓ Insured') : '✗ None'}</div></div>
                                <div><span style={{ color: 'var(--muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Title deeds</span><div className={deedStatus === '✗' ? 'ins-n' : 'ins-y'}>{deedStatus}</div></div>
                                <div><span style={{ color: 'var(--muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Plans</span><div className={plansStatus === '✗' ? 'ins-n' : 'ins-y'}>{plansStatus}</div></div>
                                <div><span style={{ color: 'var(--muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Lease</span><div className={leaseStatus === '✗' ? 'ins-n' : 'ins-y'}>{leaseStatus}</div></div>
                                <div><span style={{ color: 'var(--muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Date</span><div>{p.purchaseDate ? p.purchaseDate.slice(0, 7) : '—'}</div></div>
                              </div>
                              <button
                                type="button"
                                className="btn btn-maroon btn-sm"
                                style={{ marginTop: 12, width: '100%' }}
                                onClick={e => { e.stopPropagation(); setDetailProp(p); setRegisterExpandedId(null); }}
                              >
                                View full details →
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
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
                      <th>Insurance / Insurer</th>
                      <th title="D = Digital, P = Physical">Title Deeds</th>
                      <th>Plans</th>
                      <th>Lease</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p, i) => {
                      const doc = (propertyDocuments || []).find(d => String(d.propertyName || '').trim() === String(p.name || '').trim());
                      const insRecord = (propertyInsurance || []).find(pi =>
                        String(pi.propertyName || '').trim() === String(p.name || '').trim() ||
                        String(pi.propertyRef || '') === String(p.id || '') || pi.propertyRef === p.id
                      );
                      const isInsured = insRecord
                        ? (insRecord.insurance === 'Yes' || insRecord.insurance === true)
                        : !!p.insured;
                      const hasDeedP = !!(doc?.titleDeedsPhysicalLocation?.trim());
                      const hasDeedD = !!(doc?.titleDeedsDigitalDescription?.trim());
                      const deedStatus = doc ? (hasDeedP && hasDeedD ? '✓ D+P' : hasDeedP ? '✓ P' : hasDeedD ? '✓ D' : '✗') : '✗';
                      const deedTitle = doc ? `Physical: ${doc.titleDeedsPhysicalLocation || '—'}\nDigital: ${doc.titleDeedsDigitalDescription || '—'}` : 'No document record';
                      const hasPlans = !!(doc?.plansDescription?.trim());
                      const plansStatus = doc ? (hasPlans ? '✓' : '✗') : '✗';
                      const plansTitle = doc?.plansDescription ? `Plans: ${doc.plansDescription}` : 'No plans';
                      const hasLease = !!(doc?.leaseAgreementDescription?.trim());
                      const leaseStatus = doc ? (hasLease ? '✓' : '✗') : '✗';
                      const leaseTitle = doc?.leaseAgreementDescription ? `Lease: ${doc.leaseAgreementDescription}${doc.fileLocationNotes ? '\nNotes: ' + doc.fileLocationNotes : ''}` : 'No lease';
                      const plansLoc = (doc?.plansDescription || '').trim();
                      const leaseLoc = (doc?.leaseAgreementDescription || '').trim();
                      const short = (s, n = 18) => (s.length <= n ? s : s.slice(0, n) + '…');
                      return (
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
                        <td title={isInsured && insRecord?.insurer ? `Insured by ${insRecord.insurer}` : undefined}>
                          <span className={isInsured ? 'ins-y' : 'ins-n'}>
                            {isInsured ? (insRecord?.insurer ? `✓ ${insRecord.insurer}` : '✓ Insured') : '✗ None'}
                          </span>
                        </td>
                        <td className="tdmono" title={deedTitle} style={{ whiteSpace: 'nowrap' }}>
                          <span className={deedStatus === '✗' ? 'ins-n' : 'ins-y'}>{deedStatus}</span>
                        </td>
                        <td className="tdmono" title={plansTitle} style={{ maxWidth: 140 }}>
                          {plansStatus === '✗' ? <span className="ins-n">✗</span> : <span className="ins-y" title={plansTitle}>✓ {short(plansLoc)}</span>}
                        </td>
                        <td className="tdmono" title={leaseTitle} style={{ maxWidth: 140 }}>
                          {leaseStatus === '✗' ? <span className="ins-n">✗</span> : <span className="ins-y" title={leaseTitle}>✓ {short(leaseLoc)}</span>}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="tdgo"
                            onClick={e => { e.stopPropagation(); setDetailProp(p); }}
                          >View →</button>
                        </td>
                      </tr>
                    );})}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={12} style={{ textAlign: 'center', color: 'var(--muted)', padding: '40px 0' }}>
                          No properties match your filters
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              )}
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
                  {(insCategory === 'property' || insCategory === 'cover' || insCategory === 'all') && (
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
                  <div className="dashboard-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
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
                            position: 'relative',
                          }}
                          onClick={() => setInsEditItem({ item, type: 'property' })}
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
                ) : insCategory === 'vehicle' ? (
                  <div className="dashboard-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
                    {filteredVehicleInsurance.length === 0 && !insLoading && (
                      <div style={{ padding: 16, background: 'var(--navy-mist)', borderRadius: 0, color: 'var(--muted)', fontSize: 13, gridColumn: '1 / -1' }}>No vehicle insurance records</div>
                    )}
                    {filteredVehicleInsurance.map((item) => (
                      <div
                        key={item._id || item.id}
                        style={{
                          background: '#fff',
                          border: '1px solid var(--border)',
                          borderTop: '3px solid var(--border)',
                          borderRadius: 0,
                          padding: '12px 14px',
                          boxShadow: 'var(--shadow-sm)',
                          cursor: 'pointer',
                        }}
                        onClick={() => setInsEditItem({ item, type: 'vehicle' })}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: 'var(--muted)' }}>Vehicle</div>
                          <div style={{ fontSize: 12 }}>🚗</div>
                        </div>
                        <div className="tdname" style={{ marginBottom: 10 }}>{item.name || item.vehicleName || item.title || 'Vehicle policy'}</div>
                        <div style={{ marginTop: 10, borderTop: '1px solid #e0e4e8', paddingTop: 10, fontSize: 12 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e0e4e8' }}>
                            <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>Insurer</span>
                            <span>{item.insurer || item.provider || '—'}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                            <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>Policy #</span>
                            <span>{item.policyNumber || '—'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : insCategory === 'cover' ? (
                  <div className="dashboard-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
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
                          onClick={() => setInsEditItem({ item, type: 'cover' })}
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
                  <div className="dashboard-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
                    {insCategory === 'all' && filteredPropertyInsurance.length === 0 && filteredVehicleInsurance.length === 0 && filteredInsuredCover.length === 0 && !insLoading && (
                      <div style={{ padding: 16, background: 'var(--navy-mist)', borderRadius: 0, color: 'var(--muted)', fontSize: 13, gridColumn: '1 / -1' }}>No insurance records</div>
                    )}
                    {insCategory === 'all' && filteredPropertyInsurance.map((item) => {
                      const insured = item.insurance === 'Yes' || item.insurance === true;
                      return (
                        <div
                          key={'prop-' + (item._id || item.propertyRef)}
                          style={{
                            background: '#fff',
                            border: '1px solid var(--border)',
                            borderTop: '3px solid ' + (insured ? 'var(--green)' : '#c53030'),
                            borderRadius: 0,
                            padding: '12px 14px',
                            boxShadow: 'var(--shadow-sm)',
                            cursor: 'pointer',
                          }}
                          onClick={() => setInsCategory('property')}
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
                    {insCategory === 'all' && filteredVehicleInsurance.map((item, i) => (
                      <div
                        key={'veh-' + (item._id || item.id || i)}
                        style={{
                          background: '#fff',
                          border: '1px solid var(--border)',
                          borderTop: '3px solid var(--border)',
                          borderRadius: 0,
                          padding: '12px 14px',
                          boxShadow: 'var(--shadow-sm)',
                          cursor: 'pointer',
                        }}
                        onClick={() => setInsEditItem({ item, type: 'vehicle' })}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: 'var(--muted)' }}>Vehicle</div>
                          <div style={{ fontSize: 12 }}>🚗</div>
                        </div>
                        <div className="tdname" style={{ marginBottom: 10 }}>{item.name || item.vehicleName || item.title || 'Vehicle policy'}</div>
                        <div style={{ marginTop: 10, borderTop: '1px solid #e0e4e8', paddingTop: 10, fontSize: 12 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e0e4e8' }}>
                            <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>Insurer</span>
                            <span>{item.insurer || item.provider || '—'}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                            <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>Policy #</span>
                            <span>{item.policyNumber || '—'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {insCategory === 'all' && filteredInsuredCover.map((item) => {
                      const insured = item.insurance === 'Yes' || item.insurance === true;
                      return (
                        <div
                          key={'cover-' + (item._id || item.propertyRef)}
                          style={{
                            background: '#fff',
                            border: '1px solid var(--border)',
                            borderTop: '3px solid ' + (insured ? 'var(--green)' : '#c53030'),
                            borderRadius: 0,
                            padding: '12px 14px',
                            boxShadow: 'var(--shadow-sm)',
                            cursor: 'pointer',
                          }}
                          onClick={() => setInsCategory('cover')}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: 'var(--muted)' }}>#{item.propertyRef} • Cover</div>
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
                  <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
                    As at {assetViewDate
                      ? new Date(assetViewDate + 'Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
                      : new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) + ' (current)'}
                  </div>
                  <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <label style={{ fontSize: 12, color: 'var(--muted)' }}>View:</label>
                    <select
                      value={assetViewDate ?? ''}
                      onChange={e => { const v = e.target.value; setAssetViewDate(v || null); if (v) setAssetKey(Object.keys(assetSnapshots[v] || {}).sort()[0] || null); }}
                      style={{ fontSize: 12, padding: '4px 8px', minWidth: 140 }}
                    >
                      <option value="">Current (editable)</option>
                      {assetSnapshotDates.map(d => (
                        <option key={d} value={d}>
                          {new Date(d + 'Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="pg-actions" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {!isViewingSnapshot && (
                    <>
                      <input
                        type="file"
                        accept=".csv"
                        ref={assetCsvInputRef}
                        style={{ display: 'none' }}
                        onChange={handleUploadAssetsCsv}
                      />
                      <button type="button" className="btn btn-outline btn-sm" onClick={() => assetCsvInputRef.current?.click()}>
                        ↑ Upload CSV
                      </button>
                      <button type="button" className="btn btn-outline btn-sm" onClick={handleRecordAssetSnapshot}>
                        Record as at today
                      </button>
                    </>
                  )}
                  <button type="button" className="btn btn-maroon btn-sm" onClick={handleExportAssetsCsv}>
                    ↓ Export CSV
                  </button>
                </div>
              </div>

              {assetsLoading && !assetViewDate && (
                <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 12 }}>Loading assets…</p>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '230px 1fr', gap: 18 }}>
                <div style={{ background: '#fff', borderRadius: 0, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden', alignSelf: 'flex-start', position: 'sticky', top: 80 }}>
                  <div style={{ background: 'var(--navy)', padding: '13px 16px', fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)' }}>
                    Properties
                  </div>
                  {Object.keys(effectiveAssetMap).sort().map((name) => {
                    const active = assetKey === name;
                    const list = effectiveAssetMap[name] || [];
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
                          {list.length}
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
                      <div style={{ fontSize: 13, marginTop: 5 }}>to view its recorded assets{isViewingSnapshot ? '' : ', or add one below'}</div>
                      {!isViewingSnapshot && (
                        <div style={{ marginTop: 16 }}>
                          <button type="button" className="btn btn-maroon btn-sm" onClick={() => setAssetAddOpen(true)}>+ Add Asset</button>
                        </div>
                      )}
                    </div>
                  )}
                  {assetKey && (
                    <>
                      {isViewingSnapshot && (
                        <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>Snapshot — read only</div>
                      )}
                      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, color: 'var(--navy)', marginBottom: 3 }}>
                        {assetKey}
                      </div>
                      <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: '0.15em', color: 'var(--maroon)', textTransform: 'uppercase', marginBottom: 20 }}>
                        {(effectiveAssetMap[assetKey] || []).length} items on record
                      </div>
                      {(effectiveAssetMap[assetKey] || []).map((a, i) => (
                        <div key={(a.id ?? a._id) || (a.n + i)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
                          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: 'var(--muted)', width: 20, textAlign: 'right', flexShrink: 0 }}>
                            {String(i + 1).padStart(2, '0')}
                          </div>
                          <div style={{ flex: 1, fontSize: 14, color: 'var(--body)' }}>{a.n}</div>
                          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, fontWeight: 500, color: 'var(--navy)', background: 'var(--navy-mist)', padding: '3px 10px', minWidth: 34, textAlign: 'center' }}>
                            ×{a.q}
                          </div>
                          {!isViewingSnapshot && (a.id ?? a._id) && (
                            <button type="button" className="btn btn-outline btn-sm" style={{ color: 'var(--maroon)', borderColor: 'var(--maroon)', flexShrink: 0 }} onClick={() => handleDeleteAsset(a)} aria-label="Delete asset">Delete</button>
                          )}
                        </div>
                      ))}
                      {!isViewingSnapshot && (
                        <div style={{ marginTop: 18 }}>
                          <button type="button" className="btn btn-maroon btn-sm" onClick={() => { setAssetAddProperty(assetKey); setAssetAddOpen(true); }}>
                            + Add Asset
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Add Asset modal */}
              {assetAddOpen && (
                <div style={S.mbg} onClick={() => setAssetAddOpen(false)}>
                  <div className="modal" onClick={e => e.stopPropagation()}>
                    <div className="mhd">
                      <button type="button" className="mx" onClick={() => setAssetAddOpen(false)}>×</button>
                      <div className="mtitle">Add Asset</div>
                      <div className="msub">Property and quantity</div>
                    </div>
                    <form onSubmit={handleAddAsset}>
                      <div className="mbody">
                        <div className="mgrid">
                          <div className="full">
                            <label className="ml" htmlFor="asset-prop">Property</label>
                            <select
                              id="asset-prop"
                              className="ms"
                              value={assetAddProperty}
                              onChange={e => setAssetAddProperty(e.target.value)}
                            >
                              <option value="">— Select property —</option>
                              {assetPropertyOptions.map(p => (
                                <option key={p} value={p}>{p}</option>
                              ))}
                            </select>
                          </div>
                          <div className="full">
                            <label className="ml" htmlFor="asset-name">Asset name</label>
                            <input
                              id="asset-name"
                              className="mi"
                              placeholder="e.g. Diesel Generator"
                              value={assetAddName}
                              onChange={e => setAssetAddName(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="ml" htmlFor="asset-qty">Quantity</label>
                            <input
                              id="asset-qty"
                              className="mi"
                              type="number"
                              min={1}
                              value={assetAddQty}
                              onChange={e => setAssetAddQty(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="mft">
                        <button type="button" className="btn btn-outline btn-sm" onClick={() => setAssetAddOpen(false)}>Cancel</button>
                        <button type="submit" className="btn btn-maroon btn-sm">Add</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
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
                    onClick={() => { setDocUploadPropertyId(''); setDocUploadCategory('deeds'); setDocUploadOpen(true); }}
                    disabled={docUploading}
                  >
                    {docUploading ? 'Uploading…' : '↑ Upload'}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10, alignItems: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginRight: 4 }}>Status</span>
                {[
                  { id: 'all', label: 'All' },
                  { id: 'incomplete', label: 'Incomplete' },
                  { id: 'complete', label: 'Complete' },
                ].map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    className={`dtab ${docVaultCompliance === id ? 'active' : ''}`}
                    onClick={() => setDocVaultCompliance(id)}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="dtabs" style={{ marginBottom: 8 }}>
                {[{ id: 'all', label: 'All types' }, ...DOCUMENT_CATEGORIES].map(({ id, label }) => (
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

              <div className="fbar" style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14 }}>
                <select
                  className="ms"
                  style={{ minWidth: 160 }}
                  value={docFilterPropertyName || ''}
                  onChange={e => setDocFilterPropertyName(e.target.value || null)}
                >
                  <option value="">All properties</option>
                  {Array.from(new Set(propertyDocuments.map(d => d.propertyName).filter(Boolean))).sort().map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
                <input
                  className="fi"
                  type="text"
                  placeholder="Search name, property, location…"
                  value={docSearch}
                  onChange={e => setDocSearch(e.target.value)}
                  style={{ flex: 1 }}
                />
              </div>

              {(() => {
                if (propDocsLoading) {
                  return <div style={{ fontSize: 14, color: 'var(--muted)', padding: '20px 0' }}>Loading document vault…</div>;
                }
                if (!propertyDocuments.length) {
                  return <div style={{ fontSize: 14, color: 'var(--muted)', padding: '20px 0' }}>No property document register data.</div>;
                }

                const propertyNameById = new Map((properties || []).map((p) => [String(p.id || p._id || ''), p.name]));
                const resolveDocPropertyName = (d) => {
                  const rid = String(d?.referenceId || '');
                  if (d?.referenceType === 'property' && propertyNameById.has(rid)) return propertyNameById.get(rid);
                  const p = String(d?.propertyName || '').trim();
                  if (p && p !== '—') return p;
                  return null;
                };

                const docsByProperty = {};
                (documentsList || []).forEach((d) => {
                  const p = resolveDocPropertyName(d);
                  if (!p) return;
                  if (!docsByProperty[p]) docsByProperty[p] = [];
                  docsByProperty[p].push(d);
                });
                const digitalDocsByProperty = (documentsList || []).reduce((acc, d) => {
                  const p = resolveDocPropertyName(d);
                  if (!p || !d?.digitalFileUrl) return acc;
                  if (!acc[p]) acc[p] = [];
                  acc[p].push(d);
                  return acc;
                }, {});

                const applyVaultBase = (r) => {
                  if (docFilterPropertyName && r.propertyName !== docFilterPropertyName) return false;
                  if (docCategory !== 'all') {
                    const hasDeeds = !!(r.titleDeedsPhysicalLocation || '').trim() || !!(r.titleDeedsDigitalDescription || '').trim();
                    const hasPlans = !!(r.plansDescription || '').trim();
                    const hasPermits = !!(r.permitsDescription || '').trim();
                    const hasPlansPermits = hasPlans || hasPermits;
                    const hasLegal = !!(r.leaseAgreementDescription || '').trim() || !!(r.fileLocationNotes || '').trim();
                    if (docCategory === 'deeds' && !hasDeeds) return false;
                    if (docCategory === 'plans' && !hasPlans) return false;
                    if (docCategory === 'permits' && !hasPermits) return false;
                    if (docCategory === 'valuations' && !hasPlansPermits) return false;
                    if (docCategory === 'legal' && !hasLegal) return false;
                    if (docCategory === 'insurance') return true;
                  }
                  const q = (docSearch || '').toLowerCase();
                  if (!q) return true;
                  return [
                    r.propertyName,
                    r.propertyUse,
                    r.titleDeedsPhysicalLocation,
                    r.titleDeedsDigitalDescription,
                    r.plansDescription,
                    r.leaseAgreementDescription,
                    r.fileLocationNotes,
                    ...(digitalDocsByProperty[r.propertyName] || []).flatMap(dd => [dd.name, dd.digitalFileName, dd.digitalFileUrl]),
                  ].some(v => String(v || '').toLowerCase().includes(q));
                };

                const baseRows = propertyDocuments.filter((r) => {
                  if (!String(r?.propertyName || '').trim()) return false;
                  return applyVaultBase(r);
                });
                const vaultRows = baseRows.filter((r) => {
                  const v = buildVaultChecklist(r, docsByProperty[r.propertyName]);
                  if (docVaultCompliance === 'complete') return v.isFullyComplete;
                  if (docVaultCompliance === 'incomplete') return !v.isFullyComplete;
                  return true;
                });

                const openVaultUpload = (row, uploadType) => {
                  const prop = properties.find(p => p.name === row.propertyName);
                  setDocUploadPropertyId(prop?.id || '');
                  setDocUploadCategory(uploadType || 'deeds');
                  setDocUploadOpen(true);
                };

                const dot = (ok) => (
                  <span style={{ fontSize: 13, fontWeight: 600, color: ok ? 'var(--green)' : 'var(--maroon)' }}>
                    {ok ? 'Yes' : 'No'}
                  </span>
                );

                return (
                  <>
                    {!vaultRows.length ? (
                      <div style={{ fontSize: 14, color: 'var(--muted)', padding: '16px 0' }}>No properties match the current filters.</div>
                    ) : (
                      <div className="tw" style={{ overflowX: 'auto' }}>
                        <table className="table doc-vault-table" style={{ marginTop: 0 }}>
                          <thead>
                            <tr>
                              <th style={{ width: 44 }} aria-label="Expand" />
                              <th>Property</th>
                              <th>Use</th>
                              <th>Compliance</th>
                              <th style={{ width: 140 }}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {vaultRows.map((row) => {
                              const rid = String(row._id || row.id);
                              const expanded = docVaultExpandedId === rid;
                              const v = buildVaultChecklist(row, docsByProperty[row.propertyName]);
                              return (
                                <Fragment key={rid}>
                                  <tr
                                    className="doc-vault-row-main"
                                    onClick={() => setDocVaultExpandedId(expanded ? null : rid)}
                                    style={{ cursor: 'pointer' }}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        setDocVaultExpandedId(expanded ? null : rid);
                                      }
                                    }}
                                    tabIndex={0}
                                    role="button"
                                    aria-expanded={expanded}
                                  >
                                    <td style={{ fontSize: 14, color: 'var(--muted)', verticalAlign: 'middle' }}>{expanded ? '▼' : '▶'}</td>
                                    <td style={{ fontWeight: 600, color: 'var(--navy)', verticalAlign: 'middle' }}>{row.propertyName}</td>
                                    <td style={{ color: 'var(--body)', verticalAlign: 'middle' }}>{row.propertyUse || '—'}</td>
                                    <td style={{ verticalAlign: 'middle' }}>
                                      <span
                                        style={{
                                          fontSize: 12,
                                          fontWeight: 600,
                                          padding: '4px 10px',
                                          borderRadius: 4,
                                          border: `1px solid ${v.isFullyComplete ? 'var(--green)' : 'var(--gold)'}`,
                                          color: v.isFullyComplete ? 'var(--green)' : 'var(--gold)',
                                        }}
                                      >
                                        {v.bothCount}/{v.total} {v.isFullyComplete ? 'complete' : 'docs'}
                                      </span>
                                    </td>
                                    <td style={{ verticalAlign: 'middle' }} onClick={(e) => e.stopPropagation()}>
                                      <button type="button" className="btn btn-outline btn-sm" onClick={() => setPropDocEdit(row)}>
                                        Edit register
                                      </button>
                                    </td>
                                  </tr>
                                  {expanded && (
                                    <tr className="doc-vault-row-detail">
                                      <td colSpan={5} style={{ padding: 0, borderBottom: '1px solid var(--border)' }}>
                                        <div style={{ padding: '14px 16px 18px' }}>
                                          <div style={{ overflowX: 'auto' }}>
                                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, background: '#fff', border: '1px solid var(--border)' }}>
                                              <thead>
                                                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                                  <th style={{ textAlign: 'left', padding: '10px 12px', fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>Document</th>
                                                  <th style={{ textAlign: 'left', padding: '10px 12px', fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>Digital</th>
                                                  <th style={{ textAlign: 'left', padding: '10px 12px', fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>Physical</th>
                                                  <th style={{ textAlign: 'right', padding: '10px 12px', fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>Actions</th>
                                                </tr>
                                              </thead>
                                              <tbody>
                                                {v.items.map((item) => (
                                                  <tr key={item.key} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                                    <td style={{ padding: '12px', color: 'var(--ink)' }}>{item.label}{!item.physical && !item.digital && item.key === 'general' ? ' — missing' : ''}</td>
                                                    <td style={{ padding: '12px' }}>{dot(item.digital)}</td>
                                                    <td style={{ padding: '12px' }}>{dot(item.physical)}</td>
                                                    <td style={{ padding: '12px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                                                      {item.digitalUrl ? (
                                                        <>
                                                          <a
                                                            href={item.digitalUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="btn btn-outline btn-sm"
                                                            style={{ marginRight: 6, textDecoration: 'none', display: 'inline-block', minWidth: 58, minHeight: 30, lineHeight: '28px', padding: '0 8px', textAlign: 'center', fontSize: 11 }}
                                                            onClick={(e) => e.stopPropagation()}
                                                          >
                                                            View
                                                          </a>
                                                          {item.viewDoc && (
                                                            <button
                                                              type="button"
                                                              className="btn btn-outline btn-sm"
                                                              style={{ marginRight: 6, minWidth: 58, minHeight: 30, padding: '0 8px', fontSize: 11 }}
                                                              onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedDoc(item.viewDoc);
                                                              }}
                                                            >
                                                              Details
                                                            </button>
                                                          )}
                                                        </>
                                                      ) : (
                                                        <button
                                                          type="button"
                                                          className="btn btn-maroon btn-sm"
                                                          style={{ minHeight: 30, padding: '0 8px', fontSize: 11 }}
                                                          onClick={(e) => {
                                                            e.stopPropagation();
                                                            openVaultUpload(row, item.uploadType);
                                                          }}
                                                        >
                                                          + Upload
                                                        </button>
                                                      )}
                                                    </td>
                                                  </tr>
                                                ))}
                                              </tbody>
                                            </table>
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  )}
                                </Fragment>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                );
              })()}

              <div className="pg-hd" style={{ marginTop: 32 }}>
                <div>
                  <div className="pg-eyebrow">Register</div>
                  <div className="pg-title" style={{ fontSize: 18 }}>Property document summary</div>
                </div>
              </div>

              <div className="tw" style={{ marginTop: 8 }}>
                {propDocsLoading ? (
                  <div style={{ fontSize: 13, color: 'var(--muted)', padding: '8px 0' }}>Loading property documents…</div>
                ) : !propertyDocuments.length ? (
                  <div style={{ fontSize: 13, color: 'var(--muted)', padding: '8px 0' }}>No property document register data found.</div>
                ) : (() => {
                  const propertyNameById = new Map((properties || []).map((p) => [String(p.id || p._id || ''), p.name]));
                  const resolveDocPropertyName = (d) => {
                    const rid = String(d?.referenceId || '');
                    if (d?.referenceType === 'property' && propertyNameById.has(rid)) return propertyNameById.get(rid);
                    const p = String(d?.propertyName || '').trim();
                    if (p && p !== '—') return p;
                    return null;
                  };
                  const digitalDocsByProperty = (documentsList || []).reduce((acc, d) => {
                    const p = resolveDocPropertyName(d);
                    if (!p || !d?.digitalFileUrl) return acc;
                    if (!acc[p]) acc[p] = [];
                    acc[p].push(d);
                    return acc;
                  }, {});

                  const applyDocFilters = (r) => {
                    if (docFilterPropertyName && r.propertyName !== docFilterPropertyName) return false;
                    if (docCategory !== 'all') {
                      const hasDeeds = !!(r.titleDeedsPhysicalLocation || '').trim() || !!(r.titleDeedsDigitalDescription || '').trim();
                      const hasPlans = !!(r.plansDescription || '').trim();
                      const hasPermits = !!(r.permitsDescription || '').trim();
                      const hasPlansPermits = hasPlans || hasPermits;
                      const hasLegal = !!(r.leaseAgreementDescription || '').trim() || !!(r.fileLocationNotes || '').trim();
                      if (docCategory === 'deeds' && !hasDeeds) return false;
                      if (docCategory === 'plans' && !hasPlans) return false;
                      if (docCategory === 'permits' && !hasPermits) return false;
                      if (docCategory === 'valuations' && !hasPlansPermits) return false;
                      if (docCategory === 'legal' && !hasLegal) return false;
                    }
                    const q = (docSearch || '').toLowerCase();
                    if (q && ![
                      r.propertyName,
                      r.propertyUse,
                      r.titleDeedsPhysicalLocation,
                      r.titleDeedsDigitalDescription,
                      r.plansDescription,
                      r.leaseAgreementDescription,
                      r.fileLocationNotes,
                      ...(digitalDocsByProperty[r.propertyName] || []).flatMap(dd => [dd.name, dd.digitalFileName, dd.digitalFileUrl]),
                    ].some(v => String(v || '').toLowerCase().includes(q))) return false;
                    return true;
                  };
                  const tableRows = propertyDocuments.filter(applyDocFilters);
                  if (!tableRows.length && docFilterPropertyName)
                    return (
                      <div style={{ fontSize: 13, color: 'var(--muted)', padding: '8px 0' }}>No documents for <strong>{docFilterPropertyName}</strong>. <button type="button" className="btn btn-outline btn-sm" style={{ marginTop: 6 }} onClick={() => setDocFilterPropertyName(null)}>Show all</button></div>
                    );
                  if (!tableRows.length)
                    return (
                      <div style={{ fontSize: 13, color: 'var(--muted)', padding: '8px 0' }}>No documents match the current filters.</div>
                    );
                  return (
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Property</th>
                        <th>Use</th>
                        <th>Title Deeds (Physical)</th>
                        <th>Title Deeds (Digital)</th>
                        <th>Plans</th>
                        <th>Permits</th>
                        <th>Lease</th>
                        <th>Notes</th>
                        <th>Digital files</th>
                        <th style={{ width: 100 }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableRows.map((row) => (
                        <tr key={row._id || row.id}>
                          <td>{row.propertyName}</td>
                          <td>{row.propertyUse}</td>
                          <td>{row.titleDeedsPhysicalLocation}</td>
                          <td>{row.titleDeedsDigitalDescription}</td>
                          <td>{row.plansDescription}</td>
                          <td>{row.permitsDescription}</td>
                          <td>{row.leaseAgreementDescription}</td>
                          <td>{row.fileLocationNotes}</td>
                          <td style={{ maxWidth: 320 }}>
                            {(() => {
                              const list = (digitalDocsByProperty[row.propertyName] || []);
                              if (!list.length) return <span style={{ color: 'var(--muted)' }}>—</span>;
                              return (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                  {list.slice(0, 6).map((d) => (
                                    <a
                                      key={d.id}
                                      href={d.digitalFileUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{ color: 'var(--maroon)', textDecoration: 'none', fontSize: 12 }}
                                      title={d.digitalFileName || d.digitalFileUrl}
                                    >
                                      {d.name || d.digitalFileName || 'Digital file'}
                                    </a>
                                  ))}
                                  {list.length > 6 && (
                                    <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                                      +{list.length - 6} more…
                                    </span>
                                  )}
                                </div>
                              );
                            })()}
                          </td>
                          <td>
                            <button type="button" className="btn btn-outline btn-sm" style={{ marginRight: 4 }} onClick={() => setPropDocEdit(row)}>Edit</button>
                            <button type="button" className="btn btn-outline btn-sm" onClick={() => handleDeletePropertyDocument(row)}>Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  );
                })()}
              </div>
            </>
          )}
        </div>

        {/* ════ EDIT PROPERTY DOCUMENT MODAL ════ */}
        {/* Edit Insurance modal (property / vehicle / cover) */}
        {insEditItem && (
          <div style={S.mbg} onClick={() => setInsEditItem(null)}>
            <div className="modal" style={{ maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
              <div className="mhd">
                <button type="button" className="mx" onClick={() => setInsEditItem(null)}>×</button>
                <div className="mtitle">
                  Edit {insEditItem.type === 'property' ? 'Property' : insEditItem.type === 'vehicle' ? 'Vehicle' : 'Asset'} Insurance
                </div>
                <div className="msub">{insEditItem.type === 'property' ? (insEditItem.item.propertyName || insEditItem.item.propertyRef) : insEditItem.type === 'vehicle' ? (insEditItem.item.name || insEditItem.item.vehicleName) : (insEditItem.item.cover || insEditItem.item.propertyRef)}</div>
              </div>
              <form onSubmit={async (e) => {
                e.preventDefault();
                const type = insEditItem.type;
                const item = insEditItem.item;
                const id = item._id || item.id;
                if (!id) { showToast('Cannot edit: no id'); return; }
                setInsEditSaving(true);
                try {
                  const get = (id) => document.getElementById('ins-edit-' + id)?.value ?? '';
                  const getNum = (id) => { const v = document.getElementById('ins-edit-' + id)?.value; return v === '' ? undefined : Number(v); };
                  if (type === 'property') {
                    await updateInsurance('property', id, {
                      ...item,
                      propertyName: get('propertyName'),
                      propertyRef: get('propertyRef') || item.propertyRef,
                      insurer: get('insurer'),
                      insurance: get('insured') === 'yes' ? 'Yes' : 'No',
                      termlyPremium: getNum('termlyPremium'),
                      amountInsured: getNum('amountInsured'),
                      nextPaymentDate: get('nextPaymentDate') || undefined,
                    });
                  } else if (type === 'vehicle') {
                    await updateInsurance('vehicle', id, {
                      ...item,
                      name: get('name') || item.vehicleName,
                      vehicleName: get('name') || item.vehicleName,
                      insurer: get('insurer'),
                      provider: get('provider') || get('insurer'),
                      policyNumber: get('policyNumber'),
                    });
                  } else {
                    await updateInsurance('cover', id, {
                      ...item,
                      cover: get('cover'),
                      propertyRef: get('propertyRef') || item.propertyRef,
                      insurer: get('insurer'),
                      insurance: get('insured') === 'yes' ? 'Yes' : 'No',
                      termlyPremium: getNum('termlyPremium'),
                      amountInsured: getNum('amountInsured'),
                      nextPaymentDate: get('nextPaymentDate') || undefined,
                    });
                  }
                  setInsEditItem(null);
                  showToast('Insurance updated');
                } catch (err) {
                  showToast(err.message || 'Update failed');
                } finally {
                  setInsEditSaving(false);
                }
              }}>
                <div className="mbody">
                  {insEditItem.type === 'property' && (
                    <div className="mgrid">
                      <div><label className="ml" htmlFor="ins-edit-propertyName">Property name</label><input id="ins-edit-propertyName" className="mi" defaultValue={insEditItem.item.propertyName} /></div>
                      <div><label className="ml" htmlFor="ins-edit-propertyRef">Property ref</label><input id="ins-edit-propertyRef" className="mi" defaultValue={insEditItem.item.propertyRef} placeholder="#1" /></div>
                      <div className="full"><label className="ml" htmlFor="ins-edit-insurer">Insurer</label><input id="ins-edit-insurer" className="mi" defaultValue={insEditItem.item.insurer} /></div>
                      <div><label className="ml" htmlFor="ins-edit-insured">Insured</label><select id="ins-edit-insured" className="ms" defaultValue={insEditItem.item.insurance === 'Yes' || insEditItem.item.insurance === true ? 'yes' : 'no'}><option value="yes">Yes</option><option value="no">No</option></select></div>
                      <div><label className="ml" htmlFor="ins-edit-termlyPremium">Termly premium</label><input id="ins-edit-termlyPremium" className="mi" type="number" min="0" defaultValue={insEditItem.item.termlyPremium} /></div>
                      <div><label className="ml" htmlFor="ins-edit-amountInsured">Sum insured</label><input id="ins-edit-amountInsured" className="mi" type="number" min="0" defaultValue={insEditItem.item.amountInsured} /></div>
                      <div><label className="ml" htmlFor="ins-edit-nextPaymentDate">Next renewal (YYYY-MM)</label><input id="ins-edit-nextPaymentDate" className="mi" type="month" defaultValue={insEditItem.item.nextPaymentDate ? String(insEditItem.item.nextPaymentDate).slice(0, 7) : ''} /></div>
                    </div>
                  )}
                  {insEditItem.type === 'vehicle' && (
                    <div className="mgrid">
                      <div className="full"><label className="ml" htmlFor="ins-edit-name">Vehicle / policy name</label><input id="ins-edit-name" className="mi" defaultValue={insEditItem.item.name || insEditItem.item.vehicleName} /></div>
                      <div className="full"><label className="ml" htmlFor="ins-edit-insurer">Insurer</label><input id="ins-edit-insurer" className="mi" defaultValue={insEditItem.item.insurer || insEditItem.item.provider} /></div>
                      <div><label className="ml" htmlFor="ins-edit-policyNumber">Policy number</label><input id="ins-edit-policyNumber" className="mi" defaultValue={insEditItem.item.policyNumber} /></div>
                    </div>
                  )}
                  {insEditItem.type === 'cover' && (
                    <div className="mgrid">
                      <div><label className="ml" htmlFor="ins-edit-cover">Cover name</label><input id="ins-edit-cover" className="mi" defaultValue={insEditItem.item.cover} /></div>
                      <div><label className="ml" htmlFor="ins-edit-propertyRef">Property ref</label><input id="ins-edit-propertyRef" className="mi" defaultValue={insEditItem.item.propertyRef} /></div>
                      <div className="full"><label className="ml" htmlFor="ins-edit-insurer">Insurer</label><input id="ins-edit-insurer" className="mi" defaultValue={insEditItem.item.insurer} /></div>
                      <div><label className="ml" htmlFor="ins-edit-insured">Insured</label><select id="ins-edit-insured" className="ms" defaultValue={insEditItem.item.insurance === 'Yes' || insEditItem.item.insurance === true ? 'yes' : 'no'}><option value="yes">Yes</option><option value="no">No</option></select></div>
                      <div><label className="ml" htmlFor="ins-edit-termlyPremium">Termly premium</label><input id="ins-edit-termlyPremium" className="mi" type="number" min="0" defaultValue={insEditItem.item.termlyPremium} /></div>
                      <div><label className="ml" htmlFor="ins-edit-amountInsured">Sum insured</label><input id="ins-edit-amountInsured" className="mi" type="number" min="0" defaultValue={insEditItem.item.amountInsured} /></div>
                      <div><label className="ml" htmlFor="ins-edit-nextPaymentDate">Next renewal (YYYY-MM)</label><input id="ins-edit-nextPaymentDate" className="mi" type="month" defaultValue={insEditItem.item.nextPaymentDate ? String(insEditItem.item.nextPaymentDate).slice(0, 7) : ''} /></div>
                    </div>
                  )}
                </div>
                <div className="mft" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'space-between' }}>
                  <div>
                    <button type="button" className="btn btn-outline btn-sm" style={{ borderColor: '#c53030', color: '#c53030' }} onClick={async () => {
                      if (!window.confirm('Delete this insurance record?')) return;
                      const id = insEditItem.item._id || insEditItem.item.id;
                      if (!id) { showToast('Cannot delete'); return; }
                      try {
                        await deleteInsurance(insEditItem.type, id);
                        setInsEditItem(null);
                        showToast('Deleted');
                      } catch (err) {
                        showToast(err.message || 'Delete failed');
                      }
                    }}>Delete</button>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => setInsEditItem(null)}>Cancel</button>
                    <button type="submit" className="btn btn-maroon btn-sm" disabled={insEditSaving}>{insEditSaving ? 'Saving…' : 'Save'}</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {propDocEdit && (
          <div style={S.mbg} onClick={() => setPropDocEdit(null)}>
            <div className="modal" style={{ maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
              <div className="mhd">
                <button type="button" className="mx" onClick={() => setPropDocEdit(null)}>×</button>
                <div className="mtitle">Edit property document</div>
                <div className="msub">{propDocEdit.propertyName || '—'}</div>
              </div>
              <form onSubmit={handleSavePropertyDocument}>
                <div className="mbody">
                  <div className="mgrid">
                    <div>
                      <label className="ml" htmlFor="prop-doc-propertyName">Property name</label>
                      <input className="mi" id="prop-doc-propertyName" defaultValue={propDocEdit.propertyName} placeholder="e.g. Breach" />
                    </div>
                    <div>
                      <label className="ml" htmlFor="prop-doc-propertyUse">Property use</label>
                      <input className="mi" id="prop-doc-propertyUse" defaultValue={propDocEdit.propertyUse} placeholder="e.g. US Embassy" />
                    </div>
                    <div className="full">
                      <label className="ml" htmlFor="prop-doc-titleDeedsPhysical">Title deeds (physical location)</label>
                      <input className="mi" id="prop-doc-titleDeedsPhysical" defaultValue={propDocEdit.titleDeedsPhysicalLocation} placeholder="e.g. K Safe" />
                    </div>
                    <div className="full">
                      <label className="ml" htmlFor="prop-doc-titleDeedsDigital">Title deeds (digital description)</label>
                      <input className="mi" id="prop-doc-titleDeedsDigital" defaultValue={propDocEdit.titleDeedsDigitalDescription} placeholder="e.g. Renia/Mako" />
                    </div>
                    <div>
                      <label className="ml" htmlFor="prop-doc-plans">Plans</label>
                      <input className="mi" id="prop-doc-plans" defaultValue={propDocEdit.plansDescription} />
                    </div>
                    <div>
                      <label className="ml" htmlFor="prop-doc-permits">Permits</label>
                      <input className="mi" id="prop-doc-permits" defaultValue={propDocEdit.permitsDescription} />
                    </div>
                    <div className="full">
                      <label className="ml" htmlFor="prop-doc-lease">Lease agreement</label>
                      <input className="mi" id="prop-doc-lease" defaultValue={propDocEdit.leaseAgreementDescription} />
                    </div>
                    <div className="full">
                      <label className="ml" htmlFor="prop-doc-notes">File location notes</label>
                      <input className="mi" id="prop-doc-notes" defaultValue={propDocEdit.fileLocationNotes} placeholder="Where physical & online copies are kept" />
                    </div>
                  </div>
                </div>
                <div className="mfoot">
                  <button type="button" className="btn btn-outline" onClick={() => setPropDocEdit(null)}>Cancel</button>
                  <button type="submit" className="btn btn-maroon">Save changes</button>
                </div>
              </form>
            </div>
          </div>
        )}

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
        {selectedDoc && (() => {
          const doc = docDetail || selectedDoc;
          return (
          <div style={S.mbg} onClick={() => { setSelectedDoc(null); setDocDetail(null); }}>
            <div className="modal" style={{ maxWidth: 460, maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
              <div className="mhd">
                <button type="button" className="mx" onClick={() => { setSelectedDoc(null); setDocDetail(null); }}>×</button>
                <div className="mtitle">{doc.name}</div>
                <div className="msub">Document · {doc.propertyName || '—'}</div>
              </div>
              <div className="mbody">
                <div style={{ fontSize: 13 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                    <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>Category</span>
                    <span>{DOCUMENT_CATEGORIES.find(c => c.id === doc.category)?.label || doc.category}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                    <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>Property</span>
                    <span>{doc.propertyName || '—'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                    <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>Date</span>
                    <span>{doc.date || '—'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                    <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>Digital copy</span>
                    <span>{doc.hasDigitalCopy ? (doc.digitalFileName || 'Yes') : 'No digital copy'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                    <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>Physical location</span>
                    <span style={{ textAlign: 'right', maxWidth: '60%' }}>
                      {doc.hasPhysicalCopy ? (doc.physicalLocation || 'Recorded') : 'No physical copy'}
                    </span>
                  </div>
                  {!doc.hasDigitalCopy && (
                    <div style={{ marginTop: 16 }}>
                      <label className="ml" htmlFor="doc-edit-file">Upload digital copy</label>
                      <input
                        id="doc-edit-file"
                        className="mi"
                        type="file"
                        accept=".pdf,image/*"
                        onChange={e => setDocEditFile(e.target.files?.[0] || null)}
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="mfoot">
                {doc.hasDigitalCopy && doc.digitalFileUrl && (
                  <a href={doc.digitalFileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-maroon" style={{ marginRight: 8 }}>View digital copy</a>
                )}
                {!doc.hasDigitalCopy && (
                  <button
                    type="button"
                    className="btn btn-maroon"
                    style={{ marginRight: 8 }}
                    onClick={handleDocEditUpload}
                    disabled={docUploading || !docEditFile}
                  >
                    {docUploading ? 'Uploading…' : 'Save digital copy'}
                  </button>
                )}
                <button type="button" className="btn btn-outline" onClick={() => { setSelectedDoc(null); setDocDetail(null); setDocEditFile(null); }}>Close</button>
              </div>
            </div>
          </div>
          );
        })()}

        {/* ════ UPLOAD DOCUMENT MODAL ════ */}
        {docUploadOpen && (
          <div style={S.mbg} onClick={() => { setDocUploadOpen(false); setDocUploadFile(null); setDocUploadPropertyId(''); setDocUploadCategory('deeds'); }}>
            <div className="modal" style={{ maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
              <div className="mhd">
                <button type="button" className="mx" onClick={() => { setDocUploadOpen(false); setDocUploadFile(null); setDocUploadPropertyId(''); setDocUploadCategory('deeds'); }}>×</button>
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
                      <select
                        className="ms"
                        id="doc-category"
                        value={docUploadCategory}
                        onChange={e => setDocUploadCategory(e.target.value)}
                      >
                        {DOCUMENT_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="ml" htmlFor="doc-property-id">Property</label>
                      <select
                        className="ms"
                        id="doc-property-id"
                        value={docUploadPropertyId}
                        onChange={e => setDocUploadPropertyId(e.target.value)}
                      >
                        <option value="">— General</option>
                        {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
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
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => { setDocUploadOpen(false); setDocUploadFile(null); setDocUploadPropertyId(''); setDocUploadCategory('deeds'); }}
                    disabled={docUploading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-maroon"
                    disabled={docUploading}
                  >
                    {docUploading ? 'Uploading…' : 'Add document'}
                  </button>
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
                      <select id="sp-type" className="ms" defaultValue={detailProp.propertyType || 'House'}>
                        {Object.keys(TYPE_META).map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <div className="sp-key">Entity</div>
                      <select id="sp-entity" className="ms" defaultValue={detailProp.ownedEntity || ''}>
                        <option value="">—</option>
                        {['SC', 'Alamait', 'TMT', 'Maitalan', 'VV'].map(ent => <option key={ent} value={ent}>{ent}</option>)}
                      </select>
                    </div>
                    <div>
                      <div className="sp-key">Usage</div>
                      <input id="sp-usage" className="mi" defaultValue={detailProp.usage || ''} placeholder="e.g. Residential" />
                    </div>
                    <div>
                      <div className="sp-key">Purchase Date</div>
                      <input id="sp-purchaseDate" type="month" className="mi" defaultValue={detailProp.purchaseDate ? detailProp.purchaseDate.slice(0,7) : ''} />
                    </div>
                  </div>
                </div>
                <div className="sp-sec">
                  <div className="sp-sec-t">Financials</div>
                  <div className="sp-grid">
                    <div>
                      <div className="sp-key">Purchase Price</div>
                      <input id="sp-price" type="number" className="mi" defaultValue={detailProp.totalPurchaseAmount || 0} min="0" />
                    </div>
                    <div>
                      <div className="sp-key">Fees</div>
                      <input id="sp-fees" type="number" className="mi" defaultValue={detailProp.purchaseFees || 0} min="0" />
                    </div>
                    <div>
                      <div className="sp-key">Total Acquisition</div>
                      <div className="sp-val mn" style={{ color: 'var(--maroon)' }}>{fmt((detailProp.totalPurchaseAmount || 0) + (detailProp.purchaseFees || 0))}</div>
                    </div>
                    <div>
                      <div className="sp-key">Est. Current Value</div>
                      <input id="sp-value" type="number" className="mi" defaultValue={detailProp.estimatedCurrentValue || 0} min="0" />
                    </div>
                    <div>
                      <div className="sp-key">Investment Req.</div>
                      <input id="sp-investment" type="number" className="mi" defaultValue={detailProp.investmentRequired || ''} min="0" />
                    </div>
                    <div>
                      <div className="sp-key">Potential Income/mo</div>
                      <input id="sp-income" type="number" className="mi" defaultValue={detailProp.potentialIncome || ''} min="0" />
                    </div>
                  </div>
                </div>
                <div className="sp-sec">
                  <div className="sp-sec-t">Insurance</div>
                  <div className="sp-grid">
                    <div>
                      <div className="sp-key">Status</div>
                      <select id="sp-insured" className="ms" defaultValue={detailProp.insured ? 'yes' : 'no'}>
                        <option value="yes">Insured</option>
                        <option value="no">Not insured</option>
                      </select>
                    </div>
                    <div>
                      <div className="sp-key">Insurer</div>
                      <input id="sp-insurer" className="mi" defaultValue={detailProp.insurer || ''} />
                    </div>
                    <div>
                      <div className="sp-key">Termly Premium</div>
                      <input id="sp-premium" type="number" className="mi" defaultValue={detailProp.termlyPremium || ''} min="0" />
                    </div>
                    <div>
                      <div className="sp-key">Sum Insured</div>
                      <input id="sp-sum" type="number" className="mi" defaultValue={detailProp.sumInsured || ''} min="0" />
                    </div>
                    <div>
                      <div className="sp-key">Next Payment</div>
                      <input id="sp-next" type="date" className="mi" defaultValue={detailProp.nextPayment || ''} />
                    </div>
                  </div>
                </div>
                <div className="sp-sec">
                  <div className="sp-sec-t">Documents</div>
                  {(() => {
                    const docsForProp = propertyDocuments.filter(row => row.propertyName === detailProp.name);
                    if (!docsForProp.length) {
                      return <div style={{ fontSize: 12, color: 'var(--muted)' }}>No documents linked to this property yet.</div>;
                    }
                    return (
                      <div style={{ fontSize: 12 }}>
                        <div style={{ marginBottom: 6 }}>
                          <strong>{docsForProp.length}</strong> row{docsForProp.length > 1 ? 's' : ''} in property document register
                        </div>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {docsForProp.slice(0, 4).map((d, idx) => (
                            <li key={d._id || d.id || idx} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                              <span>{d.propertyName}</span>
                              <span style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'right' }}>
                                {d.titleDeedsPhysicalLocation ? 'Physical deeds' : 'No physical'} · {d.titleDeedsDigitalDescription ? 'Digital' : 'No digital'}
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
                  <button
                    type="button"
                    className="btn btn-navy btn-sm"
                    disabled={detailSaving}
                    onClick={async () => {
                      if (!detailProp) return;
                      try {
                        setDetailSaving(true);
                        const price = Number(document.getElementById('sp-price')?.value) || 0;
                        const fees = Number(document.getElementById('sp-fees')?.value) || 0;
                        await updateProperty(detailProp.id, {
                          name: detailProp.name,
                          address: detailProp.address,
                          propertyType: document.getElementById('sp-type')?.value || detailProp.propertyType,
                          ownedEntity: document.getElementById('sp-entity')?.value || '',
                          usage: document.getElementById('sp-usage')?.value || '',
                          purchaseDate: document.getElementById('sp-purchaseDate')?.value || '',
                          purchasePrice: price,
                          purchaseFees: fees,
                          totalPurchaseAmount: price,
                          estimatedCurrentValue: Number(document.getElementById('sp-value')?.value) || 0,
                          investmentRequired: Number(document.getElementById('sp-investment')?.value) || 0,
                          potentialIncome: Number(document.getElementById('sp-income')?.value) || 0,
                          insured: (document.getElementById('sp-insured')?.value || 'no') === 'yes',
                          insurer: document.getElementById('sp-insurer')?.value || '',
                          termlyPremium: Number(document.getElementById('sp-premium')?.value) || 0,
                          sumInsured: Number(document.getElementById('sp-sum')?.value) || 0,
                          nextPayment: document.getElementById('sp-next')?.value || '',
                        });
                        showToast('Property updated');
                      } catch (err) {
                        showToast(err.message || 'Failed to update property');
                      } finally {
                        setDetailSaving(false);
                      }
                    }}
                  >
                    {detailSaving ? 'Saving…' : 'Save changes'}
                  </button>
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => { setDocFilterPropertyName(detailProp?.name ?? null); setDetailProp(null); setPage('documents'); }}>Documents</button>
                  <button type="button" className="btn btn-outline btn-sm" style={{ color: 'var(--maroon)', borderColor: 'var(--maroon)' }} onClick={handleDeleteProperty} aria-label="Delete property">Delete property</button>
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