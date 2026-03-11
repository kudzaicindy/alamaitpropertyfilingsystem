import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../config/api';

export function useAuth() {
  const [authState, setAuthState] = useState({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true
  });

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      if (!token || !userStr) {
        setAuthState({ user: null, token: null, isAuthenticated: false, isLoading: false });
        return;
      }
      try {
        const user = JSON.parse(userStr);
        const res = await fetch(`${API_BASE_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error('Invalid token');
        setAuthState({ token, user, isAuthenticated: true, isLoading: false });
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setAuthState({ user: null, token: null, isAuthenticated: false, isLoading: false });
      }
    };
    init();
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthState({ user: null, token: null, isAuthenticated: false, isLoading: false });
  }, []);

  const fetchWithAuth = useCallback(
    async (url, opts = {}) => {
      const token = authState.token;
      if (!token) throw new Error('No token');
      const base = API_BASE_URL.replace(/\/api$/, '') || API_BASE_URL;
      const fullUrl = url.startsWith('http') ? url : `${base}${url}`;
      const res = await fetch(fullUrl, {
        ...opts,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...opts.headers }
      });
      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setAuthState({ user: null, token: null, isAuthenticated: false, isLoading: false });
      }
      return res;
    },
    [authState.token]
  );

  const login = async (email, password) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    if (!data.success || !data.data?.token || !data.data?.user) throw new Error('Invalid response');
    localStorage.setItem('token', data.data.token);
    localStorage.setItem('user', JSON.stringify(data.data.user));
    setAuthState({ token: data.data.token, user: data.data.user, isAuthenticated: true, isLoading: false });
    return data;
  };

  const register = async (payload) => {
    const { username, email, password, firstName, lastName, role } = payload;
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, firstName, lastName, role: role || 'assistant' })
    });
    const data = await res.json();
    if (!res.ok) {
      const msg = Array.isArray(data.error) ? data.error.join(' ') : (data.message || 'Registration failed');
      throw new Error(msg);
    }
    if (data.token && data.user) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setAuthState({ token: data.token, user: data.user, isAuthenticated: true, isLoading: false });
    }
    return data;
  };

  return {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    login,
    logout,
    register,
    fetchWithAuth
  };
}
