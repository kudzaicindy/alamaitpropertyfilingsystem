import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { API_BASE_URL } from '../config/api';

function norm(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function inferPropertyFromText(doc, properties = []) {
  const hay = norm([
    doc.title,
    doc.name,
    doc.digitalFileName,
    doc.digitalFileKey,
    doc.digitalFileUrl,
  ].join(' '));
  if (!hay) return null;
  const match = properties.find((p) => {
    const pn = norm(p.name);
    return pn && hay.includes(pn);
  });
  return match?.name || null;
}

function isDocumentRecord(doc) {
  if (!doc || typeof doc !== 'object') return false;
  const hasDocShape = !!(doc.title || doc.name || doc.documentType || doc.category || doc.digitalFileUrl || doc.digitalFileName);
  const isPropertyRegisterOnly = !!(doc.propertyName && doc.propertyUse && doc.titleDeedsPhysicalLocation !== undefined && !doc.title && !doc.name);
  return hasDocShape && !isPropertyRegisterOnly;
}

/** Map API document to UI shape; pass properties to resolve propertyName from referenceId */
function toUIDoc(doc, properties = []) {
  const createdAt = doc.createdAt || doc.updatedAt;
  const date = createdAt
    ? new Date(createdAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
    : '—';
  let propertyName = '—';
  if (doc.referenceType === 'property' && doc.referenceId) {
    const p = properties.find((x) => String(x.id) === doc.referenceId || String(x._id) === doc.referenceId);
    propertyName = p ? p.name : doc.referenceId;
  } else if (doc.referenceType === 'property_insured' || doc.referenceType === 'insured_cover') {
    propertyName = doc.referenceLabel || doc.referenceId || '—';
  } else if (doc.referenceType === 'general') {
    // Some uploads are saved as "general" even when filename/title includes property name.
    propertyName = inferPropertyFromText(doc, properties) || doc.propertyName || '—';
  } else if (doc.propertyName) {
    propertyName = doc.propertyName;
  }
  return {
    id: doc._id || doc.id,
    _id: doc._id,
    name: doc.title || doc.name || 'Untitled',
    propertyName,
    date,
    category: doc.documentType || doc.category || 'general',
    hasDigitalCopy: !!doc.hasDigitalCopy,
    hasPhysicalCopy: !!doc.hasPhysicalCopy,
    physicalLocation: doc.physicalCopyLocation || doc.physicalLocation || '',
    digitalFileName: doc.digitalFileName || null,
    digitalFileUrl: doc.digitalFileUrl || null,
    digitalFileKey: doc.digitalFileKey || null,
    referenceType: doc.referenceType,
    referenceId: doc.referenceId,
  };
}

export function useDocuments(properties = []) {
  const { fetchWithAuth, isAuthenticated } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDocuments = useCallback(
    async (query = {}) => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const params = new URLSearchParams();
        if (query.referenceType) params.set('referenceType', query.referenceType);
        if (query.referenceId) params.set('referenceId', query.referenceId);
        const qs = params.toString();
        const url = `/api/documents${qs ? `?${qs}` : ''}`;
        const res = await fetchWithAuth(url);
        if (!res.ok) throw new Error('Failed to fetch documents');
        const json = await res.json();
        const list = json.data ?? json.documents ?? (Array.isArray(json) ? json : []);
        const docsOnly = Array.isArray(list) ? list.filter(isDocumentRecord) : [];
        setDocuments(docsOnly.map((d) => toUIDoc(d, properties)));
      } catch (e) {
        setError(e.message || 'Failed to fetch documents');
        setDocuments([]);
      } finally {
        setLoading(false);
      }
    },
    [fetchWithAuth, isAuthenticated, properties]
  );

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  /** Upload file (multipart). Do not set Content-Type so browser sets boundary. */
  const uploadDocument = useCallback(
    async (formData) => {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      const base = API_BASE_URL.replace(/\/api$/, '') || API_BASE_URL;
      const res = await fetch(`${base}/api/documents/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || json.error || 'Upload failed');
      const created = json.data ?? json;
      return toUIDoc(created, properties);
    },
    [properties]
  );

  /** Create physical-only (no file) document */
  const createDocument = useCallback(
    async (body) => {
      const res = await fetchWithAuth('/api/documents', {
        method: 'POST',
        body: JSON.stringify({
          title: body.title,
          documentType: body.documentType || body.category || 'general',
          referenceType: body.referenceType || 'general',
          referenceId: body.referenceId || undefined,
          hasDigitalCopy: false,
          hasPhysicalCopy: !!body.hasPhysicalCopy,
          physicalCopyLocation: body.physicalCopyLocation || body.physicalLocation || '',
          notes: body.notes || '',
        }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.message || json.error || 'Failed to create document');
      }
      const json = await res.json();
      const created = json.data ?? json;
      return toUIDoc(created, properties);
    },
    [fetchWithAuth, properties]
  );

  /** Get one document by id (e.g. for digitalFileUrl when viewing) */
  const getDocument = useCallback(
    async (id) => {
      if (!id || !isAuthenticated) return null;
      try {
        const res = await fetchWithAuth(`/api/documents/${id}`);
        if (!res.ok) return null;
        const json = await res.json();
        const raw = json.data ?? json;
        return raw ? toUIDoc(raw, properties) : null;
      } catch {
        return null;
      }
    },
    [fetchWithAuth, isAuthenticated, properties]
  );

  const refreshDocuments = fetchDocuments;

  return {
    documents,
    isLoading: loading,
    error,
    fetchDocuments,
    uploadDocument,
    createDocument,
    getDocument,
    refreshDocuments,
    toUIDoc: (d) => toUIDoc(d, properties),
  };
}
