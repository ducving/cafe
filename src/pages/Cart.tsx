import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../user/CartContext';

export default function Cart(): React.ReactElement {
  const navigate = useNavigate();
  const { items, totalPrice, updateQty, removeItem, clear, totalQuantity } = useCart();

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
    gridTemplateColumns: items.length > 0 ? '1fr 380px' : '1fr',
    gap: '30px',
  };

  const sectionStyle: React.CSSProperties = {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  };

  const cartListStyle: React.CSSProperties = {
    ...sectionStyle,
    padding: '0',
    overflow: 'hidden',
  };

  const itemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    padding: '24px',
    borderBottom: '1px solid #f3f4f6',
    transition: 'background-color 0.2s',
  };

  const imgContainer: React.CSSProperties = {
    width: '100px',
    height: '100px',
    borderRadius: '12px',
    overflow: 'hidden',
    flexShrink: 0,
    backgroundColor: '#f9fafb',
    border: '1px solid #f3f4f6',
  };

  const imgStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  };

  const infoStyle: React.CSSProperties = {
    flex: 1,
    marginLeft: '24px',
  };

  const itemNameStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 700,
    color: '#111827',
    marginBottom: '6px',
  };

  const itemPriceStyle: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: 600,
    color: '#dc2626',
  };

  const controlsStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  };

  const qtyControl: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: '10px',
    padding: '4px',
  };

  const qtyBtn: React.CSSProperties = {
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    background: 'white',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '20px',
    fontWeight: 600,
    color: '#4b5563',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  };

  const qtyValue: React.CSSProperties = {
    padding: '0 16px',
    fontSize: '16px',
    fontWeight: 700,
    color: '#111827',
    minWidth: '40px',
    textAlign: 'center',
  };

  const removeBtn: React.CSSProperties = {
    background: 'none',
    border: 'none',
    color: '#9ca3af',
    cursor: 'pointer',
    fontSize: '20px',
    padding: '8px',
    transition: 'color 0.2s',
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
    fontSize: '16px',
    color: '#4b5563',
  };

  const totalRow: React.CSSProperties = {
    ...summaryRow,
    marginTop: '20px',
    paddingTop: '20px',
    borderTop: '2px dashed #f3f4f6',
    fontSize: '20px',
    fontWeight: 800,
    color: '#111827',
  };

  const checkoutBtn: React.CSSProperties = {
    width: '100%',
    padding: '18px',
    backgroundColor: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '14px',
    fontSize: '18px',
    fontWeight: 700,
    cursor: 'pointer',
    marginTop: '32px',
    transition: 'all 0.2s',
    boxShadow: '0 10px 15px -3px rgba(220, 38, 38, 0.25)',
  };

  if (items.length === 0) {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: 'center', padding: '80px 20px', backgroundColor: 'white', borderRadius: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ fontSize: '72px', marginBottom: '24px' }}>🛒</div>
          <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#111827', marginBottom: '16px' }}>
            Giỏ hàng đang trống
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '40px', fontSize: '18px' }}>
            Có vẻ như bạn chưa chọn món nào. Quay lại menu xem nhé!
          </p>
          <button
            onClick={() => navigate('/products')}
            style={{
              padding: '16px 40px',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            Khám phá menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>
        <span>Giỏ hàng của bạn</span>
        <span style={{ fontSize: '16px', backgroundColor: '#fee2e2', color: '#dc2626', padding: '6px 16px', borderRadius: '24px', fontWeight: 700 }}>
          {totalQuantity} món
        </span>
      </h1>

      <div style={mainLayout}>
        <div style={cartListStyle}>
          <div style={{ padding: '24px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 800 }}>Sản phẩm ({totalQuantity})</h3>
              <button
                  onClick={clear}
                  style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}
              >
                  Làm trống giỏ hàng
              </button>
          </div>
          {items.map((item) => (
            <div key={item.id} style={itemStyle}>
              <div style={imgContainer}>
                {item.image ? (
                  <img src={item.image} alt={item.name} style={imgStyle} />
                ) : (
                  <div style={{ ...imgStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>☕</div>
                )}
              </div>
              <div style={infoStyle}>
                <div style={itemNameStyle}>{item.name}</div>
                <div style={itemPriceStyle}>{new Intl.NumberFormat('vi-VN').format(item.price)}đ</div>
              </div>
              <div style={controlsStyle}>
                <div style={qtyControl}>
                  <button style={qtyBtn} onClick={() => updateQty(item.id, Math.max(0, item.quantity - 1))}>-</button>
                  <span style={qtyValue}>{item.quantity}</span>
                  <button style={qtyBtn} onClick={() => updateQty(item.id, item.quantity + 1)}>+</button>
                </div>
                <button
                  style={removeBtn}
                  onClick={() => removeItem(item.id)}
                  title="Xóa món này"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
          <div style={{ padding: '24px' }}>
            <button
                onClick={() => navigate('/')}
                style={{ background: 'none', border: 'none', color: '#4b5563', fontWeight: 600, cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
                ← Tiếp tục mua sắm
            </button>
          </div>
        </div>

        <div style={summaryCardStyle}>
          <h3 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '24px' }}>Tổng hóa đơn</h3>
          <div style={summaryRow}>
            <span>Tạm tính</span>
            <span>{new Intl.NumberFormat('vi-VN').format(totalPrice)}đ</span>
          </div>
          <div style={summaryRow}>
            <span>Giảm giá</span>
            <span style={{ color: '#10b981', fontWeight: 600 }}>0đ</span>
          </div>
          <div style={summaryRow}>
            <span>Phí vận chuyển</span>
            <span style={{ color: '#10b981', fontWeight: 600 }}>Miễn phí</span>
          </div>

          <div style={totalRow}>
            <span>Thành tiền</span>
            <span>{new Intl.NumberFormat('vi-VN').format(totalPrice)}đ</span>
          </div>

          <button
            onClick={() => {
              const token = localStorage.getItem('token');
              if (!token) {
                alert('Vui lòng đăng nhập để tiến hành thanh toán!');
                navigate('/login', { state: { from: '/checkout' } });
                return;
              }
              navigate('/checkout');
            }}
            style={checkoutBtn}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#b91c1c';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#dc2626';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Tiến hành thanh toán
          </button>
          
          {!localStorage.getItem('token') && (
            <p style={{ textAlign: 'center', marginTop: '12px', fontSize: '14px', color: '#dc2626', fontWeight: 600 }}>
              * Bạn cần đăng nhập để đặt hàng
            </p>
          )}

          <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: '#9ca3af' }}>
            Miễn phí vận chuyển cho đơn hàng từ 0đ
          </p>
        </div>
      </div>
    </div>
  );
}
