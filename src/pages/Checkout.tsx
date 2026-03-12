import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../user/CartContext';
import { createOrder } from '../services/ordersService';
import { fetchPoints, calculatePoints } from '../services/pointsService';
import { fetchUserVouchers, UserVoucherData } from '../services/vouchersService';

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

  // Points state
  const [myPoints, setMyPoints] = useState(0);
  const [usePoints, setUsePoints] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [willEarn, setWillEarn] = useState(0);
  const [redeemRate] = useState(10000); // 1 điểm = 10.000đ

  // Vouchers state
  const [userVouchers, setUserVouchers] = useState<UserVoucherData[]>([]);
  const [selectedVoucher, setSelectedVoucher] = useState<UserVoucherData | null>(null);
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [showVoucherModal, setShowVoucherModal] = useState(false);

  const refreshData = () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token) {
      fetchPoints().then(res => { if (res.success) setMyPoints(res.points); }).catch(() => {});
      
      const user = JSON.parse(userStr || '{}');
      if (user.id) {
        fetchUserVouchers(user.id, 0).then(res => {
          if (res.success) setUserVouchers(res.data || []);
        });
      }
    }
  };

  useEffect(() => {
    const handleUpdate = () => {
      console.log('Checkout detected user data update');
      refreshData();
    };
    window.addEventListener('userDataUpdated', handleUpdate);
    return () => window.removeEventListener('userDataUpdated', handleUpdate);
  }, []);

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
    refreshData();
  }, []);

  // Recalculate when usePoints changes
  useEffect(() => {
    if (myPoints === 0) return;
    calculatePoints(totalPrice, usePoints)
      .then(res => {
        if (res.success) {
          setDiscount(res.discount);
          setWillEarn(res.will_earn);
        }
      })
      .catch(() => {});
  }, [usePoints, totalPrice, myPoints]);

  // Handle voucher discount calculation
  useEffect(() => {
    if (!selectedVoucher) {
      setVoucherDiscount(0);
      return;
    }

    if (selectedVoucher.discount_type === 'percent') {
      const amount = (totalPrice * Number(selectedVoucher.discount_amount)) / 100;
      setVoucherDiscount(amount);
    } else {
      setVoucherDiscount(Number(selectedVoucher.discount_amount));
    }
  }, [selectedVoucher, totalPrice]);

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
      const orderItems = items.map(item => ({ product_id: item.id, quantity: item.quantity }));
      const response = await createOrder({
        ...formData,
        items: orderItems,
        points_redeemed: usePoints,
        discount_amount: discount + voucherDiscount,
        voucher_id: selectedVoucher?.voucher_id || null, // Optional if your backend supports it
        voucher_code: selectedVoucher?.code || null,
      } as any);
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
              <option value="vnpay">Thanh toán qua VNPAY</option>
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

          {/* VOUCHER SELECTION */}
          <div style={{
            marginTop: '20px',
            padding: '16px',
            borderRadius: '16px',
            backgroundColor: '#f8fafc',
            border: '1.5px solid #e2e8f0',
            cursor: 'pointer'
          }} onClick={() => setShowVoucherModal(true)}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                   <span style={{ fontSize: '18px' }}>🎟️</span>
                   <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>
                        {selectedVoucher ? `Mã: ${selectedVoucher.code}` : 'Voucher giảm giá'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        {selectedVoucher ? 'Đã áp dụng' : `${userVouchers.length} mã khả dụng`}
                      </div>
                   </div>
                </div>
                <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '28px' }}>10.000đ chi tiêu = 1 điểm · 1 điểm = 10.000đ giảm giá</p>
                <span style={{ color: '#c8a96e', fontWeight: 800, fontSize: '13px' }}>
                  {selectedVoucher ? 'THAY ĐỔI' : 'CHỌN MÃ'}
                </span>
             </div>
          </div>

          {/* POINTS REDEMPTION - PREMIUM DESIGN */}
          {myPoints > 0 && (
            <div style={{
              marginTop: '20px', 
              padding: '24px', 
              borderRadius: '20px',
              background: 'linear-gradient(145deg, #ffffff 0%, #fffdf9 100%)',
              border: '1.5px solid #e5c97a',
              boxShadow: '0 10px 25px -5px rgba(200, 169, 110, 0.15)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Trang trí góc */}
              <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '60px', height: '60px', background: '#c8a96e10', borderRadius: '50%' }} />
              
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#92680a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '20px' }}>🌟</span> Ưu đãi tích lũy
                    </h4>
                    <p style={{ margin: '4px 0 0 28px', fontSize: '12px', color: '#a1824a', fontWeight: 500 }}>
                      Tiết kiệm nhiều hơn với điểm Halu
                    </p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', color: '#fff8', marginTop: '4px' }}>1 điểm</div>
                  <div style={{ fontSize: '11px', color: '#fff8' }}>= 10.000đ</div>
                </div>
                </div>

                {/* Slider bar custom */}
                <div style={{ marginBottom: '24px' }}>
                  <input
                    type="range" min={0} max={myPoints}
                    value={usePoints}
                    onChange={e => setUsePoints(Number(e.target.value))}
                    style={{ 
                      width: '100%', 
                      accentColor: '#c8a96e', 
                      height: '6px', 
                      borderRadius: '3px',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '11px', color: '#d4b483', fontWeight: 600 }}>
                    <span>0đ</span>
                    <span>Dùng {usePoints} điểm</span>
                    <span>-{new Intl.NumberFormat('vi-VN').format(usePoints * 10000)}đ</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <input
                      type="number"
                      min={0}
                      max={myPoints}
                      value={usePoints || ''}
                      placeholder="Nhập số điểm..."
                      onChange={e => {
                        const val = Math.min(Math.max(0, Number(e.target.value)), myPoints);
                        setUsePoints(val);
                      }}
                      style={{
                        width: '100%', 
                        padding: '12px 16px', 
                        paddingRight: '45px',
                        borderRadius: '12px',
                        border: '1.5px solid #f0e6cc', 
                        fontSize: '15px', 
                        fontWeight: 700,
                        color: '#92680a', 
                        backgroundColor: '#fff', 
                        boxSizing: 'border-box', 
                        outline: 'none',
                        transition: 'border-color 0.2s',
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                      }}
                    />
                    <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '11px', fontWeight: 700, color: '#c8a96e', pointerEvents: 'none' }}>ĐIỂM</span>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => setUsePoints(usePoints === myPoints ? 0 : myPoints)}
                    style={{
                      height: '46px',
                      padding: '0 16px', 
                      borderRadius: '12px',
                      border: 'none',
                      backgroundColor: usePoints === myPoints ? '#92680a' : '#f0e6cc',
                      color: usePoints === myPoints ? '#fff' : '#92680a',
                      fontSize: '13px', 
                      fontWeight: 800, 
                      cursor: 'pointer',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    {usePoints === myPoints ? (
                      <><span>✓</span> Đã dùng</>
                    ) : (
                      'Tối đa'
                    )}
                  </button>
                </div>

                {/* Savings Summary Label */}
                {usePoints > 0 && (
                  <div style={{ 
                    marginTop: '20px', 
                    padding: '14px', 
                    backgroundColor: 'rgba(22, 163, 74, 0.05)', 
                    borderRadius: '12px',
                    border: '1px dashed rgba(22, 163, 74, 0.3)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    animation: 'fadeInUp 0.3s ease-out'
                  }}>
                    <span style={{ fontSize: '13px', color: '#15803d', fontWeight: 600 }}>Tiết kiệm được:</span>
                    <span style={{ fontSize: '15px', color: '#16a34a', fontWeight: 900 }}>
                      -{new Intl.NumberFormat('vi-VN').format(discount)}đ
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div style={{ marginTop: '24px' }}>
            {discount > 0 && (
              <div style={summaryRow}>
                <span style={{ color: '#16a34a', fontWeight: 600 }}>Ưu đãi tích lũy</span>
                <span style={{ color: '#16a34a', fontWeight: 700 }}>-{new Intl.NumberFormat('vi-VN').format(discount)}đ</span>
              </div>
            )}

            {voucherDiscount > 0 && (
              <div style={summaryRow}>
                <span style={{ color: '#dc2626', fontWeight: 600 }}>Voucher trúng thưởng</span>
                <span style={{ color: '#dc2626', fontWeight: 700 }}>-{new Intl.NumberFormat('vi-VN').format(voucherDiscount)}đ</span>
              </div>
            )}
            
            {error && (
              <div style={{ color: '#ef4444', padding: '14px', backgroundColor: '#fef2f2', borderRadius: '12px', fontSize: '13px', marginBottom: '16px', border: '1px solid #fee2e2', fontWeight: 500 }}>
                {error}
              </div>
            )}

            <div style={totalRow}>
              <span>Tổng thanh toán</span>
              <span style={{ fontSize: '24px', color: '#dc2626' }}>{new Intl.NumberFormat('vi-VN').format(Math.max(0, totalPrice - discount - voucherDiscount))}đ</span>
            </div>

            {willEarn > 0 && (
              <div style={{ 
                marginTop: '16px', 
                padding: '16px', 
                borderRadius: '16px', 
                backgroundColor: '#ffffff', 
                border: '1.5px solid #dcfce7', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                boxShadow: '0 4px 10px rgba(22, 163, 74, 0.05)'
              }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                  🎁
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#16a34a' }}>Nhận thêm +{willEarn} điểm</div>
                  <div style={{ fontSize: '11px', color: '#65a30d', fontWeight: 500 }}>Được cộng sau khi hoàn tất đơn hàng này</div>
                </div>
              </div>
            )}
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

      {/* VOUCHER MODAL */}
      {showVoucherModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white', borderRadius: '24px', width: '100%', maxWidth: '500px',
            maxHeight: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden'
          }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>Voucher của bạn</h3>
              <button 
                onClick={() => setShowVoucherModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#94a3b8' }}
              >
                &times;
              </button>
            </div>
            
            <div style={{ padding: '20px', overflowY: 'auto' }}>
              {userVouchers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>Bạn không có voucher nào khả dụng</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {userVouchers.map((v) => (
                    <div 
                      key={v.id} 
                      onClick={() => {
                        setSelectedVoucher(selectedVoucher?.id === v.id ? null : v);
                        setShowVoucherModal(false);
                      }}
                      style={{
                        padding: '16px', borderRadius: '16px', border: `2px solid ${selectedVoucher?.id === v.id ? '#c8a96e' : '#f1f5f9'}`,
                        backgroundColor: selectedVoucher?.id === v.id ? '#fcfaf6' : 'white', cursor: 'pointer',
                        transition: 'all 0.2s', position: 'relative'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 800, color: '#c8a96e' }}>
                          {v.discount_type === 'percent' ? `Giảm ${v.discount_amount}%` : `Giảm ${new Intl.NumberFormat('vi-VN').format(Number(v.discount_amount))}đ`}
                        </span>
                        {selectedVoucher?.id === v.id && <span style={{ color: '#c8a96e' }}>✓</span>}
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b' }}>{v.code}</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Hạn dùng: {new Date(v.expiry_date).toLocaleDateString('vi-VN')}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ padding: '24px', borderTop: '1px solid #f1f5f9' }}>
               <button 
                onClick={() => setShowVoucherModal(false)}
                style={{ 
                  width: '100%', padding: '14px', borderRadius: '12px', 
                  backgroundColor: '#1e293b', color: 'white', border: 'none', 
                  fontWeight: 700, cursor: 'pointer' 
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
