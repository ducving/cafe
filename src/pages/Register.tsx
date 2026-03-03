import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerAPI } from '../services/api';

export default function Register(): React.ReactElement {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
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
      alert('Đăng ký thành công! Vui lòng đăng nhập.');
      navigate('/login');
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: '500px',
    margin: '40px auto',
    padding: '30px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
  };

  const titleStyle: React.CSSProperties = {
    textAlign: 'center',
    color: '#1a202c',
    marginBottom: '24px',
    fontSize: '1.875rem',
    fontWeight: 800,
  };

  const formGroupStyle: React.CSSProperties = { marginBottom: '16px' };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '6px',
    color: '#4a5568',
    fontWeight: 600,
    fontSize: '0.875rem',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '15px',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  const buttonStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px',
    backgroundColor: '#3182ce',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 700,
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.7 : 1,
    marginTop: '10px',
    transition: 'background-color 0.2s',
  };

  const errorStyle: React.CSSProperties = {
    color: '#e53e3e',
    marginBottom: '16px',
    padding: '12px',
    backgroundColor: '#fff5f5',
    borderLeft: '4px solid #e53e3e',
    borderRadius: '4px',
    fontSize: '14px',
  };

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>Tạo Tài Khoản</h1>

      {error && <div style={errorStyle}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div style={formGroupStyle}>
          <label style={labelStyle}>Họ và tên *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            style={inputStyle}
            placeholder="Nhập họ và tên"
            disabled={loading}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={formGroupStyle}>
            <label style={labelStyle}>Tên đăng nhập *</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Username"
              disabled={loading}
            />
          </div>
          <div style={formGroupStyle}>
            <label style={labelStyle}>Số điện thoại</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              style={inputStyle}
              placeholder="0123..."
              disabled={loading}
            />
          </div>
        </div>

        <div style={formGroupStyle}>
          <label style={labelStyle}>Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            style={inputStyle}
            placeholder="example@gmail.com"
            disabled={loading}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={formGroupStyle}>
            <label style={labelStyle}>Mật khẩu *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              style={inputStyle}
              placeholder="••••••••"
              disabled={loading}
            />
          </div>
          <div style={formGroupStyle}>
            <label style={labelStyle}>Xác nhận mật khẩu *</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              style={inputStyle}
              placeholder="••••••••"
              disabled={loading}
            />
          </div>
        </div>


        <button type="submit" style={buttonStyle} disabled={loading}>
          {loading ? 'Đang xử lý...' : 'Đăng Ký Ngay'}
        </button>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#718096' }}>
          Đã có tài khoản?{' '}
          <Link to="/login" style={{ color: '#3182ce', fontWeight: 600, textDecoration: 'none' }}>
            Đăng nhập
          </Link>
        </div>
      </form>
    </div>
  );
}
