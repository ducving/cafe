import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginAPI } from '../services/api';

type AnyObject = Record<string, any>;

function isAdminUser(user: any): boolean {
  if (!user || typeof user !== 'object') return false;
  const role = String((user as AnyObject).role || (user as AnyObject).type || (user as AnyObject).user_type || '').toLowerCase();
  if (role === 'admin') return true;
  if ((user as AnyObject).isAdmin === true || (user as AnyObject).is_admin === true) return true;
  if ((user as AnyObject).is_admin === 1 || (user as AnyObject).isAdmin === 1) return true;
  if ((user as AnyObject).level === 1 || (user as AnyObject).role_id === 1) return true;
  return false;
}

function normalizeLoginPayload(payload: any): { token?: string; user?: any } {
  const p: AnyObject = payload && typeof payload === 'object' ? payload : {};

  const token: string | undefined =
    p.token ||
    p.access_token ||
    p.jwt ||
    p.data?.token ||
    p.data?.access_token ||
    p.data?.jwt;

  // Common patterns: { user: {...} }, { data: { user: {...} } }, or user fields at top-level.
  let user: any = p.user || p.data?.user || p.account || p.data?.account || null;
  if (!user && (p.role || p.type || p.user_type || p.email || p.name || p.id)) {
    user = p;
  }

  // Ensure role is present if API returns it at top-level
  if (user && typeof user === 'object' && !user.role && p.role) {
    user = { ...user, role: p.role };
  }

  return { token, user };
}

export default function Login(): React.ReactElement {
  const [identifier, setIdentifier] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!identifier || !password) {
      setError('Vui lòng nhập đầy đủ thông tin');
      setLoading(false);
      return;
    }

    const result = await loginAPI(identifier, password);

    if (result.success) {
      const { token, user } = normalizeLoginPayload(result.data);

      if (token) localStorage.setItem('token', token);
      if (user) localStorage.setItem('user', JSON.stringify(user));

      const nextPath = isAdminUser(user) ? '/admin' : '/';
      navigate(nextPath);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: '400px',
    margin: '50px auto',
    padding: '30px',
    backgroundColor: 'white',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  };

  const titleStyle: React.CSSProperties = {
    textAlign: 'center',
    color: '#2c3e50',
    marginBottom: '30px',
    fontSize: '2em',
  };

  const formGroupStyle: React.CSSProperties = { marginBottom: '20px' };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '8px',
    color: '#555',
    fontWeight: 500,
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '16px',
    boxSizing: 'border-box',
  };

  const buttonStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.7 : 1,
    transition: 'background-color 0.3s',
  };

  const errorStyle: React.CSSProperties = {
    color: '#e74c3c',
    marginBottom: '15px',
    padding: '10px',
    backgroundColor: '#ffeaea',
    borderRadius: '5px',
    fontSize: '14px',
  };

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>Đăng Nhập</h1>

      {error && <div style={errorStyle}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div style={formGroupStyle}>
          <label style={labelStyle}>Email / Tên đăng nhập:</label>
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            style={inputStyle}
            placeholder="Nhập email hoặc tên đăng nhập"
            disabled={loading}
          />
        </div>

        <div style={formGroupStyle}>
          <label style={labelStyle}>Mật khẩu:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            placeholder="Nhập mật khẩu"
            disabled={loading}
          />
        </div>

        <button type="submit" style={buttonStyle} disabled={loading}>
          {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
        </button>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#718096' }}>
          Chưa có tài khoản?{' '}
          <Link to="/register" style={{ color: '#3182ce', fontWeight: 600, textDecoration: 'none' }}>
            Đăng ký ngay
          </Link>
        </div>
      </form>
    </div>
  );
}

