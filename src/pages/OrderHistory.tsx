import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchMyOrders, updateOrderStatus } from '../services/ordersService';
import { Button } from '../admin/components/ui';
import { ChevronLeft, ShoppingBag, Clock, CheckCircle2, XCircle } from 'lucide-react';

const GOLD = '#c8a96e';
const DARK = '#3a2415';

export default function OrderHistory(): React.ReactElement {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelConfirm, setCancelConfirm] = useState<{ open: boolean; orderId: number | null }>({ open: false, orderId: null });
  const [cancelling, setCancelling] = useState(false);

  // Trạng thái phân trang
  const [pagination, setPagination] = useState({
    current_page: 1,
    limit: 10,
    total_pages: 1,
    total_items: 0
  });

  const loadOrders = async (page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      // Gọi fetchMyOrders với tham số page (Cần cập nhật service nếu chưa hỗ trợ)
      const res = await (fetchMyOrders as any)(page); 
      console.log('API Response Orders:', res);
      if (res.success) {
        let list: any[] = [];
        if (Array.isArray(res.data) && res.data.length > 0) {
          list = res.data;
        } else if (Array.isArray((res as any).orders)) {
          list = (res as any).orders;
        }
        setOrders(list);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      } else {
        setError(res.message || 'Không thể tải danh sách đơn hàng');
      }
    } catch (err: any) {
      console.error('Lỗi tải đơn hàng:', err);
      setError(err.message || 'Đã xảy ra lỗi khi kết nối máy chủ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders(1);
  }, []);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.total_pages) {
      loadOrders(newPage);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelConfirm.orderId) return;
    setCancelling(true);
    try {
      const res = await updateOrderStatus(cancelConfirm.orderId, 'cancelled');
      if (res.success) {
        setOrders((prev) =>
          prev.map((o) => o.id === cancelConfirm.orderId ? { ...o, status: 'cancelled' } : o)
        );
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi khi hủy đơn hàng');
    } finally {
      setCancelling(false);
      setCancelConfirm({ open: false, orderId: null });
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'completed': 
        return { text: 'Hoàn tất', color: '#22c55e', bg: '#f0fdf4', icon: <CheckCircle2 size={16} /> };
      case 'processing': 
        return { text: 'Đang xử lý', color: '#3b82f6', bg: '#eff6ff', icon: <Clock size={16} /> };
      case 'cancelled': 
        return { text: 'Đã hủy', color: '#ef4444', bg: '#fef2f2', icon: <XCircle size={16} /> };
      default: 
        return { text: 'Chờ xử lý', color: '#f59e0b', bg: '#fffbeb', icon: <Clock size={16} /> };
    }
  };

  return (
    <div style={{ backgroundColor: '#fcfaf8', minHeight: '100vh', padding: '40px 20px', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '40px' }}>
          <button 
            onClick={() => navigate('/profile')}
            style={{ 
              width: '40px', height: '40px', borderRadius: '12px', border: '1px solid #eee', 
              backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: DARK, transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
          >
            <ChevronLeft size={20} />
          </button>
          <h1 style={{ fontSize: '28px', fontWeight: 900, color: DARK, margin: 0, letterSpacing: '-0.5px' }}>
            Lịch sử đơn hàng
          </h1>
          
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <div className="spinner" style={{ margin: '0 auto 20px' }}></div>
            <p style={{ color: '#888', fontWeight: 600 }}>Đang tải danh sách đơn hàng...</p>
          </div>
        ) : error ? (
          <div style={{ 
            textAlign: 'center', padding: '60px 20px', backgroundColor: '#fff', 
            borderRadius: '24px', border: '1px solid #fee2e2' 
          }}>
             <div style={{ fontSize: '60px', marginBottom: '20px' }}>⚠️</div>
             <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#dc2626', marginBottom: '10px' }}>Lỗi hệ thống</h2>
             <p style={{ color: '#ef4444', marginBottom: '20px' }}>{error}</p>
             <Button variant="ghost" onClick={() => loadOrders(pagination.current_page)} style={{ fontWeight: 600 }}>
               THỬ LẠI
             </Button>
          </div>
        ) : orders.length === 0 ? (
          <div style={{ 
            textAlign: 'center', padding: '80px 40px', backgroundColor: '#fff', 
            borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.02)', border: '1px solid #f0f0f0' 
          }}>
            <div style={{ fontSize: '80px', marginBottom: '20px' }}>☕</div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: DARK, marginBottom: '10px' }}>Bạn chưa có đơn hàng nào</h2>
            <p style={{ color: '#888', marginBottom: '30px', maxWidth: '400px', margin: '0 auto 30px', lineHeight: 1.6 }}>
              Có vẻ như bạn chưa thưởng thức món đồ uống nào từ Halu Cafe. Hãy khám phám menu ngay nhé!
            </p>
            <Button variant="primary" onClick={() => navigate('/shop')} style={{ padding: '15px 40px', fontWeight: 700 }}>
              MUA SẮM NGAY
            </Button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {orders.map((order) => {
                const status = getStatusInfo(order.status);
                return (
                  <div
                    key={order.id}
                    style={{
                      backgroundColor: '#fff', padding: '25px', borderRadius: '20px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.01)', border: '1px solid #f3f3f3',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.04)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.01)';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                        <div style={{
                          width: '56px', height: '56px', borderRadius: '16px',
                          backgroundColor: GOLD + '15', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', color: GOLD, flexShrink: 0
                        }}>
                          <ShoppingBag size={26} strokeWidth={1.5} />
                        </div>
                        <div>
                          <div style={{ fontSize: '17px', fontWeight: 800, color: DARK, marginBottom: '6px' }}>Đơn hàng #{order.id}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 500 }}>
                              {new Date(order.created_at).toLocaleString('vi-VN', {
                                day: '2-digit', month: '2-digit', year: 'numeric',
                                hour: '2-digit', minute: '2-digit'
                              })}
                            </span>
                            <div style={{
                              display: 'inline-flex', alignItems: 'center', gap: '5px',
                              padding: '4px 10px', borderRadius: '8px', fontSize: '12px',
                              fontWeight: 700, backgroundColor: status.bg, color: status.color
                            }}>
                              {status.icon}
                              {status.text.toUpperCase()}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                        <div style={{ fontSize: '20px', fontWeight: 900, color: GOLD }}>
                          {new Intl.NumberFormat('vi-VN').format(Number(order.total_amount || order.amount || 0))}₫
                        </div>
                        {/* Điểm đã kiếm */}
                        {order.status === 'completed' && Number(order.points_earned) > 0 && (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 700, color: '#16a34a', backgroundColor: '#f0fdf4', padding: '3px 9px', borderRadius: '8px' }}>
                            ⭐ +{order.points_earned} điểm đã cộng
                          </div>
                        )}
                        {/* Điểm đã dùng */}
                        {Number(order.points_redeemed) > 0 && (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 700, color: '#92680a', backgroundColor: '#fffbf0', padding: '3px 9px', borderRadius: '8px' }}>
                            🎫 Đã dùng {order.points_redeemed} điểm
                          </div>
                        )}
                        {Number(order.discount_amount) > 0 && (
                          <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600 }}>
                            Giảm: -{new Intl.NumberFormat('vi-VN').format(Number(order.discount_amount))}đ
                          </div>
                        )}
                        {order.status === 'pending' && (
                          <button
                            onClick={() => setCancelConfirm({ open: true, orderId: order.id })}
                            style={{
                              padding: '7px 16px', borderRadius: '10px', border: '1.5px solid #fca5a5',
                              backgroundColor: '#fff', color: '#ef4444', fontSize: '13px',
                              fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                              display: 'flex', alignItems: 'center', gap: '6px'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fef2f2'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#fff'; }}
                          >
                            <XCircle size={15} />
                            Hủy đơn
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {pagination.total_pages > 1 && (
              <div style={{ 
                marginTop: '40px', display: 'flex', alignItems: 'center', 
                justifyContent: 'center', gap: '20px', paddingBottom: '40px' 
              }}>
                <Button 
                  variant="ghost" 
                  disabled={pagination.current_page === 1}
                  onClick={() => handlePageChange(pagination.current_page - 1)}
                  style={{ borderRadius: '12px', padding: '10px 20px' }}
                >
                  Trang trước
                </Button>
                
                <span style={{ fontWeight: 700, color: DARK, fontSize: '15px' }}>
                   Trang <span style={{ color: GOLD }}>{pagination.current_page}</span> / {pagination.total_pages}
                </span>

                <Button 
                  variant="ghost" 
                  disabled={pagination.current_page === pagination.total_pages}
                  onClick={() => handlePageChange(pagination.current_page + 1)}
                  style={{ borderRadius: '12px', padding: '10px 20px' }}
                >
                  Trang sau
                </Button>
              </div>
            )}
          </>
        )}

        {/* Cancel Confirmation Modal */}
        {cancelConfirm.open && (
          <div style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, padding: '20px'
          }}>
            <div style={{
              backgroundColor: '#fff', borderRadius: '24px', padding: '36px 32px',
              maxWidth: '420px', width: '100%', boxShadow: '0 30px 60px rgba(0,0,0,0.15)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '52px', marginBottom: '16px' }}>🗑️</div>
              <h2 style={{ fontSize: '20px', fontWeight: 900, color: DARK, marginBottom: '10px' }}>
                Xác nhận hủy đơn hàng
              </h2>
              <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.6, marginBottom: '28px' }}>
                Bạn có chắc muốn hủy <strong>Đơn hàng #{cancelConfirm.orderId}</strong>?<br />
                Hành động này không thể hoàn tác.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                  onClick={() => setCancelConfirm({ open: false, orderId: null })}
                  style={{
                    padding: '11px 24px', borderRadius: '12px', border: '1.5px solid #e2e8f0',
                    backgroundColor: '#f8fafc', color: '#334155', fontWeight: 700,
                    fontSize: '14px', cursor: 'pointer'
                  }}
                >
                  Quay lại
                </button>
                <button
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                  style={{
                    padding: '11px 24px', borderRadius: '12px', border: 'none',
                    backgroundColor: '#ef4444', color: '#fff', fontWeight: 700,
                    fontSize: '14px', cursor: cancelling ? 'not-allowed' : 'pointer',
                    opacity: cancelling ? 0.7 : 1
                  }}
                >
                  {cancelling ? 'Đang hủy...' : 'Xác nhận hủy'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <p style={{ color: '#cbd5e1', fontSize: '13px', fontWeight: 500 }}>
            Nếu có thắc mắc về đơn hàng, vui lòng liên hệ hotline: <span style={{ color: GOLD, fontWeight: 700 }}>1900 xxxx</span>
          </p>
        </div>
      </div>
    </div>
  );
}
