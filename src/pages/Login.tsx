import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginAPI, googleLoginAPI } from '../services/api';
import { useToast } from '../components/ToastContext';
import { GoogleLogin } from '@react-oauth/google';
import { Mail, Lock, LogIn, AlertCircle, Eye, EyeOff } from 'lucide-react';
import './Login.css';
import loginBg from '../assets/images/login-bg.png';

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

  let user: any = p.user || p.data?.user || p.account || p.data?.account || null;
  if (!user && (p.role || p.type || p.user_type || p.email || p.name || p.id)) {
    user = p;
  }

  if (user && typeof user === 'object' && !user.role && p.role) {
    user = { ...user, role: p.role };
  }

  return { token, user };
}

export default function Login(): React.ReactElement {
  const [identifier, setIdentifier] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setError('');
    setLoading(true);

    const result = await googleLoginAPI(credentialResponse.credential);

    if (result.success) {
      const { token, user } = normalizeLoginPayload(result.data);

      if (token) localStorage.setItem('token', token);
      if (user) localStorage.setItem('user', JSON.stringify(user));

      const nextPath = isAdminUser(user) ? '/admin' : '/';
      showToast('Đăng nhập Google thành công', 'success');
      navigate(nextPath);
    } else {
      setError(result.error || 'Đăng nhập Google thất bại');
      showToast(result.error || 'Đăng nhập Google thất bại', 'error');
    }

    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!identifier || !password) {
      showToast('Vui lòng nhập đầy đủ thông tin', 'warning');
      setLoading(false);
      return;
    }

    const result = await loginAPI(identifier, password);

    if (result.success) {
      const { token, user } = normalizeLoginPayload(result.data);

      if (token) localStorage.setItem('token', token);
      if (user) localStorage.setItem('user', JSON.stringify(user));

      const nextPath = isAdminUser(user) ? '/admin' : '/';
      showToast('Đăng nhập thành công', 'success');
      navigate(nextPath);
    } else {
      setError(result.error || 'Thông tin đăng nhập không chính xác');
    }

    setLoading(false);
  };

  return (
    <div className="login-page" style={{ backgroundImage: `url(${loginBg})` }}>
      <div className="login-card">
        <div className="login-header">
          <h1>Chào Mừng Trở Lại</h1>
          <p>Đăng nhập để tiếp tục với The Cafe</p>
        </div>

        {error && (
          <div className="error-message">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="identifier">Email hoặc Tên đăng nhập</label>
            <div className="input-wrapper">
              <Mail size={20} />
              <input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="you@example.com"
                disabled={loading}
                autoFocus
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <div className="input-wrapper">
              <Lock size={20} />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '16px',
                  background: 'none',
                  border: 'none',
                  color: '#636e72',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? (
              'Đang xác thực...'
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <LogIn size={20} /> Đăng Nhập
              </span>
            )}
          </button>

          <div className="divider">
            
          </div>

          <div className="google-wrapper">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                setError('Đăng nhập Google thất bại');
                showToast('Lỗi xác thực Google', 'error');
              }}
              useOneTap
              theme="outline"
              shape="pill"
              text="signin_with"
              width="354px"
            />
          </div>

          <div className="footer-links">
            Chưa có tài khoản?{' '}
            <Link to="/register">Đăng ký ngay</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

