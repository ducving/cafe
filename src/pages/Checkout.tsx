import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../user/CartContext';
import { createOrder } from '../services/ordersService';

export default function Checkout(): React.ReactElement {
  const navigate = useNavigate();
  const { items, totalPrice, clear, totalQuantity } = useCart();

  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    note: '',
    payment_method: 'cod',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-fill user info if logged in
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setFormData(prev => ({
          ...prev,
          full_name: user.full_name || user.name || '',
          email: user.email || '',
          phone: user.phone || '',
        }));
      } catch (e) {
        console.error('Error parsing user data', e);
      }
    }
  }, []);

  // If cart is empty, redirect back to cart or home
  useEffect(() => {
    if (items.length === 0 && !loading) {
      navigate('/cart');
    }
  }, [items, navigate, loading]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (items.length === 0) return;
    
    setLoading(true);
    setError('');

    try {
      const orderItems = items.map(item => ({
        product_id: item.id,
        quantity: item.quantity
      }));

      const response = await createOrder({
        ...formData,
        items: orderItems,
      });

      if (response.success) {
        const orderId = response.data?.id;
        clear();
        navigate(orderId ? `/order-success/${orderId}` : '/');
      } else {
        setError(response.message || 'Có lỗi xảy ra khi đặt hàng.');
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi kết nối máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: '1200px',
    margin: '40px auto',
    padding: '0 20px',
    fontFamily: "'Inter', sans-serif",
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '32px',
    fontWeight: 800,
    marginBottom: '30px',
    color: '#111827',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  };

  const mainLayout: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 400px',
    gap: '30px',
  };

  const sectionStyle: React.CSSProperties = {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  };

  const inputGroup: React.CSSProperties = {
    marginBottom: '16px',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '14px',
    fontWeight: 600,
    color: '#374151',
    marginBottom: '6px',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '10px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  };

  const summaryCardStyle: React.CSSProperties = {
    ...sectionStyle,
    height: 'fit-content',
    position: 'sticky',
    top: '20px',
  };

  const summaryRow: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '16px',
    fontSize: '15px',
    color: '#4b5563',
  };

  const totalRow: React.CSSProperties = {
    ...summaryRow,
    marginTop: '20px',
    paddingTop: '20px',
    borderTop: '2px dashed #f3f4f6',
    fontSize: '18px',
    fontWeight: 800,
    color: '#111827',
  };

  const checkoutBtn: React.CSSProperties = {
    width: '100%',
    padding: '16px',
    backgroundColor: loading ? '#9ca3af' : '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 700,
    cursor: loading ? 'not-allowed' : 'pointer',
    marginTop: '24px',
    transition: 'all 0.2s',
    boxShadow: loading ? 'none' : '0 10px 15px -3px rgba(220, 38, 38, 0.25)',
  };

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>
        <span>Thông tin thanh toán</span>
        <span style={{ fontSize: '16px', backgroundColor: '#fee2e2', color: '#dc2626', padding: '4px 12px', borderRadius: '20px', fontWeight: 700 }}>
          {totalQuantity} món
        </span>
      </h1>

      <form onSubmit={handleCheckout} style={mainLayout}>
        <div style={sectionStyle}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '20px', color: '#111827' }}>Địa chỉ giao hàng</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={inputGroup}>
              <label style={labelStyle}>Họ và tên *</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                style={inputStyle}
                required
              />
            </div>
            <div style={inputGroup}>
              <label style={labelStyle}>Số điện thoại *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                style={inputStyle}
                required
              />
            </div>
          </div>

          <div style={inputGroup}>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              style={inputStyle}
            />
          </div>

          <div style={inputGroup}>
            <label style={labelStyle}>Địa chỉ nhận hàng *</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              style={inputStyle}
              required
            />
          </div>

          <div style={inputGroup}>
            <label style={labelStyle}>Ghi chú đơn hàng</label>
            <textarea
              name="note"
              value={formData.note}
              onChange={handleInputChange}
              style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
            />
          </div>
          
          <div style={inputGroup}>
            <label style={labelStyle}>Phương thức thanh toán</label>
            <select 
              name="payment_method" 
              value={formData.payment_method} 
              onChange={handleInputChange}
              style={inputStyle}
            >
              <option value="cod">Thanh toán khi nhận hàng (COD)</option>
              <option value="banking">Chuyển khoản qua ngân hàng</option>
            </select>
          </div>
        </div>

        <div style={summaryCardStyle}>
          <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '24px' }}>Tóm tắt đơn hàng</h3>
          <div style={summaryRow}>
            <span>Số lượng sản phẩm</span>
            <span>{totalQuantity}</span>
          </div>
          <div style={summaryRow}>
            <span>Tạm tính</span>
            <span>{new Intl.NumberFormat('vi-VN').format(totalPrice)}đ</span>
          </div>
          <div style={summaryRow}>
            <span>Phí giao hàng</span>
            <span style={{ color: '#16a34a', fontWeight: 600 }}>Miễn phí</span>
          </div>
          
          {error && (
            <div style={{ color: '#b91c1c', padding: '12px', backgroundColor: '#fee2e2', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
              {error}
            </div>
          )}

          <div style={totalRow}>
            <span>Tổng cộng</span>
            <span>{new Intl.NumberFormat('vi-VN').format(totalPrice)}đ</span>
          </div>

          <button
            type="submit"
            style={checkoutBtn}
            disabled={loading}
          >
            {loading ? 'Đang gửi...' : 'Xác nhận đặt hàng'}
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/cart')}
            style={{ 
              width: '100%',
              background: 'none', 
              border: 'none', 
              color: '#6b7280', 
              cursor: 'pointer', 
              fontSize: '14px',
              marginTop: '20px'
            }}
          >
            ← Quay lại giỏ hàng
          </button>
        </div>
      </form>
    </div>
  );
}
