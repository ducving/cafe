import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerAPI, googleLoginAPI } from '../services/api';
import { GoogleLogin } from '@react-oauth/google';
import { useToast } from '../components/ToastContext';
import { User, Mail, Lock, Phone, UserPlus, AlertCircle, Eye, EyeOff } from 'lucide-react';
import './Login.css'; // Reusing Login.css for consistency
import './Register.css';
import loginBg from '../assets/images/login-bg.png';

export default function Register(): React.ReactElement {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setError('');
    setLoading(true);

    const result = await googleLoginAPI(credentialResponse.credential);

    if (result.success) {
      const data = result.data;
      const token = data.token || data.access_token || data.data?.token;
      const user = data.user || data.data?.user || data;

      if (token) localStorage.setItem('token', token);
      if (user) localStorage.setItem('user', typeof user === 'string' ? user : JSON.stringify(user));

      showToast('Đăng nhập Google thành công!', 'success');
      navigate('/');
    } else {
      setError(result.error || 'Đăng nhập Google thất bại');
    }

    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    
    if (!formData.name || !formData.username || !formData.email || !formData.password) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setLoading(true);

    const { confirmPassword, ...registerData } = formData;
    const result = await registerAPI(registerData);

    if (result.success) {
      showToast('Đăng ký thành công! Vui lòng đăng nhập.', 'success');
      navigate('/login');
    } else {
      setError(result.error || 'Đăng ký thất bại, vui lòng thử lại');
    }

    setLoading(false);
  };

  return (
    <div className="login-page" style={{ backgroundImage: `url(${loginBg})` }}>
      <div className="register-card">
        <div className="login-header">
          <h1>Tạo Tài Khoản</h1>
          <p>Tham gia cộng đồng The Cafe ngay hôm nay</p>
        </div>

        {error && (
          <div className="error-message">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Họ và tên *</label>
            <div className="input-wrapper">
              <User size={20} />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nguyễn Văn A"
                disabled={loading}
                autoFocus
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Tên đăng nhập *</label>
              <div className="input-wrapper">
                <User size={20} />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="username123"
                  disabled={loading}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Số điện thoại</label>
              <div className="input-wrapper">
                <Phone size={20} />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="0912345678"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Email *</label>
            <div className="input-wrapper">
              <Mail size={20} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@gmail.com"
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Mật khẩu *</label>
              <div className="input-wrapper">
                <Lock size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Xác nhận *</label>
              <div className="input-wrapper">
                <Lock size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '16px',
                    background: 'none',
                    border: 'none',
                    color: '#636e72',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? (
              'Đang xử lý...'
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <UserPlus size={20} /> Đăng Ký Ngay
              </span>
            )}
          </button>

          <div className="divider">
           
          </div>

          <div className="google-wrapper">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                setError('Đăng ký bằng Google thất bại');
                showToast('Lỗi xác thực Google', 'error');
              }}
              useOneTap
              theme="outline"
              shape="pill"
              text="signup_with"
              width="100%"
            />
          </div>

          <div className="footer-links">
            Đã có tài khoản?{' '}
            <Link to="/login">Đăng nhập</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
