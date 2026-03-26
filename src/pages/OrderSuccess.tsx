import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function OrderSuccess(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const containerStyle: React.CSSProperties = {
    maxWidth: '600px',
    margin: '80px auto',
    padding: '40px 20px',
    textAlign: 'center',
    backgroundColor: 'white',
    borderRadius: '24px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    fontFamily: "'Inter', sans-serif",
  };

  const iconStyle: React.CSSProperties = {
    width: '80px',
    height: '80px',
    backgroundColor: '#ecfdf5',
    color: '#10b981',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '40px',
    margin: '0 auto 24px',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '28px',
    fontWeight: 800,
    color: '#111827',
    marginBottom: '12px',
  };

  const messageStyle: React.CSSProperties = {
    color: '#6b7280',
    fontSize: '16px',
    lineHeight: 1.6,
    marginBottom: '32px',
  };

  const orderIdBox: React.CSSProperties = {
    backgroundColor: '#f9fafb',
    padding: '16px',
    borderRadius: '12px',
    display: 'inline-block',
    marginBottom: '32px',
    border: '1px solid #e5e7eb',
  };

  const btnContainer: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  };

  const primaryBtn: React.CSSProperties = {
    padding: '14px 24px',
    backgroundColor: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontWeight: 700,
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  };

  const secondaryBtn: React.CSSProperties = {
    padding: '14px 24px',
    backgroundColor: 'white',
    color: '#374151',
    border: '1px solid #d1d5db',
    borderRadius: '12px',
    fontWeight: 600,
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  };

  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', padding: '1px' }}>
      <div style={containerStyle}>
        <div style={iconStyle}>✓</div>
        <h1 style={titleStyle}>Đặt hàng thành công!</h1>
        <p style={messageStyle}>
          Cảm ơn bạn đã tin tưởng chọn Cafe Shop. <br />
          Đơn hàng của bạn đã được tiếp nhận và đang trong quá trình chuẩn bị.
        </p>
        {id && (
          <div style={orderIdBox}>
            <span style={{ fontSize: '14px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>Mã đơn hàng</span>
            <span style={{ fontSize: '20px', fontWeight: 800, color: '#111827' }}>#{id}</span>
          </div>
        )}

        <div style={btnContainer}>
          <button 
            style={primaryBtn}
            onClick={() => navigate('/')}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
          >
            Tiếp tục mua sắm
          </button>
          <button 
            style={secondaryBtn}
            onClick={() => navigate('/order-history')} // Assuming there might be a my-orders page
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
          >
            Xem lịch sử đơn hàng
          </button>
        </div>
      </div>
    </div>
  );
}
