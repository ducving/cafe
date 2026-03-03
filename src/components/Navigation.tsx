import React from 'react';
import { Link, useLocation } from 'react-router-dom';

type AnyObject = Record<string, any>;

function safeParseUser(raw: string | null): AnyObject | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AnyObject;
  } catch {
    return null;
  }
}

export default function Navigation(): React.ReactElement {
  const location = useLocation();

  const navStyle: React.CSSProperties = {
    backgroundColor: '#2c3e50',
    padding: '15px 0',
    marginBottom: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '10px',
  };

  const linkStyle: React.CSSProperties = {
    color: 'white',
    textDecoration: 'none',
    padding: '10px 20px',
    borderRadius: '5px',
    transition: 'background-color 0.3s',
    fontWeight: 500,
  };

  const activeLinkStyle: React.CSSProperties = {
    ...linkStyle,
    backgroundColor: '#3498db',
  };

  const isLoggedIn = localStorage.getItem('token');
  const user = safeParseUser(localStorage.getItem('user'));
  const role = String(user?.role || user?.type || user?.user_type || '').toLowerCase();
  const isAdmin =
    role === 'admin' ||
    user?.isAdmin === true ||
    user?.is_admin === true ||
    user?.level === 1 ||
    user?.role_id === 1;

  return (
    <nav style={navStyle}>
      <div style={containerStyle}>
        <Link to="/" style={location.pathname === '/' ? activeLinkStyle : linkStyle}>
          Cửa Hàng
        </Link>
        <Link to="/about" style={location.pathname === '/about' ? activeLinkStyle : linkStyle}>
          Giới Thiệu
        </Link>
        <Link to="/cart" style={location.pathname === '/cart' ? activeLinkStyle : linkStyle}>
          Giỏ hàng
        </Link>

        {isLoggedIn && isAdmin && (
          <Link to="/admin" style={location.pathname.startsWith('/admin') ? activeLinkStyle : linkStyle}>
            Admin
          </Link>
        )}

        {!isLoggedIn ? (
          <Link to="/login" style={location.pathname === '/login' ? activeLinkStyle : linkStyle}>
            Đăng Nhập
          </Link>
        ) : (
          <button
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.location.href = '/';
            }}
            style={{
              ...linkStyle,
              backgroundColor: '#e74c3c',
              border: 'none',
              cursor: 'pointer',
            }}
            type="button"
          >
            Đăng Xuất
          </button>
        )}
      </div>
    </nav>
  );
}

